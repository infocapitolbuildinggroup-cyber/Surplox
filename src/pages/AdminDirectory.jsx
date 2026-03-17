import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

const COPY = {
  en: {
    pageTitle: 'Admin Dashboard',
    pageIntro:
      'Monitor network health, review worker quality, identify supply and demand gaps, and manage growth from one place.',

    analyticsTitle: 'Platform Overview',
    marketTitle: 'Market Intelligence',
    workerIntelTitle: 'Worker Intelligence',
    activityTitle: 'Activity Review',
    exportTitle: 'Export / Ops',
    filtersTitle: 'Admin Filters',
    filtersIntro:
      'Search the network by role, category, support type, trade, ZIP, radius, availability, and crew size.',

    totalUsers: 'Total Users',
    laborers: 'Laborers',
    subcontractors: 'Subcontractors',
    contractors: 'Contractors',
    suppliers: 'Suppliers',
    drivers: 'Drivers',
    mechanics: 'Mechanics',
    availableWorkers: 'Available Workers',
    totalPosts: 'Total Posts',
    needCrewPosts: 'Need Crew Posts',
    lookingForWorkPosts: 'Looking for Work Posts',
    discussions: 'Discussions',
    crewJoins: 'Crew Joins',
    hires: 'Hires',
    openCrewPosts: 'Open Crew Posts',
    fullCrewPosts: 'Full Crew Posts',
    closedCrewPosts: 'Closed Crew Posts',
    totalComments: 'Total Comments',
    completedProfiles: 'Completed Profiles',
    incompleteProfiles: 'Incomplete Profiles',
    tradeUsers: 'Trade Users',
    jobsiteSupportUsers: 'Jobsite Support Users',
    urgentPosts: 'Urgent Posts',
    verifiedContractors: 'Verified Contractors',

    topTradesByUsers: 'Top Trades by User Count',
    topTradesByDemand: 'Top Trades by Post Demand',
    topZipsByWorkers: 'Top ZIPs by Worker Count',
    topZipsByCrewRequests: 'Top ZIPs by Crew Requests',
    marketGapFinder: 'Marketplace Gap Finder',
    supply: 'Supply',
    demand: 'Demand',
    gap: 'Gap',
    surplus: 'Surplus',
    shortage: 'Shortage',
    balanced: 'Balanced',

    newestUsers: 'Newest Users',
    newestPosts: 'Newest Posts',
    newestCrewJoins: 'Newest Crew Joins',
    newestHires: 'Newest Hires',
    mostActiveMembers: 'Most Active Members',

    role: 'Account Type',
    trade: 'Trade',
    city: 'City',
    zip: 'ZIP',
    radius: 'Radius',
    availability: 'Availability',
    availabilityStatus: 'Availability Status',
    categoryGroup: 'Account Class',
    supportType: 'Support Type',
    serviceTags: 'Service Tags',
    equipmentTags: 'Equipment Tags',
    businessName: 'Business Name',
    businessAddress: 'Business Address',
    businessZip: 'Business ZIP',
    materialsCategories: 'Materials Categories',
    storefront: 'Storefront Location',
    vehicleType: 'Vehicle Type',
    trailerType: 'Trailer Type',
    trailerLength: 'Trailer Length',
    payloadCapacity: 'Payload Capacity',
    deliveryRadius: 'Delivery Radius',
    contractorVerification: 'Contractor Verification',
    privateRating: 'Private Admin Rating',
    privateNotes: 'Private Notes',
    followUpStatus: 'Follow-Up Status',
    workedWithCount: 'Worked-With Count',
    hiresCount: 'Hires Count',
    crewsJoinedCount: 'Crews Joined',
    noData: 'No data yet.',
    unknown: 'Unknown',
    unknownMember: 'Unknown Member',
    available: 'Available',
    notAvailable: 'Not Available',
    availableNow: 'Available Now',
    availableThisWeek: 'Available This Week',
    busy: 'Busy',
    tradesGroup: 'Trades',
    jobsiteSupportGroup: 'Jobsite Support',
    materialDelivery: 'Material Delivery / Hot Shot',
    cargoVanDelivery: 'Cargo Van / Local Delivery',
    fleetRepair: 'Equipment / Fleet Repair',
    verified: 'Verified',
    notVerified: 'Not Verified',

    searchLabel: 'Search',
    searchPlaceholder: 'Search by name, business, trade, city, ZIP, account type, bio, service, or equipment',
    tradeLabel: 'Trade',
    allTrades: 'All Trades',
    roleLabel: 'Account Type',
    allRoles: 'All Roles',
    categoryLabel: 'Account Class',
    allCategories: 'All Categories',
    supportTypeLabel: 'Support Type',
    allSupportTypes: 'All Support Types',
    zipLabel: 'Job ZIP',
    radiusLabel: 'Job Radius (miles)',
    availabilityLabel: 'Availability',
    availabilityAll: 'All Availability',
    availabilityAvailable: 'Available Only',
    availabilityUnavailable: 'Unavailable Only',
    availabilityStatusLabel: 'Availability Status',
    allAvailabilityStatuses: 'All Availability Statuses',
    contractorVerificationLabel: 'Contractor Verification',
    verificationAll: 'All Verification States',
    verificationOnlyVerified: 'Verified Only',
    verificationOnlyUnverified: 'Unverified Only',
    minCrewLabel: 'Minimum Crew Size',
    profileCompletionLabel: 'Profile Completion',
    profileCompletionAll: 'All Profiles',
    profileCompletionComplete: 'Completed Only',
    profileCompletionIncomplete: 'Incomplete Only',

    exportFiltered: 'Export Filtered Results',
    exportWorkers: 'Export Worker List',
    exportContractors: 'Export Contractor List',
    exportAvailable: 'Export Available Workers',
    exportByTrade: 'Export Selected Trade',
    exportByZip: 'Export Selected ZIP',
    exportJobsiteSupport: 'Export Jobsite Support',
    results: 'results',

    location: 'Location',
    crewRadius: 'Crew / Radius',
    bio: 'Bio',
    contact: 'Contact',
    privateAdmin: 'Private Admin Controls',
    ratingPlaceholder: '1 to 5',
    notesPlaceholder:
      'Private notes for reliability, pricing, follow-up, communication, or job history.',
    followUpPlaceholder: 'Example: Call Tuesday, strong lead, needs follow-up',
    save: 'Save',
    saving: 'Saving...',
    saved: 'Admin notes saved.',
    saveError: 'Unable to save admin data right now.',
    loading: 'Loading admin dashboard…',

    userCount: 'users',
    workers: 'workers',
    requests: 'requests',
    milesAway: 'mi away',
    crewSize: 'Crew Size',
    travelRadius: 'Travel Radius',
    openPost: 'Open Post',
    openProfile: 'Open Profile',
    openStorefront: 'Open Storefront',
    connections: 'connections',
    profileStatus: 'Profile Status',
    profileComplete: 'Complete',
    profileIncomplete: 'Incomplete',
    missingFields: 'Missing Fields',

    heroBadge: 'Admin OS',
    heroTitle: 'Run Surplox with cleaner visibility.',
    heroBody:
      'Track marketplace health, spot shortages, review worker quality, and manage admin follow-up from one premium control center.',
    filteredMembers: 'Filtered Members',
    networkHealth: 'Network Health',
    demandSignals: 'Demand Signals'
  },
  es: {
    pageTitle: 'Panel de Administración',
    pageIntro:
      'Monitorea la salud de la red, revisa la calidad de los trabajadores, identifica faltantes de oferta y demanda, y administra el crecimiento desde un solo lugar.',

    analyticsTitle: 'Resumen de la Plataforma',
    marketTitle: 'Inteligencia de Mercado',
    workerIntelTitle: 'Inteligencia de Trabajadores',
    activityTitle: 'Revisión de Actividad',
    exportTitle: 'Exportación / Operaciones',
    filtersTitle: 'Filtros de Administración',
    filtersIntro:
      'Busca en la red por rol, categoría, tipo de soporte, oficio, ZIP, radio, disponibilidad y tamaño de cuadrilla.',

    totalUsers: 'Usuarios Totales',
    laborers: 'Trabajadores',
    subcontractors: 'Subcontratistas',
    contractors: 'Contratistas',
    suppliers: 'Proveedores',
    drivers: 'Conductores',
    mechanics: 'Mecánicos',
    availableWorkers: 'Trabajadores Disponibles',
    totalPosts: 'Publicaciones Totales',
    needCrewPosts: 'Publicaciones de Se Necesita Cuadrilla',
    lookingForWorkPosts: 'Publicaciones de Buscando Trabajo',
    discussions: 'Discusiones',
    crewJoins: 'Uniones a Cuadrillas',
    hires: 'Contrataciones',
    openCrewPosts: 'Publicaciones Abiertas',
    fullCrewPosts: 'Cuadrillas Llenas',
    closedCrewPosts: 'Publicaciones Cerradas',
    totalComments: 'Comentarios Totales',
    completedProfiles: 'Perfiles Completos',
    incompleteProfiles: 'Perfiles Incompletos',
    tradeUsers: 'Usuarios de Oficios',
    jobsiteSupportUsers: 'Usuarios de Soporte de Obra',
    urgentPosts: 'Publicaciones Urgentes',
    verifiedContractors: 'Contratistas Verificados',

    topTradesByUsers: 'Oficios Principales por Cantidad de Usuarios',
    topTradesByDemand: 'Oficios Principales por Demanda',
    topZipsByWorkers: 'ZIPs Principales por Cantidad de Trabajadores',
    topZipsByCrewRequests: 'ZIPs Principales por Solicitudes de Cuadrilla',
    marketGapFinder: 'Detector de Brechas del Mercado',
    supply: 'Oferta',
    demand: 'Demanda',
    gap: 'Brecha',
    surplus: 'Superávit',
    shortage: 'Faltante',
    balanced: 'Balanceado',

    newestUsers: 'Usuarios Más Nuevos',
    newestPosts: 'Publicaciones Más Nuevas',
    newestCrewJoins: 'Uniones Más Nuevas',
    newestHires: 'Contrataciones Más Nuevas',
    mostActiveMembers: 'Miembros Más Activos',

    role: 'Tipo de cuenta',
    trade: 'Oficio',
    city: 'Ciudad',
    zip: 'ZIP',
    radius: 'Radio',
    availability: 'Disponibilidad',
    availabilityStatus: 'Estado de Disponibilidad',
    categoryGroup: 'Clase de cuenta',
    supportType: 'Tipo de Soporte',
    serviceTags: 'Etiquetas de Servicio',
    equipmentTags: 'Etiquetas de Equipo',
    businessName: 'Nombre Comercial',
    businessAddress: 'Dirección Comercial',
    businessZip: 'ZIP Comercial',
    materialsCategories: 'Categorías de Materiales',
    storefront: 'Ubicación de tienda',
    vehicleType: 'Tipo de Vehículo',
    trailerType: 'Tipo de Remolque',
    trailerLength: 'Largo del Remolque',
    payloadCapacity: 'Capacidad de Carga',
    deliveryRadius: 'Radio de Entrega',
    contractorVerification: 'Verificación de Contratista',
    privateRating: 'Calificación Privada de Admin',
    privateNotes: 'Notas Privadas',
    followUpStatus: 'Estado de Seguimiento',
    workedWithCount: 'Cantidad de Trabajó Con',
    hiresCount: 'Cantidad de Contrataciones',
    crewsJoinedCount: 'Cuadrillas Unidas',
    noData: 'Todavía no hay datos.',
    unknown: 'Desconocido',
    unknownMember: 'Miembro Desconocido',
    available: 'Disponible',
    notAvailable: 'No Disponible',
    availableNow: 'Disponible Ahora',
    availableThisWeek: 'Disponible Esta Semana',
    busy: 'Ocupado',
    tradesGroup: 'Oficios',
    jobsiteSupportGroup: 'Soporte de Obra',
    materialDelivery: 'Entrega de Materiales / Hot Shot',
    cargoVanDelivery: 'Cargo Van / Entrega local',
    fleetRepair: 'Reparación de Equipo / Flota',
    verified: 'Verificado',
    notVerified: 'No Verificado',

    searchLabel: 'Buscar',
    searchPlaceholder: 'Busca por nombre, negocio, oficio, ciudad, ZIP, tipo de cuenta, biografía, servicio o equipo',
    tradeLabel: 'Oficio',
    allTrades: 'Todos los Oficios',
    roleLabel: 'Tipo de cuenta',
    allRoles: 'Todos los Roles',
    categoryLabel: 'Clase de cuenta',
    allCategories: 'Todas las Categorías',
    supportTypeLabel: 'Tipo de Soporte',
    allSupportTypes: 'Todos los Tipos de Soporte',
    zipLabel: 'ZIP del Trabajo',
    radiusLabel: 'Radio del Trabajo (millas)',
    availabilityLabel: 'Disponibilidad',
    availabilityAll: 'Toda Disponibilidad',
    availabilityAvailable: 'Solo Disponibles',
    availabilityUnavailable: 'Solo No Disponibles',
    availabilityStatusLabel: 'Estado de Disponibilidad',
    allAvailabilityStatuses: 'Todos los Estados de Disponibilidad',
    contractorVerificationLabel: 'Verificación de Contratista',
    verificationAll: 'Todos los Estados de Verificación',
    verificationOnlyVerified: 'Solo Verificados',
    verificationOnlyUnverified: 'Solo No Verificados',
    minCrewLabel: 'Tamaño Mínimo de Cuadrilla',
    profileCompletionLabel: 'Estado del Perfil',
    profileCompletionAll: 'Todos los Perfiles',
    profileCompletionComplete: 'Solo Completos',
    profileCompletionIncomplete: 'Solo Incompletos',

    exportFiltered: 'Exportar Resultados Filtrados',
    exportWorkers: 'Exportar Lista de Trabajadores',
    exportContractors: 'Exportar Lista de Contratistas',
    exportAvailable: 'Exportar Disponibles',
    exportByTrade: 'Exportar Oficio Seleccionado',
    exportByZip: 'Exportar ZIP Seleccionado',
    exportJobsiteSupport: 'Exportar Soporte de Obra',
    results: 'resultados',

    location: 'Ubicación',
    crewRadius: 'Cuadrilla / Radio',
    bio: 'Biografía',
    contact: 'Contacto',
    privateAdmin: 'Controles Privados de Admin',
    ratingPlaceholder: '1 a 5',
    notesPlaceholder:
      'Notas privadas sobre confiabilidad, precios, seguimiento, comunicación o historial.',
    followUpPlaceholder: 'Ejemplo: Llamar el martes, buen prospecto, necesita seguimiento',
    save: 'Guardar',
    saving: 'Guardando...',
    saved: 'Notas de admin guardadas.',
    saveError: 'No se pudo guardar la información de admin en este momento.',
    loading: 'Cargando panel de administración…',

    userCount: 'usuarios',
    workers: 'trabajadores',
    requests: 'solicitudes',
    milesAway: 'mi de distancia',
    crewSize: 'Tamaño de Cuadrilla',
    travelRadius: 'Radio de Viaje',
    openPost: 'Abrir Publicación',
    openProfile: 'Abrir Perfil',
    openStorefront: 'Abrir Tienda',
    connections: 'conexiones',
    profileStatus: 'Estado del Perfil',
    profileComplete: 'Completo',
    profileIncomplete: 'Incompleto',
    missingFields: 'Campos Faltantes',

    heroBadge: 'Admin OS',
    heroTitle: 'Dirige Surplox con más claridad.',
    heroBody:
      'Sigue la salud del marketplace, detecta faltantes, revisa la calidad de trabajadores y administra el seguimiento desde un solo centro de control.',
    filteredMembers: 'Miembros filtrados',
    networkHealth: 'Salud de la red',
    demandSignals: 'Señales de demanda'
  }
}

