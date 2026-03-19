import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import '../styles/presets.css';

import ObsidianProfile from '../components/Themes/ObsidianProfile';
import BlancProfile from '../components/Themes/BlancProfile';
import ManifestoProfile from '../components/Themes/ManifestoProfile';
import NomadeProfile from '../components/Themes/NomadeProfile';
import NuitProfile from '../components/Themes/NuitProfile';
import CinemaProfile from '../components/Themes/CinemaProfile';
import MarbreProfile from '../components/Themes/MarbreProfile';
import ForetProfile from '../components/Themes/ForetProfile';
import StudioProfile from '../components/Themes/StudioProfile';

const RENDERERS = {
  obsidian:  ObsidianProfile,
  blanc:     BlancProfile,
  manifesto: ManifestoProfile,
  nomade:    NomadeProfile,
  nuit:      NuitProfile,
  cinema:    CinemaProfile,
  marbre:    MarbreProfile,
  foret:     ForetProfile,
  studio:    StudioProfile,
};

// ──────────────────────────────────────────────────────────────
export default function ArtistProfile() {
  const { id }              = useParams();
  const [searchParams]      = useSearchParams();
  const presetParam         = searchParams.get('preset');
  const [artist, setArtist] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [liveTheme, setLiveTheme] = useState(null);

  useEffect(() => {
    const handleMessage = (e) => {
      if (e.data?.type === 'UPDATE_THEME') {
        setLiveTheme(e.data.theme);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    // Si pas d'id (mode preview), on charge le profil de l'utilisateur connecté
    const token = localStorage.getItem('artfolio_token');
    const url = id ? `/api/artists/${id}` : '/api/artist/profile';
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    fetch(url, { headers })
      .then(r => r.json())
      .then(d => {
        const a = d.artist ?? d;
        setArtist(a);
        if (d.artworks) setArtworks(d.artworks);
        else fetch(`/api/artists/${a.id}/artworks`).then(r => r.json()).then(d2 => setArtworks(d2.artworks ?? [])).catch(() => {});
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0b' }}>
      <div className="spinner" style={{ width: 32, height: 32, borderTopColor: '#c9a96e' }}></div>
    </div>
  );

  if (!artist) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0b', color: '#f0ebe0', fontFamily: 'Cormorant Garamond', fontSize: '2rem' }}>
      Artiste introuvable
    </div>
  );

  const rawPreset = presetParam || artist.preset || 'obsidian';
  
  let presetKey = rawPreset;
  let customTheme = null;
  
  if (rawPreset && rawPreset.startsWith('{')) {
    try {
      customTheme = JSON.parse(rawPreset);
      presetKey = customTheme.basePreset || 'obsidian'; // Skeleton layout specified by the AI
    } catch (e) { console.error('Erreur parsing preset JSON', e); }
  }

  // Si on est en live preview, le liveTheme peut décider de changer le presetKey
  if (liveTheme?.basePreset) {
    presetKey = liveTheme.basePreset;
  }

  const Renderer = RENDERERS[presetKey] || RENDERERS.obsidian;
  const withImages = artworks.filter(a => a.image_url).slice(0, 9);
  
  const activeTheme = liveTheme || customTheme;
  const themeVars = activeTheme ? {
    '--p-bg': activeTheme.bg,
    '--p-bg2': activeTheme.bg,
    '--p-surface': activeTheme.bg,
    '--p-text': activeTheme.text,
    '--p-accent': activeTheme.accent,
    '--p-accent2': activeTheme.accent,
    '--p-muted': activeTheme.muted,
    '--p-font-h': activeTheme.font,
    '--p-font-weight-h': activeTheme.fontWeight || 400,
    '--p-font-style-h': activeTheme.fontStyle || 'normal',
  } : {};

  return (
    <div style={themeVars}>
      <Renderer artist={artist} artworks={withImages} />
    </div>
  );
}
