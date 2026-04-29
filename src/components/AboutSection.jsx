import { useEffect, useState } from "react";

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
                Somos una comunidad dedicada a crear experiencias competitivas y
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
              Seguir en Instagram @_boisgang
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
                  src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80"
                  alt="Placeholder principal de eventos BoisGang"
                  loading="lazy"
                />
              </div>
              <div className="about-card about-card-top">
                <img
                  src="https://images.unsplash.com/photo-1560253023-3ec5d502959f?auto=format&fit=crop&w=1000&q=80"
                  alt="Placeholder de jugador en torneo"
                  loading="lazy"
                />
              </div>
              <div className="about-card about-card-bottom">
                <img
                  src="https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1000&q=80"
                  alt="Placeholder de comunidad en evento"
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
