import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  Palette, Upload, LayoutGrid, User, Menu, X, Sparkles 
} from 'lucide-react';

/**
 * Navigation mobile-first
 * Design optimisé tactile, accessible, performant
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

  const navLinks = [
    { to: '/', label: 'Découvrir', icon: Sparkles, shortLabel: 'Accueil' },
    { to: '/upload', label: 'Analyser', icon: Upload },
    { to: '/gallery', label: 'Galerie', icon: LayoutGrid },
    { to: '/dashboard', label: 'Pro', icon: User, shortLabel: 'Dashboard' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Navigation principale - Mobile First */}
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
            <div className="relative w-9 h-9">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500" />
              <div className="absolute inset-[2px] rounded-[10px] bg-[#0a0a0f] flex items-center justify-center">
                <Palette size={18} className="text-white" />
              </div>
            </div>
            <span className="text-lg font-bold text-white">ArtFolio</span>
          </Link>

          {/* Desktop nav - caché sur mobile */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                  isActive(link.to) ? 'text-white' : 'text-white/50 hover:text-white'
                }`}
              >
                {link.shortLabel || link.label}
                {isActive(link.to) && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-cyan-500 to-purple-500"
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <button className="px-5 py-2 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors">
              Connexion
            </button>
          </div>

          {/* Menu mobile button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden relative z-50 w-10 h-10 flex items-center justify-center"
            aria-label={isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
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
                  <X size={24} className="text-white" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu size={24} className="text-white" />
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
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Menu content */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 bg-[#0a0a0f] rounded-t-[2rem] overflow-hidden"
            >
              {/* Handle indicator */}
              <div className="flex justify-center pt-4 pb-2">
                <div className="w-12 h-1 rounded-full bg-white/20" />
              </div>

              <div className="px-6 pb-8 pt-4">
                <div className="space-y-2">
                  {navLinks.map((link, index) => {
                    const Icon = link.icon;
                    const active = isActive(link.to);
                    
                    return (
                      <motion.div
                        key={link.to}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          to={link.to}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${
                            active 
                              ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30' 
                              : 'hover:bg-white/5'
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            active ? 'bg-cyan-500/20' : 'bg-white/5'
                          }`}>
                            <Icon size={24} className={active ? 'text-cyan-400' : 'text-white/60'} />
                          </div>
                          <div className="flex-1">
                            <span className={`text-lg font-medium block ${active ? 'text-white' : 'text-white/80'}`}>
                              {link.label}
                            </span>
                          </div>
                          {active && (
                            <motion.div
                              layoutId="mobileActive"
                              className="w-2 h-2 rounded-full bg-cyan-400"
                            />
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                {/* CTA Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 pt-6 border-t border-white/10"
                >
                  <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold text-lg">
                    Connexion / Inscription
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom nav bar - visible uniquement sur mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-white/10 md:hidden safe-area-pb">
        <div className="flex items-center justify-around h-16">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.to);
            
            return (
              <Link
                key={link.to}
                to={link.to}
                className="flex flex-col items-center gap-1 py-2 px-3"
              >
                <div className={`relative p-2 rounded-xl transition-colors ${
                  active ? 'text-cyan-400' : 'text-white/40'
                }`}>
                  <Icon size={22} />
                  {active && (
                    <motion.div
                      layoutId="bottomNav"
                      className="absolute inset-0 bg-cyan-500/20 rounded-xl -z-10"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </div>
                <span className={`text-[10px] font-medium ${active ? 'text-cyan-400' : 'text-white/40'}`}>
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

export default Navigation;
