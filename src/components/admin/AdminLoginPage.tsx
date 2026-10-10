import { useEffect, useState, type FormEvent } from 'react'
import { adminLogin, adminSession } from '../../lib/catalog'

export default function AdminLoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => { adminSession().then(session => { if (session.authenticated) window.location.replace('/admin') }).catch(() => {}) }, [])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setError('')
    try {
      await adminLogin(username, password)
      window.location.replace('/admin')
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to sign in.') }
    finally { setBusy(false) }
  }

  return <main className="admin-auth section">
    <div className="admin-auth-card">
      <a className="admin-back" href="/">← Storefront</a>
      <span className="eyebrow">Maison Élara · Administration</span>
      <h1>Admin sign in.</h1>
      <form className="admin-form" onSubmit={submit}>
        <label className="field"><span>Username</span><input autoComplete="username" value={username} onChange={event => setUsername(event.target.value)} required /></label>
        <label className="field"><span>Password</span><input type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required /></label>
        {error && <p className="admin-error" role="alert">{error}</p>}
        <button className="cta-btn solid w-100" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  </main>
}
