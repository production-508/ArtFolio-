import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  MapPin, 
  Link as LinkIcon, 
  Mail, 
  Plus,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Palette,
  Sparkles
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// MOCK DATA - Remplacer par appel API réel
// ═══════════════════════════════════════════════════════════════
const MOCK_ARTIST = {
  id: 'artist-001',
  name: 'Elena Vostrova',
  verified: true,
  avatar: null, // placeholder
  location: 'Paris, France',
  website: 'elenavostrova.art',
  bio: "Exploratrice des formes organiques et des tensions géométriques. Mon travail interroge l'interface entre nature algorithmique et émotion humaine.",
  story: "Née à Saint-Pétersbourg, j'ai grandi entre les musées d'art classique et les usines soviétiques désaffectées. Cette dualité marque mon approche : je cherche la beauté dans la brutalité, la tendresse dans la structure.",
  medium: 'Peinture numérique & Installation',
  artworksCount: 47,
  followers: 12847,
  following: 342,
  styleSignature: 'geometric-organic',
  layoutType: 'masonry', // 'grid' | 'masonry' | 'spotlight' | 'timeline'
  tags: ['Abstract', 'Generative', 'Minimal', 'Digital Art', 'Contemporary', 'Geometry'],
  palette: ['#0a1628', '#1e3a5f', '#2d5a87', '#4a7fb5', '#7da8d1', '#c9e4f2'],
  social: {
    instagram: '@elenavostrova',
    twitter: '@elena_v_art',
    behance: 'elenavostrova'
  }
};

const MOCK_ARTWORKS = [
  {
    id: 'art-001',
    title: 'Fractured Light #7',
    year: 2026,
    medium: 'Generative Digital',
    price: 2400,
    dimensions: '120 × 80 cm',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
    featured: true,
    date: '2026-01-15'
  },
  {
    id: 'art-002',
    title: 'Silence Algorithmique',
    year: 2025,
    medium: 'Installation vidéo',
    price: 5800,
    dimensions: 'Variable',
    image: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800&q=80',
    featured: false,
    date: '2025-11-20'
  },
  {
    id: 'art-003',
    title: 'Nébuleuse d\'Acier',
    year: 2025,
    medium: 'Peinture numérique',
    price: 3200,
    dimensions: '100 × 100 cm',
    image: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=800&q=80',
    featured: false,
    date: '2025-09-10'
  },
  {
    id: 'art-004',
    title: 'Mémoire Cristalline',
    year: 2025,
    medium: 'Print sur aluminium',
    price: 1800,
    dimensions: '60 × 90 cm',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80',
    featured: false,
    date: '2025-07-05'
  },
  {
    id: 'art-005',
    title: 'Échos Sous-marins',
    year: 2024,
    medium: 'Generative Art',
    price: 2900,
    dimensions: '150 × 100 cm',
    image: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&q=80',
    featured: false,
    date: '2024-12-12'
  },
  {
    id: 'art-006',
    title: 'Tension No. 42',
    year: 2024,
    medium: 'Mixed Media',
    price: 4200,
    dimensions: '200 × 150 cm',
    image: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800&q=80',
    featured: false,
    date: '2024-08-30'
  },
  {
    id: 'art-007',
    title: 'Horizon Brisé',
    year: 2024,
    medium: 'Digital Painting',
    price: 2100,
    dimensions: '80 × 120 cm',
    image: 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=800&q=80',
    featured: false,
    date: '2024-05-15'
  },
  {
    id: 'art-008',
    title: 'Synapse Collective',
    year: 2023,
    medium: 'Installation interactive',
    price: 12000,
    dimensions: 'Site-specific',
    image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80',
    featured: false,
    date: '2023-10-22'
  },
  {
    id: 'art-009',
    title: 'Flux Éternel',
    year: 2023,
    medium: 'Generative Video',
    price: 3600,
    dimensions: '4K Loop',
    image: 'https://images.unsplash.com/photo-1573521193826-58c7dc2e13e3?w=800&q=80',
    featured: false,
    date: '2023-06-18'
  }
];

