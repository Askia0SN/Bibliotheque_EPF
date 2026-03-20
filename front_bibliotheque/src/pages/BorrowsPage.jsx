import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

export default function BorrowsPage() {
  const [borrows, setBorrows] = useState([]);
  const [members, setMembers] = useState([]);
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({ member_id: '', book_id: '', due_date: '' });
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const load = () => {
    const params = new URLSearchParams({ page, limit: 10 });
    if (filterStatus) params.set('status', filterStatus);
    api.get(`/borrows?${params}`).then((r) => { setBorrows(r.data.borrows); setTotalPages(r.data.totalPages); }).catch(console.error);
  };

  useEffect(() => { load(); }, [page, filterStatus]);
  useEffect(() => {
    api.get('/members?limit=200').then((r) => setMembers(r.data.members || [])).catch(console.error);
    api.get('/books?limit=200').then((r) => setBooks(r.data.books || [])).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/borrows', form);
      toast.success('Emprunt enregistré');
      setForm({ member_id: '', book_id: '', due_date: '' }); setShowModal(false); load();
      api.get('/books?limit=200').then((r) => setBooks(r.data.books || []));
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
  };

  const handleReturn = async (id) => {
    if (!window.confirm('Confirmer le retour de ce livre ?')) return;
    try {
      await api.put(`/borrows/return/${id}`);
      toast.success('Livre retourné');
      load();
      api.get('/books?limit=200').then((r) => setBooks(r.data.books || []));
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
  };

  const getStatusBadge = (status, dueDate) => {
    if (status === 'returned') return <span className="badge bg-success">Retourné</span>;
    if (new Date(dueDate) < new Date()) return <span className="badge bg-danger">En retard</span>;
    return <span className="badge bg-warning text-dark">En cours</span>;
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4><i className="fas fa-hand-holding-heart me-2"></i>Emprunts</h4>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="fas fa-plus me-1"></i>Nouvel emprunt
        </button>
      </div>

      <div className="row mb-3">
        <div className="col-md-4">
          <select className="form-select" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
            <option value="">Tous les statuts</option>
            <option value="borrowed">En cours</option>
            <option value="returned">Retournés</option>
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-striped bg-white shadow-sm rounded">
          <thead className="table-dark">
            <tr><th>Membre</th><th>Livre</th><th>Emprunté le</th><th>Retour prévu</th><th>Retourné le</th><th>Statut</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {borrows.map((b) => (
              <tr key={b.id}>
                <td>{b.member?.first_name} {b.member?.last_name}</td>
                <td>
                  <strong>{b.book?.title}</strong>
                  <br /><small className="text-muted">{b.book?.author}</small>
                </td>
                <td>{b.borrow_date}</td>
                <td>{b.due_date}</td>
                <td>{b.return_date || <span className="text-muted">-</span>}</td>
                <td>{getStatusBadge(b.status, b.due_date)}</td>
                <td>
                  {b.status !== 'returned' && (
                    <button className="btn btn-sm btn-outline-success" onClick={() => handleReturn(b.id)}>
                      <i className="fas fa-undo me-1"></i>Retour
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {borrows.length === 0 && <tr><td colSpan="7" className="text-center text-muted py-4">Aucun emprunt</td></tr>}
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
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nouvel emprunt</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Membre *</label>
                    <select className="form-select" value={form.member_id} required onChange={(e) => setForm({ ...form, member_id: e.target.value })}>
                      <option value="">-- Choisir un membre --</option>
                      {members.filter((m) => m.status === 'active').map((m) => (
                        <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Livre *</label>
                    <select className="form-select" value={form.book_id} required onChange={(e) => setForm({ ...form, book_id: e.target.value })}>
                      <option value="">-- Choisir un livre --</option>
                      {books.filter((b) => b.available_quantity > 0).map((b) => (
                        <option key={b.id} value={b.id}>{b.title} — {b.author} (dispo: {b.available_quantity})</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Date de retour prévue *</label>
                    <input type="date" className="form-control" value={form.due_date} required min={today}
                      onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
                  <button type="submit" className="btn btn-primary">Enregistrer</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
