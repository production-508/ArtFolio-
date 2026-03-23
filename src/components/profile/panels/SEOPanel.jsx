import React from 'react';
import { useProfileCustomization } from '../../../contexts/ProfileCustomizationContext';
import { Instagram, Twitter, Facebook, Linkedin, Globe, ExternalLink } from 'lucide-react';

const platformIcons = {
  instagram: Instagram,
  twitter: Twitter,
  facebook: Facebook,
  linkedin: Linkedin,
  website: Globe,
};

const platformLabels = {
  instagram: 'Instagram',
  twitter: 'Twitter / X',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  behance: 'Behance',
  dribbble: 'Dribbble',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  website: 'Site web',
  other: 'Autre',
};

export default function SEOPanel() {
  const { settings, updateSettings } = useProfileCustomization();

  if (!settings) return null;

  return (
    <div className="panel-content">
      <section className="panel-section">
        <h3>URL personnalisée</h3>
        <div className="slug-input-group">
          <div className="slug-prefix">
            artfolio.app/a/
          </div>
          <input
            type="text"
            value={settings.custom_slug || ''}
            onChange={(e) => updateSettings({ custom_slug: e.target.value })}
            placeholder="votre-nom"
            className="slug-input"
          />
        </div>
        <p className="field-hint">
          Cette URL sera utilisée pour partager votre profil. 
          Utilisez uniquement des lettres, chiffres et tirets.
        </p>
      </section>

      <section className="panel-section">
        <h3>Titre de la page</h3>
        <input
          type="text"
          value={settings.page_title || ''}
          onChange={(e) => updateSettings({ page_title: e.target.value })}
          placeholder="Marie Dubois — Artiste Peintre | ArtFolio"
          className="text-input"
          maxLength={70}
        />
        <div className="char-count">
          {(settings.page_title || '').length}/70 caractères
        </div>
      </section>

      <section className="panel-section">
        <h3>Description meta</h3>
        <textarea
          value={settings.meta_description || ''}
          onChange={(e) => updateSettings({ meta_description: e.target.value })}
          placeholder="Découvrez l'univers de Marie Dubois, artiste peintre spécialisée dans l'art abstrait contemporain..."
          className="textarea-input"
          rows={4}
          maxLength={160}
        />
        <div className="char-count">
          {(settings.meta_description || '').length}/160 caractères
        </div>
        <p className="field-hint">
          Cette description apparaîtra dans les résultats de recherche Google.
        </p>
      </section>

      <section className="panel-section">
        <h3>Image Open Graph</h3>
        <div className="og-image-upload">
          {settings.og_image_url ? (
            <div className="og-preview">
              <img src={settings.og_image_url} alt="Open Graph" />
              <button 
                className="remove-image-btn"
                onClick={() => updateSettings({ og_image_url: null })}
              >
                Supprimer
              </button>
            </div>
          ) : (
            <div className="upload-zone og-upload">
              <Image size={24} />
              <p>Image pour le partage social</p>
              <span>1200×630px recommandé</span>
            </div>
          )}
        </div>
        <p className="field-hint">
          Cette image s'affichera quand vous partagerez votre profil sur Facebook, Twitter, etc.
        </p>
      </section>

      <section className="panel-section">
        <h3>Twitter / X</h3㸾
        <div className="twitter-handle-input">
          <span className="at-prefix">@</span>
          <input
            type="text"
            value={settings.twitter_handle || ''}
            onChange={(e) => updateSettings({ twitter_handle: e.target.value })}
            placeholder="votre_compte"
            className="text-input"
          />
        </div>
      </section>

      <section className="panel-section">
        <h3>Aperçu Google</h3>
        <div className="google-preview">
          <div className="google-url">
            artfolio.app › a › {settings.custom_slug || 'votre-profil'}
          </div>
          <div className="google-title">
            {settings.page_title || settings.user_name || 'Votre nom'} — ArtFolio
          </div>
          <div className="google-description">
            {settings.meta_description || 
              'Découvrez le profil artiste sur ArtFolio. Galerie contemporaine en ligne.'}
          </div>
        </div>
      </section>
    </div>
  );
}
