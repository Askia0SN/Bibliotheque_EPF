import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', description: '' });
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const load = () => api.get('/categories').then((r) => setCategories(r.data)).catch(console.error);
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm({ name: '', description: '' }); setEditId(null); setShowModal(true); };
  const openEdit = (cat) => { setForm({ name: cat.name, description: cat.description || '' }); setEditId(cat.id); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/categories/${editId}`, form);
        toast.success('Catégorie mise à jour');
      } else {
        await api.post('/categories', form);
        toast.success('Catégorie créée');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette catégorie ?')) return;
    try { await api.delete(`/categories/${id}`); toast.success('Supprimée'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4><i className="fas fa-tags me-2"></i>Catégories</h4>
        <button className="btn btn-primary" onClick={openNew}>
          <i className="fas fa-plus me-1"></i>Nouvelle catégorie
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-striped bg-white shadow-sm rounded">
          <thead className="table-dark">
            <tr><th>#</th><th>Nom</th><th>Description</th><th>Livres</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {categories.map((cat, i) => (
              <tr key={cat.id}>
                <td>{i + 1}</td>
                <td><strong>{cat.name}</strong></td>
                <td>{cat.description || <span className="text-muted">-</span>}</td>
                <td><span className="badge bg-info">{cat.books?.length || 0}</span></td>
                <td>
                  <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openEdit(cat)}>
                    <i className="fas fa-edit"></i>
                  </button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(cat.id)}>
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr><td colSpan="5" className="text-center text-muted py-4">Aucune catégorie</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editId ? 'Modifier' : 'Nouvelle'} catégorie</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Nom *</label>
                    <input className="form-control" value={form.name} required
                      onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea className="form-control" rows="3" value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
                  <button type="submit" className="btn btn-primary">{editId ? 'Mettre à jour' : 'Créer'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
