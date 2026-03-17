import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

const COPY = {
  en: {
    badge: 'Surplox AI Tools',
    title: 'AI tools for project planning, hiring, supply, and logistics.',
    body:
      'This hub is where Surplox AI tools live. Start with Supplier Suggestions and Crew Matching, then expand into delivery coordination and project analysis.',
    supplierTab: 'Supplier Suggestions AI',
    crewTab: 'Crew Matching AI',
    supplierTitle: 'Find the best nearby suppliers for a jobsite.',
    supplierBody:
      'Search Surplox supplier records by material, ZIP, storefront status, business name, and delivery radius to get ranked supplier suggestions.',
    materialLabel: 'Material category',
    allMaterials: 'All materials',
    supplierSearchLabel: 'Supplier / keyword search',
    supplierSearchPlaceholder: 'Concrete, lumber, drywall, rebar, supplier name...',
    supplierZipLabel: 'Jobsite ZIP',
    supplierZipPlaceholder: '76102',
    storefrontOnly: 'Storefront only',
    runSupplier: 'Run Supplier Suggestions',
    supplierResults: 'Suggested suppliers',
    noSupplierResults: 'No supplier suggestions yet. Try a broader material or ZIP search.',
    supplierWhy: 'Why this matched',
    openStorefront: 'Open Storefront',
    openProfile: 'Open Profile',
    supplierRadius: 'Delivery Radius',
    supplierMaterials: 'Materials',
    supplierZip: 'Business ZIP',
    miles: 'mi',
    crewTitle: 'Match the best nearby workers and crews for a job.',
    crewBody:
      'Use current Surplox worker profiles to rank crew candidates by trade, local fit, availability, crew size, and profile strength.',
    tradeLabel: 'Needed trade',
    allTrades: 'All trades',
    crewZipLabel: 'Jobsite ZIP',
    crewZipPlaceholder: '76102',
    radiusLabel: 'Search radius / local fit',
    minCrewLabel: 'Minimum crew size',
    availabilityLabel: 'Availability',
    allAvailability: 'All availability',
    availableNow: 'Available now',
    availableThisWeek: 'Available this week',
    runCrew: 'Run Crew Matching',
    crewResults: 'Ranked crew matches',
    noCrewResults: 'No crew matches yet. Try widening the filters or posting a Need Crew request.',
    whyMatched: 'Why this matched',
    matchScore: 'Match score',
    openWorker: 'Open Worker Profile',
    createNeedCrew: 'Create Need Crew Post',
    role: 'Role',
    trade: 'Trade',
    zip: 'ZIP',
    availability: 'Availability',
    crewSize: 'Crew Size',
    travelRadius: 'Travel Radius',
    profileStrength: 'Profile Strength',
    noBio: 'No bio added yet.',
    storefront: 'Storefront',
    loading: 'Loading AI tools…',
    loadError: 'Unable to load Surplox data right now.',
    exactZip: 'Exact ZIP match',
    nearbyZip: 'Nearby ZIP pattern match',
    materialMatch: 'Material match',
    storefrontBoost: 'Storefront-ready supplier',
    deliveryCoverage: 'Delivery coverage fit',
    tradeMatch: 'Trade match',
    availabilityMatch: 'Availability fit',
    crewSizeMatch: 'Crew size fit',
    profileComplete: 'Stronger profile',
    radiusFit: 'Travel radius fit',
    quickNote:
      'This first version ranks existing Surplox records. Later versions can add external supplier enrichment, project analysis, and logistics coordination.'
  },
  es: {
    badge: 'Herramientas AI de Surplox',
    title: 'Herramientas AI para planeación, contratación, suministro y logística.',
    body:
      'Este centro reúne las herramientas AI de Surplox. Empieza con Sugerencias de Proveedores y Crew Matching, y luego expándelo hacia coordinación de entregas y análisis de proyectos.',
    supplierTab: 'AI de Proveedores',
    crewTab: 'AI de Crew Matching',
    supplierTitle: 'Encuentra los mejores proveedores cercanos para una obra.',
    supplierBody:
      'Busca registros de proveedores de Surplox por material, ZIP, tienda física, nombre comercial y radio de entrega para obtener sugerencias clasificadas.',
    materialLabel: 'Categoría de material',
    allMaterials: 'Todos los materiales',
    supplierSearchLabel: 'Búsqueda de proveedor / palabra clave',
    supplierSearchPlaceholder: 'Concreto, madera, drywall, varilla, nombre del proveedor...',
    supplierZipLabel: 'ZIP de la obra',
    supplierZipPlaceholder: '76102',
    storefrontOnly: 'Solo tienda física',
    runSupplier: 'Ejecutar sugerencias',
    supplierResults: 'Proveedores sugeridos',
    noSupplierResults: 'Todavía no hay sugerencias. Prueba con un material o ZIP más amplio.',
    supplierWhy: 'Por qué coincidió',
    openStorefront: 'Abrir tienda',
    openProfile: 'Abrir perfil',
    supplierRadius: 'Radio de entrega',
    supplierMaterials: 'Materiales',
    supplierZip: 'ZIP comercial',
    miles: 'mi',
    crewTitle: 'Empareja a los mejores trabajadores y cuadrillas cercanas para un trabajo.',
    crewBody:
      'Usa los perfiles actuales de Surplox para clasificar candidatos por oficio, cercanía local, disponibilidad, tamaño de cuadrilla y fuerza del perfil.',
    tradeLabel: 'Oficio necesario',
    allTrades: 'Todos los oficios',
    crewZipLabel: 'ZIP de la obra',
    crewZipPlaceholder: '76102',
    radiusLabel: 'Radio de búsqueda / encaje local',
    minCrewLabel: 'Tamaño mínimo de cuadrilla',
    availabilityLabel: 'Disponibilidad',
    allAvailability: 'Toda disponibilidad',
    availableNow: 'Disponible ahora',
    availableThisWeek: 'Disponible esta semana',
    runCrew: 'Ejecutar crew matching',
    crewResults: 'Mejores coincidencias',
    noCrewResults: 'Todavía no hay coincidencias. Amplía los filtros o crea una publicación de Se necesita cuadrilla.',
    whyMatched: 'Por qué coincidió',
    matchScore: 'Puntuación',
    openWorker: 'Abrir perfil',
    createNeedCrew: 'Crear publicación de cuadrilla',
    role: 'Rol',
    trade: 'Oficio',
    zip: 'ZIP',
    availability: 'Disponibilidad',
    crewSize: 'Tamaño de cuadrilla',
    travelRadius: 'Radio de viaje',
    profileStrength: 'Fuerza del perfil',
    noBio: 'Todavía no agregó biografía.',
    storefront: 'Tienda física',
    loading: 'Cargando herramientas AI…',
    loadError: 'No se pudieron cargar los datos de Surplox.',
    exactZip: 'Coincidencia exacta de ZIP',
    nearbyZip: 'Coincidencia local por patrón de ZIP',
    materialMatch: 'Coincidencia de material',
    storefrontBoost: 'Proveedor listo para tienda',
    deliveryCoverage: 'Encaje por cobertura de entrega',
    tradeMatch: 'Coincidencia de oficio',
    availabilityMatch: 'Encaje por disponibilidad',
    crewSizeMatch: 'Encaje por tamaño de cuadrilla',
    profileComplete: 'Perfil más fuerte',
    radiusFit: 'Encaje por radio de viaje',
    quickNote:
      'Esta primera versión clasifica registros existentes de Surplox. Las siguientes pueden agregar enriquecimiento externo de proveedores, análisis de proyectos y coordinación logística.'
  }
}

