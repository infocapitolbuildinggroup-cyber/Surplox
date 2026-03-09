import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'
import { t } from '../i18n'

const COPY = {
  en: {
    needCrewBadge: 'Need Crew',
    workBadge: 'Looking for Work',
    discussionBadge: 'Trade Board'
  },
  es: {
    needCrewBadge: 'Se necesita cuadrilla',
    workBadge: 'Buscando trabajo',
    discussionBadge: 'Tablero de oficio'
  }
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
    <div className="grid" style={{ gap: 14 }}>
      <div className="card">
        <div className="h1">{t(lang, 'channels_title')}</div>
        <p className="muted">
          {t(lang, 'channels_intro')}
        </p>
      </div>

      {/* QUICK ACTIONS */}

      <div className="card">
        <div className="card-section-title">
          {t(lang, 'channels_quick_actions')}
        </div>

        <p className="card-section-subtitle">
          {t(lang, 'channels_quick_actions_intro')}
        </p>

        <div className="grid two" style={{ marginTop: 12 }}>
          <Link
            className="card card-soft"
            to="/new?type=need_crew"
            style={{
              borderColor: 'rgba(255, 222, 89, 0.4)',
              background: 'rgba(255, 222, 89, 0.06)'
            }}
          >
            <div className="badge">{copy.needCrewBadge}</div>

            <div style={{ fontWeight: 800, fontSize: 18, marginTop: 10 }}>
              {t(lang, 'channels_need_crew_title')}
            </div>

            <div className="muted" style={{ marginTop: 6 }}>
              {t(lang, 'channels_need_crew_body')}
            </div>

            <div style={{ marginTop: 12 }}>
              <span className="btn small primary">
                {t(lang, 'channels_need_crew_button')}
              </span>
            </div>
          </Link>

          <Link
            className="card card-soft"
            to="/new?type=looking_for_work"
            style={{
              borderColor: 'rgba(255, 117, 31, 0.38)',
              background: 'rgba(255, 117, 31, 0.06)'
            }}
          >
            <div className="badge">{copy.workBadge}</div>

            <div style={{ fontWeight: 800, fontSize: 18, marginTop: 10 }}>
              {t(lang, 'channels_work_title')}
            </div>

            <div className="muted" style={{ marginTop: 6 }}>
              {t(lang, 'channels_work_body')}
            </div>

            <div style={{ marginTop: 12 }}>
              <span className="btn small">
                {t(lang, 'channels_work_button')}
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* TRADE BOARDS */}

      <div className="card">
        <div className="card-section-title">
          {t(lang, 'channels_all_trades_title')}
        </div>

        <p className="card-section-subtitle">
          {t(lang, 'channels_all_trades_intro')}
        </p>

        {trades.length === 0 ? (
          <div className="card card-soft" style={{ marginTop: 12 }}>
            <div className="card-section-title">
              {t(lang, 'channels_empty_title')}
            </div>

            <p className="card-section-subtitle">
              {t(lang, 'channels_empty_body')}
            </p>
          </div>
        ) : (
          <div className="grid two" style={{ marginTop: 12 }}>
            {trades.map((trade) => (
              <Link
                key={trade.id}
                className="card card-soft"
                to={`/feed?trade=${trade.id}`}
              >
                <div className="badge">{copy.discussionBadge}</div>

                <div style={{ fontWeight: 800, fontSize: 18, marginTop: 10 }}>
                  {trade.name}
                </div>

                <div className="muted" style={{ marginTop: 6 }}>
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