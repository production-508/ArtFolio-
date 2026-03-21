import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, ArrowUpRight } from 'lucide-react';

/**
 * Hero Section inspiré de Blue Cinis
 * Split layout 40/60 avec carousel auto-advancing
 */
export function BlueCinisHero({ artworks }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const timerRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const navigate = useNavigate();

  const AUTOPLAY_INTERVAL = 6000;
  const selectedArtwork = artworks[selectedIndex];

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => (prev + 1) % artworks.length);
  }, [artworks.length]);

  const handlePrev = useCallback(() => {
    setSelectedIndex((prev) => (prev - 1 + artworks.length) % artworks.length);
  }, [artworks.length]);

  // Auto-advance
  useEffect(() => {
    timerRef.current = setInterval(handleNext, AUTOPLAY_INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [handleNext]);

  // Scroll thumbnails to keep selected visible
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const selectedButton = container.children[selectedIndex];
      if (selectedButton) {
        const containerWidth = container.offsetWidth;
        const buttonLeft = selectedButton.offsetLeft;
        const buttonWidth = selectedButton.offsetWidth;
        const scrollLeft = buttonLeft - (containerWidth / 2) + (buttonWidth / 2);
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  if (!artworks || artworks.length === 0) return null;

  return (
    <section className="relative h-[100svh] w-full overflow-hidden bg-[#030303] text-white">
      <div className="grid h-full w-full grid-cols-1 lg:grid-cols-[40%_60%]">
        {/* Left Column - Content */}
        <div className="relative flex flex-col justify-between p-6 lg:p-10 xl:p-12 z-10 bg-[#030303]/95 lg:bg-[#030303] order-2 lg:order-1">
          {/* Navigation */}
          <nav className="hidden lg:flex gap-6 text-sm font-medium uppercase tracking-wider text-white/60">
            <Link to="/" className="text-white hover:text-cyan-400 transition-colors">Galerie</Link>
            <Link to="/artistes" className="hover:text-white transition-colors">Artistes</Link>
            <Link to="/about" className="hover:text-white transition-colors">À propos</Link>
          </nav>

          {/* Content */}
          <div className="flex flex-col gap-6 mt-auto mb-auto">
            {/* Miniatures Carousel */}
            <div
              ref={scrollContainerRef}
              className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide mask-linear-fade"
            >
              {artworks.map((artwork, index) => (
                <button
                  key={artwork.id}
                  onClick={() => setSelectedIndex(index)}
                  className={`
                    relative h-16 w-16 lg:h-20 lg:w-20 flex-shrink-0 overflow-hidden rounded-xl transition-all duration-500 hover:scale-105
                    ${selectedIndex === index 
                      ? "ring-2 ring-cyan-400 scale-105 shadow-lg shadow-cyan-500/20 opacity-100" 
                      : "opacity-50 hover:opacity-100 grayscale hover:grayscale-0"
                    }
                  `}
                >
                  <img
                    src={artwork.image}
                    alt={artwork.title}
                    className="w-full h-full object-cover"
                  />
                  {selectedIndex === index && (
                    <motion.div
                      className="absolute bottom-0 left-0 h-0.5 bg-cyan-400 z-10"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: AUTOPLAY_INTERVAL / 1000, ease: "linear" }}
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="space-y-4 min-h-[160px] lg:min-h-[200px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedArtwork?.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                >
                  <h1 className="font-serif text-4xl lg:text-6xl xl:text-7xl leading-tight">
                    <span className="block text-white/40 text-xl lg:text-3xl mb-2">À la une</span>
                    {selectedArtwork?.title}
                  </h1>
                  
                  <p className="max-w-md text-base lg:text-lg text-white/70 mt-4 line-clamp-2">
                    {selectedArtwork?.description || `Découvrez l'univers unique de ${selectedArtwork?.artist}.`}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {selectedArtwork?.artist && (
                      <span className="px-3 py-1 rounded-full border border-white/20 text-xs uppercase tracking-widest text-white/60">
                        {selectedArtwork.artist}
                      </span>
                    )}
                    {selectedArtwork?.style && (
                      <span className="px-3 py-1 rounded-full border border-white/20 text-xs uppercase tracking-widest text-white/60">
                        {selectedArtwork.style}
                      </span>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <button
              onClick={() => navigate(`/artwork/${selectedArtwork?.id}`)}
              className="group inline-flex items-center gap-2 text-cyan-400 hover:text-white transition-colors uppercase tracking-widest font-semibold mt-4 text-sm"
            >
              Voir l'œuvre
              <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </button>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={handlePrev}
                className="p-3 rounded-full border border-white/20 hover:bg-white/10 transition-colors"
                aria-label="Précédent"
              >
                <ArrowLeft size={20} />
              </button>
              <button
                onClick={handleNext}
                className="p-3 rounded-full border border-white/20 hover:bg-white/10 transition-colors"
                aria-label="Suivant"
              >
                <ArrowRight size={20} />
              </button>
            </div>

            <div className="text-white/40 text-sm">
              <span className="text-white">{String(selectedIndex + 1).padStart(2, '0')}</span>
              <span className="mx-2">/</span>
              <span>{String(artworks.length).padStart(2, '0')}</span>
            </div>
          </div>
        </div>

        {/* Right Column - Image */}
        <div className="relative h-[50vh] lg:h-full order-1 lg:order-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedArtwork?.id}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              className="absolute inset-0"
            >
              <img
                src={selectedArtwork?.image}
                alt={selectedArtwork?.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-transparent lg:bg-gradient-to-r lg:from-[#030303] lg:via-[#030303]/30 lg:to-transparent" />
            </motion.div>
          </AnimatePresence>

          {/* Floating badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute top-6 right-6 lg:top-10 lg:right-10"
          >
            <div className="glass-panel px-4 py-2 rounded-full">
              <span className="text-xs font-medium text-white/80">{selectedArtwork?.price}</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default BlueCinisHero;
