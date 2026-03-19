import { useReveal, fmtPrice } from './themeUtils';

export default function CinemaProfile({ artist, artworks }) {
  const ref = useReveal();
  const mainArt = artworks[0];
  return (
    <div className="preset-cinema" ref={ref}>
      <div className="p-scratch" />
      <div className="p-letterbox-top" />
      <div className="p-letterbox-bottom" />
      <div className="p-hero">
        {mainArt?.image_url && (
          <div className="p-hero-bg">
            <img src={mainArt.image_url} alt="" />
          </div>
        )}
        <div className="p-hero-content">
          <p className="p-hero-tag">Une vie en images · {artist.location || 'Cinéma'}</p>
          <h1 className="p-hero-name">{artist.name}</h1>
          <p className="p-hero-bio">{artist.bio || 'La lumière comme matière première.'}</p>
          <div className="p-hero-meta">
            <span><strong>{artworks.length}</strong>Œuvres</span>
            {artworks.filter(a => a.available).length > 0 && (
              <span><strong>{artworks.filter(a => a.available).length}</strong>Disponibles</span>
            )}
          </div>
        </div>
      </div>
      <div className="p-section">
        <h2 className="p-section-title p-reveal">La Collection</h2>
        <div className="p-artworks">
          {artworks.map((a, i) => (
            <div key={a.id} className={`p-artwork p-reveal p-reveal-delay-${Math.min(i,3)}`}>
              <div className="p-artwork-img"><img src={a.image_url} alt={a.title} /></div>
              <div className="p-artwork-info">
                <p className="p-artwork-title">{a.title}</p>
                {a.price && <p className="p-artwork-price">{fmtPrice(a.price)}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
