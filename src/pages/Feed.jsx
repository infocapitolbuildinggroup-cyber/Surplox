import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { t } from '../i18n'

const POST_TYPE_PRIORITY = {
  need_crew: 0,
  looking_for_work: 1,
  discussion: 2
}

const CATEGORY_GROUP_OPTIONS = [
  { value: 'all', en: 'All Categories', es: 'Todas las categorías' },
  { value: 'trade', en: 'Trades', es: 'Oficios' },
  { value: 'jobsite_support', en: 'Jobsite Support', es: 'Soporte de obra' }
]

const JOBSITE_SUPPORT_OPTIONS = [
  {
    value: 'material_delivery',
    en: 'Material Delivery / Hot Shot',
    es: 'Entrega de materiales / Hot Shot'
  },
  {
    value: 'cargo_van_delivery',
    en: 'Cargo Van / Local Delivery',
    es: 'Cargo Van / Entrega local'
  },
  {
    value: 'equipment_fleet_repair',
    en: 'Equipment / Fleet Repair',
    es: 'Reparación de equipo / flota'
  }
]

const AVAILABILITY_STATUS_LABELS = {
  available_now: { en: 'Available Now', es: 'Disponible ahora' },
  available_this_week: { en: 'Available This Week', es: 'Disponible esta semana' },
  busy: { en: 'Busy', es: 'Ocupado' }
}

