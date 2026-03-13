import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate, useSearchParams } from 'react-router-dom'

const GENERAL_CONSTRUCTION_OPTION = {
  id: 'general-construction',
  name: 'General Construction',
  section: 'trade'
}

const SUPPLIER_SIGNUP_OPTION = {
  id: 'supplier-account',
  name: 'Supplier',
  section: 'supplier',
  role: 'supplier',
  category_group: 'trade',
  trade_id: null,
  service_tags: [],
  equipment_tags: [],
  bio: {
    en: 'Supplier account for construction materials, tools, equipment, and jobsite support inventory.',
    es: 'Cuenta de proveedor para materiales de construcción, herramientas, equipo e inventario de soporte de obra.'
  }
}

const JOBSITE_SUPPORT_SIGNUP_OPTIONS = [
  {
    id: 'support:material_delivery',
    name: 'Material Delivery / Hot Shot',
    section: 'service',
    role: 'driver',
    category_group: 'jobsite_support',
    trade_id: null,
    service_tags: ['material_delivery', 'hot_shot'],
    equipment_tags: [],
    bio: {
      en: 'Material delivery and hot shot support for active jobsites.',
      es: 'Soporte de entrega de materiales y hot shot para obras activas.'
    }
  },
  {
    id: 'support:cargo_van',
    name: 'Cargo Van / Local Delivery',
    section: 'service',
    role: 'driver',
    category_group: 'jobsite_support',
    trade_id: null,
    service_tags: ['material_delivery', 'last_mile_delivery', 'local_runs'],
    equipment_tags: ['cargo_van'],
    bio: {
      en: 'Cargo van and local delivery support for material runs, pickups, and jobsite deliveries.',
      es: 'Soporte con cargo van y entrega local para viajes de materiales, recogidas y entregas en obra.'
    }
  },
  {
    id: 'support:equipment_fleet_repair',
    name: 'Equipment / Fleet Repair',
    section: 'service',
    role: 'mechanic',
    category_group: 'jobsite_support',
    trade_id: null,
    service_tags: ['diesel_mechanic', 'jobsite_service'],
    equipment_tags: ['mobile_repair_truck'],
    bio: {
      en: 'Equipment and fleet repair support for field service and jobsite uptime.',
      es: 'Soporte de reparación de equipo y flota para servicio en campo y continuidad de obra.'
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
      'Fast signup for workers, services, suppliers, and local construction connections. Get into the app first and finish the rest later.',
    previewTitle: 'Quick Setup',
    previewBody:
      'Surplox gets people in quickly: name, trade, service, or supplier lane, ZIP, then straight into the feed.',
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
    point3Body: 'Show your trade, service, or supplier lane and area so the right people can find you.',
    point4Title: 'Alerts and repeat connections',
    point4Body:
      'Stay on top of replies, joins, hires, and local activity that can turn into future work.',
    footer: 'Built for laborers, subcontractors, contractors, drivers, mechanics, and suppliers.',
    step: 'Step',
    next: 'Next',
    back: 'Back',
    finish: 'Enter Surplox',
    nameLabel: 'What’s your name?',
    namePlaceholder: 'Juan Martinez',
    tradeLabel: 'What trade, service, or supplier lane fits you best?',
    tradePlaceholder: 'Select your trade, service, or supplier lane',
    generalConstruction: 'General Construction',
    supplierOption: 'Supplier',
    tradesGroup: 'Trades',
    servicesGroup: 'Services',
    suppliersGroup: 'Suppliers',
    tradesLoading: 'Loading trades…',
    tradesUnavailable:
      'Trades unavailable right now. Showing Surplox default trades.',
    supportAccountsHint:
      'Workers, service operators, and suppliers can all sign up here. Choose the lane that best matches the work you do most often.',
    zipLabel: 'What ZIP do you usually work in?',
    zipPlaceholder: '76102',
    tradeRequired: 'Select your trade, service, or supplier lane.',
    zipRequired: 'Enter a valid 5-digit ZIP code.',
    nameRequired: 'Enter your name.',
    emailRequired: 'Enter a valid email address.',
    passwordRequired: 'Password must be at least 6 characters.',
    signUpSuccess: 'Your account is ready.',
    stageTitle1: 'Your Name',
    stageTitle2: 'Your Trade/Service/Supplier',
    stageTitle3: 'Your Area and Login',
    stageBody1: 'Start with your name so people know who is entering the network.',
    stageBody2:
      'Choose the trade, service, or supplier lane that best matches the work you do most often.',
    stageBody3:
      'Finish with your ZIP, email, and password so Surplox can place you into the right local feed.',
    alreadyInside: 'Already in Surplox?',
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
      'Registro rápido para trabajadores, servicios, proveedores y conexiones locales de construcción. Entra a la app primero y completa lo demás después.',
    previewTitle: 'Configuración rápida',
    previewBody:
      'Surplox permite entrar rápido: nombre, oficio, servicio o categoría de proveedor, ZIP y directo al feed.',
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
    point3Body: 'Muestra tu oficio, servicio o categoría de proveedor y tu zona para que la gente correcta te encuentre.',
    point4Title: 'Alertas y conexiones repetidas',
    point4Body:
      'Mantente al tanto de respuestas, uniones, contrataciones y actividad local que puede convertirse en trabajo futuro.',
    footer: 'Hecho para trabajadores, subcontratistas, contratistas, conductores, mecánicos y proveedores.',
    step: 'Paso',
    next: 'Siguiente',
    back: 'Atrás',
    finish: 'Entrar a Surplox',
    nameLabel: '¿Cómo te llamas?',
    namePlaceholder: 'Juan Martinez',
    tradeLabel: '¿Qué oficio, servicio o categoría de proveedor te representa mejor?',
    tradePlaceholder: 'Selecciona tu oficio, servicio o categoría de proveedor',
    generalConstruction: 'Construcción general',
    supplierOption: 'Proveedor',
    tradesGroup: 'Oficios',
    servicesGroup: 'Servicios',
    suppliersGroup: 'Proveedores',
    tradesLoading: 'Cargando oficios…',
    tradesUnavailable:
      'Los oficios no están disponibles en este momento. Mostrando oficios predeterminados de Surplox.',
    supportAccountsHint:
      'Trabajadores, operadores de servicio y proveedores pueden registrarse aquí. Elige la categoría que mejor coincida con el trabajo que haces más seguido.',
    zipLabel: '¿En qué ZIP trabajas normalmente?',
    zipPlaceholder: '76102',
    tradeRequired: 'Selecciona tu oficio, servicio o categoría de proveedor.',
    zipRequired: 'Ingresa un ZIP válido de 5 dígitos.',
    nameRequired: 'Ingresa tu nombre.',
    emailRequired: 'Ingresa un correo válido.',
    passwordRequired: 'La contraseña debe tener al menos 6 caracteres.',
    signUpSuccess: 'Tu cuenta está lista.',
    stageTitle1: 'Tu Nombre',
    stageTitle2: 'Tu Oficio/Servicio/Proveedor',
    stageTitle3: 'Tu Zona y Acceso',
    stageBody1:
      'Empieza con tu nombre para que la gente sepa quién está entrando a la red.',
    stageBody2:
      'Elige el oficio, servicio o categoría de proveedor que mejor representa el trabajo que haces más seguido.',
    stageBody3:
      'Termina con tu ZIP, correo y contraseña para que Surplox te coloque en el feed local correcto.',
    alreadyInside: '¿Ya estás en Surplox?',
    signInCardTitle: 'Bienvenido de nuevo',
    signInCardBody:
      'Inicia sesión para volver a actividad cercana, publicaciones, cuadrillas y alertas.'
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
  addOption(SUPPLIER_SIGNUP_OPTION)

  return result
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

      <div className="lang-toggle" aria-label={copy.languageLabel}>
        <div className={`lang-toggle-thumb ${lang === 'es' ? 'is-es' : 'is-en'}`} />

        <button
          type="button"
          onClick={() => setLang('en')}
          className={`lang-toggle-btn ${lang === 'en' ? 'is-active' : ''}`}
        >
          {copy.languageEnglish}
        </button>

        <button
          type="button"
          onClick={() => setLang('es')}
          className={`lang-toggle-btn ${lang === 'es' ? 'is-active' : ''}`}
        >
          {copy.languageSpanish}
        </button>
      </div>
    </div>
  )
}

function getOptionLabel(option, copy) {
  if (option.id === GENERAL_CONSTRUCTION_OPTION.id) return copy.generalConstruction
  if (option.id === SUPPLIER_SIGNUP_OPTION.id) return copy.supplierOption
  return option.name
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

  const groupedTradeOptions = useMemo(
    () => ({
      trade: tradeOptions.filter((option) => option.section === 'trade'),
      service: tradeOptions.filter((option) => option.section === 'service'),
      supplier: tradeOptions.filter((option) => option.section === 'supplier')
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

  async function resolveSignupSelection(selectedValue) {
    if (selectedValue === GENERAL_CONSTRUCTION_OPTION.id) {
      return {
        tradeId: null,
        role: 'laborer',
        categoryGroup: 'trade',
        serviceTags: [],
        equipmentTags: [],
        bio: copy.generalConstruction
      }
    }

    if (selectedValue === SUPPLIER_SIGNUP_OPTION.id) {
      return {
        tradeId: null,
        role: 'supplier',
        categoryGroup: SUPPLIER_SIGNUP_OPTION.category_group,
        serviceTags: SUPPLIER_SIGNUP_OPTION.service_tags,
        equipmentTags: SUPPLIER_SIGNUP_OPTION.equipment_tags,
        bio: SUPPLIER_SIGNUP_OPTION.bio[lang] || SUPPLIER_SIGNUP_OPTION.bio.en
      }
    }

    const exactOption = tradeOptions.find((option) => String(option.id) === String(selectedValue))

    if (!exactOption) {
      return {
        tradeId: null,
        role: 'laborer',
        categoryGroup: 'trade',
        serviceTags: [],
        equipmentTags: [],
        bio: ''
      }
    }

    if (exactOption.section === 'service') {
      return {
        tradeId: exactOption.trade_id,
        role: exactOption.role,
        categoryGroup: exactOption.category_group,
        serviceTags: exactOption.service_tags,
        equipmentTags: exactOption.equipment_tags,
        bio: exactOption.bio[lang] || exactOption.bio.en
      }
    }

    if (!String(exactOption.id).startsWith('fallback:')) {
      return {
        tradeId: Number(exactOption.id),
        role: 'laborer',
        categoryGroup: 'trade',
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
      role: 'laborer',
      categoryGroup: 'trade',
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

      const { tradeId, role, categoryGroup, serviceTags, equipmentTags, bio } =
        await resolveSignupSelection(signUpForm.trade_id)

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
      {mode === 'signin' ? (
        <form className="card rounded-xl" onSubmit={handleSignIn} style={{ padding: 24 }}>
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
              <div className="h1" style={{ marginTop: 8, fontSize: 'clamp(1.9rem, 4vw, 2.7rem)' }}>
                {copy.signInTitle}
              </div>
            </div>

            <LanguageSlider lang={lang} setLang={handleLanguageChange} copy={copy} />
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
              <div className="h1" style={{ marginTop: 8, fontSize: 'clamp(1.9rem, 4vw, 2.7rem)' }}>
                {copy.signUpTitle}
              </div>
            </div>

            <LanguageSlider lang={lang} setLang={handleLanguageChange} copy={copy} />
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
                        {getOptionLabel(option, copy)}
                      </option>
                    ))}
                  </optgroup>
                ) : null}

                {groupedTradeOptions.service.length > 0 ? (
                  <optgroup label={copy.servicesGroup}>
                    {groupedTradeOptions.service.map((option) => (
                      <option key={option.id} value={option.id}>
                        {getOptionLabel(option, copy)}
                      </option>
                    ))}
                  </optgroup>
                ) : null}

                {groupedTradeOptions.supplier.length > 0 ? (
                  <optgroup label={copy.suppliersGroup}>
                    {groupedTradeOptions.supplier.map((option) => (
                      <option key={option.id} value={option.id}>
                        {getOptionLabel(option, copy)}
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
                  value={signUpForm.home_zip}
                  placeholder={copy.zipPlaceholder}
                  onChange={(e) => setSignUpField('home_zip', e.target.value.replace(/\D/g, '').slice(0, 5))}
                  inputMode="numeric"
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

          <div className="row" style={{ marginTop: 16 }}>
            {step > 1 ? (
              <button className="btn" type="button" onClick={goBack} disabled={loading}>
                {copy.back}
              </button>
            ) : (
              <button
                className="btn"
                type="button"
                onClick={() => switchMode('signin')}
                disabled={loading}
              >
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

  const marketingPanel = (
    <div
      className="card rounded-xl"
      style={{
        padding: 28,
        background: 'linear-gradient(180deg, #fff7c8 0%, #f7f7f2 100%)'
      }}
    >
      <div
        className="badge"
        style={{
          marginBottom: 16,
          background: '#f1e7a8'
        }}
      >
        {copy.sideBadge}
      </div>

      <div className="h1" style={{ maxWidth: 640 }}>
        {copy.sideTitle}
      </div>

      <p className="muted" style={{ marginTop: 14, fontSize: 17, lineHeight: 1.7 }}>
        {copy.sideBody}
      </p>

      <div className="grid" style={{ marginTop: 18 }}>
        {points.map((point) => (
          <div
            key={point.title}
            className="card-soft"
            style={{
              padding: 18,
              background: 'rgba(255,255,255,0.58)'
            }}
          >
            <div className="card-section-title" style={{ fontSize: 17 }}>
              {point.title}
            </div>
            <p className="card-section-subtitle" style={{ marginTop: 8 }}>
              {point.body}
            </p>
          </div>
        ))}
      </div>

      <div
        className="card surface-dark rounded-xl"
        style={{
          marginTop: 18,
          padding: 20
        }}
      >
        <div className="card-section-title" style={{ color: '#ffffff' }}>
          {copy.previewTitle}
        </div>
        <p className="card-section-subtitle" style={{ marginTop: 8 }}>
          {copy.previewBody}
        </p>

        <div className="grid two" style={{ marginTop: 14 }}>
          <div className="card-soft" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div style={{ fontWeight: 800 }}>{copy.previewBullet1}</div>
          </div>
          <div className="card-soft" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div style={{ fontWeight: 800 }}>{copy.previewBullet2}</div>
          </div>
          <div className="card-soft" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div style={{ fontWeight: 800 }}>{copy.previewBullet3}</div>
          </div>
          <div className="card-soft" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div style={{ fontWeight: 800 }}>
              {copy.previewFree} {copy.previewTexas}
            </div>
          </div>
        </div>
      </div>

      <p className="footerNote" style={{ textAlign: 'left', marginTop: 18 }}>
        {copy.footer}
      </p>
    </div>
  )

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="grid two" style={{ alignItems: 'start' }}>
        {authPanel}
        {marketingPanel}
      </div>
    </div>
  )
}