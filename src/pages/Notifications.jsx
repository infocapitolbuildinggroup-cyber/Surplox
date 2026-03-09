import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'

function timeAgo(ts) {
  const d = new Date(ts)
  const diff = (Date.now() - d.getTime()) / 1000

  if (diff < 60) return `${Math.floor(diff)}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function notificationBadgeStyle(type) {
  if (type === 'crew_hired') {
    return {
      color: '#ff751f',
      borderColor: 'rgba(255, 222, 89, 0.65)',
      background: 'rgba(255, 222, 89, 0.14)'
    }
  }

  if (type === 'crew_join') {
    return {
      color: '#ffde59',
      borderColor: 'rgba(255, 117, 31, 0.55)',
      background: 'rgba(255, 117, 31, 0.12)'
    }
  }

  return {
    color: '#ff751f',
    borderColor: 'rgba(255, 222, 89, 0.4)',
    background: 'rgba(255, 222, 89, 0.06)'
  }
}

function notificationTypeLabel(type) {
  if (type === 'crew_hired') return 'Marked Hired'
  if (type === 'crew_join') return 'Crew Joined'
  return 'Reply'
}

export default function Notifications() {
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [notifications, setNotifications] = useState([])

  async function loadNotifications() {
    setLoading(true)
    setMsg('')

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const uid = sessionData.session?.user?.id

      if (!uid) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('id, type, message, post_id, is_read, created_at')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error

      setNotifications(data || [])
    } catch (err) {
      console.error(err)
      setMsg(err.message || 'Unable to load alerts right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  async function markAllRead() {
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const uid = sessionData.session?.user?.id
      if (!uid) return

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', uid)
        .eq('is_read', false)

      if (error) throw error

      await loadNotifications()
    } catch (err) {
      console.error(err)
      setMsg(err.message || 'Unable to mark alerts as read.')
    }
  }

  async function markRead(notificationId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

      if (error) throw error

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      )
    } catch (err) {
      console.error(err)
      setMsg(err.message || 'Unable to mark this alert as read.')
    }
  }

  if (loading) {
    return <div className="card">Loading alerts…</div>
  }

  return (
    <div className="grid" style={{ gap: 12 }}>
      <div className="card">
        <div className="h1" style={{ fontSize: 22, marginTop: 0 }}>Alerts</div>
        <p className="muted">
          Replies, crew joins, and hired updates show up here.
        </p>

        <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn primary" onClick={markAllRead}>
            Mark All Read
          </button>
          <button className="btn" onClick={loadNotifications}>
            Refresh
          </button>
        </div>
      </div>

      {msg ? <div className="card card-message">{msg}</div> : null}

      {notifications.length === 0 ? (
        <div className="card card-soft">
          <div className="card-section-title">No Alerts Yet</div>
          <p className="card-section-subtitle">
            Once people reply to your posts, join your crew requests, or mark you as hired, those alerts will appear here.
          </p>
        </div>
      ) : (
        <div className="list">
          {notifications.map((item) => (
            <div
              key={item.id}
              className="card"
              style={{
                borderColor: item.is_read
                  ? 'rgba(255, 222, 89, 0.14)'
                  : 'rgba(255, 222, 89, 0.4)',
                background: item.is_read
                  ? undefined
                  : 'rgba(255, 222, 89, 0.04)'
              }}
            >
              <div className="postMeta" style={{ marginBottom: 8 }}>
                <span className="badge" style={notificationBadgeStyle(item.type)}>
                  {notificationTypeLabel(item.type)}
                </span>
                {item.is_read ? (
                  <span className="badge">Read</span>
                ) : (
                  <span className="badge">Unread</span>
                )}
                <span>{timeAgo(item.created_at)}</span>
              </div>

              <div className="postTitle" style={{ fontSize: 16 }}>
                {item.message}
              </div>

              <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {item.post_id ? (
                  <Link
                    className="btn small primary"
                    to={`/p/${item.post_id}`}
                    onClick={() => markRead(item.id)}
                  >
                    Open Post
                  </Link>
                ) : null}

                {!item.is_read ? (
                  <button className="btn small" onClick={() => markRead(item.id)}>
                    Mark Read
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}