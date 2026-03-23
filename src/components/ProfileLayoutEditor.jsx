/**
 * Éditeur de mise en page - Structure, sections visibles, hero
 */
import { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { 
  LayoutGrid, LayoutList, Square, Columns, Clock,
  Image, Type, BarChart3, Mail, FileText, Newspaper, Eye, EyeOff
} from 'lucide-react';
import { useProfileCustomization } from '../contexts/ProfileCustomizationContext';

const LAYOUT_TYPES = [
  { id: 'grid', label: 'Grille', icon: LayoutGrid, description: 'Mosaïque classique d\'œuvres' },
  { id: 'masonry', label: 'Masonry', icon: LayoutList, description: 'Grille irrégulière Pinterest-style' },
  { id: 'spotlight', label: 'Spotlight', icon: Square, description: 'Une œuvre en vedette' },
  { id: 'minimal', label: 'Minimal', icon: EyeOff, description: 'Rien que l\'essentiel' },
  { id: 'timeline', label: 'Chronologie', icon: Clock, description: 'Parcours artistique' },
];

const HERO_STYLES = [
  { id: 'carousel', label: 'Carrousel', description: 'Défilement automatique des œuvres' },
  { id: 'static', label: 'Image fixe', description: 'Une seule image de couverture' },
  { id: 'video', label: 'Vidéo', description: 'Vidéo de présentation en fond' },
  { id: 'none', label: 'Aucun', description: 'Pas de hero, galerie directe' },
];

const SECTIONS = [
  { id: 'show_bio', label: 'Biographie', icon: Type, description: 'Présentation de l\'artiste' },
  { id: 'show_story', label: 'Parcours', icon: FileText, description: 'Histoire et inspiration' },
  { id: 'show_stats', label: 'Statistiques', icon: BarChart3, description: 'Vues, ventes, œuvres' },
  { id: 'show_social_links', label: 'Réseaux sociaux', icon: LayoutGrid, description: 'Liens Instagram, Twitter...' },
  { id: 'show_contact_form', label: 'Formulaire de contact', icon: Mail, description: 'Messages directs' },
  { id: 'show_cv', label: 'CV artistique', icon: FileText, description: 'Expositions, formations' },
  { id: 'show_exhibitions', label: 'Expositions', icon: LayoutList, description: 'Historique des shows' },
  { id: 'show_press', label: 'Presse', icon: Newspaper, description: 'Articles et mentions' },
];

const PROFILE_SHAPES = [
  { id: 'circle', label: 'Rond' },
  { id: 'rounded', label: 'Arrondi' },
  { id: 'square', label: 'Carré' },
];

export default function ProfileLayoutEditor() {
  const { settings, updateSettings, markAsChanged } = useProfileCustomization();
  const [localSettings, setLocalSettings] = useState(settings || {});
  const [sectionOrder, setSectionOrder] = useState(
    settings?.widget_order?.split(',') || ['bio', 'works', 'exhibitions', 'contact']
  );

  const handleChange = (field, value) => {
    const newSettings = { ...localSettings, [field]: value };
    setLocalSettings(newSettings);
    markAsChanged();
    
    clearTimeout(window.layoutSaveTimeout);
    window.layoutSaveTimeout = setTimeout(() => {
      updateSettings({ [field]: value });
    }, 500);
  };

  const toggleSection = (sectionId) => {
    handleChange(sectionId, !localSettings[sectionId]);
  };

  return (
    <div className="layout-editor">
      <section className="editor-section">
        <h2>Type de mise en page</h2>
        
        <div className="layout-grid">
          {LAYOUT_TYPES.map(layout => {
            const Icon = layout.icon;
            const isActive = localSettings.layout_type === layout.id;
            
            return (
              <button
                key={layout.id}
                className={`layout-card ${isActive ? 'active' : ''}`}
                onClick={() => handleChange('layout_type', layout.id)}
              >
                <div className="layout-icon">
                  <Icon size={32} />
                </div>
                <span className="layout-name">{layout.label}</span>
                <span className="layout-description">{layout.description}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="editor-section">
        <h2>Style du hero</h2>
        
        <div className="hero-style-grid">
          {HERO_STYLES.map(style => {
            const isActive = localSettings.hero_style === style.id;
            
            return (
              <button
                key={style.id}
                className={`hero-style-card ${isActive ? 'active' : ''}`}
                onClick={() => handleChange('hero_style', style.id)}
              >
                <span className="hero-style-name">{style.label}</span>
                <span className="hero-style-description">{style.description}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="editor-section">
        <h2>Sections affichées</h2>
        
        <div className="sections-list">
          {SECTIONS.map(section => {
            const Icon = section.icon;
            const isEnabled = localSettings[section.id] !== false;
            
            return (
              <div
                key={section.id}
                className={`section-item ${isEnabled ? 'enabled' : 'disabled'}`}
                onClick={() => toggleSection(section.id)}
              >
                <div className="section-icon">
                  <Icon size={20} />
                </div>
                
                <div className="section-info">
                  <span className="section-name">{section.label}</span>
                  <span className="section-description">{section.description}</span>
                </div>
                
                <div className="section-toggle">
                  {isEnabled ? <Eye size={18} /> : <EyeOff size={18} />}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="editor-section">
        <h2>Apparence du profil</h2>
        
        <div className="profile-appearance">
          <div className="appearance-field">
            <label>Forme de la photo de profil</label>
            <div className="shape-selector">
              {PROFILE_SHAPES.map(shape => {
                const isActive = localSettings.profile_image_shape === shape.id;
                
                return (
                  <button
                    key={shape.id}
                    className={`shape-btn ${shape.id} ${isActive ? 'active' : ''}`}
                    onClick={() => handleChange('profile_image_shape', shape.id)}
                  >
                    <div className="shape-preview" />
                    <span>{shape.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="appearance-field">
            <label>Opacité de la bannière</label>
            <input
              type="range"
              min="0"
              max="100"
              value={(localSettings.banner_overlay_opacity || 0.4) * 100}
              onChange={(e) => handleChange('banner_overlay_opacity', parseInt(e.target.value) / 100)}
              className="opacity-slider"
            />
            <span className="opacity-value">
              {Math.round((localSettings.banner_overlay_opacity || 0.4) * 100)}%
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