// ═══════════════════════════════════════════════════════════════
// UTILITAIRES
// ═══════════════════════════════════════════════════════════════
const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency: 'EUR',
    maximumFractionDigits: 0 
  }).format(price);
};

const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
};

// Typographie adaptative selon styleSignature
const getTypographyStyle = (styleSignature) => {
  const styles = {
    'geometric-organic': { fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: '-0.02em' },
    'classical': { fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: '0' },
    'brutalist': { fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: '0.05em', textTransform: 'uppercase' },
    'minimal': { fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: '-0.03em' },
    'expressive': { fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: '0.01em', fontStyle: 'italic' }
  };
  return styles[styleSignature] || styles['geometric-organic'];
};

// ═══════════════════════════════════════════════════════════════
// COMPOSANTS
// ═══════════════════════════════════════════════════════════════

// Palette de couleurs
const ColorPalette = ({ colors, onColorClick }) => (
  <div className="flex items-center gap-2">
    <Palette className="w-4 h-4 text-white/40 mr-1" />
    <div className="flex gap-1.5">
      {colors.map((color, i) => (
        <motion.button
          key={i}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onColorClick?.(color)}
          className="w-6 h-6 rounded-full border border-white/10 shadow-lg"
          style={{ backgroundColor: color }}
          title={color}
        />
      ))}
    </div>
  </div>
);

// Tag cliquable
const Tag = ({ label, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.12)' }}
    whileTap={{ scale: 0.95 }}
    onClick={() => onClick?.(label)}
    className="px-3 py-1.5 text-xs font-medium tracking-wide uppercase rounded-full 
               bg-white/5 border border-white/10 text-white/70 hover:text-white
               transition-colors duration-200"
  >
    {label}
  </motion.button>
);

// Badge vérifié
const VerifiedBadge = () => (
  <div className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500">
    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
  </div>
);

