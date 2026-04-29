import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const STARTGG_API_TOKEN = process.env.STARTGG_API_TOKEN;
const STARTGG_ENDPOINT = "https://api.start.gg/gql/alpha";
const STARTGG_OWNER_ID = process.env.STARTGG_OWNER_ID || "89983ed7";
const INSTAGRAM_HANDLE = (process.env.INSTAGRAM_HANDLE || "_boisgang").replace("@", "");
const INSTAGRAM_FOLLOWERS_FALLBACK = Number.parseInt(
  process.env.INSTAGRAM_FOLLOWERS_FALLBACK || "750",
  10
);
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1400&q=80";

app.use(cors());
app.use(express.json());

function toISODate(unixTimestamp) {
  if (!unixTimestamp) return null;
  return new Date(unixTimestamp * 1000).toISOString();
}

function normalizeTournament(event) {
  const banner = event.bannerImages?.[0]?.url;
  const thumbnail = event.thumbnailImages?.[0]?.url;

  return {
    id: event.id,
    name: event.name,
    startAt: toISODate(event.startAt),
    url: event.slug ? `https://start.gg/${event.slug}` : "https://start.gg/",
    slug: event.slug || "",
    image: banner || thumbnail || FALLBACK_IMAGE
  };
}

async function queryStartGG(query, variables) {
  const response = await fetch(STARTGG_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${STARTGG_API_TOKEN}`
    },
    body: JSON.stringify({ query, variables })
  });

  const payload = await response.json();
  return { response, payload };
}

function parsePaging(value, fallback) {
  const parsed = Number.parseInt(String(value), 10);
  if (Number.isNaN(parsed)) return fallback;
  return parsed;
}

function roundDownHundreds(value) {
  return Math.floor(value / 100) * 100;
}

function parseInstagramFollowers(text) {
  const countRegexes = [
    /"edge_followed_by"\s*:\s*\{"count"\s*:\s*(\d+)/,
    /"followers"\s*:\s*([0-9]+)/,
    /"follower_count"\s*:\s*([0-9]+)/
  ];

  for (const regex of countRegexes) {
    const match = text.match(regex);
    if (match?.[1]) {
      const parsed = Number.parseInt(match[1], 10);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

async function getInstagramFollowers() {
  const fallbackValue = Number.isNaN(INSTAGRAM_FOLLOWERS_FALLBACK)
    ? 750
    : INSTAGRAM_FOLLOWERS_FALLBACK;

  try {
    const response = await fetch(`https://www.instagram.com/${INSTAGRAM_HANDLE}/`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
      }
    });

    if (!response.ok) {
      throw new Error("Instagram profile request failed");
    }

    const page = await response.text();
    const followers = parseInstagramFollowers(page);

    if (!followers) {
      throw new Error("Unable to parse followers");
    }

    return {
      instagramFollowersRounded: roundDownHundreds(followers),
      instagramFollowersSource: "live"
    };
  } catch (_error) {
    return {
      instagramFollowersRounded: roundDownHundreds(fallbackValue),
      instagramFollowersSource: "fallback"
    };
  }
}

async function fetchOwnerTournaments({ page, perPage, upcomingOnly }) {
  const fetchLimit = perPage + 1;
  const ownerFilterBlock = upcomingOnly
    ? `
        filter: {
          upcoming: true
          ownerId: $ownerId
        }
      `
    : `
        filter: {
          ownerId: $ownerId
        }
      `;
  const byOwnerFilterQuery = `
    query OwnerEvents($ownerId: ID!, $page: Int!, $perPage: Int!) {
      tournaments(query: {
        page: $page
        perPage: $perPage
${ownerFilterBlock}
      }) {
        pageInfo {
          total
          totalPages
        }
        nodes {
          id
          name
          slug
          startAt
          bannerImages: images(type: "banner") {
            url
          }
          thumbnailImages: images(type: "profile") {
            url
          }
        }
      }
    }
  `;

  let pageInfo;
  let raw = [];

  const ownerQueryResult = await queryStartGG(byOwnerFilterQuery, {
    ownerId: STARTGG_OWNER_ID,
    page,
    perPage: fetchLimit
  });

  if (!ownerQueryResult.response.ok || ownerQueryResult.payload?.errors) {
    const details =
      ownerQueryResult.payload?.errors?.[0]?.message ||
      "No se pudo filtrar por ownerId. Verifica STARTGG_OWNER_ID para mostrar solo torneos organizados.";
    if (details === "An unknown error has occurred") {
      throw new Error(
        "STARTGG_OWNER_ID no es válido para filtro de organizador. Usa el ID de owner/organización correcto en start.gg."
      );
    }
    throw new Error(details);
  }
  raw = ownerQueryResult.payload?.data?.tournaments?.nodes || [];
  pageInfo = ownerQueryResult.payload?.data?.tournaments?.pageInfo;

  const hasNextPage = raw.length > perPage;
  const pageNodes = raw.slice(0, perPage);
  const tournaments = pageNodes.map(normalizeTournament);
  const inferredTotalPages = hasNextPage
    ? page + 1
    : page > 1 && tournaments.length === 0
      ? page - 1
      : page;
  const totalPages = pageInfo?.totalPages || inferredTotalPages;
  const total = pageInfo?.total ?? null;

  return {
    tournaments,
    pagination: {
      currentPage: page,
      perPage,
      hasNextPage,
      totalPages,
      total
    }
  };
}

app.get("/api/tournaments/upcoming", async (req, res) => {
  if (!STARTGG_API_TOKEN) {
    return res.status(500).json({
      error: "Falta STARTGG_API_TOKEN en el servidor."
    });
  }

  const currentPage = Math.max(1, parsePaging(req.query.page, 1));
  const perPage = Math.min(20, Math.max(1, parsePaging(req.query.perPage, 5)));

  try {
    const payload = await fetchOwnerTournaments({
      page: currentPage,
      perPage,
      upcomingOnly: true
    });
    return res.json(payload);
  } catch (error) {
    return res.status(502).json({ error: error.message });
  }
});

app.get("/api/tournaments/all", async (req, res) => {
  if (!STARTGG_API_TOKEN) {
    return res.status(500).json({
      error: "Falta STARTGG_API_TOKEN en el servidor."
    });
  }

  const currentPage = Math.max(1, parsePaging(req.query.page, 1));
  const perPage = Math.min(20, Math.max(1, parsePaging(req.query.perPage, 8)));

  try {
    const payload = await fetchOwnerTournaments({
      page: currentPage,
      perPage,
      upcomingOnly: false
    });
    return res.json(payload);
  } catch (error) {
    return res.status(502).json({ error: error.message });
  }
});

app.get("/api/about/stats", async (_req, res) => {
  if (!STARTGG_API_TOKEN) {
    return res.status(500).json({
      error: "Falta STARTGG_API_TOKEN en el servidor."
    });
  }

  try {
    const tournamentsPayload = await fetchOwnerTournaments({
      page: 1,
      perPage: 1,
      upcomingOnly: false
    });
    const instagramPayload = await getInstagramFollowers();

    return res.json({
      organizedTournamentsCount: tournamentsPayload.pagination.total ?? 0,
      instagramFollowersRounded: instagramPayload.instagramFollowersRounded,
      instagramFollowersSource: instagramPayload.instagramFollowersSource
    });
  } catch (error) {
    return res.status(502).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Proxy start.gg activo en http://localhost:${PORT}`);
});
