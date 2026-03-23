import React from 'react';
import { useProfileCustomization } from '../../../contexts/ProfileCustomizationContext';
import { Moon, Sun, Monitor, Circle, Square, Rounded } from 'lucide-react';

const themes = [
  { id: 'dark', label: 'Sombre', icon: Moon },
  { id: 'light', label: 'Clair', icon: Sun },
  { id: 'auto', label: 'Auto', icon: Monitor },
];

const profileShapes = [
  { id: 'circle', label: 'Rond', icon: Circle },
  { id: 'square', label: 'Carré', icon: Square },
  { id: 'rounded', label: 'Arrondi', icon: Rounded },
];

const presetColors = [
  { primary: '#000000', accent: '#D4AF37', name: 'Classique Or' },
  { primary: '#0A0A0A', accent: '#00F0FF', name: 'Néon Cyan' },
  { primary: '#1A1A2E', accent: '#E94560', name: 'Rouge Profond' },
  { primary: '#2C2C2C', accent: '#8B4513', name: 'Industriel' },
  { primary: '#FFFFFF', accent: '#1A1A1A', name: 'Minimal Blanc' },
  { primary: '#0D1B2A', accent: '#778DA9', name: 'Bleu Nuit' },
];

export default function AppearancePanel() {
  const { settings, updateSettings } = useProfileCustomization();

  if (!settings) return null;

  return (
    <div className="panel-content">
      <section className="panel-section">
        <h3>Thème</h3>
        <div className="theme-selector">
          {themes.map(theme => (
            <button
              key={theme.id}
              className={`theme-option ${settings.theme_mode === theme.id ? 'active' : ''}`}
              onClick={() => updateSettings({ theme_mode: theme.id })}
            >
              <theme.icon size={20} />
              <span>{theme.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="panel-section">
        <h3>Palette de couleurs</h3㸾
        <div className="color-presets">
          {presetColors.map((preset, idx) => (
            <button
              key={idx}
              className={`color-preset ${
                settings.primary_color === preset.primary && settings.accent_color === preset.accent 
                  ? 'active' : ''
              }`}
              onClick={() => updateSettings({
                primary_color: preset.primary,
                accent_color: preset.accent
              })}
            >
              <div className="preset-preview">
                <div 
                  className="preset-primary" 
                  style={{ backgroundColor: preset.primary }}
                />
                <div 
                  className="preset-accent" 
                  style={{ backgroundColor: preset.accent }}
                />
              </div>
              <span>{preset.name}</span>
            </button>
          ))}
        </div>

        <div className="custom-colors">
          <div className="color-input-group">
            <label>Couleur principale</label>
            <div className="color-picker-wrapper">
              <input
                type="color"
                value={settings.primary_color || '#000000'}
                onChange={(e) => updateSettings({ primary_color: e.target.value })}
              />
              <input
                type="text"
                value={settings.primary_color || '#000000'}
                onChange={(e) => updateSettings({ primary_color: e.target.value })}
                className="color-text-input"
              />
            </div>
          </div>

          <div className="color-input-group">
            <label>Couleur d'accent</label>
            <div className="color-picker-wrapper">
              <input
                type="color"
                value={settings.accent_color || '#D4AF37'}
                onChange={(e) => updateSettings({ accent_color: e.target.value })}
              />
              <input
                type="text"
                value={settings.accent_color || '#D4AF37'}
                onChange={(e) => updateSettings({ accent_color: e.target.value })}
                className="color-text-input"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="panel-section">
        <h3>Photo de profil</h3>
        <div className="profile-shape-selector">
          {profileShapes.map(shape => (
            <button
              key={shape.id}
              className={`shape-option ${settings.profile_image_shape === shape.id ? 'active' : ''}`}
              onClick={() => updateSettings({ profile_image_shape: shape.id })}
            >
              <shape.icon size={24} />
              <span>{shape.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="panel-section">
        <h3>Bannière</h3>
        <div className="banner-upload">
          <div className="upload-zone">
            {settings.banner_image_url ? (
              <img 
                src={settings.banner_image_url} 
                alt="Bannière" 
                className="banner-preview"
              />
            ) : (
              <div className="upload-placeholder">
                <Image size={32} />
                <p>Glissez une image ou cliquez pour parcourir</p>
                <span>Recommandé : 1920×400px</span>
              </div>
            )}
          </div>

          <div className="banner-overlay-control">
            <label>Opacité du voile</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.banner_overlay_opacity || 0.4}
              onChange={(e) => updateSettings({ 
                banner_overlay_opacity: parseFloat(e.target.value) 
              })}
            />
            <span>{Math.round((settings.banner_overlay_opacity || 0.4) * 100)}%</span>
          </div>
        </div>
      </section>

      <section className="panel-section">
        <h3>Typographie</h3>
        <div className="font-selectors">
          <div className="font-group">
            <label>Police des titres</label>
            <select
              value={settings.font_heading || 'Cormorant Garamond'}
              onChange={(e) => updateSettings({ font_heading: e.target.value })}
            >
              <option value="Cormorant Garamond">Cormorant Garamond (Serif)</option>
              <option value="Playfair Display">Playfair Display (Serif)</option>
              <option value="Inter">Inter (Sans-serif)</option>
              <option value="Space Grotesk">Space Grotesk (Modern)</option>
            </select>
          </div>

          <div className="font-group">
            <label>Police du texte</label>
            <select
              value={settings.font_body || 'Inter'}
              onChange={(e) => updateSettings({ font_body: e.target.value })}
            >
              <option value="Inter">Inter (Moderne)</option>
              <option value="Source Sans Pro">Source Sans Pro (Lisible)</option>
              <option value="Merriweather">Merriweather (Lecture)</option>
            </select>
          </div>
        </div>
      </section>
    </div>
  );
}
