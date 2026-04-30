import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

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

function TournamentsSection() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [allTournaments, setAllTournaments] = useState([]);
  const [allLoading, setAllLoading] = useState(false);
  const [allError, setAllError] = useState("");
  const [allPage, setAllPage] = useState(1);
  const [allHasNextPage, setAllHasNextPage] = useState(false);
  const [allTotalPages, setAllTotalPages] = useState(1);

  const isCompact = useSyncExternalStore(
    subscribeCompact,
    getCompactSnapshot,
    getCompactServerSnapshot
  );

  const effectiveViewMode = isCompact ? "grid" : viewMode;

  useEffect(() => {
    let mounted = true;

    async function loadTournaments() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/tournaments/upcoming?page=${page}&perPage=5`);
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error || "No fue posible cargar los torneos.");
        }

        if (mounted) {
          setTournaments(payload.tournaments || []);
          setHasNextPage(Boolean(payload.pagination?.hasNextPage));
          setTotalPages(payload.pagination?.totalPages || 1);
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

  function closeModal() {
    setIsModalClosing(true);
    window.setTimeout(() => {
      setIsModalOpen(false);
      setIsModalClosing(false);
    }, 220);
  }

  useEffect(() => {
    if (!isModalOpen) {
      return undefined;
    }

    function onKeyDown(event) {
      if (event.key === "Escape") {
        closeModal();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    let mounted = true;

    async function loadAllTournaments() {
      setAllLoading(true);
      setAllError("");

      try {
        const response = await fetch(`/api/tournaments/all?page=${allPage}&perPage=6`);
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error || "No fue posible cargar tus torneos.");
        }

        if (mounted) {
          setAllTournaments(payload.tournaments || []);
          setAllHasNextPage(Boolean(payload.pagination?.hasNextPage));
          setAllTotalPages(payload.pagination?.totalPages || 1);
        }
      } catch (err) {
        if (mounted) {
          setAllError(err.message || "Error cargando todos los torneos.");
        }
      } finally {
        if (mounted) {
          setAllLoading(false);
        }
      }
    }

    loadAllTournaments();
    return () => {
      mounted = false;
    };
  }, [allPage, isModalOpen]);

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
                <p>
                  <strong>Fecha:</strong> {formatDate(tournament.startAt)}
                </p>
                <p>
                  <strong>Hora:</strong> {formatHour(tournament.startAt)}
                </p>
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
            <p className="subtitle is-5 has-text-grey">
              Eventos competitivos creados por BoisGang en start.gg.
            </p>
          </div>
          <button
            type="button"
            className="button tournament-all-button"
            onClick={() => {
              setAllPage(1);
              setIsModalOpen(true);
              setIsModalClosing(false);
            }}
          >
            Ver todos los torneos
          </button>
        </div>
        {!isCompact ? (
          <div className="buttons has-addons tournament-view-switch mt-4 mb-5">
            <button
              type="button"
              className={`button is-small ${viewMode === "list" ? "is-link is-selected-view" : ""}`}
              onClick={() => setViewMode("list")}
            >
              Lista
            </button>
            <button
              type="button"
              className={`button is-small ${viewMode === "grid" ? "is-link is-selected-view" : ""}`}
              onClick={() => setViewMode("grid")}
            >
              Cuadrícula
            </button>
          </div>
        ) : null}
        {isCompact ? <div className="mt-4">{content}</div> : content}
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

      <div
        className={`modal ${isModalOpen || isModalClosing ? "is-active" : ""} ${
          isModalClosing ? "is-closing" : "is-opening"
        }`}
      >
        <div className="modal-background" onClick={closeModal} />
        <div className="modal-card tournaments-modal-card">
          <header className="modal-card-head">
            <p className="modal-card-title">Todos mis torneos</p>
            <button
              type="button"
              className="delete"
              aria-label="Cerrar"
              onClick={closeModal}
            />
          </header>
          <section className="modal-card-body">
            {allLoading && <p className="has-text-grey-light">Cargando torneos...</p>}
            {!allLoading && allError && (
              <article className="message is-danger">
                <div className="message-body">{allError}</div>
              </article>
            )}
            {!allLoading && !allError && !allTournaments.length && (
              <p className="has-text-grey-light">No hay torneos para mostrar.</p>
            )}

            {!allLoading && !allError && allTournaments.length > 0 && (
              <div className="tournaments-list modal-tournaments-list">
                {allTournaments.map((tournament) => (
                  <article className="box tournament-list-item modal-tournament-item" key={tournament.id}>
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
            )}
          </section>
          <footer className="modal-card-foot tournaments-modal-footer">
            <div className="pagination-controls">
              <button
                type="button"
                className="button is-small"
                onClick={() => setAllPage((current) => Math.max(1, current - 1))}
                disabled={allPage === 1 || allLoading}
              >
                Anterior
              </button>
              <span className="pagination-label">
                Página {allPage} de {allTotalPages}
              </span>
              {allHasNextPage && (
                <button
                  type="button"
                  className="button is-small is-link"
                  onClick={() => setAllPage((current) => current + 1)}
                  disabled={allLoading}
                >
                  Siguiente
                </button>
              )}
            </div>
          </footer>
        </div>
      </div>
    </section>
  );
}

export default TournamentsSection;
