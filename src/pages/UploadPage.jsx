import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, X, Image as ImageIcon, Sparkles, ArrowRight, Check, 
  RefreshCw, Download, Share2, ChevronLeft, Wand2
} from 'lucide-react';
import { ArtworkAnalyzer } from '../components/ArtworkAnalyzer';

/**
 * Page d'upload révolutionnaire avec expérience immersive
 * Design full-screen, transitions fluides, étapes claires
 */
export default function UploadPage() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [artworkId, setArtworkId] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('upload'); // 'upload' | 'processing' | 'analyzing' | 'results'
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
        return prev + 5;
      });
    }, 100);
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
    setCurrentStep('upload');
  };

  const handleAnalysisComplete = () => {
    setCurrentStep('results');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white pt-24">
      {/* Progress indicator */}
      <StepIndicator currentStep={currentStep} />

      <div className="max-w-7xl mx-auto px-6 py-8">
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
 * Indicateur d'étape visuel
 */
function StepIndicator({ currentStep }) {
  const steps = [
    { id: 'upload', label: 'Upload' },
    { id: 'processing', label: 'Traitement' },
    { id: 'analyzing', label: 'Analyse' },
    { id: 'results', label: 'Résultats' },
  ];

  const currentIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="fixed top-24 left-0 right-0 z-30">
      <div className="max-w-md mx-auto px-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isActive = index <= currentIndex;
            const isCurrent = index === currentIndex;
            
            return (
              <div key={step.id} className="flex items-center">
                <motion.div
                  animate={{
                    backgroundColor: isActive ? '#06b6d4' : 'rgba(255,255,255,0.1)',
                    scale: isCurrent ? 1.1 : 1,
                  }}
                  className="w-3 h-3 rounded-full"
                />
                
                {index < steps.length - 1 && (
                  <div className="w-16 h-0.5 mx-2">
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: index < currentIndex ? 1 : 0 }}
                      className="h-full bg-cyan-500 origin-left"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Zone d'upload immersive
 */
function UploadZone({ isDragging, onDragOver, onDragLeave, onDrop, onClick, fileInputRef, onFileInput }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      className="min-h-[70vh] flex items-center justify-center"
    >
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            <span className="text-white">Uploadez votre</span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              œuvre d'art
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/50 text-lg"
          >
            Notre IA va analyser style, couleurs et valeur en quelques secondes
          </motion.p>
        </div>

        {/* Drop zone */}
        <motion.div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={onClick}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={`
            relative rounded-[2rem] border-2 border-dashed cursor-pointer
            transition-all duration-500 overflow-hidden group
            ${isDragging 
              ? 'border-cyan-500 bg-cyan-500/10' 
              : 'border-white/20 bg-white/[0.02] hover:border-white/40 hover:bg-white/[0.04]'
            }
          `}
        >
          {/* Animated background on drag */}
          <AnimatePresence>
            {isDragging && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 3, opacity: 0.2 }}
                exit={{ scale: 4, opacity: 0 }}
                className="absolute inset-0 bg-cyan-500 rounded-full"
              />
            )}
          </AnimatePresence>

          <div className="relative py-24 px-8 text-center">
            {/* Icon */}
            <motion.div
              animate={{
                y: isDragging ? -15 : 0,
                scale: isDragging ? 1.15 : 1,
              }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="relative w-32 h-32 mx-auto mb-8"
            >
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 blur-xl group-hover:blur-2xl transition-all" />
              <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border border-white/10 flex items-center justify-center">
                <Upload className="w-14 h-14 text-cyan-400" />
              </div>
              
              {/* Orbiting particles */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0"
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-400" />
              </motion.div>
            </motion.div>

            {/* Text */}
            <h3 className="text-2xl font-semibold mb-3">
              {isDragging ? 'Déposez pour analyser' : 'Glissez-déposez votre image'}
            </h3>
            <p className="text-white/40 mb-8">
              ou cliquez pour parcourir • JPG, PNG, WebP jusqu'à 10MB
            </p>

            {/* CTA Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold shadow-lg shadow-cyan-500/25"
            >
              <ImageIcon size={20} />
              Sélectionner un fichier
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

        {/* Supported formats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-6 mt-8 text-white/30 text-sm"
        >
          <span>Supporté :</span>
          {['JPG', 'PNG', 'WebP'].map(format => (
            <span key={format} className="px-3 py-1 rounded-full bg-white/5">{format}</span>
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
      className="min-h-[70vh] flex items-center justify-center"
    >
      <div className="w-full max-w-2xl">
        <div className="relative rounded-3xl bg-white/[0.02] border border-white/10 overflow-hidden">
          {/* Image preview */}
          <div className="relative aspect-video overflow-hidden">
            <img src={image} alt="Upload" className="w-full h-full object-cover opacity-50" />
            
            {/* Scanning overlay */}
            <motion.div
              animate={{ top: ['0%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_30px_rgba(34,211,238,0.8)]"
            />
            
            {/* Grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.1)_1px,transparent_1px)] bg-[size:50px_50px]" />
          </div>
          
          {/* Progress info */}
          <div className="p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <RefreshCw size={20} className="text-cyan-400" />
                </motion.div>
                <span className="font-medium">Traitement de l'image...</span>
              </div>
              
              <span className="text-2xl font-bold text-cyan-400">{progress}%</span>
            </div>
            
            {/* Progress bar */}
            <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: 'spring', stiffness: 100 }}
              />
              
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ['-100%', '400%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
            </div>
            
            <button
              onClick={onCancel}
              className="mt-6 text-white/40 hover:text-white/60 text-sm transition-colors"
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
 * Résultats d'analyse avec layout side-by-side
 */
function AnalysisResults({ image, artworkId, onReset, onAnalysisComplete, isAnalyzing }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[calc(100vh-12rem)]"
    >
      {/* Header avec actions */}
      <div className="flex items-center justify-between mb-8">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onReset}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
        >
          <ChevronLeft size={20} />
          Nouvelle analyse
        </motion.button>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm">
            <Share2 size={16} />
            Partager
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm">
            <Download size={16} />
            Exporter
          </button>
        </motion.div>
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left: Image */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-5"
        >
          <div className="sticky top-32">
            <div className="relative rounded-3xl overflow-hidden bg-white/[0.02] border border-white/10">
              <img
                src={image}
                alt="Œuvre analysée"
                className="w-full aspect-[4/3] object-cover"
              />
              
              {/* Image overlay with gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>

            {/* Quick actions */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { icon: Download, label: 'Télécharger' },
                { icon: Share2, label: 'Partager' },
                { icon: Wand2, label: 'Réanalyser' },
              ].map((action, index) => (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all"
                >
                  <action.icon size={20} className="text-cyan-400" />
                  <span className="text-xs text-white/50">{action.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right: Analysis */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
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
