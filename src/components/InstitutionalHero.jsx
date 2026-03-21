import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

/**
 * InstitutionalHero - Style galerie d'art (Hauser & Wirth, David Zwirner)
 * 
 * Design philosophy:
 * - Silence, espace, l'œuvre comme protagoniste
 * - Pas de texte au chargement
 * - Fade lent automatique (8-10s)
 * - Texte discret au hover/scroll
 * - Navigation dots minimalistes
 * - Aucun CTA visible
 */

export function InstitutionalHero({ artworks = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const timerRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const AUTOPLAY_INTERVAL = 9000; // 9s pour un fade lent élégant
  const currentArtwork = artworks[currentIndex];

  // Navigation
  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % artworks.length);
  }, [artworks.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + artworks.length) % artworks.length);
  }, [artworks.length]);

  const goToSlide = useCallback((index) => {
    setCurrentIndex(index);
  }, [artworks.length]);

  // Auto-advance avec pause au hover
  useEffect(() => {
    if (!isHovered) {
      timerRef.current = setInterval(handleNext, AUTOPLAY_INTERVAL);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [handleNext, isHovered]);

  // Détection du scroll pour afficher les infos
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setHasScrolled(true);
      } else {
        setHasScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navigation clavier
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  const handleImageClick = () => {
    if (currentArtwork?.id) {
      navigate(`/artwork/${currentArtwork.id}`);
    }
  };

  if (!artworks || artworks.length === 0) {
    return (
      <section className="relative h-screen w-full bg-black flex items-center justify-center">
        <p className="text-white/40 font-serif text-sm tracking-widest uppercase">
          Aucune œuvre à afficher
        </p>
      </section>
    );
  }

  const showInfo = isHovered || hasScrolled;

  return (
    <section 
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-black"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Full-bleed Images avec fade lent */}
      <AnimatePresence mode="sync">
        <motion.div
          key={currentArtwork?.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ 
            duration: 2.5, // Fade lent de 2.5s
            ease: [0.43, 0.13, 0.23, 0.96] // Easing cinématographique
          }}
          className="absolute inset-0 cursor-pointer"
          onClick={handleImageClick}
        >
          <img
            src={currentArtwork?.image}
            alt={currentArtwork?.title}
            className="w-full h-full object-contain bg-black"
            style={{ 
              objectPosition: 'center center',
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Overlay noir subtil au hover */}
      <motion.div
        initial={false}
        animate={{ 
          opacity: showInfo ? 0.3 : 0 
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute inset-0 bg-black pointer-events-none"
      />

      {/* Info en bas à gauche - apparaît au hover/scroll */}
      <motion.div
        initial={false}
        animate={{ 
          opacity: showInfo ? 1 : 0,
          y: showInfo ? 0 : 20
        }}
        transition={{ duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }}
        className="absolute bottom-12 left-12 z-10"
      >
        <div className="space-y-2">
          {/* Titre de l'œuvre */}
          <h1 
            className="text-white text-2xl md:text-3xl lg:text-4xl font-light tracking-wide"
            style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
          >
            {currentArtwork?.title}
          </h1>
          
          {/* Artiste et Année */}
          <div className="flex items-center gap-3 text-white/70">
            <span 
              className="text-sm md:text-base tracking-wider"
              style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
            >
              {currentArtwork?.artist}
            </span>
            {currentArtwork?.year && (
              <>
                <span className="text-white/40">—</span>
                <span 
                  className="text-sm md:text-base text-white/50"
                  style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
                >
                  {currentArtwork.year}
                </span>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Navigation dots minimalistes en bas à droite */}
      <motion.div
        initial={false}
        animate={{ 
          opacity: showInfo ? 1 : 0.4 
        }}
        transition={{ duration: 0.6 }}
        className="absolute bottom-12 right-12 z-10 flex items-center gap-4"
      >
        {/* Dots */}
        <div className="flex items-center gap-3">
          {artworks.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className="group relative p-1"
              aria-label={`Voir œuvre ${index + 1}`}
            >
              <span 
                className={`
                  block w-1.5 h-1.5 rounded-full transition-all duration-500
                  ${index === currentIndex 
                    ? 'bg-white scale-100' 
                    : 'bg-white/30 group-hover:bg-white/60 scale-75'
                  }
                `}
              />
              {/* Indicateur de progression pour le slide actif */}
              {index === currentIndex && !isHovered && (
                <motion.span
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <svg 
                    className="w-4 h-4 -rotate-90" 
                    viewBox="0 0 16 16"
                  >
                    <circle
                      cx="8"
                      cy="8"
                      r="6"
                      fill="none"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="1"
                    />
                    <motion.circle
                      cx="8"
                      cy="8"
                      r="6"
                      fill="none"
                      stroke="white"
                      strokeWidth="1"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ 
                        duration: AUTOPLAY_INTERVAL / 1000,
                        ease: "linear"
                      }}
                    />
                  </svg>
                </motion.span>
              )}
            </button>
          ))}
        </div>

        {/* Compteur discret */}
        <span 
          className="text-white/40 text-xs tracking-widest ml-2"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          {String(currentIndex + 1).padStart(2, '0')} / {String(artworks.length).padStart(2, '0')}
        </span>
      </motion.div>

      {/* Indicateur de scroll subtil */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showInfo ? 0 : 1 }}
        transition={{ duration: 1, delay: 2 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-px h-8 bg-white/20"
        />
      </motion.div>

      {/* Zone de clic invisible pour navigation */}
      <div className="absolute inset-0 flex">
        {/* Zone gauche - previous */}
        <div 
          className="w-1/4 h-full cursor-w-resize opacity-0 hover:opacity-0"
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
        />
        {/* Zone centre - click sur image */}
        <div 
          className="w-2/4 h-full cursor-pointer"
          onClick={handleImageClick}
        />
        {/* Zone droite - next */}
        <div 
          className="w-1/4 h-full cursor-e-resize opacity-0 hover:opacity-0"
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
        />
      </div>
    </section>
  );
}

export default InstitutionalHero;
