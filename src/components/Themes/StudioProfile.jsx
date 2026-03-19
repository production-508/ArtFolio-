import { useReveal, fmtPrice } from './themeUtils';

export default function StudioProfile({ artist, artworks }) {
  const ref = useReveal();
  const mainArt = artworks[0];
  const nameParts = (artist.name || '').split(' ');
  return (
    <div className="preset-studio" ref={ref}>
      <div className="p-hero">
        <div className="p-hero-left">
          <p className="p-hero-tag">Studio · {new Date().getFullYear()}</p>
          <h1 className="p-hero-name">
            <span style={{ fontWeight: 300 }}>{nameParts[0]}</span>
            {nameParts.length > 1 && <><br /><span style={{ fontWeight: 600 }}>{nameParts.slice(1).join(' ')}</span></>}
          </h1>
          <p className="p-hero-bio">{artist.bio || 'Design contemporain, formes épurées.'}</p>
          {artist.location && <p className="p-hero-meta-item" style={{ marginTop: 12 }}>📍 {artist.location}</p>}
        </div>
        {mainArt?.image_url && (
          <div className="p-hero-img"><img src={mainArt.image_url} alt={mainArt.title} /></div>
        )}
      </div>
      <div className="p-section">
        <div className="p-studio-head p-reveal">
          <h2 className="p-section-title">Œuvres</h2>
          <span style={{ fontSize: '13px', opacity: 0.5 }}>{artworks.length} pièces</span>
        </div>
        <div className="p-artworks p-artworks-studio">
          {artworks.map((a, i) => (
            <div key={a.id} className={`p-artwork p-reveal p-reveal-delay-${Math.min(i,3)}`}>
              <div className="p-artwork-img"><img src={a.image_url} alt={a.title} /></div>
              <div className="p-artwork-info">
                <span className="p-artwork-title">{a.title}</span>
                <span className="p-artwork-meta">{a.medium} {a.year ? `· ${a.year}` : ''}</span>
                {a.price && <span className="p-artwork-price">{fmtPrice(a.price)}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
