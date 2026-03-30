import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur d’inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow" style={{ width: '420px' }}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <i className="fas fa-user-plus fa-3x text-primary mb-3"></i>
            <h4>Créer un compte</h4>
            <p className="text-muted">Remplissez les informations</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Nom</label>
              <input
                type="text"
                className="form-control"
                value={form.name}
                required
                placeholder="Jean Dupont"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={form.email}
                required
                placeholder="jean@example.com"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="mb-4">
              <label className="form-label">Mot de passe</label>
              <input
                type="password"
                className="form-control"
                value={form.password}
                required
                placeholder="motdepasse123"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <button className="btn btn-primary w-100" type="submit" disabled={loading}>
              {loading && <span className="spinner-border spinner-border-sm me-2" />}
              S'inscrire
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

