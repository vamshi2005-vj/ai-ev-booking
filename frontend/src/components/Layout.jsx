import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand" onClick={() => navigate('/')} role="button" tabIndex={0}>
          <span className="brand-mark">E</span>
          <div>
            <strong>EventSphere</strong>
            <small>Attend & Host Live Events</small>
          </div>
        </div>
        <nav className="nav-links">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/events">Browse Events</NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/events/new" className="primary-link" style={{ padding: '0.65rem 1rem' }}>
                + Create Event
              </NavLink>
              <NavLink to="/bookings">My Bookings</NavLink>
              <NavLink to={user?.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'}>
                Dashboard
              </NavLink>
              <NavLink to="/profile">Profile</NavLink>
              <button className="ghost-button" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register" className="primary-link">Register</NavLink>
            </>
          )}
        </nav>
      </header>
      <main className="page-content">
        <Outlet />
      </main>
    </div>
  )
}
