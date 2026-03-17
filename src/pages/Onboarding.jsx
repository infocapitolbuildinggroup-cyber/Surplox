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
    label: { en: 'Mechanic / Equipment Repair', es: 'Mecánica / Reparación de equipo' },
    role: 'mechanic',
    service_tags: ['diesel_mechanic', 'field_service'],
    equipment_tags: ['mobile_repair_truck', 'diesel_diagnostics'],
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
  { value: 'flatbed_truck', label: { en: 'Flatbed Truck', es: 'Camión plataforma' } },
  { value: 'mobile_repair_truck', label: { en: 'Mobile Repair Truck', es: 'Camión de reparación móvil' } },
  { value: 'service_truck', label: { en: 'Service Truck', es: 'Camión de servicio' } }
]

const DRIVER_TRAILER_OPTIONS = [
  { value: 'none', label: { en: 'No Trailer', es: 'Sin remolque' } },
  { value: 'utility_trailer', label: { en: 'Utility Trailer', es: 'Remolque utilitario' } },
  { value: 'flatbed_trailer', label: { en: 'Flatbed Trailer', es: 'Remolque plataforma' } },
  { value: 'gooseneck_trailer', label: { en: 'Gooseneck Trailer', es: 'Remolque gooseneck' } },
  { value: 'equipment_trailer', label: { en: 'Equipment Trailer', es: 'Remolque para equipo' } },
  { value: 'enclosed_trailer', label: { en: 'Enclosed Trailer', es: 'Remolque cerrado' } }
]

const MECHANIC_SERVICE_OPTIONS = [
  { value: 'diesel_mechanic', label: { en: 'Diesel Mechanic', es: 'Mecánico diésel' } },
  { value: 'small_engine_repair', label: { en: 'Small Engine Repair', es: 'Reparación de motores pequeños' } },
  { value: 'skid_steer_repair', label: { en: 'Skid Steer Repair', es: 'Reparación de skid steer' } },
  { value: 'tractor_repair', label: { en: 'Tractor Repair', es: 'Reparación de tractor' } },
  { value: 'mini_ex_repair', label: { en: 'Mini Excavator Repair', es: 'Reparación de mini excavadora' } },
  { value: 'heavy_equipment_repair', label: { en: 'Heavy Equipment Repair', es: 'Reparación de equipo pesado' } },
  { value: 'hydraulic_repair', label: { en: 'Hydraulic Repair', es: 'Reparación hidráulica' } },
  { value: 'trailer_repair', label: { en: 'Trailer Repair', es: 'Reparación de remolques' } },
  { value: 'field_service', label: { en: 'Mobile Field Service', es: 'Servicio móvil en campo' } },
  { value: 'emergency_repair', label: { en: 'Emergency Repair', es: 'Reparación de emergencia' } }
]

