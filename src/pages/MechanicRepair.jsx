import React, { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../supabaseClient'

const COPY = {
  en: {
    badge: 'Mechanic / Equipment Repair',
    title: 'Search mechanics by repair specialty and field capability.',
    body:
      'Use this page to find diesel mechanics, small engine repair, skid steer and tractor repair, trailer and hydraulic repair, and mobile field service near the jobsite.',
    searchLabel: 'Search bar',
    searchPlaceholder: 'Search diesel, skid steer, tractor, hydraulic, trailer, mobile service, ZIP...',
    zipLabel: 'ZIP',
    zipPlaceholder: 'Filter by ZIP',
    cityLabel: 'City',
    cityPlaceholder: 'Filter by city',
    specialtyLabel: 'Repair specialty',
    allSpecialties: 'All specialties',
    vehicleLabel: 'Service vehicle',
    allVehicles: 'All service vehicles',
    mobileOnly: 'Mobile field service only',
    radiusLabel: 'Min service radius (mi)',
    clear: 'Clear filters',
    sortLabel: 'Sort by',
    sortBest: 'Best match',
    sortRadius: 'Largest service radius',
    sortName: 'Mechanic name',
    resultsLabel: 'results',
    loading: 'Loading mechanics…',
    errorSoft:
      'Mechanic records could not be loaded right now, but the repair search is ready for incoming mechanic profiles.',
    emptyTitle: 'No mechanics found yet.',
    emptyBody:
      'The search and filters are live now. As mechanics join Surplox, they will appear here and can be searched by diesel, small engine, skid steer, tractor, trailer, hydraulic, or mobile field service.',
    mechanic: 'Mechanic',
    zip: 'ZIP',
    city: 'City',
    specialty: 'Specialty',
    vehicle: 'Vehicle',
    serviceRadius: 'Service Radius',
    miles: 'mi',
    capabilities: 'Capabilities',
    noCapabilities: 'No capability tags listed yet.',
    about: 'About',
    noBio: 'No mechanic bio added yet.',
    openProfile: 'Open Profile',
    noCity: 'No city listed',
    filtersReadyTitle: 'Repair search is ready',
    filtersReadyBody:
      'Use the filters below now so the page is already set up when your first mechanics join.',
    zeroStateCard1: 'Filter by diesel mechanic',
    zeroStateCard2: 'Filter by small engine repair',
    zeroStateCard3: 'Filter by skid steer / tractor repair',
    zeroStateCard4: 'Filter by trailer or hydraulic repair',
    zeroStateCard5: 'Filter by mobile field service',
    zeroStateCard6: 'Filter by service radius'
  },
  es: {
    badge: 'Mecánica / Reparación de equipo',
    title: 'Busca mecánicos por especialidad y capacidad en campo.',
    body:
      'Usa esta página para encontrar mecánicos diésel, reparación de motores pequeños, skid steer y tractor, remolques e hidráulica, y servicio móvil en campo cerca de la obra.',
    searchLabel: 'Barra de búsqueda',
    searchPlaceholder: 'Busca diésel, skid steer, tractor, hidráulica, remolque, servicio móvil, ZIP...',
    zipLabel: 'ZIP',
    zipPlaceholder: 'Filtrar por ZIP',
    cityLabel: 'Ciudad',
    cityPlaceholder: 'Filtrar por ciudad',
    specialtyLabel: 'Especialidad',
    allSpecialties: 'Todas las especialidades',
    vehicleLabel: 'Vehículo de servicio',
    allVehicles: 'Todos los vehículos de servicio',
    mobileOnly: 'Solo servicio móvil en campo',
    radiusLabel: 'Radio mínimo de servicio (mi)',
    clear: 'Limpiar filtros',
    sortLabel: 'Ordenar por',
    sortBest: 'Mejor coincidencia',
    sortRadius: 'Mayor radio de servicio',
    sortName: 'Nombre del mecánico',
    resultsLabel: 'resultados',
    loading: 'Cargando mecánicos…',
    errorSoft:
      'No se pudieron cargar los mecánicos en este momento, pero la búsqueda de reparación ya quedó lista para los próximos perfiles.',
    emptyTitle: 'Todavía no hay mecánicos.',
    emptyBody:
      'La búsqueda y los filtros ya están activos. Cuando los mecánicos empiecen a unirse a Surplox, aparecerán aquí y se podrán buscar por diésel, motores pequeños, skid steer, tractor, remolque, hidráulica o servicio móvil en campo.',
    mechanic: 'Mecánico',
    zip: 'ZIP',
    city: 'Ciudad',
    specialty: 'Especialidad',
    vehicle: 'Vehículo',
    serviceRadius: 'Radio de servicio',
    miles: 'mi',
    capabilities: 'Capacidades',
    noCapabilities: 'Todavía no hay etiquetas de capacidad.',
    about: 'Acerca de',
    noBio: 'Este mecánico todavía no agregó biografía.',
    openProfile: 'Abrir perfil',
    noCity: 'Sin ciudad',
    filtersReadyTitle: 'La búsqueda de reparación ya está lista',
    filtersReadyBody:
      'Usa los filtros desde ahora para que la página ya esté preparada cuando entren los primeros mecánicos.',
    zeroStateCard1: 'Filtra por mecánico diésel',
    zeroStateCard2: 'Filtra por motores pequeños',
    zeroStateCard3: 'Filtra por skid steer / tractor',
    zeroStateCard4: 'Filtra por remolque o hidráulica',
    zeroStateCard5: 'Filtra por servicio móvil en campo',
    zeroStateCard6: 'Filtra por radio de servicio'
  }
}

const SPECIALTY_LABELS = {
  diesel_mechanic: { en: 'Diesel Mechanic', es: 'Mecánico diésel' },
  small_engine_repair: { en: 'Small Engine Repair', es: 'Reparación de motores pequeños' },
  skid_steer_repair: { en: 'Skid Steer Repair', es: 'Reparación de skid steer' },
  tractor_repair: { en: 'Tractor Repair', es: 'Reparación de tractor' },
  mini_ex_repair: { en: 'Mini Excavator Repair', es: 'Reparación de mini excavadora' },
  heavy_equipment_repair: { en: 'Heavy Equipment Repair', es: 'Reparación de equipo pesado' },
  hydraulic_repair: { en: 'Hydraulic Repair', es: 'Reparación hidráulica' },
  trailer_repair: { en: 'Trailer Repair', es: 'Reparación de remolques' },
  field_service: { en: 'Mobile Field Service', es: 'Servicio móvil en campo' },
  emergency_repair: { en: 'Emergency Repair', es: 'Reparación de emergencia' },
  jobsite_service: { en: 'Jobsite Service', es: 'Servicio en obra' }
}

const CAPABILITY_LABELS = {
  mobile_repair_truck: { en: 'Mobile Repair Truck', es: 'Camión de reparación móvil' },
  diesel_diagnostics: { en: 'Diesel Diagnostics', es: 'Diagnóstico diésel' },
  hydraulic_tools: { en: 'Hydraulic Tools', es: 'Herramientas hidráulicas' },
  welder_generator: { en: 'Welder / Generator', es: 'Soldadora / Generador' },
  trailer_brake_tools: { en: 'Trailer Brake Tools', es: 'Herramientas de frenos de remolque' },
  battery_jump_setup: { en: 'Battery / Jump Setup', es: 'Batería / Arranque auxiliar' },
  service_truck: { en: 'Service Truck', es: 'Camión de servicio' },
  on_site_tools: { en: 'On-Site Tools', es: 'Herramientas en sitio' }
}

const VEHICLE_LABELS = {
  pickup_truck: { en: 'Pickup Truck', es: 'Pickup' },
  cargo_van: { en: 'Cargo Van', es: 'Cargo van' },
  box_truck: { en: 'Box Truck', es: 'Camión caja' },
  flatbed_truck: { en: 'Flatbed Truck', es: 'Camión plataforma' },
  mobile_repair_truck: { en: 'Mobile Repair Truck', es: 'Camión de reparación móvil' },
  service_truck: { en: 'Service Truck', es: 'Camión de servicio' }
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

function scoreMechanic(mechanic, query, specialtyFilter, vehicleFilter, zipFilter, cityFilter, mobileOnly, minRadius) {
  let score = 0

  const haystack = [
    mechanic.display_name,
    mechanic.first_name,
    mechanic.last_name,
    mechanic.city,
    mechanic.home_zip,
    mechanic.bio,
    mechanic.vehicle_type,
    ...mechanic.service_tags,
    ...mechanic.equipment_tags
  ]
    .join(' ')
    .toLowerCase()

  if (query.trim()) {
    const terms = query.toLowerCase().split(/\s+/).map((term) => term.trim()).filter(Boolean)
    terms.forEach((term) => {
      if (haystack.includes(term)) score += 5
      if (mechanic.service_tags.some((item) => item.toLowerCase().includes(term))) score += 12
      if (mechanic.equipment_tags.some((item) => item.toLowerCase().includes(term))) score += 10
      if (String(mechanic.vehicle_type || '').toLowerCase().includes(term)) score += 8
      if (String(mechanic.city || '').toLowerCase().includes(term)) score += 7
      if (String(mechanic.home_zip || '').toLowerCase() === term) score += 8
    })
  }

  if (specialtyFilter && mechanic.service_tags.includes(specialtyFilter)) score += 20
  if (vehicleFilter && String(mechanic.vehicle_type || '').toLowerCase() === vehicleFilter.toLowerCase()) score += 14
  if (zipFilter && String(mechanic.home_zip || '').trim() === zipFilter.trim()) score += 10
  if (cityFilter && String(mechanic.city || '').toLowerCase().includes(cityFilter.toLowerCase())) score += 9
  if (mobileOnly && mechanic.service_tags.includes('field_service')) score += 12
  if (minRadius > 0 && numericValue(mechanic.delivery_radius) >= minRadius) score += 6

  score += Math.min(numericValue(mechanic.delivery_radius), 200) / 10
  return score
}

export default function MechanicRepair({ lang = 'en' }) {
  const copy = COPY[lang] || COPY.en
  const location = useLocation()

  const [loading, setLoading] = useState(true)
  const [loadIssue, setLoadIssue] = useState(false)
  const [mechanics, setMechanics] = useState([])

  const [query, setQuery] = useState('')
  const [zipFilter, setZipFilter] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [specialtyFilter, setSpecialtyFilter] = useState('')
  const [vehicleFilter, setVehicleFilter] = useState('')
  const [mobileOnly, setMobileOnly] = useState(false)
  const [minRadius, setMinRadius] = useState('')
  const [sortBy, setSortBy] = useState('best')

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const zip = params.get('zip') || ''
    const q = params.get('q') || params.get('search') || ''
    const city = params.get('city') || ''
    const specialty = params.get('specialty') || params.get('service') || ''
    const vehicle = params.get('vehicle') || ''
    const radius = params.get('radius') || ''
    const mobile = params.get('mobile') || ''

    if (zip) setZipFilter(zip.replace(/[^\d]/g, '').slice(0, 5))
    if (q) setQuery(q)
    if (city) setCityFilter(city)
    if (specialty) setSpecialtyFilter(specialty)
    if (vehicle) setVehicleFilter(vehicle)
    if (radius) setMinRadius(String(radius).replace(/[^\d]/g, ''))
    if (['1', 'true', 'yes'].includes(String(mobile).toLowerCase())) setMobileOnly(true)
  }, [location.search])

  useEffect(() => {
    let active = true

    async function loadMechanics() {
      setLoading(true)
      setLoadIssue(false)

      try {
        const [{ data: profileData, error: profileError }, { data: privateData, error: privateError }] = await Promise.all([
          supabase
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
              equipment_tags,
              vehicle_type,
              delivery_radius
            `)
            .eq('role', 'mechanic')
            .order('display_name', { ascending: true }),
          supabase
            .from('contact_private')
            .select('user_id, city')
        ])

        if (profileError) throw profileError
        if (privateError) console.error(privateError)
        if (!active) return

        const cityMap = new Map((privateData || []).map((row) => [row.user_id, normalizeText(row.city)]))

        setMechanics(
          (profileData || []).map((item) => ({
            ...item,
            city: cityMap.get(item.user_id) || '',
            service_tags: normalizeTagList(item.service_tags),
            equipment_tags: normalizeTagList(item.equipment_tags)
          }))
        )
      } catch (err) {
        console.error(err)
        if (!active) return
        setMechanics([])
        setLoadIssue(true)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadMechanics()
    return () => {
      active = false
    }
  }, [])

  const specialtyOptions = useMemo(() => {
    const set = new Set(Object.keys(SPECIALTY_LABELS))
    mechanics.forEach((mechanic) => mechanic.service_tags.forEach((tag) => set.add(tag)))
    return Array.from(set)
  }, [mechanics])

  const vehicleOptions = useMemo(() => {
    const set = new Set(Object.keys(VEHICLE_LABELS))
    mechanics.forEach((mechanic) => {
      const value = normalizeText(mechanic.vehicle_type)
      if (value) set.add(value)
    })
    return Array.from(set)
  }, [mechanics])

  const filteredMechanics = useMemo(() => {
    let next = [...mechanics]
    const minServiceRadius = numericValue(minRadius)

    if (query.trim()) {
      const q = query.trim().toLowerCase()
      next = next.filter((mechanic) => {
        const haystack = [
          mechanic.display_name,
          mechanic.first_name,
          mechanic.last_name,
          mechanic.city,
          mechanic.home_zip,
          mechanic.bio,
          mechanic.vehicle_type,
          ...mechanic.service_tags,
          ...mechanic.equipment_tags
        ].join(' ').toLowerCase()
        return haystack.includes(q)
      })
    }

    if (zipFilter.trim()) {
      next = next.filter((mechanic) => String(mechanic.home_zip || '').trim() === zipFilter.trim())
    }

    if (cityFilter.trim()) {
      next = next.filter((mechanic) =>
        String(mechanic.city || '').toLowerCase().includes(cityFilter.trim().toLowerCase())
      )
    }

    if (specialtyFilter) {
      next = next.filter((mechanic) => mechanic.service_tags.includes(specialtyFilter))
    }

    if (vehicleFilter) {
      next = next.filter(
        (mechanic) => String(mechanic.vehicle_type || '').toLowerCase() === vehicleFilter.toLowerCase()
      )
    }

    if (mobileOnly) {
      next = next.filter((mechanic) => mechanic.service_tags.includes('field_service'))
    }

    if (minServiceRadius > 0) {
      next = next.filter((mechanic) => numericValue(mechanic.delivery_radius) >= minServiceRadius)
    }

    if (sortBy === 'radius') {
      next.sort((a, b) => numericValue(b.delivery_radius) - numericValue(a.delivery_radius))
    } else if (sortBy === 'name') {
      next.sort((a, b) =>
        String(a.display_name || `${a.first_name || ''} ${a.last_name || ''}` || '').localeCompare(
          String(b.display_name || `${b.first_name || ''} ${b.last_name || ''}` || '')
        )
      )
    } else {
      next.sort((a, b) => {
        const scoreA = scoreMechanic(a, query, specialtyFilter, vehicleFilter, zipFilter, cityFilter, mobileOnly, minServiceRadius)
        const scoreB = scoreMechanic(b, query, specialtyFilter, vehicleFilter, zipFilter, cityFilter, mobileOnly, minServiceRadius)
        return scoreB - scoreA
      })
    }

    return next
  }, [mechanics, query, zipFilter, cityFilter, specialtyFilter, vehicleFilter, mobileOnly, minRadius, sortBy])

  function clearFilters() {
    setQuery('')
    setZipFilter('')
    setCityFilter('')
    setSpecialtyFilter('')
    setVehicleFilter('')
    setMobileOnly(false)
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
        style={{ padding: 28, background: 'linear-gradient(180deg, #f2eaff 0%, #f7f7f2 100%)' }}
      >
        <div className="badge" style={{ marginBottom: 14, background: '#e8defa', color: '#4d2f82' }}>
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
            <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={copy.searchPlaceholder} />
          </div>

          <div className="grid two" style={{ gap: 14 }}>
            <div>
              <div className="muted" style={{ marginBottom: 8 }}>{copy.zipLabel}</div>
              <input className="input" value={zipFilter} onChange={(e) => setZipFilter(e.target.value.replace(/[^\d]/g, '').slice(0, 5))} placeholder={copy.zipPlaceholder} />
            </div>

            <div>
              <div className="muted" style={{ marginBottom: 8 }}>{copy.cityLabel}</div>
              <input className="input" value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} placeholder={copy.cityPlaceholder} />
            </div>
          </div>

          <div className="grid two" style={{ gap: 14 }}>
            <div>
              <div className="muted" style={{ marginBottom: 8 }}>{copy.specialtyLabel}</div>
              <select className="input" value={specialtyFilter} onChange={(e) => setSpecialtyFilter(e.target.value)}>
                <option value="">{copy.allSpecialties}</option>
                {specialtyOptions.map((option) => (
                  <option key={option} value={option}>{labelForMap(SPECIALTY_LABELS, option, lang)}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="muted" style={{ marginBottom: 8 }}>{copy.vehicleLabel}</div>
              <select className="input" value={vehicleFilter} onChange={(e) => setVehicleFilter(e.target.value)}>
                <option value="">{copy.allVehicles}</option>
                {vehicleOptions.map((option) => (
                  <option key={option} value={option}>{labelForMap(VEHICLE_LABELS, option, lang)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid two" style={{ gap: 14 }}>
            <div>
              <div className="muted" style={{ marginBottom: 8 }}>{copy.radiusLabel}</div>
              <input className="input" type="number" value={minRadius} onChange={(e) => setMinRadius(e.target.value)} />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button type="button" className={mobileOnly ? 'btn primary' : 'btn'} onClick={() => setMobileOnly((prev) => !prev)}>
                {copy.mobileOnly}
              </button>
            </div>
          </div>

          <div className="grid two" style={{ gap: 14 }}>
            <div>
              <div className="muted" style={{ marginBottom: 8 }}>{copy.sortLabel}</div>
              <select className="input" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="best">{copy.sortBest}</option>
                <option value="radius">{copy.sortRadius}</option>
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
            <span className="badge">{filteredMechanics.length} {copy.resultsLabel}</span>
          </div>
        </div>
      </div>

      {filteredMechanics.length === 0 ? (
        <>
          <div className="card rounded-xl" style={{ padding: 22 }}>
            <div className="card-section-title">{copy.emptyTitle}</div>
            <p className="card-section-subtitle" style={{ marginTop: 8 }}>{copy.emptyBody}</p>
          </div>

          <div className="card rounded-xl" style={{ padding: 22 }}>
            <div className="card-section-title">{copy.filtersReadyTitle}</div>
            <p className="card-section-subtitle" style={{ marginTop: 8 }}>{copy.filtersReadyBody}</p>

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
          {filteredMechanics.map((mechanic) => {
            const displayName =
              normalizeText(mechanic.display_name) ||
              normalizeText(`${mechanic.first_name || ''} ${mechanic.last_name || ''}`) ||
              copy.mechanic

            return (
              <div key={mechanic.user_id} className="card rounded-xl" style={{ padding: 22 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                  <div>
                    <div className="h2" style={{ fontSize: 24 }}>{displayName}</div>

                    <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span className="badge" style={{ background: '#e8defa', color: '#4d2f82' }}>{copy.mechanic}</span>
                      <span className="badge">{copy.city}: {normalizeText(mechanic.city) || copy.noCity}</span>
                      <span className="badge">{copy.zip}: {normalizeText(mechanic.home_zip) || '—'}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Link className="btn small primary" to={`/u/${mechanic.user_id}`}>
                      {copy.openProfile}
                    </Link>
                  </div>
                </div>

                <div className="grid two" style={{ gap: 14, marginTop: 16 }}>
                  <div className="card-soft" style={{ background: '#f6f0ff' }}>
                    <div className="card-section-title" style={{ fontSize: 15 }}>{copy.specialty}</div>
                    <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {mechanic.service_tags.length > 0 ? mechanic.service_tags.map((item) => (
                        <button
                          key={`${mechanic.user_id}-${item}`}
                          type="button"
                          className="badge"
                          style={{ background: '#e8defa', color: '#4d2f82', border: 'none', cursor: 'pointer' }}
                          onClick={() => setSpecialtyFilter(item)}
                        >
                          {labelForMap(SPECIALTY_LABELS, item, lang)}
                        </button>
                      )) : <span className="muted">—</span>}
                    </div>
                  </div>

                  <div className="card-soft" style={{ background: '#fffaf0' }}>
                    <div className="card-section-title" style={{ fontSize: 15 }}>{copy.serviceRadius}</div>
                    <div className="muted" style={{ marginTop: 6 }}>
                      {numericValue(mechanic.delivery_radius) > 0 ? `${numericValue(mechanic.delivery_radius)} ${copy.miles}` : '—'}
                    </div>
                    <div className="muted" style={{ marginTop: 10 }}>
                      {copy.vehicle}: {labelForMap(VEHICLE_LABELS, mechanic.vehicle_type, lang) || '—'}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 16 }}>
                  <div className="muted">{copy.capabilities}</div>
                  {mechanic.equipment_tags.length > 0 ? (
                    <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {mechanic.equipment_tags.map((item) => (
                        <span key={`${mechanic.user_id}-cap-${item}`} className="badge">
                          {labelForMap(CAPABILITY_LABELS, item, lang)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="muted" style={{ marginTop: 8 }}>{copy.noCapabilities}</div>
                  )}
                </div>

                <div style={{ marginTop: 16 }}>
                  <div className="muted">{copy.about}</div>
                  <p style={{ marginTop: 8, lineHeight: 1.7 }}>{normalizeText(mechanic.bio) || copy.noBio}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
