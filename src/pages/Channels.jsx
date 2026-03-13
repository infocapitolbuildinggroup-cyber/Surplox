import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'
import { t } from '../i18n'

const COPY = {
  en: {
    needCrewBadge: 'Need Crew',
    workBadge: 'Looking for Work',
    discussionBadge: 'Trade Board',
    heroBadge: 'Trades + actions',
    heroTitle: 'Move faster through the right trade channels.',
    heroBody:
      'Jump directly into labor requests, availability posts, or browse trade boards to see the most relevant local activity.',
    stat1: 'Quick post shortcuts',
    stat2: 'Trade-based browsing',
    stat3: 'Cleaner channel discovery'
  },
  es: {
    needCrewBadge: 'Se necesita cuadrilla',
    workBadge: 'Buscando trabajo',
    discussionBadge: 'Tablero de oficio',
    heroBadge: 'Oficios + acciones',
    heroTitle: 'Muévete más rápido por los canales correctos del oficio.',
    heroBody:
      'Entra directo a solicitudes de mano de obra, publicaciones de disponibilidad o navega por oficios para ver la actividad local más relevante.',
    stat1: 'Atajos para publicar',
    stat2: 'Exploración por oficio',
    stat3: 'Descubrimiento más limpio'
  }
}

function InfoTile({ value }) {
  return (
    <div className="card-soft" style={{ minHeight: 92 }}>
      <div style={{ fontWeight: 800, fontSize: 16, lineHeight: 1.35 }}>{value}</div>
    </div>
  )
}

export default function Channels({ lang: langProp = 'en' }) {
  const [trades, setTrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [lang, setLang] = useState(langProp || localStorage.getItem('surplox_lang') || 'en')

  const copy = COPY[lang] || COPY.en

  useEffect(() => {
    async function load() {
      setLoading(true)
      setMsg('')

      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const user = sessionData.session?.user

        if (user) {
          const { data: prof } = await supabase
            .from('profiles')
            .select('preferred_language')
            .eq('user_id', user.id)
            .maybeSingle()

          const userLang =
            prof?.preferred_language ||
            langProp ||
            localStorage.getItem('surplox_lang') ||
            'en'

          setLang(userLang)
          localStorage.setItem('surplox_lang', userLang)
        } else {
          setLang(langProp || localStorage.getItem('surplox_lang') || 'en')
        }

        const { data, error } = await supabase
          .from('trades')
          .select('id,name')
          .order('name')

        if (error) {
          console.error(error)
          setMsg(t(langProp || 'en', 'channels_error'))
        } else {
          setTrades(data || [])
        }
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [langProp])

  if (loading) {
    return <div className="card">{t(lang, 'channels_loading')}</div>
  }

  if (msg) {
    return (
      <div className="card">
        <div className="h1" style={{ fontSize: 18 }}>
          {t(lang, 'channels_unavailable')}
        </div>
        <div className="muted" style={{ marginTop: 8 }}>
          {msg}
        </div>
      </div>
    )
  }

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div
        className="card rounded-xl"
        style={{
          padding: 28,
          background: 'linear-gradient(180deg, #fff7c8 0%, #f7f7f2 100%)'
        }}
      >
        <div className="badge" style={{ marginBottom: 14, background: '#f1e7a8' }}>
          {copy.heroBadge}
        </div>

        <div className="h1" style={{ maxWidth: 760 }}>
          {copy.heroTitle}
        </div>

        <p className="muted" style={{ marginTop: 12, maxWidth: 820, fontSize: 17, lineHeight: 1.7 }}>
          {copy.heroBody}
        </p>

        <div className="grid two" style={{ marginTop: 18 }}>
          <InfoTile value={copy.stat1} />
          <InfoTile value={copy.stat2} />
          <InfoTile value={copy.stat3} />
        </div>
      </div>

      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="h1">{t(lang, 'channels_title')}</div>
        <p className="muted" style={{ marginTop: 8 }}>
          {t(lang, 'channels_intro')}
        </p>
      </div>

      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="card-section-title">
          {t(lang, 'channels_quick_actions')}
        </div>

        <p className="card-section-subtitle" style={{ marginTop: 8 }}>
          {t(lang, 'channels_quick_actions_intro')}
        </p>

        <div className="grid two" style={{ marginTop: 14 }}>
          <Link
            className="card rounded-xl"
            to="/new?type=need_crew"
            style={{
              padding: 22,
              background: 'linear-gradient(180deg, #fffaf0 0%, #ffffff 100%)'
            }}
          >
            <div className="badge" style={{ background: '#ffde59', color: '#111111' }}>
              {copy.needCrewBadge}
            </div>

            <div style={{ fontWeight: 900, fontSize: 22, marginTop: 14, lineHeight: 1.15 }}>
              {t(lang, 'channels_need_crew_title')}
            </div>

            <div className="muted" style={{ marginTop: 8, lineHeight: 1.6 }}>
              {t(lang, 'channels_need_crew_body')}
            </div>

            <div style={{ marginTop: 16 }}>
              <span className="btn small primary">
                {t(lang, 'channels_need_crew_button')}
              </span>
            </div>
          </Link>

          <Link
            className="card rounded-xl"
            to="/new?type=looking_for_work"
            style={{
              padding: 22,
              background: 'linear-gradient(180deg, #f8f7ef 0%, #ffffff 100%)'
            }}
          >
            <div className="badge" style={{ background: '#fff0b4', color: '#111111' }}>
              {copy.workBadge}
            </div>

            <div style={{ fontWeight: 900, fontSize: 22, marginTop: 14, lineHeight: 1.15 }}>
              {t(lang, 'channels_work_title')}
            </div>

            <div className="muted" style={{ marginTop: 8, lineHeight: 1.6 }}>
              {t(lang, 'channels_work_body')}
            </div>

            <div style={{ marginTop: 16 }}>
              <span className="btn small">
                {t(lang, 'channels_work_button')}
              </span>
            </div>
          </Link>
        </div>
      </div>

      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="card-section-title">
          {t(lang, 'channels_all_trades_title')}
        </div>

        <p className="card-section-subtitle" style={{ marginTop: 8 }}>
          {t(lang, 'channels_all_trades_intro')}
        </p>

        {trades.length === 0 ? (
          <div className="card-soft" style={{ marginTop: 14 }}>
            <div className="card-section-title">
              {t(lang, 'channels_empty_title')}
            </div>

            <p className="card-section-subtitle" style={{ marginTop: 8 }}>
              {t(lang, 'channels_empty_body')}
            </p>
          </div>
        ) : (
          <div className="grid two" style={{ marginTop: 14 }}>
            {trades.map((trade) => (
              <Link
                key={trade.id}
                className="card rounded-xl"
                to={`/feed?trade=${trade.id}`}
                style={{
                  padding: 20,
                  background: '#ffffff'
                }}
              >
                <div className="badge" style={{ background: '#ecebe3', color: '#111111' }}>
                  {copy.discussionBadge}
                </div>

                <div
                  style={{
                    fontWeight: 900,
                    fontSize: 20,
                    marginTop: 14,
                    lineHeight: 1.15
                  }}
                >
                  {trade.name}
                </div>

                <div className="muted" style={{ marginTop: 8 }}>
                  {t(lang, 'channels_view_posts')}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}