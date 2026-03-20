import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const emptyForm = { first_name: '', last_name: '', email: '', phone: '', address: '', status: 'active' };

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const load = () => {
    const params = new URLSearchParams({ page, limit: 10 });
    if (search) params.set('search', search);
    api.get(`/members?${params}`).then((r) => { setMembers(r.data.members); setTotalPages(r.data.totalPages); }).catch(console.error);
  };

  useEffect(() => { load(); }, [page, search]);

  const openNew = () => { setForm(emptyForm); setEditId(null); setShowModal(true); };
  const openEdit = (m) => {
    setForm({ first_name: m.first_name, last_name: m.last_name, email: m.email || '', phone: m.phone || '', address: m.address || '', status: m.status });
    setEditId(m.id); setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) { await api.put(`/members/${editId}`, form); toast.success('Membre mis à jour'); }
      else { await api.post('/members', form); toast.success('Membre créé'); }
      setShowModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce membre ?')) return;
    try { await api.delete(`/members/${id}`); toast.success('Supprimé'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4><i className="fas fa-users me-2"></i>Membres</h4>
        <button className="btn btn-primary" onClick={openNew}>
          <i className="fas fa-plus me-1"></i>Nouveau membre
        </button>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <input className="form-control" placeholder="Rechercher un membre..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-striped bg-white shadow-sm rounded">
          <thead className="table-dark">
            <tr><th>Nom complet</th><th>Email</th><th>Téléphone</th><th>Inscription</th><th>Statut</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id}>
                <td><strong>{m.first_name} {m.last_name}</strong></td>
                <td>{m.email || <span className="text-muted">-</span>}</td>
                <td>{m.phone || <span className="text-muted">-</span>}</td>
                <td>{m.membership_date}</td>
                <td>
                  <span className={`badge ${m.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                    {m.status === 'active' ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td>
                  <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openEdit(m)}><i className="fas fa-edit"></i></button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(m.id)}><i className="fas fa-trash"></i></button>
                </td>
              </tr>
            ))}
            {members.length === 0 && <tr><td colSpan="6" className="text-center text-muted py-4">Aucun membre</td></tr>}
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
                <h5 className="modal-title">{editId ? 'Modifier' : 'Nouveau'} membre</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Prénom *</label>
                      <input className="form-control" value={form.first_name} required onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Nom *</label>
                      <input className="form-control" value={form.last_name} required onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Email</label>
                      <input type="email" className="form-control" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Téléphone</label>
                      <input className="form-control" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label">Adresse</label>
                      <textarea className="form-control" rows="2" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}></textarea>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Statut</label>
                      <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                        <option value="active">Actif</option>
                        <option value="inactive">Inactif</option>
                      </select>
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
