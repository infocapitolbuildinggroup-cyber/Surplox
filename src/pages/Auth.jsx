import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate, useSearchParams } from 'react-router-dom'

const GENERAL_CONSTRUCTION_OPTION = {
  id: 'general-construction',
  name: 'General Construction',
  section: 'trade'
}

const JOBSITE_SUPPORT_SIGNUP_OPTIONS = [
  {
    id: 'support:material_delivery',
    section: 'jobsite_support',
    label: {
      en: 'Material Delivery / Hot Shot',
      es: 'Entrega de materiales / Hot Shot'
    },
    default_role: 'supplier',
    service_tags: ['material_delivery', 'hot_shot'],
    equipment_tags: [],
    bio: {
      en: 'Material delivery and hot shot support.',
      es: 'Soporte de entrega de materiales y hot shot.'
    }
  },
  {
    id: 'support:cargo_van',
    section: 'jobsite_support',
    label: {
      en: 'Cargo Van / Local Delivery',
      es: 'Cargo van / entrega local'
    },
    default_role: 'supplier',
    service_tags: ['material_delivery', 'last_mile_delivery', 'local_runs'],
    equipment_tags: ['cargo_van'],
    bio: {
      en: 'Cargo van delivery support for local material runs and pickups.',
      es: 'Soporte con cargo van para entregas locales y recogidas de materiales.'
    }
  },
  {
    id: 'support:equipment_fleet_repair',
    section: 'jobsite_support',
    label: {
      en: 'Equipment / Fleet Repair',
      es: 'Reparación de equipo / flota'
    },
    default_role: 'subcontractor',
    service_tags: ['diesel_mechanic', 'jobsite_service'],
    equipment_tags: ['mobile_repair_truck'],
    bio: {
      en: 'Field equipment and fleet repair support.',
      es: 'Soporte de reparación de equipo y flota en campo.'
    }
  }
]

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
    signUpTitle: 'Create Your Surplox Account',
    signInIntro:
      'Get back to nearby opportunities, crew activity, alerts, profile visibility, and local construction connections.',
    signUpIntro:
      'Fast signup for workers, crews, trade pros, delivery support, and repair support. Get into the app first and finish the rest later.',
    previewTitle: 'Quick Setup',
    previewBody:
      'Surplox gets workers in quickly: name, trade or support lane, ZIP, then straight into the feed.',
    previewBullet1: 'Join in a few taps',
    previewBullet2: 'Find crews and nearby work',
    previewBullet3: 'Finish the rest later',
    previewFree: 'Free for workers.',
    previewTexas: 'Built for local construction networks.',
    languageLabel: 'Language',
    languageEnglish: 'EN',
    languageSpanish: 'ES',
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
    point3Body: 'Show your trade or support lane and area so the right people can find you.',
    point4Title: 'Alerts and repeat connections',
    point4Body:
      'Stay on top of replies, joins, hires, and local activity that can turn into future work.',
    footer: 'Built for laborers, subcontractors, contractors, suppliers, delivery support, and repair support.',
    step: 'Step',
    next: 'Next',
    back: 'Back',
    finish: 'Enter Surplox',
    nameLabel: 'What’s your name?',
    namePlaceholder: 'Juan Martinez',
    tradeLabel: 'What trade or support work do you do?',
    tradePlaceholder: 'Select your trade or support lane',
    generalConstruction: 'General Construction',
    tradesLoading: 'Loading trades…',
    tradesUnavailable:
      'Trades unavailable right now. Showing Surplox default trades.',
    tradesGroup: 'Trades',
    jobsiteSupportGroup: 'Jobsite Support',
    supportAccountsHint:
      'Delivery and repair operators can sign up here too. Pick the support lane that matches your work.',
    zipLabel: 'What ZIP do you usually work in?',
    zipPlaceholder: '76102',
    tradeRequired: 'Select your trade or support lane.',
    zipRequired: 'Enter a valid 5-digit ZIP code.',
    nameRequired: 'Enter your name.',
    emailRequired: 'Enter a valid email address.',
    passwordRequired: 'Password must be at least 6 characters.',
    signUpSuccess: 'Your account is ready.',
    stageTitle1: 'Your Name',
    stageTitle2: 'Your Trade',
    stageTitle3: 'Your Area and Login',
    stageBody1: 'Start with your name so people know who is entering the network.',
    stageBody2:
      'Choose the trade or support lane that best matches the work you do most often, including delivery and repair support.',
    stageBody3:
      'Finish with your ZIP, email, and password so Surplox can place you into the right local feed.',
    alreadyInside: 'Already in Surplox?',
    createAccess: 'Create access in under a minute',
    signInCardTitle: 'Welcome back',
    signInCardBody:
      'Sign in to get back to nearby activity, posts, crews, and alerts.'
  },
  es: {
    formLabel: 'Acceso a Surplox',
    signInTitle: 'Inicia sesión en tu red local del oficio',
    signUpTitle: 'Crea tu cuenta de Surplox',
    signInIntro:
      'Vuelve a oportunidades cercanas, actividad de cuadrillas, alertas, visibilidad de perfil y conexiones locales de construcción.',
    signUpIntro:
      'Registro rápido para trabajadores, cuadrillas, oficios, soporte de entrega y soporte de reparación. Entra a la app primero y completa lo demás después.',
    previewTitle: 'Configuración rápida',
    previewBody:
      'Surplox permite entrar rápido: nombre, oficio o tipo de soporte, ZIP y directo al feed.',
    previewBullet1: 'Únete en pocos toques',
    previewBullet2: 'Encuentra cuadrillas y trabajo cercano',
    previewBullet3: 'Completa lo demás después',
    previewFree: 'Gratis para trabajadores.',
    previewTexas: 'Hecho para redes locales de construcción.',
    languageLabel: 'Idioma',
    languageEnglish: 'EN',
    languageSpanish: 'ES',
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
    point3Body: 'Muestra tu oficio o tipo de soporte y tu zona para que la gente correcta te encuentre.',
    point4Title: 'Alertas y conexiones repetidas',
    point4Body:
      'Mantente al tanto de respuestas, uniones, contrataciones y actividad local que puede convertirse en trabajo futuro.',
    footer: 'Hecho para trabajadores, subcontratistas, contratistas, proveedores, soporte de entrega y soporte de reparación.',
    step: 'Paso',
    next: 'Siguiente',
    back: 'Atrás',
    finish: 'Entrar a Surplox',
    nameLabel: '¿Cómo te llamas?',
    namePlaceholder: 'Juan Martinez',
    tradeLabel: '¿Qué oficio o trabajo de soporte haces?',
    tradePlaceholder: 'Selecciona tu oficio o tipo de soporte',
    generalConstruction: 'Construcción general',
    tradesLoading: 'Cargando oficios…',
    tradesUnavailable:
      'Los oficios no están disponibles en este momento. Mostrando oficios predeterminados de Surplox.',
    tradesGroup: 'Oficios',
    jobsiteSupportGroup: 'Soporte de obra',
    supportAccountsHint:
      'Los operadores de entrega y reparación también pueden registrarse aquí. Elige el tipo de soporte que mejor coincida con tu trabajo.',
    zipLabel: '¿En qué ZIP trabajas normalmente?',
    zipPlaceholder: '76102',
    tradeRequired: 'Selecciona tu oficio o tipo de soporte.',
    zipRequired: 'Ingresa un ZIP válido de 5 dígitos.',
    nameRequired: 'Ingresa tu nombre.',
    emailRequired: 'Ingresa un correo válido.',
    passwordRequired: 'La contraseña debe tener al menos 6 caracteres.',
    signUpSuccess: 'Tu cuenta está lista.',
    stageTitle1: 'Tu Nombre',
    stageTitle2: 'Tu Oficio',
    stageTitle3: 'Tu Zona y Acceso',
    stageBody1:
      'Empieza con tu nombre para que la gente sepa quién está entrando a la red.',
    stageBody2:
      'Elige el oficio o tipo de soporte que mejor representa el trabajo que haces más seguido, incluyendo entrega y reparación.',
    stageBody3:
      'Termina con tu ZIP, correo y contraseña para que Surplox te coloque en el feed local correcto.',
    alreadyInside: '¿Ya estás en Surplox?',
    createAccess: 'Crea acceso en menos de un minuto',
    signInCardTitle: 'Bienvenido de nuevo',
    signInCardBody:
      'Inicia sesión para volver a actividad cercana, publicaciones, cuadrillas y alertas.'
  }
}

