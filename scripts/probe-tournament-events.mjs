import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(root, ".env") });

const token = process.env.STARTGG_API_TOKEN;
if (!token) {
  console.error("No STARTGG_API_TOKEN");
  process.exit(1);
}

const query = `
  query Probe($ownerId: ID!) {
    tournaments(query: { page: 1, perPage: 2, filter: { ownerId: $ownerId } }) {
      nodes {
        id
        name
        slug
        events {
          id
          name
          videogame {
            id
            name
            displayName
          }
        }
      }
    }
  }
`;

const res = await fetch("https://api.start.gg/gql/alpha", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  },
  body: JSON.stringify({
    query,
    variables: { ownerId: process.env.STARTGG_OWNER_ID || "89983ed7" }
  })
});

const payload = await res.json();
console.log(JSON.stringify(payload, null, 2));
