import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './ThemeEditor.css';

export default function ThemeEditor() {
  const { user, apiFetch } = useAuth();
  const navigate = useNavigate();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const [form, setForm] = useState({ name: '', bio: '', preset: 'obsidian' });
  const [aiResult, setAiResult] = useState(null);
  const [iframeUrlPreset, setIframeUrlPreset] = useState(null);
  
  // Historique (Undo/Redo)
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Bibliothèque (Saved themes)
  const [library, setLibrary] = useState([]);
  const [savingLibrary, setSavingLibrary] = useState(false);
  
  // Formulaire IA
  const [medium, setMedium] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loadingGenerative, setLoadingGenerative] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savMsg, setSavMsg] = useState('');
  const [error, setError] = useState('');
  
  const iframeRef = useRef(null);

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    
    apiFetch('/artist/profile')
      .then(d => {
        const a = d.artist ?? user;
        const presetInit = a.preset ?? 'obsidian';
        setForm({
          name: a.name ?? '',
          bio: a.bio ?? '',
          preset: presetInit,
        });
        setIframeUrlPreset(presetInit);
        setHistory([presetInit]);
        setHistoryIndex(0);
        setLibrary(a.saved_themes || []);
        if (a.ai_style_tags) setAiResult({ style_tags: a.ai_style_tags });
        // default medium heuristique basique
        if (a.bio && a.bio.toLowerCase().includes('photo')) setMedium('Photographie');
        else if (a.bio && a.bio.toLowerCase().includes('sculpt')) setMedium('Sculpture');
        else setMedium('Art Numérique');
      })
      .catch(console.error);
  }, [user, apiFetch, navigate]);

  const generateAITheme = async () => {
    setLoadingGenerative(true);
    setError('');
    try {
      const res = await apiFetch('/ai/generate-theme', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name, 
          medium: medium.trim() || 'Art Contemporain',
          style: aiResult?.style_tags?.join(', ') || '',
          description: prompt.trim() || form.bio
        }),
      });
      // Ensure we have a basePreset selected
      const currentBase = form.preset?.startsWith('{') 
        ? (JSON.parse(form.preset).basePreset || 'obsidian') 
        : (form.preset || 'obsidian');
      const finalThemeObj = { ...res.theme, basePreset: res.theme.basePreset || currentBase };
      const themeJson = JSON.stringify(finalThemeObj);
      
      const newHistory = [...history.slice(0, historyIndex + 1), themeJson];
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      
      setForm(f => ({ ...f, preset: themeJson }));
      
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage({ type: 'UPDATE_THEME', theme: finalThemeObj }, '*');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingGenerative(false);
    }
  };

  const goToHistory = (idx) => {
    if (idx < 0 || idx >= history.length) return;
    setHistoryIndex(idx);
    const themeStr = history[idx];
    setForm(f => ({ ...f, preset: themeStr }));
    
    // update live if it's a custom json
    if (iframeRef.current && iframeRef.current.contentWindow) {
      if (themeStr.startsWith('{')) {
        try {
          const parsed = JSON.parse(themeStr);
          iframeRef.current.contentWindow.postMessage({ type: 'UPDATE_THEME', theme: parsed }, '*');
        } catch (e) {}
      } else {
        // Not a JSON theme (standard preset), send a pseudo UPDATE_THEME to reset colors,
        // relying on basePreset fallback mechanism.
        iframeRef.current.contentWindow.postMessage({ type: 'UPDATE_THEME', theme: { basePreset: themeStr } }, '*');
      }
    }
  };

  const saveProfile = async () => {
    setSaving(true); setError(''); setSavMsg('');
    try {
      await apiFetch('/artist/profile', { method: 'PUT', body: JSON.stringify({ preset: form.preset }) });
      setSavMsg('Thème public sauvegardé ✓');
      setTimeout(() => setSavMsg(''), 2500);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const saveToLibrary = async () => {
    if (!form.preset.startsWith('{')) return;
    setSavingLibrary(true);
    try {
      const parsed = JSON.parse(form.preset);
      const newTheme = {
        id: Date.now().toString(),
        name: `Inspiration ${library.length + 1} (${parsed.basePreset})`,
        data: form.preset
      };
      const newLibrary = [...library, newTheme];
      await apiFetch('/artist/profile', { method: 'PUT', body: JSON.stringify({ saved_themes: newLibrary }) });
      setLibrary(newLibrary);
      setSavMsg('Thème ajouté à la bibliothèque ✓');
      setTimeout(() => setSavMsg(''), 2500);
    } catch (e) { setError(e.message); }
    finally { setSavingLibrary(false); }
  };

  const loadFromLibrary = (themeData) => {
    setForm(f => ({ ...f, preset: themeData }));
    const newHistory = [...history.slice(0, historyIndex + 1), themeData];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        const parsed = JSON.parse(themeData);
        iframeRef.current.contentWindow.postMessage({ type: 'UPDATE_THEME', theme: parsed }, '*');
      } catch (e) {}
    }
  };

  const deleteFromLibrary = async (idToDelete) => {
    const newLibrary = library.filter(t => t.id !== idToDelete);
    setLibrary(newLibrary);
    try {
      await apiFetch('/artist/profile', { method: 'PUT', body: JSON.stringify({ saved_themes: newLibrary }) });
    } catch (e) {}
  };

  return (
    <div className="theme-editor-page">
      {/* ── Navbar ── */}
      <nav className="theme-navbar">
        <button onClick={() => navigate('/profile')} className="theme-btn-back">
          ← Retour au profil
        </button>
        <div className="theme-navbar-title">
          Éditeur de Thème <span>Premium AI</span>
        </div>
        <div className="theme-navbar-actions">
          {savMsg && <span className="theme-msg success">{savMsg}</span>}
          {error && <span className="theme-msg error">{error}</span>}
          <button className="theme-btn-save" onClick={saveProfile} disabled={saving}>
            {saving ? 'Sauvegarde...' : 'Appliquer et Sauvegarder'}
          </button>
          <button 
            className="theme-btn-toggle" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? "Masquer le panneau IA" : "Afficher le panneau IA"}
          >
            {sidebarOpen ? '›' : '‹'}
          </button>
        </div>
      </nav>

      {/* ── Main Layout ── */}
      <div className="theme-layout">
        
        {/* Iframe Preview (Main Flex) */}
        <div className={`theme-preview-container ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          {iframeUrlPreset && (
            <iframe 
              ref={iframeRef}
              src={`/artiste/preview?preset=${encodeURIComponent(iframeUrlPreset)}`} 
              className="theme-iframe"
              title="Live Preview"
            />
          )}
          <div className="theme-badge-live">Live Preview</div>
        </div>

        {/* Sidebar IA (Fixed right or Slide out) */}
        <aside className={`theme-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="theme-sidebar-content">
            <h2 className="theme-sidebar-title">Générateur IA</h2>
            <p className="theme-sidebar-desc">
              Décrivez votre art, et notre intelligence artificielle composera une harmonie de couleurs et une typographie inédite pour votre portfolio public.
            </p>

            <div className="theme-form">
              <div className="form-group">
                <label className="form-label">Votre Médium</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={medium}
                  onChange={e => setMedium(e.target.value)}
                  placeholder="ex: Photographie, Huile sur toile..."
                />
              </div>

              <div className="form-group" style={{ marginTop: 16 }}>
                <label className="form-label">Directions artistiques (optionnel)</label>
                <textarea 
                  className="form-input" 
                  rows={4}
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="Atmosphère sombre, influences années 80, couleurs chaudes..."
                />
              </div>

              <button 
                className="btn btn-gold" 
                onClick={generateAITheme}
                disabled={loadingGenerative}
                style={{ width: '100%', marginTop: 24, padding: '16px 0', fontSize: '14px' }}
              >
                {loadingGenerative ? <span className="spinner" style={{width:16,height:16}}></span> : '✨ Générer un style unique'}
              </button>
              
              <div className="theme-history-controls">
                <button 
                  className="theme-btn-nav" 
                  disabled={historyIndex <= 0}
                  onClick={() => goToHistory(historyIndex - 1)}
                >
                  ‹ V. préc
                </button>
                <div className="theme-history-label">
                  {history.length > 0 ? `Version ${historyIndex + 1} / ${history.length}` : '—'}
                </div>
                <button 
                  className="theme-btn-nav" 
                  disabled={historyIndex >= history.length - 1}
                  onClick={() => goToHistory(historyIndex + 1)}
                >
                  V. suiv ›
                </button>
              </div>
            </div>
            
            {/* ── Bibliothèque ── */}
            <div className="theme-sidebar-library">
              <div className="theme-library-header">
                <h3>Ma Bibliothèque</h3>
                <button 
                  className="theme-btn-library-save"
                  onClick={saveToLibrary}
                  disabled={savingLibrary || !form.preset.startsWith('{')}
                  title="Enregistrer ce thème pour plus tard"
                >
                  {savingLibrary ? '...' : '+ Sauvegarder'}
                </button>
              </div>
              
              {library.length === 0 ? (
                <p className="theme-library-empty">Aucun thème sauvegardé.</p>
              ) : (
                <div className="theme-library-list">
                  {library.map(t => (
                    <div key={t.id} className="theme-library-item">
                      <span className="theme-library-name">{t.name}</span>
                      <div className="theme-library-actions">
                        <button className="theme-btn-load" onClick={() => loadFromLibrary(t.data)}>Appliquer</button>
                        <button className="theme-btn-delete" onClick={() => deleteFromLibrary(t.id)}>×</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
