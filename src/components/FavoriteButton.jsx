import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useFavorites } from '../contexts/FavoritesContext';

/**
 * Bouton cœur pour ajouter/retirer des favoris
 */
export default function FavoriteButton({ artwork, size = 24, className = '' }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(artwork.id);

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        toggleFavorite(artwork);
      }}
      className={`p-2 rounded-full transition-colors ${className} ${
        active 
          ? 'text-red-500 hover:text-red-400' 
          : 'text-white/60 hover:text-white'
      }`}
      aria-label={active ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      <AnimatePresence mode="wait">
        {active ? (
          <motion.div
            key="filled"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
          >
            <Heart size={size} fill="currentColor" />
          </motion.div>
        ) : (
          <motion.div
            key="outline"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
          >
            <Heart size={size} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
