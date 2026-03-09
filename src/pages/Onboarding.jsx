import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

const COPY = {
  en: {
    title: 'Set up your Surplox profile',
    intro:
      'This helps local crews, subcontractors, and contractors discover you and connect faster.',
    language: 'Language',
    trade: 'Primary Trade',
    role: 'Role',
    zip: 'Home ZIP Code',
    radius: 'Travel Radius (miles)',
    submit: 'Complete Setup',
    wait: 'Saving...',
    error: 'Unable to complete onboarding right now.'
  },
  es: {
    title: 'Configura tu perfil de Surplox',
    intro:
      'Esto ayuda a cuadrillas, subcontratistas y contratistas cercanos a encontrarte y conectarse más rápido.',
    language: 'Idioma',
    trade: 'Oficio principal',
    role: 'Rol',
    zip: 'Código postal',
    radius: 'Radio de viaje (millas)',
    submit: 'Completar configuración',
    wait: 'Guardando...',
    error: 'No se pudo completar la configuración.'
  }
}

export default function Onboarding({ lang = 'en', setLang }) {
  const navigate = useNavigate()
  const copy = COPY[lang] || COPY.en

  const [trade, setTrade] = useState('')
  const [role, setRole] = useState('')
  const [zip, setZip] = useState('')
  const [radius, setRadius] = useState(25)
  const [language, setLanguage] = useState(lang)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()

    setLoading(true)
    setMsg('')

    try {
      const {
        data: { session }
      } = await supabase.auth.getSession()

      if (!session?.user?.id) throw new Error('No session')

      const { error } = await supabase.from('profiles').insert({
        user_id: session.user.id,
        trade,
        role,
        home_zip: zip,
        travel_radius: radius,
        preferred_language: language
      })

      if (error) throw error

      if (typeof setLang === 'function') {
        setLang(language)
      }

      navigate('/feed', { replace: true })
    } catch (err) {
      console.error(err)
      setMsg(copy.error)
    } finally {
      setLoading(false)
    }
  }

  function handleLanguageChange(e) {
    const nextLang = e.target.value
    setLanguage(nextLang)

    if (typeof setLang === 'function') {
      setLang(nextLang)
    }
  }

  return (
    <div className="card" style={{ maxWidth: 640, margin: '0 auto' }}>
      <div className="h1">{copy.title}</div>

      <p className="muted" style={{ marginTop: 10 }}>
        {copy.intro}
      </p>

      {msg ? (
        <div className="card card-message" style={{ marginTop: 14 }}>
          {msg}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="grid" style={{ gap: 14, marginTop: 18 }}>
        <div>
          <div className="muted" style={{ marginBottom: 6 }}>
            {copy.language}
          </div>

          <select className="input" value={language} onChange={handleLanguageChange}>
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </div>

        <div>
          <div className="muted" style={{ marginBottom: 6 }}>
            {copy.trade}
          </div>

          <input
            className="input"
            value={trade}
            onChange={(e) => setTrade(e.target.value)}
            placeholder="Concrete, Framing, Electrical..."
          />
        </div>

        <div>
          <div className="muted" style={{ marginBottom: 6 }}>
            {copy.role}
          </div>

          <input
            className="input"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Laborer, Subcontractor, Foreman..."
          />
        </div>

        <div>
          <div className="muted" style={{ marginBottom: 6 }}>
            {copy.zip}
          </div>

          <input
            className="input"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            placeholder="75201"
          />
        </div>

        <div>
          <div className="muted" style={{ marginBottom: 6 }}>
            {copy.radius}
          </div>

          <input
            className="input"
            type="number"
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
          />
        </div>

        <button className="btn primary" disabled={loading}>
          {loading ? copy.wait : copy.submit}
        </button>
      </form>
    </div>
  )
}