import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Navigation } from './components/Navigation';
import { CustomCursor } from './components/CustomCursor';
import { GradientOrbs, ParticleField } from './components/GradientOrbs';
import { UploadPage } from './pages/UploadPage';
import { GalleryPage } from './pages/GalleryPage';
import { ArtistDashboard } from './pages/ArtistDashboard';
import { TextScramble } from './components/TextScramble';
import { MagneticButton } from './components/MagneticButton';
import { useScrollAnimation } from './hooks/useScrollAnimation';
import './index.css';

/**
 * Composant principal App avec routing et animations
 */
function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

/**
 * Contenu de l'app avec accès au location pour AnimatePresence
 */
function AppContent() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Effets visuels globaux */}
      <CustomCursor />
      <GradientOrbs count={3} />
      <ParticleField count={15} />

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ 
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Page d'accueil avec hero section
 */
function HomePage() {
  const [heroRef, isHeroVisible] = useScrollAnimation({ threshold: 0.2 });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="min-h-screen flex items-center justify-center relative px-6"
      >
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isHeroVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isHeroVisible ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm text-white/70">IA d'analyse d'art en ligne</span>
            </motion.div>

            {/* Titre */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight">
              <TextScramble 
                text="Analysez vos œuvres" 
                delay={400}
                trigger={isHeroVisible}
              />
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                avec l'IA
              </span>
            </h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={isHeroVisible ? { opacity: 1 } : {}}
              transition={{ delay: 0.6 }}
              className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10"
            >
              Découvrez le style, la palette de couleurs et la valeur estimée 
              de vos œuvres d'art grâce à notre intelligence artificielle avancée.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isHeroVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <MagneticButton
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl font-semibold text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-shadow"
                onClick={() => window.location.href = '/upload'}
              >
                Commencer l'analyse
              </MagneticButton>

              <MagneticButton
                className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-semibold text-white transition-colors"
                onClick={() => window.location.href = '/gallery'}
              >
                Voir la galerie
              </MagneticButton>
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2"
            >
              <motion.div
                animate={{ opacity: [1, 0], y: [0, 12] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-white/60"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <FeaturesSection />

      {/* CTA Section */}
      <CTASection />
    </div>
  );
}

/**
 * Section features avec scroll reveal
 */
function FeaturesSection() {
  const features = [
    {
      title: 'Analyse IA',
      description: 'Notre IA analyse le style, les couleurs et la composition de vos œuvres.',
      icon: '🎨',
      color: 'cyan',
    },
    {
      title: 'Palette de couleurs',
      description: 'Extraction automatique des couleurs dominantes avec codes hexadécimaux.',
      icon: '🎭',
      color: 'purple',
    },
    {
      title: 'Estimation de valeur',
      description: 'Obtenez une estimation de la valeur de votre œuvre basée sur le marché.',
      icon: '💎',
      color: 'pink',
    },
  ];

  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Carte de feature individuelle
 */
function FeatureCard({ feature, index }) {
  const [ref, isVisible] = useScrollAnimation({ threshold: 0.2 });

  const colors = {
    cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/20',
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/20',
    pink: 'from-pink-500/20 to-pink-500/5 border-pink-500/20',
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.2 }}
      className={`
        p-8 rounded-3xl bg-gradient-to-br ${colors[feature.color]}
        border backdrop-blur-sm group hover:scale-[1.02] transition-transform
      `}
    >
      <div className="text-4xl mb-4">{feature.icon}</div>
      <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
      <p className="text-white/60 leading-relaxed">{feature.description}</p>
    </motion.div>
  );
}

/**
 * Section CTA finale
 */
function CTASection() {
  const [ref, isVisible] = useScrollAnimation({ threshold: 0.3 });

  return (
    <section ref={ref} className="py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isVisible ? { opacity: 1, scale: 1 } : {}}
          className="relative p-12 md:p-16 rounded-[2.5rem] overflow-hidden text-center"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20" />
          <div className="absolute inset-0 backdrop-blur-3xl" />
          <div className="absolute inset-0 bg-[#0a0a0f]/60" />

          {/* Content */}
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Prêt à analyser vos œuvres ?
            </h2>
            <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
              Rejoignez des milliers d'artistes qui utilisent notre IA 
              pour comprendre et valoriser leurs créations.
            </p>

            <MagneticButton
              className="px-10 py-5 bg-white text-black rounded-2xl font-semibold text-lg hover:shadow-2xl hover:shadow-white/20 transition-shadow"
              onClick={() => window.location.href = '/upload'}
            >
              Commencer gratuitement
            </MagneticButton>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default App;
