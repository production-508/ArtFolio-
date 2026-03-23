import React from 'react';
import { useProfileCustomization } from '../../../contexts/ProfileCustomizationContext';

export default function SEOPanel() {
  const { settings, updateSettings, stats } = useProfileCustomization();

  if (!settings) return null;

  const slugPreview = settings.custom_slug || 'votre-nom';
  const seoTitle = settings.page_title || settings.name || 'Artiste';
  const seoDesc = settings.meta_description || 'Découvrez les œuvres de ' + (settings.name || 'cet artiste');

  return (
    <div className="panel-content">
      {/* Slug personnalisé */}
      <section className="panel-section">
        <h3>URL personnalisée</h3>
        <p className="section-desc">
          Créez une URL courte et mémorable pour votre profil
        </p>

        <label className="slug-field">
          <span>artfolio.app/artist/</span>
          <input
            type="text"
            value={settings.custom_slug || ''}
            onChange={(e) => updateSettings({ custom_slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
            placeholder="votre-nom"
          />
        </label>

        <div className="slug-preview">
          <span className="preview-label">Votre URL :</span>
          <code className="preview-url">
            artfolio.app/artist/{slugPreview}
          </code>
        </div>
      </section>

      {/* Meta tags */}
      <section className="panel-section">
        <h3>Titre de la page</h3>
        <p className="section-desc">
          Le titre affiché dans les résultats de recherche et les onglets
        </p>

        <label className="seo-field">
          <input
            type="text"
            value={settings.page_title || ''}
            onChange={(e) => updateSettings({ page_title: e.target.value })}
            placeholder="Marie Dubois — Artiste Peintre | ArtFolio"
            maxLength={60}
          />
          <span className="char-count">{(settings.page_title || '').length}/60</span>
        </label>
      </section>

      <section className="panel-section">
        <h3>Meta Description</h3>
        <p className="section-desc">
          Une courte description qui apparaît dans les résultats Google
        </p>

        <label className="seo-field">
          <textarea
            value={settings.meta_description || ''}
            onChange={(e) => updateSettings({ meta_description: e.target.value })}
            placeholder="Découvrez les œuvres uniques de Marie Dubois, artiste peintre spécialisée dans l'art abstrait contemporain."
            maxLength={160}
            rows={3}
          />
          <span className="char-count">{(settings.meta_description || '').length}/160</span>
        </label>
      </section>

      {/* Image Open Graph */}
      <section className="panel-section">
        <h3>Image de partage</h3>
        <p className="section-desc">
          L'image affichée quand votre profil est partagé sur les réseaux sociaux
        </p>

        <label className="image-field">
          <span>URL de l'image (recommandé : 1200×630px)</span>
          <input
            type="url"
            value={settings.og_image_url || ''}
            onChange={(e) => updateSettings({ og_image_url: e.target.value })}
            placeholder="https://exemple.com/image-partage.jpg"
          />
        </label>

        {settings.og_image_url && (
          <div className="og-image-preview">
            <img src={settings.og_image_url} alt="Preview" />
          </div>
        )}
      </section>

      {/* Twitter */}
      <section className="panel-section">
        <h3>Twitter / X</h3>
        <label className="twitter-field">
          <span>@</span>
          <input
            type="text"
            value={settings.twitter_handle || ''}
            onChange={(e) => updateSettings({ twitter_handle: e.target.value.replace(/^@/, '') })}
            placeholder="votre_pseudo"
          />
        </label>
      </section>

      {/* Prévisualisation Google */}
      <section className="panel-section">
        <h3>Prévisualisation Google</h3>
        <div className="google-preview">
          <div className="google-url">
            artfolio.app › artist › {slugPreview}
          </div>
          <div className="google-title">{seoTitle}</div>
          <div className="google-desc">{seoDesc}</div>
        </div>
      </section>

      {/* Statistiques */}
      {stats && (
        <section className="panel-section">
          <h3>Statistiques de profil</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{stats.profile_views?.toLocaleString() || 0}</span>
              <span className="stat-label">Vues du profil</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.total_artworks || 0}</span>
              <span className="stat-label">Œuvres</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.sold_artworks || 0}</span>
              <span className="stat-label">Ventes</span>
            </div>
          </div>
        </section>
      )}

      {/* Visibilité */}
      <section className="panel-section">
        <h3>Visibilité</h3>
        
        <label className="toggle-item">
          <span className="toggle-label">Profil public</span>
          <input
            type="checkbox"
            checked={settings.is_public !== false}
            onChange={(e) => updateSettings({ is_public: e.target.checked })}
          />
          <span className="toggle-slider" />
        </label>

        <label className="toggle-item">
          <span className="toggle-label">Autoriser les messages</span>
          <input
            type="checkbox"
            checked={settings.allow_messages !== false}
            onChange={(e) => updateSettings({ allow_messages: e.target.checked })}
          />
          <span className="toggle-slider" />
        </label>
      </section>
    </div>
  );
}
