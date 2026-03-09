import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { t } from '../i18n'

const POST_TYPE_PRIORITY = {
  need_crew: 0,
  looking_for_work: 1,
  discussion: 2
}

const COPY = {
  en: {
    unknownMember: 'Unknown Member',
    loadError: 'Something went wrong while loading your feed.',
    filtersTitle: 'Feed Filters',
    filtersIntro: 'Narrow posts by type, role, crew status, or keyword.',
    postType: 'Post Type',
    allPostTypes: 'All Post Types',
    posterRole: 'Poster Role',
    allRoles: 'All Roles',
    crewStatus: 'Crew Status',
    allStatuses: 'All Statuses',
    search: 'Search',
    searchPlaceholder: 'Search title, body, trade, role, ZIP...',
    clearFilters: 'Clear Filters',
    showing: 'Showing',
    of: 'of',
    noMatchBody: 'No posts match your current filters.',
    resetFilters: 'Reset Filters',
    openPost: 'Open Post',
    viewProfile: 'View Profile',
    start: 'Start',
    pay: 'Pay',
    available: 'Available',
    crewNeeded: 'Crew Needed',
    filled: 'Filled',
    hired: 'Hired',
    unknownDate: 'Unknown date',
    welcomeTitle: 'Welcome to Surplox',
    welcomeBody:
      'This is the construction worker network for local crews, laborers, subcontractors, and opportunities.',
    welcomeBullet1: 'Post work opportunities',
    welcomeBullet2: 'Find crews near your jobsite',
    welcomeBullet3: 'Ask trade questions',
    welcomeBullet4: 'Connect with local subs and workers',
    welcomeCta: 'Create Your First Post',
    emptyBetter: 'Be the first to post in your area.'
  },
  es: {
    unknownMember: 'Miembro desconocido',
    loadError: 'Ocurrió un problema al cargar tu feed.',
    filtersTitle: 'Filtros del feed',
    filtersIntro: 'Reduce publicaciones por tipo, rol, estado de cuadrilla o palabra clave.',
    postType: 'Tipo de publicación',
    allPostTypes: 'Todos los tipos',
    posterRole: 'Rol del autor',
    allRoles: 'Todos los roles',
    crewStatus: 'Estado de cuadrilla',
    allStatuses: 'Todos los estados',
    search: 'Buscar',
    searchPlaceholder: 'Buscar por título, texto, oficio, rol, ZIP...',
    clearFilters: 'Limpiar filtros',
    showing: 'Mostrando',
    of: 'de',
    noMatchBody: 'No hay publicaciones que coincidan con tus filtros actuales.',
    resetFilters: 'Restablecer filtros',
    openPost: 'Abrir publicación',
    viewProfile: 'Ver perfil',
    start: 'Inicio',
    pay: 'Pago',
    available: 'Disponible',
    crewNeeded: 'Cuadrilla necesaria',
    filled: 'Llenos',
    hired: 'Contratados',
    unknownDate: 'Fecha desconocida',
    welcomeTitle: 'Bienvenido a Surplox',
    welcomeBody:
      'Esta es la red de construcción para cuadrillas locales, trabajadores, subcontratistas y oportunidades.',
    welcomeBullet1: 'Publica oportunidades de trabajo',
    welcomeBullet2: 'Encuentra cuadrillas cerca de tu obra',
    welcomeBullet3: 'Haz preguntas del oficio',
    welcomeBullet4: 'Conecta con subcontratistas y trabajadores locales',
    welcomeCta: 'Crea tu primera publicación',
    emptyBetter: 'Sé el primero en publicar en tu área.'
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
      color: '#ff751f',
      borderColor: 'rgba(255, 222, 89, 0.65)',
      background: 'rgba(255, 222, 89, 0.14)'
    }
  }

  if (status === 'closed') {
    return {
      color: '#ffde59',
      borderColor: 'rgba(255, 117, 31, 0.55)',
      background: 'rgba(255, 117, 31, 0.12)'
    }
  }

  return {
    color: '#ff751f',
    borderColor: 'rgba(255, 222, 89, 0.4)',
    background: 'rgba(255, 222, 89, 0.06)'
  }
}

