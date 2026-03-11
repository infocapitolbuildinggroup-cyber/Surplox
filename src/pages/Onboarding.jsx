import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

const ROLE_OPTIONS = [
  { value: 'laborer', label: { en: 'Laborer', es: 'Trabajador' } },
  { value: 'subcontractor', label: { en: 'Subcontractor', es: 'Subcontratista' } },
  { value: 'contractor', label: { en: 'Contractor', es: 'Contratista' } },
  { value: 'supplier', label: { en: 'Supplier', es: 'Proveedor' } }
]

const COPY = {
  en: {
    loading: 'Loading account setup…',
    title: 'Complete Your Surplox Account',
    intro:
      'You are already inside Surplox. Add the rest of your profile details when you are ready so your account carries more weight.',
    noticeTitle: 'Progressive Completion',
    noticeBody:
      'Only your display name, trade, and ZIP are required to get inside the app. Everything else can be completed later.',
    displayName: 'Display Name',
    primaryRole: 'Primary Role',
    trade: 'Trade',
    selectTrade: 'Select your trade',
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email Address',
    phone: 'Phone Number',
    city: 'City',
    homeZip: 'Home ZIP Code',
    travelRadius: 'Travel Radius (Miles)',
    crewSize: 'Crew Size',
    preferredLanguage: 'Preferred Language',
    bio: 'Bio / Experience',
    bioPlaceholder: 'Tell nearby crews and contractors what kind of work you do.',
    save: 'Save Details',
    saving: 'Saving…',
    success: 'Your account details have been updated.',
    errSignedIn: 'You must be signed in to continue.',
    errDisplayName: 'Display name is required.',
    errTrade: 'Select your trade.',
    errZip: 'Enter a valid 5-digit ZIP code.',
    errPhone: 'Enter a valid phone number.',
    errEmailValid: 'Enter a valid email address.',
    errLanguage: 'Select a valid language.',
    errGeneric: 'Unable to save account setup.',
    doLater: 'Do This Later',
    goFeed: 'Go to Feed'
  },
  es: {
    loading: 'Cargando configuración de cuenta…',
    title: 'Completa tu cuenta de Surplox',
    intro:
      'Ya estás dentro de Surplox. Agrega el resto de tu perfil cuando quieras para que tu cuenta tenga más peso.',
    noticeTitle: 'Completar progresivamente',
    noticeBody:
      'Solo tu nombre visible, oficio y ZIP son requeridos para entrar a la app. Todo lo demás se puede completar después.',
    displayName: 'Nombre visible',
    primaryRole: 'Rol principal',
    trade: 'Oficio',
    selectTrade: 'Selecciona tu oficio',
    firstName: 'Nombre',
    lastName: 'Apellido',
    email: 'Correo electrónico',
    phone: 'Número de teléfono',
    city: 'Ciudad',
    homeZip: 'Código postal',
    travelRadius: 'Radio de viaje (millas)',
    crewSize: 'Tamaño de cuadrilla',
    preferredLanguage: 'Idioma preferido',
    bio: 'Biografía / Experiencia',
    bioPlaceholder: 'Cuéntales a cuadrillas y contratistas cercanos qué tipo de trabajo haces.',
    save: 'Guardar detalles',
    saving: 'Guardando…',
    success: 'Los detalles de tu cuenta han sido actualizados.',
    errSignedIn: 'Debes iniciar sesión para continuar.',
    errDisplayName: 'El nombre visible es obligatorio.',
    errTrade: 'Selecciona tu oficio.',
    errZip: 'Ingresa un código postal válido de 5 dígitos.',
    errPhone: 'Ingresa un número de teléfono válido.',
    errEmailValid: 'Ingresa un correo electrónico válido.',
    errLanguage: 'Selecciona un idioma válido.',
    errGeneric: 'No se pudieron guardar los detalles de la cuenta.',
    doLater: 'Hacer esto después',
    goFeed: 'Ir al feed'
  }
}

