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
    importedBadge: 'Imported Supplier',
    nativeBadge: 'Surplox Supplier',
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
    importedRole: 'Imported Supplier Lead',
    contactTitle: 'Storefront Actions',
    requestQuote: 'Request Materials',
    openProfile: 'Open Profile',
    openWebsite: 'Open Website',
    phoneLabel: 'Phone',
    websiteLabel: 'Website',
    inventoryTitle: 'What this page is for',
    inventoryBody:
      'This storefront gives contractors and crews a cleaner way to understand what this supplier location offers before outreach.',
    importedInventoryBody:
      'This imported storefront gives Surplox a faster way to seed local supply options before the supplier creates a native Surplox account.',
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
    sunday: 'Sunday',
    deliveryBridgeTitle: 'Supplier → Driver → Jobsite',
    deliveryBridgeBody:
      'Use the driver lane to find delivery support that can move material from this supplier location to the jobsite.',
    searchDrivers: 'Search Delivery Drivers',
    searchDriversByZip: 'Search Drivers Near This ZIP',
    localHaulingTitle: 'Local hauling support',
    localHaulingBody:
      'Driver profiles now show vehicle type, trailer type, trailer length, payload capacity, and delivery radius so delivery capability is easier to verify.',
    supplierLaneTitle: 'Supplier lane',
    supplierLaneBody:
      'This storefront now works as the supply-side anchor while Surplox delivery driver profiles handle transport capability.',
    sourceLabel: 'Source',
    sourceNative: 'Surplox account',
    sourceImported: 'Google-imported',
    importedLeadNote:
      'This record was imported to seed supplier discovery. Verify details directly with the business before ordering.'
  },
  es: {
    loading: 'Cargando tienda proveedora…',
    notFound: 'No se encontró la tienda proveedora.',
    backToFeed: 'Volver al feed',
    backToProfile: 'Ver perfil',
    badge: 'Tienda proveedora',
    importedBadge: 'Proveedor importado',
    nativeBadge: 'Proveedor Surplox',
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
    deliveryEmpty: 'Todavía no se configuró radio de entrega.',
    miles: 'millas',
    aboutTitle: 'Sobre este proveedor',
    aboutEmpty: 'Todavía no hay biografía del proveedor.',
    quickTitle: 'Resumen del proveedor',
    roleLabel: 'Tipo de cuenta',
    supplierRole: 'Proveedor',
    importedRole: 'Proveedor importado',
    contactTitle: 'Acciones de tienda',
    requestQuote: 'Solicitar materiales',
    openProfile: 'Abrir perfil',
    openWebsite: 'Abrir sitio web',
    phoneLabel: 'Teléfono',
    websiteLabel: 'Sitio web',
    inventoryTitle: 'Para qué sirve esta página',
    inventoryBody:
      'Esta tienda le da a contratistas y cuadrillas una forma más clara de entender lo que ofrece esta ubicación antes de contactarla.',
    importedInventoryBody:
      'Esta tienda importada le da a Surplox una forma más rápida de sembrar opciones locales de suministro antes de que el proveedor cree una cuenta nativa.',
    locationMissing: 'No se proporcionó dirección comercial',
    hoursTitle: 'Horario comercial',
    openNow: 'Abierto ahora',
    closedNow: 'Cerrado ahora',
    closedAllDay: 'Cerrado todo el día',
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
    saturday: 'Sábado',
    sunday: 'Domingo',
    deliveryBridgeTitle: 'Proveedor → Conductor → Obra',
    deliveryBridgeBody:
      'Usa la línea de conductores para encontrar apoyo de entrega que pueda mover material desde esta ubicación hasta la obra.',
    searchDrivers: 'Buscar conductores',
    searchDriversByZip: 'Buscar conductores cerca de este ZIP',
    localHaulingTitle: 'Soporte local de acarreo',
    localHaulingBody:
      'Los perfiles de conductores ahora muestran tipo de vehículo, tipo de remolque, largo del remolque, capacidad de carga y radio de entrega para verificar mejor la capacidad.',
    supplierLaneTitle: 'Línea de proveedor',
    supplierLaneBody:
      'Esta tienda ahora funciona como el ancla del lado de suministro mientras los perfiles de conductores de Surplox manejan la capacidad de transporte.',
    sourceLabel: 'Fuente',
    sourceNative: 'Cuenta Surplox',
    sourceImported: 'Importado de Google',
    importedLeadNote:
      'Este registro fue importado para sembrar descubrimiento de proveedores. Verifica los detalles directamente con el negocio antes de ordenar.'
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

function normalizeBusinessHours(value) {
  const base = {
    monday: { closed: true, open: '8:00 AM', close: '5:00 PM' },
    tuesday: { closed: true, open: '8:00 AM', close: '5:00 PM' },
    wednesday: { closed: true, open: '8:00 AM', close: '5:00 PM' },
    thursday: { closed: true, open: '8:00 AM', close: '5:00 PM' },
    friday: { closed: true, open: '8:00 AM', close: '5:00 PM' },
    saturday: { closed: true, open: '8:00 AM', close: '5:00 PM' },
    sunday: { closed: true, open: '8:00 AM', close: '5:00 PM' }
  }

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

function normalizeProfile(data, source = 'native') {
  return {
    source,
    user_id: data?.user_id || null,
    external_id: data?.external_id || null,
    display_name: String(data?.display_name || '').trim(),
    role: data?.role || 'supplier',
    bio: String(data?.bio || '').trim(),
    business_name: String(data?.business_name || data?.display_name || '').trim(),
    business_address: String(data?.business_address || '').trim(),
    business_zip: String(data?.business_zip || '').trim(),
    materials_categories: Array.isArray(data?.materials_categories) ? data.materials_categories : [],
    storefront: Boolean(data?.storefront),
    delivery_radius: Number(data?.delivery_radius || 0) || 0,
    business_hours: normalizeBusinessHours(data?.business_hours),
    city: String(data?.city || '').trim(),
    home_zip: String(data?.home_zip || '').trim(),
    phone: String(data?.phone || '').trim(),
    website_url: String(data?.website_url || '').trim()
  }
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

        const nativeResponse = await supabase
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

        if (nativeResponse.error) throw nativeResponse.error

        if (nativeResponse.data) {
          if (!active) return
          setProfile(normalizeProfile(nativeResponse.data, 'native'))
          setLoading(false)
          return
        }

        let importedQuery = supabase
          .from('external_suppliers')
          .select(
            `
            id,
            external_id,
            display_name,
            business_name,
            business_address,
            business_zip,
            materials_categories,
            storefront,
            delivery_radius,
            business_hours,
            bio,
            phone,
            website_url
          `
          )
          .eq('external_id', userId)
          .maybeSingle()

        let importedResponse = await importedQuery

        if (importedResponse.error && importedResponse.error.code !== 'PGRST116') {
          throw importedResponse.error
        }

        if (!importedResponse.data && /^\d+$/.test(String(userId || ''))) {
          importedResponse = await supabase
            .from('external_suppliers')
            .select(
              `
              id,
              external_id,
              display_name,
              business_name,
              business_address,
              business_zip,
              materials_categories,
              storefront,
              delivery_radius,
              business_hours,
              bio,
              phone,
              website_url
            `
            )
            .eq('id', Number(userId))
            .maybeSingle()

          if (importedResponse.error && importedResponse.error.code !== 'PGRST116') {
            throw importedResponse.error
          }
        }

        if (!importedResponse.data) {
          throw new Error(COPY[currentLang]?.notFound || COPY.en.notFound)
        }

        if (!active) return
        setProfile(normalizeProfile(importedResponse.data, 'imported'))
      } catch (error) {
        console.error(error)
        if (!active) return
        setMsg(error.message || copy.notFound)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadStorefront()

    return () => {
      active = false
    }
  }, [userId, copy.notFound])

  const businessStatus = useMemo(() => {
    return profile ? getCurrentBusinessStatus(profile.business_hours) : 'closed'
  }, [profile])

  if (loading) {
    return <div className="card">{copy.loading}</div>
  }

  if (msg || !profile) {
    return <div className="card">{msg || copy.notFound}</div>
  }

  const supplierName = profile.business_name || profile.display_name || copy.titleFallback
  const heroTitle = supplierName || copy.heroTitleFallback
  const heroBody = profile.bio || copy.heroBodyFallback
  const isImported = profile.source === 'imported'

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div
        className="card rounded-xl"
        style={{
          padding: 28,
          background: isImported
            ? 'linear-gradient(180deg, #eef3ff 0%, #f7f7f2 100%)'
            : 'linear-gradient(180deg, #fff7c8 0%, #f7f7f2 100%)'
        }}
      >
        <div
          className="badge"
          style={{
            marginBottom: 14,
            background: isImported ? '#d8ecff' : '#f1e7a8',
            color: isImported ? '#0d3f73' : '#111111'
          }}
        >
          {isImported ? copy.importedBadge : copy.badge}
        </div>

        <div className="h1" style={{ maxWidth: 760 }}>{heroTitle}</div>

        <p className="muted" style={{ marginTop: 12, maxWidth: 860, fontSize: 17, lineHeight: 1.7 }}>
          {heroBody}
        </p>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
          <span className="badge">{copy.roleLabel}: {isImported ? copy.importedRole : copy.supplierRole}</span>
          <span className="badge">{copy.sourceLabel}: {isImported ? copy.sourceImported : copy.sourceNative}</span>
          <span className="badge">
            {businessStatus === 'open' ? copy.openNow : copy.closedNow}
          </span>
          {profile.business_zip ? <span className="badge">{copy.zipLabel}: {profile.business_zip}</span> : null}
        </div>
      </div>

      <div className="grid three" style={{ gap: 14 }}>
        <StatTile label={copy.roleLabel} value={isImported ? copy.importedRole : copy.supplierRole} />
        <StatTile
          label={copy.storefrontLabel}
          value={profile.storefront ? copy.storefrontYes : copy.storefrontNo}
        />
        <StatTile
          label={copy.deliveryTitle}
          value={
            profile.delivery_radius > 0
              ? `${profile.delivery_radius} ${copy.miles}`
              : copy.deliveryEmpty
          }
        />
      </div>

      <div className="grid two" style={{ gap: 18 }}>
        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">{copy.locationTitle}</div>
          <p style={{ marginTop: 10, lineHeight: 1.7 }}>
            {profile.business_address || copy.locationMissing}
          </p>

          <div className="grid two" style={{ gap: 12, marginTop: 16 }}>
            <div className="card-soft">
              <div className="card-section-title" style={{ fontSize: 15 }}>{copy.zipLabel}</div>
              <div className="muted" style={{ marginTop: 6 }}>{profile.business_zip || '—'}</div>
            </div>

            <div className="card-soft">
              <div className="card-section-title" style={{ fontSize: 15 }}>{copy.storefrontLabel}</div>
              <div className="muted" style={{ marginTop: 6 }}>
                {profile.storefront ? copy.storefrontYes : copy.storefrontNo}
              </div>
            </div>
          </div>

          {(profile.phone || profile.website_url) ? (
            <div className="grid two" style={{ gap: 12, marginTop: 16 }}>
              <div className="card-soft">
                <div className="card-section-title" style={{ fontSize: 15 }}>{copy.phoneLabel}</div>
                <div className="muted" style={{ marginTop: 6 }}>{profile.phone || '—'}</div>
              </div>

              <div className="card-soft">
                <div className="card-section-title" style={{ fontSize: 15 }}>{copy.websiteLabel}</div>
                <div className="muted" style={{ marginTop: 6, overflowWrap: 'anywhere' }}>
                  {profile.website_url || '—'}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">{copy.hoursTitle}</div>

          <div className="card-soft" style={{ marginTop: 14, background: businessStatus === 'open' ? '#dcf4e5' : '#f8f7ef' }}>
            <div style={{ fontWeight: 800 }}>
              {businessStatus === 'open' ? copy.openNow : copy.closedNow}
            </div>
          </div>

          <div className="grid" style={{ gap: 10, marginTop: 14 }}>
            {BUSINESS_HOUR_DAYS.map((day) => {
              const row = profile.business_hours?.[day.key]
              return (
                <div key={day.key} className="card-soft" style={{ background: '#ffffff' }}>
                  <div style={{ fontWeight: 800 }}>{copy[day.copyKey]}</div>
                  <div className="muted" style={{ marginTop: 6 }}>
                    {row?.closed ? copy.closedAllDay : `${row?.open || '8:00 AM'} – ${row?.close || '5:00 PM'}`}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="card-section-title">{copy.materialsTitle}</div>

        {profile.materials_categories.length === 0 ? (
          <p className="card-section-subtitle" style={{ marginTop: 8 }}>
            {copy.materialsEmpty}
          </p>
        ) : (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
            {profile.materials_categories.map((item) => (
              <span key={`${profile.user_id || profile.external_id}-${item}`} className="badge">
                {formatMaterialsLabel(item, lang)}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="card-section-title">{copy.aboutTitle}</div>
        <p style={{ marginTop: 10, lineHeight: 1.7 }}>
          {profile.bio || copy.aboutEmpty}
        </p>

        {isImported ? (
          <div className="card-soft" style={{ marginTop: 16, background: '#eef3ff' }}>
            {copy.importedLeadNote}
          </div>
        ) : null}
      </div>

      <div className="grid two" style={{ gap: 18 }}>
        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">{copy.contactTitle}</div>
          <p className="card-section-subtitle" style={{ marginTop: 8 }}>
            {isImported ? copy.importedInventoryBody : copy.inventoryBody}
          </p>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
            <Link className="btn primary" to="/new">
              {copy.requestQuote}
            </Link>

            {!isImported && profile.user_id ? (
              <Link className="btn" to={`/u/${profile.user_id}`}>
                {copy.openProfile}
              </Link>
            ) : null}

            {profile.website_url ? (
              <a
                className="btn"
                href={profile.website_url}
                target="_blank"
                rel="noreferrer"
              >
                {copy.openWebsite}
              </a>
            ) : null}

            <Link className="btn" to="/feed">
              {copy.backToFeed}
            </Link>
          </div>
        </div>

        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">{copy.deliveryBridgeTitle}</div>
          <p className="card-section-subtitle" style={{ marginTop: 8 }}>
            {copy.deliveryBridgeBody}
          </p>

          <div className="card-soft" style={{ marginTop: 14 }}>
            <div style={{ fontWeight: 800 }}>{copy.localHaulingTitle}</div>
            <p className="muted" style={{ marginTop: 8, lineHeight: 1.7 }}>
              {copy.localHaulingBody}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
            <Link className="btn primary" to="/delivery">
              {copy.searchDrivers}
            </Link>

            <Link
              className="btn"
              to={`/delivery${profile.business_zip ? `?zip=${encodeURIComponent(profile.business_zip)}` : ''}`}
            >
              {copy.searchDriversByZip}
            </Link>
          </div>
        </div>
      </div>

      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="card-section-title">{copy.supplierLaneTitle}</div>
        <p className="card-section-subtitle" style={{ marginTop: 8 }}>
          {copy.supplierLaneBody}
        </p>
      </div>
    </div>
  )
}
