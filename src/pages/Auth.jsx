import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate, useSearchParams } from 'react-router-dom'

const GENERAL_CONSTRUCTION_OPTION = {
  id: 'general-construction',
  name: 'General Construction'
}

const CHANNEL_TRADE_FALLBACKS = [
  'Concrete & Flatwork',
  'Drywall',
  'Electrical',
  'Fencing & Gates',
  'Framing & Carpentry',
  'HVAC',
  'Masonry',
  'Painting',
  'Plumbing',
  'Roofing',
  'Sitework & Excavation',
  'Welding & Fabrication'
]

const COPY = {
  en: {
    formLabel: 'Surplox Access',
    signInTitle: 'Sign in to your local trade network',
    signUpTitle: 'Create your Surplox account in 3 quick steps',
    signInIntro:
      'Get back to nearby opportunities, crew activity, alerts, profile visibility, and local construction connections.',
    signUpIntro:
      'Fast signup for workers, crews, and local trade connections. Get into the app first and finish the rest later.',
    previewTitle: 'Fast Entry',
    previewBody:
      'Surplox now gets workers in fast: name, trade, ZIP, then straight into the feed.',
    previewBullet1: 'Join in a few taps',
    previewBullet2: 'Find crews and nearby work',
    previewBullet3: 'Finish the rest later',
    previewFree: 'Free for workers.',
    previewTexas: 'Built for local construction networks.',
    languageLabel: 'Language',
    languageEnglish: 'English',
    languageSpanish: 'Español',
    email: 'Email',
    password: 'Password',
    emailPlaceholder: 'you@email.com',
    passwordPlaceholder: 'Create a password',
    signInButton: 'Sign In',
    wait: 'Please wait…',
    switchToSignUp: 'Need an account? Sign up',
    switchToSignIn: 'Already have an account? Sign in',
    authError: 'Unable to complete authentication right now.',
    sideBadge: 'Why Surplox',
    sideTitle: 'Construction moves through people. Surplox keeps them connected.',
    sideBody:
      'Surplox gives the field one place to stay visible, respond faster, and build stronger local momentum without relying only on scattered calls, texts, and word of mouth.',
    point1Title: 'Nearby trade activity',
    point1Body:
      'Follow local work and conversations based on ZIP code, radius, and trade relevance.',
    point2Title: 'Crew posts and opportunities',
    point2Body:
      'Post labor needs, discover available workers, and move faster when it is time to fill jobs.',
    point3Title: 'Profiles that carry weight',
    point3Body: 'Show your trade and area so the right people can find you.',
    point4Title: 'Alerts and repeat connections',
    point4Body:
      'Stay on top of replies, joins, hires, and local activity that can turn into future work.',
    footer: 'Built for laborers, subcontractors, contractors, and suppliers.',
    step: 'Step',
    next: 'Next',
    back: 'Back',
    finish: 'Enter Surplox',
    nameLabel: 'What’s your name?',
    namePlaceholder: 'Juan Martinez',
    tradeLabel: 'What trade do you work in?',
    tradePlaceholder: 'Select your trade',
    generalConstruction: 'General Construction',
    tradesLoading: 'Loading trades…',
    tradesUnavailable: 'Trades unavailable right now. Showing Surplox default trades.',
    zipLabel: 'What ZIP do you usually work in?',
    zipPlaceholder: '76102',
    tradeRequired: 'Select your trade.',
    zipRequired: 'Enter a valid 5-digit ZIP code.',
    nameRequired: 'Enter your name.',
    emailRequired: 'Enter a valid email address.',
    passwordRequired: 'Password must be at least 6 characters.',
    signUpSuccess: 'Your account is ready.'
  },
  es: {
    formLabel: 'Acceso a Surplox',
    signInTitle: 'Inicia sesión en tu red local del oficio',
    signUpTitle: 'Crea tu cuenta de Surplox en 3 pasos rápidos',
    signInIntro:
      'Vuelve a oportunidades cercanas, actividad de cuadrillas, alertas, visibilidad de perfil y conexiones locales de construcción.',
    signUpIntro:
      'Registro rápido para trabajadores, cuadrillas y conexiones locales del oficio. Entra a la app primero y completa lo demás después.',
    previewTitle: 'Entrada rápida',
    previewBody:
      'Surplox ahora deja entrar rápido a los trabajadores: nombre, oficio, ZIP y directo al feed.',
    previewBullet1: 'Únete en pocos toques',
    previewBullet2: 'Encuentra cuadrillas y trabajo cercano',
    previewBullet3: 'Completa lo demás después',
    previewFree: 'Gratis para trabajadores.',
    previewTexas: 'Hecho para redes locales de construcción.',
    languageLabel: 'Idioma',
    languageEnglish: 'English',
    languageSpanish: 'Español',
    email: 'Correo electrónico',
    password: 'Contraseña',
    emailPlaceholder: 'tu@email.com',
    passwordPlaceholder: 'Crea una contraseña',
    signInButton: 'Iniciar sesión',
    wait: 'Espera…',
    switchToSignUp: '¿Necesitas cuenta? Regístrate',
    switchToSignIn: '¿Ya tienes cuenta? Inicia sesión',
    authError: 'No se pudo completar la autenticación en este momento.',
    sideBadge: 'Por qué Surplox',
    sideTitle: 'La construcción se mueve por personas. Surplox las mantiene conectadas.',
    sideBody:
      'Surplox le da al campo un solo lugar para mantenerse visible, responder más rápido y crear impulso local sin depender solo de llamadas, mensajes y recomendaciones.',
    point1Title: 'Actividad cercana del oficio',
    point1Body:
      'Sigue el trabajo y las conversaciones locales según código postal, radio y relevancia del oficio.',
    point2Title: 'Publicaciones de cuadrilla y oportunidades',
    point2Body:
      'Publica necesidades de personal, descubre trabajadores disponibles y avanza más rápido al llenar puestos.',
    point3Title: 'Perfiles con peso',
    point3Body: 'Muestra tu oficio y tu zona para que la gente correcta te encuentre.',
    point4Title: 'Alertas y conexiones repetidas',
    point4Body:
      'Mantente al tanto de respuestas, uniones, contrataciones y actividad local que puede convertirse en trabajo futuro.',
    footer: 'Hecho para trabajadores, subcontratistas, contratistas y proveedores.',
    step: 'Paso',
    next: 'Siguiente',
    back: 'Atrás',
    finish: 'Entrar a Surplox',
    nameLabel: '¿Cómo te llamas?',
    namePlaceholder: 'Juan Martinez',
    tradeLabel: '¿Qué oficio trabajas?',
    tradePlaceholder: 'Selecciona tu oficio',
    generalConstruction: 'Construcción general',
    tradesLoading: 'Cargando oficios…',
    tradesUnavailable: 'Los oficios no están disponibles en este momento. Mostrando oficios predeterminados de Surplox.',
    zipLabel: '¿En qué ZIP trabajas normalmente?',
    zipPlaceholder: '76102',
    tradeRequired: 'Selecciona tu oficio.',
    zipRequired: 'Ingresa un ZIP válido de 5 dígitos.',
    nameRequired: 'Ingresa tu nombre.',
    emailRequired: 'Ingresa un correo válido.',
    passwordRequired: 'La contraseña debe tener al menos 6 caracteres.',
    signUpSuccess: 'Tu cuenta está lista.'
  }
}

