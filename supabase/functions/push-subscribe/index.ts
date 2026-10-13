import { corsHeaders, isAllowedOrigin } from "../_shared/cors.ts";
import { supabaseAdmin } from "../_shared/supabaseAdmin.ts";

const MAX_BODY_BYTES = 4096;

type SubscriptionBody = {
  endpoint?: unknown;
  keys?: { p256dh?: unknown; auth?: unknown };
};

function json(status: number, body: unknown, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
  });
}

function validEndpoint(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 1024) return false;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function validKey(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 256 && /^[A-Za-z0-9_\-=]+$/.test(value);
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (!isAllowedOrigin(origin)) {
    return json(403, { error: "Origen no permitido" }, origin);
  }

  if (req.method !== "POST" && req.method !== "DELETE") {
    return json(405, { error: "Método no permitido" }, origin);
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) {
    return json(413, { error: "Cuerpo demasiado grande" }, origin);
  }

  let body: SubscriptionBody;
  try {
    body = JSON.parse(raw);
  } catch {
    return json(400, { error: "JSON inválido" }, origin);
  }

  if (!validEndpoint(body.endpoint)) {
    return json(400, { error: "Endpoint inválido" }, origin);
  }

  const db = supabaseAdmin();

  if (req.method === "DELETE") {
    const { error } = await db.from("push_subscriptions").delete().eq("endpoint", body.endpoint);
    if (error) return json(500, { error: "No se pudo borrar la suscripción" }, origin);
    return json(200, { ok: true }, origin);
  }

  const p256dh = body.keys?.p256dh;
  const auth = body.keys?.auth;
  if (!validKey(p256dh) || !validKey(auth)) {
    return json(400, { error: "Claves inválidas" }, origin);
  }

  const { error } = await db.from("push_subscriptions").upsert(
    {
      endpoint: body.endpoint,
      p256dh,
      auth,
      user_agent: (req.headers.get("user-agent") ?? "").slice(0, 300),
    },
    { onConflict: "endpoint" },
  );
  if (error) return json(500, { error: "No se pudo guardar la suscripción" }, origin);
  return json(200, { ok: true }, origin);
});
