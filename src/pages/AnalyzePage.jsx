import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, X, Sparkles, ArrowRight, RefreshCw, ChevronLeft, Lock
} from 'lucide-react';
import { ArtworkAnalyzer } from '../components/ArtworkAnalyzer';

/**
 * Outil d'analyse AI pour artistes - Mobile-first
 * Cette page nécessite une authentification (à implémenter)
 */
export default function AnalyzePage() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [artworkId, setArtworkId] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('upload');
  const [isAuthenticated] = useState(false); // TODO: Connect to auth
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
    if (files.length > 0) handleFile(files[0]);
  }, []);

  const handleFile = (file) => {
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target.result);
      setCurrentStep('processing');
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
          setCurrentStep('analyzing');
          return 100;
        }
        return prev + 8;
      });
    }, 120);
  };

  const handleFileInput = (e) => {
    if (e.target.files.length > 0) handleFile(e.target.files[0]);
  };

  const resetUpload = () => {
    setUploadedImage(null);
    setArtworkId(null);
    setUploadProgress(0);
    setCurrentStep('upload');
  };

  // Si non authentifié, montrer une page de preview
  if (!isAuthenticated) {
    return <AnalyzePreview onTry={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white pt-16 md:pt-20 pb-24 md:pb-8">
      <StepIndicator currentStep={currentStep} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 md:py-8">
        <AnimatePresence mode="wait">
          {currentStep === 'upload' && (
            <UploadZone 
              key="upload"
              isDragging={isDragging}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              fileInputRef={fileInputRef}
              onFileInput={handleFileInput}
            />
          )}
          
          {currentStep === 'processing' && (
            <ProcessingView 
              key="processing"
              image={uploadedImage} 
              progress={uploadProgress}
              onCancel={resetUpload}
            />
          )}
          
          {(currentStep === 'analyzing') && (
            <AnalysisResults 
              key="results"
              image={uploadedImage}
              artworkId={artworkId}
              onReset={resetUpload}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * Preview pour utilisateurs non connectés
 */
function AnalyzePreview({ onTry }) {
  const features = [
    { title: 'Analyse Style', desc: 'Détection du mouvement artistique' },
    { title: 'Palette', desc: '5 couleurs dominantes' },
    { title: 'Estimation', desc: 'Fourchette de prix' },
    { title: 'SEO', desc: 'Descriptions optimisées' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white pt-20 md:pt-24 pb-24">
      <div className="max-w-lg mx-auto px-4 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-purple-500/30 flex items-center justify-center">
          <Lock size={32} className="text-cyan-400" />
        </div>

        <h1 className="text-2xl md:text-3xl font-bold mb-3">Outil Analyse AI</h1>
        <p className="text-white/50 mb-8">
          Débloquez l'analyse intelligente de vos œuvres avec notre IA. 
          Créez un compte artiste pour y accéder.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-8">
          {features.map((f, i) => (
            <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-left">
              <h4 className="font-medium text-white text-sm mb-1">{f.title}</h4>
              <p className="text-white/40 text-xs">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <button className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold">
            Créer un compte artiste
          </button>
          <button className="w-full py-3.5 rounded-xl bg-white/5 text-white/70 font-medium">
            J'ai déjà un compte
          </button>
        </div>

        <p className="mt-6 text-xs text-white/30">
          Déjà 12,000 artistes utilisent notre outil d'analyse
        </p>
      </div>
    </div>
  );
}

/**
 * Indicateur d'étape
 */
function StepIndicator({ currentStep }) {
  const steps = ['upload', 'processing', 'analyzing'];
  const currentIndex = steps.indexOf(currentStep);
  
  const labels = {
    upload: 'Upload',
    processing: 'Traitement',
    analyzing: 'Analyse',
  };

  return (
    <div className="fixed top-16 md:top-20 left-0 right-0 z-30 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-md mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-1">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center">
              <motion.div
                animate={{
                  backgroundColor: index <= currentIndex ? '#06b6d4' : 'rgba(255,255,255,0.1)',
                  scale: index === currentIndex ? 1.2 : 1,
                }}
                className="w-2 h-2 rounded-full"
              />
              
              {index < steps.length - 1 && (
                <div className="w-12 md:w-16 h-0.5 mx-1 bg-white/10">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: index < currentIndex ? 1 : 0 }}
                    className="h-full bg-cyan-500 origin-left"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <span className="text-xs text-white/50">{labels[currentStep]}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Zone d'upload
 */
function UploadZone({ isDragging, onDragOver, onDragLeave, onDrop, onClick, fileInputRef, onFileInput }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-[50vh] flex items-center justify-center pt-16"
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-2">Analyser une œuvre</h2>
          <p className="text-white/50 text-sm">Notre IA va déterminer le style, les couleurs et estimer la valeur</p>
        </div>

        <motion.div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={onClick}
          whileTap={{ scale: 0.98 }}
          className={`
            relative rounded-2xl border-2 border-dashed cursor-pointer
            transition-all duration-300 overflow-hidden
            ${isDragging 
              ? 'border-cyan-500 bg-cyan-500/10' 
              : 'border-white/20 bg-white/[0.02]'
            }
          `}
        >
          <div className="py-12 md:py-16 px-6 text-center">
            <motion.div
              animate={{ y: isDragging ? -10 : 0, scale: isDragging ? 1.1 : 1 }}
              className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border border-white/10 flex items-center justify-center"
            >
              <Upload className="w-8 h-8 text-cyan-400" />
            </motion.div>

            <p className="font-medium mb-1">{isDragging ? 'Déposez ici' : 'Touchez pour uploader'}</p>
            <p className="text-white/40 text-sm mb-4">JPG, PNG • Max 10MB</p>

            <span className="inline-block px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 text-sm">
              Sélectionner
            </span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onFileInput}
            className="hidden"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

/**
 * Vue de traitement
 */
function ProcessingView({ image, progress, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[50vh] flex items-center justify-center pt-16"
    >
      <div className="w-full max-w-sm">
        <div className="rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden">
          <div className="relative aspect-video">
            <img src={image} alt="Upload" className="w-full h-full object-cover opacity-50" />
            <motion.div
              animate={{ top: ['0%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_rgba(34,211,238,0.8)]"
            />
          </div>
          
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Traitement...</span>
              <span className="text-lg font-bold text-cyan-400">{progress}%</span>
            </div>
            
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
            
            <button onClick={onCancel} className="mt-3 text-white/40 hover:text-white/60 text-sm">
              Annuler
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Résultats d'analyse
 */
function AnalysisResults({ image, artworkId, onReset }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-14 md:pt-16"
    >
      <div className="flex items-center justify-between mb-4">
        <button onClick={onReset} className="flex items-center gap-1 text-white/50 hover:text-white text-sm">
          <ChevronLeft size={18} />
          Nouvelle analyse
        </button>

        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 text-sm">
          <Sparkles size={14} />
          Publier
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-5"
        >
          <div className="lg:sticky lg:top-24">
            <div className="rounded-xl overflow-hidden bg-white/[0.02] border border-white/10">
              <img src={image} alt="Œuvre" className="w-full aspect-[4/3] object-cover" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-7"
        >
          <ArtworkAnalyzer artworkId={artworkId} imageBase64={image} />
        </motion.div>
      </div>
    </motion.div>
  );
}
