import { useState } from 'react';
import './PresetSelector.css';

const PRESETS = [
  {
    id: 'obsidian',
    name: 'Obsidian',
    desc: 'Dark luxury · Or · Cormorant',
    tag: 'Luxury',
    tagColor: '#c9a96e',
    preview: {
      bg: 'linear-gradient(135deg, #08080a 0%, #1a1a20 100%)',
      accent: '#c9a96e',
      text: '#f0ebe0',
      muted: 'rgba(240,235,224,0.5)',
      font: 'Cormorant Garamond, Georgia, serif',
      fontStyle: 'italic',
    },
  },
  {
    id: 'blanc',
    name: 'Blanc',
    desc: 'Éditorial · Minimaliste · Inter',
    tag: 'Editorial',
    tagColor: '#121212',
    preview: {
      bg: '#f8f7f5',
      accent: '#121212',
      text: '#121212',
      muted: '#6b6b6b',
      font: 'Cormorant Garamond, Georgia, serif',
      fontStyle: 'normal',
    },
  },
  {
    id: 'manifesto',
    name: 'Manifesto',
    desc: 'Brutaliste · Oversized · Glitch',
    tag: 'Brutaliste',
    tagColor: '#cc0000',
    preview: {
      bg: '#f5e642',
      accent: '#cc0000',
      text: '#121212',
      muted: '#555',
      font: 'Inter, Arial Black, sans-serif',
      fontStyle: 'normal',
      fontWeight: '900',
    },
  },
  {
    id: 'nomade',
    name: 'Nomade',
    desc: 'Organic · Terracotta · Blob',
    tag: 'Organique',
    tagColor: '#c4673b',
    preview: {
      bg: 'linear-gradient(135deg, #f5ede0 0%, #ede0cc 100%)',
      accent: '#c4673b',
      text: '#2a1f14',
      muted: '#7a6854',
      font: 'Cormorant Garamond, Georgia, serif',
      fontStyle: 'italic',
    },
  },
  {
    id: 'nuit',
    name: 'Nuit',
    desc: 'Cyberpunk · Neon · Scanlines',
    tag: 'Cyberpunk',
    tagColor: '#4fc3f7',
    preview: {
      bg: 'linear-gradient(135deg, #05060f 0%, #0d1020 100%)',
      accent: '#4fc3f7',
      text: '#e0eeff',
      muted: 'rgba(224,238,255,0.5)',
      font: 'Courier New, monospace',
      fontStyle: 'normal',
    },
  },
  {
    id: 'cinema',
    name: 'Cinéma',
    desc: 'Film Noir · Grain · Sépia',
    tag: 'Film Noir',
    tagColor: '#c8a97e',
    preview: {
      bg: 'linear-gradient(135deg, #100d08 0%, #1a1510 100%)',
      accent: '#c8a97e',
      text: '#e8dcc8',
      muted: 'rgba(232,220,200,0.5)',
      font: 'Cormorant Garamond, Georgia, serif',
      fontStyle: 'italic',
    },
  },
  {
    id: 'marbre',
    name: 'Marbre',
    desc: 'Luxe blanc · Sculpture · Minéral',
    tag: 'Sculpture',
    tagColor: '#8a7f7a',
    preview: {
      bg: 'linear-gradient(135deg, #f9f7f5 0%, #ede9e4 100%)',
      accent: '#5a5048',
      text: '#1a1714',
      muted: '#8a7f7a',
      font: 'Cormorant Garamond, Georgia, serif',
      fontStyle: 'italic',
    },
  },
  {
    id: 'foret',
    name: 'Forêt',
    desc: 'Organique · Vert profond · Texturé',
    tag: 'Nature',
    tagColor: '#5a8a60',
    preview: {
      bg: 'linear-gradient(135deg, #0d1a0f 0%, #1a2e1c 100%)',
      accent: '#7ec882',
      text: '#dff0e0',
      muted: 'rgba(223,240,224,0.5)',
      font: 'Cormorant Garamond, Georgia, serif',
      fontStyle: 'normal',
    },
  },
  {
    id: 'studio',
    name: 'Studio',
    desc: 'Gris anthracite · Épuré · Moderne',
    tag: 'Contemporain',
    tagColor: '#888',
    preview: {
      bg: 'linear-gradient(135deg, #1c1c1e 0%, #2a2a2e 100%)',
      accent: '#e0e0e0',
      text: '#f5f5f5',
      muted: 'rgba(245,245,245,0.45)',
      font: 'Inter, Helvetica Neue, sans-serif',
      fontStyle: 'normal',
      fontWeight: '300',
    },
  },
];