function normalizeMode(value) {
  return value === 'signin' ? 'signin' : 'signup'
}

function buildTradeOptions(dynamicTrades) {
  const seen = new Set()
  const result = []

  const addOption = (option) => {
    const label =
      option.name || option.label?.en || option.label?.es || option.id || Math.random().toString(36)
    const key = String(label).trim().toLowerCase()
    if (!key || seen.has(key)) return
    seen.add(key)
    result.push(option)
  }

  addOption(GENERAL_CONSTRUCTION_OPTION)

  ;(dynamicTrades || []).forEach((trade) => {
    addOption({
      id: trade.id,
      name: trade.name,
      section: 'trade'
    })
  })

  CHANNEL_TRADE_FALLBACKS.forEach((name) => {
    addOption({
      id: `fallback:${name}`,
      name,
      section: 'trade'
    })
  })

  JOBSITE_SUPPORT_SIGNUP_OPTIONS.forEach((option) => addOption(option))

  return result
}

function getOptionLabel(option, lang, copy) {
  if (String(option.id) === GENERAL_CONSTRUCTION_OPTION.id) return copy.generalConstruction
  return option.label?.[lang] || option.label?.en || option.name
}

function StepPill({ active, complete, number, label }) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 110,
        padding: 12,
        borderRadius: 22,
        background: active ? '#111111' : complete ? '#fff2a8' : 'var(--card-soft)',
        color: active ? '#ffffff' : 'var(--text)',
        transition: 'all 0.2s ease'
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          opacity: active ? 0.76 : 0.72
        }}
      >
        {complete ? 'Done' : `0${number}`}
      </div>
      <div style={{ marginTop: 6, fontWeight: 800, lineHeight: 1.2 }}>{label}</div>
    </div>
  )
}

