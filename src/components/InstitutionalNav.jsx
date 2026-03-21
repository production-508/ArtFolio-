import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

/**
 * Navigation Institutionnelle — Minimaliste
 * Style galerie d'art (Hauser & Wirth, Gagosian)
 */
export default function InstitutionalNav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

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
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
