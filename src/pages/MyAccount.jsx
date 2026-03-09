import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const ROLE_OPTIONS = [
  { value: 'laborer', label: { en: 'Laborer', es: 'Trabajador' } },
  { value: 'subcontractor', label: { en: 'Subcontractor', es: 'Subcontratista' } },
  { value: 'contractor', label: { en: 'Contractor', es: 'Contratista' } },
  { value: 'supplier', label: { en: 'Supplier', es: 'Proveedor' } }
]

const COPY = {
  en: {
    loading: 'Loading your account…',
    signedInRequired: 'You must be signed in to update your account.',
    displayNameRequired: 'Display name is required.',
    firstNameRequired: 'First name is required.',
    lastNameRequired: 'Last name is required.',
    roleRequired: 'Select your primary role.',
    cityRequired: 'City is required.',
    zipInvalid: 'Enter a valid 5-digit ZIP code.',
    tradeRequired: 'Select your trade.',
    phoneInvalid: 'Enter a valid phone number.',
    emailRequired: 'Email is required.',
    emailInvalid: 'Enter a valid email address.',
    languageInvalid: 'Select a valid language.',
    success: 'Your account has been updated.',
    saveError: 'Unable to save your account changes.',
    title: 'My Surplox Account',
    intro: 'Review and update your account information below.',
    noticeTitle: 'Account Setup',
    noticeBody:
      'Your role, trade, ZIP code, and language help Surplox route local opportunities and build a better labor network over time.',
    displayName: 'Display Name',
    primaryRole: 'Primary Role',
    trade: 'Trade',
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email Address',
    phone: 'Phone Number',
    city: 'City',
    zip: 'Home ZIP Code',
    radius: 'Travel Radius (Miles)',
    crewSize: 'Crew Size',
    language: 'Preferred Language',
    bio: 'Bio',
    bioPlaceholder:
      'Share what kind of work you do, where you work, and what crews or capabilities you have.',
    selectTrade: 'Select your trade',
    save: 'Save Changes',
    saving: 'Saving…'
  },
  es: {
    loading: 'Cargando tu cuenta…',
    signedInRequired: 'Debes iniciar sesión para actualizar tu cuenta.',
    displayNameRequired: 'El nombre visible es obligatorio.',
    firstNameRequired: 'El nombre es obligatorio.',
    lastNameRequired: 'El apellido es obligatorio.',
    roleRequired: 'Selecciona tu rol principal.',
    cityRequired: 'La ciudad es obligatoria.',
    zipInvalid: 'Ingresa un código postal válido de 5 dígitos.',
    tradeRequired: 'Selecciona tu oficio.',
    phoneInvalid: 'Ingresa un número de teléfono válido.',
    emailRequired: 'El correo electrónico es obligatorio.',
    emailInvalid: 'Ingresa un correo electrónico válido.',
    languageInvalid: 'Selecciona un idioma válido.',
    success: 'Tu cuenta ha sido actualizada.',
    saveError: 'No se pudieron guardar los cambios de tu cuenta.',
    title: 'Mi cuenta de Surplox',
    intro: 'Revisa y actualiza la información de tu cuenta abajo.',
    noticeTitle: 'Configuración de cuenta',
    noticeBody:
      'Tu rol, oficio, código postal e idioma ayudan a Surplox a mostrar oportunidades locales y construir una mejor red laboral con el tiempo.',
    displayName: 'Nombre visible',
    primaryRole: 'Rol principal',
    trade: 'Oficio',
    firstName: 'Nombre',
    lastName: 'Apellido',
    email: 'Correo electrónico',
    phone: 'Número de teléfono',
    city: 'Ciudad',
    zip: 'Código postal',
    radius: 'Radio de viaje (millas)',
    crewSize: 'Tamaño de cuadrilla',
    language: 'Idioma preferido',
    bio: 'Biografía',
    bioPlaceholder:
      'Comparte qué tipo de trabajo haces, dónde trabajas y qué cuadrillas o capacidades tienes.',
    selectTrade: 'Selecciona tu oficio',
    save: 'Guardar cambios',
    saving: 'Guardando…'
  }
}