function PresetCard({ preset, active, onClick }) {
  const p = preset.preview;
  return (
    <button
      className={`preset-card${active ? ' active' : ''}`}
      onClick={() => onClick(preset.id)}
      style={{ '--card-accent': p.accent }}
    >
      {/* Mini preview */}
      <div className="preset-card-preview" style={{ background: p.bg }}>
        {/* Simulated hero */}
        <div className="preset-card-hero">
          <p className="preset-card-eyebrow" style={{ color: p.accent, fontFamily: 'Inter', fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px' }}>
            Artiste
          </p>
          <p className="preset-card-name" style={{
            color: p.text, fontFamily: p.font,
            fontStyle: p.fontStyle || 'normal',
            fontWeight: p.fontWeight || 400,
            fontSize: '22px', lineHeight: 1.1,
          }}>
            Nom de<br />l'artiste
          </p>
          {/* Mini accent bar */}
          <div style={{ width: '40px', height: '2px', background: p.accent, marginTop: '12px', borderRadius: '1px' }} />
        </div>
        {/* Simulated artwork cards */}
        <div className="preset-card-artworks">
          {[0,1,2].map(i => (
            <div key={i} className="preset-card-artwork" style={{
              background: `${p.text}12`,
              border: `1px solid ${p.text}20`,
              borderRadius: preset.id === 'nomade' ? '40% 60% 40% 60% / 40% 40% 60% 60%' : preset.id === 'manifesto' ? '0' : '4px',
            }} />
          ))}
        </div>
        {/* Preset-specific effects in preview */}
        {preset.id === 'nuit' && (
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: 'linear-gradient(rgba(79,195,247,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(79,195,247,0.06) 1px, transparent 1px)',
            backgroundSize: '12px 12px',
          }} />
        )}
        {preset.id === 'manifesto' && (
          <div style={{
            position: 'absolute', top: '8px', right: '8px', width: '40%', height: '60%',
            background: `${p.text}20`, border: `2px solid ${p.text}40`,
          }} />
        )}
        {/* Active badge */}
        {active && (
          <div className="preset-card-active-badge">✓</div>
        )}
      </div>

      {/* Info */}
      <div className="preset-card-info">
        <div className="preset-card-header">
          <span className="preset-card-name-text">{preset.name}</span>
          <span className="preset-card-tag" style={{ color: active ? p.accent : undefined, borderColor: active ? p.accent : undefined }}>
            {preset.tag}
          </span>
        </div>
        <p className="preset-card-desc">{preset.desc}</p>
      </div>
    </button>
  );
}

export default function PresetSelector({ value, onChange }) {
  const [hovered, setHovered] = useState(null);
  const active = value || 'obsidian';

  return (
    <div className="preset-selector">
      <div className="preset-selector-header">
        <h3 className="preset-selector-title">🎨 Choisir mon style de portfolio</h3>
        <p className="preset-selector-desc">
          Chaque thème définit le design de votre page publique d'artiste — tipographie, couleurs et animations incluses.
        </p>
      </div>

      <div className="preset-grid">
        {PRESETS.map(p => (
          <PresetCard
            key={p.id}
            preset={p}
            active={active === p.id}
            onClick={onChange}
          />
        ))}
      </div>

      {/* Preview live du preset actif */}
      <div className="preset-current">
        <span className="preset-current-label">Thème actif :</span>
        <span className="preset-current-name">
          {PRESETS.find(p => p.id === active)?.name ?? 'Obsidian'}
        </span>
        <a href={`/artiste/preview?preset=${active}`} target="_blank" className="btn btn-outline btn-sm" rel="noreferrer">
          Aperçu ↗
        </a>
      </div>
    </div>
  );
}

export { PRESETS };
