import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Eye, MoreHorizontal, X, ZoomIn, Palette } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { MagneticButton } from '../components/MagneticButton';
import { TextScramble } from '../components/TextScramble';
import { ArtworkAnalyzer } from '../components/ArtworkAnalyzer';
import { mockAnalysisData, mockAbstractData, mockRealismData } from '../components/ArtworkAnalyzer/mockData';

// Données de démonstration pour la galerie
const galleryItems = [
  {
    id: 1,
    title: 'Portrait de lumière',
    artist: 'Marie Dubois',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600',
    likes: 234,
    views: 1205,
    style: 'Impressionnisme',
    analysis: mockAnalysisData,
    height: 'tall',
  },
  {
    id: 2,
    title: 'Formes abstraites',
    artist: 'Jean Pierre',
    image: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=600',
    likes: 189,
    views: 892,
    style: 'Abstrait',
    analysis: mockAbstractData,
    height: 'normal',
  },
  {
    id: 3,
    title: 'Nature morte classique',
    artist: 'Sophie Martin',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600',
    likes: 312,
    views: 1543,
    style: 'Réalisme',
    analysis: mockRealismData,
    height: 'normal',
  },
  {
    id: 4,
    title: 'Éclats de couleur',
    artist: 'Lucas Bernard',
    image: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=600',
    likes: 156,
    views: 678,
    style: 'Contemporain',
    analysis: mockAbstractData,
    height: 'tall',
  },
  {
    id: 5,
    title: 'Silhouettes urbaines',
    artist: 'Emma Petit',
    image: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=600',
    likes: 278,
    views: 1102,
    style: 'Moderne',
    analysis: mockAnalysisData,
    height: 'normal',
  },
  {
    id: 6,
    title: 'Flux et reflux',
    artist: 'Thomas Moreau',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
    likes: 198,
    views: 834,
    style: 'Expressionnisme',
    analysis: mockAbstractData,
    height: 'tall',
  },
];

/**
 * Page galerie avec layout masonry et effets parallax
 */
export function GalleryPage() {
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [filter, setFilter] = useState('all');

  const filters = ['all', 'Impressionnisme', 'Abstrait', 'Réalisme', 'Contemporain'];

  const filteredItems = filter === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.style === filter);

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            <TextScramble text="Galerie d'œuvres" delay={200} />
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Découvrez des œuvres analysées par notre IA. 
            Cliquez sur une œuvre pour voir l'analyse complète.
          </p>
        </motion.div>

        {/* Filtres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`
                px-5 py-2 rounded-full text-sm font-medium transition-all duration-300
                ${filter === f 
                  ? 'bg-white text-black' 
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              {f === 'all' ? 'Tous' : f}
            </button>
          ))}
        </motion.div>

        {/* Grid masonry */}
        <motion.div 
          layout
          className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, index) => (
              <GalleryCard
                key={item.id}
                item={item}
                index={index}
                onClick={() => setSelectedArtwork(item)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Modal d'œuvre */}
      <AnimatePresence>
        {selectedArtwork && (
          <ArtworkModal
            artwork={selectedArtwork}
            onClose={() => setSelectedArtwork(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Carte d'œuvre individuelle avec effet 3D tilt
 */
function GalleryCard({ item, index, onClick }) {
  const [ref, isVisible] = useScrollAnimation({ threshold: 0.1 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * 10, y: -x * 10 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 50 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        layout: { duration: 0.3 }
      }}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
      }}
      className={`
        group relative break-inside-avoid mb-6 rounded-3xl overflow-hidden cursor-pointer
        bg-white/[0.03] border border-white/[0.08]
        transition-shadow duration-500 hover:shadow-2xl hover:shadow-cyan-500/10
        ${item.height === 'tall' ? 'aspect-[3/4]' : 'aspect-square'}
      `}
    >
      {/* Image */}
      <div className="absolute inset-0">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/20 to-transparent" />
      </div>

      {/* Badge style */}
      <div className="absolute top-4 left-4">
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 backdrop-blur-md text-white border border-white/10">
          {item.style}
        </span>
      </div>

      {/* Actions */}
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors">
          <ZoomIn size={14} />
        </button>
        <button className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors">
          <MoreHorizontal size={14} />
        </button>
      </div>

      {/* Infos */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
        <p className="text-white/60 text-sm mb-3">{item.artist}</p>

        <div className="flex items-center gap-4 text-white/50 text-sm">
          <span className="flex items-center gap-1">
            <Heart size={14} /> {item.likes}
          </span>
          <span className="flex items-center gap-1">
            <Eye size={14} /> {item.views}
          </span>
        </div>
      </div>

      {/* Glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent" />
      </div>
    </motion.div>
  );
}

/**
 * Modal d'œuvre avec analyse
 */
function ArtworkModal({ artwork, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        className="relative w-full max-w-6xl max-h-[90vh] overflow-auto bg-[#0a0a0f] rounded-3xl border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Image */}
          <div className="relative aspect-square md:aspect-auto">
            <img
              src={artwork.image}
              alt={artwork.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0a0a0f]/50 hidden md:block" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent md:hidden" />
          </div>

          {/* Analyse */}
          <div className="p-6 md:p-8">
            <ArtworkAnalyzer 
              artworkId={artwork.id.toString()}
              onAnalysisComplete={() => {}}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default GalleryPage;
