import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

const MATERIAL_CATEGORY_OPTIONS = [
  'Lumber',
  'Concrete',
  'Rebar',
  'Drywall',
  'Roofing',
  'Electrical',
  'Plumbing',
  'HVAC',
  'Insulation',
  'Masonry',
  'Steel',
  'Aggregates',
  'Doors',
  'Windows',
  'Fasteners',
  'Tools',
  'Equipment Rental',
  'Safety Supplies',
  'Paint',
  'Flooring'
]

const BUSINESS_HOUR_DAYS = [
  { key: 'monday', en: 'Monday', es: 'Lunes' },
  { key: 'tuesday', en: 'Tuesday', es: 'Martes' },
  { key: 'wednesday', en: 'Wednesday', es: 'Miércoles' },
  { key: 'thursday', en: 'Thursday', es: 'Jueves' },
  { key: 'friday', en: 'Friday', es: 'Viernes' },
  { key: 'saturday', en: 'Saturday', es: 'Sábado' },
  { key: 'sunday', en: 'Sunday', es: 'Domingo' }
]

const COPY = {
  en: {
    badge: 'Supplier Directory',
    title: 'Find suppliers and materials faster.',
    body:
      'Search local supplier profiles by material category, ZIP, storefront, delivery radius, and business details so crews and contractors can find nearby supply options faster.',
    requestButton: 'Post Material Request',
    requestBody:
      'Need something specific? Create a post so suppliers on the network can respond.',
    search: 'Search suppliers or materials',
    searchPlaceholder: 'Search lumber, concrete, roofing, supplier name, ZIP...',
    zip: 'ZIP',
    zipPlaceholder: 'Filter by ZIP',
    storefrontOnly: 'Storefront only',
    allMaterials: 'All Materials',
    sortBy: 'Sort By',
    sortBestMatch: 'Best Match',
    sortRadius: 'Largest Delivery Radius',
    sortName: 'Business Name',
    showing: 'Showing',
    results: 'results',
    emptyTitle: 'No suppliers match your current search.',
    emptyBody: 'Try clearing a filter or searching a broader material category.',
    clear: 'Clear Filters',
    supplier: 'Supplier',
    storefront: 'Storefront',
    noStorefront: 'No storefront flag',
    deliveryRadius: 'Delivery Radius',
    materials: 'Materials',
    bio: 'Business Bio',
    noBio: 'No business bio added yet.',
    viewStorefront: 'View Storefront',
    openProfile: 'View Profile',
    requestMaterials: 'Request Materials',
    openNow: 'Open Now',
    closedNow: 'Closed Now',
    unknownHours: 'Hours not listed',
    miles: 'mi',
    location: 'Business ZIP',
    supplierCountTitle: 'Active supplier visibility',
    supplierCountBody:
      'This page gives Surplox a real supplier discovery lane without removing the worker and crew flow already in place.',
    fastFiltersTitle: 'Quick material filters',
    fastFiltersBody:
      'Tap a material category to narrow the supplier directory instantly.'
  },
  es: {
    badge: 'Directorio de proveedores',
    title: 'Encuentra proveedores y materiales más rápido.',
    body:
      'Busca perfiles de proveedores locales por categoría de material, ZIP, tienda física, radio de entrega y detalles del negocio para que cuadrillas y contratistas encuentren opciones cercanas más rápido.',
    requestButton: 'Publicar solicitud de materiales',
    requestBody:
      '¿Necesitas algo específico? Crea una publicación para que los proveedores de la red puedan responder.',
    search: 'Buscar proveedores o materiales',
    searchPlaceholder: 'Busca madera, concreto, roofing, nombre comercial, ZIP...',
    zip: 'ZIP',
    zipPlaceholder: 'Filtrar por ZIP',
    storefrontOnly: 'Solo tienda física',
    allMaterials: 'Todos los materiales',
    sortBy: 'Ordenar por',
    sortBestMatch: 'Mejor coincidencia',
    sortRadius: 'Mayor radio de entrega',
    sortName: 'Nombre comercial',
    showing: 'Mostrando',
    results: 'resultados',
    emptyTitle: 'Ningún proveedor coincide con tu búsqueda actual.',
    emptyBody: 'Prueba limpiar un filtro o buscar una categoría de material más amplia.',
    clear: 'Limpiar filtros',
    supplier: 'Proveedor',
    storefront: 'Tienda física',
    noStorefront: 'Sin indicador de tienda',
    deliveryRadius: 'Radio de entrega',
    materials: 'Materiales',
    bio: 'Biografía del negocio',
    noBio: 'Todavía no hay biografía del negocio.',
    viewStorefront: 'Ver tienda',
    openProfile: 'Ver perfil',
    requestMaterials: 'Solicitar materiales',
    openNow: 'Abierto ahora',
    closedNow: 'Cerrado ahora',
    unknownHours: 'Horario no listado',
    miles: 'mi',
    location: 'ZIP comercial',
    supplierCountTitle: 'Visibilidad activa de proveedores',
    supplierCountBody:
      'Esta página le da a Surplox una ruta real de descubrimiento de proveedores sin quitar el flujo de trabajadores y cuadrillas ya existente.',
    fastFiltersTitle: 'Filtros rápidos de materiales',
    fastFiltersBody:
      'Toca una categoría de material para filtrar el directorio de proveedores al instante.'
  }
}

