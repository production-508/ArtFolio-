import { useState } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ReactLenis } from '@studio-freight/react-lenis';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext.jsx';
import Header from './components/Header/Header.jsx';
import AuthModal from './components/Auth/AuthModal.jsx';
import Home from './pages/Home.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Profile from './pages/Profile.jsx';
import ArtistProfile from './pages/ArtistProfile.jsx';
import AddArtwork from './pages/AddArtwork.jsx';
import ThemeEditor from './pages/ThemeEditor.jsx';
import ResetPassword from './pages/ResetPassword.jsx';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  return children;
}

import AdminDashboard from './pages/AdminDashboard.jsx';

// Page artiste publique (sans header ArtFolio)
import Gallery from './pages/Gallery.jsx';
import Artists from './pages/Artists.jsx';

function PublicArtistPage() {
  return <ArtistProfile />;
}

export default function App() {
  const [authModal, setAuthModal] = useState(null);

  const MainLayout = () => (
    <>
      <Header onOpenAuth={(tab) => setAuthModal(tab)} />
      <Outlet context={{ setAuthModal }} />
    </>
  );

  return (
    <ReactLenis root options={{ lerp: 0.08, duration: 1.2, smoothTouch: false }}>
      <Toaster position="top-center" />
      <Routes>
        {/* Pages avec header */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home onOpenAuth={(tab) => setAuthModal(tab)} />} />
          <Route path="/galerie" element={<Gallery />} />
          <Route path="/artistes" element={<Artists />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/galerie/ajouter" element={<PrivateRoute><AddArtwork /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
        </Route>

        {/* Pages artiste publiques et utilitaires spéciales (sans header) */}
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/artiste/:id" element={<PublicArtistPage />} />
        <Route path="/artiste/preview" element={<PrivateRoute><PublicArtistPage /></PrivateRoute>} />
        <Route path="/theme-editor" element={<PrivateRoute><ThemeEditor /></PrivateRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {authModal && (
        <AuthModal
          initialTab={authModal}
          onClose={() => setAuthModal(null)}
        />
      )}
    </ReactLenis>
  );
}
