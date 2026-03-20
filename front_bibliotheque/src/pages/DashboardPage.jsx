import { useState, useEffect } from 'react';
import api from '../services/api';

function StatCard({ title, value, icon, color }) {
  return (
    <div className="col-md-3 mb-3">
      <div className={`card text-white bg-${color}`}>
        <div className="card-body d-flex justify-content-between align-items-center">
          <div>
            <h6 className="card-title mb-1">{title}</h6>
            <h2 className="mb-0">{value ?? <span className="spinner-border spinner-border-sm" />}</h2>
          </div>
          <i className={`fas ${icon} fa-2x opacity-50`}></i>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState({ books: null, members: null, borrows: null });

  useEffect(() => {
    Promise.all([
      api.get('/stats/books'),
      api.get('/stats/members'),
      api.get('/stats/borrows'),
    ]).then(([b, m, br]) => {
      setStats({ books: b.data, members: m.data, borrows: br.data });
    }).catch(console.error);
  }, []);

  return (
    <div>
      <h4 className="mb-4"><i className="fas fa-chart-pie me-2"></i>Tableau de bord</h4>
      <div className="row">
        <StatCard title="Total Livres" value={stats.books?.totalBooks} icon="fa-book" color="primary" />
        <StatCard title="Livres Disponibles" value={stats.books?.totalAvailable} icon="fa-check-circle" color="success" />
        <StatCard title="Total Membres" value={stats.members?.totalMembers} icon="fa-users" color="info" />
        <StatCard title="Emprunts Actifs" value={stats.borrows?.activeBorrows} icon="fa-hand-holding-heart" color="warning" />
      </div>
      <div className="row">
        <StatCard title="Membres Actifs" value={stats.members?.activeMembers} icon="fa-user-check" color="success" />
        <StatCard title="Total Emprunts" value={stats.borrows?.totalBorrows} icon="fa-list" color="secondary" />
        <StatCard title="Retournés" value={stats.borrows?.returnedBorrows} icon="fa-undo" color="dark" />
        <StatCard title="En Retard" value={stats.borrows?.overdueBorrows} icon="fa-exclamation-triangle" color="danger" />
      </div>

      {stats.borrows?.mostBorrowed?.length > 0 && (
        <div className="card mt-2">
          <div className="card-header bg-white">
            <strong><i className="fas fa-trophy me-2 text-warning"></i>Livres les plus empruntés</strong>
          </div>
          <div className="card-body p-0">
            <table className="table table-sm mb-0">
              <thead className="table-light"><tr><th>#</th><th>Titre</th><th>Auteur</th><th>Emprunts</th></tr></thead>
              <tbody>
                {stats.borrows.mostBorrowed.map((b, i) => (
                  <tr key={b.book_id}>
                    <td>{i + 1}</td>
                    <td>{b.book?.title}</td>
                    <td>{b.book?.author}</td>
                    <td><span className="badge bg-primary">{b.borrow_count}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
