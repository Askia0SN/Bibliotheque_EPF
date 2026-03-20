import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const emptyForm = { title: '', author: '', isbn: '', category_id: '', description: '', quantity: 1, available_quantity: 1 };

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [coverFile, setCoverFile] = useState(null);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const load = () => {
    const params = new URLSearchParams({ page, limit: 10 });
    if (search) params.set('search', search);
    if (filterCat) params.set('category_id', filterCat);
    api.get(`/books?${params}`).then((r) => { setBooks(r.data.books); setTotalPages(r.data.totalPages); }).catch(console.error);
  };

  useEffect(() => { load(); }, [page, search, filterCat]);
  useEffect(() => { api.get('/categories').then((r) => setCategories(r.data)).catch(console.error); }, []);

  const openNew = () => { setForm(emptyForm); setCoverFile(null); setEditId(null); setShowModal(true); };
  const openEdit = (b) => {
    setForm({ title: b.title, author: b.author, isbn: b.isbn || '', category_id: b.category_id, description: b.description || '', quantity: b.quantity, available_quantity: b.available_quantity });
    setCoverFile(null); setEditId(b.id); setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (coverFile) data.append('cover_image', coverFile);
      if (editId) { await api.put(`/books/${editId}`, data); toast.success('Livre mis à jour'); }
      else { await api.post('/books', data); toast.success('Livre créé'); }
      setShowModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce livre ?')) return;
    try { await api.delete(`/books/${id}`); toast.success('Supprimé'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4><i className="fas fa-book me-2"></i>Livres</h4>
        <button className="btn btn-primary" onClick={openNew}>
          <i className="fas fa-plus me-1"></i>Nouveau livre
        </button>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <input className="form-control" placeholder="Rechercher par titre ou auteur..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div className="col-md-4">
          <select className="form-select" value={filterCat} onChange={(e) => { setFilterCat(e.target.value); setPage(1); }}>
            <option value="">Toutes les catégories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-striped bg-white shadow-sm rounded">
          <thead className="table-dark">
            <tr><th>Couverture</th><th>Titre</th><th>Auteur</th><th>Catégorie</th><th>Stock</th><th>Dispo</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {books.map((b) => (
              <tr key={b.id}>
                <td>
                  {b.cover_image
                    ? <img src={`/uploads/${b.cover_image}`} alt="" style={{ width: 40, height: 52, objectFit: 'cover' }} className="rounded" />
                    : <i className="fas fa-book fa-2x text-muted"></i>}
                </td>
                <td><strong>{b.title}</strong></td>
                <td>{b.author}</td>
                <td><span className="badge bg-info">{b.category?.name}</span></td>
                <td>{b.quantity}</td>
                <td><span className={`badge ${b.available_quantity > 0 ? 'bg-success' : 'bg-danger'}`}>{b.available_quantity}</span></td>
                <td>
                  <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openEdit(b)}><i className="fas fa-edit"></i></button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(b.id)}><i className="fas fa-trash"></i></button>
                </td>
              </tr>
            ))}
            {books.length === 0 && <tr><td colSpan="7" className="text-center text-muted py-4">Aucun livre</td></tr>}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav><ul className="pagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <li key={i} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
              <button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button>
            </li>
          ))}
        </ul></nav>
      )}

      {showModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editId ? 'Modifier' : 'Nouveau'} livre</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Titre *</label>
                      <input className="form-control" value={form.title} required onChange={(e) => setForm({ ...form, title: e.target.value })} />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Auteur *</label>
                      <input className="form-control" value={form.author} required onChange={(e) => setForm({ ...form, author: e.target.value })} />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">ISBN</label>
                      <input className="form-control" value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Catégorie *</label>
                      <select className="form-select" value={form.category_id} required onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                        <option value="">-- Choisir --</option>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Quantité *</label>
                      <input type="number" min="1" className="form-control" value={form.quantity} required onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Quantité disponible</label>
                      <input type="number" min="0" className="form-control" value={form.available_quantity} onChange={(e) => setForm({ ...form, available_quantity: e.target.value })} />
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label">Description</label>
                      <textarea className="form-control" rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}></textarea>
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label">Image de couverture</label>
                      <input type="file" className="form-control" accept="image/*" onChange={(e) => setCoverFile(e.target.files[0])} />
                    </div>
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
