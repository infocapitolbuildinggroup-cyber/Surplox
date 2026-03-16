import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'

const ROLE_OPTIONS = [
  { value: 'laborer', label: { en: 'Laborer', es: 'Trabajador' } },
  { value: 'subcontractor', label: { en: 'Subcontractor', es: 'Subcontratista' } },
  { value: 'contractor', label: { en: 'Contractor', es: 'Contratista' } },
  { value: 'supplier', label: { en: 'Supplier', es: 'Proveedor' } },
  { value: 'driver', label: { en: 'Driver', es: 'Conductor' } },
  { value: 'mechanic', label: { en: 'Mechanic', es: 'Mecánico' } }
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
    value: 'cargo_van_delivery',
    label: { en: 'Cargo Van / Local Delivery', es: 'Cargo Van / Entrega local' }
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


const BUSINESS_HOUR_DAYS = [
  { key: 'monday', copyKey: 'monday' },
  { key: 'tuesday', copyKey: 'tuesday' },
  { key: 'wednesday', copyKey: 'wednesday' },
  { key: 'thursday', copyKey: 'thursday' },
  { key: 'friday', copyKey: 'friday' },
  { key: 'saturday', copyKey: 'saturday' },
  { key: 'sunday', copyKey: 'sunday' }
]

const BUSINESS_HOUR_OPTIONS = [
  '12:00 AM','12:30 AM','1:00 AM','1:30 AM','2:00 AM','2:30 AM','3:00 AM','3:30 AM','4:00 AM','4:30 AM',
  '5:00 AM','5:30 AM','6:00 AM','6:30 AM','7:00 AM','7:30 AM','8:00 AM','8:30 AM','9:00 AM','9:30 AM',
  '10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','12:30 PM','1:00 PM','1:30 PM','2:00 PM','2:30 PM',
  '3:00 PM','3:30 PM','4:00 PM','4:30 PM','5:00 PM','5:30 PM','6:00 PM','6:30 PM','7:00 PM','7:30 PM',
  '8:00 PM','8:30 PM','9:00 PM','9:30 PM','10:00 PM','10:30 PM','11:00 PM','11:30 PM'
]

function defaultBusinessHours() {
  return {
    monday: { closed: false, open: '8:00 AM', close: '5:00 PM' },
    tuesday: { closed: false, open: '8:00 AM', close: '5:00 PM' },
    wednesday: { closed: false, open: '8:00 AM', close: '5:00 PM' },
    thursday: { closed: false, open: '8:00 AM', close: '5:00 PM' },
    friday: { closed: false, open: '8:00 AM', close: '5:00 PM' },
    saturday: { closed: true, open: '8:00 AM', close: '5:00 PM' },
    sunday: { closed: true, open: '8:00 AM', close: '5:00 PM' }
  }
}

function normalizeBusinessHours(value) {
  const base = defaultBusinessHours()
  if (!value || typeof value !== 'object') return base
  const next = { ...base }
  BUSINESS_HOUR_DAYS.forEach((day) => {
    const row = value?.[day.key]
    if (row && typeof row === 'object') {
      next[day.key] = {
        closed: Boolean(row.closed),
        open: BUSINESS_HOUR_OPTIONS.includes(row.open) ? row.open : base[day.key].open,
        close: BUSINESS_HOUR_OPTIONS.includes(row.close) ? row.close : base[day.key].close
      }
    }
  })
  return next
}

function parseTimeLabelToMinutes(label) {
  const match = String(label || '').match(/^(\d{1,2}):(\d{2})\s(AM|PM)$/)
  if (!match) return null
  let hour = Number(match[1])
  const minute = Number(match[2])
  const suffix = match[3]
  if (suffix === 'AM') {
    if (hour === 12) hour = 0
  } else if (hour !== 12) {
    hour += 12
  }
  return hour * 60 + minute
}

function getCurrentBusinessStatus(businessHours) {
  const normalized = normalizeBusinessHours(businessHours)
  const dayKeys = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday']
  const today = normalized[dayKeys[new Date().getDay()]]
  if (!today || today.closed) return 'closed'
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const openMinutes = parseTimeLabelToMinutes(today.open)
  const closeMinutes = parseTimeLabelToMinutes(today.close)
  if (openMinutes === null || closeMinutes === null) return 'closed'
  return currentMinutes >= openMinutes && currentMinutes < closeMinutes ? 'open' : 'closed'
}

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
    primaryRole: 'Account Type',
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
    cargoVanType: 'Cargo Van / Local Delivery',
    fleetRepairType: 'Equipment / Fleet Repair',
    selectSupportType: 'Select support type',
    supplierTradeOptional: 'Supplier accounts use business details instead of trade, crew, or worker availability fields.',
    supplierBusinessBio: 'Business Bio',
    businessName: 'Business Name',
    businessLocation: 'Business Location',
    materialsCategories: 'Materials Categories',
    customCategoryPlaceholder: 'Type a material category and press Add',
    addCategory: 'Add',
    businessHours: 'Business Hours',
    openNow: 'Open Now',
    closedNow: 'Closed Now',
    closedAllDay: 'Closed All Day',
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
    supportCrewOptional: 'Crew size is optional for supplier, driver, and mechanic profiles.'
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
    primaryRole: 'Tipo de cuenta',
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
    cargoVanType: 'Cargo Van / Entrega local',
    fleetRepairType: 'Reparación de equipo / flota',
    selectSupportType: 'Selecciona el tipo de soporte',
    supplierTradeOptional: 'Las cuentas de proveedor usan detalles comerciales en lugar de oficio, cuadrilla o disponibilidad de trabajador.',
    supplierBusinessBio: 'Biografía del negocio',
    businessName: 'Nombre comercial',
    businessLocation: 'Ubicación del negocio',
    materialsCategories: 'Categorías de materiales',
    customCategoryPlaceholder: 'Escribe una categoría de materiales y presiona Agregar',
    addCategory: 'Agregar',
    businessHours: 'Horario Comercial',
    openNow: 'Abierto Ahora',
    closedNow: 'Cerrado Ahora',
    closedAllDay: 'Cerrado Todo el Día',
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
    saturday: 'Sábado',
    sunday: 'Domingo',
    supportCrewOptional: 'El tamaño de cuadrilla es opcional para perfiles de proveedor, conductor y mecánico.'
  }
}
function formatOptionLabel(option, lang = 'en') {
  return option.label?.[lang] || option.label?.en || option.value
}

