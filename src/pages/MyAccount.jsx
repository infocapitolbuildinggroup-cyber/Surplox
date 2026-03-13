import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'

const ROLE_OPTIONS = [
  { value: 'laborer', label: { en: 'Laborer', es: 'Trabajador' } },
  { value: 'subcontractor', label: { en: 'Subcontractor', es: 'Subcontratista' } },
  { value: 'contractor', label: { en: 'Contractor', es: 'Contratista' } },
  { value: 'supplier', label: { en: 'Supplier', es: 'Proveedor' } }
]

const CATEGORY_GROUP_OPTIONS = [
  { value: 'trade', label: { en: 'Trades', es: 'Oficios' } },
  { value: 'jobsite_support', label: { en: 'Jobsite Support', es: 'Soporte de obra' } }
]

const JOBSITE_SUPPORT_OPTIONS = [
  {
    value: 'material_delivery',
    label: { en: 'Material Delivery / Hot Shot', es: 'Entrega de materiales / Hot Shot' }
  },
  {
    value: 'equipment_fleet_repair',
    label: { en: 'Equipment / Fleet Repair', es: 'Reparación de equipo / flota' }
  }
]

const AVAILABILITY_OPTIONS = [
  { value: 'available_now', label: { en: 'Available Now', es: 'Disponible ahora' } },
  { value: 'available_this_week', label: { en: 'Available This Week', es: 'Disponible esta semana' } },
  { value: 'busy', label: { en: 'Busy', es: 'Ocupado' } }
]

const MATERIAL_DELIVERY_SERVICE_TAGS = [
  { value: 'material_delivery', label: { en: 'Material Delivery', es: 'Entrega de materiales' } },
  { value: 'hot_shot', label: { en: 'Hot Shot', es: 'Hot Shot' } },
  { value: 'last_mile_delivery', label: { en: 'Last Mile Delivery', es: 'Entrega última milla' } },
  { value: 'local_runs', label: { en: 'Local Runs', es: 'Viajes locales' } },
  { value: 'same_day_delivery', label: { en: 'Same Day Delivery', es: 'Entrega el mismo día' } },
  { value: 'long_distance', label: { en: 'Long Distance', es: 'Larga distancia' } }
]

const MATERIAL_DELIVERY_EQUIPMENT_TAGS = [
  { value: 'pickup_truck', label: { en: 'Pickup Truck', es: 'Pickup' } },
  { value: 'cargo_van', label: { en: 'Cargo Van', es: 'Cargo van' } },
  { value: 'flatbed_trailer', label: { en: 'Flatbed Trailer', es: 'Remolque plataforma' } },
  { value: 'gooseneck_trailer', label: { en: 'Gooseneck Trailer', es: 'Remolque gooseneck' } }
]

const FLEET_REPAIR_SERVICE_TAGS = [
  { value: 'diesel_mechanic', label: { en: 'Diesel Mechanic', es: 'Mecánico diésel' } },
  {
    value: 'heavy_equipment_repair',
    label: { en: 'Heavy Equipment Repair', es: 'Reparación de equipo pesado' }
  },
  { value: 'trailer_repair', label: { en: 'Trailer Repair', es: 'Reparación de remolques' } },
  { value: 'emergency_repair', label: { en: 'Emergency Repair', es: 'Reparación de emergencia' } },
  { value: 'jobsite_service', label: { en: 'Jobsite Service', es: 'Servicio en obra' } }
]

const FLEET_REPAIR_EQUIPMENT_TAGS = [
  { value: 'mobile_repair_truck', label: { en: 'Mobile Repair Truck', es: 'Camión de reparación móvil' } },
  { value: 'diesel_diagnostics', label: { en: 'Diesel Diagnostics', es: 'Diagnóstico diésel' } },
  {
    value: 'trailer_brake_tools',
    label: { en: 'Trailer Brake Tools', es: 'Herramientas de frenos de remolque' }
  }
]

