// Memory extraction edge function — analyzes a chat exchange and
// returns durable facts about the user worth remembering long-term.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EXTRACTION_PROMPT = `You are MegaKUMUL's Memory Extractor. From the conversation turn provided, extract DURABLE facts about the user worth remembering across future sessions.

Rules:
- Only extract STABLE facts: identity, profession, goals, preferences, ongoing projects, skills, tools used, location (if shared), constraints.
- IGNORE one-off questions, transient context, or generic queries.
- If nothing memorable, return {"memories": []}.
- Each memory: short, third-person, self-contained ("User is a data scientist building a churn model in Python").
- Importance: 1 (trivial) to 10 (core identity).
- Categories: identity, profession, project, preference, goal, skill, tool, constraint, general.

Return STRICT JSON only, no prose:
{"memories":[{"category":"profession","content":"...","importance":7}]}`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { userMessage, assistantMessage } = await req.json();
    if (!userMessage) {
      return new Response(JSON.stringify({ memories: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const turn = `USER: ${userMessage}\n\nASSISTANT: ${(assistantMessage || "").slice(0, 1500)}`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: EXTRACTION_PROMPT },
          { role: "user", content: turn },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!resp.ok) {
      console.error("memory extract failed", resp.status, await resp.text());
      return new Response(JSON.stringify({ memories: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const raw = data.choices?.[0]?.message?.content || "{}";
    let parsed: { memories?: Array<{ category?: string; content?: string; importance?: number }> } = {};
    try { parsed = JSON.parse(raw); } catch { parsed = {}; }

    const memories = (parsed.memories || [])
      .filter((m) => m && typeof m.content === "string" && m.content.trim().length > 0)
      .map((m) => ({
        category: m.category || "general",
        content: m.content!.trim().slice(0, 500),
        importance: Math.max(1, Math.min(10, Number(m.importance) || 5)),
      }));

    return new Response(JSON.stringify({ memories }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("mega-memory error:", e);
    return new Response(JSON.stringify({ memories: [], error: String(e) }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
