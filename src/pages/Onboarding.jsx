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
      'Set up your profile once so you can join local trade discussions, post opportunities, and appear in the Surplox network.',
    noticeTitle: 'Account Setup',
    noticeBody:
      'Your primary role helps Surplox organize laborers, subcontractors, contractors, and suppliers without locking anyone into one use case forever.',
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
    bio: 'Bio',
    bioPlaceholder: 'Tell nearby crews and contractors what kind of work you do.',
    save: 'Complete Setup',
    saving: 'Saving…',
    success: 'Your account has been set up.',
    errSignedIn: 'You must be signed in to continue.',
    errDisplayName: 'Display name is required.',
    errFirstName: 'First name is required.',
    errLastName: 'Last name is required.',
    errRole: 'Select your primary role.',
    errTrade: 'Select your trade.',
    errCity: 'City is required.',
    errZip: 'Enter a valid 5-digit ZIP code.',
    errPhone: 'Enter a valid phone number.',
    errEmailRequired: 'Email is required.',
    errEmailValid: 'Enter a valid email address.',
    errLanguage: 'Select a valid language.',
    errGeneric: 'Unable to complete account setup.'
  },
  es: {
    loading: 'Cargando configuración de cuenta…',
    title: 'Completa tu cuenta de Surplox',
    intro:
      'Configura tu perfil una sola vez para unirte a conversaciones locales del oficio, publicar oportunidades y aparecer dentro de la red de Surplox.',
    noticeTitle: 'Configuración de cuenta',
    noticeBody:
      'Tu rol principal ayuda a Surplox a organizar trabajadores, subcontratistas, contratistas y proveedores sin encerrarte en un solo uso para siempre.',
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
    bio: 'Biografía',
    bioPlaceholder: 'Cuéntales a cuadrillas y contratistas cercanos qué tipo de trabajo haces.',
    save: 'Completar configuración',
    saving: 'Guardando…',
    success: 'Tu cuenta ha sido configurada.',
    errSignedIn: 'Debes iniciar sesión para continuar.',
    errDisplayName: 'El nombre visible es obligatorio.',
    errFirstName: 'El nombre es obligatorio.',
    errLastName: 'El apellido es obligatorio.',
    errRole: 'Selecciona tu rol principal.',
    errTrade: 'Selecciona tu oficio.',
    errCity: 'La ciudad es obligatoria.',
    errZip: 'Ingresa un código postal válido de 5 dígitos.',
    errPhone: 'Ingresa un número de teléfono válido.',
    errEmailRequired: 'El correo electrónico es obligatorio.',
    errEmailValid: 'Ingresa un correo electrónico válido.',
    errLanguage: 'Selecciona un idioma válido.',
    errGeneric: 'No se pudo completar la configuración de la cuenta.'
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

  const languageOptions = useMemo(
    () => [
      { value: 'en', label: 'English' },
      { value: 'es', label: 'Español' }
    ],
    []
  )

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

      const preferredLanguage = prof?.preferred_language || localStorage.getItem('surplox_lang') || lang || 'en'

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
      if (!form.first_name.trim()) throw new Error(copy.errFirstName)
      if (!form.last_name.trim()) throw new Error(copy.errLastName)
      if (!ROLE_OPTIONS.some((x) => x.value === form.role)) throw new Error(copy.errRole)
      if (!form.trade_id) throw new Error(copy.errTrade)
      if (!form.city.trim()) throw new Error(copy.errCity)
      if (!/^[0-9]{5}$/.test(form.home_zip)) throw new Error(copy.errZip)

      const phoneDigits = normalizePhone(form.phone)
      if (phoneDigits.length < 10) throw new Error(copy.errPhone)

      if (!form.email.trim()) throw new Error(copy.errEmailRequired)
      if (!isValidEmail(form.email)) throw new Error(copy.errEmailValid)
      if (!['en', 'es'].includes(form.preferred_language)) throw new Error(copy.errLanguage)

      const { error: profErr } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          display_name: form.display_name.trim(),
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          role: form.role,
          trade_id: Number(form.trade_id),
          travel_radius_miles: Number(form.travel_radius_miles),
          crew_size: Number(form.crew_size),
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
          phone: phoneDigits,
          city: form.city.trim(),
          email: form.email.trim().toLowerCase()
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

      <p className="muted">
        {copy.intro}
      </p>

      <div className="card card-notice" style={{ marginBottom: 12 }}>
        <div className="card-section-title">{copy.noticeTitle}</div>
        <p className="card-section-subtitle">
          {copy.noticeBody}
        </p>
      </div>

      {msg && (
        <div className="card card-message" style={{ marginBottom: 12 }}>
          {msg}
        </div>
      )}

      <div className="grid two">
        <div>
          <div className="muted" style={{ marginBottom: 6 }}>{copy.displayName}</div>
          <input
            className="input"
            value={form.display_name}
            onChange={(e) => setField('display_name', e.target.value)}
          />
        </div>

        <div>
          <div className="muted" style={{ marginBottom: 6 }}>{copy.primaryRole}</div>
          <select
            className="input"
            value={form.role}
            onChange={(e) => setField('role', e.target.value)}
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {roleLabel(option)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="muted" style={{ marginBottom: 6 }}>{copy.trade}</div>
          <select
            className="input"
            value={form.trade_id}
            onChange={(e) => setField('trade_id', e.target.value)}
          >
            <option value="">{copy.selectTrade}</option>
            {trades.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div>
          <div className="muted" style={{ marginBottom: 6 }}>{copy.firstName}</div>
          <input
            className="input"
            value={form.first_name}
            onChange={(e) => setField('first_name', e.target.value)}
          />
        </div>

        <div>
          <div className="muted" style={{ marginBottom: 6 }}>{copy.lastName}</div>
          <input
            className="input"
            value={form.last_name}
            onChange={(e) => setField('last_name', e.target.value)}
          />
        </div>

        <div>
          <div className="muted" style={{ marginBottom: 6 }}>{copy.email}</div>
          <input
            className="input"
            type="email"
            value={form.email}
            onChange={(e) => setField('email', e.target.value)}
          />
        </div>

        <div>
          <div className="muted" style={{ marginBottom: 6 }}>{copy.phone}</div>
          <input
            className="input"
            value={form.phone}
            onChange={(e) => setField('phone', e.target.value)}
            placeholder="(214) 555-5555"
          />
        </div>

        <div>
          <div className="muted" style={{ marginBottom: 6 }}>{copy.city}</div>
          <input
            className="input"
            value={form.city}
            onChange={(e) => setField('city', e.target.value)}
          />
        </div>

        <div>
          <div className="muted" style={{ marginBottom: 6 }}>{copy.homeZip}</div>
          <input
            className="input"
            value={form.home_zip}
            onChange={(e) => setField('home_zip', e.target.value)}
            placeholder="76031"
          />
        </div>

        <div>
          <div className="muted" style={{ marginBottom: 6 }}>{copy.travelRadius}</div>
          <input
            className="input"
            type="number"
            value={form.travel_radius_miles}
            onChange={(e) => setField('travel_radius_miles', e.target.value)}
          />
        </div>

        <div>
          <div className="muted" style={{ marginBottom: 6 }}>{copy.crewSize}</div>
          <input
            className="input"
            type="number"
            min="1"
            value={form.crew_size}
            onChange={(e) => setField('crew_size', e.target.value)}
          />
        </div>

        <div>
          <div className="muted" style={{ marginBottom: 6 }}>{copy.preferredLanguage}</div>
          <select
            className="input"
            value={form.preferred_language}
            onChange={(e) => {
              const nextLang = e.target.value
              setField('preferred_language', nextLang)
              localStorage.setItem('surplox_lang', nextLang)
              if (typeof setLang === 'function') setLang(nextLang)
            }}
          >
            {languageOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div className="muted" style={{ marginBottom: 6 }}>{copy.bio}</div>
        <textarea
          className="input"
          rows={4}
          value={form.bio}
          onChange={(e) => setField('bio', e.target.value)}
          placeholder={copy.bioPlaceholder}
        />
      </div>

      <div style={{ marginTop: 14 }}>
        <button className="btn primary" onClick={save} disabled={saving}>
          {saving ? copy.saving : copy.save}
        </button>
      </div>
    </div>
  )
}