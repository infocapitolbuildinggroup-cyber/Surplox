import React, { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function Auth() {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  async function handleAuth(e) {
    e.preventDefault()
    setMsg('')
    setLoading(true)

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password
        })

        if (error) throw error

        setMsg('Check your email for a confirmation link, then sign in to continue.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) throw error

        navigate('/feed', { replace: true })
      }
    } catch (err) {
      setMsg(err.message || 'Unable to complete authentication right now.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ maxWidth: 520, margin: '0 auto' }}>
      <div className="h1">
        {mode === 'signup' ? 'Create Your Surplox Account' : 'Sign In to Surplox'}
      </div>

      <p className="muted">
        {mode === 'signup'
          ? 'Join the Surplox network to connect with local subcontractors and laborers across Texas.'
          : 'Access your Surplox account to browse local trade discussions and manage your profile.'}
      </p>

      <div
        className="card"
        style={{
          marginBottom: 12,
          borderColor: 'rgba(255,49,49,0.25)',
          background: 'rgba(255,49,49,0.04)'
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 6 }}>
          Members Only
        </div>
        <div className="muted">
          Surplox is built for subcontractors and laborers. No direct messaging. No public homeowner directory.
        </div>
      </div>

      {msg && (
        <div className="card" style={{ marginBottom: 12, borderColor: 'rgba(255,49,49,0.25)' }}>
          {msg}
        </div>
      )}

      <form onSubmit={handleAuth} className="grid" style={{ gap: 10 }}>
        <div>
          <div className="muted" style={{ marginBottom: 6 }}>Email</div>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
          />
        </div>

        <div>
          <div className="muted" style={{ marginBottom: 6 }}>Password</div>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </div>

        <button className="btn primary" disabled={loading}>
          {loading
            ? 'Please wait…'
            : mode === 'signup'
              ? 'Create Account'
              : 'Sign In'}
        </button>
      </form>

      <hr />

      <button
        className="btn"
        onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
      >
        {mode === 'signup'
          ? 'Already have an account? Sign In'
          : 'New to Surplox? Create an Account'}
      </button>
    </div>
  )
}