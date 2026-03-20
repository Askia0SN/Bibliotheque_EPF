import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <nav className="navbar navbar-light bg-white border-bottom px-4">
      <span className="navbar-brand mb-0">
        <i className="fas fa-user-circle me-2 text-primary"></i>
        {user?.name}
      </span>
      <button className="btn btn-outline-danger btn-sm" onClick={logout}>
        <i className="fas fa-sign-out-alt me-1"></i>Déconnexion
      </button>
    </nav>
  );
}
