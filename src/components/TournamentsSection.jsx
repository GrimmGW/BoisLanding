import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import TournamentGamesRow from "./TournamentGamesRow.jsx";

const COMPACT_MQ = "(max-width: 768px)";

function subscribeCompact(callback) {
  const mq = window.matchMedia(COMPACT_MQ);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getCompactSnapshot() {
  return window.matchMedia(COMPACT_MQ).matches;
}

function getCompactServerSnapshot() {
  return false;
}

function formatDate(dateISO) {
  if (!dateISO) return "Fecha por confirmar";
  return new Date(dateISO).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

function formatHour(dateISO) {
  if (!dateISO) return "Hora por confirmar";
  return new Date(dateISO).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

async function parseJsonResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const text = await response.text();
  if (!contentType.includes("application/json")) {
    throw new Error(
      "El servidor respondió con HTML en lugar de JSON. En local, ejecuta también el proxy (`npm run dev:server`) y reinícialo tras actualizar. En producción, comprueba que exista la ruta `/api/tournaments/regional`."
    );
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("La respuesta del servidor no es JSON válido.");
  }
}

/** Correo del organizador (minúsculas) → estilo y etiqueta mostrada */
const ORGANIZER_DISPLAY_MAP = new Map([
  ["bois.oficial@gmail.com", { label: "BoisGang", className: "tournament-organizer-boisgang" }],
  ["eduardoenriqueperezf@gmail.com", { label: "SEDAH", className: "tournament-organizer-sedah" }]
]);

function TournamentOrganizerLine({ organizerEmail }) {
  const raw = typeof organizerEmail === "string" ? organizerEmail.trim() : "";
  if (!raw) {
    return null;
  }
  const entry = ORGANIZER_DISPLAY_MAP.get(raw.toLowerCase());
  return (
    <p className="is-size-7 has-text-grey-light tournament-organizer-line">
      <strong>Organizador:</strong>{" "}
      {entry ? (
        <span className={entry.className}>{entry.label}</span>
      ) : (
        <strong className="tournament-organizer-email">{raw}</strong>
      )}
    </p>
  );
}

function TournamentsSection() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const pageCacheRef = useRef(new Map());

  const isCompact = useSyncExternalStore(
    subscribeCompact,
    getCompactSnapshot,
    getCompactServerSnapshot
  );

  const effectiveViewMode = isCompact ? "grid" : "list";

  useEffect(() => {
    const cacheMap = pageCacheRef.current;
    const cached = cacheMap.get(page);

    if (cached) {
      setTournaments([...cached.tournaments]);
      setHasNextPage(cached.hasNextPage);
      setTotalPages(cached.totalPages);
      setError("");
      setLoading(false);
      return undefined;
    }

    let mounted = true;

    async function loadTournaments() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/tournaments/regional?page=${page}&perPage=5`);
        const payload = await parseJsonResponse(response);

        if (!response.ok) {
          throw new Error(payload?.error || "No fue posible cargar los torneos.");
        }

        const list = payload.tournaments || [];
        const nextHas = Boolean(payload.pagination?.hasNextPage);
        const nextTotal = payload.pagination?.totalPages || 1;

        cacheMap.set(page, {
          tournaments: [...list],
          hasNextPage: nextHas,
          totalPages: nextTotal
        });

        if (mounted) {
          setTournaments([...list]);
          setHasNextPage(nextHas);
          setTotalPages(nextTotal);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Ocurrió un error al consultar start.gg.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadTournaments();
    return () => {
      mounted = false;
    };
  }, [page]);

  const content = useMemo(() => {
    if (loading) {
      return <p className="has-text-grey">Cargando torneos...</p>;
    }

    if (error) {
      return (
        <article className="message is-danger">
          <div className="message-body">{error}</div>
        </article>
      );
    }

    if (!tournaments.length) {
      return <p className="has-text-grey">No hay torneos próximos disponibles.</p>;
    }

    if (effectiveViewMode === "list") {
      return (
        <div className="tournaments-list">
          {tournaments.map((tournament) => (
            <article className="box tournament-list-item" key={tournament.id}>
              <div className="tournament-list-media">
                <img
                  src={tournament.image}
                  alt={`Vista previa de ${tournament.name}`}
                  loading="lazy"
                />
              </div>
              <div className="tournament-list-content">
                <p className="title is-5 mb-2">{tournament.name}</p>
                <p className="is-size-7 has-text-grey-light">
                  <strong>Fecha:</strong> {formatDate(tournament.startAt)} |{" "}
                  <strong>Hora:</strong> {formatHour(tournament.startAt)}
                </p>
                <TournamentOrganizerLine organizerEmail={tournament.organizerEmail} />
                <TournamentGamesRow events={tournament.events} />
                <a
                  className="button is-small is-light mt-3"
                  href={tournament.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Ver en start.gg
                </a>
              </div>
            </article>
          ))}
        </div>
      );
    }

    return (
      <div className="columns is-multiline">
        {tournaments.map((tournament) => (
          <div className="column is-half-tablet is-one-third-desktop" key={tournament.id}>
            <div className="card tournament-card">
              <div className="card-image">
                <figure className="image tournament-grid-image">
                  <img
                    src={tournament.image}
                    alt={`Vista previa de ${tournament.name}`}
                    loading="lazy"
                  />
                </figure>
              </div>
              <div className="card-content">
                <p className="title is-5">{tournament.name}</p>
                <p className="is-size-7 has-text-grey-light">
                  <strong>Fecha:</strong> {formatDate(tournament.startAt)}
                </p>
                <p className="is-size-7 has-text-grey-light">
                  <strong>Hora:</strong> {formatHour(tournament.startAt)}
                </p>
                <TournamentOrganizerLine organizerEmail={tournament.organizerEmail} />
                <TournamentGamesRow events={tournament.events} />
              </div>
              <footer className="card-footer">
                <a
                  className="card-footer-item has-text-weight-semibold"
                  href={tournament.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Ver en start.gg
                </a>
              </footer>
            </div>
          </div>
        ))}
      </div>
    );
  }, [error, loading, tournaments, effectiveViewMode]);

  return (
    <section id="torneos" className="section">
      <div className="container">
        <div className="section-header-inline">
          <div>
            <h2 className="title is-2">Próximos torneos</h2>
            <p className="subtitle is-5 tournaments-subtitle">
              Eventos competitivos en Nueva Esparta.
            </p>
          </div>
        </div>
        <div className="mt-4">{content}</div>
        <div className="pagination-controls mt-5">
          <button
            type="button"
            className="button is-small"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1 || loading}
          >
            Anterior
          </button>
          <span className="pagination-label">Página {page} de {totalPages}</span>
          {hasNextPage && (
            <button
              type="button"
              className="button is-small is-link"
              onClick={() => setPage((current) => current + 1)}
              disabled={loading}
            >
              Siguiente
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

export default TournamentsSection;