const COPY = {
  en: {
    unknownMember: 'Unknown Member',
    loadError: 'Something went wrong while loading your feed.',
    filtersTitle: 'Feed Filters',
    filtersIntro: 'Narrow posts by type, category, role, urgency, or keyword.',
    postType: 'Post Type',
    allPostTypes: 'All Post Types',
    posterRole: 'Poster Role',
    allRoles: 'All Roles',
    crewStatus: 'Crew Status',
    allStatuses: 'All Statuses',
    categoryGroup: 'Category',
    supportType: 'Support Type',
    allSupportTypes: 'All Support Types',
    urgency: 'Urgency',
    allUrgency: 'All Posts',
    urgentOnly: 'Urgent Only',
    search: 'Search',
    searchPlaceholder: 'Search title, body, trade, service tags, role, ZIP...',
    clearFilters: 'Clear Filters',
    showing: 'Showing',
    of: 'of',
    noMatchBody: 'No posts match your current filters.',
    resetFilters: 'Reset Filters',
    openPost: 'Open Post',
    viewProfile: 'View Profile',
    viewStorefront: 'View Storefront',
    sharePost: 'Share Post',
    postCopied: 'Post link copied.',
    postShareError: 'Unable to share this post right now.',
    start: 'Start',
    pay: 'Pay',
    available: 'Available',
    crewNeeded: 'Crew Needed',
    filled: 'Filled',
    hired: 'Hired',
    unknownDate: 'Unknown date',
    welcomeTitle: 'Welcome to Surplox',
    welcomeBody:
      'This is the construction worker network for local crews, laborers, subcontractors, delivery support, and jobsite operations.',
    welcomeBullet1: 'Post work opportunities',
    welcomeBullet2: 'Find crews near your jobsite',
    welcomeBullet3: 'Find runners and repair support',
    welcomeBullet4: 'Connect with local subs and workers',
    welcomeCta: 'Create Your First Post',
    emptyBetter: 'Be the first to post in your area.',
    heroBadge: 'Local feed',
    heroTitle: 'Field activity built for your area.',
    heroBody:
      'Your feed is organized around ZIP code, radius, trade relevance, and now jobsite support so the most useful local activity surfaces first.',
    quickNeedCrew: 'Need Crew',
    quickWork: 'Looking for Work',
    quickDiscuss: 'Start Discussion',
    quickSupportDelivery: 'Post Delivery Support',
    quickSupportCargoVan: 'Post Cargo Van Support',
    quickSupportRepair: 'Post Repair Support',
    premiumTitle: 'Premium Surplox Feed',
    premiumBody:
      'Cleaner cards, stronger hierarchy, easier scanning, faster trust, and support for labor plus jobsite operations.',
    zip: 'ZIP',
    radius: 'mi radius',
    urgent: 'Urgent',
    serviceTags: 'Services',
    equipmentTags: 'Equipment',
    jobsiteSupport: 'Jobsite Support',
    trades: 'Trades',
    materialDelivery: 'Material Delivery / Hot Shot',
    cargoVanDelivery: 'Cargo Van / Local Delivery',
    fleetRepair: 'Equipment / Fleet Repair',
    supplierLocation: 'Supplier Location',
    supplierMaterials: 'Materials',
    deliveryRadius: 'Delivery Radius',
    storefront: 'Storefront',
    supplierLane: 'Supplier'
  },
  es: {
    unknownMember: 'Miembro desconocido',
    loadError: 'Ocurrió un problema al cargar tu feed.',
    filtersTitle: 'Filtros del feed',
    filtersIntro: 'Reduce publicaciones por tipo, categoría, rol, urgencia o palabra clave.',
    postType: 'Tipo de publicación',
    allPostTypes: 'Todos los tipos',
    posterRole: 'Rol del autor',
    allRoles: 'Todos los roles',
    crewStatus: 'Estado de cuadrilla',
    allStatuses: 'Todos los estados',
    categoryGroup: 'Categoría',
    supportType: 'Tipo de soporte',
    allSupportTypes: 'Todos los tipos de soporte',
    urgency: 'Urgencia',
    allUrgency: 'Todas las publicaciones',
    urgentOnly: 'Solo urgentes',
    search: 'Buscar',
    searchPlaceholder: 'Buscar por título, texto, oficio, servicios, rol, ZIP...',
    clearFilters: 'Limpiar filtros',
    showing: 'Mostrando',
    of: 'de',
    noMatchBody: 'No hay publicaciones que coincidan con tus filtros actuales.',
    resetFilters: 'Restablecer filtros',
    openPost: 'Abrir publicación',
    viewProfile: 'Ver perfil',
    viewStorefront: 'Ver tienda',
    sharePost: 'Compartir publicación',
    postCopied: 'Enlace de la publicación copiado.',
    postShareError: 'No se pudo compartir esta publicación en este momento.',
    start: 'Inicio',
    pay: 'Pago',
    available: 'Disponible',
    crewNeeded: 'Cuadrilla necesaria',
    filled: 'Llenos',
    hired: 'Contratados',
    unknownDate: 'Fecha desconocida',
    welcomeTitle: 'Bienvenido a Surplox',
    welcomeBody:
      'Esta es la red de construcción para cuadrillas locales, trabajadores, subcontratistas, soporte de entrega y operaciones de obra.',
    welcomeBullet1: 'Publica oportunidades de trabajo',
    welcomeBullet2: 'Encuentra cuadrillas cerca de tu obra',
    welcomeBullet3: 'Encuentra runners y soporte de reparación',
    welcomeBullet4: 'Conecta con subcontratistas y trabajadores locales',
    welcomeCta: 'Crea tu primera publicación',
    emptyBetter: 'Sé el primero en publicar en tu área.',
    heroBadge: 'Feed local',
    heroTitle: 'Actividad de campo pensada para tu zona.',
    heroBody:
      'Tu feed está organizado por ZIP, radio, relevancia del oficio y ahora soporte de obra para que la actividad local más útil aparezca primero.',
    quickNeedCrew: 'Se necesita cuadrilla',
    quickWork: 'Buscando trabajo',
    quickDiscuss: 'Iniciar discusión',
    quickSupportDelivery: 'Publicar soporte de entrega',
    quickSupportCargoVan: 'Publicar soporte Cargo Van',
    quickSupportRepair: 'Publicar soporte de reparación',
    premiumTitle: 'Feed premium de Surplox',
    premiumBody:
      'Tarjetas más limpias, jerarquía más fuerte, lectura más rápida y soporte para mano de obra más operaciones de obra.',
    zip: 'ZIP',
    radius: 'mi de radio',
    urgent: 'Urgente',
    serviceTags: 'Servicios',
    equipmentTags: 'Equipo',
    jobsiteSupport: 'Soporte de obra',
    trades: 'Oficios',
    materialDelivery: 'Entrega de materiales / Hot Shot',
    cargoVanDelivery: 'Cargo Van / Entrega local',
    fleetRepair: 'Reparación de equipo / flota',
    supplierLocation: 'Ubicación proveedora',
    supplierMaterials: 'Materiales',
    deliveryRadius: 'Radio de entrega',
    storefront: 'Tienda física',
    supplierLane: 'Proveedor'
  }
}

