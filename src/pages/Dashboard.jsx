import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './Dashboard.css';

function fmtPrice(p) {
  if (!p && p !== 0) return '—';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(p);
}

/* Ligne d'œuvre avec delete + disponibilité toggle */
function ArtworkRow({ artwork, onDelete, onToggle }) {
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);

  return (
    <div className={`dashboard-artwork-row${deleting ? ' deleting' : ''}`}>
      <div className="dashboard-artwork-thumb">
        {artwork.image_url
          ? <img src={artwork.image_url} alt={artwork.title} />
          : <div className="dashboard-artwork-thumb-placeholder">🖼️</div>}
      </div>
      <div className="dashboard-artwork-info">
        <p className="dashboard-artwork-title">{artwork.title}</p>
        <p className="dashboard-artwork-meta">{artwork.medium} · {artwork.year || '—'}</p>
        {artwork.dimensions && <p className="dashboard-artwork-dim">{artwork.dimensions}</p>}
      </div>
      <div className="dashboard-artwork-price">{fmtPrice(artwork.price)}</div>
      <span className={`dashboard-artwork-status ${artwork.available ? 'available' : 'sold'}`}>
        {artwork.available ? 'Disponible' : 'Vendue'}
      </span>
      <div className="dashboard-artwork-actions">
        <button
          className="dashboard-artwork-btn"
          title={artwork.available ? 'Marquer vendue' : 'Remettre en vente'}
          disabled={toggling}
          onClick={async () => { setToggling(true); await onToggle(artwork); setToggling(false); }}
        >
          {toggling ? '…' : artwork.available ? '🔒' : '✅'}
        </button>
        <button
          className="dashboard-artwork-btn dashboard-artwork-btn-del"
          title="Supprimer"
          disabled={deleting}
          onClick={async () => {
            if (!confirm(`Supprimer « ${artwork.title} » ? Cette action est irréversible.`)) return;
            setDeleting(true);
            await onDelete(artwork.id);
          }}
        >
          🗑
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, apiFetch, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats]       = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    Promise.all([
      apiFetch('/artist/stats'),
      apiFetch('/artist/artworks'),
    ]).then(([s, a]) => {
      setStats(s);
      setArtworks(Array.isArray(a) ? a : (a.artworks ?? []));
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [user, apiFetch, navigate]);

  const handleDelete = async (id) => {
    try {
      await apiFetch(`/artist/artworks/${id}`, { method: 'DELETE' });
      setArtworks(prev => prev.filter(a => a.id !== id));
      setStats(prev => prev ? { ...prev, artworks: prev.artworks - 1 } : prev);
    } catch (err) { console.error(err); }
  };

  const handleToggle = async (artwork) => {
    try {
      const updated = await apiFetch(`/artist/artworks/${artwork.id}`, {
        method: 'PUT',
        body: JSON.stringify({ available: !artwork.available }),
      });
      setArtworks(prev => prev.map(a => a.id === artwork.id ? (updated.artwork ?? { ...a, available: !a.available }) : a));
    } catch (err) { console.error(err); }
  };

  if (loading) return (
    <div className="page dashboard-loading">
      <div className="spinner"></div>
      <p>Chargement du tableau de bord…</p>
    </div>
  );

  return (
    <div className="page dashboard">
      <div className="container">
        {/* Header dashboard */}
        <div className="dashboard-header">
          <div>
            <p className="dashboard-greeting">Bonjour,</p>
            <h1 className="dashboard-name">{user?.name}</h1>
            <span className="tag tag-gold">Plan {user?.plan}</span>
          </div>
          <div className="dashboard-header-actions">
            <a
              href={`/artiste/preview?preset=${user?.preset || 'obsidian'}`}
              target="_blank" rel="noreferrer"
              className="btn btn-outline"
            >
              👁️ Ma page publique ↗
            </a>
            <Link to="/profile" className="btn btn-outline">✏️ Mon profil</Link>
            <Link to="/galerie/ajouter" className="btn btn-gold">+ Ajouter une œuvre</Link>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="dashboard-stats">
            {[
              { label: 'Œuvres',     value: stats.artworks  ?? 0, icon: '🖼️' },
              { label: 'Vues',       value: stats.views     ?? 0, icon: '👁️' },
              { label: 'Disponibles',value: stats.available ?? 0, icon: '✅' },
              { label: 'Vendues',    value: stats.sold      ?? 0, icon: '💰' },
            ].map(s => (
              <div key={s.label} className="dashboard-stat-card">
                <span className="dashboard-stat-icon">{s.icon}</span>
                <span className="dashboard-stat-value">{s.value.toLocaleString('fr-FR')}</span>
                <span className="dashboard-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* IA Banner */}
        <div className="dashboard-ai-banner">
          <div>
            <h3>✨ Générez votre profil avec l&rsquo;IA</h3>
            <p>Créez une biographie et un statement artistique professionnels en quelques secondes.</p>
          </div>
          <Link to="/profile" className="btn btn-gold">Générer mon profil →</Link>
        </div>

        {/* Liste des œuvres */}
        <div className="dashboard-section">
          <div className="dashboard-section-head">
            <h2 className="dashboard-section-title">Mes œuvres</h2>
            {artworks.length > 0 && (
              <Link to="/galerie/ajouter" className="btn btn-gold btn-sm">+ Ajouter</Link>
            )}
          </div>
          {artworks.length === 0 ? (
            <div className="dashboard-empty">
              <p>Vous n&rsquo;avez pas encore d&rsquo;œuvres.</p>
              <Link to="/galerie/ajouter" className="btn btn-gold" style={{ marginTop: 16 }}>
                Ajouter ma première œuvre
              </Link>
            </div>
          ) : (
            <div className="dashboard-artworks">
              {artworks.map(a => (
                <ArtworkRow
                  key={a.id}
                  artwork={a}
                  onDelete={handleDelete}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
