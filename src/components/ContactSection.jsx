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
                Nos puedes contactar a través de WhatsApp para resolver dudas,
                enviarnos feedback o unirte a nuestros próximos torneos.
              </p>

              <a
                className="contact-whatsapp-info"
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noreferrer"
              >
                <span className="contact-icon">
                  <i className="fi fi-brands-whatsapp" />
                </span>
                <span>
                  <strong>WhatsApp</strong>
                  <br />
                  +58 412-3517716
                </span>
              </a>
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
