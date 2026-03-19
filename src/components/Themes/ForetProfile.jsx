import { useReveal, fmtPrice } from './themeUtils';

export default function ForetProfile({ artist, artworks }) {
  const ref = useReveal();
  const mainArt = artworks[0];
  return (
    <div className="preset-foret" ref={ref}>
      <div className="p-hero">
        {mainArt?.image_url && (
          <div className="p-hero-bg"><img src={mainArt.image_url} alt="" /></div>
        )}
        <div className="p-hero-content">
          <p className="p-hero-tag">{artist.location || 'Nature · Art'}</p>
          <h1 className="p-hero-name">{artist.name}</h1>
          <p className="p-hero-bio">{artist.bio || "L\u2019art comme territoire vivant."}</p>
          <button className="p-btn-primary">Explorer la collection</button>
        </div>
      </div>
      <div className="p-section">
        <p className="p-section-eyebrow p-reveal">Œuvres</p>
        <div className="p-artworks">
          {artworks.map((a, i) => (
            <div key={a.id} className={`p-artwork p-reveal p-reveal-delay-${Math.min(i,3)}`}>
              <div className="p-artwork-img"><img src={a.image_url} alt={a.title} /></div>
              <div className="p-artwork-info">
                <span className="p-artwork-title">{a.title}</span>
                <span className="p-artwork-meta">{a.medium} · {a.year || '—'}</span>
                {a.price && <span className="p-artwork-price">{fmtPrice(a.price)}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
