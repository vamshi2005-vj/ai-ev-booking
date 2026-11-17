import { useEffect, useState } from 'react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function ProfilePage() {
  const { user: authUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({ name: '', password: '' })
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const loadProfile = () => {
    setLoading(true)
    api
      .get('/users/me')
      .then(({ data }) => {
        setProfile(data.data)
        setForm({ name: data.data?.name || '', password: '' })
      })
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadProfile()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const payload = { name: form.name }
      if (form.password) {
        payload.password = form.password
      }
      await api.put('/users/profile', payload)
      setMessage('Profile updated successfully!')
      loadProfile()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="empty-state">Loading profile...</div>
  }

  return (
    <div className="page-stack" style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div className="page-heading">
        <div>
          <span className="eyebrow">Account</span>
          <h1>My Profile</h1>
        </div>
      </div>

      {message && <div className="success-banner">{message}</div>}
      {error && <div className="error-banner">{error}</div>}

      <div className="detail-panel">
        <div className="detail-grid">
          <div>
            <span>Full Name</span>
            <strong>{profile?.name}</strong>
          </div>
          <div>
            <span>Email</span>
            <strong>{profile?.email}</strong>
          </div>
          <div>
            <span>Role</span>
            <span className="pill success">{profile?.role}</span>
          </div>
          <div>
            <span>Account Status</span>
            <span className="pill success">Active</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem' }}>
          <h3>Update Profile</h3>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>Display Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
              New Password (leave blank to keep current)
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button className="button primary" type="submit" disabled={saving}>
            {saving ? 'Updating...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
