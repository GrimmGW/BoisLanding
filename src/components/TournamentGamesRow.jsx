import { resolveVideogameIcon } from "../lib/videogameIcons.js";

const DEFAULT_MAX_VISIBLE = 8;

function TournamentGameIcon({ game }) {
  const icon = resolveVideogameIcon(game);
  const tooltipParts = [game.name];
  if (game.eventName && game.eventName !== game.name) {
    tooltipParts.push(game.eventName);
  }
  const title = tooltipParts.join(" — ");

  return (
    <span className="tournament-game-icon" title={title} role="listitem">
      <img src={icon.src} alt="" width={40} height={40} decoding="async" />
      <span className="is-sr-only">{title}</span>
    </span>
  );
}

/**
 * Fila de iconos por videojuego (deduplicados en API).
 * @param {{ games?: Array<{ videogameId: string, name: string, eventName?: string }>, maxVisible?: number }} props
 */
function TournamentGamesRow({ games, maxVisible = DEFAULT_MAX_VISIBLE }) {
  if (!Array.isArray(games) || games.length === 0) {
    return null;
  }

  const visible = games.slice(0, maxVisible);
  const hidden = games.slice(maxVisible);
  const ariaLabel = `Juegos del torneo: ${games.map((g) => g.name).join(", ")}`;

  return (
    <div className="tournament-games-row">
      <span className="tournament-games-label">Juegos</span>
      <div className="tournament-games-icons" role="list" aria-label={ariaLabel}>
        {visible.map((game) => (
          <TournamentGameIcon key={game.videogameId} game={game} />
        ))}
        {hidden.length > 0 ? (
          <span
            className="tournament-game-icon tournament-game-icon--more"
            title={hidden.map((g) => g.name).join("\n")}
            role="listitem"
          >
            <span className="tournament-game-icon-more-text" aria-hidden>
              +{hidden.length}
            </span>
            <span className="is-sr-only">
              {hidden.map((g) => g.name).join(", ")}
            </span>
          </span>
        ) : null}
      </div>
    </div>
  );
}

export default TournamentGamesRow;
