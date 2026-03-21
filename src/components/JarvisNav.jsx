import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Search, Bell, User, Command } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Navigation JARVIS — Flottante, glassmorphism, effets néon
 */
export default function JarvisNav() {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { path: '/', label: 'Galerie' },
    { path: '/artistes', label: 'Artistes' },
    { path: '/recherche', label: 'Recherche' },
    { path: '/favoris', label: 'Favoris' },
  ];

  return (
    <>
      {/* Main Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`
          fixed top-4 left-1/2 -translate-x-1/2 z-50
          px-6 py-3 rounded-full
          transition-all duration-500
          ${isScrolled 
            ? 'bg-black/80 backdrop-blur-xl shadow-[0_0_30px_rgba(0,240,255,0.1)]' 
            : 'bg-transparent'}
          border border-cyan-400/20
        `}
      >
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <motion.div
              animate={{ 
                boxShadow: ['0 0 5px rgba(0,240,255,0.5)', '0 0 20px rgba(0,240,255,0.8)', '0 0 5px rgba(0,240,255,0.5)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-8 h-8 rounded-full bg-cyan-400 flex items-center justify-center"
            >
              <span className="text-black font-bold text-sm">A</span>
            </motion.div>
            <span 
              className="text-cyan-400 font-bold tracking-[0.2em] text-sm hidden sm:block"
              style={{ fontFamily: "'Orbitron', monospace" }}
            >
              ARTFOLIO
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="relative group"
              >
                <span 
                  className={`
                    text-sm uppercase tracking-widest transition-colors duration-300
                    ${location.pathname === item.path 
                      ? 'text-cyan-400' 
                      : 'text-white/60 hover:text-cyan-400'}
                  `}
                  style={{ fontFamily: "'Orbitron', monospace" }}
                >
                  {item.label}
                </span>
                
                {/* Underline glow */}
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: location.pathname === item.path ? 1 : 0 }}
                  className="absolute -bottom-1 left-0 right-0 h-[2px] bg-cyan-400 origin-left"
                  style={{ boxShadow: '0 0 10px rgba(0, 240, 255, 0.8)' }}
                />
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <button className="p-2 text-white/60 hover:text-cyan-400 transition-colors">
              <Search size={18} />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 text-white/60 hover:text-cyan-400 transition-colors relative"
              >
                <Bell size={18} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-4 w-80 bg-black/90 backdrop-blur-xl border border-cyan-400/30 rounded-lg overflow-hidden"
                  >
                    <div className="p-4 border-b border-cyan-400/20">
                      <span className="text-cyan-400 text-sm uppercase tracking-widest"
                            style={{ fontFamily: "'Orbitron', monospace" }}>
                        Notifications
                      </span>
                    </div>
                    <div className="p-4 space-y-3">
                      {[
                        { text: 'Nouvelle œuvre de Elena V.', time: '2m' },
                        { text: 'Votre commande est confirmée', time: '1h' },
                        { text: '5 œuvres ajoutées aux favoris', time: '3h' },
                      ].map((notif, i) => (
                        <div key={i} className="flex justify-between items-start text-sm">
                          <span className="text-white/70">{notif.text}</span>
                          <span className="text-white/40 text-xs">{notif.time}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile */}
            <Link to="/profile" className="p-2 text-white/60 hover:text-cyan-400 transition-colors">
              <User size={18} />
            </Link>

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 text-white/60 hover:text-cyan-400"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl flex items-center justify-center"
          >
            <div className="text-center space-y-8">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-3xl uppercase tracking-[0.3em] text-white/80 hover:text-cyan-400 transition-colors"
                    style={{ fontFamily: "'Orbitron', monospace" }}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
