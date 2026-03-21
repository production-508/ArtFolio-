import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Shield, Eye, ArrowRight } from 'lucide-react';

/**
 * Page de connexion démo - 3 comptes prêts à l'emploi
 * Style institutionnel épuré
 */
export default function DemoLogin() {
  const navigate = useNavigate();
  const { loginDemo, loading, error } = useAuth();
  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = async (type) => {
    const success = await loginDemo(type, rememberMe);
    if (success) {
      navigate('/');
    }
  };

  const demoAccounts = [
    {
      type: 'artist',
      title: 'Artiste',
      description: 'Accès dashboard, upload d\'œuvres, profil public',
      icon: User,
      color: 'border-white/20 hover:border-white/40'
    },
    {
      type: 'admin', 
      title: 'Administrateur',
      description: 'Modération, statistiques, gestion utilisateurs',
      icon: Shield,
      color: 'border-white/20 hover:border-white/40'
    },
    {
      type: 'visitor',
      title: 'Visiteur', 
      description: 'Explorer la galerie, favoris, contact',
      icon: Eye,
      color: 'border-white/20 hover:border-white/40'
    }
  ];

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 
            className="text-white text-3xl mb-3"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Connexion
          </h1>
          <p 
            className="text-white/50 text-sm"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Choisissez un compte de démonstration
          </p>
        </motion.div>

        {/* Comptes demo */}
        <div className="space-y-4">
          {demoAccounts.map((account, index) => (
            <motion.button
              key={account.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => handleLogin(account.type)}
              disabled={loading}
              className={`
                w-full p-6 text-left border bg-transparent
                transition-all duration-300 group
                ${account.color}
                ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-white/5'}
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <account.icon 
                    size={20} 
                    className="text-white/60 group-hover:text-white transition-colors" 
                  />
                  <div>
                    <h3 
                      className="text-white text-lg mb-1"
                      style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                    >
                      {account.title}
                    </h3>
                    <p 
                      className="text-white/40 text-xs"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {account.description}
                    </p>
                  </div>
                </div>
                <ArrowRight 
                  size={16} 
                  className="text-white/30 group-hover:text-white/60 transition-colors" 
                />
              </div>
            </motion.button>
          ))}
        </div>

        {/* Remember me */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex items-center justify-center gap-2"
        >
          <input
            type="checkbox"
            id="remember"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 accent-white/20 bg-transparent border-white/30"
          />
          <label 
            htmlFor="remember"
            className="text-white/40 text-xs cursor-pointer"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Se souvenir de moi
          </label>
        </motion.div>

        {/* Error message */}
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 text-red-400 text-sm text-center"
          >
            {error}
          </motion.p>
        )}

        {/* Back to gallery */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => navigate('/')}
          className="mt-8 w-full text-center text-white/30 text-sm hover:text-white/60 transition-colors"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Continuer sans connexion →
        </motion.button>
      </div>
    </div>
  );
}
