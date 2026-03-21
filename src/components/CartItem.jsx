import { motion } from 'framer-motion';
import { X, Image as ImageIcon } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

/**
 * CartItem — Élément de panier avec miniature
 * Style institutionnel épuré
 */
export default function CartItem({ item }) {
  const { removeItem } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex gap-4 group"
    >
      {/* Image */}
      <div className="w-20 h-20 bg-white/5 border border-white/10 flex-shrink-0 overflow-hidden">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-white/20" strokeWidth={1} />
          </div>
        )}
      </div>

      {/* Infos */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 
              className="text-white/90 text-sm truncate"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {item.title}
            </h3>
            <p className="text-white/50 text-xs truncate" style={{ fontFamily: "'Inter', sans-serif" }}>
              {item.artist_name}
            </p>
            {(item.medium || item.dimensions) && (
              <p className="text-white/30 text-xs mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                {item.medium}{item.medium && item.dimensions && ' · '}{item.dimensions}
              </p>
            )}
          </div>
          
          <button
            onClick={() => removeItem(item.id)}
            className="p-1 text-white/30 hover:text-white/60 transition-colors opacity-0 group-hover:opacity-100"
            aria-label={`Retirer ${item.title} du panier`}
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
        
        <p 
          className="text-white/80 text-sm mt-2"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          {formatPrice(item.price)}
        </p>
      </div>
    </motion.div>
  );
}
