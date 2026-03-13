import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { t } from '../i18n'

const POST_TYPE_OPTIONS = [
  { value: 'discussion', en: 'Discussion', es: 'Discusión' },
  { value: 'need_crew', en: 'Need Crew', es: 'Se necesita cuadrilla' },
  { value: 'looking_for_work', en: 'Looking for Work', es: 'Buscando trabajo' }
]

function postTypeLabel(type, lang) {
  const match = POST_TYPE_OPTIONS.find((x) => x.value === type)
  if (!match) return type
  return lang === 'es' ? match.es : match.en
}

function getValidPostType(type) {
  return POST_TYPE_OPTIONS.some((x) => x.value === type) ? type : 'discussion'
}

function getPostTypeTheme(type) {
  if (type === 'need_crew') {
    return {
      badge: { background: '#ffde59', color: '#111111' },
      hero: { background: 'linear-gradient(180deg, #fff7cf 0%, #ffffff 100%)' },
      panel: { background: '#fffaf0' },
      button: 'btn primary',
      accent: '#ffde59'
    }
  }

  if (type === 'looking_for_work') {
    return {
      badge: { background: '#ffd7b0', color: '#111111' },
      hero: { background: 'linear-gradient(180deg, #fff1e6 0%, #ffffff 100%)' },
      panel: { background: '#fff8f2' },
      button: 'btn',
      accent: '#ffb067'
    }
  }

  return {
    badge: { background: '#ecebe3', color: '#111111' },
    hero: { background: 'linear-gradient(180deg, #f5f4ec 0%, #ffffff 100%)' },
    panel: { background: '#f8f8f4' },
    button: 'btn primary',
    accent: '#d9d7cc'
  }
}

