import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'
import { t } from '../i18n'

export default function Channels() {
  const [trades, setTrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [lang, setLang] = useState(localStorage.getItem('surplox_lang') || 'en')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setMsg('')

      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user

      if (user) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('preferred_language')
          .eq('user_id', user.id)
          .maybeSingle()

        const userLang = prof?.preferred_language || 'en'
        setLang(userLang)
        localStorage.setItem('surplox_lang', userLang)
      }

      const { data, error } = await supabase
        .from('trades')
        .select('id,name')
        .order('name')

      if (error) {
        console.error(error)
        setMsg(t(lang, 'channels_error'))
      } else {
        setTrades(data || [])
      }

      setLoading(false)
    }

    load()
  }, [])

  if (loading) {
    return <div className="card">{t(lang, 'channels_loading')}</div>
  }

  if (msg) {
    return (
      <div className="card">
        <div className="h1" style={{ fontSize: 18 }}>{t(lang, 'channels_unavailable')}</div>
        <div className="muted" style={{ marginTop: 8 }}>{msg}</div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="h1">{t(lang, 'channels_title')}</div>
      <p className="muted">
        {t(lang, 'channels_intro')}
      </p>

      <div className="list" style={{ marginTop: 12 }}>
        {trades.length === 0 ? (
          <div className="card card-soft">
            <div className="card-section-title">{t(lang, 'channels_empty_title')}</div>
            <p className="card-section-subtitle">
              {t(lang, 'channels_empty_body')}
            </p>
          </div>
        ) : (
          trades.map((trow) => (
            <Link
              key={trow.id}
              className="card card-soft"
              to={`/feed?trade=${trow.id}`}
            >
              <div style={{ fontWeight: 800, fontSize: 16 }}>{trow.name}</div>
              <div className="muted" style={{ marginTop: 4 }}>
                {t(lang, 'channels_view_posts')}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}