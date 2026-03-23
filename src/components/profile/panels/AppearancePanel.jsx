import React from 'react';
import { useProfileCustomization } from '../../../contexts/ProfileCustomizationContext';

const presetColors = [
  { name: 'Noir classique', primary: '#000000', accent: '#D4AF37' },
  { name: 'Bleu profond', primary: '#0A1929', accent: '#00F0FF' },
  { name: 'Rouge brique', primary: '#2C0A0A', accent: '#E63946' },
  { name: 'Vert forêt', primary: '#0A2C1A', accent: '#2A9D8F' },
  { name: 'Violet royal', primary: '#1A0A2C', accent: '#9B5DE5' },
  { name: 'Terracotta', primary: '#2C1810', accent: '#E07A5F' },
];

const fonts = [
  { id: 'Cormorant Garamond', label: 'Cormorant Garamond', style: 'serif' },
  { id: 'Playfair Display', label: 'Playfair Display', style: 'serif' },
  { id: 'Inter', label: 'Inter', style: 'sans-serif' },
  { id: 'Space Grotesk', label: 'Space Grotesk', style: 'sans-serif' },
  { id: 'DM Sans', label: 'DM Sans', style: 'sans-serif' },
];

export default function AppearancePanel() {
  const { settings, updateSettings } = useProfileCustomization();

  if (!settings) return null;

  return (
    <div className="panel-content">
      {/* Thème */}
      <section className="panel-section">
        <h3>Thème</h3>
        <div className="theme-options">
          {['dark', 'light', 'auto'].map(theme => (
            <button
              key={theme}
              className={`theme-btn ${settings.theme_mode === theme ? 'selected' : ''}`}
              onClick={() => updateSettings({ theme_mode: theme })}
            >
              <span className="theme-preview theme-${theme}" />
              <span className="theme-label">
                {theme === 'dark' ? 'Sombre' : theme === 'light' ? 'Clair' : 'Auto'}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Couleurs */}
      <section className="panel-section">
        <h3>Couleurs</h3>
        <p className="section-desc">Personnalisez les couleurs de votre profil</p>

        {/* Presets */}
        <div className="color-presets">
          <span className="presets-label">Préréglages :</span>
          <div className="presets-grid">
            {presetColors.map(preset => (
              <button
                key={preset.name}
                className="preset-btn"
                onClick={() => updateSettings({ 
                  primary_color: preset.primary, 
                  accent_color: preset.accent 
                })}
                title={preset.name}
              >
                <span 
                  className="preset-color" 
                  style={{ background: preset.primary }}
                />
                <span 
                  className="preset-accent" 
                  style={{ background: preset.accent }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Custom colors */}
        <div className="color-inputs">
          <label className="color-field">
            <span>Couleur principale</span>
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
                placeholder="#000000"
              />
            </div>
          </label>

          <label className="color-field">
            <span>Couleur d\'accent</span>
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
                placeholder="#D4AF37"
              />
            </div>
          </label>
        </div>
      </section>

      {/* Typographie */}
      <section className="panel-section">
        <h3>Typographie</h3>

        <label className="font-field">
          <span>Police des titres</span>
          <select
            value={settings.font_heading || 'Cormorant Garamond'}
            onChange={(e) => updateSettings({ font_heading: e.target.value })}
          >
            {fonts.map(font => (
              <option key={font.id} value={font.id}>
                {font.label}
              </option>
            ))}
          </select>
        </label>

        <label className="font-field">
          <span>Police du corps</span>
          <select
            value={settings.font_body || 'Inter'}
            onChange={(e) => updateSettings({ font_body: e.target.value })}
          >
            {fonts.map(font => (
              <option key={font.id} value={font.id}>
                {font.label}
              </option>
            ))}
          </select>
        </label>
      </section>

      {/* Image de profil */}
      <section className="panel-section">
        <h3>Image de profil</h3>
        
        <div className="profile-shape-options">
          {['circle', 'rounded', 'square'].map(shape => (
            <button
              key={shape}
              className={`shape-btn ${settings.profile_image_shape === shape ? 'selected' : ''}`}
              onClick={() => updateSettings({ profile_image_shape: shape })}
            >
              <span className={`shape-preview shape-${shape}`} />
              <span>
                {shape === 'circle' ? 'Ronde' : shape === 'rounded' ? 'Arrondie' : 'Carrée'}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Bannière */}
      <section className="panel-section">
        <h3>Bannière</h3>
        
        <label className="image-field">
          <span>Image de bannière</span>
          <input
            type="url"
            value={settings.banner_image_url || ''}
            onChange={(e) => updateSettings({ banner_image_url: e.target.value })}
            placeholder="https://exemple.com/banniere.jpg"
          />
        </label>

        {settings.banner_image_url && (
          <div className="banner-preview">
            <img src={settings.banner_image_url} alt="Bannière" />
            <label className="opacity-field">
              <span>Opacité du voile</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.banner_overlay_opacity || 0.4}
                onChange={(e) => updateSettings({ banner_overlay_opacity: parseFloat(e.target.value) })}
              />
              <span>{Math.round((settings.banner_overlay_opacity || 0.4) * 100)}%</span>
            </label>
          </div>
        )}
      </section>
    </div>
  );
}
