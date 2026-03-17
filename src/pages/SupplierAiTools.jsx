import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

const API_IMPORT_ENDPOINT =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_SUPPLIER_IMPORT_ENDPOINT) ||
  '/api/import-suppliers'

const API_SUPPLIER_SEARCH_ENDPOINT =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_SUPPLIER_SEARCH_ENDPOINT) ||
  '/api/supplier-search'

const API_OCR_ENDPOINT =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_OCR_ENDPOINT) ||
  '/api/ocr'

const COPY = {
  en: {
    badge: 'Surplox AI Tools',
    title: 'Construction AI tools built into Surplox.',
    body:
      'Use Surplox AI to analyze project scope, suggest suppliers, match crews, coordinate delivery, and ingest blueprint documents from one place.',
    supplierTab: 'Supplier Suggestions',
    crewTab: 'Crew Matching',
    deliveryTab: 'Delivery Coordination',
    analyzerTab: 'Project Analyzer',

    importerTitle: 'Supplier Storefront Importer',
    importerBody:
      'Import real supplier candidates by material and ZIP so Surplox can start auto-populating storefront-ready supplier records.',
    materialLabel: 'Material',
    materialPlaceholder: 'Concrete, lumber, drywall, steel...',
    zipLabel: 'ZIP',
    zipPlaceholder: '76102',
    cityLabel: 'City (optional)',
    cityPlaceholder: 'Fort Worth',
    stateLabel: 'State',
    importButton: 'Import Suppliers',
    importing: 'Importing suppliers…',
    importedLabel: 'Imported supplier candidates',
    noImported: 'No supplier candidates imported yet.',
    importSuccess: 'Supplier candidates imported successfully.',
    importError: 'Unable to import supplier candidates right now.',
    openMaterials: 'Open Materials',
    searchButton: 'Run Supplier Suggestions',
    searching: 'Searching suppliers…',
    suggestionsLabel: 'Supplier suggestions',
    noSuggestions: 'No supplier suggestions yet.',

    crewTitle: 'Crew Matching AI',
    crewBody:
      'Rank nearby Surplox workers and crews by trade fit, ZIP fit, availability, travel radius, and crew size.',
    tradeLabel: 'Trade',
    tradePlaceholder: 'Concrete, framing, drywall, electrical...',
    availabilityLabel: 'Availability',
    allAvailability: 'All availability',
    availableNow: 'Available now',
    availableThisWeek: 'Available this week',
    busy: 'Busy',
    minCrewLabel: 'Minimum crew size',
    radiusLabel: 'Travel radius at least',
    runCrewButton: 'Run Crew Match',
    crewResults: 'Crew matches',
    noCrewResults: 'No crew matches yet.',
    matchScore: 'Match score',
    whyMatched: 'Why this matched',
    openWorkerProfile: 'Open Profile',
    createNeedCrewPost: 'Create Need Crew Post',
    crewSearchReady: 'Crew matching is using real Surplox worker profiles.',

    deliveryTitle: 'Delivery Coordination AI',
    deliveryBody:
      'Rank delivery drivers for supplier pickup and jobsite drop-off using Surplox driver data.',
    pickupZipLabel: 'Pickup ZIP',
    pickupZipPlaceholder: 'Supplier ZIP',
    jobsiteZipLabel: 'Jobsite ZIP',
    jobsiteZipPlaceholder: 'Jobsite ZIP',
    vehicleLabel: 'Vehicle type',
    trailerLabel: 'Trailer type',
    payloadLabel: 'Minimum payload (lbs)',
    supportTypeLabel: 'Delivery lane',
    allVehicles: 'All vehicles',
    allTrailers: 'All trailers',
    allSupportTypes: 'All delivery lanes',
    runDeliveryButton: 'Run Delivery Coordination',
    deliveryResults: 'Delivery matches',
    noDeliveryResults: 'No delivery matches yet.',
    openDeliveryProfile: 'Open Driver Profile',
    deliverySearchReady: 'Delivery coordination is using real Surplox driver profiles.',

    analyzerTitle: 'Project Analyzer AI',
    analyzerBody:
      'Upload blueprint documents or paste project scope notes to generate a project summary and handoff into supplier, crew, and delivery tools.',
    notesLabel: 'Project scope notes',
    notesPlaceholder:
      'Example: 18,000 SF tilt wall warehouse in 76140. Needs concrete, steel, framing, drywall, electrical, plumbing, site materials, and staged deliveries.',
    uploadLabel: 'Blueprint / document upload',
    uploadHelp:
      'Upload PDF, image, txt, csv, json, or md files. Text-based files extract immediately. OCR can be run on scans and images.',
    runOcr: 'Run OCR',
    runningOcr: 'Running OCR…',
    analyzeButton: 'Analyze Scope',
    summaryLabel: 'Project summary',
    noSummary: 'No project analysis generated yet.',
    extractedTextLabel: 'Extracted document text',
    noExtractedText: 'No extracted text yet.',
    openDelivery: 'Open Delivery',
    openNewPost: 'Open New Post',
    openChannels: 'Open Channels',
    openSupplierSearch: 'Open Supplier Search',
    openStorefront: 'Open Storefront',
    openCrewPost: 'Build Need Crew Post',
    openDeliveryPost: 'Build Delivery Support Post',
    analyzerActionsTitle: 'AI handoff actions',
    analyzerActionsBody:
      'Send the analyzer output directly into live marketplace flows so the work does not stop at the AI screen.',

    projectEngineTitle: 'Surplox Project Engine',
    projectEngineBody:
      'Project Analyzer now acts as the brain of the app: blueprint upload, scope extraction, crew plan, materials list, supplier suggestions, and delivery plan.',
    engineRunButton: 'Run Project Engine',
    engineRunning: 'Running Project Engine…',
    engineEmpty:
      'Upload a blueprint or add project scope notes to generate the full project engine plan.',
    engineProjectType: 'Project Type',
    enginePrimaryZip: 'Primary ZIP',
    engineCrewPlan: 'Crew Needed',
    engineMaterialsPlan: 'Materials List',
    engineSuppliersPlan: 'Suppliers',
    engineDeliveryPlan: 'Delivery Plan',
    engineNoSuppliers: 'No supplier suggestions generated yet.',
    engineNoDelivery: 'No delivery plan generated yet.',
    engineNoCrew: 'No crew plan generated yet.',
    engineUseSupplier: 'Use in Supplier Search',
    engineUseCrew: 'Use in Crew Matching',
    engineUseDelivery: 'Use in Delivery Search',
    engineBuildCrewPost: 'Create Crew Post',
    engineBuildDeliveryPost: 'Create Delivery Post',
    engineEstimatedCrew: 'Estimated crew',
    enginePriority: 'Priority',
    engineTopMatches: 'Top matches',
    engineSuggestedLane: 'Suggested lane',
    engineScopeSignals: 'Scope signals',
    engineRecommendedAction: 'Recommended action',

    fitLabel: 'Fit',
    website: 'Website',
    phone: 'Phone',
    address: 'Address',
    categories: 'Categories',
    rating: 'Rating',
    fileReady: 'File ready',
    fileExtracted: 'Text extracted',
    fileOcrReady: 'OCR ready',
    fileOcrDone: 'OCR complete'
  }
}

const VEHICLE_OPTIONS = ['pickup_truck', 'cargo_van', 'box_truck', 'flatbed_truck']
const TRAILER_OPTIONS = [
  'none',
  'utility_trailer',
  'flatbed_trailer',
  'gooseneck_trailer',
  'equipment_trailer',
  'enclosed_trailer'
]
const SUPPORT_OPTIONS = ['material_delivery', 'cargo_van_delivery']

