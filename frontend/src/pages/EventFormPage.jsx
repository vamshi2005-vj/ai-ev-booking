import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { parseEventImages } from '../utils/imageUtils'

const CATEGORIES = [
  'Technology',
  'Music',
  'Business',
  'Workshops',
  'Conferences',
  'Sports',
  'Entertainment',
  'Meetup',
  'Education',
  'Other',
]

// Compress single image to high quality lightweight data URL
function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const maxDimension = 1200
        let { width, height } = img
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          } else {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function EventFormPage({ mode = 'create' }) {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    eventName: '',
    category: 'Technology',
    eventDate: '',
    startTime: '10:00:00',
    endTime: '17:00:00',
    venue: '',
    city: '',
    organizerName: user?.name || 'EventSphere Organizer',
    ticketPrice: '0',
    capacity: '100',
    description: '',
    status: 'ACTIVE',
  })

  // Array of uploaded images from computer (starts completely empty, no defaults)
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(mode === 'edit')
  const [processingImages, setProcessingImages] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (mode === 'edit' && id) {
      api
        .get(`/events/${id}`)
        .then(({ data }) => {
          const ev = data.data
          setForm({
            eventName: ev.eventName || '',
            category: ev.category || 'Technology',
            eventDate: ev.eventDate || '',
            startTime: ev.startTime ? ev.startTime.slice(0, 8) : '10:00:00',
            endTime: ev.endTime ? ev.endTime.slice(0, 8) : '17:00:00',
            venue: ev.venue || '',
            city: ev.city || '',
            organizerName: ev.organizerName || user?.name || '',
            ticketPrice: String(ev.ticketPrice || '0'),
            capacity: String(ev.capacity || '100'),
            description: ev.description || '',
            status: ev.status || 'ACTIVE',
          })
          setImages(parseEventImages(ev.imageUrl))
        })
        .catch(() => setError('Failed to load event data'))
        .finally(() => setLoading(false))
    }
  }, [mode, id, user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  // Handle uploading multiple photos from computer
  const handleFilesChange = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setProcessingImages(true)
    setError('')

    try {
      const validFiles = files.filter((f) => f.type.startsWith('image/'))
      if (validFiles.length === 0) {
        setError('Please select valid image files (PNG, JPG, JPEG, WEBP)')
        setProcessingImages(false)
        return
      }

      const compressedList = await Promise.all(validFiles.map((file) => compressImage(file)))
      setImages((prev) => [...prev, ...compressedList])
    } catch (err) {
      setError('Error processing selected photos')
    } finally {
      setProcessingImages(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removeImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove))
  }

  const makeCoverImage = (indexToPromote) => {
    if (indexToPromote === 0) return
    setImages((prev) => {
      const copy = [...prev]
      const [item] = copy.splice(indexToPromote, 1)
      copy.unshift(item)
      return copy
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const payload = {
      ...form,
      imageUrl: images.length > 0 ? JSON.stringify(images) : '',
      ticketPrice: parseFloat(form.ticketPrice) || 0,
      capacity: parseInt(form.capacity, 10) || 1,
      startTime: form.startTime.length === 5 ? `${form.startTime}:00` : form.startTime,
      endTime: form.endTime.length === 5 ? `${form.endTime}:00` : form.endTime,
    }

    try {
      if (mode === 'edit') {
        await api.put(`/events/${id}`, payload)
        navigate(`/events/${id}`)
      } else {
        const { data } = await api.post('/events', payload)
        navigate(data.data?.id ? `/events/${data.data.id}` : '/events')
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save event')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="empty-state">Loading event...</div>
  }

  return (
    <div className="page-stack" style={{ maxWidth: '820px', margin: '0 auto' }}>
      <div className="page-heading">
        <div>
          <span className="eyebrow">{mode === 'edit' ? 'Update Event' : 'New Event'}</span>
          <h1>{mode === 'edit' ? 'Edit Event' : 'Create an Event'}</h1>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <form className="detail-panel" onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Event Title *</label>
          <input
            name="eventName"
            placeholder="e.g. AI & Robotics Expo 2026"
            value={form.eventName}
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Category *</label>
            <select name="category" value={form.category} onChange={handleChange}>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Date *</label>
            <input
              type="date"
              name="eventDate"
              value={form.eventDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Start Time *</label>
            <input
              type="time"
              name="startTime"
              value={form.startTime.slice(0, 5)}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>End Time *</label>
            <input
              type="time"
              name="endTime"
              value={form.endTime.slice(0, 5)}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Venue / Location *</label>
            <input
              name="venue"
              placeholder="e.g. HITEX Exhibition Centre / Virtual Link"
              value={form.venue}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>City *</label>
            <input
              name="city"
              placeholder="e.g. Hyderabad, Bengaluru, Mumbai"
              value={form.city}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Ticket Price (₹) *</label>
            <input
              type="number"
              min="0"
              step="1"
              name="ticketPrice"
              placeholder="0 for free"
              value={form.ticketPrice}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Total Capacity *</label>
            <input
              type="number"
              min="1"
              name="capacity"
              placeholder="e.g. 250"
              value={form.capacity}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Organizer Name *</label>
            <input
              name="organizerName"
              placeholder="Host / Company"
              value={form.organizerName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Multiple Photo Upload from Computer */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontWeight: 600 }}>
              Event Photos ({images.length} uploaded)
            </label>
            {images.length > 0 && (
              <small style={{ color: 'var(--muted)' }}>First photo is the cover photo</small>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFilesChange}
          />

          {images.length > 0 ? (
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                  gap: '0.75rem',
                }}
              >
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    style={{
                      position: 'relative',
                      borderRadius: '0.75rem',
                      overflow: 'hidden',
                      border: idx === 0 ? '2px solid var(--primary)' : '1px solid var(--line)',
                      background: 'rgba(0,0,0,0.3)',
                    }}
                  >
                    <img
                      src={img}
                      alt={`Upload ${idx + 1}`}
                      style={{ width: '100%', height: '110px', objectFit: 'cover', display: 'block' }}
                    />

                    {idx === 0 && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '4px',
                          left: '4px',
                          background: 'var(--primary)',
                          color: '#fff',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        COVER
                      </span>
                    )}

                    <div
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        display: 'flex',
                        gap: '2px',
                      }}
                    >
                      <button
                        type="button"
                        title="Remove photo"
                        onClick={() => removeImage(idx)}
                        style={{
                          background: 'rgba(0,0,0,0.7)',
                          color: '#ff8a8a',
                          border: 'none',
                          borderRadius: '50%',
                          width: '22px',
                          height: '22px',
                          cursor: 'pointer',
                          display: 'grid',
                          placeItems: 'center',
                          fontSize: '0.75rem',
                        }}
                      >
                        ✕
                      </button>
                    </div>

                    {idx !== 0 && (
                      <button
                        type="button"
                        onClick={() => makeCoverImage(idx)}
                        style={{
                          position: 'absolute',
                          bottom: '4px',
                          left: '4px',
                          right: '4px',
                          background: 'rgba(0,0,0,0.75)',
                          color: '#e2e8f0',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '0.65rem',
                          padding: '2px 4px',
                          cursor: 'pointer',
                        }}
                      >
                        Make Cover
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button
                  type="button"
                  className="button secondary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={processingImages}
                >
                  {processingImages ? 'Optimizing...' : '＋ Add More Photos'}
                </button>
                <button
                  type="button"
                  className="ghost-button"
                  style={{ fontSize: '0.8rem', color: '#ff8a8a' }}
                  onClick={() => setImages([])}
                >
                  Clear All Photos
                </button>
              </div>
            </div>
          ) : (
            <div
              style={{
                border: '2px dashed var(--line)',
                borderRadius: '1.25rem',
                padding: '2rem 1.5rem',
                textAlign: 'center',
                background: 'rgba(255,255,255,0.02)',
                cursor: 'pointer',
                display: 'grid',
                gap: '0.5rem',
                placeItems: 'center',
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <div style={{ fontSize: '2.5rem' }}>📷</div>
              <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>
                Click to Select Photos from Your Computer
              </div>
              <small style={{ color: 'var(--muted)' }}>
                You can select multiple photos at once (PNG, JPG, JPEG, WEBP)
              </small>
              <button
                type="button"
                className="button secondary"
                style={{ marginTop: '0.5rem', padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
                onClick={(e) => {
                  e.stopPropagation()
                  fileInputRef.current?.click()
                }}
                disabled={processingImages}
              >
                {processingImages ? 'Optimizing...' : '📁 Browse Multiple Photos'}
              </button>
            </div>
          )}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Description</label>
          <textarea
            name="description"
            rows={4}
            placeholder="Describe what attendees can expect, key speakers, schedule, etc."
            value={form.description}
            onChange={handleChange}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
          <button className="button primary" type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : mode === 'edit' ? 'Update Event' : 'Publish Event'}
          </button>
          <button className="button secondary" type="button" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
