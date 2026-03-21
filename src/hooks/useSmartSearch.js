import { useState, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * Hook pour la recherche intelligente ArtFolio
 * Recherche texte + visuelle avec filtres
 */
export function useSmartSearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [searchMeta, setSearchMeta] = useState(null);

  /**
   * Recherche par texte
   */
  const searchByText = useCallback(async (query, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/search/text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          filters: options.filters || {},
          limit: options.limit || 20,
          offset: options.offset || 0
        })
      });

      if (!response.ok) throw new Error('Erreur de recherche');

      const data = await response.json();
      
      setResults(data.results);
      setTotal(data.total);
      setSearchMeta({
        query: data.query,
        type: 'text'
      });

      return data.results;

    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Recherche par image (upload)
   */
  const searchByImage = useCallback(async (imageBase64, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/search/visual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageBase64,
          limit: options.limit || 20
        })
      });

      if (!response.ok) throw new Error('Erreur de recherche visuelle');

      const data = await response.json();
      
      setResults(data.results);
      setTotal(data.total);
      setSearchMeta({
        description: data.description,
        type: 'visual'
      });

      return data.results;

    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Recherche combinée (texte + image)
   */
  const searchCombined = useCallback(async (query, imageBase64, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/search/combined`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          image: imageBase64,
          filters: options.filters || {},
          limit: options.limit || 20
        })
      });

      if (!response.ok) throw new Error('Erreur de recherche combinée');

      const data = await response.json();
      
      setResults(data.results);
      setTotal(data.total);
      setSearchMeta({
        text_query: data.text_query,
        image_description: data.image_description,
        type: 'combined'
      });

      return data.results;

    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Recherche générique (détecte automatiquement le type)
   */
  const search = useCallback(async (params) => {
    const { query, visual, filters } = params;

    if (visual && query) {
      return searchCombined(query, visual, { filters });
    } else if (visual) {
      return searchByImage(visual, { filters });
    } else {
      return searchByText(query, { filters });
    }
  }, [searchByText, searchByImage, searchCombined]);

  /**
   * Récupérer les suggestions
   */
  const getSuggestions = useCallback(async (partialQuery) => {
    if (partialQuery.length < 2) return [];

    try {
      const response = await fetch(
        `${API_BASE}/search/suggest?q=${encodeURIComponent(partialQuery)}`
      );
      
      if (!response.ok) throw new Error();

      const data = await response.json();
      return data.suggestions || [];

    } catch {
      return [];
    }
  }, []);

  /**
   * Réinitialiser les résultats
   */
  const clearResults = useCallback(() => {
    setResults([]);
    setTotal(0);
    setSearchMeta(null);
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    total,
    searchMeta,
    search,
    searchByText,
    searchByImage,
    searchCombined,
    getSuggestions,
    clearResults
  };
}

export default useSmartSearch;
