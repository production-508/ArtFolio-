import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext(null);

const CART_STORAGE_KEY = 'artfolio_cart';
const SHIPPING_RATE = 15; // Frais de port fixes en EUR
const COMMISSION_RATE = 0.07; // 7% commission

// Calculer les totaux du panier
const calculateTotals = (items) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const commission = subtotal * COMMISSION_RATE;
  const shipping = items.length > 0 ? SHIPPING_RATE : 0;
  const total = subtotal + shipping;
  
  return {
    subtotal,
    commission,
    shipping,
    total
  };
};

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Charger le panier depuis localStorage au montage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        setItems(parsed);
      }
    } catch (err) {
      console.error('Erreur chargement panier:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sauvegarder le panier dans localStorage à chaque modification
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isLoading]);

  const totals = calculateTotals(items);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Ajouter une œuvre au panier
  const addItem = useCallback((artwork) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.id === artwork.id);
      
      if (existingItem) {
        // L'œuvre est déjà dans le panier, ne rien faire (pas de quantité > 1 pour les œuvres d'art)
        return currentItems;
      }
      
      return [...currentItems, {
        id: artwork.id,
        title: artwork.title,
        price: artwork.price,
        image_url: artwork.image_url,
        artist_name: artwork.artist_name,
        artist_id: artwork.artist_id,
        medium: artwork.medium,
        dimensions: artwork.dimensions,
        quantity: 1
      }];
    });
    
    // Ouvrir le drawer automatiquement
    setIsDrawerOpen(true);
  }, []);

  // Retirer une œuvre du panier
  const removeItem = useCallback((artworkId) => {
    setItems(currentItems => currentItems.filter(item => item.id !== artworkId));
  }, []);

  // Vider le panier
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // Vérifier si une œuvre est dans le panier
  const isInCart = useCallback((artworkId) => {
    return items.some(item => item.id === artworkId);
  }, [items]);

  // Ouvrir/fermer le drawer
  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setIsDrawerOpen(prev => !prev), []);

  const value = {
    items,
    itemCount,
    ...totals,
    isDrawerOpen,
    isLoading,
    addItem,
    removeItem,
    clearCart,
    isInCart,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    hasItems: items.length > 0
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart doit être utilisé dans un CartProvider');
  }
  return context;
};

export default CartContext;
