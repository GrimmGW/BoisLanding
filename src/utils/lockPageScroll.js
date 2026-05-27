/**
 * Restaura scroll sin animación (evita el “viaje” por smooth scroll del sitio).
 */
function restoreScrollInstant(y) {
  const html = document.documentElement;
  const prevBehavior = html.style.scrollBehavior;
  html.style.scrollBehavior = "auto";

  html.scrollTop = y;
  document.body.scrollTop = y;

  try {
    window.scrollTo({ top: y, left: 0, behavior: "instant" });
  } catch {
    window.scrollTo(0, y);
  }

  html.style.scrollBehavior = prevBehavior;
}

/**
 * Bloquea el scroll del documento (html + body) y restaura la posición al desbloquear.
 * Necesario porque Bulma usa overflow-y: scroll en html y en móvil body.overflow no basta.
 */
export function lockPageScroll() {  const scrollY =
    window.scrollY ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0;

  const { style: htmlStyle } = document.documentElement;
  const { style: bodyStyle } = document.body;

  const prev = {
    htmlOverflow: htmlStyle.overflow,
    bodyOverflow: bodyStyle.overflow,
    bodyPosition: bodyStyle.position,
    bodyTop: bodyStyle.top,
    bodyLeft: bodyStyle.left,
    bodyRight: bodyStyle.right,
    bodyWidth: bodyStyle.width,
    hadHtmlClass: document.documentElement.classList.contains("bois-scroll-locked")
  };

  document.documentElement.classList.add("bois-scroll-locked");
  htmlStyle.overflow = "hidden";
  bodyStyle.overflow = "hidden";
  bodyStyle.position = "fixed";
  bodyStyle.top = `-${scrollY}px`;
  bodyStyle.left = "0";
  bodyStyle.right = "0";
  bodyStyle.width = "100%";

  return () => {
    const topValue = bodyStyle.top;
    const restoreY =
      bodyStyle.position === "fixed" && topValue
        ? Math.abs(Number.parseInt(topValue, 10)) || scrollY
        : scrollY;

    if (!prev.hadHtmlClass) {
      document.documentElement.classList.remove("bois-scroll-locked");
    }
    htmlStyle.overflow = prev.htmlOverflow;
    bodyStyle.overflow = prev.bodyOverflow;
    bodyStyle.position = prev.bodyPosition;
    bodyStyle.top = prev.bodyTop;
    bodyStyle.left = prev.bodyLeft;
    bodyStyle.right = prev.bodyRight;
    bodyStyle.width = prev.bodyWidth;

    restoreScrollInstant(restoreY);
  };
}
