import React, { useState } from 'react';
import { useProfileCustomization } from '../../../contexts/ProfileCustomizationContext';
import { Plus, Trash2, Edit2, Eye, EyeOff, GripVertical, FileText, Image as ImageIcon, Video, Code } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const sectionTypes = {
  text: { icon: FileText, label: 'Texte libre' },
  gallery: { icon: ImageIcon, label: 'Galerie' },
  video: { icon: Video, label: 'Vidéo' },
  embed: { icon: Code, label: 'Embed' },
};

export default function ContentPanel() {
  const { customSections, addCustomSection, updateCustomSection, removeCustomSection } = useProfileCustomization();
  const [isAdding, setIsAdding] = useState(false);
  const [newSection, setNewSection] = useState({ 
    section_type: 'text', 
    title: '', 
    content: '' 
  });
  const [editingId, setEditingId] = useState(null);

  const handleAdd = async () => {
    if (!newSection.title) return;
    try {
      await addCustomSection(newSection);
      setNewSection({ section_type: 'text', title: '', content: '' });
      setIsAdding(false);
    } catch (err) {
      console.error('Erreur ajout section:', err);
    }
  };

  return (
    <div className="panel-content">
      <section className="panel-section">
        <div className="section-header-with-action">
          <h3>Sections personnalisées</h3>
          <button 
            className="add-btn"
            onClick={() => setIsAdding(true)}
            disabled={isAdding}
          >
            <Plus size={16} /> Ajouter une section
          </button>
        </div>

        <p className="section-description">
          Ajoutez des sections personnalisées pour enrichir votre profil
        </p>

        {/* Add Section Form */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="add-section-form"
            >
              <div className="form-group">
                <label>Type de section</label>
                <div className="section-type-options">
                  {Object.entries(sectionTypes).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <button
                        key={key}
                        type="button"
                        className={`type-option ${newSection.section_type === key ? 'active' : ''}`}
                        onClick={() => setNewSection({ ...newSection, section_type: key })}
                      >
                        <Icon size={18} />
                        {config.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="form-group">
                <label>Titre de la section</label>
                <input
                  type="text"
                  value={newSection.title}
                  onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                  placeholder="Ex: Mon parcours, Expositions..."
                />
              </div>

              <div className="form-group">
                <label>Contenu</label>
                <textarea
                  value={newSection.content}
                  onChange={(e) => setNewSection({ ...newSection, content: e.target.value })}
                  rows={4}
                  placeholder="Contenu de votre section..."
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

        {/* Sections List */}
        <div className="custom-sections-list">
          {customSections.length === 0 ? (
            <div className="empty-state">
              <FileText size={32} />
              <p>Aucune section personnalisée</p>
              <span>Ajoutez des sections pour personnaliser votre profil</span>
            </div>
          ) : (
            customSections.map((section, index) => (
              <SectionItem
                key={section.id}
                section={section}
                index={index}
                onUpdate={updateCustomSection}
                onDelete={removeCustomSection}
                isEditing={editingId === section.id}
                setEditingId={setEditingId}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function SectionItem({ section, index, onUpdate, onDelete, isEditing, setEditingId }) {
  const typeConfig = sectionTypes[section.section_type] || sectionTypes.text;
  const TypeIcon = typeConfig.icon;
  const [editData, setEditData] = useState({ 
    title: section.title, 
    content: section.content,
    is_visible: section.is_visible !== false 
  });

  const handleSave = () => {
    onUpdate(section.id, editData);
    setEditingId(null);
  };

  const toggleVisibility = () => {
    onUpdate(section.id, { is_visible: !editData.is_visible });
    setEditData(prev => ({ ...prev, is_visible: !prev.is_visible }));
  };

  if (isEditing) {
    return (
      <motion.div
        layoutId={`section-${section.id}`}
        className="section-item editing"
      >
        <div className="section-header">
          <TypeIcon size={18} />
          <input
            type="text"
            value={editData.title}
            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            className="section-title-input"
          />
        </div>
        <textarea
          value={editData.content}
          onChange={(e) => setEditData({ ...editData, content: e.target.value })}
          rows={4}
          className="section-content-input"
        />
        <div className="section-actions">
          <button className="save-btn" onClick={handleSave}>Enregistrer</button>
          <button className="cancel-btn" onClick={() => setEditingId(null)}>Annuler</button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layoutId={`section-${section.id}`}
      className={`section-item ${!editData.is_visible ? 'hidden' : ''}`}
    >
      <div className="section-drag-handle">
        <GripVertical size={16} />
      </div>
      
      <div className="section-info">
        <div className="section-type-icon">
          <TypeIcon size={16} />
        </div>
        <div className="section-details">
          <span className="section-title">{section.title}</span>
          <span className="section-type">{typeConfig.label}</span>
        </div>
      </div>
      
      <div className="section-actions">
        <button 
          className="action-btn visibility"
          onClick={toggleVisibility}
          title={editData.is_visible ? 'Masquer' : 'Afficher'}
        >
          {editData.is_visible ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
        
        <button 
          className="action-btn edit"
          onClick={() => setEditingId(section.id)}
        >
          <Edit2 size={14} />
        </button>
        
        <button 
          className="action-btn delete"
          onClick={() => onDelete(section.id)}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
}
