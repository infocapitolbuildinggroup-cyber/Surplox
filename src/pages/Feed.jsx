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
    supplier: { en: 'Supplier', es: 'Proveedor' }
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

  return {}
}

function tradeBadgeStyle() {
  return {
    background: '#f1f1eb',
    color: '#111111'
  }
}

function availabilityBadgeStyle(isAvailable) {
  if (!isAvailable) return null
  return {
    background: '#dcf4e5',
    color: '#177245'
  }
}

function urgentBadgeStyle() {
  return {
    background: '#111111',
    color: '#ffffff'
  }
}

function haversineMiles(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180
  const R = 3958.8
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

export default function Feed({ lang: langProp = 'en' }) {
  const location = useLocation()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [posts, setPosts] = useState([])
  const [lang, setLang] = useState(langProp || localStorage.getItem('surplox_lang') || 'en')

  const [typeFilter, setTypeFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [supportTypeFilter, setSupportTypeFilter] = useState('all')
  const [urgencyFilter, setUrgencyFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [msg, setMsg] = useState('')

  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const tradeParam = params.get('trade')
  const copy = COPY[lang] || COPY.en

  function buildPostUrl(postId) {
    return `${window.location.origin}/p/${postId}`
  }

  async function sharePost(post) {
    try {
      const url = buildPostUrl(post.id)
      const text =
        lang === 'es'
          ? `Mira esta publicación en Surplox: ${post.title || 'Publicación de construcción'}`
          : `Check out this Surplox post: ${post.title || 'Construction post'}`

      if (navigator.share) {
        await navigator.share({
          title: post.title || 'Surplox',
          text,
          url
        })
      } else {
        await navigator.clipboard.writeText(url)
        setMsg(copy.postCopied)
      }
    } catch (error) {
      if (error?.name === 'AbortError') return
      console.error(error)
      setMsg(copy.postShareError)
    }
  }

  useEffect(() => {
    let alive = true

    async function load() {
      setLoading(true)
      setErr('')

      try {
        const { data: sessionData, error: sErr } = await supabase.auth.getSession()
        if (sErr) throw sErr

        const user = sessionData.session?.user
        if (!user) {
          navigate('/auth', { replace: true })
          return
        }

        const { data: prof, error: pErr } = await supabase
          .from('profiles')
          .select('home_zip, travel_radius_miles, preferred_language')
          .eq('user_id', user.id)
          .maybeSingle()

        if (pErr) throw pErr

        const activeLang =
          prof?.preferred_language || langProp || localStorage.getItem('surplox_lang') || 'en'

        if (!alive) return
        setLang(activeLang)
        localStorage.setItem('surplox_lang', activeLang)

        const myZip = String(prof?.home_zip || '').trim()
        const myRadius = Number(prof?.travel_radius_miles || 0)

        if (!myZip || !myRadius) {
          setPosts([])
          return
        }

        const { data: myZipRow, error: myZipErr } = await supabase
          .from('zipcodes')
          .select('zip, lat, lon')
          .eq('zip', myZip)
          .maybeSingle()

        if (myZipErr) throw myZipErr
        if (!myZipRow?.lat || !myZipRow?.lon) {
          setPosts([])
          return
        }

        let query = supabase
          .from('posts')
          .select(`
            id,
            title,
            body,
            center_zip,
            radius_miles,
            created_at,
            trade_id,
            post_type,
            crew_status,
            needed_crew_size,
            compensation,
            start_date,
            author_id,
            category_group,
            service_tags,
            equipment_tags,
            is_urgent,
            boosted_at,
            boost_count,
            image_urls,
            trades(name),
            profiles!posts_author_id_fkey(display_name, role, is_available, availability_status)
          `)
          .order('created_at', { ascending: false })

        if (tradeParam) {
          const { data: tradeRows } = await supabase
            .from('trades')
            .select('id')
            .ilike('name', tradeParam)
            .limit(1)

          const tradeId = tradeRows?.[0]?.id
          if (tradeId) {
            query = query.eq('trade_id', tradeId)
          } else {
            setPosts([])
            setLoading(false)
            return
          }
        }

        const { data: rows, error: rowsErr } = await query
        if (rowsErr) throw rowsErr

        let filtered = rows || []

        const uniqueZips = Array.from(
          new Set(filtered.map((post) => String(post.center_zip || '').trim()).filter(Boolean))
        )

        if (uniqueZips.length > 0) {
          const { data: zipRows, error: zipErr } = await supabase
            .from('zipcodes')
            .select('zip, lat, lon')
            .in('zip', uniqueZips)

          if (zipErr) throw zipErr

          const zipMap = new Map((zipRows || []).map((z) => [String(z.zip), z]))

          filtered = filtered.filter((post) => {
            const z = zipMap.get(String(post.center_zip))
            if (!z?.lat || !z?.lon) return false

            const dist = haversineMiles(
              Number(myZipRow.lat),
              Number(myZipRow.lon),
              Number(z.lat),
              Number(z.lon)
            )

            const postRadius = Number(post.radius_miles || 0)
            return dist <= myRadius && dist <= postRadius
          })
        }

        const needCrewPostIds = (filtered || [])
          .filter((post) => post.post_type === 'need_crew')
          .map((post) => post.id)

        const crewCountMap = new Map()
        const hiredCountMap = new Map()

        if (needCrewPostIds.length > 0) {
          const { data: crewRows, error: crewErr } = await supabase
            .from('crew_memberships')
            .select('post_id, status')
            .in('post_id', needCrewPostIds)

          if (crewErr) throw crewErr

          ;(crewRows || []).forEach((row) => {
            const current = crewCountMap.get(row.post_id) || 0
            crewCountMap.set(row.post_id, current + 1)

            if (row.status === 'hired') {
              const hiredCurrent = hiredCountMap.get(row.post_id) || 0
              hiredCountMap.set(row.post_id, hiredCurrent + 1)
            }
          })
        }

        filtered = (filtered || [])
          .map((post) => {
            const serviceTags = Array.isArray(post.service_tags) ? post.service_tags : []
            const equipmentTags = Array.isArray(post.equipment_tags) ? post.equipment_tags : []
            const categoryGroup = post.category_group || 'trade'

            return {
              ...post,
              category_group: categoryGroup,
              service_tags: serviceTags,
              equipment_tags: equipmentTags,
              support_type: categoryGroup === 'jobsite_support' ? detectSupportType(serviceTags) : null,
              trade_name: post.trades?.name || '',
              author_name: post.profiles?.display_name || copy.unknownMember,
              author_role: post.profiles?.role || '',
              author_available: Boolean(post.profiles?.is_available),
              author_availability_status: post.profiles?.availability_status || '',
              crew_joined_count: crewCountMap.get(post.id) || 0,
              crew_hired_count: hiredCountMap.get(post.id) || 0
            }
          })
          .sort((a, b) => {
            if (a.is_urgent !== b.is_urgent) return a.is_urgent ? -1 : 1

            const aBoost = a.boosted_at ? new Date(a.boosted_at).getTime() : 0
            const bBoost = b.boosted_at ? new Date(b.boosted_at).getTime() : 0
            if (aBoost !== bBoost) return bBoost - aBoost

            const pa = POST_TYPE_PRIORITY[a.post_type || 'discussion'] ?? 99
            const pb = POST_TYPE_PRIORITY[b.post_type || 'discussion'] ?? 99
            if (pa !== pb) return pa - pb

            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          })

        if (!alive) return
        setPosts(filtered || [])
      } catch (error) {
        console.error(error)
        if (!alive) return
        setErr(error?.message || copy.loadError)
      } finally {
        if (!alive) return
        setLoading(false)
      }
    }

    load()
    return () => {
      alive = false
    }
  }, [navigate, tradeParam, langProp])

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (typeFilter !== 'all' && post.post_type !== typeFilter) return false
      if (roleFilter !== 'all' && post.author_role !== roleFilter) return false
      if (categoryFilter !== 'all' && post.category_group !== categoryFilter) return false
      if (supportTypeFilter !== 'all' && post.support_type !== supportTypeFilter) return false
      if (urgencyFilter === 'urgent' && !post.is_urgent) return false

      if (statusFilter !== 'all') {
        if (post.post_type !== 'need_crew') return false
        if ((post.crew_status || 'open') !== statusFilter) return false
      }

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase()
        const haystack = [
          post.title,
          post.body,
          post.trade_name,
          post.author_role,
          post.center_zip,
          post.author_name,
          ...(post.service_tags || []),
          ...(post.equipment_tags || [])
        ]
          .join(' ')
          .toLowerCase()

        if (!haystack.includes(q)) return false
      }

      return true
    })
  }, [
    posts,
    typeFilter,
    roleFilter,
    statusFilter,
    categoryFilter,
    supportTypeFilter,
    urgencyFilter,
    searchQuery
  ])

  const showWelcomeCard = !loading && !err && posts.length === 0

  if (loading) {
    return <div className="card">{t(lang, 'feed_loading')}</div>
  }

  if (err) {
    return (
      <div className="card">
        <div className="h2">{t(lang, 'feed_unavailable')}</div>
        <p className="muted" style={{ marginTop: 8 }}>
          {err}
        </p>
        <div style={{ marginTop: 14 }}>
          <button className="btn primary" onClick={() => window.location.reload()}>
            {t(lang, 'feed_try_again')}
          </button>
        </div>
      </div>
    )
  }

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
        <div
          className="badge"
          style={{
            marginBottom: 16,
            background: '#f1e7a8'
          }}
        >
          {copy.heroBadge}
        </div>

        <div className="grid two" style={{ alignItems: 'start' }}>
          <div>
            <div className="h1" style={{ maxWidth: 760 }}>
              {copy.heroTitle}
            </div>
            <p className="muted" style={{ marginTop: 12, fontSize: 17, lineHeight: 1.7 }}>
              {copy.heroBody}
            </p>

            <div className="row" style={{ marginTop: 18 }}>
              <Link className="btn primary" to="/new?type=need_crew">
                {copy.quickNeedCrew}
              </Link>
              <Link className="btn" to="/new?type=looking_for_work">
                {copy.quickWork}
              </Link>
              <Link className="btn" to="/new?type=discussion">
                {copy.quickDiscuss}
              </Link>
              <Link className="btn" to="/new?type=discussion&group=jobsite_support&support=material_delivery">
                {copy.quickSupportDelivery}
              </Link>
              <Link className="btn" to="/new?type=discussion&group=jobsite_support&support=equipment_fleet_repair">
                {copy.quickSupportRepair}
              </Link>
            </div>
          </div>

          <div className="grid" style={{ gap: 12 }}>
            <div className="card-soft">
              <div className="card-section-title" style={{ fontSize: 16 }}>
                {copy.premiumTitle}
              </div>
              <p className="card-section-subtitle" style={{ marginTop: 8 }}>
                {copy.premiumBody}
              </p>
            </div>

            <div
              className="card-soft"
              style={{
                background: '#111111',
                color: '#ffffff'
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  opacity: 0.7
                }}
              >
                {copy.showing}
              </div>
              <div style={{ marginTop: 8, fontSize: 28, fontWeight: 900 }}>
                {filteredPosts.length} / {posts.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card rounded-xl" style={{ padding: 22 }}>
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
            <div className="card-section-title">{copy.filtersTitle}</div>
            <p className="card-section-subtitle" style={{ marginTop: 8 }}>
              {copy.filtersIntro}
            </p>
          </div>

          <div className="badge">
            {copy.showing} {filteredPosts.length} {copy.of} {posts.length}
          </div>
        </div>

        <div className="grid two" style={{ marginTop: 16 }}>
          <div>
            <div className="muted" style={{ marginBottom: 6 }}>
              {copy.postType}
            </div>
            <select className="input" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">{copy.allPostTypes}</option>
              <option value="need_crew">{postTypeLabel('need_crew', lang)}</option>
              <option value="looking_for_work">{postTypeLabel('looking_for_work', lang)}</option>
              <option value="discussion">{postTypeLabel('discussion', lang)}</option>
            </select>
          </div>

          <div>
            <div className="muted" style={{ marginBottom: 6 }}>
              {copy.categoryGroup}
            </div>
            <select className="input" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              {CATEGORY_GROUP_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {lang === 'es' ? option.es : option.en}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="muted" style={{ marginBottom: 6 }}>
              {copy.supportType}
            </div>
            <select className="input" value={supportTypeFilter} onChange={(e) => setSupportTypeFilter(e.target.value)}>
              <option value="all">{copy.allSupportTypes}</option>
              {JOBSITE_SUPPORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {lang === 'es' ? option.es : option.en}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="muted" style={{ marginBottom: 6 }}>
              {copy.posterRole}
            </div>
            <select className="input" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="all">{copy.allRoles}</option>
              <option value="laborer">{roleLabel('laborer', lang)}</option>
              <option value="subcontractor">{roleLabel('subcontractor', lang)}</option>
              <option value="contractor">{roleLabel('contractor', lang)}</option>
              <option value="supplier">{roleLabel('supplier', lang)}</option>
            </select>
          </div>

          <div>
            <div className="muted" style={{ marginBottom: 6 }}>
              {copy.crewStatus}
            </div>
            <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">{copy.allStatuses}</option>
              <option value="open">{crewStatusLabel('open', lang)}</option>
              <option value="full">{crewStatusLabel('full', lang)}</option>
              <option value="closed">{crewStatusLabel('closed', lang)}</option>
            </select>
          </div>

          <div>
            <div className="muted" style={{ marginBottom: 6 }}>
              {copy.urgency}
            </div>
            <select className="input" value={urgencyFilter} onChange={(e) => setUrgencyFilter(e.target.value)}>
              <option value="all">{copy.allUrgency}</option>
              <option value="urgent">{copy.urgentOnly}</option>
            </select>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <div className="muted" style={{ marginBottom: 6 }}>
              {copy.search}
            </div>
            <input
              className="input"
              value={searchQuery}
              placeholder={copy.searchPlaceholder}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <button
            className="btn"
            onClick={() => {
              setTypeFilter('all')
              setRoleFilter('all')
              setStatusFilter('all')
              setCategoryFilter('all')
              setSupportTypeFilter('all')
              setUrgencyFilter('all')
              setSearchQuery('')
            }}
          >
            {copy.clearFilters}
          </button>
        </div>
      </div>

      {filteredPosts.length === 0 && posts.length > 0 ? (
        <div className="card">
          <div className="card-section-title">{copy.noMatchBody}</div>
          <div style={{ marginTop: 12 }}>
            <button
              className="btn"
              onClick={() => {
                setTypeFilter('all')
                setRoleFilter('all')
                setStatusFilter('all')
                setCategoryFilter('all')
                setSupportTypeFilter('all')
                setUrgencyFilter('all')
                setSearchQuery('')
              }}
            >
              {copy.resetFilters}
            </button>
          </div>
        </div>
      ) : null}

      {showWelcomeCard ? (
        <div className="card rounded-xl" style={{ padding: 28 }}>
          <div className="h1" style={{ fontSize: 'clamp(1.9rem, 4vw, 2.7rem)' }}>
            {copy.welcomeTitle}
          </div>
          <p className="muted" style={{ marginTop: 12, fontSize: 17, lineHeight: 1.7 }}>
            {copy.welcomeBody}
          </p>

          <div className="grid two" style={{ marginTop: 16 }}>
            <div className="card-soft"><div style={{ fontWeight: 800 }}>{copy.welcomeBullet1}</div></div>
            <div className="card-soft"><div style={{ fontWeight: 800 }}>{copy.welcomeBullet2}</div></div>
            <div className="card-soft"><div style={{ fontWeight: 800 }}>{copy.welcomeBullet3}</div></div>
            <div className="card-soft"><div style={{ fontWeight: 800 }}>{copy.welcomeBullet4}</div></div>
          </div>

          <div className="row" style={{ marginTop: 18 }}>
            <Link className="btn primary" to="/new">
              {copy.welcomeCta}
            </Link>
            <div className="card-soft" style={{ flex: 1 }}>
              <div style={{ fontWeight: 800 }}>{copy.emptyBetter}</div>
            </div>
          </div>
        </div>
      ) : null}

      {!showWelcomeCard ? (
        <div className="list">
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
                      <span className="badge" style={availabilityBadgeStyle(true)}>
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
      ) : null}
    </div>
  )
}