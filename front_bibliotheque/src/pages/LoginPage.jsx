import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow" style={{ width: '400px' }}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <i className="fas fa-book-open fa-3x text-primary mb-3"></i>
            <h4>Gestion Bibliothèque</h4>
            <p className="text-muted">Connectez-vous pour continuer</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email" className="form-control" value={form.email} required
                placeholder="admin@bibliotheque.com"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="mb-4">
              <label className="form-label">Mot de passe</label>
              <input
                type="password" className="form-control" value={form.password} required
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <button className="btn btn-primary w-100" type="submit" disabled={loading}>
              {loading && <span className="spinner-border spinner-border-sm me-2" />}
              Se connecter
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
