import React, { useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

const COPY = {
  en: {
    formLabel: 'Surplox Access',
    signInTitle: 'Sign in to your local trade network',
    signUpTitle: 'Create your Surplox account',
    signInIntro:
      'Get back to nearby opportunities, crew activity, alerts, profile visibility, and local construction connections.',
    signUpIntro:
      'Join Surplox to post crew needs, discover nearby work, stay visible in your trade, and build stronger local connections.',

    email: 'Email',
    password: 'Password',
    emailPlaceholder: 'you@email.com',
    passwordPlaceholder: 'Enter your password',
    signInButton: 'Sign In',
    signUpButton: 'Create Account',
    wait: 'Please wait…',
    switchToSignUp: 'Need an account? Sign up',
    switchToSignIn: 'Already have an account? Sign in',
    checkEmail: 'Check your email to confirm your account.',
    authError: 'Unable to sign in right now.',

    sideBadge: 'Why Surplox',
    sideTitle: 'Construction moves through people. Surplox keeps them connected.',
    sideBody:
      'Surplox gives the field one place to stay visible, respond faster, and build stronger local momentum without relying on scattered calls, texts, and word of mouth alone.',

    point1Title: 'Nearby trade activity',
    point1Body:
      'Follow the work happening around your market based on ZIP code, radius, and trade relevance.',

    point2Title: 'Crew posts and opportunities',
    point2Body:
      'Post labor needs, discover available workers, and move faster when it is time to fill jobs.',

    point3Title: 'Profiles that carry weight',
    point3Body:
      'Show role, trade, travel radius, and availability so the right people can find you more easily.',

    point4Title: 'Alerts and repeat connections',
    point4Body:
      'Stay on top of replies, joins, hires, and local activity that can turn into future work.',

    footer:
      'Built for laborers, subcontractors, contractors, and suppliers.'
  },
  es: {
    formLabel: 'Acceso a Surplox',
    signInTitle: 'Inicia sesión en tu red local del oficio',
    signUpTitle: 'Crea tu cuenta de Surplox',
    signInIntro:
      'Vuelve a oportunidades cercanas, actividad de cuadrillas, alertas, visibilidad de perfil y conexiones locales de construcción.',
    signUpIntro:
      'Únete a Surplox para publicar necesidades de cuadrilla, descubrir trabajo cercano, mantenerte visible en tu oficio y construir conexiones locales más fuertes.',

    email: 'Correo electrónico',
    password: 'Contraseña',
    emailPlaceholder: 'tu@email.com',
    passwordPlaceholder: 'Ingresa tu contraseña',
    signInButton: 'Iniciar sesión',
    signUpButton: 'Crear cuenta',
    wait: 'Espera…',
    switchToSignUp: '¿Necesitas cuenta? Regístrate',
    switchToSignIn: '¿Ya tienes cuenta? Inicia sesión',
    checkEmail: 'Revisa tu correo para confirmar tu cuenta.',
    authError: 'No se pudo iniciar sesión en este momento.',

    sideBadge: 'Por qué Surplox',
    sideTitle: 'La construcción se mueve por personas. Surplox las mantiene conectadas.',
    sideBody:
      'Surplox le da al campo un solo lugar para mantenerse visible, responder más rápido y crear impulso local sin depender solo de llamadas, mensajes y recomendaciones.',

    point1Title: 'Actividad cercana del oficio',
    point1Body:
      'Sigue el trabajo que sucede alrededor de tu mercado según ZIP, radio y relevancia del oficio.',

    point2Title: 'Publicaciones de cuadrilla y oportunidades',
    point2Body:
      'Publica necesidades de personal, descubre trabajadores disponibles y avanza más rápido al llenar puestos.',

    point3Title: 'Perfiles con peso',
    point3Body:
      'Muestra rol, oficio, radio de trabajo y disponibilidad para que la gente correcta te encuentre más fácil.',

    point4Title: 'Alertas y conexiones repetidas',
    point4Body:
      'Mantente al tanto de respuestas, uniones, contrataciones y actividad local que puede convertirse en trabajo futuro.',

    footer:
      'Hecho para trabajadores, subcontratistas, contratistas y proveedores.'
  }
}

export default function Auth({ lang = 'en' }) {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const copy = COPY[lang] || COPY.en

  const points = useMemo(
    () => [
      { title: copy.point1Title, body: copy.point1Body },
      { title: copy.point2Title, body: copy.point2Body },
      { title: copy.point3Title, body: copy.point3Body },
      { title: copy.point4Title, body: copy.point4Body }
    ],
    [copy]
  )

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

        setMsg(copy.checkEmail)
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) throw error

        navigate('/feed', { replace: true })
      }
    } catch (err) {
      setMsg(err.message || copy.authError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid two" style={{ gap: 16, alignItems: 'stretch' }}>
      <div
        className="card"
        style={{
          borderColor: 'rgba(255, 222, 89, 0.3)',
          background:
            'linear-gradient(180deg, rgba(10,14,24,0.98) 0%, rgba(8,11,18,0.98) 100%)',
          boxShadow: '0 0 30px rgba(255, 222, 89, 0.07)'
        }}
      >
        <div
          className="badge"
          style={{
            marginBottom: 14,
            color: '#ff751f',
            borderColor: 'rgba(255, 222, 89, 0.55)',
            background: 'rgba(255, 222, 89, 0.12)'
          }}
        >
          {copy.sideBadge}
        </div>

        <div className="h1" style={{ maxWidth: 680 }}>
          {copy.sideTitle}
        </div>

        <p className="muted" style={{ marginTop: 12, maxWidth: 720 }}>
          {copy.sideBody}
        </p>

        <div className="grid" style={{ gap: 10, marginTop: 18 }}>
          {points.map((item) => (
            <div
              key={item.title}
              className="card card-soft"
              style={{
                borderColor: 'rgba(255, 222, 89, 0.2)',
                background: 'rgba(255, 222, 89, 0.04)'
              }}
            >
              <div className="card-section-title">{item.title}</div>
              <p className="card-section-subtitle" style={{ marginTop: 6 }}>
                {item.body}
              </p>
            </div>
          ))}
        </div>

        <p className="muted" style={{ marginTop: 16, marginBottom: 0 }}>
          {copy.footer}
        </p>
      </div>

      <div className="card" style={{ maxWidth: 560, width: '100%', margin: '0 auto' }}>
        <div
          className="badge"
          style={{
            marginBottom: 12,
            color: '#ff751f',
            borderColor: 'rgba(255, 222, 89, 0.45)',
            background: 'rgba(255, 222, 89, 0.08)'
          }}
        >
          {copy.formLabel}
        </div>

        <div className="h1">
          {mode === 'signup' ? copy.signUpTitle : copy.signInTitle}
        </div>

        <p className="muted" style={{ marginTop: 10 }}>
          {mode === 'signup' ? copy.signUpIntro : copy.signInIntro}
        </p>

        {msg ? (
          <div className="card card-message" style={{ marginTop: 14, marginBottom: 14 }}>
            {msg}
          </div>
        ) : null}

        <form onSubmit={handleAuth} className="grid" style={{ gap: 12, marginTop: 14 }}>
          <div>
            <div className="muted" style={{ marginBottom: 6 }}>{copy.email}</div>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={copy.emailPlaceholder}
              autoComplete="email"
            />
          </div>

          <div>
            <div className="muted" style={{ marginBottom: 6 }}>{copy.password}</div>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={copy.passwordPlaceholder}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
          </div>

          <button className="btn primary" disabled={loading}>
            {loading
              ? copy.wait
              : mode === 'signup'
                ? copy.signUpButton
                : copy.signInButton}
          </button>
        </form>

        <hr />

        <button
          className="btn"
          onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
        >
          {mode === 'signup' ? copy.switchToSignIn : copy.switchToSignUp}
        </button>
      </div>
    </div>
  )
}