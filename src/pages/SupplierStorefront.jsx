import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'

const COPY = {
  en: {
    loading: 'Loading supplier storefront…',
    notFound: 'Supplier storefront not found.',
    backToFeed: 'Back to Feed',
    backToProfile: 'View Worker Profile',
    badge: 'Supplier Storefront',
    titleFallback: 'Supplier',
    heroTitleFallback: 'Construction supply storefront',
    heroBodyFallback:
      'View supplier details, materials categories, business location, business hours, and delivery coverage.',
    locationTitle: 'Business Location',
    zipLabel: 'Business ZIP',
    storefrontLabel: 'Storefront',
    storefrontYes: 'Physical storefront / yard location',
    storefrontNo: 'No storefront flag set',
    materialsTitle: 'Materials Categories',
    materialsEmpty: 'No materials categories listed yet.',
    deliveryTitle: 'Delivery Radius',
    deliveryEmpty: 'Delivery radius not set.',
    miles: 'miles',
    aboutTitle: 'About This Supplier',
    aboutEmpty: 'No supplier bio added yet.',
    quickTitle: 'Supplier Snapshot',
    roleLabel: 'Account Type',
    supplierRole: 'Supplier',
    contactTitle: 'Storefront Actions',
    requestQuote: 'Request Materials',
    openProfile: 'Open Profile',
    inventoryTitle: 'What this page is for',
    inventoryBody:
      'This storefront gives contractors and crews a cleaner way to understand what this supplier location offers before outreach.',
    locationMissing: 'Business address not provided',
    hoursTitle: 'Business Hours',
    openNow: 'Open Now',
    closedNow: 'Closed Now',
    closedAllDay: 'Closed All Day',
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  },
  es: {
    loading: 'Cargando tienda proveedora…',
    notFound: 'No se encontró la tienda proveedora.',
    backToFeed: 'Volver al feed',
    backToProfile: 'Ver perfil',
    badge: 'Tienda proveedora',
    titleFallback: 'Proveedor',
    heroTitleFallback: 'Ubicación proveedora de materiales',
    heroBodyFallback:
      'Consulta detalles del proveedor, categorías de materiales, ubicación comercial, horarios y cobertura de entrega.',
    locationTitle: 'Ubicación del negocio',
    zipLabel: 'ZIP comercial',
    storefrontLabel: 'Tienda física',
    storefrontYes: 'Ubicación física / patio',
    storefrontNo: 'Sin indicador de tienda física',
    materialsTitle: 'Categorías de materiales',
    materialsEmpty: 'Todavía no hay categorías de materiales.',
    deliveryTitle: 'Radio de entrega',
    deliveryEmpty: 'No se ha definido radio de entrega.',
    miles: 'millas',
    aboutTitle: 'Sobre este proveedor',
    aboutEmpty: 'Este proveedor todavía no agregó biografía.',
    quickTitle: 'Resumen del proveedor',
    roleLabel: 'Tipo de cuenta',
    supplierRole: 'Proveedor',
    contactTitle: 'Acciones de la tienda',
    requestQuote: 'Solicitar materiales',
    openProfile: 'Abrir perfil',
    inventoryTitle: 'Para qué sirve esta página',
    inventoryBody:
      'Esta tienda le da a contratistas y cuadrillas una forma más limpia de entender lo que ofrece esta ubicación antes de contactarla.',
    locationMissing: 'No se proporcionó dirección comercial',
    hoursTitle: 'Horario Comercial',
    openNow: 'Abierto Ahora',
    closedNow: 'Cerrado Ahora',
    closedAllDay: 'Cerrado Todo el Día',
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
    saturday: 'Sábado',
    sunday: 'Domingo'
  }
}

