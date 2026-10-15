import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { faBell as faBellOutline } from "@fortawesome/free-regular-svg-icons";
import { useNotifications } from "../notifications/NotificationsContext.jsx";

const CLOSE_MS = 260;

function promptCopy({ support, permission, subscribed }) {
  if (support === "ios-install") {
    return {
      title: "Instala nuestra página",
      body: "En iPhone, las notificaciones solo funcionan con la página instalada. Toca Compartir, elige \"Agregar a pantalla de inicio\" y luego abre BoisGang desde el ícono para activarlas.",
      mode: "info",
    };
  }
  if (subscribed) {
    return {
      title: "Notificaciones activadas",
      body: "Tranqui, cuando haya un nuevo torneo te lo haremos saber.",
      mode: "subscribed",
    };
  }
  if (permission === "denied") {
    return {
      title: "Notificaciones bloqueadas",
      body: "Tu navegador bloqueó las notificaciones de esta página. Toca el candado junto a la URL, permite las notificaciones y recarga la página.",
      mode: "info",
    };
  }
  return {
    title: "¿Te avisamos de los próximos torneos?",
    body: "Activa las notificaciones para que no te pierdas de ningún torneo en Margarita.",
    mode: "ask",
  };
}

function NotificationPrompt() {
  const notifications = useNotifications();
  const { promptOpen, closePrompt, subscribe, unsubscribe, busy, error, subscribed } = notifications;
  const [mounted, setMounted] = useState(promptOpen);

  useEffect(() => {
    if (promptOpen) {
      setMounted(true);
      return undefined;
    }
    if (!mounted) return undefined;
    const id = window.setTimeout(() => setMounted(false), CLOSE_MS);
    return () => window.clearTimeout(id);
  }, [promptOpen, mounted]);

  useEffect(() => {
    if (!promptOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") closePrompt();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [promptOpen, closePrompt]);

  if (!mounted) return null;

  const closing = !promptOpen;
  const copy = promptCopy(notifications);

  return (
    <div className={`bois-notify-backdrop${closing ? " bois-notify-backdrop--closing" : ""}`} onClick={closePrompt}>
      <div
        className={`bois-notify-panel${closing ? " bois-notify-panel--closing" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bois-notify-title"
        aria-describedby="bois-notify-body"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="bois-notify-icon" aria-hidden>
          <FontAwesomeIcon icon={subscribed ? faBell : faBellOutline} />
        </span>

        <h2 id="bois-notify-title" className="bois-notify-title">
          {copy.title}
        </h2>
        <p id="bois-notify-body" className="bois-notify-body">
          {copy.body}
        </p>

        {error ? (
          <p className="bois-notify-error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="bois-notify-actions">
          {copy.mode === "ask" ? (
            <>
              <button type="button" className="bois-notify-primary" onClick={subscribe} disabled={busy}>
                {busy ? "Activando..." : "Activar notificaciones"}
              </button>
              <button type="button" className="bois-notify-secondary" onClick={closePrompt} disabled={busy}>
                Ahora no
              </button>
            </>
          ) : null}

          {copy.mode === "subscribed" ? (
            <>
              <button type="button" className="bois-notify-secondary" onClick={unsubscribe} disabled={busy}>
                {busy ? "Desactivando..." : "Desactivar"}
              </button>
              <button type="button" className="bois-notify-primary" onClick={closePrompt} disabled={busy}>
                Cerrar
              </button>
            </>
          ) : null}

          {copy.mode === "info" ? (
            <button type="button" className="bois-notify-primary" onClick={closePrompt}>
              Entendido
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default NotificationPrompt;
