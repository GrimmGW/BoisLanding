const STARTGG_ENDPOINT = "https://api.start.gg/gql/alpha";

export type WatchedTournament = {
  id: string;
  name: string;
  startAt: string | null;
  url: string;
  image: string | null;
};

function regionCoordinates(): string {
  return (Deno.env.get("STARTGG_REGION_COORDINATES") || "10.9970723,-63.91132959999999").replace(/\s+/g, "");
}

/** Igual que server/startggApi.js: solo dígitos se interpreta como metros. */
function regionRadius(): string {
  const raw = (Deno.env.get("STARTGG_REGION_RADIUS") || "40233").trim();
  if (/^\d+$/.test(raw)) {
    const meters = Number.parseInt(raw, 10);
    if (meters > 0) return `${Math.round((meters / 1000) * 10) / 10}km`;
  }
  return raw || "40.2km";
}

const REGIONAL_QUERY = `
  query RegionalWatch($perPage: Int!, $coordinates: String!, $radius: String!) {
    tournaments(query: {
      page: 1
      perPage: $perPage
      filter: {
        upcoming: true
        location: { distanceFrom: $coordinates, distance: $radius }
      }
    }) {
      nodes {
        id
        name
        slug
        startAt
        bannerImages: images(type: "banner") { url }
        thumbnailImages: images(type: "profile") { url }
      }
    }
  }
`;

type RawNode = {
  id: string | number;
  name: string;
  slug?: string | null;
  startAt?: number | null;
  bannerImages?: { url: string }[] | null;
  thumbnailImages?: { url: string }[] | null;
};

export async function fetchRegionalTournaments(perPage = 30): Promise<WatchedTournament[]> {
  const token = Deno.env.get("STARTGG_API_TOKEN");
  if (!token) throw new Error("Falta STARTGG_API_TOKEN");

  const response = await fetch(STARTGG_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: REGIONAL_QUERY,
      variables: { perPage, coordinates: regionCoordinates(), radius: regionRadius() },
    }),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload || payload.errors) {
    throw new Error(payload?.errors?.[0]?.message || `start.gg respondió ${response.status}`);
  }

  const nodes: RawNode[] = payload.data?.tournaments?.nodes ?? [];
  return nodes.map((node) => ({
    id: String(node.id),
    name: node.name,
    startAt: node.startAt ? new Date(node.startAt * 1000).toISOString() : null,
    url: node.slug ? `https://start.gg/${node.slug}` : "https://start.gg/",
    image: node.thumbnailImages?.[0]?.url || node.bannerImages?.[0]?.url || null,
  }));
}
