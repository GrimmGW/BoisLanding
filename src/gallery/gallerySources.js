/**
 * Preview WebP (imagetools) en tarjetas; original (?url) en el lightbox.
 */
import yukitoDantePrev from "../../assets/images/gallery-assets/yukito_dante_coconautic.JPG?w=720&format=webp&quality=76";
import yukitoDanteOriginal from "../../assets/images/gallery-assets/yukito_dante_coconautic.JPG?url";

import dareotPrev from "../../assets/images/gallery-assets/dareot_dexwe_cocoleague.JPG?w=720&format=webp&quality=76";
import dareotOriginal from "../../assets/images/gallery-assets/dareot_dexwe_cocoleague.JPG?url";

import setsHubPrev from "../../assets/images/gallery-assets/sets_hub.jpg?w=720&format=webp&quality=76";
import setsHubOriginal from "../../assets/images/gallery-assets/sets_hub.jpg?url";

import sets2HubPrev from "../../assets/images/gallery-assets/sets2_hub.jpg?w=720&format=webp&quality=76";
import sets2HubOriginal from "../../assets/images/gallery-assets/sets2_hub.jpg?url";

import notochorkPrev from "../../assets/images/gallery-assets/notochork_yukito_coconautic.JPG?w=720&format=webp&quality=76";
import notochorkOriginal from "../../assets/images/gallery-assets/notochork_yukito_coconautic.JPG?url";

import winnersPrev from "../../assets/images/gallery-assets/winners_hubx.jpg?w=720&format=webp&quality=76";
import winnersOriginal from "../../assets/images/gallery-assets/winners_hubx.jpg?url";

function imageSrc(mod) {
  if (typeof mod === "string") return mod;
  if (mod?.src) return mod.src;
  const d = mod?.default;
  if (typeof d === "string") return d;
  if (d?.src) return d.src;
  return "";
}

export const GALLERY_ITEMS = [
  {
    id: "g5",
    place: "COCONAUTIC",
    title: "Encuentro reñido",
    alt: "Mejores momentos",
    previewSrc: imageSrc(notochorkPrev),
    originalSrc: imageSrc(notochorkOriginal)
  },
  {
    id: "g2",
    place: "COCONAUTIC League",
    title: "Match épico",
    alt: "Match épico",
    previewSrc: imageSrc(dareotPrev),
    originalSrc: imageSrc(dareotOriginal)
  },
  {
    id: "g3",
    place: "Smash Hub 4",
    title: "Multitud y espectadores",
    alt: "Multitud y espectadores",
    previewSrc: imageSrc(setsHubPrev),
    originalSrc: imageSrc(setsHubOriginal)
  },
  {
    id: "g4",
    place: "Smash Hub",
    title: "Multitud y espectadores",
    alt: "Multitud y espectadores",
    previewSrc: imageSrc(sets2HubPrev),
    originalSrc: imageSrc(sets2HubOriginal)
  },
  {
    id: "g1",
    place: "COCONAUTIC",
    title: "Partida memorable",
    alt: "Partida memorable",
    previewSrc: imageSrc(yukitoDantePrev),
    originalSrc: imageSrc(yukitoDanteOriginal)
  },
  {
    id: "g6",
    place: "Smash Hub X",
    title: "Foto ganadores",
    alt: "Premios y foto grupal",
    previewSrc: imageSrc(winnersPrev),
    originalSrc: imageSrc(winnersOriginal)
  }
];
