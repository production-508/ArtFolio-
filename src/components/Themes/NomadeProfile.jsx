import { useReveal, fmtPrice } from './themeUtils';

export default function NomadeProfile({ artist, artworks }) {
  const ref = useReveal();
  const mainArt = artworks[0];
  return (
    <div className="preset-nomade" ref={ref}>
      <div className="p-hero">
        <div className="p-hero-blob" />
        <div className="p-hero-content">
          <p className="p-hero-tag">{artist.location || 'Artiste'}</p>
          <h1 className="p-hero-name">{artist.name}</h1>
          <p className="p-hero-bio">{artist.bio || 'Art organique, formes vivantes.'}</p>
          <div className="p-hero-cta" style={{ marginTop: 36, display: 'flex', gap: 12 }}>
            <button style={{ padding: '12px 28px', background: 'var(--p-accent)', color: '#fff', border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: 500 }}>
              Explorer →
            </button>
          </div>
        </div>
        {mainArt?.image_url && (
          <div className="p-hero-img-wrap">
            <div className="p-hero-img">
              <img src={mainArt.image_url} alt={mainArt.title} />
            </div>
            <div className="p-hero-img-accent" />
          </div>
        )}
      </div>
      <div className="p-section">
        <h2 className="p-section-title p-reveal">Œuvres</h2>
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
