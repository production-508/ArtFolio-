/**
 * Éditeur de sections custom
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Trash2, Edit2, Eye, EyeOff, GripVertical,
  Type, Image as ImageIcon, Video, Code, Quote, Calendar
} from 'lucide-react';
import { useProfileCustomization } from '../contexts/ProfileCustomizationContext';

const SECTION_TYPES = [
  { id: 'text', label: 'Texte', icon: Type, description: 'Bloc de texte libre' },
  { id: 'gallery', label: 'Galerie', icon: ImageIcon, description: 'Grille d\'images' },
  { id: 'video', label: 'Vidéo', icon: Video, description: 'Vidéo embed (YouTube, Vimeo...)' },
  { id: 'embed', label: 'Embed', icon: Code, description: 'Code HTML iframe' },
  { id: 'quote', label: 'Citation', icon: Quote, description: 'Citation ou témoignage' },
  { id: 'exhibition', label: 'Exposition', icon: Calendar, description: 'Info sur une exposition' },
];

export default function ProfileSectionsEditor() {
  const { customSections, addCustomSection, updateCustomSection, deleteCustomSection } = useProfileCustomization();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [newSection, setNewSection] = useState({ section_type: 'text', title: '', content: '' });

  const handleAdd = async () => {
    if (!newSection.title.trim()) return;
    
    try {
      await addCustomSection(newSection);
      setNewSection({ section_type: 'text', title: '', content: '' });
      setShowAddModal(false);
    } catch (err) {
      console.error('Erreur ajout section:', err);
    }
  };

  const handleUpdate = async () => {
    if (!editingSection.title.trim()) return;
    
    try {
      await updateCustomSection(editingSection.id, {
        title: editingSection.title,
        content: editingSection.content,
        is_visible: editingSection.is_visible,
      });
      setEditingSection(null);
    } catch (err) {
      console.error('Erreur mise à jour section:', err);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Supprimer cette section ?')) {
      await deleteCustomSection(id);
    }
  };

  return (
    <div className="sections-editor">
      <section className="editor-section">
        <div className="section-header">
          <h2>Sections personnalisées</h2>
          <button className="btn-add" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Ajouter
          </button>
        </div>
        
        <div className="custom-sections-list">
          <AnimatePresence>
            {customSections.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="empty-state"
              >
                <Type size={48} className="empty-icon" />
                <p>Aucune section personnalisée</p>
                <button onClick={() => setShowAddModal(true)}>Créer votre première section</button>
              </motion.div>
            ) : (
              customSections.map((section) => {
                const type = SECTION_TYPES.find(t => t.id === section.section_type) || SECTION_TYPES[0];
                const Icon = type.icon;
                
                return (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`custom-section-item ${!section.is_visible ? 'hidden' : ''}`}
                  >
                    <div className="section-drag-handle">
                      <GripVertical size={16} />
                    </div>
                    
                    <div className="section-type-icon">
                      <Icon size={18} />
                    </div>
                    
                    <div className="section-info">
                      <span className="section-title">{section.title}</span>
                      <span className="section-type">{type.label}</span>
                    </div>
                    
                    <div className="section-actions">
                      <button
                        onClick={() => updateCustomSection(section.id, { is_visible: !section.is_visible })}
                        title={section.is_visible ? 'Masquer' : 'Afficher'}
                      >
                        {section.is_visible ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      
                      <button onClick={() => setEditingSection(section)} title="Modifier">
                        <Edit2 size={16} />
                      </button>
                      
                      <button onClick={() => handleDelete(section.id)} title="Supprimer">
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

      {/* Modal Ajout */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div className="modal-overlay" onClick={() => setShowAddModal(false)} />
            <motion.div className="section-modal">
              <h3>Nouvelle section</h3>
              
              <div className="section-type-grid">
                {SECTION_TYPES.map(type => {
                  const Icon = type.icon;
                  const isSelected = newSection.section_type === type.id;
                  
                  return (
                    <button
                      key={type.id}
                      className={`section-type-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => setNewSection({ ...newSection, section_type: type.id })}
                    >
                      <Icon size={24} />
                      <span className="type-label">{type.label}</span>
                      <span className="type-desc">{type.description}</span>
                    </button>
                  );
                })}
              </div>
              
              <div className="form-group">
                <label>Titre</label>
                <input
                  type="text"
                  value={newSection.title}
                  onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                  placeholder="Titre de la section"
                  autoFocus
                />
              </div>
              
              <div className="form-group">
                <label>Contenu</label>
                <textarea
                  value={newSection.content}
                  onChange={(e) => setNewSection({ ...newSection, content: e.target.value })}
                  placeholder="Contenu de la section..."
                  rows={6}
                />
              </div>
              
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowAddModal(false)}>Annuler</button>
                <button className="btn-primary" onClick={handleAdd} disabled={!newSection.title.trim()}>Créer</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal Édition */}
      <AnimatePresence>
        {editingSection && (
          <>
            <motion.div className="modal-overlay" onClick={() => setEditingSection(null)} />
            <motion.div className="section-modal">
              <h3>Modifier la section</h3>
              
              <div className="form-group">
                <label>Titre</label>
                <input
                  type="text"
                  value={editingSection.title}
                  onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                />
              </div>
              
              <div className="form-group">
                <label>Contenu</label>
                <textarea
                  value={editingSection.content || ''}
                  onChange={(e) => setEditingSection({ ...editingSection, content: e.target.value })}
                  rows={8}
                />
              </div>
              
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setEditingSection(null)}>Annuler</button>
                <button className="btn-primary" onClick={handleUpdate}>Enregistrer</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
