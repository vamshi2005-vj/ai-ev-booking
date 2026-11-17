import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import StatCard from '../components/StatCard'

export default function DashboardPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/bookings/my')
      .then(({ data }) => setBookings(data.data || []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false))
  }, [])

  const confirmed = bookings.filter((b) => b.bookingStatus === 'CONFIRMED')
  const totalTickets = confirmed.reduce((acc, b) => acc + (b.numberOfTickets || 0), 0)

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Welcome Back</span>
          <h1>{user?.name || 'My'} Dashboard</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link className="button primary" to="/events/new">Create an Event</Link>
          <Link className="button secondary" to="/events">Browse Events</Link>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard label="Events Attending" value={confirmed.length} />
        <StatCard label="Tickets Reserved" value={totalTickets} />
        <StatCard label="Account Role" value={user?.role || 'USER'} />
      </div>

      <section className="section-block" style={{ marginTop: '1rem' }}>
        <div className="section-heading">
          <h2>My Upcoming Events</h2>
          <Link to="/bookings">View all bookings</Link>
        </div>

        {loading ? (
          <div className="empty-state">Loading your events...</div>
        ) : confirmed.length === 0 ? (
          <div className="empty-state">
            <p>You haven't signed up to attend any events yet.</p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <Link className="button primary" to="/events">Find Events to Attend</Link>
              <Link className="button secondary" to="/events/new">Host Your Own Event</Link>
            </div>
          </div>
        ) : (
          <div className="card-grid">
            {confirmed.slice(0, 3).map((b) => (
              <div key={b.id} className="event-card" style={{ padding: '1.25rem', display: 'grid', gap: '0.75rem' }}>
                <span className="pill success" style={{ width: 'fit-content' }}>Attending</span>
                <h3 style={{ margin: 0 }}>{b.eventName}</h3>
                <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                  Reference: <strong>{b.bookingReference}</strong>
                </div>
                <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
                  Tickets: <strong>{b.numberOfTickets}</strong> | Paid: <strong>₹{Number(b.totalAmount).toLocaleString('en-IN')}</strong>
                </div>
                <Link className="button secondary" style={{ textAlign: 'center', marginTop: '0.5rem' }} to={`/bookings/${b.id}`}>
                  View Pass
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
