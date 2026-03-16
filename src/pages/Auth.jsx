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
  storefront: true,
  bio: {
    en: 'Supplier account for construction materials, tools, equipment, and jobsite support inventory.',
    es: 'Cuenta de proveedor para materiales de construcción, herramientas, equipo e inventario de soporte de obra.'
  }
}

const DRIVER_SIGNUP_OPTIONS = [
  {
    id: 'support:material_delivery',
    name: 'Material Delivery / Hot Shot',
    section: 'driver',
    role: 'driver',
    category_group: 'jobsite_support',
    trade_id: null,
    service_tags: ['material_delivery', 'hot_shot'],
    equipment_tags: ['pickup_truck'],
    default_vehicle_type: 'pickup_truck',
    bio: {
      en: 'Material delivery and hot shot support for active jobsites.',
      es: 'Soporte de entrega de materiales y hot shot para obras activas.'
    }
  },
  {
    id: 'support:cargo_van',
    name: 'Cargo Van / Local Delivery',
    section: 'driver',
    role: 'driver',
    category_group: 'jobsite_support',
    trade_id: null,
    service_tags: ['material_delivery', 'last_mile_delivery', 'local_runs'],
    equipment_tags: ['cargo_van'],
    default_vehicle_type: 'cargo_van',
    bio: {
      en: 'Cargo van and local delivery support for material runs, pickups, and jobsite deliveries.',
      es: 'Soporte con cargo van y entrega local para viajes de materiales, recogidas y entregas en obra.'
    }
  }
]

