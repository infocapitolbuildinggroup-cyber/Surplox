import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { t } from '../i18n'

const POST_TYPE_PRIORITY = {
  need_crew: 0,
  looking_for_work: 1,
  discussion: 2
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

export default function Feed() {
  const location = useLocation()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [posts, setPosts] = useState([])
  const [lang, setLang] = useState(localStorage.getItem('surplox_lang') || 'en')

  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const tradeParam = params.get('trade')

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

        const userLang = prof?.preferred_language || 'en'
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
            trades(name),
            profiles(display_name, role)
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

        if (needCrewPostIds.length > 0) {
          const { data: crewRows, error: crewErr } = await supabase
            .from('crew_memberships')
            .select('post_id')
            .in('post_id', needCrewPostIds)

          if (crewErr) throw crewErr

          ;(crewRows || []).forEach((row) => {
            const current = crewCountMap.get(row.post_id) || 0
            crewCountMap.set(row.post_id, current + 1)
          })
        }

        filtered = (filtered || [])
          .map((post) => ({
            ...post,
            trade_name: post.trades?.name || '',
            author_name: post.profiles?.display_name || 'Unknown Member',
            author_role: post.profiles?.role || '',
            crew_joined_count: crewCountMap.get(post.id) || 0
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
        setErr(e?.message || 'Something went wrong while loading your feed.')
      } finally {
        if (!alive) return
        setLoading(false)
      }
    }

    load()
    return () => {
      alive = false
    }
  }, [navigate, tradeParam])

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

      {posts.length === 0 ? (
        <div className="card card-soft">
          <div className="card-section-title">{t(lang, 'feed_empty_title')}</div>
          <p className="card-section-subtitle">
            {t(lang, 'feed_empty_body')}
          </p>

          <div style={{ marginTop: 10 }}>
            <Link className="btn primary" to="/new">{t(lang, 'feed_start_post')}</Link>
          </div>
        </div>
      ) : (
        <div className="list">
          {posts.map((p) => {
            const typeStyles = getPostTypeStyles(p.post_type || 'discussion')
            const isOpportunity = p.post_type === 'need_crew' || p.post_type === 'looking_for_work'

            return (
              <Link
                key={p.id}
                to={`/p/${p.id}`}
                className="card"
                style={typeStyles.card}
              >
                <div className="postMeta" style={{ marginBottom: 8 }}>
                  <span className="badge" style={typeStyles.badge}>
                    {postTypeLabel(p.post_type || 'discussion', lang)}
                  </span>

                  {p.trade_name ? <span className="badge">{p.trade_name}</span> : null}
                  <span className="badge">{t(lang, 'feed_zip')} {p.center_zip}</span>
                  <span className="badge">{p.radius_miles} {t(lang, 'feed_radius')}</span>
                  {p.author_role ? <span className="badge">{roleLabel(p.author_role, lang)}</span> : null}

                  {p.post_type === 'need_crew' ? (
                    <span className="badge" style={crewStatusBadgeStyle(p.crew_status || 'open')}>
                      {crewStatusLabel(p.crew_status || 'open', lang)}
                    </span>
                  ) : null}
                </div>

                <div className="postTitle">{p.title}</div>

                <div className="postMeta">
                  <span>{p.author_name}</span>
                  <span>•</span>
                  <span>{new Date(p.created_at).toLocaleString()}</span>
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
                        <span className="badge">Crew Needed: {p.needed_crew_size}</span>
                        <span className="badge">
                          Filled: {p.crew_joined_count || 0}/{p.needed_crew_size}
                        </span>
                      </>
                    ) : null}

                    {p.compensation ? (
                      <span className="badge">Pay: {p.compensation}</span>
                    ) : null}

                    {p.start_date ? (
                      <span className="badge">
                        Start: {new Date(p.start_date).toLocaleDateString()}
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
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}