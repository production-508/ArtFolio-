import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Sparkles, Zap, Palette, TrendingUp, Shield,
  ChevronDown, Star, Upload
} from 'lucide-react';
import { TextScramble } from '../components/TextScramble';

/**
 * Page d'accueil mobile-first avec expérience immersive
 */
export default function HomePage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  return (
    <div ref={containerRef} className="relative pb-20 md:pb-0">
      <HeroSection opacity={opacity} y={y} />
      <DemoSection />
      <FeaturesSection />
      <HowItWorksSection />
      <SocialProofSection />
      <CTASection />
    </div>
  );
}

/**
 * Hero Section mobile-first
 */
function HeroSection({ opacity, y }) {
  const navigate = useNavigate();

  const stats = [
    { value: '50K+', label: 'Œuvres analysées' },
    { value: '12K+', label: 'Artistes' },
    { value: '98%', label: 'Satisfaction' },
  ];

  return (
    <motion.section 
      style={{ opacity, y }}
      className="relative min-h-[100svh] flex items-center pt-16"
    >
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 -left-20 w-[400px] h-[400px] md:w-[600px] md:h-[600px] rounded-full bg-cyan-500/15 blur-[100px] md:blur-[150px]"
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 -right-20 w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full bg-purple-500/15 blur-[80px] md:blur-[120px]"
        />
        
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px] md:bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]" />
      </div>

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 md:mb-8"
              >
                <span className="flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400"></span>
                </span>
                <span className="text-xs md:text-sm text-white/70">IA d'analyse d'art en ligne</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-4 md:mb-6"
              >
                <span className="text-white">Révélez le</span>
                <br />
                <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  potentiel
                </span>
                <br />
                <span className="text-white">de vos œuvres</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-sm sm:text-base md:text-lg text-white/50 mb-6 md:mb-8 max-w-md mx-auto lg:mx-0"
>
                Notre IA analyse vos créations : style artistique, palette de couleurs, 
                estimation de valeur et description SEO optimisée.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start mb-8 md:mb-10"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/upload')}
                  className="w-full sm:w-auto px-6 py-3.5 md:px-8 md:py-4 rounded-xl md:rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold text-sm md:text-base shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
                >
                  <Sparkles size={18} />
                  Analyser mon œuvre
                  <ArrowRight size={16} className="hidden sm:inline" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/gallery')}
                  className="w-full sm:w-auto px-6 py-3.5 md:px-8 md:py-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 text-white font-medium text-sm md:text-base hover:bg-white/10 transition-colors"
                >
                  Voir la galerie
                </motion.button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-center lg:justify-start gap-6 md:gap-8"
              >
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xl md:text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-white/40">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right: Visual */}
            <HeroVisualDemo />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 hidden md:block"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2 text-white/30 cursor-pointer"
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
 * Visual Demo - optimisé mobile
 */
function HeroVisualDemo() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4 }}
      className="order-1 lg:order-2"
    >
      <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto"
>
        <div className="relative rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br from-white/10 to-white/5 border border-white/10">
          <div className="aspect-[4/3] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 via-purple-500/30 to-pink-500/30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 8, repeat: Infinity }}
                className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-cyan-400 via-purple-400 to-pink-400"
              />
            </div>
            
            <motion.div
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_rgba(34,211,238,0.8)]"
            />
            
            <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-cyan-500/30 text-[10px] text-cyan-400">
              Abstrait
            </div>
            
            <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-purple-500/30 text-[10px] text-purple-400">
              94%
            </div>
          </div>
          
          <div className="p-4 md:p-6 space-y-3">
            <div className="flex items-center gap-2">
              {['#22d3ee', '#a855f7', '#ec4899', '#f59e0b', '#10b981'].map((color) => (
                <div key={color} className="w-4 h-4 md:w-5 md:h-5 rounded-full" style={{ backgroundColor: color }} />
              ))}
            </div>
            
            <div className="space-y-1.5">
              <div className="h-1.5 bg-white/10 rounded-full w-3/4"></div>
              <div className="h-1.5 bg-white/10 rounded-full w-1/2"></div>
            </div>
            
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-white/50">Estimation</span>
              <span className="text-base md:text-lg font-bold text-white">2,400€ - 4,800€</span>
            </div>
          </div>
        </div>

        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute -top-4 -right-4 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl hidden sm:block"
        >
          <Zap size={20} className="text-cyan-400" />
        </motion.div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
          className="absolute -bottom-4 -left-4 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl hidden sm:block"
        >
          <Palette size={20} className="text-purple-400" />
        </motion.div>
      </div>
    </motion.div>
  );
}

/**
 * Demo Section - étapes simplifiées
 */
