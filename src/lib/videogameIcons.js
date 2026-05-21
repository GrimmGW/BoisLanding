import iconUltimate from "../../assets/videogames/ultimate.svg";
import iconMelee from "../../assets/videogames/melee.svg";
import iconStreetFighter from "../../assets/videogames/street-fighter.svg";
import iconTekken from "../../assets/videogames/tekken.svg";
import iconGuiltyGear from "../../assets/videogames/guilty-gear.svg";
import iconMarioKart from "../../assets/videogames/mario-kart.svg";
import iconRivals from "../../assets/videogames/rivals-of-aether.svg";
import iconDragonBall from "../../assets/videogames/dragon-ball.svg";
import iconMultiversus from "../../assets/videogames/multiversus.svg";
import iconGeneric from "../../assets/videogames/generic.svg";

/** start.gg videogame.id → icono estilizado (no logos oficiales) */
export const VIDEOGAME_ICON_BY_ID = {
  "1386": { src: iconUltimate, label: "Super Smash Bros. Ultimate" },
  "1": { src: iconMelee, label: "Super Smash Bros. Melee" },
  "4": { src: iconMelee, label: "Super Smash Bros. Brawl" },
  "24": { src: iconMelee, label: "Super Smash Bros." },
  "26": { src: iconStreetFighter, label: "Street Fighter V" },
  "49783": { src: iconStreetFighter, label: "Street Fighter 6" },
  "3": { src: iconTekken, label: "Tekken 7" },
  "49110": { src: iconTekken, label: "Tekken 8" },
  "36963": { src: iconGuiltyGear, label: "Guilty Gear Strive" },
  "102537": { src: iconMarioKart, label: "Mario Kart World" },
  "53945": { src: iconRivals, label: "Rivals of Aether II" },
  "1960": { src: iconRivals, label: "Rivals of Aether" },
  "6025": { src: iconDragonBall, label: "Dragon Ball FighterZ" },
  "32168": { src: iconMultiversus, label: "MultiVersus" },
  "43868": { src: iconGuiltyGear, label: "Granblue Fantasy Versus" },
  "72834": { src: iconGeneric, label: "Mortal Kombat 1" }
};

const NAME_MATCHERS = [
  { pattern: /ultimate|ssbu/i, id: "1386" },
  { pattern: /melee/i, id: "1" },
  { pattern: /brawl/i, id: "4" },
  { pattern: /smash.*64|64.*melee/i, id: "24" },
  { pattern: /street fighter|sf6|sfv/i, id: "49783" },
  { pattern: /tekken/i, id: "49110" },
  { pattern: /guilty gear|ggst/i, id: "36963" },
  { pattern: /mario kart/i, id: "102537" },
  { pattern: /rivals of aether|roa2?/i, id: "53945" },
  { pattern: /dragon ball|dbfz/i, id: "6025" },
  { pattern: /multiversus/i, id: "32168" },
  { pattern: /mortal kombat|mk1/i, id: "72834" },
  { pattern: /king of fighters|kof/i, id: null },
  { pattern: /granblue|gbvs/i, id: "43868" }
];

/**
 * @param {{ videogameId: string, name: string }} game
 */
export function resolveVideogameIcon(game) {
  const id = String(game?.videogameId ?? "");
  if (id && VIDEOGAME_ICON_BY_ID[id]) {
    return VIDEOGAME_ICON_BY_ID[id];
  }

  const label = game?.name || "";
  for (const { pattern, id: mappedId } of NAME_MATCHERS) {
    if (!pattern.test(label)) continue;
    if (mappedId && VIDEOGAME_ICON_BY_ID[mappedId]) {
      return VIDEOGAME_ICON_BY_ID[mappedId];
    }
    break;
  }

  return { src: iconGeneric, label };
}
