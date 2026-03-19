import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Navigate, Link } from 'react-router-dom';
import './AdminDashboard.css';

function fmtPrice(p) {
  if (!p && p !== 0) return '—';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(p);
}

export default function AdminDashboard() {
  const { user, apiFetch } = useAuth();
  
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [artworks, setArtworks] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, artworks
  const [loading, setLoading] = useState(true);

  // Modales personnalisées pour remplacer window.confirm et alert
  const [confirmModal, setConfirmModal] = useState(null);
  const [alertMsg, setAlertMsg] = useState('');

  // Sécurité Frontend Additionnelle
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const loadData = async () => {
    setLoading(true);
    try {
      const pStats = apiFetch('/admin/stats');
      const pUsers = apiFetch('/admin/users');
      const pArtworks = apiFetch('/admin/artworks');
      
      const [resStats, resUsers, resArtworks] = await Promise.all([pStats, pUsers, pArtworks]);
      
      if (resStats && !resStats.error) setStats(resStats);
      if (resUsers && !resUsers.error) setUsers(resUsers);
      if (resArtworks && !resArtworks.error) setArtworks(resArtworks);
    } catch (err) {
      console.error("Erreur de chargement Admin:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line
  }, []);

  const confirmAction = (message, onConfirm) => {
    setConfirmModal({ message, onConfirm });
  };

  const showAlert = (message) => {
    setAlertMsg(message);
  };

  const handleDeleteArtwork = async (id) => {
    confirmAction("Voulez-vous vraiment supprimer cette œuvre ? Action irréversible.", async () => {
      try {
        await apiFetch(`/admin/artworks/${id}`, { method: 'DELETE' });
        setArtworks(artworks.filter(a => a.id !== id));
        // Optionnel: recharger les stats
      } catch (err) {
        showAlert("Erreur lors de la suppression: " + err.message);
      }
    });
  };

  const handleRoleChange = async (userId, newRole) => {
    confirmAction(`Passer l'utilisateur au rôle: ${newRole} ?`, async () => {
      try {
        await apiFetch(`/admin/users/${userId}/role`, {
          method: 'PUT',
          body: JSON.stringify({ role: newRole })
        });
        // Update state locally
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      } catch (err) {
        showAlert("Erreur: " + err.message);
      }
    });
  };

  if (loading && !stats) {
    return (
      <div className="page admin-dashboard loading">
        <div className="spinner"></div>
        <p>Chargement de l'espace modérateur...</p>
      </div>
    );
  }

  return (
    <div className="page admin-dashboard">
      <div className="admin-header">
        <div className="container">
          <h1 className="display-title">Control Center</h1>
          <p className="subtitle">Espace réservé aux administrateurs de la galerie ArtFolio.</p>
        </div>
      </div>

      <div className="container admin-container">
        
        {/* Barre de navigation Admin */}
        <div className="admin-tabs">
          <button className={`admin-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            Vue Globale
          </button>
          <button className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            Comptes ({users.length})
          </button>
          <button className={`admin-tab ${activeTab === 'artworks' ? 'active' : ''}`} onClick={() => setActiveTab('artworks')}>
            Œuvres ({artworks.length})
          </button>
        </div>

        <div className="admin-content">
          
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && stats && (
            <div className="admin-overview">
              <h2 className="admin-section-title">Indicateurs de Performance</h2>
              <div className="admin-kpi-grid">
                <div className="admin-kpi-card">
                  <span className="admin-kpi-icon">👥</span>
                  <span className="admin-kpi-val">{stats.users}</span>
                  <span className="admin-kpi-label">Utilisateurs inscrits</span>
                </div>
                <div className="admin-kpi-card">
                  <span className="admin-kpi-icon">🎨</span>
                  <span className="admin-kpi-val">{stats.artists}</span>
                  <span className="admin-kpi-label">Artistes actifs</span>
                </div>
                <div className="admin-kpi-card">
                  <span className="admin-kpi-icon">🖼️</span>
                  <span className="admin-kpi-val">{stats.artworks}</span>
                  <span className="admin-kpi-label">Œuvres hébergées</span>
                </div>
                <div className="admin-kpi-card highlight">
                  <span className="admin-kpi-icon">💰</span>
                  <span className="admin-kpi-val">{fmtPrice(stats.revenue)}</span>
                  <span className="admin-kpi-label">Volume total des ventes</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB: USERS */}
          {activeTab === 'users' && (
            <div className="admin-users">
              <h2 className="admin-section-title">Gestion des Comptes</h2>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nom</th>
                      <th>Email</th>
                      <th>Rôle</th>
                      <th>Œuvres</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td className="admin-td-id">#{u.id}</td>
                        <td>{u.name}</td>
                        <td className="admin-td-email">{u.email}</td>
                        <td>
                          <span className={`admin-badge role-${u.role}`}>{u.role}</span>
                        </td>
                        <td>{u.artwork_count || 0}</td>
                        <td className="admin-td-actions">
                          {u.role !== 'admin' && u.id !== user.id && (
                            <select 
                              className="admin-role-select"
                              value=""
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            >
                              <option value="" disabled>Changer rôle...</option>
                              <option value="user">Passer User</option>
                              <option value="artist">Passer Artiste</option>
                              <option value="admin">Promouvoir Admin</option>
                            </select>
                          )}
                          {u.role === 'admin' && u.id === user.id && (
                            <span className="admin-self">Vous</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: ARTWORKS */}
          {activeTab === 'artworks' && (
            <div className="admin-artworks">
              <h2 className="admin-section-title">Modération du Catalogue</h2>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Titre</th>
                      <th>Artiste</th>
                      <th>Prix</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {artworks.map(a => (
                      <tr key={a.id}>
                        <td className="admin-td-id">#{a.id}</td>
                        <td className="admin-td-title">
                          <Link to={`/oeuvre/${a.id}`}>{a.title}</Link>
                        </td>
                        <td><Link to={`/artiste/${a.artist_id}`}>{a.artist_name}</Link></td>
                        <td>{fmtPrice(a.price)}</td>
                        <td>
                          {a.available === 1 
                            ? <span className="admin-badge role-user">Disponible</span> 
                            : <span className="admin-badge role-artist">Sold</span>}
                        </td>
                        <td className="admin-td-actions">
                          <button 
                            className="btn-admin-danger"
                            onClick={() => handleDeleteArtwork(a.id)}
                            title="Supprimer l'œuvre"
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                    {artworks.length === 0 && (
                      <tr><td colSpan="6" style={{textAlign:'center', padding:'32px'}}>Aucune œuvre.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Modals JS Replacement */}
      {confirmModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h3>Confirmation</h3>
            <p>{confirmModal.message}</p>
            <div className="admin-modal-actions">
              <button onClick={() => setConfirmModal(null)} className="btn-admin-cancel">Annuler</button>
              <button onClick={() => { confirmModal.onConfirm(); setConfirmModal(null); }} className="btn-admin-danger">Confirmer</button>
            </div>
          </div>
        </div>
      )}
      {alertMsg && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h3>Alerte</h3>
            <p>{alertMsg}</p>
            <div className="admin-modal-actions">
              <button onClick={() => setAlertMsg('')} className="btn-admin-cancel">Fermer</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
