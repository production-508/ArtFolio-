import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, Eye, Search, Filter, Sparkles, ArrowRight,
  TrendingUp, Clock, Award, ArrowUpRight
} from 'lucide-react';
import { BlueCinisHero } from '../components/BlueCinisHero';

// Données de démonstration pour le hero carousel
const heroArtworks = [
  { 
    id: 1, 
    title: 'Éther Flottant', 
    artist: 'Marie Dubois', 
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=1200', 
    style: 'Impressionnisme', 
    price: '2,400€',
    description: 'Une exploration de la lumière et du mouvement dans l\'espace urbain'
  },
  { 
    id: 2, 
    title: 'Fragments de Mémoire', 
    artist: 'Jean Pierre', 
    image: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=1200', 
    style: 'Abstrait', 
    price: '1,800€',
    description: 'Composition abstraite explorant les thèmes de la mémoire collective'
  },
  { 
    id: 3, 
    title: 'Nature Morte No.7', 
    artist: 'Sophie Martin', 
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1200', 
    style: 'Réalisme', 
    price: '3,200€',
    description: 'Revisite contemporaine du genre classique de la nature morte'
  },
  { 
    id: 4, 
    title: 'Chroma Field', 
    artist: 'Lucas Bernard', 
    image: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=1200', 
    style: 'Contemporain', 
    price: '1,500€',
    description: 'Étude sur la perception des couleurs dans l\'espace numérique'
  },
];

// Données galerie
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
 * Page d'accueil - Style Blue Cinis
 * Hero carousel + Galerie masonry
 */
export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = galleryItems.filter(item => {
    const matchesCategory = activeCategory === 'Tous' || item.style === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.artist.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#030303]">
      {/* Hero Section - Blue Cinis Style */}
      <BlueCinisHero artworks={heroArtworks} />

      {/* Section Galerie */}
      <section className="py-12 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-2xl md:text-3xl font-bold text-white mb-2"
              >
                Découvrez les œuvres
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-white/50"
              >
                {filteredItems.length} œuvres disponibles
              </motion.p>
            </div>

            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative max-w-xs"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
            </motion.div>
          </div>

          {/* Catégories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex gap-2 overflow-x-auto scrollbar-hide pb-4 mb-6"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`
                  flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all
                  ${activeCategory === cat 
                    ? 'bg-white text-black' 
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                {cat}
              </button>
            ))}
          </motion.div>

          {/* Galerie Grid */}
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, index) => (
                <GalleryCard 
                  key={item.id} 
                  item={item} 
                  index={index}
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

      {/* CTA Section */}
      <section className="py-16 md:py-24 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="card-bluecinis p-8 md:p-12 text-center">
            <Sparkles size={32} className="mx-auto mb-4 text-cyan-400" />
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Vous êtes artiste ?
            </h3>
            <p className="text-white/60 mb-6 max-w-md mx-auto">
              Rejoignez notre communauté de 500+ artistes et vendez vos œuvres dans le monde entier.
            </p>
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-shadow">
              Devenir vendeur
              <ArrowUpRight size={18} />
            </button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

/**
 * Carte d'œuvre - Style Blue Cinis
 */
function GalleryCard({ item, index }) {
  const navigate = useNavigate();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onClick={() => navigate(`/artwork/${item.id}`)}
      className={`
        group relative break-inside-avoid mb-4 cursor-pointer
        ${item.height === 'tall' ? 'aspect-[3/4]' : 'aspect-square'}
      `}
    >
      <div className="card-bluecinis h-full">
        {/* Image */}
        <div className="absolute inset-0 overflow-hidden rounded-[26px]">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>

        {/* Badge style */}
        <div className="absolute top-4 left-4 z-10">
          <span className="glass-panel px-3 py-1 rounded-full text-xs font-medium text-white/90">
            {item.style}
          </span>
        </div>

        {/* Price badge */}
        <div className="absolute top-4 right-4 z-10">
          <span className="glass-strong px-3 py-1 rounded-full text-sm font-semibold text-white">
            {item.price}
          </span>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          <h3 className="text-white font-semibold mb-1 truncate">{item.title}</h3>
          <p className="text-white/60 text-sm mb-3">{item.artist}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-white/40 text-xs">
              <span className="flex items-center gap-1">
                <Heart size={12} /> {item.likes}
              </span>
              <span className="flex items-center gap-1">
                <Eye size={12} /> {item.views}
              </span>
            </div>

            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-8 h-8 rounded-full glass-strong flex items-center justify-center">
                <ArrowUpRight size={14} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
