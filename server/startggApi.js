/**
 * Handlers compartidos: Express (dev) y Vercel serverless (prod).
 * Variables de entorno: STARTGG_API_TOKEN, STARTGG_OWNER_ID, STARTGG_REGION_COORDINATES,
 * STARTGG_REGION_RADIUS
 */

import { sendJson } from "./httpJson.js";

const STARTGG_ENDPOINT = "https://api.start.gg/gql/alpha";

function envToken() {
  return process.env.STARTGG_API_TOKEN;
}

function envOwnerId() {
  return process.env.STARTGG_OWNER_ID || "89983ed7";
}

function envRegionCoordinates() {
  const raw = process.env.STARTGG_REGION_COORDINATES || "10.9970723,-63.91132959999999";
  return raw.replace(/\s+/g, "");
}

/** Radio para GraphQL: si STARTGG_REGION_RADIUS es solo dígitos, se interpreta como metros (como en la búsqueda web) y se convierte a km. */
function envRegionRadius() {
  const raw = (process.env.STARTGG_REGION_RADIUS || "40233").trim();
  if (/^\d+$/.test(raw)) {
    const meters = Number.parseInt(raw, 10);
    if (!Number.isNaN(meters) && meters > 0) {
      const km = meters / 1000;
      const rounded = Math.round(km * 10) / 10;
      return `${rounded}km`;
    }
  }
  return raw || "40.2km";
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1400&q=80";

function toISODate(unixTimestamp) {
  if (!unixTimestamp) return null;
  return new Date(unixTimestamp * 1000).toISOString();
}

function listTournamentEvents(events) {
  if (!Array.isArray(events)) return [];

  return events
    .map((ev) => {
      const name = typeof ev?.name === "string" ? ev.name.trim() : "";
      if (!name || ev?.id == null) return null;
      return { id: String(ev.id), name };
    })
    .filter(Boolean);
}

const TOURNAMENT_NODE_FIELDS = `
          id
          name
          slug
          startAt
          registrationClosesAt
          numAttendees
          venueName
          venueAddress
          city
          lat
          lng
          primaryContact
          primaryContactType
          bannerImages: images(type: "banner") {
            url
          }
          thumbnailImages: images(type: "profile") {
            url
          }
          owner {
            player {
              gamerTag
            }
          }
          events {
            id
            name
            videogame {
              id
              name
              displayName
            }
          }
`;

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function finiteCoord(value) {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeTournament(event) {
  const banner = event.bannerImages?.[0]?.url || "";
  const logo = event.thumbnailImages?.[0]?.url || "";
  /** Solo contacto público del torneo: `owner.email` exige scope user.email en el token. */
  const primaryRaw = cleanText(event.primaryContact);
  const email = primaryRaw.includes("@") ? primaryRaw : "";
  const attendeeCount = Number(event.numAttendees);

  return {
    id: event.id,
    name: event.name,
    startAt: toISODate(event.startAt),
    registrationClosesAt: toISODate(event.registrationClosesAt),
    url: event.slug ? `https://start.gg/${event.slug}` : "https://start.gg/",
    slug: event.slug || "",
    banner: banner || FALLBACK_IMAGE,
    logo: logo || null,
    image: banner || logo || FALLBACK_IMAGE,
    organizerEmail: email,
    organizerName: cleanText(event.owner?.player?.gamerTag),
    numAttendees: Number.isFinite(attendeeCount) ? attendeeCount : 0,
    venueName: cleanText(event.venueName),
    venueAddress: cleanText(event.venueAddress),
    city: cleanText(event.city),
    lat: finiteCoord(event.lat),
    lng: finiteCoord(event.lng),
    events: listTournamentEvents(event.events)
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
        nodes {${TOURNAMENT_NODE_FIELDS}
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

async function fetchRegionalTournaments({ page, perPage }) {
  const fetchLimit = perPage + 1;
  const coordinates = envRegionCoordinates();
  const radius = envRegionRadius();

  const regionalQuery = `
    query RegionalEvents($page: Int!, $perPage: Int!, $coordinates: String!, $radius: String!) {
      tournaments(query: {
        page: $page
        perPage: $perPage
        filter: {
          upcoming: true
          location: {
            distanceFrom: $coordinates
            distance: $radius
          }
        }
      }) {
        pageInfo {
          total
          totalPages
        }
        nodes {${TOURNAMENT_NODE_FIELDS}
        }
      }
    }
  `;

  const regionalResult = await queryStartGG(regionalQuery, {
    page,
    perPage: fetchLimit,
    coordinates,
    radius
  });

  if (!regionalResult.response.ok || regionalResult.payload?.errors) {
    const details =
      regionalResult.payload?.errors?.[0]?.message ||
      "No se pudo cargar torneos por región. Revisa STARTGG_REGION_COORDINATES y STARTGG_REGION_RADIUS.";
    throw new Error(details);
  }

  const raw = regionalResult.payload?.data?.tournaments?.nodes || [];
  const pageInfo = regionalResult.payload?.data?.tournaments?.pageInfo;

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
export async function handleTournamentsRegional(req, res) {
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
    const payload = await fetchRegionalTournaments({
      page: currentPage,
      perPage
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
    sendJson(res, 200, {
      organizedTournamentsCount: tournamentsPayload.pagination.total ?? 0
    });
  } catch (error) {
    sendJson(res, 502, { error: error.message });
  }
}
