import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const FavoritesContext = createContext(null);

/**
 * Contexte pour gérer les œuvres favorites
 * Persistance localStorage + sync backend si connecté
 */
export function FavoritesProvider({ children, user }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  // Charger depuis localStorage au mount
  useEffect(() => {
    const stored = localStorage.getItem('artfolio_favorites');
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing favorites:', e);
      }
    }
  }, []);

  // Sauvegarder dans localStorage quand favorites change
  useEffect(() => {
    localStorage.setItem('artfolio_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Sync avec backend si utilisateur connecté
  useEffect(() => {
    if (user?.id) {
      syncWithBackend();
    }
  }, [user?.id]);

  const syncWithBackend = async () => {
    try {
      const token = localStorage.getItem('artfolio_token');
      if (!token) return;

      const response = await fetch('/api/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Merge local et backend (priorité au plus récent)
        const backendIds = new Set(data.favorites.map(f => f.artwork_id));
        const localOnly = favorites.filter(f => !backendIds.has(f.id));
        
        if (localOnly.length > 0) {
          // Upload les favoris locaux au backend
          await Promise.all(localOnly.map(f => 
            fetch('/api/favorites', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({ artwork_id: f.id })
            })
          ));
        }
        
        setFavorites(data.favorites.map(f => ({
          id: f.artwork_id,
          title: f.title,
          artist: f.artist_name,
          image: f.image_url,
          price: f.price,
          addedAt: f.created_at
        })));
      }
    } catch (error) {
      console.error('Sync favorites error:', error);
    }
  };

  const addToFavorites = useCallback(async (artwork) => {
    setFavorites(prev => {
      if (prev.some(f => f.id === artwork.id)) return prev;
      return [...prev, { ...artwork, addedAt: new Date().toISOString() }];
    });

    // Sync backend si connecté
    if (user?.id) {
      try {
        const token = localStorage.getItem('artfolio_token');
        await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ artwork_id: artwork.id })
        });
      } catch (error) {
        console.error('Add favorite backend error:', error);
      }
    }
  }, [user?.id]);

  const removeFromFavorites = useCallback(async (artworkId) => {
    setFavorites(prev => prev.filter(f => f.id !== artworkId));

    if (user?.id) {
      try {
        const token = localStorage.getItem('artfolio_token');
        await fetch(`/api/favorites/${artworkId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        console.error('Remove favorite backend error:', error);
      }
    }
  }, [user?.id]);

  const isFavorite = useCallback((artworkId) => {
    return favorites.some(f => f.id === artworkId);
  }, [favorites]);

  const toggleFavorite = useCallback((artwork) => {
    if (isFavorite(artwork.id)) {
      removeFromFavorites(artwork.id);
    } else {
      addToFavorites(artwork);
    }
  }, [isFavorite, addToFavorites, removeFromFavorites]);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
    localStorage.removeItem('artfolio_favorites');
  }, []);

  const value = {
    favorites,
    favoritesCount: favorites.length,
    loading,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    clearFavorites,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export default FavoritesContext;
