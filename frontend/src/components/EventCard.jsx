import { Link } from 'react-router-dom'
import { parseEventImages } from '../utils/imageUtils'

export default function EventCard({ event }) {
  const price = Number(event.ticketPrice || 0)
  const isSoldOut = event.soldOut || event.availableSeats <= 0
  const images = parseEventImages(event.imageUrl)

  return (
    <article className="event-card">
      {images.length > 0 ? (
        <div style={{ position: 'relative' }}>
          <img
            src={images[0]}
            alt={event.eventName}
            style={{ width: '100%', display: 'block', objectFit: 'cover', aspectRatio: '16 / 10' }}
          />
          {images.length > 1 && (
            <span
              style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                background: 'rgba(0,0,0,0.75)',
                color: '#fff',
                fontSize: '0.72rem',
                fontWeight: 600,
                padding: '3px 8px',
                borderRadius: '999px',
                backdropFilter: 'blur(4px)',
              }}
            >
              📷 {images.length} photos
            </span>
          )}
        </div>
      ) : (
        <div
          style={{
            width: '100%',
            aspectRatio: '16 / 10',
            background: 'linear-gradient(135deg, rgba(249,115,22,0.18), rgba(59,130,246,0.18))',
            display: 'grid',
            placeItems: 'center',
            textAlign: 'center',
            padding: '1.25rem',
            borderBottom: '1px solid var(--line)',
          }}
        >
          <div>
            <span className="pill" style={{ fontSize: '0.75rem', marginBottom: '0.5rem', display: 'inline-block' }}>
              {event.category}
            </span>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>
              {event.eventName}
            </div>
          </div>
        </div>
      )}

      <div className="event-card-body">
        <div className="pill-row">
          <span className="pill">{event.category}</span>
          {isSoldOut ? (
            <span className="pill danger">Sold Out</span>
          ) : (
            <span className="pill success">{event.availableSeats} seats left</span>
          )}
        </div>
        <h3 style={{ margin: '0.25rem 0' }}>{event.eventName}</h3>
        <p style={{ margin: 0, fontSize: '0.88rem' }}>{event.city} • {event.venue}</p>
        <div className="event-meta" style={{ marginTop: '0.25rem' }}>
          <span>{event.eventDate}</span>
          <strong>{price === 0 ? 'Free' : `₹${price.toLocaleString('en-IN')}`}</strong>
        </div>
        <Link className="button secondary" style={{ textAlign: 'center', marginTop: '0.5rem' }} to={`/events/${event.id}`}>
          View Details & Attend
        </Link>
      </div>
    </article>
  )
}
