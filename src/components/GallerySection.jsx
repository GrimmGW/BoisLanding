import { useCallback, useEffect, useRef, useState } from "react";
import { GALLERY_ITEMS } from "../gallery/gallerySources";

/** Orden coincide con celdas del bento: A(2x2) B C / D E F(2x2) */
const BENTO_CELLS = ["a", "b", "c", "d", "e", "f"];

const LIGHTBOX_CLOSE_MS = 280;

function GalleryCardContent({ item }) {
  return (
    <>
      <img
        className="gallery-card-image"
        src={item.previewSrc}
        alt={item.alt}
        loading="lazy"
        decoding="async"
      />
      <div className="gallery-card-text">
        <p className="gallery-card-kicker">{item.place}</p>
        <p className="gallery-card-title">{item.title}</p>
      </div>
    </>
  );
}

const LB_SWIPE_THRESHOLD = 56;

/** Evita flashes al cambiar de foto: misma URL solo decodifica una vez (caché entre aperturas). */
const galleryFullDecodeCache = new Map();

function ensureGalleryFullDecoded(src) {
  const existing = galleryFullDecodeCache.get(src);
  if (existing) return existing;
  const promise = (async () => {
    const img = new Image();
    img.src = src;
    if (typeof img.decode === "function") {
      await img.decode().catch(() => {});
    } else {
      await new Promise((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("load"));
      }).catch(() => {});
    }
  })();
  galleryFullDecodeCache.set(src, promise);
  return promise;
}

