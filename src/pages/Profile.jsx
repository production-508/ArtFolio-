import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import PresetSelector from '../components/Presets/PresetSelector.jsx';
import './Profile.css';

/* ─── Indicateur de complétion ─────────────────────────── */
function ProfileCompletion({ form, aiResult }) {
  const steps = [
    { key: 'name',     label: 'Nom artistique', done: !!form.name },
    { key: 'bio',      label: 'Biographie', done: !!form.bio },
    { key: 'location', label: 'Localisation', done: !!form.location },
    { key: 'avatar',   label: 'Photo de profil', done: !!form.avatar_url },
    { key: 'ai',       label: 'Profil IA généré', done: !!aiResult },
    { key: 'preset',   label: 'Style choisi', done: form.preset !== 'obsidian' || true },
  ];
  const done = steps.filter(s => s.done).length;
  const pct  = Math.round((done / steps.length) * 100);
  return (
    <div className="profile-completion">
      <div className="profile-completion-header">
        <span className="profile-completion-label">Profil complété</span>
        <span className="profile-completion-pct">{pct}%</span>
      </div>
      <div className="profile-completion-bar">
        <div className="profile-completion-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="profile-completion-steps">
        {steps.map(s => (
          <div key={s.key} className={`profile-step ${s.done ? 'done' : ''}`}>
            <span className="profile-step-dot">{s.done ? '✓' : '○'}</span>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Section card ─────────────────────────────────────── */
function StepCard({ number, title, subtitle, badge, children, done }) {
  return (
    <div className={`step-card${done ? ' step-done' : ''}`}>
      <div className="step-card-header">
        <div className="step-number">{done ? '✓' : number}</div>
        <div>
          <div className="step-title">{title}</div>
          {subtitle && <div className="step-subtitle">{subtitle}</div>}
        </div>
        {badge && <span className="tag tag-gold" style={{ marginLeft: 'auto' }}>{badge}</span>}
      </div>
      <div className="step-card-body">{children}</div>
    </div>
  );
}

/* ─── Données Thomas Blanchard ─────────────────────────── */
const THOMAS_PRESET = {
  medium: 'Sculpture',
  prompt: "Je travaille principalement l'argile, le bronze et le bois brut. Mes sculptures explorent la tension entre la matière et le vide, entre la forme humaine et l'abstraction organique. Influencé par Brancusi et les arts premiers africains, je cherche à révéler la vie intérieure de la matière.",
};

function isThomasBlanchard(name) {
  return name?.toLowerCase().trim() === 'thomas blanchard';
}

/* ─── Données Alexandre Démo ─────────────────────────── */
const ALEX_PRESET = {
  medium: 'Photographie Numérique',
  prompt: "Je capture l'architecture urbaine nocturne avec une esthétique néon et cyberpunk. Mes influences vont de Blade Runner à la photographie de rue de Tokyo. Je cherche à sublimer la solitude des métropoles modernes.",
  aiResult: {
    bio: "Installé à Lyon, Alexandre est un photographe numérique spécialisé dans les paysages urbains nocturnes. Son travail s'articule autour de l'esthétique cyberpunk pour capturer la solitude et la beauté cachée des métropoles modernes sous la lueur des néons.",
    statement: "La ville ne dort jamais vraiment, elle rêve en couleurs synthétiques. Mon objectif est de fixer ces instants suspendus entre deux réalités.",
    style_tags: ['Cyberpunk', 'Photographie', 'Urbain', 'Nocturne']
  }
};

function isAlexDemo(name) {
  return name?.toLowerCase().trim() === 'alexandre démo' || name?.toLowerCase().trim() === 'alexandre demo';
}

/* ─── AI Generator ─────────────────────────────────────── */
function AiGenerator({ artistName, onResult, existing, apiFetch }) {
  const isThomas = isThomasBlanchard(artistName);
  const isAlex = isAlexDemo(artistName);

  const initPrompt = isThomas ? THOMAS_PRESET.prompt : (isAlex ? ALEX_PRESET.prompt : '');
  const initMedium = isThomas ? THOMAS_PRESET.medium : (isAlex ? ALEX_PRESET.medium : '');

  const [prompt, setPrompt]   = useState(initPrompt);
  const [medium, setMedium]   = useState(initMedium);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [result, setResult]   = useState(existing || null);
  const [applied, setApplied] = useState(false);

  const generate = async () => {
    if (!medium.trim()) { setError('Quel est votre médium principal ?'); return; }
    setLoading(true); setError('');
    try {
      const res = await apiFetch('/ai/generate-profile', {
        method: 'POST',
        body: JSON.stringify({
          name: artistName, medium: medium.trim(),
          description: prompt.trim() || undefined,
        }),
      });
      setResult(res);
      setApplied(false);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  // Apply utilise les valeurs éditées (result peut avoir été modifié manuellement)
  const apply = () => {
    if (result && onResult) { onResult(result); setApplied(true); }
  };

  return (
    <div className="ai-gen">
      {/* Badge Thomas Blanchard / Alex */}
      {(isThomas || isAlex) && (
        <div className="ai-thomas-badge">
          ✦ Profil pré-rempli pour <strong>{artistName}</strong> — {isAlex ? 'photographe numérique' : 'sculpteur contemporain'}
        </div>
      )}

      {/* Inputs */}
      <div className="ai-gen-inputs">
        <div className="form-group">
          <label className="form-label">Votre médium *</label>
          <input
            className={`form-input${(isThomas || isAlex) ? ' input-prefilled' : ''}`}
            type="text" value={medium}
            onChange={e => setMedium(e.target.value)}
            placeholder="ex : Huile sur toile, photographie, sculpture…"
          />
        </div>
        <div className="form-group">
          <label className="form-label">
            Décrivez votre démarche{' '}
            <span style={{ color: 'var(--white-60)', fontWeight: 400 }}>(optionnel)</span>
          </label>
          <textarea
            className={`form-input${(isThomas || isAlex) ? ' input-prefilled' : ''}`}
            rows={3} value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Influences, style, ce qui vous inspire… quelques mots suffisent."
          />
        </div>
      </div>

      {error && <p className="error-msg">{error}</p>}

      <button className="btn btn-gold" onClick={generate} disabled={loading} style={{ marginBottom: loading ? 24 : 16 }}>
        {loading && !result
          ? <><span className="spinner" style={{ width: 16, height: 16 }}></span> Génération en cours…</>
          : result ? '✨ Regénérer depuis zéro' : '✨ Générer ma biographie'}
      </button>

      {/* Résultat éditables */}
      {result && (
        <div className="ai-result-card fade-up">
          <div className="ai-result-card-header">
            <span>
              ✨ Résultat
              <span style={{ fontSize: 10, color: 'var(--white-60)', fontWeight: 400, textTransform: 'none', letterSpacing: 0, marginLeft: 6 }}>
                — cliquez pour modifier
              </span>
            </span>
            {applied
              ? <span className="success-msg" style={{ padding: '4px 10px', fontSize: 12 }}>Appliqué ✓</span>
              : <button className="btn btn-gold btn-sm" onClick={apply}>Appliquer à mon profil</button>}
          </div>

          <div className="ai-result-field">
            <p className="ai-field-label">Biographie</p>
            <textarea
              className="form-input ai-edit-textarea"
              rows={4}
              value={result.bio ?? ''}
              onChange={e => { setResult(r => ({ ...r, bio: e.target.value })); setApplied(false); }}
            />
          </div>

          {'statement' in (result || {}) && (
            <div className="ai-result-field">
              <p className="ai-field-label">Statement artistique</p>
              <textarea
                className="form-input ai-edit-textarea ai-textarea-italic"
                rows={2}
                value={result.statement ?? ''}
                onChange={e => { setResult(r => ({ ...r, statement: e.target.value })); setApplied(false); }}
              />
            </div>
          )}

          {Array.isArray(result.style_tags) && result.style_tags.length > 0 && (
            <div className="ai-result-tags">
              {result.style_tags.map(t => <span key={t} className="tag tag-gold">{t}</span>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Page principale ──────────────────────────────────── */
export default function Profile() {
  const { user, apiFetch } = useAuth();
  const navigate           = useNavigate();

  const [form, setForm] = useState({
    name: '', bio: '', location: '', website: '', instagram: '', avatar_url: '', preset: 'obsidian',
  });
  const [aiResult, setAiResult] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [savMsg, setSavMsg]     = useState('');
  const [error, setError]       = useState('');

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    apiFetch('/artist/profile')
      .then(d => {
        const a = d.artist ?? user;
        const isAlex = isAlexDemo(a.name);
        
        setForm({
          name:       a.name       ?? '',
          bio:        a.bio        || (isAlex ? ALEX_PRESET.aiResult.bio : ''),
          location:   a.location   || (isAlex ? 'Lyon, France' : ''),
          website:    a.website    || (isAlex ? 'https://alexdemo.art' : ''),
          instagram:  a.instagram  || (isAlex ? 'alex_demo_photo' : ''),
          avatar_url: a.avatar_url || (isAlex ? 'https://api.dicebear.com/8.x/lorelei/svg?seed=alex' : ''),
          preset:     a.preset     ?? 'obsidian',
        });
        
        if (a.ai_bio) {
           setAiResult({ bio: a.ai_bio, statement: a.ai_statement, style_tags: a.ai_style_tags ?? [] });
        } else if (isAlex) {
           setAiResult(ALEX_PRESET.aiResult);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, apiFetch, navigate]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async (extra = {}) => {
    setSaving(true); setError(''); setSavMsg('');
    try {
      await apiFetch('/artist/profile', { method: 'PUT', body: JSON.stringify({ ...form, ...extra }) });
      setSavMsg('Sauvegardé ✓');
      setTimeout(() => setSavMsg(''), 2500);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleAIResult = (res) => {
    setAiResult(res);
    if (res.bio) set('bio', res.bio);
  };

  if (loading) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="spinner" style={{ width: 32, height: 32, borderTopColor: 'var(--gold)' }}></div>
    </div>
  );

  return (
    <div className="page profile-v2">
      {/* ── Top bar ── */}
      <div className="profile-topbar">
        <button onClick={() => navigate('/dashboard')} className="back-link">← Dashboard</button>
        <div className="profile-topbar-actions">
          <a href={`/artiste/preview?preset=${form.preset}`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
            👁️ Aperçu public ↗
          </a>
          <button className="btn btn-gold btn-sm" onClick={() => save()} disabled={saving}>
            {saving ? <span className="spinner" style={{ width: 14, height: 14 }}></span> : '💾 Sauvegarder'}
          </button>
        </div>
      </div>

      {savMsg && <div className="profile-banner success-msg">{savMsg}</div>}
      {error  && <div className="profile-banner error-msg">{error}</div>}

      <div className="profile-v2-layout">
        {/* ── Colonne gauche — sidebar ── */}
        <aside className="profile-sidebar">
          <div className="profile-avatar-card">
            <div className="profile-avatar-big">
              {form.avatar_url
                ? <img src={form.avatar_url} alt={form.name} />
                : <span>{form.name?.charAt(0)?.toUpperCase() || '?'}</span>}
            </div>
            <div>
              <p className="profile-sidebar-name">{form.name || 'Votre nom'}</p>
              {form.location && <p className="profile-sidebar-loc">📍 {form.location}</p>}
              <span className="tag tag-gold" style={{ marginTop: 8, display: 'inline-block' }}>Plan {user?.plan}</span>
            </div>
          </div>

          <ProfileCompletion form={form} aiResult={aiResult} />
        </aside>

        {/* ── Colonne droite — étapes ── */}
        <main className="profile-steps">

          {/* Étape 1 — Identité */}
          <StepCard number="1" title="Identité" subtitle="Votre nom et où vous trouve-t-on" done={!!form.name && !!form.location}>
            <div className="profile-form">
              <div className="form-group">
                <label className="form-label">Nom artistique *</label>
                <input className="form-input" type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Marie Dubois" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Ville / Pays</label>
                  <input className="form-input" type="text" value={form.location} onChange={e => set('location', e.target.value)} placeholder="Paris, France" />
                </div>
                <div className="form-group">
                  <label className="form-label">Photo (URL)</label>
                  <input className="form-input" type="url" value={form.avatar_url} onChange={e => set('avatar_url', e.target.value)} placeholder="https://…" />
                </div>
              </div>
            </div>
          </StepCard>

          {/* Étape 2 — Biographie IA */}
          <StepCard number="2" title="Biographie" subtitle="Laissez l'IA écrire votre profil — ou rédigez-le vous-même" badge="IA" done={!!form.bio}>
            <div style={{ marginBottom: 20 }}>
              <p className="step-help">
                💡 <strong>Comment ça marche :</strong> décrivez votre médium (peinture, photo…) et cliquez "Générer". L'IA rédige une bio professionnelle en français, que vous pouvez retoucher ensuite.
              </p>
            </div>

            <AiGenerator
              artistName={form.name || user?.name}
              existing={aiResult}
              onResult={handleAIResult}
              apiFetch={apiFetch}
            />

            <div style={{ marginTop: 20 }}>
              <div className="form-group">
                <label className="form-label">
                  Biographie
                  <span style={{ color: 'var(--white-60)', fontWeight: 400, marginLeft: 8 }}>— modifiable à tout moment</span>
                </label>
                <textarea
                  className="form-input" rows={5}
                  value={form.bio} onChange={e => set('bio', e.target.value)}
                  placeholder="La bio générée par l'IA apparaîtra ici, ou rédigez-en une vous-même…"
                />
              </div>
            </div>
          </StepCard>

          {/* Étape 3 — Liens */}
          <StepCard number="3" title="Liens & Réseaux" subtitle="Permettez aux collectionneurs de vous retrouver" done={!!(form.instagram || form.website)}>
            <div className="profile-form">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Instagram</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--white-60)', fontSize: 13 }}>@</span>
                    <input className="form-input" type="text" value={form.instagram} onChange={e => set('instagram', e.target.value)} placeholder="votre_compte" style={{ paddingLeft: 28 }} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Site web</label>
                  <input className="form-input" type="url" value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://monsite.art" />
                </div>
              </div>
            </div>
          </StepCard>

          {/* Étape 4 — Style du portfolio */}
          <StepCard number="4" title="Style du portfolio" subtitle="Choisissez le thème de votre page publique d'artiste">
            <p className="step-help" style={{ marginBottom: 20 }}>
              💡 Votre page publique est l'adresse que vous partagez avec les collectionneurs. Chaque thème a un caractère visuel distinct : animations, typographie et couleurs incluses.
            </p>
            <PresetSelector value={form.preset} onChange={(id) => set('preset', id)} />
            
            <div style={{ marginTop: 40, borderTop: '1px solid var(--night-border)', paddingTop: 30 }}>
              <div className="step-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                Thème sur-mesure par IA <span className="tag tag-gold">Premium</span>
              </div>
              <p className="step-help" style={{ marginBottom: 20, marginTop: 10 }}>
                Laissez l'intelligence artificielle concevoir une palette de couleurs et une typographie unique, spécialement adaptée à votre style artistique. Interface dédiée avec aperçu live.
              </p>
              
              <button 
                className="btn btn-gold" 
                onClick={() => navigate('/theme-editor')} 
              >
                ✨ Ouvrir l'Éditeur de Thème IA
              </button>
            </div>
            
            <div style={{ display: 'flex', gap: 12, marginTop: 30 }}>
              <button className="btn btn-outline" onClick={() => save({ preset: form.preset })} disabled={saving}>
                {saving ? <span className="spinner" style={{ width: 14, height: 14 }}></span> : '💾 Sauvegarder ce style (standard)'}
              </button>
            </div>
          </StepCard>

          {/* CTA final */}
          <div className="profile-cta">
            {savMsg && <p className="success-msg">{savMsg}</p>}
            {error  && <p className="error-msg">{error}</p>}
            <button className="btn btn-gold btn-lg" onClick={() => save()} disabled={saving} style={{ width: '100%', justifyContent: 'center' }}>
              {saving
                ? <><span className="spinner" style={{ width: 18, height: 18 }}></span> Sauvegarde…</>
                : '💾 Sauvegarder tout le profil'}
            </button>
            <a href={`/artiste/preview?preset=${form.preset}`} target="_blank" rel="noreferrer" className="btn btn-outline btn-lg" style={{ width: '100%', justifyContent: 'center', textAlign: 'center', marginTop: 10 }}>
              👁️ Voir ma page publique ↗
            </a>
          </div>

        </main>
      </div>
    </div>
  );
}