const COPY = {
  en: {
    loading: 'Loading your account…',
    signedInRequired: 'You must be signed in to update your account.',
    displayNameRequired: 'Display name is required.',
    zipInvalid: 'Enter a valid 5-digit ZIP code.',
    tradeRequired: 'Select your trade.',
    emailInvalid: 'Enter a valid email address.',
    phoneInvalid: 'Enter a valid phone number.',
    languageInvalid: 'Select a valid language.',
    availabilityInvalid: 'Select a valid availability status.',
    categoryInvalid: 'Select a valid category group.',
    success: 'Your account has been updated.',
    saveError: 'Unable to save your account changes.',
    title: 'My Surplox Account',
    intro: 'Review and update your account information below.',
    displayName: 'Display Name',
    primaryRole: 'Primary Role',
    trade: 'Trade',
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email Address',
    phone: 'Phone Number',
    city: 'City',
    zip: 'Home ZIP Code',
    radius: 'Travel Radius (Miles)',
    crewSize: 'Crew Size',
    language: 'Preferred Language',
    bio: 'Bio / Experience / Certifications',
    bioPlaceholder:
      'Share what kind of work you do, your experience level, certifications, capabilities, delivery coverage, or repair specialty.',
    selectTrade: 'Select your trade',
    inviteTitle: 'Invite Your Crew',
    inviteBody:
      'Use your personal Surplox invite link to bring classmates, coworkers, runners, mechanics, or people from your crew onto the network.',
    copyInvite: 'Copy Invite Link',
    shareInvite: 'Share Invite',
    textInvite: 'Text Invite',
    emailInvite: 'Email Invite',
    inviteCopied: 'Your invite link was copied.',
    inviteCopyError: 'Unable to copy your invite link right now.',
    inviteShareError: 'Unable to open the share menu right now.',
    inviteTextError: 'Unable to open text invite right now.',
    inviteEmailError: 'Unable to open email invite right now.',
    invitePreviewLabel: 'Your invite link',
    save: 'Save Changes',
    saving: 'Saving…',
    completionTitle: 'Finish Profile Completion',
    completionBody:
      'Complete these remaining items so your profile is fully finished and carries more weight with workers, crews, contractors, and jobsite support users.',
    completionCrew: 'Add crew size',
    completionBio: 'Add experience and certifications in your bio',
    completionPhone: 'Add phone number',
    completionCity: 'Add city',
    completionFirstLast: 'Add first and last name',
    completionRole: 'Add primary role',
    accountOverview: 'Account Overview',
    accountOverviewBody:
      'Keep your profile clean, credible, and ready for nearby work opportunities, material runs, repair requests, and crew invites.',
    profileStrength: 'Profile Strength',
    complete: 'Complete',
    incomplete: 'Needs work',
    categoryGroup: 'Category Group',
    jobsiteSupportType: 'Jobsite Support Type',
    jobsiteSupportIntro:
      'Use Jobsite Support for material delivery, hot shot, fleet repair, and equipment repair profiles.',
    serviceTags: 'Service Tags',
    equipmentTags: 'Equipment Tags',
    availabilityStatus: 'Availability Status',
    contractorVerification: 'Contractor Verification',
    verifiedContractor: 'Verified Contractor',
    notVerifiedContractor: 'Not Verified',
    serviceProfileTitle: 'Jobsite Support Profile',
    servicesEquipmentBody:
      'Select the services you offer and the equipment you have so contractors know exactly what you can do.',
    tradesGroup: 'Trades',
    jobsiteSupportGroup: 'Jobsite Support',
    materialDeliveryType: 'Material Delivery / Hot Shot',
    fleetRepairType: 'Equipment / Fleet Repair',
    selectSupportType: 'Select support type'
  },
  es: {
    loading: 'Cargando tu cuenta…',
    signedInRequired: 'Debes iniciar sesión para actualizar tu cuenta.',
    displayNameRequired: 'El nombre visible es obligatorio.',
    zipInvalid: 'Ingresa un código postal válido de 5 dígitos.',
    tradeRequired: 'Selecciona tu oficio.',
    emailInvalid: 'Ingresa un correo electrónico válido.',
    phoneInvalid: 'Ingresa un número de teléfono válido.',
    languageInvalid: 'Selecciona un idioma válido.',
    availabilityInvalid: 'Selecciona un estado de disponibilidad válido.',
    categoryInvalid: 'Selecciona un grupo de categoría válido.',
    success: 'Tu cuenta ha sido actualizada.',
    saveError: 'No se pudieron guardar los cambios de tu cuenta.',
    title: 'Mi cuenta de Surplox',
    intro: 'Revisa y actualiza la información de tu cuenta abajo.',
    displayName: 'Nombre visible',
    primaryRole: 'Rol principal',
    trade: 'Oficio',
    firstName: 'Nombre',
    lastName: 'Apellido',
    email: 'Correo electrónico',
    phone: 'Número de teléfono',
    city: 'Ciudad',
    zip: 'Código postal',
    radius: 'Radio de viaje (millas)',
    crewSize: 'Tamaño de cuadrilla',
    language: 'Idioma preferido',
    bio: 'Biografía / Experiencia / Certificaciones',
    bioPlaceholder:
      'Comparte qué tipo de trabajo haces, tu experiencia, certificaciones, capacidades, cobertura de entrega o especialidad de reparación.',
    selectTrade: 'Selecciona tu oficio',
    inviteTitle: 'Invita a tu cuadrilla',
    inviteBody:
      'Usa tu enlace personal de Surplox para invitar compañeros de clase, compañeros de trabajo, runners, mecánicos o gente de tu cuadrilla.',
    copyInvite: 'Copiar enlace',
    shareInvite: 'Compartir',
    textInvite: 'Invitar por texto',
    emailInvite: 'Invitar por correo',
    inviteCopied: 'Tu enlace de invitación fue copiado.',
    inviteCopyError: 'No se pudo copiar tu enlace en este momento.',
    inviteShareError: 'No se pudo abrir el menú para compartir.',
    inviteTextError: 'No se pudo abrir la invitación por texto.',
    inviteEmailError: 'No se pudo abrir la invitación por correo.',
    invitePreviewLabel: 'Tu enlace de invitación',
    save: 'Guardar cambios',
    saving: 'Guardando…',
    completionTitle: 'Terminar perfil',
    completionBody:
      'Completa estos elementos restantes para que tu perfil quede completamente terminado y tenga más peso con trabajadores, cuadrillas, contratistas y usuarios de soporte de obra.',
    completionCrew: 'Agregar tamaño de cuadrilla',
    completionBio: 'Agregar experiencia y certificaciones en tu biografía',
    completionPhone: 'Agregar número de teléfono',
    completionCity: 'Agregar ciudad',
    completionFirstLast: 'Agregar nombre y apellido',
    completionRole: 'Agregar rol principal',
    accountOverview: 'Resumen de cuenta',
    accountOverviewBody:
      'Mantén tu perfil limpio, creíble y listo para oportunidades cercanas, entregas de materiales, solicitudes de reparación e invitaciones de cuadrilla.',
    profileStrength: 'Fuerza del perfil',
    complete: 'Completo',
    incomplete: 'Necesita trabajo',
    categoryGroup: 'Grupo de categoría',
    jobsiteSupportType: 'Tipo de soporte de obra',
    jobsiteSupportIntro:
      'Usa Soporte de obra para entrega de materiales, hot shot, reparación de flota y reparación de equipo.',
    serviceTags: 'Etiquetas de servicio',
    equipmentTags: 'Etiquetas de equipo',
    availabilityStatus: 'Estado de disponibilidad',
    contractorVerification: 'Verificación de contratista',
    verifiedContractor: 'Contratista verificado',
    notVerifiedContractor: 'No verificado',
    serviceProfileTitle: 'Perfil de soporte de obra',
    servicesEquipmentBody:
      'Selecciona los servicios que ofreces y el equipo que tienes para que los contratistas sepan exactamente lo que puedes hacer.',
    tradesGroup: 'Oficios',
    jobsiteSupportGroup: 'Soporte de obra',
    materialDeliveryType: 'Entrega de materiales / Hot Shot',
    fleetRepairType: 'Reparación de equipo / flota',
    selectSupportType: 'Selecciona tipo de soporte'
  }
}

