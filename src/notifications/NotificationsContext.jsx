import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

const AUTO_PROMPT_MS = 10_000;
const DISMISS_MS = 7 * 24 * 60 * 60 * 1000;
const DISMISSED_KEY = "bois-notify-dismissed-at";

const NotificationsContext = createContext(null);

function detectSupport() {
  if (typeof window === "undefined") return "unsupported";
  const canPush = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  if (canPush && SUPABASE_URL && VAPID_PUBLIC_KEY) return "supported";
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const standalone =
    window.matchMedia?.("(display-mode: standalone)").matches || navigator.standalone === true;
  if (isIOS && !standalone) return "ios-install";
  return "unsupported";
}

function currentPermission() {
  return typeof Notification === "undefined" ? "default" : Notification.permission;
}

function urlBase64ToUint8Array(base64) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (char) => char.charCodeAt(0));
}

function recentlyDismissed() {
  const at = Number(localStorage.getItem(DISMISSED_KEY));
  return Number.isFinite(at) && at > 0 && Date.now() - at < DISMISS_MS;
}

async function sendSubscription(method, subscription) {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/push-subscribe`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(SUPABASE_KEY ? { apikey: SUPABASE_KEY } : {}),
    },
    body: JSON.stringify(subscription.toJSON()),
  });
  if (!response.ok) throw new Error(`push-subscribe ${response.status}`);
}

async function getRegistration() {
  const existing = await navigator.serviceWorker.getRegistration("/");
  if (!existing) await navigator.serviceWorker.register("/sw.js");
  return navigator.serviceWorker.ready;
}

export function NotificationsProvider({ children }) {
  const [support] = useState(detectSupport);
  const [permission, setPermission] = useState(currentPermission);
  const [subscribed, setSubscribed] = useState(false);
  const [ready, setReady] = useState(support !== "supported");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [promptOpen, setPromptOpen] = useState(false);
  const syncedRef = useRef(false);

  useEffect(() => {
    if (support !== "supported") return undefined;
    let active = true;
    (async () => {
      try {
        const registration = await getRegistration();
        const subscription = await registration.pushManager.getSubscription();
        if (!active) return;
        const isOn = Boolean(subscription) && currentPermission() === "granted";
        setSubscribed(isOn);
        if (isOn && !syncedRef.current) {
          syncedRef.current = true;
          sendSubscription("POST", subscription).catch(() => {});
        }
      } catch {
        if (active) setSubscribed(false);
      } finally {
        if (active) setReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [support]);

  useEffect(() => {
    if (!ready || support === "unsupported" || subscribed) return undefined;
    if (permission === "denied" || recentlyDismissed()) return undefined;
    const id = window.setTimeout(() => setPromptOpen(true), AUTO_PROMPT_MS);
    return () => window.clearTimeout(id);
  }, [ready, support, subscribed, permission]);

  const openPrompt = useCallback(() => {
    setError("");
    setPermission(currentPermission());
    setPromptOpen(true);
  }, []);

  const closePrompt = useCallback(() => {
    setPromptOpen(false);
    if (!subscribed) localStorage.setItem(DISMISSED_KEY, String(Date.now()));
  }, [subscribed]);

  const subscribe = useCallback(async () => {
    if (support !== "supported" || busy) return;
    setBusy(true);
    setError("");
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== "granted") return;

      const registration = await getRegistration();
      const subscription =
        (await registration.pushManager.getSubscription()) ||
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        }));

      try {
        await sendSubscription("POST", subscription);
      } catch (err) {
        await subscription.unsubscribe().catch(() => {});
        throw err;
      }

      syncedRef.current = true;
      localStorage.removeItem(DISMISSED_KEY);
      setSubscribed(true);
      setPromptOpen(false);
    } catch {
      setError("No pudimos activar las notificaciones, inténtalo de nuevo en un momento. Si usas Brave, puede que las notificaciones no funcionen.");
    } finally {
      setBusy(false);
    }
  }, [support, busy]);

  const unsubscribe = useCallback(async () => {
    if (support !== "supported" || busy) return;
    setBusy(true);
    setError("");
    try {
      const registration = await getRegistration();
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await sendSubscription("DELETE", subscription).catch(() => {});
        await subscription.unsubscribe();
      }
      setSubscribed(false);
      setPromptOpen(false);
      localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    } catch {
      setError("No pudimos desactivar las notificaciones. Inténtalo de nuevo.");
    } finally {
      setBusy(false);
    }
  }, [support, busy]);

  const value = useMemo(
    () => ({
      support,
      permission,
      subscribed,
      busy,
      error,
      promptOpen,
      openPrompt,
      closePrompt,
      subscribe,
      unsubscribe,
    }),
    [support, permission, subscribed, busy, error, promptOpen, openPrompt, closePrompt, subscribe, unsubscribe]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications debe usarse dentro de NotificationsProvider");
  return ctx;
}
