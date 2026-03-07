import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import { t } from '../i18n'

export default function NewPost() {
  const [trades, setTrades] = useState([])
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [lang, setLang] = useState(localStorage.getItem('surplox_lang') || 'en')

  const [form, setForm] = useState({
    trade_id: '',
    title: '',
    body: '',
    center_zip: '',
    radius_miles: 50
  })

  const navigate = useNavigate()

  useEffect(() => {
    async function loadTrades() {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user

      if (user) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('preferred_language')
          .eq('user_id', user.id)
          .maybeSingle()

        const userLang = prof?.preferred_language || 'en'
        setLang(userLang)
        localStorage.setItem('surplox_lang', userLang)
      }

      const { data, error } = await supabase
        .from('trades')
        .select('id,name')
        .order('name')

      if (error) console.error(error)
      setTrades(data || [])
    }

    loadTrades()
  }, [])

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function create() {
    setSaving(true)
    setMsg('')

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user

      if (!user) throw new Error('Not signed in')
      if (!form.title.trim()) throw new Error(t(lang, 'post_title_required'))
      if (!form.body.trim()) throw new Error(t(lang, 'post_body_required'))
      if (!/^[0-9]{5}$/.test(form.center_zip)) throw new Error(t(lang, 'post_zip_invalid'))

      const radius = Number(form.radius_miles)
      if (!radius || radius < 1 || radius > 300) {
        throw new Error(t(lang, 'post_radius_invalid'))
      }

      const { data: zipRow, error: zipErr } = await supabase
        .from('zipcodes')
        .select('lat, lon')
        .eq('zip', form.center_zip)
        .maybeSingle()

      if (zipErr) throw zipErr
      if (!zipRow) throw new Error(t(lang, 'post_zip_missing'))

      const wktPoint = `POINT(${zipRow.lon} ${zipRow.lat})`

      const { data: post, error: insertErr } = await supabase
        .from('posts')
        .insert({
          author_id: user.id,
          trade_id: form.trade_id ? Number(form.trade_id) : null,
          title: form.title.trim(),
          body: form.body.trim(),
          center_zip: form.center_zip,
          center_point: wktPoint,
          radius_miles: radius
        })
        .select('id')
        .single()

      if (insertErr) throw insertErr

      navigate(`/p/${post.id}`, { replace: true })
    } catch (err) {
      setMsg(err.message || t(lang, 'post_create_error'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card" style={{ maxWidth: 860, margin: '0 auto' }}>
      <div className="h1">{t(lang, 'new_post_title')}</div>

      <p className="muted">
        {t(lang, 'new_post_intro')}
      </p>

      <div className="card card-notice" style={{ marginBottom: 12 }}>
        <div className="card-section-title">{t(lang, 'new_post_notice_title')}</div>
        <p className="card-section-subtitle">
          {t(lang, 'new_post_notice_body')}
        </p>
      </div>

      <div className="grid two">
        <div>
          <div className="muted" style={{ marginBottom: 6 }}>{t(lang, 'new_post_trade')}</div>
          <select
            className="input"
            value={form.trade_id}
            onChange={(e) => setField('trade_id', e.target.value)}
          >
            <option value="">{t(lang, 'new_post_general')}</option>
            {trades.map((trow) => (
              <option key={trow.id} value={trow.id}>{trow.name}</option>
            ))}
          </select>
        </div>

        <div>
          <div className="muted" style={{ marginBottom: 6 }}>{t(lang, 'new_post_radius')}</div>
          <input
            className="input"
            type="number"
            value={form.radius_miles}
            onChange={(e) => setField('radius_miles', e.target.value)}
          />
        </div>

        <div>
          <div className="muted" style={{ marginBottom: 6 }}>{t(lang, 'new_post_zip')}</div>
          <input
            className="input"
            value={form.center_zip}
            onChange={(e) => setField('center_zip', e.target.value)}
            placeholder="76031"
          />
        </div>

        <div className="card card-soft" style={{ borderStyle: 'dashed' }}>
          <div className="badge">{t(lang, 'new_post_example')}</div>
          <p className="card-section-subtitle" style={{ marginTop: 8 }}>
            {t(lang, 'new_post_example_body')}
          </p>
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        <div className="muted" style={{ marginBottom: 6 }}>{t(lang, 'new_post_title_label')}</div>
        <input
          className="input"
          value={form.title}
          onChange={(e) => setField('title', e.target.value)}
          placeholder="Example: Best way to set bollards in rocky soil?"
        />
      </div>

      <div style={{ marginTop: 10 }}>
        <div className="muted" style={{ marginBottom: 6 }}>{t(lang, 'new_post_body_label')}</div>
        <textarea
          className="input"
          value={form.body}
          onChange={(e) => setField('body', e.target.value)}
          placeholder={t(lang, 'new_post_body_placeholder')}
        />
      </div>

      {msg && (
        <div className="card card-message" style={{ marginTop: 12 }}>
          {msg}
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <button className="btn primary" onClick={create} disabled={saving}>
          {saving ? t(lang, 'new_post_publishing') : t(lang, 'new_post_publish')}
        </button>
      </div>
    </div>
  )
}