export default function NewPost({ lang: langProp = 'en' }) {
  const [trades, setTrades] = useState([])
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [lang, setLang] = useState(langProp || localStorage.getItem('surplox_lang') || 'en')
  const [profilePromptItems, setProfilePromptItems] = useState([])
  const [profileGateMessage, setProfileGateMessage] = useState('')
  const [profileReadyForPosting, setProfileReadyForPosting] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()

  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const preselectedType = getValidPostType(params.get('type'))

  const [form, setForm] = useState({
    post_type: preselectedType,
    trade_id: '',
    title: '',
    body: '',
    center_zip: '',
    radius_miles: 50,
    needed_crew_size: '',
    compensation: '',
    start_date: '',
    source_language: langProp || localStorage.getItem('surplox_lang') || 'en'
  })

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      post_type: preselectedType
    }))
  }, [preselectedType])

  useEffect(() => {
    async function loadTradesAndProfile() {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user

      if (user) {
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

        const userLang =
          prof?.preferred_language || langProp || localStorage.getItem('surplox_lang') || 'en'

        setLang(userLang)
        localStorage.setItem('surplox_lang', userLang)

        setForm((prev) => ({
          ...prev,
          source_language: prev.source_language || userLang,
          trade_id: prev.trade_id || (prof?.trade_id ? String(prof.trade_id) : ''),
          center_zip: prev.center_zip || String(prof?.home_zip || '')
        }))

        const prompts = []

        if (!String(prof?.first_name || '').trim() || !String(prof?.last_name || '').trim()) {
          prompts.push(userLang === 'es' ? 'Agrega nombre y apellido' : 'Add first and last name')
        }

        if (!String(prof?.role || '').trim()) {
          prompts.push(userLang === 'es' ? 'Agrega rol principal' : 'Add primary role')
        }

        if (!Number(prof?.crew_size || 0) || Number(prof?.crew_size || 0) <= 1) {
          prompts.push(userLang === 'es' ? 'Agrega tamaño de cuadrilla' : 'Add crew size')
        }

        if (!String(prof?.bio || '').trim()) {
          prompts.push(
            userLang === 'es'
              ? 'Agrega experiencia y certificaciones en tu biografía'
              : 'Add experience and certifications in your bio'
          )
        }

        if (!String(cp?.phone || '').trim()) {
          prompts.push(userLang === 'es' ? 'Agrega número de teléfono' : 'Add phone number')
        }

        if (!String(cp?.city || '').trim()) {
          prompts.push(userLang === 'es' ? 'Agrega ciudad' : 'Add city')
        }

        setProfilePromptItems(prompts)

        const hasCorePostingProfile = Boolean(
          prof &&
            String(prof.display_name || '').trim() &&
            String(prof.home_zip || '').trim() &&
            (prof.trade_id || String(prof.bio || '').trim())
        )

        setProfileReadyForPosting(hasCorePostingProfile)
      } else {
        const localLang = langProp || localStorage.getItem('surplox_lang') || 'en'
        setLang(localLang)
        setForm((prev) => ({
          ...prev,
          source_language: prev.source_language || localLang
        }))
      }

      const { data, error } = await supabase.from('trades').select('id,name').order('name')
      if (error) console.error(error)
      setTrades(data || [])
    }

    loadTradesAndProfile()
  }, [langProp])

  useEffect(() => {
    if (!profileReadyForPosting) {
      setProfileGateMessage(
        lang === 'es'
          ? 'Completa tu nombre visible, oficio y ZIP antes de publicar.'
          : 'Complete your display name, trade, and ZIP before posting.'
      )
      return
    }

    if (form.post_type === 'need_crew') {
      const needs = profilePromptItems.filter((item) =>
        [
          'Add crew size',
          'Add phone number',
          'Add city',
          'Agrega tamaño de cuadrilla',
          'Agrega número de teléfono',
          'Agrega ciudad'
        ].includes(item)
      )

      setProfileGateMessage(
        needs.length > 0
          ? lang === 'es'
            ? 'Para publicar "Se necesita cuadrilla", agrega tamaño de cuadrilla, teléfono y ciudad.'
            : 'To publish a Need Crew post, add crew size, phone number, and city.'
          : ''
      )
      return
    }

    if (form.post_type === 'looking_for_work') {
      const needs = profilePromptItems.filter((item) =>
        [
          'Add phone number',
          'Add experience and certifications in your bio',
          'Agrega número de teléfono',
          'Agrega experiencia y certificaciones en tu biografía'
        ].includes(item)
      )

      setProfileGateMessage(
        needs.length > 0
          ? lang === 'es'
            ? 'Para publicar "Buscando trabajo", agrega teléfono y experiencia en tu biografía.'
            : 'To publish a Looking for Work post, add phone number and experience in your bio.'
          : ''
      )
      return
    }

    setProfileGateMessage('')
  }, [form.post_type, lang, profilePromptItems, profileReadyForPosting])

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const helperCopy = useMemo(() => {
    if (lang === 'es') {
      return {
        postType: 'Tipo de publicación',
        postLanguage: 'Idioma de la publicación',
        english: 'English',
        spanish: 'Español',
        crewSize: 'Tamaño de cuadrilla',
        compensation: 'Pago / tarifa',
        startDate: 'Fecha de inicio',
        selectTrade: 'Discusión general',
        crewExample: 'Ejemplo: 2 trabajadores, empieza el lunes, $250/día',
        workExample: 'Ejemplo: soldador disponible esta semana en Dallas',
        crewTitle:
          'Ejemplo: Se necesitan 2 acabadores de concreto en Fort Worth para empezar el lunes',
        workTitle:
          'Ejemplo: Soldador de tubería disponible para trabajo de paro en DFW',
        crewBody:
          'Describe el oficio, dónde está el trabajo, cuánta gente necesitas, cuándo inicia y los detalles de pago.',
        workBody:
          'Describe tu oficio, disponibilidad, radio de viaje, experiencia y qué tipo de trabajo estás buscando.',
        crewRequired:
          'El tamaño de cuadrilla debe ser por lo menos 1 para publicaciones de Se necesita cuadrilla.',
        opportunityIntro:
          'Crea una publicación local de alta visibilidad para que trabajadores y cuadrillas cercanas la encuentren rápidamente.',
        opportunityNotice:
          'Las publicaciones de oportunidad seguirán respetando el ZIP y el radio, pero deben estar escritas con claridad para que los miembros cercanos puedan actuar rápido.',
        discussionTitle:
          'Ejemplo: ¿Cuál es la mejor forma de poner bollards en suelo rocoso?',
        highVisibilityOpportunity: 'Oportunidad de alta visibilidad',
        availabilityPost: 'Publicación de disponibilidad',
        crewCompPlaceholder: '$250/día o $35/hora',
        workCompPlaceholder: '$30/hora deseado o por propuesta',
        invalidPostLanguage: 'Selecciona un idioma válido para la publicación.',
        strengthenTitle: 'Fortalece tu perfil mientras publicas',
        strengthenBody:
          'Ya puedes usar Surplox, pero completar tu perfil hará que tus publicaciones tengan más peso.',
        finishAccount: 'Terminar cuenta',
        heroTitle: 'Create a cleaner, stronger post.',
        heroBody:
          'Use the new flatter Surplox composer to publish faster and look more credible to nearby members.',
        titleLabel: 'Título',
        bodyLabel: 'Detalles',
        radiusLabel: 'Radio (millas)',
        zipLabel: 'ZIP de la publicación',
        publish: 'Publicar',
        publishing: 'Publicando…'
      }
    }

    return {
      postType: 'Post Type',
      postLanguage: 'Post Language',
      english: 'English',
      spanish: 'Español',
      crewSize: 'Crew Size Needed',
      compensation: 'Pay / Rate',
      startDate: 'Start Date',
      selectTrade: 'General Discussion',
      crewExample: 'Example: 2 workers, starts Monday, $250/day',
      workExample: 'Example: welder available this week in Dallas',
      crewTitle: 'Example: Need 2 concrete finishers in Fort Worth starting Monday',
      workTitle: 'Example: Pipe welder available for shutdown work in DFW',
      workBody:
        'Describe your trade, availability, travel radius, experience, and what kind of work you want.',
      crewBody:
        'Describe the trade, where the job is, how many people you need, start timing, and pay details.',
      crewRequired: 'Crew size must be at least 1 for Need Crew posts.',
      opportunityIntro:
        'Create a high-visibility local opportunity post so nearby workers and crews can find it quickly.',
      opportunityNotice:
        'Opportunity posts will still respect ZIP and radius, but they should be written clearly so nearby members can act fast.',
      discussionTitle: 'Example: Best way to set bollards in rocky soil?',
      highVisibilityOpportunity: 'High Visibility Opportunity',
      availabilityPost: 'Availability Post',
      crewCompPlaceholder: '$250/day or $35/hr',
      workCompPlaceholder: '$30/hr desired or bid-based',
      invalidPostLanguage: 'Select a valid post language.',
      strengthenTitle: 'Strengthen your profile while you post',
      strengthenBody:
        'You can already use Surplox, but completing your profile will make your posts carry more weight.',
      finishAccount: 'Finish Account',
      heroTitle: 'Create a cleaner, stronger post.',
      heroBody:
        'Use the new flatter Surplox composer to publish faster and look more credible to nearby members.',
      titleLabel: 'Title',
      bodyLabel: 'Details',
      radiusLabel: 'Radius (miles)',
      zipLabel: 'Post ZIP',
      publish: 'Publish Post',
      publishing: 'Publishing…'
    }
  }, [lang])

  function titlePlaceholder() {
    if (form.post_type === 'need_crew') return helperCopy.crewTitle
    if (form.post_type === 'looking_for_work') return helperCopy.workTitle
    return helperCopy.discussionTitle
  }

  function bodyPlaceholder() {
    if (form.post_type === 'need_crew') return helperCopy.crewBody
    if (form.post_type === 'looking_for_work') return helperCopy.workBody
    return t(lang, 'new_post_body_placeholder')
  }

  function exampleBody() {
    if (form.post_type === 'need_crew') return helperCopy.crewExample
    if (form.post_type === 'looking_for_work') return helperCopy.workExample
    return t(lang, 'new_post_example_body')
  }

  async function create() {
    setSaving(true)
    setMsg('')

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user

      if (!user) {
        throw new Error(lang === 'es' ? 'No has iniciado sesión' : 'Not signed in')
      }

      if (!profileReadyForPosting) {
        throw new Error(profileGateMessage)
      }

      if (form.post_type === 'need_crew' && profileGateMessage) {
        throw new Error(profileGateMessage)
      }

      if (form.post_type === 'looking_for_work' && profileGateMessage) {
        throw new Error(profileGateMessage)
      }

      if (!POST_TYPE_OPTIONS.some((x) => x.value === form.post_type)) {
        throw new Error(
          lang === 'es'
            ? 'Selecciona un tipo de publicación válido.'
            : 'Select a valid post type.'
        )
      }

      if (!['en', 'es'].includes(form.source_language)) {
        throw new Error(helperCopy.invalidPostLanguage)
      }

      if (!form.title.trim()) throw new Error(t(lang, 'post_title_required'))
      if (!form.body.trim()) throw new Error(t(lang, 'post_body_required'))
      if (!/^[0-9]{5}$/.test(form.center_zip)) throw new Error(t(lang, 'post_zip_invalid'))

      const radius = Number(form.radius_miles)
      if (!radius || radius < 1 || radius > 300) {
        throw new Error(t(lang, 'post_radius_invalid'))
      }

      if (form.post_type === 'need_crew') {
        const neededCrew = Number(form.needed_crew_size || 0)
        if (!neededCrew || neededCrew < 1) {
          throw new Error(helperCopy.crewRequired)
        }
      }

      const { data: zipRow, error: zipErr } = await supabase
        .from('zipcodes')
        .select('zip')
        .eq('zip', form.center_zip)
        .maybeSingle()

      if (zipErr) throw zipErr
      if (!zipRow?.zip) throw new Error(t(lang, 'post_zip_missing'))

      const payload = {
        author_id: user.id,
        post_type: form.post_type,
        trade_id: form.trade_id ? Number(form.trade_id) : null,
        title: form.title.trim(),
        body: form.body.trim(),
        center_zip: form.center_zip,
        radius_miles: radius,
        source_language: form.source_language
      }

      if (form.post_type === 'need_crew') {
        payload.needed_crew_size = Number(form.needed_crew_size || 0)
        payload.compensation = form.compensation.trim() || null
        payload.start_date = form.start_date || null
        payload.crew_status = 'open'
      }

      if (form.post_type === 'looking_for_work') {
        payload.compensation = form.compensation.trim() || null
        payload.start_date = form.start_date || null
      }

      const { data: inserted, error: insertErr } = await supabase
        .from('posts')
        .insert(payload)
        .select('id')
        .single()

      if (insertErr) throw insertErr

      navigate(`/p/${inserted.id}`, { replace: true })
    } catch (err) {
      console.error(err)
      setMsg(err.message || t(lang, 'post_create_error'))
    } finally {
      setSaving(false)
    }
  }

  const theme = getPostTypeTheme(form.post_type)

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div
        className="card rounded-xl"
        style={{
          padding: 28,
          ...theme.hero
        }}
      >
        <div className="badge" style={{ ...theme.badge, marginBottom: 14 }}>
          {postTypeLabel(form.post_type, lang)}
        </div>

        <div className="h1" style={{ maxWidth: 860 }}>
          {helperCopy.heroTitle}
        </div>

        <p className="muted" style={{ marginTop: 12, maxWidth: 820, fontSize: 17, lineHeight: 1.7 }}>
          {helperCopy.heroBody}
        </p>

        <div className="card-soft" style={{ marginTop: 16, background: 'rgba(255,255,255,0.58)' }}>
          <div className="card-section-title" style={{ fontSize: 16 }}>
            {form.post_type === 'discussion'
              ? t(lang, 'new_post_notice_title')
              : helperCopy.highVisibilityOpportunity}
          </div>
          <p className="card-section-subtitle" style={{ marginTop: 8 }}>
            {form.post_type === 'discussion'
              ? t(lang, 'new_post_notice_body')
              : helperCopy.opportunityNotice}
          </p>
        </div>
      </div>

      {profileGateMessage ? (
        <div className="card rounded-xl" style={{ padding: 22, background: '#fff4da' }}>
          <div className="card-section-title">{helperCopy.strengthenTitle}</div>
          <p className="card-section-subtitle" style={{ marginTop: 8 }}>
            {helperCopy.strengthenBody}
          </p>

          <div style={{ marginTop: 12, fontWeight: 700 }}>{profileGateMessage}</div>

          {profilePromptItems.length > 0 ? (
            <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {profilePromptItems.map((item) => (
                <span key={item} className="badge">
                  {item}
                </span>
              ))}
            </div>
          ) : null}

          <div style={{ marginTop: 14 }}>
            <Link className="btn primary" to="/account">
              {helperCopy.finishAccount}
            </Link>
          </div>
        </div>
      ) : null}

      {msg ? (
        <div className="card-message" style={{ padding: 14, borderRadius: 18 }}>
          {msg}
        </div>
      ) : null}

      <div className="grid two" style={{ alignItems: 'start' }}>
        <div className="card rounded-xl" style={{ padding: 24 }}>
          <div className="card-section-title">{helperCopy.postType}</div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
            {POST_TYPE_OPTIONS.map((option) => {
              const active = option.value === form.post_type
              return (
                <button
                  key={option.value}
                  type="button"
                  className={active ? 'btn primary' : 'btn'}
                  onClick={() => setField('post_type', option.value)}
                >
                  {postTypeLabel(option.value, lang)}
                </button>
              )
            })}
          </div>

          <div className="grid two" style={{ marginTop: 18 }}>
            <div>
              <div className="muted" style={{ marginBottom: 6 }}>
                {helperCopy.postLanguage}
              </div>
              <select
                className="input"
                value={form.source_language}
                onChange={(e) => setField('source_language', e.target.value)}
              >
                <option value="en">{helperCopy.english}</option>
                <option value="es">{helperCopy.spanish}</option>
              </select>
            </div>

            <div>
              <div className="muted" style={{ marginBottom: 6 }}>
                {t(lang, 'new_post_trade')}
              </div>
              <select
                className="input"
                value={form.trade_id}
                onChange={(e) => setField('trade_id', e.target.value)}
              >
                <option value="">{helperCopy.selectTrade}</option>
                {trades.map((trade) => (
                  <option key={trade.id} value={trade.id}>
                    {trade.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {form.post_type !== 'discussion' ? (
            <div
              className="card-soft"
              style={{
                marginTop: 16,
                ...theme.panel
              }}
            >
              <div className="card-section-title" style={{ fontSize: 16 }}>
                {helperCopy.opportunityIntro}
              </div>
              <p className="card-section-subtitle" style={{ marginTop: 8 }}>
                {exampleBody()}
              </p>
            </div>
          ) : (
            <div className="card-soft" style={{ marginTop: 16 }}>
              <div className="card-section-title" style={{ fontSize: 16 }}>
                {t(lang, 'new_post_example')}
              </div>
              <p className="card-section-subtitle" style={{ marginTop: 8 }}>
                {t(lang, 'new_post_example_body')}
              </p>
            </div>
          )}
        </div>

        <div className="card rounded-xl" style={{ padding: 24 }}>
          <div className="grid" style={{ gap: 14 }}>
            <div>
              <div className="muted" style={{ marginBottom: 6 }}>
                {helperCopy.titleLabel}
              </div>
              <input
                className="input"
                value={form.title}
                placeholder={titlePlaceholder()}
                onChange={(e) => setField('title', e.target.value)}
              />
            </div>

            <div>
              <div className="muted" style={{ marginBottom: 6 }}>
                {helperCopy.bodyLabel}
              </div>
              <textarea
                className="input"
                value={form.body}
                placeholder={bodyPlaceholder()}
                onChange={(e) => setField('body', e.target.value)}
              />
            </div>

            <div className="grid two">
              <div>
                <div className="muted" style={{ marginBottom: 6 }}>
                  {helperCopy.zipLabel}
                </div>
                <input
                  className="input"
                  value={form.center_zip}
                  inputMode="numeric"
                  onChange={(e) => setField('center_zip', e.target.value)}
                />
              </div>

              <div>
                <div className="muted" style={{ marginBottom: 6 }}>
                  {helperCopy.radiusLabel}
                </div>
                <input
                  className="input"
                  type="number"
                  value={form.radius_miles}
                  onChange={(e) => setField('radius_miles', e.target.value)}
                />
              </div>
            </div>

            {form.post_type === 'need_crew' ? (
              <div className="grid two">
                <div>
                  <div className="muted" style={{ marginBottom: 6 }}>
                    {helperCopy.crewSize}
                  </div>
                  <input
                    className="input"
                    type="number"
                    value={form.needed_crew_size}
                    onChange={(e) => setField('needed_crew_size', e.target.value)}
                  />
                </div>

                <div>
                  <div className="muted" style={{ marginBottom: 6 }}>
                    {helperCopy.compensation}
                  </div>
                  <input
                    className="input"
                    value={form.compensation}
                    placeholder={helperCopy.crewCompPlaceholder}
                    onChange={(e) => setField('compensation', e.target.value)}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <div className="muted" style={{ marginBottom: 6 }}>
                    {helperCopy.startDate}
                  </div>
                  <input
                    className="input"
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setField('start_date', e.target.value)}
                  />
                </div>
              </div>
            ) : null}

            {form.post_type === 'looking_for_work' ? (
              <div className="grid two">
                <div>
                  <div className="muted" style={{ marginBottom: 6 }}>
                    {helperCopy.compensation}
                  </div>
                  <input
                    className="input"
                    value={form.compensation}
                    placeholder={helperCopy.workCompPlaceholder}
                    onChange={(e) => setField('compensation', e.target.value)}
                  />
                </div>

                <div>
                  <div className="muted" style={{ marginBottom: 6 }}>
                    {helperCopy.startDate}
                  </div>
                  <input
                    className="input"
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setField('start_date', e.target.value)}
                  />
                </div>
              </div>
            ) : null}

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 6 }}>
              <button className="btn primary" type="button" onClick={create} disabled={saving}>
                {saving ? helperCopy.publishing : helperCopy.publish}
              </button>

              <Link className="btn" to="/feed">
                {t(lang, 'detail_back_feed')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}