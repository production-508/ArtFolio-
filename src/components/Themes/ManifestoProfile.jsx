import { useReveal, fmtPrice } from './themeUtils';

export default function ManifestoProfile({ artist, artworks }) {
  const ref = useReveal();
  const mainArt = artworks[0];
  const nameParts = (artist.name || '').split(' ');
  return (
    <div className="preset-manifesto" ref={ref}>
      <div className="p-hero">
        <h1 className="p-hero-name">
          <span className="p-hero-name-glitch" data-text={nameParts[0]}>{nameParts[0]}</span>
          <br />
          <span className="p-hero-name-glitch" data-text={nameParts.slice(1).join(' ')} style={{ WebkitTextStroke: '2px #121212', WebkitTextFillColor: 'transparent' }}>
            {nameParts.slice(1).join(' ')}
          </span>
        </h1>
        {mainArt?.image_url && (
          <div className="p-hero-img"><img src={mainArt.image_url} alt={mainArt?.title} /></div>
        )}
        <div className="p-hero-footer">
          <p className="p-hero-bio">{artist.bio?.slice(0, 120) || 'Artiste en rupture.'}</p>
          <p className="p-hero-scroll">Défiler ↓</p>
        </div>
      </div>
      <div className="p-section">
        <h2 className="p-section-title p-reveal">ŒUVRES</h2>
        <div className="p-artworks">
          {artworks.map((a, i) => (
            <div key={a.id} className={`p-artwork p-reveal p-reveal-delay-${Math.min(i,3)}`}>
              <img src={a.image_url} alt={a.title} />
              <div className="p-artwork-info">
                <p className="p-artwork-title">{a.title.toUpperCase()}</p>
                {a.price && <p style={{ fontWeight: 900, marginTop: 4 }}>{fmtPrice(a.price)}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