const DEFAULT_MATERIALS = [
  'Concrete',
  'Lumber',
  'Steel',
  'Electrical',
  'Plumbing',
  'Drywall',
  'Fasteners',
  'Tools',
  'Equipment Rental',
  'Safety Equipment'
]

function normalizeText(value) {
  return String(value || '').trim()
}

function normalizeMaterials(list) {
  if (!Array.isArray(list)) return []
  return list.map((item) => String(item || '').trim()).filter(Boolean)
}

function normalizeList(list) {
  if (!Array.isArray(list)) return []
  return list.map((item) => String(item || '').trim()).filter(Boolean)
}

function numericValue(value) {
  const num = Number(value)
  return Number.isFinite(num) ? num : 0
}

function prettyRole(role, lang = 'en') {
  const labels = {
    laborer: { en: 'Laborer', es: 'Trabajador' },
    subcontractor: { en: 'Subcontractor', es: 'Subcontratista' },
    contractor: { en: 'Contractor', es: 'Contratista' },
    supplier: { en: 'Supplier', es: 'Proveedor' },
    driver: { en: 'Driver', es: 'Conductor' },
    mechanic: { en: 'Mechanic', es: 'Mecánico' }
  }
  return labels[role]?.[lang] || labels[role]?.en || role || '—'
}

