import React from 'react';
import { useProfileCustomization } from '../../../contexts/ProfileCustomizationContext';
import { Eye, Heart, Share2, Mail } from 'lucide-react';

export default function ProfilePreview({ mode }) {
  const { settings, socialLinks, preview } = useProfileCustomization();

  if (!settings) {
    return (<div className="preview-loading">Chargement de l'aperçu...</div>);
  }

  const primaryColor = settings.primary_color || '#000000';
  const accentColor = settings.accent_color || '#D4AF37';
  const isDark = settings.theme_mode === 'dark' || 
    (settings.theme_mode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const previewStyles = {
    '--primary-color': primaryColor,
    '--accent-color': accentColor,
    '--bg-color': isDark ? '#000000' : '#FFFFFF',
    '--text-color': isDark ? '#FFFFFF' : '#1A1A1A',
    '--text-muted': isDark ? '#888888' : '#666666',
    fontFamily: settings.font_body || 'Inter, sans-serif',
  };

  return (
    <div 
      className={`profile-preview ${mode} ${isDark ? 'dark' : 'light'}`}
      style={previewStyles}
    >
      {/* Banner */}
      {(settings.hero_style !== 'none' || settings.banner_image_url) && (
        <div 
          className="preview-banner"
          style={{
            backgroundImage: settings.banner_image_url 
              ? `url(${settings.banner_image_url})` 
              : 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
            opacity: 1 - (settings.banner_overlay_opacity || 0.4),
          }}
        >
          {settings.hero_style === 'carousel' && !settings.banner_image_url && (
            <div className="carousel-indicator">
              <span>01 / 04</span>
            </div>
          )}
        </div>
      )}

      {/* Profile Header */}
      <div className="preview-header">
        <div 
          className={`preview-avatar ${settings.profile_image_shape || 'circle'}`}
          style={{ borderColor: accentColor }}
        >
          <img src="https://placehold.co/150" alt="Avatar" />
        </div>

        <div className="preview-info">
          <h2 style={{ fontFamily: settings.font_heading || 'Cormorant Garamond, serif' }}>
            Votre Nom
          </h2>
          
          <p className="preview-location">Paris, France</p>
          
          {settings.show_bio !== false && (
            <p className="preview-bio">
              Artiste contemporain·e explorant les frontières entre tradition et innovation...
            </p>
          )}

          {/* Social Links Preview */}
          {settings.show_social_links !== false && socialLinks.filter(l => l.is_visible !== false).length > 0 && (
            <div className="preview-social">
              {socialLinks.filter(l => l.is_visible !== false).slice(0, 4).map(link => (
                <span key={link.id} className="social-dot" style={{ backgroundColor: accentColor }} />
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="preview-actions">
            <button className="preview-btn primary" style={{ backgroundColor: accentColor }}>
              <Heart size={14} /> Suivre
            </button>
            <button className="preview-btn secondary">
              <Mail size={14} /> Contacter
            </button>
          </div>
        </div>
      </div>

      {/* Stats Preview */}
      {settings.show_stats !== false && (
        <div className="preview-stats">
          <div className="stat-item">
            <span className="stat-value">{stats?.total_artworks || 12}</span>
            <span className="stat-label">Œuvres</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats?.sold_artworks || 3}</span>
            <span className="stat-label">Ventes</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats?.profile_views || 1247}</span>
            <span className="stat-label">Vues</span>
          </div>
        </div>
      )}

      {/* Gallery Preview */}
      {settings.show_bio !== false && (
        <div className="preview-section">
          <h3 style={{ fontFamily: settings.font_heading || 'Cormorant Garamond, serif' }}>
            Œuvres
          </h3>
          <div className={`preview-gallery ${settings.layout_type || 'grid'}`}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="preview-artwork">
                <div className="artwork-placeholder" />
                <div className="artwork-info">
                  <span className="artwork-title">Titre de l'œuvre {i}</span>
                  <span className="artwork-price">2 500 €</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="preview-footer">
        <span>ArtFolio — Galerie contemporaine en ligne</span>
      </div>
    </div>
  );
}
