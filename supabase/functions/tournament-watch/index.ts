import webpush from "npm:web-push@3.6.7";
import { fetchRegionalTournaments, type WatchedTournament } from "../_shared/startgg.ts";
import { supabaseAdmin } from "../_shared/supabaseAdmin.ts";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const SITE_ICON = "/icons/icon-192.png";

type SeenRow = {
  id: string;
  name: string;
  start_at: string | null;
  url: string | null;
  notified_new: boolean;
  notified_window: boolean;
};

type PushPayload = {
  title: string;
  body: string;
  url: string;
  tag: string;
  image?: string | null;
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function formatDate(iso: string | null): string {
  if (!iso) return "fecha por confirmar";
  return new Intl.DateTimeFormat("es-VE", {
    day: "numeric",
    month: "long",
    timeZone: "America/Caracas",
  }).format(new Date(iso));
}

function inNotificationWindow(iso: string | null, now: number): boolean {
  if (!iso) return false;
  const diff = new Date(iso).getTime() - now;
  return diff > 0 && diff <= WEEK_MS;
}

function sameInstant(a: string | null, b: string | null): boolean {
  if (!a || !b) return a === b;
  return new Date(a).getTime() === new Date(b).getTime();
}

function newTournamentPayload(t: WatchedTournament): PushPayload {
  return {
    title: `Nuevo torneo: ${t.name}`,
    body: `${formatDate(t.startAt)} · Inscríbete en start.gg`,
    url: t.url,
    tag: `torneo-${t.id}-new`,
    image: t.image,
  };
}

function windowPayload(t: WatchedTournament): PushPayload {
  return {
    title: `Falta una semana: ${t.name}`,
    body: `Es el ${formatDate(t.startAt)}. ¡Nos vemos en brackets!`,
    url: t.url,
    tag: `torneo-${t.id}-window`,
    image: t.image,
  };
}

async function sendToAll(db: ReturnType<typeof supabaseAdmin>, payloads: PushPayload[]) {
  if (!payloads.length) return { sent: 0, removed: 0 };

  webpush.setVapidDetails(
    Deno.env.get("VAPID_SUBJECT") ?? "mailto:bois.oficial@gmail.com",
    Deno.env.get("VAPID_PUBLIC_KEY") ?? "",
    Deno.env.get("VAPID_PRIVATE_KEY") ?? "",
  );

  const { data: subs, error } = await db.from("push_subscriptions").select("endpoint, p256dh, auth");
  if (error) throw new Error(`No se pudieron leer las suscripciones: ${error.message}`);

  const expired = new Set<string>();
  let sent = 0;

  for (const payload of payloads) {
    const body = JSON.stringify({ ...payload, icon: SITE_ICON });
    const results = await Promise.allSettled(
      (subs ?? []).map((sub) =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          body,
          { TTL: 60 * 60 * 24, urgency: "normal", topic: payload.tag.slice(0, 32).replace(/[^A-Za-z0-9_-]/g, "") },
        )
      ),
    );
    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        sent += 1;
        return;
      }
      const status = (result.reason as { statusCode?: number })?.statusCode;
      if (status === 404 || status === 410) expired.add(subs![index].endpoint);
      else console.error("push error", status, String(result.reason?.body ?? result.reason));
    });
  }

  if (expired.size) {
    await db.from("push_subscriptions").delete().in("endpoint", [...expired]);
  }

  return { sent, removed: expired.size };
}

Deno.serve(async (req) => {
  const expected = Deno.env.get("CRON_SECRET") ?? "";
  const provided = req.headers.get("x-cron-secret") ?? "";
  if (!expected || !safeEqual(provided, expected)) {
    return json(401, { error: "No autorizado" });
  }

  const db = supabaseAdmin();
  const mode = new URL(req.url).searchParams.get("mode");

  if (mode === "test") {
    const result = await sendToAll(db, [{
      title: "BoisGang",
      body: "Notificación de prueba: así te avisaremos de los próximos torneos.",
      url: "/#torneos",
      tag: "torneo-prueba",
    }]);
    return json(200, { mode: "test", ...result });
  }

  // Paso 1. Consultar
  const tournaments = await fetchRegionalTournaments(30);
  const now = Date.now();

  // Paso 2. Comparar
  const { count, error: countError } = await db
    .from("tournaments_seen")
    .select("id", { count: "exact", head: true });
  if (countError) return json(500, { error: countError.message });
  const baseline = (count ?? 0) === 0;

  const ids = tournaments.map((t) => t.id);
  const { data: rows, error: rowsError } = ids.length
    ? await db.from("tournaments_seen").select("*").in("id", ids)
    : { data: [] as SeenRow[], error: null };
  if (rowsError) return json(500, { error: rowsError.message });
  const seen = new Map((rows as SeenRow[]).map((row) => [row.id, row]));

  const upserts: SeenRow[] = [];
  const payloads: PushPayload[] = [];

  for (const t of tournaments) {
    const row = seen.get(t.id);
    // Paso 3. Evaluar las fechas
    const inWindow = inNotificationWindow(t.startAt, now);

    if (!row) {
      upserts.push({
        id: t.id,
        name: t.name,
        start_at: t.startAt,
        url: t.url,
        notified_new: true,
        notified_window: inWindow,
      });
      if (!baseline) payloads.push(newTournamentPayload(t));
      continue;
    }

    const startChanged = !sameInstant(row.start_at, t.startAt);
    let notifiedWindow = startChanged ? false : row.notified_window;
    if (inWindow && !notifiedWindow) {
      notifiedWindow = true;
      payloads.push(windowPayload(t));
    }

    if (startChanged || notifiedWindow !== row.notified_window || row.name !== t.name || row.url !== t.url) {
      upserts.push({
        id: t.id,
        name: t.name,
        start_at: t.startAt,
        url: t.url,
        notified_new: true,
        notified_window: notifiedWindow,
      });
    }
  }

  // Paso 4. Notificar una sola vez: primero se registra, luego se envía
  if (upserts.length) {
    const { error } = await db
      .from("tournaments_seen")
      .upsert(upserts.map((row) => ({ ...row, updated_at: new Date().toISOString() })), { onConflict: "id" });
    if (error) return json(500, { error: error.message });
  }

  await db
    .from("tournaments_seen")
    .delete()
    .lt("start_at", new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString());

  const result = await sendToAll(db, payloads);

  return json(200, {
    baseline,
    checked: tournaments.length,
    recorded: upserts.length,
    notifications: payloads.map((p) => p.tag),
    ...result,
  });
});
