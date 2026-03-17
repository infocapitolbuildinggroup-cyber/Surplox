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
    intro:
      'Replies, crew joins, hired updates, jobsite support activity, supplier visibility, and profile reminders show up here.',
    markAllRead: 'Mark All Read',
    refresh: 'Refresh',
    emptyTitle: 'No Alerts Yet',
    emptyBody:
      'Once people reply to your posts, join your crew requests, interact with your jobsite support posts, or connect through supplier activity, those alerts will appear here.',
    read: 'Read',
    unread: 'Unread',
    openPost: 'Open Post',
    markRead: 'Mark Read',
    typeReply: 'Reply',
    typeCrewJoined: 'Crew Joined',
    typeMarkedHired: 'Marked Hired',
    typeJobsiteSupport: 'Jobsite Support',
    typeSupplier: 'Supplier Activity',
    typeDriverAssigned: 'Driver Assigned',
    typeMechanicAssigned: 'Mechanic Assigned',
    typeCompleted: 'Completed',
    typeUrgent: 'Urgent Activity',
    reminderTitle: 'Complete your profile to unlock more value',
    reminderBody:
      'You can already use Surplox, but finishing these details will make your profile stronger and unlock more posting use cases.',
    reminderCta: 'Finish Profile',
    addFirstLast: 'Add first and last name',
    addPhone: 'Add phone number',
    addCity: 'Add city',
    addRole: 'Add primary role',
    addBio: 'Add bio / experience',
    addCrewSize: 'Add crew size',
    addAvailabilityStatus: 'Add availability status',
    addTrade: 'Add trade',
    addServiceTags: 'Add service tags',
    addEquipmentTags: 'Add equipment tags',
    addBusinessName: 'Add business name',
    addBusinessAddress: 'Add business address',
    addBusinessZip: 'Add business ZIP',
    addMaterialsCategories: 'Add materials categories',
    addDeliveryRadius: 'Add delivery radius',
    addStorefront: 'Enable storefront',
    jobsiteSupportReminder:
      'Jobsite Support profiles should include service tags and equipment tags so contractors know exactly what you can do.',
    supplierReminder:
      'Supplier profiles work best when business name, business location, materials categories, delivery radius, and storefront visibility are all filled in.',
    heroBadge: 'Alerts center',
    heroTitle: 'Stay on top of real network activity.',
    heroBody:
      'Replies, crew joins, hires, support activity, supplier visibility, and account reminders all surface here in one cleaner alerts view.',
    statUnread: 'Unread alerts',
    statTotal: 'Total alerts',
    statProfile: 'Profile reminders',
    statAction: 'Action alerts',
    urgencyTitle: 'High-priority activity',
    urgencyBody: 'Assignments, completions, and urgent activity rise to the top here so you can close loops faster.',
    openAlertsFeed: 'Open Feed'
  },
  es: {
    loading: 'Cargando alertas…',
    loadError: 'No se pudieron cargar las alertas en este momento.',
    markAllError: 'No se pudieron marcar las alertas como leídas.',
    markOneError: 'No se pudo marcar esta alerta como leída.',
    title: 'Alertas',
    intro:
      'Las respuestas, uniones a cuadrillas, contrataciones, actividad de soporte de obra, visibilidad de proveedor y recordatorios de perfil aparecen aquí.',
    markAllRead: 'Marcar todas como leídas',
    refresh: 'Actualizar',
    emptyTitle: 'Todavía no hay alertas',
    emptyBody:
      'Cuando alguien responda a tus publicaciones, se una a tus solicitudes de cuadrilla, interactúe con tus publicaciones de soporte de obra o haya actividad de proveedor, esas alertas aparecerán aquí.',
    read: 'Leída',
    unread: 'No leída',
    openPost: 'Abrir publicación',
    markRead: 'Marcar como leída',
    typeReply: 'Respuesta',
    typeCrewJoined: 'Se unió a la cuadrilla',
    typeMarkedHired: 'Marcado como contratado',
    typeJobsiteSupport: 'Soporte de obra',
    typeSupplier: 'Actividad de proveedor',
    typeDriverAssigned: 'Conductor asignado',
    typeMechanicAssigned: 'Mecánico asignado',
    typeCompleted: 'Completado',
    typeUrgent: 'Actividad urgente',
    reminderTitle: 'Completa tu perfil para desbloquear más valor',
    reminderBody:
      'Ya puedes usar Surplox, pero completar estos detalles hará tu perfil más fuerte y desbloqueará más usos al publicar.',
    reminderCta: 'Completar perfil',
    addFirstLast: 'Agregar nombre y apellido',
    addPhone: 'Agregar número de teléfono',
    addCity: 'Agregar ciudad',
    addRole: 'Agregar rol principal',
    addBio: 'Agregar biografía / experiencia',
    addCrewSize: 'Agregar tamaño de cuadrilla',
    addAvailabilityStatus: 'Agregar estado de disponibilidad',
    addTrade: 'Agregar oficio',
    addServiceTags: 'Agregar etiquetas de servicio',
    addEquipmentTags: 'Agregar etiquetas de equipo',
    addBusinessName: 'Agregar nombre comercial',
    addBusinessAddress: 'Agregar dirección comercial',
    addBusinessZip: 'Agregar ZIP comercial',
    addMaterialsCategories: 'Agregar categorías de materiales',
    addDeliveryRadius: 'Agregar radio de entrega',
    addStorefront: 'Habilitar tienda',
    jobsiteSupportReminder:
      'Los perfiles de Soporte de obra deben incluir etiquetas de servicio y equipo para que los contratistas sepan exactamente lo que puedes hacer.',
    supplierReminder:
      'Los perfiles de proveedor funcionan mejor cuando el nombre comercial, la ubicación del negocio, las categorías de materiales, el radio de entrega y la visibilidad de la tienda están completos.',
    heroBadge: 'Centro de alertas',
    heroTitle: 'Mantente al tanto de la actividad real de la red.',
    heroBody:
      'Las respuestas, uniones a cuadrillas, contrataciones, actividad de soporte, visibilidad de proveedor y recordatorios de cuenta aparecen aquí en una vista más limpia.',
    statUnread: 'Alertas sin leer',
    statTotal: 'Alertas totales',
    statProfile: 'Recordatorios de perfil',
    statAction: 'Alertas de acción',
    urgencyTitle: 'Actividad prioritaria',
    urgencyBody: 'Las asignaciones, cierres y actividad urgente suben primero aquí para cerrar ciclos más rápido.',
    openAlertsFeed: 'Abrir feed'
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
  if (type === 'crew_hired' || type === 'completed_post') {
    return {
      background: '#111111',
      color: '#ffffff'
    }
  }

  if (type === 'crew_join') {
    return {
      background: '#fff0b4',
      color: '#111111'
    }
  }

  if (type === 'jobsite_support' || type === 'assigned_delivery_post' || type === 'assigned_repair_post') {
    return {
      background: '#f1e7a8',
      color: '#111111'
    }
  }

  if (type === 'supplier_activity') {
    return {
      background: '#fff7cf',
      color: '#111111'
    }
  }

  if (type === 'urgent_post') {
    return {
      background: '#ffde59',
      color: '#111111'
    }
  }

  return {
    background: '#ecebe3',
    color: '#111111'
  }
}

