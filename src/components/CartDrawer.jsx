import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import CartItem from './CartItem';

/**
 * CartDrawer — Panier slide-out depuis la droite
 * Style institutionnel épuré
 */
export default function CartDrawer() {
  const { 
    isDrawerOpen, 
    closeDrawer, 
    items, 
    itemCount,
    subtotal,
    shipping,
    total,
    hasItems,
    clearCart
  } = useCart();

  // Bloquer le scroll quand le drawer est ouvert
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') closeDrawer();
    };
    
    if (isDrawerOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isDrawerOpen, closeDrawer]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeDrawer}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            aria-hidden="true"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0a0a0a] border-l border-white/10 z-50 flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-white/60" strokeWidth={1.5} />
                <h2 
                  id="cart-title" 
                  className="font-serif text-lg tracking-wide text-white/90"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  Votre sélection
                </h2>
                {itemCount > 0 && (
                  <span className="px-2 py-0.5 text-xs bg-white/10 text-white/60 rounded-full">
                    {itemCount} {itemCount === 1 ? 'œuvre' : 'œuvres'}
                  </span>
                )}
              </div>
              
              <button
                onClick={closeDrawer}
                className="p-2 text-white/60 hover:text-white transition-colors"
                aria-label="Fermer le panier"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {!hasItems ? (
                <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                  <ShoppingBag className="w-12 h-12 text-white/20 mb-4" strokeWidth={1} />
                  <p className="text-white/40 text-sm mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Votre panier est vide
                  </p>
                  <p className="text-white/30 text-xs" style={{ fontFamily: "'Inter', sans-serif" }}>
                    Ajoutez des œuvres à votre collection
                  </p>
                </div>
              ) : (
                <div className="p-6 space-y-6">
                  {items.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>

            {/* Footer avec totaux */}
            {hasItems && (
              <div className="border-t border-white/10 p-6 space-y-4 bg-[#0a0a0a]">
                {/* Détails */}
                <div className="space-y-2 text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
                  <div className="flex justify-between text-white/60">
                    <span>Sous-total</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>Livraison</span>
                    <span>{formatPrice(shipping)}</span>
                  </div>
                  <div className="flex justify-between text-white/40 text-xs">
                    <span>Commission galerie (7%)</span>
                    <span>{formatPrice(subtotal * 0.07)}</span>
                  </div>
                </div>
                
                {/* Total */}
                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                  <span 
                    className="text-white/90 text-lg"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    Total
                  </span>
                  <span 
                    className="text-white text-xl"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {formatPrice(total)}
                  </span>
                </div>

                {/* Boutons */}
                <div className="space-y-3">
                  <a
                    href="/checkout"
                    onClick={closeDrawer}
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white text-black hover:bg-white/90 transition-colors text-sm font-medium"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Passer la commande
                    <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                  </a>
                  
                  <button
                    onClick={clearCart}
                    className="flex items-center justify-center gap-2 w-full py-2 text-white/40 hover:text-white/60 transition-colors text-xs"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    <Trash2 className="w-3 h-3" strokeWidth={1.5} />
                    Vider le panier
                  </button>
                </div>
                
                <p className="text-center text-white/30 text-xs" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Paiement sécurisé par Stripe
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
