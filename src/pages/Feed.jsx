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
    fleetRepair: 'Equipment / Fleet Repair'
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
    fleetRepair: 'Reparación de equipo / flota'
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

  return serviceTags.some((tag) => repairTags.has(tag))
    ? 'equipment_fleet_repair'
    : 'material_delivery'
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
  if (role === 'contractor') {
    return {
      background: '#111111',
      color: '#ffffff'
    }
  }

  if (role === 'subcontractor') {
    return {
      background: '#fff0b4',
      color: '#111111'
    }
  }

  if (role === 'laborer') {
    return {
      background: '#ecebe3',
      color: '#111111'
    }
  }

  if (role === 'supplier') {
    return {
      background: '#f1e7a8',
      color: '#111111'
    }
  }

  if (role === 'driver') {
    return {
      background: '#e9f3ff',
      color: '#111111'
    }
  }

  if (role === 'mechanic') {
    return {
      background: '#e7f4ef',
      color: '#111111'
    }
  }

  return {}
}

function tradeBadgeStyle() {
  return {
    background: '#f1f1eb',
    color: '#111111'
  }
}

function urgentBadgeStyle() {
  return {
    background: '#111111',
    color: '#ffffff'
  }
}

export default function Feed({ lang: langProp = 'en' }) {
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [posts, setPosts] = useState([])
  const [profilesById, setProfilesById] = useState({})
  const [lang, setLang] = useState(langProp || localStorage.getItem('surplox_lang') || 'en')
  const [filters, setFilters] = useState({
    postType: 'all',
    posterRole: 'all',
    crewStatus: 'all',
    categoryGroup: 'all',
    supportType: 'all',
    urgency: 'all',
    search: ''
  })

  const location = useLocation()
  const navigate = useNavigate()
  const copy = COPY[lang] || COPY.en

  useEffect(() => {
    const localLang = langProp || localStorage.getItem('surplox_lang') || 'en'
    setLang(localLang)
  }, [langProp])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const category = params.get('category')
    const support = params.get('support')
    const type = params.get('type')

    setFilters((prev) => ({
      ...prev,
      categoryGroup: category === 'jobsite_support' ? 'jobsite_support' : prev.categoryGroup,
      supportType: support || prev.supportType,
      postType: type || prev.postType
    }))
  }, [location.search])

  async function loadFeed() {
    setLoading(true)
    setMsg('')

    try {
      const { data: postRows, error: postError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (postError) throw postError

      const authorIds = Array.from(new Set((postRows || []).map((post) => post.author_id).filter(Boolean)))

      let profileMap = {}

      if (authorIds.length > 0) {
        const { data: profileRows, error: profileError } = await supabase
          .from('profiles')
          .select('user_id, display_name, role, trade_id, category_group, service_tags, equipment_tags, is_available, availability_status')
          .in('user_id', authorIds)

        if (profileError) throw profileError

        profileMap = (profileRows || []).reduce((acc, profile) => {
          acc[profile.user_id] = profile
          return acc
        }, {})
      }

      const tradeIds = Array.from(
        new Set(
          (postRows || [])
            .map((post) => post.trade_id)
            .concat(Object.values(profileMap).map((profile) => profile.trade_id))
            .filter(Boolean)
        )
      )

      let tradeMap = {}

      if (tradeIds.length > 0) {
        const { data: tradeRows, error: tradeError } = await supabase
          .from('trades')
          .select('id,name')
          .in('id', tradeIds)

        if (tradeError) throw tradeError

        tradeMap = (tradeRows || []).reduce((acc, trade) => {
          acc[trade.id] = trade.name
          return acc
        }, {})
      }

      const enrichedPosts = (postRows || []).map((post) => {
        const profile = profileMap[post.author_id] || {}
        const serviceTags = Array.isArray(post.service_tags) ? post.service_tags : Array.isArray(profile.service_tags) ? profile.service_tags : []
        const equipmentTags = Array.isArray(post.equipment_tags) ? post.equipment_tags : Array.isArray(profile.equipment_tags) ? profile.equipment_tags : []
        const supportType =
          (post.category_group || profile.category_group) === 'jobsite_support'
            ? detectSupportType(serviceTags)
            : null

        return {
          ...post,
          author_name: profile.display_name || copy.unknownMember,
          author_role: profile.role || '',
          author_available: Boolean(profile.is_available),
          author_availability_status: profile.availability_status || '',
          trade_name: tradeMap[post.trade_id] || tradeMap[profile.trade_id] || '',
          category_group: post.category_group || profile.category_group || 'trade',
          service_tags: serviceTags,
          equipment_tags: equipmentTags,
          support_type: supportType,
          crew_joined_count: Number(post.crew_joined_count || 0),
          crew_hired_count: Number(post.crew_hired_count || 0)
        }
      })

      const sortedPosts = enrichedPosts.sort((a, b) => {
        const priorityDiff =
          (POST_TYPE_PRIORITY[a.post_type] ?? 99) - (POST_TYPE_PRIORITY[b.post_type] ?? 99)

        if (priorityDiff !== 0) return priorityDiff

        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })

      setProfilesById(profileMap)
      setPosts(sortedPosts)
    } catch (error) {
      console.error(error)
      setMsg(copy.loadError)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFeed()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
      search: ''
    })
    navigate('/feed')
  }

  async function sharePost(post) {
    const url = `${window.location.origin}/p/${post.id}`

    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: url,
          url
        })
      } else {
        await navigator.clipboard.writeText(url)
        setMsg(copy.postCopied)
        setTimeout(() => setMsg(''), 2000)
      }
    } catch (error) {
      console.error(error)
      setMsg(copy.postShareError)
      setTimeout(() => setMsg(''), 2500)
    }
  }

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (filters.postType !== 'all' && post.post_type !== filters.postType) return false
      if (filters.posterRole !== 'all' && post.author_role !== filters.posterRole) return false
      if (filters.crewStatus !== 'all' && (post.crew_status || 'open') !== filters.crewStatus) return false
      if (filters.categoryGroup !== 'all' && post.category_group !== filters.categoryGroup) return false
      if (filters.supportType !== 'all' && post.support_type !== filters.supportType) return false
      if (filters.urgency === 'urgent' && !post.is_urgent) return false

      const query = String(filters.search || '').trim().toLowerCase()
      if (!query) return true

      const haystack = [
        post.title,
        post.body,
        post.trade_name,
        post.author_name,
        post.author_role,
        post.center_zip,
        ...(post.service_tags || []),
        ...(post.equipment_tags || [])
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(query)
    })
  }, [posts, filters])

  if (loading) {
    return (
      <div className="card rounded-xl">
        <div className="muted">Loading your feed…</div>
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
        <div className="badge good">{copy.heroBadge}</div>
        <div className="h1" style={{ marginTop: 14 }}>{copy.heroTitle}</div>
        <p className="muted" style={{ marginTop: 8 }}>{copy.heroBody}</p>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
          <Link className="btn primary" to="/new?type=need_crew">
            {copy.quickNeedCrew}
          </Link>
          <Link className="btn" to="/new?type=looking_for_work">
            {copy.quickWork}
          </Link>
          <Link className="btn" to="/new?type=discussion">
            {copy.quickDiscuss}
          </Link>
          <Link className="btn" to="/new?category=jobsite_support&support=material_delivery">
            {copy.quickSupportDelivery}
          </Link>
          <Link className="btn" to="/new?category=jobsite_support&support=equipment_fleet_repair">
            {copy.quickSupportRepair}
          </Link>
        </div>
      </div>

      {msg ? (
        <div className="card rounded-xl" style={{ padding: 18 }}>
          {msg}
        </div>
      ) : null}

      <div className="card rounded-xl" style={{ padding: 24 }}>
        <div className="card-section-title">{copy.filtersTitle}</div>
        <p className="card-section-subtitle" style={{ marginTop: 8 }}>{copy.filtersIntro}</p>

        <div className="grid two" style={{ marginTop: 16 }}>
          <div>
            <div className="muted" style={{ marginBottom: 6 }}>{copy.postType}</div>
            <select
              className="input"
              value={filters.postType}
              onChange={(e) => setFilter('postType', e.target.value)}
            >
              <option value="all">{copy.allPostTypes}</option>
              <option value="need_crew">{postTypeLabel('need_crew', lang)}</option>
              <option value="looking_for_work">{postTypeLabel('looking_for_work', lang)}</option>
              <option value="discussion">{postTypeLabel('discussion', lang)}</option>
            </select>
          </div>

          <div>
            <div className="muted" style={{ marginBottom: 6 }}>{copy.posterRole}</div>
            <select
              className="input"
              value={filters.posterRole}
              onChange={(e) => setFilter('posterRole', e.target.value)}
            >
              <option value="all">{copy.allRoles}</option>
              <option value="laborer">{roleLabel('laborer', lang)}</option>
              <option value="subcontractor">{roleLabel('subcontractor', lang)}</option>
              <option value="contractor">{roleLabel('contractor', lang)}</option>
              <option value="supplier">{roleLabel('supplier', lang)}</option>
              <option value="driver">{roleLabel('driver', lang)}</option>
              <option value="mechanic">{roleLabel('mechanic', lang)}</option>
            </select>
          </div>

          <div>
            <div className="muted" style={{ marginBottom: 6 }}>{copy.crewStatus}</div>
            <select
              className="input"
              value={filters.crewStatus}
              onChange={(e) => setFilter('crewStatus', e.target.value)}
            >
              <option value="all">{copy.allStatuses}</option>
              <option value="open">{crewStatusLabel('open', lang)}</option>
              <option value="full">{crewStatusLabel('full', lang)}</option>
              <option value="closed">{crewStatusLabel('closed', lang)}</option>
            </select>
          </div>

          <div>
            <div className="muted" style={{ marginBottom: 6 }}>{copy.categoryGroup}</div>
            <select
              className="input"
              value={filters.categoryGroup}
              onChange={(e) => setFilter('categoryGroup', e.target.value)}
            >
              {CATEGORY_GROUP_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {categoryGroupLabel(option.value, lang)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="muted" style={{ marginBottom: 6 }}>{copy.supportType}</div>
            <select
              className="input"
              value={filters.supportType}
              onChange={(e) => setFilter('supportType', e.target.value)}
            >
              <option value="all">{copy.allSupportTypes}</option>
              {JOBSITE_SUPPORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {supportTypeLabel(option.value, lang)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="muted" style={{ marginBottom: 6 }}>{copy.urgency}</div>
            <select
              className="input"
              value={filters.urgency}
              onChange={(e) => setFilter('urgency', e.target.value)}
            >
              <option value="all">{copy.allUrgency}</option>
              <option value="urgent">{copy.urgentOnly}</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <div className="muted" style={{ marginBottom: 6 }}>{copy.search}</div>
          <input
            className="input"
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            placeholder={copy.searchPlaceholder}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
          <button type="button" className="btn" onClick={clearFilters}>
            {copy.clearFilters}
          </button>
          <span className="badge">
            {copy.showing} {filteredPosts.length} {copy.of} {posts.length}
          </span>
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="card rounded-xl" style={{ padding: 24 }}>
          <div className="card-section-title">{copy.welcomeTitle}</div>
          <p className="card-section-subtitle" style={{ marginTop: 8 }}>{copy.noMatchBody}</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
            <button type="button" className="btn" onClick={clearFilters}>
              {copy.resetFilters}
            </button>
            <Link className="btn primary" to="/new">
              {copy.welcomeCta}
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid" style={{ gap: 16 }}>
          {filteredPosts.map((p) => {
            const typeStyles = getPostTypeStyles(p.post_type || 'discussion', p.category_group, p.is_urgent)
            const isOpportunity =
              p.post_type === 'need_crew' || p.post_type === 'looking_for_work'
            const isSupport = p.category_group === 'jobsite_support'

            return (
              <div
                key={p.id}
                className="card rounded-xl"
                style={{
                  ...typeStyles.shell,
                  padding: 0,
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    height: 6,
                    background: typeStyles.accent
                  }}
                />

                <div style={{ padding: 22 }}>
                  <div className="postMeta" style={{ marginBottom: 10 }}>
                    <span className="badge" style={typeStyles.badge}>
                      {postTypeLabel(p.post_type || 'discussion', lang)}
                    </span>

                    <span className="badge" style={tradeBadgeStyle()}>
                      {p.category_group === 'jobsite_support'
                        ? copy.jobsiteSupport
                        : copy.trades}
                    </span>

                    {p.trade_name ? (
                      <span className="badge" style={tradeBadgeStyle()}>
                        {p.trade_name}
                      </span>
                    ) : null}

                    {isSupport ? (
                      <span className="badge" style={tradeBadgeStyle()}>
                        {supportTypeLabel(p.support_type, lang)}
                      </span>
                    ) : null}

                    {p.center_zip ? (
                      <span className="badge">
                        {copy.zip} {p.center_zip}
                      </span>
                    ) : null}

                    <span className="badge">
                      {p.radius_miles} {copy.radius}
                    </span>

                    {p.author_role ? (
                      <span className="badge" style={roleBadgeStyle(p.author_role)}>
                        {roleLabel(p.author_role, lang)}
                      </span>
                    ) : null}

                    {p.author_available ? (
                      <span className="badge" style={{ background: '#dcf4e5', color: '#177245' }}>
                        {p.author_availability_status
                          ? availabilityStatusLabel(p.author_availability_status, lang)
                          : copy.available}
                      </span>
                    ) : null}

                    {p.is_urgent ? (
                      <span className="badge" style={urgentBadgeStyle()}>
                        ⚡ {copy.urgent}
                      </span>
                    ) : null}

                    {p.post_type === 'need_crew' ? (
                      <span className="badge" style={crewStatusBadgeStyle(p.crew_status || 'open')}>
                        {crewStatusLabel(p.crew_status || 'open', lang)}
                      </span>
                    ) : null}
                  </div>

                  <Link
                    to={`/p/${p.id}`}
                    className="postTitle"
                    style={{
                      display: 'block',
                      fontSize: 24,
                      letterSpacing: '-0.03em',
                      lineHeight: 1.12
                    }}
                  >
                    {p.title}
                  </Link>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 12,
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      marginTop: 10
                    }}
                  >
                    <div className="postMeta">
                      <Link to={`/u/${p.author_id}`} style={{ fontWeight: 800, color: 'var(--text)' }}>
                        {p.author_name}
                      </Link>
                      <span>•</span>
                      <span>
                        {p.created_at ? new Date(p.created_at).toLocaleString() : copy.unknownDate}
                      </span>
                    </div>

                    <button className="btn small" onClick={() => sharePost(p)}>
                      {copy.sharePost}
                    </button>
                  </div>

                  {isOpportunity ? (
                    <div
                      style={{
                        display: 'flex',
                        gap: 8,
                        flexWrap: 'wrap',
                        marginTop: 14
                      }}
                    >
                      {p.post_type === 'need_crew' && p.needed_crew_size ? (
                        <>
                          <span className="badge">
                            {copy.crewNeeded}: {p.needed_crew_size}
                          </span>
                          <span className="badge">
                            {copy.filled}: {p.crew_joined_count || 0}/{p.needed_crew_size}
                          </span>
                          <span className="badge">
                            {copy.hired}: {p.crew_hired_count || 0}
                          </span>
                        </>
                      ) : null}

                      {p.compensation ? (
                        <span className="badge">
                          {copy.pay}: {p.compensation}
                        </span>
                      ) : null}

                      {p.start_date ? (
                        <span className="badge">
                          {copy.start}: {new Date(p.start_date).toLocaleDateString()}
                        </span>
                      ) : null}
                    </div>
                  ) : null}

                  {isSupport && (p.service_tags?.length > 0 || p.equipment_tags?.length > 0) ? (
                    <div style={{ marginTop: 14 }}>
                      {p.service_tags?.length > 0 ? (
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                          <span className="badge" style={{ background: '#111111', color: '#ffffff' }}>
                            {copy.serviceTags}
                          </span>
                          {p.service_tags.map((tag) => (
                            <span key={`${p.id}-service-${tag}`} className="badge">
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      {p.equipment_tags?.length > 0 ? (
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <span className="badge" style={{ background: '#f1e7a8', color: '#111111' }}>
                            {copy.equipmentTags}
                          </span>
                          {p.equipment_tags.map((tag) => (
                            <span key={`${p.id}-equip-${tag}`} className="badge">
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {p.body ? (
                    <div
                      className="postExcerpt"
                      style={{
                        marginTop: 14,
                        fontSize: 15,
                        lineHeight: 1.7,
                        maxWidth: 920
                      }}
                    >
                      {p.body.slice(0, 220)}
                      {p.body.length > 220 ? '…' : ''}
                    </div>
                  ) : null}

                  <div style={{ marginTop: 18, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <Link className="btn primary" to={`/p/${p.id}`}>
                      {copy.openPost}
                    </Link>
                    <Link className="btn" to={`/u/${p.author_id}`}>
                      {copy.viewProfile}
                    </Link>
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