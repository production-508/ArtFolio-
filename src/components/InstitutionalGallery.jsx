import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

/**
 * InstitutionalGallery - Grille d'œuvres style galerie institutionnelle
 * 
 * Design philosophy:
 * - Masonry épuré, pas de cards
 * - Images qui flottent sur fond noir
 * - Espacement généreux
 * - Informations cachées par défaut
 * - Silence et espace
 */

const MOCK_ARTWORKS = [
  {
    id: 1,
    title: "Éther Flottant",
    artist: "Marie Dubois",
    year: 2024,
    medium: "Huile sur toile",
    dimensions: "120 × 80 cm",
    image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&q=80",
    aspectRatio: "portrait"
  },
  {
    id: 2,
    title: "Fragments de Mémoire",
    artist: "Jean Pierre",
    year: 2023,
    medium: "Acrylique sur lin",
    dimensions: "100 × 100 cm",
    image: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=800&q=80",
    aspectRatio: "square"
  },
  {
    id: 3,
    title: "Nature Morte No.7",
    artist: "Sophie Martin",
    year: 2024,
    medium: "Huile sur bois",
    dimensions: "60 × 80 cm",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80",
    aspectRatio: "landscape"
  },
  {
    id: 4,
    title: "Chroma Field",
    artist: "Lucas Bernard",
    year: 2025,
    medium: "Technique mixte",
    dimensions: "150 × 120 cm",
    image: "https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&q=80",
    aspectRatio: "landscape"
  },
  {
    id: 5,
    title: "Silhouettes Urbaines",
    artist: "Emma Petit",
    year: 2024,
    medium: "Photographie",
    dimensions: "80 × 120 cm",
    image: "https://images.unsplash.com/photo-1549887534-1541e9326642?w=800&q=80",
    aspectRatio: "portrait"
  },
  {
    id: 6,
    title: "Flux et Reflux",
    artist: "Thomas Moreau",
    year: 2023,
    medium: "Encre sur papier",
    dimensions: "70 × 100 cm",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    aspectRatio: "portrait"
  }
];

export function InstitutionalGallery({ artworks = MOCK_ARTWORKS }) {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen bg-black py-20 px-6 md:px-12 lg:px-20">
      {/* Header discret */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mb-16"
      >
        <h2 
          className="text-white/90 text-sm tracking-[0.3em] uppercase"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Œuvres
        </h2>
        <p 
          className="text-white/40 text-xs mt-2 tracking-wider"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {artworks.length} pièces
        </p>
      </motion.div>

      {/* Masonry Grid */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-x-8 gap-y-12">
        {artworks.map((artwork, index) => (
          <GalleryItem 
            key={artwork.id} 
            artwork={artwork} 
            index={index}
            onClick={() => navigate(`/artwork/${artwork.id}`)}
          />
        ))}
      </div>
    </section>
  );
}

function GalleryItem({ artwork, index, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  // Stagger delay based on index
  const delay = (index % 3) * 0.15;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.8, 
        delay,
        ease: [0.43, 0.13, 0.23, 0.96]
      }}
      className="break-inside-avoid mb-8 md:mb-12 group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden bg-neutral-900">
        <motion.img
          src={artwork.image}
          alt={artwork.title}
          className="w-full h-auto object-cover block"
          loading="lazy"
          animate={{ 
            scale: isHovered ? 1.02 : 1,
          }}
          transition={{ duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }}
        />

        {/* Overlay subtil au hover */}
        <motion.div
          className="absolute inset-0 bg-black pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 0.2 : 0 }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Info - cachée par défaut, apparaît au hover */}
      <motion.div
        className="mt-4 space-y-1"
        initial={{ opacity: 0, y: 10 }}
        animate={{ 
          opacity: isHovered ? 1 : 0.4,
          y: isHovered ? 0 : 5
        }}
        transition={{ duration: 0.4 }}
      >
        {/* Titre */}
        <h3 
          className="text-white text-base md:text-lg font-light tracking-wide"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          {artwork.title}
        </h3>

        {/* Artiste */}
        <p 
          className="text-white/60 text-sm"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          {artwork.artist}
        </p>

        {/* Meta - année et médium (visible seulement au hover) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex items-center gap-2 text-white/40 text-xs pt-1"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <span>{artwork.year}</span>
          <span>·</span>
          <span>{artwork.medium}</span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default InstitutionalGallery;
// Build timestamp: Tue Mar 24 03:15:09 AM CST 2026