function DemoSection() {
  const steps = [
    { step: '01', title: 'Uploader', desc: 'Glissez ou sélectionnez votre image', icon: Upload },
    { step: '02', title: 'Analyse', desc: 'L\'IA examine en quelques secondes', icon: Sparkles },
    { step: '03', title: 'Résultats', desc: 'Palette, prix, SEO - instantanément', icon: TrendingUp },
  ];

  return (
    <section id="demo" className="py-16 md:py-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10 md:mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-4xl font-bold text-white mb-3"
          >
            Comment ça fonctionne
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-white/50 text-sm md:text-base"
>
            Trois étapes simples pour analyser vos œuvres
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          {steps.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative p-5 md:p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all"
            >
              <div className="text-4xl md:text-5xl font-bold text-white/5 mb-3">{item.step}</div>
              
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                <item.icon size={20} className="text-cyan-400 md:w-6 md:h-6" />
              </div>
              
              <h3 className="text-lg md:text-xl font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-white/50 text-sm md:text-base">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Features Section
 */
function FeaturesSection() {
  const features = [
    { title: 'Analyse Style', desc: 'Détection automatique du mouvement artistique', icon: Palette, gradient: 'from-cyan-500 to-blue-500' },
    { title: 'Palette', desc: '5 couleurs dominantes avec codes HEX', icon: Zap, gradient: 'from-purple-500 to-pink-500' },
    { title: 'Estimation Prix', desc: 'Fourchette de valeur basée sur le marché', icon: TrendingUp, gradient: 'from-pink-500 to-rose-500' },
    { title: 'SEO Auto', desc: 'Descriptions optimisées pour Google', icon: Shield, gradient: 'from-amber-500 to-orange-500' },
  ];

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 md:mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-4xl font-bold text-white mb-3"
>
            Une analyse complète
          </motion.h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className="group p-5 md:p-6 rounded-2xl md:rounded-3xl bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 overflow-hidden"
            >
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br ${feature.gradient} p-[1px] mb-4`}>
                <div className="w-full h-full rounded-xl bg-[#0a0a0f] flex items-center justify-center">
                  <feature.icon size={20} className="text-white md:w-6 md:h-6" />
                </div>
              </div>
              
              <h3 className="text-lg md:text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-white/50 text-sm md:text-base">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * How it Works Section
 */
function HowItWorksSection() {
  const items = [
    { title: 'Gagnez du temps', desc: 'Plus besoin de rédiger des descriptions. L\'IA s\'occupe de tout.' },
    { title: 'Valorisez votre travail', desc: 'Estimation de prix objective pour positionner vos œuvres.' },
    { title: 'Attirez des clients', desc: 'Descriptions SEO pour apparaître sur Google.' },
    { title: 'Partagez facilement', desc: 'Exportez vos analyses sur les réseaux sociaux.' },
  ];

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent" />
      
      <div className="max-w-6xl mx-auto relative">
        <div className="grid lg:grid-cols-2 gap-10 md:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4 md:space-y-6"
>
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-6">
              Pour les artistes, par des artistes
            </h2>
            
            {items.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-3 md:gap-4"
              >
                <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white text-sm md:text-base font-bold">
                  {index + 1}
                </div>
                <div>
                  <h4 className="text-base md:text-lg font-semibold text-white mb-1">{item.title}</h4>
                  <p className="text-white/50 text-sm md:text-base">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-6 md:p-8">
              <div className="aspect-square rounded-xl md:rounded-2xl bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-32 h-32 md:w-48 md:h-48 rounded-full border-2 border-dashed border-white/20"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles size={40} className="text-white/40 md:w-16 md:h-16" />
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
    { name: 'Marie L.', role: 'Artiste', text: 'L\'analyse des couleurs m\'a aidée à créer une série cohérente.' },
    { name: 'Thomas R.', role: 'Galeriste', text: 'L\'estimation de prix est surprenante de précision.' },
    { name: 'Sophie M.', role: 'Photographe', text: 'Les descriptions SEO ont doublé mon trafic.' },
  ];

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-12"
        >
          <div className="flex items-center justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={16} className="text-amber-400 fill-amber-400 md:w-5 md:h-5" />
            ))}
          </div>
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">Ils nous font confiance</h2>
          <p className="text-white/50 text-sm md:text-base">Rejoint par plus de 12,000 artistes</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4">
          {testimonials.map((t, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-4 md:p-6 rounded-xl md:rounded-2xl bg-white/[0.02] border border-white/5"
            >
              <p className="text-white/70 mb-4 text-sm md:text-base italic">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500" />
                <div>
                  <div className="text-white font-medium text-sm md:text-base">{t.name}</div>
                  <div className="text-white/40 text-xs md:text-sm">{t.role}</div>
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
    <section className="py-16 md:py-24 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto"
      >
        <div className="relative p-8 md:p-12 rounded-2xl md:rounded-[2rem] overflow-hidden text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 via-purple-500/30 to-pink-500/30" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] opacity-10"
          />
          <div className="absolute inset-[1px] rounded-2xl md:rounded-[2rem] bg-[#0a0a0f]" />

          <div className="relative z-10">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
              Prêt à analyser vos œuvres ?
            </h2>
            
            <p className="text-white/60 mb-6 md:mb-8 text-sm md:text-base">
              Commencez gratuitement. Aucune carte requise.
            </p>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/upload')}
              className="group px-6 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl bg-white text-black font-semibold text-sm md:text-base flex items-center gap-2 mx-auto"
            >
              <Sparkles size={18} />
              Analyser gratuitement
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