function OverviewStat({ label, value }) {
  return (
    <div className="card-soft" style={{ gap: 8 }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--muted-soft)'
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 18,
          lineHeight: 1.3,
          fontWeight: 900,
          color: 'var(--text)'
        }}
      >
        {value}
      </div>
    </div>
  )
}

function labelForOption(option, lang) {
  return option.label?.[lang] || option.label?.en || option.value
}

function getSupportOptions(jobsiteSupportType) {
  if (jobsiteSupportType === 'material_delivery') {
    return {
      serviceOptions: MATERIAL_DELIVERY_SERVICE_TAGS,
      equipmentOptions: MATERIAL_DELIVERY_EQUIPMENT_TAGS
    }
  }

  if (jobsiteSupportType === 'equipment_fleet_repair') {
    return {
      serviceOptions: FLEET_REPAIR_SERVICE_TAGS,
      equipmentOptions: FLEET_REPAIR_EQUIPMENT_TAGS
    }
  }

  return {
    serviceOptions: [],
    equipmentOptions: []
  }
}

function detectSupportType(serviceTags = []) {
  if (
    serviceTags.some((tag) =>
      ['diesel_mechanic', 'heavy_equipment_repair', 'trailer_repair', 'emergency_repair', 'jobsite_service'].includes(tag)
    )
  ) {
    return 'equipment_fleet_repair'
  }
  return 'material_delivery'
}

