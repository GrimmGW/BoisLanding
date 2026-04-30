import HeroNavbar from "./HeroNavbar";
import boisRoyImage from "../../assets/images/bois-Roy.png";

function HeroSection() {
  return (
    <section id="inicio" className="hero is-fullheight bois-hero bois-hero-has-nav">
      <HeroNavbar />
      <div className="hero-body">
        <div className="container">
          <div className="columns is-vcentered is-variable is-6">
            <div className="column is-6-tablet is-6-desktop">
              <p className="bois-kicker">BoisGang / Platform-Fighters Esports</p>
              <h1 className="title is-1 bois-title">BOISGANG</h1>
              <p className="subtitle is-5 bois-copy">
                Equipo de esports de platform-fighters enfocado en crear los mejores
                eventos de videojuegos en la Isla de Margarita, Venezuela.
              </p>

              <div className="bois-hero-actions mt-5">
                <a className="button is-medium has-text-weight-bold bois-hero-primary-button" href="#torneos">
                  Ver proximos torneos
                </a>

                <div className="bois-hero-icon-buttons" aria-label="Redes sociales">
                  <a className="bois-hero-icon-button" href="#" aria-label="Facebook">
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden focusable="false">
                      <path
                        fill="currentColor"
                        d="M13.5 21v-8.2h2.7l.4-3.2h-3.1V7.6c0-.9.3-1.6 1.6-1.6h1.7V3.1c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H8.4v3.2h2.3V21z"
                      />
                    </svg>
                  </a>
                  <a className="bois-hero-icon-button" href="#" aria-label="Instagram">
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden focusable="false">
                      <path
                        fill="currentColor"
                        d="M12 2.2c3.2 0 3.6 0 4.8.1 3 .1 4.6 1.7 4.7 4.7.1 1.2.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3-1.7 4.6-4.7 4.7-1.2.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-3-.1-4.6-1.7-4.7-4.7-.1-1.2-.1-1.6-.1-4.8s0-3.6.1-4.8c.1-3 1.7-4.6 4.7-4.7 1.2-.1 1.6-.1 4.8-.1m0-2.2C8.7 0 8.3 0 7.1.1 2.8.3.3 2.8.1 7.1 0 8.3 0 8.7 0 12s0 3.7.1 4.9c.2 4.3 2.7 6.8 7 7 1.2.1 1.6.1 4.9.1s3.7 0 4.9-.1c4.3-.2 6.8-2.7 7-7 .1-1.2.1-1.6.1-4.9s0-3.7-.1-4.9c-.2-4.3-2.7-6.8-7-7C15.7 0 15.3 0 12 0m0 5.8A6.2 6.2 0 1 0 12 18.2 6.2 6.2 0 0 0 12 5.8m0 10.2a4 4 0 1 1 0-8.1 4 4 0 0 1 0 8.1m6.4-11.9a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8"
                      />
                    </svg>
                  </a>
                  <a className="bois-hero-icon-button" href="#" aria-label="YouTube">
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden focusable="false">
                      <path
                        fill="currentColor"
                        d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8M9.6 15.6V8.4l6.3 3.6z"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            <div className="column is-6-tablet is-6-desktop bois-hero-visual-column">
              <figure className="image">
                <img
                  className="bois-hero-roy-image"
                  src={boisRoyImage}
                  alt="Roy personalizado de BoisGang"
                  loading="lazy"
                />
              </figure>
            </div>
          </div>
        </div>
      </div>
      <a className="bois-scroll-cue" href="#torneos" aria-label="Bajar a torneos">
        <i className="fi fi-br-angle-down" />
      </a>
    </section>
  );
}

export default HeroSection;