function postTypeLabel(type, lang) {
  if (lang === 'es') {
    if (type === 'need_crew') return '🚧 Se necesita cuadrilla'
    if (type === 'looking_for_work') return '🛠️ Buscando trabajo'
    return '💬 Discusión'
  }

  if (type === 'need_crew') return '🚧 Need Crew'
  if (type === 'looking_for_work') return '🛠️ Looking for Work'
  return '💬 Discussion'
}

function roleLabel(role, lang) {
  if (!role) return ''
  const map = {
    laborer: { en: 'Laborer', es: 'Trabajador' },
    subcontractor: { en: 'Subcontractor', es: 'Subcontratista' },
    contractor: { en: 'Contractor', es: 'Contratista' },
    supplier: { en: 'Supplier', es: 'Proveedor' },
    driver: { en: 'Driver', es: 'Conductor' },
    mechanic: { en: 'Mechanic', es: 'Mecánico' }
  }
  return map[role]?.[lang] || map[role]?.en || role
}

function availabilityStatusLabel(status, lang) {
  return AVAILABILITY_STATUS_LABELS[status]?.[lang] || AVAILABILITY_STATUS_LABELS[status]?.en || status
}

function categoryGroupLabel(value, lang) {
  const found = CATEGORY_GROUP_OPTIONS.find((x) => x.value === value)
  return found ? (lang === 'es' ? found.es : found.en) : value
}

