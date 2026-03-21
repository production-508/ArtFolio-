import { motion } from 'framer-motion';
import { ShoppingBag, Check } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

/**
 * AddToCartButton — Bouton "Ajouter au panier"
 * Style institutionnel épuré
 */
export default function AddToCartButton({ 
  artwork, 
  variant = 'default',
  className = '',
  onAdded
}) {
  const { addItem, isInCart, removeItem } = useCart();
  const inCart = isInCart(artwork.id);

  const handleClick = () => {
    if (inCart) {
      removeItem(artwork.id);
    } else {
      addItem(artwork);
      if (onAdded) onAdded();
    }
  };

  // Variante compacte (pour les grilles)
  if (variant === 'compact') {
    return (
      <button
        onClick={handleClick}
        disabled={!artwork.available}
        className={`
          inline-flex items-center justify-center gap-2 px-4 py-2 
          border transition-all duration-300
          ${inCart 
            ? 'border-white/30 bg-white/10 text-white/80' 
            : 'border-white/20 bg-transparent text-white/60 hover:border-white/40 hover:text-white/80'
          }
          ${!artwork.available ? 'opacity-40 cursor-not-allowed' : ''}
          ${className}
        `}
        style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', letterSpacing: '0.05em' }}
      >
        {inCart ? (
          <>
            <Check className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Ajouté</span>
          </>
        ) : (
          <>
            <ShoppingBag className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>{artwork.available ? 'Ajouter' : 'Indisponible'}</span>
          </>
        )}
      </button>
    );
  }

  // Variante par défaut
  return (
    <motion.button
      onClick={handleClick}
      disabled={!artwork.available}
      whileHover={artwork.available ? { scale: 1.02 } : {}}
      whileTap={artwork.available ? { scale: 0.98 } : {}}
      className={`
        inline-flex items-center justify-center gap-3 px-6 py-3
        border transition-all duration-300
        ${inCart 
          ? 'border-white/30 bg-white/10 text-white' 
          : 'border-white/20 bg-transparent text-white/80 hover:border-white hover:text-white'
        }
        ${!artwork.available ? 'opacity-40 cursor-not-allowed' : ''}
        ${className}
      `}
      style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8125rem', letterSpacing: '0.05em' }}
    >
      {inCart ? (
        <>
          <Check className="w-4 h-4" strokeWidth={1.5} />
          <span>Dans le panier</span>
        </>
      ) : (
        <>
          <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
          <span>{artwork.available ? 'Ajouter au panier' : 'Œuvre indisponible'}</span>
        </>
      )}
    </motion.button>
  );
}
