import React from 'react';
import { useProfileCustomization } from '../../../contexts/ProfileCustomizationContext';
import { LayoutGrid, Columns, Sparkles, Minimize, Clock } from 'lucide-react';

const layouts = [
  { id: 'grid', label: 'Grille', icon: LayoutGrid, description: 'Affichage en grille classique' },
  { id: 'masonry', label: 'Masonry', icon: Columns, description: 'Grille en cascades' },
  { id: 'spotlight', label: 'Spotlight', icon: Sparkles, description: 'Une œuvre en avant' },
  { id: 'minimal', label: 'Minimal', icon: Minimize, description: 'Design épuré' },
  { id: 'timeline', label: 'Timeline', icon: Clock, description: 'Chronologique' },
];

const heroStyles = [
  { id: 'carousel', label: 'Carousel', description: 'Défilement automatique des œuvres' },
  { id: 'static', label: 'Image statique', description: 'Une seule image fixe' },
  { id: 'video', label: 'Vidéo', description: 'Bannière vidéo en arrière-plan' },
  { id: 'none', label: 'Aucun', description: 'Pas de hero, grille directe' },
];

const contentSections = [
  { key: 'show_bio', label: 'Biographie', description: 'Votre bio et parcours' },
  { key: 'show_story', label: 'Story', description: 'Votre histoire artistique' },
  { key: 'show_stats', label: 'Statistiques', description: 'Vues, ventes, etc.' },
  { key: 'show_social_links', label: 'Liens sociaux', description: 'Vos réseaux' },
  { key: 'show_contact_form', label: 'Formulaire de contact', description: 'Pour recevoir des messages' },
  { key: 'show_exhibitions', label: 'Expositions', description: 'Vos expos passées et à venir' },
  { key: 'show_cv', label: 'CV artistique', description: 'Votre parcours détaillé' },
  { key: 'show_press', label: 'Presse', description: 'Articles et mentions' },
];

export default function LayoutPanel() {
  const { settings, updateSettings } = useProfileCustomization();

  if (!settings) return null;

  return (
    <div className="panel-content">
      <section className="panel-section">
        <h3>Type de layout</h3>
        <div className="layout-grid">
          {layouts.map(layout => (
            <button
              key={layout.id}
              className={`layout-option ${settings.layout_type === layout.id ? 'active' : ''}`}
              onClick={() => updateSettings({ layout_type: layout.id })}
            >
              <layout.icon size={28} />
              <div className="layout-info">
                <span className="layout-name">{layout.label}</span>
                <span className="layout-desc">{layout.description}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="panel-section">
        <h3>Style du Hero</h3>
        <div className="hero-options">
          {heroStyles.map(style => (
            <button
              key={style.id}
              className={`hero-option ${settings.hero_style === style.id ? 'active' : ''}`}
              onClick={() => updateSettings({ hero_style: style.id })}
            >
              <div className="hero-preview">
                {style.id === 'carousel' && <div className="preview-carousel" />}
                {style.id === 'static' && <div className="preview-static" />}
                {style.id === 'video' && <div className="preview-video" />}
                {style.id === 'none' && <div className="preview-none" />}
              </div>
              <div className="hero-info">
                <span className="hero-name">{style.label}</span>
                <span className="hero-desc">{style.description}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="panel-section">
        <h3>Sections à afficher</h3>
        <p className="section-description">
          Activez ou désactivez les sections de votre profil public
        </p>

        <div className="sections-list">
          {contentSections.map(section => (
            <label key={section.key} className="section-toggle">
              <input
                type="checkbox"
                checked={settings[section.key] !== false}
                onChange={(e) => updateSettings({ [section.key]: e.target.checked })}
              />
              <div className="toggle-content">
                <span className="toggle-label">{section.label}</span>
                <span className="toggle-desc">{section.description}</span>
              </div>
              <div className={`toggle-switch ${settings[section.key] !== false ? 'on' : 'off'}`}>
                <div className="toggle-knob" />
              </div>
            </label>
          ))}
        </div>
      </section>

      <section className="panel-section">
        <h3>Visibilité du profil</h3>
        <div className="visibility-options">
          <label className="visibility-option">
            <input
              type="radio"
              name="visibility"
              checked={settings.is_public !== false}
              onChange={() => updateSettings({ is_public: true })}
            />
            <div className="visibility-content">
              <span className="visibility-title">Profil public</span>
              <span className="visibility-desc">
                Votre profil est visible par tous et indexé par les moteurs de recherche
              </span>
            </div>
          </label>

          <label className="visibility-option">
            <input
              type="radio"
              name="visibility"
              checked={settings.is_public === false}
              onChange={() => updateSettings({ is_public: false })}
            />
            <div className="visibility-content">
              <span className="visibility-title">Profil privé</span>
              <span className="visibility-desc">
                Seuls vous pouvez voir votre profil
              </span>
            </div>
          </label>
        </div>
      </section>
    </div>
  );
}