const MECHANIC_CAPABILITY_OPTIONS = [
  { value: 'mobile_repair_truck', label: { en: 'Mobile Repair Truck', es: 'Camión de reparación móvil' } },
  { value: 'diesel_diagnostics', label: { en: 'Diesel Diagnostics', es: 'Diagnóstico diésel' } },
  { value: 'hydraulic_tools', label: { en: 'Hydraulic Tools', es: 'Herramientas hidráulicas' } },
  { value: 'welder_generator', label: { en: 'Welder / Generator', es: 'Soldadora / Generador' } },
  { value: 'trailer_brake_tools', label: { en: 'Trailer Brake Tools', es: 'Herramientas de frenos de remolque' } },
  { value: 'battery_jump_setup', label: { en: 'Battery / Jump Setup', es: 'Batería / Arranque auxiliar' } },
  { value: 'service_truck', label: { en: 'Service Truck', es: 'Camión de servicio' } },
  { value: 'on_site_tools', label: { en: 'On-Site Tools', es: 'Herramientas en sitio' } }
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
    errVehicleType: 'Select a vehicle type for your driver or mechanic profile.',
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
      'You are already in Surplox. Finish the rest of your profile to carry more weight with nearby workers, crews, contractors, suppliers, drivers, and mechanics.',
    stat1: 'Display name + trade + ZIP',
    stat2: 'Everything else can be completed now',
    stat3: 'Stronger profile = more trust',
    supportType: 'Driver / Support Type',
    selectSupportType: 'Select a support type',
    supportIntro:
      'Use this setup for material delivery, cargo van delivery, hot shot, and mechanic / equipment repair profiles.',
    supplierTradeOptional:
      'Supplier accounts can leave trade blank and use business fields, material categories, city, and contact details to explain what they supply.',
    supportTradeOptional:
      'Driver and mechanic accounts do not need a trade selected here.',
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
    mechanicSectionTitle: 'Mechanic / Equipment Repair Capabilities',
    mechanicSectionBody:
      'Mechanic accounts should clearly show what they repair, what kind of equipment they can work on, and whether they offer mobile field service.',
    mechanicSpecialties: 'Repair Specialties',
    mechanicCapabilities: 'Equipment / Service Capabilities',
    vehicleType: 'Vehicle Type',
    trailerType: 'Trailer Type',
    trailerLength: 'Trailer Length (ft)',
    payloadCapacity: 'Payload Capacity (lbs)',
    deliveryRadius: 'Delivery Radius (miles)',
    driverLaneTitle: 'Driver account path',
    driverLaneBody:
      'Driver accounts stay separate from worker, subcontractor, and contractor accounts. Finish your hauling setup here so supplier → driver → jobsite discovery works correctly.',
    mechanicLaneTitle: 'Mechanic account path',
    mechanicLaneBody:
      'Mechanic accounts stay separate from worker and driver lanes. Use this setup for diesel mechanic work, small engine repair, skid steer and tractor repair, trailer repair, hydraulics, and mobile field service.',
    lockedBySignup: 'This was selected during signup and is being kept locked here.',
    noTrailerHint: 'No trailer selected. Trailer length is optional when there is no trailer.',
    driverFieldsHint:
      'These fields power the Delivery search so suppliers and jobsites can filter you by vehicle, trailer, payload, and radius.',
    mechanicFieldsHint:
      'These fields power mechanic visibility so users can quickly see whether you handle diesel, small engines, skid steers, tractors, trailers, hydraulics, and field repair.',
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
    errVehicleType: 'Selecciona un tipo de vehículo para tu perfil de conductor o mecánico.',
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
      'Ya estás dentro de Surplox. Termina el resto de tu perfil para tener más peso con trabajadores, cuadrillas, contratistas, proveedores, conductores y mecánicos cercanos.',
    stat1: 'Nombre visible + oficio + ZIP',
    stat2: 'Todo lo demás se puede completar ahora',
    stat3: 'Perfil más fuerte = más confianza',
    supportType: 'Tipo de conductor / soporte',
    selectSupportType: 'Selecciona un tipo de soporte',
    supportIntro:
      'Usa esta configuración para entrega de materiales, cargo van, hot shot y perfiles de mecánica / reparación de equipo.',
    supplierTradeOptional:
      'Las cuentas de proveedor pueden dejar el oficio en blanco y usar campos del negocio, categorías de materiales, ciudad y contacto para explicar lo que suministran.',
    supportTradeOptional:
      'Las cuentas de conductor y mecánico no necesitan seleccionar un oficio aquí.',
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
    mechanicSectionTitle: 'Capacidades de Mecánica / Reparación de equipo',
    mechanicSectionBody:
      'Las cuentas de mecánico deben mostrar claramente qué reparan, en qué equipo trabajan y si ofrecen servicio móvil en campo.',
    mechanicSpecialties: 'Especialidades de reparación',
    mechanicCapabilities: 'Capacidades de equipo / servicio',
    vehicleType: 'Tipo de vehículo',
    trailerType: 'Tipo de remolque',
    trailerLength: 'Largo del remolque (ft)',
    payloadCapacity: 'Capacidad de carga (lbs)',
    deliveryRadius: 'Radio de entrega (millas)',
    driverLaneTitle: 'Ruta de cuenta para conductores',
    driverLaneBody:
      'Las cuentas de conductor se mantienen separadas de las cuentas de trabajador, subcontratista y contratista. Termina aquí tu configuración para que proveedor → conductor → obra funcione correctamente.',
    mechanicLaneTitle: 'Ruta de cuenta para mecánicos',
    mechanicLaneBody:
      'Las cuentas de mecánico se mantienen separadas de las cuentas de trabajador y conductor. Usa esta configuración para mecánica diésel, motores pequeños, reparación de skid steer y tractor, remolques, hidráulica y servicio móvil en campo.',
    lockedBySignup: 'Esto fue seleccionado durante el registro y se mantiene bloqueado aquí.',
    noTrailerHint: 'Si no hay remolque, el largo del remolque es opcional.',
    driverFieldsHint:
      'Estos campos impulsan la búsqueda de Delivery para que proveedores y obras puedan filtrarte por vehículo, remolque, carga y radio.',
    mechanicFieldsHint:
      'Estos campos mejoran la visibilidad del mecánico para que los usuarios vean rápido si manejas diésel, motores pequeños, skid steers, tractores, remolques, hidráulica y reparación en campo.',
    goFeed: 'Ir al Feed'
  }
}

