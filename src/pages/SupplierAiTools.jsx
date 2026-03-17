import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

const MATERIAL_OPTIONS = [
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

const DELIVERY_LANES = [
  { value: 'material_delivery', label: 'Material Delivery / Hot Shot' },
  { value: 'cargo_van_delivery', label: 'Cargo Van / Local Delivery' }
]

const VEHICLE_LABELS = {
  pickup_truck: 'Pickup Truck',
  cargo_van: 'Cargo Van',
  box_truck: 'Box Truck',
  flatbed_truck: 'Flatbed Truck'
}

const TRAILER_LABELS = {
  none: 'No Trailer',
  no_trailer: 'No Trailer',
  utility_trailer: 'Utility Trailer',
  flatbed_trailer: 'Flatbed Trailer',
  gooseneck_trailer: 'Gooseneck Trailer',
  equipment_trailer: 'Equipment Trailer',
  enclosed_trailer: 'Enclosed Trailer'
}

const SERVICE_TAG_LABELS = {
  material_delivery: 'Material Delivery',
  hot_shot: 'Hot Shot',
  last_mile_delivery: 'Last Mile Delivery',
  local_runs: 'Local Runs',
  same_day_delivery: 'Same Day Delivery',
  long_distance: 'Long Distance',
  cargo_van: 'Cargo Van',
  pickup_truck: 'Pickup Truck'
}

const TOOL_KEYS = {
  supplier: 'supplier',
  crew: 'crew',
  delivery: 'delivery',
  analyzer: 'analyzer'
}

function normalizeText(value) {
  return String(value || '').trim()
}

function normalizeNumber(value) {
  const num = Number(value)
  return Number.isFinite(num) ? num : 0
}

function normalizeList(value) {
  if (!Array.isArray(value)) return []
  return value.map((item) => normalizeText(item)).filter(Boolean)
}

function titleCase(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/\b\w/g, (match) => match.toUpperCase())
}

function labelForMap(map, value) {
  const key = normalizeText(value)
  return map[key] || key || '—'
}

function detectDriverSupportType(serviceTags = [], vehicleType = '') {
  if (
    serviceTags.includes('local_runs') ||
    serviceTags.includes('last_mile_delivery') ||
    vehicleType === 'cargo_van'
  ) {
    return 'cargo_van_delivery'
  }
  return 'material_delivery'
}

function getProfileStrength(profile = {}) {
  let score = 0
  if (normalizeText(profile.display_name)) score += 15
  if (normalizeText(profile.bio)) score += 20
  if (normalizeText(profile.home_zip)) score += 15
  if (normalizeText(profile.city)) score += 10
  if (profile.trade_name || profile.trade_id) score += 15
  if (normalizeNumber(profile.travel_radius_miles) > 0) score += 10
  if (normalizeNumber(profile.crew_size) > 1) score += 5
  if (normalizeText(profile.availability_status)) score += 10
  return Math.min(score, 100)
}

function scoreSupplierMatch(supplier, request) {
  const material = normalizeText(request.material).toLowerCase()
  const zip = normalizeText(request.zip)
  const query = normalizeText(request.query).toLowerCase()
  let score = 0

  const materialMatch = normalizeList(supplier.materials_categories).some(
    (item) => item.toLowerCase() === material
  )
  if (materialMatch) score += 40

  if (zip && normalizeText(supplier.business_zip) === zip) score += 25
  if (supplier.storefront) score += 10
  score += Math.min(normalizeNumber(supplier.delivery_radius), 150) / 5

  const haystack = [
    supplier.business_name,
    supplier.display_name,
    supplier.bio,
    supplier.business_address,
    ...normalizeList(supplier.materials_categories)
  ]
    .join(' ')
    .toLowerCase()

  if (query) {
    query.split(/\s+/).filter(Boolean).forEach((term) => {
      if (haystack.includes(term)) score += 8
    })
  }

  return score
}

function scoreCrewMatch(worker, request) {
  const neededTrade = normalizeText(request.trade).toLowerCase()
  const zip = normalizeText(request.zip)
  const minCrew = normalizeNumber(request.minCrew)
  let score = 0

  const tradeName = normalizeText(worker.trade_name).toLowerCase()
  if (neededTrade && tradeName === neededTrade) score += 40
  else if (neededTrade && tradeName.includes(neededTrade)) score += 22

  if (zip && normalizeText(worker.home_zip) === zip) score += 22
  if (normalizeText(request.availability) && worker.availability_status === request.availability) score += 15
  if (!request.availability && normalizeText(worker.availability_status) === 'available_now') score += 12
  if (minCrew > 0 && normalizeNumber(worker.crew_size) >= minCrew) score += 15
  score += Math.min(normalizeNumber(worker.travel_radius_miles), 150) / 5
  score += getProfileStrength(worker) / 5

  return Math.round(score)
}

