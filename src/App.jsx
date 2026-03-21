import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from './contexts/AuthContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { CartProvider } from './contexts/CartContext';
import InstitutionalNav from './components/InstitutionalNav';
import CartDrawer from './components/CartDrawer';
import JarvisAI from './components/JarvisAI';
import LandingPage from './pages/LandingPage';
import InstitutionalHomePage from './pages/InstitutionalHomePage';
import HomePage from './pages/HomePage';
import AnalyzePage from './pages/AnalyzePage';
import ArtistDashboard from './pages/ArtistDashboard';
import ArtistProfilePage from './pages/ArtistProfilePage';
import UserProfile from './pages/UserProfile';
import DemoLogin from './pages/DemoLogin';
import SearchResultsPage from './pages/SearchResultsPage';
import RoomViewPage from './pages/RoomViewPage';
import FavoritesPage from './pages/FavoritesPage';
import CheckoutPage from './pages/CheckoutPage';
import CheckoutSuccessPage from './pages/CheckoutSuccessPage';
import JarvisDashboardPage from './pages/JarvisDashboardPage';
import JarvisArtworkViewerPage from './pages/JarvisArtworkViewerPage';
import './index.css';
import './styles/institutional-theme.css';
import './styles/jarvis-theme.css';

function App() {
  return <AppContent />;
}

function AppContent() {
  const location = useLocation();
  const { loading, user } = useAuth();

  // Afficher un loader pendant l'initialisation auth
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <FavoritesProvider user={user}>
      <CartProvider>
        <div className="min-h-screen bg-black text-white overflow-x-hidden selection:bg-white/20 selection:text-white">
          {/* Navigation institutionnelle minimaliste */}
          <InstitutionalNav />

          {/* Drawer panier */}
          <CartDrawer />

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
                
                {/* Login Demo */}
                <Route path="/login" element={<PageTransition><DemoLogin /></PageTransition>} />
                
                {/* Résultats de recherche */}
                <Route path="/recherche" element={<PageTransition><SearchResultsPage /></PageTransition>} />
                
                {/* Favoris */}
                <Route path="/favoris" element={<PageTransition><FavoritesPage /></PageTransition>} />
                
                {/* Checkout */}
                <Route path="/checkout" element={<PageTransition><CheckoutPage /></PageTransition>} />
                <Route path="/checkout/success" element={<PageTransition><CheckoutSuccessPage /></PageTransition>} />
                
                {/* Outil d'analyse pour artistes */}
                <Route path="/analyze" element={<PageTransition><AnalyzePage /></PageTransition>} />
                
                {/* Dashboard Artiste */}
                <Route path="/dashboard" element={<PageTransition><ArtistDashboard /></PageTransition>} />
                
                {/* Dashboard JARVIS */}
                <Route path="/jarvis" element={<PageTransition><JarvisDashboardPage /></PageTransition>} />
                
                {/* Artwork Viewer JARVIS HUD */}
                <Route path="/jarvis/artwork/:artworkId" element={<PageTransition><JarvisArtworkViewerPage /></PageTransition>} />
                
                {/* Visualisation murale */}
                <Route path="/visualiser/:artworkId" element={<PageTransition><RoomViewPage /></PageTransition>} />
                <Route path="/visualiser" element={<PageTransition><RoomViewPage /></PageTransition>} />
                
                {/* Fallback */}
                <Route path="*" element={<PageTransition><InstitutionalHomePage /></PageTransition>} />
              </Routes>
            </AnimatePresence>
          </main>

          {/* Assistant IA JARVIS */}
          <JarvisAI />
        </div>
      </CartProvider>
    </FavoritesProvider>
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
