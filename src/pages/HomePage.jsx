import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Sparkles, Zap, Palette, TrendingUp, Shield,
  Play, Pause, ChevronDown, Star, Users, Award, Upload
} from 'lucide-react';
import { TextScramble } from '../components/TextScramble';

/**
 * Page d'accueil révolutionnaire avec démo interactive
 */
export default function HomePage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div ref={containerRef} className="relative">
      {/* Hero Section Immersive */}
      <HeroSection opacity={opacity} y={y} />
      
      {/* Interactive Demo Section */}
      <DemoSection />
      
      {/* Features Grid avec scroll reveal */}
      <FeaturesSection />
      
      {/* How it Works */}
      <HowItWorksSection />
      
      {/* Social Proof */}
      <SocialProofSection />
      
      {/* Final CTA */}
      <CTASection />
    </div>
  );
}

/**
 * Hero Section avec effet de parallaxe et CTA immersif
 */
function HeroSection({ opacity, y }) {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const stats = [
    { value: '50K+', label: 'Œuvres analysées' },
    { value: '12K+', label: 'Artistes' },
    { value: '98%', label: 'Satisfaction' },
  ];

  return (
    <motion.section 
      style={{ opacity, y }}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Gradient orbes animés */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ x: mousePosition.x, y: mousePosition.y }}
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-cyan-500/20 blur-[150px]"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          style={{ x: -mousePosition.x * 0.5, y: -mousePosition.y * 0.5 }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-purple-500/20 blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, 60, 0],
            y: [0, 80, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 right-1/3 w-[400px] h-[400px] rounded-full bg-pink-500/15 blur-[100px]"
        />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_70%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
            >
              <span className="flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
              </span>
              <span className="text-sm text-white/70">L'IA d'analyse d'art la plus avancée</span>
            </motion.div>

            {/* Title avec text scramble */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6"
            >
              <span className="text-white">Révélez le</span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                <TextScramble text="potentiel" duration={2000} />
              </span>
              <br />
              <span className="text-white">de vos œuvres</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-lg md:text-xl text-white/50 mb-10 max-w-xl mx-auto lg:mx-0"
            >
              Notre IA analyse vos créations en secondes : style artistique, palette de couleurs, 
              estimation de valeur et description SEO optimisée.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start mb-12"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/upload')}
                className="group relative px-8 py-4 rounded-2xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500" />
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center gap-3 text-white font-semibold">
                  <Sparkles size={20} />
                  Analyser mon œuvre
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/gallery')}
                className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors"
              >
                Explorer la galerie
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex items-center justify-center lg:justify-start gap-8"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-white/40">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Visual demo */}
          <HeroVisualDemo />
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2 text-white/30 cursor-pointer hover:text-white/50 transition-colors"
          onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <span className="text-xs uppercase tracking-widest">Découvrir</span>
          <ChevronDown size={20} />
        </motion.div>
      </motion.div>
    </motion.section>
  );
}

/**
 * Visual Demo pour le Hero - montre une preview de l'analyse
 */
function HeroVisualDemo() {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, x: 50 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ delay: 0.4, duration: 0.8 }}
      className="hidden lg:block relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full aspect-square max-w-lg mx-auto">
        {/* Main card */}
        <motion.div
          animate={{
            rotateY: isHovered ? 5 : 0,
            rotateX: isHovered ? -5 : 0,
          }}
          transition={{ duration: 0.4 }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-xl p-1"
          style={{ perspective: 1000 }}
        >
          <div className="rounded-[22px] overflow-hidden bg-[#0a0a0f]">
            {/* Mock artwork */}
            <div className="relative aspect-[4/3] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 via-purple-500/30 to-pink-500/30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, 2, -2, 0]
                  }}
                  transition={{ duration: 8, repeat: Infinity }}
                  className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-400 via-purple-400 to-pink-400 blur-sm"
                />
              </div>
              
              {/* Scanning effect */}
              <motion.div
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_rgba(34,211,238,0.8)]"
              />
              
              {/* Floating labels */}
              <AnimatePresence>
                {isHovered && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-cyan-500/30 text-xs text-cyan-400"
                    >
                      Abstrait Géométrique
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-purple-500/30 text-xs text-purple-400"
                    >
                      Confiance: 94%
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            
            {/* Analysis preview */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-cyan-400"></div>
                <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                <div className="w-3 h-3 rounded-full bg-pink-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              </div>
              
              <div className="space-y-2">
                <div className="h-2 bg-white/10 rounded-full w-3/4"></div>
                <div className="h-2 bg-white/10 rounded-full w-1/2"></div>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-white/50">Estimation</span>
                <span className="text-lg font-bold text-white">2,400€ - 4,800€</span>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Floating elements */}
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute -top-8 -right-8 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl"
        >
          <Zap size={24} className="text-cyan-400" />
        </motion.div>
        
        <motion.div
          animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
          className="absolute -bottom-4 -left-8 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl"
        >
          <Palette size={24} className="text-purple-400" />
        </motion.div>
      </div>
    </motion.div>
  );
}

/**
 * Section démo interactive
 */
