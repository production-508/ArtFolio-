import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Eye, 
  ShoppingBag, 
  Share2, 
  Check,
  Loader2
} from 'lucide-react';
import RoomPreview from '../components/RoomPreview';

// Mock data - remplacer par l'API réelle
const MOCK_ARTWORKS = [
  {
    id: '1',
    title: 'Blue Cinis #01',
    artist: 'Marie Laurent',
    price: 1200,
    currency: '€',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80',
    width: 80,
    height: 100,
    medium: 'Acrylique sur toile'
  },
  {
    id: '2',
    title: 'Abstraction Rouge',
    artist: 'Jean Dubois',
    price: 850,
    currency: '€',
    image: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=800&q=80',
    width: 60,
    height: 60,
    medium: 'Huile sur toile'
  },
  {
    id: '3',
    title: 'Lumière d\'Automne',
    artist: 'Sophie Martin',
    price: 1500,
    currency: '€',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&q=80',
    width: 100,
    height: 80,
    medium: 'Mixed media'
  },
  {
    id: '4',
    title: 'Minimaliste #7',
    artist: 'Thomas Petit',
    price: 600,
    currency: '€',
    image: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800&q=80',
    width: 50,
    height: 70,
    medium: 'Acrylique'
  }
];

const RoomViewPage = () => {
  const { artworkId } = useParams();
  const navigate = useNavigate();
  
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showArtworkSelector, setShowArtworkSelector] = useState(false);
  const [exportedImage, setExportedImage] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);

  // Charger l'œuvre
  useEffect(() => {
    const loadArtwork = async () => {
      setLoading(true);
      
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (artworkId) {
        const found = MOCK_ARTWORKS.find(a => a.id === artworkId);
        if (found) {
          setArtwork(found);
        } else {
          // Œuvre non trouvée, afficher le sélecteur
          setShowArtworkSelector(true);
        }
      } else {
        // Pas d'ID, afficher le sélecteur
        setShowArtworkSelector(true);
      }
      
      setLoading(false);
    };
    
    loadArtwork();
  }, [artworkId]);

  const handleArtworkSelect = (selected) => {
    setArtwork(selected);
    setShowArtworkSelector(false);
    navigate(`/visualiser/${selected.id}`, { replace: true });
  };

  const handleExport = (dataUrl) => {
    setExportedImage(dataUrl);
    setShowShareModal(true);
  };

  const handleBuy = () => {
    if (artwork) {
      navigate(`/checkout?artwork=${artwork.id}`);
    }
  };

  const handleShare = async (platform) => {
    const text = `Découvre "${artwork?.title}" de ${artwork?.artist} sur ArtFolio !`;
    const url = window.location.href;
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'pinterest':
        window.open(`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(text)}`);
        break;
      case 'copy':
        await navigator.clipboard.writeText(url);
        break;
      default:
        if (navigator.share) {
          navigator.share({
            title: artwork?.title,
            text: text,
            url: url
          });
        }
    }
    setShowShareModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center gap-3 text-white/60">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Retour</span>
          </button>

          <div className="flex items-center gap-2">
            <Eye size={18} className="text-white/40" />
            <span className="text-sm text-white/60">Visualisation murale</span>
          </div>

          <button
            onClick={() => setShowArtworkSelector(true)}
            className="text-sm text-white/60 hover:text-white transition-colors"
          >
            Changer d'œuvre
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          {artwork ? (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Preview Canvas */}
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <RoomPreview
                    artworkUrl={artwork.image}
                    artworkTitle={artwork.title}
                    defaultWidth={artwork.width}
                    defaultHeight={artwork.height}
                    onExport={handleExport}
                    onBuy={handleBuy}
                  />
                </motion.div>
              </div>

              {/* Info Panel */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="space-y-6"
                >
                  {/* Artwork Info Card */}
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <div className="aspect-square rounded-xl overflow-hidden mb-4">
                      <img 
                        src={artwork.image} 
                        alt={artwork.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <h1 className="text-2xl font-light mb-1">{artwork.title}</h1>
                    <p className="text-white/60 mb-4">{artwork.artist}</p>

                    <div className="space-y-2 text-sm text-white/40">
                      <div className="flex justify-between">
                        <span>Dimensions</span>
                        <span className="text-white/60">{artwork.width} × {artwork.height} cm</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Technique</span>
                        <span className="text-white/60">{artwork.medium}</span>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-white/10">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-3xl font-light">
                          {artwork.price}{artwork.currency}
                        </span>
                      </div>

                      <button
                        onClick={handleBuy}
                        className="w-full py-3 bg-white text-black rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors font-medium"
                      >
                        <ShoppingBag size={18} />
                        Acheter cette œuvre
                      </button>
                    </div>
                  </div>

                  {/* Tips Card */}
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <h3 className="text-sm font-medium mb-4 text-white/80">
                      Conseils d'accrochage
                    </h3>
                    <ul className="space-y-3 text-sm text-white/50">
                      <li className="flex items-start gap-2">
                        <Check size={14} className="mt-0.5 text-green-400" />
                        <span>Centre à hauteur des yeux (145-150cm)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check size={14} className="mt-0.5 text-green-400" />
                        <span>Laissez 15cm d'espace au-dessus d'un canapé</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check size={14} className="mt-0.5 text-green-400" />
                        <span>Utilisez le comparateur pour visualiser l'échelle</span>
                      </li>
                    </ul>
                  </div>
                </motion.div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <Eye size={48} className="mx-auto text-white/20 mb-4" />
              <p className="text-white/60">Sélectionnez une œuvre pour commencer</p>
            </div>
          )}
        </div>
      </main>

      {/* Artwork Selector Modal */}
      {showArtworkSelector && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-light">Choisir une œuvre</h2>
              <button
                onClick={() => artwork && setShowArtworkSelector(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                Fermer
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {MOCK_ARTWORKS.map(art => (
                  <button
                    key={art.id}
                    onClick={() => handleArtworkSelect(art)}
                    className="group text-left"
                  >
                    <div className="aspect-square rounded-xl overflow-hidden mb-3 bg-white/5">
                      <img 
                        src={art.image} 
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <p className="font-medium text-sm truncate">{art.title}</p>
                    <p className="text-white/50 text-xs">{art.artist}</p>
                    <p className="text-white/60 text-sm mt-1">{art.price}{art.currency}</p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 rounded-2xl max-w-md w-full p-6"
          >
            <h3 className="text-lg font-medium mb-4">Partager votre visualisation</h3>

            {exportedImage && (
              <div className="aspect-video rounded-lg overflow-hidden mb-6 bg-white/5">
                <img src={exportedImage} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleShare('twitter')}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Twitter
              </button>
              <button
                onClick={() => handleShare('facebook')}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
              <button
                onClick={() => handleShare('pinterest')}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>
                </svg>
                Pinterest
              </button>
              <button
                onClick={() => handleShare('copy')}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Share2 size={18} />
                Copier lien
              </button>
            </div>

            <button
              onClick={() => setShowShareModal(false)}
              className="w-full mt-4 py-3 bg-white/10 hover:bg-white/15 rounded-lg transition-colors"
            >
              Fermer
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default RoomViewPage;
