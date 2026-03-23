import React, { useState } from 'react';
import { useProfileCustomization } from '../../../contexts/ProfileCustomizationContext';
import { Plus, Trash2, GripVertical, ExternalLink } from 'lucide-react';

const platforms = [
  { id: 'instagram', label: 'Instagram', color: '#E4405F', icon: '📷' },
  { id: 'twitter', label: 'Twitter / X', color: '#1DA1F2', icon: '🐦' },
  { id: 'facebook', label: 'Facebook', color: '#1877F2', icon: '👤' },
  { id: 'linkedin', label: 'LinkedIn', color: '#0A66C2', icon: '💼' },
  { id: 'behance', label: 'Behance', color: '#1769FF', icon: '🎨' },
  { id: 'dribbble', label: 'Dribbble', color: '#EA4C89', icon: '🏀' },
  { id: 'youtube', label: 'YouTube', color: '#FF0000', icon: '▶️' },
  { id: 'tiktok', label: 'TikTok', color: '#000000', icon: '🎵' },
  { id: 'website', label: 'Site web', color: '#666666', icon: '🌐' },
  { id: 'other', label: 'Autre', color: '#999999', icon: '🔗' },
];

export default function SocialLinksPanel() {
  const { socialLinks, addSocialLink, updateSocialLink, removeSocialLink } = useProfileCustomization();
  const [newLink, setNewLink] = useState({ platform: 'instagram', url: '' });
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    if (!newLink.url) return;
    await addSocialLink(newLink);
    setIsAdding(false);
    setNewLink({ platform: 'instagram', url: '' });
  };

  const toggleVisibility = async (link) => {
    await updateSocialLink(link.id, { is_visible: !link.is_visible });
  };

  return (
    <div className="panel-content">
      <section className="panel-section">
        <div className="section-header">
          <h3>Réseaux Sociaux</h3>
          <button className="add-btn" onClick={() => setIsAdding(true)}>
            <Plus size={16} /> Ajouter
          </button>
        </div>

        <p className="section-desc">
          Connectez vos réseaux sociaux pour que les visiteurs puissent vous suivre
        </p>

        {/* Liste des liens */}
        <div className="social-links-list">
          {socialLinks.length === 0 ? (
            <p className="empty-state">Aucun réseau social. Ajoutez vos liens pour les afficher sur votre profil.</p>
          ) : (
            socialLinks.map((link, index) => {
              const platform = platforms.find(p => p.id === link.platform);
              return (
                <div key={link.id} className={`social-link-item ${!link.is_visible ? 'hidden' : ''}`}>
                  <div className="link-drag">
                    <GripVertical size={16} />
                  </div>

                  <div 
                    className="link-icon"
                    style={{ backgroundColor: platform?.color || '#666' }}
                  >
                    {platform?.icon || '🔗'}
                  </div>

                  <div className="link-info">
                    <span className="link-platform">{platform?.label || link.platform}</span>
                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="link-url"
                    >
                      {link.url.replace(/^https?:\/\//, '').substring(0, 40)}
                      {link.url.length > 40 ? '...' : ''}
                    </a>
                  </div>

                  <div className="link-actions">
                    <button
                      onClick={() => toggleVisibility(link)}
                      className={link.is_visible ? 'active' : ''}
                      title={link.is_visible ? 'Masquer' : 'Afficher'}
                    >
                      {link.is_visible ? '👁️' : '🚫'}
                    </button>
                    <a 
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Ouvrir"
                    >
                      <ExternalLink size={16} />
                    </a>
                    <button
                      onClick={() => removeSocialLink(link.id)}
                      className="danger"
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Modal d'ajout */}
      {isAdding && (
        <div className="modal-overlay" onClick={() => setIsAdding(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Ajouter un réseau social</h3>

            <label>
              Plateforme
              <div className="platform-grid">
                {platforms.map(platform => (
                  <button
                    key={platform.id}
                    className={`platform-btn ${newLink.platform === platform.id ? 'selected' : ''}`}
                    onClick={() => setNewLink({ ...newLink, platform: platform.id })}
                    style={{ 
                      borderColor: newLink.platform === platform.id ? platform.color : 'transparent'
                    }}
                  >
                    <span className="platform-icon" style={{ color: platform.color }}>
                      {platform.icon}
                    </span>
                    <span className="platform-name">{platform.label}</span>
                  </button>
                ))}
              </div>
            </label>

            <label>
              URL
              <input
                type="url"
                value={newLink.url}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                placeholder="https://..."
                autoFocus
              />
            </label>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setIsAdding(false)}>
                Annuler
              </button>
              <button className="btn-primary" onClick={handleAdd} disabled={!newLink.url}>
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
