import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faLocationDot,
  faTrophy,
  faUsers
} from "@fortawesome/free-solid-svg-icons";

const ORGANIZER_DISPLAY_MAP = new Map([
  ["bois.oficial@gmail.com", "BoisGang"],
  ["eduardoenriqueperezf@gmail.com", "SEDAH"],
  ["zoulsgaming1@gmail.com", "Zouls"],
]);

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function organizerLabel(tournament) {
  const email =
    typeof tournament.organizerEmail === "string"
      ? tournament.organizerEmail.trim().toLowerCase()
      : "";
  if (email && ORGANIZER_DISPLAY_MAP.has(email)) {
    return ORGANIZER_DISPLAY_MAP.get(email);
  }
  const name = typeof tournament.organizerName === "string" ? tournament.organizerName.trim() : "";
  return name;
}

function registrationClosesSoon(dateISO) {
  if (!dateISO) return false;
  const closesAt = new Date(dateISO).getTime();
  if (Number.isNaN(closesAt)) return false;
  const remaining = closesAt - Date.now();
  return remaining > 0 && remaining < WEEK_MS;
}

function formatDate(dateISO) {
  if (!dateISO) return "Por confirmar";
  const date = new Date(dateISO);
  if (Number.isNaN(date.getTime())) return "Por confirmar";
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" }).replace(/\./g, "");
}

function mapsHref(tournament) {
  const lat = tournament.lat;
  const lng = tournament.lng;
  if (typeof lat === "number" && typeof lng === "number" && Number.isFinite(lat) && Number.isFinite(lng)) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
  const address = [tournament.venueName, tournament.venueAddress, tournament.city]
    .map((part) => (typeof part === "string" ? part.trim() : ""))
    .filter(Boolean)
    .join(", ");
  if (!address) return "";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

function TournamentCard({ tournament }) {
  const name = tournament.name || "Torneo";
  const organizer = organizerLabel(tournament);
  const events = Array.isArray(tournament.events) ? tournament.events : [];
  const eventNames = events.map((event) => event.name).filter(Boolean);
  const attendees = Number.isFinite(Number(tournament.numAttendees))
    ? Number(tournament.numAttendees)
    : 0;
  const mapsUrl = mapsHref(tournament);
  const showClosingPill = registrationClosesSoon(tournament.registrationClosesAt);
  const initial = name.trim().charAt(0).toUpperCase() || "T";
  const when = formatDate(tournament.startAt);

  return (
    <article className="tournament-card">
      <div className="tournament-card-banner">
        <img src={tournament.banner || tournament.image} alt="" />
      </div>
      <div className="tournament-card-overlap">
        <div className="tournament-card-logo">
          {tournament.logo ? (
            <img src={tournament.logo} alt={`Logo de ${name}`} />
          ) : (
            <span aria-hidden>{initial}</span>
          )}
        </div>
        {showClosingPill ? <span className="tournament-card-pill">Cierra pronto</span> : null}
      </div>
      <div className="tournament-card-body">
        <div className="tournament-card-identity">
          <div className="tournament-card-titles">
            <h3 className="tournament-card-name" title={name}>
              {name}
            </h3>
            {organizer ? <p className="tournament-card-organizer">{organizer}</p> : null}
          </div>
          {mapsUrl ? (
            <a
              className="tournament-card-map"
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`Ver ${name} en Google Maps`}
            >
              <FontAwesomeIcon icon={faLocationDot} />
            </a>
          ) : null}
        </div>
        <div className="tournament-card-stats">
          <div className="tournament-card-stat">
            <div className="tournament-card-stat-head">
              <FontAwesomeIcon className="tournament-card-stat-icon is-date" icon={faCalendarDays} />
              <p className="tournament-card-stat-label">Fecha</p>
            </div>
            <p className="tournament-card-stat-value">{when}</p>
          </div>
          <div
            className="tournament-card-stat tournament-card-stat--events"
            tabIndex={0}
            aria-label={
              eventNames.length
                ? `Eventos: ${eventNames.length}. ${eventNames.join(", ")}`
                : "Eventos: 0"
            }
          >
            <div className="tournament-card-stat-head">
              <FontAwesomeIcon className="tournament-card-stat-icon is-events" icon={faTrophy} />
              <p className="tournament-card-stat-label">Eventos</p>
            </div>
            <p className="tournament-card-stat-value">{eventNames.length}</p>
            <div className="tournament-card-tooltip" role="tooltip">
              {events.length ? (
                <ul>
                  {events.map((event) => (
                    <li key={event.id}>{event.name}</li>
                  ))}
                </ul>
              ) : (
                <p>Sin eventos publicados</p>
              )}
            </div>
          </div>
          <div className="tournament-card-stat">
            <div className="tournament-card-stat-head">
              <FontAwesomeIcon className="tournament-card-stat-icon is-attendees" icon={faUsers} />
              <p className="tournament-card-stat-label">Attendees</p>
            </div>
            <p className="tournament-card-stat-value">{attendees}</p>
          </div>
        </div>
        <a className="bois-verify-button tournament-card-cta" href={tournament.url} target="_blank" rel="noreferrer">
          <span className="bois-verify-button-surface" aria-hidden="true" />
          <span className="bois-verify-button-label">
            <span>
              <svg className="tournament-card-cta-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M6 0A5.999 5.999 0 00.002 6v5.252a.75.75 0 00.75.748H5.25a.748.748 0 00.75-.747V6.749C6 6.334 6.336 6 6.748 6h16.497a.748.748 0 00.749-.748V.749A.743.743 0 0023.247 0zm12.75 12a.748.748 0 00-.75.75v4.5a.748.748 0 01-.747.748H.753a.754.754 0 00-.75.751v4.5a.75.75 0 00.75.751H18a5.999 5.999 0 005.999-6v-5.25a.75.75 0 00-.75-.75z"
                />
              </svg>
              Ver en start.gg
            </span>
          </span>
        </a>
      </div>
    </article>
  );
}

export default TournamentCard;
