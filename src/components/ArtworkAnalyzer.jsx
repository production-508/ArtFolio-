import { motion } from 'framer-motion';
import { 
  Palette, Tag, DollarSign, FileText, Sparkles, 
  TrendingUp, Image as ImageIcon, Grid3X3 
} from 'lucide-react';

/**
 * ArtworkAnalyzer - Affiche les résultats d'analyse AI
 * Supporte à la fois l'analyse locale et OpenAI Vision
 */
export function ArtworkAnalyzer({ analysis }) {
  if (!analysis) return null;

  const {
    estimatedStyle,
    mood,
    palette,
    aiColors,
    suggestedTags,
    priceRange,
    aiDescription,
    seo,
    analysis: analysisMeta
  } = analysis;

  return (
    <div className="space-y-4">
      {/* Header avec style détecté */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-cyan-400" />
          </div>          <div>
            <p className="text-xs text-white/50 uppercase tracking-wider">Style détecté</p>
            <p className="text-lg font-semibold capitalize">{estimatedStyle}</p>
            {mood && <p className="text-xs text-white/40">Ambiance: {mood}</p>}
          </div>
        </div>
      </motion.div>

      {/* Palette de couleurs */}
      {palette && palette.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-xl bg-white/[0.02] border border-white/5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Palette className="w-4 h-4 text-white/50" />
            <span className="text-sm font-medium">Palette dominante</span>
          </div>
          
          <div className="flex gap-2">
            {palette.map((color, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="group relative"
              >
                <div
                  className="w-12 h-12 rounded-lg shadow-lg cursor-pointer transition-transform hover:scale-110"
                  style={{ backgroundColor: color.hex }}
                />
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-white/70 whitespace-nowrap">
                  {color.hex}
                </div>
              </motion.div>
            ))}
          </div>
          
          {aiColors && aiColors.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/5">
              <p className="text-xs text-white/40 mb-2">Couleurs identifiées par l'IA</p>
              <div className="flex flex-wrap gap-1">
                {aiColors.map((color, i) => (
                  <span key={i} className="px-2 py-1 rounded bg-white/5 text-xs text-white/60">
                    {color}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Tags suggérés */}
      {suggestedTags && suggestedTags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-xl bg-white/[0.02] border border-white/5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-white/50" />
            <span className="text-sm font-medium">Tags suggérés</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {suggestedTags.map((tag, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.03 }}
                className="px-3 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 text-sm border border-cyan-500/20"
              >
                {tag}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Estimation prix */}
      {priceRange && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-xl bg-white/[0.02] border border-white/5"
        >
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-white/50" />
            <span className="text-sm font-medium">Estimation de prix</span>
          </div>
          
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-cyan-400">
              {priceRange.min.toLocaleString()} {priceRange.currency}
            </span>
            <span className="text-white/40">-</span>
            <span className="text-2xl font-bold text-cyan-400">
              {priceRange.max.toLocaleString()} {priceRange.currency}
            </span>
          </div>
          
          <p className="mt-2 text-xs text-white/40">
            Basé sur le style, les dimensions et les tendances du marché
          </p>
        </motion.div>
      )}

      {/* Description AI */}
      {aiDescription && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4 rounded-xl bg-white/[0.02] border border-white/5"
        >
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-white/50" />
            <span className="text-sm font-medium">Description générée</span>
            <span className="ml-auto px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 text-xs">AI</span>
          </div>
          
          <p className="text-white/70 text-sm leading-relaxed">{aiDescription}</p>
        </motion.div>
      )}

      {/* SEO */}
      {seo && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-4 rounded-xl bg-white/[0.02] border border-white/5"
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-white/50" />
            <span className="text-sm font-medium">Optimisation SEO</span>
          </div>
          
          {seo.title && (
            <div className="mb-3">
              <p className="text-xs text-white/40 mb-1">Titre SEO</p>
              <p className="text-sm text-white/70">{seo.title}</p>
            </div>
          )}
          
          {seo.description && (
            <div className="mb-3">
              <p className="text-xs text-white/40 mb-1">Description SEO</p>
              <p className="text-sm text-white/70">{seo.description}</p>
            </div>
          )}
          
          {seo.keywords && (
            <div>
              <p className="text-xs text-white/40 mb-1">Mots-clés</p>
              <p className="text-sm text-white/50">{seo.keywords}</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Métadonnées techniques */}
      {analysisMeta && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-4 rounded-xl bg-white/[0.02] border border-white/5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Grid3X3 className="w-4 h-4 text-white/50" />
            <span className="text-sm font-medium">Détails techniques</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-white/40">Format</p>
              <p className="text-white/70">
                {analysisMeta.isHorizontal ? 'Paysage' : analysisMeta.isLargeFormat ? 'Portrait' : 'Carré'}
              </p>
            </div>
            
            <div>
              <p className="text-xs text-white/40">Grand format</p>
              <p className="text-white/70">{analysisMeta.isLargeFormat ? 'Oui' : 'Non'}</p>
            </div>
            
            <div>
              <p className="text-xs text-white/40">Ratio</p>
              <p className="text-white/70">{analysis?.dimensions?.aspectRatio}</p>
            </div>
            
            <div>
              <p className="text-xs text-white/40">Analyse</p>
              <p className="text-white/70">{analysisMeta.aiGenerated ? 'OpenAI Vision' : 'Locale'}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default ArtworkAnalyzer;
