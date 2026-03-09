import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useLocation, useNavigate } from 'react-router-dom'
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
      icon: '🚧',
      shell: {
        borderColor: 'rgba(255, 222, 89, 0.5)',
        background: 'rgba(255, 222, 89, 0.05)',
        boxShadow: '0 0 20px rgba(255, 222, 89, 0.08)'
      },
      notice: {
        borderColor: 'rgba(255, 222, 89, 0.45)',
        background: 'rgba(255, 222, 89, 0.08)'
      },
      example: {
        borderColor: 'rgba(255, 222, 89, 0.45)',
        background: 'rgba(255, 222, 89, 0.06)'
      },
      badge: {
        color: '#ff751f',
        borderColor: 'rgba(255, 222, 89, 0.65)',
        background: 'rgba(255, 222, 89, 0.14)',
        boxShadow: '0 0 10px rgba(255, 222, 89, 0.18)'
      },
      button: 'btn primary'
    }
  }

  if (type === 'looking_for_work') {
    return {
      icon: '🛠️',
      shell: {
        borderColor: 'rgba(255, 117, 31, 0.42)',
        background: 'rgba(255, 117, 31, 0.04)',
        boxShadow: '0 0 18px rgba(255, 117, 31, 0.06)'
      },
      notice: {
        borderColor: 'rgba(255, 117, 31, 0.4)',
        background: 'rgba(255, 117, 31, 0.07)'
      },
      example: {
        borderColor: 'rgba(255, 117, 31, 0.4)',
        background: 'rgba(255, 117, 31, 0.06)'
      },
      badge: {
        color: '#ffde59',
        borderColor: 'rgba(255, 117, 31, 0.55)',
        background: 'rgba(255, 117, 31, 0.12)',
        boxShadow: '0 0 10px rgba(255, 117, 31, 0.14)'
      },
      button: 'btn'
    }
  }

  return {
    icon: '💬',
    shell: {
      borderColor: 'rgba(255, 222, 89, 0.18)',
      background: 'var(--card)',
      boxShadow: 'none'
    },
    notice: {
      borderColor: 'rgba(255, 222, 89, 0.32)',
      background: 'rgba(255, 222, 89, 0.05)'
    },
    example: {
      borderColor: 'rgba(255, 222, 89, 0.3)',
      background: 'rgba(255, 222, 89, 0.04)'
    },
    badge: {
      color: '#ff751f',
      borderColor: 'rgba(255, 222, 89, 0.4)',
      background: 'rgba(255, 222, 89, 0.06)'
    },
    button: 'btn primary'
  }
}

