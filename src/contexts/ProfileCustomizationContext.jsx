import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as profileService from '../services/profileService';

const ProfileCustomizationContext = createContext(null);

export function ProfileCustomizationProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [socialLinks, setSocialLinks] = useState([]);
  const [customSections, setCustomSections] = useState([]);
  const [stats, setStats] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('appearance');

  // Chargement initial
  const loadProfileData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [settingsData, linksData, sectionsData, statsData] = await Promise.all([
        profileService.getProfileSettings(),
        profileService.getSocialLinks(),
        profileService.getCustomSections(),
        profileService.getProfileStats()
      ]);
      setSettings(settingsData);
      setSocialLinks(linksData);
      setCustomSections(sectionsData);
      setStats(statsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mise à jour des paramètres
  const updateSettings = useCallback(async (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    setHasUnsavedChanges(true);
  }, []);

  // Sauvegarde des paramètres
  const saveSettings = useCallback(async () => {
    setLoading(true);
    try {
      const updated = await profileService.updateProfileSettings(settings);
      setSettings(updated);
      setHasUnsavedChanges(false);
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [settings]);

  // Gestion des liens sociaux
  const addSocialLink = useCallback(async (link) => {
    const newLink = await profileService.addSocialLink(link);
    setSocialLinks(prev => [...prev, newLink]);
    return newLink;
  }, []);

  const updateSocialLink = useCallback(async (id, link) => {
    const updated = await profileService.updateSocialLink(id, link);
    setSocialLinks(prev => prev.map(l => l.id === id ? updated : l));
    return updated;
  }, []);

  const removeSocialLink = useCallback(async (id) => {
    await profileService.deleteSocialLink(id);
    setSocialLinks(prev => prev.filter(l => l.id !== id));
  }, []);

  const reorderSocialLinks = useCallback(async (newOrder) => {
    // Mettre à jour l'ordre d'affichage
    const updates = newOrder.map((link, index) => 
      profileService.updateSocialLink(link.id, { display_order: index })
    );
    await Promise.all(updates);
    setSocialLinks(newOrder);
  }, []);

  // Gestion des sections custom
  const addCustomSection = useCallback(async (section) => {
    const newSection = await profileService.addCustomSection(section);
    setCustomSections(prev => [...prev, newSection]);
    return newSection;
  }, []);

  const updateCustomSection = useCallback(async (id, section) => {
    const updated = await profileService.updateCustomSection(id, section);
    setCustomSections(prev => prev.map(s => s.id === id ? updated : s));
    return updated;
  }, []);

  const removeCustomSection = useCallback(async (id) => {
    await profileService.deleteCustomSection(id);
    setCustomSections(prev => prev.filter(s => s.id !== id));
  }, []);

  // Prévisualisation
  const refreshPreview = useCallback(async () => {
    try {
      const previewData = await profileService.getProfilePreview();
      setPreview(previewData);
      return previewData;
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const value = {
    settings,
    socialLinks,
    customSections,
    stats,
    preview,
    loading,
    error,
    hasUnsavedChanges,
    activeTab,
    setActiveTab,
    loadProfileData,
    updateSettings,
    saveSettings,
    addSocialLink,
    updateSocialLink,
    removeSocialLink,
    reorderSocialLinks,
    addCustomSection,
    updateCustomSection,
    removeCustomSection,
    refreshPreview
  };

  return (
    <ProfileCustomizationContext.Provider value={value}>
      {children}
    </ProfileCustomizationContext.Provider>
  );
}

export function useProfileCustomization() {
  const context = useContext(ProfileCustomizationContext);
  if (!context) {
    throw new Error('useProfileCustomization must be used within ProfileCustomizationProvider');
  }
  return context;
}
