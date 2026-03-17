import React, { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../supabaseClient'

const COPY = {
  en: {
    badge: 'Delivery Driver Search',
    title: 'Search delivery drivers by hauling capability.',
    body:
      'Use this tab to connect supplier → driver → jobsite by searching delivery drivers based on vehicle type, trailer setup, trailer length, payload capacity, delivery radius, city, and ZIP.',
    searchLabel: 'Search bar',
    searchPlaceholder: 'Search pickup, cargo van, flatbed, hot shot, city, ZIP...',
    zipLabel: 'ZIP',
    zipPlaceholder: 'Filter by ZIP',
    cityLabel: 'City',
    cityPlaceholder: 'Filter by city',
    vehicleLabel: 'Vehicle type',
    trailerLabel: 'Trailer type',
    supportTypeLabel: 'Delivery lane',
    trailerLengthLabel: 'Min trailer length (ft)',
    payloadLabel: 'Min payload (lbs)',
    radiusLabel: 'Min delivery radius (mi)',
    allVehicles: 'All vehicles',
    allTrailers: 'All trailers',
    allSupportTypes: 'All delivery lanes',
    trailerOnly: 'Only drivers with trailer',
    clear: 'Clear filters',
    sortLabel: 'Sort by',
    sortBest: 'Best match',
    sortRadius: 'Largest delivery radius',
    sortPayload: 'Highest payload',
    sortTrailerLength: 'Longest trailer',
    sortName: 'Driver name',
    resultsLabel: 'results',
    loading: 'Loading drivers…',
    errorSoft:
      'Driver records could not be loaded right now, but the delivery search is ready for incoming driver profiles.',
    emptyTitle: 'No delivery drivers found yet.',
    emptyBody:
      'The search and filters are live now. As drivers join Surplox, they will appear here and can be searched by vehicle, trailer, payload, radius, hot shot, or cargo van.',
    driver: 'Driver',
    zip: 'ZIP',
    city: 'City',
    vehicle: 'Vehicle',
    trailer: 'Trailer',
    trailerLength: 'Trailer Length',
    payload: 'Payload',
    deliveryRadius: 'Delivery Radius',
    supportLane: 'Support Lane',
    supportLaneValue: 'Material Delivery',
    miles: 'mi',
    feet: 'ft',
    lbs: 'lbs',
    serviceTags: 'Service Tags',
    noServiceTags: 'No service tags listed yet.',
    about: 'About',
    noBio: 'No driver bio added yet.',
    openProfile: 'Open Profile',
    noCity: 'No city listed',
    filtersReadyTitle: 'Search is ready',
    filtersReadyBody:
      'Use the filters below now so the page is already set up when your first drivers join.',
    zeroStateCard1: 'Filter by trailer type',
    zeroStateCard2: 'Filter by trailer length',
    zeroStateCard3: 'Filter by payload capacity',
    zeroStateCard4: 'Filter by hot shot or cargo van',
    zeroStateCard5: 'Filter by vehicle type',
    zeroStateCard6: 'Filter by delivery radius'
  },
  es: {
    badge: 'Búsqueda de conductores',
    title: 'Busca conductores por capacidad de entrega.',
    body:
      'Usa esta pestaña para conectar proveedor → conductor → obra buscando conductores según tipo de vehículo, remolque, largo del remolque, capacidad de carga, radio de entrega, ciudad y ZIP.',
    searchLabel: 'Barra de búsqueda',
    searchPlaceholder: 'Busca pickup, cargo van, flatbed, hot shot, ciudad, ZIP...',
    zipLabel: 'ZIP',
    zipPlaceholder: 'Filtrar por ZIP',
    cityLabel: 'Ciudad',
    cityPlaceholder: 'Filtrar por ciudad',
    vehicleLabel: 'Tipo de vehículo',
    trailerLabel: 'Tipo de remolque',
    supportTypeLabel: 'Línea de entrega',
    trailerLengthLabel: 'Largo mínimo del remolque (ft)',
    payloadLabel: 'Carga mínima (lbs)',
    radiusLabel: 'Radio mínimo de entrega (mi)',
    allVehicles: 'Todos los vehículos',
    allTrailers: 'Todos los remolques',
    allSupportTypes: 'Todas las líneas de entrega',
    trailerOnly: 'Solo conductores con remolque',
    clear: 'Limpiar filtros',
    sortLabel: 'Ordenar por',
    sortBest: 'Mejor coincidencia',
    sortRadius: 'Mayor radio de entrega',
    sortPayload: 'Mayor carga',
    sortTrailerLength: 'Remolque más largo',
    sortName: 'Nombre del conductor',
    resultsLabel: 'resultados',
    loading: 'Cargando conductores…',
    errorSoft:
      'No se pudieron cargar los conductores en este momento, pero la búsqueda de entrega ya quedó lista para los próximos perfiles.',
    emptyTitle: 'Todavía no hay conductores de entrega.',
    emptyBody:
      'La búsqueda y los filtros ya están activos. Cuando los conductores empiecen a unirse a Surplox, aparecerán aquí y se podrán buscar por vehículo, remolque, carga, radio, hot shot o cargo van.',
    driver: 'Conductor',
    zip: 'ZIP',
    city: 'Ciudad',
    vehicle: 'Vehículo',
    trailer: 'Remolque',
    trailerLength: 'Largo del remolque',
    payload: 'Capacidad de carga',
    deliveryRadius: 'Radio de entrega',
    supportLane: 'Línea de soporte',
    supportLaneValue: 'Entrega de materiales',
    miles: 'mi',
    feet: 'ft',
    lbs: 'lbs',
    serviceTags: 'Etiquetas de servicio',
    noServiceTags: 'Todavía no hay etiquetas de servicio.',
    about: 'Acerca de',
    noBio: 'Este conductor todavía no agregó biografía.',
    openProfile: 'Abrir perfil',
    noCity: 'Sin ciudad',
    filtersReadyTitle: 'La búsqueda ya está lista',
    filtersReadyBody:
      'Usa los filtros desde ahora para que la página ya esté preparada cuando entren los primeros conductores.',
    zeroStateCard1: 'Filtra por tipo de remolque',
    zeroStateCard2: 'Filtra por largo del remolque',
    zeroStateCard3: 'Filtra por capacidad de carga',
    zeroStateCard4: 'Filtra por hot shot o cargo van',
    zeroStateCard5: 'Filtra por tipo de vehículo',
    zeroStateCard6: 'Filtra por radio de entrega'
  }
}

const VEHICLE_LABELS = {
  pickup_truck: { en: 'Pickup Truck', es: 'Pickup' },
  cargo_van: { en: 'Cargo Van', es: 'Cargo van' },
  box_truck: { en: 'Box Truck', es: 'Camión caja' },
  flatbed_truck: { en: 'Flatbed Truck', es: 'Camión plataforma' }
}

const TRAILER_LABELS = {
  none: { en: 'No Trailer', es: 'Sin remolque' },
  no_trailer: { en: 'No Trailer', es: 'Sin remolque' },
  utility_trailer: { en: 'Utility Trailer', es: 'Remolque utilitario' },
  flatbed_trailer: { en: 'Flatbed Trailer', es: 'Remolque plataforma' },
  gooseneck_trailer: { en: 'Gooseneck Trailer', es: 'Remolque gooseneck' },
  equipment_trailer: { en: 'Equipment Trailer', es: 'Remolque para equipo' },
  enclosed_trailer: { en: 'Enclosed Trailer', es: 'Remolque cerrado' }
}

const SUPPORT_TYPE_LABELS = {
  material_delivery: { en: 'Material Delivery / Hot Shot', es: 'Entrega de materiales / Hot Shot' },
  cargo_van_delivery: { en: 'Cargo Van / Local Delivery', es: 'Cargo Van / Entrega local' }
}

const SERVICE_TAG_LABELS = {
  material_delivery: { en: 'Material Delivery', es: 'Entrega de materiales' },
  hot_shot: { en: 'Hot Shot', es: 'Hot Shot' },
  last_mile_delivery: { en: 'Last Mile Delivery', es: 'Última milla' },
  local_runs: { en: 'Local Runs', es: 'Viajes locales' },
  same_day_delivery: { en: 'Same Day Delivery', es: 'Entrega el mismo día' },
  long_distance: { en: 'Long Distance', es: 'Larga distancia' },
  cargo_van: { en: 'Cargo Van', es: 'Cargo van' },
  pickup_truck: { en: 'Pickup Truck', es: 'Pickup' }
}

function labelForMap(map, value, lang = 'en') {
  const key = String(value || '').trim()
  if (!key) return ''
  return map[key]?.[lang] || map[key]?.en || key.replace(/_/g, ' ')
}

function normalizeText(value) {
  return String(value || '').trim()
}

function normalizeTagList(list) {
  if (!Array.isArray(list)) return []
  return list.map((item) => String(item || '').trim()).filter(Boolean)
}

function numericValue(value) {
  const num = Number(value)
  return Number.isFinite(num) ? num : 0
}

function detectSupportType(serviceTags = [], vehicleType = '') {
  if (
    serviceTags.includes('local_runs') ||
    serviceTags.includes('last_mile_delivery') ||
    vehicleType === 'cargo_van'
  ) {
    return 'cargo_van_delivery'
  }

  return 'material_delivery'
}

function scoreDriver(
  driver,
  query,
  vehicleFilter,
  trailerFilter,
  zipFilter,
  cityFilter,
  trailerOnly,
  supportTypeFilter,
  minTrailerLength,
  minPayload,
  minRadius
) {
  let score = 0

  const haystack = [
    driver.display_name,
    driver.first_name,
    driver.last_name,
    driver.city,
    driver.home_zip,
    driver.business_zip,
    driver.bio,
    driver.vehicle_type,
    driver.trailer_type,
    driver.support_type,
    ...driver.service_tags
  ]
    .join(' ')
    .toLowerCase()

  if (query.trim()) {
    const terms = query
      .toLowerCase()
      .split(/\s+/)
      .map((term) => term.trim())
      .filter(Boolean)

    terms.forEach((term) => {
      if (haystack.includes(term)) score += 5
      if (String(driver.vehicle_type || '').toLowerCase().includes(term)) score += 10
      if (String(driver.trailer_type || '').toLowerCase().includes(term)) score += 9
      if (String(driver.support_type || '').toLowerCase().includes(term)) score += 10
      if (driver.service_tags.some((item) => item.toLowerCase().includes(term))) score += 10
      if (String(driver.city || '').toLowerCase().includes(term)) score += 7
      if (String(driver.home_zip || '').toLowerCase() === term) score += 8
      if (String(driver.business_zip || '').toLowerCase() === term) score += 8
    })
  }

  if (vehicleFilter && String(driver.vehicle_type || '').toLowerCase() === vehicleFilter.toLowerCase()) {
    score += 20
  }

  if (trailerFilter && String(driver.trailer_type || '').toLowerCase() === trailerFilter.toLowerCase()) {
    score += 18
  }

  if (supportTypeFilter && String(driver.support_type || '').toLowerCase() === supportTypeFilter.toLowerCase()) {
    score += 18
  }

  const zipMatch =
    (zipFilter && String(driver.home_zip || '').trim() === zipFilter.trim()) ||
    (zipFilter && String(driver.business_zip || '').trim() === zipFilter.trim())

  if (zipMatch) score += 10

  if (cityFilter && String(driver.city || '').toLowerCase().includes(cityFilter.toLowerCase())) {
    score += 9
  }

  if (trailerOnly && !['', 'none', 'no_trailer'].includes(String(driver.trailer_type || '').trim())) {
    score += 6
  }

  if (minTrailerLength > 0 && numericValue(driver.trailer_length) >= minTrailerLength) {
    score += 6
  }

  if (minPayload > 0 && numericValue(driver.payload_capacity) >= minPayload) {
    score += 6
  }

  if (minRadius > 0 && numericValue(driver.delivery_radius) >= minRadius) {
    score += 6
  }

  score += Math.min(numericValue(driver.delivery_radius), 200) / 10
  score += Math.min(numericValue(driver.payload_capacity), 20000) / 2000

  return score
}

export default function Delivery({ lang = 'en' }) {
  const copy = COPY[lang] || COPY.en
  const location = useLocation()

  const [loading, setLoading] = useState(true)
  const [loadIssue, setLoadIssue] = useState(false)
  const [drivers, setDrivers] = useState([])

  const [query, setQuery] = useState('')
  const [zipFilter, setZipFilter] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [vehicleFilter, setVehicleFilter] = useState('')
  const [trailerFilter, setTrailerFilter] = useState('')
  const [supportTypeFilter, setSupportTypeFilter] = useState('')
  const [trailerOnly, setTrailerOnly] = useState(false)
  const [minTrailerLength, setMinTrailerLength] = useState('')
  const [minPayload, setMinPayload] = useState('')
  const [minRadius, setMinRadius] = useState('')
  const [sortBy, setSortBy] = useState('best')

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const zip = params.get('zip') || ''
    const q = params.get('q') || params.get('search') || ''
    const city = params.get('city') || ''
    const vehicle = params.get('vehicle') || ''
    const trailer = params.get('trailer') || ''
    const support = params.get('support') || ''
    const payload = params.get('payload') || ''
    const radius = params.get('radius') || ''

    if (zip) setZipFilter(zip.replace(/[^\d]/g, '').slice(0, 5))
    if (q) setQuery(q)
    if (city) setCityFilter(city)
    if (vehicle) setVehicleFilter(vehicle)
    if (trailer) setTrailerFilter(trailer)
    if (support) setSupportTypeFilter(support)
    if (payload) setMinPayload(String(payload).replace(/[^\d]/g, ''))
    if (radius) setMinRadius(String(radius).replace(/[^\d]/g, ''))
  }, [location.search])

  useEffect(() => {
    let active = true

    async function loadDrivers() {
      setLoading(true)
      setLoadIssue(false)

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            user_id,
            display_name,
            first_name,
            last_name,
            home_zip,
            bio,
            role,
            category_group,
            service_tags,
            vehicle_type,
            trailer_type,
            trailer_length,
            payload_capacity,
            delivery_radius
          `)
          .eq('role', 'driver')
          .order('display_name', { ascending: true })

        if (error) throw error
        if (!active) return

        setDrivers(
          (data || []).map((item) => {
            const serviceTags = normalizeTagList(item.service_tags)
            return {
              ...item,
              city: '',
              business_zip: '',
              service_tags: serviceTags,
              support_type: detectSupportType(serviceTags, item.vehicle_type || '')
            }
          })
        )
      } catch (err) {
        console.error(err)
        if (!active) return
        setDrivers([])
        setLoadIssue(true)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadDrivers()

    return () => {
      active = false
    }
  }, [])

  const vehicleOptions = useMemo(() => {
    const set = new Set(Object.keys(VEHICLE_LABELS))
    drivers.forEach((driver) => {
      const value = normalizeText(driver.vehicle_type)
      if (value) set.add(value)
    })
    return Array.from(set)
  }, [drivers])

  const trailerOptions = useMemo(() => {
    const set = new Set(Object.keys(TRAILER_LABELS))
    drivers.forEach((driver) => {
      const value = normalizeText(driver.trailer_type)
      if (value) set.add(value)
    })
    return Array.from(set)
  }, [drivers])

  const supportTypeOptions = useMemo(() => {
    const set = new Set(Object.keys(SUPPORT_TYPE_LABELS))
    drivers.forEach((driver) => {
      const value = normalizeText(driver.support_type)
      if (value) set.add(value)
    })
    return Array.from(set)
  }, [drivers])

  const filteredDrivers = useMemo(() => {
    let next = [...drivers]
    const minTrailer = numericValue(minTrailerLength)
    const minPay = numericValue(minPayload)
    const minDelivery = numericValue(minRadius)

    if (query.trim()) {
      const q = query.trim().toLowerCase()
      next = next.filter((driver) => {
        const haystack = [
          driver.display_name,
          driver.first_name,
          driver.last_name,
          driver.city,
          driver.home_zip,
          driver.business_zip,
          driver.bio,
          driver.vehicle_type,
          driver.trailer_type,
          driver.support_type,
          ...driver.service_tags
        ]
          .join(' ')
          .toLowerCase()

        return haystack.includes(q)
      })
    }

    if (zipFilter.trim()) {
      next = next.filter((driver) => {
        const homeZip = String(driver.home_zip || '').trim()
        const businessZip = String(driver.business_zip || '').trim()
        return homeZip === zipFilter.trim() || businessZip === zipFilter.trim()
      })
    }

    if (cityFilter.trim()) {
      next = next.filter((driver) =>
        String(driver.city || '').toLowerCase().includes(cityFilter.trim().toLowerCase())
      )
    }

    if (vehicleFilter) {
      next = next.filter(
        (driver) => String(driver.vehicle_type || '').toLowerCase() === vehicleFilter.toLowerCase()
      )
    }

    if (trailerFilter) {
      next = next.filter(
        (driver) => String(driver.trailer_type || '').toLowerCase() === trailerFilter.toLowerCase()
      )
    }

    if (supportTypeFilter) {
      next = next.filter(
        (driver) => String(driver.support_type || '').toLowerCase() === supportTypeFilter.toLowerCase()
      )
    }

    if (trailerOnly) {
      next = next.filter((driver) => !['', 'none', 'no_trailer'].includes(String(driver.trailer_type || '').trim()))
    }

    if (minTrailer > 0) {
      next = next.filter((driver) => numericValue(driver.trailer_length) >= minTrailer)
    }

    if (minPay > 0) {
      next = next.filter((driver) => numericValue(driver.payload_capacity) >= minPay)
    }

    if (minDelivery > 0) {
      next = next.filter((driver) => numericValue(driver.delivery_radius) >= minDelivery)
    }

    if (sortBy === 'radius') {
      next.sort((a, b) => numericValue(b.delivery_radius) - numericValue(a.delivery_radius))
    } else if (sortBy === 'payload') {
      next.sort((a, b) => numericValue(b.payload_capacity) - numericValue(a.payload_capacity))
    } else if (sortBy === 'trailer_length') {
      next.sort((a, b) => numericValue(b.trailer_length) - numericValue(a.trailer_length))
    } else if (sortBy === 'name') {
      next.sort((a, b) =>
        String(a.display_name || `${a.first_name || ''} ${a.last_name || ''}` || '').localeCompare(
          String(b.display_name || `${b.first_name || ''} ${b.last_name || ''}` || '')
        )
      )
    } else {
      next.sort((a, b) => {
        const scoreA = scoreDriver(
          a,
          query,
          vehicleFilter,
          trailerFilter,
          zipFilter,
          cityFilter,
          trailerOnly,
          supportTypeFilter,
          minTrailer,
          minPay,
          minDelivery
        )
        const scoreB = scoreDriver(
          b,
          query,
          vehicleFilter,
          trailerFilter,
          zipFilter,
          cityFilter,
          trailerOnly,
          supportTypeFilter,
          minTrailer,
          minPay,
          minDelivery
        )
        return scoreB - scoreA
      })
    }

    return next
  }, [
    drivers,
    query,
    zipFilter,
    cityFilter,
    vehicleFilter,
    trailerFilter,
    trailerOnly,
    supportTypeFilter,
    minTrailerLength,
    minPayload,
    minRadius,
    sortBy
  ])

  function clearFilters() {
    setQuery('')
    setZipFilter('')
    setCityFilter('')
    setVehicleFilter('')
    setTrailerFilter('')
    setSupportTypeFilter('')
    setTrailerOnly(false)
    setMinTrailerLength('')
    setMinPayload('')
    setMinRadius('')
    setSortBy('best')
  }

  if (loading) {
    return <div className="card">{copy.loading}</div>
  }

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div
        className="card rounded-xl"
        style={{
          padding: 28,
          background: 'linear-gradient(180deg, #dff0ff 0%, #f7f7f2 100%)'
        }}
      >
        <div className="badge" style={{ marginBottom: 14, background: '#d8ecff', color: '#0d3f73' }}>
          {copy.badge}
        </div>

        <div className="h1" style={{ maxWidth: 760 }}>{copy.title}</div>

        <p className="muted" style={{ marginTop: 12, maxWidth: 860, fontSize: 17, lineHeight: 1.7 }}>
          {copy.body}
        </p>

        {loadIssue ? (
          <div className="card-soft" style={{ marginTop: 16, background: '#fffaf0', minHeight: 'auto' }}>
            {copy.errorSoft}
          </div>
        ) : null}
      </div>

      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="grid" style={{ gap: 14 }}>
          <div>
            <div className="muted" style={{ marginBottom: 8 }}>{copy.searchLabel}</div>
            <input
              className="input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={copy.searchPlaceholder}
            />
          </div>

          <div className="grid two" style={{ gap: 14 }}>
            <div>
              <div className="muted" style={{ marginBottom: 8 }}>{copy.zipLabel}</div>
              <input
                className="input"
                value={zipFilter}
                onChange={(e) => setZipFilter(e.target.value.replace(/[^\d]/g, '').slice(0, 5))}
                placeholder={copy.zipPlaceholder}
              />
            </div>

            <div>
              <div className="muted" style={{ marginBottom: 8 }}>{copy.cityLabel}</div>
              <input
                className="input"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                placeholder={copy.cityPlaceholder}
              />
            </div>
          </div>

          <div className="grid two" style={{ gap: 14 }}>
            <div>
              <div className="muted" style={{ marginBottom: 8 }}>{copy.vehicleLabel}</div>
              <select className="input" value={vehicleFilter} onChange={(e) => setVehicleFilter(e.target.value)}>
                <option value="">{copy.allVehicles}</option>
                {vehicleOptions.map((option) => (
                  <option key={option} value={option}>
                    {labelForMap(VEHICLE_LABELS, option, lang)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="muted" style={{ marginBottom: 8 }}>{copy.trailerLabel}</div>
              <select className="input" value={trailerFilter} onChange={(e) => setTrailerFilter(e.target.value)}>
                <option value="">{copy.allTrailers}</option>
                {trailerOptions.map((option) => (
                  <option key={option} value={option}>
                    {labelForMap(TRAILER_LABELS, option, lang)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid two" style={{ gap: 14 }}>
            <div>
              <div className="muted" style={{ marginBottom: 8 }}>{copy.supportTypeLabel}</div>
              <select
                className="input"
                value={supportTypeFilter}
                onChange={(e) => setSupportTypeFilter(e.target.value)}
              >
                <option value="">{copy.allSupportTypes}</option>
                {supportTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {labelForMap(SUPPORT_TYPE_LABELS, option, lang)}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                type="button"
                className={trailerOnly ? 'btn primary' : 'btn'}
                onClick={() => setTrailerOnly((prev) => !prev)}
              >
                {copy.trailerOnly}
              </button>
            </div>
          </div>

          <div className="grid three" style={{ gap: 14 }}>
            <div>
              <div className="muted" style={{ marginBottom: 8 }}>{copy.trailerLengthLabel}</div>
              <input
                className="input"
                type="number"
                value={minTrailerLength}
                onChange={(e) => setMinTrailerLength(e.target.value)}
              />
            </div>

            <div>
              <div className="muted" style={{ marginBottom: 8 }}>{copy.payloadLabel}</div>
              <input
                className="input"
                type="number"
                value={minPayload}
                onChange={(e) => setMinPayload(e.target.value)}
              />
            </div>

            <div>
              <div className="muted" style={{ marginBottom: 8 }}>{copy.radiusLabel}</div>
              <input
                className="input"
                type="number"
                value={minRadius}
                onChange={(e) => setMinRadius(e.target.value)}
              />
            </div>
          </div>

          <div className="grid two" style={{ gap: 14 }}>
            <div>
              <div className="muted" style={{ marginBottom: 8 }}>{copy.sortLabel}</div>
              <select className="input" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="best">{copy.sortBest}</option>
                <option value="radius">{copy.sortRadius}</option>
                <option value="payload">{copy.sortPayload}</option>
                <option value="trailer_length">{copy.sortTrailerLength}</option>
                <option value="name">{copy.sortName}</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button type="button" className="btn small" onClick={clearFilters}>
                {copy.clear}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="badge">
              {filteredDrivers.length} {copy.resultsLabel}
            </span>
          </div>
        </div>
      </div>

      {filteredDrivers.length === 0 ? (
        <>
          <div className="card rounded-xl" style={{ padding: 22 }}>
            <div className="card-section-title">{copy.emptyTitle}</div>
            <p className="card-section-subtitle" style={{ marginTop: 8 }}>
              {copy.emptyBody}
            </p>
          </div>

          <div className="card rounded-xl" style={{ padding: 22 }}>
            <div className="card-section-title">{copy.filtersReadyTitle}</div>
            <p className="card-section-subtitle" style={{ marginTop: 8 }}>
              {copy.filtersReadyBody}
            </p>

            <div className="grid three" style={{ marginTop: 14 }}>
              <div className="card-soft">{copy.zeroStateCard1}</div>
              <div className="card-soft">{copy.zeroStateCard2}</div>
              <div className="card-soft">{copy.zeroStateCard3}</div>
              <div className="card-soft">{copy.zeroStateCard4}</div>
              <div className="card-soft">{copy.zeroStateCard5}</div>
              <div className="card-soft">{copy.zeroStateCard6}</div>
            </div>
          </div>
        </>
      ) : (
        <div className="grid" style={{ gap: 16 }}>
          {filteredDrivers.map((driver) => {
            const displayName =
              normalizeText(driver.display_name) ||
              normalizeText(`${driver.first_name || ''} ${driver.last_name || ''}`) ||
              copy.driver

            const homeZip = normalizeText(driver.home_zip)
            const businessZip = normalizeText(driver.business_zip)
            const zipValue = homeZip || businessZip || '—'

            return (
              <div key={driver.user_id} className="card rounded-xl" style={{ padding: 22 }}>
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
                      <span className="badge" style={{ background: '#d8ecff', color: '#0d3f73' }}>
                        {copy.driver}
                      </span>

                      <span className="badge">
                        {copy.supportLane}: {labelForMap(SUPPORT_TYPE_LABELS, driver.support_type, lang) || copy.supportLaneValue}
                      </span>

                      <span className="badge">
                        {copy.city}: {normalizeText(driver.city) || copy.noCity}
                      </span>

                      <span className="badge">
                        {copy.zip}: {zipValue}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Link className="btn small primary" to={`/u/${driver.user_id}`}>
                      {copy.openProfile}
                    </Link>
                  </div>
                </div>

                <div className="grid three" style={{ gap: 14, marginTop: 16 }}>
                  <div className="card-soft" style={{ background: '#eef6ff' }}>
                    <div className="card-section-title" style={{ fontSize: 15 }}>
                      {copy.vehicle}
                    </div>
                    <div className="muted" style={{ marginTop: 6 }}>
                      {labelForMap(VEHICLE_LABELS, driver.vehicle_type, lang) || '—'}
                    </div>
                  </div>

                  <div className="card-soft" style={{ background: '#eef6ff' }}>
                    <div className="card-section-title" style={{ fontSize: 15 }}>
                      {copy.trailer}
                    </div>
                    <div className="muted" style={{ marginTop: 6 }}>
                      {labelForMap(TRAILER_LABELS, driver.trailer_type, lang) || '—'}
                    </div>
                    <div className="muted" style={{ marginTop: 6 }}>
                      {copy.trailerLength}:{' '}
                      {numericValue(driver.trailer_length) > 0
                        ? `${numericValue(driver.trailer_length)} ${copy.feet}`
                        : '—'}
                    </div>
                  </div>

                  <div className="card-soft" style={{ background: '#fffaf0' }}>
                    <div className="card-section-title" style={{ fontSize: 15 }}>
                      {copy.deliveryRadius}
                    </div>
                    <div className="muted" style={{ marginTop: 6 }}>
                      {numericValue(driver.delivery_radius) > 0
                        ? `${numericValue(driver.delivery_radius)} ${copy.miles}`
                        : '—'}
                    </div>

                    <div className="muted" style={{ marginTop: 12 }}>
                      {copy.payload}:{' '}
                      {numericValue(driver.payload_capacity) > 0
                        ? `${numericValue(driver.payload_capacity)} ${copy.lbs}`
                        : '—'}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 16 }}>
                  <div className="muted">{copy.serviceTags}</div>

                  {driver.service_tags.length > 0 ? (
                    <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {driver.service_tags.map((item) => (
                        <button
                          key={`${driver.user_id}-${item}`}
                          type="button"
                          className="badge"
                          style={{
                            background: '#d8ecff',
                            color: '#0d3f73',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                          onClick={() => setQuery(labelForMap(SERVICE_TAG_LABELS, item, 'en'))}
                        >
                          {labelForMap(SERVICE_TAG_LABELS, item, lang)}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="muted" style={{ marginTop: 8 }}>
                      {copy.noServiceTags}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 16 }}>
                  <div className="muted">{copy.about}</div>
                  <p style={{ marginTop: 8, lineHeight: 1.7 }}>
                    {normalizeText(driver.bio) || copy.noBio}
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