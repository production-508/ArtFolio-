import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import '../components/Auth/AuthModal.css'; // On réutilise les styles modal

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { apiFetch } = useAuth();
  
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      toast.error('Token de réinitialisation manquant');
      navigate('/');
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });
      toast.success(data.message);
      navigate('/'); // Retour à l'accueil pour se connecter
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-black)' }}>
      <div className="auth-modal" style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
        <div className="auth-header">
          <p className="auth-logo">ArtFolio</p>
          <p className="auth-subtitle">Créer un nouveau mot de passe</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="reset-password">Nouveau mot de passe</label>
            <input 
              id="reset-password" 
              className="form-input" 
              type="password"
              placeholder="6 caractères minimum"
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              autoFocus 
            />
          </div>

          {error && <p className="error-msg">{error}</p>}

          <button type="submit" className="btn btn-gold btn-lg" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
            {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : 'Réinitialiser'}
          </button>
        </form>
      </div>
    </div>
  );
}