function availabilityLabel(value, lang = 'en') {
  const labels = {
    available_now: { en: 'Available Now', es: 'Disponible ahora' },
    available_this_week: { en: 'Available This Week', es: 'Disponible esta semana' },
    busy: { en: 'Busy', es: 'Ocupado' }
  }
  return labels[value]?.[lang] || labels[value]?.en || value || '—'
}

function startsWithZipRegion(a, b) {
  const left = normalizeText(a)
  const right = normalizeText(b)
  if (!left || !right) return false
  return left.slice(0, 3) === right.slice(0, 3)
}

function profileStrength(worker) {
  let score = 0
  if (normalizeText(worker.display_name)) score += 1
  if (normalizeText(worker.first_name) && normalizeText(worker.last_name)) score += 1
  if (normalizeText(worker.home_zip)) score += 1
  if (normalizeText(worker.city)) score += 1
  if (normalizeText(worker.phone)) score += 1
  if (normalizeText(worker.bio)) score += 1
  if (worker.trade_id || normalizeText(worker.trade_name)) score += 1
  if (numericValue(worker.crew_size) > 1) score += 1
  if (normalizeText(worker.availability_status)) score += 1
  return score
}

function supplierReasons(supplier, { query, material, jobZip, copy }) {
  const reasons = []
  const materials = normalizeMaterials(supplier.materials_categories).map((item) => item.toLowerCase())
  const q = normalizeText(query).toLowerCase()
  const businessZip = normalizeText(supplier.business_zip)

  if (material && materials.includes(material.toLowerCase())) reasons.push(copy.materialMatch)
  if (jobZip && businessZip === jobZip) reasons.push(copy.exactZip)
  else if (jobZip && startsWithZipRegion(businessZip, jobZip)) reasons.push(copy.nearbyZip)
  if (supplier.storefront) reasons.push(copy.storefrontBoost)
  if (numericValue(supplier.delivery_radius) > 0) reasons.push(copy.deliveryCoverage)
  if (q) {
    const haystack = [
      supplier.business_name,
      supplier.display_name,
      supplier.bio,
      ...normalizeMaterials(supplier.materials_categories)
    ]
      .join(' ')
      .toLowerCase()
    if (haystack.includes(q)) reasons.push(copy.materialMatch)
  }

  return Array.from(new Set(reasons)).slice(0, 4)
}

function scoreSupplier(supplier, { query, material, jobZip, storefrontOnly }) {
  let score = 0
  const materials = normalizeMaterials(supplier.materials_categories)
  const q = normalizeText(query).toLowerCase()
  const businessZip = normalizeText(supplier.business_zip)

  const haystack = [
    supplier.business_name,
    supplier.display_name,
    supplier.bio,
    businessZip,
    ...materials
  ]
    .join(' ')
    .toLowerCase()

  if (q) {
    q.split(/\s+/).filter(Boolean).forEach((term) => {
      if (haystack.includes(term)) score += 8
      if (materials.some((item) => item.toLowerCase().includes(term))) score += 10
      if (String(supplier.business_name || '').toLowerCase().includes(term)) score += 9
    })
  }

  if (material && materials.some((item) => item.toLowerCase() === material.toLowerCase())) score += 24
  if (jobZip && businessZip === jobZip) score += 18
  else if (jobZip && startsWithZipRegion(businessZip, jobZip)) score += 9
  if (supplier.storefront) score += storefrontOnly ? 12 : 6
  score += Math.min(numericValue(supplier.delivery_radius), 150) / 6

  return score
}

function crewReasons(worker, { selectedTradeId, jobZip, minCrewSize, availability, copy }) {
  const reasons = []
  if (selectedTradeId && String(worker.trade_id || '') === String(selectedTradeId)) reasons.push(copy.tradeMatch)
  if (jobZip && normalizeText(worker.home_zip) === normalizeText(jobZip)) reasons.push(copy.exactZip)
  else if (jobZip && startsWithZipRegion(worker.home_zip, jobZip)) reasons.push(copy.nearbyZip)
  if (availability && normalizeText(worker.availability_status) === availability) reasons.push(copy.availabilityMatch)
  if (numericValue(minCrewSize) > 0 && numericValue(worker.crew_size) >= numericValue(minCrewSize)) {
    reasons.push(copy.crewSizeMatch)
  }
  if (profileStrength(worker) >= 6) reasons.push(copy.profileComplete)
  if (numericValue(worker.travel_radius_miles) > 0) reasons.push(copy.radiusFit)
  return Array.from(new Set(reasons)).slice(0, 4)
}

