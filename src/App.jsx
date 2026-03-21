import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from './contexts/AuthContext';
import InstitutionalNav from './components/InstitutionalNav';
import LandingPage from './pages/LandingPage';
import InstitutionalHomePage from './pages/InstitutionalHomePage';
import HomePage from './pages/HomePage';
import AnalyzePage from './pages/AnalyzePage';
import ArtistDashboard from './pages/ArtistDashboard';
import ArtistProfilePage from './pages/ArtistProfilePage';
import UserProfile from './pages/UserProfile';
import './index.css';
import './styles/institutional-theme.css';

function App() {
  return <AppContent />;
}

function AppContent() {
  const location = useLocation();
  const { loading } = useAuth();

  // Afficher un loader pendant l'initialisation auth
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden selection:bg-white/20 selection:text-white">
      {/* Navigation institutionnelle minimaliste */}
      <InstitutionalNav />

      {/* Contenu principal */}
      <main>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Landing Page Marketing (original) */}
            <Route path="/landing" element={<PageTransition><LandingPage /></PageTransition>} />
            
            {/* Home - Style galerie institutionnelle */}
            <Route path="/" element={<PageTransition><InstitutionalHomePage /></PageTransition>} />
            
            {/* Galerie Blue Cinis (backup) */}
            <Route path="/galerie" element={<PageTransition><HomePage /></PageTransition>} />
            
            {/* Profil Artiste Public */}
            <Route path="/artist/:id" element={<PageTransition><ArtistProfilePage /></PageTransition>} />
            
            {/* Profil Utilisateur Connecté */}
            <Route path="/profile" element={<PageTransition><UserProfile /></PageTransition>} />
            
            {/* Outil d'analyse pour artistes */}
            <Route path="/analyze" element={<PageTransition><AnalyzePage /></PageTransition>} />
            
            {/* Dashboard Artiste */}
            <Route path="/dashboard" element={<PageTransition><ArtistDashboard /></PageTransition>} />
            
            {/* Fallback */}
            <Route path="*" element={<PageTransition><InstitutionalHomePage /></PageTransition>} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}

function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}

export default App;
