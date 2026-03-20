import { motion } from 'framer-motion';
import { 
  Palette, 
  Image as ImageIcon, 
  Layers, 
  Box,
  Sparkles,
  Brush,
  Frame
} from 'lucide-react';

/**
 * @typedef {Object} StyleCardProps
 * @property {string} style - Nom du style détecté
 * @property {number} [index] - Index pour l'animation stagger
 * @property {string} [accentColor] - Couleur d'accentuation
 */

// Mapping des styles vers icônes
const styleIcons = {
  'Impressionnisme': Palette,
  'Impressionniste': Palette,
  'Réalisme': ImageIcon,
  'Realism': ImageIcon,
  'Abstract': Layers,
  'Abstrait': Layers,
  'Contemporain': Box,
  'Contemporary': Box,
  'Surrealism': Sparkles,
  'Surréalisme': Sparkles,
  'Expressionnisme': Brush,
  'Expressionism': Brush,
  'Pop Art': Frame,
  'Minimalisme': Box,
  'Minimalism': Box,
};

// Mapping des styles vers couleurs d'accent
const styleColors = {
  'Impressionnisme': '#FF9F1C',
  'Impressionniste': '#FF9F1C',
  'Réalisme': '#2EC4B6',
  'Realism': '#2EC4B6',
  'Abstract': '#E71D36',
  'Abstrait': '#E71D36',
  'Contemporain': '#9B5DE5',
  'Contemporary': '#9B5DE5',
  'Surrealism': '#F15BB5',
  'Surréalisme': '#F15BB5',
  'Expressionnisme': '#00BBF9',
  'Expressionism': '#00BBF9',
  'Pop Art': '#FEE440',
  'Minimalisme': '#FFFFFF',
  'Minimalism': '#FFFFFF',
};

/**
 * Carte visuelle affichant le style détecté avec icône et animation
 * @param {StyleCardProps} props
 */
export function StyleCard({ style, index = 0, accentColor }) {
  const IconComponent = styleIcons[style] || Palette;
  const color = accentColor || styleColors[style] || '#2EC4B6';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{ 
        scale: 1.02, 
        rotateY: 2,
        transition: { duration: 0.3 }
      }}
      className="relative group"
      style={{ perspective: '1000px' }}
    >
      {/* Card principale avec glassmorphism */}
      <div
        className="
          relative p-6 rounded-3xl overflow-hidden
          bg-white/[0.03] backdrop-blur-xl
          border border-white/[0.08]
          transition-all duration-500
          group-hover:bg-white/[0.05]
          group-hover:border-white/[0.15]
          group-hover:shadow-2xl
        "
        style={{
          boxShadow: `0 8px 32px ${color}10, inset 0 1px 0 rgba(255,255,255,0.05)`,
        }}
      >
        {/* Gradient orb en arrière-plan */}
        <motion.div
          className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-30"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ backgroundColor: color }}
        />

        {/* Contenu */}
        <div className="relative z-10">
          {/* Label */}
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="text-xs font-medium uppercase tracking-[0.2em] text-white/50 mb-4 block"
          >
            Style Détecté
          </motion.span>

          {/* Icône et nom */}
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: 0.3 + index * 0.1,
                type: 'spring',
                stiffness: 200,
                damping: 15,
              }}
              className="relative"
            >
              {/* Cercle glow */}
              <div
                className="absolute inset-0 rounded-2xl blur-lg opacity-50"
                style={{ backgroundColor: color }}
              />
              
              {/* Conteneur icône */}
              <div
                className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${color}30, ${color}10)`,
                  border: `1px solid ${color}40`,
                }}
              >
                <IconComponent size={28} style={{ color }} />
              </div>
            </motion.div>

            <div>
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="text-2xl font-bold text-white"
              >
                {style}
              </motion.h3>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="text-sm text-white/50 mt-1"
              >
                Analyse par IA
              </motion.p>
            </div>
          </div>
        </div>

        {/* Ligne décorative en bas */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.6 + index * 0.1, duration: 0.8 }}
          className="absolute bottom-0 left-0 right-0 h-[2px] origin-left"
          style={{
            background: `linear-gradient(90deg, ${color}, transparent)`,
          }}
        />
      </div>
    </motion.div>
  );
}
