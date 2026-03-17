import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

const ROLE_OPTIONS = [
  { value: 'laborer', label: { en: 'Laborer', es: 'Trabajador' } },
  { value: 'subcontractor', label: { en: 'Subcontractor', es: 'Subcontratista' } },
  { value: 'contractor', label: { en: 'Contractor', es: 'Contratista' } },
  { value: 'supplier', label: { en: 'Supplier', es: 'Proveedor' } },
  { value: 'driver', label: { en: 'Driver', es: 'Conductor' } },
  { value: 'mechanic', label: { en: 'Mechanic', es: 'Mecánico' } }
]

const JOBSITE_SUPPORT_OPTIONS = [
  {
    value: 'material_delivery',
    label: { en: 'Material Delivery / Hot Shot', es: 'Entrega de materiales / Hot Shot' },
    role: 'driver',
    service_tags: ['material_delivery', 'hot_shot'],
    equipment_tags: ['pickup_truck'],
    default_vehicle_type: 'pickup_truck'
  },
  {
    value: 'cargo_van_delivery',
    label: { en: 'Cargo Van / Local Delivery', es: 'Cargo Van / Entrega local' },
    role: 'driver',
    service_tags: ['material_delivery', 'last_mile_delivery', 'local_runs'],
    equipment_tags: ['cargo_van'],
    default_vehicle_type: 'cargo_van'
  },
  {
    value: 'equipment_fleet_repair',
    label: { en: 'Equipment / Fleet Repair', es: 'Reparación de equipo / flota' },
    role: 'mechanic',
    service_tags: ['diesel_mechanic', 'jobsite_service'],
    equipment_tags: ['mobile_repair_truck'],
    default_vehicle_type: 'mobile_repair_truck'
  }
]

const SUPPLIER_MATERIAL_OPTIONS = [
  { value: 'concrete', label: { en: 'Concrete', es: 'Concreto' } },
  { value: 'lumber', label: { en: 'Lumber', es: 'Madera' } },
  { value: 'steel', label: { en: 'Steel', es: 'Acero' } },
  { value: 'electrical', label: { en: 'Electrical', es: 'Eléctrico' } },
  { value: 'plumbing', label: { en: 'Plumbing', es: 'Plomería' } },
  { value: 'drywall', label: { en: 'Drywall', es: 'Tablaroca' } },
  { value: 'fasteners', label: { en: 'Fasteners', es: 'Sujetadores' } },
  { value: 'tools', label: { en: 'Tools', es: 'Herramientas' } },
  { value: 'equipment_rental', label: { en: 'Equipment Rental', es: 'Renta de equipo' } },
  { value: 'safety_equipment', label: { en: 'Safety Equipment', es: 'Equipo de seguridad' } }
]

const DRIVER_VEHICLE_OPTIONS = [
  { value: 'pickup_truck', label: { en: 'Pickup Truck', es: 'Pickup' } },
  { value: 'cargo_van', label: { en: 'Cargo Van', es: 'Cargo van' } },
  { value: 'box_truck', label: { en: 'Box Truck', es: 'Camión caja' } },
  { value: 'flatbed_truck', label: { en: 'Flatbed Truck', es: 'Camión plataforma' } }
]

const DRIVER_TRAILER_OPTIONS = [
  { value: 'none', label: { en: 'No Trailer', es: 'Sin remolque' } },
  { value: 'utility_trailer', label: { en: 'Utility Trailer', es: 'Remolque utilitario' } },
  { value: 'flatbed_trailer', label: { en: 'Flatbed Trailer', es: 'Remolque plataforma' } },
  { value: 'gooseneck_trailer', label: { en: 'Gooseneck Trailer', es: 'Remolque gooseneck' } },
  { value: 'equipment_trailer', label: { en: 'Equipment Trailer', es: 'Remolque para equipo' } },
  { value: 'enclosed_trailer', label: { en: 'Enclosed Trailer', es: 'Remolque cerrado' } }
]

