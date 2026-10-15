import webpush from "npm:web-push@3.6.7";
import { fetchRegionalTournaments, type WatchedTournament } from "../_shared/startgg.ts";
import { supabaseAdmin } from "../_shared/supabaseAdmin.ts";

const DAY_MS = 24 * 60 * 60 * 1000;
const THREE_DAY_MS = 3 * DAY_MS;
const WEEK_MS = 7 * DAY_MS;
const SITE_ICON = "/icons/icon-192.png";

type SeenRow = {
  id: string;
  name: string;
  start_at: string | null;
  url: string | null;
  notified_new: boolean;
  notified_window: boolean;
  notified_three: boolean;
  notified_day: boolean;
  registration_closes_at: string | null;
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

function timeUntilStart(iso: string | null, now: number): number | null {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - now;
  return diff > 0 ? diff : null;
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
    title: `Cierra en una semana: ${t.name}`,
    body: `Quedan 7 días para cerrar inscripciones. Cierran el ${formatDate(t.registrationClosesAt)}.`,
    url: t.url,
    tag: `torneo-${t.id}-window`,
    image: t.image,
  };
}

function threeDayPayload(t: WatchedTournament): PushPayload {
  return {
    title: `Quedan 3 días: ${t.name}`,
    body: `Quedan 3 días para cerrar inscripciones. Cierran el ${formatDate(t.registrationClosesAt)}.`,
    url: t.url,
    tag: `torneo-${t.id}-3d`,
    image: t.image,
  };
}

function tomorrowPayload(t: WatchedTournament): PushPayload {
  return {
    title: `Mañana cierran inscripciones: ${t.name}`,
    body: `Mañana, ${formatDate(t.registrationClosesAt)}, cierran las inscripciones.`,
    url: t.url,
    tag: `torneo-${t.id}-1d`,
    image: t.image,
  };
}

function reminderFlags(diff: number | null) {
  return {
    notified_window: diff !== null && diff <= WEEK_MS,
    notified_three: diff !== null && diff <= THREE_DAY_MS,
    notified_day: diff !== null && diff <= DAY_MS,
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
    // Paso 3. Los avisos de 7, 3 y 1 día se miden contra el cierre de inscripciones.
    const diff = timeUntilStart(t.registrationClosesAt, now);
    const inWeek = diff !== null && diff > THREE_DAY_MS && diff <= WEEK_MS;
    const inThree = diff !== null && diff > DAY_MS && diff <= THREE_DAY_MS;
    const inDay = diff !== null && diff <= DAY_MS;

    if (!row) {
      upserts.push({
        id: t.id,
        name: t.name,
        start_at: t.startAt,
        url: t.url,
        notified_new: true,
        registration_closes_at: t.registrationClosesAt,
        ...reminderFlags(diff),
      });
      if (!baseline) payloads.push(newTournamentPayload(t));
      continue;
    }

    const registrationChanged = !sameInstant(row.registration_closes_at, t.registrationClosesAt);
    let notifiedWindow = registrationChanged ? false : Boolean(row.notified_window);
    let notifiedThree = registrationChanged ? false : Boolean(row.notified_three);
    let notifiedDay = registrationChanged ? false : Boolean(row.notified_day);

    if (inDay) {
      if (!notifiedDay) payloads.push(tomorrowPayload(t));
      notifiedDay = true;
      notifiedThree = true;
      notifiedWindow = true;
    } else if (inThree) {
      if (!notifiedThree) payloads.push(threeDayPayload(t));
      notifiedThree = true;
      notifiedWindow = true;
    } else if (inWeek && !notifiedWindow) {
      notifiedWindow = true;
      payloads.push(windowPayload(t));
    }

    if (
      registrationChanged ||
      !sameInstant(row.start_at, t.startAt) ||
      notifiedWindow !== row.notified_window ||
      notifiedThree !== row.notified_three ||
      notifiedDay !== row.notified_day ||
      row.name !== t.name ||
      row.url !== t.url
    ) {
      upserts.push({
        id: t.id,
        name: t.name,
        start_at: t.startAt,
        url: t.url,
        notified_new: true,
        registration_closes_at: t.registrationClosesAt,
        notified_window: notifiedWindow,
        notified_three: notifiedThree,
        notified_day: notifiedDay,
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
