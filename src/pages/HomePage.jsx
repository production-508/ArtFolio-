import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, Eye, Search, Filter, Sparkles, ArrowRight,
  TrendingUp, Clock, Award, User
} from 'lucide-react';
import { mockAnalysisData, mockAbstractData, mockRealismData } from '../components/ArtworkAnalyzer/mockData';

// Données de démonstration
const galleryItems = [
  { id: 1, title: 'Portrait de lumière', artist: 'Marie Dubois', image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600', likes: 234, views: 1205, style: 'Impressionnisme', price: '2,400€', height: 'tall' },
  { id: 2, title: 'Formes abstraites', artist: 'Jean Pierre', image: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=600', likes: 189, views: 892, style: 'Abstrait', price: '1,800€', height: 'normal' },
  { id: 3, title: 'Nature morte classique', artist: 'Sophie Martin', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600', likes: 312, views: 1543, style: 'Réalisme', price: '3,200€', height: 'normal' },
  { id: 4, title: 'Éclats de couleur', artist: 'Lucas Bernard', image: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=600', likes: 156, views: 678, style: 'Contemporain', price: '1,500€', height: 'tall' },
  { id: 5, title: 'Silhouettes urbaines', artist: 'Emma Petit', image: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=600', likes: 278, views: 1102, style: 'Moderne', price: '2,100€', height: 'normal' },
  { id: 6, title: 'Flux et reflux', artist: 'Thomas Moreau', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600', likes: 198, views: 834, style: 'Expressionnisme', price: '1,900€', height: 'tall' },
];

const categories = ['Tous', 'Impressionnisme', 'Abstrait', 'Réalisme', 'Contemporain', 'Moderne'];

/**
 * Page d'accueil - Galerie immersive mobile-first
 */
export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);
  const navigate = useNavigate();
  
  const { scrollYProgress } = useScroll({ target: containerRef });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  const filteredItems = galleryItems.filter(item => {
    const matchesCategory = activeCategory === 'Tous' || item.style === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.artist.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0f]">
      {/* Hero Section - Compact sur mobile */}
      <motion.section 
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative pt-24 md:pt-32 pb-8 md:pb-12 px-4"
      >
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 -left-32 w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full bg-purple-500/10 blur-[80px] md:blur-[120px]"
          />
          <motion.div
            animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-0 -right-32 w-[250px] h-[250px] md:w-[400px] md:h-[400px] rounded-full bg-cyan-500/10 blur-[60px] md:blur-[100px]"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Header compact */}
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl md:text-4xl font-bold"
              >
                <span className="text-white">Art</span>
                <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Folio</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-white/50 text-sm md:text-base"
              >
                Découvrez et collectionnez l'art
              </motion.p>
            </div>

            {/* CTA Artiste - Desktop */}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => navigate('/dashboard')}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <User size={18} />
              <span className="text-sm font-medium">Espace Artiste</span>
            </motion.button>
          </div>

          {/* Search Bar - Tactile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative mb-4 md:mb-6"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
            <input
              type="text"
              placeholder="Rechercher une œuvre, un artiste..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 md:py-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
          </motion.div>

          {/* Stats rapides */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-4 md:gap-8 text-sm"
          >
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-cyan-400" />
              <span className="text-white/50">12K+ œuvres</span>
            </div>
            <div className="flex items-center gap-2">
              <Award size={16} className="text-purple-400" />
              <span className="text-white/50">500+ artistes</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-pink-400" />
              <span className="text-white/50">Nouveau ce week</span>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Catégories - Scroll horizontal sur mobile */}
      <div className="sticky top-14 md:top-20 z-30 bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4">
            {categories.map((cat) => (
              <motion.button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                whileTap={{ scale: 0.95 }}
                className={`
                  flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all
                  ${activeCategory === cat 
                    ? 'bg-white text-black' 
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }
                `}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Galerie - Masonry responsive */}
      <section className="px-4 py-4 md:py-8 pb-28 md:pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="columns-2 md:columns-3 lg:columns-4 gap-3 md:gap-4">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, index) => (
                <GalleryCard 
                  key={item.id} 
                  item={item} 
                  index={index}
                  onClick={() => navigate(`/artwork/${item.id}`)}
                />
              ))}
            </AnimatePresence>
          </div>

          {filteredItems.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <p className="text-white/50">Aucune œuvre trouvée</p>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}

/**
 * Carte d'œuvre - Optimisée tactile
 */
function GalleryCard({ item, index, onClick }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className={`
        group relative break-inside-avoid mb-3 md:mb-4 rounded-xl md:rounded-2xl overflow-hidden cursor-pointer
        bg-white/[0.03] border border-white/[0.08] active:border-cyan-500/30
        ${item.height === 'tall' ? 'aspect-[3/4]' : 'aspect-square'}
      `}
    >
      {/* Image */}
      <img
        src={item.image}
        alt={item.title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
      />
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      
      {/* Badge style */}
      <div className="absolute top-2 left-2 md:top-3 md:left-3">
        <span className="px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-[10px] md:text-xs font-medium bg-black/50 backdrop-blur-sm text-white/90 border border-white/10">
          {item.style}
        </span>
      </div>

      {/* Infos */}
      <div className="absolute bottom-0 left-0 right-0 p-2.5 md:p-4">
        <h3 className="text-sm md:text-base font-semibold text-white truncate">{item.title}</h3>
        <p className="text-white/60 text-xs md:text-sm truncate">{item.artist}</p>
        
        <div className="flex items-center justify-between mt-2">
          <span className="text-cyan-400 font-semibold text-sm md:text-base">{item.price}</span>
          <div className="flex items-center gap-2 text-white/40 text-xs">
            <span className="flex items-center gap-0.5">
              <Heart size={12} /> {item.likes}
            </span>
          </div>
        </div>
      </div>

      {/* Hover glow - desktop only */}
      <div className="hidden md:block absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none" />
    </motion.div>
  );
}