function scoreDeliveryMatch(driver, request) {
  const lane = normalizeText(request.supportType)
  const zip = normalizeText(request.pickupZip || request.jobsiteZip)
  let score = 0

  if (lane && normalizeText(driver.support_type) === lane) score += 30
  if (zip && (normalizeText(driver.home_zip) === zip || normalizeText(driver.business_zip) === zip)) score += 20

  if (request.vehicleType && normalizeText(driver.vehicle_type) === normalizeText(request.vehicleType)) score += 18
  if (request.trailerType && normalizeText(driver.trailer_type) === normalizeText(request.trailerType)) score += 15
  if (normalizeNumber(request.minPayload) > 0 && normalizeNumber(driver.payload_capacity) >= normalizeNumber(request.minPayload)) score += 15
  if (normalizeNumber(request.minTrailerLength) > 0 && normalizeNumber(driver.trailer_length) >= normalizeNumber(request.minTrailerLength)) score += 12
  if (normalizeNumber(request.minRadius) > 0 && normalizeNumber(driver.delivery_radius) >= normalizeNumber(request.minRadius)) score += 15

  score += Math.min(normalizeNumber(driver.delivery_radius), 200) / 6
  score += Math.min(normalizeNumber(driver.payload_capacity), 20000) / 2500
  return Math.round(score)
}

function inferProjectSignals(text) {
  const lower = normalizeText(text).toLowerCase()

  const rules = [
    { key: 'concrete', trades: ['Concrete & Flatwork'], materials: ['Concrete'], suppliers: ['Concrete'], crew: '4 to 6 laborers + 1 foreman' },
    { key: 'foundation', trades: ['Concrete & Flatwork', 'Sitework & Excavation'], materials: ['Concrete', 'Steel'], suppliers: ['Concrete', 'Steel'], crew: '5 to 8 workers across excavation and concrete' },
    { key: 'rebar', trades: ['Concrete & Flatwork'], materials: ['Steel', 'Concrete'], suppliers: ['Steel', 'Concrete'], crew: '3 to 5 concrete workers' },
    { key: 'framing', trades: ['Framing & Carpentry'], materials: ['Lumber', 'Fasteners'], suppliers: ['Lumber', 'Fasteners'], crew: '4 to 8 framers' },
    { key: 'roof', trades: ['Roofing'], materials: ['Lumber', 'Fasteners', 'Safety Equipment'], suppliers: ['Lumber', 'Fasteners', 'Safety Equipment'], crew: '3 to 6 roofers' },
    { key: 'drywall', trades: ['Drywall'], materials: ['Drywall', 'Fasteners'], suppliers: ['Drywall', 'Fasteners'], crew: '3 to 5 drywall workers' },
    { key: 'paint', trades: ['Painting'], materials: ['Tools', 'Safety Equipment'], suppliers: ['Tools', 'Safety Equipment'], crew: '2 to 4 painters' },
    { key: 'electrical', trades: ['Electrical'], materials: ['Electrical'], suppliers: ['Electrical'], crew: '2 to 4 electricians' },
    { key: 'plumbing', trades: ['Plumbing'], materials: ['Plumbing'], suppliers: ['Plumbing'], crew: '2 to 4 plumbers' },
    { key: 'hvac', trades: ['HVAC'], materials: ['Tools', 'Safety Equipment'], suppliers: ['Tools', 'Safety Equipment'], crew: '2 to 4 HVAC workers' },
    { key: 'weld', trades: ['Welding & Fabrication'], materials: ['Steel', 'Tools'], suppliers: ['Steel', 'Tools'], crew: '2 to 4 welders' },
    { key: 'excav', trades: ['Sitework & Excavation'], materials: ['Equipment Rental', 'Safety Equipment'], suppliers: ['Equipment Rental', 'Safety Equipment'], crew: '3 to 6 sitework operators/laborers' },
    { key: 'delivery', trades: [], materials: [], suppliers: [], crew: '' }
  ]

  const trades = new Set()
  const materials = new Set()
  const supplierCategories = new Set()
  const crewSuggestions = []

  rules.forEach((rule) => {
    if (lower.includes(rule.key)) {
      rule.trades.forEach((trade) => trades.add(trade))
      rule.materials.forEach((item) => materials.add(item))
      rule.suppliers.forEach((item) => supplierCategories.add(item))
      if (rule.crew) crewSuggestions.push(rule.crew)
    }
  })

  if (trades.size === 0) {
    trades.add('General Construction')
  }

  return {
    summary:
      normalizeText(text)
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 6)
        .join(' ') || 'Project scope uploaded. Review extracted notes and refine crew/supplier planning below.',
    trades: Array.from(trades),
    materials: Array.from(materials),
    supplierCategories: Array.from(supplierCategories),
    crewSuggestions,
    deliveryNotes: [
      'Check pickup ZIP vs jobsite ZIP and confirm delivery radius coverage.',
      'Match payload, trailer setup, and same-day delivery needs to the correct driver lane.',
      'Use material category + supplier ZIP to rank local supplier and driver combinations.'
    ]
  }
}

