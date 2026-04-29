const galleryImages = [
  {
    id: 1,
    alt: "Competidor celebrando victoria",
    src: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1400&q=80"
  },
  {
    id: 2,
    alt: "Set de torneos con jugadores",
    src: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1400&q=80"
  },
  {
    id: 3,
    alt: "Escenario principal de eSports",
    src: "https://images.unsplash.com/photo-1580327344181-c1163234e5a0?auto=format&fit=crop&w=1400&q=80"
  }
];

function GallerySection() {
  return (
    <section id="galeria" className="section">
      <div className="container">
        <h2 className="title is-2">Galería</h2>
        <p className="subtitle is-5 has-text-grey">
          Algunos momentos destacados de nuestros eventos.
        </p>
        <div className="columns is-multiline">
          {galleryImages.map((image) => (
            <div className="column is-one-third-desktop is-half-tablet" key={image.id}>
              <figure className="image is-4by3 gallery-image">
                <img src={image.src} alt={image.alt} loading="lazy" />
              </figure>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default GallerySection;