const JOBSITE_SUPPORT_SIGNUP_OPTIONS = [
  {
    id: 'support:equipment_fleet_repair',
    name: 'Equipment / Fleet Repair',
    section: 'service',
    role: 'mechanic',
    category_group: 'jobsite_support',
    trade_id: null,
    service_tags: ['diesel_mechanic', 'jobsite_service'],
    equipment_tags: ['mobile_repair_truck'],
    default_vehicle_type: 'mobile_repair_truck',
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
      'Fast signup for workers, supplier locations, delivery drivers, and local construction connections. Get into the app first and finish the rest later.',
    previewTitle: 'Quick Setup',
    previewBody:
      'Surplox gets people in quickly: name or business name, account type, ZIP, then straight into the feed.',
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
    point3Body:
      'Show your trade, supplier lane, driver lane, or service lane so the right people can find you.',
    point4Title: 'Alerts and repeat connections',
    point4Body:
      'Stay on top of replies, joins, hires, and local activity that can turn into future work.',
    footer: 'Built for laborers, subcontractors, contractors, drivers, mechanics, and suppliers.',
    next: 'Next',
    back: 'Back',
    finish: 'Enter Surplox',
    nameLabel: 'What should this account be called?',
    namePlaceholder: 'Juan Martinez or Fort Worth Masonry Supply',
    tradeLabel: 'What account type fits you best?',
    generalConstruction: 'General Construction',
    supplierOption: 'Supplier',
    deliveryDriverOption: 'Delivery Driver',
    tradesGroup: 'Trades',
    driversGroup: 'Drivers',
    servicesGroup: 'Jobsite Support',
    suppliersGroup: 'Suppliers',
    tradesLoading: 'Loading trades…',
    tradesUnavailable:
      'Trades unavailable right now. Showing Surplox default trades.',
    supportAccountsHint:
      'Choose the account type that best matches what you are joining Surplox as: worker, supplier location, delivery driver, or jobsite support.',
    driverAccountsHint:
      'Driver accounts are their own Surplox lane. Choose the delivery setup that matches your hauling capability, then finish your vehicle, trailer, payload, and radius details inside onboarding.',
    supplierAccountsHint:
      'Supplier accounts are storefront-style business locations. Use your business name now, then finish materials, hours, and storefront details inside My Account.',
    supportServiceHint:
      'Jobsite support accounts cover service lanes like equipment and fleet repair.',
    zipLabel: 'What ZIP do you usually work in?',
    zipPlaceholder: '76102',
    tradeRequired: 'Select your account type.',
    zipRequired: 'Enter a valid 5-digit ZIP code.',
    nameRequired: 'Enter your name.',
    emailRequired: 'Enter a valid email address.',
    passwordRequired: 'Password must be at least 6 characters.',
    signUpSuccess: 'Your account is ready.',
    stageTitle1: 'Your Name',
    stageTitle2: 'Account Type',
    stageTitle3: 'Your Area and Login',
    stageBody1:
      'Start with the name people should see on this account. Workers can use their own name and supplier accounts can use the business location name.',
    stageBody2:
      'Choose the account type that best matches how you are entering the network.',
    stageBody3:
      'Finish with your ZIP, email, and password so Surplox can place you into the right local feed.',
    alreadyInside: 'Already in Surplox?',
    signInCardTitle: 'Welcome back',
    signInCardBody:
      'Sign in to get back to nearby activity, posts, crews, and alerts.',
    supplierStorefrontTitle: 'Supplier storefront-ready accounts',
    supplierStorefrontBody:
      'Supplier accounts are created ready for storefront setup, materials categories, business hours, delivery radius, and business location details after signup.',
    driverProfileTitle: 'Driver-ready accounts',
    driverProfileBody:
      'Driver accounts are created for delivery-specific setup, including vehicle type, trailer type, trailer length, payload capacity, and delivery radius after signup.',
    supportProfileTitle: 'Jobsite support-ready accounts',
    supportProfileBody:
      'Support accounts like repair are created ready for service tags, equipment tags, and support profile completion after signup.'
  },
  es: {
    formLabel: 'Acceso a Surplox',
    signInTitle: 'Inicia sesión en tu red local del oficio',
    signUpTitle: 'Crea tu cuenta de Surplox',
    signInIntro:
      'Vuelve a oportunidades cercanas, actividad de cuadrillas, alertas, visibilidad de perfil y conexiones locales de construcción.',
    signUpIntro:
      'Registro rápido para trabajadores, ubicaciones proveedoras, conductores de entrega y conexiones locales de construcción. Entra a la app primero y completa lo demás después.',
    previewTitle: 'Configuración rápida',
    previewBody:
      'Surplox permite entrar rápido: nombre o nombre comercial, tipo de cuenta, ZIP y directo al feed.',
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
    point3Body:
      'Muestra tu oficio, categoría de proveedor, línea de conductor o línea de servicio para que la gente correcta te encuentre.',
    point4Title: 'Alertas y conexiones repetidas',
    point4Body:
      'Mantente al tanto de respuestas, uniones, contrataciones y actividad local que puede convertirse en trabajo futuro.',
    footer: 'Hecho para trabajadores, subcontratistas, contratistas, conductores, mecánicos y proveedores.',
    next: 'Siguiente',
    back: 'Atrás',
    finish: 'Entrar a Surplox',
    nameLabel: '¿Cómo se debe llamar esta cuenta?',
    namePlaceholder: 'Juan Martinez o Fort Worth Masonry Supply',
    tradeLabel: '¿Qué tipo de cuenta te representa mejor?',
    generalConstruction: 'Construcción general',
    supplierOption: 'Proveedor',
    deliveryDriverOption: 'Conductor de entrega',
    tradesGroup: 'Oficios',
    driversGroup: 'Conductores',
    servicesGroup: 'Soporte de obra',
    suppliersGroup: 'Proveedores',
    tradesLoading: 'Cargando oficios…',
    tradesUnavailable:
      'Los oficios no están disponibles en este momento. Mostrando oficios predeterminados de Surplox.',
    supportAccountsHint:
      'Elige el tipo de cuenta que mejor describa cómo entras a Surplox: trabajador, proveedor, conductor de entrega o soporte de obra.',
    driverAccountsHint:
      'Las cuentas de conductor son su propia línea dentro de Surplox. Elige la configuración de entrega que mejor coincida con tu capacidad de carga y después completa vehículo, remolque, carga útil y radio en onboarding.',
    supplierAccountsHint:
      'Las cuentas de proveedor son ubicaciones comerciales tipo tienda. Usa el nombre del negocio ahora y termina materiales, horarios y detalles de tienda dentro de Mi Cuenta.',
    supportServiceHint:
      'Las cuentas de soporte de obra cubren líneas de servicio como reparación de equipo y flota.',
    zipLabel: '¿En qué ZIP trabajas normalmente?',
    zipPlaceholder: '76102',
    tradeRequired: 'Selecciona tu tipo de cuenta.',
    zipRequired: 'Ingresa un ZIP válido de 5 dígitos.',
    nameRequired: 'Ingresa tu nombre.',
    emailRequired: 'Ingresa un correo válido.',
    passwordRequired: 'La contraseña debe tener al menos 6 caracteres.',
    signUpSuccess: 'Tu cuenta está lista.',
    stageTitle1: 'Tu Nombre',
    stageTitle2: 'Tipo de Cuenta',
    stageTitle3: 'Tu Zona y Acceso',
    stageBody1:
      'Empieza con el nombre que la gente debe ver en esta cuenta. Los trabajadores pueden usar su propio nombre y las cuentas de proveedor pueden usar el nombre del negocio o ubicación.',
    stageBody2:
      'Elige el tipo de cuenta que mejor representa cómo entras a la red.',
    stageBody3:
      'Termina con tu ZIP, correo y contraseña para que Surplox te coloque en el feed local correcto.',
    alreadyInside: '¿Ya estás en Surplox?',
    signInCardTitle: 'Bienvenido de nuevo',
    signInCardBody:
      'Inicia sesión para volver a actividad cercana, publicaciones, cuadrillas y alertas.',
    supplierStorefrontTitle: 'Cuentas listas para tienda proveedora',
    supplierStorefrontBody:
      'Las cuentas de proveedor se crean listas para configurar tienda, categorías de materiales, horario comercial, radio de entrega y ubicación del negocio después del registro.',
    driverProfileTitle: 'Cuentas listas para conductor',
    driverProfileBody:
      'Las cuentas de conductor se crean para configuración específica de entrega, incluyendo tipo de vehículo, tipo de remolque, largo del remolque, capacidad de carga y radio de entrega después del registro.',
    supportProfileTitle: 'Cuentas listas para soporte de obra',
    supportProfileBody:
      'Las cuentas de soporte como reparación se crean listas para etiquetas de servicio, etiquetas de equipo y finalización del perfil después del registro.'
  }
}

