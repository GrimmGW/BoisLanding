import { useMemo, useState } from "react";

const WHATSAPP_NUMBER = "584123517716";

function ContactSection() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");

  const isFormValid = useMemo(() => {
    const hasName = name.trim().length > 0;
    const hasUsername = username.trim().length > 0;
    const wordCount = message.trim().split(/\s+/).filter(Boolean).length;
    return hasName && hasUsername && wordCount >= 3;
  }, [message, name, username]);

  function openWhatsApp() {
    if (!isFormValid) return;

    const formattedMessage = `¡Hola! Mi nombre es ${name.trim()} (${username.trim()}),\n\n${message.trim()}`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(formattedMessage)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <section id="contacto" className="section contact-section">
      <div className="container">
        <div className="contact-shell">
          <div className="columns is-variable is-6 is-vcentered">
            <div className="column is-5-desktop">
              <p className="contact-kicker">Estamos para ayudarte</p>
              <h2 className="title is-2 contact-title">Contáctanos</h2>
              <p className="contact-copy">
                Nos puedes contactar a través de WhatsApp o nuestro correo para resolver dudas,
                enviarnos feedback o unirte a nuestros próximos torneos.
              </p>

              <div className="contact-links-row">
                <a
                  className="contact-whatsapp-info"
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="contact-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      aria-hidden
                      focusable="false"
                    >
                      <path
                        fill="currentColor"
                        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.149-.198.297-.768.967-.941 1.164-.173.198-.347.223-.644.075-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.148-.669-1.612-.916-2.206-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.718 2.006-1.412.248-.694.248-1.289.173-1.412-.074-.124-.272-.198-.57-.347M12.004 2.003c-5.514 0-9.98 4.466-9.98 9.98 0 1.753.459 3.466 1.329 4.97L2 22l5.163-1.354a9.947 9.947 0 0 0 4.84 1.251h.004c5.512 0 9.989-4.466 9.989-9.98s-4.477-9.914-9.99-9.914"
                      />
                    </svg>
                  </span>
                  <span>
                    <strong>WhatsApp</strong>
                    <br />
                    +58 412-3517716
                  </span>
                </a>

                <hr className="contact-divider" />

                <a className="contact-whatsapp-info contact-email-info" href="mailto:bois.oficial@gmail.com">
                  <span className="contact-icon contact-email-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      aria-hidden
                      focusable="false"
                    >
                      <path
                        fill="currentColor"
                        d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2m-.4 2L12 11.25 4.4 6zM4 18V8.2l7.4 5.1a1 1 0 0 0 1.2 0L20 8.2V18z"
                      />
                    </svg>
                  </span>
                  <span>
                    <strong>Correo</strong>
                    <br />
                    bois.oficial@gmail.com
                  </span>
                </a>
              </div>
            </div>

            <div className="column is-7-desktop">
              <div className="contact-form-card">
                <div className="field">
                  <label className="label">Nombre</label>
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      placeholder="Tu nombre"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="label">Usuario</label>
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      placeholder="Nickname / Tag / Gamertag"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="label">Mensaje</label>
                  <div className="control">
                    <textarea
                      className="textarea"
                      placeholder="Escribe tu mensaje (mínimo 3 palabras)"
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      rows={4}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className="button contact-whatsapp-button"
                  disabled={!isFormValid}
                  onClick={openWhatsApp}
                >
                  <span>Ir a WhatsApp</span>
                  <i className="fi fi-br-arrow-up-right" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