function getPostTypeStyles(type) {
  if (type === 'need_crew') {
    return {
      card: {
        borderColor: 'rgba(255, 222, 89, 0.55)',
        background: 'rgba(255, 222, 89, 0.08)',
        boxShadow: '0 0 16px rgba(255, 222, 89, 0.12)'
      },
      badge: {
        color: '#ff751f',
        borderColor: 'rgba(255, 222, 89, 0.65)',
        background: 'rgba(255, 222, 89, 0.14)',
        boxShadow: '0 0 10px rgba(255, 222, 89, 0.18)'
      }
    }
  }

  if (type === 'looking_for_work') {
    return {
      card: {
        borderColor: 'rgba(255, 117, 31, 0.42)',
        background: 'rgba(255, 117, 31, 0.06)',
        boxShadow: '0 0 14px rgba(255, 117, 31, 0.08)'
      },
      badge: {
        color: '#ffde59',
        borderColor: 'rgba(255, 117, 31, 0.55)',
        background: 'rgba(255, 117, 31, 0.12)',
        boxShadow: '0 0 10px rgba(255, 117, 31, 0.14)'
      }
    }
  }

  return {
    card: {},
    badge: {
      color: '#ff751f',
      borderColor: 'rgba(255, 222, 89, 0.35)',
      background: 'rgba(255, 222, 89, 0.05)'
    }
  }
}

function roleBadgeStyle(role) {
  if (role === 'contractor') {
    return {
      color: '#ffde59',
      borderColor: 'rgba(255, 117, 31, 0.55)',
      background: 'rgba(255, 117, 31, 0.12)'
    }
  }

  if (role === 'subcontractor') {
    return {
      color: '#ff751f',
      borderColor: 'rgba(255, 222, 89, 0.55)',
      background: 'rgba(255, 222, 89, 0.12)'
    }
  }

  if (role === 'laborer') {
    return {
      color: '#ffde59',
      borderColor: 'rgba(255, 222, 89, 0.35)',
      background: 'rgba(255, 222, 89, 0.05)'
    }
  }

  if (role === 'supplier') {
    return {
      color: '#ffd6b5',
      borderColor: 'rgba(255, 117, 31, 0.4)',
      background: 'rgba(255, 117, 31, 0.08)'
    }
  }

  return {}
}

function tradeBadgeStyle() {
  return {
    color: '#ffde59',
    borderColor: 'rgba(255, 222, 89, 0.4)',
    background: 'rgba(255, 222, 89, 0.05)'
  }
}