const COPY = {
  en: {
    loading: 'Loading account setup…',
    title: 'Complete Your Surplox Account',
    intro:
      'You are already inside Surplox. Add the rest of your profile details when you are ready so your account carries more weight.',
    noticeTitle: 'Progressive Completion',
    noticeBody:
      'Only your display name, trade, and ZIP are required to get inside the app. Everything else can be completed later.',
    displayName: 'Display Name',
    primaryRole: 'Account Type',
    trade: 'Trade',
    selectTrade: 'Select your trade',
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email Address',
    phone: 'Phone Number',
    city: 'City',
    homeZip: 'Home ZIP Code',
    travelRadius: 'Travel Radius (Miles)',
    crewSize: 'Crew Size',
    preferredLanguage: 'Preferred Language',
    bio: 'Bio / Experience',
    bioPlaceholder: 'Tell nearby crews and contractors what kind of work you do.',
    save: 'Save Details',
    saving: 'Saving…',
    success: 'Your account details have been updated.',
    errSignedIn: 'You must be signed in to continue.',
    errDisplayName: 'Display name is required.',
    errTrade: 'Select your trade.',
    errZip: 'Enter a valid 5-digit ZIP code.',
    errPhone: 'Enter a valid phone number.',
    errEmailValid: 'Enter a valid email address.',
    errLanguage: 'Select a valid language.',
    errCity: 'Add your city.',
    errVehicleType: 'Select a vehicle type for your driver profile.',
    errTrailerType: 'Select a trailer type for your driver profile.',
    errTrailerLength: 'Enter a valid trailer length.',
    errPayloadCapacity: 'Enter a valid payload capacity.',
    errDeliveryRadius: 'Enter a valid delivery radius.',
    errBusinessName: 'Business name is required for supplier accounts.',
    errBusinessZip: 'Enter a valid business ZIP code.',
    errGeneric: 'Unable to save account setup.',
    heroBadge: 'Finish setup',
    heroTitle: 'Get your profile into stronger shape.',
    heroBody:
      'You are already in Surplox. Finish the rest of your profile to carry more weight with nearby workers, crews, contractors, suppliers, and drivers.',
    stat1: 'Display name + trade + ZIP',
    stat2: 'Everything else can be completed now',
    stat3: 'Stronger profile = more trust',
    supportType: 'Driver / Support Type',
    selectSupportType: 'Select a support type',
    supportIntro:
      'Use this setup for material delivery, cargo van delivery, hot shot, fleet repair, and equipment repair profiles.',
    supplierTradeOptional:
      'Supplier accounts can leave trade blank and use business fields, material categories, city, and contact details to explain what they supply.',
    supportTradeOptional:
      'Driver and repair accounts do not need a trade selected here.',
    supportCrewOptional:
      'Crew size is optional for supplier, driver, and mechanic accounts.',
    supplierSectionTitle: 'Supplier Storefront Profile',
    supplierSectionBody:
      'Suppliers are storefront locations, not individual worker profiles. Add store details and materials so nearby contractors know what this location offers.',
    businessName: 'Business Name',
    businessAddress: 'Business Address',
    businessZip: 'Business ZIP',
    materialsCategories: 'Material Categories',
    storefrontLocation: 'This is a storefront / yard location',
    addMaterialCategory: 'Add custom material category',
    add: 'Add',
    driverSectionTitle: 'Driver Vehicle Capabilities',
    driverSectionBody:
      'Driver accounts should show hauling capability right away so suppliers and jobsites know what this driver can move.',
    vehicleType: 'Vehicle Type',
    trailerType: 'Trailer Type',
    trailerLength: 'Trailer Length (ft)',
    payloadCapacity: 'Payload Capacity (lbs)',
    deliveryRadius: 'Delivery Radius (miles)',
    driverLaneTitle: 'Driver account path',
    driverLaneBody:
      'Driver accounts stay separate from worker, subcontractor, and contractor accounts. Finish your hauling setup here so supplier → driver → jobsite discovery works correctly.',
    lockedBySignup: 'This was selected during signup and is being kept locked here.',
    noTrailerHint: 'No trailer selected. Trailer length is optional when there is no trailer.',
    driverFieldsHint:
      'These fields power the Delivery search so suppliers and jobsites can filter you by vehicle, trailer, payload, and radius.',
    goFeed: 'Go to Feed'
  },
  es: {
    loading: 'Cargando configuración de cuenta…',
    title: 'Completa tu cuenta de Surplox',
    intro:
      'Ya estás dentro de Surplox. Agrega el resto de tu perfil cuando quieras para que tu cuenta tenga más peso.',
    noticeTitle: 'Completar progresivamente',
    noticeBody:
      'Solo tu nombre visible, oficio y ZIP son requeridos para entrar a la app. Todo lo demás se puede completar después.',
    displayName: 'Nombre visible',
    primaryRole: 'Tipo de cuenta',
    trade: 'Oficio',
    selectTrade: 'Selecciona tu oficio',
    firstName: 'Nombre',
    lastName: 'Apellido',
    email: 'Correo electrónico',
    phone: 'Número de teléfono',
    city: 'Ciudad',
    homeZip: 'Código postal',
    travelRadius: 'Radio de viaje (millas)',
    crewSize: 'Tamaño de cuadrilla',
    preferredLanguage: 'Idioma preferido',
    bio: 'Biografía / Experiencia',
    bioPlaceholder: 'Cuéntales a cuadrillas y contratistas cercanos qué tipo de trabajo haces.',
    save: 'Guardar detalles',
    saving: 'Guardando…',
    success: 'Los detalles de tu cuenta han sido actualizados.',
    errSignedIn: 'Debes iniciar sesión para continuar.',
    errDisplayName: 'El nombre visible es obligatorio.',
    errTrade: 'Selecciona tu oficio.',
    errZip: 'Ingresa un código postal válido de 5 dígitos.',
    errPhone: 'Ingresa un número de teléfono válido.',
    errEmailValid: 'Ingresa un correo electrónico válido.',
    errLanguage: 'Selecciona un idioma válido.',
    errCity: 'Agrega tu ciudad.',
    errVehicleType: 'Selecciona un tipo de vehículo para tu perfil de conductor.',
    errTrailerType: 'Selecciona un tipo de remolque para tu perfil de conductor.',
    errTrailerLength: 'Ingresa un largo de remolque válido.',
    errPayloadCapacity: 'Ingresa una capacidad de carga válida.',
    errDeliveryRadius: 'Ingresa un radio de entrega válido.',
    errBusinessName: 'El nombre del negocio es obligatorio para cuentas de proveedor.',
    errBusinessZip: 'Ingresa un ZIP comercial válido.',
    errGeneric: 'No se pudieron guardar los detalles de la cuenta.',
    heroBadge: 'Terminar configuración',
    heroTitle: 'Haz que tu perfil se vea más fuerte.',
    heroBody:
      'Ya estás dentro de Surplox. Termina el resto de tu perfil para tener más peso con trabajadores, cuadrillas, contratistas, proveedores y conductores cercanos.',
    stat1: 'Nombre visible + oficio + ZIP',
    stat2: 'Todo lo demás se puede completar ahora',
    stat3: 'Perfil más fuerte = más confianza',
    supportType: 'Tipo de conductor / soporte',
    selectSupportType: 'Selecciona un tipo de soporte',
    supportIntro:
      'Usa esta configuración para entrega de materiales, cargo van, hot shot, reparación de flota y reparación de equipo.',
    supplierTradeOptional:
      'Las cuentas de proveedor pueden dejar el oficio en blanco y usar campos del negocio, categorías de materiales, ciudad y contacto para explicar lo que suministran.',
    supportTradeOptional:
      'Las cuentas de conductor y reparación no necesitan seleccionar un oficio aquí.',
    supportCrewOptional:
      'El tamaño de cuadrilla es opcional para cuentas de proveedor, conductor y mecánico.',
    supplierSectionTitle: 'Perfil de tienda proveedora',
    supplierSectionBody:
      'Los proveedores son ubicaciones de tienda o patio, no perfiles individuales de trabajador. Agrega detalles del negocio y materiales para que contratistas cercanos sepan qué ofrece esta ubicación.',
    businessName: 'Nombre del negocio',
    businessAddress: 'Dirección del negocio',
    businessZip: 'ZIP del negocio',
    materialsCategories: 'Categorías de materiales',
    storefrontLocation: 'Esta cuenta representa una tienda / patio físico',
    addMaterialCategory: 'Agregar categoría personalizada',
    add: 'Agregar',
    driverSectionTitle: 'Capacidades del vehículo del conductor',
    driverSectionBody:
      'Las cuentas de conductor deben mostrar su capacidad de carga desde el principio para que proveedores y obras sepan qué puede mover este conductor.',
    vehicleType: 'Tipo de vehículo',
    trailerType: 'Tipo de remolque',
    trailerLength: 'Largo del remolque (ft)',
    payloadCapacity: 'Capacidad de carga (lbs)',
    deliveryRadius: 'Radio de entrega (millas)',
    driverLaneTitle: 'Ruta de cuenta para conductores',
    driverLaneBody:
      'Las cuentas de conductor se mantienen separadas de las cuentas de trabajador, subcontratista y contratista. Termina aquí tu configuración de carga para que funcione bien el descubrimiento proveedor → conductor → obra.',
    lockedBySignup: 'Esto se seleccionó en el registro y aquí se mantiene bloqueado.',
    noTrailerHint: 'No se seleccionó remolque. El largo del remolque es opcional cuando no hay remolque.',
    driverFieldsHint:
      'Estos campos alimentan la búsqueda de Delivery para que proveedores y obras puedan filtrarte por vehículo, remolque, carga y radio.',
    goFeed: 'Ir al feed'
  }
}

