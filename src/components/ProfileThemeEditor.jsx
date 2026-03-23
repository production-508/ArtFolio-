/**
 * Éditeur de thème - Couleurs, typographie, style visuel
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Palette, RefreshCw, Moon, Sun, Monitor,
  Type, AlignLeft, AlignCenter, AlignRight
} from 'lucide-react';
import { useProfileCustomization } from '../contexts/ProfileCustomizationContext';

const PRESET_THEMES = [
  { 
    name: 'Classique', 
    primary: '#000000', 
    accent: '#D4AF37',
    fontHeading: 'Cormorant Garamond',
    fontBody: 'Inter'
  },
  { 
    name: 'Moderne', 
    primary: '#1a1a2e', 
    accent: '#00f0ff',
    fontHeading: 'Space Grotesk',
    fontBody: 'Inter'
  },
  { 
    name: 'Chaleureux', 
    primary: '#2d1810', 
    accent: '#e07b39',
    fontHeading: 'Playfair Display',
    fontBody: 'Source Sans Pro'
  },
  { 
    name: 'Minimal', 
    primary: '#ffffff', 
    accent: '#000000',
    fontHeading: 'Helvetica Neue',
    fontBody: 'Helvetica Neue'
  },
];

const FONTS = [
  { value: 'Cormorant Garamond', label: 'Cormorant Garamond (Serif)', category: 'Serif' },
  { value: 'Playfair Display', label: 'Playfair Display (Serif)', category: 'Serif' },
  { value: 'Inter', label: 'Inter (Sans-serif)', category: 'Sans-serif' },
  { value: 'Space Grotesk', label: 'Space Grotesk (Sans-serif)', category: 'Sans-serif' },
  { value: 'Source Sans Pro', label: 'Source Sans Pro (Sans-serif)', category: 'Sans-serif' },
  { value: 'Helvetica Neue', label: 'Helvetica Neue (Sans-serif)', category: 'Sans-serif' },
  { value: 'JetBrains Mono', label: 'JetBrains Mono (Monospace)', category: 'Monospace' },
];

export default function ProfileThemeEditor() {
  const { settings, updateSettings, markAsChanged } = useProfileCustomization();
  const [localSettings, setLocalSettings] = useState(settings || {});

  const handleChange = (field, value) => {
    const newSettings = { ...localSettings, [field]: value };
    setLocalSettings(newSettings);
    markAsChanged();
    
    // Debounce la sauvegarde
    clearTimeout(window.themeSaveTimeout);
    window.themeSaveTimeout = setTimeout(() => {
      updateSettings({ [field]: value });
    }, 500);
  };

  const applyPreset = (preset) => {
    const newSettings = {
      ...localSettings,
      primary_color: preset.primary,
      accent_color: preset.accent,
      font_heading: preset.fontHeading,
      font_body: preset.fontBody,
    };
    setLocalSettings(newSettings);
    updateSettings(newSettings);
  };

  return (
    <div className="theme-editor">
      <section className="editor-section">
        <h2><Palette size={20} /> Thème prédéfini</h2>
        <div className="preset-grid">
          {PRESET_THEMES.map(preset => (
            <button
              key={preset.name}
              className="preset-card"
              onClick={() => applyPreset(preset)}
              style={{ '--preset-primary': preset.primary, '--preset-accent': preset.accent }}
            >
              <div className="preset-preview">
                <div className="preset-color-primary" />
                <div className="preset-color-accent" />
              </div>
              <span className="preset-name">{preset.name}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="editor-section">
        <h2><Monitor size={20} /> Mode d'affichage</h2>
        
        <div className="theme-mode-selector">
          {[
            { id: 'dark', icon: Moon, label: 'Sombre' },
            { id: 'light', icon: Sun, label: 'Clair' },
            { id: 'auto', icon: Monitor, label: 'Auto' },
          ].map(mode => {
            const Icon = mode.icon;
            const isActive = localSettings.theme_mode === mode.id;
            
            return (
              <button
                key={mode.id}
                className={`mode-btn ${isActive ? 'active' : ''}`}
                onClick={() => handleChange('theme_mode', mode.id)}
              >
                <Icon size={20} />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="editor-section">
        <h2>Couleurs</h2>
        
        <div className="color-picker-grid">
          <div className="color-field">
            <label>Couleur principale</label>
            <div className="color-input-wrapper">
              <input
                type="color"
                value={localSettings.primary_color || '#000000'}
                onChange={(e) => handleChange('primary_color', e.target.value)}
              />
              <input
                type="text"
                value={localSettings.primary_color || '#000000'}
                onChange={(e) => handleChange('primary_color', e.target.value)}
                className="color-text-input"
              />
            </div>
          </div>
          
          <div className="color-field">
            <label>Couleur d'accent</label>
            <div className="color-input-wrapper">
              <input
                type="color"
                value={localSettings.accent_color || '#D4AF37'}
                onChange={(e) => handleChange('accent_color', e.target.value)}
              />
              <input
                type="text"
                value={localSettings.accent_color || '#D4AF37'}
                onChange={(e) => handleChange('accent_color', e.target.value)}
                className="color-text-input"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="editor-section">
        <h2><Type size={20} /> Typographie</h2>
        
        <div className="font-selectors">
          <div className="font-field">
            <label>Police des titres</label>
            <select
              value={localSettings.font_heading || 'Cormorant Garamond'}
              onChange={(e) => handleChange('font_heading', e.target.value)}
            >
              {FONTS.map(font => (
                <optgroup key={font.category} label={font.category}>
                  <option value={font.value}>{font.label}</option>
                </optgroup>
              ))}
            </select>
            <div 
              className="font-preview heading-preview"
              style={{ fontFamily: localSettings.font_heading || 'Cormorant Garamond' }}
            >
              Aa Bb Cc 123
            </div>
          </div>
          
          <div className="font-field">
            <label>Police du corps</label>
            <select
              value={localSettings.font_body || 'Inter'}
              onChange={(e) => handleChange('font_body', e.target.value)}
            >
              {FONTS.map(font => (
                <optgroup key={font.category} label={font.category}>
                  <option value={font.value}>{font.label}</option>
                </optgroup>
              ))}
            </select>
            <div 
              className="font-preview body-preview"
              style={{ fontFamily: localSettings.font_body || 'Inter' }}
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </div>
          </div>
        </div>
      </section>

      <section className="editor-section">
        <h2>Aperçu du style</h2>
        <div 
          className="style-preview"
          style={{
            '--preview-primary': localSettings.primary_color || '#000000',
            '--preview-accent': localSettings.accent_color || '#D4AF37',
            '--preview-heading': localSettings.font_heading || 'Cormorant Garamond',
            '--preview-body': localSettings.font_body || 'Inter',
          }}
        >
          <div className="preview-card">
            <h3>Titre d'exemple</h3>
            <p>Voici comment votre texte apparaîtra avec les polices et couleurs sélectionnées.</p>
            <button className="preview-btn">Bouton d'action</button>
          </div>
        </div>
      </section>
    </div>
  );
}
