import { NavLink } from 'react-router-dom';

const links = [
  { to: '/dashboard', icon: 'fa-chart-pie', label: 'Tableau de bord' },
  { to: '/books', icon: 'fa-book', label: 'Livres' },
  { to: '/categories', icon: 'fa-tags', label: 'Catégories' },
  { to: '/members', icon: 'fa-users', label: 'Membres' },
  { to: '/borrows', icon: 'fa-hand-holding-heart', label: 'Emprunts' },
];

export default function Sidebar() {
  return (
    <nav className="d-flex flex-column bg-dark text-white" style={{ width: '240px', minHeight: '100vh' }}>
      <div className="p-3 border-bottom border-secondary">
        <h5 className="mb-0">
          <i className="fas fa-book-open me-2 text-primary"></i>Bibliothèque
        </h5>
      </div>
      <ul className="nav flex-column mt-2">
        {links.map((link) => (
          <li key={link.to} className="nav-item">
            <NavLink
              to={link.to}
              className={({ isActive }) =>
                `nav-link text-white px-3 py-2 ${isActive ? 'bg-primary rounded mx-2' : ''}`
              }
            >
              <i className={`fas ${link.icon} me-2`}></i>{link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
