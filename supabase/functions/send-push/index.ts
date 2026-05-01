// Server-driven push notifications.
// - For Android: requires FCM_SERVICE_ACCOUNT_JSON secret (Firebase service account JSON).
// - For iOS: requires APNS_AUTH_KEY (.p8 contents), APNS_KEY_ID, APNS_TEAM_ID, APNS_BUNDLE_ID, optional APNS_USE_SANDBOX="true".
// Sends to all device_tokens of a target user_id (caller must be that user, or service role).
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PushBody {
  user_id?: string;       // target user; defaults to caller
  title: string;
  body: string;
  data?: Record<string, string>;
}

// ---------- Google OAuth (FCM v1) ----------
async function getGoogleAccessToken(serviceAccount: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };
  const enc = (o: unknown) =>
    btoa(JSON.stringify(o)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const unsigned = `${enc(header)}.${enc(claim)}`;

  const pem = serviceAccount.private_key as string;
  const pkcs8 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s+/g, "");
  const der = Uint8Array.from(atob(pkcs8), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    "pkcs8",
    der,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = new Uint8Array(
    await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(unsigned)),
  );
  const sigB64 = btoa(String.fromCharCode(...sig))
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const jwt = `${unsigned}.${sigB64}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  if (!res.ok) throw new Error(`Google token failed: ${await res.text()}`);
  return (await res.json()).access_token as string;
}

async function sendFcm(token: string, title: string, body: string, data?: Record<string, string>) {
  const raw = Deno.env.get("FCM_SERVICE_ACCOUNT_JSON");
  if (!raw) return { ok: false, error: "FCM_SERVICE_ACCOUNT_JSON not configured" };
  const sa = JSON.parse(raw);
  const accessToken = await getGoogleAccessToken(sa);
  const res = await fetch(
    `https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: { token, notification: { title, body }, data },
      }),
    },
  );
  return { ok: res.ok, status: res.status, body: await res.text() };
}

// ---------- APNs (HTTP/2 via JWT) ----------
async function getApnsJwt(): Promise<string | null> {
  const keyP8 = Deno.env.get("APNS_AUTH_KEY");
  const keyId = Deno.env.get("APNS_KEY_ID");
  const teamId = Deno.env.get("APNS_TEAM_ID");
  if (!keyP8 || !keyId || !teamId) return null;

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "ES256", kid: keyId, typ: "JWT" };
  const claim = { iss: teamId, iat: now };
  const enc = (o: unknown) =>
    btoa(JSON.stringify(o)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const unsigned = `${enc(header)}.${enc(claim)}`;

  const pkcs8 = keyP8
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s+/g, "");
  const der = Uint8Array.from(atob(pkcs8), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    "pkcs8", der,
    { name: "ECDSA", namedCurve: "P-256" },
    false, ["sign"],
  );
  const sig = new Uint8Array(
    await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, new TextEncoder().encode(unsigned)),
  );
  const sigB64 = btoa(String.fromCharCode(...sig))
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  return `${unsigned}.${sigB64}`;
}

async function sendApns(token: string, title: string, body: string, data?: Record<string, string>) {
  const jwt = await getApnsJwt();
  const bundleId = Deno.env.get("APNS_BUNDLE_ID");
  if (!jwt || !bundleId) return { ok: false, error: "APNs not configured" };
  const host = Deno.env.get("APNS_USE_SANDBOX") === "true"
    ? "https://api.sandbox.push.apple.com"
    : "https://api.push.apple.com";
  const res = await fetch(`${host}/3/device/${token}`, {
    method: "POST",
    headers: {
      authorization: `bearer ${jwt}`,
      "apns-topic": bundleId,
      "apns-push-type": "alert",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      aps: { alert: { title, body }, sound: "default" },
      ...(data || {}),
    }),
  });
  return { ok: res.ok, status: res.status, body: await res.text() };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authHeader = req.headers.get("Authorization") || "";

    // Identify caller via JWT
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    const callerId = userData.user?.id;
    if (!callerId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { user_id, title, body, data } = (await req.json()) as PushBody;
    if (!title || !body) {
      return new Response(JSON.stringify({ error: "title and body are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const targetId = user_id || callerId;
    if (targetId !== callerId) {
      return new Response(JSON.stringify({ error: "Cannot send to other users" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: tokens, error } = await admin
      .from("device_tokens")
      .select("token, platform")
      .eq("user_id", targetId);

    if (error) throw error;
    if (!tokens?.length) {
      return new Response(JSON.stringify({ sent: 0, message: "No registered devices" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = await Promise.all(tokens.map(async (t) => {
      try {
        if (t.platform === "android") return { token: t.token, ...(await sendFcm(t.token, title, body, data)) };
        if (t.platform === "ios")     return { token: t.token, ...(await sendApns(t.token, title, body, data)) };
        return { token: t.token, ok: false, error: `Unsupported platform: ${t.platform}` };
      } catch (e) {
        return { token: t.token, ok: false, error: e instanceof Error ? e.message : String(e) };
      }
    }));

    const sent = results.filter((r) => r.ok).length;
    return new Response(JSON.stringify({ sent, total: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("send-push error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