function normalizeBusinessHours(value) {
  const base = {
    monday: { closed: false, open: '8:00 AM', close: '5:00 PM' },
    tuesday: { closed: false, open: '8:00 AM', close: '5:00 PM' },
    wednesday: { closed: false, open: '8:00 AM', close: '5:00 PM' },
    thursday: { closed: false, open: '8:00 AM', close: '5:00 PM' },
    friday: { closed: false, open: '8:00 AM', close: '5:00 PM' },
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

function getBusinessStatus(businessHours) {
  if (!businessHours || typeof businessHours !== 'object') return 'unknown'

  const normalized = normalizeBusinessHours(businessHours)
  const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const today = normalized[dayKeys[new Date().getDay()]]

  if (!today) return 'unknown'
  if (today.closed) return 'closed'

  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const openMinutes = parseTimeLabelToMinutes(today.open)
  const closeMinutes = parseTimeLabelToMinutes(today.close)

  if (openMinutes === null || closeMinutes === null) return 'unknown'
  return currentMinutes >= openMinutes && currentMinutes < closeMinutes ? 'open' : 'closed'
}

function scoreSupplier(supplier, query, selectedMaterial, zipFilter, storefrontOnly) {
  let score = 0
  const haystack = [
    supplier.business_name,
    supplier.display_name,
    supplier.business_zip,
    supplier.bio,
    ...(supplier.materials_categories || [])
  ]
    .join(' ')
    .toLowerCase()

  if (query) {
    const terms = query
      .toLowerCase()
      .split(/\s+/)
      .map((term) => term.trim())
      .filter(Boolean)

    terms.forEach((term) => {
      if (haystack.includes(term)) score += 6
      if ((supplier.materials_categories || []).some((item) => String(item).toLowerCase().includes(term))) {
        score += 12
      }
      if (String(supplier.business_name || '').toLowerCase().includes(term)) {
        score += 10
      }
      if (String(supplier.business_zip || '').toLowerCase() === term) {
        score += 8
      }
    })
  }

  if (selectedMaterial) {
    const hasMatch = (supplier.materials_categories || []).some(
      (item) => String(item).toLowerCase() === selectedMaterial.toLowerCase()
    )
    if (hasMatch) score += 20
  }

  if (zipFilter && String(supplier.business_zip || '').trim() === zipFilter.trim()) {
    score += 10
  }

  if (storefrontOnly && supplier.storefront) {
    score += 6
  }

  if (Number(supplier.delivery_radius || 0) > 0) {
    score += Math.min(Number(supplier.delivery_radius || 0), 100) / 10
  }

  return score
}

export default function Materials({ lang = 'en' }) {
  const copy = COPY[lang] || COPY.en

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [suppliers, setSuppliers] = useState([])

  const [query, setQuery] = useState('')
  const [zipFilter, setZipFilter] = useState('')
  const [selectedMaterial, setSelectedMaterial] = useState('')
  const [storefrontOnly, setStorefrontOnly] = useState(false)
  const [sortBy, setSortBy] = useState('best')

  useEffect(() => {
    let active = true

    async function loadSuppliers() {
      setLoading(true)
      setError('')

      try {
        const { data, error: supplierError } = await supabase
          .from('profiles')
          .select(`
            user_id,
            display_name,
            business_name,
            business_zip,
            delivery_radius,
            materials_categories,
            storefront,
            bio,
            business_hours,
            role
          `)
          .eq('role', 'supplier')
          .order('business_name', { ascending: true })

        if (supplierError) throw supplierError
        if (!active) return

        const normalized = (data || []).map((item) => ({
          ...item,
          materials_categories: Array.isArray(item.materials_categories) ? item.materials_categories : []
        }))

        setSuppliers(normalized)
      } catch (err) {
        console.error(err)
        if (active) {
          setError(lang === 'es' ? 'No se pudieron cargar los proveedores.' : 'Unable to load suppliers.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadSuppliers()

    return () => {
      active = false
    }
  }, [lang])

  const dynamicMaterialOptions = useMemo(() => {
    const set = new Set(MATERIAL_CATEGORY_OPTIONS)

    suppliers.forEach((supplier) => {
      ;(supplier.materials_categories || []).forEach((item) => {
        const value = String(item || '').trim()
        if (value) set.add(value)
      })
    })

    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [suppliers])

  const filteredSuppliers = useMemo(() => {
    let next = [...suppliers]

    if (query.trim()) {
      const q = query.trim().toLowerCase()
      next = next.filter((supplier) => {
        const haystack = [
          supplier.business_name,
          supplier.display_name,
          supplier.business_zip,
          supplier.bio,
          ...(supplier.materials_categories || [])
        ]
          .join(' ')
          .toLowerCase()

        return haystack.includes(q)
      })
    }

    if (zipFilter.trim()) {
      next = next.filter((supplier) => String(supplier.business_zip || '').trim() === zipFilter.trim())
    }

    if (selectedMaterial) {
      next = next.filter((supplier) =>
        (supplier.materials_categories || []).some(
          (item) => String(item).toLowerCase() === selectedMaterial.toLowerCase()
        )
      )
    }

    if (storefrontOnly) {
      next = next.filter((supplier) => supplier.storefront)
    }

    if (sortBy === 'radius') {
      next.sort((a, b) => Number(b.delivery_radius || 0) - Number(a.delivery_radius || 0))
    } else if (sortBy === 'name') {
      next.sort((a, b) =>
        String(a.business_name || a.display_name || '').localeCompare(
          String(b.business_name || b.display_name || '')
        )
      )
    } else {
      next.sort((a, b) => {
        const scoreA = scoreSupplier(a, query, selectedMaterial, zipFilter, storefrontOnly)
        const scoreB = scoreSupplier(b, query, selectedMaterial, zipFilter, storefrontOnly)
        return scoreB - scoreA
      })
    }

    return next
  }, [suppliers, query, zipFilter, selectedMaterial, storefrontOnly, sortBy])

  const supplierCount = suppliers.length

  function clearFilters() {
    setQuery('')
    setZipFilter('')
    setSelectedMaterial('')
    setStorefrontOnly(false)
    setSortBy('best')
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

        <div className="h1" style={{ maxWidth: 760 }}>{copy.title}</div>

        <p className="muted" style={{ marginTop: 12, maxWidth: 860, fontSize: 17, lineHeight: 1.7 }}>
          {copy.body}
        </p>

        <div style={{ marginTop: 18, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link to="/new?type=discussion" className="btn primary">
            {copy.requestButton}
          </Link>
          <Link to="/feed" className="btn">
            Feed
          </Link>
        </div>

        <div className="card-soft" style={{ marginTop: 16, background: 'rgba(255,255,255,0.62)' }}>
          <div className="card-section-title" style={{ fontSize: 16 }}>
            {copy.supplierCountTitle}
          </div>
          <p className="card-section-subtitle" style={{ marginTop: 8 }}>
            {copy.supplierCountBody}
          </p>

          <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className="badge">{supplierCount} suppliers</span>
            <span className="badge">{filteredSuppliers.length} visible</span>
          </div>
        </div>
      </div>

      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="card-section-title">{copy.fastFiltersTitle}</div>
        <p className="card-section-subtitle" style={{ marginTop: 8 }}>
          {copy.fastFiltersBody}
        </p>

        <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            className={!selectedMaterial ? 'btn primary small' : 'btn small'}
            onClick={() => setSelectedMaterial('')}
          >
            {copy.allMaterials}
          </button>

          {dynamicMaterialOptions.slice(0, 20).map((option) => {
            const active = selectedMaterial === option
            return (
              <button
                key={option}
                type="button"
                className={active ? 'btn primary small' : 'btn small'}
                onClick={() => setSelectedMaterial(option)}
              >
                {option}
              </button>
            )
          })}
        </div>
      </div>

      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="grid" style={{ gap: 14 }}>
          <div>
            <div className="muted" style={{ marginBottom: 8 }}>{copy.search}</div>
            <input
              className="input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={copy.searchPlaceholder}
            />
          </div>

          <div className="grid two" style={{ gap: 14 }}>
            <div>
              <div className="muted" style={{ marginBottom: 8 }}>{copy.zip}</div>
              <input
                className="input"
                value={zipFilter}
                onChange={(e) => setZipFilter(e.target.value.replace(/[^\d]/g, '').slice(0, 5))}
                placeholder={copy.zipPlaceholder}
              />
            </div>

            <div>
              <div className="muted" style={{ marginBottom: 8 }}>{copy.sortBy}</div>
              <select
                className="input"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="best">{copy.sortBestMatch}</option>
                <option value="radius">{copy.sortRadius}</option>
                <option value="name">{copy.sortName}</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="button"
              className={storefrontOnly ? 'btn primary small' : 'btn small'}
              onClick={() => setStorefrontOnly((prev) => !prev)}
            >
              {copy.storefrontOnly}
            </button>

            <button type="button" className="btn small" onClick={clearFilters}>
              {copy.clear}
            </button>

            <span className="badge">
              {copy.showing} {filteredSuppliers.length} {copy.results}
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card rounded-xl" style={{ padding: 22 }}>
          {lang === 'es' ? 'Cargando proveedores…' : 'Loading suppliers…'}
        </div>
      ) : error ? (
        <div className="card rounded-xl" style={{ padding: 22, background: '#fff4da' }}>
          {error}
        </div>
      ) : filteredSuppliers.length === 0 ? (
        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">{copy.emptyTitle}</div>
          <p className="card-section-subtitle" style={{ marginTop: 8 }}>
            {copy.emptyBody}
          </p>
        </div>
      ) : (
        <div className="grid" style={{ gap: 16 }}>
          {filteredSuppliers.map((supplier) => {
            const displayName =
              String(supplier.business_name || '').trim() ||
              String(supplier.display_name || '').trim() ||
              copy.supplier

            const status = getBusinessStatus(supplier.business_hours)

            return (
              <div key={supplier.user_id} className="card rounded-xl" style={{ padding: 22 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    flexWrap: 'wrap',
                    alignItems: 'flex-start'
                  }}
                >
                  <div>
                    <div className="h2" style={{ fontSize: 24 }}>{displayName}</div>

                    <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span className="badge" style={{ background: '#f1e7a8', color: '#111111' }}>
                        {copy.supplier}
                      </span>

                      <span className="badge">
                        {copy.location}: {supplier.business_zip || '—'}
                      </span>

                      <span className="badge">
                        {copy.deliveryRadius}: {Number(supplier.delivery_radius || 0) > 0
                          ? `${supplier.delivery_radius} ${copy.miles}`
                          : '—'}
                      </span>

                      <span
                        className="badge"
                        style={
                          supplier.storefront
                            ? { background: '#dcf4e5', color: '#177245' }
                            : { background: '#f8f7ef', color: '#111111' }
                        }
                      >
                        {supplier.storefront ? copy.storefront : copy.noStorefront}
                      </span>

                      <span
                        className="badge"
                        style={
                          status === 'open'
                            ? { background: '#dcf4e5', color: '#177245' }
                            : { background: '#f8f7ef', color: '#111111' }
                        }
                      >
                        {status === 'open'
                          ? copy.openNow
                          : status === 'closed'
                            ? copy.closedNow
                            : copy.unknownHours}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Link className="btn small primary" to={`/supplier/${supplier.user_id}`}>
                      {copy.viewStorefront}
                    </Link>
                    <Link className="btn small" to={`/u/${supplier.user_id}`}>
                      {copy.openProfile}
                    </Link>
                    <Link className="btn small" to="/new?type=discussion">
                      {copy.requestMaterials}
                    </Link>
                  </div>
                </div>

                <div style={{ marginTop: 16 }}>
                  <div className="muted">{copy.materials}</div>

                  {(supplier.materials_categories || []).length > 0 ? (
                    <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {supplier.materials_categories.map((item) => (
                        <button
                          key={`${supplier.user_id}-${item}`}
                          type="button"
                          className="badge"
                          style={{
                            background: '#f1e7a8',
                            color: '#111111',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                          onClick={() => setSelectedMaterial(item)}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="muted" style={{ marginTop: 8 }}>
                      —
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 16 }}>
                  <div className="muted">{copy.bio}</div>
                  <p style={{ marginTop: 8, lineHeight: 1.7 }}>
                    {String(supplier.bio || '').trim() || copy.noBio}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}