function availabilityBadgeStyle(isAvailable) {
  if (!isAvailable) return null
  return {
    color: '#ff751f',
    borderColor: 'rgba(255, 222, 89, 0.65)',
    background: 'rgba(255, 222, 89, 0.14)'
  }
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
  const [searchQuery, setSearchQuery] = useState('')

  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const tradeParam = params.get('trade')
  const copy = COPY[lang] || COPY.en

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
          .select('user_id, home_zip, travel_radius_miles, preferred_language')
          .eq('user_id', user.id)
          .maybeSingle()

        if (pErr) throw pErr

        if (!prof?.home_zip) {
          navigate('/onboarding', { replace: true })
          return
        }

        const userLang =
          prof?.preferred_language || langProp || localStorage.getItem('surplox_lang') || 'en'
        setLang(userLang)
        localStorage.setItem('surplox_lang', userLang)

        let q = supabase
          .from('posts')
          .select(`
            id,
            title,
            body,
            created_at,
            center_zip,
            radius_miles,
            trade_id,
            post_type,
            crew_status,
            needed_crew_size,
            compensation,
            start_date,
            author_id,
            trades(name),
            profiles(display_name, role, is_available)
          `)
          .order('created_at', { ascending: false })
          .limit(50)

        if (tradeParam) q = q.eq('trade_id', Number(tradeParam))

        const { data: p, error: postsErr } = await q
        if (postsErr) throw postsErr

        const myZip = String(prof.home_zip || '')
        const myRadius = Number(prof.travel_radius_miles || 50)

        function haversineMiles(lat1, lon1, lat2, lon2) {
          const toRad = (x) => (x * Math.PI) / 180
          const R = 3958.8
          const dLat = toRad(lat2 - lat1)
          const dLon = toRad(lon2 - lon1)

          const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) *
              Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) ** 2

          return 2 * R * Math.asin(Math.sqrt(a))
        }

        const { data: myZipRow, error: myZipErr } = await supabase
          .from('zipcodes')
          .select('lat, lon')
          .eq('zip', myZip)
          .maybeSingle()

        if (myZipErr) throw myZipErr

        let filtered = p || []

        if (myZipRow?.lat && myZipRow?.lon && filtered.length > 0) {
          const postZips = Array.from(
            new Set(filtered.map((x) => String(x.center_zip)).filter(Boolean))
          )

          const { data: zipRows, error: zipErr } = await supabase
            .from('zipcodes')
            .select('zip, lat, lon')
            .in('zip', postZips)

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
          .map((post) => ({
            ...post,
            trade_name: post.trades?.name || '',
            author_name: post.profiles?.display_name || copy.unknownMember,
            author_role: post.profiles?.role || '',
            author_available: Boolean(post.profiles?.is_available),
            crew_joined_count: crewCountMap.get(post.id) || 0,
            crew_hired_count: hiredCountMap.get(post.id) || 0
          }))
          .sort((a, b) => {
            const pa = POST_TYPE_PRIORITY[a.post_type || 'discussion'] ?? 99
            const pb = POST_TYPE_PRIORITY[b.post_type || 'discussion'] ?? 99
            if (pa !== pb) return pa - pb
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          })

        if (!alive) return
        setPosts(filtered || [])
      } catch (e) {
        console.error(e)
        if (!alive) return
        setErr(e?.message || copy.loadError)
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

      if (statusFilter !== 'all') {
        if (post.post_type !== 'need_crew') return false
        if ((post.crew_status || 'open') !== statusFilter) return false
      }

      const q = searchQuery.trim().toLowerCase()
      if (q) {
        const haystack = [
          post.title,
          post.body,
          post.trade_name,
          post.author_name,
          post.author_role,
          post.center_zip
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        if (!haystack.includes(q)) return false
      }

      return true
    })
  }, [posts, typeFilter, roleFilter, statusFilter, searchQuery])

  const showWelcomeCard = posts.length === 0

  if (loading) {
    return <div className="card">{t(lang, 'feed_loading')}</div>
  }

  if (err) {
    return (
      <div className="card card-message">
        <div className="card-section-title">{t(lang, 'feed_unavailable')}</div>
        <p className="card-section-subtitle">{err}</p>
        <hr />
        <button className="btn primary" onClick={() => navigate(0)}>
          {t(lang, 'feed_try_again')}
        </button>
      </div>
    )
  }

  return (
    <div className="grid" style={{ gap: 12 }}>
      <div className="card">
        <div className="h1" style={{ fontSize: 20, marginTop: 0 }}>{t(lang, 'feed_title')}</div>
        <p className="muted">
          {t(lang, 'feed_intro')}{tradeParam ? t(lang, 'feed_intro_channel') : '.'}
        </p>

        <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link className="btn primary" to="/new">{t(lang, 'feed_create_post')}</Link>
          <Link className="btn" to="/channels">{t(lang, 'feed_browse_channels')}</Link>
        </div>
      </div>

      {showWelcomeCard && (
        <div
          className="card"
          style={{
            borderColor: 'rgba(255, 222, 89, 0.4)',
            background: 'rgba(255, 222, 89, 0.06)'
          }}
        >
          <div className="badge" style={{ marginBottom: 10 }}>
            🚧 {copy.welcomeTitle}
          </div>

          <div className="card-section-title" style={{ fontSize: 20 }}>
            {copy.welcomeTitle}
          </div>

          <p className="card-section-subtitle" style={{ marginTop: 8 }}>
            {copy.welcomeBody}
          </p>

          <div className="grid two" style={{ marginTop: 12, gap: 10 }}>
            <div className="card card-soft">
              <div>{copy.welcomeBullet1}</div>
            </div>
            <div className="card card-soft">
              <div>{copy.welcomeBullet2}</div>
            </div>
            <div className="card card-soft">
              <div>{copy.welcomeBullet3}</div>
            </div>
            <div className="card card-soft">
              <div>{copy.welcomeBullet4}</div>
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <Link className="btn primary" to="/new">
              {copy.welcomeCta}
            </Link>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-section-title">{copy.filtersTitle}</div>
        <p className="card-section-subtitle">
          {copy.filtersIntro}
        </p>

        <div className="grid two" style={{ marginTop: 12 }}>
          <div>
            <div className="muted" style={{ marginBottom: 6 }}>{copy.postType}</div>
            <select className="input" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">{copy.allPostTypes}</option>
              <option value="need_crew">{lang === 'es' ? 'Se necesita cuadrilla' : 'Need Crew'}</option>
              <option value="looking_for_work">{lang === 'es' ? 'Buscando trabajo' : 'Looking for Work'}</option>
              <option value="discussion">{lang === 'es' ? 'Discusión' : 'Discussion'}</option>
            </select>
          </div>

          <div>
            <div className="muted" style={{ marginBottom: 6 }}>{copy.posterRole}</div>
            <select className="input" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="all">{copy.allRoles}</option>
              <option value="laborer">{roleLabel('laborer', lang)}</option>
              <option value="subcontractor">{roleLabel('subcontractor', lang)}</option>
              <option value="contractor">{roleLabel('contractor', lang)}</option>
              <option value="supplier">{roleLabel('supplier', lang)}</option>
            </select>
          </div>

          <div>
            <div className="muted" style={{ marginBottom: 6 }}>{copy.crewStatus}</div>
            <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">{copy.allStatuses}</option>
              <option value="open">{crewStatusLabel('open', lang)}</option>
              <option value="full">{crewStatusLabel('full', lang)}</option>
              <option value="closed">{crewStatusLabel('closed', lang)}</option>
            </select>
          </div>

          <div>
            <div className="muted" style={{ marginBottom: 6 }}>{copy.search}</div>
            <input
              className="input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={copy.searchPlaceholder}
            />
          </div>
        </div>

        <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            className="btn"
            onClick={() => {
              setTypeFilter('all')
              setRoleFilter('all')
              setStatusFilter('all')
              setSearchQuery('')
            }}
          >
            {copy.clearFilters}
          </button>

          <span className="badge" style={{ color: '#ff751f' }}>
            {copy.showing} {filteredPosts.length} {copy.of} {posts.length}
          </span>
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="card card-soft">
          <div className="card-section-title">{t(lang, 'feed_empty_title')}</div>
          <p className="card-section-subtitle">
            {showWelcomeCard ? copy.emptyBetter : copy.noMatchBody}
          </p>

          <div style={{ marginTop: 10 }}>
            <button
              className="btn primary"
              onClick={() => {
                if (showWelcomeCard) {
                  navigate('/new')
                  return
                }

                setTypeFilter('all')
                setRoleFilter('all')
                setStatusFilter('all')
                setSearchQuery('')
              }}
            >
              {showWelcomeCard ? copy.welcomeCta : copy.resetFilters}
            </button>
          </div>
        </div>
      ) : (
        <div className="list">
          {filteredPosts.map((p) => {
            const typeStyles = getPostTypeStyles(p.post_type || 'discussion')
            const isOpportunity = p.post_type === 'need_crew' || p.post_type === 'looking_for_work'

            return (
              <div
                key={p.id}
                className="card"
                style={typeStyles.card}
              >
                <div className="postMeta" style={{ marginBottom: 8 }}>
                  <span className="badge" style={typeStyles.badge}>
                    {postTypeLabel(p.post_type || 'discussion', lang)}
                  </span>

                  {p.trade_name ? (
                    <span className="badge" style={tradeBadgeStyle()}>
                      {p.trade_name}
                    </span>
                  ) : null}

                  <span className="badge">{t(lang, 'feed_zip')} {p.center_zip}</span>
                  <span className="badge">{p.radius_miles} {t(lang, 'feed_radius')}</span>

                  {p.author_role ? (
                    <span className="badge" style={roleBadgeStyle(p.author_role)}>
                      {roleLabel(p.author_role, lang)}
                    </span>
                  ) : null}

                  {p.author_available ? (
                    <span className="badge" style={availabilityBadgeStyle(true)}>
                      {copy.available}
                    </span>
                  ) : null}

                  {p.post_type === 'need_crew' ? (
                    <span className="badge" style={crewStatusBadgeStyle(p.crew_status || 'open')}>
                      {crewStatusLabel(p.crew_status || 'open', lang)}
                    </span>
                  ) : null}
                </div>

                <Link to={`/p/${p.id}`} className="postTitle" style={{ display: 'block' }}>
                  {p.title}
                </Link>

                <div className="postMeta" style={{ marginTop: 6 }}>
                  <Link to={`/u/${p.author_id}`}>{p.author_name}</Link>
                  <span>•</span>
                  <span>{p.created_at ? new Date(p.created_at).toLocaleString() : copy.unknownDate}</span>
                </div>

                {isOpportunity && (
                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      flexWrap: 'wrap',
                      marginTop: 10
                    }}
                  >
                    {p.post_type === 'need_crew' && p.needed_crew_size ? (
                      <>
                        <span className="badge">{copy.crewNeeded}: {p.needed_crew_size}</span>
                        <span className="badge">
                          {copy.filled}: {p.crew_joined_count || 0}/{p.needed_crew_size}
                        </span>
                        <span className="badge">
                          {copy.hired}: {p.crew_hired_count || 0}
                        </span>
                      </>
                    ) : null}

                    {p.compensation ? (
                      <span className="badge">{copy.pay}: {p.compensation}</span>
                    ) : null}

                    {p.start_date ? (
                      <span className="badge">
                        {copy.start}: {new Date(p.start_date).toLocaleDateString()}
                      </span>
                    ) : null}
                  </div>
                )}

                {p.body ? (
                  <div className="postExcerpt">
                    {p.body.slice(0, 180)}
                    {p.body.length > 180 ? '…' : ''}
                  </div>
                ) : null}

                <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <Link className="btn small primary" to={`/p/${p.id}`}>
                    {copy.openPost}
                  </Link>
                  <Link className="btn small" to={`/u/${p.author_id}`}>
                    {copy.viewProfile}
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}