function cleanExtractedText(text) {
  return normalizeText(text)
    .replace(/\\[nrtbf()\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ' ')
    .trim()
}

function decodePdfStringLiteral(value) {
  return value
    .replace(/\\\)/g, ')')
    .replace(/\\\(/g, '(')
    .replace(/\\n/g, ' ')
    .replace(/\\r/g, ' ')
    .replace(/\\t/g, ' ')
    .replace(/\\f/g, ' ')
    .replace(/\\b/g, ' ')
    .replace(/\\\\/g, '\\')
}

function extractStringsFromPdfLikeText(source) {
  const matches = []
  const literalRegex = /\(([^()]|\\\(|\\\)|\\\\)+\)\s*(?:Tj|TJ|')/g
  let literalMatch
  while ((literalMatch = literalRegex.exec(source))) {
    matches.push(decodePdfStringLiteral(literalMatch[0].replace(/\)\s*(Tj|TJ|')$/, '').slice(1)))
  }

  const hexRegex = /<([0-9A-Fa-f\s]{4,})>\s*(?:Tj|TJ)/g
  let hexMatch
  while ((hexMatch = hexRegex.exec(source))) {
    try {
      const hex = hexMatch[1].replace(/\s+/g, '')
      const bytes = new Uint8Array(hex.match(/.{1,2}/g).map((pair) => parseInt(pair, 16)))
      matches.push(new TextDecoder('latin1').decode(bytes))
    } catch {
      // ignore bad hex blocks
    }
  }

  const btBlocks = source.match(/BT[\s\S]*?ET/g) || []
  btBlocks.forEach((block) => {
    const rough = block
      .replace(/\[[^\]]*\]TJ/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/[A-Za-z]{1,3}/g, ' ')
    if (rough.length > 40) matches.push(rough)
  })

  return cleanExtractedText(matches.join(' '))
}

async function extractTextFromFile(file) {
  const name = normalizeText(file?.name).toLowerCase()
  const type = normalizeText(file?.type).toLowerCase()

  if (!file) return { extractedText: '', previewUrl: '', extractionType: 'none' }

  if (type.startsWith('text/') || /\.(txt|csv|json|md)$/i.test(name)) {
    const text = await file.text()
    return { extractedText: cleanExtractedText(text), previewUrl: '', extractionType: 'plain_text' }
  }

  if (type.startsWith('image/')) {
    const previewUrl = URL.createObjectURL(file)
    return {
      extractedText: '',
      previewUrl,
      extractionType: 'image_preview'
    }
  }

  if (type === 'application/pdf' || /\.pdf$/i.test(name)) {
    const arrayBuffer = await file.arrayBuffer()
    const decoded = new TextDecoder('latin1').decode(new Uint8Array(arrayBuffer))
    const extractedText = extractStringsFromPdfLikeText(decoded)
    return {
      extractedText,
      previewUrl: '',
      extractionType: extractedText ? 'pdf_text' : 'pdf_needs_ocr'
    }
  }

  return {
    extractedText: '',
    previewUrl: '',
    extractionType: 'unsupported'
  }
}

function SectionCard({ title, children, soft = false }) {
  return (
    <div className={soft ? 'card-soft rounded-xl' : 'card rounded-xl'} style={{ padding: soft ? 18 : 22 }}>
      <div className="card-section-title">{title}</div>
      <div style={{ marginTop: 12 }}>{children}</div>
    </div>
  )
}

function ResultBadge({ children, dark = false }) {
  return (
    <span className="badge" style={dark ? { background: '#111111', color: '#ffffff' } : {}}>
      {children}
    </span>
  )
}

function ToolTab({ active, onClick, children }) {
  return (
    <button type="button" className={active ? 'btn primary small' : 'btn small'} onClick={onClick}>
      {children}
    </button>
  )
}

export default function SupplierAiTools() {
  const [activeTool, setActiveTool] = useState(TOOL_KEYS.analyzer)
  const [currentUser, setCurrentUser] = useState(null)
  const [suppliers, setSuppliers] = useState([])
  const [workers, setWorkers] = useState([])
  const [drivers, setDrivers] = useState([])
  const [tradesMap, setTradesMap] = useState(new Map())
  const [loadingData, setLoadingData] = useState(true)
  const [dataMsg, setDataMsg] = useState('')
  const [projectMsg, setProjectMsg] = useState('')
  const [uploading, setUploading] = useState(false)

  const [projectForm, setProjectForm] = useState({
    projectName: '',
    jobsiteZip: '',
    notes: ''
  })
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [projectAnalysis, setProjectAnalysis] = useState(null)

  const [supplierForm, setSupplierForm] = useState({ material: 'Concrete', zip: '', query: '' })
  const [crewForm, setCrewForm] = useState({ trade: '', zip: '', minCrew: 1, availability: '' })
  const [deliveryForm, setDeliveryForm] = useState({
    pickupZip: '',
    jobsiteZip: '',
    supportType: 'material_delivery',
    vehicleType: '',
    trailerType: '',
    minPayload: '',
    minTrailerLength: '',
    minRadius: ''
  })

  useEffect(() => {
    let active = true

    async function loadData() {
      setLoadingData(true)
      setDataMsg('')
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const user = sessionData.session?.user || null
        if (!active) return
        setCurrentUser(user)

        const [tradesResult, suppliersResult, workersResult, driversResult, contactResult] = await Promise.all([
          supabase.from('trades').select('id,name').order('name'),
          supabase
            .from('profiles')
            .select('user_id,display_name,business_name,business_address,business_zip,materials_categories,delivery_radius,storefront,bio,role')
            .eq('role', 'supplier'),
          supabase
            .from('profiles')
            .select('user_id,display_name,role,trade_id,home_zip,travel_radius_miles,crew_size,bio,availability_status,category_group,service_tags,equipment_tags')
            .in('role', ['laborer', 'subcontractor', 'contractor']),
          supabase
            .from('profiles')
            .select('user_id,display_name,first_name,last_name,home_zip,vehicle_type,trailer_type,trailer_length,payload_capacity,delivery_radius,bio,service_tags,role')
            .eq('role', 'driver'),
          supabase.from('contact_private').select('user_id,city,email,phone')
        ])

        if (!active) return

        const nextTradesMap = new Map((tradesResult.data || []).map((trade) => [String(trade.id), trade.name]))
        setTradesMap(nextTradesMap)

        const contactMap = new Map((contactResult.data || []).map((row) => [row.user_id, row]))

        setSuppliers((suppliersResult.data || []).map((item) => ({
          ...item,
          materials_categories: normalizeList(item.materials_categories)
        })))

        setWorkers((workersResult.data || []).map((item) => {
          const contact = contactMap.get(item.user_id) || {}
          return {
            ...item,
            city: normalizeText(contact.city),
            trade_name: nextTradesMap.get(String(item.trade_id)) || '',
            service_tags: normalizeList(item.service_tags),
            equipment_tags: normalizeList(item.equipment_tags)
          }
        }))

        setDrivers((driversResult.data || []).map((item) => {
          const contact = contactMap.get(item.user_id) || {}
          const serviceTags = normalizeList(item.service_tags)
          return {
            ...item,
            city: normalizeText(contact.city),
            business_zip: '',
            service_tags: serviceTags,
            support_type: detectDriverSupportType(serviceTags, normalizeText(item.vehicle_type))
          }
        }))
      } catch (error) {
        console.error(error)
        if (!active) return
        setDataMsg('Unable to load Surplox AI tool data right now.')
      } finally {
        if (active) setLoadingData(false)
      }
    }

    loadData()
    return () => {
      active = false
      uploadedFiles.forEach((file) => {
        if (file.previewUrl) URL.revokeObjectURL(file.previewUrl)
      })
    }
  }, [])

  const supplierResults = useMemo(() => {
    return [...suppliers]
      .map((supplier) => ({
        ...supplier,
        matchScore: scoreSupplierMatch(supplier, supplierForm)
      }))
      .filter((supplier) => supplier.matchScore > 0 || !normalizeText(supplierForm.material + supplierForm.zip + supplierForm.query))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 8)
  }, [suppliers, supplierForm])

  const crewResults = useMemo(() => {
    return [...workers]
      .map((worker) => ({
        ...worker,
        matchScore: scoreCrewMatch(worker, crewForm)
      }))
      .filter((worker) => worker.matchScore > 0 || !normalizeText(crewForm.trade + crewForm.zip))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10)
  }, [workers, crewForm])

  const deliveryResults = useMemo(() => {
    return [...drivers]
      .map((driver) => ({
        ...driver,
        matchScore: scoreDeliveryMatch(driver, deliveryForm)
      }))
      .filter((driver) => driver.matchScore > 0 || !normalizeText(deliveryForm.pickupZip + deliveryForm.jobsiteZip))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10)
  }, [drivers, deliveryForm])

  async function handleFilesSelected(event) {
    const files = Array.from(event.target.files || [])
    if (!files.length) return

    setUploading(true)
    setProjectMsg('')

    try {
      const next = []
      for (const file of files) {
        const extraction = await extractTextFromFile(file)
        let storagePath = ''

        if (currentUser) {
          try {
            const safePath = `${currentUser.id}/${Date.now()}-${file.name.replace(/\s+/g, '_')}`
            const { error } = await supabase.storage
              .from('ai-project-files')
              .upload(safePath, file, { cacheControl: '3600', upsert: false })
            if (!error) storagePath = safePath
          } catch (storageError) {
            console.error('AI project file upload skipped:', storageError)
          }
        }

        next.push({
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          type: file.type,
          extractedText: extraction.extractedText,
          extractionType: extraction.extractionType,
          previewUrl: extraction.previewUrl,
          storagePath
        })
      }

      setUploadedFiles((prev) => [...prev, ...next])
      setProjectMsg('Files uploaded into the project analyzer. Review extracted text and run analysis.')
    } catch (error) {
      console.error(error)
      setProjectMsg('Unable to process one or more uploaded files right now.')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  function removeUploadedFile(fileId) {
    setUploadedFiles((prev) => {
      const file = prev.find((item) => item.id === fileId)
      if (file?.previewUrl) URL.revokeObjectURL(file.previewUrl)
      return prev.filter((item) => item.id !== fileId)
    })
  }

  function runProjectAnalysis() {
    const extractedText = uploadedFiles
      .map((file) => file.extractedText)
      .filter(Boolean)
      .join('\n\n')

    const combined = [projectForm.notes, extractedText].filter(Boolean).join('\n\n')
    if (!normalizeText(combined)) {
      setProjectMsg('Add project notes or upload blueprint files before running analysis.')
      return
    }

    const inferred = inferProjectSignals(combined)
    const primaryZip = normalizeText(projectForm.jobsiteZip)
    const suggestedMaterial = inferred.supplierCategories[0] || inferred.materials[0] || 'Concrete'
    const primaryTrade = inferred.trades[0] || 'General Construction'

    setProjectAnalysis({
      ...inferred,
      extractedText,
      projectName: normalizeText(projectForm.projectName) || 'Untitled Project',
      jobsiteZip: primaryZip,
      suggestedMaterial,
      primaryTrade
    })

    setSupplierForm((prev) => ({
      ...prev,
      material: suggestedMaterial,
      zip: primaryZip || prev.zip,
      query: normalizeText(projectForm.projectName)
    }))

    setCrewForm((prev) => ({
      ...prev,
      trade: primaryTrade,
      zip: primaryZip || prev.zip
    }))

    setDeliveryForm((prev) => ({
      ...prev,
      pickupZip: primaryZip || prev.pickupZip,
      jobsiteZip: primaryZip || prev.jobsiteZip
    }))

    setProjectMsg('Project analysis complete. Review trades, crew sizing, suppliers, and delivery matches below.')
  }

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="card rounded-xl" style={{ padding: 28, background: 'linear-gradient(180deg, #f0ecff 0%, #f7f7f2 100%)' }}>
        <div className="badge" style={{ marginBottom: 14, background: '#e8defa', color: '#4d2f82' }}>
          Surplox AI Tools
        </div>
        <div className="h1" style={{ maxWidth: 760 }}>Plan construction work with AI tools built around your Surplox network.</div>
        <p className="muted" style={{ marginTop: 12, maxWidth: 900, fontSize: 17, lineHeight: 1.7 }}>
          This hub now includes Supplier Suggestions, Crew Matching, Delivery Coordination, and a blueprint upload pipeline for Project Analyzer. The upload pipeline accepts blueprint files, extracts text from text-based PDFs and notes, preserves image uploads for review, and feeds those signals into the rest of the Surplox AI stack.
        </p>
        {dataMsg ? (
          <div className="card-soft" style={{ marginTop: 16, background: '#fff4da' }}>{dataMsg}</div>
        ) : null}
      </div>

      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <ToolTab active={activeTool === TOOL_KEYS.analyzer} onClick={() => setActiveTool(TOOL_KEYS.analyzer)}>Project Analyzer</ToolTab>
          <ToolTab active={activeTool === TOOL_KEYS.supplier} onClick={() => setActiveTool(TOOL_KEYS.supplier)}>Supplier Suggestions AI</ToolTab>
          <ToolTab active={activeTool === TOOL_KEYS.crew} onClick={() => setActiveTool(TOOL_KEYS.crew)}>Crew Matching AI</ToolTab>
          <ToolTab active={activeTool === TOOL_KEYS.delivery} onClick={() => setActiveTool(TOOL_KEYS.delivery)}>Delivery Coordination AI</ToolTab>
        </div>
      </div>

      {activeTool === TOOL_KEYS.analyzer ? (
        <div className="grid" style={{ gap: 18 }}>
          <SectionCard title="Real Blueprint Upload + Extraction Pipeline">
            <div className="grid two" style={{ gap: 14 }}>
              <div>
                <div className="muted" style={{ marginBottom: 8 }}>Project name</div>
                <input className="input" value={projectForm.projectName} onChange={(e) => setProjectForm((prev) => ({ ...prev, projectName: e.target.value }))} placeholder="Example: Fort Worth Tilt Wall Warehouse" />
              </div>
              <div>
                <div className="muted" style={{ marginBottom: 8 }}>Jobsite ZIP</div>
                <input className="input" value={projectForm.jobsiteZip} onChange={(e) => setProjectForm((prev) => ({ ...prev, jobsiteZip: e.target.value.replace(/[^\d]/g, '').slice(0, 5) }))} placeholder="76140" />
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <div className="muted" style={{ marginBottom: 8 }}>Upload blueprint files, scope notes, PDFs, images, or text files</div>
              <input className="input" type="file" multiple accept=".pdf,.txt,.csv,.json,.md,image/*" onChange={handleFilesSelected} disabled={uploading} />
              <div className="muted" style={{ marginTop: 8, fontSize: 13 }}>
                Text-based PDFs and note files are extracted automatically. Image files are preserved for review and can be combined with your written scope notes below.
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <div className="muted" style={{ marginBottom: 8 }}>Manual project notes / blueprint observations</div>
              <textarea className="input" value={projectForm.notes} onChange={(e) => setProjectForm((prev) => ({ ...prev, notes: e.target.value }))} placeholder="Paste blueprint scope, room counts, slab notes, framing notes, equipment lists, delivery constraints, or any field observations here." />
            </div>

            {projectMsg ? <div className="card-soft" style={{ marginTop: 14, background: '#fffaf0' }}>{projectMsg}</div> : null}

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
              <button type="button" className="btn primary" onClick={runProjectAnalysis} disabled={uploading || loadingData}>
                {uploading ? 'Processing uploads…' : 'Run Project Analysis'}
              </button>
              <button type="button" className="btn" onClick={() => { setProjectForm({ projectName: '', jobsiteZip: '', notes: '' }); setUploadedFiles([]); setProjectAnalysis(null); setProjectMsg(''); }}>
                Clear Project Inputs
              </button>
            </div>
          </SectionCard>

          {uploadedFiles.length > 0 ? (
            <SectionCard title="Uploaded Blueprint Files">
              <div className="grid" style={{ gap: 14 }}>
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="card-soft" style={{ background: '#ffffff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontWeight: 900 }}>{file.name}</div>
                        <div className="muted" style={{ marginTop: 6 }}>
                          Extraction: {titleCase(file.extractionType.replace(/_/g, ' ')) || 'None'} · {(file.size / 1024).toFixed(1)} KB
                        </div>
                        {file.storagePath ? (
                          <div className="muted" style={{ marginTop: 6 }}>Stored path: {file.storagePath}</div>
                        ) : null}
                      </div>
                      <button type="button" className="btn small" onClick={() => removeUploadedFile(file.id)}>Remove</button>
                    </div>
                    {file.previewUrl ? (
                      <div style={{ marginTop: 12 }}>
                        <img src={file.previewUrl} alt={file.name} style={{ width: '100%', maxHeight: 320, objectFit: 'contain', borderRadius: 18 }} />
                      </div>
                    ) : null}
                    {file.extractedText ? (
                      <div style={{ marginTop: 12 }}>
                        <div className="muted" style={{ marginBottom: 8 }}>Extracted text preview</div>
                        <div className="card-soft" style={{ background: '#f8f8f4', maxHeight: 220, overflowY: 'auto' }}>{file.extractedText.slice(0, 1600)}</div>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </SectionCard>
          ) : null}

          {projectAnalysis ? (
            <SectionCard title="Project Analyzer Output">
              <div className="grid two" style={{ gap: 14 }}>
                <div className="card-soft" style={{ background: '#fffaf0' }}>
                  <div className="card-section-title" style={{ fontSize: 16 }}>Project Summary</div>
                  <p style={{ marginTop: 8, lineHeight: 1.7 }}>{projectAnalysis.summary}</p>
                </div>
                <div className="card-soft" style={{ background: '#eef6ff' }}>
                  <div className="card-section-title" style={{ fontSize: 16 }}>Jobsite Hand-off</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                    <ResultBadge dark>{projectAnalysis.projectName}</ResultBadge>
                    <ResultBadge>ZIP {projectAnalysis.jobsiteZip || 'Not set'}</ResultBadge>
                    <ResultBadge>Primary Trade: {projectAnalysis.primaryTrade}</ResultBadge>
                    <ResultBadge>Supplier Category: {projectAnalysis.suggestedMaterial}</ResultBadge>
                  </div>
                </div>
              </div>

              <div className="grid three" style={{ gap: 14, marginTop: 14 }}>
                <div className="card-soft">
                  <div className="card-section-title" style={{ fontSize: 16 }}>Required Trades</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                    {projectAnalysis.trades.map((item) => <ResultBadge key={item}>{item}</ResultBadge>)}
                  </div>
                </div>
                <div className="card-soft">
                  <div className="card-section-title" style={{ fontSize: 16 }}>Supplier Categories</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                    {projectAnalysis.supplierCategories.length > 0
                      ? projectAnalysis.supplierCategories.map((item) => <ResultBadge key={item}>{item}</ResultBadge>)
                      : <span className="muted">No supplier category signals found yet.</span>}
                  </div>
                </div>
                <div className="card-soft">
                  <div className="card-section-title" style={{ fontSize: 16 }}>Crew Size Suggestions</div>
                  <div className="list" style={{ marginTop: 10 }}>
                    {projectAnalysis.crewSuggestions.length > 0
                      ? projectAnalysis.crewSuggestions.map((item) => <div key={item}>{item}</div>)
                      : <span className="muted">General construction crew planning still needed.</span>}
                  </div>
                </div>
              </div>

              <div className="card-soft" style={{ marginTop: 14, background: '#f8f7ef' }}>
                <div className="card-section-title" style={{ fontSize: 16 }}>Delivery Coordination Notes</div>
                <div className="list" style={{ marginTop: 10 }}>
                  {projectAnalysis.deliveryNotes.map((note) => <div key={note}>{note}</div>)}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
                <button type="button" className="btn small" onClick={() => setActiveTool(TOOL_KEYS.crew)}>Open Crew Matching AI</button>
                <button type="button" className="btn small" onClick={() => setActiveTool(TOOL_KEYS.supplier)}>Open Supplier Suggestions AI</button>
                <button type="button" className="btn small" onClick={() => setActiveTool(TOOL_KEYS.delivery)}>Open Delivery Coordination AI</button>
                <Link className="btn small" to={`/new?type=need_crew${projectAnalysis.jobsiteZip ? `&zip=${projectAnalysis.jobsiteZip}` : ''}`}>Create Need Crew Post</Link>
                <Link className="btn small" to={`/new?category=jobsite_support&support=material_delivery${projectAnalysis.jobsiteZip ? `&zip=${projectAnalysis.jobsiteZip}` : ''}`}>Create Delivery Support Post</Link>
              </div>
            </SectionCard>
          ) : null}
        </div>
      ) : null}

      {activeTool === TOOL_KEYS.supplier ? (
        <SectionCard title="Supplier Suggestions AI">
          <div className="grid three" style={{ gap: 14 }}>
            <div>
              <div className="muted" style={{ marginBottom: 8 }}>Material Category</div>
              <select className="input" value={supplierForm.material} onChange={(e) => setSupplierForm((prev) => ({ ...prev, material: e.target.value }))}>
                {MATERIAL_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div>
              <div className="muted" style={{ marginBottom: 8 }}>Jobsite / Supplier ZIP</div>
              <input className="input" value={supplierForm.zip} onChange={(e) => setSupplierForm((prev) => ({ ...prev, zip: e.target.value.replace(/[^\d]/g, '').slice(0, 5) }))} placeholder="76140" />
            </div>
            <div>
              <div className="muted" style={{ marginBottom: 8 }}>Keyword Search</div>
              <input className="input" value={supplierForm.query} onChange={(e) => setSupplierForm((prev) => ({ ...prev, query: e.target.value }))} placeholder="yard, rebar, ready mix, drywall" />
            </div>
          </div>

          <div className="grid" style={{ gap: 14, marginTop: 16 }}>
            {supplierResults.map((supplier) => (
              <div key={supplier.user_id} className="card-soft" style={{ background: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: 18 }}>{normalizeText(supplier.business_name) || normalizeText(supplier.display_name) || 'Supplier'}</div>
                    <div className="muted" style={{ marginTop: 6 }}>{normalizeText(supplier.business_address) || 'Address not listed'} · ZIP {normalizeText(supplier.business_zip) || '—'}</div>
                  </div>
                  <ResultBadge dark>Match {supplier.matchScore}</ResultBadge>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                  {normalizeList(supplier.materials_categories).map((item) => <ResultBadge key={item}>{item}</ResultBadge>)}
                  {supplier.storefront ? <ResultBadge>Storefront</ResultBadge> : null}
                  {normalizeNumber(supplier.delivery_radius) > 0 ? <ResultBadge>{normalizeNumber(supplier.delivery_radius)} mi delivery</ResultBadge> : null}
                </div>
                <p style={{ marginTop: 10, lineHeight: 1.7 }}>{normalizeText(supplier.bio) || 'Supplier bio not added yet.'}</p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
                  <Link className="btn small primary" to={`/supplier/${supplier.user_id}`}>Open Storefront</Link>
                  <Link className="btn small" to={`/materials?q=${encodeURIComponent(normalizeText(supplier.business_name) || normalizeText(supplier.display_name))}`}>Open in Materials</Link>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      ) : null}

      {activeTool === TOOL_KEYS.crew ? (
        <SectionCard title="Crew Matching AI">
          <div className="grid" style={{ gap: 14 }}>
            <div className="grid three" style={{ gap: 14 }}>
              <div>
                <div className="muted" style={{ marginBottom: 8 }}>Needed Trade</div>
                <input className="input" value={crewForm.trade} onChange={(e) => setCrewForm((prev) => ({ ...prev, trade: e.target.value }))} placeholder="Drywall, Concrete & Flatwork, Electrical" />
              </div>
              <div>
                <div className="muted" style={{ marginBottom: 8 }}>Jobsite ZIP</div>
                <input className="input" value={crewForm.zip} onChange={(e) => setCrewForm((prev) => ({ ...prev, zip: e.target.value.replace(/[^\d]/g, '').slice(0, 5) }))} placeholder="76140" />
              </div>
              <div>
                <div className="muted" style={{ marginBottom: 8 }}>Minimum Crew Size</div>
                <input className="input" type="number" value={crewForm.minCrew} onChange={(e) => setCrewForm((prev) => ({ ...prev, minCrew: e.target.value }))} />
              </div>
            </div>
            <div>
              <div className="muted" style={{ marginBottom: 8 }}>Availability</div>
              <select className="input" value={crewForm.availability} onChange={(e) => setCrewForm((prev) => ({ ...prev, availability: e.target.value }))}>
                <option value="">Any availability</option>
                <option value="available_now">Available Now</option>
                <option value="available_this_week">Available This Week</option>
                <option value="busy">Busy</option>
              </select>
            </div>
          </div>

          <div className="grid" style={{ gap: 14, marginTop: 16 }}>
            {crewResults.map((worker) => {
              const reasons = []
              if (normalizeText(crewForm.trade) && normalizeText(worker.trade_name).toLowerCase().includes(normalizeText(crewForm.trade).toLowerCase())) reasons.push('trade match')
              if (normalizeText(crewForm.zip) && normalizeText(worker.home_zip) === normalizeText(crewForm.zip)) reasons.push('same ZIP')
              if (crewForm.availability && worker.availability_status === crewForm.availability) reasons.push('availability match')
              if (normalizeNumber(worker.crew_size) >= normalizeNumber(crewForm.minCrew)) reasons.push('crew size fit')
              if (normalizeNumber(worker.travel_radius_miles) > 0) reasons.push('travel radius listed')

              return (
                <div key={worker.user_id} className="card-soft" style={{ background: '#ffffff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 18 }}>{normalizeText(worker.display_name) || 'Worker'}</div>
                      <div className="muted" style={{ marginTop: 6 }}>{worker.trade_name || 'Trade not listed'} · ZIP {normalizeText(worker.home_zip) || '—'}</div>
                    </div>
                    <ResultBadge dark>Match {worker.matchScore}</ResultBadge>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                    <ResultBadge>{worker.role}</ResultBadge>
                    <ResultBadge>{worker.availability_status || 'Availability not set'}</ResultBadge>
                    <ResultBadge>Crew {normalizeNumber(worker.crew_size) || 1}</ResultBadge>
                    <ResultBadge>{normalizeNumber(worker.travel_radius_miles)} mi radius</ResultBadge>
                    <ResultBadge>Profile {getProfileStrength(worker)}%</ResultBadge>
                  </div>
                  <p style={{ marginTop: 10, lineHeight: 1.7 }}>{normalizeText(worker.bio) || 'Worker bio not added yet.'}</p>
                  <div className="muted" style={{ marginTop: 8 }}>Why this matched: {reasons.join(', ') || 'basic role + profile fit'}</div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
                    <Link className="btn small primary" to={`/u/${worker.user_id}`}>Open Worker Profile</Link>
                    <Link className="btn small" to={`/new?type=need_crew${normalizeText(crewForm.zip) ? `&zip=${normalizeText(crewForm.zip)}` : ''}`}>Create Need Crew Post</Link>
                  </div>
                </div>
              )
            })}
          </div>
        </SectionCard>
      ) : null}

      {activeTool === TOOL_KEYS.delivery ? (
        <SectionCard title="Delivery Coordination AI">
          <div className="grid three" style={{ gap: 14 }}>
            <div>
              <div className="muted" style={{ marginBottom: 8 }}>Pickup ZIP</div>
              <input className="input" value={deliveryForm.pickupZip} onChange={(e) => setDeliveryForm((prev) => ({ ...prev, pickupZip: e.target.value.replace(/[^\d]/g, '').slice(0, 5) }))} placeholder="Supplier ZIP" />
            </div>
            <div>
              <div className="muted" style={{ marginBottom: 8 }}>Jobsite ZIP</div>
              <input className="input" value={deliveryForm.jobsiteZip} onChange={(e) => setDeliveryForm((prev) => ({ ...prev, jobsiteZip: e.target.value.replace(/[^\d]/g, '').slice(0, 5) }))} placeholder="Jobsite ZIP" />
            </div>
            <div>
              <div className="muted" style={{ marginBottom: 8 }}>Delivery Lane</div>
              <select className="input" value={deliveryForm.supportType} onChange={(e) => setDeliveryForm((prev) => ({ ...prev, supportType: e.target.value }))}>
                {DELIVERY_LANES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid three" style={{ gap: 14, marginTop: 14 }}>
            <div>
              <div className="muted" style={{ marginBottom: 8 }}>Vehicle Type</div>
              <select className="input" value={deliveryForm.vehicleType} onChange={(e) => setDeliveryForm((prev) => ({ ...prev, vehicleType: e.target.value }))}>
                <option value="">Any vehicle</option>
                {Object.entries(VEHICLE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
            <div>
              <div className="muted" style={{ marginBottom: 8 }}>Trailer Type</div>
              <select className="input" value={deliveryForm.trailerType} onChange={(e) => setDeliveryForm((prev) => ({ ...prev, trailerType: e.target.value }))}>
                <option value="">Any trailer</option>
                {Object.entries(TRAILER_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
            <div>
              <div className="muted" style={{ marginBottom: 8 }}>Minimum Payload (lbs)</div>
              <input className="input" type="number" value={deliveryForm.minPayload} onChange={(e) => setDeliveryForm((prev) => ({ ...prev, minPayload: e.target.value }))} />
            </div>
          </div>

          <div className="grid two" style={{ gap: 14, marginTop: 14 }}>
            <div>
              <div className="muted" style={{ marginBottom: 8 }}>Minimum Trailer Length (ft)</div>
              <input className="input" type="number" value={deliveryForm.minTrailerLength} onChange={(e) => setDeliveryForm((prev) => ({ ...prev, minTrailerLength: e.target.value }))} />
            </div>
            <div>
              <div className="muted" style={{ marginBottom: 8 }}>Minimum Delivery Radius (mi)</div>
              <input className="input" type="number" value={deliveryForm.minRadius} onChange={(e) => setDeliveryForm((prev) => ({ ...prev, minRadius: e.target.value }))} />
            </div>
          </div>

          <div className="grid" style={{ gap: 14, marginTop: 16 }}>
            {deliveryResults.map((driver) => (
              <div key={driver.user_id} className="card-soft" style={{ background: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: 18 }}>{normalizeText(driver.display_name) || normalizeText(`${driver.first_name} ${driver.last_name}`) || 'Driver'}</div>
                    <div className="muted" style={{ marginTop: 6 }}>{driver.city || 'City not listed'} · ZIP {normalizeText(driver.home_zip) || '—'}</div>
                  </div>
                  <ResultBadge dark>Match {driver.matchScore}</ResultBadge>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                  <ResultBadge>{DELIVERY_LANES.find((item) => item.value === driver.support_type)?.label || 'Delivery'}</ResultBadge>
                  <ResultBadge>{labelForMap(VEHICLE_LABELS, driver.vehicle_type)}</ResultBadge>
                  <ResultBadge>{labelForMap(TRAILER_LABELS, driver.trailer_type)}</ResultBadge>
                  <ResultBadge>{normalizeNumber(driver.trailer_length) || 0} ft trailer</ResultBadge>
                  <ResultBadge>{normalizeNumber(driver.payload_capacity) || 0} lbs payload</ResultBadge>
                  <ResultBadge>{normalizeNumber(driver.delivery_radius) || 0} mi radius</ResultBadge>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                  {normalizeList(driver.service_tags).map((tag) => <ResultBadge key={tag}>{labelForMap(SERVICE_TAG_LABELS, tag)}</ResultBadge>)}
                </div>
                <p style={{ marginTop: 10, lineHeight: 1.7 }}>{normalizeText(driver.bio) || 'Driver bio not added yet.'}</p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
                  <Link className="btn small primary" to={`/u/${driver.user_id}`}>Open Driver Profile</Link>
                  <Link className="btn small" to={`/new?category=jobsite_support&support=${driver.support_type}${normalizeText(deliveryForm.jobsiteZip) ? `&zip=${normalizeText(deliveryForm.jobsiteZip)}` : ''}`}>Create Delivery Support Post</Link>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      ) : null}
    </div>
  )
}