function detectSupportType(serviceTags = []) {
  const repairTags = new Set([
    'diesel_mechanic',
    'heavy_equipment_repair',
    'trailer_repair',
    'emergency_repair',
    'jobsite_service'
  ])

  if (serviceTags.some((tag) => repairTags.has(tag))) {
    return 'equipment_fleet_repair'
  }

  if (serviceTags.includes('local_runs') || serviceTags.includes('last_mile_delivery')) {
    return 'cargo_van_delivery'
  }

  return 'material_delivery'
}

function getSupportOptions(type) {
  if (type === 'equipment_fleet_repair') {
    return {
      serviceOptions: FLEET_REPAIR_SERVICE_TAGS,
      equipmentOptions: FLEET_REPAIR_EQUIPMENT_TAGS
    }
  }

  if (type === 'cargo_van_delivery') {
    return {
      serviceOptions: MATERIAL_DELIVERY_SERVICE_TAGS.filter((option) =>
        ['material_delivery', 'last_mile_delivery', 'local_runs', 'same_day_delivery'].includes(option.value)
      ),
      equipmentOptions: MATERIAL_DELIVERY_EQUIPMENT_TAGS.filter((option) =>
        ['pickup_truck', 'cargo_van'].includes(option.value)
      )
    }
  }

  return {
    serviceOptions: MATERIAL_DELIVERY_SERVICE_TAGS,
    equipmentOptions: MATERIAL_DELIVERY_EQUIPMENT_TAGS
  }
}

