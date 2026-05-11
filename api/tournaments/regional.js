import { handleTournamentsRegional } from "../../server/startggApi.js";
import { sendJson } from "../../server/httpJson.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }
  await handleTournamentsRegional(req, res);
}
