import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../api/client'

export default function BookingDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadBooking = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/bookings/${id}`)
      setBooking(data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load booking details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBooking()
  }, [id])

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return
    try {
      await api.put(`/bookings/${id}/cancel`)
      setSuccess('Booking was successfully cancelled.')
      loadBooking()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking')
    }
  }

  if (loading) {
    return <div className="empty-state">Loading booking details...</div>
  }

  if (!booking) {
    return (
      <div className="empty-state">
        <p>{error || 'Booking not found.'}</p>
        <Link className="button secondary" to="/bookings">Back to Bookings</Link>
      </div>
    )
  }

  return (
    <div className="page-stack" style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div className="page-heading">
        <div>
          <span className="eyebrow">Booking Receipt</span>
          <h1>{booking.bookingReference}</h1>
        </div>
        <button className="button secondary" onClick={() => navigate('/bookings')}>
          Back to My Bookings
        </button>
      </div>

      {success && <div className="success-banner">{success}</div>}
      {error && <div className="error-banner">{error}</div>}

      <div className="detail-panel">
        <div className="pill-row">
          <span className={`pill ${booking.bookingStatus === 'CONFIRMED' ? 'success' : 'danger'}`}>
            Booking {booking.bookingStatus}
          </span>
          <span className="pill success">Payment {booking.paymentStatus}</span>
        </div>

        <h2>{booking.eventName}</h2>

        <div className="detail-grid">
          <div>
            <span>Reference ID</span>
            <strong>{booking.bookingReference}</strong>
          </div>
          <div>
            <span>Booking Date</span>
            <strong>{new Date(booking.bookingDate).toLocaleString()}</strong>
          </div>
          <div>
            <span>Tickets Reserved</span>
            <strong>{booking.numberOfTickets} ticket(s)</strong>
          </div>
          <div>
            <span>Total Paid</span>
            <strong>₹{Number(booking.totalAmount).toLocaleString('en-IN')}</strong>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <Link className="button primary" to={`/events/${booking.eventId}`}>
            View Event Page
          </Link>
          {booking.bookingStatus === 'CONFIRMED' && (
            <button
              className="button danger"
              style={{ background: 'rgba(239,68,68,0.15)', borderColor: 'rgba(239,68,68,0.3)', color: '#ffb3b3', cursor: 'pointer' }}
              onClick={handleCancel}
            >
              Cancel Booking
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
