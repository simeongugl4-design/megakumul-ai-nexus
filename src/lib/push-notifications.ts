import { Capacitor } from "@capacitor/core";
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from "@capacitor/push-notifications";
import { LocalNotifications } from "@capacitor/local-notifications";

export type PushHandlers = {
  onToken?: (token: string) => void;
  onReceived?: (n: PushNotificationSchema) => void;
  onAction?: (a: ActionPerformed) => void;
  onError?: (err: unknown) => void;
};

export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Initialize push + local notifications on iOS/Android.
 * Safe no-op on web.
 */
export async function initPushNotifications(handlers: PushHandlers = {}): Promise<{ token?: string } | null> {
  if (!Capacitor.isNativePlatform()) {
    console.info("[push] Skipping init: not running on native platform.");
    return null;
  }

  try {
    // Local notifications permission (used for in-app scheduling + foreground display)
    const local = await LocalNotifications.requestPermissions();
    if (local.display !== "granted") {
      console.warn("[push] Local notification permission not granted");
    }

    // Push notification permission
    let perm = await PushNotifications.checkPermissions();
    if (perm.receive === "prompt" || perm.receive === "prompt-with-rationale") {
      perm = await PushNotifications.requestPermissions();
    }
    if (perm.receive !== "granted") {
      handlers.onError?.(new Error("Push permission denied"));
      return null;
    }

    let resolvedToken: string | undefined;

    await PushNotifications.removeAllListeners();

    await PushNotifications.addListener("registration", (t: Token) => {
      resolvedToken = t.value;
      console.info("[push] Registered token:", t.value);
      handlers.onToken?.(t.value);
    });

    await PushNotifications.addListener("registrationError", (err) => {
      console.error("[push] Registration error", err);
      handlers.onError?.(err);
    });

    await PushNotifications.addListener("pushNotificationReceived", async (n) => {
      handlers.onReceived?.(n);
      // Mirror to a local notification so it shows in foreground reliably
      try {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: Math.floor(Math.random() * 1_000_000),
              title: n.title ?? "MegaKUMUL",
              body: n.body ?? "",
              extra: n.data,
            },
          ],
        });
      } catch (e) {
        console.warn("[push] local mirror failed", e);
      }
    });

    await PushNotifications.addListener("pushNotificationActionPerformed", (a) => {
      handlers.onAction?.(a);
    });

    await PushNotifications.register();
    return { token: resolvedToken };
  } catch (e) {
    console.error("[push] init failed", e);
    handlers.onError?.(e);
    return null;
  }
}

export async function sendTestLocalNotification(title = "Test", body = "Hello from MegaKUMUL") {
  if (!Capacitor.isNativePlatform()) {
    console.info("[push] Test notification only available on native.");
    return;
  }
  const perm = await LocalNotifications.requestPermissions();
  if (perm.display !== "granted") return;
  await LocalNotifications.schedule({
    notifications: [
      {
        id: Math.floor(Math.random() * 1_000_000),
        title,
        body,
        schedule: { at: new Date(Date.now() + 1000) },
      },
    ],
  });
}