// Bouton glassmorphism
const GlassButton = ({ children, variant = 'primary', icon: Icon, onClick, className = '' }) => {
  const variants = {
    primary: 'bg-white/10 hover:bg-white/15 border-white/20 text-white',
    secondary: 'bg-transparent hover:bg-white/5 border-white/10 text-white/80',
    accent: 'bg-gradient-to-r from-cyan-500/80 to-blue-600/80 hover:from-cyan-500 hover:to-blue-600 border-transparent text-white'
  };
  
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 
                  rounded-xl backdrop-blur-md border font-medium text-sm
                  transition-all duration-200 ${variants[variant]} ${className}`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </motion.button>
  );
};

// ═══════════════════════════════════════════════════════════════
// LAYOUTS D'ŒUVRES
// ═══════════════════════════════════════════════════════════════

// Grid Layout - Grille uniforme
const GridLayout = ({ artworks, onArtworkClick }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
    {artworks.map((artwork, i) => (
      <motion.div
        key={artwork.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.05 }}
        onClick={() => onArtworkClick(artwork)}
        className="group relative aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer
                   bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10
                   hover:border-white/20 transition-all duration-300"
      >
        <img 
          src={artwork.image} 
          alt={artwork.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <h4 className="text-white font-medium text-sm">{artwork.title}</h4>
          <p className="text-white/60 text-xs mt-1">{artwork.year} · {artwork.medium}</p>
          {artwork.price && (
            <p className="text-cyan-400 text-sm font-semibold mt-2">{formatPrice(artwork.price)}</p>
          )}
        </div>
        {artwork.featured && (
          <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-white/90">Featured</span>
          </div>
        )}
      </motion.div>
    ))}
  </div>
);

// Masonry Layout - Style Pinterest
const MasonryLayout = ({ artworks, onArtworkClick }) => {
  // Répartition des œuvres en 3 colonnes
  const columns = [[], [], []];
  artworks.forEach((artwork, i) => {
    columns[i % 3].push({ ...artwork, index: i });
  });
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
      {columns.map((column, colIndex) => (
        <div key={colIndex} className="flex flex-col gap-4 md:gap-5">
          {column.map((artwork) => (
            <motion.div
              key={artwork.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: artwork.index * 0.05 }}
              onClick={() => onArtworkClick(artwork)}
              className="group relative rounded-2xl overflow-hidden cursor-pointer
                         bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10
                         hover:border-white/20 transition-all duration-300"
              style={{ 
                aspectRatio: colIndex === 1 ? '3/4' : colIndex === 0 ? '4/5' : '1/1'
              }}
            >
              <img 
                src={artwork.image} 
                alt={artwork.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <h4 className="text-white font-medium text-sm">{artwork.title}</h4>
                <p className="text-white/60 text-xs mt-1">{artwork.year}</p>
              </div>
              {artwork.featured && (
                <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                  <Sparkles className="w-3 h-3 text-yellow-400" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ))}
    </div>
  );
};

// Spotlight Layout - 1 œuvre phare + thumbnails
const SpotlightLayout = ({ artworks, onArtworkClick }) => {
  const [selectedId, setSelectedId] = useState(artworks.find(a => a.featured)?.id || artworks[0]?.id);
  const featured = artworks.find(a => a.id === selectedId) || artworks[0];
  const thumbnails = artworks.filter(a => a.id !== selectedId);
  
  return (
    <div className="space-y-6">
      {/* Œuvre phare */}
      <motion.div
        key={featured.id}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden
                   bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10"
      >
        <img 
          src={featured.image} 
          alt={featured.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl md:text-4xl font-semibold text-white mb-2">{featured.title}</h3>
              <p className="text-white/60 text-sm md:text-base">{featured.year} · {featured.medium}</p>
              {featured.price && (
                <p className="text-cyan-400 text-xl font-semibold mt-3">{formatPrice(featured.price)}</p>
              )}
            </div>
            <GlassButton icon={Heart} variant="secondary" className="shrink-0">
              <span className="sr-only">Aimer</span>
            </GlassButton>
          </div>
        </div>
      </motion.div>
      
      {/* Thumbnails */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide mask-linear-fade">
        {thumbnails.map((artwork) => (
          <motion.button
            key={artwork.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedId(artwork.id)}
            className={`relative shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden
                        border-2 transition-all duration-200 ${
                          selectedId === artwork.id 
                            ? 'border-cyan-400' 
                            : 'border-transparent hover:border-white/20'
                        }`}
          >
            <img 
              src={artwork.image} 
              alt={artwork.title}
              className="w-full h-full object-cover"
            />
          </motion.button>
        ))}
      </div>
    </div>
  );
};

// Timeline Layout - Scroll horizontal chronologique
const TimelineLayout = ({ artworks, onArtworkClick }) => {
  const scrollRef = useRef(null);
  const sortedArtworks = [...artworks].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: direction * 400, behavior: 'smooth' });
    }
  };
  
  // Grouper par année
  const byYear = sortedArtworks.reduce((acc, art) => {
    acc[art.year] = acc[art.year] || [];
    acc[art.year].push(art);
    return acc;
  }, {});
  
  return (
    <div className="relative">
      {/* Navigation */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
        <button 
          onClick={() => scroll(-1)}
          className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10
                     flex items-center justify-center text-white hover:bg-black/70 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
        <button 
          onClick={() => scroll(1)}
          className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10
                     flex items-center justify-center text-white hover:bg-black/70 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      
      {/* Timeline scrollable */}
      <div 
        ref={scrollRef}
        className="flex gap-8 overflow-x-auto scrollbar-hide px-12 py-4"
      >
        {Object.entries(byYear).map(([year, arts]) => (
          <div key={year} className="shrink-0">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-2xl font-bold text-white">{year}</span>
              <div className="w-20 h-px bg-white/20" />
            </div>
            <div className="flex gap-4">
              {arts.map((artwork, i) => (
                <motion.div
                  key={artwork.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => onArtworkClick(artwork)}
                  className="group relative w-64 aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer
                             bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10
                             hover:border-white/20 transition-all duration-300"
                >
                  <img 
                    src={artwork.image} 
                    alt={artwork.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <h4 className="text-white font-medium text-sm">{artwork.title}</h4>
                    <p className="text-cyan-400 text-xs font-semibold mt-1">{formatPrice(artwork.price)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════
export default function ArtistProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artist, setArtist] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  
  // Chargement des données (mock)
  useEffect(() => {
    // Simuler appel API
    setTimeout(() => {
      setArtist(MOCK_ARTIST);
      setArtworks(MOCK_ARTWORKS);
      setLoading(false);
    }, 600);
  }, [id]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-white/10 border-t-cyan-400 rounded-full animate-spin" />
          <p className="text-white/40 text-sm">Chargement du profil...</p>
        </div>
      </div>
    );
  }
  
  if (!artist) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <p className="text-white/60">Artiste introuvable</p>
      </div>
    );
  }
  
  const typographyStyle = getTypographyStyle(artist.styleSignature);
  
  // Sélection du layout
  const renderLayout = () => {
    const props = { artworks, onArtworkClick: setSelectedArtwork };
    switch (artist.layoutType) {
      case 'grid': return <GridLayout {...props} />;
      case 'masonry': return <MasonryLayout {...props} />;
      case 'spotlight': return <SpotlightLayout {...props} />;
      case 'timeline': return <TimelineLayout {...props} />;
      default: return <MasonryLayout {...props} />;
    }
  };
  
  return (
    <div className="min-h-screen bg-[#030303] text-white overflow-x-hidden">
      {/* Background orbes subtils */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] rounded-full bg-blue-500/5 blur-[120px]" />
        <div className="absolute -bottom-1/2 -right-1/4 w-[600px] h-[600px] rounded-full bg-cyan-500/5 blur-[100px]" />
      </div>
      
      <div className="relative z-10">
        {/* ═══════════════════════════════════════════════════════════════
            HEADER - Profil Artiste
            ═══════════════════════════════════════════════════════════════ */}
        <header className="relative px-4 sm:px-6 lg:px-8 xl:px-12 pt-8 pb-12">
          {/* Gradient de fond subtil */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
          
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
              {/* Avatar */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative shrink-0"
              >
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-full p-1 bg-gradient-to-br from-cyan-400/50 to-blue-600/50">
                  <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-slate-700 to-slate-900 border-2 border-[#030303]">
                    {artist.avatar ? (
                      <img src={artist.avatar} alt={artist.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-600 to-slate-800">
                        <span className="text-4xl md:text-5xl font-light text-white/40">
                          {artist.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {artist.verified && (
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#030303] flex items-center justify-center">
                    <VerifiedBadge />
                  </div>
                )}
              </motion.div>
              
              {/* Info */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex-1 min-w-0"
              >
                {/* Nom + badges */}
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white tracking-tight">
                    {artist.name}
                  </h1>
                  {artist.verified && (
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full 
                                     bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Vérifié
                    </span>
                  )}
                </div>
                
                {/* Métadonnées */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-white/50 mb-4">
                  {artist.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {artist.location}
                    </span>
                  )}
                  {artist.website && (
                    <a 
                      href={`https://${artist.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors"
                    >
                      <LinkIcon className="w-4 h-4" />
                      {artist.website}
                    </a>
                  )}
                  <span>{artist.medium}</span>
                </div>
                
                {/* Stats */}
                <div className="flex items-center gap-6 mb-6 text-sm">
                  <div>
                    <span className="font-semibold text-white">{formatNumber(artist.followers)}</span>
                    <span className="text-white/50 ml-1">abonnés</span>
                  </div>
                  <div>
                    <span className="font-semibold text-white">{formatNumber(artist.following)}</span>
                    <span className="text-white/50 ml-1">abonnements</span>
                  </div>
                  <div>
                    <span className="font-semibold text-white">{artist.artworksCount}</span>
                    <span className="text-white/50 ml-1">œuvres</span>
                  </div>
                </div>
                
                {/* Bio avec typographie adaptée */}
                <p 
                  className="text-white/70 leading-relaxed mb-3 max-w-2xl"
                  style={typographyStyle}
                >
                  {artist.bio}
                </p>
                
                {/* Story en italique */}
                <p className="text-white/50 text-sm italic leading-relaxed mb-6 max-w-2xl border-l-2 border-white/10 pl-4">
                  "{artist.story}"
                </p>
                
                {/* Tags + Palette */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  {artist.tags.map((tag) => (
                    <Tag key={tag} label={tag} onClick={(t) => console.log('Filter by:', t)} />
                  ))}
                </div>
                
                <div className="mb-8">
                  <ColorPalette colors={artist.palette} onColorClick={(c) => console.log('Color:', c)} />
                </div>
                
                {/* Boutons d'action */}
                <div className="flex flex-wrap items-center gap-3">
                  <GlassButton 
                    variant="accent" 
                    icon={isFollowing ? CheckCircle2 : Plus}
                    onClick={() => setIsFollowing(!isFollowing)}
                  >
                    {isFollowing ? 'Suivi' : 'Suivre'}
                  </GlassButton>
                  <GlassButton variant="primary" icon={Mail}>
                    Contacter
                  </GlassButton>
                  <GlassButton variant="secondary" icon={Share2}>
                    Partager
                  </GlassButton>
                </div>
              </motion.div>
            </div>
          </div>
        </header>
        
        {/* ═══════════════════════════════════════════════════════════════
            SECTION ŒUVRES - Layout dynamique
            ═══════════════════════════════════════════════════════════════ */}
        <section className="px-4 sm:px-6 lg:px-8 xl:px-12 py-12">
          <div className="max-w-7xl mx-auto">
            {/* En-tête de section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-between mb-8"
            >
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-white mb-1">Œuvres</h2>
                <p className="text-white/40 text-sm">
                  {artworks.length} pièces · Layout: {artist.layoutType}
                </p>
              </div>
              
              {/* Sélecteur de layout (pour démo) */}
              <div className="hidden sm:flex items-center gap-2 p-1 rounded-xl bg-white/5 border border-white/10">
                {['grid', 'masonry', 'spotlight', 'timeline'].map((layout) => (
                  <button
                    key={layout}
                    onClick={() => setArtist({...artist, layoutType: layout})}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                      artist.layoutType === layout 
                        ? 'bg-white/10 text-white' 
                        : 'text-white/40 hover:text-white/60'
                    }`}
                  >
                    {layout}
                  </button>
                ))}
              </div>
            </motion.div>
            
            {/* Layout dynamique */}
            <motion.div
              key={artist.layoutType}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {renderLayout()}
            </motion.div>
          </div>
        </section>
      </div>
      
      {/* ═══════════════════════════════════════════════════════════════
          MODAL DÉTAIL ŒUVRE
          ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedArtwork && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedArtwork(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl
                         bg-gradient-to-br from-white/10 to-white/5 border border-white/10"
            >
              <div className="grid md:grid-cols-2 h-full">
                {/* Image */}
                <div className="relative aspect-square md:aspect-auto">
                  <img 
                    src={selectedArtwork.image} 
                    alt={selectedArtwork.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Info */}
                <div className="p-6 md:p-8 flex flex-col">
                  <button 
                    onClick={() => setSelectedArtwork(null)}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 
                               flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                  >
                    ×
                  </button>
                  
                  <div className="flex-1">
                    <h3 className="text-2xl md:text-3xl font-semibold text-white mb-2">
                      {selectedArtwork.title}
                    </h3>
                    <p className="text-white/50 mb-6">{selectedArtwork.year} · {selectedArtwork.medium}</p>
                    
                    <div className="space-y-4 mb-8">
                      <div className="flex justify-between py-3 border-b border-white/10">
                        <span className="text-white/50">Dimensions</span>
                        <span className="text-white">{selectedArtwork.dimensions}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-white/10">
                        <span className="text-white/50">Prix</span>
                        <span className="text-cyan-400 font-semibold text-lg">
                          {formatPrice(selectedArtwork.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <GlassButton variant="accent" className="flex-1">
                      Acquérir
                    </GlassButton>
                    <GlassButton variant="secondary" icon={Heart} />
                    <GlassButton variant="secondary" icon={Share2} />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
