import { useCallback, useEffect, useState } from "react";
import boisLogo from "../../assets/images/BoisLogotipo.png";

const LINKS = [
  { href: "#torneos", label: "Torneos" },
  { href: "#nosotros", label: "Quiénes somos" },
  { href: "#galeria", label: "Galería" },
];

const CLOSE_MS = 300;

function HeroNavbar() {
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const drawerId = "bois-nav-drawer";

  const openMenu = useCallback(() => {
    setClosing(false);
    setMounted(true);
  }, []);

  const requestClose = useCallback(() => {
    if (!mounted || closing) return;
    setClosing(true);
  }, [mounted, closing]);

  useEffect(() => {
    if (!closing) return undefined;
    const id = window.setTimeout(() => {
      setMounted(false);
      setClosing(false);
    }, CLOSE_MS);
    return () => window.clearTimeout(id);
  }, [closing]);

  useEffect(() => {
    if (!mounted) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") requestClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [mounted, requestClose]);

  return (
    <>
      <nav className="bois-nav" aria-label="Principal">
        <div className="container bois-nav-inner">
          <div className="bois-nav-desktop">
            <div className="bois-nav-brand">
              <a className="bois-nav-logo-wrap" href="#inicio">
                <img className="bois-nav-logo" src={boisLogo} alt="BoisGang" />
              </a>
              <span className="bois-nav-divider" aria-hidden />
            </div>
            <div className="bois-nav-links">
              {LINKS.map(({ href, label }) => (
                <a key={href} className="bois-nav-link" href={href}>
                  {label}
                </a>
              ))}
              <a className="bois-nav-contact" href="#contacto">
                Contacto
              </a>
            </div>
          </div>

          <div className="bois-nav-mobile-bar">
            <span className="bois-nav-mobile-spacer" aria-hidden />
            <a
              className="bois-nav-logo-wrap bois-nav-logo-center"
              href="#inicio"
            >
              <img className="bois-nav-logo" src={boisLogo} alt="BoisGang" />
            </a>
            <button
              type="button"
              className="bois-nav-burger"
              onClick={openMenu}
              aria-expanded={mounted && !closing}
              aria-controls={drawerId}
            >
              <i className="fi fi-br-menu-burger" aria-hidden />
              <span className="is-sr-only">Abrir menú</span>
            </button>
          </div>
        </div>
      </nav>

      {mounted ? (
        <>
          <div
            className={`bois-nav-backdrop${closing ? " bois-nav-backdrop--closing" : ""}`}
            onClick={requestClose}
            aria-hidden
          />
          <aside
            id={drawerId}
            className={`bois-nav-drawer${closing ? " bois-nav-drawer--closing" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
          >
            <div className="bois-nav-drawer-head">
              <p className="bois-nav-drawer-title">Menú</p>
              <button
                type="button"
                className="bois-nav-drawer-close"
                onClick={requestClose}
                aria-label="Cerrar menú"
              >
                <i className="fi fi-br-cross" aria-hidden />
              </button>
            </div>
            <nav className="bois-nav-drawer-list" aria-label="Secciones">
              {LINKS.map(({ href, label }) => (
                <a key={href} href={href} onClick={requestClose}>
                  {label}
                </a>
              ))}
              <a
                className="bois-nav-contact"
                href="#contacto"
                onClick={requestClose}
              >
                Contacto
              </a>
            </nav>
          </aside>
        </>
      ) : null}
    </>
  );
}

export default HeroNavbar;
