/**
 * Respuesta JSON compatible con Express (`res.status().json`) y Node puro (Vercel).
 */
export function sendJson(res, statusCode, data) {
  if (typeof res.status === "function" && typeof res.json === "function") {
    res.status(statusCode).json(data);
    return;
  }
  const body = JSON.stringify(data);
  if (!res.headersSent) {
    res.writeHead(statusCode, {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Length": Buffer.byteLength(body)
    });
  }
  res.end(body);
}
