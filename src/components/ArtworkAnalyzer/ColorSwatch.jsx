import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy } from 'lucide-react';

/**
 * @typedef {Object} ColorSwatchProps
 * @property {string} color - Code hexadécimal de la couleur
 * @property {number} index - Index pour l'animation stagger
 * @property {boolean} isDominant - Si c'est la couleur dominante
 */

/**
 * Composant swatch de couleur interactif avec copie au clic
 * @param {ColorSwatchProps} props
 */
export function ColorSwatch({ color, index = 0, isDominant = false }) {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  /**
   * Copie la couleur dans le presse-papiers
   */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(color);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Silently fail - no console.log in production
    }
  };

  // Calculer la luminosité pour décider de la couleur du texte
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const textColor = luminance > 0.5 ? '#0a0a0f' : '#ffffff';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.4,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="relative group"
    >
      <motion.button
        onClick={handleCopy}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className={`
          relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl 
          flex flex-col items-center justify-center
          transition-shadow duration-300 cursor-pointer
          ${isDominant ? 'ring-2 ring-white/30 ring-offset-2 ring-offset-[#0a0a0f]' : ''}
        `}
        style={{
          backgroundColor: color,
          boxShadow: isHovered
            ? `0 0 30px ${color}60, 0 8px 32px rgba(0,0,0,0.3)`
            : `0 4px 20px ${color}30, 0 2px 8px rgba(0,0,0,0.2)`,
        }}
        aria-label={`Copier la couleur ${color}`}
      >
        {/* Badge "Dominante" */}
        {isDominant && (
          <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] font-semibold uppercase tracking-wider bg-white/90 text-black px-2 py-0.5 rounded-full">
            Main
          </span>
        )}

        {/* Icône de copie */}
        <motion.div
          initial={false}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 5 }}
          transition={{ duration: 0.2 }}
          className="mb-1"
        >
          {copied ? (
            <Check size={16} style={{ color: textColor }} />
          ) : (
            <Copy size={14} style={{ color: textColor, opacity: 0.8 }} />
          )}
        </motion.div>

        {/* Code hex */}
        <span
          className="text-[10px] sm:text-xs font-mono font-medium tracking-wider uppercase"
          style={{ color: textColor }}
        >
          {copied ? 'Copié!' : color}
        </span>
      </motion.button>

      {/* Glow effect derrière */}
      <motion.div
        className="absolute inset-0 rounded-2xl -z-10 blur-xl"
        animate={{
          opacity: isHovered ? 0.6 : 0.2,
          scale: isHovered ? 1.2 : 1,
        }}
        transition={{ duration: 0.3 }}
        style={{ backgroundColor: color }}
      />
    </motion.div>
  );
}