function normalizeMode(value) {
  return value === 'signin' ? 'signin' : 'signup'
}

function dedupeTradeOptions(dynamicTrades) {
  const seen = new Set()
  const result = []

  const addOption = (option) => {
    const key = String(option.name || '').trim().toLowerCase()
    if (!key || seen.has(key)) return
    seen.add(key)
    result.push(option)
  }

  addOption(GENERAL_CONSTRUCTION_OPTION)

  ;(dynamicTrades || []).forEach((trade) => {
    addOption({
      id: trade.id,
      name: trade.name
    })
  })

  CHANNEL_TRADE_FALLBACKS.forEach((name) => {
    addOption({
      id: `fallback:${name}`,
      name
    })
  })

  return result
}

export default function Auth({ lang = 'en', setLang }) {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [mode, setMode] = useState(normalizeMode(searchParams.get('mode')))
  const [step, setStep] = useState(1)
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [tradesLoading, setTradesLoading] = useState(true)
  const [tradesError, setTradesError] = useState('')
  const [tradeOptions, setTradeOptions] = useState([])

  const [signInForm, setSignInForm] = useState({
    email: '',
    password: ''
  })

  const [signUpForm, setSignUpForm] = useState({
    display_name: '',
    trade_id: '',
    home_zip: '',
    email: '',
    password: ''
  })

  const copy = COPY[lang] || COPY.en

  useEffect(() => {
    setMode(normalizeMode(searchParams.get('mode')))
  }, [searchParams])

  useEffect(() => {
    async function loadTrades() {
      setTradesLoading(true)
      setTradesError('')

      try {
        const { data, error } = await supabase
          .from('trades')
          .select('id,name')
          .order('name')

        if (error) {
          console.error(error)
          setTradesError(copy.tradesUnavailable)
          setTradeOptions(dedupeTradeOptions([]))
          return
        }

        setTradeOptions(dedupeTradeOptions(data || []))
      } catch (err) {
        console.error(err)
        setTradesError(copy.tradesUnavailable)
        setTradeOptions(dedupeTradeOptions([]))
      } finally {
        setTradesLoading(false)
      }
    }

    loadTrades()
  }, [copy.tradesUnavailable])

  const points = useMemo(
    () => [
      { title: copy.point1Title, body: copy.point1Body },
      { title: copy.point2Title, body: copy.point2Body },
      { title: copy.point3Title, body: copy.point3Body },
      { title: copy.point4Title, body: copy.point4Body }
    ],
    [copy]
  )

  function switchMode(nextMode) {
    const normalized = normalizeMode(nextMode)
    setMode(normalized)
    setMsg('')
    setStep(1)
    setSearchParams({ mode: normalized }, { replace: true })
  }

  function handleLanguageChange(e) {
    const nextLang = e.target.value
    if (typeof setLang === 'function') {
      setLang(nextLang)
    }
  }

  function validateStep(nextStep = step) {
    if (mode !== 'signup') return true

    if (nextStep === 1) {
      if (!signUpForm.display_name.trim()) {
        setMsg(copy.nameRequired)
        return false
      }
    }

    if (nextStep === 2) {
      if (!signUpForm.trade_id) {
        setMsg(copy.tradeRequired)
        return false
      }
    }

    if (nextStep === 3) {
      if (!/^[0-9]{5}$/.test(signUpForm.home_zip)) {
        setMsg(copy.zipRequired)
        return false
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signUpForm.email.trim())) {
        setMsg(copy.emailRequired)
        return false
      }

      if (String(signUpForm.password || '').length < 6) {
        setMsg(copy.passwordRequired)
        return false
      }
    }

    setMsg('')
    return true
  }

  function goNext() {
    if (!validateStep(step)) return
    setStep((prev) => Math.min(prev + 1, 3))
  }

  function goBack() {
    setMsg('')
    setStep((prev) => Math.max(prev - 1, 1))
  }

  function setSignUpField(key, value) {
    setSignUpForm((prev) => ({ ...prev, [key]: value }))
  }

  function setSignInField(key, value) {
    setSignInForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSignIn(e) {
    e.preventDefault()
    setMsg('')
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: signInForm.email.trim(),
        password: signInForm.password
      })

      if (error) throw error

      navigate('/feed', { replace: true })
    } catch (err) {
      console.error(err)
      setMsg(err.message || copy.authError)
    } finally {
      setLoading(false)
    }
  }

  async function resolveTradeId(selectedTradeValue) {
    if (selectedTradeValue === GENERAL_CONSTRUCTION_OPTION.id) {
      return { tradeId: null, isGeneralConstruction: true }
    }

    const exactOption = tradeOptions.find(
      (option) => String(option.id) === String(selectedTradeValue)
    )

    if (!exactOption) {
      return { tradeId: null, isGeneralConstruction: false }
    }

    if (!String(exactOption.id).startsWith('fallback:')) {
      return {
        tradeId: Number(exactOption.id),
        isGeneralConstruction: false
      }
    }

    const { data, error } = await supabase
      .from('trades')
      .select('id,name')
      .ilike('name', exactOption.name)
      .limit(1)

    if (error) throw error

    const resolvedTrade = data?.[0]
    if (!resolvedTrade?.id) {
      throw new Error(copy.tradeRequired)
    }

    return {
      tradeId: Number(resolvedTrade.id),
      isGeneralConstruction: false
    }
  }

  async function handleSignUpSubmit(e) {
    e.preventDefault()
    if (!validateStep(3)) return

    setMsg('')
    setLoading(true)

    try {
      const signupEmail = signUpForm.email.trim().toLowerCase()

      const { data: signupData, error: signUpError } = await supabase.auth.signUp({
        email: signupEmail,
        password: signUpForm.password
      })

      if (signUpError) throw signUpError

      let user = signupData.user

      if (!signupData.session) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: signupEmail,
          password: signUpForm.password
        })

        if (signInError) throw signInError
        user = signInData.user
      }

      if (!user?.id) {
        throw new Error(copy.authError)
      }

      const rawName = signUpForm.display_name.trim()
      const nameParts = rawName.split(/\s+/).filter(Boolean)
      const firstName = nameParts[0] || rawName
      const lastName = nameParts.slice(1).join(' ')

      const { tradeId, isGeneralConstruction } = await resolveTradeId(signUpForm.trade_id)

      const { error: profileError } = await supabase.from('profiles').upsert({
        user_id: user.id,
        display_name: rawName,
        first_name: firstName,
        last_name: lastName,
        role: 'laborer',
        trade_id: tradeId,
        travel_radius_miles: 50,
        crew_size: 1,
        bio: isGeneralConstruction ? copy.generalConstruction : '',
        preferred_language: lang
      })

      if (profileError) throw profileError

      const { error: zipErr } = await supabase.rpc('set_my_home_zip', {
        p_zip: signUpForm.home_zip
      })

      if (zipErr) throw zipErr

      localStorage.setItem('surplox_lang', lang)
      setMsg(copy.signUpSuccess)
      navigate('/feed', { replace: true })
    } catch (err) {
      console.error(err)
      setMsg(err.message || copy.authError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card" style={{ maxWidth: 620, width: '100%', margin: '0 auto' }}>
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

        <div style={{ marginTop: 14 }}>
          <div className="muted" style={{ marginBottom: 6 }}>{copy.languageLabel}</div>
          <select className="input" value={lang} onChange={handleLanguageChange}>
            <option value="en">{copy.languageEnglish}</option>
            <option value="es">{copy.languageSpanish}</option>
          </select>
        </div>

        {msg ? (
          <div className="card card-message" style={{ marginTop: 14 }}>
            {msg}
          </div>
        ) : null}

        {mode === 'signin' ? (
          <form onSubmit={handleSignIn} style={{ marginTop: 16 }}>
            <div className="grid" style={{ gap: 12 }}>
              <div>
                <div className="muted" style={{ marginBottom: 6 }}>{copy.email}</div>
                <input
                  className="input"
                  type="email"
                  placeholder={copy.emailPlaceholder}
                  value={signInForm.email}
                  onChange={(e) => setSignInField('email', e.target.value)}
                />
              </div>

              <div>
                <div className="muted" style={{ marginBottom: 6 }}>{copy.password}</div>
                <input
                  className="input"
                  type="password"
                  placeholder={copy.passwordPlaceholder}
                  value={signInForm.password}
                  onChange={(e) => setSignInField('password', e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn primary" type="submit" disabled={loading}>
                {loading ? copy.wait : copy.signInButton}
              </button>

              <button
                className="btn"
                type="button"
                onClick={() => switchMode('signup')}
                disabled={loading}
              >
                {copy.switchToSignUp}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSignUpSubmit} style={{ marginTop: 16 }}>
            <div className="badge" style={{ marginBottom: 12 }}>
              {copy.step} {step} / 3
            </div>

            {step === 1 ? (
              <div className="grid" style={{ gap: 12 }}>
                <div>
                  <div className="muted" style={{ marginBottom: 6 }}>{copy.nameLabel}</div>
                  <input
                    className="input"
                    placeholder={copy.namePlaceholder}
                    value={signUpForm.display_name}
                    onChange={(e) => setSignUpField('display_name', e.target.value)}
                  />
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="grid" style={{ gap: 12 }}>
                <div>
                  <div className="muted" style={{ marginBottom: 6 }}>{copy.tradeLabel}</div>

                  {tradesLoading ? (
                    <div className="card card-soft">{copy.tradesLoading}</div>
                  ) : (
                    <select
                      className="input"
                      value={signUpForm.trade_id}
                      onChange={(e) => setSignUpField('trade_id', e.target.value)}
                    >
                      <option value="">{copy.tradePlaceholder}</option>
                      {tradeOptions.map((trade) => (
                        <option key={trade.id} value={trade.id}>
                          {trade.id === GENERAL_CONSTRUCTION_OPTION.id
                            ? copy.generalConstruction
                            : trade.name}
                        </option>
                      ))}
                    </select>
                  )}

                  {tradesError ? (
                    <div className="muted" style={{ marginTop: 8 }}>
                      {tradesError}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="grid" style={{ gap: 12 }}>
                <div>
                  <div className="muted" style={{ marginBottom: 6 }}>{copy.zipLabel}</div>
                  <input
                    className="input"
                    inputMode="numeric"
                    placeholder={copy.zipPlaceholder}
                    value={signUpForm.home_zip}
                    onChange={(e) => setSignUpField('home_zip', e.target.value)}
                  />
                </div>

                <div>
                  <div className="muted" style={{ marginBottom: 6 }}>{copy.email}</div>
                  <input
                    className="input"
                    type="email"
                    placeholder={copy.emailPlaceholder}
                    value={signUpForm.email}
                    onChange={(e) => setSignUpField('email', e.target.value)}
                  />
                </div>

                <div>
                  <div className="muted" style={{ marginBottom: 6 }}>{copy.password}</div>
                  <input
                    className="input"
                    type="password"
                    placeholder={copy.passwordPlaceholder}
                    value={signUpForm.password}
                    onChange={(e) => setSignUpField('password', e.target.value)}
                  />
                </div>
              </div>
            ) : null}

            <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {step > 1 ? (
                <button className="btn" type="button" onClick={goBack} disabled={loading}>
                  {copy.back}
                </button>
              ) : null}

              {step < 3 ? (
                <button className="btn primary" type="button" onClick={goNext} disabled={loading}>
                  {copy.next}
                </button>
              ) : (
                <button className="btn primary" type="submit" disabled={loading}>
                  {loading ? copy.wait : copy.finish}
                </button>
              )}

              <button
                className="btn"
                type="button"
                onClick={() => switchMode('signin')}
                disabled={loading}
              >
                {copy.switchToSignIn}
              </button>
            </div>

            <div
              className="card card-soft"
              style={{
                marginTop: 16,
                borderColor: 'rgba(255, 222, 89, 0.28)',
                background: 'rgba(255, 222, 89, 0.05)'
              }}
            >
              <div className="card-section-title">{copy.previewTitle}</div>
              <p className="card-section-subtitle" style={{ marginTop: 6 }}>
                {copy.previewBody}
              </p>

              <div className="grid" style={{ gap: 8, marginTop: 10 }}>
                <div>{copy.previewBullet1}</div>
                <div>{copy.previewBullet2}</div>
                <div>{copy.previewBullet3}</div>
              </div>

              <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className="badge">{copy.previewFree}</span>
                <span className="badge">{copy.previewTexas}</span>
              </div>
            </div>
          </form>
        )}
      </div>

      <div className="card" style={{ maxWidth: 920, margin: '0 auto', width: '100%' }}>
        <div
          className="badge"
          style={{
            marginBottom: 12,
            color: '#ff751f',
            borderColor: 'rgba(255, 222, 89, 0.45)',
            background: 'rgba(255, 222, 89, 0.08)'
          }}
        >
          {copy.sideBadge}
        </div>

        <div className="h2" style={{ fontSize: 28, marginBottom: 12 }}>
          {copy.sideTitle}
        </div>

        <p className="muted" style={{ maxWidth: 860 }}>
          {copy.sideBody}
        </p>

        <div className="grid two" style={{ marginTop: 16 }}>
          {points.map((point) => (
            <div key={point.title} className="card card-soft">
              <div className="card-section-title">{point.title}</div>
              <p className="card-section-subtitle" style={{ marginTop: 6 }}>
                {point.body}
              </p>
            </div>
          ))}
        </div>

        <div className="muted" style={{ marginTop: 16 }}>
          {copy.footer}
        </div>
      </div>
    </div>
  )
}