function LanguageSlider({ lang, setLang, copy }) {
  return (
    <div>
      <div className="muted" style={{ marginBottom: 8 }}>
        {copy.languageLabel}
      </div>

      <div
        style={{
          position: 'relative',
          display: 'inline-grid',
          gridTemplateColumns: '1fr 1fr',
          alignItems: 'center',
          width: 132,
          padding: 4,
          borderRadius: 999,
          background: '#ecebe6',
          border: '1px solid rgba(17,17,17,0.05)'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 4,
            left: lang === 'en' ? 4 : 'calc(50% + 0px)',
            width: 'calc(50% - 4px)',
            height: 'calc(100% - 8px)',
            borderRadius: 999,
            background: 'var(--accent)',
            transition: 'left 0.22s ease'
          }}
        />

        <button
          type="button"
          onClick={() => setLang('en')}
          style={{
            position: 'relative',
            zIndex: 1,
            border: 'none',
            background: 'transparent',
            padding: '10px 12px',
            borderRadius: 999,
            fontWeight: 800,
            fontSize: 14,
            color: '#111111',
            cursor: 'pointer'
          }}
        >
          {copy.languageEnglish}
        </button>

        <button
          type="button"
          onClick={() => setLang('es')}
          style={{
            position: 'relative',
            zIndex: 1,
            border: 'none',
            background: 'transparent',
            padding: '10px 12px',
            borderRadius: 999,
            fontWeight: 800,
            fontSize: 14,
            color: '#111111',
            cursor: 'pointer'
          }}
        >
          {copy.languageSpanish}
        </button>
      </div>
    </div>
  )
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
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [mode, step])

  useEffect(() => {
    async function loadTrades() {
      setTradesLoading(true)
      setTradesError('')

      try {
        const { data, error } = await supabase.from('trades').select('id,name').order('name')

        if (error) {
          console.error(error)
          setTradesError(copy.tradesUnavailable)
          setTradeOptions(buildTradeOptions([]))
          return
        }

        setTradeOptions(buildTradeOptions(data || []))
      } catch (err) {
        console.error(err)
        setTradesError(copy.tradesUnavailable)
        setTradeOptions(buildTradeOptions([]))
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

  const groupedTradeOptions = useMemo(
    () => ({
      trade: tradeOptions.filter((option) => option.section === 'trade'),
      jobsite_support: tradeOptions.filter((option) => option.section === 'jobsite_support')
    }),
    [tradeOptions]
  )

  function switchMode(nextMode) {
    const normalized = normalizeMode(nextMode)
    setMode(normalized)
    setMsg('')
    setStep(1)
    setSearchParams({ mode: normalized }, { replace: true })
  }

  function handleLanguageChange(nextLang) {
    if (typeof setLang === 'function') setLang(nextLang)
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

  async function resolveTradeSelection(selectedTradeValue) {
    if (selectedTradeValue === GENERAL_CONSTRUCTION_OPTION.id) {
      return {
        tradeId: null,
        isGeneralConstruction: true,
        categoryGroup: 'trade',
        role: 'laborer',
        serviceTags: [],
        equipmentTags: [],
        bio: copy.generalConstruction
      }
    }

    const exactOption = tradeOptions.find(
      (option) => String(option.id) === String(selectedTradeValue)
    )

    if (!exactOption) {
      return {
        tradeId: null,
        isGeneralConstruction: false,
        categoryGroup: 'trade',
        role: 'laborer',
        serviceTags: [],
        equipmentTags: [],
        bio: ''
      }
    }

    if (exactOption.section === 'jobsite_support') {
      return {
        tradeId: null,
        isGeneralConstruction: false,
        categoryGroup: 'jobsite_support',
        role: exactOption.default_role || 'supplier',
        serviceTags: exactOption.service_tags || [],
        equipmentTags: exactOption.equipment_tags || [],
        bio: exactOption.bio?.[lang] || exactOption.bio?.en || ''
      }
    }

    if (!String(exactOption.id).startsWith('fallback:')) {
      return {
        tradeId: Number(exactOption.id),
        isGeneralConstruction: false,
        categoryGroup: 'trade',
        role: 'laborer',
        serviceTags: [],
        equipmentTags: [],
        bio: ''
      }
    }

    const { data, error } = await supabase
      .from('trades')
      .select('id,name')
      .ilike('name', exactOption.name)
      .limit(1)

    if (error) throw error

    const resolvedTrade = data?.[0]
    if (!resolvedTrade?.id) throw new Error(copy.tradeRequired)

    return {
      tradeId: Number(resolvedTrade.id),
      isGeneralConstruction: false,
      categoryGroup: 'trade',
      role: 'laborer',
      serviceTags: [],
      equipmentTags: [],
      bio: ''
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

      if (!user?.id) throw new Error(copy.authError)

      const rawName = signUpForm.display_name.trim()
      const nameParts = rawName.split(/\s+/).filter(Boolean)
      const firstName = nameParts[0] || rawName
      const lastName = nameParts.slice(1).join(' ')

      const {
        tradeId,
        categoryGroup,
        role,
        serviceTags,
        equipmentTags,
        bio
      } = await resolveTradeSelection(signUpForm.trade_id)

      const { error: profileError } = await supabase.from('profiles').upsert({
        user_id: user.id,
        display_name: rawName,
        first_name: firstName,
        last_name: lastName,
        role,
        trade_id: tradeId,
        travel_radius_miles: 50,
        crew_size: 1,
        bio,
        preferred_language: lang,
        category_group: categoryGroup,
        service_tags: serviceTags,
        equipment_tags: equipmentTags
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

  const currentStageTitle =
    step === 1 ? copy.stageTitle1 : step === 2 ? copy.stageTitle2 : copy.stageTitle3

  const currentStageBody =
    step === 1 ? copy.stageBody1 : step === 2 ? copy.stageBody2 : copy.stageBody3

  const authPanel = (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card rounded-xl" style={{ padding: 24 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
            alignItems: 'center'
          }}
        >
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--muted-soft)'
              }}
            >
              {copy.formLabel}
            </div>
            <div className="h2" style={{ marginTop: 8, marginBottom: 0 }}>
              {mode === 'signin' ? copy.signInCardTitle : copy.createAccess}
            </div>
          </div>

          <LanguageSlider lang={lang} setLang={handleLanguageChange} copy={copy} />
        </div>
      </div>

      {mode === 'signin' ? (
        <form className="card rounded-xl" onSubmit={handleSignIn} style={{ padding: 24 }}>
          <div className="h1" style={{ fontSize: 'clamp(1.9rem, 4vw, 2.7rem)' }}>
            {copy.signInTitle}
          </div>

          <p className="muted" style={{ marginTop: 10 }}>
            {copy.signInIntro}
          </p>

          <div className="grid" style={{ marginTop: 16 }}>
            <div>
              <div className="muted" style={{ marginBottom: 6 }}>
                {copy.email}
              </div>
              <input
                className="input"
                type="email"
                value={signInForm.email}
                placeholder={copy.emailPlaceholder}
                onChange={(e) => setSignInField('email', e.target.value)}
              />
            </div>

            <div>
              <div className="muted" style={{ marginBottom: 6 }}>
                {copy.password}
              </div>
              <input
                className="input"
                type="password"
                value={signInForm.password}
                placeholder={copy.passwordPlaceholder}
                onChange={(e) => setSignInField('password', e.target.value)}
              />
            </div>
          </div>

          {msg ? (
            <div className="card-message" style={{ marginTop: 14, padding: 14, borderRadius: 18 }}>
              {msg}
            </div>
          ) : null}

          <div className="row" style={{ marginTop: 16 }}>
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

          <div className="card-soft" style={{ marginTop: 18 }}>
            <div className="card-section-title" style={{ fontSize: 16 }}>
              {copy.alreadyInside}
            </div>
            <p className="card-section-subtitle" style={{ marginTop: 8 }}>
              {copy.signInCardBody}
            </p>
          </div>
        </form>
      ) : (
        <form className="card rounded-xl" onSubmit={handleSignUpSubmit} style={{ padding: 24 }}>
          <div className="h1" style={{ fontSize: 'clamp(1.9rem, 4vw, 2.7rem)' }}>
            {copy.signUpTitle}
          </div>

          <p className="muted" style={{ marginTop: 10 }}>
            {copy.signUpIntro}
          </p>

          <div
            style={{
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap',
              marginTop: 18
            }}
          >
            <StepPill active={step === 1} complete={step > 1} number={1} label={copy.stageTitle1} />
            <StepPill active={step === 2} complete={step > 2} number={2} label={copy.stageTitle2} />
            <StepPill active={step === 3} complete={false} number={3} label={copy.stageTitle3} />
          </div>

          <div
            className="card-soft"
            style={{
              marginTop: 16,
              background: '#f5f3e7'
            }}
          >
            <div className="card-section-title" style={{ fontSize: 16 }}>
              {copy.step} {step}: {currentStageTitle}
            </div>
            <p className="card-section-subtitle" style={{ marginTop: 8 }}>
              {currentStageBody}
            </p>
          </div>

          {step === 1 ? (
            <div style={{ marginTop: 16 }}>
              <div className="muted" style={{ marginBottom: 6 }}>
                {copy.nameLabel}
              </div>
              <input
                className="input"
                value={signUpForm.display_name}
                placeholder={copy.namePlaceholder}
                onChange={(e) => setSignUpField('display_name', e.target.value)}
              />
            </div>
          ) : null}

          {step === 2 ? (
            <div style={{ marginTop: 16 }}>
              <div className="muted" style={{ marginBottom: 6 }}>
                {copy.tradeLabel}
              </div>
              <select
                className="input"
                value={signUpForm.trade_id}
                onChange={(e) => setSignUpField('trade_id', e.target.value)}
                disabled={tradesLoading}
              >
                <option value="">{tradesLoading ? copy.tradesLoading : copy.tradePlaceholder}</option>

                {groupedTradeOptions.trade.length > 0 ? (
                  <optgroup label={copy.tradesGroup}>
                    {groupedTradeOptions.trade.map((option) => (
                      <option key={option.id} value={option.id}>
                        {getOptionLabel(option, lang, copy)}
                      </option>
                    ))}
                  </optgroup>
                ) : null}

                {groupedTradeOptions.jobsite_support.length > 0 ? (
                  <optgroup label={copy.jobsiteSupportGroup}>
                    {groupedTradeOptions.jobsite_support.map((option) => (
                      <option key={option.id} value={option.id}>
                        {getOptionLabel(option, lang, copy)}
                      </option>
                    ))}
                  </optgroup>
                ) : null}
              </select>

              <div className="muted" style={{ marginTop: 8, fontSize: 13 }}>
                {copy.supportAccountsHint}
              </div>

              {tradesError ? (
                <div className="card-message" style={{ marginTop: 12, padding: 14, borderRadius: 18 }}>
                  {tradesError}
                </div>
              ) : null}
            </div>
          ) : null}

          {step === 3 ? (
            <div className="grid" style={{ marginTop: 16 }}>
              <div>
                <div className="muted" style={{ marginBottom: 6 }}>
                  {copy.zipLabel}
                </div>
                <input
                  className="input"
                  inputMode="numeric"
                  value={signUpForm.home_zip}
                  placeholder={copy.zipPlaceholder}
                  onChange={(e) => setSignUpField('home_zip', e.target.value.replace(/\D/g, '').slice(0, 5))}
                />
              </div>

              <div>
                <div className="muted" style={{ marginBottom: 6 }}>
                  {copy.email}
                </div>
                <input
                  className="input"
                  type="email"
                  value={signUpForm.email}
                  placeholder={copy.emailPlaceholder}
                  onChange={(e) => setSignUpField('email', e.target.value)}
                />
              </div>

              <div>
                <div className="muted" style={{ marginBottom: 6 }}>
                  {copy.password}
                </div>
                <input
                  className="input"
                  type="password"
                  value={signUpForm.password}
                  placeholder={copy.passwordPlaceholder}
                  onChange={(e) => setSignUpField('password', e.target.value)}
                />
              </div>
            </div>
          ) : null}

          {msg ? (
            <div className="card-message" style={{ marginTop: 14, padding: 14, borderRadius: 18 }}>
              {msg}
            </div>
          ) : null}

          <div className="row" style={{ marginTop: 18 }}>
            {step > 1 ? (
              <button className="btn" type="button" onClick={goBack} disabled={loading}>
                {copy.back}
              </button>
            ) : (
              <button className="btn" type="button" onClick={() => switchMode('signin')} disabled={loading}>
                {copy.switchToSignIn}
              </button>
            )}

            {step < 3 ? (
              <button className="btn primary" type="button" onClick={goNext} disabled={loading}>
                {copy.next}
              </button>
            ) : (
              <button className="btn primary" type="submit" disabled={loading}>
                {loading ? copy.wait : copy.finish}
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  )

  return (
    <div className="grid two" style={{ alignItems: 'start' }}>
      <div>{authPanel}</div>

      <div className="grid" style={{ gap: 16 }}>
        <div
          className="card rounded-xl surface-dark"
          style={{
            padding: 28,
            minHeight: 240
          }}
        >
          <div className="badge" style={{ background: 'rgba(255,255,255,0.14)', color: '#ffffff' }}>
            {copy.sideBadge}
          </div>

          <div className="h1" style={{ marginTop: 18, color: '#ffffff' }}>
            {copy.sideTitle}
          </div>

          <p style={{ color: 'rgba(255,255,255,0.76)', lineHeight: 1.75, fontSize: 16, maxWidth: 620 }}>
            {copy.sideBody}
          </p>
        </div>

        <div className="grid two">
          {points.map((point) => (
            <div key={point.title} className="card-soft rounded-lg" style={{ minHeight: 148 }}>
              <div className="card-section-title">{point.title}</div>
              <p className="card-section-subtitle">{point.body}</p>
            </div>
          ))}
        </div>

        <div
          className="card rounded-xl"
          style={{
            padding: 28,
            background: 'linear-gradient(180deg, #fff7c8 0%, #f7f7f2 100%)'
          }}
        >
          <div className="badge good">{copy.previewTitle}</div>
          <div className="h1" style={{ marginTop: 18 }}>
            {copy.previewBody}
          </div>

          <div className="grid" style={{ marginTop: 16 }}>
            <div className="card-soft rounded-lg">{copy.previewBullet1}</div>
            <div className="card-soft rounded-lg">{copy.previewBullet2}</div>
            <div className="card-soft rounded-lg">{copy.previewBullet3}</div>
          </div>

          <div className="row" style={{ marginTop: 18 }}>
            <div className="badge">{copy.previewFree}</div>
            <div className="badge">{copy.previewTexas}</div>
          </div>
        </div>

        <div className="footerNote">{copy.footer}</div>
      </div>
    </div>
  )
}