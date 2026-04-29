import { useEffect, useState } from "react";
import HeroNavbar from "./HeroNavbar";

const SLOGAN = "\u201cNos vemos en Brackets\u201d";

function HeroSection() {
  const [sloganLen, setSloganLen] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setSloganLen(SLOGAN.length);
      return undefined;
    }
    let i = 0;
    const tick = () => {
      i += 1;
      setSloganLen(i);
      if (i >= SLOGAN.length) {
        window.clearInterval(id);
      }
    };
    const id = window.setInterval(tick, 45);
    return () => window.clearInterval(id);
  }, []);

  const visibleSlogan = SLOGAN.slice(0, sloganLen);
  const sloganDone = sloganLen >= SLOGAN.length;

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
              <p className="bois-slogan" aria-label={SLOGAN}>
                {visibleSlogan}
                {!sloganDone ? (
                  <span className="bois-typewriter-cursor" aria-hidden />
                ) : null}
              </p>
              <div className="buttons mt-5">
                <a className="button is-light is-medium has-text-weight-bold" href="#torneos">
                  Ver próximos torneos
                </a>
              </div>
            </div>

            <div className="column is-6-tablet is-6-desktop">
              <figure className="image bois-placeholder-frame">
                <img
                  className="bois-placeholder"
                  src="https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&w=900&q=80"
                  alt="Placeholder de personaje para hero de BoisGang"
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
