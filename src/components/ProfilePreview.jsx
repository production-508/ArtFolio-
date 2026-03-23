/**
 * Prévisualisation du profil tel que les visiteurs le voient
 */
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, MapPin, Link as LinkIcon, Mail, ExternalLink } from 'lucide-react';
import { useProfileCustomization } from '../contexts/ProfileCustomizationContext';

export default function ProfilePreview({ device = 'desktop' }) {
  const { loadPreview } = useProfileCustomization();
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPreview = async () => {
      setLoading(true);
      const data = await loadPreview();
      setPreviewData(data);
      setLoading(false);
    };
    fetchPreview();
  }, [loadPreview]);

  if (loading) {
    return (
      <div className="profile-preview-loading">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!previewData) {
    return (
      <div className="profile-preview-error">
        <p>Impossible de charger l'aperçu</p>
      </div>
    );
  }

  const { 
    name, bio, location, avatar_url, banner_image_url,
    primary_color, accent_color, layout_type, font_heading, font_body,
    social_links, custom_sections
  } = previewData;

  const style = {
    '--profile-primary': primary_color || '#000000',
    '--profile-accent': accent_color || '#D4AF37',
    '--profile-heading': font_heading || 'Cormorant Garamond',
    '--profile-body': font_body || 'Inter',
  };

  return (
    <div className={`profile-preview ${device}`} style={style}>
      {/* Bannière */}
      <div 
        className="preview-banner"
        style={{ backgroundImage: banner_image_url ? `url(${banner_image_url})` : undefined }}
      >
        <div className="banner-overlay" />
      </div>

      {/* Header profil */}
      <div className="preview-header">
        <div className="preview-avatar">
          {avatar_url ? (
            <img src={avatar_url} alt={name} />
          ) : (
            <div className="avatar-placeholder">{name?.charAt(0)}</div>
          )}
        </div>

        <div className="preview-info">
          <h1 style={{ fontFamily: 'var(--profile-heading)' }}>{name}</h1>
          
          {bio && <p className="preview-bio" style={{ fontFamily: 'var(--profile-body)' }}>{bio}</p>}
          
          <div className="preview-meta">
            {location && (
              <span><MapPin size={14} /> {location}</span>
            )}
            <span><Eye size={14} /> {previewData.profile_views || 0} vues</span>
          </div>
        </div>
      </div>

      {/* Liens sociaux */}
      {social_links?.length > 0 && (
        <div className="preview-social-links">
          {social_links.map(link => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
            >
              <ExternalLink size={14} />
              {link.platform}
            </a>
          ))}
        </div>
      )}

      {/* Sections personnalisées */}
      {custom_sections?.length > 0 && (
        <div className="preview-custom-sections">
          {custom_sections.map(section => (
            <section key={section.id} className="preview-section">
              <h2 style={{ fontFamily: 'var(--profile-heading)' }}>{section.title}</h2>
              <div 
                className="section-content"
                style={{ fontFamily: 'var(--profile-body)' }}
                dangerouslySetInnerHTML={{ __html: section.content }}
              />
            </section>
          ))}
        </div>
      )}

      {/* Grille d'œuvres selon le layout */}
      <section className="preview-works">
        <h2 style={{ fontFamily: 'var(--profile-heading)' }}>Œuvres</h2>
        
        <div className={`works-grid layout-${layout_type}`}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="work-placeholder">
              <div className="work-image-placeholder" />
              <span>Œuvre {i}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="preview-contact">
        <h2 style={{ fontFamily: 'var(--profile-heading)' }}>Contact</h2>
        <button className="contact-btn">
          <Mail size={16} /> Envoyer un message
        </button>
      </section>
    </div>
  );
}
