import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import EventCard from '../components/EventCard'

const categories = ['Technology', 'Music', 'Sports', 'Business', 'Workshops', 'Education', 'Entertainment', 'Conferences']

export default function HomePage() {
  const [featured, setFeatured] = useState([])

  useEffect(() => {
    api.get('/events').then(({ data }) => setFeatured((data.data || []).slice(0, 6))).catch(() => setFeatured([]))
  }, [])

  return (
    <div className="home-page page-stack">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Curated live experiences</span>
          <h1>Attend or host events with instant booking.</h1>
          <p>EventSphere gives attendees a fast reservation flow and empowers users to organize and publish their own live events.</p>
          <div className="hero-actions">
            <Link className="button primary" to="/events">Explore Events</Link>
            <Link className="button secondary" to="/events/new">+ Host an Event</Link>
          </div>
        </div>
        <div className="hero-panel">
          <div className="hero-metric"><strong>100%</strong><span>Real-time availability</span></div>
          <div className="hero-metric"><strong>Instant</strong><span>E-Ticket confirmations</span></div>
          <div className="hero-metric"><strong>Open</strong><span>Create & attend events</span></div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading"><h2>Popular Categories</h2><Link to="/events">Browse all</Link></div>
        <div className="chip-grid">
          {categories.map((category) => <span key={category} className="chip">{category}</span>)}
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <h2>Featured Events</h2>
          <Link to="/events">See all events</Link>
        </div>
        {featured.length === 0 ? (
          <div className="empty-state">
            <p>No events scheduled yet. Be the first to create one!</p>
            <Link className="button primary" style={{ marginTop: '0.75rem' }} to="/events/new">
              Create an Event
            </Link>
          </div>
        ) : (
          <div className="card-grid">
            {featured.map((event) => <EventCard key={event.id} event={event} />)}
          </div>
        )}
      </section>

      <section className="cta-banner">
        <div>
          <span className="eyebrow">Organizers and attendees</span>
          <h2>Manage and attend live experiences from one platform.</h2>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link className="button primary" to="/events/new">Host an Event</Link>
          <Link className="button secondary" to="/events">Browse Events</Link>
        </div>
      </section>
    </div>
  )
}
