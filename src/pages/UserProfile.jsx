import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Settings, 
  LogOut, 
  Palette, 
  Shield, 
  ChevronRight,
  Mail,
  Calendar,
  Award
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Page Profil Utilisateur
 * Style institutionnel, sobre et élégant
 */
export default function UserProfile() {
  const { user, isArtist, isAdmin, logout, getInitials, loading } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Redirection si non connecté
  if (!loading && !user) {
    navigate('/');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleLabel = () => {
    if (isAdmin) return 'Administrateur';
    if (isArtist) return 'Artiste';
    return 'Collectionneur';
  };

  const getRoleIcon = () => {
    if (isAdmin) return <Shield size={16} className="text-white/60" />;
    if (isArtist) return <Palette size={16} className="text-white/60" />;
    return <Award size={16} className="text-white/60" />;
  };

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 px-8 md:px-16">
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="text-white/40 text-sm tracking-[0.3em] uppercase mb-4">
            Mon Compte
          </p>
          <h1 
            className="text-4xl md:text-5xl text-white font-light"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Profil
          </h1>
        </motion.div>

        <div className="grid md:grid-cols-[280px_1fr] gap-12">
          {/* Sidebar - Carte profil */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-6"
          >
            {/* Carte identité */}
            <div className="border border-white/10 p-8 text-center">
              {/* Avatar */}
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <span 
                  className="text-2xl text-white/80 font-light"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {getInitials()}
                </span>
              </div>

              {/* Nom */}
              <h2 
                className="text-xl text-white mb-2"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {user.name}
              </h2>

              {/* Badge rôle */}
              <div className="inline-flex items-center gap-2 px-3 py-1 border border-white/10 text-white/60 text-xs tracking-wider">
                {getRoleIcon()}
                <span>{getRoleLabel()}</span>
              </div>

              {/* Indicateur connexion */}
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-white/40">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Connecté</span>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="space-y-2">
              {isArtist && (
                <button
                  onClick={() => navigate('/artist/' + user.id)}
                  className="w-full flex items-center justify-between px-4 py-3 border border-white/10 text-white/70 text-sm hover:bg-white/5 hover:text-white transition-colors group"
                >
                  <span className="flex items-center gap-3">
                    <Palette size={16} />
                    Voir mon profil public
                  </span>
                  <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              )}

              {isAdmin && (
                <button
                  onClick={() => navigate('/admin')}
                  className="w-full flex items-center justify-between px-4 py-3 border border-white/10 text-white/70 text-sm hover:bg-white/5 hover:text-white transition-colors group"
                >
                  <span className="flex items-center gap-3">
                    <Shield size={16} />
                    Panel Admin
                  </span>
                  <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              )}

              <button
                onClick={() => navigate('/dashboard')}
                className="w-full flex items-center justify-between px-4 py-3 border border-white/10 text-white/70 text-sm hover:bg-white/5 hover:text-white transition-colors group"
              >
                <span className="flex items-center gap-3">
                  <Settings size={16} />
                  Dashboard
                </span>
                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </motion.aside>

          {/* Contenu principal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Informations du compte */}
            <section className="border border-white/10 p-8">
              <h3 
                className="text-lg text-white mb-8 pb-4 border-b border-white/10"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Informations du compte
              </h3>

              <div className="space-y-6">
                <div className="grid md:grid-cols-[120px_1fr] gap-4 items-center">
                  <div className="flex items-center gap-2 text-white/40 text-sm">
                    <User size={14} />
                    <span>Nom</span>
                  </div>
                  <p className="text-white">{user.name}</p>
                </div>

                <div className="grid md:grid-cols-[120px_1fr] gap-4 items-center">
                  <div className="flex items-center gap-2 text-white/40 text-sm">
                    <Mail size={14} />
                    <span>Email</span>
                  </div>
                  <p className="text-white">{user.email}</p>
                </div>

                <div className="grid md:grid-cols-[120px_1fr] gap-4 items-center">
                  <div className="flex items-center gap-2 text-white/40 text-sm">
                    <Award size={14} />
                    <span>Rôle</span>
                  </div>
                  <p className="text-white capitalize">{getRoleLabel()}</p>
                </div>

                {user.plan && (
                  <div className="grid md:grid-cols-[120px_1fr] gap-4 items-center">
                    <div className="flex items-center gap-2 text-white/40 text-sm">
                      <Calendar size={14} />
                      <span>Plan</span>
                    </div>
                    <p className="text-white capitalize">{user.plan}</p>
                  </div>
                )}

                {user.created_at && (
                  <div className="grid md:grid-cols-[120px_1fr] gap-4 items-center">
                    <div className="flex items-center gap-2 text-white/40 text-sm">
                      <Calendar size={14} />
                      <span>Membre depuis</span>
                    </div>
                    <p className="text-white">
                      {new Date(user.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Actions */}
            <section className="border border-white/10 p-8">
              <h3 
                className="text-lg text-white mb-8 pb-4 border-b border-white/10"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Actions
              </h3>

              <div className="flex flex-wrap gap-4">
                {!showLogoutConfirm ? (
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="flex items-center gap-3 px-6 py-3 border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={16} />
                    Déconnexion
                  </button>
                ) : (
                  <div className="flex items-center gap-4">
                    <span className="text-white/60 text-sm">Confirmer ?</span>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 bg-red-500/20 text-red-400 text-sm hover:bg-red-500/30 transition-colors"
                    >
                      Oui
                    </button>
                    <button
                      onClick={() => setShowLogoutConfirm(false)}
                      className="px-4 py-2 border border-white/20 text-white/60 text-sm hover:bg-white/5 transition-colors"
                    >
                      Non
                    </button>
                  </div>
                )}
              </div>
            </section>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
