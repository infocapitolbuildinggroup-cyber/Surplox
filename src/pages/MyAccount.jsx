import React, { useEffect, useMemo, useState } from 'react'
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
    zipInvalid: 'Enter a valid 5-digit ZIP code.',
    tradeRequired: 'Select your trade.',
    emailInvalid: 'Enter a valid email address.',
    phoneInvalid: 'Enter a valid phone number.',
    languageInvalid: 'Select a valid language.',
    success: 'Your account has been updated.',
    saveError: 'Unable to save your account changes.',
    title: 'My Surplox Account',
    intro: 'Review and update your account information below.',
    noticeTitle: 'Progressive Profile Completion',
    noticeBody:
      'You are already inside the app. Add more account details over time to improve profile strength, trust, and visibility.',
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
    bio: 'Bio / Experience / Certifications',
    bioPlaceholder:
      'Share what kind of work you do, your experience level, and any certifications or capabilities you want people to see.',
    selectTrade: 'Select your trade',
    inviteTitle: 'Invite Your Crew',
    inviteBody:
      'Use your personal Surplox invite link to bring classmates, coworkers, or people from your crew onto the network before the event.',
    copyInvite: 'Copy Invite Link',
    shareInvite: 'Share Invite',
    textInvite: 'Text Invite',
    emailInvite: 'Email Invite',
    inviteCopied: 'Your invite link was copied.',
    inviteCopyError: 'Unable to copy your invite link right now.',
    inviteShareError: 'Unable to open the share menu right now.',
    inviteTextError: 'Unable to open text invite right now.',
    inviteEmailError: 'Unable to open email invite right now.',
    invitePreviewLabel: 'Your invite link',
    save: 'Save Changes',
    saving: 'Saving…',
    completionTitle: 'Recommended next steps',
    completionBody:
      'Complete these when you can so your profile is stronger when contractors, crews, or other workers look at it.',
    completionCrew: 'Add crew size',
    completionBio: 'Add experience and certifications in your bio',
    completionPhone: 'Add phone number',
    completionCity: 'Add city',
    completionFirstLast: 'Add first and last name',
    completionRole: 'Add primary role'
  },
  es: {
    loading: 'Cargando tu cuenta…',
    signedInRequired: 'Debes iniciar sesión para actualizar tu cuenta.',
    displayNameRequired: 'El nombre visible es obligatorio.',
    zipInvalid: 'Ingresa un código postal válido de 5 dígitos.',
    tradeRequired: 'Selecciona tu oficio.',
    emailInvalid: 'Ingresa un correo electrónico válido.',
    phoneInvalid: 'Ingresa un número de teléfono válido.',
    languageInvalid: 'Selecciona un idioma válido.',
    success: 'Tu cuenta ha sido actualizada.',
    saveError: 'No se pudieron guardar los cambios de tu cuenta.',
    title: 'Mi cuenta de Surplox',
    intro: 'Revisa y actualiza la información de tu cuenta abajo.',
    noticeTitle: 'Perfil progresivo',
    noticeBody:
      'Ya estás dentro de la app. Agrega más detalles con el tiempo para mejorar la fuerza, confianza y visibilidad de tu perfil.',
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
    bio: 'Biografía / Experiencia / Certificaciones',
    bioPlaceholder:
      'Comparte qué tipo de trabajo haces, tu nivel de experiencia y cualquier certificación o capacidad que quieras mostrar.',
    selectTrade: 'Selecciona tu oficio',
    inviteTitle: 'Invita a tu cuadrilla',
    inviteBody:
      'Usa tu enlace personal de Surplox para invitar compañeros de clase, compañeros de trabajo o gente de tu cuadrilla antes del evento.',
    copyInvite: 'Copiar enlace',
    shareInvite: 'Compartir',
    textInvite: 'Invitar por texto',
    emailInvite: 'Invitar por correo',
    inviteCopied: 'Tu enlace de invitación fue copiado.',
    inviteCopyError: 'No se pudo copiar tu enlace en este momento.',
    inviteShareError: 'No se pudo abrir el menú para compartir.',
    inviteTextError: 'No se pudo abrir la invitación por texto.',
    inviteEmailError: 'No se pudo abrir la invitación por correo.',
    invitePreviewLabel: 'Tu enlace de invitación',
    save: 'Guardar cambios',
    saving: 'Guardando…',
    completionTitle: 'Siguientes pasos recomendados',
    completionBody:
      'Completa esto cuando puedas para que tu perfil sea más fuerte cuando contratistas, cuadrillas u otros trabajadores lo vean.',
    completionCrew: 'Agregar tamaño de cuadrilla',
    completionBio: 'Agregar experiencia y certificaciones en tu biografía',
    completionPhone: 'Agregar número de teléfono',
    completionCity: 'Agregar ciudad',
    completionFirstLast: 'Agregar nombre y apellido',
    completionRole: 'Agregar rol principal'
  }
}