function notificationTypeLabel(type, lang = 'en') {
  const copy = COPY[lang] || COPY.en
  if (type === 'crew_hired') return copy.typeMarkedHired
  if (type === 'crew_join') return copy.typeCrewJoined
  if (type === 'jobsite_support') return copy.typeJobsiteSupport
  if (type === 'supplier_activity') return copy.typeSupplier
  if (type === 'assigned_delivery_post') return copy.typeDriverAssigned
  if (type === 'assigned_repair_post') return copy.typeMechanicAssigned
  if (type === 'completed_post') return copy.typeCompleted
  if (type === 'urgent_post') return copy.typeUrgent
  return copy.typeReply
}

function isActionType(type) {
  return ['crew_hired', 'assigned_delivery_post', 'assigned_repair_post', 'completed_post', 'urgent_post'].includes(type)
}

function getReminderItems(profile = {}, contact = {}, lang = 'en') {
  const copy = COPY[lang] || COPY.en
  const items = []

  const crewSizeOptional = ['supplier', 'driver', 'mechanic'].includes(profile.role)
  const tradeOptional = profile.role === 'supplier'

  if (profile.role === 'supplier') {
    if (!String(profile.business_name || '').trim()) {
      items.push(copy.addBusinessName)
    }

    if (!String(profile.business_address || '').trim()) {
      items.push(copy.addBusinessAddress)
    }

    if (!String(profile.business_zip || '').trim()) {
      items.push(copy.addBusinessZip)
    }

    if (!Array.isArray(profile.materials_categories) || profile.materials_categories.length === 0) {
      items.push(copy.addMaterialsCategories)
    }

    if (!String(profile.delivery_radius || '').trim() && !Number(profile.delivery_radius || 0)) {
      items.push(copy.addDeliveryRadius)
    }

    if (!Boolean(profile.storefront)) {
      items.push(copy.addStorefront)
    }

    if (!String(profile.bio || '').trim()) {
      items.push(copy.addBio)
    }

    if (!String(contact.phone || '').trim()) {
      items.push(copy.addPhone)
    }

    if (!String(contact.city || '').trim()) {
      items.push(copy.addCity)
    }

    return items
  }

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

  if (!crewSizeOptional && (!Number(profile.crew_size || 0) || Number(profile.crew_size || 0) <= 1)) {
    items.push(copy.addCrewSize)
  }

  if (!String(profile.availability_status || '').trim()) {
    items.push(copy.addAvailabilityStatus)
  }

  const categoryGroup = profile.category_group || 'trade'

  if (categoryGroup === 'trade') {
    if (!tradeOptional && !profile.trade_id) {
      items.push(copy.addTrade)
    }
  }

  if (categoryGroup === 'jobsite_support') {
    if (!Array.isArray(profile.service_tags) || profile.service_tags.length === 0) {
      items.push(copy.addServiceTags)
    }

    if (!Array.isArray(profile.equipment_tags) || profile.equipment_tags.length === 0) {
      items.push(copy.addEquipmentTags)
    }
  }

  return items
}

