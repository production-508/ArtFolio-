import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Navigation } from './components/Navigation';
import { CustomCursor } from './components/CustomCursor';
import { GradientOrbs } from './components/GradientOrbs';
import HomePage from './pages/HomePage';
import UploadPage from './pages/UploadPage';
import GalleryPage from './pages/GalleryPage';
import ArtistDashboard from './pages/ArtistDashboard';
import './index.css';

/**
 * Composant principal App avec routing et animations
 */
function App() {
  return (
    <AppContent />
  );
}

/**
 * Contenu de l'app avec accès au location pour AnimatePresence
 */
function AppContent() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Effets visuels globaux */}
      <CustomCursor />
      <div className="fixed inset-0 pointer-events-none">
        <GradientOrbs count={5} />
      </div>

      {/* Navigation */}
      <Navigation />

      {/* Routes avec animations */}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
          <Route path="/upload" element={<PageTransition><UploadPage /></PageTransition>} />
          <Route path="/gallery" element={<PageTransition><GalleryPage /></PageTransition>} />
          <Route path="/dashboard" element={<PageTransition><ArtistDashboard /></PageTransition>} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

/**
 * Wrapper pour les animations de transition de page
 */
function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ 
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
    >
      {children}
    </motion.div>
  );
}

export default App;
