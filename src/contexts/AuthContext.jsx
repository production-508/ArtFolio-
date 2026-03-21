import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('artfolio_token'));
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Dérivés pour les rôles
  const isArtist = user?.role === 'artist';
  const isAdmin = user?.role === 'admin';
  const isCollector = user?.role === 'collector';

  const apiFetch = useCallback(async (path, opts = {}) => {
    const headers = { ...opts.headers };
    if (!(opts.body instanceof FormData)) {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur réseau');
    return data;
  }, [token]);

  // Vérifier le token au démarrage
  useEffect(() => {
    const initAuth = async () => {
      if (!token) {
        setLoading(false);
        setIsAuthenticated(false);
        return;
      }

      try {
        const data = await apiFetch('/auth/me');
        setUser(data.user);
        setIsAuthenticated(true);
      } catch (err) {
        // Token invalide
        localStorage.removeItem('artfolio_token');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [token, apiFetch]);

  const login = async (email, password) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('artfolio_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  };

  const register = async (name, email, password, role = 'collector') => {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });
    localStorage.setItem('artfolio_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('artfolio_token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // Générer les initiales pour l'avatar
  const getInitials = () => {
    if (!user?.name) return '?';
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    isArtist,
    isAdmin,
    isCollector,
    login,
    register,
    logout,
    apiFetch,
    getInitials,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

export default AuthContext;
