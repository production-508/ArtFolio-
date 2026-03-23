import React, { useState } from 'react';
import { useProfileCustomization } from '../../../contexts/ProfileCustomizationContext';
import { Plus, Trash2, Edit2, GripVertical } from 'lucide-react';

const sectionTypes = [
  { id: 'text', label: 'Texte libre', icon: '📝' },
  { id: 'gallery', label: 'Galerie', icon: '🖼️' },
  { id: 'quote', label: 'Citation', icon: '"' },
  { id: 'cv_entry', label: 'CV / Parcours', icon: '🎓' },
  { id: 'exhibition', label: 'Exposition', icon: '🏛️' },
  { id: 'video', label: 'Vidéo', icon: '🎬' },
  { id: 'embed', label: 'Embed', icon: '</>' },
];

export default function ContentPanel() {
  const { customSections, addCustomSection, updateCustomSection, removeCustomSection } = useProfileCustomization();
  const [editingSection, setEditingSection] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newSection, setNewSection] = useState({ section_type: 'text', title: '', content: '' });

  const handleAdd = async () => {
    if (!newSection.title) return;
    await addCustomSection(newSection);
    setIsAdding(false);
    setNewSection({ section_type: 'text', title: '', content: '' });
  };

  const handleUpdate = async (id, updates) => {
    await updateCustomSection(id, updates);
    setEditingSection(null);
  };

  return (
    <div className="panel-content">
      <section className="panel-section">
        <div className="section-header">
          <h3>Sections Personnalisées</h3>
          <button 
            className="add-btn"
            onClick={() => setIsAdding(true)}
          >
            <Plus size={16} /> Ajouter
          </button>
        </div>

        <p className="section-desc">
          Ajoutez des sections personnalisées à votre profil (texte, galerie, CV, expositions...)
        </p>

        {/* Liste des sections */}
        <div className="sections-list">
          {customSections.length === 0 ? (
            <p className="empty-state">Aucune section personnalisée. Cliquez sur "Ajouter" pour commencer.</p>
          ) : (
            customSections.map((section, index) => (
              <div key={section.id} className={`section-item ${!section.is_visible ? 'hidden' : ''}`}>
                <div className="section-drag">
                  <GripVertical size={16} />
                </div>
                
                <div className="section-info">
                  <span className="section-type-icon">
                    {sectionTypes.find(t => t.id === section.section_type)?.icon || '📝'}
                  </span>
                  <div className="section-text">
                    <span className="section-title">{section.title}</span>
                    <span className="section-type">
                      {sectionTypes.find(t => t.id === section.section_type)?.label}
                    </span>
                  </div>
                </div>

                <div className="section-actions">
                  <button
                    onClick={() => setEditingSection(section)}
                    title="Modifier"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => removeCustomSection(section.id)}
                    title="Supprimer"
                    className="danger"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Modal d'ajout */}
      {isAdding && (
        <div className="modal-overlay" onClick={() => setIsAdding(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Ajouter une section</h3>
            
            <label>
              Type de section
              <select
                value={newSection.section_type}
                onChange={(e) => setNewSection({ ...newSection, section_type: e.target.value })}
              >
                {sectionTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.icon} {type.label}</option>
                ))}
              </select>
            </label>

            <label>
              Titre
              <input
                type="text"
                value={newSection.title}
                onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                placeholder="Titre de la section"
              />
            </label>

            <label>
              Contenu
              <textarea
                value={newSection.content}
                onChange={(e) => setNewSection({ ...newSection, content: e.target.value })}
                placeholder="Contenu de la section..."
                rows={6}
              />
            </label>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setIsAdding(false)}>Annuler</button>
              <button className="btn-primary" onClick={handleAdd}>Ajouter</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition */}
      {editingSection && (
        <div className="modal-overlay" onClick={() => setEditingSection(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Modifier la section</h3>
            
            <label>
              Titre
              <input
                type="text"
                value={editingSection.title}
                onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
              />
            </label>

            <label>
              Contenu
              <textarea
                value={editingSection.content}
                onChange={(e) => setEditingSection({ ...editingSection, content: e.target.value })}
                rows={8}
              />
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={editingSection.is_visible}
                onChange={(e) => setEditingSection({ ...editingSection, is_visible: e.target.checked })}
              />
              Visible sur le profil
            </label>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setEditingSection(null)}>Annuler</button>
              <button 
                className="btn-primary" 
                onClick={() => handleUpdate(editingSection.id, editingSection)}
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
