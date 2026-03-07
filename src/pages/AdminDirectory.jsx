import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'
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

export default function AdminDirectory() {
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [savingId, setSavingId] = useState(null)
  const [lang, setLang] = useState(localStorage.getItem('surplox_lang') || 'en')

  const [trades, setTrades] = useState([])
  const [profiles, setProfiles] = useState([])
  const [privateRows, setPrivateRows] = useState([])

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
          .select('user_id, display_name, trade_id, home_zip, travel_radius_miles, crew_size, bio, created_at')
          .order('created_at', { ascending: false })
        if (pErr) throw pErr

        const { data: cprows, error: cpErr } = await supabase
          .from('contact_private')
          .select('user_id, phone, email, city, admin_rating, admin_notes')
        if (cpErr) throw cpErr

        if (!alive) return
        setTrades(trows || [])
        setProfiles(prows || [])
        setPrivateRows(cprows || [])

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
            r.bio
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
            : { ...r, admin_rating: ratingNum, admin_notes: String(admin_notes || '') }
        )
      )
    } catch (e) {
      console.error(e)
      setMsg(e?.message || t(lang, 'admin_save_error'))
    } finally {
      setSavingId(null)
    }
  }

  function exportCsv() {
    const cols = [
      'display_name',
      'trade',
      'home_zip',
      'distance_miles',
      'crew_size',
      'city',
      'phone',
      'email',
      'admin_rating',
      'admin_notes'
    ]

    const lines = [cols.join(',')]

    filtered.forEach((r) => {
      const row = [
        r.display_name,
        r.trade_name,
        r.home_zip,
        typeof r.distance_miles === 'number' ? r.distance_miles.toFixed(1) : '',
        r.crew_size,
        r.city,
        r.phone,
        r.email,
        r.admin_rating,
        r.admin_notes
      ].map(csvEscape).join(',')

      lines.push(row)
    })

    const blob = new Blob([lines.join('\n')], {
      type: 'text/csv;charset=utf-8;'
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `surplox_crews_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return <div className="card">{t(lang, 'admin_loading')}</div>
  }

  return (
    <div className="grid" style={{ gap: 12 }}>
      <div className="card">
        <div className="h1" style={{ fontSize: 20, marginTop: 0 }}>{t(lang, 'admin_title')}</div>
        <p className="muted">
          {t(lang, 'admin_intro')}
        </p>

        {msg && (
          <div className="card card-message" style={{ marginTop: 12 }}>
            {msg}
          </div>
        )}

        <div className="grid two" style={{ marginTop: 12 }}>
          <div>
            <div className="muted" style={{ marginBottom: 6 }}>{t(lang, 'admin_job_zip')}</div>
            <input
              className="input"
              value={filters.job_zip}
              onChange={(e) => setF('job_zip', e.target.value)}
              placeholder="76031"
            />
          </div>

          <div>
            <div className="muted" style={{ marginBottom: 6 }}>{t(lang, 'admin_search_radius')}</div>
            <input
              className="input"
              type="number"
              value={filters.job_radius_miles}
              onChange={(e) => setF('job_radius_miles', e.target.value)}
              min="1"
            />
          </div>

          <div>
            <div className="muted" style={{ marginBottom: 6 }}>{t(lang, 'admin_trade')}</div>
            <select
              className="input"
              value={filters.trade_id}
              onChange={(e) => setF('trade_id', e.target.value)}
            >
              <option value="">{t(lang, 'admin_all_trades')}</option>
              {trades.map((tr) => (
                <option key={tr.id} value={tr.id}>{tr.name}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="muted" style={{ marginBottom: 6 }}>{t(lang, 'admin_min_crew')}</div>
            <input
              className="input"
              type="number"
              value={filters.min_crew_size}
              onChange={(e) => setF('min_crew_size', e.target.value)}
              min="1"
            />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <div className="muted" style={{ marginBottom: 6 }}>{t(lang, 'admin_search_label')}</div>
            <input
              className="input"
              value={filters.q}
              onChange={(e) => setF('q', e.target.value)}
              placeholder={t(lang, 'admin_search_placeholder')}
            />
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <button
            className="btn primary"
            onClick={exportCsv}
            disabled={filtered.length === 0}
          >
            {t(lang, 'admin_export')} ({filtered.length})
          </button>
        </div>
      </div>

      <div className="card">
        <div className="h1" style={{ fontSize: 18, marginTop: 0 }}>
          {t(lang, 'admin_results')} ({filtered.length})
        </div>
        <p className="muted">
          {t(lang, 'admin_results_intro')}
        </p>

        <div className="list" style={{ marginTop: 12 }}>
          {filtered.length === 0 ? (
            <div className="card card-soft">
              <div className="card-section-title">{t(lang, 'admin_no_matches')}</div>
              <p className="card-section-subtitle">
                {t(lang, 'admin_no_matches_body')}
              </p>
            </div>
          ) : (
            filtered.map((r) => (
              <div key={r.user_id} className="card">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 10,
                    flexWrap: 'wrap'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>
                      {r.display_name || '(No display name)'}
                    </div>

                    <div className="postMeta" style={{ marginTop: 6 }}>
                      {r.trade_name ? <span className="badge">{r.trade_name}</span> : null}
                      {r.home_zip ? <span className="badge">{t(lang, 'admin_zip')} {r.home_zip}</span> : null}
                      {typeof r.distance_miles === 'number' ? (
                        <span className="badge">{r.distance_miles.toFixed(1)} {t(lang, 'admin_away')}</span>
                      ) : null}
                      {r.crew_size ? <span className="badge">{t(lang, 'admin_crew')} {r.crew_size}</span> : null}
                      {r.city ? <span className="badge">{r.city}</span> : null}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button
                      className="btn small primary"
                      onClick={() => saveAdminFields(r.user_id, r.admin_rating, r.admin_notes)}
                      disabled={savingId === r.user_id}
                    >
                      {savingId === r.user_id ? t(lang, 'admin_saving') : t(lang, 'admin_save_notes')}
                    </button>
                  </div>
                </div>

                <hr />

                <div className="grid two">
                  <div>
                    <div className="muted" style={{ marginBottom: 6 }}>{t(lang, 'admin_phone')}</div>
                    <div className="kbd">{r.phone || '—'}</div>
                  </div>

                  <div>
                    <div className="muted" style={{ marginBottom: 6 }}>{t(lang, 'admin_email')}</div>
                    <div className="kbd">{r.email || '—'}</div>
                  </div>

                  <div>
                    <div className="muted" style={{ marginBottom: 6 }}>{t(lang, 'admin_rating')}</div>
                    <select
                      className="input"
                      value={r.admin_rating === null ? '' : String(r.admin_rating)}
                      onChange={(e) => {
                        const v = e.target.value
                        setPrivateRows((prev) =>
                          prev.map((x) =>
                            x.user_id !== r.user_id
                              ? x
                              : { ...x, admin_rating: v === '' ? null : Number(v) }
                          )
                        )
                      }}
                    >
                      <option value="">—</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                    </select>
                  </div>

                  <div>
                    <div className="muted" style={{ marginBottom: 6 }}>{t(lang, 'admin_notes')}</div>
                    <textarea
                      className="input"
                      value={r.admin_notes || ''}
                      onChange={(e) => {
                        const v = e.target.value
                        setPrivateRows((prev) =>
                          prev.map((x) =>
                            x.user_id !== r.user_id ? x : { ...x, admin_notes: v }
                          )
                        )
                      }}
                      placeholder={t(lang, 'admin_notes_placeholder')}
                    />
                  </div>
                </div>

                {r.bio ? (
                  <>
                    <hr />
                    <div className="muted" style={{ marginBottom: 6 }}>{t(lang, 'admin_bio')}</div>
                    <div>{r.bio}</div>
                  </>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}