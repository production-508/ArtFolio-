import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import './AuthModal.css';

// ── Données fictives selon le rôle ─────────────────────────────────────────
const FAKE_DATA = {
  artist: [
    { name: 'Léa Morin',        email: `lea.morin.${Date.now()}@demo.art`,     password: 'artiste123', bio: 'Peintre expressionniste basée à Lyon.' },
    { name: 'Thomas Blanchard', email: `t.blanchard.${Date.now()}@demo.art`,   password: 'artiste123', bio: 'Sculpteur contemporain, passionné de matières.' },
    { name: 'Sofia Ren',        email: `sofia.ren.${Date.now()}@demo.art`,     password: 'artiste123', bio: 'Photographe et plasticienne numérique.' },
    { name: 'Malik Sow',        email: `malik.sow.${Date.now()}@demo.art`,     password: 'artiste123', bio: 'Graveur et illustrateur afro-européen.' },
  ],
  collector: [
    { name: 'Claire Fontaine',  email: `claire.f.${Date.now()}@demo.col`,     password: 'collect123' },
    { name: 'Jean-Pierre Vidal',email: `jp.vidal.${Date.now()}@demo.col`,     password: 'collect123' },
    { name: 'Nadia Karim',      email: `nadia.k.${Date.now()}@demo.col`,      password: 'collect123' },
  ],
};

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ── Icônes rôles ────────────────────────────────────────────────────────────
function IconPalette() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="10"/><circle cx="8" cy="14" r="1" fill="currentColor" stroke="none"/>
      <circle cx="11" cy="10" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="13" r="1" fill="currentColor" stroke="none"/>
      <path d="M12 2a10 10 0 0 0-5 18.66" strokeLinecap="round"/>
    </svg>
  );
}
function IconUser() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round"/>
    </svg>
  );
}
function IconDice() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="4"/>
      <circle cx="8" cy="8" r="1.2" fill="currentColor" stroke="none"/>
      <circle cx="16" cy="8" r="1.2" fill="currentColor" stroke="none"/>
      <circle cx="8" cy="16" r="1.2" fill="currentColor" stroke="none"/>
      <circle cx="16" cy="16" r="1.2" fill="currentColor" stroke="none"/>
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/>
    </svg>
  );
}

