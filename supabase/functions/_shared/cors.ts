function allowedOrigins(): string[] {
  return (Deno.env.get("ALLOWED_ORIGINS") ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function originMatches(origin: string, rule: string): boolean {
  if (rule === origin) return true;
  const wildcard = rule.match(/^(https?:\/\/)\*\.(.+)$/);
  if (!wildcard) return false;
  const [, scheme, suffix] = wildcard;
  return origin.startsWith(scheme) && origin.endsWith(`.${suffix}`);
}

export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  return allowedOrigins().some((rule) => originMatches(origin, rule));
}

export function corsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, apikey, authorization, x-client-info",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
  if (origin && isAllowedOrigin(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}