export default function MyAccount({ lang: langProp = 'en', setLang: setGlobalLang }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [trades, setTrades] = useState([])
  const [lang, setLang] = useState(langProp || localStorage.getItem('surplox_lang') || 'en')

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
    preferred_language: 'en'
  })

  const copy = COPY[lang] || COPY.en

  useEffect(() => {
    setLang(langProp || localStorage.getItem('surplox_lang') || 'en')
  }, [langProp])

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
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

      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const user = sessionData.session?.user

        if (!user) {
          setLoading(false)
          return
        }

        const { data: tradeRows, error: tradeErr } = await supabase
          .from('trades')
          .select('id,name')
          .order('name')

        if (tradeErr) console.error(tradeErr)

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

        const userLang =
          prof?.preferred_language || langProp || localStorage.getItem('surplox_lang') || 'en'

        setLang(userLang)
        localStorage.setItem('surplox_lang', userLang)
        setTrades(tradeRows || [])

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
          preferred_language: userLang
        })
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [langProp])

  async function save() {
    setSaving(true)
    setMsg('')

    const activeCopy = COPY[form.preferred_language] || COPY.en

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user

      if (!user) throw new Error(activeCopy.signedInRequired)
      if (!form.display_name.trim()) throw new Error(activeCopy.displayNameRequired)
      if (!form.first_name.trim()) throw new Error(activeCopy.firstNameRequired)
      if (!form.last_name.trim()) throw new Error(activeCopy.lastNameRequired)
      if (!ROLE_OPTIONS.some((x) => x.value === form.role)) throw new Error(activeCopy.roleRequired)
      if (!form.city.trim()) throw new Error(activeCopy.cityRequired)
      if (!/^[0-9]{5}$/.test(form.home_zip)) throw new Error(activeCopy.zipInvalid)
      if (!form.trade_id) throw new Error(activeCopy.tradeRequired)

      const phoneDigits = normalizePhone(form.phone)
      if (phoneDigits.length < 10) throw new Error(activeCopy.phoneInvalid)

      if (!form.email.trim()) throw new Error(activeCopy.emailRequired)
      if (!isValidEmail(form.email)) throw new Error(activeCopy.emailInvalid)
      if (!['en', 'es'].includes(form.preferred_language)) {
        throw new Error(activeCopy.languageInvalid)
      }

      const { error: profErr } = await supabase.from('profiles').upsert({
        user_id: user.id,
        display_name: form.display_name.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        role: form.role,
        trade_id: Number(form.trade_id),
        travel_radius_miles: Number(form.travel_radius_miles),
        crew_size: Number(form.crew_size),
        bio: form.bio,
        preferred_language: form.preferred_language
      })

      if (profErr) throw profErr

      const { error: zipErr } = await supabase.rpc('set_my_home_zip', {
        p_zip: form.home_zip
      })

      if (zipErr) throw zipErr

      const { error: cpErr } = await supabase.from('contact_private').upsert({
        user_id: user.id,
        phone: phoneDigits,
        city: form.city.trim(),
        email: form.email.trim().toLowerCase()
      })

      if (cpErr) throw cpErr

      localStorage.setItem('surplox_lang', form.preferred_language)
      setLang(form.preferred_language)

      if (typeof setGlobalLang === 'function') {
        await setGlobalLang(form.preferred_language)
      }

      setMsg(activeCopy.success)
    } catch (err) {
      setMsg(err.message || activeCopy.saveError)
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
            {trades.map((trade) => (
              <option key={trade.id} value={trade.id}>
                {trade.name}
              </option>
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
          <div className="muted" style={{ marginBottom: 6 }}>{copy.zip}</div>
          <input
            className="input"
            value={form.home_zip}
            onChange={(e) => setField('home_zip', e.target.value)}
          />
        </div>

        <div>
          <div className="muted" style={{ marginBottom: 6 }}>{copy.radius}</div>
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
            value={form.crew_size}
            onChange={(e) => setField('crew_size', e.target.value)}
          />
        </div>

        <div>
          <div className="muted" style={{ marginBottom: 6 }}>{copy.language}</div>
          <select
            className="input"
            value={form.preferred_language}
            onChange={(e) => {
              const nextLang = e.target.value
              setField('preferred_language', nextLang)
              setLang(nextLang)
              localStorage.setItem('surplox_lang', nextLang)
            }}
          >
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        <div className="muted" style={{ marginBottom: 6 }}>{copy.bio}</div>
        <textarea
          className="input"
          value={form.bio}
          onChange={(e) => setField('bio', e.target.value)}
          placeholder={copy.bioPlaceholder}
        />
      </div>

      <div style={{ marginTop: 12 }}>
        <button className="btn primary" onClick={save} disabled={saving}>
          {saving ? copy.saving : copy.save}
        </button>
      </div>
    </div>
  )
}