/**
 * Éditeur SEO - Métadonnées, partage social, référencement
 */
import { useState, useEffect } from 'react';
import { Search, Share2, Link, Globe, Twitter, Facebook } from 'lucide-react';
import { useProfileCustomization } from '../contexts/ProfileCustomizationContext';

export default function ProfileSEOEditor() {
  const { settings, updateSettings, markAsChanged } = useProfileCustomization();
  const [localSettings, setLocalSettings] = useState(settings || {});
  const [slugAvailable, setSlugAvailable] = useState(null);
  const [checkingSlug, setCheckingSlug] = useState(false);

  useEffect(() => {
    setLocalSettings(settings || {});
  }, [settings]);

  const handleChange = (field, value) => {
    const newSettings = { ...localSettings, [field]: value };
    setLocalSettings(newSettings);
    markAsChanged();
    
    clearTimeout(window.seoSaveTimeout);
    window.seoSaveTimeout = setTimeout(() => {
      updateSettings({ [field]: value });
    }, 500);
  };

  const checkSlugAvailability = async (slug) => {
    if (!slug || slug.length < 3) return;
    
    setCheckingSlug(true);
    try {
      const res = await fetch(`/api/profile/public/${slug}`);
      setSlugAvailable(res.status === 404);
    } catch {
      setSlugAvailable(true);
    } finally {
      setCheckingSlug(false);
    }
  };

  const fullUrl = localSettings.custom_slug 
    ? `https://artfolio.app/${localSettings.custom_slug}`
    : 'https://artfolio.app/u/votre-id';

  return (
    <div className="seo-editor">
      <section className="editor-section">
        <h2><Link size={20} /> URL personnalisée</h2>
        
        <div className="slug-field">
          <label>Slug personnalisé</label>
          <div className="slug-input-wrapper">
            <span className="slug-prefix">artfolio.app/</span>
            <input
              type="text"
              value={localSettings.custom_slug || ''}
              onChange={(e) => {
                const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                handleChange('custom_slug', value);
                setSlugAvailable(null);
              }}
              onBlur={() => checkSlugAvailability(localSettings.custom_slug)}
              placeholder="votre-nom"
            />
          </div>
          
          {checkingSlug && <span className="slug-status checking">Vérification...</span>}
          {!checkingSlug && slugAvailable === true && (
            <span className="slug-status available">✓ Disponible</span>
          )}
          {!checkingSlug && slugAvailable === false && (
            <span className="slug-status taken">✗ Déjà utilisé</span>
          )}
        </div>
      </section>

      <section className="editor-section">
        <h2><Search size={20} /> Référencement</h2>
        
        <div className="seo-fields">
          <div className="form-group">
            <label>Titre de la page</label>
            <input
              type="text"
              value={localSettings.page_title || ''}
              onChange={(e) => handleChange('page_title', e.target.value)}
              placeholder="Nom de l'artiste | ArtFolio"
              maxLength={60}
            />
            <span className="char-count">{(localSettings.page_title || '').length}/60</span>
          </div>
          
          <div className="form-group">
            <label>Description meta</label>
            <textarea
              value={localSettings.meta_description || ''}
              onChange={(e) => handleChange('meta_description', e.target.value)}
              placeholder="Description de votre profil artiste pour les moteurs de recherche..."
              rows={3}
              maxLength={160}
            />
            <span className="char-count">{(localSettings.meta_description || '').length}/160</span>
          </div>
        </div>
      </section>

      <section className="editor-section">
        <h2><Share2 size={20} /> Partage social</h2>
        
        <div className="social-preview">
          <h3>Aperçu lors du partage</h3>
          
          <div className="share-card">
            <div className="share-image">
              {localSettings.og_image_url ? (
                <img src={localSettings.og_image_url} alt="OG" />
              ) : (
                <div className="share-image-placeholder">Image OpenGraph</div>
              )}
            </div>            
            <div className="share-content">
              <span className="share-url">{fullUrl}</span>
              <span className="share-title">{localSettings.page_title || 'Titre de la page'}</span>              
              <span className="share-desc">
                {localSettings.meta_description || 'Description qui apparaîtra lors du partage sur les réseaux sociaux...'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="form-group">
          <label>Image OpenGraph (1200×630 recommandé)</label>
          <input
            type="url"
            value={localSettings.og_image_url || ''}
            onChange={(e) => handleChange('og_image_url', e.target.value)}
            placeholder="https://..."
          />
        </div>
        
        <div className="form-group">
          <label><Twitter size={16} /> Handle Twitter</label>
          <div className="twitter-input">
            <span>@</span>
            <input
              type="text"
              value={localSettings.twitter_handle || ''}
              onChange={(e) => handleChange('twitter_handle', e.target.value.replace('@', ''))}
              placeholder="votrecompte"
            />
          </div>
        </div>
      </section>

      <section className="editor-section">
        <h2><Globe size={20} /> Visibilité</h2>
        
        <div className="visibility-options">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={localSettings.is_public !== false}
              onChange={(e) => handleChange('is_public', e.target.checked)}
            />
            <span>Profil public</span>
            <small>Visible par tous sur ArtFolio</small>
          </label>
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={localSettings.allow_messages !== false}
              onChange={(e) => handleChange('allow_messages', e.target.checked)}
            />
            <span>Autoriser les messages</span>
            <small>Les visiteurs peuvent vous contacter</small>
          </label>
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={localSettings.require_approval_for_comments !== false}
              onChange={(e) => handleChange('require_approval_for_comments', e.target.checked)}
            />
            <span>Modération des commentaires</span>
            <small>Approuver avant publication</small>
          </label>
        </div>
      </section>
    </div>
  );
}
