import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, X, Image as ImageIcon, Sparkles, ArrowRight, 
  RefreshCw, Download, Share2, ChevronLeft, Wand2, Check
} from 'lucide-react';
import { ArtworkAnalyzer } from '../components/ArtworkAnalyzer';

/**
 * Page d'upload mobile-first avec expérience tactile optimale
 */
export default function UploadPage() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [artworkId, setArtworkId] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('upload');
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

  const handleAnalysisComplete = () => {
    setCurrentStep('results');
  };

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
          
          {(currentStep === 'analyzing' || currentStep === 'results') && (
            <AnalysisResults 
              key="results"
              image={uploadedImage}
              artworkId={artworkId}
              onReset={resetUpload}
              onAnalysisComplete={handleAnalysisComplete}
              isAnalyzing={currentStep === 'analyzing'}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * Indicateur d'étape compact pour mobile
 */
function StepIndicator({ currentStep }) {
  const steps = ['upload', 'processing', 'analyzing', 'results'];
  const currentIndex = steps.indexOf(currentStep);
  
  const labels = {
    upload: 'Upload',
    processing: 'Traitement',
    analyzing: 'Analyse',
    results: 'Résultats'
  };

  return (
    <div className="fixed top-16 md:top-20 left-0 right-0 z-30 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-md mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-2">
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
                <div className="w-8 md:w-12 h-0.5 mx-1 bg-white/10">
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
 * Zone d'upload optimisée tactile
 */
function UploadZone({ isDragging, onDragOver, onDragLeave, onDrop, onClick, fileInputRef, onFileInput }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-[60vh] md:min-h-[70vh] flex items-center justify-center pt-16"
    >
      <div className="w-full max-w-lg">
        <div className="text-center mb-8 md:mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3"
          >
            <span className="text-white">Uploadez votre</span>{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              œuvre
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/50 text-sm md:text-base px-4"
>
            L'IA analysera style, couleurs et valeur en quelques secondes
          </motion.p>
        </div>

        <motion.div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={onClick}
          whileTap={{ scale: 0.98 }}
          className={`
            relative rounded-2xl md:rounded-[2rem] border-2 border-dashed cursor-pointer
            transition-all duration-300 overflow-hidden active:scale-[0.98]
            ${isDragging 
              ? 'border-cyan-500 bg-cyan-500/10' 
              : 'border-white/20 bg-white/[0.02] active:border-white/40'
            }
          `}
        >
          <AnimatePresence>
            {isDragging && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 2, opacity: 0.15 }}
                exit={{ scale: 3, opacity: 0 }}
                className="absolute inset-0 bg-cyan-500 rounded-full"
              />
            )}
          </AnimatePresence>

          <div className="relative py-16 md:py-20 px-6 text-center">
            <motion.div
              animate={{ y: isDragging ? -10 : 0, scale: isDragging ? 1.1 : 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="relative w-24 h-24 md:w-28 md:h-28 mx-auto mb-6"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-purple-500/30 blur-xl" />
              <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border border-white/20 flex items-center justify-center">
                <Upload className="w-10 h-10 md:w-12 md:h-12 text-cyan-400" />
              </div>
            </motion.div>

            <h3 className="text-lg md:text-xl font-semibold mb-2">
              {isDragging ? 'Déposez ici' : 'Touchez pour uploader'}
            </h3>
            <p className="text-white/40 text-sm mb-6">
              JPG, PNG, WebP • Max 10MB
            </p>

            <motion.button
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-sm font-medium"
            >
              Sélectionner une image
            </motion.button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onFileInput}
            className="hidden"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-3 mt-6"
        >
          {['JPG', 'PNG', 'WebP'].map(format => (
            <span key={format} className="px-3 py-1 rounded-full bg-white/5 text-xs text-white/40">
              {format}
            </span>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

/**
 * Vue de traitement avec animation
 */
function ProcessingView({ image, progress, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="min-h-[60vh] flex items-center justify-center pt-16"
    >
      <div className="w-full max-w-md px-4">
        <div className="rounded-2xl md:rounded-3xl bg-white/[0.02] border border-white/10 overflow-hidden">
          <div className="relative aspect-video overflow-hidden">
            <img src={image} alt="Upload" className="w-full h-full object-cover opacity-50" />
            
            <motion.div
              animate={{ top: ['0%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_30px_rgba(34,211,238,0.8)]"
            />
            
            <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.05)_1px,transparent_1px)] bg-[size:30px_30px]" />
          </div>
          
          <div className="p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                >
                  <RefreshCw size={18} className="text-cyan-400" />
                </motion.div>
                <span className="text-sm font-medium">Traitement...</span>
              </div>
              
              <span className="text-xl font-bold text-cyan-400">{progress}%</span>
            </div>
            
            <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
              
              <motion.div
                className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ['-100%', '300%'] }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            </div>
            
            <button
              onClick={onCancel}
              className="mt-4 text-white/40 hover:text-white/60 text-sm transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Résultats d'analyse - layout vertical sur mobile
 */
function AnalysisResults({ image, artworkId, onReset, onAnalysisComplete, isAnalyzing }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-14 md:pt-16"
    >
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onReset}
          className="flex items-center gap-1 text-white/50 hover:text-white text-sm"
        >
          <ChevronLeft size={18} />
          Nouveau
        </motion.button>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
            <Share2 size={18} />
          </button>
          <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
            <Download size={18} />
          </button>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-12 gap-4 md:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-5"
        >
          <div className="lg:sticky lg:top-24 space-y-3">
            <div className="relative rounded-xl md:rounded-2xl overflow-hidden bg-white/[0.02] border border-white/10">
              <img
                src={image}
                alt="Œuvre"
                className="w-full aspect-[4/3] object-cover"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 md:gap-3">
              {[
                { icon: Download, label: 'Télécharger' },
                { icon: Share2, label: 'Partager' },
                { icon: Wand2, label: 'Relancer' },
              ].map((action, index) => (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex flex-col items-center gap-1.5 p-2 md:p-3 rounded-xl bg-white/[0.02] border border-white/5"
                >
                  <action.icon size={18} className="text-cyan-400" />
                  <span className="text-[10px] md:text-xs text-white/50">{action.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-7"
        >
          <ArtworkAnalyzer
            artworkId={artworkId}
            imageBase64={image}
            onAnalysisComplete={onAnalysisComplete}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