function StatCard({ label, value, dark = false }) {
  return (
    <div
      className={dark ? 'card surface-dark rounded-xl' : 'card-soft'}
      style={{ padding: 18, minHeight: 110 }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          opacity: dark ? 0.72 : 1,
          color: dark ? 'rgba(255,255,255,0.72)' : 'var(--muted-soft)'
        }}
      >
        {label}
      </div>
      <div style={{ marginTop: 8, fontSize: 28, fontWeight: 900, lineHeight: 1 }}>
        {value}
      </div>
    </div>
  )
}

export default function Notifications({ lang: langProp = 'en' }) {
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [notifications, setNotifications] = useState([])
  const [lang, setLang] = useState(langProp || localStorage.getItem('surplox_lang') || 'en')
  const [profileReminderItems, setProfileReminderItems] = useState([])
  const [profileCategoryGroup, setProfileCategoryGroup] = useState('trade')
  const [profileRole, setProfileRole] = useState('')

  const copy = COPY[lang] || COPY.en

  useEffect(() => {
    setLang(langProp || localStorage.getItem('surplox_lang') || 'en')
  }, [langProp])

  async function loadNotifications() {
    setLoading(true)
    setMsg('')

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user

      if (!user) {
        setNotifications([])
        setProfileReminderItems([])
        setLoading(false)
        return
      }

      const { data: prof } = await supabase
        .from('profiles')
        .select(
          `
          preferred_language,
          first_name,
          last_name,
          role,
          bio,
          crew_size,
          availability_status,
          trade_id,
          category_group,
          service_tags,
          equipment_tags,
          business_name,
          business_address,
          business_zip,
          materials_categories,
          storefront,
          delivery_radius
        `
        )
        .eq('user_id', user.id)
        .maybeSingle()

      const { data: contact } = await supabase
        .from('contact_private')
        .select('phone, city')
        .eq('user_id', user.id)
        .maybeSingle()

      const activeLang =
        prof?.preferred_language || langProp || localStorage.getItem('surplox_lang') || 'en'

      setLang(activeLang)
      localStorage.setItem('surplox_lang', activeLang)

      setProfileReminderItems(getReminderItems(prof || {}, contact || {}, activeLang))
      setProfileCategoryGroup(prof?.category_group || 'trade')
      setProfileRole(prof?.role || '')

      const { data, error } = await supabase
        .from('notifications')
        .select(
          `
          id,
          user_id,
          actor_user_id,
          post_id,
          type,
          message,
          is_read,
          created_at,
          actor:profiles!notifications_actor_user_id_fkey(
            user_id,
            display_name,
            role
          )
        `
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setNotifications(
        (data || []).map((row) => ({
          ...row,
          actor_name: row.actor?.display_name || '',
          actor_role: row.actor?.role || ''
        }))
      )
    } catch (error) {
      console.error(error)
      setMsg(copy.loadError)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  async function markAllRead() {
    try {
      const unreadIds = notifications.filter((item) => !item.is_read).map((item) => item.id)
      if (unreadIds.length === 0) return

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', unreadIds)

      if (error) throw error

      setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })))
    } catch (error) {
      console.error(error)
      setMsg(copy.markAllError)
    }
  }

  async function markOneRead(notificationId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

      if (error) throw error

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notificationId ? { ...item, is_read: true } : item
        )
      )
    } catch (error) {
      console.error(error)
      setMsg(copy.markOneError)
    }
  }

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.is_read).length,
    [notifications]
  )

  const totalCount = notifications.length
  const reminderCount = profileReminderItems.length
  const actionCount = useMemo(
    () => notifications.filter((item) => isActionType(item.type)).length,
    [notifications]
  )
  const priorityNotifications = useMemo(
    () => notifications.filter((item) => isActionType(item.type)).slice(0, 5),
    [notifications]
  )

  if (loading) {
    return <div className="card">{copy.loading}</div>
  }

  return (
    <div className="grid" style={{ gap: 18 }}>
      {msg ? (
        <div className="card-message" style={{ padding: 14, borderRadius: 18 }}>
          {msg}
        </div>
      ) : null}

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

        <div className="grid three" style={{ marginTop: 18 }}>
          <StatCard label={copy.statUnread} value={unreadCount} dark />
          <StatCard label={copy.statTotal} value={totalCount} />
          <StatCard label={copy.statProfile} value={reminderCount} />
        </div>

        <div style={{ marginTop: 14, maxWidth: 260 }}>
          <StatCard label={copy.statAction} value={actionCount} />
        </div>
      </div>

      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
            alignItems: 'center',
            flexWrap: 'wrap'
          }}
        >
          <div>
            <div className="card-section-title">{copy.title}</div>
            <p className="card-section-subtitle" style={{ marginTop: 8 }}>
              {copy.intro}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn" onClick={loadNotifications}>
              {copy.refresh}
            </button>
            <button className="btn primary" onClick={markAllRead}>
              {copy.markAllRead}
            </button>
          </div>
        </div>
      </div>

      {priorityNotifications.length > 0 ? (
        <div className="card rounded-xl" style={{ padding: 22, background: '#fffaf0' }}>
          <div className="card-section-title">{copy.urgencyTitle}</div>
          <p className="card-section-subtitle" style={{ marginTop: 8 }}>
            {copy.urgencyBody}
          </p>

          <div className="list" style={{ marginTop: 14 }}>
            {priorityNotifications.map((item) => (
              <div
                key={`priority-${item.id}`}
                className="card-soft"
                style={{ background: '#ffffff', minHeight: 'auto' }}
              >
                <div className="postMeta">
                  <span className="badge" style={notificationTypeStyle(item.type)}>
                    {notificationTypeLabel(item.type, lang)}
                  </span>
                  <span className="badge">{timeAgo(item.created_at, lang)}</span>
                  {!item.is_read ? <span className="badge">{copy.unread}</span> : null}
                </div>

                <div style={{ marginTop: 10, lineHeight: 1.7 }}>
                  {item.message}
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
                  {item.post_id ? (
                    <Link className="btn small primary" to={`/p/${item.post_id}`}>
                      {copy.openPost}
                    </Link>
                  ) : (
                    <Link className="btn small primary" to="/feed">
                      {copy.openAlertsFeed}
                    </Link>
                  )}

                  {!item.is_read ? (
                    <button className="btn small" onClick={() => markOneRead(item.id)}>
                      {copy.markRead}
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {profileReminderItems.length > 0 ? (
        <div className="card rounded-xl" style={{ padding: 22, background: '#fffaf0' }}>
          <div className="card-section-title">{copy.reminderTitle}</div>
          <p className="card-section-subtitle" style={{ marginTop: 8 }}>
            {copy.reminderBody}
          </p>

          {profileCategoryGroup === 'jobsite_support' && profileRole !== 'supplier' ? (
            <div className="card-soft" style={{ marginTop: 12, background: '#ffffff' }}>
              {copy.jobsiteSupportReminder}
            </div>
          ) : null}

          {profileRole === 'supplier' ? (
            <div className="card-soft" style={{ marginTop: 12, background: '#ffffff' }}>
              {copy.supplierReminder}
            </div>
          ) : null}

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
            {profileReminderItems.map((item) => (
              <span key={item} className="badge">
                {item}
              </span>
            ))}
          </div>

          <div style={{ marginTop: 14 }}>
            <Link className="btn primary" to="/account">
              {copy.reminderCta}
            </Link>
          </div>
        </div>
      ) : null}

      {notifications.length === 0 ? (
        <div className="card rounded-xl" style={{ padding: 24 }}>
          <div className="h3">{copy.emptyTitle}</div>
          <p className="muted" style={{ marginTop: 8, lineHeight: 1.7 }}>
            {copy.emptyBody}
          </p>
        </div>
      ) : (
        <div className="list">
          {notifications.map((item) => (
            <div
              key={item.id}
              className="card rounded-xl"
              style={{
                padding: 20,
                background: item.is_read ? '#ffffff' : '#fffdf4',
                border: item.is_read ? '1px solid rgba(17,17,17,0.06)' : '1px solid rgba(241,231,168,0.95)'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  flexWrap: 'wrap',
                  alignItems: 'center'
                }}
              >
                <div className="postMeta">
                  <span className="badge" style={notificationTypeStyle(item.type)}>
                    {notificationTypeLabel(item.type, lang)}
                  </span>

                  <span className="badge">
                    {item.is_read ? copy.read : copy.unread}
                  </span>

                  <span className="badge">
                    {timeAgo(item.created_at, lang)}
                  </span>

                  {item.actor_name ? (
                    <span className="badge">
                      {item.actor_name}
                    </span>
                  ) : null}
                </div>

                {!item.is_read ? (
                  <button className="btn small" onClick={() => markOneRead(item.id)}>
                    {copy.markRead}
                  </button>
                ) : null}
              </div>

              <div style={{ marginTop: 12, lineHeight: 1.7 }}>
                {item.message}
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
                {item.post_id ? (
                  <Link className="btn small primary" to={`/p/${item.post_id}`}>
                    {copy.openPost}
                  </Link>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}