const BUSINESS_HOUR_DAYS = [
  { key: 'monday', copyKey: 'monday' },
  { key: 'tuesday', copyKey: 'tuesday' },
  { key: 'wednesday', copyKey: 'wednesday' },
  { key: 'thursday', copyKey: 'thursday' },
  { key: 'friday', copyKey: 'friday' },
  { key: 'saturday', copyKey: 'saturday' },
  { key: 'sunday', copyKey: 'sunday' }
]

function defaultBusinessHours() {
  return {
    monday: { closed: false, open: '8:00 AM', close: '5:00 PM' },
    tuesday: { closed: false, open: '8:00 AM', close: '5:00 PM' },
    wednesday: { closed: false, open: '8:00 AM', close: '5:00 PM' },
    thursday: { closed: false, open: '8:00 AM', close: '5:00 PM' },
    friday: { closed: false, open: '8:00 AM', close: '5:00 PM' },
    saturday: { closed: true, open: '8:00 AM', close: '5:00 PM' },
    sunday: { closed: true, open: '8:00 AM', close: '5:00 PM' }
  }
}

function normalizeBusinessHours(value) {
  const base = defaultBusinessHours()
  if (!value || typeof value !== 'object') return base

  const next = { ...base }

  BUSINESS_HOUR_DAYS.forEach((day) => {
    const row = value?.[day.key]
    if (row && typeof row === 'object') {
      next[day.key] = {
        closed: Boolean(row.closed),
        open: String(row.open || base[day.key].open),
        close: String(row.close || base[day.key].close)
      }
    }
  })

  return next
}

function parseTimeLabelToMinutes(label) {
  const match = String(label || '').match(/^(\d{1,2}):(\d{2})\s(AM|PM)$/)
  if (!match) return null

  let hour = Number(match[1])
  const minute = Number(match[2])
  const suffix = match[3]

  if (suffix === 'AM') {
    if (hour === 12) hour = 0
  } else if (hour !== 12) {
    hour += 12
  }

  return hour * 60 + minute
}

function getCurrentBusinessStatus(businessHours) {
  const normalized = normalizeBusinessHours(businessHours)
  const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const today = normalized[dayKeys[new Date().getDay()]]

  if (!today || today.closed) return 'closed'

  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const openMinutes = parseTimeLabelToMinutes(today.open)
  const closeMinutes = parseTimeLabelToMinutes(today.close)

  if (openMinutes === null || closeMinutes === null) return 'closed'
  return currentMinutes >= openMinutes && currentMinutes < closeMinutes ? 'open' : 'closed'
}

function formatMaterialsLabel(value, lang = 'en') {
  const labels = {
    concrete: { en: 'Concrete', es: 'Concreto' },
    lumber: { en: 'Lumber', es: 'Madera' },
    steel: { en: 'Steel', es: 'Acero' },
    electrical: { en: 'Electrical', es: 'Eléctrico' },
    plumbing: { en: 'Plumbing', es: 'Plomería' },
    drywall: { en: 'Drywall', es: 'Tablaroca' },
    fasteners: { en: 'Fasteners', es: 'Sujetadores' },
    tools: { en: 'Tools', es: 'Herramientas' },
    equipment_rental: { en: 'Equipment Rental', es: 'Renta de equipo' },
    safety_equipment: { en: 'Safety Equipment', es: 'Equipo de seguridad' }
  }

  return labels[value]?.[lang] || labels[value]?.en || value
}

function StatTile({ label, value }) {
  return (
    <div className="card-soft" style={{ minHeight: 96 }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--muted-soft)'
        }}
      >
        {label}
      </div>
      <div style={{ marginTop: 8, fontSize: 18, fontWeight: 900, lineHeight: 1.2 }}>{value}</div>
    </div>
  )
}

