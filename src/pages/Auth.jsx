import React, { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import { t } from '../i18n'

export default function Auth({ lang = 'en' }) {
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

        setMsg(t(lang, 'auth_check_email'))
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) throw error

        navigate('/feed', { replace: true })
      }
    } catch (err) {
      setMsg(err.message || t(lang, 'auth_error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ maxWidth: 520, margin: '0 auto' }}>
      <div className="h1">
        {mode === 'signup' ? t(lang, 'auth_signup_title') : t(lang, 'auth_signin_title')}
      </div>

      <p className="muted">
        {mode === 'signup' ? t(lang, 'auth_signup_intro') : t(lang, 'auth_signin_intro')}
      </p>

      <div className="card card-notice" style={{ marginBottom: 12 }}>
        <div className="card-section-title">
          {t(lang, 'auth_members_only')}
        </div>
        <p className="card-section-subtitle">
          {t(lang, 'auth_members_only_body')}
        </p>
      </div>

      {msg && (
        <div className="card card-message" style={{ marginBottom: 12 }}>
          {msg}
        </div>
      )}

      <form onSubmit={handleAuth} className="grid" style={{ gap: 10 }}>
        <div>
          <div className="muted" style={{ marginBottom: 6 }}>{t(lang, 'auth_email')}</div>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
          />
        </div>

        <div>
          <div className="muted" style={{ marginBottom: 6 }}>{t(lang, 'auth_password')}</div>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t(lang, 'auth_password')}
          />
        </div>

        <button className="btn primary" disabled={loading}>
          {loading
            ? t(lang, 'auth_wait')
            : mode === 'signup'
              ? t(lang, 'auth_create_account')
              : t(lang, 'auth_sign_in')}
        </button>
      </form>

      <hr />

      <button
        className="btn"
        onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
      >
        {mode === 'signup'
          ? t(lang, 'auth_switch_to_signin')
          : t(lang, 'auth_switch_to_signup')}
      </button>
    </div>
  )
}