function getProfileCompletionPercent(profile) {
  const crewSizeOptional = ['supplier', 'driver', 'mechanic'].includes(profile.role)
  const tradeOptional = profile.role === 'supplier'

  const checks = [
    Boolean(String(profile.display_name || '').trim()),
    Boolean(String(profile.role || '').trim()),
    profile.role === 'supplier'
      ? Boolean(String(profile.business_address || '').trim())
      : Boolean(String(profile.home_zip || '').trim()),
    profile.role === 'supplier'
      ? true
      : Boolean(String(profile.first_name || '').trim()),
    profile.role === 'supplier'
      ? true
      : Boolean(String(profile.last_name || '').trim()),
    Boolean(String(profile.phone || '').trim()),
    Boolean(String(profile.city || '').trim()),
    Boolean(String(profile.bio || '').trim()),
    crewSizeOptional ? true : Boolean(Number(profile.crew_size || 0) > 1),
    profile.role === 'supplier' ? true : Boolean(String(profile.availability_status || '').trim()),
    profile.role === 'supplier'
      ? Array.isArray(profile.materials_categories) && profile.materials_categories.length > 0
      : profile.category_group === 'trade'
        ? tradeOptional || Boolean(String(profile.trade_id || '').trim())
        : Array.isArray(profile.service_tags) &&
          profile.service_tags.length > 0 &&
          Array.isArray(profile.equipment_tags) &&
          profile.equipment_tags.length > 0
  ]

  const completeCount = checks.filter(Boolean).length
  return Math.round((completeCount / checks.length) * 100)
}

function labelForOption(option, lang) {
  return option.label?.[lang] || option.label?.en || option.value
}

function getCompletionItems(profile, copy) {
  const items = []
  const crewSizeOptional = ['supplier', 'driver', 'mechanic'].includes(profile.role)
  const tradeOptional = profile.role === 'supplier'

  if (!String(profile.first_name || '').trim() || !String(profile.last_name || '').trim()) {
    items.push(copy.completionFirstLast)
  }

  if (!String(profile.phone || '').trim()) {
    items.push(copy.completionPhone)
  }

  if (!String(profile.city || '').trim()) {
    items.push(copy.completionCity)
  }

  if (!String(profile.role || '').trim()) {
    items.push(copy.completionRole)
  }

  if (!String(profile.bio || '').trim()) {
    items.push(copy.completionBio)
  }

  if (!crewSizeOptional && (!Number(profile.crew_size || 0) || Number(profile.crew_size || 0) <= 1)) {
    items.push(copy.completionCrew)
  }

  if (profile.role === 'supplier') {
    if (!String(profile.business_address || '').trim()) {
      items.push(copy.businessLocation)
    }
    if (!Array.isArray(profile.materials_categories) || profile.materials_categories.length === 0) {
      items.push(copy.materialsCategories)
    }
  } else if (profile.category_group === 'trade' && !tradeOptional && !String(profile.trade_id || '').trim()) {
    items.push(copy.tradeRequired)
  }

  return items
}