export default function Onboarding({ lang = 'en', setLang }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [trades, setTrades] = useState([])
  const navigate = useNavigate()

  const [form, setForm] = useState({
    display_name: '',
    first_name: '',
    last_name: '',
    role: 'laborer',
    trade_id: '',
    home_zip: '',
    travel_radius_miles: 50,
    crew_size: 1,
    bio: '',
    phone: '',
    city: '',
    email: '',
    preferred_language: lang || 'en'
  })

  const copy = COPY[form.preferred_language] || COPY.en

  const languageOptions = useMemo(
    () => [
      { value: 'en', label: 'English' },
      { value: 'es', label: 'Español' }
    ],
    []
  )

  function setField(k, v) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  function normalizePhone(raw) {
    return String(raw || '').replace(/\D/g, '')
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim())
  }

  function roleLabel(option) {
    return option.label[form.preferred_language] || option.label.en
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

      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      const { data: cp } = await supabase
        .from('contact_private')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      const preferredLanguage =
        prof?.preferred_language || localStorage.getItem('surplox_lang') || lang || 'en'

      setForm({
        display_name: prof?.display_name || '',
        first_name: prof?.first_name || '',
        last_name: prof?.last_name || '',
        role: prof?.role || 'laborer',
        trade_id: prof?.trade_id ? String(prof.trade_id) : '',
        home_zip: prof?.home_zip || '',
        travel_radius_miles: prof?.travel_radius_miles ?? 50,
        crew_size: prof?.crew_size ?? 1,
        bio: prof?.bio || '',
        phone: cp?.phone || '',
        city: cp?.city || '',
        email: cp?.email || user.email || '',
        preferred_language: preferredLanguage
      })

      if (typeof setLang === 'function') {
        setLang(preferredLanguage)
      }

      setLoading(false)
    }

    load()
  }, [lang, navigate, setLang])

  async function save() {
    setSaving(true)
    setMsg('')

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user

      if (!user) throw new Error(copy.errSignedIn)
      if (!form.display_name.trim()) throw new Error(copy.errDisplayName)
      if (!form.trade_id) throw new Error(copy.errTrade)
      if (!/^[0-9]{5}$/.test(form.home_zip)) throw new Error(copy.errZip)

      const phoneDigits = normalizePhone(form.phone)
      if (form.phone.trim() && phoneDigits.length < 10) throw new Error(copy.errPhone)
      if (form.email.trim() && !isValidEmail(form.email)) throw new Error(copy.errEmailValid)
      if (!['en', 'es'].includes(form.preferred_language)) throw new Error(copy.errLanguage)

      const displayName = form.display_name.trim()
      const firstName = form.first_name.trim() || displayName.split(/\s+/)[0] || displayName

      const { error: profErr } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          display_name: displayName,
          first_name: firstName,
          last_name: form.last_name.trim(),
          role: form.role || 'laborer',
          trade_id: Number(form.trade_id),
          travel_radius_miles: Number(form.travel_radius_miles || 50),
          crew_size: Number(form.crew_size || 1),
          bio: form.bio.trim(),
          preferred_language: form.preferred_language
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
          phone: phoneDigits || null,
          city: form.city.trim() || null,
          email: form.email.trim() ? form.email.trim().toLowerCase() : null
        })

      if (cpErr) throw cpErr

      localStorage.setItem('surplox_lang', form.preferred_language)
      if (typeof setLang === 'function') {
        await setLang(form.preferred_language)
      }

      setMsg(copy.success)
      navigate('/feed', { replace: true })
    } catch (err) {
      console.error(err)
      setMsg(err.message || copy.errGeneric)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="card">{copy.loading}</div>

  return (
    <div className="card" style={{ maxWidth: 860, margin: '0 auto' }}>
      <div className="h1">{copy.title}</div>

      <p className="muted">{copy.intro}</p>

      <div className="card card-notice" style={{ marginBottom: 12 }}>
        <div className="card-section-title">{copy.noticeTitle}</div>
        <p className="card-section-subtitle">{copy.noticeBody}</p>
      </div>

      {msg && (
        <div className="card card-message" style={{ marginBottom: 12 }}>
          {msg}
        </div>
      )}

      <div className="grid two">
        <div>
          <div className="muted" style={{ marginBottom: 6 }}>{copy.displayName}</div>
          <input className="input" value={form.display_name} onChange={(e) => setField('display_name', e.target.value)} />
        </div>

        <div>
          <div className="muted" style={{ marginBottom: 6 }}>{copy.primaryRole}</div>
          <select className="input" value={form.role} onChange={(e) => setField('role', e.target.value)}>
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {roleLabel(option)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="muted" style={{ marginBottom: 6 }}>{copy.trade}</div>
          <select className="input" value={form.trade_id} onChange={(e) => setField('trade_id', e.target.value)}>
            <option value="">{copy.selectTrade}</option>
            {trades.map((trade) => (
              <option key={trade.id} value={trade.id}>
                {trade.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="muted" style={{ marginBottom: 6 }}>{copy.homeZip}</div>
          <input className="input" value={form.home_zip} onChange={(e) => setField('home_zip', e.target.value)} />
        </div>

        <div>
          <div className="muted" style={{ marginBottom: 6 }}>{copy.firstName}</div>
          <input className="input" value={form.first_name} onChange={(e) => setField('first_name', e.target.value)} />
        </div>

        <div>
          <div className="muted" style={{ marginBottom: 6 }}>{copy.lastName}</div>
          <input className="input" value={form.last_name} onChange={(e) => setField('last_name', e.target.value)} />
        </div>

        <div>
          <div className="muted" style={{ marginBottom: 6 }}>{copy.email}</div>
          <input className="input" type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} />
        </div>

        <div>
          <div className="muted" style={{ marginBottom: 6 }}>{copy.phone}</div>
          <input className="input" value={form.phone} onChange={(e) => setField('phone', e.target.value)} />
        </div>

        <div>
          <div className="muted" style={{ marginBottom: 6 }}>{copy.city}</div>
          <input className="input" value={form.city} onChange={(e) => setField('city', e.target.value)} />
        </div>

        <div>
          <div className="muted" style={{ marginBottom: 6 }}>{copy.travelRadius}</div>
          <input className="input" type="number" value={form.travel_radius_miles} onChange={(e) => setField('travel_radius_miles', e.target.value)} />
        </div>

        <div>
          <div className="muted" style={{ marginBottom: 6 }}>{copy.crewSize}</div>
          <input className="input" type="number" value={form.crew_size} onChange={(e) => setField('crew_size', e.target.value)} />
        </div>

        <div>
          <div className="muted" style={{ marginBottom: 6 }}>{copy.preferredLanguage}</div>
          <select className="input" value={form.preferred_language} onChange={(e) => setField('preferred_language', e.target.value)}>
            {languageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div className="muted" style={{ marginBottom: 6 }}>{copy.bio}</div>
        <textarea
          className="input"
          value={form.bio}
          onChange={(e) => setField('bio', e.target.value)}
          placeholder={copy.bioPlaceholder}
        />
      </div>

      <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button className="btn primary" onClick={save} disabled={saving}>
          {saving ? copy.saving : copy.save}
        </button>

        <button className="btn" onClick={() => navigate('/feed')} disabled={saving}>
          {copy.doLater}
        </button>

        <button className="btn" onClick={() => navigate('/feed')} disabled={saving}>
          {copy.goFeed}
        </button>
      </div>
    </div>
  )
}