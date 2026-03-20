import { motion } from 'framer-motion';

/**
 * @typedef {Object} ConfidenceBarProps
 * @property {number} value - Valeur de confiance entre 0 et 1
 * @property {string[]} [palette] - Palette de couleurs pour le dégradé
 * @property {string} [label] - Label à afficher
 * @property {number} [index] - Index pour l'animation stagger
 */

/**
 * Barre de confiance animée avec dégradé adaptatif
 * @param {ConfidenceBarProps} props
 */
export function ConfidenceBar({
  value,
  palette = ['#2EC4B6', '#E71D36'],
  label = 'Confiance',
  index = 0,
}) {
  const percentage = Math.round(value * 100);

  // Créer un dégradé à partir de la palette
  const gradientColors = palette.slice(0, 2);
  const gradient = `linear-gradient(90deg, ${gradientColors[0] || '#2EC4B6'}, ${
    gradientColors[1] || '#E71D36'
  })`;

  // Déterminer la couleur du texte de valeur
  const getConfidenceColor = (val) => {
    if (val >= 0.8) return '#4ade80'; // vert
    if (val >= 0.6) return '#fbbf24'; // jaune
    return '#f87171'; // rouge
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="w-full"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium text-white/70">{label}</span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 + index * 0.1 }}
          className="text-lg font-bold tabular-nums"
          style={{ color: getConfidenceColor(value) }}
        >
          {percentage}%
        </motion.span>
      </div>

      {/* Barre de progression */}
      <div className="relative h-3 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
        {/* Fond animé avec shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />

        {/* Barre de remplissage */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: 1.2,
            delay: 0.3 + index * 0.1,
            ease: [0.34, 1.56, 0.64, 1], // Spring-like easing
          }}
          className="h-full rounded-full relative"
          style={{ background: gradient }}
        >
          {/* Glow sur la barre */}
          <div
            className="absolute inset-0 rounded-full blur-sm"
            style={{
              background: gradient,
              opacity: 0.5,
            }}
          />

          {/* Point de fin animé */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.2 + index * 0.1, duration: 0.3 }}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg"
            style={{ boxShadow: `0 0 20px ${gradientColors[0] || '#2EC4B6'}` }}
          />
        </motion.div>
      </div>

      {/* Labels min/max */}
      <div className="flex justify-between mt-2 text-xs text-white/40">
        <span>0%</span>
        <span>100%</span>
      </div>
    </motion.div>
  );
}
