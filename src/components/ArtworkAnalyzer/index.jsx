import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wand2,
  RefreshCw,
  AlertCircle,
  Upload,
  Tag,
  DollarSign,
  FileText,
  Sparkles,
  Check,
  X,
  Palette,
} from 'lucide-react';
import { ColorSwatch } from './ColorSwatch';
import { ConfidenceBar } from './ConfidenceBar';
import { StyleCard } from './StyleCard';

/**
 * @typedef {Object} PriceEstimate
 * @property {number} low - Estimation basse
 * @property {number} high - Estimation haute
 * @property {number} confidence - Niveau de confiance (0-1)
 */

/**
 * @typedef {Object} AnalysisData
 * @property {string[]} palette - Palette de couleurs (5 codes hex)
 * @property {string[]} tags - Tags de style
 * @property {string} style - Style détecté
 * @property {PriceEstimate} priceEstimate - Estimation de prix
 * @property {string} seoDescription - Description SEO
 * @property {number} confidence - Confiance globale (0-1)
 */

/**
 * @typedef {Object} ArtworkAnalyzerProps
 * @property {string} [artworkId] - ID de l'œuvre à analyser (optionnel si imageBase64 fourni)
 * @property {string} [imageBase64] - Image en base64 pour analyse directe
 * @property {string} [apiBaseUrl] - URL de base de l'API
 * @property {() => void} [onAnalysisComplete] - Callback quand l'analyse est terminée
 * @property {() => void} [onUploadRequest] - Callback pour demander un upload
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Composant principal d'analyse d'œuvre d'art avec design ultra-moderne
 * @param {ArtworkAnalyzerProps} props
 */
