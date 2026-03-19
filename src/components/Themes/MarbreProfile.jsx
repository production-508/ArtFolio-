import { useReveal, fmtPrice } from './themeUtils';

export default function MarbreProfile({ artist, artworks }) {
  const ref = useReveal();
  const mainArt = artworks[0];
  return (
    <div className="preset-marbre" ref={ref}>
      <div className="p-hero">
        {mainArt?.image_url && (
          <div className="p-hero-img"><img src={mainArt.image_url} alt={mainArt.title} /></div>
        )}
        <div className="p-hero-content">
          <p className="p-hero-tag">Portfolio · {artist.location || 'Artiste'}</p>
          <h1 className="p-hero-name">{artist.name}</h1>
          <div className="p-hero-divider" />
          <p className="p-hero-bio">{artist.bio || 'Sculpteur explorant la forme et la matière.'}</p>
          <div className="p-hero-cta">
            <button className="p-btn-primary">Découvrir les œuvres</button>
            {artist.instagram && <button className="p-btn-ghost">@{artist.instagram}</button>}
          </div>
        </div>
      </div>
      <div className="p-section">
        <p className="p-section-eyebrow p-reveal">Collection</p>
        <h2 className="p-section-title p-reveal p-reveal-delay-1">Sculptures</h2>
        <div className="p-artworks p-artworks-masonry">
          {artworks.map((a, i) => (
            <div key={a.id} className={`p-artwork p-reveal p-reveal-delay-${Math.min(i+1,4)}`}>
              <div className="p-artwork-img"><img src={a.image_url} alt={a.title} /></div>
              <div className="p-artwork-info">
                <span className="p-artwork-title">{a.title}</span>
                {a.price && <span className="p-artwork-price">{fmtPrice(a.price)}</span>}
                {a.dimensions && <span className="p-artwork-meta">{a.dimensions}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
