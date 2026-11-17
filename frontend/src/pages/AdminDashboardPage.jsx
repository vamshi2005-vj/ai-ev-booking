import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import StatCard from '../components/StatCard'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/admin/dashboard')
      .then(({ data }) => setStats(data.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Administration</span>
          <h1>Admin Dashboard</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link className="button primary" to="/events/new">Create Event</Link>
          <Link className="button secondary" to="/admin/events">Manage Events</Link>
        </div>
      </div>

      {loading ? (
        <div className="empty-state">Loading dashboard statistics...</div>
      ) : (
        <div className="stats-grid">
          <StatCard label="Total Users" value={stats?.totalUsers ?? '0'} />
          <StatCard label="Total Events" value={stats?.totalEvents ?? '0'} />
          <StatCard label="Total Bookings" value={stats?.totalBookings ?? '0'} />
          <StatCard
            label="Total Revenue"
            value={`₹${Number(stats?.totalRevenue || 0).toLocaleString('en-IN')}`}
          />
        </div>
      )}

      <div className="section-block" style={{ marginTop: '1.5rem' }}>
        <h2>Management Controls</h2>
        <div className="card-grid">
          <div className="detail-panel">
            <h3>Events Control</h3>
            <p>Publish, edit, inspect, or delete any event listed on the platform.</p>
            <Link className="button secondary" to="/admin/events">Manage Events →</Link>
          </div>
          <div className="detail-panel">
            <h3>Bookings Overview</h3>
            <p>Review customer reservations, ticket counts, and status.</p>
            <Link className="button secondary" to="/admin/bookings">Manage Bookings →</Link>
          </div>
          <div className="detail-panel">
            <h3>Users Directory</h3>
            <p>View registered attendees and administrators.</p>
            <Link className="button secondary" to="/admin/users">Manage Users →</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
