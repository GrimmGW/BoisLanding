/**
 * Handlers compartidos: Express (dev) y Vercel serverless (prod).
 * Variables de entorno: STARTGG_API_TOKEN, STARTGG_OWNER_ID, INSTAGRAM_HANDLE, INSTAGRAM_FOLLOWERS_FALLBACK
 */

import { sendJson } from "./httpJson.js";

const STARTGG_ENDPOINT = "https://api.start.gg/gql/alpha";

function envToken() {
  return process.env.STARTGG_API_TOKEN;
}

function envOwnerId() {
  return process.env.STARTGG_OWNER_ID || "89983ed7";
}

function envInstagramHandle() {
  return (process.env.INSTAGRAM_HANDLE || "_boisgang").replace("@", "");
}

function envInstagramFallback() {
  const n = Number.parseInt(process.env.INSTAGRAM_FOLLOWERS_FALLBACK || "750", 10);
  return Number.isNaN(n) ? 750 : n;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1400&q=80";

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
      Authorization: `Bearer ${envToken()}`
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
  const fallbackValue = envInstagramFallback();

  try {
    const response = await fetch(`https://www.instagram.com/${envInstagramHandle()}/`, {
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
    ownerId: envOwnerId(),
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

function getQuery(req) {
  if (req.query && typeof req.query === "object") return req.query;
  try {
    const url = new URL(req.url, "http://localhost");
    const params = {};
    url.searchParams.forEach((v, k) => {
      params[k] = v;
    });
    return params;
  } catch {
    return {};
  }
}

/** @type {(req: import('http').IncomingMessage & { query?: Record<string, string> }, res: import('http').ServerResponse) => Promise<void>} */
export async function handleTournamentsUpcoming(req, res) {
  if (!envToken()) {
    sendJson(res, 500, {
      error: "Falta STARTGG_API_TOKEN en el servidor."
    });
    return;
  }

  const q = getQuery(req);
  const currentPage = Math.max(1, parsePaging(q.page, 1));
  const perPage = Math.min(20, Math.max(1, parsePaging(q.perPage, 5)));

  try {
    const payload = await fetchOwnerTournaments({
      page: currentPage,
      perPage,
      upcomingOnly: true
    });
    sendJson(res, 200, payload);
  } catch (error) {
    sendJson(res, 502, { error: error.message });
  }
}

/** @type {(req: import('http').IncomingMessage & { query?: Record<string, string> }, res: import('http').ServerResponse) => Promise<void>} */
export async function handleTournamentsAll(req, res) {
  if (!envToken()) {
    sendJson(res, 500, {
      error: "Falta STARTGG_API_TOKEN en el servidor."
    });
    return;
  }

  const q = getQuery(req);
  const currentPage = Math.max(1, parsePaging(q.page, 1));
  const perPage = Math.min(20, Math.max(1, parsePaging(q.perPage, 8)));

  try {
    const payload = await fetchOwnerTournaments({
      page: currentPage,
      perPage,
      upcomingOnly: false
    });
    sendJson(res, 200, payload);
  } catch (error) {
    sendJson(res, 502, { error: error.message });
  }
}

/** @type {(req: import('http').IncomingMessage, res: import('http').ServerResponse) => Promise<void>} */
export async function handleAboutStats(req, res) {
  if (!envToken()) {
    sendJson(res, 500, {
      error: "Falta STARTGG_API_TOKEN en el servidor."
    });
    return;
  }

  try {
    const tournamentsPayload = await fetchOwnerTournaments({
      page: 1,
      perPage: 1,
      upcomingOnly: false
    });
    const instagramPayload = await getInstagramFollowers();

    sendJson(res, 200, {
      organizedTournamentsCount: tournamentsPayload.pagination.total ?? 0,
      instagramFollowersRounded: instagramPayload.instagramFollowersRounded,
      instagramFollowersSource: instagramPayload.instagramFollowersSource
    });
  } catch (error) {
    sendJson(res, 502, { error: error.message });
  }
}