function scoreWorker(worker, { selectedTradeId, jobZip, radius, minCrewSize, availability }) {
  let score = 0

  if (selectedTradeId && String(worker.trade_id || '') === String(selectedTradeId)) score += 28
  if (jobZip && normalizeText(worker.home_zip) === normalizeText(jobZip)) score += 20
  else if (jobZip && startsWithZipRegion(worker.home_zip, jobZip)) score += 10

  const workerAvailability = normalizeText(worker.availability_status)
  if (availability && workerAvailability === availability) score += 16
  else if (!availability && workerAvailability === 'available_now') score += 8
  else if (!availability && workerAvailability === 'available_this_week') score += 5

  if (numericValue(minCrewSize) > 0) {
    if (numericValue(worker.crew_size) >= numericValue(minCrewSize)) score += 14
  } else {
    score += Math.min(numericValue(worker.crew_size), 10)
  }

  if (numericValue(radius) > 0 && numericValue(worker.travel_radius_miles) >= numericValue(radius)) {
    score += 10
  } else {
    score += Math.min(numericValue(worker.travel_radius_miles), 150) / 10
  }

  score += profileStrength(worker) * 2
  if (normalizeText(worker.bio)) score += 4

  return score
}

function InfoCard({ label, value }) {
  return (
    <div className="card-soft" style={{ minHeight: 92 }}>
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
      <div style={{ marginTop: 8, fontSize: 18, fontWeight: 900, lineHeight: 1.25 }}>{value}</div>
    </div>
  )
}

