import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, LogOut, LayoutDashboard, Shield, Palette } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Navigation Institutionnelle — Minimaliste
 * Style galerie d'art (Hauser & Wirth, Gagosian)
 * Avec intégration Auth
 */
export default function InstitutionalNav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  
  const { user, isAuthenticated, isArtist, isAdmin, logout, getInitials, loading } = useAuth();

  // Fermer le dropdown au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Header devient opaque après scroll
      setIsScrolled(currentScrollY > 50);
      
      // Cache/affiche au scroll
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const navItems = [
    { label: 'Œuvres', href: '/galerie' },
    { label: 'Artistes', href: '/artistes' },
    { label: 'À propos', href: '/apropos' },
  ];

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    window.location.href = '/';
  };

  // Générer le label du badge rôle
  const getRoleBadge = () => {
    if (isAdmin) return { label: 'Admin', icon: Shield };
    if (isArtist) return { label: 'Artiste', icon: Palette };
    return null;
  };

  const roleBadge = getRoleBadge();
  const RoleIcon = roleBadge?.icon;

  return (
    <>
      {/* Header principal */}
      <motion.header
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : -100 }}
        transition={{ duration: 0.3 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${
          isScrolled ? 'bg-black/90 backdrop-blur-sm' : 'bg-transparent'
        }`}
      >
        <div className="flex items-center justify-between px-8 md:px-16 py-6">
          {/* Logo */}
          <a 
            href="/" 
            className="font-serif text-2xl md:text-3xl font-semibold tracking-wide text-white hover:opacity-80 transition-opacity"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            ArtFolio
          </a>

          {/* Navigation desktop */}
          <nav className="hidden md:flex items-center gap-12">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="relative text-sm font-light tracking-[0.2em] text-white/80 hover:text-white transition-colors group"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full" />
              </a>
            ))}

            {/* Séparateur */}
            <div className="w-px h-4 bg-white/20" />

            {/* Profil utilisateur */}
            {!loading && (
              <div ref={profileRef} className="relative">
                {isAuthenticated && user ? (
                  // Utilisateur connecté
                  <div className="relative">
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center gap-3 group"
                    >
                      {/* Indicateur connexion */}
                      <span className="relative">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 block" />
                        <span className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-50" />
                      </span>

                      {/* Avatar / Initiales */}
                      <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                        <span 
                          className="text-xs text-white/80 font-light"
                          style={{ fontFamily: "'Cormorant Garamond', serif" }}
                        >
                          {getInitials()}
                        </span>
                      </div>

                      {/* Badge rôle (discret) */}
                      {roleBadge && (
                        <span className="hidden lg:flex items-center gap-1 text-[10px] text-white/50 uppercase tracking-wider border border-white/10 px-2 py-0.5">
                          {RoleIcon && <RoleIcon size={10} />}
                          {roleBadge.label}
                        </span>
                      )}
                    </button>

                    {/* Dropdown menu */}
                    <AnimatePresence>
                      {isProfileOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-4 w-56 bg-black/95 border border-white/10 backdrop-blur-sm overflow-hidden"
                        >
                          {/* Info utilisateur */}
                          <div className="px-4 py-3 border-b border-white/10">
                            <p className="text-white text-sm font-medium truncate">
                              {user.name}
                            </p>
                            <p className="text-white/40 text-xs truncate mt-0.5">
                              Connecté en tant que {user.name?.split(' ')[0]}
                            </p>
                          </div>

                          {/* Menu items */}
                          <div className="py-1">
                            <a
                              href="/profile"
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                            >
                              <User size={14} />
                              Profil
                            </a>
                            
                            <a
                              href="/dashboard"
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                            >
                              <LayoutDashboard size={14} />
                              Dashboard
                            </a>

                            {isArtist && (
                              <a
                                href={`/artist/${user.id}`}
                                onClick={() => setIsProfileOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                              >
                                <Palette size={14} />
                                Mon profil public
                              </a>
                            )}

                            {isAdmin && (
                              <a
                                href="/admin"
                                onClick={() => setIsProfileOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                              >
                                <Shield size={14} />
                                Panel Admin
                              </a>
                            )}
                          </div>

                          {/* Déconnexion */}
                          <div className="border-t border-white/10 py-1">
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                            >
                              <LogOut size={14} />
                              Déconnexion
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  // Non connecté
                  <a
                    href="/connexion"
                    className="text-sm font-light tracking-[0.2em] text-white/60 hover:text-white transition-colors"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Connexion
                  </a>
                )}
              </div>
            )}
          </nav>

          {/* Menu mobile */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="md:hidden text-white p-2"
            aria-label="Menu"
          >
            <Menu size={24} strokeWidth={1} />
          </button>
        </div>
      </motion.header>

      {/* Menu fullscreen mobile */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col"
          >
            {/* Header du menu */}
            <div className="flex items-center justify-between px-8 py-6">
              <span 
                className="font-serif text-2xl font-semibold text-white"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                ArtFolio
              </span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="text-white p-2"
                aria-label="Fermer"
              >
                <X size={24} strokeWidth={1} />
              </button>
            </div>

            {/* Liens du menu */}
            <nav className="flex-1 flex flex-col items-center justify-center gap-8">
              {navItems.map((item, index) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-4xl md:text-5xl font-serif text-white hover:text-white/60 transition-colors"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {item.label}
                </motion.a>
              ))}

              {/* Profil mobile */}
              {!loading && isAuthenticated && user && (
                <>
                  <div className="w-16 h-px bg-white/20 my-4" />
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-white/60 text-sm">
                        Connecté en tant que {user.name}
                      </span>
                    </div>
                    
                    <div className="flex flex-col items-center gap-3">
                      <a
                        href="/profile"
                        onClick={() => setIsMenuOpen(false)}
                        className="text-2xl font-serif text-white/80 hover:text-white transition-colors"
                        style={{ fontFamily: "'Cormorant Garamond', serif" }}
                      >
                        Mon Profil
                      </a>
                      <a
                        href="/dashboard"
                        onClick={() => setIsMenuOpen(false)}
                        className="text-2xl font-serif text-white/80 hover:text-white transition-colors"
                        style={{ fontFamily: "'Cormorant Garamond', serif" }}
                      >
                        Dashboard
                      </a>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          handleLogout();
                        }}
                        className="text-xl font-serif text-red-400 hover:text-red-300 transition-colors mt-4"
                        style={{ fontFamily: "'Cormorant Garamond', serif" }}
                      >
                        Déconnexion
                      </button>
                    </div>
                  </motion.div>
                </>
              )}

              {!loading && !isAuthenticated && (
                <>
                  <div className="w-16 h-px bg-white/20 my-4" />
                  <motion.a
                    href="/connexion"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-2xl font-serif text-white/60 hover:text-white transition-colors"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    Connexion
                  </motion.a>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
