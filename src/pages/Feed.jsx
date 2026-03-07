import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { t } from '../i18n'

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
          .select('id, title, body, created_at, center_zip, radius_miles, trade_id')
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
          {posts.map((p) => (
            <Link key={p.id} to={`/p/${p.id}`} className="card">
              <div className="postTitle">{p.title}</div>

              <div className="postMeta">
                <span className="badge">{t(lang, 'feed_zip')} {p.center_zip}</span>
                <span className="badge">{p.radius_miles} {t(lang, 'feed_radius')}</span>
                <span>{new Date(p.created_at).toLocaleString()}</span>
              </div>

              {p.body ? (
                <div className="postExcerpt">
                  {p.body.slice(0, 140)}
                  {p.body.length > 140 ? '…' : ''}
                </div>
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}