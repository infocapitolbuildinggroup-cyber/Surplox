import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function Onboarding() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [trades, setTrades] = useState([])

  const [form, setForm] = useState({
    display_name: '',
    first_name: '',
    last_name: '',
    trade_id: '',
    home_zip: '',
    travel_radius_miles: 50,
    crew_size: 1,
    bio: '',
    phone: '',
    city: '',
    email: ''
  })

  const navigate = useNavigate()

  function setField(k, v) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  function normalizePhone(raw) {
    return String(raw || '').replace(/\D/g, '')
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim())
  }

  useEffect(() => {
    async function load() {
      setLoading(true)
      setMsg('')

      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user

      if (!user) {
        navigate('/auth', { replace: true })
        return
      }

      const { data: tradesData, error: tradesErr } = await supabase
        .from('trades')
        .select('id,name')
        .order('name')

      if (tradesErr) console.error(tradesErr)
      setTrades(tradesData || [])

      const { data: prof, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (profErr) console.error(profErr)

      const { data: cp, error: cpErr } = await supabase
        .from('contact_private')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (cpErr) console.error(cpErr)

      setForm({
        display_name: prof?.display_name || '',
        first_name: prof?.first_name || '',
        last_name: prof?.last_name || '',
        trade_id: prof?.trade_id ? String(prof.trade_id) : '',
        home_zip: prof?.home_zip || '',
        travel_radius_miles: prof?.travel_radius_miles ?? 50,
        crew_size: prof?.crew_size ?? 1,
        bio: prof?.bio || '',
        phone: cp?.phone || '',
        city: cp?.city || '',
        email: cp?.email || user.email || ''
      })

      setLoading(false)
    }

    load()
  }, [navigate])

  async function save() {
    setSaving(true)
    setMsg('')

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user

      if (!user) throw new Error('You must be signed in to continue.')
      if (!form.display_name.trim()) throw new Error('Display name is required.')
      if (!form.first_name.trim()) throw new Error('First name is required.')
      if (!form.last_name.trim()) throw new Error('Last name is required.')
      if (!form.trade_id) throw new Error('Select your trade.')
      if (!form.city.trim()) throw new Error('City is required.')
      if (!/^[0-9]{5}$/.test(form.home_zip)) throw new Error('Enter a valid 5-digit ZIP code.')

      const phoneDigits = normalizePhone(form.phone)
      if (phoneDigits.length < 10) throw new Error('Enter a valid phone number.')

      if (!form.email.trim()) throw new Error('Email is required.')
      if (!isValidEmail(form.email)) throw new Error('Enter a valid email address.')

      const { error: profErr } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          display_name: form.display_name.trim(),
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          trade_id: Number(form.trade_id),
          travel_radius_miles: Number(form.travel_radius_miles),
          crew_size: Number(form.crew_size),
          bio: form.bio
        })

      if (profErr) throw profErr

      const { error: zipErr } = await supabase.rpc('set_my_home_zip', {
        p_zip: form.home_zip
      })

      if (zipErr) throw zipErr

      const { error: cpErr } = await supabase
        .from('contact_private')
        .upsert({
          user_id: user.id,
          phone: phoneDigits,
          city: form.city.trim(),
          email: form.email.trim().toLowerCase()
        })

      if (cpErr) throw cpErr

      navigate('/feed', { replace: true })
    } catch (err) {
      setMsg(err.message || 'Unable to complete account setup.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="card">Loading account setup…</div>

  return (
    <div className="card" style={{ maxWidth: 860, margin: '0 auto' }}>
      <div className="h1">Complete Your Surplox Account</div>

      <p className="muted">
        Set up your profile once so you can join local trade discussions and appear in the Surplox network.
      </p>

      <div className="card card-notice" style={{ marginBottom: 12 }}>
        <div className="card-section-title">Account Setup</div>
        <p className="card-section-subtitle">
          Required account details help maintain quality, trust, and better crew matching across the network.
        </p>
      </div>

      {msg && (
        <div className="card card-message" style={{ marginBottom: 12 }}>
          {msg}
        </div>
      )}

      <div className="grid two">
        <div>
          <div className="muted" style={{ marginBottom: 6 }}>Display Name</div>
          <input
            className="input"
            value={form.display_name}
            onChange={(e) => setField('display_name', e.target.value)}
          />
        </div>

        <div>
          <div className="muted" style={{ marginBottom: 6 }}>Trade</div>
          <select
            className="input"
            value={form.trade_id}
            onChange={(e) => setField('trade_id', e.target.value)}
          >
            <option value="">Select your trade</option>
            {trades.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div>
          <div className="muted" style={{ marginBottom: 6 }}>First Name</div>
          <input
            className="input"
            value={form.first_name}
            onChange={(e) => setField('first_name', e.target.value)}
          />
        </div>

        <div>
          <div className="muted" style={{ marginBottom: 6 }}>Last Name</div>
          <input
            className="input"
            value={form.last_name}
            onChange={(e) => setField('last_name', e.target.value)}
          />
        </div>

        <div>
          <div className="muted" style={{ marginBottom: 6 }}>Email Address</div>
          <input
            className="input"
            type="email"
            value={form.email}
            onChange={(e) => setField('email', e.target.value)}
          />
        </div>

        <div>
          <div className="muted" style={{ marginBottom: 6 }}>Phone Number</div>
          <input
            className="input"
            value={form.phone}
            onChange={(e) => setField('phone', e.target.value)}
            placeholder="(214) 555-5555"
          />
        </div>

        <div>
          <div className="muted" style={{ marginBottom: 6 }}>City</div>
          <input
            className="input"
            value={form.city}
            onChange={(e) => setField('city', e.target.value)}
          />
        </div>

        <div>
          <div className="muted" style={{ marginBottom: 6 }}>Home ZIP Code</div>
          <input
            className="input"
            value={form.home_zip}
            onChange={(e) => setField('home_zip', e.target.value)}
            placeholder="76031"
          />
        </div>

        <div>
          <div className="muted" style={{ marginBottom: 6 }}>Travel Radius (Miles)</div>
          <input
            className="input"
            type="number"
            value={form.travel_radius_miles}
            onChange={(e) => setField('travel_radius_miles', e.target.value)}
          />
        </div>

        <div>
          <div className="muted" style={{ marginBottom: 6 }}>Crew Size</div>
          <input
            className="input"
            type="number"
            value={form.crew_size}
            onChange={(e) => setField('crew_size', e.target.value)}
          />
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        <div className="muted" style={{ marginBottom: 6 }}>Bio</div>
        <textarea
          className="input"
          value={form.bio}
          onChange={(e) => setField('bio', e.target.value)}
          placeholder="Share what kind of work you do, where you work, and what crews or capabilities you have."
        />
      </div>

      <div style={{ marginTop: 12 }}>
        <button className="btn primary" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Finish Setup'}
        </button>
      </div>
    </div>
  )
}