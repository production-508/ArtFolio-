import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './Artists.css';

export default function Artists() {
  const { apiFetch } = useAuth();
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    let active = true;
    apiFetch('/artists')
      .then(res => {
        if (active) {
          setArtists(res.artists || []);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error("Erreur chargement artistes:", err);
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [apiFetch]);

  // Filtrage basique (tous vs artistes avec oeuvres)
  const filteredArtists = artists.filter(a => {
    if (filter === 'active') return a.artwork_count > 0;
    return true;
  });

  return (
    <div className="page artists-page">
      <div className="artists-header">
        <div className="container">
          <h1 className="display-title">Nos Artistes</h1>
          <p className="subtitle">Découvrez les talents exceptionnels de notre galerie.</p>
        </div>
      </div>

      <div className="container artists-container">
        {/* Navigation des filtres rapides */}
        <div className="artists-filters">
          <button 
            className={`artist-filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Tous les artistes
          </button>
          <button 
            className={`artist-filter-btn ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Collections actives
          </button>
        </div>

        {loading ? (
          <div className="artists-loading">
            <div className="spinner"></div>
            <p>Chargement du répertoire...</p>
          </div>
        ) : filteredArtists.length === 0 ? (
          <div className="artists-empty">
            <span className="artists-empty-icon">👥</span>
            <h3>Aucun artiste trouvé</h3>
            <p>Le répertoire est actuellement vide ou la recherche ne donne aucun résultat.</p>
          </div>
        ) : (
          <div className="artists-grid">
            {filteredArtists.map((artist, i) => (
              <Link 
                to={`/artiste/${artist.id}`} 
                key={artist.id} 
                className="artist-card"
                style={{ animationDelay: `${Math.min(i * 0.05, 0.4)}s` }}
              >
                {/* En-tête de la carte */}
                <div className="artist-card-head">
                  <div className="artist-card-avatar">
                    {artist.avatar_url ? (
                      <img src={artist.avatar_url} alt={artist.name} />
                    ) : (
                      <div className="artist-avatar-placeholder">
                        {artist.name ? artist.name.charAt(0).toUpperCase() : '?'}
                      </div>
                    )}
                  </div>
                  <div className="artist-card-info">
                    <h3 className="artist-card-name">{artist.name}</h3>
                    <div className="artist-card-meta">
                      {artist.location && <span className="artist-location">📍 {artist.location}</span>}
                    </div>
                  </div>
                </div>

                {/* Tags de style générés par l'IA */}
                {artist.ai_style_tags && artist.ai_style_tags.length > 0 && (
                  <div className="artist-card-tags">
                    {artist.ai_style_tags.slice(0, 3).map(tag => (
                      <span key={tag} className="artist-tag">{tag}</span>
                    ))}
                  </div>
                )}

                {/* Bio abrégée (fallback sur IA si pas de bio manuelle) */}
                <p className="artist-card-bio">
                  {artist.bio ? artist.bio : 
                   (artist.ai_bio ? artist.ai_bio.substring(0, 100) + '...' : 'Découvrez le portfolio de cet artiste.')}
                </p>

                {/* Prévisualisation des œuvres (les 3 dernières) */}
                {artist.preview_artworks && artist.preview_artworks.length > 0 ? (
                  <div className="artist-card-artworks">
                    {artist.preview_artworks.map((art, idx) => (
                      <div key={art.id} className="artist-card-art-img">
                        {art.image_url ? (
                          <img src={art.image_url} alt={art.title} loading="lazy" />
                        ) : (
                          <div className="art-placeholder">🖼️</div>
                        )}
                      </div>
                    ))}
                    {/* Si moins de 3 œuvres, on comble par des placeholders visuels discrets (optionnel) */}
                    {[...Array(Math.max(0, 3 - artist.preview_artworks.length))].map((_, idx) => (
                      <div key={`empty-${idx}`} className="artist-card-art-empty"></div>
                    ))}
                  </div>
                ) : (
                  <div className="artist-card-artworks-empty">
                    <p>Aucune œuvre publiée pour le moment.</p>
                  </div>
                )}

                {/* Footer de la carte */}
                <div className="artist-card-footer">
                  <span className="artist-artwork-count">
                    {artist.artwork_count} œuvre{artist.artwork_count > 1 ? 's' : ''}
                  </span>
                  <span className="artist-btn-explore">Explorer le portfolio →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
