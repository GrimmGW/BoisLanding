import { useEffect, useMemo, useRef, useState } from "react";
import TournamentCard from "./TournamentCard.jsx";

const PAGE_SIZE = 9;

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

function TournamentsSection() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const pageCacheRef = useRef(new Map());

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
        const response = await fetch(`/api/tournaments/regional?page=${page}&perPage=${PAGE_SIZE}`);
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

  const showPagination = page > 1 || hasNextPage;

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

    return (
      <div className="tournaments-grid">
        {tournaments.map((tournament) => (
          <TournamentCard key={tournament.id} tournament={tournament} />
        ))}
      </div>
    );
  }, [error, loading, tournaments]);

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
        {showPagination ? (
          <div className="pagination-controls mt-5">
            <button
              type="button"
              className="button is-small"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1 || loading}
            >
              Anterior
            </button>
            <span className="pagination-label">
              Página {page} de {totalPages}
            </span>
            {hasNextPage ? (
              <button
                type="button"
                className="button is-small is-link"
                onClick={() => setPage((current) => current + 1)}
                disabled={loading}
              >
                Siguiente
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default TournamentsSection;