export default function SupplierAiTools({ lang = 'en' }) {
  const copy = COPY[lang] || COPY.en
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('supplier')
  const [trades, setTrades] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [workers, setWorkers] = useState([])

  const [supplierQuery, setSupplierQuery] = useState('')
  const [supplierMaterial, setSupplierMaterial] = useState('')
  const [supplierZip, setSupplierZip] = useState('')
  const [storefrontOnly, setStorefrontOnly] = useState(false)
  const [ranSupplier, setRanSupplier] = useState(false)

  const [crewTradeId, setCrewTradeId] = useState('')
  const [crewZip, setCrewZip] = useState('')
  const [crewRadius, setCrewRadius] = useState(50)
  const [crewMinSize, setCrewMinSize] = useState(1)
  const [crewAvailability, setCrewAvailability] = useState('')
  const [ranCrew, setRanCrew] = useState(false)

  useEffect(() => {
    let active = true

    async function loadData() {
      setLoading(true)
      setError('')

      try {
        const [{ data: tradesData, error: tradesError }, { data: supplierData, error: supplierError }, { data: workerData, error: workerError }, { data: contactsData, error: contactsError }] = await Promise.all([
          supabase.from('trades').select('id,name').order('name'),
          supabase
            .from('profiles')
            .select('user_id, display_name, business_name, business_address, business_zip, materials_categories, storefront, delivery_radius, bio, role')
            .eq('role', 'supplier')
            .order('business_name', { ascending: true }),
          supabase
            .from('profiles')
            .select('user_id, display_name, first_name, last_name, role, trade_id, home_zip, travel_radius_miles, crew_size, bio, availability_status, category_group, trades(name)')
            .in('role', ['laborer', 'subcontractor', 'contractor'])
            .order('display_name', { ascending: true }),
          supabase.from('contact_private').select('user_id, city, phone')
        ])

        if (tradesError) throw tradesError
        if (supplierError) throw supplierError
        if (workerError) throw workerError
        if (contactsError) throw contactsError
        if (!active) return

        const contactMap = new Map((contactsData || []).map((row) => [row.user_id, row]))

        setTrades(tradesData || [])
        setSuppliers(
          (supplierData || []).map((item) => ({
            ...item,
            materials_categories: normalizeMaterials(item.materials_categories)
          }))
        )
        setWorkers(
          (workerData || []).map((item) => {
            const contact = contactMap.get(item.user_id) || {}
            return {
              ...item,
              trade_name: item.trades?.name || '',
              city: normalizeText(contact.city),
              phone: normalizeText(contact.phone)
            }
          })
        )
      } catch (err) {
        console.error(err)
        if (!active) return
        setError(copy.loadError)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadData()
    return () => {
      active = false
    }
  }, [copy.loadError])

  const materialOptions = useMemo(() => {
    const set = new Set(DEFAULT_MATERIALS)
    suppliers.forEach((supplier) => {
      normalizeMaterials(supplier.materials_categories).forEach((item) => set.add(item))
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [suppliers])

  const supplierResults = useMemo(() => {
    let next = [...suppliers]
    if (supplierMaterial) {
      next = next.filter((supplier) =>
        normalizeMaterials(supplier.materials_categories).some(
          (item) => item.toLowerCase() === supplierMaterial.toLowerCase()
        )
      )
    }
    if (storefrontOnly) {
      next = next.filter((supplier) => supplier.storefront)
    }
    if (normalizeText(supplierZip)) {
      next = next.filter((supplier) => {
        const businessZip = normalizeText(supplier.business_zip)
        return businessZip === normalizeText(supplierZip) || startsWithZipRegion(businessZip, supplierZip)
      })
    }
    if (normalizeText(supplierQuery)) {
      const q = normalizeText(supplierQuery).toLowerCase()
      next = next.filter((supplier) => {
        const haystack = [
          supplier.business_name,
          supplier.display_name,
          supplier.business_zip,
          supplier.bio,
          ...normalizeMaterials(supplier.materials_categories)
        ]
          .join(' ')
          .toLowerCase()
        return haystack.includes(q)
      })
    }

    return next
      .map((supplier) => ({
        ...supplier,
        ai_score: scoreSupplier(supplier, {
          query: supplierQuery,
          material: supplierMaterial,
          jobZip: supplierZip,
          storefrontOnly
        }),
        reasons: supplierReasons(supplier, {
          query: supplierQuery,
          material: supplierMaterial,
          jobZip: supplierZip,
          copy
        })
      }))
      .sort((a, b) => b.ai_score - a.ai_score)
      .slice(0, 12)
  }, [suppliers, supplierMaterial, storefrontOnly, supplierZip, supplierQuery, copy])

  const crewResults = useMemo(() => {
    let next = [...workers]

    if (crewTradeId) {
      next = next.filter((worker) => String(worker.trade_id || '') === String(crewTradeId))
    }
    if (normalizeText(crewZip)) {
      next = next.filter((worker) => {
        const homeZip = normalizeText(worker.home_zip)
        return homeZip === normalizeText(crewZip) || startsWithZipRegion(homeZip, crewZip)
      })
    }
    if (crewAvailability) {
      next = next.filter((worker) => normalizeText(worker.availability_status) === crewAvailability)
    }
    if (numericValue(crewMinSize) > 0) {
      next = next.filter((worker) => numericValue(worker.crew_size) >= numericValue(crewMinSize))
    }

    return next
      .map((worker) => ({
        ...worker,
        match_score: scoreWorker(worker, {
          selectedTradeId: crewTradeId,
          jobZip: crewZip,
          radius: crewRadius,
          minCrewSize: crewMinSize,
          availability: crewAvailability
        }),
        strength: profileStrength(worker),
        reasons: crewReasons(worker, {
          selectedTradeId: crewTradeId,
          jobZip: crewZip,
          minCrewSize: crewMinSize,
          availability: crewAvailability,
          copy
        })
      }))
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, 12)
  }, [workers, crewTradeId, crewZip, crewAvailability, crewMinSize, crewRadius, copy])

  if (loading) {
    return <div className="card">{copy.loading}</div>
  }

  if (error) {
    return <div className="card">{error}</div>
  }

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div
        className="card rounded-xl"
        style={{
          padding: 28,
          background: 'linear-gradient(180deg, #f2ecff 0%, #f7f7f2 100%)'
        }}
      >
        <div className="badge" style={{ marginBottom: 14, background: '#e8defa', color: '#4d2f82' }}>
          {copy.badge}
        </div>

        <div className="h1" style={{ maxWidth: 860 }}>{copy.title}</div>

        <p className="muted" style={{ marginTop: 12, maxWidth: 920, fontSize: 17, lineHeight: 1.7 }}>
          {copy.body}
        </p>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
          <button
            type="button"
            className={tab === 'supplier' ? 'btn primary' : 'btn'}
            onClick={() => setTab('supplier')}
          >
            {copy.supplierTab}
          </button>
          <button
            type="button"
            className={tab === 'crew' ? 'btn primary' : 'btn'}
            onClick={() => setTab('crew')}
          >
            {copy.crewTab}
          </button>
        </div>
      </div>

      {tab === 'supplier' ? (
        <>
          <div className="card rounded-xl" style={{ padding: 22 }}>
            <div className="card-section-title">{copy.supplierTitle}</div>
            <p className="card-section-subtitle" style={{ marginTop: 8 }}>{copy.supplierBody}</p>

            <div className="grid" style={{ gap: 14, marginTop: 16 }}>
              <div className="grid two" style={{ gap: 14 }}>
                <div>
                  <div className="muted" style={{ marginBottom: 8 }}>{copy.materialLabel}</div>
                  <select
                    className="input"
                    value={supplierMaterial}
                    onChange={(e) => setSupplierMaterial(e.target.value)}
                  >
                    <option value="">{copy.allMaterials}</option>
                    {materialOptions.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="muted" style={{ marginBottom: 8 }}>{copy.supplierZipLabel}</div>
                  <input
                    className="input"
                    value={supplierZip}
                    onChange={(e) => setSupplierZip(e.target.value.replace(/[^\d]/g, '').slice(0, 5))}
                    placeholder={copy.supplierZipPlaceholder}
                  />
                </div>
              </div>

              <div>
                <div className="muted" style={{ marginBottom: 8 }}>{copy.supplierSearchLabel}</div>
                <input
                  className="input"
                  value={supplierQuery}
                  onChange={(e) => setSupplierQuery(e.target.value)}
                  placeholder={copy.supplierSearchPlaceholder}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  type="button"
                  className={storefrontOnly ? 'btn primary' : 'btn'}
                  onClick={() => setStorefrontOnly((prev) => !prev)}
                >
                  {copy.storefrontOnly}
                </button>
                <button type="button" className="btn primary" onClick={() => setRanSupplier(true)}>
                  {copy.runSupplier}
                </button>
              </div>
            </div>
          </div>

          {ranSupplier ? (
            <div className="grid" style={{ gap: 16 }}>
              <div className="card rounded-xl" style={{ padding: 22 }}>
                <div className="card-section-title">{copy.supplierResults}</div>
              </div>

              {supplierResults.length === 0 ? (
                <div className="card rounded-xl" style={{ padding: 22 }}>
                  <div className="card-section-subtitle">{copy.noSupplierResults}</div>
                </div>
              ) : (
                supplierResults.map((supplier) => (
                  <div key={supplier.user_id} className="card rounded-xl" style={{ padding: 22 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                      <div>
                        <div className="h2" style={{ fontSize: 24 }}>
                          {normalizeText(supplier.business_name) || normalizeText(supplier.display_name) || 'Supplier'}
                        </div>
                        <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <span className="badge">AI {copy.matchScore}: {supplier.ai_score}</span>
                          {supplier.storefront ? <span className="badge">{copy.storefront}</span> : null}
                          <span className="badge">{copy.supplierZip}: {normalizeText(supplier.business_zip) || '—'}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <Link className="btn small primary" to={`/supplier/${supplier.user_id}`}>
                          {copy.openStorefront}
                        </Link>
                        <Link className="btn small" to={`/u/${supplier.user_id}`}>
                          {copy.openProfile}
                        </Link>
                      </div>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: 14,
                      marginTop: 16
                    }}>
                      <InfoCard label={copy.supplierMaterials} value={normalizeMaterials(supplier.materials_categories).slice(0, 3).join(', ') || '—'} />
                      <InfoCard label={copy.supplierRadius} value={numericValue(supplier.delivery_radius) > 0 ? `${numericValue(supplier.delivery_radius)} ${copy.miles}` : '—'} />
                      <InfoCard label={copy.supplierWhy} value={supplier.reasons.join(' • ') || '—'} />
                    </div>

                    <div style={{ marginTop: 16 }}>
                      <div className="muted">About</div>
                      <p style={{ marginTop: 8, lineHeight: 1.7 }}>{normalizeText(supplier.bio) || '—'}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : null}
        </>
      ) : null}

      {tab === 'crew' ? (
        <>
          <div className="card rounded-xl" style={{ padding: 22 }}>
            <div className="card-section-title">{copy.crewTitle}</div>
            <p className="card-section-subtitle" style={{ marginTop: 8 }}>{copy.crewBody}</p>

            <div className="grid" style={{ gap: 14, marginTop: 16 }}>
              <div className="grid two" style={{ gap: 14 }}>
                <div>
                  <div className="muted" style={{ marginBottom: 8 }}>{copy.tradeLabel}</div>
                  <select className="input" value={crewTradeId} onChange={(e) => setCrewTradeId(e.target.value)}>
                    <option value="">{copy.allTrades}</option>
                    {trades.map((trade) => (
                      <option key={trade.id} value={trade.id}>{trade.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="muted" style={{ marginBottom: 8 }}>{copy.crewZipLabel}</div>
                  <input
                    className="input"
                    value={crewZip}
                    onChange={(e) => setCrewZip(e.target.value.replace(/[^\d]/g, '').slice(0, 5))}
                    placeholder={copy.crewZipPlaceholder}
                  />
                </div>
              </div>

              <div className="grid two" style={{ gap: 14 }}>
                <div>
                  <div className="muted" style={{ marginBottom: 8 }}>{copy.radiusLabel}</div>
                  <input
                    className="input"
                    type="number"
                    value={crewRadius}
                    onChange={(e) => setCrewRadius(e.target.value)}
                  />
                </div>

                <div>
                  <div className="muted" style={{ marginBottom: 8 }}>{copy.minCrewLabel}</div>
                  <input
                    className="input"
                    type="number"
                    value={crewMinSize}
                    onChange={(e) => setCrewMinSize(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div className="muted" style={{ marginBottom: 8 }}>{copy.availabilityLabel}</div>
                <select className="input" value={crewAvailability} onChange={(e) => setCrewAvailability(e.target.value)}>
                  <option value="">{copy.allAvailability}</option>
                  <option value="available_now">{copy.availableNow}</option>
                  <option value="available_this_week">{copy.availableThisWeek}</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button type="button" className="btn primary" onClick={() => setRanCrew(true)}>
                  {copy.runCrew}
                </button>
                <Link className="btn" to="/new?type=need_crew">{copy.createNeedCrew}</Link>
              </div>
            </div>
          </div>

          {ranCrew ? (
            <div className="grid" style={{ gap: 16 }}>
              <div className="card rounded-xl" style={{ padding: 22 }}>
                <div className="card-section-title">{copy.crewResults}</div>
              </div>

              {crewResults.length === 0 ? (
                <div className="card rounded-xl" style={{ padding: 22 }}>
                  <div className="card-section-subtitle">{copy.noCrewResults}</div>
                </div>
              ) : (
                crewResults.map((worker) => (
                  <div key={worker.user_id} className="card rounded-xl" style={{ padding: 22 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                      <div>
                        <div className="h2" style={{ fontSize: 24 }}>
                          {normalizeText(worker.display_name) || normalizeText(`${worker.first_name || ''} ${worker.last_name || ''}`) || 'Member'}
                        </div>
                        <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <span className="badge">AI {copy.matchScore}: {worker.match_score}</span>
                          <span className="badge">{copy.role}: {prettyRole(worker.role, lang)}</span>
                          <span className="badge">{copy.trade}: {normalizeText(worker.trade_name) || '—'}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <Link className="btn small primary" to={`/u/${worker.user_id}`}>
                          {copy.openWorker}
                        </Link>
                      </div>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: 14,
                      marginTop: 16
                    }}>
                      <InfoCard label={copy.zip} value={normalizeText(worker.home_zip) || '—'} />
                      <InfoCard label={copy.availability} value={availabilityLabel(worker.availability_status, lang)} />
                      <InfoCard label={copy.crewSize} value={numericValue(worker.crew_size) || '—'} />
                      <InfoCard label={copy.travelRadius} value={numericValue(worker.travel_radius_miles) > 0 ? `${numericValue(worker.travel_radius_miles)} ${copy.miles}` : '—'} />
                      <InfoCard label={copy.profileStrength} value={`${worker.strength}/9`} />
                      <InfoCard label={copy.whyMatched} value={worker.reasons.join(' • ') || '—'} />
                    </div>

                    <div style={{ marginTop: 16 }}>
                      <div className="muted">Bio</div>
                      <p style={{ marginTop: 8, lineHeight: 1.7 }}>{normalizeText(worker.bio) || copy.noBio}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : null}
        </>
      ) : null}

      <div className="card rounded-xl" style={{ padding: 22, background: '#fffaf0' }}>
        <div className="card-section-subtitle">{copy.quickNote}</div>
      </div>
    </div>
  )
}
