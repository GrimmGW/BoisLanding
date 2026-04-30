import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
  handleAboutStats,
  handleTournamentsAll,
  handleTournamentsUpcoming
} from "./startggApi.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/api/tournaments/upcoming", handleTournamentsUpcoming);
app.get("/api/tournaments/all", handleTournamentsAll);
app.get("/api/about/stats", handleAboutStats);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Proxy start.gg activo en http://localhost:${PORT}`);
});