function GallerySection() {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [lightboxClosing, setLightboxClosing] = useState(false);
  const [lbEnterDir, setLbEnterDir] = useState("idle");
  const [lbDragX, setLbDragX] = useState(0);
  const lbTouchStartX = useRef(0);
  const lbIndexRef = useRef(null);
  const carouselRef = useRef(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const requestCloseLightbox = useCallback(() => {
    if (lightboxIndex === null || lightboxClosing) return;
    setLightboxClosing(true);
  }, [lightboxIndex, lightboxClosing]);

  const openLightbox = useCallback((index) => {
    setLightboxClosing(false);
    setLbEnterDir("idle");
    setLbDragX(0);
    setLightboxIndex(index);
  }, []);

  useEffect(() => {
    lbIndexRef.current = lightboxIndex;
  }, [lightboxIndex]);

  /** Precarga y decodifica todas las full al estar en lightbox (actual primero). */
  useEffect(() => {
    if (lightboxIndex === null) return undefined;
    const ordered = [...GALLERY_ITEMS];
    const [current] = ordered.splice(lightboxIndex, 1);
    const queue = [current, ...ordered];
    let cancelled = false;
    (async () => {
      for (const item of queue) {
        if (cancelled) return;
        await ensureGalleryFullDecoded(item.fullSrc);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lightboxIndex]);

  const goLightboxPrev = useCallback(async () => {
    const i = lbIndexRef.current;
    if (i === null || i <= 0) return;
    const prev = GALLERY_ITEMS[i - 1];
    await ensureGalleryFullDecoded(prev.fullSrc);
    setLbDragX(0);
    setLbEnterDir("prev");
    setLightboxIndex(i - 1);
  }, []);

  const goLightboxNext = useCallback(async () => {
    const i = lbIndexRef.current;
    if (i === null || i >= GALLERY_ITEMS.length - 1) return;
    const next = GALLERY_ITEMS[i + 1];
    await ensureGalleryFullDecoded(next.fullSrc);
    setLbDragX(0);
    setLbEnterDir("next");
    setLightboxIndex(i + 1);
  }, []);

  const updateCarouselNav = useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const epsilon = 12;
    setCanScrollPrev(scrollLeft > epsilon);
    setCanScrollNext(scrollLeft + clientWidth < scrollWidth - epsilon);
  }, []);

  useEffect(() => {
    updateCarouselNav();
  }, [updateCarouselNav]);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return undefined;
    updateCarouselNav();
    el.addEventListener("scroll", updateCarouselNav, { passive: true });
    window.addEventListener("resize", updateCarouselNav);
    return () => {
      el.removeEventListener("scroll", updateCarouselNav);
      window.removeEventListener("resize", updateCarouselNav);
    };
  }, [updateCarouselNav]);

  useEffect(() => {
    if (!lightboxClosing) return undefined;
    const id = window.setTimeout(() => {
      setLightboxIndex(null);
      setLightboxClosing(false);
    }, LIGHTBOX_CLOSE_MS);
    return () => window.clearTimeout(id);
  }, [lightboxClosing]);

  useEffect(() => {
    if (lightboxIndex === null && !lightboxClosing) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") {
        requestCloseLightbox();
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goLightboxPrev();
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goLightboxNext();
      }
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [
    lightboxIndex,
    lightboxClosing,
    requestCloseLightbox,
    goLightboxPrev,
    goLightboxNext
  ]);

  function onLbTouchStart(e) {
    if (lightboxClosing || e.touches.length !== 1) return;
    lbTouchStartX.current = e.touches[0].clientX;
    setLbDragX(0);
  }

  function onLbTouchMove(e) {
    if (lightboxClosing || e.touches.length !== 1) return;
    const x = e.touches[0].clientX;
    let dx = x - lbTouchStartX.current;
    const i = lbIndexRef.current;
    if (i === 0 && dx > 0) dx *= 0.35;
    if (i === GALLERY_ITEMS.length - 1 && dx < 0) dx *= 0.35;
    setLbDragX(dx);
  }

  function onLbTouchEnd(e) {
    if (lightboxClosing) return;
    const endX = e.changedTouches[0]?.clientX ?? lbTouchStartX.current;
    const delta = endX - lbTouchStartX.current;
    setLbDragX(0);
    if (delta < -LB_SWIPE_THRESHOLD) {
      void goLightboxNext();
      return;
    }
    if (delta > LB_SWIPE_THRESHOLD) {
      void goLightboxPrev();
    }
  }

  function scrollCarousel(direction) {
    const el = carouselRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth, behavior: "smooth" });
    window.requestAnimationFrame(() => updateCarouselNav());
  }

  const activeItem =
    lightboxIndex !== null ? GALLERY_ITEMS[lightboxIndex] : null;
  const lbCanPrev = lightboxIndex !== null && lightboxIndex > 0;
  const lbCanNext =
    lightboxIndex !== null && lightboxIndex < GALLERY_ITEMS.length - 1;

  return (
    <section id="galeria" className="section gallery-section">
      <div className="container">
        <h2 className="title is-2 gallery-section-title">Galería</h2>
        <p className="subtitle is-5 gallery-section-subtitle">
          Fotos de nuestro trabajo, mejores momentos y la comunidad BoisGang.
        </p>

        <div className="gallery-bento" aria-hidden={false}>
          {GALLERY_ITEMS.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={`gallery-card gallery-bento-cell--${BENTO_CELLS[index]}`}
              onClick={() => openLightbox(index)}
            >
              <GalleryCardContent item={item} />
            </button>
          ))}
        </div>

        <div className="gallery-carousel-wrap">
          <div
            ref={carouselRef}
            className="gallery-carousel-viewport"
            tabIndex={0}
            role="region"
            aria-label="Carrusel de la galería"
          >
            {GALLERY_ITEMS.map((item, index) => (
              <button
                key={`carousel-${item.id}`}
                type="button"
                className="gallery-carousel-slide gallery-card"
                onClick={() => openLightbox(index)}
              >
                <GalleryCardContent item={item} />
              </button>
            ))}
          </div>
          <button
            type="button"
            className="gallery-carousel-arrow gallery-carousel-arrow--prev"
            aria-label="Imagen anterior"
            disabled={!canScrollPrev}
            onClick={() => scrollCarousel(-1)}
          >
            ‹
          </button>
          <button
            type="button"
            className="gallery-carousel-arrow gallery-carousel-arrow--next"
            aria-label="Imagen siguiente"
            disabled={!canScrollNext}
            onClick={() => scrollCarousel(1)}
          >
            ›
          </button>
        </div>
      </div>

      {activeItem ? (
        <div
          className={`gallery-lightbox${lightboxClosing ? " is-closing" : " is-opening"}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="gallery-lightbox-title"
        >
          <button
            type="button"
            className="gallery-lightbox-backdrop"
            aria-label="Cerrar galería"
            onClick={requestCloseLightbox}
          />
          <div className="gallery-lightbox-panel">
            <button
              type="button"
              className="gallery-lightbox-close"
              aria-label="Cerrar"
              onClick={requestCloseLightbox}
            >
              ×
            </button>
            <p className="gallery-lightbox-kicker">{activeItem.place}</p>
            <h3 id="gallery-lightbox-title" className="gallery-lightbox-heading">
              {activeItem.title}
            </h3>
            <div
              className="gallery-lightbox-frame"
              onTouchStart={onLbTouchStart}
              onTouchMove={onLbTouchMove}
              onTouchEnd={onLbTouchEnd}
              onTouchCancel={() => setLbDragX(0)}
              role="presentation"
            >
              <button
                type="button"
                className="gallery-carousel-arrow gallery-carousel-arrow--prev gallery-lightbox-frame-nav"
                aria-label="Foto anterior"
                disabled={!lbCanPrev}
                onClick={(ev) => {
                  ev.stopPropagation();
                  goLightboxPrev();
                }}
              >
                ‹
              </button>
              <button
                type="button"
                className="gallery-carousel-arrow gallery-carousel-arrow--next gallery-lightbox-frame-nav"
                aria-label="Foto siguiente"
                disabled={!lbCanNext}
                onClick={(ev) => {
                  ev.stopPropagation();
                  goLightboxNext();
                }}
              >
                ›
              </button>
              <img
                key={lightboxIndex}
                src={activeItem.fullSrc}
                alt={activeItem.alt}
                className={`gallery-lightbox-image gallery-lightbox-image--enter-${lbEnterDir}${
                  lbDragX !== 0 ? " is-dragging" : ""
                }`}
                style={
                  lbDragX !== 0
                    ? { transform: `translate3d(${lbDragX}px,0,0)` }
                    : undefined
                }
                draggable={false}
                decoding="async"
                fetchPriority="high"
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default GallerySection;
