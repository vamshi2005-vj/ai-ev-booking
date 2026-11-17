import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'

export default function BookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadBookings = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/bookings/my')
      setBookings(data.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBookings()
  }, [])

  const handleCancel = async (id, ref) => {
    if (!window.confirm(`Are you sure you want to cancel booking ${ref}?`)) return
    try {
      await api.put(`/bookings/${id}/cancel`)
      setSuccess(`Booking ${ref} was successfully cancelled.`)
      loadBookings()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking')
    }
  }

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Reservations</span>
          <h1>My Bookings</h1>
        </div>
        <Link className="button secondary" to="/events">Find More Events</Link>
      </div>

      {success && <div className="success-banner">{success}</div>}
      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="empty-state">Loading your bookings...</div>
      ) : bookings.length === 0 ? (
        <div className="empty-state">
          <p>You have not attended or booked any events yet.</p>
          <Link className="button primary" style={{ marginTop: '1rem' }} to="/events">
            Browse Events to Attend
          </Link>
        </div>
      ) : (
        <div className="card-grid">
          {bookings.map((booking) => (
            <div key={booking.id} className="event-card" style={{ padding: '1.25rem', display: 'grid', gap: '0.9rem' }}>
              <div className="pill-row">
                <span className="pill">{booking.bookingReference}</span>
                <span className={`pill ${booking.bookingStatus === 'CONFIRMED' ? 'success' : 'danger'}`}>
                  {booking.bookingStatus}
                </span>
              </div>
              <div>
                <h3 style={{ margin: '0 0 0.35rem 0' }}>{booking.eventName}</h3>
                <small style={{ color: 'var(--muted)' }}>
                  Booked on {new Date(booking.bookingDate).toLocaleDateString()}
                </small>
              </div>
              <div className="detail-grid">
                <div>
                  <span>Tickets</span>
                  <strong>{booking.numberOfTickets}</strong>
                </div>
                <div>
                  <span>Total Paid</span>
                  <strong>₹{Number(booking.totalAmount).toLocaleString('en-IN')}</strong>
                </div>
                <div>
                  <span>Payment</span>
                  <span className={`pill ${booking.paymentStatus === 'PAID' ? 'success' : ''}`}>
                    {booking.paymentStatus}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <Link className="button secondary" style={{ flex: 1, textAlign: 'center' }} to={`/bookings/${booking.id}`}>
                  View Details
                </Link>
                {booking.bookingStatus === 'CONFIRMED' && (
                  <button
                    className="button danger"
                    style={{ background: 'rgba(239,68,68,0.15)', borderColor: 'rgba(239,68,68,0.3)', color: '#ffb3b3', cursor: 'pointer' }}
                    onClick={() => handleCancel(booking.id, booking.bookingReference)}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
