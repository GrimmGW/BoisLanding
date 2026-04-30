import smashMargaritaLogo from "../../assets/images/Smash_MargaritaLogo.jpg";
import boisLogotipo from "../../assets/images/BoisLogotipo.png";

function FooterSection() {
  return (
    <footer className="footer bois-footer">
      <div className="container">
        <div className="footer-telegram-card">
          <div className="footer-telegram-content">
            <p className="footer-telegram-kicker">Comunidad oficial</p>
            <h3 className="title is-3 footer-telegram-title">Smash Margarita+</h3>
            <p className="footer-telegram-copy">
              Un grupo donde conocerás todas las novedades de los fighting-games en la
              Isla de Margarita, chat con más de 100 miembros, y las redes sociales de
              BoisGang y demás organizadores.
            </p>
          </div>

          <div className="footer-telegram-cta">
            <figure className="image footer-telegram-icon">
              <img
                src={smashMargaritaLogo}
                alt="Icono de la comunidad Smash Margarita+"
                loading="lazy"
              />
            </figure>
            <a
              className="button is-medium footer-telegram-button"
              href="https://t.me/+s0xMk0mtTn01Yjc5"
              target="_blank"
              rel="noreferrer"
            >
              Ir a Telegram
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                aria-hidden
                focusable="false"
              >
                <path
                  fill="currentColor"
                  d="M9.04 15.47 8.66 20.8c.54 0 .78-.23 1.06-.51l2.53-2.42 5.25 3.84c.96.53 1.64.25 1.9-.89l3.44-16.11h.01c.3-1.4-.5-1.95-1.43-1.6L1.19 10.58c-1.38.54-1.36 1.31-.23 1.66l5.17 1.61L18.13 6.3c.56-.37 1.07-.16.65.21"
                />
              </svg>
            </a>
          </div>
        </div>

        <div className="footer-bottom-grid">
          <div className="footer-brand">
            <figure className="image footer-brand-logo">
              <img
                src={boisLogotipo}
                alt="Logo BoisGang"
                loading="lazy"
              />
            </figure>
          </div>

          <div className="footer-links-placeholder">
            <div>
              <p className="footer-placeholder-title">Próximamente</p>
              <p className="footer-placeholder-item">Calendario oficial</p>
              <p className="footer-placeholder-item">Resultados y rankings</p>
            </div>
            <div>
              <p className="footer-placeholder-title">Recursos</p>
              <p className="footer-placeholder-item">Guía de torneos</p>
              <p className="footer-placeholder-item">Reglamento</p>
            </div>
            <div>
              <p className="footer-placeholder-title">Contacto</p>
              <p className="footer-placeholder-item">BoisGang Team</p>
              <p className="footer-placeholder-item">Más canales pronto</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default FooterSection;