function supportTypeLabel(value, lang) {
  const found = JOBSITE_SUPPORT_OPTIONS.find((x) => x.value === value)
  return found ? (lang === 'es' ? found.es : found.en) : value
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

function crewStatusLabel(status, lang) {
  if (lang === 'es') {
    if (status === 'full') return 'Cuadrilla llena'
    if (status === 'closed') return 'Cerrado'
    return 'Abierto'
  }

  if (status === 'full') return 'Crew Full'
  if (status === 'closed') return 'Closed'
  return 'Open'
}

function crewStatusBadgeStyle(status) {
  if (status === 'full') {
    return {
      background: '#fff0b4',
      color: '#111111'
    }
  }

  if (status === 'closed') {
    return {
      background: '#111111',
      color: '#ffffff'
    }
  }

  return {
    background: '#ecebe3',
    color: '#111111'
  }
}

function getPostTypeStyles(type, categoryGroup, isUrgent) {
  if (categoryGroup === 'jobsite_support') {
    return {
      shell: {
        background: isUrgent
          ? 'linear-gradient(180deg, #fff4da 0%, #ffffff 100%)'
          : 'linear-gradient(180deg, #f8f7ef 0%, #ffffff 100%)'
      },
      badge: {
        background: isUrgent ? '#ffde59' : '#f1e7a8',
        color: '#111111'
      },
      accent: isUrgent ? '#d4b21f' : '#111111'
    }
  }
  if (type === 'need_crew') {
    return {
      shell: {
        background: 'linear-gradient(180deg, #fffaf0 0%, #ffffff 100%)'
      },
      badge: {
        background: '#ffde59',
        color: '#111111'
      },
      accent: '#ffde59'
    }
  }

  if (type === 'looking_for_work') {
    return {
      shell: {
        background: 'linear-gradient(180deg, #f8f7ef 0%, #ffffff 100%)'
      },
      badge: {
        background: '#fff0b4',
        color: '#111111'
      },
      accent: '#d4b21f'
    }
  }

  return {
    shell: {
      background: '#ffffff'
    },
    badge: {
      background: '#ecebe3',
      color: '#111111'
    },
    accent: '#d9d7cc'
  }
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
  if (!isAvailable) return null
  return { background: '#dcf4e5', color: '#177245' }
}

function formatTagLabel(tag) {
  const map = {
    material_delivery: 'Material Delivery',
    hot_shot: 'Hot Shot',
    last_mile_delivery: 'Last Mile Delivery',
    local_runs: 'Local Runs',
    same_day_delivery: 'Same Day Delivery',
    long_distance: 'Long Distance',
    pickup_truck: 'Pickup Truck',
    cargo_van: 'Cargo Van',
    flatbed_trailer: 'Flatbed Trailer',
    gooseneck_trailer: 'Gooseneck Trailer',
    diesel_mechanic: 'Diesel Mechanic',
    heavy_equipment_repair: 'Heavy Equipment Repair',
    trailer_repair: 'Trailer Repair',
    emergency_repair: 'Emergency Repair',
    jobsite_service: 'Jobsite Service',
    mobile_repair_truck: 'Mobile Repair Truck',
    diesel_diagnostics: 'Diesel Diagnostics',
    trailer_brake_tools: 'Trailer Brake Tools'
  }
  return map[tag] || tag
}

function formatMaterialCategoryLabel(tag, lang = 'en') {
  const map = {
    lumber: { en: 'Lumber', es: 'Madera' },
    concrete: { en: 'Concrete', es: 'Concreto' },
    steel: { en: 'Steel', es: 'Acero' },
    electrical: { en: 'Electrical', es: 'Eléctrico' },
    plumbing: { en: 'Plumbing', es: 'Plomería' },
    drywall: { en: 'Drywall', es: 'Tablaroca' },
    fasteners: { en: 'Fasteners', es: 'Sujetadores' },
    equipment_rental: { en: 'Equipment Rental', es: 'Renta de equipo' },
    tools: { en: 'Tools', es: 'Herramientas' },
    safety_equipment: { en: 'Safety Equipment', es: 'Equipo de seguridad' }
  }
  return map[tag]?.[lang] || map[tag]?.en || tag
}

function timeAgo(ts, lang = 'en') {
  const d = new Date(ts)
  const diff = (Date.now() - d.getTime()) / 1000

  if (lang === 'es') {
    if (diff < 60) return `hace ${Math.floor(diff)} s`
    if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`
    return `hace ${Math.floor(diff / 86400)} d`
  }

  if (diff < 60) return `${Math.floor(diff)}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function Feed({ lang: langProp = 'en' }) {
  const navigate = useNavigate()
  const location = useLocation()

  const [lang, setLang] = useState(langProp || localStorage.getItem('surplox_lang') || 'en')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [shareMsg, setShareMsg] = useState('')

  const [filters, setFilters] = useState({
    postType: 'all',
    posterRole: 'all',
    crewStatus: 'all',
    categoryGroup: 'all',
    supportType: 'all',
    urgency: 'all',
    q: ''
  })

  const copy = COPY[lang] || COPY.en

  useEffect(() => {
    setLang(langProp || localStorage.getItem('surplox_lang') || 'en')
  }, [langProp])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const category = params.get('category')
    const support = params.get('support')

    setFilters((prev) => ({
      ...prev,
      categoryGroup: category || 'all',
      supportType: support || 'all'
    }))
  }, [location.search])

  useEffect(() => {
    let active = true

    async function loadFeed() {
      setLoading(true)
      setMsg('')

      try {
        const { data, error } = await supabase
          .from('posts')
          .select(
            `
            *,
            author:profiles!posts_author_id_fkey(
              user_id,
              display_name,
              role,
              is_available,
              availability_status,
              contractor_verified,
              category_group,
              service_tags,
              equipment_tags,
              trade_id,
              home_zip,
              travel_radius_miles,
              bio,
              business_name,
              business_address,
              business_zip,
              materials_categories,
              storefront,
              delivery_radius,
              trades(name)
            ),
            trades(name)
          `
          )
          .order('created_at', { ascending: false })

        if (error) throw error

        if (!active) return

        const normalized = (data || []).map((row) => {
          const serviceTags = Array.isArray(row.service_tags) ? row.service_tags : []
          const equipmentTags = Array.isArray(row.equipment_tags) ? row.equipment_tags : []
          const categoryGroup = row.category_group || 'trade'
          const supportType =
            categoryGroup === 'jobsite_support'
              ? row.support_type || detectSupportType(serviceTags)
              : null

          const author = row.author || {}
          const authorServiceTags = Array.isArray(author.service_tags) ? author.service_tags : []
          const authorEquipmentTags = Array.isArray(author.equipment_tags) ? author.equipment_tags : []
          const authorCategoryGroup = author.category_group || 'trade'
          const authorSupportType =
            authorCategoryGroup === 'jobsite_support'
              ? detectSupportType(authorServiceTags)
              : null

          return {
            ...row,
            service_tags: serviceTags,
            equipment_tags: equipmentTags,
            category_group: categoryGroup,
            support_type: supportType,
            trade_name: row.trades?.name || '',
            author_name: author.display_name || copy.unknownMember,
            author_role: author.role || '',
            author_is_available: Boolean(author.is_available),
            author_availability_status: author.availability_status || '',
            author_contractor_verified: Boolean(author.contractor_verified),
            author_category_group: authorCategoryGroup,
            author_service_tags: authorServiceTags,
            author_equipment_tags: authorEquipmentTags,
            author_support_type: authorSupportType,
            author_trade_name: author.trades?.name || '',
            author_home_zip: author.home_zip || '',
            author_travel_radius_miles: author.travel_radius_miles || 0,
            author_bio: author.bio || '',
            author_business_name: author.business_name || '',
            author_business_address: author.business_address || '',
            author_business_zip: author.business_zip || '',
            author_materials_categories: Array.isArray(author.materials_categories)
              ? author.materials_categories
              : [],
            author_storefront: Boolean(author.storefront),
            author_delivery_radius: author.delivery_radius || 0
          }
        })

        setPosts(normalized)
      } catch (err) {
        console.error(err)
        if (!active) return
        setMsg(err.message || copy.loadError)
      } finally {
        if (!active) return
        setLoading(false)
      }
    }

    loadFeed()
    return () => {
      active = false
    }
  }, [copy.loadError, copy.unknownMember])

  function setFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  function clearFilters() {
    setFilters({
      postType: 'all',
      posterRole: 'all',
      crewStatus: 'all',
      categoryGroup: 'all',
      supportType: 'all',
      urgency: 'all',
      q: ''
    })
    navigate('/feed')
  }

  async function sharePost(postId) {
    try {
      const url = `${window.location.origin}/p/${postId}`

      if (navigator.share) {
        await navigator.share({ url })
      } else {
        await navigator.clipboard.writeText(url)
        setShareMsg(copy.postCopied)
        setTimeout(() => setShareMsg(''), 2000)
      }
    } catch (err) {
      console.error(err)
      setShareMsg(copy.postShareError)
      setTimeout(() => setShareMsg(''), 2000)
    }
  }

  const filteredPosts = useMemo(() => {
    const q = String(filters.q || '').trim().toLowerCase()

    return posts
      .filter((post) => {
        if (filters.postType !== 'all' && post.post_type !== filters.postType) return false
        if (filters.posterRole !== 'all' && post.author_role !== filters.posterRole) return false
        if (filters.crewStatus !== 'all' && (post.crew_status || 'open') !== filters.crewStatus) return false
        if (filters.categoryGroup !== 'all' && post.category_group !== filters.categoryGroup) return false
        if (filters.supportType !== 'all' && post.support_type !== filters.supportType) return false
        if (filters.urgency === 'urgent' && !post.is_urgent) return false

        if (q) {
          const haystack = [
            post.title,
            post.body,
            post.trade_name,
            post.author_name,
            post.author_role,
            post.center_zip,
            post.author_business_name,
            post.author_business_address,
            post.author_business_zip,
            ...(post.service_tags || []),
            ...(post.equipment_tags || []),
            ...(post.author_materials_categories || [])
          ]
            .join(' ')
            .toLowerCase()

          if (!haystack.includes(q)) return false
        }

        return true
      })
      .sort((a, b) => {
        if (a.is_urgent !== b.is_urgent) return a.is_urgent ? -1 : 1
        const typeDiff = (POST_TYPE_PRIORITY[a.post_type] ?? 99) - (POST_TYPE_PRIORITY[b.post_type] ?? 99)
        if (typeDiff !== 0) return typeDiff
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
  }, [posts, filters])

  const totalPosts = posts.length
  const visiblePosts = filteredPosts.length

  if (loading) {
    return <div className="card">Loading feed…</div>
  }

  return (
    <div className="grid" style={{ gap: 22 }}>
      {msg && (
        <div className="card-message" style={{ padding: 14 }}>
          {msg}
        </div>
      )}

      {shareMsg && (
        <div className="card-message" style={{ padding: 14 }}>
          {shareMsg}
        </div>
      )}

      <div
        className="card rounded-xl"
        style={{
          padding: 28,
          background: 'linear-gradient(180deg, #fff7c8 0%, #f7f7f2 100%)'
        }}
      >
        <div className="badge" style={{ marginBottom: 12 }}>
          {copy.heroBadge}
        </div>

        <div className="h1">{copy.heroTitle}</div>

        <p
          className="muted"
          style={{
            marginTop: 12,
            maxWidth: 920,
            fontSize: 17,
            lineHeight: 1.7
          }}
        >
          {copy.heroBody}
        </p>

        <div
          style={{
            marginTop: 18,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10
          }}
        >
          <Link className="btn primary" to="/new?type=need_crew">
            {copy.quickNeedCrew}
          </Link>

          <Link className="btn" to="/new?type=looking_for_work">
            {copy.quickWork}
          </Link>

          <Link className="btn" to="/new?type=discussion">
            {copy.quickDiscuss}
          </Link>

          <Link
            className="btn"
            to="/new?category=jobsite_support&support=material_delivery"
          >
            {copy.quickSupportDelivery}
          </Link>

          <Link
            className="btn"
            to="/new?category=jobsite_support&support=cargo_van_delivery"
          >
            {copy.quickSupportCargoVan}
          </Link>

          <Link
            className="btn"
            to="/new?category=jobsite_support&support=equipment_fleet_repair"
          >
            {copy.quickSupportRepair}
          </Link>
        </div>
      </div>

      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="card-section-title">{copy.filtersTitle}</div>

        <p className="muted" style={{ marginTop: 8 }}>
          {copy.filtersIntro}
        </p>

        <div
          style={{
            marginTop: 16,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
            gap: 12
          }}
        >
          <div>
            <div className="muted">{copy.postType}</div>
            <select
              className="input"
              value={filters.postType}
              onChange={(e) => setFilter('postType', e.target.value)}
            >
              <option value="all">{copy.allPostTypes}</option>
              <option value="need_crew">Need Crew</option>
              <option value="looking_for_work">Looking for Work</option>
              <option value="discussion">Discussion</option>
            </select>
          </div>

          <div>
            <div className="muted">{copy.posterRole}</div>
            <select
              className="input"
              value={filters.posterRole}
              onChange={(e) => setFilter('posterRole', e.target.value)}
            >
              <option value="all">{copy.allRoles}</option>
              <option value="contractor">Contractor</option>
              <option value="subcontractor">Subcontractor</option>
              <option value="laborer">Laborer</option>
              <option value="supplier">Supplier</option>
              <option value="driver">Driver</option>
              <option value="mechanic">Mechanic</option>
            </select>
          </div>

          <div>
            <div className="muted">{copy.crewStatus}</div>
            <select
              className="input"
              value={filters.crewStatus}
              onChange={(e) => setFilter('crewStatus', e.target.value)}
            >
              <option value="all">{copy.allStatuses}</option>
              <option value="open">Open</option>
              <option value="full">Full</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div>
            <div className="muted">{copy.categoryGroup}</div>
            <select
              className="input"
              value={filters.categoryGroup}
              onChange={(e) => setFilter('categoryGroup', e.target.value)}
            >
              {CATEGORY_GROUP_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {lang === 'es' ? opt.es : opt.en}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="muted">{copy.supportType}</div>
            <select
              className="input"
              value={filters.supportType}
              onChange={(e) => setFilter('supportType', e.target.value)}
            >
              <option value="all">{copy.allSupportTypes}</option>

              {JOBSITE_SUPPORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {lang === 'es' ? opt.es : opt.en}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="muted">{copy.urgency}</div>
            <select
              className="input"
              value={filters.urgency}
              onChange={(e) => setFilter('urgency', e.target.value)}
            >
              <option value="all">{copy.allUrgency}</option>
              <option value="urgent">{copy.urgentOnly}</option>
            </select>
          </div>

          <div>
            <div className="muted">{copy.search}</div>
            <input
              className="input"
              placeholder={copy.searchPlaceholder}
              value={filters.q}
              onChange={(e) => setFilter('q', e.target.value)}
            />
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <button className="btn small" onClick={clearFilters}>
            {copy.clearFilters}
          </button>
        </div>

        <div className="muted" style={{ marginTop: 10 }}>
          {copy.showing} {visiblePosts} {copy.of} {totalPosts}
        </div>
      </div>

      {visiblePosts === 0 && (
        <div className="card rounded-xl" style={{ padding: 24 }}>
          <div className="h3">{copy.emptyBetter}</div>
          <p className="muted" style={{ marginTop: 8 }}>
            {copy.noMatchBody}
          </p>

          <div style={{ marginTop: 14 }}>
            <button className="btn small" onClick={clearFilters}>
              {copy.resetFilters}
            </button>
          </div>
        </div>
      )}

      {visiblePosts > 0 && (
        <div className="list">
          {filteredPosts.map((post) => {
            const styles = getPostTypeStyles(
              post.post_type,
              post.category_group,
              post.is_urgent
            )

            const supplierDisplayName =
              post.author_business_name || post.author_name || copy.unknownMember

            return (
              <div
                key={post.id}
                className="card rounded-xl"
                style={{ ...styles.shell, padding: 22 }}
              >
                <div className="postMeta" style={{ marginBottom: 10 }}>
                  <span className="badge" style={styles.badge}>
                    {postTypeLabel(post.post_type, lang)}
                  </span>

                  <span className="badge">
                    {post.category_group === 'jobsite_support'
                      ? copy.jobsiteSupport
                      : copy.trades}
                  </span>

                  {post.category_group === 'jobsite_support' &&
                    post.support_type && (
                      <span className="badge">
                        {supportTypeLabel(post.support_type, lang)}
                      </span>
                    )}

                  {post.trade_name && (
                    <span className="badge">{post.trade_name}</span>
                  )}

                  {post.author_role === 'supplier' && (
                    <span className="badge" style={{ background: '#f1e7a8', color: '#111111' }}>
                      {copy.supplierLane}
                    </span>
                  )}

                  {post.is_urgent && (
                    <span
                      className="badge"
                      style={{ background: '#ffde59', color: '#111111' }}
                    >
                      {copy.urgent}
                    </span>
                  )}

                  <span className="badge">
                    {timeAgo(post.created_at, lang)}
                  </span>
                </div>

                <div className="h2">{post.title}</div>

                {post.body && (
                  <div
                    style={{
                      marginTop: 10,
                      lineHeight: 1.7,
                      fontSize: 15
                    }}
                  >
                    {post.body}
                  </div>
                )}

                <div
                  style={{
                    marginTop: 14,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 8
                  }}
                >
                  {post.center_zip && (
                    <span className="badge">
                      {copy.zip}: {post.center_zip}
                    </span>
                  )}

                  {post.start_date && (
                    <span className="badge">
                      {copy.start}:{' '}
                      {new Date(post.start_date).toLocaleDateString()}
                    </span>
                  )}

                  {post.compensation && (
                    <span className="badge">
                      {copy.pay}: {post.compensation}
                    </span>
                  )}

                  {post.author_is_available && (
                    <span
                      className="badge"
                      style={availabilityBadgeStyle(true)}
                    >
                      {availabilityStatusLabel(
                        post.author_availability_status,
                        lang
                      )}
                    </span>
                  )}

                  {post.author_role === 'supplier' && post.author_business_zip && (
                    <span className="badge">
                      {copy.supplierLocation}: {post.author_business_zip}
                    </span>
                  )}

                  {post.author_role === 'supplier' &&
                    Number(post.author_delivery_radius || 0) > 0 && (
                      <span className="badge">
                        {copy.deliveryRadius}: {post.author_delivery_radius} {lang === 'es' ? 'mi' : 'mi'}
                      </span>
                    )}

                  {post.author_role === 'supplier' && post.author_storefront && (
                    <span className="badge">
                      {copy.storefront}
                    </span>
                  )}
                </div>

                {post.post_type === 'need_crew' && (
                  <div
                    style={{
                      marginTop: 12,
                      display: 'flex',
                      gap: 8,
                      flexWrap: 'wrap'
                    }}
                  >
                    <span className="badge">
                      {copy.crewNeeded}: {post.needed_count || 0}
                    </span>

                    <span className="badge">
                      {copy.filled}: {post.filled_count || 0}
                    </span>

                    <span className="badge">
                      {copy.hired}: {post.hired_count || 0}
                    </span>

                    <span
                      className="badge"
                      style={crewStatusBadgeStyle(post.crew_status)}
                    >
                      {crewStatusLabel(post.crew_status, lang)}
                    </span>
                  </div>
                )}

                {post.service_tags?.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div className="muted">{copy.serviceTags}</div>

                    <div
                      style={{
                        marginTop: 6,
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 6
                      }}
                    >
                      {post.service_tags.map((tag) => (
                        <span
                          key={`${post.id}-service-${tag}`}
                          className="badge"
                        >
                          {formatTagLabel(tag)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {post.equipment_tags?.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div className="muted">{copy.equipmentTags}</div>

                    <div
                      style={{
                        marginTop: 6,
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 6
                      }}
                    >
                      {post.equipment_tags.map((tag) => (
                        <span
                          key={`${post.id}-equip-${tag}`}
                          className="badge"
                        >
                          {formatTagLabel(tag)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {post.author_role === 'supplier' &&
                  post.author_materials_categories?.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <div className="muted">{copy.supplierMaterials}</div>

                      <div
                        style={{
                          marginTop: 6,
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 6
                        }}
                      >
                        {post.author_materials_categories.slice(0, 6).map((tag) => (
                          <span
                            key={`${post.id}-material-${tag}`}
                            className="badge"
                            style={{ background: '#f1e7a8', color: '#111111' }}
                          >
                            {formatMaterialCategoryLabel(tag, lang)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                <div
                  style={{
                    marginTop: 16,
                    display: 'flex',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 10
                  }}
                >
                  <div className="postMeta">
                    {post.author_role && (
                      <span
                        className="badge"
                        style={roleBadgeStyle(post.author_role)}
                      >
                        {roleLabel(post.author_role, lang)}
                      </span>
                    )}

                    <span className="badge">
                      {post.author_role === 'supplier' ? supplierDisplayName : post.author_name}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Link className="btn small primary" to={`/p/${post.id}`}>
                      {copy.openPost}
                    </Link>

                    <Link
                      className="btn small"
                      to={`/u/${post.author_id}`}
                    >
                      {copy.viewProfile}
                    </Link>

                    {post.author_role === 'supplier' && (
                      <Link
                        className="btn small"
                        to={`/supplier/${post.author_id}`}
                      >
                        {copy.viewStorefront}
                      </Link>
                    )}

                    <button
                      className="btn small"
                      onClick={() => sharePost(post.id)}
                    >
                      {copy.sharePost}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}