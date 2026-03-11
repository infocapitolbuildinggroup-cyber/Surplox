import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'

const COPY = {
  en: {
    loading: 'Loading alerts…',
    loadError: 'Unable to load alerts right now.',
    markAllError: 'Unable to mark alerts as read.',
    markOneError: 'Unable to mark this alert as read.',
    title: 'Alerts',
    intro: 'Replies, crew joins, hired updates, and profile reminders show up here.',
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
    typeMarkedHired: 'Marked Hired',
    reminderTitle: 'Complete your profile to unlock more value',
    reminderBody:
      'You can already use Surplox, but finishing these details will make your profile stronger and unlock more posting use cases.',
    reminderCta: 'Finish Profile',
    addFirstLast: 'Add first and last name',
    addPhone: 'Add phone number',
    addCity: 'Add city',
    addRole: 'Add primary role',
    addBio: 'Add bio / experience',
    addCrewSize: 'Add crew size'
  },
  es: {
    loading: 'Cargando alertas…',
    loadError: 'No se pudieron cargar las alertas en este momento.',
    markAllError: 'No se pudieron marcar las alertas como leídas.',
    markOneError: 'No se pudo marcar esta alerta como leída.',
    title: 'Alertas',
    intro: 'Las respuestas, uniones a cuadrillas, contrataciones y recordatorios de perfil aparecen aquí.',
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
    typeMarkedHired: 'Marcado como contratado',
    reminderTitle: 'Completa tu perfil para desbloquear más valor',
    reminderBody:
      'Ya puedes usar Surplox, pero completar estos detalles hará tu perfil más fuerte y desbloqueará más usos al publicar.',
    reminderCta: 'Completar perfil',
    addFirstLast: 'Agregar nombre y apellido',
    addPhone: 'Agregar número de teléfono',
    addCity: 'Agregar ciudad',
    addRole: 'Agregar rol principal',
    addBio: 'Agregar biografía / experiencia',
    addCrewSize: 'Agregar tamaño de cuadrilla'
  }
}

function timeAgo(ts, lang = 'en') {
  const date = new Date(ts)
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)

  if (seconds < 60) return lang === 'es' ? 'justo ahora' : 'just now'
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60)
    return lang === 'es' ? `hace ${mins} min` : `${mins} min ago`
  }
  if (seconds < 86400) {
    const hrs = Math.floor(seconds / 3600)
    return lang === 'es' ? `hace ${hrs} h` : `${hrs}h ago`
  }
  const days = Math.floor(seconds / 86400)
  return lang === 'es' ? `hace ${days} d` : `${days}d ago`
}

