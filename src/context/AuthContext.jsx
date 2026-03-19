import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('artfolio_token'));
  const [loading, setLoading] = useState(true);

  const apiFetch = useCallback(async (path, opts = {}) => {
    const headers = { ...opts.headers };
    if (!(opts.body instanceof FormData)) {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`/api${path}`, { ...opts, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur réseau');
    return data;
  }, [token]);

  // Charger l'utilisateur au démarrage
  useEffect(() => {
    if (!token) {
      // Auto-login sur le compte démo s'il n'y a pas de session
      const initDemo = async () => {
        try {
          const data = await apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email: 'demo@artfolio.art', password: 'demo1234' }),
          });
          localStorage.setItem('artfolio_token', data.token);
          setToken(data.token);
          setUser(data.user);
        } catch (err) {
          try {
            const data = await apiFetch('/auth/register', {
              method: 'POST',
              body: JSON.stringify({ name: 'Alexandre Démo', email: 'demo@artfolio.art', password: 'demo1234', role: 'artist' }),
            });
            localStorage.setItem('artfolio_token', data.token);
            setToken(data.token);
            setUser(data.user);
          } catch (e) {
            console.error("Erreur auto-login démo:", e);
          }
        } finally {
          setLoading(false);
        }
      };
      initDemo();
      return;
    }
    
    apiFetch('/auth/me')
      .then(data => setUser(data.user))
      .catch(() => { localStorage.removeItem('artfolio_token'); setToken(null); })
      .finally(() => setLoading(false));
  }, [token, apiFetch]);

  const login = async (email, password) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('artfolio_token', data.token);
    setToken(data.token);
    setUser(data.user);
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
    return data;
  };

  const logout = () => {
    localStorage.removeItem('artfolio_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, apiFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