export default function MyAccount({ lang = 'en', setLang = () => {} }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [trades, setTrades] = useState([])
  const [inviteMsg, setInviteMsg] = useState('')
  const [inviteLink, setInviteLink] = useState('')
  const [copyStatus, setCopyStatus] = useState('')
  const [completionItems, setCompletionItems] = useState([])
  const [customMaterialCategory, setCustomMaterialCategory] = useState('')

  const [form, setForm] = useState({
    display_name: '',
    role: 'laborer',
    trade_id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    city: '',
    home_zip: '',
    travel_radius_miles: 50,
    crew_size: 1,
    preferred_language: lang || 'en',
    bio: '',
    category_group: 'trade',
    jobsite_support_type: 'material_delivery',
    service_tags: [],
    equipment_tags: [],
    availability_status: 'available_now',
    contractor_verified: false,
    business_name: '',
    business_address: '',
    business_zip: '',
    materials_categories: [],
    storefront: false,
    vehicle_type: '',
    trailer_type: '',
    trailer_length: '',
    payload_capacity: '',
    delivery_radius: '',
    business_hours: defaultBusinessHours()
  })

  const copy = COPY[form.preferred_language] || COPY.en

  const profileStrength = useMemo(() => getProfileCompletionPercent(form), [form])

  const supportOptions = useMemo(
    () => getSupportOptions(form.jobsite_support_type),
    [form.jobsite_support_type]
  )

  const serviceOptions = supportOptions.serviceOptions
  const equipmentOptions = supportOptions.equipmentOptions

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function toggleMultiTag(key, value) {
    setForm((prev) => {
      const current = Array.isArray(prev[key]) ? prev[key] : []
      const exists = current.includes(value)
      return {
        ...prev,
        [key]: exists ? current.filter((item) => item !== value) : [...current, value]
      }
    })
  }

  function toggleMaterialsCategory(value) {
    setForm((prev) => {
      const current = Array.isArray(prev.materials_categories) ? prev.materials_categories : []
      const exists = current.includes(value)
      return {
        ...prev,
        materials_categories: exists ? current.filter((item) => item !== value) : [...current, value]
      }
    })
  }

  function addCustomMaterialsCategory() {
    const value = String(customMaterialCategory || '').trim()
    if (!value) return
    setForm((prev) => {
      const current = Array.isArray(prev.materials_categories) ? prev.materials_categories : []
      if (current.includes(value)) return prev
      return { ...prev, materials_categories: [...current, value] }
    })
    setCustomMaterialCategory('')
  }

  function prettyMaterialLabel(value) {
    const map = {
      equipment_rental: 'Equipment Rental',
      safety_equipment: 'Safety Equipment',
      lumber: 'Lumber',
      concrete: 'Concrete',
      steel: 'Steel',
      electrical: 'Electrical',
      plumbing: 'Plumbing',
      drywall: 'Drywall',
      fasteners: 'Fasteners',
      tools: 'Tools'
    }
    return map[value] || value
  }

  function updateBusinessHours(dayKey, updates) {
    setForm((prev) => ({
      ...prev,
      business_hours: {
        ...normalizeBusinessHours(prev.business_hours),
        [dayKey]: {
          ...normalizeBusinessHours(prev.business_hours)[dayKey],
          ...updates
        }
      }
    }))
  }

  function buildInviteLink(userId) {
    if (!userId) return ''
    return `${window.location.origin}/auth?ref=${userId}`
  }

  async function loadData() {
    setLoading(true)
    setMsg('')
    setInviteMsg('')

    const { data: sessionData } = await supabase.auth.getSession()
    const user = sessionData.session?.user

    if (!user) {
      setMsg(copy.signedInRequired)
      setLoading(false)
      return
    }

    const [{ data: tradesData, error: tradesError }, { data: profileData, error: profileError }, { data: privateData, error: privateError }] =
      await Promise.all([
        supabase.from('trades').select('id,name').order('name'),
        supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('contact_private').select('*').eq('user_id', user.id).maybeSingle()
      ])

    if (tradesError) console.error(tradesError)
    if (profileError) console.error(profileError)
    if (privateError) console.error(privateError)

    setTrades(tradesData || [])

    const nextLang =
      profileData?.preferred_language || lang || localStorage.getItem('surplox_lang') || 'en'

    const supportType =
      profileData?.category_group === 'jobsite_support'
        ? detectSupportType(profileData?.service_tags || [])
        : 'material_delivery'
        const mergedForm = {
          display_name: profileData?.display_name || '',
          role: profileData?.role || 'laborer',
          trade_id: profileData?.trade_id ? String(profileData.trade_id) : '',
          first_name: profileData?.first_name || '',
          last_name: profileData?.last_name || '',
          email: privateData?.email || user.email || '',
          phone: privateData?.phone || '',
          city: privateData?.city || '',
          home_zip: profileData?.home_zip ? String(profileData.home_zip) : '',
          travel_radius_miles: profileData?.travel_radius_miles || 50,
          crew_size: profileData?.crew_size || 1,
          preferred_language: nextLang,
          bio: profileData?.bio || '',
          category_group: profileData?.category_group || 'trade',
          jobsite_support_type: supportType,
          service_tags: Array.isArray(profileData?.service_tags) ? profileData.service_tags : [],
          equipment_tags: Array.isArray(profileData?.equipment_tags) ? profileData.equipment_tags : [],
          availability_status: profileData?.availability_status || 'available_now',
          contractor_verified: Boolean(profileData?.contractor_verified),
          business_name: profileData?.business_name || '',
          business_address: profileData?.business_address || '',
          business_zip: profileData?.business_zip || '',
          materials_categories: Array.isArray(profileData?.materials_categories) ? profileData.materials_categories : [],
          storefront: Boolean(profileData?.storefront),
          vehicle_type: profileData?.vehicle_type || '',
          trailer_type: profileData?.trailer_type || '',
          trailer_length: profileData?.trailer_length ?? '',
          payload_capacity: profileData?.payload_capacity ?? '',
          delivery_radius: profileData?.delivery_radius ?? '',
          business_hours: normalizeBusinessHours(profileData?.business_hours)
        }
    
        setForm(mergedForm)
        setInviteLink(buildInviteLink(user.id))
        setLang(nextLang)
        localStorage.setItem('surplox_lang', nextLang)
    
        setCompletionItems(getCompletionItems(mergedForm, COPY[nextLang] || COPY.en))
        setLoading(false)
      }
    
      useEffect(() => {
        loadData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])
    
      useEffect(() => {
        setCompletionItems(getCompletionItems(form, copy))
      }, [form, copy])
    
      async function copyInviteLink() {
        try {
          if (!inviteLink) throw new Error('Missing invite link')
          await navigator.clipboard.writeText(inviteLink)
          setCopyStatus(copy.inviteCopied)
          setTimeout(() => setCopyStatus(''), 2000)
        } catch (error) {
          console.error(error)
          setCopyStatus(copy.inviteCopyError)
          setTimeout(() => setCopyStatus(''), 2500)
        }
      }
    
      async function shareInvite() {
        try {
          if (!inviteLink) throw new Error('Missing invite link')
          if (navigator.share) {
            await navigator.share({
              title: 'Surplox Invite',
              text: inviteLink,
              url: inviteLink
            })
          } else {
            await copyInviteLink()
          }
        } catch (error) {
          console.error(error)
          setCopyStatus(copy.inviteShareError)
          setTimeout(() => setCopyStatus(''), 2500)
        }
      }
    
      function textInvite() {
        try {
          if (!inviteLink) throw new Error('Missing invite link')
          window.location.href = `sms:?&body=${encodeURIComponent(inviteLink)}`
        } catch (error) {
          console.error(error)
          setCopyStatus(copy.inviteTextError)
          setTimeout(() => setCopyStatus(''), 2500)
        }
      }
    
      function emailInvite() {
        try {
          if (!inviteLink) throw new Error('Missing invite link')
          window.location.href = `mailto:?subject=${encodeURIComponent('Join me on Surplox')}&body=${encodeURIComponent(inviteLink)}`
        } catch (error) {
          console.error(error)
          setCopyStatus(copy.inviteEmailError)
          setTimeout(() => setCopyStatus(''), 2500)
        }
      }
    
      function validateForm() {
        if (!String(form.display_name || '').trim()) {
          setMsg(copy.displayNameRequired)
          return false
        }
    
        if (!/^\d{5}$/.test(String(form.home_zip || '').trim())) {
          setMsg(copy.zipInvalid)
          return false
        }
    
        if (form.category_group === 'trade' && form.role !== 'supplier' && !String(form.trade_id || '').trim()) {
          setMsg(copy.tradeRequired)
          return false
        }
    
        if (String(form.email || '').trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(form.email).trim())) {
          setMsg(copy.emailInvalid)
          return false
        }
    
        if (String(form.phone || '').trim()) {
          const digits = String(form.phone || '').replace(/\D/g, '')
          if (digits.length < 10) {
            setMsg(copy.phoneInvalid)
            return false
          }
        }
    
        if (!['en', 'es'].includes(form.preferred_language)) {
          setMsg(copy.languageInvalid)
          return false
        }
    
        if (!AVAILABILITY_OPTIONS.some((option) => option.value === form.availability_status)) {
          setMsg(copy.availabilityInvalid)
          return false
        }
    
        if (!CATEGORY_GROUP_OPTIONS.some((option) => option.value === form.category_group)) {
          setMsg(copy.categoryInvalid)
          return false
        }
    
        return true
      }
    
      async function save() {
        setMsg('')
        if (!validateForm()) return
    
        setSaving(true)
    
        const { data: sessionData } = await supabase.auth.getSession()
        const user = sessionData.session?.user
    
        if (!user) {
          setMsg(copy.signedInRequired)
          setSaving(false)
          return
        }
    
        const isSupplier = form.role === 'supplier'

        const profilePayload = {
          user_id: user.id,
          display_name: form.display_name.trim(),
          role: form.role,
          trade_id: isSupplier ? null : (form.category_group === 'trade' ? Number(form.trade_id) || null : null),
          first_name: isSupplier ? '' : form.first_name.trim(),
          last_name: isSupplier ? '' : form.last_name.trim(),
          home_zip: isSupplier ? null : form.home_zip.trim(),
          travel_radius_miles: isSupplier ? null : Number(form.travel_radius_miles) || 50,
          crew_size: isSupplier ? null : Number(form.crew_size) || 1,
          preferred_language: form.preferred_language,
          bio: form.bio.trim(),
          category_group: isSupplier ? 'trade' : form.category_group,
          availability_status: isSupplier ? null : form.availability_status,
          contractor_verified: Boolean(form.contractor_verified),
          service_tags: isSupplier ? [] : (form.category_group === 'jobsite_support' ? form.service_tags : []),
          equipment_tags: isSupplier ? [] : (form.category_group === 'jobsite_support' ? form.equipment_tags : []),
          business_name: isSupplier ? form.business_name.trim() : null,
          business_address: isSupplier ? form.business_address.trim() : null,
          business_zip: isSupplier ? form.business_zip.trim() : null,
          materials_categories: isSupplier ? form.materials_categories : [],
          storefront: isSupplier ? Boolean(form.storefront) : false,
          business_hours: isSupplier ? normalizeBusinessHours(form.business_hours) : null,
          vehicle_type: form.role === 'driver' ? form.vehicle_type || null : null,
          trailer_type: form.role === 'driver' ? form.trailer_type || null : null,
          trailer_length: form.role === 'driver' && String(form.trailer_length || '').trim() ? Number(form.trailer_length) : null,
          payload_capacity: form.role === 'driver' && String(form.payload_capacity || '').trim() ? Number(form.payload_capacity) : null,
          delivery_radius: form.role === 'driver' && String(form.delivery_radius || '').trim() ? Number(form.delivery_radius) : null
        }
    
        const privatePayload = {
          user_id: user.id,
          email: form.email.trim(),
          phone: form.phone.trim(),
          city: form.city.trim()
        }
    
        const [{ error: profileError }, { error: privateError }] = await Promise.all([
          supabase.from('profiles').upsert(profilePayload),
          supabase.from('contact_private').upsert(privatePayload)
        ])
    
        if (profileError || privateError) {
          console.error(profileError || privateError)
          setMsg(copy.saveError)
          setSaving(false)
          return
        }
    
        setMsg(copy.success)
        setSaving(false)
      }
    
      if (loading) {
        return (
          <div className="card rounded-xl">
            <div className="muted">{copy.loading}</div>
          </div>
        )
      }
    
      return (
        <div className="grid" style={{ gap: 18 }}>
          <div
            className="card rounded-xl"
            style={{
              padding: 24,
              background: 'linear-gradient(180deg, #fff7cf 0%, #ffffff 100%)'
            }}
          >
            <div className="badge good">{copy.title}</div>
            <div className="h1" style={{ marginTop: 14 }}>{copy.title}</div>
            <p className="muted" style={{ marginTop: 8 }}>{copy.intro}</p>
    
            <div className="grid three" style={{ marginTop: 18 }}>
            <div className="card-soft" style={{ minHeight: 92 }}>
            <div className="muted" style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>
              {copy.profileStrength}
            </div>
            <div style={{ marginTop: 8, fontSize: 32, fontWeight: 900 }}>{profileStrength}%</div>
          </div>
          <div className="card-soft" style={{ minHeight: 92 }}>
            <div className="muted" style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>
              {copy.complete}
            </div>
            <div style={{ marginTop: 8, fontSize: 32, fontWeight: 900 }}>
              {Math.max(0, 100 - (completionItems.length * 10))}
            </div>
          </div>
          <div className="card-soft" style={{ minHeight: 92 }}>
            <div className="muted" style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>
              {copy.incomplete}
            </div>
            <div style={{ marginTop: 8, fontSize: 32, fontWeight: 900 }}>{completionItems.length}</div>
          </div>
        </div>
      </div>

      {completionItems.length > 0 ? (
        <div className="card rounded-xl" style={{ padding: 24 }}>
          <div className="card-section-title">{copy.completionTitle}</div>
          <p className="card-section-subtitle" style={{ marginTop: 8 }}>{copy.completionBody}</p>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
            {completionItems.map((item) => (
              <span key={item} className="badge">{item}</span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="card rounded-xl" style={{ padding: 24 }}>
        <div className="card-section-title">{copy.inviteTitle}</div>
        <p className="card-section-subtitle" style={{ marginTop: 8 }}>{copy.inviteBody}</p>

        <div className="grid" style={{ marginTop: 14, gap: 12 }}>
          <div>
            <div className="muted" style={{ marginBottom: 6 }}>{copy.invitePreviewLabel}</div>
            <div className="card-soft" style={{ minHeight: 'auto', padding: 14, wordBreak: 'break-all' }}>
              {inviteLink || '—'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="button" className="btn primary" onClick={copyInviteLink}>
              {copy.copyInvite}
            </button>
            <button type="button" className="btn" onClick={shareInvite}>
              {copy.shareInvite}
            </button>
            <button type="button" className="btn" onClick={textInvite}>
              {copy.textInvite}
            </button>
            <button type="button" className="btn" onClick={emailInvite}>
              {copy.emailInvite}
            </button>
          </div>

          {copyStatus ? (
            <div className="card-soft" style={{ minHeight: 'auto', padding: 14 }}>
              {copyStatus}
            </div>
          ) : null}
        </div>
      </div>

      {msg ? (
        <div className="card rounded-xl" style={{ padding: 18 }}>
          <div>{msg}</div>
        </div>
      ) : null}

      <div className="grid two">
        <div className="card rounded-xl" style={{ padding: 24 }}>
          <div className="card-section-title">{copy.accountOverview}</div>
          <p className="card-section-subtitle" style={{ marginTop: 8 }}>{copy.accountOverviewBody}</p>

          <div className="grid" style={{ marginTop: 18, gap: 14 }}>
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
                    {formatOptionLabel(option, form.preferred_language)}
                  </option>
                ))}
              </select>
            </div>

            {form.role !== 'supplier' ? (
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
            ) : null}

            {form.category_group === 'trade' && form.role !== 'supplier' ? (
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

            {form.role !== 'supplier' ? (
            <div>
              <div className="muted" style={{ marginBottom: 6 }}>{copy.zip}</div>
              <input
                className="input"
                value={form.home_zip}
                onChange={(e) => setField('home_zip', e.target.value)}
              />
            </div>
            ) : null}

            {form.role !== 'supplier' ? (
            <div>
              <div className="muted" style={{ marginBottom: 6 }}>{copy.radius}</div>
              <input
                className="input"
                type="number"
                value={form.travel_radius_miles}
                onChange={(e) => setField('travel_radius_miles', e.target.value)}
              />
            </div>
            ) : null}

            {form.role !== 'supplier' ? (
            <div>
              <div className="muted" style={{ marginBottom: 6 }}>{copy.crewSize}</div>
              <input
                className="input"
                type="number"
                value={form.crew_size}
                onChange={(e) => setField('crew_size', e.target.value)}
              />
              {['driver', 'mechanic'].includes(form.role) ? (
                <div className="muted" style={{ marginTop: 8, fontSize: 13 }}>
                  {copy.supportCrewOptional}
                </div>
              ) : null}
            </div>
            ) : null}
          </div>
        </div>
        <div className="card rounded-xl" style={{ padding: 24 }}>
          <div className="grid" style={{ gap: 14 }}>
            {form.role !== 'supplier' ? (
            <>
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
            </>
            ) : null}

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

            {form.role !== 'supplier' ? (
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
            ) : null}

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


      {form.role === 'supplier' ? (
        <div className="card rounded-xl" style={{ padding: 24 }}>
          <div className="card-section-title">{copy.businessName}</div>
          <p className="card-section-subtitle" style={{ marginTop: 8 }}>
            {copy.supplierTradeOptional}
          </p>

          <div className="grid two" style={{ marginTop: 16 }}>
            <div>
              <div className="muted" style={{ marginBottom: 6 }}>{copy.businessName}</div>
              <input
                className="input"
                value={form.business_name}
                onChange={(e) => setField('business_name', e.target.value)}
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

            <div style={{ gridColumn: '1 / -1' }}>
              <div className="muted" style={{ marginBottom: 6 }}>{copy.businessLocation}</div>
              <input
                className="input"
                value={form.business_address}
                onChange={(e) => setField('business_address', e.target.value)}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <div className="muted" style={{ marginBottom: 8 }}>{copy.materialsCategories}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['lumber','concrete','steel','electrical','plumbing','drywall','fasteners','equipment_rental','tools','safety_equipment'].map((option) => {
                  const active = form.materials_categories.includes(option)
                  return (
                    <button
                      key={option}
                      type="button"
                      className={active ? 'btn primary small' : 'btn small'}
                      onClick={() => toggleMaterialsCategory(option)}
                    >
                      {prettyMaterialLabel(option)}
                    </button>
                  )
                })}
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 12, alignItems: 'center' }}>
                <input
                  className="input"
                  style={{ flex: 1 }}
                  value={customMaterialCategory}
                  onChange={(e) => setCustomMaterialCategory(e.target.value)}
                  placeholder={copy.customCategoryPlaceholder}
                />
                <button type="button" className="btn" onClick={addCustomMaterialsCategory}>
                  {copy.addCategory}
                </button>
              </div>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <div className="muted" style={{ marginBottom: 8 }}>{copy.businessHours}</div>

              <div
                className="card-soft"
                style={{
                  minHeight: 'auto',
                  padding: 14,
                  marginBottom: 12,
                  background: getCurrentBusinessStatus(form.business_hours) === 'open' ? '#dcf4e5' : '#f8f7ef'
                }}
              >
                <strong>
                  {getCurrentBusinessStatus(form.business_hours) === 'open' ? copy.openNow : copy.closedNow}
                </strong>
              </div>

              <div style={{ display: 'grid', gap: 10 }}>
                {BUSINESS_HOUR_DAYS.map((day) => {
                  const row = normalizeBusinessHours(form.business_hours)[day.key]
                  return (
                    <div
                      key={day.key}
                      className="card-soft"
                      style={{ minHeight: 'auto', padding: 14, background: '#ffffff' }}
                    >
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1.2fr 1fr 1fr auto',
                          gap: 10,
                          alignItems: 'center'
                        }}
                      >
                        <div style={{ fontWeight: 700 }}>{copy[day.copyKey]}</div>

                        <select
                          className="input"
                          value={row.open}
                          disabled={row.closed}
                          onChange={(e) => updateBusinessHours(day.key, { open: e.target.value })}
                        >
                          {BUSINESS_HOUR_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>

                        <select
                          className="input"
                          value={row.close}
                          disabled={row.closed}
                          onChange={(e) => updateBusinessHours(day.key, { close: e.target.value })}
                        >
                          {BUSINESS_HOUR_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>

                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
                          <input
                            type="checkbox"
                            checked={Boolean(row.closed)}
                            onChange={(e) => updateBusinessHours(day.key, { closed: e.target.checked })}
                          />
                          <span>{copy.closedAllDay}</span>
                        </label>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      ) : null}

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
        <div className="muted" style={{ marginBottom: 6 }}>
          {form.role === 'supplier' ? copy.supplierBusinessBio : copy.bio}
        </div>
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