export function ArtworkAnalyzer({
  artworkId,
  imageBase64,
  apiBaseUrl = API_BASE_URL,
  onAnalysisComplete,
  onUploadRequest,
}) {
  const [status, setStatus] = useState('empty'); // 'empty' | 'loading' | 'success' | 'error'
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [isEditingSeo, setIsEditingSeo] = useState(false);
  const [seoText, setSeoText] = useState('');
  const [showToast, setShowToast] = useState(false);

  /**
   * Récupère une analyse existante
   */
  const fetchAnalysis = useCallback(async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/artworks/${artworkId}/analysis`);
      
      if (response.status === 404) {
        setStatus('empty');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de l\'analyse');
      }

      const data = await response.json();
      
      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
        setSeoText(data.analysis.seoDescription || '');
        setStatus('success');
        onAnalysisComplete?.();
      } else {
        setStatus('empty');
      }
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }, [artworkId, apiBaseUrl, onAnalysisComplete]);

  /**
   * Lance une nouvelle analyse
   */
  const startAnalysis = async () => {
    setStatus('loading');
    setError(null);

    try {
      // Si imageBase64 fourni, utiliser l'API Vision directe
      if (imageBase64) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${apiBaseUrl}/api/ai/analyze-artwork`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          body: JSON.stringify({ 
            imageBase64,
            artworkId 
          }),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.error || 'Erreur lors de l\'analyse de l\'œuvre');
        }

        const data = await response.json();
        
        // Adapter le format de réponse OpenAI au format interne
        const adaptedAnalysis = {
          palette: data.colorPalette || [],
          tags: data.tags || [],
          style: data.style || 'Non détecté',
          priceEstimate: {
            low: data.priceEstimate?.min || 0,
            high: data.priceEstimate?.max || 0,
            confidence: data.priceEstimate?.confidence === 'high' ? 0.9 : 
                       data.priceEstimate?.confidence === 'medium' ? 0.6 : 0.3,
          },
          seoDescription: data.description || '',
          confidence: data.priceEstimate?.confidence === 'high' ? 0.85 : 
                      data.priceEstimate?.confidence === 'medium' ? 0.6 : 0.4,
          ...data // Conserver tout le reste
        };

        setAnalysis(adaptedAnalysis);
        setSeoText(data.description || '');
        setStatus('success');
        onAnalysisComplete?.(adaptedAnalysis);
        return;
      }

      // Sinon, utiliser l'ancien flux avec artworkId
      if (!artworkId) {
        throw new Error('Aucune image ou ID d\'œuvre fourni');
      }

      const response = await fetch(`${apiBaseUrl}/api/artworks/${artworkId}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'analyse de l\'œuvre');
      }

      const data = await response.json();

      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
        setSeoText(data.analysis.seoDescription || '');
        setStatus('success');
        onAnalysisComplete?.();
      } else {
        throw new Error('Réponse invalide du serveur');
      }
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  /**
   * Sauvegarde la description SEO modifiée
   */
  const saveSeoDescription = async () => {
    setIsEditingSeo(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
    // TODO: Implémenter l'appel API pour sauvegarder
  };

  // Charger l'analyse existante au montage
  useEffect(() => {
    if (artworkId) {
      fetchAnalysis();
    }
  }, [artworkId, fetchAnalysis]);

  // Animation variants pour les enfants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  // États de rendu
  const renderEmpty = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      <motion.div
        animate={{
          y: [0, -10, 0],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="w-24 h-24 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center mb-6 border border-white/10"
      >
        <Sparkles size={40} className="text-cyan-400" />
      </motion.div>

      <h3 className="text-2xl font-bold text-white mb-3">
        Aucune analyse disponible
      </h3>
      <p className="text-white/60 max-w-md mb-8 leading-relaxed">
        L'IA peut analyser cette œuvre pour détecter le style, extraire la palette de couleurs, 
        et estimer sa valeur. Cela prend environ 3 à 5 secondes.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startAnalysis}
          className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl font-semibold text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-shadow"
        >
          <Wand2 size={20} />
          Lancer l'analyse IA
        </motion.button>

        {onUploadRequest && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onUploadRequest}
            className="flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-semibold text-white hover:bg-white/10 transition-colors"
          >
            <Upload size={20} />
            Uploader une nouvelle image
          </motion.button>
        )}
      </div>
    </motion.div>
  );

  const renderLoading = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20 px-6"
    >
      {/* Animation de scan */}
      <div className="relative w-32 h-32 mb-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-3xl border-2 border-dashed border-cyan-500/30"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-2 rounded-2xl border-2 border-dashed border-purple-500/30"
        />
        
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Wand2 size={32} className="text-cyan-400" />
        </motion.div>
      </div>

      <h3 className="text-xl font-semibold text-white mb-2">
        Analyse en cours...
      </h3>
      <p className="text-white/50">
        L'IA examine les couleurs, le style et les détails de l'œuvre
      </p>

      {/* Barre de progression animée */}
      <div className="w-64 h-1 bg-white/10 rounded-full mt-6 overflow-hidden">
        <motion.div
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="h-full w-1/3 bg-gradient-to-r from-transparent via-cyan-500 to-transparent rounded-full"
        />
      </div>
    </motion.div>
  );

  const renderError = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6"
      >
        <AlertCircle size={32} className="text-red-400" />
      </motion.div>

      <h3 className="text-xl font-semibold text-white mb-2">
        Erreur d'analyse
      </h3>
      <p className="text-white/60 max-w-sm mb-6">
        {error || "Une erreur s'est produite lors de l'analyse. Veuillez réessayer."}
      </p>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={startAnalysis}
        className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-medium text-white hover:bg-white/10 transition-colors"
      >
        <RefreshCw size={18} />
        Réessayer
      </motion.button>
    </motion.div>
  );

  const renderSuccess = () => {
    if (!analysis) return null;

    const { palette, tags, style, priceEstimate, confidence } = analysis;

    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="p-6 sm:p-8"
      >
        {/* Grid responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Colonne gauche : Palette + Style */}
          <div className="space-y-6">
            {/* Carte Palette */}
            <motion.div
              variants={itemVariants}
              className="p-6 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08]"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
                  <Palette size={20} className="text-pink-400" />
                </div>
                <h4 className="text-lg font-semibold text-white">Palette de couleurs</h4>
              </div>

              <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                {palette?.map((color, index) => (
                  <ColorSwatch
                    key={`${color}-${index}`}
                    color={color}
                    index={index}
                    isDominant={index === 0}
                  />
                ))}
              </div>
            </motion.div>

            {/* Carte Style */}
            <StyleCard style={style} index={0} accentColor={palette?.[0]} />
          </div>

          {/* Colonne droite : Tags + Prix + SEO */}
          <div className="space-y-6">
            {/* Carte Tags */}
            <motion.div
              variants={itemVariants}
              className="p-6 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08]"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-white/10">
                  <Tag size={20} className="text-cyan-400" />
                </div>
                <h4 className="text-lg font-semibold text-white">Tags IA</h4>
              </div>

              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {tags?.map((tag, index) => (
                    <motion.span
                      key={tag}
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{
                        delay: index * 0.08,
                        duration: 0.3,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                      whileHover={{ 
                        scale: 1.05,
                        boxShadow: `0 0 20px ${palette?.[0] || '#2EC4B6'}30`,
                      }}
                      className="px-4 py-2 rounded-xl text-sm font-medium bg-white/5 text-white/80 border border-white/10 cursor-default transition-colors hover:bg-white/10"
                      style={{
                        borderColor: index === 0 ? `${palette?.[0]}40` : undefined,
                      }}
                    >
                      {tag}
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Carte Estimation Prix */}
            <motion.div
              variants={itemVariants}
              className="p-6 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08]"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center border border-white/10">
                  <DollarSign size={20} className="text-green-400" />
                </div>
                <h4 className="text-lg font-semibold text-white">Estimation de prix</h4>
              </div>

              <div className="flex items-baseline gap-2 mb-4">
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-bold text-white"
                >
                  {priceEstimate?.low?.toLocaleString()}€
                </motion.span>
                <span className="text-white/40">à</span>
                <motion.span
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-3xl font-bold text-white"
                >
                  {priceEstimate?.high?.toLocaleString()}€
                </motion.span>
              </div>

              <ConfidenceBar
                value={priceEstimate?.confidence || 0}
                palette={palette?.slice(0, 2)}
                label="Confiance de l'estimation"
                index={0}
              />
            </motion.div>

            {/* Carte Description SEO */}
            <motion.div
              variants={itemVariants}
              className="p-6 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-white/10">
                    <FileText size={20} className="text-amber-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-white">Description SEO</h4>
                </div>

                <button
                  onClick={() => isEditingSeo ? saveSeoDescription() : setIsEditingSeo(true)}
                  className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
                >
                  {isEditingSeo ? 'Sauvegarder' : 'Modifier'}
                </button>
              </div>

              {isEditingSeo ? (
                <textarea
                  value={seoText}
                  onChange={(e) => setSeoText(e.target.value)}
                  className="w-full p-4 bg-black/30 border border-white/10 rounded-xl text-white/90 text-sm leading-relaxed focus:outline-none focus:border-cyan-500/50 resize-none min-h-[120px]"
                  placeholder="Description SEO générée par l'IA..."
                />
              ) : (
                <p className="text-white/70 text-sm leading-relaxed">
                  {seoText || analysis?.seoDescription}
                </p>
              )}
            </motion.div>

            {/* Barre de confiance globale */}
            <motion.div
              variants={itemVariants}
              className="p-4 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-white/5"
            >
              <ConfidenceBar
                value={confidence || 0}
                palette={palette?.slice(0, 2)}
                label="Confiance globale de l'analyse"
                index={1}
              />
            </motion.div>
          </div>
        </div>

        {/* Bouton réanalyser */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex justify-center mt-8"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={startAnalysis}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            <RefreshCw size={16} />
            Relancer l'analyse
          </motion.button>
        </motion.div>

        {/* Toast de confirmation */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 px-6 py-3 bg-green-500/90 text-white rounded-full shadow-lg z-50"
            >
              <Check size={18} />
              Description sauvegardée
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="w-full min-h-[400px] rounded-[2rem] bg-[#0a0a0f] border border-white/[0.06] overflow-hidden relative">
      {/* Background gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px] pointer-events-none" />

      {/* Contenu */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {status === 'empty' && renderEmpty()}
          {status === 'loading' && renderLoading()}
          {status === 'error' && renderError()}
          {status === 'success' && renderSuccess()}
        </AnimatePresence>
      </div>
    </div>
  );
}