function notificationTypeStyle(type) {
  if (type === 'crew_hired') {
    return {
      color: '#ffde59',
      borderColor: 'rgba(255, 117, 31, 0.55)',
      background: 'rgba(255, 117, 31, 0.12)'
    }
  }

  if (type === 'crew_join') {
    return {
      color: '#ff751f',
      borderColor: 'rgba(255, 222, 89, 0.65)',
      background: 'rgba(255, 222, 89, 0.14)'
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

function getReminderItems(profile = {}, contact = {}, lang = 'en') {
  const copy = COPY[lang] || COPY.en
  const items = []

  if (!String(profile.first_name || '').trim() || !String(profile.last_name || '').trim()) {
    items.push(copy.addFirstLast)
  }

  if (!String(contact.phone || '').trim()) {
    items.push(copy.addPhone)
  }

  if (!String(contact.city || '').trim()) {
    items.push(copy.addCity)
  }

  if (!String(profile.role || '').trim()) {
    items.push(copy.addRole)
  }

  if (!String(profile.bio || '').trim()) {
    items.push(copy.addBio)
  }

  if (!Number(profile.crew_size || 0) || Number(profile.crew_size || 0) <= 1) {
    items.push(copy.addCrewSize)
  }

  return items
}

export default function Notifications({ lang: langProp = 'en' }) {
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [notifications, setNotifications] = useState([])
  const [lang, setLang] = useState(langProp || localStorage.getItem('surplox_lang') || 'en')
  const [profileReminderItems, setProfileReminderItems] = useState([])

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
        .select('*')
        .eq('user_id', uid)
        .maybeSingle()

      const { data: cp } = await supabase
        .from('contact_private')
        .select('*')
        .eq('user_id', uid)
        .maybeSingle()

      const userLang = prof?.preferred_language || langProp || localStorage.getItem('surplox_lang') || 'en'
      setLang(userLang)
      localStorage.setItem('surplox_lang', userLang)

      const reminders = getReminderItems(prof || {}, cp || {}, userLang)
      setProfileReminderItems(reminders)

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

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications]
  )

  if (loading) return <div className="card">{copy.loading}</div>

  return (
    <div className="grid" style={{ gap: 12 }}>
      <div className="card">
        <div className="h1" style={{ fontSize: 22 }}>{copy.title}</div>
        <p className="muted">{copy.intro}</p>

        <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn primary" onClick={markAllRead} disabled={unreadCount === 0}>
            {copy.markAllRead}
          </button>
          <button className="btn" onClick={loadNotifications}>
            {copy.refresh}
          </button>
          <span className="badge">
            {unreadCount} {copy.unread}
          </span>
          {profileReminderItems.length > 0 ? (
            <span className="badge" style={{ color: '#ff751f', borderColor: 'rgba(255, 222, 89, 0.65)', background: 'rgba(255, 222, 89, 0.14)' }}>
              {profileReminderItems.length}
            </span>
          ) : null}
        </div>
      </div>

      {profileReminderItems.length > 0 ? (
        <div
          className="card"
          style={{
            borderColor: 'rgba(255, 222, 89, 0.36)',
            background: 'rgba(255, 222, 89, 0.06)'
          }}
        >
          <div className="card-section-title">{copy.reminderTitle}</div>
          <p className="card-section-subtitle" style={{ marginTop: 6 }}>
            {copy.reminderBody}
          </p>

          <div className="grid" style={{ gap: 8, marginTop: 12 }}>
            {profileReminderItems.map((item) => (
              <div key={item}>• {item}</div>
            ))}
          </div>

          <div style={{ marginTop: 14 }}>
            <Link className="btn primary" to="/account">
              {copy.reminderCta}
            </Link>
          </div>
        </div>
      ) : null}

      {msg ? (
        <div className="card card-message">
          {msg}
        </div>
      ) : null}

      {notifications.length === 0 ? (
        <div className="card card-soft">
          <div className="card-section-title">{copy.emptyTitle}</div>
          <p className="card-section-subtitle" style={{ marginTop: 6 }}>
            {copy.emptyBody}
          </p>
        </div>
      ) : (
        <div className="list">
          {notifications.map((note) => (
            <div
              key={note.id}
              className="card"
              style={{
                borderColor: note.is_read
                  ? 'rgba(255, 222, 89, 0.14)'
                  : 'rgba(255, 222, 89, 0.35)',
                background: note.is_read
                  ? 'var(--card)'
                  : 'rgba(255, 222, 89, 0.04)'
              }}
            >
              <div className="postMeta" style={{ marginBottom: 10 }}>
                <span className="badge" style={notificationTypeStyle(note.type)}>
                  {notificationTypeLabel(note.type, lang)}
                </span>
                <span className="badge">
                  {note.is_read ? copy.read : copy.unread}
                </span>
                <span className="badge">{timeAgo(note.created_at, lang)}</span>
              </div>

              <div style={{ lineHeight: 1.55 }}>{note.message}</div>

              <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {note.post_id ? (
                  <Link className="btn small primary" to={`/p/${note.post_id}`}>
                    {copy.openPost}
                  </Link>
                ) : null}

                {!note.is_read ? (
                  <button className="btn small" onClick={() => markRead(note.id)}>
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