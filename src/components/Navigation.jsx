import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  Palette, Upload, LayoutGrid, User, Menu, X, Sparkles, ChevronRight 
} from 'lucide-react';

/**
 * Navigation principale révolutionnaire
 * Effet de blur dynamique, micro-interactions, menu immersif
 */
export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { to: '/', label: 'Découvrir', icon: Sparkles },
    { to: '/upload', label: 'Analyser', icon: Upload },
    { to: '/gallery', label: 'Galerie', icon: LayoutGrid },
    { to: '/dashboard', label: 'Espace Pro', icon: User },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'w-[95%] max-w-5xl' 
            : 'w-[90%] max-w-4xl'
        }`}
      >
        <div className={`
          relative rounded-2xl border backdrop-blur-2xl transition-all duration-500
          ${isScrolled 
            ? 'bg-[#0a0a0f]/90 border-white/10 shadow-2xl shadow-black/50' 
            : 'bg-[#0a0a0f]/60 border-white/5'
          }
        `}>
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="relative flex items-center justify-between h-16 px-6">
            {/* Logo avec animation */}
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-10 h-10"
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500" />
                <div className="absolute inset-[2px] rounded-[10px] bg-[#0a0a0f] flex items-center justify-center">
                  <Palette size={18} className="text-white" />
                </div>
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 blur-md opacity-50 group-hover:opacity-100 transition-opacity" />
              </motion.div>
              
              <span className="text-lg font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                ArtFolio
              </span>
            </Link>

            {/* Navigation desktop avec indicateur flottant */}
            <div className="hidden md:flex items-center gap-1 relative">
              {navLinks.map((link, index) => {
                const isActive = location.pathname === link.to;
                const Icon = link.icon;
                
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="relative px-5 py-2.5 group"
                  >
                    {/* Background hover */}
                    <AnimatePresence>
                      {(hoveredIndex === index || isActive) && (
                        <motion.div
                          layoutId="navHighlight"
                          className="absolute inset-0 rounded-xl bg-white/5"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                    </AnimatePresence>
                    
                    <div className={`relative flex items-center gap-2 text-sm font-medium transition-colors ${
                      isActive ? 'text-white' : 'text-white/50 hover:text-white'
                    }`}>
                      <Icon size={15} className={`transition-transform ${hoveredIndex === index ? 'scale-110' : ''}`} />
                      {link.label}
                      
                      {/* Dot indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="navDot"
                          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cyan-400"
                        />
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* CTA Button premium */}
            <div className="hidden md:block">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative px-5 py-2.5 rounded-xl overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500" />
                <div className="absolute inset-[1px] rounded-[11px] bg-[#0a0a0f] group-hover:bg-transparent transition-colors" />
                <span className="relative text-sm font-medium text-white group-hover:text-white">
                  Connexion
                </span>
              </motion.button>
            </div>

            {/* Menu mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
            >
              <motion.div
                animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </motion.div>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Menu mobile full-screen */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div className="absolute inset-0 bg-[#0a0a0f]/98 backdrop-blur-2xl" />
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="relative h-full flex flex-col items-center justify-center gap-2"
            >
              {navLinks.map((link, index) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.to;
                
                return (
                  <motion.div
                    key={link.to}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={link.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-4 px-8 py-4 rounded-2xl text-2xl font-medium transition-all ${
                        isActive 
                          ? 'text-white bg-white/10' 
                          : 'text-white/50 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon size={24} />
                      {link.label}
                      {isActive && (
                        <motion.div
                          layoutId="mobileIndicator"
                          className="w-2 h-2 rounded-full bg-cyan-400"
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navigation;
