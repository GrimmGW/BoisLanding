const MAX_VISIBLE_EVENTS = 3;

/**
 * Lista en línea los nombres de eventos del torneo (brackets en start.gg).
 * @param {{ events?: Array<{ id: string, name: string }> }} props
 */
function TournamentGamesRow({ events }) {
  if (!Array.isArray(events) || events.length === 0) {
    return null;
  }

  const allNames = events.map((ev) => ev.name);
  const hasMore = allNames.length > MAX_VISIBLE_EVENTS;
  const displayNames = hasMore ? allNames.slice(0, MAX_VISIBLE_EVENTS) : allNames;
  const displayText = hasMore ? `${displayNames.join(", ")}...` : displayNames.join(", ");
  const fullList = allNames.join(", ");

  return (
    <p className="is-size-7 has-text-grey-light tournament-events-line">
      <strong>Juegos:</strong>{" "}
      <span className="tournament-events-names" title={hasMore ? fullList : undefined}>
        {displayText}
      </span>
    </p>
  );
}

export default TournamentGamesRow;
