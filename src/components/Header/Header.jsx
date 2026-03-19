import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import './Header.css';

export default function Header({ onOpenAuth }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); setMobileMenuOpen(false); };
  
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="header">
      <div className="header-inner">
        {/* Logo */}
        <Link to="/" className="header-logo" onClick={closeMobileMenu}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="1" y="1" width="8" height="8" rx="2" fill="currentColor" opacity=".6"/>
            <rect x="11" y="1" width="8" height="8" rx="2" fill="currentColor"/>
            <rect x="1" y="11" width="8" height="8" rx="2" fill="currentColor"/>
            <rect x="11" y="11" width="8" height="8" rx="2" fill="currentColor" opacity=".4"/>
          </svg>
          ArtFolio
        </Link>

        {/* Bouton Hamburger (Mobile uniquement) */}
        <button 
          className={`header-burger ${mobileMenuOpen ? 'open' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation Desktop + Overlay Mobile */}
        <div className={`header-content ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <nav className="header-nav">
            <Link to="/galerie" className="header-link" onClick={closeMobileMenu}>Galerie</Link>
            <Link to="/artistes" className="header-link" onClick={closeMobileMenu}>Artistes</Link>
            <Link to="/tarifs" className="header-link" onClick={closeMobileMenu}>Tarifs</Link>
          </nav>

          <div className="header-actions">
            {user ? (
              <div className="header-user" onClick={() => setMenuOpen(!menuOpen)}>
                <div className="header-avatar">
                  {user.avatar_url
                    ? <img src={user.avatar_url} alt={user.name} />
                    : <span>{user.name?.charAt(0)?.toUpperCase()}</span>}
                </div>
                <span className="header-username">{user.name}</span>
                {menuOpen && (
                  <div className="header-dropdown">
                    <Link to="/dashboard" className="header-dropdown-item" onClick={() => { setMenuOpen(false); closeMobileMenu(); }}>Dashboard</Link>
                    <Link to="/profile" className="header-dropdown-item" onClick={() => { setMenuOpen(false); closeMobileMenu(); }}>Mon profil</Link>
                    <Link to="/theme-editor" className="header-dropdown-item" onClick={() => { setMenuOpen(false); closeMobileMenu(); }}>✨ Éditeur de Thème IA</Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="header-dropdown-item" onClick={() => { setMenuOpen(false); closeMobileMenu(); }}>Admin</Link>
                    )}
                    <div className="header-dropdown-divider" />
                    <button className="header-dropdown-item header-logout" onClick={handleLogout}>Déconnexion</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button className="btn btn-ghost btn-sm header-signin" onClick={() => { onOpenAuth('login'); closeMobileMenu(); }}>
                  <span>→</span> Connexion
                </button>
                <button className="btn btn-gold btn-sm" onClick={() => { onOpenAuth('register'); closeMobileMenu(); }}>
                  Rejoindre
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
