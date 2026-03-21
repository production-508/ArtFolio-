import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Search, Sparkles, User, Menu, X, Palette, ImagePlus
} from 'lucide-react';

/**
 * Navigation mobile-first - Galerie-centric
 */
export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Bloquer le scroll quand le menu est ouvert
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  // Navigation publique (galerie en premier)
  const publicLinks = [
    { to: '/', label: 'Découvrir', icon: Home },
    { to: '/search', label: 'Rechercher', icon: Search },
  ];

  // Navigation artiste (protégée)
  const artistLinks = [
    { to: '/analyze', label: 'Analyser', icon: Sparkles },
    { to: '/dashboard', label: 'Profil', icon: User },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Navigation principale */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled || isMobileMenuOpen
            ? 'bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/10' 
            : 'bg-transparent'
        }`}
      >
        <div className="flex items-center justify-between h-14 px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 z-50">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500" />
              <div className="absolute inset-[2px] rounded-[10px] bg-[#0a0a0f] flex items-center justify-center">
                <Palette size={16} className="text-white" />
              </div>
            </div>
            <span className="text-lg font-bold text-white">ArtFolio</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {publicLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                  isActive(link.to) ? 'text-white' : 'text-white/50 hover:text-white'
                }`}
              >
                {link.label}
                {isActive(link.to) && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-cyan-500 to-purple-500"
                  />
                )}
              </Link>
            ))}

            <div className="w-px h-6 bg-white/10 mx-2" />

            {artistLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive(link.to) ? 'text-cyan-400' : 'text-white/50 hover:text-white'
                }`}
              >
                <link.icon size={16} />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden relative z-50 w-10 h-10 flex items-center justify-center"
            aria-label={isMobileMenuOpen ? 'Fermer' : 'Menu'}
          >
            <AnimatePresence mode="wait">
              {isMobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X size={22} className="text-white" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu size={22} className="text-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.nav>

      {/* Menu mobile full-screen */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <motion.div 
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 bg-[#0a0a0f] rounded-t-[2rem] overflow-hidden max-h-[85vh]"
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-white/20" />
              </div>

              <div className="px-6 pb-8 pt-4 overflow-y-auto">
                {/* Section Publique */}
                <div className="mb-6">
                  <p className="text-xs font-medium text-white/30 uppercase tracking-wider mb-3 px-2">Explorer</p>
                  <div className="space-y-1">
                    {publicLinks.map((link, index) => (
                      <NavItem 
                        key={link.to}
                        link={link} 
                        isActive={isActive(link.to)}
                        onClick={() => setIsMobileMenuOpen(false)}
                        delay={index * 0.05}
                      />
                    ))}
                  </div>
                </div>

                {/* Section Artiste */}
                <div className="mb-6">
                  <p className="text-xs font-medium text-white/30 uppercase tracking-wider mb-3 px-2">Espace Artiste</p>
                  <div className="space-y-1">
                    {artistLinks.map((link, index) => (
                      <NavItem 
                        key={link.to}
                        link={link} 
                        isActive={isActive(link.to)}
                        onClick={() => setIsMobileMenuOpen(false)}
                        delay={0.1 + index * 0.05}
                      />
                    ))}
                  </div>
                </div>

                {/* CTA Connexion */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="pt-4 border-t border-white/10"
                >
                  <p className="text-sm text-white/50 text-center mb-4">Vous êtes artiste ?</p>
                  <button className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold">
                    Créer un compte
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom nav bar - mobile uniquement */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-white/10 md:hidden safe-area-pb">
        <div className="flex items-center justify-around h-16">
          <Link
            to="/"
            className={`flex flex-col items-center gap-1 py-2 px-4 ${isActive('/') ? 'text-cyan-400' : 'text-white/40'}`}
          >
            <Home size={22} />
            <span className="text-[10px] font-medium">Galerie</span>
          </Link>

          <Link
            to="/search"
            className={`flex flex-col items-center gap-1 py-2 px-4 ${isActive('/search') ? 'text-cyan-400' : 'text-white/40'}`}
          >
            <Search size={22} />
            <span className="text-[10px] font-medium">Recherche</span>
          </Link>

          {/* Bouton Analyse - Central et mis en avant */}
          <Link
            to="/analyze"
            className="flex flex-col items-center -mt-6"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/25 ${
              isActive('/analyze') 
                ? 'bg-gradient-to-br from-cyan-500 to-purple-500' 
                : 'bg-gradient-to-br from-cyan-500/80 to-purple-500/80'
            }`}>
              <Sparkles size={24} className="text-white" />
            </div>
            <span className={`text-[10px] font-medium mt-1 ${isActive('/analyze') ? 'text-cyan-400' : 'text-white/40'}`}>
              Analyser
            </span>
          </Link>

          <Link
            to="/dashboard"
            className={`flex flex-col items-center gap-1 py-2 px-4 ${isActive('/dashboard') ? 'text-cyan-400' : 'text-white/40'}`}
          >
            <ImagePlus size={22} />
            <span className="text-[10px] font-medium">Mes œuvres</span>
          </Link>

          <Link
            to="/profile"
            className={`flex flex-col items-center gap-1 py-2 px-4 ${isActive('/profile') ? 'text-cyan-400' : 'text-white/40'}`}
          >
            <User size={22} />
            <span className="text-[10px] font-medium">Profil</span>
          </Link>
        </div>
      </nav>
    </>
  );
}

function NavItem({ link, isActive, onClick, delay }) {
  const Icon = link.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
    >
      <Link
        to={link.to}
        onClick={onClick}
        className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${
          isActive 
            ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30' 
            : 'hover:bg-white/5'
        }`}
      >
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          isActive ? 'bg-cyan-500/20' : 'bg-white/5'
        }`}>
          <Icon size={20} className={isActive ? 'text-cyan-400' : 'text-white/60'} />
        </div>
        <div className="flex-1">
          <span className={`font-medium ${isActive ? 'text-white' : 'text-white/80'}`}>
            {link.label}
          </span>
        </div>
        {isActive && (
          <motion.div
            layoutId="mobileActive"
            className="w-1.5 h-1.5 rounded-full bg-cyan-400"
          />
        )}
      </Link>
    </motion.div>
  );
}

export default Navigation;
