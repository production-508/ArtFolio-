import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './Gallery.css';

// Options de filtres
const MEDIUMS = ['Peinture', 'Sculpture', 'Photographie', 'Dessin', 'Digital', 'Mixte'];
const STYLES = ['Abstrait', 'Figuratif', 'Contemporain', 'Minimaliste', 'Street Art', 'Pop Art', 'Conceptuel', 'Surréalisme', 'Expressionnisme'];

function fmtPrice(p) {
  if (!p && p !== 0) return '—';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(p);
}

export default function Gallery() {
  const { apiFetch } = useAuth();
  
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // État des filtres
  const [filters, setFilters] = useState({
    search: '',
    medium: '',
    style: '',
    maxPrice: '',
    available: true // Par défaut, on montre ce qui est en vente
  });

  // Charger les œuvres
  useEffect(() => {
    let active = true;
    setLoading(true);
    
    // Construire l'URL avec les filtres
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.medium) params.append('medium', filters.medium);
    if (filters.style) params.append('style', filters.style);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.available) params.append('available', 'true');

    apiFetch(`/gallery?${params.toString()}`)
      .then(res => {
        if (active) {
          setArtworks(res.artworks || []);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error("Erreur chargement galerie:", err);
        if (active) setLoading(false);
      });
      
    return () => { active = false; };
  }, [apiFetch, filters]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const clearFilters = () => {
    setFilters({ search: '', medium: '', style: '', maxPrice: '', available: false });
  };

  const activeFiltersCount = Object.entries(filters).filter(([k, v]) => {
    if (k === 'available') return v === true;
    return v !== '';
  }).length;

  return (
    <div className="page gallery-page">
      <div className="gallery-header">
        <div className="container">
          <h1 className="display-title">Collection</h1>
          <p className="subtitle">Découvrez des œuvres uniques d'artistes contemporains</p>
        </div>
      </div>

      <div className="container gallery-container">
        {/* Barre de filtres horizontale */}
        <div className="gallery-filters-bar">
          <div className="filter-search-wrap">
            <span className="filter-icon">🔍</span>
            <input 
              type="text" 
              name="search"
              placeholder="Rechercher une œuvre, un artiste..." 
              value={filters.search}
              onChange={handleChange}
              className="filter-search-input"
            />
          </div>

          <div className="filter-selects">
            <select name="medium" value={filters.medium} onChange={handleChange} className="filter-select">
              <option value="">Tous les médiums</option>
              {MEDIUMS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>

            <select name="style" value={filters.style} onChange={handleChange} className="filter-select">
              <option value="">Tous les styles</option>
              {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select name="maxPrice" value={filters.maxPrice} onChange={handleChange} className="filter-select">
              <option value="">Tous les prix</option>
              <option value="500">Moins de 500 €</option>
              <option value="1000">Moins de 1 000 €</option>
              <option value="5000">Moins de 5 000 €</option>
              <option value="10000">Moins de 10 000 €</option>
            </select>

            <label className="filter-checkbox">
              <input 
                type="checkbox" 
                name="available" 
                checked={filters.available} 
                onChange={handleChange} 
              />
              <span className="checkbox-custom"></span>
              En vente uniquement
            </label>

            {activeFiltersCount > 0 && (
              <button className="btn-clear-filters" onClick={clearFilters}>
                Effacer ({activeFiltersCount})
              </button>
            )}
          </div>
        </div>

        {/* Grille d'œuvres */}
        {loading ? (
          <div className="gallery-loading">
            <div className="spinner"></div>
            <p>Chargement de la collection...</p>
          </div>
        ) : artworks.length === 0 ? (
          <div className="gallery-empty">
            <span className="gallery-empty-icon">🎨</span>
            <h3>Aucune œuvre trouvée</h3>
            <p>Essayez de modifier vos filtres pour voir plus de résultats.</p>
            <button className="btn btn-outline" onClick={clearFilters}>Réinitialiser les filtres</button>
          </div>
        ) : (
          <div className="gallery-grid">
            {artworks.map((a, i) => (
              <Link 
                to={`/artiste/${a.artist_id}`} 
                key={a.id} 
                className="gallery-item"
                style={{ animationDelay: `${Math.min(i * 0.05, 0.5)}s` }}
              >
                <div className="gallery-item-img-wrap">
                  {a.image_url ? (
                    <img src={a.image_url} alt={a.title} className="gallery-item-img" loading="lazy" />
                  ) : (
                    <div className="gallery-item-placeholder">Sans image</div>
                  )}
                  {a.available === 0 && (
                    <div className="gallery-badge-sold">Vendue</div>
                  )}
                </div>
                <div className="gallery-item-info">
                  <div className="gallery-item-head">
                    <h3 className="gallery-item-title">{a.title}</h3>
                    <span className="gallery-item-price">{fmtPrice(a.price)}</span>
                  </div>
                  <div className="gallery-item-artist">
                    <span>Par <strong className="gallery-artist-name">{a.artist_name || 'Artiste'}</strong></span>
                  </div>
                  <div className="gallery-item-meta">
                    {a.medium} {a.year ? `· ${a.year}` : ''}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
