import { useReveal, fmtPrice } from './themeUtils';

export default function NuitProfile({ artist, artworks }) {
  const ref = useReveal();
  const mainArt = artworks[0];
  return (
    <div className="preset-nuit" ref={ref}>
      <div className="p-hero">
        {mainArt?.image_url && (
          <div className="p-hero-img">
            <img src={mainArt.image_url} alt={mainArt.title} />
          </div>
        )}
        <p className="p-hero-tag">artist.portfolio // v2026</p>
        <h1 className="p-hero-name">{artist.name}</h1>
        <div className="p-hero-bio-wrap">
          <p className="p-hero-bio">{(artist.bio || 'Digital artist, exploring the boundaries.').slice(0, 80)}</p>
        </div>
        <div className="p-hero-cta">
          <button className="p-btn-neon">Voir les œuvres</button>
          {artist.instagram && <button className="p-btn-neon" style={{ '--card-accent': 'var(--p-accent2)' }}>@{artist.instagram}</button>}
        </div>
      </div>
      <div className="p-section">
        <h2 className="p-section-title p-reveal">// collection</h2>
        <div className="p-artworks">
          {artworks.map((a, i) => (
            <div key={a.id} className={`p-artwork p-reveal p-reveal-delay-${Math.min(i,3)}`} style={{ '--i': i }}>
              <img src={a.image_url} alt={a.title} />
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
