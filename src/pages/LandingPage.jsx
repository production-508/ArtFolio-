import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Palette, TrendingUp, Shield, Zap, Globe,
  Check, Star, ArrowRight, Play, Users, Image,
  Award, Clock, ChevronRight
} from 'lucide-react';

/**
 * Landing Page Marketing - ArtFolio
 * Prête à être markettée avec tous les éléments de conversion
 */
export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#030303] text-white overflow-x-hidden">
      <HeroSection />
      <SocialProofSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
}

/**
 * Hero Section avec value proposition claire
 */
function HeroSection() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#030303_100%)]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-8"
        >
          <Sparkles size={16} className="text-cyan-400" />
          <span className="text-sm text-white/80">Lancement officiel — Inscription gratuite</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
        >
          <span className="text-white">Vendez vos œuvres</span>
          <br />
          <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
          >
            avec l'IA
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10"
        >
          ArtFolio analyse vos créations avec l'IA : style, palette, estimation de prix 
          et descriptions SEO. Rejoignez 500+ artistes qui vendent dans le monde entier.
        </motion.p>

        {/* CTA Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto mb-12"
        >
          <input
            type="email"
            placeholder="Votre email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
          <button
            onClick={() => navigate('/analyze')}
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
          >
            Commencer gratuitement
            <ArrowRight size={18} />
          </button>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap justify-center gap-6 text-sm text-white/40"
        >
          <span className="flex items-center gap-1.5">
            <Check size={14} className="text-cyan-400" /> Sans carte bancaire
          </span>
          <span className="flex items-center gap-1.5">
            <Check size={14} className="text-cyan-400" /> 5 minutes pour configurer
          </span>
          <span className="flex items-center gap-1.5">
            <Check size={14} className="text-cyan-400" /> Annulation à tout moment
          </span>
        </motion.div>

        {/* Hero Image Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 relative max-w-4xl mx-auto"
        >
          <div className="card-bluecinis p-2 md:p-4">
            <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 aspect-[16/10] flex items-center justify-center relative"
            >
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
              <div className="text-center z-10">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center shadow-lg shadow-cyan-500/30"
                >
                  <Palette size={36} className="text-white" />
                </div>
                <p className="text-white/60">Interface ArtFolio Preview</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Social Proof avec stats
 */
function SocialProofSection() {
  const stats = [
    { value: '12,000+', label: 'Œuvres analysées', icon: Image },
    { value: '500+', label: 'Artistes actifs', icon: Users },
    { value: '98%', label: 'Satisfaction', icon: Star },
    { value: '2.4M€', label: 'Ventes générées', icon: TrendingUp },
  ];

  return (
    <section className="py-16 md:py-20 border-y border-white/5">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <stat.icon className="w-6 h-6 mx-auto mb-3 text-cyan-400" />
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-white/50">{stat.label}</div>
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
    {
      icon: Sparkles,
      title: 'Analyse IA',
      description: 'Notre IA analyse automatiquement le style, les couleurs et estime la valeur de vos œuvres.',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      icon: TrendingUp,
      title: 'Estimation Prix',
      description: 'Obtenez une fourchette de prix réaliste basée sur le marché actuel et les tendances.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Globe,
      title: 'SEO Auto',
      description: 'Descriptions optimisées pour Google qui augmentent votre visibilité en ligne.',
      color: 'from-pink-500 to-rose-500'
    },
    {
      icon: Shield,
      title: 'Paiements sécurisés',
      description: 'Stripe Connect pour des transactions sécurisées dans 135+ pays.',
      color: 'from-amber-500 to-orange-500'
    },
  ];

  return (
    <section className="py-20 md:py-32 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Tout ce qu'il faut pour vendre
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-white/50 max-w-xl mx-auto"
          >
            Des outils puissants qui vous font gagner du temps et augmentent vos ventes.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="card-bluecinis p-6 md:p-8 group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} p-[1px] mb-6`}>
                <div className="w-full h-full rounded-xl bg-[#030303] flex items-center justify-center">
                  <feature.icon size={24} className="text-white" />
                </div>
              </div>
              
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-white/50">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * How It Works
 */
function HowItWorksSection() {
  const steps = [
    { step: '01', title: 'Upload', desc: 'Importez vos œuvres en quelques clics' },
    { step: '02', title: 'Analyse IA', desc: 'Notre IA analyse style, couleurs et prix' },
    { step: '03', title: 'Publiez', desc: 'Vos œuvres sont en ligne et optimisées SEO' },
    { step: '04', title: 'Vendez', desc: 'Recevez des paiements sécurisés via Stripe' },
  ];

  return (
    <section className="py-20 md:py-32 px-4 bg-white/[0.02]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Comment ça marche
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-5xl font-bold text-white/5 mb-4">{item.step}</div>
              <h4 className="text-lg font-semibold mb-2">{item.title}</h4>
              <p className="text-white/50 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Pricing Section
 */
function PricingSection() {
  const plans = [
    {
      name: 'Gratuit',
      price: '0€',
      period: '/mois',
      description: 'Pour découvrir la plateforme',
      features: [
        '5 analyses IA/mois',
        'Portfolio basique',
        'Ventes avec 15% de commission',
        'Support email',
      ],
      cta: 'Commencer',
      popular: false,
    },
    {
      name: 'Pro',
      price: '5€',
      period: '/mois',
      description: 'Pour les artistes sérieux',
      features: [
        'Analyses IA illimitées',
        'Portfolio personnalisé',
        'Ventes avec 7% de commission',
        'SEO avancé',
        'Support prioritaire',
        'Analytics détaillés',
      ],
      cta: 'Essayer 14 jours gratuits',
      popular: true,
    },
  ];

  return (
    <section className="py-20 md:py-32 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Tarifs simples
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-white/50"
          >
            Commencez gratuitement, passez au Pro quand vous êtes prêt.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`card-bluecinis p-6 md:p-8 relative ${plan.popular ? 'ring-2 ring-cyan-500' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 text-xs font-semibold"
                >
                  Populaire
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <p className="text-white/50 text-sm">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-white/50">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check size={16} className="text-cyan-400 flex-shrink-0" />
                    <span className="text-white/70">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:shadow-lg hover:shadow-cyan-500/25'
                    : 'bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Testimonials
 */
function TestimonialsSection() {
  const testimonials = [
    {
      quote: "L'analyse IA m'a fait gagner un temps fou. Je savais pas comment décrire mes œuvres, maintenant c'est automatique.",
      author: 'Marie L.',
      role: 'Artiste peintre',
      avatar: 'ML',
    },
    {
      quote: "Les estimations de prix sont surprenantes de précision. J'ai vendu 3 œuvres le premier mois.",
      author: 'Thomas R.',
      role: 'Photographe',
      avatar: 'TR',
    },
    {
      quote: "Le SEO auto a doublé mon trafic. Mes œuvres apparaissent en premier sur Google maintenant.",
      author: 'Sophie M.',
      role: 'Illustratrice',
      avatar: 'SM',
    },
  ];

  return (
    <section className="py-20 md:py-32 px-4 bg-white/[0.02]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Ce que disent nos artistes
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="card-bluecinis p-6"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                ))}
              </div>

              <p className="text-white/80 mb-6 italic">"{t.quote}"</p>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-sm font-semibold"
                >
                  {t.avatar}
                </div>
                <div>
                  <div className="font-medium">{t.author}</div>
                  <div className="text-sm text-white/50">{t.role}</div>
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
 * CTA Final
 */
function CTASection() {
  return (
    <section className="py-20 md:py-32 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto"
      >
        <div className="card-bluecinis p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20" />
          <div className="relative z-10">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Prêt à vendre vos œuvres ?
            </h3>
            
            <p className="text-white/60 mb-8 max-w-md mx-auto">
              Rejoignez 500+ artistes qui utilisent ArtFolio pour vivre de leur passion.
            </p>

            <button className="px-8 py-4 rounded-xl bg-white text-black font-semibold text-lg hover:shadow-lg transition-shadow">
              Commencer gratuitement
            </button>

            <p className="mt-4 text-sm text-white/40">
              14 jours d'essai gratuit • Sans engagement
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/**
 * Footer
 */
function Footer() {
  return (
    <footer className="py-12 px-4 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
              <span className="font-bold text-white">A</span>
            </div>
            <span className="font-bold text-xl">ArtFolio</span>
          </div>

          <div className="flex gap-6 text-sm text-white/50">
            <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-white transition-colors">CGU</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>

          <p className="text-sm text-white/30">© 2025 ArtFolio. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
