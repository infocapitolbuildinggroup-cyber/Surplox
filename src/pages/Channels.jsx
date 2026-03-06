import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'

export default function Channels() {
  const [trades, setTrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setMsg('')

      const { data, error } = await supabase
        .from('trades')
        .select('id,name')
        .order('name')

      if (error) {
        console.error(error)
        setMsg('Unable to load trade channels right now.')
      } else {
        setTrades(data || [])
      }

      setLoading(false)
    }

    load()
  }, [])

  if (loading) {
    return <div className="card">Loading trade channels…</div>
  }

  if (msg) {
    return (
      <div className="card">
        <div className="h1" style={{ fontSize: 18 }}>Channels Unavailable</div>
        <div className="muted" style={{ marginTop: 8 }}>{msg}</div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="h1">Trade Channels</div>
      <p className="muted">
        Browse local discussions by trade. Select a channel to view posts in your area.
      </p>

      <div className="list" style={{ marginTop: 12 }}>
        {trades.length === 0 ? (
          <div className="card">
            <div className="h1" style={{ fontSize: 18, marginTop: 0 }}>No Channels Yet</div>
            <div className="muted">
              Trade channels have not been created yet.
            </div>
          </div>
        ) : (
          trades.map((t) => (
            <Link
              key={t.id}
              className="card"
              to={`/feed?trade=${t.id}`}
              style={{ background: '#0f1118' }}
            >
              <div style={{ fontWeight: 800, fontSize: 16 }}>{t.name}</div>
              <div className="muted" style={{ marginTop: 4 }}>
                View nearby posts in this trade
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}