export default function MyAccount({ lang: langProp = 'en', setLang: setGlobalLang }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [trades, setTrades] = useState([])
  const [lang, setLang] = useState(langProp || localStorage.getItem('surplox_lang') || 'en')
  const [inviteCode, setInviteCode] = useState('')

  const [form, setForm] = useState({
    display_name: '',
    first_name: '',
    last_name: '',
    role: 'laborer',
    trade_id: '',
    home_zip: '',
    travel_radius_miles: 50,
    crew_size: 1,
    bio: '',
    phone: '',
    city: '',
    email: '',
    preferred_language: 'en',
    category_group: 'trade',
    jobsite_support_type: 'material_delivery',
    service_tags: [],
    equipment_tags: [],
    availability_status: 'available_now',
    contractor_verified: false
  })

  const copy = COPY[lang] || COPY.en
  const { serviceOptions, equipmentOptions } = getSupportOptions(form.jobsite_support_type)

  useEffect(() => {
    setLang(langProp || localStorage.getItem('surplox_lang') || 'en')
  }, [langProp])

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function normalizePhone(raw) {
    return String(raw || '').replace(/\D/g, '')
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim())
  }

  function roleLabel(option) {
    return option.label[form.preferred_language] || option.label.en
  }

  function buildInviteUrl() {
    const base = `${window.location.origin}/join`
    return inviteCode ? `${base}?ref=${encodeURIComponent(inviteCode)}` : base
  }

  function getInviteText() {
    const name = form.display_name?.trim() || 'A Surplox member'
    const message =
      lang === 'es'
        ? `${name} te invitó a unirte a Surplox, la red local de construcción para cuadrillas, trabajo, entregas y soporte de obra.`
        : `${name} invited you to join Surplox, the local construction network for crews, work, delivery, and jobsite support.`

    return `${message}\n\n${buildInviteUrl()}`
  }

  async function copyInviteLink() {
    try {
      await navigator.clipboard.writeText(buildInviteUrl())
      setMsg(copy.inviteCopied)
    } catch (err) {
      console.error(err)
      setMsg(copy.inviteCopyError)
    }
  }

  async function shareInviteLink() {
    try {
      const shareData = {
        title: 'Surplox',
        text: getInviteText(),
        url: buildInviteUrl()
      }

      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await copyInviteLink()
      }
    } catch (err) {
      if (err?.name === 'AbortError') return
      console.error(err)
      setMsg(copy.inviteShareError)
    }
  }

  function textInvite() {
    try {
      window.open(`sms:?&body=${encodeURIComponent(getInviteText())}`, '_self')
    } catch (err) {
      console.error(err)
      setMsg(copy.inviteTextError)
    }
  }

  function emailInvite() {
    try {
      const subject = encodeURIComponent('Join me on Surplox')
      const body = encodeURIComponent(getInviteText())
      window.location.href = `mailto:?subject=${subject}&body=${body}`
    } catch (err) {
      console.error(err)
      setMsg(copy.inviteEmailError)
    }
  }

  function toggleMultiTag(field, value) {
    setForm((prev) => {
      const current = Array.isArray(prev[field]) ? prev[field] : []
      const exists = current.includes(value)
      return {
        ...prev,
        [field]: exists ? current.filter((x) => x !== value) : [...current, value]
      }
    })
  }

  useEffect(() => {
    if (form.category_group !== 'jobsite_support') return

    const nextType = form.jobsite_support_type || 'material_delivery'
    const { serviceOptions: nextServiceOptions, equipmentOptions: nextEquipmentOptions } =
      getSupportOptions(nextType)

    const validServiceSet = new Set(nextServiceOptions.map((x) => x.value))
    const validEquipmentSet = new Set(nextEquipmentOptions.map((x) => x.value))

    setForm((prev) => ({
      ...prev,
      service_tags: prev.service_tags.filter((tag) => validServiceSet.has(tag)),
      equipment_tags: prev.equipment_tags.filter((tag) => validEquipmentSet.has(tag))
    }))
  }, [form.category_group, form.jobsite_support_type])

  useEffect(() => {
    async function load() {
      setLoading(true)
      setMsg('')

      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const user = sessionData.session?.user

        if (!user) {
          setLoading(false)
          return
        }

        const { data: tradeRows, error: tradeErr } = await supabase
          .from('trades')
          .select('id,name')
          .order('name')

        if (tradeErr) console.error(tradeErr)

        const { data: prof, error: profErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        if (profErr) console.error(profErr)

        const { data: cp, error: cpErr } = await supabase
          .from('contact_private')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        if (cpErr) console.error(cpErr)

        const userLang =
          prof?.preferred_language || langProp || localStorage.getItem('surplox_lang') || 'en'

        const categoryGroup = prof?.category_group || 'trade'
        const serviceTags = Array.isArray(prof?.service_tags) ? prof.service_tags : []
        const equipmentTags = Array.isArray(prof?.equipment_tags) ? prof.equipment_tags : []
        const supportType =
          categoryGroup === 'jobsite_support' ? detectSupportType(serviceTags) : 'material_delivery'

        setInviteCode(user.id)
        setLang(userLang)
        localStorage.setItem('surplox_lang', userLang)
        setTrades(tradeRows || [])

        setForm({
          display_name: prof?.display_name || '',
          first_name: prof?.first_name || '',
          last_name: prof?.last_name || '',
          role: prof?.role || 'laborer',
          trade_id: prof?.trade_id ? String(prof.trade_id) : '',
          home_zip: prof?.home_zip || '',
          travel_radius_miles: prof?.travel_radius_miles ?? 50,
          crew_size: prof?.crew_size ?? 1,
          bio: prof?.bio || '',
          phone: cp?.phone || '',
          city: cp?.city || '',
          email: cp?.email || user.email || '',
          preferred_language: userLang,
          category_group: categoryGroup,
          jobsite_support_type: supportType,
          service_tags: serviceTags,
          equipment_tags: equipmentTags,
          availability_status: prof?.availability_status || 'available_now',
          contractor_verified: Boolean(prof?.contractor_verified)
        })
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [langProp])

  const completionItems = useMemo(() => {
    const items = []

    if (!String(form.first_name || '').trim() || !String(form.last_name || '').trim()) {
      items.push(copy.completionFirstLast)
    }

    if (!String(form.role || '').trim()) {
      items.push(copy.completionRole)
    }

    if (!Number(form.crew_size || 0) || Number(form.crew_size || 0) <= 1) {
      items.push(copy.completionCrew)
    }

    if (!String(form.bio || '').trim()) {
      items.push(copy.completionBio)
    }

    if (!String(form.phone || '').trim()) {
      items.push(copy.completionPhone)
    }

    if (!String(form.city || '').trim()) {
      items.push(copy.completionCity)
    }

    return items
  }, [form, copy])

  async function save() {
    setSaving(true)
    setMsg('')

    const activeCopy = COPY[form.preferred_language] || COPY.en

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user

      if (!user) throw new Error(activeCopy.signedInRequired)
      if (!form.display_name.trim()) throw new Error(activeCopy.displayNameRequired)
      if (!/^[0-9]{5}$/.test(form.home_zip)) throw new Error(activeCopy.zipInvalid)
      if (form.category_group === 'trade' && !form.trade_id) throw new Error(activeCopy.tradeRequired)

      const phoneDigits = normalizePhone(form.phone)
      if (form.phone.trim() && phoneDigits.length < 10) throw new Error(activeCopy.phoneInvalid)
      if (form.email.trim() && !isValidEmail(form.email)) throw new Error(activeCopy.emailInvalid)

      if (!['en', 'es'].includes(form.preferred_language)) {
        throw new Error(activeCopy.languageInvalid)
      }

      if (!['available_now', 'available_this_week', 'busy'].includes(form.availability_status)) {
        throw new Error(activeCopy.availabilityInvalid)
      }

      if (!['trade', 'jobsite_support'].includes(form.category_group)) {
        throw new Error(activeCopy.categoryInvalid)
      }

      const displayName = form.display_name.trim()
      const firstName = form.first_name.trim() || displayName.split(/\s+/)[0] || displayName

      const profilePayload = {
        user_id: user.id,
        display_name: displayName,
        first_name: firstName,
        last_name: form.last_name.trim(),
        role: form.role || 'laborer',
        trade_id: form.category_group === 'trade' ? Number(form.trade_id) : null,
        travel_radius_miles: Number(form.travel_radius_miles || 50),
        crew_size: Number(form.crew_size || 1),
        bio: form.bio.trim(),
        preferred_language: form.preferred_language,
        category_group: form.category_group,
        service_tags: form.category_group === 'jobsite_support' ? form.service_tags : [],
        equipment_tags: form.category_group === 'jobsite_support' ? form.equipment_tags : [],
        availability_status: form.availability_status
      }

      const { error: profErr } = await supabase.from('profiles').upsert(profilePayload)
      if (profErr) throw profErr

      const { error: zipErr } = await supabase.rpc('set_my_home_zip', {
        p_zip: form.home_zip
      })
      if (zipErr) throw zipErr

      const { error: cpErr } = await supabase.from('contact_private').upsert({
        user_id: user.id,
        phone: phoneDigits || null,
        city: form.city.trim() || null,
        email: form.email.trim() ? form.email.trim().toLowerCase() : null
      })
      if (cpErr) throw cpErr

      localStorage.setItem('surplox_lang', form.preferred_language)
      setLang(form.preferred_language)

      if (typeof setGlobalLang === 'function') {
        await setGlobalLang(form.preferred_language)
      }

      setMsg(activeCopy.success)
    } catch (err) {
      console.error(err)
      setMsg(err.message || activeCopy.saveError)
    } finally {
      setSaving(false)
    }
  }

  const completionPercent = Math.round(((6 - completionItems.length) / 6) * 100)

  if (loading) return <div className="card">{copy.loading}</div>

  return (
    <div className="grid" style={{ gap: 18, maxWidth: 980, margin: '0 auto' }}>
      <div
        className="card rounded-xl"
        style={{
          padding: 28,
          background: 'linear-gradient(180deg, #fff7c8 0%, #f7f7f2 100%)'
        }}
      >
        <div className="h1" style={{ marginBottom: 8 }}>
          {copy.title}
        </div>

        <p className="muted" style={{ fontSize: 17, lineHeight: 1.7, maxWidth: 760 }}>
          {copy.intro}
        </p>

        <div className="grid two" style={{ marginTop: 18 }}>
          <OverviewStat label={copy.accountOverview} value={copy.accountOverviewBody} />
          <OverviewStat
            label={copy.profileStrength}
            value={`${completionPercent}% · ${
              completionItems.length === 0 ? copy.complete : copy.incomplete
            }`}
          />
        </div>
      </div>

      {completionItems.length > 0 ? (
        <div
          className="card rounded-xl"
          style={{
            padding: 22,
            background: '#fff4da'
          }}
        >
          <div className="card-section-title">{copy.completionTitle}</div>
          <p className="card-section-subtitle" style={{ marginTop: 8 }}>
            {copy.completionBody}
          </p>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
            {completionItems.map((item) => (
              <span key={item} className="badge">
                {item}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="card-section-title">{copy.inviteTitle}</div>
        <p className="card-section-subtitle" style={{ marginTop: 8 }}>
          {copy.inviteBody}
        </p>

        <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn small primary" onClick={copyInviteLink}>
            {copy.copyInvite}
          </button>
          <button className="btn small" onClick={shareInviteLink}>
            {copy.shareInvite}
          </button>
          <button className="btn small" onClick={textInvite}>
            {copy.textInvite}
          </button>
          <button className="btn small" onClick={emailInvite}>
            {copy.emailInvite}
          </button>
        </div>

        <div className="card-soft" style={{ marginTop: 14, padding: 14 }}>
          <div className="muted" style={{ marginBottom: 6 }}>
            {copy.invitePreviewLabel}
          </div>
          <div style={{ wordBreak: 'break-all', fontWeight: 700 }}>
            {buildInviteUrl()}
          </div>
        </div>
      </div>

      {msg ? (
        <div className="card-message" style={{ padding: 14, borderRadius: 18 }}>
          {msg}
        </div>
      ) : null}

      <div className="grid two">
        <div className="card rounded-xl" style={{ padding: 24 }}>
          <div className="grid" style={{ gap: 14 }}>
            <div>
              <div className="muted" style={{ marginBottom: 6 }}>{copy.displayName}</div>
              <input
                className="input"
                value={form.display_name}
                onChange={(e) => setField('display_name', e.target.value)}
              />
            </div>

            <div>
              <div className="muted" style={{ marginBottom: 6 }}>{copy.primaryRole}</div>
              <select
                className="input"
                value={form.role}
                onChange={(e) => setField('role', e.target.value)}
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {roleLabel(option)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="muted" style={{ marginBottom: 6 }}>{copy.categoryGroup}</div>
              <select
                className="input"
                value={form.category_group}
                onChange={(e) => setField('category_group', e.target.value)}
              >
                {CATEGORY_GROUP_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {labelForOption(option, form.preferred_language)}
                  </option>
                ))}
              </select>
            </div>

            {form.category_group === 'trade' ? (
              <div>
                <div className="muted" style={{ marginBottom: 6 }}>{copy.trade}</div>
                <select
                  className="input"
                  value={form.trade_id}
                  onChange={(e) => setField('trade_id', e.target.value)}
                >
                  <option value="">{copy.selectTrade}</option>
                  {trades.map((trade) => (
                    <option key={trade.id} value={trade.id}>
                      {trade.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <>
                <div>
                  <div className="muted" style={{ marginBottom: 6 }}>{copy.jobsiteSupportType}</div>
                  <select
                    className="input"
                    value={form.jobsite_support_type}
                    onChange={(e) => setField('jobsite_support_type', e.target.value)}
                  >
                    {JOBSITE_SUPPORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {labelForOption(option, form.preferred_language)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="card-soft" style={{ background: '#fffaf0' }}>
                  <div className="card-section-title" style={{ fontSize: 15 }}>
                    {copy.serviceProfileTitle}
                  </div>
                  <p className="card-section-subtitle" style={{ marginTop: 8 }}>
                    {copy.servicesEquipmentBody}
                  </p>
                </div>
              </>
            )}

            <div>
              <div className="muted" style={{ marginBottom: 6 }}>{copy.zip}</div>
              <input
                className="input"
                value={form.home_zip}
                onChange={(e) => setField('home_zip', e.target.value)}
              />
            </div>

            <div>
              <div className="muted" style={{ marginBottom: 6 }}>{copy.radius}</div>
              <input
                className="input"
                type="number"
                value={form.travel_radius_miles}
                onChange={(e) => setField('travel_radius_miles', e.target.value)}
              />
            </div>

            <div>
              <div className="muted" style={{ marginBottom: 6 }}>{copy.crewSize}</div>
              <input
                className="input"
                type="number"
                value={form.crew_size}
                onChange={(e) => setField('crew_size', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="card rounded-xl" style={{ padding: 24 }}>
          <div className="grid" style={{ gap: 14 }}>
            <div>
              <div className="muted" style={{ marginBottom: 6 }}>{copy.firstName}</div>
              <input
                className="input"
                value={form.first_name}
                onChange={(e) => setField('first_name', e.target.value)}
              />
            </div>

            <div>
              <div className="muted" style={{ marginBottom: 6 }}>{copy.lastName}</div>
              <input
                className="input"
                value={form.last_name}
                onChange={(e) => setField('last_name', e.target.value)}
              />
            </div>

            <div>
              <div className="muted" style={{ marginBottom: 6 }}>{copy.email}</div>
              <input
                className="input"
                type="email"
                value={form.email}
                onChange={(e) => setField('email', e.target.value)}
              />
            </div>

            <div>
              <div className="muted" style={{ marginBottom: 6 }}>{copy.phone}</div>
              <input
                className="input"
                value={form.phone}
                onChange={(e) => setField('phone', e.target.value)}
              />
            </div>

            <div>
              <div className="muted" style={{ marginBottom: 6 }}>{copy.city}</div>
              <input
                className="input"
                value={form.city}
                onChange={(e) => setField('city', e.target.value)}
              />
            </div>

            <div>
              <div className="muted" style={{ marginBottom: 6 }}>{copy.language}</div>
              <select
                className="input"
                value={form.preferred_language}
                onChange={(e) => {
                  const nextLang = e.target.value
                  setField('preferred_language', nextLang)
                  setLang(nextLang)
                  localStorage.setItem('surplox_lang', nextLang)
                }}
              >
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>

            <div>
              <div className="muted" style={{ marginBottom: 6 }}>{copy.availabilityStatus}</div>
              <select
                className="input"
                value={form.availability_status}
                onChange={(e) => setField('availability_status', e.target.value)}
              >
                {AVAILABILITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {labelForOption(option, form.preferred_language)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="muted" style={{ marginBottom: 6 }}>{copy.contractorVerification}</div>
              <div className="card-soft" style={{ minHeight: 'auto', padding: 14 }}>
                <span
                  className="badge"
                  style={
                    form.contractor_verified
                      ? { background: '#111111', color: '#ffffff' }
                      : { background: '#ecebe3', color: '#111111' }
                  }
                >
                  {form.contractor_verified ? copy.verifiedContractor : copy.notVerifiedContractor}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {form.category_group === 'jobsite_support' ? (
        <div className="card rounded-xl" style={{ padding: 24 }}>
          <div className="card-section-title">{copy.serviceProfileTitle}</div>
          <p className="card-section-subtitle" style={{ marginTop: 8 }}>
            {copy.jobsiteSupportIntro}
          </p>

          <div className="grid two" style={{ marginTop: 16 }}>
            <div>
              <div className="muted" style={{ marginBottom: 8 }}>{copy.serviceTags}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {serviceOptions.map((option) => {
                  const active = form.service_tags.includes(option.value)
                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={active ? 'btn primary small' : 'btn small'}
                      onClick={() => toggleMultiTag('service_tags', option.value)}
                    >
                      {labelForOption(option, form.preferred_language)}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <div className="muted" style={{ marginBottom: 8 }}>{copy.equipmentTags}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {equipmentOptions.map((option) => {
                  const active = form.equipment_tags.includes(option.value)
                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={active ? 'btn primary small' : 'btn small'}
                      onClick={() => toggleMultiTag('equipment_tags', option.value)}
                    >
                      {labelForOption(option, form.preferred_language)}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="card rounded-xl" style={{ padding: 24 }}>
        <div className="muted" style={{ marginBottom: 6 }}>{copy.bio}</div>
        <textarea
          className="input"
          value={form.bio}
          onChange={(e) => setField('bio', e.target.value)}
          placeholder={copy.bioPlaceholder}
        />
      </div>

      <div>
        <button className="btn primary" onClick={save} disabled={saving}>
          {saving ? copy.saving : copy.save}
        </button>
      </div>
    </div>
  )
}