import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import EventCard from '../components/EventCard'

export default function EventsPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ keyword: '', category: '', city: '', sort: 'date' })

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => value && params.append(key, value))
    api
      .get(`/events?${params.toString()}`)
      .then(({ data }) => setEvents(data.data || []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }, [filters])

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Discover & Attend</span>
          <h1>Events</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link className="button primary" to="/events/new">+ Host an Event</Link>
          <Link className="button secondary" to="/bookings">My Bookings</Link>
        </div>
      </div>

      <div className="filter-bar">
        <input
          placeholder="Search by event or venue"
          value={filters.keyword}
          onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
        />
        <input
          placeholder="Filter category"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        />
        <input
          placeholder="Filter city"
          value={filters.city}
          onChange={(e) => setFilters({ ...filters, city: e.target.value })}
        />
        <select value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}>
          <option value="date">Sort by Date</option>
          <option value="price">Sort by Price</option>
        </select>
      </div>

      {loading ? (
        <div className="empty-state">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="empty-state">
          <p>No events found matching your criteria.</p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button
              className="button secondary"
              onClick={() => setFilters({ keyword: '', category: '', city: '', sort: 'date' })}
            >
              Clear Filters
            </button>
            <Link className="button primary" to="/events/new">
              Create an Event
            </Link>
          </div>
        </div>
      ) : (
        <div className="card-grid">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}
