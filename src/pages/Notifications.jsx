import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'

const COPY = {
  en: {
    loading: 'Loading alerts…',
    loadError: 'Unable to load alerts right now.',
    markAllError: 'Unable to mark alerts as read.',
    markOneError: 'Unable to mark this alert as read.',
    title: 'Alerts',
    intro: 'Replies, crew joins, and hired updates show up here.',
    markAllRead: 'Mark All Read',
    refresh: 'Refresh',
    emptyTitle: 'No Alerts Yet',
    emptyBody:
      'Once people reply to your posts, join your crew requests, or mark you as hired, those alerts will appear here.',
    read: 'Read',
    unread: 'Unread',
    openPost: 'Open Post',
    markRead: 'Mark Read',
    typeReply: 'Reply',
    typeCrewJoined: 'Crew Joined',
    typeMarkedHired: 'Marked Hired'
  },
  es: {
    loading: 'Cargando alertas…',
    loadError: 'No se pudieron cargar las alertas en este momento.',
    markAllError: 'No se pudieron marcar las alertas como leídas.',
    markOneError: 'No se pudo marcar esta alerta como leída.',
    title: 'Alertas',
    intro: 'Las respuestas, uniones a cuadrillas y contrataciones aparecen aquí.',
    markAllRead: 'Marcar todas como leídas',
    refresh: 'Actualizar',
    emptyTitle: 'Todavía no hay alertas',
    emptyBody:
      'Cuando alguien responda a tus publicaciones, se una a tus solicitudes de cuadrilla o te marque como contratado, esas alertas aparecerán aquí.',
    read: 'Leída',
    unread: 'No leída',
    openPost: 'Abrir publicación',
    markRead: 'Marcar como leída',
    typeReply: 'Respuesta',
    typeCrewJoined: 'Se unió a la cuadrilla',
    typeMarkedHired: 'Marcado como contratado'
  }
}

function timeAgo(ts, lang = 'en') {
  const d = new Date(ts)
  const diff = (Date.now() - d.getTime()) / 1000

  if (lang === 'es') {
    if (diff < 60) return `hace ${Math.floor(diff)} s`
    if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`
    return `hace ${Math.floor(diff / 86400)} d`
  }

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

function notificationTypeLabel(type, lang = 'en') {
  const copy = COPY[lang] || COPY.en
  if (type === 'crew_hired') return copy.typeMarkedHired
  if (type === 'crew_join') return copy.typeCrewJoined
  return copy.typeReply
}

export default function Notifications({ lang: langProp = 'en' }) {
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [notifications, setNotifications] = useState([])
  const [lang, setLang] = useState(langProp || localStorage.getItem('surplox_lang') || 'en')

  const copy = COPY[lang] || COPY.en

  useEffect(() => {
    setLang(langProp || localStorage.getItem('surplox_lang') || 'en')
  }, [langProp])

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

      const { data: prof } = await supabase
        .from('profiles')
        .select('preferred_language')
        .eq('user_id', uid)
        .maybeSingle()

      const userLang = prof?.preferred_language || langProp || localStorage.getItem('surplox_lang') || 'en'
      setLang(userLang)
      localStorage.setItem('surplox_lang', userLang)

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
      setMsg(err.message || copy.loadError)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [langProp])

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
      setMsg(err.message || copy.markAllError)
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
      setMsg(err.message || copy.markOneError)
    }
  }

  if (loading) {
    return <div className="card">{copy.loading}</div>
  }

  return (
    <div className="grid" style={{ gap: 12 }}>
      <div className="card">
        <div className="h1" style={{ fontSize: 22, marginTop: 0 }}>{copy.title}</div>
        <p className="muted">
          {copy.intro}
        </p>

        <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn primary" onClick={markAllRead}>
            {copy.markAllRead}
          </button>
          <button className="btn" onClick={loadNotifications}>
            {copy.refresh}
          </button>
        </div>
      </div>

      {msg ? <div className="card card-message">{msg}</div> : null}

      {notifications.length === 0 ? (
        <div className="card card-soft">
          <div className="card-section-title">{copy.emptyTitle}</div>
          <p className="card-section-subtitle">
            {copy.emptyBody}
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
                  {notificationTypeLabel(item.type, lang)}
                </span>
                {item.is_read ? (
                  <span className="badge">{copy.read}</span>
                ) : (
                  <span className="badge">{copy.unread}</span>
                )}
                <span>{timeAgo(item.created_at, lang)}</span>
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
                    {copy.openPost}
                  </Link>
                ) : null}

                {!item.is_read ? (
                  <button className="btn small" onClick={() => markRead(item.id)}>
                    {copy.markRead}
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