export default function NewPost({ lang: langProp = 'en' }) {
  const [trades, setTrades] = useState([])
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [lang, setLang] = useState(langProp || localStorage.getItem('surplox_lang') || 'en')

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
    start_date: ''
  })

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      post_type: preselectedType
    }))
  }, [preselectedType])

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

        const userLang = prof?.preferred_language || langProp || localStorage.getItem('surplox_lang') || 'en'
        setLang(userLang)
        localStorage.setItem('surplox_lang', userLang)
      } else {
        setLang(langProp || localStorage.getItem('surplox_lang') || 'en')
      }

      const { data, error } = await supabase
        .from('trades')
        .select('id,name')
        .order('name')

      if (error) console.error(error)
      setTrades(data || [])
    }

    loadTrades()
  }, [langProp])

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const helperCopy = useMemo(() => {
    if (lang === 'es') {
      return {
        postType: 'Tipo de publicación',
        crewSize: 'Tamaño de cuadrilla',
        compensation: 'Pago / tarifa',
        startDate: 'Fecha de inicio',
        selectTrade: 'Discusión general',
        crewExample: 'Ejemplo: 2 trabajadores, empieza el lunes, $250/día',
        workExample: 'Ejemplo: soldador disponible esta semana en Dallas',
        crewTitle: 'Ejemplo: Se necesitan 2 acabadores de concreto en Fort Worth para empezar el lunes',
        workTitle: 'Ejemplo: Soldador de tubería disponible para trabajo de paro en DFW',
        crewBody:
          'Describe el oficio, dónde está el trabajo, cuánta gente necesitas, cuándo inicia y los detalles de pago.',
        workBody:
          'Describe tu oficio, disponibilidad, radio de viaje, experiencia y qué tipo de trabajo estás buscando.',
        crewRequired: 'El tamaño de cuadrilla debe ser por lo menos 1 para publicaciones de Se necesita cuadrilla.',
        opportunityIntro:
          'Crea una publicación local de alta visibilidad para que trabajadores y cuadrillas cercanas la encuentren rápidamente.',
        opportunityNotice:
          'Las publicaciones de oportunidad seguirán respetando el ZIP y el radio, pero deben estar escritas con claridad para que los miembros cercanos puedan actuar rápido.',
        discussionTitle: 'Ejemplo: ¿Cuál es la mejor forma de poner bollards en suelo rocoso?',
        highVisibilityOpportunity: 'Oportunidad de alta visibilidad',
        availabilityPost: 'Publicación de disponibilidad',
        crewCompPlaceholder: '$250/día o $35/hora',
        workCompPlaceholder: '$30/hora deseado o por propuesta'
      }
    }

    return {
      postType: 'Post Type',
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
      workCompPlaceholder: '$30/hr desired or bid-based'
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

      if (!POST_TYPE_OPTIONS.some((x) => x.value === form.post_type)) {
        throw new Error(
          lang === 'es' ? 'Selecciona un tipo de publicación válido.' : 'Select a valid post type.'
        )
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
          post_type: form.post_type,
          trade_id: form.trade_id ? Number(form.trade_id) : null,
          title: form.title.trim(),
          body: form.body.trim(),
          center_zip: form.center_zip,
          center_point: wktPoint,
          radius_miles: radius,
          needed_crew_size: form.needed_crew_size ? Number(form.needed_crew_size) : null,
          compensation: form.compensation.trim() || null,
          start_date: form.start_date || null
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

  const isOpportunity = form.post_type !== 'discussion'
  const theme = getPostTypeTheme(form.post_type)

  return (
    <div
      className="card"
      style={{
        maxWidth: 860,
        margin: '0 auto',
        ...theme.shell
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 8,
          flexWrap: 'wrap'
        }}
      >
        <span className="badge" style={theme.badge}>
          {theme.icon} {postTypeLabel(form.post_type, lang)}
        </span>
      </div>

      <div className="h1">{t(lang, 'new_post_title')}</div>

      <p className="muted">
        {form.post_type === 'discussion'
          ? t(lang, 'new_post_intro')
          : helperCopy.opportunityIntro}
      </p>

      <div className="card card-notice" style={{ marginBottom: 12, ...theme.notice }}>
        <div className="card-section-title">{t(lang, 'new_post_notice_title')}</div>
        <p className="card-section-subtitle">
          {form.post_type === 'discussion'
            ? t(lang, 'new_post_notice_body')
            : helperCopy.opportunityNotice}
        </p>
      </div>

      <div className="grid two">
        <div>
          <div className="muted" style={{ marginBottom: 6 }}>{helperCopy.postType}</div>
          <select
            className="input"
            value={form.post_type}
            onChange={(e) => setField('post_type', e.target.value)}
          >
            {POST_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {postTypeLabel(option.value, lang)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="muted" style={{ marginBottom: 6 }}>{t(lang, 'new_post_trade')}</div>
          <select
            className="input"
            value={form.trade_id}
            onChange={(e) => setField('trade_id', e.target.value)}
          >
            <option value="">{helperCopy.selectTrade}</option>
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

        {form.post_type === 'need_crew' && (
          <>
            <div>
              <div className="muted" style={{ marginBottom: 6 }}>{helperCopy.crewSize}</div>
              <input
                className="input"
                type="number"
                min="1"
                value={form.needed_crew_size}
                onChange={(e) => setField('needed_crew_size', e.target.value)}
                placeholder="2"
              />
            </div>

            <div>
              <div className="muted" style={{ marginBottom: 6 }}>{helperCopy.compensation}</div>
              <input
                className="input"
                value={form.compensation}
                onChange={(e) => setField('compensation', e.target.value)}
                placeholder={helperCopy.crewCompPlaceholder}
              />
            </div>

            <div>
              <div className="muted" style={{ marginBottom: 6 }}>{helperCopy.startDate}</div>
              <input
                className="input"
                type="date"
                value={form.start_date}
                onChange={(e) => setField('start_date', e.target.value)}
              />
            </div>
          </>
        )}

        {form.post_type === 'looking_for_work' && (
          <>
            <div>
              <div className="muted" style={{ marginBottom: 6 }}>{helperCopy.compensation}</div>
              <input
                className="input"
                value={form.compensation}
                onChange={(e) => setField('compensation', e.target.value)}
                placeholder={helperCopy.workCompPlaceholder}
              />
            </div>

            <div>
              <div className="muted" style={{ marginBottom: 6 }}>{helperCopy.startDate}</div>
              <input
                className="input"
                type="date"
                value={form.start_date}
                onChange={(e) => setField('start_date', e.target.value)}
              />
            </div>
          </>
        )}

        <div
          className="card card-soft"
          style={{
            borderStyle: 'dashed',
            gridColumn: isOpportunity ? '1 / -1' : undefined,
            ...theme.example
          }}
        >
          <div className="badge" style={theme.badge}>
            {form.post_type === 'discussion'
              ? `${theme.icon} ${t(lang, 'new_post_example')}`
              : `${theme.icon} ${postTypeLabel(form.post_type, lang)}`}
          </div>

          <p className="card-section-subtitle" style={{ marginTop: 8 }}>
            {exampleBody()}
          </p>
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        <div className="muted" style={{ marginBottom: 6 }}>{t(lang, 'new_post_title_label')}</div>
        <input
          className="input"
          value={form.title}
          onChange={(e) => setField('title', e.target.value)}
          placeholder={titlePlaceholder()}
        />
      </div>

      <div style={{ marginTop: 10 }}>
        <div className="muted" style={{ marginBottom: 6 }}>{t(lang, 'new_post_body_label')}</div>
        <textarea
          className="input"
          value={form.body}
          onChange={(e) => setField('body', e.target.value)}
          placeholder={bodyPlaceholder()}
        />
      </div>

      {msg && (
        <div className="card card-message" style={{ marginTop: 12 }}>
          {msg}
        </div>
      )}

      <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button className={theme.button} onClick={create} disabled={saving}>
          {saving ? t(lang, 'new_post_publishing') : t(lang, 'new_post_publish')}
        </button>

        {isOpportunity && (
          <span className="badge" style={theme.badge}>
            {form.post_type === 'need_crew'
              ? helperCopy.highVisibilityOpportunity
              : helperCopy.availabilityPost}
          </span>
        )}
      </div>
    </div>
  )
}