function MiniTile({ value }) {
  return (
    <div className="card-soft" style={{ minHeight: 90 }}>
      <div style={{ fontWeight: 800, fontSize: 16, lineHeight: 1.35 }}>{value}</div>
    </div>
  )
}

function labelForOption(option, lang = 'en') {
  return option.label?.[lang] || option.label?.en || option.value
}

function detectSupportType(serviceTags = [], role = '', vehicleType = '') {
  const repairTags = new Set([
    'diesel_mechanic',
    'heavy_equipment_repair',
    'trailer_repair',
    'emergency_repair',
    'jobsite_service'
  ])

  if (serviceTags.some((tag) => repairTags.has(tag)) || role === 'mechanic') {
    return 'equipment_fleet_repair'
  }

  if (
    serviceTags.includes('local_runs') ||
    serviceTags.includes('last_mile_delivery') ||
    vehicleType === 'cargo_van'
  ) {
    return 'cargo_van_delivery'
  }

  return 'material_delivery'
}

function normalizePhone(raw) {
  return String(raw || '').replace(/\D/g, '')
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim())
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

function numericOrNull(value) {
  if (value === '' || value === null || typeof value === 'undefined') return null
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

export default function Onboarding({ lang = 'en', setLang }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [trades, setTrades] = useState([])
  const [customMaterialCategory, setCustomMaterialCategory] = useState('')
  const navigate = useNavigate()

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
    preferred_language: lang || 'en',
    category_group: 'trade',
    jobsite_support_type: 'material_delivery',
    business_name: '',
    business_address: '',
    business_zip: '',
    materials_categories: [],
    storefront: false,
    vehicle_type: '',
    trailer_type: 'none',
    trailer_length: '',
    payload_capacity: '',
    delivery_radius: 50
  })

  const copy = COPY[form.preferred_language] || COPY.en

  const languageOptions = useMemo(
    () => [
      { value: 'en', label: 'English' },
      { value: 'es', label: 'Español' }
    ],
    []
  )

  const selectedSupportConfig = useMemo(() => {
    return (
      JOBSITE_SUPPORT_OPTIONS.find((option) => option.value === form.jobsite_support_type) ||
      JOBSITE_SUPPORT_OPTIONS[0]
    )
  }, [form.jobsite_support_type])

  const isSupplierProfile = form.role === 'supplier' && form.category_group === 'trade'
  const isDriverProfile =
    form.role === 'driver' ||
    (form.category_group === 'jobsite_support' && selectedSupportConfig.role === 'driver')
  const isMechanicProfile =
    form.role === 'mechanic' ||
    (form.category_group === 'jobsite_support' && selectedSupportConfig.role === 'mechanic')

  const roleLockedBySignup =
    isSupplierProfile || isDriverProfile || isMechanicProfile || form.category_group === 'jobsite_support'

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function toggleMultiValue(field, value) {
    setForm((prev) => {
      const current = Array.isArray(prev[field]) ? prev[field] : []
      const exists = current.includes(value)
      return {
        ...prev,
        [field]: exists ? current.filter((item) => item !== value) : [...current, value]
      }
    })
  }

  function addCustomMaterialsCategory() {
    const value = String(customMaterialCategory || '').trim()
    if (!value) return

    setForm((prev) => {
      const current = Array.isArray(prev.materials_categories) ? prev.materials_categories : []
      if (current.includes(value)) return prev
      return {
        ...prev,
        materials_categories: [...current, value]
      }
    })

    setCustomMaterialCategory('')
  }

  function roleLabel(option) {
    return option.label[form.preferred_language] || option.label.en
  }

  useEffect(() => {
    async function load() {
      setLoading(true)
      setMsg('')

      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user

      if (!user) {
        navigate('/auth', { replace: true })
        return
      }

      const { data: tradesData, error: tradesErr } = await supabase
        .from('trades')
        .select('id,name')
        .order('name')

      if (tradesErr) console.error(tradesErr)
      setTrades(tradesData || [])

      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      const { data: cp } = await supabase
        .from('contact_private')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      const preferredLanguage =
        prof?.preferred_language || localStorage.getItem('surplox_lang') || lang || 'en'

      const inferredCategoryGroup =
        prof?.role === 'driver' || prof?.role === 'mechanic'
          ? 'jobsite_support'
          : prof?.category_group || 'trade'

      const serviceTags = Array.isArray(prof?.service_tags) ? prof.service_tags : []
      const supportType =
        inferredCategoryGroup === 'jobsite_support'
          ? detectSupportType(serviceTags, prof?.role || '', prof?.vehicle_type || '')
          : 'material_delivery'

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
        preferred_language: preferredLanguage,
        category_group: inferredCategoryGroup,
        jobsite_support_type: supportType,
        business_name: prof?.business_name || '',
        business_address: prof?.business_address || '',
        business_zip: prof?.business_zip || '',
        materials_categories: Array.isArray(prof?.materials_categories) ? prof.materials_categories : [],
        storefront: Boolean(prof?.storefront),
        vehicle_type:
          prof?.vehicle_type ||
          JOBSITE_SUPPORT_OPTIONS.find((option) => option.value === supportType)?.default_vehicle_type ||
          '',
        trailer_type: prof?.trailer_type || 'none',
        trailer_length: prof?.trailer_length ?? '',
        payload_capacity: prof?.payload_capacity ?? '',
        delivery_radius: prof?.delivery_radius ?? 50
      })

      if (typeof setLang === 'function') {
        setLang(preferredLanguage)
      }

      setLoading(false)
    }

    load()
  }, [lang, navigate, setLang])

  useEffect(() => {
    if (isDriverProfile) {
      const nextSupportType =
        form.jobsite_support_type === 'equipment_fleet_repair'
          ? 'material_delivery'
          : form.jobsite_support_type || 'material_delivery'

      const nextDefaultVehicle =
        JOBSITE_SUPPORT_OPTIONS.find((option) => option.value === nextSupportType)?.default_vehicle_type || ''

      setForm((prev) => ({
        ...prev,
        role: 'driver',
        category_group: 'jobsite_support',
        jobsite_support_type: nextSupportType,
        vehicle_type: prev.vehicle_type || nextDefaultVehicle
      }))
    } else if (isMechanicProfile) {
      setForm((prev) => ({
        ...prev,
        role: 'mechanic',
        category_group: 'jobsite_support',
        jobsite_support_type: 'equipment_fleet_repair'
      }))
    } else if (isSupplierProfile) {
      setForm((prev) => ({
        ...prev,
        role: 'supplier',
        category_group: 'trade'
      }))
    }
  }, [isDriverProfile, isMechanicProfile, isSupplierProfile, form.jobsite_support_type])

  useEffect(() => {
    if (form.trailer_type === 'none') {
      setForm((prev) => ({
        ...prev,
        trailer_length: ''
      }))
    }
  }, [form.trailer_type])

  async function save() {
    setSaving(true)
    setMsg('')

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user

      if (!user) throw new Error(copy.errSignedIn)
      if (!form.display_name.trim()) throw new Error(copy.errDisplayName)
      if (!/^[0-9]{5}$/.test(form.home_zip)) throw new Error(copy.errZip)

      const roleRequiresTrade = form.category_group === 'trade' && form.role !== 'supplier'
      if (roleRequiresTrade && !form.trade_id) throw new Error(copy.errTrade)

      const phoneDigits = normalizePhone(form.phone)
      if (form.phone.trim() && phoneDigits.length < 10) throw new Error(copy.errPhone)
      if (form.email.trim() && !isValidEmail(form.email)) throw new Error(copy.errEmailValid)
      if (!['en', 'es'].includes(form.preferred_language)) throw new Error(copy.errLanguage)

      if (!String(form.city || '').trim()) throw new Error(copy.errCity)

      if (isSupplierProfile) {
        if (!String(form.business_name || '').trim()) throw new Error(copy.errBusinessName)
        if (form.business_zip && !/^[0-9]{5}$/.test(String(form.business_zip || '').trim())) {
          throw new Error(copy.errBusinessZip)
        }
      }

      if (isDriverProfile) {
        if (!String(form.vehicle_type || '').trim()) throw new Error(copy.errVehicleType)
        if (!String(form.trailer_type || '').trim()) throw new Error(copy.errTrailerType)

        const payloadCapacity = numericOrNull(form.payload_capacity)
        const deliveryRadius = numericOrNull(form.delivery_radius)
        const trailerLength = numericOrNull(form.trailer_length)

        if (payloadCapacity === null || payloadCapacity <= 0) throw new Error(copy.errPayloadCapacity)
        if (deliveryRadius === null || deliveryRadius <= 0) throw new Error(copy.errDeliveryRadius)
        if (form.trailer_type !== 'none' && (trailerLength === null || trailerLength <= 0)) {
          throw new Error(copy.errTrailerLength)
        }
      }

      const displayName = form.display_name.trim()
      const firstName =
        isSupplierProfile
          ? ''
          : form.first_name.trim() || displayName.split(/\s+/)[0] || displayName

      const trailerLengthValue =
        isDriverProfile && form.trailer_type !== 'none' ? numericOrNull(form.trailer_length) : null

      const profilePayload = {
        user_id: user.id,
        display_name: displayName,
        first_name: firstName,
        last_name: isSupplierProfile ? '' : form.last_name.trim(),
        role:
          form.category_group === 'jobsite_support'
            ? selectedSupportConfig.role
            : form.role || 'laborer',
        trade_id:
          form.category_group === 'trade' && form.trade_id
            ? Number(form.trade_id)
            : null,
        home_zip: form.home_zip.trim(),
        travel_radius_miles: Number(form.travel_radius_miles || 50),
        crew_size: Number(form.crew_size || 1),
        bio: form.bio.trim(),
        preferred_language: form.preferred_language,
        category_group: form.category_group,
        jobsite_support_type:
          form.category_group === 'jobsite_support' ? form.jobsite_support_type : null,
        service_tags:
          form.category_group === 'jobsite_support'
            ? selectedSupportConfig.service_tags
            : [],
        equipment_tags:
          form.category_group === 'jobsite_support'
            ? selectedSupportConfig.equipment_tags
            : [],
        business_name: isSupplierProfile ? form.business_name.trim() : null,
        business_address: isSupplierProfile ? form.business_address.trim() : null,
        business_zip: isSupplierProfile ? form.business_zip.trim() : null,
        materials_categories: isSupplierProfile ? form.materials_categories : [],
        storefront: isSupplierProfile ? Boolean(form.storefront) : false,
        vehicle_type: isDriverProfile ? form.vehicle_type || null : null,
        trailer_type: isDriverProfile ? form.trailer_type || 'none' : null,
        trailer_length: isDriverProfile ? trailerLengthValue : null,
        payload_capacity: isDriverProfile ? numericOrNull(form.payload_capacity) : null,
        delivery_radius: isDriverProfile ? numericOrNull(form.delivery_radius) : null
      }

      const { error: profErr } = await supabase.from('profiles').upsert(profilePayload)
      if (profErr) throw profErr

      const { error: zipErr } = await supabase.rpc('set_my_home_zip', {
        p_zip: form.home_zip.trim()
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
      if (typeof setLang === 'function') {
        await setLang(form.preferred_language)
      }

      setMsg(copy.success)
      navigate('/feed', { replace: true })
    } catch (err) {
      console.error(err)
      setMsg(err.message || copy.errGeneric)
    } finally {
      setSaving(false)
    }
  }

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
        <div className="badge" style={{ marginBottom: 14, background: '#f1e7a8' }}>
          {copy.heroBadge}
        </div>

        <div className="h1" style={{ maxWidth: 760 }}>
          {copy.heroTitle}
        </div>

        <p className="muted" style={{ marginTop: 12, maxWidth: 820, fontSize: 17, lineHeight: 1.7 }}>
          {copy.heroBody}
        </p>

        <div className="grid two" style={{ marginTop: 18 }}>
          <MiniTile value={copy.stat1} />
          <MiniTile value={copy.stat2} />
          <MiniTile value={copy.stat3} />
        </div>
      </div>

      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="h1" style={{ fontSize: 'clamp(1.9rem, 4vw, 2.7rem)' }}>
          {copy.title}
        </div>

        <p className="muted" style={{ marginTop: 10 }}>
          {copy.intro}
        </p>

        <div className="card-soft" style={{ marginTop: 16, background: '#fff4da' }}>
          <div className="card-section-title">{copy.noticeTitle}</div>
          <p className="card-section-subtitle" style={{ marginTop: 8 }}>
            {copy.noticeBody}
          </p>
        </div>

        {msg ? (
          <div className="card-message" style={{ marginTop: 14, padding: 14, borderRadius: 18 }}>
            {msg}
          </div>
        ) : null}

        <div className="grid two" style={{ marginTop: 16 }}>
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
              disabled={roleLockedBySignup}
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {roleLabel(option)}
                </option>
              ))}
            </select>
            {roleLockedBySignup ? (
              <div className="muted" style={{ marginTop: 8, fontSize: 13 }}>
                {copy.lockedBySignup}
              </div>
            ) : null}
          </div>

          {!isDriverProfile && !isMechanicProfile ? (
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
            <div>
              <div className="muted" style={{ marginBottom: 6 }}>{copy.supportType}</div>
              <select
                className="input"
                value={form.jobsite_support_type}
                onChange={(e) => {
                  const nextType = e.target.value
                  const nextDefaultVehicle =
                    JOBSITE_SUPPORT_OPTIONS.find((option) => option.value === nextType)?.default_vehicle_type || ''
                  setForm((prev) => ({
                    ...prev,
                    jobsite_support_type: nextType,
                    role: nextType === 'equipment_fleet_repair' ? 'mechanic' : 'driver',
                    category_group: 'jobsite_support',
                    vehicle_type:
                      nextType === 'equipment_fleet_repair'
                        ? prev.vehicle_type
                        : prev.vehicle_type || nextDefaultVehicle
                  }))
                }}
                disabled={isMechanicProfile}
              >
                {JOBSITE_SUPPORT_OPTIONS.filter((option) =>
                  isMechanicProfile ? option.role === 'mechanic' : option.role === 'driver'
                ).map((option) => (
                  <option key={option.value} value={option.value}>
                    {labelForOption(option, form.preferred_language)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <div className="muted" style={{ marginBottom: 6 }}>{copy.homeZip}</div>
            <input
              className="input"
              value={form.home_zip}
              onChange={(e) => setField('home_zip', e.target.value.replace(/[^\d]/g, '').slice(0, 5))}
            />
          </div>

          {!isSupplierProfile ? (
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
            <div className="muted" style={{ marginBottom: 6 }}>{copy.travelRadius}</div>
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
            {['supplier', 'driver', 'mechanic'].includes(form.role) || form.category_group === 'jobsite_support' ? (
              <div className="muted" style={{ marginTop: 8, fontSize: 13 }}>
                {copy.supportCrewOptional}
              </div>
            ) : null}
          </div>

          <div>
            <div className="muted" style={{ marginBottom: 6 }}>{copy.preferredLanguage}</div>
            <select
              className="input"
              value={form.preferred_language}
              onChange={(e) => {
                const nextLang = e.target.value
                setField('preferred_language', nextLang)
                if (typeof setLang === 'function') {
                  setLang(nextLang)
                }
              }}
            >
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {form.category_group === 'jobsite_support' ? (
          <div className="card-soft" style={{ marginTop: 16, background: '#f8f7ef' }}>
            <div className="card-section-title">{copy.supportType}</div>
            <p className="card-section-subtitle" style={{ marginTop: 8 }}>
              {copy.supportIntro}
            </p>
          </div>
        ) : null}

        {isDriverProfile ? (
          <div className="card-soft" style={{ marginTop: 16, background: '#eaf4ff' }}>
            <div className="card-section-title">{copy.driverLaneTitle}</div>
            <p className="card-section-subtitle" style={{ marginTop: 8 }}>
              {copy.driverLaneBody}
            </p>
          </div>
        ) : null}

        {isSupplierProfile ? (
          <div className="card-soft" style={{ marginTop: 16, background: '#fffaf0' }}>
            <div className="card-section-title">{copy.supplierSectionTitle}</div>
            <p className="card-section-subtitle" style={{ marginTop: 8 }}>
              {copy.supplierSectionBody}
            </p>

            <div className="grid two" style={{ marginTop: 14 }}>
              <div>
                <div className="muted" style={{ marginBottom: 6 }}>{copy.businessName}</div>
                <input
                  className="input"
                  value={form.business_name}
                  onChange={(e) => setField('business_name', e.target.value)}
                />
              </div>

              <div>
                <div className="muted" style={{ marginBottom: 6 }}>{copy.businessZip}</div>
                <input
                  className="input"
                  value={form.business_zip}
                  onChange={(e) => setField('business_zip', e.target.value.replace(/[^\d]/g, '').slice(0, 5))}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <div className="muted" style={{ marginBottom: 6 }}>{copy.businessAddress}</div>
                <input
                  className="input"
                  value={form.business_address}
                  onChange={(e) => setField('business_address', e.target.value)}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <div className="muted" style={{ marginBottom: 8 }}>{copy.materialsCategories}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {SUPPLIER_MATERIAL_OPTIONS.map((option) => {
                    const active = form.materials_categories.includes(option.value)
                    return (
                      <button
                        key={option.value}
                        type="button"
                        className={`btn small ${active ? 'primary' : ''}`}
                        onClick={() => toggleMultiValue('materials_categories', option.value)}
                      >
                        {labelForOption(option, form.preferred_language)}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <div className="grid" style={{ gap: 10 }}>
                  <div className="muted">{copy.addMaterialCategory}</div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <input
                      className="input"
                      value={customMaterialCategory}
                      onChange={(e) => setCustomMaterialCategory(e.target.value)}
                      style={{ flex: '1 1 260px' }}
                    />
                    <button type="button" className="btn" onClick={addCustomMaterialsCategory}>
                      {copy.add}
                    </button>
                  </div>
                </div>
              </div>

              {form.materials_categories.length > 0 ? (
                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {form.materials_categories.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className="badge"
                      style={{ border: 'none', cursor: 'pointer' }}
                      onClick={() => toggleMultiValue('materials_categories', item)}
                    >
                      {prettyMaterialLabel(item)}
                    </button>
                  ))}
                </div>
              ) : null}

              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700 }}>
                <input
                  type="checkbox"
                  checked={form.storefront}
                  onChange={(e) => setField('storefront', e.target.checked)}
                />
                <span>{copy.storefrontLocation}</span>
              </label>
            </div>
          </div>
        ) : null}

        {isDriverProfile ? (
          <div className="card-soft" style={{ marginTop: 16, background: '#eef6ff' }}>
            <div className="card-section-title">{copy.driverSectionTitle}</div>
            <p className="card-section-subtitle" style={{ marginTop: 8 }}>
              {copy.driverSectionBody}
            </p>
            <p className="muted" style={{ marginTop: 8 }}>
              {copy.driverFieldsHint}
            </p>

            <div className="grid two" style={{ marginTop: 14 }}>
              <div>
                <div className="muted" style={{ marginBottom: 6 }}>{copy.vehicleType}</div>
                <select
                  className="input"
                  value={form.vehicle_type}
                  onChange={(e) => setField('vehicle_type', e.target.value)}
                >
                  <option value=""></option>
                  {DRIVER_VEHICLE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {labelForOption(option, form.preferred_language)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="muted" style={{ marginBottom: 6 }}>{copy.trailerType}</div>
                <select
                  className="input"
                  value={form.trailer_type}
                  onChange={(e) => setField('trailer_type', e.target.value)}
                >
                  {DRIVER_TRAILER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {labelForOption(option, form.preferred_language)}
                    </option>
                  ))}
                </select>
                {form.trailer_type === 'none' ? (
                  <div className="muted" style={{ marginTop: 8, fontSize: 13 }}>
                    {copy.noTrailerHint}
                  </div>
                ) : null}
              </div>

              <div>
                <div className="muted" style={{ marginBottom: 6 }}>{copy.trailerLength}</div>
                <input
                  className="input"
                  type="number"
                  value={form.trailer_length}
                  onChange={(e) => setField('trailer_length', e.target.value)}
                  disabled={form.trailer_type === 'none'}
                />
              </div>

              <div>
                <div className="muted" style={{ marginBottom: 6 }}>{copy.payloadCapacity}</div>
                <input
                  className="input"
                  type="number"
                  value={form.payload_capacity}
                  onChange={(e) => setField('payload_capacity', e.target.value)}
                />
              </div>

              <div>
                <div className="muted" style={{ marginBottom: 6 }}>{copy.deliveryRadius}</div>
                <input
                  className="input"
                  type="number"
                  value={form.delivery_radius}
                  onChange={(e) => setField('delivery_radius', e.target.value)}
                />
              </div>
            </div>
          </div>
        ) : null}

        {form.role === 'supplier' && form.category_group === 'trade' ? (
          <div className="card-soft" style={{ marginTop: 16, background: '#fffaf0' }}>
            <p className="card-section-subtitle">{copy.supplierTradeOptional}</p>
          </div>
        ) : null}

        {form.category_group === 'jobsite_support' ? (
          <div className="card-soft" style={{ marginTop: 16, background: '#fffaf0' }}>
            <p className="card-section-subtitle">{copy.supportTradeOptional}</p>
          </div>
        ) : null}

        <div style={{ marginTop: 16 }}>
          <div className="muted" style={{ marginBottom: 6 }}>{copy.bio}</div>
          <textarea
            className="input"
            value={form.bio}
            placeholder={copy.bioPlaceholder}
            onChange={(e) => setField('bio', e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
          <button className="btn primary" onClick={save} disabled={saving}>
            {saving ? copy.saving : copy.save}
          </button>

          <button className="btn" onClick={() => navigate('/feed')} disabled={saving}>
            {copy.goFeed}
          </button>
        </div>
      </div>
    </div>
  )
}