function haversineMiles(lat1, lon1, lat2, lon2) {
  const toRad = (x) => (x * Math.PI) / 180
  const R = 3958.8
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

function csvEscape(v) {
  const s = String(v ?? '')
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function roleLabel(role, copy) {
  if (role === 'laborer') return copy.laborers.replace(/s$/, '')
  if (role === 'subcontractor') return copy.subcontractors.replace(/s$/, '')
  if (role === 'contractor') return copy.contractors.replace(/s$/, '')
  if (role === 'supplier') return copy.suppliers.replace(/s$/, '')
  if (role === 'driver') return copy.drivers.replace(/s$/, '')
  if (role === 'mechanic') return copy.mechanics.replace(/s$/, '')
  return role || copy.unknown
}

function roleBadgeStyle(role) {
  if (role === 'contractor') return { background: '#111111', color: '#ffffff' }
  if (role === 'subcontractor') return { background: '#fff0b4', color: '#111111' }
  if (role === 'laborer') return { background: '#ecebe3', color: '#111111' }
  if (role === 'supplier') return { background: '#f1e7a8', color: '#111111' }
  if (role === 'driver') return { background: '#d8ecff', color: '#0d3f73' }
  if (role === 'mechanic') return { background: '#e8defa', color: '#4d2f82' }
  return {}
}

function availabilityBadgeStyle(isAvailable) {
  if (!isAvailable) return {}
  return { background: '#dcf4e5', color: '#177245' }
}

function availabilityStatusLabel(status, copy) {
  if (status === 'available_now') return copy.availableNow
  if (status === 'available_this_week') return copy.availableThisWeek
  if (status === 'busy') return copy.busy
  return copy.unknown
}

function categoryGroupLabel(value, copy) {
  if (value === 'jobsite_support') return copy.jobsiteSupportGroup
  return copy.tradesGroup
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

function supportTypeLabel(value, copy) {
  if (value === 'equipment_fleet_repair') return copy.fleetRepair
  if (value === 'cargo_van_delivery') return copy.cargoVanDelivery
  if (value === 'material_delivery') return copy.materialDelivery
  return copy.unknown
}


function formatList(value) {
  if (Array.isArray(value)) return value.filter(Boolean).join(', ')
  return String(value || '')
}

function formatMaterialsLabel(value) {
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

function formatDateTime(value) {
  if (!value) return ''
  return new Date(value).toLocaleString()
}

function getGapStatus(supply, demand) {
  const diff = supply - demand
  if (diff > 2) return 'surplus'
  if (diff < -2) return 'shortage'
  return 'balanced'
}

function makeCountMap(rows, keyField) {
  const map = new Map()
  ;(rows || []).forEach((row) => {
    const key = String(row?.[keyField] || '').trim()
    if (!key) return
    map.set(key, (map.get(key) || 0) + 1)
  })
  return map
}

function topEntriesFromMap(map, limit = 5) {
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
}
function getMissingProfileFields(worker, copy) {
  const missing = []
  const crewSizeOptional = ['supplier', 'driver', 'mechanic'].includes(worker.role)
  const tradeOptional = worker.role === 'supplier'

  if (!String(worker.display_name || '').trim()) missing.push('Display Name')
  if (!String(worker.role || '').trim()) missing.push(copy.role)

  if (worker.role === 'supplier') {
    if (!String(worker.business_name || '').trim()) missing.push(copy.businessName)
    if (!String(worker.business_address || '').trim()) missing.push(copy.businessAddress)
    if (!String(worker.business_zip || '').trim()) missing.push(copy.businessZip)
    if (!Array.isArray(worker.materials_categories) || worker.materials_categories.length === 0) {
      missing.push(copy.materialsCategories)
    }
    if (!Number(worker.delivery_radius || 0)) missing.push(copy.deliveryRadius)
    if (!Boolean(worker.storefront)) missing.push(copy.storefront)
    if (!String(worker.phone || '').trim()) missing.push(copy.contact === 'Contact' ? 'Phone' : 'Teléfono')
    if (!String(worker.city || '').trim()) missing.push(copy.city)
    if (!String(worker.bio || '').trim()) missing.push(copy.bio)
    return missing
  }

  if (!String(worker.first_name || '').trim()) missing.push('First Name')
  if (!String(worker.last_name || '').trim()) missing.push('Last Name')
  if (!String(worker.phone || '').trim()) missing.push(copy.contact === 'Contact' ? 'Phone' : 'Teléfono')
  if (!String(worker.city || '').trim()) missing.push(copy.city)
  if (!String(worker.bio || '').trim()) missing.push(copy.bio)
  if (!crewSizeOptional && (!Number(worker.crew_size || 0) || Number(worker.crew_size || 0) <= 1)) {
    missing.push(copy.crewSize)
  }
  if (!String(worker.home_zip || '').trim()) missing.push(copy.zip)

  if (worker.category_group === 'trade') {
    if (!tradeOptional && !worker.trade_id && !String(worker.trade_name || '').trim()) {
      missing.push(copy.trade)
    }
  }

  if (worker.category_group === 'jobsite_support') {
    if (!Array.isArray(worker.service_tags) || worker.service_tags.length === 0) missing.push(copy.serviceTags)
    if (!Array.isArray(worker.equipment_tags) || worker.equipment_tags.length === 0) missing.push(copy.equipmentTags)
  }

  return missing
}

function StatCard({ label, value, dark = false }) {
  return (
    <div
      className={dark ? 'card surface-dark rounded-xl' : 'card-soft'}
      style={{ minHeight: 116, padding: 18 }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: dark ? 'rgba(255,255,255,0.72)' : 'var(--muted-soft)'
        }}
      >
        {label}
      </div>
      <div style={{ marginTop: 10, fontSize: 30, fontWeight: 900, lineHeight: 1 }}>
        {value}
      </div>
    </div>
  )
}

function InsightList({ title, items, copy, formatter }) {
  return (
    <div className="card rounded-xl" style={{ padding: 22 }}>
      <div className="card-section-title">{title}</div>

      {items.length === 0 ? (
        <div className="card-soft" style={{ marginTop: 14 }}>
          <div className="muted">{copy.noData}</div>
        </div>
      ) : (
        <div className="list" style={{ marginTop: 14 }}>
          {items.map((item, idx) => (
            <div key={`${title}-${idx}`} className="card-soft" style={{ background: '#ffffff' }}>
              {formatter(item)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AdminDirectory() {
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [savingId, setSavingId] = useState(null)
  const [lang, setLang] = useState(localStorage.getItem('surplox_lang') || 'en')

  const [trades, setTrades] = useState([])
  const [profiles, setProfiles] = useState([])
  const [privateRows, setPrivateRows] = useState([])
  const [posts, setPosts] = useState([])
  const [comments, setComments] = useState([])
  const [crewMemberships, setCrewMemberships] = useState([])
  const [relationships, setRelationships] = useState([])
  const [zipMap, setZipMap] = useState(new Map())

  const [filters, setFilters] = useState({
    job_zip: '',
    job_radius_miles: 50,
    trade_id: '',
    role: '',
    category_group: '',
    support_type: '',
    availability_status: '',
    contractor_verified: 'all',
    min_crew_size: 1,
    availability: 'all',
    profile_completion: 'all',
    q: ''
  })

  const copy = COPY[lang] || COPY.en

  useEffect(() => {
    let alive = true

    async function load() {
      setLoading(true)
      setMsg('')

      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const uid = sessionData.session?.user?.id

        if (uid) {
          const { data: profLang } = await supabase
            .from('profiles')
            .select('preferred_language')
            .eq('user_id', uid)
            .maybeSingle()

          const userLang = profLang?.preferred_language || 'en'
          setLang(userLang)
          localStorage.setItem('surplox_lang', userLang)
        }

        const [
          tradesRes,
          profilesRes,
          privateRes,
          postsRes,
          commentsRes,
          crewRes,
          relsRes
        ] = await Promise.all([
          supabase.from('trades').select('id, name').order('name'),
          supabase
            .from('profiles')
            .select(
              'user_id, display_name, first_name, last_name, role, trade_id, home_zip, travel_radius_miles, crew_size, bio, is_available, availability_status, category_group, service_tags, equipment_tags, contractor_verified, business_name, business_address, business_zip, materials_categories, storefront, vehicle_type, trailer_type, trailer_length, payload_capacity, delivery_radius, created_at'
            )
            .order('created_at', { ascending: false }),
          supabase
            .from('contact_private')
            .select(
              'user_id, phone, email, city, admin_rating, admin_notes, admin_follow_up_status'
            ),
          supabase
            .from('posts')
            .select(
              'id, author_id, title, post_type, crew_status, trade_id, center_zip, created_at, category_group, service_tags, equipment_tags, is_urgent'
            )
            .order('created_at', { ascending: false }),
          supabase
            .from('comments')
            .select('id, author_id, post_id, created_at')
            .order('created_at', { ascending: false }),
          supabase
            .from('crew_memberships')
            .select('post_id, user_id, status, created_at')
            .order('created_at', { ascending: false }),
          supabase
            .from('user_relationships')
            .select('source_user_id, target_user_id, relationship_type, post_id, created_at')
        ])

        if (tradesRes.error) throw tradesRes.error
        if (profilesRes.error) throw profilesRes.error
        if (privateRes.error) throw privateRes.error
        if (postsRes.error) throw postsRes.error
        if (commentsRes.error) throw commentsRes.error
        if (crewRes.error) throw crewRes.error
        if (relsRes.error) throw relsRes.error

        const prows = profilesRes.data || []

        const allZips = Array.from(
          new Set([
            ...prows.map((x) => String(x.home_zip || '')).filter((z) => /^[0-9]{5}$/.test(z)),
            ...(postsRes.data || [])
              .map((x) => String(x.center_zip || ''))
              .filter((z) => /^[0-9]{5}$/.test(z))
          ])
        )

        let builtZipMap = new Map()
        if (allZips.length > 0) {
          const { data: zipRows, error: zipErr } = await supabase
            .from('zipcodes')
            .select('zip, lat, lon')
            .in('zip', allZips)

          if (zipErr) throw zipErr
          builtZipMap = new Map((zipRows || []).map((z) => [String(z.zip), z]))
        }

        if (!alive) return

        setTrades(tradesRes.data || [])
        setProfiles(prows)
        setPrivateRows(privateRes.data || [])
        setPosts(postsRes.data || [])
        setComments(commentsRes.data || [])
        setCrewMemberships(crewRes.data || [])
        setRelationships(relsRes.data || [])
        setZipMap(builtZipMap)
      } catch (e) {
        console.error(e)
        if (!alive) return
        setMsg(e?.message || copy.saveError)
      } finally {
        if (!alive) return
        setLoading(false)
      }
    }

    load()
    return () => {
      alive = false
    }
  }, [copy.saveError])

  function setF(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const tradeNameById = useMemo(() => {
    const map = new Map()
    trades.forEach((tr) => map.set(String(tr.id), tr.name))
    return map
  }, [trades])

  const privateByUser = useMemo(() => {
    const map = new Map()
    privateRows.forEach((r) => map.set(r.user_id, r))
    return map
  }, [privateRows])

  const workedWithCountByUser = useMemo(() => {
    const counts = new Map()
    relationships.forEach((rel) => {
      const source = rel.source_user_id
      const target = rel.target_user_id
      if (!source || !target) return
      counts.set(source, (counts.get(source) || 0) + 1)
      counts.set(target, (counts.get(target) || 0) + 1)
    })
    return counts
  }, [relationships])

  const hiresCountByUser = useMemo(() => {
    const counts = new Map()
    relationships
      .filter((rel) => rel.relationship_type === 'hired_from_crew_post')
      .forEach((rel) => {
        const target = rel.target_user_id
        if (!target) return
        counts.set(target, (counts.get(target) || 0) + 1)
      })
    return counts
  }, [relationships])

  const crewsJoinedCountByUser = useMemo(() => {
    const counts = new Map()
    crewMemberships.forEach((row) => {
      if (!row.user_id) return
      counts.set(row.user_id, (counts.get(row.user_id) || 0) + 1)
    })
    return counts
  }, [crewMemberships])
  const mergedWorkers = useMemo(() => {
    return profiles.map((p) => {
      const priv = privateByUser.get(p.user_id) || {}
      const trade_name = tradeNameById.get(String(p.trade_id)) || ''
      const service_tags = Array.isArray(p.service_tags) ? p.service_tags : []
      const equipment_tags = Array.isArray(p.equipment_tags) ? p.equipment_tags : []
      const category_group = p.category_group || 'trade'
      const support_type =
        category_group === 'jobsite_support' ? detectSupportType(service_tags) : null

      const baseWorker = {
        ...p,
        trade_name,
        category_group,
        service_tags,
        equipment_tags,
        support_type,
        business_name: p.business_name || '',
        business_address: p.business_address || '',
        business_zip: p.business_zip || '',
        materials_categories: Array.isArray(p.materials_categories) ? p.materials_categories : [],
        storefront: Boolean(p.storefront),
        vehicle_type: p.vehicle_type || '',
        trailer_type: p.trailer_type || '',
        trailer_length: p.trailer_length ?? '',
        payload_capacity: p.payload_capacity ?? '',
        delivery_radius: p.delivery_radius ?? '',
        phone: priv.phone || '',
        email: priv.email || '',
        city: priv.city || '',
        admin_rating: priv.admin_rating ?? '',
        admin_notes: priv.admin_notes ?? '',
        admin_follow_up_status: priv.admin_follow_up_status ?? '',
        worked_with_count: workedWithCountByUser.get(p.user_id) || 0,
        hires_count: hiresCountByUser.get(p.user_id) || 0,
        crews_joined_count: crewsJoinedCountByUser.get(p.user_id) || 0
      }

      const missing_profile_fields = getMissingProfileFields(baseWorker, copy)

      return {
        ...baseWorker,
        missing_profile_fields,
        profile_complete: missing_profile_fields.length === 0
      }
    })
  }, [
    profiles,
    privateByUser,
    tradeNameById,
    workedWithCountByUser,
    hiresCountByUser,
    crewsJoinedCountByUser,
    copy
  ])

  const filteredWorkers = useMemo(() => {
    const q = String(filters.q || '').trim().toLowerCase()
    const tradeId = String(filters.trade_id || '')
    const role = String(filters.role || '')
    const categoryGroup = String(filters.category_group || '')
    const supportType = String(filters.support_type || '')
    const availabilityStatus = String(filters.availability_status || '')
    const contractorVerified = String(filters.contractor_verified || 'all')
    const minCrew = Number(filters.min_crew_size || 1)
    const jobZip = String(filters.job_zip || '').trim()
    const jobMiles = Number(filters.job_radius_miles || 0)
    const availability = String(filters.availability || 'all')
    const profileCompletion = String(filters.profile_completion || 'all')

    const jobRow = /^[0-9]{5}$/.test(jobZip) ? zipMap.get(jobZip) : null

    return mergedWorkers
      .filter((worker) => {
        if (tradeId && String(worker.trade_id) !== tradeId) return false
        if (role && String(worker.role) !== role) return false
        if (categoryGroup && String(worker.category_group) !== categoryGroup) return false
        if (supportType && String(worker.support_type) !== supportType) return false
        if (availabilityStatus && String(worker.availability_status) !== availabilityStatus) return false

        if (contractorVerified === 'verified' && !worker.contractor_verified) return false
        if (contractorVerified === 'unverified' && worker.contractor_verified) return false

        if (!['supplier', 'driver', 'mechanic'].includes(worker.role)) {
          if (Number(worker.crew_size || 0) < minCrew) return false
        }

        if (availability === 'available' && !worker.is_available) return false
        if (availability === 'unavailable' && worker.is_available) return false

        if (profileCompletion === 'complete' && !worker.profile_complete) return false
        if (profileCompletion === 'incomplete' && worker.profile_complete) return false

        if (q) {
          const haystack = [
            worker.display_name,
            worker.city,
            worker.home_zip,
            worker.trade_name,
            worker.bio,
          worker.business_name,
          worker.business_address,
          worker.business_zip,
          worker.vehicle_type,
          worker.trailer_type,
          Array.isArray(worker.materials_categories) ? worker.materials_categories.join(' ') : '',
            worker.role,
            worker.category_group,
            worker.support_type,
            ...(worker.service_tags || []),
            ...(worker.equipment_tags || [])
          ]
            .join(' ')
            .toLowerCase()

          if (!haystack.includes(q)) return false
        }

        if (/^[0-9]{5}$/.test(jobZip) && jobRow?.lat && jobRow?.lon) {
          const homeZip = String(worker.home_zip || '')
          const homeRow = zipMap.get(homeZip)
          if (!homeRow?.lat || !homeRow?.lon) return false

          const dist = haversineMiles(
            Number(jobRow.lat),
            Number(jobRow.lon),
            Number(homeRow.lat),
            Number(homeRow.lon)
          )

          if (dist > jobMiles) return false
        }

        return true
      })
      .map((worker) => {
        const jobZip2 = String(filters.job_zip || '').trim()
        const jobRow2 = /^[0-9]{5}$/.test(jobZip2) ? zipMap.get(jobZip2) : null
        let distance_miles = null

        if (jobRow2?.lat && jobRow2?.lon) {
          const homeRow = zipMap.get(String(worker.home_zip || ''))
          if (homeRow?.lat && homeRow?.lon) {
            distance_miles = haversineMiles(
              Number(jobRow2.lat),
              Number(jobRow2.lon),
              Number(homeRow.lat),
              Number(homeRow.lon)
            )
          }
        }

        return { ...worker, distance_miles }
      })
      .sort((a, b) => {
        const ad = a.distance_miles
        const bd = b.distance_miles
        if (typeof ad === 'number' && typeof bd === 'number') return ad - bd
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
  }, [mergedWorkers, filters, zipMap])

  const analytics = useMemo(() => {
    const totalUsers = profiles.length
    const laborers = profiles.filter((p) => p.role === 'laborer').length
    const subcontractors = profiles.filter((p) => p.role === 'subcontractor').length
    const contractors = profiles.filter((p) => p.role === 'contractor').length
    const suppliers = profiles.filter((p) => p.role === 'supplier').length
    const drivers = profiles.filter((p) => p.role === 'driver').length
    const mechanics = profiles.filter((p) => p.role === 'mechanic').length
    const availableWorkers = profiles.filter((p) => p.is_available).length
    const tradeUsers = profiles.filter((p) => (p.category_group || 'trade') === 'trade').length
    const jobsiteSupportUsers = profiles.filter(
      (p) => (p.category_group || 'trade') === 'jobsite_support'
    ).length
    const verifiedContractors = profiles.filter((p) => p.contractor_verified).length

    const totalPosts = posts.length
    const needCrewPosts = posts.filter((p) => p.post_type === 'need_crew').length
    const lookingForWorkPosts = posts.filter((p) => p.post_type === 'looking_for_work').length
    const discussions = posts.filter((p) => p.post_type === 'discussion').length
    const urgentPosts = posts.filter((p) => p.is_urgent).length
    const openCrewPosts = posts.filter(
      (p) => p.post_type === 'need_crew' && (p.crew_status || 'open') === 'open'
    ).length
    const fullCrewPosts = posts.filter(
      (p) => p.post_type === 'need_crew' && p.crew_status === 'full'
    ).length
    const closedCrewPosts = posts.filter(
      (p) => p.post_type === 'need_crew' && p.crew_status === 'closed'
    ).length

    const totalComments = comments.length
    const crewJoins = crewMemberships.length
    const hires = crewMemberships.filter((m) => m.status === 'hired').length
    const completedProfiles = mergedWorkers.filter((w) => w.profile_complete).length
    const incompleteProfiles = mergedWorkers.filter((w) => !w.profile_complete).length

    return {
      totalUsers,
      laborers,
      subcontractors,
      contractors,
      suppliers,
      drivers,
      mechanics,
      availableWorkers,
      totalPosts,
      needCrewPosts,
      lookingForWorkPosts,
      discussions,
      urgentPosts,
      crewJoins,
      hires,
      openCrewPosts,
      fullCrewPosts,
      closedCrewPosts,
      totalComments,
      completedProfiles,
      incompleteProfiles,
      tradeUsers,
      jobsiteSupportUsers,
      verifiedContractors
    }
  }, [profiles, posts, comments, crewMemberships, mergedWorkers])

  const marketIntel = useMemo(() => {
    const usersByTradeMap = new Map()
    profiles.forEach((p) => {
      const categoryGroup = p.category_group || 'trade'

      if (categoryGroup === 'jobsite_support') {
        const supportType = detectSupportType(Array.isArray(p.service_tags) ? p.service_tags : [])
        const label =
          supportType === 'equipment_fleet_repair'
            ? copy.fleetRepair
            : supportType === 'cargo_van_delivery'
              ? copy.cargoVanDelivery
              : copy.materialDelivery
        usersByTradeMap.set(label, (usersByTradeMap.get(label) || 0) + 1)
      } else {
        const tradeName = tradeNameById.get(String(p.trade_id)) || copy.unknown
        usersByTradeMap.set(tradeName, (usersByTradeMap.get(tradeName) || 0) + 1)
      }
    })

    const demandByTradeMap = new Map()
    posts
      .filter((p) => p.post_type === 'need_crew' || (p.category_group || 'trade') === 'jobsite_support')
      .forEach((p) => {
        const categoryGroup = p.category_group || 'trade'
        let label = copy.unknown

        if (categoryGroup === 'jobsite_support') {
          const supportType = detectSupportType(Array.isArray(p.service_tags) ? p.service_tags : [])
          label =
            supportType === 'equipment_fleet_repair'
              ? copy.fleetRepair
              : supportType === 'cargo_van_delivery'
                ? copy.cargoVanDelivery
                : copy.materialDelivery
        } else {
          label = tradeNameById.get(String(p.trade_id)) || copy.unknown
        }

        demandByTradeMap.set(label, (demandByTradeMap.get(label) || 0) + 1)
      })

    const workersByZipMap = makeCountMap(profiles, 'home_zip')
    const crewRequestsByZipMap = makeCountMap(
      posts.filter((p) => p.post_type === 'need_crew'),
      'center_zip'
    )

    const gapRows = Array.from(
      new Set([...Array.from(usersByTradeMap.keys()), ...Array.from(demandByTradeMap.keys())])
    )
      .map((tradeName) => {
        const supply = usersByTradeMap.get(tradeName) || 0
        const demand = demandByTradeMap.get(tradeName) || 0
        const status = getGapStatus(supply, demand)
        return {
          tradeName,
          supply,
          demand,
          gap: supply - demand,
          status
        }
      })
      .sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap))
      .slice(0, 8)

    return {
      topTradesByUsers: topEntriesFromMap(usersByTradeMap, 5),
      topTradesByDemand: topEntriesFromMap(demandByTradeMap, 5),
      topZipsByWorkers: topEntriesFromMap(workersByZipMap, 5),
      topZipsByCrewRequests: topEntriesFromMap(crewRequestsByZipMap, 5),
      gapRows
    }
  }, [profiles, posts, tradeNameById, copy.unknown, copy.fleetRepair, copy.cargoVanDelivery, copy.materialDelivery])
  const activity = useMemo(() => {
    const newestUsers = profiles
      .slice()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)

    const newestPosts = posts
      .slice()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)

    const postTitleById = new Map(posts.map((p) => [String(p.id), p.title]))
    const profileById = new Map(profiles.map((p) => [p.user_id, p]))

    const newestCrewJoins = crewMemberships
      .slice()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map((row) => ({
        ...row,
        user_name: profileById.get(row.user_id)?.display_name || copy.unknownMember,
        post_title: postTitleById.get(String(row.post_id)) || copy.unknown
      }))

    const newestHires = crewMemberships
      .filter((row) => row.status === 'hired')
      .slice()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map((row) => ({
        ...row,
        user_name: profileById.get(row.user_id)?.display_name || copy.unknownMember,
        post_title: postTitleById.get(String(row.post_id)) || copy.unknown
      }))

    const activityMap = new Map()
    profiles.forEach((p) => activityMap.set(p.user_id, 0))
    posts.forEach((p) => activityMap.set(p.author_id, (activityMap.get(p.author_id) || 0) + 1))
    comments.forEach((c) =>
      activityMap.set(c.author_id, (activityMap.get(c.author_id) || 0) + 1)
    )
    crewMemberships.forEach((m) =>
      activityMap.set(m.user_id, (activityMap.get(m.user_id) || 0) + 1)
    )

    const mostActiveMembers = Array.from(activityMap.entries())
      .map(([userId, score]) => ({
        user_id: userId,
        score,
        display_name: profileById.get(userId)?.display_name || copy.unknownMember,
        role: profileById.get(userId)?.role || ''
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)

    return {
      newestUsers,
      newestPosts,
      newestCrewJoins,
      newestHires,
      mostActiveMembers
    }
  }, [profiles, posts, comments, crewMemberships, copy.unknownMember, copy.unknown])

  function exportRowsToCsv(filename, rows) {
    if (!rows.length) return

    const header = Object.keys(rows[0])
    const csv = [header, ...rows.map((r) => header.map((k) => csvEscape(r[k])))]
      .map((line) => line.join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  function makeWorkerExportRows(sourceRows) {
    return sourceRows.map((r) => ({
      display_name: r.display_name || '',
      role: r.role || '',
      category_group: r.category_group || '',
      support_type: r.support_type || '',
      trade: r.trade_name || '',
      service_tags: (r.service_tags || []).join(' | '),
      equipment_tags: (r.equipment_tags || []).join(' | '),
      city: r.city || '',
      zip: r.home_zip || '',
      travel_radius_miles: r.travel_radius_miles || '',
      crew_size: r.crew_size || '',
      is_available: r.is_available ? 'yes' : 'no',
      availability_status: r.availability_status || '',
      contractor_verified: r.contractor_verified ? 'yes' : 'no',
      phone: r.phone || '',
      email: r.email || '',
      admin_rating: r.admin_rating || '',
      admin_follow_up_status: r.admin_follow_up_status || '',
      admin_notes: r.admin_notes || '',
      worked_with_count: r.worked_with_count || 0,
      hires_count: r.hires_count || 0,
      crews_joined_count: r.crews_joined_count || 0,
      profile_complete: r.profile_complete ? 'yes' : 'no',
      missing_profile_fields: (r.missing_profile_fields || []).join(' | ')
    }))
  }

  function exportFiltered() {
    exportRowsToCsv(
      'surplox_admin_filtered_results.csv',
      makeWorkerExportRows(filteredWorkers)
    )
  }

  function exportWorkers() {
    exportRowsToCsv(
      'surplox_worker_list.csv',
      makeWorkerExportRows(
        mergedWorkers.filter((w) => w.role === 'laborer' || w.role === 'subcontractor')
      )
    )
  }

  function exportContractors() {
    exportRowsToCsv(
      'surplox_contractor_list.csv',
      makeWorkerExportRows(mergedWorkers.filter((w) => w.role === 'contractor'))
    )
  }

  function exportAvailable() {
    exportRowsToCsv(
      'surplox_available_workers.csv',
      makeWorkerExportRows(mergedWorkers.filter((w) => w.is_available))
    )
  }

  function exportByTrade() {
    const tradeId = String(filters.trade_id || '')
    exportRowsToCsv(
      'surplox_selected_trade.csv',
      makeWorkerExportRows(
        mergedWorkers.filter((w) => !tradeId || String(w.trade_id) === tradeId)
      )
    )
  }

  function exportByZip() {
    const zip = String(filters.job_zip || '').trim()
    exportRowsToCsv(
      'surplox_selected_zip.csv',
      makeWorkerExportRows(
        mergedWorkers.filter((w) => !zip || String(w.home_zip || '') === zip)
      )
    )
  }

  function exportJobsiteSupport() {
    exportRowsToCsv(
      'surplox_jobsite_support.csv',
      makeWorkerExportRows(
        mergedWorkers.filter((w) => (w.category_group || 'trade') === 'jobsite_support')
      )
    )
  }

  async function saveAdminData(worker) {
    const ratingValue = String(worker.admin_rating ?? '').trim()
    const numericRating = ratingValue === '' ? null : Number(ratingValue)

    if (
      numericRating !== null &&
      (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5)
    ) {
      setMsg(
        lang === 'es'
          ? 'La calificación debe ser entre 1 y 5.'
          : 'Rating must be between 1 and 5.'
      )
      return
    }

    try {
      setSavingId(worker.user_id)
      setMsg('')

      const payload = {
        user_id: worker.user_id,
        phone: worker.phone || null,
        email: worker.email || null,
        city: worker.city || null,
        admin_rating: numericRating,
        admin_notes: String(worker.admin_notes || '').trim() || null,
        admin_follow_up_status: String(worker.admin_follow_up_status || '').trim() || null
      }

      const { error } = await supabase.from('contact_private').upsert(payload)
      if (error) throw error

      setPrivateRows((prev) => {
        const next = [...prev]
        const idx = next.findIndex((r) => r.user_id === worker.user_id)
        if (idx >= 0) next[idx] = { ...next[idx], ...payload }
        else next.push(payload)
        return next
      })

      setMsg(copy.saved)
    } catch (err) {
      console.error(err)
      setMsg(err.message || copy.saveError)
    } finally {
      setSavingId(null)
    }
  }

  if (loading) return <div className="card">{copy.loading}</div>

  return (
    <div className="grid" style={{ gap: 18 }}>
      {msg ? (
        <div className="card-message" style={{ padding: 14, borderRadius: 18 }}>
          {msg}
        </div>
      ) : null}

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

        <div className="h1" style={{ maxWidth: 860 }}>
          {copy.heroTitle}
        </div>

        <p className="muted" style={{ marginTop: 12, maxWidth: 900, fontSize: 17, lineHeight: 1.7 }}>
          {copy.heroBody}
        </p>

        <div className="grid two" style={{ marginTop: 18 }}>
          <StatCard label={copy.filteredMembers} value={filteredWorkers.length} dark />
          <StatCard label={copy.networkHealth} value={analytics.totalUsers} />
          <StatCard label={copy.demandSignals} value={analytics.needCrewPosts + analytics.urgentPosts} />
        </div>
      </div>

      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="h1" style={{ fontSize: 'clamp(1.9rem, 4vw, 2.7rem)' }}>
          {copy.pageTitle}
        </div>
        <p className="muted" style={{ marginTop: 10 }}>
          {copy.pageIntro}
        </p>
      </div>

      <div className="card rounded-xl" style={{ padding: 22, marginTop: 18 }}>
        <div className="card-section-title">Contractor Tools (Admin Only)</div>
        <p className="muted" style={{ marginTop: 6 }}>
          Internal tools to run Capitol Building Group operations directly inside Surplox.
        </p>

        <div className="grid three" style={{ marginTop: 14 }}>
          <Link to="/admin/crm" className="card-soft" style={{ textDecoration: 'none' }}>
            <div className="card-section-title">CRM</div>
            <div className="muted" style={{ marginTop: 6 }}>
              Manage leads, clients, and relationships.
            </div>
          </Link>

          <Link to="/admin/invoices" className="card-soft" style={{ textDecoration: 'none' }}>
            <div className="card-section-title">Invoices & Estimates</div>
            <div className="muted" style={{ marginTop: 6 }}>
              Create estimates, send invoices, and track payments.
            </div>
          </Link>

          <Link to="/admin/timeclock" className="card-soft" style={{ textDecoration: 'none' }}>
            <div className="card-section-title">Time Clock</div>
            <div className="muted" style={{ marginTop: 6 }}>
              Track worker hours with clock in / clock out.
            </div>
          </Link>
        </div>
      </div>

      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="card-section-title">{copy.analyticsTitle}</div>
        <div className="grid two" style={{ marginTop: 14 }}>
          <StatCard label={copy.totalUsers} value={analytics.totalUsers} dark />
          <StatCard label={copy.laborers} value={analytics.laborers} />
          <StatCard label={copy.subcontractors} value={analytics.subcontractors} />
          <StatCard label={copy.contractors} value={analytics.contractors} />
          <StatCard label={copy.suppliers} value={analytics.suppliers} />
          <StatCard label={copy.drivers} value={analytics.drivers} />
          <StatCard label={copy.mechanics} value={analytics.mechanics} />
          <StatCard label={copy.availableWorkers} value={analytics.availableWorkers} />
          <StatCard label={copy.tradeUsers} value={analytics.tradeUsers} />
          <StatCard label={copy.jobsiteSupportUsers} value={analytics.jobsiteSupportUsers} />
          <StatCard label={copy.totalPosts} value={analytics.totalPosts} />
          <StatCard label={copy.needCrewPosts} value={analytics.needCrewPosts} />
          <StatCard label={copy.lookingForWorkPosts} value={analytics.lookingForWorkPosts} />
          <StatCard label={copy.discussions} value={analytics.discussions} />
          <StatCard label={copy.urgentPosts} value={analytics.urgentPosts} />
          <StatCard label={copy.verifiedContractors} value={analytics.verifiedContractors} />
          <StatCard label={copy.crewJoins} value={analytics.crewJoins} />
          <StatCard label={copy.hires} value={analytics.hires} />
          <StatCard label={copy.openCrewPosts} value={analytics.openCrewPosts} />
          <StatCard label={copy.fullCrewPosts} value={analytics.fullCrewPosts} />
          <StatCard label={copy.closedCrewPosts} value={analytics.closedCrewPosts} />
          <StatCard label={copy.totalComments} value={analytics.totalComments} />
          <StatCard label={copy.completedProfiles} value={analytics.completedProfiles} />
          <StatCard label={copy.incompleteProfiles} value={analytics.incompleteProfiles} />
        </div>
      </div>

      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="card-section-title">{copy.filtersTitle}</div>
        <p className="card-section-subtitle" style={{ marginTop: 8 }}>
          {copy.filtersIntro}
        </p>

        <div className="grid two" style={{ marginTop: 14 }}>
          <div>
            <div className="muted" style={{ marginBottom: 6 }}>{copy.searchLabel}</div>
            <input
              className="input"
              value={filters.q}
              onChange={(e) => setF('q', e.target.value)}
              placeholder={copy.searchPlaceholder}
            />
          </div>

          <div>
            <div className="muted" style={{ marginBottom: 6 }}>{copy.tradeLabel}</div>
            <select
              className="input"
              value={filters.trade_id}
              onChange={(e) => setF('trade_id', e.target.value)}
            >
              <option value="">{copy.allTrades}</option>
              {trades.map((trade) => (
                <option key={trade.id} value={trade.id}>
                  {trade.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="muted" style={{ marginBottom: 6 }}>{copy.roleLabel}</div>
            <select
              className="input"
              value={filters.role}
              onChange={(e) => setF('role', e.target.value)}
            >
              <option value="">{copy.allRoles}</option>
              <option value="laborer">{copy.laborers}</option>
              <option value="subcontractor">{copy.subcontractors}</option>
              <option value="contractor">{copy.contractors}</option>
              <option value="supplier">{copy.suppliers}</option>
              <option value="driver">{copy.drivers}</option>
              <option value="mechanic">{copy.mechanics}</option>
            </select>
          </div>

          <div>
            <div className="muted" style={{ marginBottom: 6 }}>{copy.categoryLabel}</div>
            <select
              className="input"
              value={filters.category_group}
              onChange={(e) => setF('category_group', e.target.value)}
            >
              <option value="">{copy.allCategories}</option>
              <option value="trade">{copy.tradesGroup}</option>
              <option value="jobsite_support">{copy.jobsiteSupportGroup}</option>
            </select>
          </div>

          <div>
            <div className="muted" style={{ marginBottom: 6 }}>{copy.supportTypeLabel}</div>
            <select
              className="input"
              value={filters.support_type}
              onChange={(e) => setF('support_type', e.target.value)}
            >
              <option value="">{copy.allSupportTypes}</option>
              <option value="material_delivery">{copy.materialDelivery}</option>
              <option value="cargo_van_delivery">{copy.cargoVanDelivery}</option>
              <option value="equipment_fleet_repair">{copy.fleetRepair}</option>
            </select>
          </div>

          <div>
            <div className="muted" style={{ marginBottom: 6 }}>{copy.zipLabel}</div>
            <input
              className="input"
              value={filters.job_zip}
              onChange={(e) => setF('job_zip', e.target.value)}
              placeholder="76102"
            />
          </div>

          <div>
            <div className="muted" style={{ marginBottom: 6 }}>{copy.radiusLabel}</div>
            <input
              className="input"
              type="number"
              value={filters.job_radius_miles}
              onChange={(e) => setF('job_radius_miles', e.target.value)}
            />
          </div>

          <div>
            <div className="muted" style={{ marginBottom: 6 }}>{copy.minCrewLabel}</div>
            <input
              className="input"
              type="number"
              value={filters.min_crew_size}
              onChange={(e) => setF('min_crew_size', e.target.value)}
            />
          </div>

          <div>
            <div className="muted" style={{ marginBottom: 6 }}>{copy.availabilityLabel}</div>
            <select
              className="input"
              value={filters.availability}
              onChange={(e) => setF('availability', e.target.value)}
            >
              <option value="all">{copy.availabilityAll}</option>
              <option value="available">{copy.availabilityAvailable}</option>
              <option value="unavailable">{copy.availabilityUnavailable}</option>
            </select>
          </div>

          <div>
            <div className="muted" style={{ marginBottom: 6 }}>{copy.availabilityStatusLabel}</div>
            <select
              className="input"
              value={filters.availability_status}
              onChange={(e) => setF('availability_status', e.target.value)}
            >
              <option value="">{copy.allAvailabilityStatuses}</option>
              <option value="available_now">{copy.availableNow}</option>
              <option value="available_this_week">{copy.availableThisWeek}</option>
              <option value="busy">{copy.busy}</option>
            </select>
          </div>

          <div>
            <div className="muted" style={{ marginBottom: 6 }}>{copy.contractorVerificationLabel}</div>
            <select
              className="input"
              value={filters.contractor_verified}
              onChange={(e) => setF('contractor_verified', e.target.value)}
            >
              <option value="all">{copy.verificationAll}</option>
              <option value="verified">{copy.verificationOnlyVerified}</option>
              <option value="unverified">{copy.verificationOnlyUnverified}</option>
            </select>
          </div>

          <div>
            <div className="muted" style={{ marginBottom: 6 }}>{copy.profileCompletionLabel}</div>
            <select
              className="input"
              value={filters.profile_completion}
              onChange={(e) => setF('profile_completion', e.target.value)}
            >
              <option value="all">{copy.profileCompletionAll}</option>
              <option value="complete">{copy.profileCompletionComplete}</option>
              <option value="incomplete">{copy.profileCompletionIncomplete}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="card-section-title">{copy.exportTitle}</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
          <button className="btn primary" onClick={exportFiltered}>
            {copy.exportFiltered}
          </button>
          <button className="btn" onClick={exportWorkers}>
            {copy.exportWorkers}
          </button>
          <button className="btn" onClick={exportContractors}>
            {copy.exportContractors}
          </button>
          <button className="btn" onClick={exportAvailable}>
            {copy.exportAvailable}
          </button>
          <button className="btn" onClick={exportByTrade}>
            {copy.exportByTrade}
          </button>
          <button className="btn" onClick={exportByZip}>
            {copy.exportByZip}
          </button>
          <button className="btn" onClick={exportJobsiteSupport}>
            {copy.exportJobsiteSupport}
          </button>
        </div>
      </div>

      <div className="grid two">
        <InsightList
          title={copy.topTradesByUsers}
          items={marketIntel.topTradesByUsers}
          copy={copy}
          formatter={(item) => (
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ fontWeight: 800 }}>{item[0]}</div>
              <div className="badge">{item[1]} {copy.userCount}</div>
            </div>
          )}
        />

        <InsightList
          title={copy.topTradesByDemand}
          items={marketIntel.topTradesByDemand}
          copy={copy}
          formatter={(item) => (
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ fontWeight: 800 }}>{item[0]}</div>
              <div className="badge">{item[1]} {copy.requests}</div>
            </div>
          )}
        />

        <InsightList
          title={copy.topZipsByWorkers}
          items={marketIntel.topZipsByWorkers}
          copy={copy}
          formatter={(item) => (
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ fontWeight: 800 }}>{item[0]}</div>
              <div className="badge">{item[1]} {copy.workers}</div>
            </div>
          )}
        />

        <InsightList
          title={copy.topZipsByCrewRequests}
          items={marketIntel.topZipsByCrewRequests}
          copy={copy}
          formatter={(item) => (
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ fontWeight: 800 }}>{item[0]}</div>
              <div className="badge">{item[1]} {copy.requests}</div>
            </div>
          )}
        />
      </div>

      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="card-section-title">{copy.marketGapFinder}</div>

        {marketIntel.gapRows.length === 0 ? (
          <div className="card-soft" style={{ marginTop: 14 }}>
            <div className="muted">{copy.noData}</div>
          </div>
        ) : (
          <div className="list" style={{ marginTop: 14 }}>
            {marketIntel.gapRows.map((row) => {
              const badgeStyle =
                row.status === 'surplus'
                  ? { background: '#dcf4e5', color: '#177245' }
                  : row.status === 'shortage'
                    ? { background: '#fff0b4', color: '#111111' }
                    : { background: '#ecebe3', color: '#111111' }

              return (
                <div key={row.tradeName} className="card-soft" style={{ background: '#ffffff' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 12,
                      flexWrap: 'wrap',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ fontWeight: 900, fontSize: 18 }}>{row.tradeName}</div>
                    <span className="badge" style={badgeStyle}>
                      {copy[row.status]}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                    <span className="badge">{copy.supply}: {row.supply}</span>
                    <span className="badge">{copy.demand}: {row.demand}</span>
                    <span className="badge">{copy.gap}: {row.gap}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="grid two">
        <InsightList
          title={copy.newestUsers}
          items={activity.newestUsers}
          copy={copy}
          formatter={(user) => {
            const categoryGroup = user.category_group || 'trade'
            const supportType =
              categoryGroup === 'jobsite_support'
                ? detectSupportType(Array.isArray(user.service_tags) ? user.service_tags : [])
                : null

            return (
              <div>
                <div className="postMeta">
                  <span className="badge" style={roleBadgeStyle(user.role)}>
                    {roleLabel(user.role, copy)}
                  </span>
                  <span className="badge">{categoryGroupLabel(categoryGroup, copy)}</span>
                  {supportType ? <span className="badge">{supportTypeLabel(supportType, copy)}</span> : null}
                  <span>{formatDateTime(user.created_at)}</span>
                </div>
                <div style={{ marginTop: 10, fontWeight: 900 }}>
                  {user.display_name || copy.unknownMember}
                </div>
              </div>
            )
          }}
        />

        <InsightList
          title={copy.newestPosts}
          items={activity.newestPosts}
          copy={copy}
          formatter={(post) => {
            const categoryGroup = post.category_group || 'trade'
            const supportType =
              categoryGroup === 'jobsite_support'
                ? detectSupportType(Array.isArray(post.service_tags) ? post.service_tags : [])
                : null

            return (
              <div>
                <div className="postMeta">
                  <span className="badge">{post.post_type}</span>
                  <span className="badge">{categoryGroupLabel(categoryGroup, copy)}</span>
                  {supportType ? <span className="badge">{supportTypeLabel(supportType, copy)}</span> : null}
                  {post.is_urgent ? (
                    <span className="badge" style={{ background: '#111111', color: '#ffffff' }}>
                      Urgent
                    </span>
                  ) : null}
                  <span>{formatDateTime(post.created_at)}</span>
                </div>
                <div style={{ marginTop: 10, fontWeight: 900 }}>{post.title || copy.unknown}</div>
                <div style={{ marginTop: 10 }}>
                  <Link className="btn small" to={`/p/${post.id}`}>
                    {copy.openPost}
                  </Link>
                </div>
              </div>
            )
          }}
        />

        <InsightList
          title={copy.newestCrewJoins}
          items={activity.newestCrewJoins}
          copy={copy}
          formatter={(row) => (
            <div>
              <div style={{ fontWeight: 900 }}>{row.user_name}</div>
              <div className="muted" style={{ marginTop: 8 }}>{row.post_title}</div>
              <div className="postMeta" style={{ marginTop: 8 }}>
                <span>{formatDateTime(row.created_at)}</span>
              </div>
            </div>
          )}
        />

        <InsightList
          title={copy.newestHires}
          items={activity.newestHires}
          copy={copy}
          formatter={(row) => (
            <div>
              <div style={{ fontWeight: 900 }}>{row.user_name}</div>
              <div className="muted" style={{ marginTop: 8 }}>{row.post_title}</div>
              <div className="postMeta" style={{ marginTop: 8 }}>
                <span>{formatDateTime(row.created_at)}</span>
              </div>
            </div>
          )}
        />

        <InsightList
          title={copy.mostActiveMembers}
          items={activity.mostActiveMembers}
          copy={copy}
          formatter={(member) => (
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
                <div style={{ fontWeight: 900 }}>{member.display_name}</div>
                <div className="postMeta" style={{ marginTop: 8 }}>
                  <span className="badge" style={roleBadgeStyle(member.role)}>
                    {roleLabel(member.role, copy)}
                  </span>
                </div>
              </div>
              <span className="badge">{member.score} pts</span>
            </div>
          )}
        />
      </div>

      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="card-section-title">
          {copy.workerIntelTitle} · {filteredWorkers.length} {copy.results}
        </div>
        <p className="card-section-subtitle" style={{ marginTop: 8 }}>
          Review filtered members, profile completion, service tags, availability, verification, and private admin notes.
        </p>

        {filteredWorkers.length === 0 ? (
          <div className="card-soft" style={{ marginTop: 14 }}>
            <div className="card-section-title">{copy.noData}</div>
          </div>
        ) : (
          <div className="list" style={{ marginTop: 14 }}>
            {filteredWorkers.map((worker) => (
              <div key={worker.user_id} className="card rounded-xl" style={{ padding: 22 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 14,
                    flexWrap: 'wrap',
                    alignItems: 'flex-start'
                  }}
                >
                  <div style={{ flex: '1 1 420px' }}>
                    <div className="postMeta">
                      <span className="badge" style={roleBadgeStyle(worker.role)}>
                        {roleLabel(worker.role, copy)}
                      </span>

                      <span className="badge">
                        {categoryGroupLabel(worker.category_group || 'trade', copy)}
                      </span>

                      {worker.trade_name ? (
                        <span className="badge">{worker.trade_name}</span>
                      ) : null}

                      {worker.support_type ? (
                        <span className="badge">{supportTypeLabel(worker.support_type, copy)}</span>
                      ) : null}

                      {worker.is_available ? (
                        <span className="badge" style={availabilityBadgeStyle(true)}>
                          {availabilityStatusLabel(worker.availability_status, copy)}
                        </span>
                      ) : (
                        <span className="badge">{copy.notAvailable}</span>
                      )}

                      <span
                        className="badge"
                        style={
                          worker.profile_complete
                            ? { background: '#dcf4e5', color: '#177245' }
                            : { background: '#fff0b4', color: '#111111' }
                        }
                      >
                        {worker.profile_complete ? copy.profileComplete : copy.profileIncomplete}
                      </span>

                      <span
                        className="badge"
                        style={
                          worker.contractor_verified
                            ? { background: '#111111', color: '#ffffff' }
                            : {}
                        }
                      >
                        {worker.contractor_verified ? copy.verified : copy.notVerified}
                      </span>
                    </div>

                    <div style={{ marginTop: 12, fontSize: 24, fontWeight: 900, lineHeight: 1.1 }}>
                      {worker.display_name || copy.unknownMember}
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                      {worker.city ? <span className="badge">{copy.city}: {worker.city}</span> : null}
                      {worker.home_zip ? <span className="badge">{copy.zip}: {worker.home_zip}</span> : null}
                      <span className="badge">{copy.travelRadius}: {worker.travel_radius_miles || 0}</span>
                      <span className="badge">{copy.crewSize}: {worker.crew_size || 0}</span>
                      {typeof worker.distance_miles === 'number' ? (
                        <span className="badge">
                          {worker.distance_miles.toFixed(1)} {copy.milesAway}
                        </span>
                      ) : null}
                      <span className="badge">
                        {copy.workedWithCount}: {worker.worked_with_count || 0}
                      </span>
                      <span className="badge">
                        {copy.hiresCount}: {worker.hires_count || 0}
                      </span>
                      <span className="badge">
                        {copy.crewsJoinedCount}: {worker.crews_joined_count || 0}
                      </span>
                    </div>

                    {worker.service_tags?.length > 0 ? (
                      <div style={{ marginTop: 12 }}>
                        <div className="muted" style={{ marginBottom: 6 }}>{copy.serviceTags}</div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {worker.service_tags.map((tag) => (
                            <span key={`${worker.user_id}-service-${tag}`} className="badge">{tag}</span>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {worker.equipment_tags?.length > 0 ? (
                      <div style={{ marginTop: 12 }}>
                        <div className="muted" style={{ marginBottom: 6 }}>{copy.equipmentTags}</div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {worker.equipment_tags.map((tag) => (
                            <span key={`${worker.user_id}-equipment-${tag}`} className="badge">{tag}</span>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {worker.role === 'supplier' ? (
                      <div className="card-soft" style={{ marginTop: 14, background: '#fffaf0' }}>
                        <div className="card-section-title" style={{ fontSize: 15 }}>
                          {copy.businessName}
                        </div>

                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                          {worker.business_name ? <span className="badge">{worker.business_name}</span> : null}
                          {worker.business_zip ? <span className="badge">{copy.businessZip}: {worker.business_zip}</span> : null}
                          {Number(worker.delivery_radius || 0) > 0 ? (
                            <span className="badge">{copy.deliveryRadius}: {worker.delivery_radius}</span>
                          ) : null}
                          <span
                            className="badge"
                            style={worker.storefront ? { background: '#dcf4e5', color: '#177245' } : {}}
                          >
                            {worker.storefront ? copy.storefront : copy.notAvailable}
                          </span>
                        </div>

                        {worker.business_address ? (
                          <div style={{ marginTop: 10, lineHeight: 1.7 }}>
                            {worker.business_address}
                          </div>
                        ) : null}

                        {worker.materials_categories?.length > 0 ? (
                          <div style={{ marginTop: 12 }}>
                            <div className="muted" style={{ marginBottom: 6 }}>{copy.materialsCategories}</div>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              {worker.materials_categories.map((tag) => (
                                <span key={`${worker.user_id}-material-${tag}`} className="badge">
                                  {formatMaterialsLabel(tag)}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    {worker.bio ? (
                      <div style={{ marginTop: 14, lineHeight: 1.7 }}>
                        {worker.bio}
                      </div>
                    ) : null}

                    {!worker.profile_complete ? (
                      <div className="card-soft" style={{ marginTop: 14, background: '#fffaf0' }}>
                        <div className="card-section-title" style={{ fontSize: 15 }}>
                          {copy.missingFields}
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                          {worker.missing_profile_fields.map((field) => (
                            <span key={field} className="badge">
                              {field}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
                      <Link className="btn small primary" to={`/u/${worker.user_id}`}>
                        {copy.openProfile}
                      </Link>
                      {worker.role === 'supplier' ? (
                        <Link className="btn small" to={`/supplier/${worker.user_id}`}>
                          {copy.openStorefront}
                        </Link>
                      ) : null}
                    </div>
                  </div>

                  <div style={{ flex: '1 1 340px', minWidth: 300 }}>
                    <div className="card-soft" style={{ background: '#f8f8f4' }}>
                      <div className="card-section-title" style={{ fontSize: 16 }}>
                        {copy.privateAdmin}
                      </div>

                      <div className="grid" style={{ gap: 12, marginTop: 12 }}>
                        <div>
                          <div className="muted" style={{ marginBottom: 6 }}>{copy.privateRating}</div>
                          <input
                            className="input"
                            value={worker.admin_rating ?? ''}
                            placeholder={copy.ratingPlaceholder}
                            onChange={(e) => {
                              const value = e.target.value
                              setPrivateRows((prev) => {
                                const next = [...prev]
                                const idx = next.findIndex((r) => r.user_id === worker.user_id)
                                if (idx >= 0) next[idx] = { ...next[idx], admin_rating: value }
                                else {
                                  next.push({
                                    user_id: worker.user_id,
                                    phone: worker.phone || '',
                                    email: worker.email || '',
                                    city: worker.city || '',
                                    admin_rating: value,
                                    admin_notes: worker.admin_notes || '',
                                    admin_follow_up_status: worker.admin_follow_up_status || ''
                                  })
                                }
                                return next
                              })
                            }}
                          />
                        </div>

                        <div>
                          <div className="muted" style={{ marginBottom: 6 }}>{copy.followUpStatus}</div>
                          <input
                            className="input"
                            value={worker.admin_follow_up_status ?? ''}
                            placeholder={copy.followUpPlaceholder}
                            onChange={(e) => {
                              const value = e.target.value
                              setPrivateRows((prev) => {
                                const next = [...prev]
                                const idx = next.findIndex((r) => r.user_id === worker.user_id)
                                if (idx >= 0) next[idx] = { ...next[idx], admin_follow_up_status: value }
                                else {
                                  next.push({
                                    user_id: worker.user_id,
                                    phone: worker.phone || '',
                                    email: worker.email || '',
                                    city: worker.city || '',
                                    admin_rating: worker.admin_rating || '',
                                    admin_notes: worker.admin_notes || '',
                                    admin_follow_up_status: value
                                  })
                                }
                                return next
                              })
                            }}
                          />
                        </div>

                        <div>
                          <div className="muted" style={{ marginBottom: 6 }}>{copy.privateNotes}</div>
                          <textarea
                            className="input"
                            value={worker.admin_notes ?? ''}
                            placeholder={copy.notesPlaceholder}
                            onChange={(e) => {
                              const value = e.target.value
                              setPrivateRows((prev) => {
                                const next = [...prev]
                                const idx = next.findIndex((r) => r.user_id === worker.user_id)
                                if (idx >= 0) next[idx] = { ...next[idx], admin_notes: value }
                                else {
                                  next.push({
                                    user_id: worker.user_id,
                                    phone: worker.phone || '',
                                    email: worker.email || '',
                                    city: worker.city || '',
                                    admin_rating: worker.admin_rating || '',
                                    admin_notes: value,
                                    admin_follow_up_status: worker.admin_follow_up_status || ''
                                  })
                                }
                                return next
                              })
                            }}
                          />
                        </div>

                        <button
                          className="btn primary"
                          onClick={() => saveAdminData(worker)}
                          disabled={savingId === worker.user_id}
                        >
                          {savingId === worker.user_id ? copy.saving : copy.save}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}  