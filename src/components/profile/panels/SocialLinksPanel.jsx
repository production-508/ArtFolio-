import React, { useState } from 'react';
import { useProfileCustomization } from '../../../contexts/ProfileCustomizationContext';
import { 
  Instagram, Twitter, Facebook, Linkedin, Globe, 
  Youtube, Music2, Dribbble, Figma, Github,
  Plus, Trash2, GripVertical, ExternalLink
} from 'lucide-react';
import { motion, Reorder } from 'framer-motion';

const platformConfig = {
  instagram: { icon: Instagram, label: 'Instagram', color: '#E4405F' },
  twitter: { icon: Twitter, label: 'Twitter / X', color: '#1DA1F2' },
  facebook: { icon: Facebook, label: 'Facebook', color: '#1877F2' },
  linkedin: { icon: Linkedin, label: 'LinkedIn', color: '#0A66C2' },
  youtube: { icon: Youtube, label: 'YouTube', color: '#FF0000' },
  tiktok: { icon: Music2, label: 'TikTok', color: '#000000' },
  dribbble: { icon: Dribbble, label: 'Dribbble', color: '#EA4C89' },
  behance: { icon: Figma, label: 'Behance', color: '#1769FF' },
  website: { icon: Globe, label: 'Site web', color: '#666666' },
  github: { icon: Github, label: 'GitHub', color: '#333333' },
};

export default function SocialLinksPanel() {
  const { socialLinks, addSocialLink, updateSocialLink, removeSocialLink, reorderSocialLinks } = useProfileCustomization();
  const [isAdding, setIsAdding] = useState(false);
  const [newLink, setNewLink] = useState({ platform: 'instagram', url: '' });
  const [editingId, setEditingId] = useState(null);

  const handleAdd = async () => {
    if (!newLink.url) return;
    try {
      await addSocialLink(newLink);
      setNewLink({ platform: 'instagram', url: '' });
      setIsAdding(false);
    } catch (err) {
      console.error('Erreur ajout lien:', err);
    }
  };

  const handleReorder = (newOrder) => {
    reorderSocialLinks(newOrder);
  };

  return (
    <div className="panel-content">
      <section className="panel-section">
        <div className="section-header-with-action">
          <h3>Liens sociaux</h3>
          <button 
            className="add-btn"
            onClick={() => setIsAdding(true)}
            disabled={isAdding}
          >
            <Plus size={16} /> Ajouter
          </button>
        </div>

        <p className="section-description">
          Ajoutez vos réseaux sociaux pour que les visiteurs puissent vous suivre
        </p>

        {/* Add New Link Form */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="add-link-form"
            >
              <div className="form-row">
                <select
                  value={newLink.platform}
                  onChange={(e) => setNewLink({ ...newLink, platform: e.target.value })}
                >
                  {Object.entries(platformConfig).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newLink.url}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                />
              </div>
              <div className="form-actions">
                <button className="cancel-btn" onClick={() => setIsAdding(false)}>
                  Annuler
                </button>
                <button className="confirm-btn" onClick={handleAdd}>
                  Ajouter
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Links List */}
        <div className="social-links-list">
          {socialLinks.length === 0 ? (
            <div className="empty-state">
              <Share2 size={32} />
              <p>Aucun lien social ajouté</p>
            </div>
          ) : (
            socialLinks.map((link, index) => (
              <SocialLinkItem
                key={link.id}
                link={link}
                index={index}
                onUpdate={updateSocialLink}
                onDelete={removeSocialLink}
                isEditing={editingId === link.id}
                setEditingId={setEditingId}
              />
            ))
          )}
        </div>
      </section>

      <section className="panel-section">
        <h3>Aperçu</h3>
        <div className="social-preview">
          {socialLinks.filter(l => l.is_visible !== false).map(link => {
            const config = platformConfig[link.platform] || platformConfig.website;
            const Icon = config.icon;
            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="social-preview-item"
                style={{ '--platform-color': config.color }}
              >
                <Icon size={20} />
                <span>{config.label}</span>
              </a>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function SocialLinkItem({ link, index, onUpdate, onDelete, isEditing, setEditingId }) {
  const config = platformConfig[link.platform] || platformConfig.website;
  const Icon = config.icon;
  const [editData, setEditData] = useState({ url: link.url, is_visible: link.is_visible !== false });

  const handleSave = () => {
    onUpdate(link.id, editData);
    setEditingId(null);
  };

  if (isEditing) {
    return (
      <motion.div
        layoutId={`link-${link.id}`}
        className="social-link-item editing"
      >
        <div className="link-platform">
          <Icon size={20} style={{ color: config.color }} />
          <span>{config.label}</span>
        </div>
        <input
          type="url"
          value={editData.url}
          onChange={(e) => setEditData({ ...editData, url: e.target.value })}
          className="link-url-input"
        />
        <label className="visibility-checkbox">
          <input
            type="checkbox"
            checked={editData.is_visible}
            onChange={(e) => setEditData({ ...editData, is_visible: e.target.checked })}
          />
          Visible
        </label>
        <div className="link-actions">
          <button className="save-btn" onClick={handleSave}>Enregistrer</button>
          <button className="cancel-btn" onClick={() => setEditingId(null)}>Annuler</button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layoutId={`link-${link.id}`}
      className={`social-link-item ${link.is_visible === false ? 'hidden' : ''}`}
    >
      <div className="drag-handle">
        <GripVertical size={16} />
      </div>
      
      <div className="link-platform">
        <Icon size={20} style={{ color: config.color }} />
        <span>{config.label}</span>
      </div>
      
      <div className="link-url">
        {link.url}
      </div>
      
      <div className="link-actions">
        <button 
          className="action-btn edit"
          onClick={() => setEditingId(link.id)}
        >
          Modifier
        </button>
        <a 
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="action-btn view"
        >
          <ExternalLink size={14} />
        </a>
        <button 
          className="action-btn delete"
          onClick={() => onDelete(link.id)}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
}
