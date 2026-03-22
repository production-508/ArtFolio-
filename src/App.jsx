import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Suspense, lazy } from 'react';
import { useAuth } from './contexts/AuthContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { CartProvider } from './contexts/CartContext';
import InstitutionalNav from './components/InstitutionalNav';
import CartDrawer from './components/CartDrawer';
import JarvisAI from './components/JarvisAI';

// Eager load (critique pour first paint)
import InstitutionalHomePage from './pages/InstitutionalHomePage';
import LandingPage from './pages/LandingPage';
import SearchResultsPage from './pages/SearchResultsPage';
import DemoLogin from './pages/DemoLogin';
import ArtistProfilePage from './pages/ArtistProfilePage';

// Lazy load (pages lourdes)
const AnalyzePage = lazy(() => import('./pages/AnalyzePage'));
const ArtistDashboard = lazy(() => import('./pages/ArtistDashboard'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const RoomViewPage = lazy(() => import('./pages/RoomViewPage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const CheckoutSuccessPage = lazy(() => import('./pages/CheckoutSuccessPage'));
const JarvisDashboardPage = lazy(() => import('./pages/JarvisDashboardPage'));
const JarvisArtworkViewerPage = lazy(() => import('./pages/JarvisArtworkViewerPage'));
const HomePage = lazy(() => import('./pages/HomePage')); // Backup gallery

import './index.css';
import './styles/institutional-theme.css';
import './styles/jarvis-theme.css';

// Loader minimal pour lazy routes
const PageLoader = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="w-8 h-8 border border-white/20 border-t-white rounded-full animate-spin" />
  </div>
);

function App() {
  return <AppContent />;
}

function AppContent() {
  const location = useLocation();
  const { loading, user } = useAuth();

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
          <InstitutionalNav />
          <CartDrawer />
          
          <main>
            <AnimatePresence mode="wait">
              <Suspense fallback={<PageLoader />}>
                <Routes location={location} key={location.pathname}>
                  <Route path="/landing" element={<PageTransition><LandingPage /></PageTransition>} />
                  <Route path="/" element={<PageTransition><InstitutionalHomePage /></PageTransition>} />
                  <Route path="/galerie" element={<PageTransition><HomePage /></PageTransition>} />
                  <Route path="/artist/:id" element={<PageTransition><ArtistProfilePage /></PageTransition>} />
                  <Route path="/profile" element={<PageTransition><UserProfile /></PageTransition>} />
                  <Route path="/login" element={<PageTransition><DemoLogin /></PageTransition>} />
                  <Route path="/recherche" element={<PageTransition><SearchResultsPage /></PageTransition>} />
                  <Route path="/favoris" element={<PageTransition><FavoritesPage /></PageTransition>} />
                  <Route path="/checkout" element={<PageTransition><CheckoutPage /></PageTransition>} />
                  <Route path="/checkout/success" element={<PageTransition><CheckoutSuccessPage /></PageTransition>} />
                  <Route path="/analyze" element={<PageTransition><AnalyzePage /></PageTransition>} />
                  <Route path="/dashboard" element={<PageTransition><ArtistDashboard /></PageTransition>} />
                  <Route path="/jarvis" element={<PageTransition><JarvisDashboardPage /></PageTransition>} />
                  <Route path="/jarvis/artwork/:artworkId" element={<PageTransition><JarvisArtworkViewerPage /></PageTransition>} />
                  <Route path="/visualiser/:artworkId" element={<PageTransition><RoomViewPage /></PageTransition>} />
                  <Route path="/visualiser" element={<PageTransition><RoomViewPage /></PageTransition>} />
                  
                  <Route path="*" element={<PageTransition><InstitutionalHomePage /></PageTransition>} />
                </Routes>
              </Suspense>
            </AnimatePresence>
          </main>

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