function scoreScope(text = '') {
  const lower = String(text || '').toLowerCase()
  const trades = []
  const materials = []

  const tradeMap = [
    ['concrete', ['concrete', 'foundation', 'slab', 'flatwork']],
    ['steel', ['steel', 'metal', 'rebar']],
    ['framing', ['frame', 'framing', 'wood framing']],
    ['drywall', ['drywall', 'sheetrock', 'gypsum']],
    ['electrical', ['electrical', 'power', 'lighting']],
    ['plumbing', ['plumbing', 'pipe', 'piping']],
    ['roofing', ['roof', 'roofing']],
    ['hvac', ['hvac', 'mechanical', 'air handler']],
    ['sitework', ['sitework', 'excavation', 'grading', 'dirt']]
  ]

  const materialMap = [
    ['concrete', ['concrete', 'cement']],
    ['steel', ['steel', 'rebar']],
    ['lumber', ['lumber', 'framing']],
    ['drywall', ['drywall', 'sheetrock']],
    ['electrical', ['electrical', 'lighting']],
    ['plumbing', ['plumbing', 'pipe']],
    ['tools', ['tools']],
    ['fasteners', ['fasteners', 'screws', 'anchors']]
  ]

  tradeMap.forEach(([value, needles]) => {
    if (needles.some((needle) => lower.includes(needle))) trades.push(value)
  })

  materialMap.forEach(([value, needles]) => {
    if (needles.some((needle) => lower.includes(needle))) materials.push(value)
  })

  const normalizedTrades = Array.from(new Set(trades))
  const normalizedMaterials = Array.from(new Set(materials))

  let summary = 'General construction project'
  if (lower.includes('warehouse')) summary = 'Warehouse / industrial project'
  else if (lower.includes('office')) summary = 'Office / commercial interior project'
  else if (lower.includes('multifamily') || lower.includes('apartment')) summary = 'Multifamily project'
  else if (lower.includes('school')) summary = 'Education / institutional project'

  return {
    summary,
    trades: normalizedTrades,
    materials: normalizedMaterials,
    crewSuggestion:
      normalizedTrades.length >= 5
        ? 'Multi-trade project. Start with contractor, concrete, steel/framing, electrical, and plumbing coverage.'
        : normalizedTrades.length >= 3
          ? 'Mid-size project. Start with 2–4 core trades and phase supplier and delivery support.'
          : 'Smaller scope. Start with one lead trade and one supplier lane.'
  }
}

function extractZipFromText(text = '') {
  const match = String(text || '').match(/\b(\d{5})(?:-\d{4})?\b/)
  return match ? match[1] : ''
}

function extractSquareFeet(text = '') {
  const match = String(text || '')
    .replace(/,/g, '')
    .match(/\b(\d{3,7})\s*(sf|sq\.?\s?ft|square\s?feet)\b/i)

  return match ? Number(match[1]) : 0
}

function titleCase(value = '') {
  return String(value || '')
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function uniqueList(values = []) {
  return Array.from(new Set((values || []).filter(Boolean)))
}

function estimateCrewRange(trade, squareFeet = 0, scopeText = '') {
  const lower = String(scopeText || '').toLowerCase()
  const largeJob = squareFeet >= 15000 || lower.includes('warehouse') || lower.includes('multifamily')
  const mediumJob = squareFeet >= 6000 || lower.includes('office') || lower.includes('school')

  const map = {
    concrete: largeJob ? '6-10' : mediumJob ? '4-6' : '2-4',
    steel: largeJob ? '4-8' : mediumJob ? '3-5' : '2-3',
    framing: largeJob ? '6-10' : mediumJob ? '4-6' : '2-4',
    drywall: largeJob ? '6-12' : mediumJob ? '4-6' : '2-4',
    electrical: largeJob ? '4-8' : mediumJob ? '3-5' : '2-3',
    plumbing: largeJob ? '3-6' : mediumJob ? '2-4' : '1-3',
    roofing: largeJob ? '4-7' : mediumJob ? '3-5' : '2-4',
    hvac: largeJob ? '3-6' : mediumJob ? '2-4' : '1-3',
    sitework: largeJob ? '4-8' : mediumJob ? '3-5' : '2-4'
  }

  return map[trade] || (largeJob ? '4-8' : mediumJob ? '2-4' : '1-3')
}

function buildCrewPlan(projectSummary, fullText = '') {
  const squareFeet = extractSquareFeet(fullText)
  const trades = projectSummary?.trades?.length ? projectSummary.trades : ['general_construction']

  return trades.map((trade) => ({
    trade,
    label: titleCase(trade),
    crewRange: estimateCrewRange(trade, squareFeet, fullText),
    recommendedAction: `Start sourcing ${titleCase(trade)} coverage early for ${squareFeet ? `${squareFeet.toLocaleString()} SF` : 'this scope'}.`
  }))
}

function buildMaterialsPlan(projectSummary, fullText = '') {
  const lower = String(fullText || '').toLowerCase()
  const base = projectSummary?.materials?.length ? [...projectSummary.materials] : []

  if (lower.includes('rebar')) base.push('steel')
  if (lower.includes('anchors') || lower.includes('bolts') || lower.includes('screws')) base.push('fasteners')
  if (lower.includes('equipment') || lower.includes('lift')) base.push('equipment_rental')
  if (lower.includes('safety') || lower.includes('ppe')) base.push('safety_equipment')

  return uniqueList(base).map((material, index) => ({
    material,
    label: titleCase(material),
    priority: index < 2 ? 'High' : index < 4 ? 'Medium' : 'Low'
  }))
}

function buildDeliveryPlan(materialsPlan = [], projectSummary = {}, fullText = '') {
  const lower = String(fullText || '').toLowerCase()
  const heavyMaterials = new Set(['concrete', 'steel', 'lumber', 'drywall', 'equipment_rental'])
  const needsCargoVan = lower.includes('tool') || lower.includes('last mile') || lower.includes('cargo van')
  const needsFlatbed =
    materialsPlan.some((item) => heavyMaterials.has(item.material)) || lower.includes('flatbed') || lower.includes('trailer')

  const suggestedLane = needsCargoVan && !needsFlatbed ? 'cargo_van_delivery' : 'material_delivery'
  const vehicleType = needsCargoVan && !needsFlatbed ? 'cargo_van' : 'pickup_truck'
  const trailerType = needsFlatbed ? 'flatbed_trailer' : needsCargoVan ? 'none' : ''
  const payload = needsFlatbed ? '10000' : needsCargoVan ? '2500' : '5000'

  return {
    suggestedLane,
    vehicleType,
    trailerType,
    payload,
    notes: needsFlatbed
      ? 'Prioritize drivers who can haul heavier materials with trailer capacity and delivery radius.'
      : 'Prioritize local delivery drivers for lighter materials, tools, and last-mile runs.'
  }
}

async function runSupplierEngine(materialsPlan = [], zip = '', supplierForm = {}) {
  const supplierGroups = []

  for (const item of materialsPlan.slice(0, 3)) {
    try {
      const response = await fetch(API_SUPPLIER_SEARCH_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          material: item.label,
          zip: zip || supplierForm.zip,
          city: supplierForm.city || '',
          state: supplierForm.state || 'TX'
        })
      })

      const data = await response.json()
      if (!response.ok) continue

      supplierGroups.push({
        material: item.material,
        label: item.label,
        suppliers: Array.isArray(data?.suppliers) ? data.suppliers.slice(0, 4) : []
      })
    } catch (error) {
      console.error(error)
    }
  }

  return supplierGroups
}

async function runCrewEngine(crewPlan = [], zip = '') {
  const groups = []

  for (const item of crewPlan.slice(0, 4)) {
    const { data } = await fetchCrewMatches({
      trade: item.trade,
      zip,
      availability: '',
      minCrew: item.crewRange.split('-')[0] || '',
      minRadius: ''
    })

    groups.push({
      ...item,
      matches: Array.isArray(data) ? data.slice(0, 4) : []
    })
  }

  return groups
}

async function runDeliveryEngine(deliveryPlan = {}, pickupZip = '', jobsiteZip = '') {
  const { data } = await fetchDeliveryMatches({
    pickupZip,
    jobsiteZip,
    vehicleType: deliveryPlan.vehicleType || '',
    trailerType: deliveryPlan.trailerType || '',
    payload: deliveryPlan.payload || '',
    supportType: deliveryPlan.suggestedLane || ''
  })

  return Array.isArray(data) ? data.slice(0, 6) : []
}

