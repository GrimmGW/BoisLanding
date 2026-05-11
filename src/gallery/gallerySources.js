/**
 * Una sola imagen en disco por ítem; en build Vite + vite-imagetools generan
 * variantes WebP (preview ligera vs. full para el lightbox).
 */
import yukitoDantePrev from "../../assets/images/gallery-assets/yukito_dante_coconautic.JPG?w=720&format=webp&quality=76";
import yukitoDanteFull from "../../assets/images/gallery-assets/yukito_dante_coconautic.JPG?w=2400&format=webp&quality=90";

import dareotPrev from "../../assets/images/gallery-assets/dareot_dexwe_cocoleague.JPG?w=720&format=webp&quality=76";
import dareotFull from "../../assets/images/gallery-assets/dareot_dexwe_cocoleague.JPG?w=2400&format=webp&quality=90";

import setsHubPrev from "../../assets/images/gallery-assets/sets_hub.jpg?w=720&format=webp&quality=76";
import setsHubFull from "../../assets/images/gallery-assets/sets_hub.jpg?w=2400&format=webp&quality=90";

import sets2HubPrev from "../../assets/images/gallery-assets/sets2_hub.jpg?w=720&format=webp&quality=76";
import sets2HubFull from "../../assets/images/gallery-assets/sets2_hub.jpg?w=2400&format=webp&quality=90";

import notochorkPrev from "../../assets/images/gallery-assets/notochork_yukito_coconautic.JPG?w=720&format=webp&quality=76";
import notochorkFull from "../../assets/images/gallery-assets/notochork_yukito_coconautic.JPG?w=2400&format=webp&quality=90";

import winnersPrev from "../../assets/images/gallery-assets/winners_hubx.jpg?w=720&format=webp&quality=76";
import winnersFull from "../../assets/images/gallery-assets/winners_hubx.jpg?w=2400&format=webp&quality=90";

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
    id: "g1",
    place: "COCONAUTIC",
    title: "Partida memorable",
    alt: "Partida memorable",
    previewSrc: imageSrc(yukitoDantePrev),
    fullSrc: imageSrc(yukitoDanteFull)
  },
  {
    id: "g2",
    place: "COCONAUTIC League",
    title: "Match épico",
    alt: "Match épico",
    previewSrc: imageSrc(dareotPrev),
    fullSrc: imageSrc(dareotFull)
  },
  {
    id: "g3",
    place: "Smash Hub 4",
    title: "Múltitud y espectadores",
    alt: "Múltitud y espectadores",
    previewSrc: imageSrc(setsHubPrev),
    fullSrc: imageSrc(setsHubFull)
  },
  {
    id: "g4",
    place: "Smash Hub",
    title: "Múltitud y espectadores",
    alt: "Múltitud y espectadores",
    previewSrc: imageSrc(sets2HubPrev),
    fullSrc: imageSrc(sets2HubFull)
  },
  {
    id: "g5",
    place: "COCONAUTIC",
    title: "Encuentro reñido",
    alt: "Mejores momentos",
    previewSrc: imageSrc(notochorkPrev),
    fullSrc: imageSrc(notochorkFull)
  },
  {
    id: "g6",
    place: "Smash Hub X",
    title: "Foto ganadores",
    alt: "Premios y foto grupal",
    previewSrc: imageSrc(winnersPrev),
    fullSrc: imageSrc(winnersFull)
  }
];