export default function SupplierStorefront() {
  const { userId } = useParams()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [lang, setLang] = useState(localStorage.getItem('surplox_lang') || 'en')

  const copy = COPY[lang] || COPY.en

  useEffect(() => {
    let active = true

    async function loadStorefront() {
      setLoading(true)
      setMsg('')

      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const sessionUser = sessionData.session?.user

        let currentLang = localStorage.getItem('surplox_lang') || 'en'

        if (sessionUser) {
          const { data: me } = await supabase
            .from('profiles')
            .select('preferred_language')
            .eq('user_id', sessionUser.id)
            .maybeSingle()

          currentLang = me?.preferred_language || currentLang
        }

        if (!active) return
        setLang(currentLang)
        localStorage.setItem('surplox_lang', currentLang)

        const { data, error } = await supabase
          .from('profiles')
          .select(
            `
            user_id,
            display_name,
            role,
            bio,
            business_name,
            business_address,
            business_zip,
            materials_categories,
            storefront,
            delivery_radius,
            business_hours,
            city,
            home_zip
          `
          )
          .eq('user_id', userId)
          .eq('role', 'supplier')
          .maybeSingle()

        if (error) throw error
        if (!data) throw new Error(COPY[currentLang]?.notFound || COPY.en.notFound)

        if (!active) return

        setProfile({
          ...data,
          materials_categories: Array.isArray(data.materials_categories) ? data.materials_categories : [],
          business_hours: normalizeBusinessHours(data.business_hours)
        })
      } catch (error) {
        console.error(error)
        if (!active) return
        setMsg(error?.message || copy.notFound)
      } finally {
        if (!active) return
        setLoading(false)
      }
    }

    loadStorefront()

    return () => {
      active = false
    }
  }, [userId])

  const displayName = useMemo(() => {
    if (!profile) return ''
    return (
      String(profile.business_name || '').trim() ||
      String(profile.display_name || '').trim() ||
      copy.titleFallback
    )
  }, [profile, copy.titleFallback])

  const locationLine = useMemo(() => {
    if (!profile) return ''
    return String(profile.business_address || '').trim() || copy.locationMissing
  }, [profile, copy.locationMissing])

  const zipValue = useMemo(() => {
    if (!profile) return ''
    return String(profile.business_zip || profile.home_zip || '').trim() || '—'
  }, [profile])

  const deliveryValue = useMemo(() => {
    if (!profile?.delivery_radius) return copy.deliveryEmpty
    return `${profile.delivery_radius} ${copy.miles}`
  }, [profile, copy.deliveryEmpty, copy.miles])

  const businessStatus = useMemo(() => {
    if (!profile?.business_hours) return 'closed'
    return getCurrentBusinessStatus(profile.business_hours)
  }, [profile])

  if (loading) {
    return <div className="card">{copy.loading}</div>
  }

  if (msg) {
    return (
      <div className="grid" style={{ gap: 18 }}>
        <div className="card">
          <div className="h1" style={{ fontSize: 22 }}>
            {msg}
          </div>

          <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link to="/feed" className="btn">
              {copy.backToFeed}
            </Link>
          </div>
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
          {copy.badge}
        </div>

        <div className="h1" style={{ maxWidth: 760 }}>
          {displayName}
        </div>

        <p className="muted" style={{ marginTop: 12, maxWidth: 860, fontSize: 17, lineHeight: 1.7 }}>
          {String(profile?.bio || '').trim() || copy.heroBodyFallback}
        </p>

        <div style={{ marginTop: 18, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link to={`/u/${profile.user_id}`} className="btn">
            {copy.backToProfile}
          </Link>
          <Link to="/feed" className="btn">
            {copy.backToFeed}
          </Link>
        </div>
      </div>

      <div className="grid three">
        <StatTile label={copy.roleLabel} value={copy.supplierRole} />
        <StatTile label={copy.zipLabel} value={zipValue} />
        <StatTile
          label={copy.deliveryTitle}
          value={profile?.delivery_radius ? `${profile.delivery_radius} ${copy.miles}` : '—'}
        />
      </div>

      <div className="grid two">
        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">{copy.locationTitle}</div>

          <div style={{ marginTop: 14, fontWeight: 800, fontSize: 18, lineHeight: 1.35 }}>
            {displayName}
          </div>

          <div style={{ marginTop: 10 }}>{locationLine}</div>

          <div className="muted" style={{ marginTop: 8 }}>
            {copy.zipLabel}: {zipValue}
          </div>

          <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className="badge" style={{ background: '#ecebe3' }}>
              {copy.storefrontLabel}: {profile?.storefront ? copy.storefrontYes : copy.storefrontNo}
            </span>

            <span
              className="badge"
              style={
                businessStatus === 'open'
                  ? { background: '#dcf4e5', color: '#177245' }
                  : { background: '#f8f7ef', color: '#111111' }
              }
            >
              {businessStatus === 'open' ? copy.openNow : copy.closedNow}
            </span>
          </div>
        </div>

        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">{copy.contactTitle}</div>

          <p className="muted" style={{ marginTop: 14, lineHeight: 1.7 }}>
            {copy.inventoryBody}
          </p>

          <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link
              to="/new?type=discussion"
              className="btn primary"
            >
              {copy.requestQuote}
            </Link>

            <Link to={`/u/${profile.user_id}`} className="btn">
              {copy.openProfile}
            </Link>
          </div>
        </div>
      </div>

      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="card-section-title">{copy.materialsTitle}</div>

        {profile?.materials_categories?.length ? (
          <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {profile.materials_categories.map((item) => (
              <span key={item} className="badge" style={{ background: '#f1e7a8' }}>
                {formatMaterialsLabel(item, lang)}
              </span>
            ))}
          </div>
        ) : (
          <div className="muted" style={{ marginTop: 14 }}>
            {copy.materialsEmpty}
          </div>
        )}
      </div>

      <div className="grid two">
        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">{copy.aboutTitle}</div>

          <p className="muted" style={{ marginTop: 14, lineHeight: 1.8 }}>
            {String(profile?.bio || '').trim() || copy.aboutEmpty}
          </p>
        </div>

        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">{copy.hoursTitle}</div>

          <div
            className="card-soft"
            style={{
              minHeight: 'auto',
              padding: 14,
              marginTop: 14,
              background: businessStatus === 'open' ? '#dcf4e5' : '#f8f7ef'
            }}
          >
            <strong>{businessStatus === 'open' ? copy.openNow : copy.closedNow}</strong>
          </div>

          <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
            {BUSINESS_HOUR_DAYS.map((day) => {
              const row = normalizeBusinessHours(profile?.business_hours)[day.key]
              return (
                <div
                  key={day.key}
                  className="card-soft"
                  style={{ minHeight: 'auto', padding: 14, background: '#ffffff' }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.2fr 1fr',
                      gap: 10,
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{copy[day.copyKey]}</div>
                    <div className="muted" style={{ textAlign: 'right' }}>
                      {row.closed ? copy.closedAllDay : `${row.open} - ${row.close}`}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="card-section-title">{copy.quickTitle}</div>

        <div className="list" style={{ marginTop: 14 }}>
          <div className="card-soft" style={{ background: '#ffffff' }}>
            <div style={{ fontWeight: 800 }}>{copy.locationTitle}</div>
            <div className="muted" style={{ marginTop: 6 }}>
              {locationLine}
            </div>
          </div>

          <div className="card-soft" style={{ background: '#ffffff' }}>
            <div style={{ fontWeight: 800 }}>{copy.deliveryTitle}</div>
            <div className="muted" style={{ marginTop: 6 }}>
              {deliveryValue}
            </div>
          </div>

          <div className="card-soft" style={{ background: '#ffffff' }}>
            <div style={{ fontWeight: 800 }}>{copy.storefrontLabel}</div>
            <div className="muted" style={{ marginTop: 6 }}>
              {profile?.storefront ? copy.storefrontYes : copy.storefrontNo}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}