import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function NewPost() {
  const [trades, setTrades] = useState([])
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

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
      if (!form.title.trim()) throw new Error('Post title is required')
      if (!form.body.trim()) throw new Error('Post details are required')
      if (!/^[0-9]{5}$/.test(form.center_zip)) throw new Error('Enter a valid 5-digit ZIP code')

      const radius = Number(form.radius_miles)
      if (!radius || radius < 1 || radius > 300) {
        throw new Error('Radius must be between 1 and 300 miles')
      }

      const { data: zipRow, error: zipErr } = await supabase
        .from('zipcodes')
        .select('lat, lon')
        .eq('zip', form.center_zip)
        .maybeSingle()

      if (zipErr) throw zipErr
      if (!zipRow) throw new Error('ZIP code not found in the database')

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
      setMsg(err.message || 'Unable to create post')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card" style={{ maxWidth: 860, margin: '0 auto' }}>
      <div className="h1">Create a New Post</div>

      <p className="muted">
        Start a discussion for nearby members by choosing a trade, writing your post,
        and setting the ZIP code and radius where it should appear.
      </p>

      <div className="card card-notice" style={{ marginBottom: 12 }}>
        <div className="card-section-title">Post Visibility</div>
        <p className="card-section-subtitle">
          Your post will only appear to members whose location falls within the ZIP and radius you choose.
        </p>
      </div>

      <div className="grid two">
        <div>
          <div className="muted" style={{ marginBottom: 6 }}>Trade Channel</div>
          <select
            className="input"
            value={form.trade_id}
            onChange={(e) => setField('trade_id', e.target.value)}
          >
            <option value="">General Discussion</option>
            {trades.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div>
          <div className="muted" style={{ marginBottom: 6 }}>Radius (miles)</div>
          <input
            className="input"
            type="number"
            value={form.radius_miles}
            onChange={(e) => setField('radius_miles', e.target.value)}
          />
        </div>

        <div>
          <div className="muted" style={{ marginBottom: 6 }}>ZIP Code</div>
          <input
            className="input"
            value={form.center_zip}
            onChange={(e) => setField('center_zip', e.target.value)}
            placeholder="76031"
          />
        </div>

        <div className="card card-soft" style={{ borderStyle: 'dashed' }}>
          <div className="badge">Example</div>
          <p className="card-section-subtitle" style={{ marginTop: 8 }}>
            A post created in <span className="kbd">76031</span> with a
            <span className="kbd"> 100 mile </span>
            radius will be shown to nearby members inside that area.
          </p>
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        <div className="muted" style={{ marginBottom: 6 }}>Post Title</div>
        <input
          className="input"
          value={form.title}
          onChange={(e) => setField('title', e.target.value)}
          placeholder="Example: Best way to set bollards in rocky soil?"
        />
      </div>

      <div style={{ marginTop: 10 }}>
        <div className="muted" style={{ marginBottom: 6 }}>Post Details</div>
        <textarea
          className="input"
          value={form.body}
          onChange={(e) => setField('body', e.target.value)}
          placeholder="Describe the situation, your location, and what kind of help or feedback you need."
        />
      </div>

      {msg && (
        <div className="card card-message" style={{ marginTop: 12 }}>
          {msg}
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <button className="btn primary" onClick={create} disabled={saving}>
          {saving ? 'Publishing…' : 'Publish Post'}
        </button>
      </div>
    </div>
  )
}