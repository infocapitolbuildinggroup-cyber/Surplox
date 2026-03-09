import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'
import { t } from '../i18n'

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

function roleLabel(role) {
  const map = {
    laborer: 'Laborer',
    subcontractor: 'Subcontractor',
    contractor: 'Contractor',
    supplier: 'Supplier'
  }
  return map[role] || role || 'Member'
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

function availabilityBadgeStyle(isAvailable) {
  if (!isAvailable) return {}
  return {
    color: '#ff751f',
    borderColor: 'rgba(255, 222, 89, 0.65)',
    background: 'rgba(255, 222, 89, 0.14)'
  }
}

export default function AdminDirectory() {
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [savingId, setSavingId] = useState(null)
  const [lang, setLang] = useState(localStorage.getItem('surplox_lang') || 'en')

  const [trades, setTrades] = useState([])
  const [profiles, setProfiles] = useState([])
  const [privateRows, setPrivateRows] = useState([])
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    laborers: 0,
    subcontractors: 0,
    contractors: 0,
    suppliers: 0,
    availableWorkers: 0,
    totalPosts: 0,
    needCrewPosts: 0,
    lookingForWorkPosts: 0,
    discussionPosts: 0,
    openCrewPosts: 0,
    fullCrewPosts: 0,
    closedCrewPosts: 0,
    totalComments: 0,
    totalCrewJoins: 0,
    totalHires: 0
  })

  const [filters, setFilters] = useState({
    job_zip: '',
    job_radius_miles: 50,
    trade_id: '',
    min_crew_size: 1,
    q: ''
  })

  const [zipMap, setZipMap] = useState(new Map())

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

        const { data: trows, error: tErr } = await supabase
          .from('trades')
          .select('id, name')
          .order('name')
        if (tErr) throw tErr

        const { data: prows, error: pErr } = await supabase
          .from('profiles')
          .select('user_id, display_name, role, trade_id, home_zip, travel_radius_miles, crew_size, bio, is_available, created_at')
          .order('created_at', { ascending: false })
        if (pErr) throw pErr

        const { data: cprows, error: cpErr } = await supabase
          .from('contact_private')
          .select('user_id, phone, email, city, admin_rating, admin_notes')
        if (cpErr) throw cpErr

        const { data: postsRows, error: postsErr } = await supabase
          .from('posts')
          .select('id, post_type, crew_status')
        if (postsErr) throw postsErr

        const { count: commentsCount, error: commentsErr } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
        if (commentsErr) throw commentsErr

        const { data: crewRows, error: crewErr } = await supabase
          .from('crew_memberships')
          .select('status')
        if (crewErr) throw crewErr

        if (!alive) return

        setTrades(trows || [])
        setProfiles(prows || [])
        setPrivateRows(cprows || [])

        const roleCounts = {
          laborers: 0,
          subcontractors: 0,
          contractors: 0,
          suppliers: 0
        }

        ;(prows || []).forEach((p) => {
          if (p.role === 'laborer') roleCounts.laborers += 1
          if (p.role === 'subcontractor') roleCounts.subcontractors += 1
          if (p.role === 'contractor') roleCounts.contractors += 1
          if (p.role === 'supplier') roleCounts.suppliers += 1
        })

        const totalPosts = (postsRows || []).length
        const needCrewPosts = (postsRows || []).filter((p) => p.post_type === 'need_crew').length
        const lookingForWorkPosts = (postsRows || []).filter((p) => p.post_type === 'looking_for_work').length
        const discussionPosts = (postsRows || []).filter((p) => p.post_type === 'discussion').length
        const openCrewPosts = (postsRows || []).filter((p) => p.post_type === 'need_crew' && (p.crew_status || 'open') === 'open').length
        const fullCrewPosts = (postsRows || []).filter((p) => p.post_type === 'need_crew' && p.crew_status === 'full').length
        const closedCrewPosts = (postsRows || []).filter((p) => p.post_type === 'need_crew' && p.crew_status === 'closed').length

        const totalCrewJoins = (crewRows || []).length
        const totalHires = (crewRows || []).filter((r) => r.status === 'hired').length
        const availableWorkers = (prows || []).filter((p) => p.is_available).length

        setAnalytics({
          totalUsers: (prows || []).length,
          laborers: roleCounts.laborers,
          subcontractors: roleCounts.subcontractors,
          contractors: roleCounts.contractors,
          suppliers: roleCounts.suppliers,
          availableWorkers,
          totalPosts,
          needCrewPosts,
          lookingForWorkPosts,
          discussionPosts,
          openCrewPosts,
          fullCrewPosts,
          closedCrewPosts,
          totalComments: commentsCount || 0,
          totalCrewJoins,
          totalHires
        })

        const allZips = Array.from(
          new Set((prows || []).map((x) => String(x.home_zip || '')).filter((z) => /^[0-9]{5}$/.test(z)))
        )

        const jz = String(filters.job_zip || '')
        if (/^[0-9]{5}$/.test(jz)) allZips.push(jz)

        if (allZips.length > 0) {
          const { data: zrows, error: zErr } = await supabase
            .from('zipcodes')
            .select('zip, lat, lon')
            .in('zip', allZips)
          if (zErr) throw zErr

          const m = new Map((zrows || []).map((z) => [String(z.zip), z]))
          if (!alive) return
          setZipMap(m)
        } else {
          setZipMap(new Map())
        }
      } catch (e) {
        console.error(e)
        if (!alive) return
        setMsg(e?.message || t(lang, 'admin_save_error'))
      } finally {
        if (!alive) return
        setLoading(false)
      }
    }

    load()
    return () => {
      alive = false
    }
  }, [])

  function setF(k, v) {
    setFilters((f) => ({ ...f, [k]: v }))
  }

  const tradeNameById = useMemo(() => {
    const m = new Map()
    trades.forEach((tr) => m.set(String(tr.id), tr.name))
    return m
  }, [trades])

  const privateByUser = useMemo(() => {
    const m = new Map()
    privateRows.forEach((r) => m.set(r.user_id, r))
    return m
  }, [privateRows])

  useEffect(() => {
    let alive = true

    async function ensureJobZip() {
      const jz = String(filters.job_zip || '').trim()
      if (!/^[0-9]{5}$/.test(jz)) return
      if (zipMap.has(jz)) return

      const { data, error } = await supabase
        .from('zipcodes')
        .select('zip, lat, lon')
        .eq('zip', jz)
        .maybeSingle()

      if (error) {
        console.error(error)
        return
      }

      if (!alive) return

      if (data?.zip) {
        setZipMap((prev) => {
          const next = new Map(prev)
          next.set(String(data.zip), data)
          return next
        })
      }
    }

    ensureJobZip()
    return () => {
      alive = false
    }
  }, [filters.job_zip, zipMap])

  const merged = useMemo(() => {
    return profiles.map((p) => {
      const priv = privateByUser.get(p.user_id) || {}
      return {
        ...p,
        trade_name: tradeNameById.get(String(p.trade_id)) || '',
        phone: priv.phone || '',
        email: priv.email || '',
        city: priv.city || '',
        admin_rating: priv.admin_rating ?? '',
        admin_notes: priv.admin_notes ?? ''
      }
    })
  }, [profiles, privateByUser, tradeNameById])

  const filtered = useMemo(() => {
    const q = String(filters.q || '').trim().toLowerCase()
    const tradeId = String(filters.trade_id || '')
    const minCrew = Number(filters.min_crew_size || 1)
    const jobZip = String(filters.job_zip || '').trim()
    const jobMiles = Number(filters.job_radius_miles || 0)

    const jobRow = /^[0-9]{5}$/.test(jobZip) ? zipMap.get(jobZip) : null

    return merged
      .filter((r) => {
        if (tradeId && String(r.trade_id) !== tradeId) return false
        if (Number(r.crew_size || 0) < minCrew) return false

        if (q) {
          const hay = [
            r.display_name,
            r.city,
            r.home_zip,
            r.trade_name,
            r.bio,
            r.role
          ].join(' ').toLowerCase()

          if (!hay.includes(q)) return false
        }

        if (/^[0-9]{5}$/.test(jobZip) && jobRow?.lat && jobRow?.lon) {
          const hz = String(r.home_zip || '')
          const homeRow = zipMap.get(hz)
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
      .map((r) => {
        const jobZip2 = String(filters.job_zip || '').trim()
        const jobRow2 = /^[0-9]{5}$/.test(jobZip2) ? zipMap.get(jobZip2) : null
        let distance_miles = null

        if (jobRow2?.lat && jobRow2?.lon) {
          const homeRow = zipMap.get(String(r.home_zip || ''))
          if (homeRow?.lat && homeRow?.lon) {
            distance_miles = haversineMiles(
              Number(jobRow2.lat),
              Number(jobRow2.lon),
              Number(homeRow.lat),
              Number(homeRow.lon)
            )
          }
        }

        return { ...r, distance_miles }
      })
      .sort((a, b) => {
        const ad = a.distance_miles
        const bd = b.distance_miles
        if (typeof ad === 'number' && typeof bd === 'number') return ad - bd
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
  }, [merged, filters, zipMap])

  async function saveAdminFields(userId, admin_rating, admin_notes) {
    setSavingId(userId)
    setMsg('')

    try {
      const ratingNum = admin_rating === '' ? null : Number(admin_rating)

      if (ratingNum !== null && (!Number.isFinite(ratingNum) || ratingNum < 1 || ratingNum > 5)) {
        throw new Error(t(lang, 'admin_rating_error'))
      }

      const { error } = await supabase
        .from('contact_private')
        .update({
          admin_rating: ratingNum,
          admin_notes: String(admin_notes || '')
        })
        .eq('user_id', userId)

      if (error) throw error

      setPrivateRows((prev) =>
        prev.map((r) =>
          r.user_id !== userId
            ? r
            : {
                ...r,
                admin_rating: ratingNum,
                admin_notes: String(admin_notes || '')
              }
        )
      )

      setMsg(t(lang, 'admin_saved'))
    } catch (e) {
      console.error(e)
      setMsg(e?.message || t(lang, 'admin_save_error'))
    } finally {
      setSavingId(null)
    }
  }

  function exportCsv() {
    const header = [
      'display_name',
      'role',
      'trade',
      'home_zip',
      'travel_radius_miles',
      'crew_size',
      'distance_miles',
      'city',
      'phone',
      'email',
      'admin_rating',
      'admin_notes'
    ]

    const rows = filtered.map((r) => [
      r.display_name,
      r.role,
      r.trade_name,
      r.home_zip,
      r.travel_radius_miles,
      r.crew_size,
      typeof r.distance_miles === 'number' ? r.distance_miles.toFixed(1) : '',
      r.city,
      r.phone,
      r.email,
      r.admin_rating,
      r.admin_notes
    ])

    const csv = [header, ...rows]
      .map((line) => line.map(csvEscape).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'surplox_admin_export.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return <div className="card">{t(lang, 'admin_loading')}</div>
  }

  return (
    <div className="grid" style={{ gap: 12 }}>
      <div className="card">
        <div className="h1" style={{ marginTop: 0, fontSize: 24 }}>Admin</div>
        <p className="card-section-subtitle">
          Search the labor network, review private admin notes, and monitor Surplox activity.
        </p>
      </div>

      <div className="card">
        <div className="card-section-title">Platform Analytics</div>

        <div className="grid two" style={{ marginTop: 12 }}>
          <div className="card card-soft">
            <div className="card-section-title" style={{ fontSize: 15 }}>Total Users</div>
            <div className="h1" style={{ fontSize: 28, margin: '8px 0 0' }}>{analytics.totalUsers}</div>
          </div>

          <div className="card card-soft">
            <div className="card-section-title" style={{ fontSize: 15 }}>Available Workers</div>
            <div className="h1" style={{ fontSize: 28, margin: '8px 0 0' }}>{analytics.availableWorkers}</div>
          </div>

          <div className="card card-soft">
            <div className="card-section-title" style={{ fontSize: 15 }}>Laborers</div>
            <div className="h1" style={{ fontSize: 28, margin: '8px 0 0' }}>{analytics.laborers}</div>
          </div>

          <div className="card card-soft">
            <div className="card-section-title" style={{ fontSize: 15 }}>Subcontractors</div>
            <div className="h1" style={{ fontSize: 28, margin: '8px 0 0' }}>{analytics.subcontractors}</div>
          </div>

          <div className="card card-soft">
            <div className="card-section-title" style={{ fontSize: 15 }}>Contractors</div>
            <div className="h1" style={{ fontSize: 28, margin: '8px 0 0' }}>{analytics.contractors}</div>
          </div>

          <div className="card card-soft">
            <div className="card-section-title" style={{ fontSize: 15 }}>Suppliers</div>
            <div className="h1" style={{ fontSize: 28, margin: '8px 0 0' }}>{analytics.suppliers}</div>
          </div>

          <div className="card card-soft">
            <div className="card-section-title" style={{ fontSize: 15 }}>Total Posts</div>
            <div className="h1" style={{ fontSize: 28, margin: '8px 0 0' }}>{analytics.totalPosts}</div>
          </div>

          <div className="card card-soft">
            <div className="card-section-title" style={{ fontSize: 15 }}>Comments</div>
            <div className="h1" style={{ fontSize: 28, margin: '8px 0 0' }}>{analytics.totalComments}</div>
          </div>

          <div className="card card-soft">
            <div className="card-section-title" style={{ fontSize: 15 }}>Need Crew</div>
            <div className="h1" style={{ fontSize: 28, margin: '8px 0 0' }}>{analytics.needCrewPosts}</div>
          </div>

          <div className="card card-soft">
            <div className="card-section-title" style={{ fontSize: 15 }}>Looking for Work</div>
            <div className="h1" style={{ fontSize: 28, margin: '8px 0 0' }}>{analytics.lookingForWorkPosts}</div>
          </div>

          <div className="card card-soft">
            <div className="card-section-title" style={{ fontSize: 15 }}>Discussions</div>
            <div className="h1" style={{ fontSize: 28, margin: '8px 0 0' }}>{analytics.discussionPosts}</div>
          </div>

          <div className="card card-soft">
            <div className="card-section-title" style={{ fontSize: 15 }}>Crew Joins</div>
            <div className="h1" style={{ fontSize: 28, margin: '8px 0 0' }}>{analytics.totalCrewJoins}</div>
          </div>

          <div className="card card-soft">
            <div className="card-section-title" style={{ fontSize: 15 }}>Hires</div>
            <div className="h1" style={{ fontSize: 28, margin: '8px 0 0' }}>{analytics.totalHires}</div>
          </div>

          <div className="card card-soft">
            <div className="card-section-title" style={{ fontSize: 15 }}>Open Crew Posts</div>
            <div className="h1" style={{ fontSize: 28, margin: '8px 0 0' }}>{analytics.openCrewPosts}</div>
          </div>

          <div className="card card-soft">
            <div className="card-section-title" style={{ fontSize: 15 }}>Full Crew Posts</div>
            <div className="h1" style={{ fontSize: 28, margin: '8px 0 0' }}>{analytics.fullCrewPosts}</div>
          </div>

          <div className="card card-soft">
            <div className="card-section-title" style={{ fontSize: 15 }}>Closed Crew Posts</div>
            <div className="h1" style={{ fontSize: 28, margin: '8px 0 0' }}>{analytics.closedCrewPosts}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-section-title">{t(lang, 'admin_title')}</div>
        <p className="card-section-subtitle">{t(lang, 'admin_intro')}</p>

        <div className="grid two" style={{ marginTop: 12 }}>
          <div>
            <div className="muted" style={{ marginBottom: 6 }}>{t(lang, 'admin_filter_trade')}</div>
            <select
              className="input"
              value={filters.trade_id}
              onChange={(e) => setF('trade_id', e.target.value)}
            >
              <option value="">{t(lang, 'admin_filter_all_trades')}</option>
              {trades.map((tr) => (
                <option key={tr.id} value={String(tr.id)}>
                  {tr.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="muted" style={{ marginBottom: 6 }}>{t(lang, 'admin_filter_min_crew')}</div>
            <input
              className="input"
              type="number"
              min="1"
              value={filters.min_crew_size}
              onChange={(e) => setF('min_crew_size', e.target.value)}
            />
          </div>

          <div>
            <div className="muted" style={{ marginBottom: 6 }}>{t(lang, 'admin_filter_job_zip')}</div>
            <input
              className="input"
              value={filters.job_zip}
              onChange={(e) => setF('job_zip', e.target.value)}
              placeholder="76001"
            />
          </div>

          <div>
            <div className="muted" style={{ marginBottom: 6 }}>{t(lang, 'admin_filter_radius')}</div>
            <input
              className="input"
              type="number"
              min="1"
              value={filters.job_radius_miles}
              onChange={(e) => setF('job_radius_miles', e.target.value)}
            />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <div className="muted" style={{ marginBottom: 6 }}>{t(lang, 'admin_filter_search')}</div>
            <input
              className="input"
              value={filters.q}
              onChange={(e) => setF('q', e.target.value)}
              placeholder={t(lang, 'admin_filter_search_placeholder')}
            />
          </div>
        </div>

        <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn primary" onClick={exportCsv}>
            {t(lang, 'admin_export_csv')}
          </button>
          <span className="badge">{filtered.length} results</span>
        </div>
      </div>

      {msg ? <div className="card card-message">{msg}</div> : null}

      <div className="list">
        {filtered.map((r) => (
          <div key={r.user_id} className="card">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                alignItems: 'flex-start',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ flex: 1, minWidth: 280 }}>
                <div className="postMeta" style={{ marginBottom: 8 }}>
                  <Link to={`/u/${r.user_id}`}>{r.display_name || 'Unknown Member'}</Link>
                  {r.role ? (
                    <span className="badge" style={roleBadgeStyle(r.role)}>
                      {roleLabel(r.role)}
                    </span>
                  ) : null}
                  {r.is_available ? (
                    <span className="badge" style={availabilityBadgeStyle(true)}>
                      Available
                    </span>
                  ) : null}
                  {r.trade_name ? <span className="badge">{r.trade_name}</span> : null}
                  {r.distance_miles != null ? (
                    <span className="badge">{r.distance_miles.toFixed(1)} mi away</span>
                  ) : null}
                </div>

                <div className="grid two">
                  <div className="card card-soft">
                    <div className="card-section-title" style={{ fontSize: 15 }}>Location</div>
                    <div className="muted" style={{ marginTop: 6 }}>
                      {r.city || 'Unknown city'} • ZIP {r.home_zip || 'N/A'}
                    </div>
                  </div>

                  <div className="card card-soft">
                    <div className="card-section-title" style={{ fontSize: 15 }}>Crew / Radius</div>
                    <div className="muted" style={{ marginTop: 6 }}>
                      Crew Size: {r.crew_size || 0} • Radius: {r.travel_radius_miles || 0} miles
                    </div>
                  </div>
                </div>

                <div className="card card-soft" style={{ marginTop: 12 }}>
                  <div className="card-section-title" style={{ fontSize: 15 }}>Contact</div>
                  <div className="stack-sm" style={{ marginTop: 8 }}>
                    <div className="muted">Phone: {r.phone || 'Not provided'}</div>
                    <div className="muted">Email: {r.email || 'Not provided'}</div>
                    <div className="muted">City: {r.city || 'Not provided'}</div>
                  </div>
                </div>

                {r.bio ? (
                  <div className="card card-soft" style={{ marginTop: 12 }}>
                    <div className="card-section-title" style={{ fontSize: 15 }}>Bio</div>
                    <div className="muted" style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>
                      {r.bio}
                    </div>
                  </div>
                ) : null}
              </div>

              <div style={{ width: 320, maxWidth: '100%' }}>
                <div className="card card-soft">
                  <div className="card-section-title" style={{ fontSize: 15 }}>
                    {t(lang, 'admin_private_title')}
                  </div>

                  <div style={{ marginTop: 10 }}>
                    <div className="muted" style={{ marginBottom: 6 }}>
                      {t(lang, 'admin_rating_label')}
                    </div>
                    <input
                      className="input"
                      type="number"
                      min="1"
                      max="5"
                      value={r.admin_rating ?? ''}
                      onChange={(e) => {
                        const next = e.target.value
                        setPrivateRows((prev) =>
                          prev.map((row) =>
                            row.user_id === r.user_id ? { ...row, admin_rating: next } : row
                          )
                        )
                      }}
                    />
                  </div>

                  <div style={{ marginTop: 10 }}>
                    <div className="muted" style={{ marginBottom: 6 }}>
                      {t(lang, 'admin_notes_label')}
                    </div>
                    <textarea
                      className="input"
                      value={r.admin_notes || ''}
                      onChange={(e) => {
                        const next = e.target.value
                        setPrivateRows((prev) =>
                          prev.map((row) =>
                            row.user_id === r.user_id ? { ...row, admin_notes: next } : row
                          )
                        )
                      }}
                      placeholder={t(lang, 'admin_notes_placeholder')}
                    />
                  </div>

                  <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button
                      className="btn primary"
                      disabled={savingId === r.user_id}
                      onClick={() => saveAdminFields(r.user_id, r.admin_rating, r.admin_notes)}
                    >
                      {savingId === r.user_id ? t(lang, 'admin_saving') : t(lang, 'admin_save')}
                    </button>

                    <Link className="btn" to={`/u/${r.user_id}`}>
                      View Profile
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}