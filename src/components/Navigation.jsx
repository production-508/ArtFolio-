import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Palette, Upload, LayoutGrid, User, Menu, X } from 'lucide-react';
import { MagneticButton } from './MagneticButton';

/**
 * Navigation principale avec glassmorphism
 * Navbar fixe avec effet blur et transitions
 */
export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { to: '/', label: 'Accueil', icon: Palette },
    { to: '/upload', label: 'Uploader', icon: Upload },
    { to: '/gallery', label: 'Galerie', icon: LayoutGrid },
    { to: '/dashboard', label: 'Dashboard', icon: User },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <motion.div
                animate={{ 
                  scale: isScrolled ? 0.9 : 1,
                }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center"
                >
                  <Palette size={20} className="text-white" />
                </div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 blur-lg opacity-50" />
              </motion.div>
              
              <motion.span 
                animate={{ opacity: isScrolled ? 0.8 : 1 }}
                className="text-xl font-bold text-white hidden sm:block"
              >
                ArtFolio
              </motion.span>
            </Link>

            {/* Navigation desktop */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to;
                const Icon = link.icon;
                
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="relative px-4 py-2 group"
                  >
                    <div className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                      isActive ? 'text-white' : 'text-white/60 hover:text-white'
                    }`}>
                      <Icon size={16} />
                      {link.label}
                    </div>
                    
                    {/* Underline animée */}
                    <motion.div
                      className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-cyan-500 to-purple-500"
                      initial={false}
                      animate={{
                        scaleX: isActive ? 1 : 0,
                        opacity: isActive ? 1 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                    />
                    
                    {/* Hover underline */}
                    <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                  </Link>
                );
              })}
            </div>

            {/* CTA Button */}
            <div className="hidden md:block">
              <MagneticButton
                className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-medium text-white transition-colors"
              >
                Connexion
              </MagneticButton>
            </div>

            {/* Menu mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-white"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Menu mobile overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden absolute top-full left-0 right-0 bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/10"
            >
              <div className="px-6 py-6 space-y-2">
                {navLinks.map((link, index) => {
                  const Icon = link.icon;
                  
                  return (
                    <motion.div
                      key={link.to}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={link.to}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Icon size={18} />
                        {link.label}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}

export default Navigation;
