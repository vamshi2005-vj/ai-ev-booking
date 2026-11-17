import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'

export default function ManageEventsPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadEvents = () => {
    setLoading(true)
    api
      .get('/events')
      .then(({ data }) => setEvents(data.data || []))
      .catch(() => setError('Failed to load events'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadEvents()
  }, [])

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete event "${name}"?`)) return
    try {
      await api.delete(`/events/${id}`)
      setMessage(`Event "${name}" was deleted.`)
      loadEvents()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete event')
    }
  }

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Admin</span>
          <h1>Manage Events</h1>
        </div>
        <Link className="button primary" to="/events/new">Add New Event</Link>
      </div>

      {message && <div className="success-banner">{message}</div>}
      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="empty-state">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="empty-state">
          <p>No events found in the database.</p>
          <Link className="button primary" style={{ marginTop: '1rem' }} to="/events/new">
            Create First Event
          </Link>
        </div>
      ) : (
        <div className="detail-panel" style={{ overflowX: 'auto', padding: '0.5rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--muted)' }}>
                <th style={{ padding: '0.85rem' }}>Event</th>
                <th style={{ padding: '0.85rem' }}>Category</th>
                <th style={{ padding: '0.85rem' }}>Date</th>
                <th style={{ padding: '0.85rem' }}>Location</th>
                <th style={{ padding: '0.85rem' }}>Price</th>
                <th style={{ padding: '0.85rem' }}>Seats</th>
                <th style={{ padding: '0.85rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev.id} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '0.85rem' }}>
                    <strong>{ev.eventName}</strong>
                  </td>
                  <td style={{ padding: '0.85rem' }}><span className="pill">{ev.category}</span></td>
                  <td style={{ padding: '0.85rem' }}>{ev.eventDate}</td>
                  <td style={{ padding: '0.85rem' }}>{ev.city}</td>
                  <td style={{ padding: '0.85rem' }}>
                    {Number(ev.ticketPrice) === 0 ? 'Free' : `₹${Number(ev.ticketPrice).toLocaleString('en-IN')}`}
                  </td>
                  <td style={{ padding: '0.85rem' }}>
                    {ev.availableSeats} / {ev.capacity}
                  </td>
                  <td style={{ padding: '0.85rem', display: 'flex', gap: '0.5rem' }}>
                    <Link className="button secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }} to={`/events/${ev.id}`}>
                      View
                    </Link>
                    <Link className="button secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }} to={`/events/${ev.id}/edit`}>
                      Edit
                    </Link>
                    <button
                      className="button danger"
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', background: 'rgba(239,68,68,0.15)', borderColor: 'rgba(239,68,68,0.3)', color: '#ffb3b3', cursor: 'pointer' }}
                      onClick={() => handleDelete(ev.id, ev.eventName)}
                    >
                      Delete
                    </button>
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
