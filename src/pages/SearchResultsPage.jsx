import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sliders, X, Grid3X3, LayoutGrid, ArrowLeft } from 'lucide-react';
import SmartSearchBar from '../components/SmartSearchBar';
import InstitutionalNav from '../components/InstitutionalNav';

/**
 * Page de résultats de recherche intelligente
 * Filtres avancés, tri, vues multiples
 */
export default function SearchResultsPage() {
  const location = useLocation();
  const { query: initialQuery = '', visual: initialVisual = null } = location.state || {};
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('masonry'); // 'masonry' | 'grid'
  const [showFilters, setShowFilters] = useState(false);
  
  // Filtres actifs
  const [filters, setFilters] = useState({
    priceRange: [0, 50000],
    styles: [],
    mediums: [],
    colors: [],
    yearRange: [1900, 2025],
    size: 'all', // 'small' | 'medium' | 'large' | 'all'
  });

  // Options de filtres
  const filterOptions = {
    styles: ['Abstrait', 'Figuratif', 'Minimaliste', 'Expressionniste', 'Surréaliste', 'Contemporain'],
    mediums: ['Huile', 'Acrylique', 'Aquarelle', 'Sculpture', 'Photographie', 'Numérique', 'Mixte'],
    colors: [
      { name: 'Rouge', value: '#ef4444' },
      { name: 'Bleu', value: '#3b82f6' },
      { name: 'Vert', value: '#22c55e' },
      { name: 'Jaune', value: '#eab308' },
      { name: 'Noir', value: '#000000' },
      { name: 'Blanc', value: '#ffffff' },
      { name: 'Orange', value: '#f97316' },
      { name: 'Violet', value: '#a855f7' },
    ],
  };

  // Simulation de résultats
  useEffect(() => {
    setLoading(true);
    
    // Simuler un délai API
    const timer = setTimeout(() => {
      const mockResults = Array.from({ length: 24 }, (_, i) => ({
        id: `artwork-${i}`,
        title: `Œuvre ${String.fromCharCode(65 + (i % 26))}${Math.floor(i / 26) + 1 || ''}`,
        artist: ['Elena Vostrova', 'Marc Dubois', 'Yuki Tanaka', 'Sofia Andersson'][i % 4],
        year: 2020 + (i % 5),
        price: 500 + (i * 250) + (Math.random() * 500),
        medium: filterOptions.mediums[i % filterOptions.mediums.length],
        style: filterOptions.styles[i % filterOptions.styles.length],
        dimensions: `${60 + (i * 10)} x ${80 + (i * 5)} cm`,
        dominantColor: filterOptions.colors[i % filterOptions.colors.length].value,
        image: `/api/placeholder/${400 + (i % 3) * 100}/${500 + (i % 4) * 100}`,
        likes: Math.floor(Math.random() * 500),
      }));
      
      setResults(mockResults);
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [initialQuery, initialVisual]);

  // Filtrer les résultats
  const filteredResults = useMemo(() => {
    return results.filter(artwork => {
      const matchesPrice = artwork.price >= filters.priceRange[0] && 
                          artwork.price <= filters.priceRange[1];
      const matchesStyle = filters.styles.length === 0 || 
                          filters.styles.includes(artwork.style);
      const matchesMedium = filters.mediums.length === 0 || 
                           filters.mediums.includes(artwork.medium);
      const matchesColor = filters.colors.length === 0 || 
                          filters.colors.includes(artwork.dominantColor);
      
      return matchesPrice && matchesStyle && matchesMedium && matchesColor;
    });
  }, [results, filters]);

  const toggleFilter = (category, value) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(v => v !== value)
        : [...prev[category], value]
    }));
  };

  const activeFiltersCount = 
    filters.styles.length + 
    filters.mediums.length + 
    filters.colors.length +
    (filters.priceRange[1] < 50000 ? 1 : 0);

  return (
    <div className="min-h-screen bg-black">
      <InstitutionalNav />
      
      {/* Header */}
      <header className="pt-32 pb-8 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Back + Context */}
          <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-white/40 hover:text-white/80 
                       transition-colors"
            >
              <ArrowLeft size={16} />
              <span className="text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>Retour</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="mb-8">
            <SmartSearchBar 
              onSearch={(params) => console.log('Search:', params)}
            />
          </div>

          {/* Query info */}
          <div className="flex items-center justify-between">
            <div>
              <h1 
                className="text-white text-2xl mb-2"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                {initialQuery ? `Résultats pour "${initialQuery}"` : 'Recherche'}
              </h1>
              <p 
                className="text-white/40 text-sm"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {filteredResults.length} œuvre{filteredResults.length !== 1 && 's'} trouvée
                {filteredResults.length !== 1 && 's'}
                {activeFiltersCount > 0 && ` • ${activeFiltersCount} filtre${activeFiltersCount > 1 ? 's' : ''} actif`}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Filters toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 border text-sm
                         transition-all duration-300
                         ${showFilters 
                           ? 'bg-white text-black border-white' 
                           : 'bg-transparent text-white border-white/20 hover:border-white/40'}`}
              >
                <Sliders size={14} />
                <span style={{ fontFamily: "'Inter', sans-serif" }}>Filtres</span>
                {activeFiltersCount > 0 && (
                  <span className="ml-2 w-5 h-5 bg-white/20 rounded-full 
                               flex items-center justify-center text-xs">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* View toggle */}
              <div className="flex border border-white/20">
                <button
                  onClick={() => setViewMode('masonry')}
                  className={`p-2 transition-colors ${
                    viewMode === 'masonry' 
                      ? 'bg-white/10 text-white' 
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-white/10 text-white' 
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  <Grid3X3 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto px-6 lg:px-12">
        {/* Filters sidebar */}
        <AnimatePresence>
          {showFilters && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="flex-shrink-0 mr-8 overflow-hidden"
            >
              <div className="w-[280px] pr-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 
                    className="text-white text-lg"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  >
                    Filtres
                  </h3>
                  <button
                    onClick={() => setFilters({
                      priceRange: [0, 50000],
                      styles: [],
                      mediums: [],
                      colors: [],
                      yearRange: [1900, 2025],
                      size: 'all',
                    })}
                    className="text-white/40 text-xs hover:text-white/70 transition-colors"
                  >
                    Réinitialiser
                  </button>
                </div>

                {/* Style filter */}
                <div className="mb-6">
                  <h4 className="text-white/60 text-xs uppercase tracking-wider mb-3"
                      style={{ fontFamily: "'Inter', sans-serif" }}>
                    Style
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.styles.map(style => (
                      <button
                        key={style}
                        onClick={() => toggleFilter('styles', style)}
                        className={`px-3 py-1 text-xs border transition-all duration-200
                                 ${filters.styles.includes(style)
                                   ? 'bg-white text-black border-white'
                                   : 'bg-transparent text-white/60 border-white/20 hover:border-white/40'}`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Medium filter */}
                <div className="mb-6">
                  <h4 className="text-white/60 text-xs uppercase tracking-wider mb-3"
                      style={{ fontFamily: "'Inter', sans-serif" }}>
                    Technique
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.mediums.map(medium => (
                      <button
                        key={medium}
                        onClick={() => toggleFilter('mediums', medium)}
                        className={`px-3 py-1 text-xs border transition-all duration-200
                                 ${filters.mediums.includes(medium)
                                   ? 'bg-white text-black border-white'
                                   : 'bg-transparent text-white/60 border-white/20 hover:border-white/40'}`}
                      >
                        {medium}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color filter */}
                <div className="mb-6">
                  <h4 className="text-white/60 text-xs uppercase tracking-wider mb-3"
                      style={{ fontFamily: "'Inter', sans-serif" }}>
                    Couleur dominante
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.colors.map(color => (
                      <button
                        key={color.value}
                        onClick={() => toggleFilter('colors', color.value)}
                        className={`w-8 h-8 rounded-full border-2 transition-all duration-200
                                 ${filters.colors.includes(color.value)
                                   ? 'border-white scale-110'
                                   : 'border-transparent hover:border-white/30'}`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Price range */}
                <div className="mb-6">
                  <h4 className="text-white/60 text-xs uppercase tracking-wider mb-3"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Prix
                  </h4>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={filters.priceRange[0]}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        priceRange: [parseInt(e.target.value), prev.priceRange[1]]
                      }))}
                      className="w-20 px-2 py-1 bg-transparent border border-white/20 
                               text-white text-sm text-center outline-none"
                    />
                    <span className="text-white/40">–</span>
                    <input
                      type="number"
                      value={filters.priceRange[1]}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        priceRange: [prev.priceRange[0], parseInt(e.target.value)]
                      }))}
                      className="w-24 px-2 py-1 bg-transparent border border-white/20 
                               text-white text-sm text-center outline-none"
                    />
                    <span className="text-white/40 text-sm">€</span>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Results grid */}
        <main className="flex-1 pb-20">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white 
                            rounded-full animate-spin" />
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="text-center py-20">
              <Search size={48} className="text-white/20 mx-auto mb-4" />
              <p 
                className="text-white/40 text-lg mb-2"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                Aucune œuvre ne correspond à votre recherche
              </p>
              <p 
                className="text-white/30 text-sm"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Essayez de modifier vos filtres ou vos mots-clés
              </p>
            </div>
          ) : (
            <div className={`
              ${viewMode === 'masonry' 
                ? 'columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8' 
                : 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'}
            `}>
              {filteredResults.map((artwork, i) => (
                <SearchResultCard 
                  key={artwork.id} 
                  artwork={artwork} 
                  index={i}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

/**
 * Carte de résultat de recherche
 */
function SearchResultCard({ artwork, index, viewMode }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className={`relative group cursor-pointer ${
        viewMode === 'masonry' ? 'break-inside-avoid mb-8' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className={`relative overflow-hidden bg-white/5 ${
        viewMode === 'grid' ? 'aspect-square' : ''
      }`}>
        <img
          src={artwork.image}
          alt={artwork.title}
          className={`w-full transition-all duration-700 ease-out
                   ${isHovered ? 'brightness-110 scale-105' : 'brightness-90'}`}
          loading="lazy"
        />
        
        {/* Overlay on hover */}
        <motion.div
          initial={false}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent
                   flex flex-col justify-end p-4"
        >
          <div className="transform transition-transform duration-300"
               style={{ transform: isHovered ? 'translateY(0)' : 'translateY(10px)' }}>
            <p className="text-white/60 text-xs mb-1"
               style={{ fontFamily: "'Inter', sans-serif" }}>
              {artwork.medium}, {artwork.year}
            </p>
            
            <p className="text-white/80 text-sm"
               style={{ fontFamily: "'Inter', sans-serif" }}>
              {artwork.dimensions}
            </p>
          </div>
        </motion.div>

        {/* Price tag (visible only on hover) */}
        <motion.div
          initial={false}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute top-4 right-4 px-3 py-1 bg-white text-black text-sm"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {artwork.price.toLocaleString('fr-FR')} €
        </motion.div>
      </div>

      {/* Info below image */}
      <div className="mt-4">
        <h3 
          className="text-white text-lg leading-tight mb-1"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          {artwork.title}
        </h3>
        <p 
          className="text-white/50 text-sm"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {artwork.artist}
        </p>
      </div>
    </motion.article>
  );
}