function normalizeMode(value) {
  return value === 'signin' ? 'signin' : 'signup'
}

function dedupeTradeOptions(dynamicTrades) {
  const seen = new Set()
  const result = []

  const addOption = (option) => {
    const key = `${String(option.section || '').trim().toLowerCase()}::${String(option.name || '').trim().toLowerCase()}`
    if (!String(option.name || '').trim() || seen.has(key)) return
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

  DRIVER_SIGNUP_OPTIONS.forEach((option) => addOption(option))
  JOBSITE_SUPPORT_SIGNUP_OPTIONS.forEach((option) => addOption(option))
  addOption(SUPPLIER_SIGNUP_OPTION)

  return result
}

function StepPill({ active, complete, number, label }) {
  return (
    <div
      style={{
        flex: '1 1 160px',
        minWidth: 0,
        maxWidth: '100%',
        padding: 12,
        borderRadius: 22,
        background: active ? '#111111' : complete ? '#fff2a8' : 'var(--card-soft)',
        color: active ? '#ffffff' : 'var(--text)',
        transition: 'all 0.2s ease',
        overflow: 'hidden'
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
      <div
        style={{
          marginTop: 6,
          fontWeight: 800,
          lineHeight: 1.2,
          whiteSpace: 'normal',
          overflowWrap: 'anywhere',
          wordBreak: 'break-word'
        }}
      >
        {label}
      </div>
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

function getSectionLabel(section, copy) {
  if (section === 'supplier') return copy.suppliersGroup
  if (section === 'driver') return copy.driversGroup
  if (section === 'service') return copy.servicesGroup
  return copy.tradesGroup
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

  const selectedTradeOption = useMemo(() => {
    return tradeOptions.find((option) => String(option.id) === String(signUpForm.trade_id)) || null
  }, [tradeOptions, signUpForm.trade_id])

  const isSupplierSelected = selectedTradeOption?.id === SUPPLIER_SIGNUP_OPTION.id
  const isDriverSelected = selectedTradeOption?.section === 'driver'
  const isSupportSelected = selectedTradeOption?.section === 'service'

  useEffect(() => {
    setMode(normalizeMode(searchParams.get('mode')))
  }, [searchParams])

  useEffect(() => {
    if (mode === 'signin') {
      setStep(1)
    }
  }, [mode])

  useEffect(() => {
    let alive = true

    async function loadTrades() {
      setTradesLoading(true)
      setTradesError('')

      try {
        const { data, error } = await supabase.from('trades').select('id,name').order('name')
        if (error) throw error

        if (!alive) return
        setTradeOptions(dedupeTradeOptions(data || []))
      } catch (error) {
        console.error(error)
        if (!alive) return
        setTradesError(copy.tradesUnavailable)
        setTradeOptions(dedupeTradeOptions([]))
      } finally {
        if (!alive) return
        setTradesLoading(false)
      }
    }

    loadTrades()

    return () => {
      alive = false
    }
  }, [copy.tradesUnavailable])

  function updateMode(nextMode) {
    const normalized = normalizeMode(nextMode)
    setMode(normalized)
    setMsg('')
    setStep(1)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('mode', normalized)
      return next
    })
  }

  function updateSignUpField(key, value) {
    setSignUpForm((prev) => ({ ...prev, [key]: value }))
  }

  function updateSignInField(key, value) {
    setSignInForm((prev) => ({ ...prev, [key]: value }))
  }

  function validateStepOne() {
    if (!String(signUpForm.display_name || '').trim()) {
      setMsg(copy.nameRequired)
      return false
    }
    return true
  }

  function validateStepTwo() {
    if (!String(signUpForm.trade_id || '').trim()) {
      setMsg(copy.tradeRequired)
      return false
    }
    return true
  }

  function validateStepThree() {
    if (!/^\d{5}$/.test(String(signUpForm.home_zip || '').trim())) {
      setMsg(copy.zipRequired)
      return false
    }

    const email = String(signUpForm.email || '').trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMsg(copy.emailRequired)
      return false
    }

    if (String(signUpForm.password || '').length < 6) {
      setMsg(copy.passwordRequired)
      return false
    }

    return true
  }

  function goNextStep() {
    setMsg('')

    if (step === 1 && !validateStepOne()) return
    if (step === 2 && !validateStepTwo()) return

    setStep((prev) => Math.min(prev + 1, 3))
  }

  function goBackStep() {
    setMsg('')
    setStep((prev) => Math.max(prev - 1, 1))
  }

  async function handleSignIn(event) {
    event.preventDefault()
    setLoading(true)
    setMsg('')

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: String(signInForm.email || '').trim(),
        password: signInForm.password
      })

      if (error) throw error
      navigate('/feed', { replace: true })
    } catch (error) {
      console.error(error)
      setMsg(error?.message || copy.authError)
    } finally {
      setLoading(false)
    }
  }

  async function handleSignUp() {
    setMsg('')

    if (!validateStepOne() || !validateStepTwo() || !validateStepThree()) return
    if (!selectedTradeOption) {
      setMsg(copy.tradeRequired)
      return
    }

    setLoading(true)

    try {
      const email = String(signUpForm.email || '').trim().toLowerCase()
      const password = String(signUpForm.password || '')
      const displayName = String(signUpForm.display_name || '').trim()
      const homeZip = String(signUpForm.home_zip || '').trim()

      const chosenOption = selectedTradeOption
      const isSupplier = chosenOption.id === SUPPLIER_SIGNUP_OPTION.id
      const isDriver = chosenOption.section === 'driver'

      const chosenRole =
        chosenOption.role ||
        (isSupplier
          ? 'supplier'
          : isDriver
            ? 'driver'
            : chosenOption.section === 'service'
              ? 'mechanic'
              : 'laborer')

      const chosenCategoryGroup =
        chosenOption.category_group ||
        (chosenOption.section === 'driver' || chosenOption.section === 'service'
          ? 'jobsite_support'
          : 'trade')

      const chosenTradeId =
        typeof chosenOption.trade_id !== 'undefined'
          ? chosenOption.trade_id
          : chosenOption.section === 'trade' &&
              !String(chosenOption.id).startsWith('fallback:') &&
              chosenOption.id !== GENERAL_CONSTRUCTION_OPTION.id
            ? Number(chosenOption.id)
            : null

      const chosenBio = chosenOption.bio?.[lang] || chosenOption.bio?.en || ''

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName
          }
        }
      })

      if (signUpError) throw signUpError

      const userId = authData.user?.id
      if (!userId) {
        throw new Error(copy.authError)
      }

      const profilePayload = {
        user_id: userId,
        display_name: displayName,
        role: chosenRole,
        trade_id: chosenTradeId,
        home_zip: homeZip,
        preferred_language: lang,
        category_group: chosenCategoryGroup,
        service_tags: Array.isArray(chosenOption.service_tags) ? chosenOption.service_tags : [],
        equipment_tags: Array.isArray(chosenOption.equipment_tags) ? chosenOption.equipment_tags : [],
        bio: chosenBio,
        business_name: isSupplier ? displayName : null,
        business_zip: isSupplier ? homeZip : null,
        storefront: isSupplier ? true : false,
        vehicle_type: chosenOption.default_vehicle_type || null
      }

      const { error: profileError } = await supabase.from('profiles').upsert(profilePayload)
      if (profileError) throw profileError

      const { error: privateError } = await supabase.from('contact_private').upsert({
        user_id: userId,
        email
      })
      if (privateError) throw privateError

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (signInError) throw signInError

      setMsg(copy.signUpSuccess)
      navigate('/onboarding', { replace: true })
    } catch (error) {
      console.error(error)
      setMsg(error?.message || copy.authError)
    } finally {
      setLoading(false)
    }
  }

  function renderSignIn() {
    return (
      <div className="grid two" style={{ alignItems: 'stretch', gap: 18 }}>
        <div className="card rounded-xl" style={{ padding: 24 }}>
          <div className="badge" style={{ marginBottom: 12, background: '#f1e7a8' }}>
            {copy.formLabel}
          </div>

          <div className="h1">{copy.signInTitle}</div>
          <p className="muted" style={{ marginTop: 10, lineHeight: 1.7 }}>
            {copy.signInIntro}
          </p>

          <form onSubmit={handleSignIn} style={{ marginTop: 18, display: 'grid', gap: 14 }}>
            <LanguageSlider lang={lang} setLang={setLang} copy={copy} />

            <div>
              <div className="muted" style={{ marginBottom: 6 }}>
                {copy.email}
              </div>
              <input
                className="input"
                type="email"
                value={signInForm.email}
                placeholder={copy.emailPlaceholder}
                onChange={(e) => updateSignInField('email', e.target.value)}
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
                onChange={(e) => updateSignInField('password', e.target.value)}
              />
            </div>

            {msg ? (
              <div className="card-soft" style={{ minHeight: 'auto', padding: 14 }}>
                {msg}
              </div>
            ) : null}

            <button className="btn primary" type="submit" disabled={loading}>
              {loading ? copy.wait : copy.signInButton}
            </button>

            <button
              type="button"
              className="btn"
              onClick={() => updateMode('signup')}
              disabled={loading}
            >
              {copy.switchToSignUp}
            </button>
          </form>
        </div>

        <div className="card rounded-xl" style={{ padding: 24, background: '#fffaf0' }}>
          <div className="badge" style={{ marginBottom: 12 }}>
            {copy.alreadyInside}
          </div>

          <div className="h1">{copy.signInCardTitle}</div>
          <p className="muted" style={{ marginTop: 10, lineHeight: 1.75 }}>
            {copy.signInCardBody}
          </p>

          <div className="card-soft" style={{ marginTop: 18, background: '#ffffff' }}>
            <div style={{ fontWeight: 900, fontSize: 18 }}>{copy.sideTitle}</div>
            <p className="muted" style={{ marginTop: 8, lineHeight: 1.7 }}>
              {copy.sideBody}
            </p>
          </div>
        </div>
      </div>
    )
  }

  function renderStepOne() {
    return (
      <div className="card rounded-xl" style={{ padding: 24 }}>
        <div className="card-section-title">{copy.stageTitle1}</div>
        <p className="card-section-subtitle" style={{ marginTop: 8 }}>
          {copy.stageBody1}
        </p>

        <div style={{ marginTop: 18 }}>
          <div className="muted" style={{ marginBottom: 6 }}>
            {copy.nameLabel}
          </div>
          <input
            className="input"
            value={signUpForm.display_name}
            placeholder={copy.namePlaceholder}
            onChange={(e) => updateSignUpField('display_name', e.target.value)}
          />
        </div>
      </div>
    )
  }

  function renderStepTwo() {
    const groupedOptions = tradeOptions.reduce((acc, option) => {
      const section = option.section || 'trade'
      if (!acc[section]) acc[section] = []
      acc[section].push(option)
      return acc
    }, {})

    const orderedSections = ['trade', 'driver', 'service', 'supplier'].filter(
      (section) => groupedOptions[section]?.length
    )

    return (
      <div className="card rounded-xl" style={{ padding: 24 }}>
        <div className="card-section-title">{copy.stageTitle2}</div>
        <p className="card-section-subtitle" style={{ marginTop: 8 }}>
          {copy.stageBody2}
        </p>

        <div className="card-soft" style={{ marginTop: 16, background: '#fffaf0' }}>
          <div style={{ fontWeight: 800 }}>{copy.supportAccountsHint}</div>
          <p className="muted" style={{ marginTop: 8, lineHeight: 1.7 }}>
            {isDriverSelected
              ? copy.driverAccountsHint
              : isSupplierSelected
                ? copy.supplierAccountsHint
                : isSupportSelected
                  ? copy.supportServiceHint
                  : copy.supportAccountsHint}
          </p>
        </div>

        {tradesLoading ? (
          <div className="card-soft" style={{ marginTop: 16 }}>
            {copy.tradesLoading}
          </div>
        ) : null}

        {tradesError ? (
          <div className="card-soft" style={{ marginTop: 16 }}>
            {tradesError}
          </div>
        ) : null}

        <div style={{ marginTop: 18, display: 'grid', gap: 16 }}>
          {orderedSections.map((section) => (
            <div key={section}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--muted-soft)',
                  marginBottom: 10
                }}
              >
                {getSectionLabel(section, copy)}
              </div>

              <div style={{ display: 'grid', gap: 10 }}>
                {groupedOptions[section].map((option) => {
                  const active = String(signUpForm.trade_id) === String(option.id)

                  return (
                    <button
                      key={option.id}
                      type="button"
                      className={active ? 'btn primary' : 'btn'}
                      style={{ justifyContent: 'flex-start', textAlign: 'left', borderRadius: 18 }}
                      onClick={() => updateSignUpField('trade_id', String(option.id))}
                    >
                      {getOptionLabel(option, copy)}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {isDriverSelected ? (
          <div className="card-soft" style={{ marginTop: 18, background: '#eef6ff' }}>
            <div style={{ fontWeight: 900 }}>{copy.driverProfileTitle}</div>
            <p className="muted" style={{ marginTop: 8, lineHeight: 1.7 }}>
              {copy.driverProfileBody}
            </p>
          </div>
        ) : null}

        {isSupplierSelected ? (
          <div className="card-soft" style={{ marginTop: 18, background: '#fff7cf' }}>
            <div style={{ fontWeight: 900 }}>{copy.supplierStorefrontTitle}</div>
            <p className="muted" style={{ marginTop: 8, lineHeight: 1.7 }}>
              {copy.supplierStorefrontBody}
            </p>
          </div>
        ) : null}

        {isSupportSelected ? (
          <div className="card-soft" style={{ marginTop: 18, background: '#f4efff' }}>
            <div style={{ fontWeight: 900 }}>{copy.supportProfileTitle}</div>
            <p className="muted" style={{ marginTop: 8, lineHeight: 1.7 }}>
              {copy.supportProfileBody}
            </p>
          </div>
        ) : null}
      </div>
    )
  }

  function renderStepThree() {
    return (
      <div className="card rounded-xl" style={{ padding: 24 }}>
        <div className="card-section-title">{copy.stageTitle3}</div>
        <p className="card-section-subtitle" style={{ marginTop: 8 }}>
          {copy.stageBody3}
        </p>

        <div className="grid" style={{ marginTop: 18, gap: 14 }}>
          <div>
            <div className="muted" style={{ marginBottom: 6 }}>
              {copy.zipLabel}
            </div>
            <input
              className="input"
              value={signUpForm.home_zip}
              placeholder={copy.zipPlaceholder}
              onChange={(e) => updateSignUpField('home_zip', e.target.value.replace(/[^\d]/g, '').slice(0, 5))}
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
              onChange={(e) => updateSignUpField('email', e.target.value)}
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
              onChange={(e) => updateSignUpField('password', e.target.value)}
            />
          </div>
        </div>
      </div>
    )
  }

  function renderSignUp() {
    return (
      <div className="grid two" style={{ alignItems: 'start', gap: 18 }}>
        <div className="grid" style={{ gap: 18 }}>
          <div className="card rounded-xl" style={{ padding: 24 }}>
            <div className="badge" style={{ marginBottom: 12, background: '#f1e7a8' }}>
              {copy.formLabel}
            </div>

            <div className="h1">{copy.signUpTitle}</div>
            <p className="muted" style={{ marginTop: 10, lineHeight: 1.7 }}>
              {copy.signUpIntro}
            </p>

            <div style={{ marginTop: 18 }}>
              <LanguageSlider lang={lang} setLang={setLang} copy={copy} />
            </div>

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
          </div>

          {step === 1 ? renderStepOne() : null}
          {step === 2 ? renderStepTwo() : null}
          {step === 3 ? renderStepThree() : null}

          {msg ? (
            <div className="card-soft" style={{ minHeight: 'auto', padding: 14 }}>
              {msg}
            </div>
          ) : null}

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {step > 1 ? (
              <button type="button" className="btn" onClick={goBackStep} disabled={loading}>
                {copy.back}
              </button>
            ) : null}

            {step < 3 ? (
              <button type="button" className="btn primary" onClick={goNextStep} disabled={loading}>
                {copy.next}
              </button>
            ) : (
              <button type="button" className="btn primary" onClick={handleSignUp} disabled={loading}>
                {loading ? copy.wait : copy.finish}
              </button>
            )}

            <button type="button" className="btn" onClick={() => updateMode('signin')} disabled={loading}>
              {copy.switchToSignIn}
            </button>
          </div>
        </div>

        <div className="grid" style={{ gap: 18 }}>
          <div className="card rounded-xl" style={{ padding: 24, background: '#fffaf0' }}>
            <div className="badge" style={{ marginBottom: 12 }}>
              {copy.previewTitle}
            </div>

            <div className="h1">{copy.previewTitle}</div>
            <p className="muted" style={{ marginTop: 10, lineHeight: 1.75 }}>
              {copy.previewBody}
            </p>

            <div className="grid" style={{ gap: 10, marginTop: 16 }}>
              <div className="card-soft" style={{ background: '#ffffff' }}>{copy.previewBullet1}</div>
              <div className="card-soft" style={{ background: '#ffffff' }}>{copy.previewBullet2}</div>
              <div className="card-soft" style={{ background: '#ffffff' }}>{copy.previewBullet3}</div>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
              <span className="badge">{copy.previewFree}</span>
              <span className="badge">{copy.previewTexas}</span>
            </div>
          </div>

          <div className="card rounded-xl" style={{ padding: 24 }}>
            <div className="badge" style={{ marginBottom: 12, background: '#f1e7a8' }}>
              {copy.sideBadge}
            </div>
            <div className="h1" style={{ fontSize: 28 }}>{copy.sideTitle}</div>
            <p className="muted" style={{ marginTop: 10, lineHeight: 1.75 }}>
              {copy.sideBody}
            </p>

            <div className="grid" style={{ gap: 12, marginTop: 16 }}>
              <div className="card-soft">
                <div style={{ fontWeight: 900 }}>{copy.point1Title}</div>
                <p className="muted" style={{ marginTop: 8, lineHeight: 1.65 }}>{copy.point1Body}</p>
              </div>

              <div className="card-soft">
                <div style={{ fontWeight: 900 }}>{copy.point2Title}</div>
                <p className="muted" style={{ marginTop: 8, lineHeight: 1.65 }}>{copy.point2Body}</p>
              </div>

              <div className="card-soft">
                <div style={{ fontWeight: 900 }}>{copy.point3Title}</div>
                <p className="muted" style={{ marginTop: 8, lineHeight: 1.65 }}>{copy.point3Body}</p>
              </div>

              <div className="card-soft">
                <div style={{ fontWeight: 900 }}>{copy.point4Title}</div>
                <p className="muted" style={{ marginTop: 8, lineHeight: 1.65 }}>{copy.point4Body}</p>
              </div>
            </div>

            <p className="muted" style={{ marginTop: 16 }}>
              {copy.footer}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return mode === 'signin' ? renderSignIn() : renderSignUp()
}