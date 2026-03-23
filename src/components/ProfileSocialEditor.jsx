/**
 * Éditeur de liens sociaux
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Instagram, Twitter, Facebook, Linkedin, Globe,
  Youtube, Dribbble, Github, Plus, Trash2, GripVertical, ExternalLink
} from 'lucide-react';
import { useProfileCustomization } from '../contexts/ProfileCustomizationContext';

const SOCIAL_PLATFORMS = [
  { id: 'instagram', label: 'Instagram', icon: Instagram, color: '#E4405F', placeholder: 'https://instagram.com/votrecompte' },
  { id: 'twitter', label: 'Twitter / X', icon: Twitter, color: '#1DA1F2', placeholder: 'https://twitter.com/votrecompte' },
  { id: 'facebook', label: 'Facebook', icon: Facebook, color: '#1877F2', placeholder: 'https://facebook.com/votrepage' },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: '#0A66C2', placeholder: 'https://linkedin.com/in/votreprofil' },
  { id: 'youtube', label: 'YouTube', icon: Youtube, color: '#FF0000', placeholder: 'https://youtube.com/@votrechaine' },
  { id: 'dribbble', label: 'Dribbble', icon: Dribbble, color: '#EA4C89', placeholder: 'https://dribbble.com/votrecompte' },
  { id: 'github', label: 'GitHub', icon: Github, color: '#181717', placeholder: 'https://github.com/votrecompte' },
  { id: 'website', label: 'Site web', icon: Globe, color: '#666666', placeholder: 'https://votresite.com' },
  { id: 'other', label: 'Autre', icon: Globe, color: '#999999', placeholder: 'https://...' },
];

export default function ProfileSocialEditor() {
  const { socialLinks, addSocialLink, updateSocialLink, deleteSocialLink } = useProfileCustomization();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLink, setNewLink] = useState({ platform: 'instagram', url: '' });
  const [editingId, setEditingId] = useState(null);

  const handleAdd = async () => {
    if (!newLink.url.trim()) return;
    
    try {
      await addSocialLink(newLink);
      setNewLink({ platform: 'instagram', url: '' });
      setShowAddForm(false);
    } catch (err) {
      console.error('Erreur ajout lien:', err);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Supprimer ce lien ?')) {
      await deleteSocialLink(id);
    }
  };

  const toggleVisibility = async (link) => {
    await updateSocialLink(link.id, { is_visible: !link.is_visible });
  };

  return (
    <div className="social-editor">
      <section className="editor-section">
        <div className="section-header">
          <h2>Vos liens sociaux</h2>
          <button 
            className="btn-add"
            onClick={() => setShowAddForm(true)}
          >
            <Plus size={16} /> Ajouter
          </button>
        </div>
        
        <div className="social-links-list">
          <AnimatePresence>
            {socialLinks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="empty-state"
              >
                <Globe size={48} className="empty-icon" />
                <p>Aucun lien social ajouté</p>
                <button onClick={() => setShowAddForm(true)}>Ajouter votre premier lien</button>
              </motion.div>
            ) : (
              socialLinks.map((link, index) => {
                const platform = SOCIAL_PLATFORMS.find(p => p.id === link.platform) || SOCIAL_PLATFORMS[8];
                const Icon = platform.icon;
                
                return (
                  <motion.div
                    key={link.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`social-link-item ${!link.is_visible ? 'hidden' : ''}`}
                  >
                    <div className="link-drag-handle">
                      <GripVertical size={16} />
                    </div>
                    
                    <div 
                      className="link-icon"
                      style={{ backgroundColor: platform.color }}
                    >
                      <Icon size={18} color="white" />
                    </div>
                    
                    <div className="link-info">
                      <span className="link-platform">{platform.label}</span>
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="link-url"
                      >
                        {link.url.replace(/^https?:\/\//, '')}
                        <ExternalLink size={12} />
                      </a>
                    </div>
                    
                    <div className="link-actions">
                      <button
                        className={`btn-visibility ${link.is_visible ? 'visible' : 'hidden'}`}
                        onClick={() => toggleVisibility(link)}
                        title={link.is_visible ? 'Masquer' : 'Afficher'}
                      >
                        {link.is_visible ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(link.id)}
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </section>

      <AnimatePresence>
        {showAddForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="modal-overlay"
              onClick={() => setShowAddForm(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="add-link-modal"
            >
              <h3>Ajouter un lien social</h3>
              
              <div className="platform-selector">
                {SOCIAL_PLATFORMS.map(platform => {
                  const Icon = platform.icon;
                  const isSelected = newLink.platform === platform.id;
                  
                  return (
                    <button
                      key={platform.id}
                      className={`platform-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => setNewLink({ ...newLink, platform: platform.id })}
                      style={{ '--platform-color': platform.color }}
                    >
                      <Icon size={20} />
                      <span>{platform.label}</span>
                    </button>
                  );
                })}
              </div>
              
              <div className="url-input-group">
                <label>URL du profil</label>
                <input
                  type="url"
                  value={newLink.url}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                  placeholder={SOCIAL_PLATFORMS.find(p => p.id === newLink.platform)?.placeholder}
                  autoFocus
                />
              </div>
              
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowAddForm(false)}>Annuler</button>
                <button className="btn-primary" onClick={handleAdd} disabled={!newLink.url.trim()}>Ajouter</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
