function HeroSection() {
  return (
    <section className="hero is-fullheight-with-navbar bois-hero">
      <div className="hero-body">
        <div className="container">
          <div className="columns is-vcentered is-variable is-6">
            <div className="column is-6-tablet is-6-desktop">
              <p className="bois-kicker">BoisGang / Platform-Fighters Esports</p>
              <h1 className="title is-1 bois-title">BoisGang</h1>
              <p className="subtitle is-5 bois-copy">
                Equipo de esports de platform-fighters enfocado en crear los mejores
                eventos de videojuegos en la Isla de Margarita, Venezuela.
              </p>
              <p className="bois-slogan">"Nos vemos en brackets"</p>
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
