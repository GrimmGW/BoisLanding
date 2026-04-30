import { useEffect, useState } from "react";
import galMain from "../../assets/images/gallery/gal0.JPG";
import galTop from "../../assets/images/gallery/gal1.JPG";
import galBottom from "../../assets/images/gallery/gal2.JPG";

function AboutSection() {
  const [stats, setStats] = useState({
    organizedTournamentsCount: null,
    instagramFollowersRounded: null,
    instagramFollowersSource: "fallback"
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadStats() {
      setLoadingStats(true);
      try {
        const response = await fetch("/api/about/stats");
        const payload = await response.json();

        if (mounted && response.ok) {
          setStats({
            organizedTournamentsCount: payload.organizedTournamentsCount ?? 0,
            instagramFollowersRounded: payload.instagramFollowersRounded ?? 700,
            instagramFollowersSource: payload.instagramFollowersSource || "fallback"
          });
        }
      } catch (_error) {
        if (mounted) {
          setStats((current) => ({
            ...current,
            organizedTournamentsCount: current.organizedTournamentsCount ?? 0,
            instagramFollowersRounded: current.instagramFollowersRounded ?? 700
          }));
        }
      } finally {
        if (mounted) {
          setLoadingStats(false);
        }
      }
    }

    loadStats();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section id="nosotros" className="section about-section">
      <div className="container">
        <div className="columns is-vcentered is-variable is-6">
          <div className="column is-6-desktop">
            <h2 className="title is-2 about-title">Quiénes somos</h2>
            <div className="content is-medium about-copy">
              <p>
                Somos un equipo de e-sports dedicado a crear experiencias competitivas y
                sociales alrededor de los platform-fighters.
              </p>
              <p>
                Nuestra misión es conectar jugadores nuevos y veteranos mediante
                torneos bien organizados, producción de calidad y un ambiente
                inclusivo.
              </p>
            </div>

            <a
              className="button is-medium about-ig-button mt-4"
              href="https://instagram.com/_boisgang"
              target="_blank"
              rel="noreferrer"
            >
              <svg
                className="about-ig-icon-svg"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="22"
                height="22"
                aria-hidden
                focusable="false"
              >
                <path
                  fill="currentColor"
                  d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                />
              </svg>
              <span>@_boisgang</span>
            </a>

            <div className="about-metrics">
              <div className="about-metric-item">
                <p className="about-metric-value">
                  {loadingStats ? "..." : stats.organizedTournamentsCount}
                </p>
                <p className="about-metric-label">Torneos realizados</p>
              </div>
              <div className="about-metric-item">
                <p className="about-metric-value">
                  {loadingStats ? "..." : `${stats.instagramFollowersRounded}+`}
                </p>
                <p className="about-metric-label">
                  Seguidores en redes
                  {stats.instagramFollowersSource === "fallback" ? " (estimado)" : ""}
                </p>
              </div>
              <div className="about-metric-item">
                <p className="about-metric-value">100%</p>
                <p className="about-metric-label">Calidad de torneos</p>
              </div>
            </div>
          </div>

          <div className="column is-6-desktop">
            <div className="about-collage">
              <div className="about-card about-card-main">
                <img
                  src={galMain}
                  alt="Eventos BoisGang"
                  loading="lazy"
                />
              </div>
              <div className="about-card about-card-top">
                <img
                  src={galTop}
                  alt="Torneo platform fighters"
                  loading="lazy"
                />
              </div>
              <div className="about-card about-card-bottom">
                <img
                  src={galBottom}
                  alt="Comunidad BoisGang"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