export default function MyAccount({ lang: langProp = 'en', setLang: setGlobalLang }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [trades, setTrades] = useState([])
  const [lang, setLang] = useState(langProp || localStorage.getItem('surplox_lang') || 'en')
  const [inviteCode, setInviteCode] = useState('')

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

  function buildInviteUrl() {
    const base = `${window.location.origin}/join`
    return inviteCode ? `${base}?ref=${encodeURIComponent(inviteCode)}` : base
  }

  function getInviteText() {
    const name = form.display_name?.trim() || 'A Surplox member'
    const message =
      lang === 'es'
        ? `${name} te invitó a unirte a Surplox, la red local de construcción para cuadrillas, trabajo y actividad del oficio.`
        : `${name} invited you to join Surplox, the local construction network for crews, work, and trade activity.`

    return `${message}\n\n${buildInviteUrl()}`
  }

  async function copyInviteLink() {
    try {
      await navigator.clipboard.writeText(buildInviteUrl())
      setMsg(copy.inviteCopied)
    } catch (err) {
      console.error(err)
      setMsg(copy.inviteCopyError)
    }
  }

  async function shareInviteLink() {
    try {
      const shareData = {
        title: 'Surplox',
        text: getInviteText(),
        url: buildInviteUrl()
      }

      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await copyInviteLink()
      }
    } catch (err) {
      if (err?.name === 'AbortError') return
      console.error(err)
      setMsg(copy.inviteShareError)
    }
  }

  function textInvite() {
    try {
      window.open(`sms:?&body=${encodeURIComponent(getInviteText())}`, '_self')
    } catch (err) {
      console.error(err)
      setMsg(copy.inviteTextError)
    }
  }

  function emailInvite() {
    try {
      const subject = encodeURIComponent('Join me on Surplox')
      const body = encodeURIComponent(getInviteText())
      window.location.href = `mailto:?subject=${subject}&body=${body}`
    } catch (err) {
      console.error(err)
      setMsg(copy.inviteEmailError)
    }
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

        setInviteCode(user.id)
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

  const completionItems = useMemo(() => {
    const items = []

    if (!String(form.first_name || '').trim() || !String(form.last_name || '').trim()) {
      items.push(copy.completionFirstLast)
    }

    if (!String(form.role || '').trim()) {
      items.push(copy.completionRole)
    }

    if (!Number(form.crew_size || 0) || Number(form.crew_size || 0) <= 1) {
      items.push(copy.completionCrew)
    }

    if (!String(form.bio || '').trim()) {
      items.push(copy.completionBio)
    }

    if (!String(form.phone || '').trim()) {
      items.push(copy.completionPhone)
    }

    if (!String(form.city || '').trim()) {
      items.push(copy.completionCity)
    }

    return items
  }, [form, copy])

  async function save() {
    setSaving(true)
    setMsg('')

    const activeCopy = COPY[form.preferred_language] || COPY.en

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user

      if (!user) throw new Error(activeCopy.signedInRequired)
      if (!form.display_name.trim()) throw new Error(activeCopy.displayNameRequired)
      if (!/^[0-9]{5}$/.test(form.home_zip)) throw new Error(activeCopy.zipInvalid)
      if (!form.trade_id) throw new Error(activeCopy.tradeRequired)

      const phoneDigits = normalizePhone(form.phone)
      if (form.phone.trim() && phoneDigits.length < 10) throw new Error(activeCopy.phoneInvalid)
      if (form.email.trim() && !isValidEmail(form.email)) throw new Error(activeCopy.emailInvalid)
      if (!['en', 'es'].includes(form.preferred_language)) {
        throw new Error(activeCopy.languageInvalid)
      }

      const displayName = form.display_name.trim()
      const firstName = form.first_name.trim() || displayName.split(/\s+/)[0] || displayName

      const { error: profErr } = await supabase.from('profiles').upsert({
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

      const { error: cpErr } = await supabase.from('contact_private').upsert({
        user_id: user.id,
        phone: phoneDigits || null,
        city: form.city.trim() || null,
        email: form.email.trim() ? form.email.trim().toLowerCase() : null
      })

      if (cpErr) throw cpErr

      localStorage.setItem('surplox_lang', form.preferred_language)
      setLang(form.preferred_language)

      if (typeof setGlobalLang === 'function') {
        await setGlobalLang(form.preferred_language)
      }

      setMsg(activeCopy.success)
    } catch (err) {
      console.error(err)
      setMsg(err.message || activeCopy.saveError)
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

      <div
        className="card"
        style={{
          marginBottom: 12,
          borderColor: 'rgba(255, 222, 89, 0.32)',
          background: 'rgba(255, 222, 89, 0.05)'
        }}
      >
        <div className="card-section-title">{copy.inviteTitle}</div>
        <p className="card-section-subtitle" style={{ marginTop: 6 }}>
          {copy.inviteBody}
        </p>

        <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn small primary" onClick={copyInviteLink}>
            {copy.copyInvite}
          </button>
          <button className="btn small" onClick={shareInviteLink}>
            {copy.shareInvite}
          </button>
          <button className="btn small" onClick={textInvite}>
            {copy.textInvite}
          </button>
          <button className="btn small" onClick={emailInvite}>
            {copy.emailInvite}
          </button>
        </div>

        <div
          className="card card-soft"
          style={{
            marginTop: 10,
            padding: 12,
            borderColor: 'rgba(255, 222, 89, 0.18)',
            background: 'rgba(255, 222, 89, 0.03)'
          }}
        >
          <div className="muted" style={{ marginBottom: 6 }}>
            {copy.invitePreviewLabel}
          </div>
          <div className="muted" style={{ wordBreak: 'break-all' }}>
            {buildInviteUrl()}
          </div>
        </div>
      </div>

      {completionItems.length > 0 ? (
        <div className="card card-soft" style={{ marginBottom: 12 }}>
          <div className="card-section-title">{copy.completionTitle}</div>
          <p className="card-section-subtitle" style={{ marginTop: 6 }}>
            {copy.completionBody}
          </p>

          <div className="grid" style={{ gap: 8, marginTop: 10 }}>
            {completionItems.map((item) => (
              <div key={item}>• {item}</div>
            ))}
          </div>
        </div>
      ) : null}

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
          <div className="muted" style={{ marginBottom: 6 }}>{copy.zip}</div>
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
          <div className="muted" style={{ marginBottom: 6 }}>{copy.radius}</div>
          <input className="input" type="number" value={form.travel_radius_miles} onChange={(e) => setField('travel_radius_miles', e.target.value)} />
        </div>

        <div>
          <div className="muted" style={{ marginBottom: 6 }}>{copy.crewSize}</div>
          <input className="input" type="number" value={form.crew_size} onChange={(e) => setField('crew_size', e.target.value)} />
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

      <div style={{ marginTop: 12 }}>
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