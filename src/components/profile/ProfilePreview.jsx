import React from 'react';
import { useProfileCustomization } from '../../contexts/ProfileCustomizationContext';

export default function ProfilePreview({ mode }) {
  const { settings, preview } = useProfileCustomization();

  if (!settings) {
    return <div className="preview-placeholder">Chargement de l'aperçu...</div>;
  }

  const data = preview || settings;
  const layout = settings.layout_type || 'grid';
  const theme = settings.theme_mode || 'dark';
  const primaryColor = settings.primary_color || '#000000';
  const accentColor = settings.accent_color || '#D4AF37';

  const containerStyle = {
    '--primary-color': primaryColor,
    '--accent-color': accentColor,
    '--font-heading': settings.font_heading || 'Cormorant Garamond',
    '--font-body': settings.font_body || 'Inter',
  };

  return (
    <div 
      className={`profile-preview-container ${mode} theme-${theme}`}
      style={containerStyle}
    >
      <div className="preview-header">
        <span className="preview-label">Aperçu</span>
        <span className={`preview-device ${mode}`}>{mode === 'desktop' ? 'Desktop' : 'Mobile'}</span>
      </div>

      <div className={`preview-frame ${mode}`}>
        {/* Hero */}
        {settings.hero_style !== 'none' && settings.show_bio !== false && (
          <div 
            className="preview-hero"
            style={settings.banner_image_url ? {
              backgroundImage: `url(${settings.banner_image_url})`,
            } : {
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor}33 100%)`
            }}
          >
            {settings.banner_image_url && (
              <div 
                className="hero-overlay"
                style={{ opacity: settings.banner_overlay_opacity || 0.4 }}
              />
            )}
            
            <div className="hero-content">
              <div className={`preview-avatar ${settings.profile_image_shape || 'circle'}`}>
                {data.avatar_url ? (
                  <img src={data.avatar_url} alt={data.name} />
                ) : (
                  <span>{data.name?.charAt(0) || '?'}</span>
                )}
              </div>
              
              <h2 style={{ fontFamily: 'var(--font-heading)' }}>{data.name || 'Votre nom'}</h2>
              <p className="preview-location">{data.location || 'Votre ville'}</p>
              
              {settings.show_social_links && data.social_links?.length > 0 && (
                <div className="preview-social">
                  {data.social_links.slice(0, 4).map(link => (
                    <span key={link.platform} className="social-dot" />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bio */}
        {settings.show_bio !== false && data.bio && (
          <div className="preview-section bio">
            <p style={{ fontFamily: 'var(--font-body)' }}>{data.bio}</p>
          </div>
        )}

        {/* Story */}
        {settings.show_story !== false && data.story && (
          <div className="preview-section story">
            <h3 style={{ fontFamily: 'var(--font-heading)' }}>Mon histoire</h3>
            <p style={{ fontFamily: 'var(--font-body)' }}>{data.story.substring(0, 150)}...</p>
          </div>
        )}

        {/* Stats */}
        {settings.show_stats !== false && (
          <div className="preview-stats">
            <div className="stat">
              <span className="stat-number" style={{ color: accentColor }}>{data.artwork_count || 0}</span>
              <span className="stat-label">Œuvres</span>
            </div>
            <div className="stat">
              <span className="stat-number" style={{ color: accentColor }}>{data.sold_count || 0}</span>
              <span className="stat-label">Ventes</span>
            </div>
            <div className="stat">
              <span className="stat-number" style={{ color: accentColor }}>{data.profile_views?.toLocaleString() || 0}</span>
              <span className="stat-label">Vues</span>
            </div>
          </div>
        )}

        {/* Gallery Preview */}
        <div className={`preview-gallery layout-${layout}`}>
          <h3 style={{ fontFamily: 'var(--font-heading)' }}>Œuvres</h3>
          
          <div className="gallery-grid">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="gallery-item">
                <div 
                  className="item-placeholder"
                  style={{ 
                    background: `linear-gradient(${45 + i * 30}deg, ${primaryColor}22, ${accentColor}11)`,
                    aspectRatio: layout === 'masonry' ? (i % 2 === 0 ? '3/4' : '4/3') : '1/1'
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        {settings.show_contact_form !== false && (
          <div className="preview-section contact">
            <h3 style={{ fontFamily: 'var(--font-heading)' }}>Contact</h3>
            <div className="contact-form-placeholder">
              <div className="form-field" />
              <div className="form-field" />
              <div className="form-field textarea" />
              <div className="form-button" style={{ background: accentColor }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
