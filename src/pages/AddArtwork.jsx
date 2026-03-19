import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import './AddArtwork.css';

const MEDIUMS = ['Huile sur toile', 'Acrylique', 'Aquarelle', 'Photographie', 'Sculpture', 'Dessin', 'Gravure', 'Pastel', 'Technique mixte', 'Numérique', 'Installation', 'Autre'];
const STYLES  = ['Abstrait', 'Figuratif', 'Contemporain', 'Expressionniste', 'Minimaliste', 'Surréaliste', 'Impressionniste', 'Street Art', 'Conceptuel', 'Autre'];

const EMPTY = { title: '', medium: '', style: '', year: '', dimensions: '', price: '', description: '', image: null, available: true };

export default function AddArtwork() {
  const { apiFetch } = useAuth();
  const navigate     = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [previewUrl, setPreviewUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim())   return setError('Le titre est requis');
    if (!form.medium)         return setError('Le médium est requis');
    if (!form.style)          return setError('Le style est requis');
    if (!form.price || isNaN(parseFloat(form.price))) return setError('Le prix doit être un nombre');
    if (!form.image)          return setError('L\'image de l\'œuvre est requise');
    
    setSaving(true); setError('');
    
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('medium', form.medium);
    formData.append('style', form.style);
    formData.append('price', parseFloat(form.price));
    formData.append('available', form.available);
    if (form.description) formData.append('description', form.description);
    if (form.year) formData.append('year', form.year);
    if (form.dimensions) formData.append('dimensions', form.dimensions);
    formData.append('image', form.image);

    try {
      await apiFetch('/artworks', { // L'API s'attend à /api/artworks (voir server.js)
        method: 'POST',
        body: formData,
      });
      toast.success('Œuvre publiée avec succès !');
      navigate('/dashboard');
    } catch (err) { 
      setError(err.message); 
      toast.error(err.message || 'Erreur lors de la publication');
    }
    finally { setSaving(false); }
  };

  return (
    <div className="page add-artwork-page">
      <div className="add-artwork-container">
        {/* Header */}
        <div className="add-artwork-header">
          <button className="back-link" onClick={() => navigate('/dashboard')}>← Dashboard</button>
          <h1 className="add-artwork-title">Ajouter une œuvre</h1>
          <p className="add-artwork-subtitle">Renseignez les informations de votre œuvre pour la publier dans votre portfolio.</p>
        </div>

        <form className="add-artwork-form" onSubmit={handleSubmit}>
          <div className="add-artwork-layout">
            {/* Colonne gauche — preview */}
            <div className="add-artwork-preview-col">
              <div className="add-artwork-preview-card">
                {previewUrl
                  ? <img src={previewUrl} alt="Aperçu" className="add-artwork-preview-img" />
                  : (
                    <div className="add-artwork-preview-placeholder">
                      <span>🖼️</span>
                      <p>Séléctionnez une image</p>
                    </div>
                  )}
              </div>
              <div className="form-group" style={{ marginTop: 16 }}>
                <label className="form-label" htmlFor="artwork-image">Fichier image *</label>
                <input
                  id="artwork-image"
                  className="form-input" 
                  type="file" 
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files[0];
                    if (file) {
                      set('image', file);
                      if (previewUrl) URL.revokeObjectURL(previewUrl);
                      setPreviewUrl(URL.createObjectURL(file));
                    }
                  }}
                />
              </div>
              {/* Disponibilité */}
              <label className="add-artwork-toggle">
                <input
                  type="checkbox" checked={form.available}
                  onChange={e => set('available', e.target.checked)}
                />
                <span className="add-artwork-toggle-track">
                  <span className="add-artwork-toggle-thumb" />
                </span>
                <span className="add-artwork-toggle-label">
                  {form.available ? '✅ Disponible à la vente' : '🔒 Non disponible'}
                </span>
              </label>
            </div>

            {/* Colonne droite — champs */}
            <div className="add-artwork-fields">
              <div className="form-group">
                <label className="form-label">Titre *</label>
                <input className="form-input" type="text" value={form.title}
                  onChange={e => set('title', e.target.value)} placeholder="ex : Série Ocre III" />
              </div>

              <div className="add-artwork-row">
                <div className="form-group">
                  <label className="form-label">Médium *</label>
                  <select className="form-input form-select" value={form.medium}
                    onChange={e => set('medium', e.target.value)}>
                    <option value="">— Choisir —</option>
                    {MEDIUMS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Style *</label>
                  <select className="form-input form-select" value={form.style}
                    onChange={e => set('style', e.target.value)}>
                    <option value="">— Choisir —</option>
                    {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="add-artwork-row">
                <div className="form-group">
                  <label className="form-label">Année</label>
                  <input className="form-input" type="number" min="1800" max="2030"
                    value={form.year} onChange={e => set('year', e.target.value)} placeholder="2024" />
                </div>
                <div className="form-group">
                  <label className="form-label">Dimensions</label>
                  <input className="form-input" type="text"
                    value={form.dimensions} onChange={e => set('dimensions', e.target.value)}
                    placeholder="120 × 80 cm" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Prix (€) *</label>
                <div className="add-artwork-price-wrap">
                  <span className="add-artwork-price-prefix">€</span>
                  <input className="form-input add-artwork-price-input" type="number" min="0" step="50"
                    value={form.price} onChange={e => set('price', e.target.value)} placeholder="1 200" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description <span style={{ color: 'var(--white-60)', fontWeight: 400 }}>(optionnel)</span></label>
                <textarea className="form-input" rows={4} value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Contexte, matières, démarche derrière cette œuvre…" />
              </div>
            </div>
          </div>

          {error && <p className="error-msg" style={{ marginTop: 16 }}>{error}</p>}

          <div className="add-artwork-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate('/dashboard')}>
              Annuler
            </button>
            <button type="submit" className="btn btn-gold" disabled={saving}>
              {saving
                ? <><span className="spinner" style={{ width: 16, height: 16 }}></span> Publication…</>
                : "🖼️ Publier l\u2019œuvre"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
