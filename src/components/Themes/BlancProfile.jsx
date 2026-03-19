import { useReveal, fmtPrice } from './themeUtils';

export default function BlancProfile({ artist, artworks }) {
  const ref = useReveal();
  const mainArt = artworks[0];
  return (
    <div className="preset-blanc" ref={ref}>
      <div className="p-hero">
        {mainArt?.image_url && <div className="p-hero-bg-img"><img src={mainArt.image_url} alt="" /></div>}
        <p className="p-hero-number">Portfolio — 2026</p>
        <h1 className="p-hero-name">
          <span className="p-hero-name-inner">{artist.name}</span>
        </h1>
        <div className="p-hero-divider" />
        <div className="p-hero-meta">
          {artist.location && <div className="p-hero-meta-item">Basé à<strong>{artist.location}</strong></div>}
          <div className="p-hero-meta-item">Œuvres<strong>{artworks.length}</strong></div>
          {artist.medium && <div className="p-hero-meta-item">Médium<strong>{artist.medium || 'Mixte'}</strong></div>}
        </div>
      </div>
      {artist.bio && (
        <div className="p-section" style={{ borderTop: '1px solid var(--p-border)' }}>
          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: 'clamp(1.2rem,2.5vw,2rem)', lineHeight: 1.6, maxWidth: '700px', color: 'var(--p-text)', opacity: 0 }} className="p-reveal">
            {artist.bio}
          </p>
        </div>
      )}
      <div className="p-section">
        <h2 className="p-section-title p-reveal">Œuvres</h2>
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