// ── Composant principal ─────────────────────────────────────────────────────
export default function AuthModal({ onClose, initialTab = 'login' }) {
  const [tab, setTab]         = useState(initialTab); // 'login' | 'register' | 'forgot'
  const [role, setRole]       = useState('collector'); // 'collector' | 'artist'
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const { login, register, apiFetch } = useAuth();
  const navigate              = useNavigate();
  const modalRef              = useRef(null);

  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');

  // Focus Trap & Escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        if (!modalRef.current) return;
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const reset = () => { setName(''); setEmail(''); setPassword(''); setError(''); setSuccessMsg(''); };

  // Remplissage avec données fictives
  const fillFake = () => {
    const fake = pickRandom(FAKE_DATA[role]);
    setName(fake.name);
    setEmail(fake.email);
    setPassword(fake.password);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccessMsg(''); setLoading(true);
    try {
      if (tab === 'login') {
        await login(email, password);
        onClose();
        navigate('/dashboard');
      } else if (tab === 'register') {
        await register(name, email, password, role);
        onClose();
        navigate('/dashboard');
      } else if (tab === 'forgot') {
        const data = await apiFetch('/auth/forgot-password', {
          method: 'POST',
          body: JSON.stringify({ email })
        });
        setSuccessMsg(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div 
        className="auth-modal" 
        style={{ position: 'relative' }} 
        ref={modalRef} 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="auth-title"
      >
        <button className="auth-close" onClick={onClose} aria-label="Fermer">×</button>

        <div className="auth-header">
          <p className="auth-logo">ArtFolio</p>
          <p className="auth-subtitle" id="auth-title">
            {tab === 'login' && 'Bon retour parmi nous'}
            {tab === 'register' && 'Rejoindre la communauté'}
            {tab === 'forgot' && 'Mot de passe oublié'}
          </p>
        </div>

        {/* Tabs */}
        {tab !== 'forgot' && (
          <div className="auth-tabs">
            <button className={`auth-tab${tab === 'login' ? ' active' : ''}`} onClick={() => { setTab('login'); reset(); }}>
              Connexion
            </button>
            <button className={`auth-tab${tab === 'register' ? ' active' : ''}`} onClick={() => { setTab('register'); reset(); }}>
              Inscription
            </button>
          </div>
        )}

        {/* Choix de rôle (inscription seulement) */}
        {tab === 'register' && (
          <div className="auth-role-selector">
            <button
              type="button"
              className={`auth-role-btn${role === 'collector' ? ' active' : ''}`}
              onClick={() => setRole('collector')}
            >
              <span className="auth-role-icon"><IconUser /></span>
              <span className="auth-role-label">Collectionneur</span>
              <span className="auth-role-desc">Explorer & acheter des œuvres</span>
            </button>
            <button
              type="button"
              className={`auth-role-btn${role === 'artist' ? ' active' : ''}`}
              onClick={() => setRole('artist')}
            >
              <span className="auth-role-icon"><IconPalette /></span>
              <span className="auth-role-label">Artiste</span>
              <span className="auth-role-desc">Exposer & vendre mes œuvres</span>
            </button>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {tab === 'register' && (
            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label" htmlFor="auth-name">
                  {role === 'artist' ? 'Nom artistique' : 'Nom complet'}
                </label>
                <button type="button" className="btn-fake" onClick={fillFake} title="Remplir avec des données fictives">
                  <IconDice /> Données fictives
                </button>
              </div>
              <input id="auth-name" className="form-input" type="text"
                placeholder={role === 'artist' ? 'Marie Dubois' : 'Jean Martin'}
                value={name} onChange={e => setName(e.target.value)} required autoFocus />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="auth-email">Email</label>
            <input id="auth-email" className="form-input" type="email"
              placeholder={role === 'artist' ? 'artiste@email.com' : 'votre@email.com'}
              value={email} onChange={e => setEmail(e.target.value)} required autoFocus={tab === 'login' || tab === 'forgot'} />
          </div>

          {tab !== 'forgot' && (
            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label" htmlFor="auth-password">Mot de passe</label>
                {tab === 'login' && (
                  <button type="button" className="btn-fake" onClick={() => { setTab('forgot'); reset(); }}>
                    Oublié ?
                  </button>
                )}
              </div>
              <input id="auth-password" className="form-input" type="password"
                placeholder={tab === 'register' ? '6 caractères minimum' : '••••••'}
                value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
          )}

          {error && <p className="error-msg">{error}</p>}
          {successMsg && <p className="success-msg" style={{ color: 'var(--success-color, #4caf50)', fontSize: '0.875rem' }}>{successMsg}</p>}

          {tab === 'register' && (
            <div className="plan-info">
              {role === 'artist'
                ? '🎨 Compte Artiste — galerie publique, vente d\'œuvres & tokens IA offerts'
                : '✨ Compte Collectonneur — accès à toute la galerie & favoris illimités'}
            </div>
          )}

          <button type="submit" className="btn btn-gold btn-lg" disabled={loading} style={{ width: '100%' }}>
            {loading
              ? <span className="spinner" style={{ width: 18, height: 18 }} />
              : tab === 'login' ? 'Se connecter' : tab === 'forgot' ? 'Envoyer le lien' : `Créer mon compte ${role === 'artist' ? 'artiste' : ''}`}
          </button>
        </form>

        <div className="auth-footer">
          {tab === 'login' && (
            <p>Pas encore de compte ? <button onClick={() => { setTab('register'); reset(); }}>Rejoindre gratuitement →</button></p>
          )}
          {tab === 'register' && (
            <p>Déjà inscrit ? <button onClick={() => { setTab('login'); reset(); }}>Se connecter</button></p>
          )}
          {tab === 'forgot' && (
            <p><button onClick={() => { setTab('login'); reset(); }}>← Retour à la connexion</button></p>
          )}
        </div>
      </div>
    </div>
  );
}