function labelFor(option, lang = 'en') {
  return option?.label?.[lang] || option?.label?.en || option?.value || ''
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
    delivery_radius: 50,
    service_tags: [],
    equipment_tags: []
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

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      const { data: contactData } = await supabase
        .from('contact_private')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      const { data: tradesData, error: tradesError } = await supabase
        .from('trades')
        .select('id,name')
        .order('name')

      if (tradesError) {
        console.error(tradesError)
      } else {
        setTrades(tradesData || [])
      }

      const preferredLanguage =
        profileData?.preferred_language ||
        localStorage.getItem('surplox_lang') ||
        lang ||
        'en'

      if (typeof setLang === 'function') {
        setLang(preferredLanguage)
      }
      localStorage.setItem('surplox_lang', preferredLanguage)

      setForm((prev) => ({
        ...prev,
        display_name: String(profileData?.display_name || user.user_metadata?.display_name || ''),
        first_name: String(profileData?.first_name || ''),
        last_name: String(profileData?.last_name || ''),
        role: String(profileData?.role || prev.role || 'laborer'),
        trade_id: profileData?.trade_id ? String(profileData.trade_id) : '',
        home_zip: String(profileData?.home_zip || ''),
        travel_radius_miles: Number(profileData?.travel_radius_miles || 50),
        crew_size: Number(profileData?.crew_size || 1),
        bio: String(profileData?.bio || ''),
        phone: String(contactData?.phone || ''),
        city: String(contactData?.city || ''),
        email: String(contactData?.email || user.email || ''),
        preferred_language: preferredLanguage,
        category_group: String(profileData?.category_group || prev.category_group || 'trade'),
        jobsite_support_type:
          String(profileData?.category_group || '') === 'jobsite_support'
            ? JOBSITE_SUPPORT_OPTIONS.find((option) =>
                (Array.isArray(profileData?.service_tags) ? profileData.service_tags : []).some((tag) =>
                  option.service_tags.includes(tag)
                )
              )?.value || prev.jobsite_support_type
            : prev.jobsite_support_type,
        business_name: String(profileData?.business_name || ''),
        business_address: String(profileData?.business_address || ''),
        business_zip: String(profileData?.business_zip || ''),
        materials_categories: Array.isArray(profileData?.materials_categories)
          ? profileData.materials_categories
          : [],
        storefront: Boolean(profileData?.storefront),
        vehicle_type: String(profileData?.vehicle_type || ''),
        trailer_type: String(profileData?.trailer_type || 'none'),
        trailer_length: String(profileData?.trailer_length || ''),
        payload_capacity: String(profileData?.payload_capacity || ''),
        delivery_radius: Number(profileData?.delivery_radius || 50),
        service_tags: Array.isArray(profileData?.service_tags) ? profileData.service_tags : [],
        equipment_tags: Array.isArray(profileData?.equipment_tags) ? profileData.equipment_tags : []
      }))

      setLoading(false)
    }

    load()
  }, [lang, navigate, setLang])

  useEffect(() => {
    if (form.category_group !== 'jobsite_support') return
    setForm((prev) => {
      const vehicleType =
        prev.vehicle_type || selectedSupportConfig.default_vehicle_type || ''
      const next = {
        ...prev,
        role: selectedSupportConfig.role,
        vehicle_type: vehicleType
      }

      if (!Array.isArray(prev.service_tags) || prev.service_tags.length === 0) {
        next.service_tags = selectedSupportConfig.service_tags
      }
      if (!Array.isArray(prev.equipment_tags) || prev.equipment_tags.length === 0) {
        next.equipment_tags = selectedSupportConfig.equipment_tags
      }
      return next
    })
  }, [form.category_group, selectedSupportConfig])

  async function handleSave() {
    try {
      setSaving(true)
      setMsg('')

      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user
      if (!user) throw new Error(copy.errSignedIn)

      if (!String(form.display_name || '').trim()) throw new Error(copy.errDisplayName)
      if (!/^\d{5}$/.test(String(form.home_zip || '').trim())) throw new Error(copy.errZip)
      if (!String(form.city || '').trim()) throw new Error(copy.errCity)
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(form.email || '').trim())) throw new Error(copy.errEmailValid)
      if (String(form.phone || '').replace(/\D/g, '').length < 10) throw new Error(copy.errPhone)
      if (!['en', 'es'].includes(String(form.preferred_language || '').trim())) throw new Error(copy.errLanguage)

      if (!isSupplierProfile && !isDriverProfile && !isMechanicProfile && !String(form.trade_id || '').trim()) {
        throw new Error(copy.errTrade)
      }

      if (isSupplierProfile) {
        if (!String(form.business_name || '').trim()) throw new Error(copy.errBusinessName)
        if (!/^\d{5}$/.test(String(form.business_zip || '').trim())) throw new Error(copy.errBusinessZip)
      }

      if (isDriverProfile || isMechanicProfile) {
        if (!String(form.vehicle_type || '').trim()) throw new Error(copy.errVehicleType)
        if (isDriverProfile && !String(form.trailer_type || '').trim()) throw new Error(copy.errTrailerType)
        if (isDriverProfile && String(form.trailer_type || '') !== 'none' && Number(form.trailer_length || 0) <= 0) {
          throw new Error(copy.errTrailerLength)
        }
        if (isDriverProfile && Number(form.payload_capacity || 0) <= 0) {
          throw new Error(copy.errPayloadCapacity)
        }
        if (Number(form.delivery_radius || 0) <= 0) {
          throw new Error(copy.errDeliveryRadius)
        }
      }

      const profilePayload = {
        user_id: user.id,
        display_name: String(form.display_name || '').trim(),
        first_name: String(form.first_name || '').trim() || null,
        last_name: String(form.last_name || '').trim() || null,
        role: form.category_group === 'jobsite_support' ? selectedSupportConfig.role : form.role,
        trade_id:
          !isSupplierProfile && !isDriverProfile && !isMechanicProfile && form.trade_id
            ? Number(form.trade_id)
            : null,
        home_zip: String(form.home_zip || '').trim(),
        travel_radius_miles: Number(form.travel_radius_miles || 0) || 50,
        crew_size: Number(form.crew_size || 0) || 1,
        bio: String(form.bio || '').trim(),
        preferred_language: String(form.preferred_language || 'en'),
        category_group: form.category_group,
        service_tags:
          form.category_group === 'jobsite_support'
            ? (isMechanicProfile
                ? form.service_tags
                : selectedSupportConfig.role === 'driver'
                  ? Array.from(new Set([...(form.service_tags || []), ...selectedSupportConfig.service_tags]))
                  : form.service_tags)
            : [],
        equipment_tags:
          form.category_group === 'jobsite_support'
            ? (isMechanicProfile
                ? form.equipment_tags
                : selectedSupportConfig.role === 'driver'
                  ? Array.from(new Set([...(form.equipment_tags || []), ...selectedSupportConfig.equipment_tags]))
                  : form.equipment_tags)
            : [],
        business_name: isSupplierProfile ? String(form.business_name || '').trim() : null,
        business_address: isSupplierProfile ? String(form.business_address || '').trim() : null,
        business_zip: isSupplierProfile ? String(form.business_zip || '').trim() : null,
        materials_categories: isSupplierProfile ? form.materials_categories : [],
        storefront: isSupplierProfile ? Boolean(form.storefront) : false,
        vehicle_type: (isDriverProfile || isMechanicProfile) ? String(form.vehicle_type || '').trim() : null,
        trailer_type: isDriverProfile ? String(form.trailer_type || 'none').trim() : null,
        trailer_length: isDriverProfile && String(form.trailer_type || '') !== 'none' ? Number(form.trailer_length || 0) : null,
        payload_capacity: isDriverProfile ? Number(form.payload_capacity || 0) : null,
        delivery_radius: (isDriverProfile || isMechanicProfile) ? Number(form.delivery_radius || 0) : null
      }

      const { error: profileError } = await supabase.from('profiles').upsert(profilePayload)
      if (profileError) throw profileError

      const { error: contactError } = await supabase.from('contact_private').upsert({
        user_id: user.id,
        phone: String(form.phone || '').trim(),
        city: String(form.city || '').trim(),
        email: String(form.email || '').trim()
      })
      if (contactError) throw contactError

      localStorage.setItem('surplox_lang', form.preferred_language)
      if (typeof setLang === 'function') {
        setLang(form.preferred_language)
      }

      setMsg(copy.success)
      navigate('/feed', { replace: true })
    } catch (error) {
      console.error(error)
      setMsg(error?.message || copy.errGeneric)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="card">{copy.loading}</div>
  }

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div
        className="card rounded-xl"
        style={{ padding: 28, background: 'linear-gradient(180deg, #fff7cf 0%, #ffffff 100%)' }}
      >
        <div className="badge" style={{ marginBottom: 14, background: '#f1e7a8' }}>
          {copy.heroBadge}
        </div>
        <div className="h1">{copy.heroTitle}</div>
        <p className="muted" style={{ marginTop: 10, lineHeight: 1.75, maxWidth: 860 }}>
          {copy.heroBody}
        </p>

        <div className="grid three" style={{ marginTop: 16 }}>
          <div className="card-soft">{copy.stat1}</div>
          <div className="card-soft">{copy.stat2}</div>
          <div className="card-soft">{copy.stat3}</div>
        </div>
      </div>

      <div className="card rounded-xl" style={{ padding: 24 }}>
        <div className="card-section-title">{copy.noticeTitle}</div>
        <p className="card-section-subtitle" style={{ marginTop: 8 }}>
          {copy.noticeBody}
        </p>
      </div>

      {msg ? (
        <div className="card-message" style={{ padding: 14, borderRadius: 18 }}>
          {msg}
        </div>
      ) : null}

      <div className="grid two" style={{ alignItems: 'start' }}>
        <div className="card rounded-xl" style={{ padding: 24 }}>
          <div className="grid" style={{ gap: 14 }}>
            <div>
              <div className="muted" style={{ marginBottom: 6 }}>{copy.displayName}</div>
              <input className="input" value={form.display_name} onChange={(e) => setField('display_name', e.target.value)} />
            </div>

            <div className="grid two">
              <div>
                <div className="muted" style={{ marginBottom: 6 }}>{copy.firstName}</div>
                <input className="input" value={form.first_name} onChange={(e) => setField('first_name', e.target.value)} />
              </div>
              <div>
                <div className="muted" style={{ marginBottom: 6 }}>{copy.lastName}</div>
                <input className="input" value={form.last_name} onChange={(e) => setField('last_name', e.target.value)} />
              </div>
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
                <div className="muted" style={{ marginTop: 8 }}>{copy.lockedBySignup}</div>
              ) : null}
            </div>

            {!isSupplierProfile && !isDriverProfile && !isMechanicProfile ? (
              <div>
                <div className="muted" style={{ marginBottom: 6 }}>{copy.trade}</div>
                <select className="input" value={form.trade_id} onChange={(e) => setField('trade_id', e.target.value)}>
                  <option value="">{copy.selectTrade}</option>
                  {trades.map((trade) => (
                    <option key={trade.id} value={trade.id}>{trade.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="card-soft">
                <div className="muted">{copy.supportTradeOptional}</div>
              </div>
            )}

            <div className="grid two">
              <div>
                <div className="muted" style={{ marginBottom: 6 }}>{copy.homeZip}</div>
                <input
                  className="input"
                  value={form.home_zip}
                  inputMode="numeric"
                  onChange={(e) => setField('home_zip', e.target.value.replace(/[^\d]/g, '').slice(0, 5))}
                />
              </div>
              <div>
                <div className="muted" style={{ marginBottom: 6 }}>{copy.city}</div>
                <input className="input" value={form.city} onChange={(e) => setField('city', e.target.value)} />
              </div>
            </div>

            <div className="grid two">
              <div>
                <div className="muted" style={{ marginBottom: 6 }}>{copy.phone}</div>
                <input className="input" value={form.phone} onChange={(e) => setField('phone', e.target.value)} />
              </div>
              <div>
                <div className="muted" style={{ marginBottom: 6 }}>{copy.email}</div>
                <input className="input" type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} />
              </div>
            </div>

            <div className="grid two">
              <div>
                <div className="muted" style={{ marginBottom: 6 }}>{copy.preferredLanguage}</div>
                <select className="input" value={form.preferred_language} onChange={(e) => setField('preferred_language', e.target.value)}>
                  {languageOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
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
            </div>

            {!isSupplierProfile && !isDriverProfile && !isMechanicProfile ? (
              <div>
                <div className="muted" style={{ marginBottom: 6 }}>{copy.crewSize}</div>
                <input
                  className="input"
                  type="number"
                  value={form.crew_size}
                  onChange={(e) => setField('crew_size', e.target.value)}
                />
              </div>
            ) : (
              <div className="card-soft">
                <div className="muted">{copy.supportCrewOptional}</div>
              </div>
            )}

            <div>
              <div className="muted" style={{ marginBottom: 6 }}>{copy.bio}</div>
              <textarea
                className="input"
                value={form.bio}
                placeholder={copy.bioPlaceholder}
                onChange={(e) => setField('bio', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid" style={{ gap: 18 }}>
          {(isDriverProfile || isMechanicProfile) ? (
            <div className="card rounded-xl" style={{ padding: 24 }}>
              <div className="card-section-title">{copy.supportType}</div>
              <p className="card-section-subtitle" style={{ marginTop: 8 }}>
                {copy.supportIntro}
              </p>

              <div style={{ marginTop: 14 }}>
                <div className="muted" style={{ marginBottom: 6 }}>{copy.selectSupportType}</div>
                <select
                  className="input"
                  value={form.jobsite_support_type}
                  onChange={(e) => setField('jobsite_support_type', e.target.value)}
                  disabled={roleLockedBySignup}
                >
                  {JOBSITE_SUPPORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {labelFor(option, form.preferred_language)}
                    </option>
                  ))}
                </select>
              </div>

              {isDriverProfile ? (
                <>
                  <div className="card-soft" style={{ marginTop: 16, background: '#eef6ff' }}>
                    <div style={{ fontWeight: 900 }}>{copy.driverLaneTitle}</div>
                    <p className="muted" style={{ marginTop: 8, lineHeight: 1.7 }}>{copy.driverLaneBody}</p>
                  </div>

                  <div className="card-soft" style={{ marginTop: 16 }}>
                    <div style={{ fontWeight: 900 }}>{copy.driverSectionTitle}</div>
                    <p className="muted" style={{ marginTop: 8, lineHeight: 1.7 }}>{copy.driverSectionBody}</p>
                  </div>

                  <div className="grid two" style={{ marginTop: 14 }}>
                    <div>
                      <div className="muted" style={{ marginBottom: 6 }}>{copy.vehicleType}</div>
                      <select className="input" value={form.vehicle_type} onChange={(e) => setField('vehicle_type', e.target.value)}>
                        <option value="">{copy.vehicleType}</option>
                        {DRIVER_VEHICLE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>{labelFor(option, form.preferred_language)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <div className="muted" style={{ marginBottom: 6 }}>{copy.trailerType}</div>
                      <select className="input" value={form.trailer_type} onChange={(e) => setField('trailer_type', e.target.value)}>
                        {DRIVER_TRAILER_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>{labelFor(option, form.preferred_language)}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid two" style={{ marginTop: 14 }}>
                    <div>
                      <div className="muted" style={{ marginBottom: 6 }}>{copy.trailerLength}</div>
                      <input className="input" type="number" value={form.trailer_length} onChange={(e) => setField('trailer_length', e.target.value)} />
                      {String(form.trailer_type) === 'none' ? (
                        <div className="muted" style={{ marginTop: 8 }}>{copy.noTrailerHint}</div>
                      ) : null}
                    </div>
                    <div>
                      <div className="muted" style={{ marginBottom: 6 }}>{copy.payloadCapacity}</div>
                      <input className="input" type="number" value={form.payload_capacity} onChange={(e) => setField('payload_capacity', e.target.value)} />
                    </div>
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <div className="muted" style={{ marginBottom: 6 }}>{copy.deliveryRadius}</div>
                    <input className="input" type="number" value={form.delivery_radius} onChange={(e) => setField('delivery_radius', e.target.value)} />
                    <div className="muted" style={{ marginTop: 8 }}>{copy.driverFieldsHint}</div>
                  </div>
                </>
              ) : null}

              {isMechanicProfile ? (
                <>
                  <div className="card-soft" style={{ marginTop: 16, background: '#f4efff' }}>
                    <div style={{ fontWeight: 900 }}>{copy.mechanicLaneTitle}</div>
                    <p className="muted" style={{ marginTop: 8, lineHeight: 1.7 }}>{copy.mechanicLaneBody}</p>
                  </div>

                  <div className="card-soft" style={{ marginTop: 16 }}>
                    <div style={{ fontWeight: 900 }}>{copy.mechanicSectionTitle}</div>
                    <p className="muted" style={{ marginTop: 8, lineHeight: 1.7 }}>{copy.mechanicSectionBody}</p>
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <div className="muted" style={{ marginBottom: 6 }}>{copy.vehicleType}</div>
                    <select className="input" value={form.vehicle_type} onChange={(e) => setField('vehicle_type', e.target.value)}>
                      <option value="">{copy.vehicleType}</option>
                      {DRIVER_VEHICLE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{labelFor(option, form.preferred_language)}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <div className="muted" style={{ marginBottom: 6 }}>{copy.deliveryRadius}</div>
                    <input className="input" type="number" value={form.delivery_radius} onChange={(e) => setField('delivery_radius', e.target.value)} />
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <div className="muted" style={{ marginBottom: 8 }}>{copy.mechanicSpecialties}</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {MECHANIC_SERVICE_OPTIONS.map((option) => {
                        const active = form.service_tags.includes(option.value)
                        return (
                          <button
                            key={option.value}
                            type="button"
                            className={active ? 'btn primary small' : 'btn small'}
                            onClick={() => toggleMultiValue('service_tags', option.value)}
                          >
                            {labelFor(option, form.preferred_language)}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <div className="muted" style={{ marginBottom: 8 }}>{copy.mechanicCapabilities}</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {MECHANIC_CAPABILITY_OPTIONS.map((option) => {
                        const active = form.equipment_tags.includes(option.value)
                        return (
                          <button
                            key={option.value}
                            type="button"
                            className={active ? 'btn primary small' : 'btn small'}
                            onClick={() => toggleMultiValue('equipment_tags', option.value)}
                          >
                            {labelFor(option, form.preferred_language)}
                          </button>
                        )
                      })}
                    </div>
                    <div className="muted" style={{ marginTop: 8 }}>{copy.mechanicFieldsHint}</div>
                  </div>
                </>
              ) : null}
            </div>
          ) : null}

          {isSupplierProfile ? (
            <div className="card rounded-xl" style={{ padding: 24 }}>
              <div className="card-section-title">{copy.supplierSectionTitle}</div>
              <p className="card-section-subtitle" style={{ marginTop: 8 }}>{copy.supplierSectionBody}</p>

              <div className="grid" style={{ gap: 14, marginTop: 14 }}>
                <div>
                  <div className="muted" style={{ marginBottom: 6 }}>{copy.businessName}</div>
                  <input className="input" value={form.business_name} onChange={(e) => setField('business_name', e.target.value)} />
                </div>
                <div>
                  <div className="muted" style={{ marginBottom: 6 }}>{copy.businessAddress}</div>
                  <input className="input" value={form.business_address} onChange={(e) => setField('business_address', e.target.value)} />
                </div>
                <div>
                  <div className="muted" style={{ marginBottom: 6 }}>{copy.businessZip}</div>
                  <input
                    className="input"
                    value={form.business_zip}
                    inputMode="numeric"
                    onChange={(e) => setField('business_zip', e.target.value.replace(/[^\d]/g, '').slice(0, 5))}
                  />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="checkbox" checked={Boolean(form.storefront)} onChange={(e) => setField('storefront', e.target.checked)} />
                  <span>{copy.storefrontLocation}</span>
                </label>

                <div>
                  <div className="muted" style={{ marginBottom: 8 }}>{copy.materialsCategories}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {SUPPLIER_MATERIAL_OPTIONS.map((option) => {
                      const active = form.materials_categories.includes(option.value)
                      return (
                        <button
                          key={option.value}
                          type="button"
                          className={active ? 'btn primary small' : 'btn small'}
                          onClick={() => toggleMultiValue('materials_categories', option.value)}
                        >
                          {labelFor(option, form.preferred_language)}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="grid two">
                  <div>
                    <div className="muted" style={{ marginBottom: 6 }}>{copy.addMaterialCategory}</div>
                    <input className="input" value={customMaterialCategory} onChange={(e) => setCustomMaterialCategory(e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'end' }}>
                    <button type="button" className="btn" onClick={addCustomMaterialsCategory}>{copy.add}</button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn primary" type="button" onClick={handleSave} disabled={saving}>
              {saving ? copy.saving : copy.save}
            </button>
            <button className="btn" type="button" onClick={() => navigate('/feed')}>
              {copy.goFeed}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
