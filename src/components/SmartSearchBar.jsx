import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Camera, X, Sparkles, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Barre de recherche intelligente — style institutionnel
 * Recherche textuelle + upload visuel
 */
export default function SmartSearchBar({ onSearch, compact = false }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isVisualMode, setIsVisualMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const fileInputRef = useRef(null);

  // Suggestions contextuelles
  const semanticSuggestions = [
    'Abstrait avec bleu profond',
    'Portrait contemporain',
    'Minimalisme organique',
    'Expressionnisme urbain',
    'Sculpture lumière',
    'Néo-fauvisme',
  ];

  const handleSearch = async (searchQuery, visualData = null) => {
    if (!searchQuery.trim() && !visualData) return;
    
    setIsSearching(true);
    
    try {
      const results = await onSearch?.({ 
        query: searchQuery, 
        visual: visualData 
      });
      
      // Navigate to search results
      navigate('/recherche', { 
        state: { 
          query: searchQuery, 
          visual: uploadedImage,
          results 
        } 
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleFileUpload = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target.result);
      setIsVisualMode(true);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  }, []);

  const clearVisual = () => {
    setUploadedImage(null);
    setIsVisualMode(false);
  };

  return (
    <div className={`relative ${compact ? 'w-full max-w-xl' : 'w-full max-w-2xl'}`}>
      {/* Main search container */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`
          relative border border-white/20 bg-black/50 backdrop-blur-sm
          transition-all duration-300
          ${isDragging ? 'border-white/60 bg-white/5' : ''}
          ${isVisualMode ? 'rounded-lg' : 'rounded-full'}
        `}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {isVisualMode && uploadedImage ? (
          /* Visual search mode */
          <div className="p-4">
            <div className="flex items-start gap-4">
              <div className="relative w-20 h-20 rounded overflow-hidden flex-shrink-0">
                <img 
                  src={uploadedImage} 
                  alt="Reference" 
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={clearVisual}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/80 rounded-full 
                           flex items-center justify-center text-white/80 
                           hover:text-white transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
              <div className="flex-1">
                <p className="text-white/60 text-sm mb-2">
                  Recherche d'œuvres similaires
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ajouter des mots-clés..."
                    className="flex-1 bg-transparent text-white text-sm outline-none
                             placeholder:text-white/30"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  />
                  <button
                    onClick={() => handleSearch(query, uploadedImage)}
                    disabled={isSearching}
                    className="px-4 py-2 bg-white text-black text-sm rounded
                             hover:bg-white/90 transition-colors disabled:opacity-50
                             flex items-center gap-2"
                  >
                    {isSearching ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Search size={14} />
                    )}
                    <span className="hidden sm:inline">Rechercher</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Text search mode */
          <div className="flex items-center px-6 py-4">
            <Search size={18} className="text-white/40 flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                // Filter suggestions
                if (e.target.value.length > 2) {
                  const filtered = semanticSuggestions.filter(s => 
                    s.toLowerCase().includes(e.target.value.toLowerCase())
                  );
                  setSuggestions(filtered.slice(0, 3));
                } else {
                  setSuggestions([]);
                }
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
              placeholder="Rechercher par style, couleur, artiste, émotion..."
              className="flex-1 ml-4 bg-transparent text-white outline-none
                       placeholder:text-white/30"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.1rem' }}
            />
            
            {/* Visual search button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="ml-4 p-2 text-white/40 hover:text-white/80 
                       transition-colors rounded-full hover:bg-white/5"
              title="Recherche visuelle"
            >
              <Camera size={18} />
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e.target.files[0])}
              className="hidden"
            />
          </div>
        )}
      </motion.div>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {suggestions.length > 0 && !isVisualMode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 py-2 
                     bg-black/90 backdrop-blur-md border border-white/10 rounded-lg
                     z-50"
          >
            {suggestions.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuery(suggestion);
                  handleSearch(suggestion);
                  setSuggestions([]);
                }}
                className="w-full px-6 py-3 text-left text-white/70 hover:text-white
                         hover:bg-white/5 transition-colors flex items-center gap-3"
              >
                <Sparkles size={14} className="text-white/30" />
                <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                  {suggestion}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drop zone indicator */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 -m-4 border-2 border-dashed border-white/40 
                     rounded-2xl bg-white/5 flex items-center justify-center z-50"
          >
            <p className="text-white/60 text-lg"
               style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              Déposez une image pour la recherche visuelle
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
