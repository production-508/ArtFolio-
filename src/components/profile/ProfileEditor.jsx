import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palette, Layout, Type, Image, Link, Share2, Eye, 
  Save, RotateCcw, Monitor, Smartphone, Globe,
  ChevronRight, Check, AlertCircle
} from 'lucide-react';
import { useProfileCustomization } from '../../contexts/ProfileCustomizationContext';
import AppearancePanel from './panels/AppearancePanel';
import LayoutPanel from './panels/LayoutPanel';
import ContentPanel from './panels/ContentPanel';
import SocialLinksPanel from './panels/SocialLinksPanel';
import SEOPanel from './panels/SEOPanel';
import ProfilePreview from './ProfilePreview';
import './ProfileEditor.css';

const tabs = [
  { id: 'appearance', label: 'Apparence', icon: Palette },
  { id: 'layout', label: 'Layout', icon: Layout },
  { id: 'content', label: 'Contenu', icon: Type },
  { id: 'social', label: 'Réseaux', icon: Share2 },
  { id: 'seo', label: 'SEO', icon: Globe },
];

const deviceModes = [
  { id: 'desktop', label: 'Desktop', icon: Monitor },
  { id: 'mobile', label: 'Mobile', icon: Smartphone },
];

export default function ProfileEditor() {
  const {
    settings,
    loading,
    error,
    hasUnsavedChanges,
    activeTab,
    setActiveTab,
    loadProfileData,
    saveSettings,
    refreshPreview
  } = useProfileCustomization();

  const [previewMode, setPreviewMode] = useState('desktop');
  const [showPreview, setShowPreview] = useState(true);
  const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, saved, error

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      await saveSettings();
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('error');
    }
  };

  const renderPanel = () => {
    switch (activeTab) {
      case 'appearance': return <AppearancePanel />;
      case 'layout': return <LayoutPanel />;
      case 'content': return <ContentPanel />;
      case 'social': return <SocialLinksPanel />;
      case 'seo': return <SEOPanel />;
      default: return <AppearancePanel />;
    }
  };

  return (
    <div className="profile-editor">
      {/* Header */}
      <header className="editor-header">
        <div className="editor-header-left">
          <h1>Personnalisation du Profil</h1>
          <p className="editor-subtitle">
            Personnalisez votre page artiste pour refléter votre univers
          </p>
        </div>

        <div className="editor-header-actions">
          {/* Device Toggle */}
          <div className="device-toggle">
            {deviceModes.map(mode => (
              <button
                key={mode.id}
                className={`device-btn ${previewMode === mode.id ? 'active' : ''}`}
                onClick={() => setPreviewMode(mode.id)}
                title={mode.label}
              >
                <mode.icon size={18} />
              </button>
            ))}
          </div>

          {/* Preview Toggle */}
          <button
            className={`preview-toggle ${showPreview ? 'active' : ''}`}
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye size={18} />
            <span>Aperçu</span>
          </button>

          {/* Save Button */}
          <button
            className={`save-btn ${saveStatus} ${hasUnsavedChanges ? 'unsaved' : ''}`}
            onClick={handleSave}
            disabled={loading || saveStatus === 'saving'}
          >
            {saveStatus === 'saving' ? (
              <><RotateCcw className="spin" size={18} /> Sauvegarde...</>
            ) : saveStatus === 'saved' ? (
              <><Check size={18} /> Sauvegardé</>
            ) : (
              <><Save size={18} /> Sauvegarder</>
            )}
          </button>
        </div>
      </header>

      {/* Unsaved Changes Warning */}
      <AnimatePresence>
        {hasUnsavedChanges && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="unsaved-warning"
          >
            <AlertCircle size={16} />
            <span>Vous avez des modifications non sauvegardées</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`editor-layout ${showPreview ? 'with-preview' : ''}`}>
        {/* Sidebar Navigation */}
        <nav className="editor-sidebar">
          <div className="sidebar-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`sidebar-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon size={20} />
                <span>{tab.label}</span>
                <ChevronRight size={16} className="tab-arrow" />
              </button>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="sidebar-actions">
            <button className="action-btn" onClick={refreshPreview}>
              <Eye size={16} /> Rafraîchir l'aperçu
            </button>
          </div>
        </nav>

        {/* Main Content Panel */}
        <motion.main
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="editor-panel"
        >
          {loading ? (
            <div className="loading-state">Chargement...</div>
          ) : error ? (
            <div className="error-state">{error}</div>
          ) : (
            renderPanel()
          )}
        </motion.main>

        {/* Preview Panel */}
        <AnimatePresence>
          {showPreview && (
            <motion.aside
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className={`preview-panel ${previewMode}`}
            >
              <ProfilePreview mode={previewMode} />
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
