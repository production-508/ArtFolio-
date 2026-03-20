import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon, Sparkles, ArrowRight } from 'lucide-react';
import { ArtworkAnalyzer } from '../components/ArtworkAnalyzer';
import { TextScramble } from '../hooks/useTextScramble';

/**
 * Page d'upload avec drag & drop et intégration ArtworkAnalyzer
 * Design glassmorphism avec animations premium
 */
export default function UploadPage() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [artworkId, setArtworkId] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleFile = (file) => {
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target.result);
      // Simuler la création d'une œuvre et récupération de l'ID
      simulateUpload();
    };
    reader.readAsDataURL(file);
  };

  const simulateUpload = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setArtworkId(`artwork_${Date.now()}`);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleFileInput = (e) => {
    if (e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const resetUpload = () => {
    setUploadedImage(null);
    setArtworkId(null);
    setUploadProgress(0);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* Background orbes flottantes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <FloatingOrb color="cyan" size={400} x="10%" y="20%" />
        <FloatingOrb color="magenta" size={300} x="70%" y="60%" />
        <FloatingOrb color="purple" size={250} x="80%" y="10%" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-4">
            <TextScramble delay={200} duration={1500}>
              Analysez votre œuvre
            </TextScramble>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Téléchargez votre création et laissez notre IA révéler son potentiel :
            palette de couleurs, style, estimation de prix et description optimisée.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!uploadedImage ? (
            /* Zone d'upload */
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-3xl mx-auto"
            >
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative rounded-3xl border-2 border-dashed cursor-pointer
                  transition-all duration-300 overflow-hidden
                  ${isDragging 
                    ? 'border-cyan-500 bg-cyan-500/10 scale-[1.02]' 
                    : 'border-white/20 bg-white/[0.03] hover:border-white/40 hover:bg-white/[0.05]'
                  }
                `}
              >
                {/* Effet de vague au drag */}
                <AnimatePresence>
                  {isDragging && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 2, opacity: 0.3 }}
                      exit={{ scale: 3, opacity: 0 }}
                      transition={{ duration: 0.8 }}
                      className="absolute inset-0 bg-cyan-500/30 rounded-full"
                      style={{ transformOrigin: 'center' }}
                    />
                  )}
                </AnimatePresence>

                <div className="relative py-20 px-8 text-center">
                  <motion.div
                    animate={{
                      y: isDragging ? -10 : 0,
                      scale: isDragging ? 1.1 : 1,
                    }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-magenta-500/20 flex items-center justify-center"
                  >
                    <Upload className="w-10 h-10 text-cyan-400" />
                  </motion.div>

                  <h3 className="text-2xl font-semibold mb-2">
                    {isDragging ? 'Déposez votre image' : 'Glissez-déposez votre œuvre'}
                  </h3>
                  <p className="text-white/50 mb-6">
                    ou cliquez pour parcourir • JPG, PNG, WebP jusqu'à 10MB
                  </p>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-cyan-500/20 text-cyan-400 rounded-full border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors"
                  >
                    Sélectionner un fichier
                  </motion.button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </div>
            </motion.div>
          ) : !artworkId ? (
            /* Upload en cours */
            <UploadProgress 
              image={uploadedImage} 
              progress={uploadProgress} 
              onCancel={resetUpload}
            />
          ) : (
            /* Analyse de l'œuvre */
            <motion.div
              key="analyzer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-6xl mx-auto"
            >
              <div className="grid lg:grid-cols-5 gap-8">
                {/* Preview de l'image */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="lg:col-span-2"
                >
                  <div className="sticky top-8">
                    <div className="relative rounded-3xl overflow-hidden bg-white/[0.03] border border-white/[0.08]">
                      <img
                        src={uploadedImage}
                        alt="Œuvre uploadée"
                        className="w-full aspect-[4/3] object-cover"
                      />
                      <button
                        onClick={resetUpload}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/80 hover:bg-black/70 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Analyse */}
                <div className="lg:col-span-3">
                  <ArtworkAnalyzer
                    artworkId={artworkId}
                    onAnalysisComplete={() => console.log('Analyse terminée !')}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * Orbe flottante en background
 */
function FloatingOrb({ color, size, x, y }) {
  const colorMap = {
    cyan: 'from-cyan-500/20 to-cyan-600/10',
    magenta: 'from-magenta-500/20 to-pink-600/10',
    purple: 'from-purple-500/20 to-indigo-600/10',
  };

  return (
    <motion.div
      className={`absolute rounded-full bg-gradient-to-br ${colorMap[color]} blur-3xl`}
      style={{
        width: size,
        height: size,
        left: x,
        top: y,
      }}
      animate={{
        x: [0, 30, 0, -30, 0],
        y: [0, -30, 20, 0, 0],
        scale: [1, 1.1, 0.9, 1],
      }}
      transition={{
        duration: 15,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

/**
 * Composant de progression d'upload
 */
function UploadProgress({ image, progress, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto"
    >
      <div className="rounded-3xl bg-white/[0.03] border border-white/[0.08] p-8 backdrop-blur-sm">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white/5">
            <img src={image} alt="Upload" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2">Téléchargement en cours...</h3>
            <p className="text-white/50">Analyse automatique dans quelques instants</p>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="relative h-2 bg-white/10 rounded-full overflow-hidden mb-4">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-magenta-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 100 }}
          />
          {/* Effet shimmer */}
          <motion.div
            className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        <div className="flex justify-between items-center">
          <span className="text-white/60 text-sm">{progress}%</span>
          <button
            onClick={onCancel}
            className="text-white/40 hover:text-white/60 text-sm transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </motion.div>
  );
}