function DemoSection() {
  return (
    <section id="demo" className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Comment ça fonctionne
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-white/50 text-lg max-w-2xl mx-auto"
          >
            Trois étapes simples pour analyser vos œuvres comme un expert
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { 
              step: '01', 
              title: 'Uploader', 
              desc: 'Glissez-déposez votre œuvre. Supporte JPG, PNG, WebP jusqu\'à 10MB.',
              icon: Upload
            },
            { 
              step: '02', 
              title: 'Analyse IA', 
              desc: 'Notre IA examine style, couleurs, composition en quelques secondes.',
              icon: Sparkles
            },
            { 
              step: '03', 
              title: 'Résultats', 
              desc: 'Recevez palette, tags, estimation prix et description SEO.',
              icon: TrendingUp
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative group"
            >
              <div className="relative p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all">
                <div className="text-6xl font-bold text-white/5 mb-4">{item.step}</div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <item.icon size={28} className="text-cyan-400" />
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-white/50 leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Features Section avec cards immersives
 */
function FeaturesSection() {
  const features = [
    {
      title: 'Analyse Style',
      description: 'Détection automatique du mouvement artistique : Impressionnisme, Street Art, Abstrait, et plus encore.',
      icon: Palette,
      gradient: 'from-cyan-500 to-blue-500',
      image: 'style'
    },
    {
      title: 'Palette Couleurs',
      description: 'Extraction des 5 couleurs dominantes avec codes HEX prêts à utiliser pour votre branding.',
      icon: Zap,
      gradient: 'from-purple-500 to-pink-500',
      image: 'palette'
    },
    {
      title: 'Estimation Prix',
      description: 'Fourchette de valeur basée sur le marché actuel, avec niveau de confiance de l\'IA.',
      icon: TrendingUp,
      gradient: 'from-pink-500 to-rose-500',
      image: 'price'
    },
    {
      title: 'SEO Automatique',
      description: 'Descriptions optimisées pour Google, titres accrocheurs et mots-clés pertinents.',
      icon: Shield,
      gradient: 'from-amber-500 to-orange-500',
      image: 'seo'
    },
  ];

  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Une analyse complète
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-white/50 text-lg"
          >
            Tout ce qu'il faut pour valoriser vos œuvres
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group relative p-8 rounded-3xl bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 overflow-hidden"
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
              
              <div className="relative">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} p-[1px] mb-6`}>
                  <div className="w-full h-full rounded-2xl bg-[#0a0a0f] flex items-center justify-center">
                    <feature.icon size={28} className="text-white" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-white/50 leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * How it Works avec timeline
 */
function HowItWorksSection() {
  return (
    <section className="py-32 px-6 relative overflow-hidden">
      {/* Background effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent" />
      
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Pour les artistes, par des artistes
          </motion.h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {[
              { title: 'Gagnez du temps', desc: 'Plus besoin de rédiger des descriptions ou de chercher vos mots-clés. L\'IA s\'occupe de tout.' },
              { title: 'Valorisez votre travail', desc: 'Une estimation de prix objective pour positionner vos œuvres sur le marché.' },
              { title: 'Attirez plus de clients', desc: 'Des descriptions SEO optimisées pour apparaître sur Google.' },
              { title: 'Partagez facilement', desc: 'Exportez vos analyses pour les partager sur les réseaux sociaux.' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-1">{item.title}</h4>
                  <p className="text-white/50">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-8">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-48 h-48 rounded-full border-2 border-dashed border-white/20"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles size={64} className="text-white/50" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/**
 * Social Proof Section
 */
function SocialProofSection() {
  const testimonials = [
    { name: 'Marie L.', role: 'Artiste peintre', text: 'L\'analyse de la palette de couleurs m\'a aidée à créer une série cohérente.' },
    { name: 'Thomas R.', role: 'Galeriste', text: 'L\'estimation de prix est surprenante de précision. Un vrai outil pro.' },
    { name: 'Sophie M.', role: 'Photographe', text: 'Les descriptions SEO ont doublé mon trafic en 2 semaines.' },
  ];

  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={20} className="text-amber-400 fill-amber-400" />
            ))}
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Ils nous font confiance</h2>
          <p className="text-white/50">Rejoint par plus de 12,000 artistes</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-6 rounded-2xl bg-white/[0.02] border border-white/5"
            >
              <p className="text-white/70 mb-4 italic">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500" />
                <div>
                  <div className="text-white font-medium">{t.name}</div>
                  <div className="text-white/40 text-sm">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * CTA Section finale
 */
function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="py-32 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto relative"
      >
        <div className="relative p-12 md:p-16 rounded-[2.5rem] overflow-hidden text-center">
          {/* Animated background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 via-purple-500/30 to-pink-500/30" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] opacity-10"
            />
            <div className="absolute inset-[1px] rounded-[2.5rem] bg-[#0a0a0f]" />
          </div>

          <div className="relative z-10">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-white mb-6"
            >
              Prêt à analyser vos œuvres ?
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-white/60 text-lg mb-10 max-w-xl mx-auto"
            >
              Commencez gratuitement. Aucune carte de crédit requise.
            </motion.p>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/upload')}
              className="group relative px-10 py-5 rounded-2xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-white" />
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center gap-3 text-black group-hover:text-white font-semibold text-lg transition-colors">
                <Sparkles size={22} />
                Analyser gratuitement
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
