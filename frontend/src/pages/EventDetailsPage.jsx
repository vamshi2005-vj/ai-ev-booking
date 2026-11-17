import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { parseEventImages } from '../utils/imageUtils'

export default function EventDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [event, setEvent] = useState(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  // Booking Modal State
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [tickets, setTickets] = useState(1)
  const [confirmedBooking, setConfirmedBooking] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const loadEvent = () => {
    api
      .get(`/events/${id}`)
      .then(({ data }) => {
        setEvent(data.data)
        setActiveImageIndex(0)
      })
      .catch(() => setError('Unable to load event'))
  }

  useEffect(() => {
    loadEvent()
  }, [id])

  const images = useMemo(() => parseEventImages(event?.imageUrl), [event?.imageUrl])
  const price = Number(event?.ticketPrice || 0)
  const total = useMemo(() => price * tickets, [price, tickets])

  // Open the ticket selection modal
  const handleOpenBooking = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/events/${id}` } })
      return
    }
    setTickets(1)
    setConfirmedBooking(null)
    setError('')
    setShowBookingModal(true)
  }

  // Confirm and submit booking
  const handleConfirmBooking = async () => {
    if (tickets < 1) return
    setSubmitting(true)
    setError('')
    try {
      const { data } = await api.post('/bookings', {
        eventId: Number(id),
        numberOfTickets: tickets,
      })
      setConfirmedBooking(data.data)
      loadEvent()
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!event) {
    return <div className="empty-state">{error || 'Loading event...'}</div>
  }

  const isSoldOut = event.availableSeats <= 0
  const maxAvailable = Math.max(1, event.availableSeats || 1)

  return (
    <div className="event-details">
      {/* Event Photo / Gallery Section */}
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {images.length > 0 ? (
          <div>
            <img
              className="detail-image"
              src={images[activeImageIndex] || images[0]}
              alt={event.eventName}
              style={{
                borderRadius: '1.5rem',
                border: '1px solid var(--line)',
                maxHeight: '440px',
              }}
            />

            {/* Thumbnail Strip for Multiple Images */}
            {images.length > 1 && (
              <div
                style={{
                  display: 'flex',
                  gap: '0.6rem',
                  overflowX: 'auto',
                  paddingTop: '0.6rem',
                }}
              >
                {images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    onClick={() => setActiveImageIndex(idx)}
                    style={{
                      width: '74px',
                      height: '54px',
                      objectFit: 'cover',
                      borderRadius: '0.6rem',
                      cursor: 'pointer',
                      border: activeImageIndex === idx ? '2px solid var(--primary)' : '1px solid var(--line)',
                      opacity: activeImageIndex === idx ? 1 : 0.65,
                      transition: 'all 0.2s ease',
                      flexShrink: 0,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              height: '280px',
              borderRadius: '1.5rem',
              border: '1px solid var(--line)',
              background: 'linear-gradient(135deg, rgba(249,115,22,0.12), rgba(59,130,246,0.14))',
              display: 'grid',
              placeItems: 'center',
              textAlign: 'center',
              padding: '2rem',
            }}
          >
            <div>
              <span className="pill" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>
                {event.category}
              </span>
              <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem' }}>{event.eventName}</h2>
              <p style={{ margin: 0, color: 'var(--muted)' }}>Live in {event.city}</p>
            </div>
          </div>
        )}
      </div>

      {/* Details & Attend Panel */}
      <div className="detail-panel">
        <div className="pill-row">
          <span className="pill">{event.category}</span>
          {!isSoldOut ? (
            <span className="pill success">{event.availableSeats} of {event.capacity} seats left</span>
          ) : (
            <span className="pill danger">Sold Out</span>
          )}
          {user?.role === 'ADMIN' && (
            <Link className="pill" to={`/events/${event.id}/edit`}>Edit Event</Link>
          )}
        </div>

        <h1>{event.eventName}</h1>
        <p>{event.description || 'Join this live experience hosted on EventSphere.'}</p>

        <div className="detail-grid">
          <div>
            <span>Date</span>
            <strong>{event.eventDate}</strong>
          </div>
          <div>
            <span>Time</span>
            <strong>{event.startTime ? event.startTime.slice(0, 5) : ''} - {event.endTime ? event.endTime.slice(0, 5) : ''}</strong>
          </div>
          <div>
            <span>Venue</span>
            <strong>{event.venue}</strong>
          </div>
          <div>
            <span>City</span>
            <strong>{event.city}</strong>
          </div>
          <div>
            <span>Organizer</span>
            <strong>{event.organizerName}</strong>
          </div>
          <div>
            <span>Price</span>
            <strong>{price === 0 ? 'Free Entry' : `₹${price.toLocaleString('en-IN')}`}</strong>
          </div>
        </div>

        {/* Action Panel */}
        <div className="booking-box" style={{ marginTop: '0.5rem' }}>
          <button
            className="button primary"
            style={{ fontSize: '1.05rem', padding: '0.9rem' }}
            onClick={handleOpenBooking}
            disabled={isSoldOut}
          >
            {isSoldOut ? 'Sold Out' : price === 0 ? 'Attend This Event' : `Book Tickets • ₹${price.toLocaleString('en-IN')}`}
          </button>
        </div>
      </div>

      {/* Ticket Selection & Confirmation Modal */}
      {showBookingModal && (
        <div className="modal-backdrop" onClick={() => !submitting && setShowBookingModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            {!confirmedBooking ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span className="eyebrow">Ticket Selection</span>
                    <h2 style={{ margin: '0.2rem 0' }}>{event.eventName}</h2>
                    <small style={{ color: 'var(--muted)' }}>{event.eventDate} • {event.city}</small>
                  </div>
                  <button
                    className="ghost-button"
                    style={{ fontSize: '1.25rem', padding: '0.25rem 0.5rem' }}
                    onClick={() => setShowBookingModal(false)}
                    disabled={submitting}
                  >
                    ✕
                  </button>
                </div>

                {error && <div className="error-banner">{error}</div>}

                {/* Question: How many tickets */}
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.75rem', fontSize: '1rem' }}>
                    How many tickets would you like to book?
                  </label>

                  <div className="stepper">
                    <button
                      type="button"
                      className="stepper-btn"
                      onClick={() => setTickets((prev) => Math.max(1, prev - 1))}
                      disabled={tickets <= 1 || submitting}
                    >
                      −
                    </button>
                    <div className="stepper-val">{tickets}</div>
                    <button
                      type="button"
                      className="stepper-btn"
                      onClick={() => setTickets((prev) => Math.min(maxAvailable, prev + 1))}
                      disabled={tickets >= maxAvailable || submitting}
                    >
                      +
                    </button>
                  </div>

                  {/* Quick Select Chips */}
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '0.75rem' }}>
                    {[1, 2, 3, 4, 5].filter((n) => n <= maxAvailable).map((n) => (
                      <button
                        key={n}
                        type="button"
                        className="chip"
                        style={{
                          cursor: 'pointer',
                          borderColor: tickets === n ? 'var(--primary)' : 'var(--line)',
                          background: tickets === n ? 'rgba(249,115,22,0.18)' : 'transparent',
                        }}
                        onClick={() => setTickets(n)}
                        disabled={submitting}
                      >
                        {n} {n === 1 ? 'ticket' : 'tickets'}
                      </button>
                    ))}
                  </div>

                  <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--muted)' }}>
                    {event.availableSeats} seats remaining for this event
                  </div>
                </div>

                {/* Price Summary Breakdown */}
                <div
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--line)',
                    borderRadius: '1rem',
                    padding: '1rem',
                    display: 'grid',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)' }}>
                    <span>Price per ticket</span>
                    <span>{price === 0 ? 'Free' : `₹${price.toLocaleString('en-IN')}`}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)' }}>
                    <span>Tickets quantity</span>
                    <span>× {tickets}</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      borderTop: '1px solid var(--line)',
                      paddingTop: '0.5rem',
                      fontWeight: 700,
                      fontSize: '1.15rem',
                    }}
                  >
                    <span>Total Amount</span>
                    <strong style={{ color: 'var(--primary)' }}>
                      {total === 0 ? 'Free' : `₹${total.toLocaleString('en-IN')}`}
                    </strong>
                  </div>
                </div>

                {/* Modal Actions */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    className="button secondary"
                    style={{ flex: 1 }}
                    onClick={() => setShowBookingModal(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="button primary"
                    style={{ flex: 1.5 }}
                    onClick={handleConfirmBooking}
                    disabled={submitting}
                  >
                    {submitting ? 'Reserving...' : `Confirm Booking (${tickets})`}
                  </button>
                </div>
              </>
            ) : (
              /* Success Screen */
              <div style={{ textAlign: 'center', display: 'grid', gap: '1rem', padding: '1rem 0' }}>
                <div style={{ fontSize: '3rem' }}>🎉</div>
                <div>
                  <h2 style={{ margin: '0 0 0.5rem 0' }}>Booking Confirmed!</h2>
                  <p style={{ color: 'var(--muted)', margin: 0 }}>
                    You have reserved <strong>{confirmedBooking.numberOfTickets} ticket(s)</strong> for{' '}
                    <strong>{confirmedBooking.eventName}</strong>.
                  </p>
                </div>

                <div
                  style={{
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.25)',
                    borderRadius: '1rem',
                    padding: '1rem',
                  }}
                >
                  <span style={{ fontSize: '0.85rem', color: '#b3ffd0' }}>Reservation Reference</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '0.08em', marginTop: '0.25rem' }}>
                    {confirmedBooking.bookingReference}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <Link
                    className="button primary"
                    style={{ flex: 1 }}
                    to={`/bookings/${confirmedBooking.id}`}
                  >
                    View Ticket Pass →
                  </Link>
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() => setShowBookingModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
