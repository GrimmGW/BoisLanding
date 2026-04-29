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
              Entrar a Telegram
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
