import { useEffect, useState } from 'react'
import api from '../api/client'

export default function ManageUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const loadUsers = () => {
    setLoading(true)
    api
      .get('/admin/users')
      .then(({ data }) => setUsers(data.data || []))
      .catch(() => setError('Failed to load users'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const toggleStatus = async (id, currentActive) => {
    try {
      await api.put(`/admin/users/${id}/status?active=${!currentActive}`)
      setMessage('User status updated')
      loadUsers()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user')
    }
  }

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Admin</span>
          <h1>Manage Users</h1>
        </div>
      </div>

      {message && <div className="success-banner">{message}</div>}
      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="empty-state">Loading users...</div>
      ) : (
        <div className="detail-panel" style={{ overflowX: 'auto', padding: '0.5rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--muted)' }}>
                <th style={{ padding: '0.85rem' }}>ID</th>
                <th style={{ padding: '0.85rem' }}>Name</th>
                <th style={{ padding: '0.85rem' }}>Email</th>
                <th style={{ padding: '0.85rem' }}>Role</th>
                <th style={{ padding: '0.85rem' }}>Status</th>
                <th style={{ padding: '0.85rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '0.85rem' }}>{u.id}</td>
                  <td style={{ padding: '0.85rem' }}><strong>{u.name}</strong></td>
                  <td style={{ padding: '0.85rem' }}>{u.email}</td>
                  <td style={{ padding: '0.85rem' }}>
                    <span className={`pill ${u.role === 'ADMIN' ? 'success' : ''}`}>{u.role}</span>
                  </td>
                  <td style={{ padding: '0.85rem' }}>
                    <span className={`pill ${u.active ? 'success' : 'danger'}`}>
                      {u.active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem' }}>
                    {u.role !== 'ADMIN' && (
                      <button
                        className="button secondary"
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', cursor: 'pointer' }}
                        onClick={() => toggleStatus(u.id, u.active)}
                      >
                        {u.active ? 'Disable' : 'Enable'}
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
