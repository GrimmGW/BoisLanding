import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { sendJson } from "./httpJson.js";
import {
  handleAboutStats,
  handleTournamentsAll,
  handleTournamentsRegional,
  handleTournamentsUpcoming
} from "./startggApi.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/api/tournaments/upcoming", handleTournamentsUpcoming);
app.get("/api/tournaments/regional", handleTournamentsRegional);
app.get("/api/tournaments/all", handleTournamentsAll);
app.get("/api/about/stats", handleAboutStats);

app.use((req, res) => {
  if (typeof req.path === "string" && req.path.startsWith("/api")) {
    sendJson(res, 404, {
      error:
        "Ruta API no encontrada. Reinicia el proxy (npm run dev:server) tras actualizar el código."
    });
    return;
  }
  res.status(404).type("text/plain").send("Not found");
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Proxy start.gg activo en http://localhost:${PORT}`);
});