function Chip({ children, active = false, onClick, type = 'button' }) {
  return (
    <button
      type={type}
      className={active ? 'btn primary small' : 'btn small'}
      onClick={onClick}
      style={{ borderRadius: 999 }}
    >
      {children}
    </button>
  )
}

function SupplierCard({ supplier, copy, onOpenSearch, onOpenStorefront }) {
  const categories = Array.isArray(supplier.materials_categories) ? supplier.materials_categories : []

  return (
    <div className="card rounded-xl" style={{ padding: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div className="h2" style={{ fontSize: 22 }}>
            {supplier.business_name || supplier.display_name || 'Supplier'}
          </div>
          <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {supplier.business_zip ? <span className="badge">{supplier.business_zip}</span> : null}
            {supplier.google_rating ? (
              <span className="badge">
                {copy.rating}: {supplier.google_rating}
              </span>
            ) : null}
            <span className="badge">{copy.fitLabel}: storefront-ready</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link className="btn small" to="/materials">
            {copy.openMaterials}
          </Link>
          <button className="btn small" type="button" onClick={() => onOpenSearch?.(supplier)}>
            {copy.openSupplierSearch}
          </button>
          <button className="btn small" type="button" onClick={() => onOpenStorefront?.(supplier)}>
            {copy.openStorefront}
          </button>
        </div>
      </div>

      {supplier.business_address ? (
        <div style={{ marginTop: 14 }}>
          <div className="muted">{copy.address}</div>
          <div style={{ marginTop: 6 }}>{supplier.business_address}</div>
        </div>
      ) : null}

      {categories.length ? (
        <div style={{ marginTop: 14 }}>
          <div className="muted">{copy.categories}</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
            {categories.map((item) => (
              <span key={`${supplier.external_id || supplier.id}-${item}`} className="badge">
                {String(item).replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {(supplier.phone || supplier.website_url) ? (
        <div className="grid two" style={{ marginTop: 14, gap: 12 }}>
          <div className="card-soft">
            <div className="muted">{copy.phone}</div>
            <div style={{ marginTop: 6 }}>{supplier.phone || '—'}</div>
          </div>
          <div className="card-soft">
            <div className="muted">{copy.website}</div>
            <div style={{ marginTop: 6, overflowWrap: 'anywhere' }}>{supplier.website_url || '—'}</div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function WorkerCard({ worker, copy, onBuildCrewPost }) {
  return (
    <div className="card rounded-xl" style={{ padding: 18 }}>
      <div className="h2" style={{ fontSize: 22 }}>{worker.display_name || 'Worker'}</div>
      <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {worker.trade_name ? <span className="badge">{worker.trade_name}</span> : null}
        {worker.home_zip ? <span className="badge">{worker.home_zip}</span> : null}
        <span className="badge">{copy.matchScore}: {worker.match_score}</span>
      </div>
      <div style={{ marginTop: 14 }}>
        <div className="muted">{copy.whyMatched}</div>
        <div style={{ marginTop: 6 }}>{worker.match_reason}</div>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
        <Link className="btn small primary" to={`/u/${worker.user_id}`}>{copy.openWorkerProfile}</Link>
        <button className="btn small" type="button" onClick={() => onBuildCrewPost?.(worker)}>
          {copy.openCrewPost}
        </button>
      </div>
    </div>
  )
}

function DriverCard({ driver, copy, onOpenDriverSearch, onBuildDeliveryPost }) {
  return (
    <div className="card rounded-xl" style={{ padding: 18 }}>
      <div className="h2" style={{ fontSize: 22 }}>{driver.display_name || 'Driver'}</div>
      <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {driver.vehicle_type ? <span className="badge">{String(driver.vehicle_type).replace(/_/g, ' ')}</span> : null}
        {driver.trailer_type ? <span className="badge">{String(driver.trailer_type).replace(/_/g, ' ')}</span> : null}
        <span className="badge">{copy.matchScore}: {driver.match_score}</span>
      </div>
      <div style={{ marginTop: 14 }}>
        <div className="muted">{copy.whyMatched}</div>
        <div style={{ marginTop: 6 }}>{driver.match_reason}</div>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
        <Link className="btn small primary" to={`/u/${driver.user_id}`}>{copy.openDeliveryProfile}</Link>
        <button className="btn small" type="button" onClick={() => onOpenDriverSearch?.(driver)}>
          {copy.openDelivery}
        </button>
        <button className="btn small" type="button" onClick={() => onBuildDeliveryPost?.(driver)}>
          {copy.openDeliveryPost}
        </button>
      </div>
    </div>
  )
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = String(reader.result || '')
      const base64 = result.includes(',') ? result.split(',')[1] : result
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function normalizeTradeName(value = '') {
  return String(value || '').trim().toLowerCase()
}

function normalizeTagList(value) {
  if (!Array.isArray(value)) return []
  return value.map((item) => String(item || '').trim()).filter(Boolean)
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

async function fetchCrewMatches(form) {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      user_id,
      display_name,
      home_zip,
      travel_radius_miles,
      crew_size,
      availability_status,
      role,
      bio,
      trade_id,
      trades(name)
    `)
    .in('role', ['laborer', 'subcontractor', 'contractor'])

  if (error) return { data: [], error }

  const targetTrade = normalizeTradeName(form.trade)
  const targetZip = String(form.zip || '').trim()
  const minCrew = Number(form.minCrew || 0)
  const minRadius = Number(form.minRadius || 0)

  const ranked = (data || [])
    .map((row) => {
      const tradeName = String(row?.trades?.name || '').trim()
      const tradeLower = normalizeTradeName(tradeName)
      let score = 0
      const reasons = []

      if (targetTrade) {
        if (tradeLower === targetTrade) {
          score += 35
          reasons.push('exact trade fit')
        } else if (tradeLower.includes(targetTrade) || targetTrade.includes(tradeLower)) {
          score += 25
          reasons.push('close trade fit')
        }
      }

      if (targetZip && String(row.home_zip || '').trim() === targetZip) {
        score += 25
        reasons.push('same ZIP')
      }

      if (form.availability && row.availability_status === form.availability) {
        score += 20
        reasons.push('availability fit')
      }

      if (minCrew > 0 && Number(row.crew_size || 0) >= minCrew) {
        score += 10
        reasons.push('crew size fit')
      }

      if (minRadius > 0 && Number(row.travel_radius_miles || 0) >= minRadius) {
        score += 10
        reasons.push('radius fit')
      }

      if (String(row.bio || '').trim()) {
        score += 4
        reasons.push('profile depth')
      }

      return {
        user_id: row.user_id,
        display_name: row.display_name,
        home_zip: row.home_zip,
        trade_name: tradeName,
        match_score: score,
        match_reason: reasons.length ? reasons.join(', ') : 'general fit'
      }
    })
    .filter((row) => row.match_score > 0)
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 12)

  return { data: ranked, error: null }
}

async function fetchDeliveryMatches(form) {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      user_id,
      display_name,
      home_zip,
      city,
      vehicle_type,
      trailer_type,
      payload_capacity,
      trailer_length,
      delivery_radius,
      service_tags,
      role
    `)
    .eq('role', 'driver')

  if (error) return { data: [], error }

  const pickupZip = String(form.pickupZip || '').trim()
  const jobsiteZip = String(form.jobsiteZip || '').trim()
  const minPayload = Number(form.payload || 0)

  const ranked = (data || [])
    .map((row) => {
      const serviceTags = normalizeTagList(row.service_tags)
      const supportType = detectSupportType(serviceTags, row.vehicle_type || '')
      let score = 0
      const reasons = []

      if (pickupZip && String(row.home_zip || '').trim() === pickupZip) {
        score += 25
        reasons.push('pickup ZIP fit')
      }

      if (jobsiteZip && String(row.home_zip || '').trim() === jobsiteZip) {
        score += 15
        reasons.push('jobsite ZIP fit')
      }

      if (form.vehicleType && row.vehicle_type === form.vehicleType) {
        score += 20
        reasons.push('vehicle fit')
      }

      if (form.trailerType && row.trailer_type === form.trailerType) {
        score += 15
        reasons.push('trailer fit')
      }

      if (minPayload > 0 && Number(row.payload_capacity || 0) >= minPayload) {
        score += 15
        reasons.push('payload fit')
      }

      if (form.supportType && supportType === form.supportType) {
        score += 10
        reasons.push('delivery lane fit')
      }

      if (Number(row.delivery_radius || 0) > 0) {
        score += Math.min(Number(row.delivery_radius || 0), 100) / 10
        reasons.push('delivery radius')
      }

      return {
        user_id: row.user_id,
        display_name: row.display_name,
        vehicle_type: row.vehicle_type,
        trailer_type: row.trailer_type,
        match_score: Math.round(score),
        match_reason: reasons.length ? reasons.join(', ') : 'general fit'
      }
    })
    .filter((row) => row.match_score > 0)
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 12)

  return { data: ranked, error: null }
}

export default function SupplierAiTools() {
  const navigate = useNavigate()
  const copy = COPY.en

  const [tab, setTab] = useState('supplier')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [importedSuppliers, setImportedSuppliers] = useState([])
  const [supplierSuggestions, setSupplierSuggestions] = useState([])
  const [crewResults, setCrewResults] = useState([])
  const [deliveryResults, setDeliveryResults] = useState([])

  const [supplierForm, setSupplierForm] = useState({
    material: '',
    zip: '',
    city: '',
    state: 'TX'
  })

  const [crewForm, setCrewForm] = useState({
    trade: '',
    zip: '',
    availability: '',
    minCrew: '',
    minRadius: ''
  })

  const [deliveryForm, setDeliveryForm] = useState({
    pickupZip: '',
    jobsiteZip: '',
    vehicleType: '',
    trailerType: '',
    payload: '',
    supportType: ''
  })

  const [projectNotes, setProjectNotes] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [extractedText, setExtractedText] = useState('')
  const [projectEngine, setProjectEngine] = useState(null)

  const projectSummary = useMemo(
    () => scoreScope(`${projectNotes}\n${extractedText}`),
    [projectNotes, extractedText]
  )

  function setSupplierField(key, value) {
    setSupplierForm((prev) => ({ ...prev, [key]: value }))
  }

  function setCrewField(key, value) {
    setCrewForm((prev) => ({ ...prev, [key]: value }))
  }

  function setDeliveryField(key, value) {
    setDeliveryForm((prev) => ({ ...prev, [key]: value }))
  }

  function pushWithParams(path, values = {}) {
    const params = new URLSearchParams()

    Object.entries(values).forEach(([key, value]) => {
      if (value === undefined || value === null) return
      const normalized = String(value).trim()
      if (!normalized) return
      params.set(key, normalized)
    })

    const query = params.toString()
    navigate(query ? `${path}?${query}` : path)
  }

  function openSupplierSearch(overrides = {}) {
    pushWithParams('/materials', {
      q: overrides.q || supplierForm.material,
      material: overrides.material || supplierForm.material,
      zip: overrides.zip || supplierForm.zip,
      storefront: overrides.storefront || '1'
    })
  }

  function openCrewPost(overrides = {}) {
    pushWithParams('/new', {
      type: 'need_crew',
      title:
        overrides.title ||
        `${overrides.trade || crewForm.trade || projectSummary.trades[0] || 'Crew'} crew needed`,
      body:
        overrides.body ||
        projectNotes ||
        extractedText ||
        `Need ${overrides.trade || crewForm.trade || projectSummary.trades[0] || 'construction'} support near ${overrides.zip || crewForm.zip || supplierForm.zip || deliveryForm.jobsiteZip || ''}.`,
      zip: overrides.zip || crewForm.zip || supplierForm.zip || deliveryForm.jobsiteZip,
      trade: overrides.trade || crewForm.trade || projectSummary.trades[0] || '',
      crew_size: overrides.crew_size || crewForm.minCrew || '',
      urgent: overrides.urgent || ''
    })
  }

  function openDeliverySearch(overrides = {}) {
    pushWithParams('/delivery', {
      q:
        overrides.q ||
        [
          overrides.vehicle || deliveryForm.vehicleType,
          overrides.trailer || deliveryForm.trailerType,
          overrides.support || deliveryForm.supportType
        ]
          .filter(Boolean)
          .join(' '),
      zip: overrides.zip || deliveryForm.pickupZip || deliveryForm.jobsiteZip || supplierForm.zip,
      vehicle: overrides.vehicle || deliveryForm.vehicleType,
      trailer: overrides.trailer || deliveryForm.trailerType,
      support: overrides.support || deliveryForm.supportType,
      payload: overrides.payload || deliveryForm.payload || '',
      radius: overrides.radius || ''
    })
  }

  function openDeliveryPost(overrides = {}) {
    const support = overrides.support || deliveryForm.supportType || 'material_delivery'
    const supportLabel =
      support === 'cargo_van_delivery' ? 'delivery support' : 'material delivery support'

    pushWithParams('/new', {
      type: 'discussion',
      category: 'jobsite_support',
      support,
      title:
        overrides.title ||
        `Need ${supportLabel} near ${overrides.zip || deliveryForm.jobsiteZip || deliveryForm.pickupZip || supplierForm.zip || ''}`,
      body:
        overrides.body ||
        projectNotes ||
        extractedText ||
        `Need ${supportLabel} for pickup near ${overrides.pickupZip || deliveryForm.pickupZip || supplierForm.zip || ''} and delivery near ${overrides.jobsiteZip || deliveryForm.jobsiteZip || crewForm.zip || ''}.`,
      zip: overrides.zip || deliveryForm.jobsiteZip || deliveryForm.pickupZip || supplierForm.zip,
      urgent: overrides.urgent || '',
      compensation: overrides.compensation || '',
      start_date: overrides.start_date || ''
    })
  }

  function openSupplierSearchFromCard(supplier) {
    openSupplierSearch({
      q: supplier?.business_name || supplier?.display_name || supplierForm.material,
      material:
        (Array.isArray(supplier?.materials_categories) && supplier.materials_categories[0]) ||
        supplierForm.material,
      zip: supplier?.business_zip || supplierForm.zip,
      storefront: '1'
    })
  }

  function openSupplierStorefrontFromCard(supplier) {
    const target = supplier?.external_id || supplier?.id || ''
    if (!target) {
      openSupplierSearchFromCard(supplier)
      return
    }
    navigate(`/supplier/${encodeURIComponent(target)}`)
  }

  function buildCrewPostFromMatch(worker) {
    openCrewPost({
      trade: worker?.trade_name || crewForm.trade || projectSummary.trades[0] || '',
      zip: worker?.home_zip || crewForm.zip || supplierForm.zip || deliveryForm.jobsiteZip,
      title: `${worker?.trade_name || crewForm.trade || 'Crew'} crew needed`,
      body:
        projectNotes ||
        extractedText ||
        `Need ${worker?.trade_name || crewForm.trade || 'construction'} support near ${worker?.home_zip || crewForm.zip || supplierForm.zip || deliveryForm.jobsiteZip || ''}. Matched from Surplox AI Tools.`
    })
  }

  function openDriverSearchFromMatch(driver) {
    openDeliverySearch({
      q: [driver?.vehicle_type, driver?.trailer_type].filter(Boolean).join(' '),
      zip: deliveryForm.pickupZip || deliveryForm.jobsiteZip || supplierForm.zip,
      vehicle: driver?.vehicle_type || deliveryForm.vehicleType,
      trailer: driver?.trailer_type || deliveryForm.trailerType,
      support: deliveryForm.supportType
    })
  }

  function buildDeliveryPostFromMatch(driver) {
    openDeliveryPost({
      support: deliveryForm.supportType || 'material_delivery',
      zip: deliveryForm.jobsiteZip || deliveryForm.pickupZip || supplierForm.zip,
      title: `Need delivery support near ${deliveryForm.jobsiteZip || deliveryForm.pickupZip || supplierForm.zip || ''}`,
      body:
        projectNotes ||
        extractedText ||
        `Need delivery support. Suggested match: ${driver?.display_name || 'driver'} with ${String(driver?.vehicle_type || '').replace(/_/g, ' ')}${driver?.trailer_type ? ` and ${String(driver.trailer_type).replace(/_/g, ' ')}` : ''}.`
    })
  }

  async function handleImportSuppliers(event) {
    event.preventDefault()
    setBusy(true)
    setMessage('')

    try {
      const response = await fetch(API_IMPORT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplierForm)
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || copy.importError)

      setImportedSuppliers(Array.isArray(data.suppliers) ? data.suppliers : [])
      setMessage(copy.importSuccess)
    } catch (error) {
      console.error(error)
      setMessage(error.message || copy.importError)
    } finally {
      setBusy(false)
    }
  }

  async function handleSupplierSuggestions(event) {
    event.preventDefault()
    setBusy(true)
    setMessage('')

    try {
      const response = await fetch(API_SUPPLIER_SEARCH_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplierForm)
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || copy.importError)

      setSupplierSuggestions(Array.isArray(data.suppliers) ? data.suppliers : [])
    } catch (error) {
      console.error(error)
      setMessage(error.message || copy.importError)
    } finally {
      setBusy(false)
    }
  }

  async function runCrewMatch() {
    setBusy(true)
    setMessage('')

    try {
      const { data, error } = await fetchCrewMatches(crewForm)
      if (error) throw error
      setCrewResults(data)
      if (!data.length) setMessage(copy.noCrewResults)
    } catch (error) {
      console.error(error)
      setMessage(error.message || 'Crew matching failed.')
    } finally {
      setBusy(false)
    }
  }

  async function runDeliveryMatch() {
    setBusy(true)
    setMessage('')

    try {
      const { data, error } = await fetchDeliveryMatches(deliveryForm)
      if (error) throw error
      setDeliveryResults(data)
      if (!data.length) setMessage(copy.noDeliveryResults)
    } catch (error) {
      console.error(error)
      setMessage(error.message || 'Delivery coordination failed.')
    } finally {
      setBusy(false)
    }
  }

  async function handleFilesSelected(event) {
    const files = Array.from(event.target.files || [])
    const next = []

    for (const file of files) {
      const lower = file.name.toLowerCase()
      let text = ''
      let ocrReady = false

      if (file.type.startsWith('text/') || /\.(txt|md|json|csv)$/i.test(lower)) {
        text = await file.text()
      } else if (file.type === 'application/pdf' || /\.pdf$/i.test(lower)) {
        ocrReady = true
      } else if (file.type.startsWith('image/')) {
        ocrReady = true
      }

      next.push({
        id: `${file.name}-${file.size}-${file.lastModified}`,
        file,
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        extractedText: text,
        ocrReady,
        ocrDone: Boolean(text)
      })
    }

    setUploadedFiles(next)

    const combinedText = next
      .map((item) => item.extractedText)
      .filter(Boolean)
      .join('\n\n')

    if (combinedText) {
      setExtractedText((prev) => [prev, combinedText].filter(Boolean).join('\n\n'))
    }
  }

  async function runOcrForFile(fileId) {
    setBusy(true)
    setMessage('')

    try {
      const target = uploadedFiles.find((item) => item.id === fileId)
      if (!target) throw new Error('File not found.')

      const fileBase64 = await fileToBase64(target.file)
      const response = await fetch(API_OCR_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileBase64, mimeType: target.mimeType })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || 'OCR failed.')

      const text = String(data?.extractedText || '').trim()

      setUploadedFiles((prev) =>
        prev.map((item) =>
          item.id === fileId
            ? { ...item, extractedText: text, ocrDone: Boolean(text) }
            : item
        )
      )

      if (text) {
        setExtractedText((prev) => [prev, text].filter(Boolean).join('\n\n'))
      }
    } catch (error) {
      console.error(error)
      setMessage(error.message || 'OCR failed.')
    } finally {
      setBusy(false)
    }
  }

  async function runProjectEngine() {
    const scopeText = [projectNotes, extractedText].filter(Boolean).join('\n\n').trim()
    if (!scopeText) {
      setMessage(copy.engineEmpty)
      return
    }

    setBusy(true)
    setMessage('')

    try {
      const detectedZip =
        extractZipFromText(scopeText) ||
        supplierForm.zip ||
        crewForm.zip ||
        deliveryForm.jobsiteZip ||
        deliveryForm.pickupZip

      const materialsPlan = buildMaterialsPlan(projectSummary, scopeText)
      const crewPlan = buildCrewPlan(projectSummary, scopeText)
      const deliveryPlan = buildDeliveryPlan(materialsPlan, projectSummary, scopeText)

      const supplierGroups = await runSupplierEngine(materialsPlan, detectedZip, supplierForm)
      const crewGroups = await runCrewEngine(crewPlan, detectedZip)
      const deliveryMatches = await runDeliveryEngine(
        deliveryPlan,
        supplierForm.zip || detectedZip,
        detectedZip
      )

      const nextEngine = {
        summary: projectSummary.summary,
        primaryZip: detectedZip,
        scopeSignals: {
          trades: projectSummary.trades,
          materials: projectSummary.materials,
          squareFeet: extractSquareFeet(scopeText)
        },
        crewPlan: crewGroups,
        materialsPlan,
        supplierGroups,
        deliveryPlan: {
          ...deliveryPlan,
          matches: deliveryMatches
        }
      }

      setProjectEngine(nextEngine)

      const firstMaterial = materialsPlan[0]?.label || ''
      const firstTrade = crewPlan[0]?.trade || ''

      setSupplierForm((prev) => ({
        ...prev,
        material: firstMaterial || prev.material,
        zip: detectedZip || prev.zip
      }))

      setCrewForm((prev) => ({
        ...prev,
        trade: firstTrade || prev.trade,
        zip: detectedZip || prev.zip,
        minCrew: crewPlan[0]?.crewRange?.split('-')?.[0] || prev.minCrew
      }))

      setDeliveryForm((prev) => ({
        ...prev,
        pickupZip: supplierForm.zip || detectedZip || prev.pickupZip,
        jobsiteZip: detectedZip || prev.jobsiteZip,
        vehicleType: deliveryPlan.vehicleType || prev.vehicleType,
        trailerType: deliveryPlan.trailerType || prev.trailerType,
        payload: deliveryPlan.payload || prev.payload,
        supportType: deliveryPlan.suggestedLane || prev.supportType
      }))

      setSupplierSuggestions(
        supplierGroups.flatMap((group) =>
          (group.suppliers || []).map((supplier) => ({
            ...supplier,
            engine_material: group.label
          }))
        )
      )
      setCrewResults(crewGroups.flatMap((group) => group.matches || []))
      setDeliveryResults(deliveryMatches)
    } catch (error) {
      console.error(error)
      setMessage(error.message || 'Project Engine failed.')
    } finally {
      setBusy(false)
    }
  }

  function useAnalyzerForSupplier() {
    const firstMaterial = projectSummary.materials[0] || ''
    setSupplierForm((prev) => ({
      ...prev,
      material: firstMaterial || prev.material,
      zip: crewForm.zip || deliveryForm.jobsiteZip || prev.zip
    }))
    setTab('supplier')
  }

  function useAnalyzerForCrew() {
    const firstTrade = projectSummary.trades[0] || ''
    setCrewForm((prev) => ({
      ...prev,
      trade: firstTrade || prev.trade,
      zip: supplierForm.zip || prev.zip
    }))
    setTab('crew')
  }

  function useAnalyzerForDelivery() {
    setDeliveryForm((prev) => ({
      ...prev,
      pickupZip: supplierForm.zip || prev.pickupZip,
      jobsiteZip: crewForm.zip || supplierForm.zip || prev.jobsiteZip
    }))
    setTab('delivery')
  }

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div
        className="card rounded-xl"
        style={{
          padding: 28,
          background: 'linear-gradient(180deg, #efe8ff 0%, #f7f7f2 100%)'
        }}
      >
        <div className="badge" style={{ marginBottom: 14, background: '#e8defa', color: '#4d2f82' }}>
          {copy.badge}
        </div>

        <div className="h1" style={{ maxWidth: 820 }}>{copy.title}</div>
        <p className="muted" style={{ marginTop: 12, maxWidth: 920, fontSize: 17, lineHeight: 1.7 }}>
          {copy.body}
        </p>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
          <Chip active={tab === 'supplier'} onClick={() => setTab('supplier')}>{copy.supplierTab}</Chip>
          <Chip active={tab === 'crew'} onClick={() => setTab('crew')}>{copy.crewTab}</Chip>
          <Chip active={tab === 'delivery'} onClick={() => setTab('delivery')}>{copy.deliveryTab}</Chip>
          <Chip active={tab === 'analyzer'} onClick={() => setTab('analyzer')}>{copy.analyzerTab}</Chip>
        </div>
      </div>

      {message ? (
        <div className="card-message" style={{ padding: 14, borderRadius: 18 }}>
          {message}
        </div>
      ) : null}

      {tab === 'supplier' ? (
        <>
          <div className="card rounded-xl" style={{ padding: 22 }}>
            <div className="card-section-title">{copy.importerTitle}</div>
            <p className="card-section-subtitle" style={{ marginTop: 8 }}>
              {copy.importerBody}
            </p>

            <form onSubmit={handleImportSuppliers} className="grid" style={{ gap: 14, marginTop: 16 }}>
              <div className="grid two" style={{ gap: 14 }}>
                <div>
                  <div className="muted" style={{ marginBottom: 8 }}>{copy.materialLabel}</div>
                  <input
                    className="input"
                    value={supplierForm.material}
                    onChange={(e) => setSupplierField('material', e.target.value)}
                    placeholder={copy.materialPlaceholder}
                  />
                </div>

                <div>
                  <div className="muted" style={{ marginBottom: 8 }}>{copy.zipLabel}</div>
                  <input
                    className="input"
                    value={supplierForm.zip}
                    onChange={(e) => setSupplierField('zip', e.target.value.replace(/[^\d]/g, '').slice(0, 5))}
                    placeholder={copy.zipPlaceholder}
                  />
                </div>
              </div>

              <div className="grid two" style={{ gap: 14 }}>
                <div>
                  <div className="muted" style={{ marginBottom: 8 }}>{copy.cityLabel}</div>
                  <input
                    className="input"
                    value={supplierForm.city}
                    onChange={(e) => setSupplierField('city', e.target.value)}
                    placeholder={copy.cityPlaceholder}
                  />
                </div>

                <div>
                  <div className="muted" style={{ marginBottom: 8 }}>{copy.stateLabel}</div>
                  <input
                    className="input"
                    value={supplierForm.state}
                    onChange={(e) => setSupplierField('state', e.target.value.toUpperCase().slice(0, 2))}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button className="btn primary" type="submit" disabled={busy}>
                  {busy ? copy.importing : copy.importButton}
                </button>

                <button className="btn" type="button" onClick={handleSupplierSuggestions} disabled={busy}>
                  {busy ? copy.searching : copy.searchButton}
                </button>

                <Link className="btn" to="/materials">
                  {copy.openMaterials}
                </Link>

                <button className="btn" type="button" onClick={() => openSupplierSearch()}>
                  {copy.openSupplierSearch}
                </button>
              </div>
            </form>
          </div>

          <div className="card rounded-xl" style={{ padding: 22 }}>
            <div className="card-section-title">{copy.importedLabel}</div>
            {importedSuppliers.length === 0 ? (
              <p className="card-section-subtitle" style={{ marginTop: 8 }}>
                {copy.noImported}
              </p>
            ) : (
              <div className="grid" style={{ gap: 16, marginTop: 14 }}>
                {importedSuppliers.map((supplier) => (
                  <SupplierCard
                    key={supplier.external_id || supplier.id || `${supplier.business_name}-${supplier.business_zip}`}
                    supplier={supplier}
                    copy={copy}
                    onOpenSearch={openSupplierSearchFromCard}
                    onOpenStorefront={openSupplierStorefrontFromCard}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="card rounded-xl" style={{ padding: 22 }}>
            <div className="card-section-title">{copy.suggestionsLabel}</div>
            {supplierSuggestions.length === 0 ? (
              <p className="card-section-subtitle" style={{ marginTop: 8 }}>
                {copy.noSuggestions}
              </p>
            ) : (
              <div className="grid" style={{ gap: 16, marginTop: 14 }}>
                {supplierSuggestions.map((supplier) => (
                  <SupplierCard
                    key={supplier.external_id || supplier.id || `${supplier.business_name}-${supplier.business_zip}`}
                    supplier={supplier}
                    copy={copy}
                    onOpenSearch={openSupplierSearchFromCard}
                    onOpenStorefront={openSupplierStorefrontFromCard}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}

      {tab === 'crew' ? (
        <>
          <div className="card rounded-xl" style={{ padding: 22 }}>
            <div className="card-section-title">{copy.crewTitle}</div>
            <p className="card-section-subtitle" style={{ marginTop: 8 }}>{copy.crewBody}</p>
            <p className="card-section-subtitle" style={{ marginTop: 8 }}>{copy.crewSearchReady}</p>

            <div className="grid two" style={{ gap: 14, marginTop: 16 }}>
              <div>
                <div className="muted" style={{ marginBottom: 8 }}>{copy.tradeLabel}</div>
                <input
                  className="input"
                  value={crewForm.trade}
                  onChange={(e) => setCrewField('trade', e.target.value)}
                  placeholder={copy.tradePlaceholder}
                />
              </div>
              <div>
                <div className="muted" style={{ marginBottom: 8 }}>{copy.zipLabel}</div>
                <input
                  className="input"
                  value={crewForm.zip}
                  onChange={(e) => setCrewField('zip', e.target.value.replace(/[^\d]/g, '').slice(0, 5))}
                  placeholder={copy.zipPlaceholder}
                />
              </div>
            </div>

            <div className="grid three" style={{ gap: 14, marginTop: 14 }}>
              <div>
                <div className="muted" style={{ marginBottom: 8 }}>{copy.availabilityLabel}</div>
                <select
                  className="input"
                  value={crewForm.availability}
                  onChange={(e) => setCrewField('availability', e.target.value)}
                >
                  <option value="">{copy.allAvailability}</option>
                  <option value="available_now">{copy.availableNow}</option>
                  <option value="available_this_week">{copy.availableThisWeek}</option>
                  <option value="busy">{copy.busy}</option>
                </select>
              </div>

              <div>
                <div className="muted" style={{ marginBottom: 8 }}>{copy.minCrewLabel}</div>
                <input
                  className="input"
                  type="number"
                  value={crewForm.minCrew}
                  onChange={(e) => setCrewField('minCrew', e.target.value)}
                />
              </div>

              <div>
                <div className="muted" style={{ marginBottom: 8 }}>{copy.radiusLabel}</div>
                <input
                  className="input"
                  type="number"
                  value={crewForm.minRadius}
                  onChange={(e) => setCrewField('minRadius', e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
              <button className="btn primary" type="button" onClick={runCrewMatch} disabled={busy}>
                {copy.runCrewButton}
              </button>
              <Link className="btn" to="/channels">{copy.openChannels}</Link>
              <Link className="btn" to="/new?type=need_crew">{copy.createNeedCrewPost}</Link>
              <button className="btn" type="button" onClick={() => openCrewPost()}>
                {copy.openCrewPost}
              </button>
            </div>
          </div>

          <div className="card rounded-xl" style={{ padding: 22 }}>
            <div className="card-section-title">{copy.crewResults}</div>
            {crewResults.length === 0 ? (
              <p className="card-section-subtitle" style={{ marginTop: 8 }}>{copy.noCrewResults}</p>
            ) : (
              <div className="grid" style={{ gap: 16, marginTop: 14 }}>
                {crewResults.map((worker) => (
                  <WorkerCard
                    key={worker.user_id}
                    worker={worker}
                    copy={copy}
                    onBuildCrewPost={buildCrewPostFromMatch}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}

      {tab === 'delivery' ? (
        <>
          <div className="card rounded-xl" style={{ padding: 22 }}>
            <div className="card-section-title">{copy.deliveryTitle}</div>
            <p className="card-section-subtitle" style={{ marginTop: 8 }}>{copy.deliveryBody}</p>
            <p className="card-section-subtitle" style={{ marginTop: 8 }}>{copy.deliverySearchReady}</p>

            <div className="grid two" style={{ gap: 14, marginTop: 16 }}>
              <div>
                <div className="muted" style={{ marginBottom: 8 }}>{copy.pickupZipLabel}</div>
                <input
                  className="input"
                  value={deliveryForm.pickupZip}
                  onChange={(e) => setDeliveryField('pickupZip', e.target.value.replace(/[^\d]/g, '').slice(0, 5))}
                  placeholder={copy.pickupZipPlaceholder}
                />
              </div>

              <div>
                <div className="muted" style={{ marginBottom: 8 }}>{copy.jobsiteZipLabel}</div>
                <input
                  className="input"
                  value={deliveryForm.jobsiteZip}
                  onChange={(e) => setDeliveryField('jobsiteZip', e.target.value.replace(/[^\d]/g, '').slice(0, 5))}
                  placeholder={copy.jobsiteZipPlaceholder}
                />
              </div>
            </div>

            <div className="grid three" style={{ gap: 14, marginTop: 14 }}>
              <div>
                <div className="muted" style={{ marginBottom: 8 }}>{copy.vehicleLabel}</div>
                <select
                  className="input"
                  value={deliveryForm.vehicleType}
                  onChange={(e) => setDeliveryField('vehicleType', e.target.value)}
                >
                  <option value="">{copy.allVehicles}</option>
                  {VEHICLE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="muted" style={{ marginBottom: 8 }}>{copy.trailerLabel}</div>
                <select
                  className="input"
                  value={deliveryForm.trailerType}
                  onChange={(e) => setDeliveryField('trailerType', e.target.value)}
                >
                  <option value="">{copy.allTrailers}</option>
                  {TRAILER_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="muted" style={{ marginBottom: 8 }}>{copy.payloadLabel}</div>
                <input
                  className="input"
                  type="number"
                  value={deliveryForm.payload}
                  onChange={(e) => setDeliveryField('payload', e.target.value)}
                />
              </div>
            </div>

            <div className="grid two" style={{ gap: 14, marginTop: 14 }}>
              <div>
                <div className="muted" style={{ marginBottom: 8 }}>{copy.supportTypeLabel}</div>
                <select
                  className="input"
                  value={deliveryForm.supportType}
                  onChange={(e) => setDeliveryField('supportType', e.target.value)}
                >
                  <option value="">{copy.allSupportTypes}</option>
                  {SUPPORT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
              <button className="btn primary" type="button" onClick={runDeliveryMatch} disabled={busy}>
                {copy.runDeliveryButton}
              </button>
              <Link className="btn" to="/delivery">{copy.openDelivery}</Link>
              <button className="btn" type="button" onClick={() => openDeliveryPost()}>
                {copy.openDeliveryPost}
              </button>
            </div>
          </div>

          <div className="card rounded-xl" style={{ padding: 22 }}>
            <div className="card-section-title">{copy.deliveryResults}</div>
            {deliveryResults.length === 0 ? (
              <p className="card-section-subtitle" style={{ marginTop: 8 }}>{copy.noDeliveryResults}</p>
            ) : (
              <div className="grid" style={{ gap: 16, marginTop: 14 }}>
                {deliveryResults.map((driver) => (
                  <DriverCard
                    key={driver.user_id}
                    driver={driver}
                    copy={copy}
                    onOpenDriverSearch={openDriverSearchFromMatch}
                    onBuildDeliveryPost={buildDeliveryPostFromMatch}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}

      {tab === 'analyzer' ? (
        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">{copy.analyzerTitle}</div>
          <p className="card-section-subtitle" style={{ marginTop: 8 }}>{copy.analyzerBody}</p>

          <div style={{ marginTop: 16 }}>
            <div className="muted" style={{ marginBottom: 8 }}>{copy.uploadLabel}</div>
            <input type="file" multiple onChange={handleFilesSelected} />
            <p className="card-section-subtitle" style={{ marginTop: 8 }}>{copy.uploadHelp}</p>
          </div>

          {uploadedFiles.length > 0 ? (
            <div className="grid" style={{ gap: 12, marginTop: 16 }}>
              {uploadedFiles.map((file) => (
                <div key={file.id} className="card-soft">
                  <div style={{ fontWeight: 800 }}>{file.name}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                    <span className="badge">{file.extractedText ? copy.fileExtracted : copy.fileReady}</span>
                    {file.ocrReady ? (
                      <span className="badge">{file.ocrDone ? copy.fileOcrDone : copy.fileOcrReady}</span>
                    ) : null}
                  </div>
                  {file.ocrReady && !file.ocrDone ? (
                    <div style={{ marginTop: 10 }}>
                      <button
                        className="btn small"
                        type="button"
                        onClick={() => runOcrForFile(file.id)}
                        disabled={busy}
                      >
                        {busy ? copy.runningOcr : copy.runOcr}
                      </button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}

          <div style={{ marginTop: 16 }}>
            <div className="muted" style={{ marginBottom: 8 }}>{copy.notesLabel}</div>
            <textarea
              className="input"
              value={projectNotes}
              onChange={(e) => setProjectNotes(e.target.value)}
              placeholder={copy.notesPlaceholder}
              style={{ minHeight: 180 }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
            <Chip onClick={runProjectEngine}>{busy ? copy.engineRunning : copy.analyzeButton}</Chip>
            <Chip onClick={useAnalyzerForSupplier}>{copy.supplierTab}</Chip>
            <Chip onClick={useAnalyzerForCrew}>{copy.crewTab}</Chip>
            <Chip onClick={useAnalyzerForDelivery}>{copy.deliveryTab}</Chip>
          </div>

          <div className="card-soft" style={{ marginTop: 16 }}>
            <div className="card-section-title">{copy.projectEngineTitle}</div>
            <p className="card-section-subtitle" style={{ marginTop: 8 }}>
              {copy.projectEngineBody}
            </p>

            {projectEngine ? (
              <div style={{ display: 'grid', gap: 16, marginTop: 14 }}>
                <div className="grid two" style={{ gap: 14 }}>
                  <div className="card-soft" style={{ background: '#ffffff' }}>
                    <div className="muted">{copy.engineProjectType}</div>
                    <div style={{ marginTop: 6, fontWeight: 800 }}>{projectEngine.summary}</div>
                  </div>

                  <div className="card-soft" style={{ background: '#ffffff' }}>
                    <div className="muted">{copy.enginePrimaryZip}</div>
                    <div style={{ marginTop: 6, fontWeight: 800 }}>{projectEngine.primaryZip || '—'}</div>
                  </div>
                </div>

                <div className="card-soft" style={{ background: '#ffffff' }}>
                  <div className="card-section-title">{copy.engineScopeSignals}</div>
                  <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {(projectEngine.scopeSignals.trades || []).map((trade) => (
                      <span key={`signal-trade-${trade}`} className="badge">{titleCase(trade)}</span>
                    ))}
                    {(projectEngine.scopeSignals.materials || []).map((material) => (
                      <span key={`signal-material-${material}`} className="badge">{titleCase(material)}</span>
                    ))}
                    {projectEngine.scopeSignals.squareFeet ? (
                      <span className="badge">{projectEngine.scopeSignals.squareFeet.toLocaleString()} SF</span>
                    ) : null}
                  </div>
                </div>

                <div className="card-soft" style={{ background: '#ffffff' }}>
                  <div className="card-section-title">{copy.engineCrewPlan}</div>
                  {projectEngine.crewPlan?.length ? (
                    <div className="grid" style={{ gap: 12, marginTop: 12 }}>
                      {projectEngine.crewPlan.map((item) => (
                        <div key={`crew-plan-${item.trade}`} className="card-soft" style={{ background: '#f8f7ef' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                            <div>
                              <div style={{ fontWeight: 800 }}>{item.label}</div>
                              <div className="muted" style={{ marginTop: 4 }}>
                                {copy.engineEstimatedCrew}: {item.crewRange}
                              </div>
                            </div>

                            <button
                              className="btn small"
                              type="button"
                              onClick={() =>
                                openCrewPost({
                                  trade: item.trade,
                                  zip: projectEngine.primaryZip,
                                  crew_size: item.crewRange.split('-')[0] || ''
                                })
                              }
                            >
                              {copy.engineBuildCrewPost}
                            </button>
                          </div>

                          <div className="muted" style={{ marginTop: 8 }}>{item.recommendedAction}</div>

                          {item.matches?.length ? (
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                              {item.matches.slice(0, 3).map((match) => (
                                <span key={`${item.trade}-${match.user_id}`} className="badge">
                                  {match.display_name} · {match.match_score}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="card-section-subtitle" style={{ marginTop: 8 }}>{copy.engineNoCrew}</p>
                  )}
                </div>

                <div className="card-soft" style={{ background: '#ffffff' }}>
                  <div className="card-section-title">{copy.engineMaterialsPlan}</div>
                  {projectEngine.materialsPlan?.length ? (
                    <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
                      {projectEngine.materialsPlan.map((item) => (
                        <div key={`material-plan-${item.material}`} className="card-soft" style={{ background: '#f8f7ef' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                            <div>
                              <div style={{ fontWeight: 800 }}>{item.label}</div>
                              <div className="muted" style={{ marginTop: 4 }}>
                                {copy.enginePriority}: {item.priority}
                              </div>
                            </div>

                            <button
                              className="btn small"
                              type="button"
                              onClick={() =>
                                openSupplierSearch({
                                  material: item.label,
                                  q: item.label,
                                  zip: projectEngine.primaryZip
                                })
                              }
                            >
                              {copy.engineUseSupplier}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="card-soft" style={{ background: '#ffffff' }}>
                  <div className="card-section-title">{copy.engineSuppliersPlan}</div>
                  {projectEngine.supplierGroups?.some((group) => group.suppliers?.length) ? (
                    <div className="grid" style={{ gap: 12, marginTop: 12 }}>
                      {projectEngine.supplierGroups.map((group) => (
                        <div key={`supplier-group-${group.material}`} className="card-soft" style={{ background: '#f8f7ef' }}>
                          <div style={{ fontWeight: 800 }}>{group.label}</div>
                          {group.suppliers?.length ? (
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                              {group.suppliers.slice(0, 4).map((supplier) => (
                                <button
                                  key={`${group.material}-${supplier.external_id || supplier.id || supplier.business_name}`}
                                  className="btn small"
                                  type="button"
                                  onClick={() => openSupplierStorefrontFromCard(supplier)}
                                >
                                  {supplier.business_name || supplier.display_name}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="muted" style={{ marginTop: 8 }}>{copy.engineNoSuppliers}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="card-section-subtitle" style={{ marginTop: 8 }}>{copy.engineNoSuppliers}</p>
                  )}
                </div>

                <div className="card-soft" style={{ background: '#ffffff' }}>
                  <div className="card-section-title">{copy.engineDeliveryPlan}</div>
                  {projectEngine.deliveryPlan ? (
                    <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
                      <div className="grid two" style={{ gap: 12 }}>
                        <div className="card-soft" style={{ background: '#f8f7ef' }}>
                          <div className="muted">{copy.engineSuggestedLane}</div>
                          <div style={{ marginTop: 6, fontWeight: 800 }}>
                            {titleCase(projectEngine.deliveryPlan.suggestedLane)}
                          </div>
                        </div>

                        <div className="card-soft" style={{ background: '#f8f7ef' }}>
                          <div className="muted">{copy.payloadLabel}</div>
                          <div style={{ marginTop: 6, fontWeight: 800 }}>
                            {projectEngine.deliveryPlan.payload || '—'}
                          </div>
                        </div>
                      </div>

                      <div className="muted">{projectEngine.deliveryPlan.notes}</div>

                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <button
                          className="btn small"
                          type="button"
                          onClick={() =>
                            openDeliverySearch({
                              vehicle: projectEngine.deliveryPlan.vehicleType,
                              trailer: projectEngine.deliveryPlan.trailerType,
                              support: projectEngine.deliveryPlan.suggestedLane,
                              payload: projectEngine.deliveryPlan.payload,
                              zip: projectEngine.primaryZip
                            })
                          }
                        >
                          {copy.engineUseDelivery}
                        </button>

                        <button
                          className="btn small"
                          type="button"
                          onClick={() =>
                            openDeliveryPost({
                              support: projectEngine.deliveryPlan.suggestedLane,
                              zip: projectEngine.primaryZip,
                              body: extractedText || projectNotes
                            })
                          }
                        >
                          {copy.engineBuildDeliveryPost}
                        </button>
                      </div>

                      {projectEngine.deliveryPlan.matches?.length ? (
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {projectEngine.deliveryPlan.matches.slice(0, 4).map((driver) => (
                            <button
                              key={`engine-driver-${driver.user_id}`}
                              className="btn small"
                              type="button"
                              onClick={() => openDriverSearchFromMatch(driver)}
                            >
                              {driver.display_name} · {driver.match_score}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="card-section-subtitle">{copy.engineNoDelivery}</p>
                      )}
                    </div>
                  ) : (
                    <p className="card-section-subtitle" style={{ marginTop: 8 }}>{copy.engineNoDelivery}</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="card-section-subtitle" style={{ marginTop: 8 }}>
                {copy.engineEmpty}
              </p>
            )}
          </div>

          <div className="card-soft" style={{ marginTop: 16 }}>
            <div className="card-section-title">{copy.analyzerActionsTitle}</div>
            <p className="card-section-subtitle" style={{ marginTop: 8 }}>
              {copy.analyzerActionsBody}
            </p>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
              <button
                className="btn"
                type="button"
                onClick={() =>
                  openSupplierSearch({
                    material: projectSummary.materials[0] || supplierForm.material,
                    zip: supplierForm.zip || crewForm.zip || deliveryForm.jobsiteZip
                  })
                }
              >
                {copy.openSupplierSearch}
              </button>

              <button
                className="btn"
                type="button"
                onClick={() =>
                  openCrewPost({
                    trade: projectSummary.trades[0] || crewForm.trade,
                    zip: crewForm.zip || supplierForm.zip || deliveryForm.jobsiteZip,
                    body: extractedText || projectNotes
                  })
                }
              >
                {copy.openCrewPost}
              </button>

              <button
                className="btn"
                type="button"
                onClick={() =>
                  openDeliveryPost({
                    support: deliveryForm.supportType || 'material_delivery',
                    zip: deliveryForm.jobsiteZip || supplierForm.zip || crewForm.zip,
                    body: extractedText || projectNotes
                  })
                }
              >
                {copy.openDeliveryPost}
              </button>

              <button
                className="btn"
                type="button"
                onClick={() =>
                  openDeliverySearch({
                    vehicle: deliveryForm.vehicleType,
                    trailer: deliveryForm.trailerType,
                    zip: deliveryForm.pickupZip || deliveryForm.jobsiteZip || supplierForm.zip
                  })
                }
              >
                {copy.openDelivery}
              </button>
            </div>
          </div>

          <div className="card-soft" style={{ marginTop: 16 }}>
            <div className="card-section-title">{copy.summaryLabel}</div>
            {(projectNotes.trim() || extractedText.trim()) ? (
              <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
                <div><strong>{projectSummary.summary}</strong></div>
                <div><strong>Trades:</strong> {projectSummary.trades.length ? projectSummary.trades.join(', ') : 'General construction'}</div>
                <div><strong>Supplier categories:</strong> {projectSummary.materials.length ? projectSummary.materials.join(', ') : 'General materials'}</div>
                <div><strong>Crew note:</strong> {projectSummary.crewSuggestion}</div>
              </div>
            ) : (
              <p className="card-section-subtitle" style={{ marginTop: 8 }}>{copy.noSummary}</p>
            )}
          </div>

          <div className="card-soft" style={{ marginTop: 16 }}>
            <div className="card-section-title">{copy.extractedTextLabel}</div>
            {extractedText.trim() ? (
              <pre style={{ whiteSpace: 'pre-wrap', marginTop: 10, fontFamily: 'inherit' }}>{extractedText}</pre>
            ) : (
              <p className="card-section-subtitle" style={{ marginTop: 8 }}>{copy.noExtractedText}</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}