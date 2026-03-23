import React from 'react';
import { useProfileCustomization } from '../../../contexts/ProfileCustomizationContext';

const layouts = [
  { id: 'grid', label: 'Grille', description: 'Grille classée avec galerie', image: '📐' },
  { id: 'masonry', label: 'Masonry', description: 'Grille Pinterest-style', image: '🧱' },
  { id: 'spotlight', label: 'Spotlight', description: 'Une œuvre en vedette', image: '⭐' },
  { id: 'minimal', label: 'Minimal', description: 'Ultra-épuré, œuvres seules', image: '◻️' },
  { id: 'timeline', label: 'Timeline', description: 'Chronologie verticale', image: '📅' },
];

const heroStyles = [
  { id: 'carousel', label: 'Carousel', description: 'Défilement automatique' },
  { id: 'static', label: 'Image fixe', description: 'Bannière statique' },
  { id: 'video', label: 'Vidéo', description: 'Bannière vidéo (Pro)' },
  { id: 'none', label: 'Aucun', description: 'Pas de hero' },
];

export default function LayoutPanel() {
  const { settings, updateSettings } = useProfileCustomization();

  if (!settings) return null;

  return (
    <div className="panel-content">
      <section className="panel-section">
        <h3>Type de Layout</h3>
        <p className="section-desc">Choisissez comment vos œuvres sont présentées</p>
        
        <div className="layout-grid">
          {layouts.map(layout => (
            <button
              key={layout.id}
              className={`layout-card ${settings.layout_type === layout.id ? 'selected' : ''}`}
              onClick={() => updateSettings({ layout_type: layout.id })}
            >
              <span className="layout-icon">{layout.image}</span>
              <span className="layout-name">{layout.label}</span>
              <span className="layout-desc">{layout.description}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="panel-section">
        <h3>Style du Hero</h3>
        <p className="section-desc">L\'en-tête de votre page profil</p>
        
        <div className="hero-options">
          {heroStyles.map(style => (
            <button
              key={style.id}
              className={`hero-option ${settings.hero_style === style.id ? 'selected' : ''}`}
              onClick={() => updateSettings({ hero_style: style.id })}
            >
              <span className="option-name">{style.label}</span>
              <span className="option-desc">{style.description}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="panel-section">
        <h3>Sections Affichées</h3>
        <p className="section-desc">Activez ou désactivez les sections de votre profil</p>
        
        <div className="toggles-list">
          {[
            { key: 'show_bio', label: 'Biographie', icon: '👤' },
            { key: 'show_story', label: 'Mon histoire', icon: '📖' },
            { key: 'show_stats', label: 'Statistiques', icon: '📊' },
            { key: 'show_social_links', label: 'Réseaux sociaux', icon: '🔗' },
            { key: 'show_contact_form', label: 'Formulaire de contact', icon: '✉️' },
            { key: 'show_cv', label: 'CV / Parcours', icon: '🎓' },
            { key: 'show_exhibitions', label: 'Expositions', icon: '🏛️' },
            { key: 'show_press', label: 'Revue de presse', icon: '📰' },
          ].map(toggle => (
            <label key={toggle.key} className="toggle-item">
              <span className="toggle-icon">{toggle.icon}</span>
              <span className="toggle-label">{toggle.label}</span>
              <input
                type="checkbox"
                checked={settings[toggle.key] === 1 || settings[toggle.key] === true}
                onChange={(e) => updateSettings({ [toggle.key]: e.target.checked })}
              />
              <span className="toggle-slider" />
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}
