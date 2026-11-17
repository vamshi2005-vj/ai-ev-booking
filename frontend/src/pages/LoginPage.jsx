import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    try {
      const user = await login(form)
      navigate(user.role === 'ADMIN' ? '/admin/dashboard' : (location.state?.from || '/dashboard'))
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="auth-shell">
      <form className="auth-card" onSubmit={submit}>
        <span className="eyebrow">Welcome back</span>
        <h1>Login</h1>
        <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {error ? <div className="error-banner">{error}</div> : null}
        <button className="button primary" type="submit">Login</button>
      </form>
    </div>
  )
}
