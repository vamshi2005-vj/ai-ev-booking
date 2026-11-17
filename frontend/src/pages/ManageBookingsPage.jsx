import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'

export default function ManageBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const loadBookings = () => {
    setLoading(true)
    api
      .get('/admin/bookings')
      .then(({ data }) => setBookings(data.data || []))
      .catch(() => setError('Failed to load bookings'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadBookings()
  }, [])

  const handleCancel = async (id, ref) => {
    if (!window.confirm(`Cancel booking ${ref}?`)) return
    try {
      await api.put(`/bookings/${id}/cancel`)
      setMessage(`Booking ${ref} was cancelled.`)
      loadBookings()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel')
    }
  }

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Admin</span>
          <h1>Manage Bookings</h1>
        </div>
      </div>

      {message && <div className="success-banner">{message}</div>}
      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="empty-state">Loading bookings...</div>
      ) : bookings.length === 0 ? (
        <div className="empty-state">No bookings found on the platform yet.</div>
      ) : (
        <div className="detail-panel" style={{ overflowX: 'auto', padding: '0.5rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--muted)' }}>
                <th style={{ padding: '0.85rem' }}>Reference</th>
                <th style={{ padding: '0.85rem' }}>Event</th>
                <th style={{ padding: '0.85rem' }}>Tickets</th>
                <th style={{ padding: '0.85rem' }}>Total</th>
                <th style={{ padding: '0.85rem' }}>Date</th>
                <th style={{ padding: '0.85rem' }}>Status</th>
                <th style={{ padding: '0.85rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '0.85rem' }}><code>{b.bookingReference}</code></td>
                  <td style={{ padding: '0.85rem' }}><strong>{b.eventName}</strong></td>
                  <td style={{ padding: '0.85rem' }}>{b.numberOfTickets}</td>
                  <td style={{ padding: '0.85rem' }}>₹{Number(b.totalAmount).toLocaleString('en-IN')}</td>
                  <td style={{ padding: '0.85rem' }}>{new Date(b.bookingDate).toLocaleDateString()}</td>
                  <td style={{ padding: '0.85rem' }}>
                    <span className={`pill ${b.bookingStatus === 'CONFIRMED' ? 'success' : 'danger'}`}>
                      {b.bookingStatus}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem' }}>
                    {b.bookingStatus === 'CONFIRMED' && (
                      <button
                        className="button danger"
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', background: 'rgba(239,68,68,0.15)', borderColor: 'rgba(239,68,68,0.3)', color: '#ffb3b3', cursor: 'pointer' }}
                        onClick={() => handleCancel(b.id, b.bookingReference)}
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
