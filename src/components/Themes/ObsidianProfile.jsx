import { useReveal, fmtPrice } from './themeUtils';

export default function ObsidianProfile({ artist, artworks }) {
  const ref = useReveal();
  const mainArt = artworks[0];
  return (
    <div className="preset-obsidian" ref={ref}>
      <div className="p-hero">
        <div className="p-hero-left">
          <p className="p-hero-tag">Portfolio · {artist.location || 'Artiste'}</p>
          <div>
            <h1 className="p-hero-name">
              <span>{(artist.name || '').split(' ')[0]}</span>
              <br />
              {(artist.name || '').split(' ').slice(1).join(' ')}
            </h1>
            <p className="p-hero-bio">{artist.bio || 'Artiste contemporain explorant les frontières du sensible.'}</p>
          </div>
          <div className="p-hero-cta">
            <button className="p-btn-primary">Explorer les œuvres</button>
            {artist.instagram && <button className="p-btn-ghost">@{artist.instagram}</button>}
          </div>
        </div>
        {mainArt?.image_url && (
          <div className="p-hero-img">
            <img src={mainArt.image_url} alt={mainArt.title} />
          </div>
        )}
      </div>
      <div className="p-section">
        <p className="p-section-eyebrow p-reveal">Œuvres</p>
        <h2 className="p-section-title p-reveal p-reveal-delay-1">Collection</h2>
        <div className="p-artworks">
          {artworks.map((a, i) => (
            <div key={a.id} className={`p-artwork p-reveal p-reveal-delay-${Math.min(i+1,4)}`}>
              <img src={a.image_url} alt={a.title} />
              <div className="p-artwork-info">
                <span className="p-artwork-title">{a.title}</span>
                <span className="p-artwork-price">{fmtPrice(a.price) || a.medium}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
