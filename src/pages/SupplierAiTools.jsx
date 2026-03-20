import React, { useMemo, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist/build/pdf'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import jsPDF from 'jspdf'
import { autoTable } from 'jspdf-autotable'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()
const OCR_MAX_DIRECT_FILE_SIZE = 4 * 1024 * 1024
const PDF_PAGE_RENDER_ATTEMPTS = [
  { scale: 1.35, quality: 0.76 },
  { scale: 1.1, quality: 0.62 },
  { scale: 0.9, quality: 0.5 },
  { scale: 0.75, quality: 0.42 }
]

async function ocrSingleFile(file, mimeType = '') {
  const fileBase64 = await fileToBase64(file)
  const response = await fetch(API_OCR_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileBase64,
      mimeType: mimeType || file.type || 'application/octet-stream'
    })
  })

  const data = await parseJsonOrTextResponse(response)
  if (!response.ok) {
    const detailText =
      typeof data?.details === 'string'
        ? data.details
        : typeof data?.error === 'string'
          ? data.error
          : 'OCR request failed (server error)'
    throw new Error(detailText)
  }

  return String(data?.extractedText || data?.text || '').trim()
}

async function renderSinglePdfPageToSizedImage(page, pageNum, baseName = 'document') {
  for (const attempt of PDF_PAGE_RENDER_ATTEMPTS) {
    const viewport = page.getViewport({ scale: attempt.scale })
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d', { alpha: false })

    if (!context) throw new Error('Unable to create PDF rendering context.')

    canvas.width = Math.ceil(viewport.width)
    canvas.height = Math.ceil(viewport.height)

    await page.render({ canvasContext: context, viewport }).promise

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (value) => (value ? resolve(value) : reject(new Error(`Failed to rasterize PDF page ${pageNum}.`))),
        'image/jpeg',
        attempt.quality
      )
    })

    canvas.width = 0
    canvas.height = 0

    if (blob.size <= OCR_MAX_DIRECT_FILE_SIZE) {
      return new File([blob], `${baseName}-page-${pageNum}.jpg`, {
        type: 'image/jpeg'
      })
    }
  }

  throw new Error(`PDF page ${pageNum} is still too large for OCR after compression.`)
}

async function renderPdfPagesToImages(file) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const renderedPages = []
  const baseName = file.name.replace(/\.pdf$/i, '') || 'document'

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
    const page = await pdf.getPage(pageNum)
    const sizedFile = await renderSinglePdfPageToSizedImage(page, pageNum, baseName)
    renderedPages.push(sizedFile)
  }

  return renderedPages
}

async function handleLargeFileProcessing(file, mimeType = '') {
  const type = String(mimeType || file?.type || '').toLowerCase()
  const lowerName = String(file?.name || '').toLowerCase()
  const isPdf = type === 'application/pdf' || /\.pdf$/i.test(lowerName)

  if (!isPdf) {
    return await ocrSingleFile(file, type || file.type || 'application/octet-stream')
  }

  const pageFiles = await renderPdfPagesToImages(file)
  const pageResults = []

  for (let index = 0; index < pageFiles.length; index += 1) {
    const pageFile = pageFiles[index]

    if (pageFile.size > OCR_MAX_DIRECT_FILE_SIZE) {
      throw new Error(`PDF page ${index + 1} is still too large for OCR after compression.`)
    }

    const pageText = await ocrSingleFile(pageFile, pageFile.type)
    if (pageText) {
      pageResults.push(`[PAGE ${index + 1}]\n${pageText}`)
    }
  }

  return pageResults.join('\n\n').trim()
}

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
    scopeTargetLabel: 'Your specific scope',
    scopeTargetPlaceholder: 'Example: welding only, framing only, demo only, steel install, finish carpentry...',
    scopeTargetHelp:
      'Tell the analyzer exactly what portion of the bid package you are performing so it can isolate your scope inside the full set.',
    scopeTargetTitle: 'Scope Targeting',
    scopeTargetBody:
      'Use scope targeting when the uploaded bid package includes many trades but you only need to price or execute one portion of the work.',
    scopeFocusTitle: 'Targeted Scope Breakdown',
    scopeFocusSummary: 'Targeted scope summary',
    scopeFocusWork: 'Likely work you are responsible for',
    scopeFocusEvidence: 'Where that scope appears in the package',
    scopeFocusMaterials: 'Likely materials / buyout focus',
    scopeFocusCrew: 'Crew / trade focus',
    scopeFocusRisks: 'Pricing / field checks',
    scopeFocusNoMatch: 'No strong targeted scope match yet. Add clearer scope wording like welding, framing, demo, concrete, drywall, or plumbing.',
    blueprintIntelTitle: 'Blueprint Intelligence',
    blueprintIntelBody:
      'Detect likely sheet titles, scope-relevant plan areas, and likely exclusions from uploaded blueprint text without interrupting the rest of the analyzer workflow.',
    blueprintSheetsTitle: 'Likely Relevant Sheets',
    blueprintSheetsBody:
      'These sheets look most relevant to your selected scope based on sheet labels, nearby detail text, and discipline signals.',
    blueprintSheetsEmpty:
      'No strong scope-to-sheet matches yet. Upload more plan text or tighten your scope target.',
    blueprintDetectedSheets: 'Detected sheets',
    blueprintNoSheets: 'No sheet titles detected yet from the uploaded blueprint text.',
    blueprintMatchScore: 'Sheet match score',
    blueprintDiscipline: 'Discipline',
    blueprintNearbySignals: 'Nearby scope signals',
    blueprintExclusionsTitle: 'Likely Exclusions / Verify Boundaries',
    blueprintExclusionsEmpty:
      'No likely exclusions generated yet. Add a scope target to isolate what should stay out of your bid.',
    blueprintScopeLocationTitle: 'Where Your Scope Appears',
    blueprintScopeLocationBody:
      'These are the strongest page-aware scope hits so you can jump to the likely plan areas that matter most for your bid.',
    blueprintScopeLocationEmpty:
      'No page-aware scope hits yet. Upload more readable plan text or tighten your scope target.',
    blueprintPageLabel: 'Page',
    blueprintEvidenceExcerpt: 'Evidence excerpt',
    uploadLabel: 'Blueprint / document upload',
    uploadHelp:
      'Upload PDF, image, txt, csv, json, or md files. Text-based files extract immediately. OCR can be run on scans and images.',
    runOcr: 'Run Project Analyzer',
    runningOcr: 'Running Project Analyzer…',
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
    engineLaunchpadTitle: 'Project Engine Launchpad',
    engineLaunchpadBody: 'Turn the AI plan into real Surplox actions immediately with one-click handoff into supplier search, crew posts, delivery search, and support requests.',
    engineOpenMessages: 'Open Messages',
    engineOpenFeed: 'Open Feed',
    engineCrewMatches: 'Crew matches',
    engineSupplierMatches: 'Supplier matches',
    engineDeliveryMatches: 'Delivery matches',
    engineRunSummary: 'Engine Summary',
    engineRecommendedNext: 'Best next move',
    engineUseRepair: 'Open Repair Search',
    engineBuildRepairPost: 'Create Repair Post',
    engineNoMaterials: 'No materials plan generated yet.',
    engineNoSignals: 'No scope signals generated yet.',

    fitLabel: 'Fit',
    website: 'Website',
    phone: 'Phone',
    address: 'Address',
    categories: 'Categories',
    rating: 'Rating',
    fileReady: 'File ready',
    fileExtracted: 'Text extracted',
    fileOcrReady: 'OCR ready',
    fileOcrDone: 'OCR complete',
    analyzerBuildMode: 'Build Project Mode',
    analyzerPermitMode: 'Permit Pre-Check Mode',
    permitPrecheckTitle: 'Permit Pre-Check',
    permitReadinessScore: 'Permit readiness score',
    permitDisciplinesDetected: 'Disciplines detected',
    permitMissingDisciplines: 'Missing / weak discipline coverage',
    permitMissingItems: 'Missing items',
    permitUnclearItems: 'Unclear items',
    permitConflictingItems: 'Conflicting items',
    permitEvidenceTitle: 'Evidence highlights',
    permitSegmentTitle: 'Structured extraction',
    permitNoFindings: 'No major permit findings yet.',
    permitNoEvidence: 'No evidence snippets yet.',
    permitNoSegments: 'No structured segments yet.',
    permitReadySummary: 'This package looks materially stronger for intake review.',
    permitNeedsWorkSummary: 'This package still has intake gaps that should be resolved before submission.',
    permitLowSummary: 'This package is not ready for permit intake yet and needs more project data.',
    permitModeBody: 'Switch between build-first execution planning and permit-first intake review without losing the marketplace workflows.',
    projectCreationTitle: 'Create Project From Analysis',
    projectCreationBody: 'Turn this analyzer run into a live admin project record with permit metadata, scope notes, and next-step routing.',
    createProjectHelp: 'This sends the analyzer output into Admin Projects so permit tracking, readiness scoring, and job execution can continue in one workflow.',
    createProjectRecord: 'Create Project Record',
    creatingProjectRecord: 'Creating project record…',
    createProjectSuccess: 'Project record created successfully.',
    createProjectError: 'Unable to create project record right now.',
    openCreatedProject: 'Open Created Project',
    permitRequirementsTitle: 'Permit Requirements',
    permitRequiredPermits: 'Required permits',
    permitMissingInputs: 'Missing inputs',
    permitWarnings: 'Warnings',
    permitNoRequirements: 'No permit requirements generated yet.',
    projectPackageTitle: 'Generated Project Package',
    projectPackageBody: 'Turn the analyzer run into a clean execution package with scope, materials, suppliers, delivery, and permit readiness.',
    projectPackageCopy: 'Copy Project Package',
    projectPackagePdf: 'Download Project Package PDF',
    projectPackageEmpty: 'Run the Project Engine to generate the project package.',
    projectPackageFormatted: 'Formatted package',
    projectPackageSupplierSignals: 'Supplier signals',
    projectPackageDeliveryLane: 'Delivery lane',
    projectPackageScope: 'Scope + profile',
    projectPackageMaterials: 'Materials',
    projectPackagePermits: 'Permit summary',
    projectPackageCopied: 'Project package copied to clipboard.',
    projectPackageCopyError: 'Unable to copy project package right now.',
    projectPackagePdfReady: 'Project package PDF downloaded.',
    projectPackagePdfError: 'Unable to generate project package PDF right now.',
    removeFile: 'Remove File',
    clearFiles: 'Clear Files'
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


const MATERIAL_SYNONYMS = {
  concrete: ['concrete', 'cement', 'footing', 'footings', 'foundation', 'slab', 'flatwork', 'rebar', 'ready mix', 'ready-mix'],
  lumber: ['lumber', 'framing', 'stud', 'plywood', 'osb', 'wood'],
  steel: ['steel', 'metal', 'beam', 'pipe', 'tube', 'rebar', 'fabrication', 'gate', 'bollard'],
  electrical: ['electrical', 'lighting', 'panel', 'conduit', 'wire', 'power'],
  plumbing: ['plumbing', 'pipe', 'piping', 'fixture', 'sanitary', 'water line'],
  drywall: ['drywall', 'sheetrock', 'gypsum'],
  fasteners: ['fasteners', 'anchors', 'bolts', 'screws', 'nails', 'hardware'],
  tools: ['tools', 'tooling'],
  equipment_rental: ['equipment rental', 'rental', 'lift', 'skid steer', 'excavator'],
  safety_equipment: ['safety equipment', 'ppe', 'hard hat', 'vest', 'gloves', 'protection'],
  masonry: ['masonry', 'cmu', 'block', 'brick'],
  site_hardware: ['site hardware', 'bollard', 'fence', 'gate hardware']
}

const MATERIAL_CATEGORY_ALIASES = Object.fromEntries(
  Object.entries(MATERIAL_SYNONYMS).flatMap(([category, values]) =>
    [category, ...values].map((value) => [String(value).toLowerCase(), category])
  )
)

function normalizeMaterialCategory(value = '') {
  const normalized = String(value || '').trim().toLowerCase().replace(/_/g, ' ').replace(/\s+/g, ' ')
  return MATERIAL_CATEGORY_ALIASES[normalized] || normalized
}

function getExpandedMaterialTerms(value = '') {
  const category = normalizeMaterialCategory(value)
  const baseTerms = MATERIAL_SYNONYMS[category] || []
  return Array.from(new Set([category, ...baseTerms].filter(Boolean)))
}

function normalizeSupplierMaterials(list = []) {
  if (!Array.isArray(list)) return []
  return Array.from(
    new Set(
      list
        .map((item) => normalizeMaterialCategory(item))
        .filter(Boolean)
    )
  )
}

function buildSupplierHaystack(supplier = {}) {
  return [
    supplier.business_name,
    supplier.display_name,
    supplier.business_zip,
    supplier.business_address,
    supplier.bio,
    supplier.phone,
    supplier.website_url,
    ...(supplier.materials_categories || [])
  ]
    .join(' ')
    .toLowerCase()
}

function estimateZipClosenessScore(targetZip = '', supplierZip = '') {
  const a = String(targetZip || '').replace(/\D/g, '').slice(0, 5)
  const b = String(supplierZip || '').replace(/\D/g, '').slice(0, 5)

  if (!a || !b) return 0
  if (a === b) return 18
  if (a.slice(0, 3) === b.slice(0, 3)) return 10
  if (a.slice(0, 2) === b.slice(0, 2)) return 6
  return 0
}

function supplierCompletenessScore(supplier = {}) {
  let score = 0
  if (supplier.storefront) score += 4
  if (supplier.bio) score += 3
  if (supplier.phone) score += 2
  if (supplier.website_url) score += 2
  if (Number(supplier.delivery_radius || 0) > 0) score += 3
  if ((supplier.materials_categories || []).length > 0) score += 4
  return score
}

function makeNativeSupplierCandidate(item = {}) {
  return {
    id: item.user_id,
    source: 'native',
    external_id: null,
    user_id: item.user_id || null,
    display_name: String(item.display_name || '').trim(),
    business_name: String(item.business_name || item.display_name || '').trim(),
    business_address: String(item.business_address || '').trim(),
    business_zip: String(item.business_zip || '').trim(),
    delivery_radius: Number(item.delivery_radius || 0) || 0,
    materials_categories: normalizeSupplierMaterials(item.materials_categories),
    storefront: Boolean(item.storefront),
    bio: String(item.bio || '').trim(),
    phone: '',
    website_url: ''
  }
}

function makeImportedSupplierCandidate(item = {}) {
  return {
    id: item.id || item.external_id,
    source: 'imported',
    external_id: item.external_id || String(item.id || ''),
    user_id: null,
    display_name: String(item.display_name || item.business_name || '').trim(),
    business_name: String(item.business_name || item.display_name || '').trim(),
    business_address: String(item.business_address || '').trim(),
    business_zip: String(item.business_zip || '').trim(),
    delivery_radius: Number(item.delivery_radius || 0) || 0,
    materials_categories: normalizeSupplierMaterials(item.materials_categories),
    storefront: Boolean(item.storefront),
    bio: String(item.bio || '').trim(),
    phone: String(item.phone || '').trim(),
    website_url: String(item.website_url || '').trim()
  }
}

function scoreSupplierCandidate(supplier = {}, material = '', zip = '') {
  const normalizedMaterial = normalizeMaterialCategory(material)
  const expandedTerms = getExpandedMaterialTerms(normalizedMaterial)
  const supplierCategories = normalizeSupplierMaterials(supplier.materials_categories)
  const haystack = buildSupplierHaystack(supplier)

  let score = 0

  if (supplierCategories.includes(normalizedMaterial)) {
    score += 30
  } else if (expandedTerms.some((term) => haystack.includes(String(term).toLowerCase()))) {
    score += 18
  }

  score += estimateZipClosenessScore(zip, supplier.business_zip)
  score += supplierCompletenessScore(supplier)
  score += Math.min(Number(supplier.delivery_radius || 0), 150) / 8

  if (supplier.source === 'native') score += 5
  return Math.round(score)
}

async function fetchSupplierCandidates() {
  const [nativeResponse, importedResponse] = await Promise.all([
    supabase
      .from('profiles')
      .select(`
        user_id,
        display_name,
        business_name,
        business_address,
        business_zip,
        delivery_radius,
        materials_categories,
        storefront,
        bio,
        role
      `)
      .eq('role', 'supplier'),
    supabase
      .from('external_suppliers')
      .select(`
        id,
        external_id,
        display_name,
        business_name,
        business_address,
        business_zip,
        delivery_radius,
        materials_categories,
        storefront,
        bio,
        phone,
        website_url
      `)
  ])

  if (nativeResponse.error) throw nativeResponse.error
  if (importedResponse.error && importedResponse.error.code !== 'PGRST116') throw importedResponse.error

  const nativeSuppliers = (nativeResponse.data || []).map(makeNativeSupplierCandidate)
  const importedSuppliers = (importedResponse.data || []).map(makeImportedSupplierCandidate)

  return Array.from(
    new Map(
      [...nativeSuppliers, ...importedSuppliers].map((item) => {
        const key = `${String(item.business_name || '').trim().toLowerCase()}::${String(item.business_zip || '').trim()}`
        return [key, item]
      })
    ).values()
  )
}



function getMatchReasons(supplier, material, zip) {
  const reasons = []
  const mat = (material || '').toLowerCase()

  if ((supplier.materials_categories || []).some(m => String(m).toLowerCase().includes(mat))) {
    reasons.push("Matches material")
  }

  if (supplier.business_zip && zip && supplier.business_zip.slice(0,3) === zip.slice(0,3)) {
    reasons.push("Near project ZIP")
  }

  if (supplier.delivery_radius && Number(supplier.delivery_radius) > 0) {
    reasons.push("Offers delivery")
  }

  if (supplier.storefront) {
    reasons.push("Verified storefront")
  }

  return reasons.slice(0,3)
}
function matchSuppliersToMaterial(materialItem, supplierPool = [], zip = '') {
  const label = materialItem?.label || titleCase(materialItem?.material || '')
  const ranked = supplierPool
    .map((supplier) => ({
      ...supplier,
      match_score: scoreSupplierCandidate(supplier, label, zip)
    }))
    .filter((supplier) => supplier.match_score > 0)
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 4)

  return {
    material: materialItem?.material || normalizeMaterialCategory(label),
    label,
    suppliers: ranked
  }
}


const EMBEDDED_PERMIT_META_START = '[[SURPLOX_PROJECT_META_START]]'
const EMBEDDED_PERMIT_META_END = '[[SURPLOX_PROJECT_META_END]]'

function normalizePermitMetadata(value = {}) {
  const permitTypes = Array.isArray(value.permit_types)
    ? value.permit_types.map((item) => String(item || '').trim()).filter(Boolean)
    : []

  const scopes = Array.isArray(value.scopes)
    ? value.scopes.map((item) => String(item || '').trim()).filter(Boolean)
    : []

  return {
    location_city: String(value.location_city || '').trim(),
    location_county: String(value.location_county || '').trim(),
    location_state: String(value.location_state || 'TX').trim() || 'TX',
    location_zip: String(value.location_zip || '').replace(/\D/g, '').slice(0, 5),
    project_type: String(value.project_type || '').trim(),
    square_footage: String(value.square_footage || '').trim(),
    estimated_value: String(value.estimated_value || '').trim(),
    scopes,
    permit_required: value.permit_required !== false,
    permit_status: String(value.permit_status || 'not_started').trim() || 'not_started',
    jurisdiction: String(value.jurisdiction || '').trim(),
    permit_types: permitTypes,
    intake_notes: String(value.intake_notes || '').trim()
  }
}

function mergePermitMetadataIntoNotes(visibleNotes = '', permitMeta = {}) {
  const cleanVisibleNotes = String(visibleNotes || '').trim()
  const metadataBlock = `${EMBEDDED_PERMIT_META_START}\n${JSON.stringify(normalizePermitMetadata(permitMeta), null, 2)}\n${EMBEDDED_PERMIT_META_END}`
  return cleanVisibleNotes ? `${cleanVisibleNotes}\n\n${metadataBlock}` : metadataBlock
}

function inferProjectTypeFromScope(summary = {}) {
  const scope = String(summary?.detectedScope || summary?.summary || '').toLowerCase()
  if (scope.includes('warehouse') || scope.includes('industrial')) return 'industrial'
  if (scope.includes('office')) return 'commercial'
  if (scope.includes('multifamily') || scope.includes('apartment')) return 'residential'
  if (scope.includes('site')) return 'civil_site'
  if (scope.includes('interior') || scope.includes('tenant')) return 'tenant_improvement'
  if (scope.includes('remodel') || scope.includes('renovation')) return 'remodel'
  return 'commercial'
}

function inferPermitTypesFromAnalysis(summary = {}, detailSummary = {}, fullText = '') {
  const lower = String(fullText || '').toLowerCase()
  const permitTypes = []

  if ((summary.trades || []).some((item) => ['concrete', 'steel', 'framing', 'drywall', 'roofing', 'sitework'].includes(item)) || /building|framing|roof|tenant|office|warehouse|apartment|multifamily/.test(lower)) {
    permitTypes.push('Building')
  }
  if ((summary.trades || []).some((item) => ['concrete', 'steel', 'masonry'].includes(item)) || detailSummary.footingNotes?.length || detailSummary.cmuSizes?.length || /structural|footing|foundation|rebar|cmu|masonry/.test(lower)) {
    permitTypes.push('Structural')
  }
  if ((summary.trades || []).includes('electrical') || /electrical|lighting|panel|power|conduit/.test(lower)) {
    permitTypes.push('Electrical')
  }
  if ((summary.trades || []).includes('plumbing') || /plumbing|sanitary|water line|fixture|pipe/.test(lower)) {
    permitTypes.push('Plumbing')
  }
  if ((summary.trades || []).includes('hvac') || /mechanical|hvac|duct|air handler/.test(lower)) {
    permitTypes.push('Mechanical')
  }
  if (/fire|sprinkler|alarm/.test(lower)) {
    permitTypes.push('Fire')
  }
  if (/site|grading|drainage|paving|parking|civil|bollard/.test(lower) || (summary.trades || []).includes('sitework')) {
    permitTypes.push('Site / Civil')
  }
  if (/ada|accessible|accessibility/.test(lower)) {
    permitTypes.push('Accessibility')
  }

  return uniqueList(permitTypes)
}

function getPermitRequirements({ projectSummary = {}, projectDetailSummary = {}, fullText = '' }) {
  const lower = String(fullText || '').toLowerCase()
  const required_permits = inferPermitTypesFromAnalysis(projectSummary, projectDetailSummary, fullText)
  const missing_inputs = []
  const warnings = []

  if (!extractZipFromText(fullText)) missing_inputs.push('Project ZIP / jurisdiction seed is missing.')
  if (!extractSquareFeet(fullText)) missing_inputs.push('Square footage is missing or not clearly extracted.')
  if (!(projectSummary.primaryTrades || []).length) missing_inputs.push('High-confidence primary trades are missing.')
  if (!(projectSummary.materials || []).length) warnings.push('Materials list is still light and may miss permit triggers.')
  if (!projectDetailSummary.dimensions?.length) warnings.push('No clear dimensions extracted yet.')
  if (projectDetailSummary.verification?.length) warnings.push(...projectDetailSummary.verification)
  if (!required_permits.length) warnings.push('No permit lanes were confidently inferred yet.')

  return {
    required_permits: uniqueList(required_permits),
    missing_inputs: uniqueList(missing_inputs).slice(0, 8),
    warnings: uniqueList(warnings).slice(0, 8)
  }
}


function normalizeScopeTarget(value = '') {
  return String(value || '').trim().toLowerCase()
}

function buildScopeKeywordMap() {
  return {
    welding: ['welding', 'welder', 'weld', 'metal fabric', 'metal fabrication', 'steel weld', 'plate', 'angle iron'],
    steel: ['steel', 'metal', 'beam', 'column', 'tube steel', 'gate post', 'bollard', 'fabrication'],
    framing: ['framing', 'frame', 'stud', 'wood framing', 'metal stud', 'track', 'joist', 'blocking'],
    demo: ['demo', 'demolition', 'remove', 'removal', 'sawcut', 'cut and remove', 'tear out', 'existing to be removed'],
    concrete: ['concrete', 'footing', 'slab', 'flatwork', 'foundation', 'dowels', 'rebar', 'form and pour'],
    masonry: ['masonry', 'cmu', 'block', 'brick', 'bond beam', 'grout'],
    drywall: ['drywall', 'sheetrock', 'gypsum', 'tape and bed'],
    electrical: ['electrical', 'lighting', 'panel', 'conduit', 'wire', 'power'],
    plumbing: ['plumbing', 'sanitary', 'water line', 'fixture', 'pipe', 'piping'],
    hvac: ['hvac', 'mechanical', 'duct', 'air handler', 'rtu'],
    roofing: ['roof', 'roofing', 'flashing', 'membrane'],
    sitework: ['site', 'grading', 'drainage', 'paving', 'asphalt', 'striping', 'bollard'],
    paint: ['paint', 'painting', 'coating', 'finish paint'],
    carpentry: ['carpentry', 'finish carpentry', 'casework', 'millwork', 'trim']
  }
}

function inferScopeTradeFromTarget(scopeTarget = '') {
  const target = normalizeScopeTarget(scopeTarget)
  if (!target) return ''
  const keywordMap = buildScopeKeywordMap()

  for (const [trade, terms] of Object.entries(keywordMap)) {
    if (target === trade || terms.some((term) => target.includes(term))) return trade
  }
  return target.split(/\s+/)[0] || ''
}

function buildTargetedScopeAnalysis({
  scopeTarget = '',
  fullText = '',
  structuredSegments = [],
  projectSummary = {},
  projectDetailSummary = {}
}) {
  const requestedScope = String(scopeTarget || '').trim()
  const normalizedTarget = inferScopeTradeFromTarget(requestedScope)
  if (!requestedScope) {
    return {
      requestedScope: '',
      normalizedTarget: '',
      matchScore: 0,
      summary: '',
      workTypes: [],
      materials: [],
      crewFocus: [],
      evidence: [],
      risks: [],
      targetedSummary: null
    }
  }

  const keywordMap = buildScopeKeywordMap()
  const targetKeywords = Array.from(new Set([
    normalizedTarget,
    ...(keywordMap[normalizedTarget] || []),
    requestedScope.toLowerCase()
  ].filter(Boolean)))

  const relevantSegments = structuredSegments
    .filter((segment) => {
      const haystack = `${segment.snippet} ${segment.discipline} ${segment.segmentType}`.toLowerCase()
      return targetKeywords.some((term) => haystack.includes(String(term).toLowerCase()))
    })
    .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
    .slice(0, 10)

  const lower = String(fullText || '').toLowerCase()
  let matchScore = 0
  if (relevantSegments.length) matchScore += Math.min(relevantSegments.length * 12, 60)
  if ((projectSummary.trades || []).includes(normalizedTarget)) matchScore += 20
  if ((projectSummary.primaryTrades || []).includes(normalizedTarget)) matchScore += 15
  if ((projectSummary.secondaryTrades || []).includes(normalizedTarget)) matchScore += 10
  if (targetKeywords.some((term) => lower.includes(term))) matchScore += 15
  matchScore = Math.max(0, Math.min(100, matchScore))

  const workTypeMap = {
    welding: ['field welds', 'steel connections', 'fabrication / fit-up', 'install and weld steel components'],
    steel: ['steel install', 'post / plate install', 'metal fabrication', 'anchor / hardware alignment'],
    framing: ['layout and frame walls', 'install studs / track', 'blocking and backing', 'framing coordination'],
    demo: ['sawcut / remove existing work', 'selective demolition', 'haul-off coordination', 'protect adjacent finishes'],
    concrete: ['excavation and layout', 'formwork / reinforcement', 'pour and finish concrete', 'dowels / footing tie-in'],
    masonry: ['lay CMU / block', 'grout / reinforce walls', 'bond beam work', 'layout and alignment'],
    drywall: ['hang board', 'tape / bed / finish', 'patch and repair', 'coordinate framing backing'],
    electrical: ['rough-in conduit / wire', 'device / fixture install', 'panel / power tie-in', 'electrical coordination'],
    plumbing: ['rough-in piping', 'fixture connections', 'water / sanitary tie-ins', 'plumbing coordination'],
    hvac: ['duct install', 'equipment set', 'mechanical rough-in', 'startup coordination'],
    roofing: ['tear-off / prep', 'membrane / flashing install', 'penetration detailing'],
    sitework: ['layout and excavation', 'drainage / paving scope', 'site protection / traffic control'],
    paint: ['surface prep', 'prime / paint finish', 'touch-up and punchlist'],
    carpentry: ['install trim / millwork', 'finish details', 'blocking / backing / hardware prep']
  }

  const materialMap = {
    welding: ['steel', 'site_hardware', 'fasteners'],
    steel: ['steel', 'site_hardware', 'fasteners'],
    framing: ['lumber', 'fasteners', 'tools'],
    demo: ['equipment_rental', 'safety_equipment', 'tools'],
    concrete: ['concrete', 'steel', 'fasteners'],
    masonry: ['masonry', 'concrete', 'steel'],
    drywall: ['drywall', 'fasteners', 'tools'],
    electrical: ['electrical', 'fasteners'],
    plumbing: ['plumbing', 'fasteners'],
    hvac: ['tools', 'fasteners'],
    roofing: ['fasteners', 'safety_equipment'],
    sitework: ['equipment_rental', 'safety_equipment', 'site_hardware'],
    paint: ['tools', 'safety_equipment'],
    carpentry: ['lumber', 'fasteners', 'tools']
  }

  const riskMap = {
    welding: ['Confirm all weld symbols, steel sizes, and finish / coating requirements.', 'Verify field measurements before fabrication.', 'Confirm whether galvanizing, touch-up, or primer is required.'],
    steel: ['Verify base plates, anchor locations, and hardware counts.', 'Confirm embed / anchor conditions and tolerances.'],
    framing: ['Verify wall heights, stud gauges, and backing locations.', 'Confirm openings, headers, and coordination with MEP trades.'],
    demo: ['Confirm demo limits and what remains in place.', 'Verify haul-off, disposal, and slab / utility protection requirements.'],
    concrete: ['Confirm footing sizes, reinforcement, and dowel requirements.', 'Verify excavation conditions and subgrade assumptions.'],
    masonry: ['Confirm CMU type, texture / finish, and reinforcement schedule.', 'Verify wall heights, grout, and bond beam requirements.'],
    drywall: ['Confirm board type, finish level, and moisture / fire ratings.', 'Verify framing readiness before board install.'],
    electrical: ['Confirm panel schedules, homeruns, and fixture counts.', 'Verify permitting, shutdowns, and power availability.'],
    plumbing: ['Confirm fixture schedule, piping material, and tie-in points.', 'Verify shutoff coordination and inspection sequence.'],
    hvac: ['Confirm equipment tags, curb / hanger details, and controls scope.', 'Verify startup / balance responsibilities.'],
    roofing: ['Verify warranty requirements, flashing details, and penetration scope.'],
    sitework: ['Verify grading / drainage slopes and tie-in elevations.', 'Confirm traffic control and site access assumptions.'],
    paint: ['Verify substrate condition and prep requirements.', 'Confirm final color / finish schedule.'],
    carpentry: ['Verify finish details, dimensions, and hardware coordination.']
  }

  const evidence = relevantSegments.map((segment) => ({
    sourceFile: segment.sourceFile,
    snippet: segment.snippet,
    confidence: segment.confidence,
    discipline: segment.discipline
  }))

  const workTypes = (workTypeMap[normalizedTarget] || [`${titleCase(requestedScope)} execution`, 'layout and field verification']).slice(0, 4)
  const materials = uniqueList([
    ...(materialMap[normalizedTarget] || []),
    ...((projectSummary.materials || []).filter((item) => targetKeywords.some((term) => String(item).toLowerCase().includes(term))))
  ]).slice(0, 5)

  const crewFocus = uniqueList([
    normalizedTarget,
    ...((projectSummary.primaryTrades || []).filter((item) => item === normalizedTarget)),
    ...((projectSummary.secondaryTrades || []).filter((item) => item === normalizedTarget))
  ]).filter(Boolean)

  const risks = uniqueList([
    ...(riskMap[normalizedTarget] || ['Confirm exact scope limits, exclusions, and sheet references before bidding.']),
    ...(projectDetailSummary.verification || []).slice(0, 2)
  ]).slice(0, 5)

  const targetedSummary = {
    ...projectSummary,
    detectedScope: `${projectSummary.detectedScope || 'project'} · ${titleCase(requestedScope)} scope`,
    summary: relevantSegments.length
      ? `${titleCase(requestedScope)} scope isolated from the broader bid package.`
      : `${titleCase(requestedScope)} scope requested, but stronger plan evidence is still needed.`,
    why: uniqueList([
      `Scope target set to ${titleCase(requestedScope)}.`,
      ...(relevantSegments.length
        ? [`Found ${relevantSegments.length} plan / OCR segments tied to this scope.`]
        : ['No strong direct scope hits were found yet in the uploaded package.']),
      ...((projectSummary.why || []).slice(0, 2))
    ]),
    primaryTrades: crewFocus.length ? crewFocus : projectSummary.primaryTrades || [],
    secondaryTrades: (projectSummary.secondaryTrades || []).filter((item) => item !== normalizedTarget),
    materials: materials.length ? materials : projectSummary.materials || [],
    nextActions: uniqueList([
      `Price only the ${titleCase(requestedScope)} portion of the package.`,
      'Pull matching detail lines, dimensions, and schedule references into your bid notes.',
      'Verify exclusions so you do not carry adjacent trades by mistake.',
      ...((projectSummary.nextActions || []).slice(0, 2))
    ])
  }

  return {
    requestedScope,
    normalizedTarget,
    matchScore,
    summary: targetedSummary.summary,
    workTypes,
    materials,
    crewFocus,
    evidence,
    risks,
    targetedSummary
  }
}



function detectSheetsFromText(text = '') {
  const lines = String(text || '').split(/\r?\n/)
  const results = []
  const seen = new Set()
  let currentPage = 1

  lines.forEach((rawLine, index) => {
    const line = String(rawLine || '').trim()
    if (!line) return

    const pageMatch =
      line.match(/\bpage\s*(\d{1,4})\b/i) ||
      line.match(/^\s*(\d{1,4})\s*\/\s*\d{1,4}\s*$/) ||
      line.match(/^\s*sheet\s*(\d{1,4})\s*$/i)

    if (pageMatch) {
      const parsed = parseInt(pageMatch[1] || String(pageMatch[0] || '').replace(/\D/g, ''), 10)
      if (Number.isFinite(parsed) && parsed > 0) currentPage = parsed
    }

    const normalized = normalizeSourceText(line)
    if (!normalized) return

    const matchers = [
      normalized.match(/\b([A-Z]{1,3}\d{1,2}\.\d{2})\b\s*[\-–:]?\s*(.+)/),
      normalized.match(/\b(SHEET\s+[A-Z]{1,3}\d{1,2}\.\d{2})\b\s*[\-–:]?\s*(.+)/i),
      normalized.match(/\b([A-Z]-?\d{1,2}\.\d{2})\b\s*[\-–:]?\s*(.+)/)
    ].filter(Boolean)

    if (!matchers.length) return
    const match = matchers[0]
    const rawNumber = String(match[1] || '').replace(/^sheet\s+/i, '').trim()
    const rawTitle = String(match[2] || '').trim()

    if (!rawNumber || !rawTitle) return
    const key = `${rawNumber}::${rawTitle}`.toLowerCase()
    if (seen.has(key)) return
    seen.add(key)

    results.push({
      id: `sheet-${results.length}`,
      sheetNumber: rawNumber,
      sheetTitle: rawTitle,
      lineIndex: index,
      page: currentPage,
      discipline: inferDisciplineFromText(`${rawNumber} ${rawTitle}`)
    })
  })

  return results.slice(0, 40)
}

function buildBlueprintScopeMatches({
  scopeTarget = '',
  extractedText = '',
  detectedSheets = [],
  projectSummary = {},
  structuredSegments = []
}) {
  const requestedScope = normalizeScopeTarget(scopeTarget)
  if (!requestedScope || !detectedSheets.length) return []

  const lines = String(extractedText || '').split(/\r?\n/)
  const keywordMap = buildScopeKeywordMap()
  const normalizedTarget = inferScopeTradeFromTarget(requestedScope)
  const targetKeywords = Array.from(
    new Set([
      requestedScope,
      normalizedTarget,
      ...(keywordMap[normalizedTarget] || []),
      ...requestedScope.split(/\s+/)
    ].filter(Boolean))
  )

  return detectedSheets
    .map((sheet, index) => {
      const nextLineIndex =
        index < detectedSheets.length - 1 ? detectedSheets[index + 1].lineIndex : Math.min(lines.length, sheet.lineIndex + 40)
      const nearbyLines = lines
        .slice(sheet.lineIndex, Math.max(sheet.lineIndex + 1, nextLineIndex))
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 40)

      const nearbyText = nearbyLines.join(' ').toLowerCase()
      let score = 0

      targetKeywords.forEach((term) => {
        const normalized = String(term || '').toLowerCase()
        if (!normalized) return
        if (nearbyText.includes(normalized)) score += normalized === requestedScope ? 30 : 12
        if (String(sheet.sheetTitle || '').toLowerCase().includes(normalized)) score += 18
      })

      if ((projectSummary.primaryTrades || []).includes(normalizedTarget)) score += 10
      if ((projectSummary.secondaryTrades || []).includes(normalizedTarget)) score += 6
      if (sheet.discipline === inferDisciplineFromText(normalizedTarget)) score += 8

      const nearbySignals = uniqueList(
        nearbyLines.filter((line) =>
          targetKeywords.some((term) => String(line).toLowerCase().includes(String(term).toLowerCase()))
        )
      ).slice(0, 4)

      return {
        ...sheet,
        score,
        nearbySignals,
        excerpt: nearbyLines.slice(0, 8).join(' '),
      }
    })
    .filter((sheet) => sheet.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
}

function buildPageAwareMatches({
  scopeTarget = '',
  extractedText = '',
  detectedSheets = [],
  projectSummary = {}
}) {
  const requestedScope = normalizeScopeTarget(scopeTarget)
  if (!requestedScope || !detectedSheets.length) return []

  const lines = String(extractedText || '').split(/\r?\n/)
  const keywordMap = buildScopeKeywordMap()
  const normalizedTarget = inferScopeTradeFromTarget(requestedScope)
  const targetKeywords = Array.from(
    new Set([
      requestedScope,
      normalizedTarget,
      ...(keywordMap[normalizedTarget] || []),
      ...requestedScope.split(/\s+/)
    ].filter(Boolean))
  )

  return detectedSheets
    .map((sheet, index) => {
      const nextLineIndex =
        index < detectedSheets.length - 1 ? detectedSheets[index + 1].lineIndex : Math.min(lines.length, sheet.lineIndex + 60)
      const nearbyLines = lines
        .slice(sheet.lineIndex, Math.max(sheet.lineIndex + 1, nextLineIndex))
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 60)

      const nearbyText = nearbyLines.join(' ').toLowerCase()
      let score = 0

      targetKeywords.forEach((term) => {
        const normalized = String(term || '').toLowerCase()
        if (!normalized) return
        if (nearbyText.includes(normalized)) score += normalized === requestedScope ? 30 : 12
        if (String(sheet.sheetTitle || '').toLowerCase().includes(normalized)) score += 18
      })

      if ((projectSummary.primaryTrades || []).includes(normalizedTarget)) score += 10
      if ((projectSummary.secondaryTrades || []).includes(normalizedTarget)) score += 6

      const evidenceLine =
        nearbyLines.find((line) =>
          targetKeywords.some((term) => String(line).toLowerCase().includes(String(term).toLowerCase()))
        ) || nearbyLines[0] || ''

      return {
        ...sheet,
        score,
        evidenceExcerpt: evidenceLine,
        evidenceBlock: nearbyLines.slice(0, 8).join(' ')
      }
    })
    .filter((sheet) => sheet.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
}

function buildLikelyExclusions({
  scopeTarget = '',
  projectSummary = {},
  targetedScopeAnalysis = {}
}) {
  const normalizedTarget = inferScopeTradeFromTarget(scopeTarget)
  if (!normalizedTarget) return []

  const tradeExclusionMap = {
    welding: ['Do not carry concrete, CMU, roofing, or finish trades unless specifically called out.', 'Verify whether shop fabrication, galvanizing, and touch-up paint are excluded or delegated.'],
    steel: ['Do not carry concrete footings, masonry, or adjacent finish scopes unless specifically called out.', 'Verify who owns embeds, anchors, and final coating requirements.'],
    framing: ['Do not carry drywall finish, paint, MEP rough-in, or casework unless specifically called out.', 'Verify backing vs. finish carpentry boundaries.'],
    demo: ['Do not carry rebuild, patch-back, utility reroutes, or hazardous disposal unless specifically called out.', 'Verify who owns haul-off, dump fees, and temporary protection.'],
    concrete: ['Do not carry reinforcing fabrication, masonry, steel install, or site striping unless specifically called out.', 'Verify excavation, subgrade prep, and sawcut / dowel boundaries.'],
    masonry: ['Do not carry structural concrete, steel fabrication, or gate hardware unless specifically called out.', 'Verify grout, reinforcing, and finish block texture responsibilities.'],
    drywall: ['Do not carry framing, insulation, paint, or specialty ceilings unless specifically called out.', 'Verify finish level and patch scope boundaries.'],
    electrical: ['Do not carry low-voltage, fire alarm, controls, or utility company work unless specifically called out.', 'Verify who owns trenching, core drilling, and temporary power.'],
    plumbing: ['Do not carry civil utility tie-ins, concrete patch-back, or mechanical controls unless specifically called out.', 'Verify permits, shutdowns, and fixture owner-furnished items.'],
    hvac: ['Do not carry controls, electrical feeders, roof patching, or structural supports unless specifically called out.', 'Verify startup, TAB, and curb / penetration responsibilities.'],
    roofing: ['Do not carry decking repair, structural steel, sheet metal trim beyond listed details, or MEP curb work unless specifically called out.', 'Verify warranty, tear-off, and patch boundary assumptions.'],
    sitework: ['Do not carry vertical building scopes, building MEP, or landscape unless specifically called out.', 'Verify survey, export, haul-off, and traffic control boundaries.'],
    paint: ['Do not carry substrate repair, drywall finish, or specialty coatings unless specifically called out.', 'Verify prep level and who owns masking / protection.'],
    carpentry: ['Do not carry framing, drywall finish, flooring, or final hardware unless specifically called out.', 'Verify millwork supply vs install boundaries.']
  }

  const exclusions = [
    ...(tradeExclusionMap[normalizedTarget] || []),
    ...((projectSummary.secondaryTrades || [])
      .filter((item) => item && item !== normalizedTarget)
      .slice(0, 4)
      .map((item) => `Verify whether ${titleCase(item)} is excluded from your ${titleCase(normalizedTarget)} bid scope.`)),
    ...((targetedScopeAnalysis.risks || []).slice(0, 2).map((item) => `Boundary check: ${item}`))
  ]

  return uniqueList(exclusions).slice(0, 8)
}


function buildProjectRecordFromAnalysis({ scopeText = '', projectSummary = {}, projectDetailSummary = {}, detectedZip = '', supplierForm = {}, projectEngine = null }) {
  const permitRequirements = getPermitRequirements({ projectSummary, projectDetailSummary, fullText: scopeText })
  const permitTypes = permitRequirements.required_permits
  const projectType = inferProjectTypeFromScope(projectSummary)
  const squareFeet = extractSquareFeet(scopeText)
  const primaryZip = detectedZip || extractZipFromText(scopeText) || supplierForm.zip || ''
  const primaryScopeLabel = titleCase(projectSummary.detectedScope || projectSummary.summary || 'Project')
  const projectName = `${primaryScopeLabel}${primaryZip ? ` - ${primaryZip}` : ''}`.slice(0, 120)

  const visibleNotes = [
    `Analyzer summary: ${projectSummary.summary || 'General construction project'}`,
    projectSummary.why?.length ? `Why: ${projectSummary.why.join(' | ')}` : '',
    projectSummary.primaryTrades?.length ? `Primary trades: ${projectSummary.primaryTrades.map(titleCase).join(', ')}` : '',
    projectSummary.materials?.length ? `Likely materials: ${projectSummary.materials.map(titleCase).join(', ')}` : '',
    projectDetailSummary.dimensions?.length ? `Dimensions: ${projectDetailSummary.dimensions.slice(0, 10).join(', ')}` : '',
    projectSummary.nextActions?.length ? `Analyzer next actions: ${projectSummary.nextActions.join(' | ')}` : '',
    projectEngine?.recommendedNext ? `Recommended next move: ${projectEngine.recommendedNext}` : '',
    scopeText ? `Source scope text:\n${scopeText.slice(0, 5000)}` : ''
  ].filter(Boolean).join('\n\n')

  const permitMeta = normalizePermitMetadata({
    location_zip: primaryZip,
    location_state: supplierForm.state || 'TX',
    project_type: projectType,
    square_footage: squareFeet ? String(squareFeet) : '',
    scopes: uniqueList([...(projectSummary.trades || []), ...(projectSummary.primaryTrades || []), ...(projectSummary.secondaryTrades || [])]).map(titleCase),
    permit_required: true,
    permit_status: 'not_started',
    jurisdiction: '',
    permit_types: permitTypes,
    intake_notes: [
      projectSummary.fieldChecks?.length ? `Analyzer field checks: ${projectSummary.fieldChecks.join(' | ')}` : '',
      permitRequirements.missing_inputs.length ? `Missing inputs: ${permitRequirements.missing_inputs.join(' | ')}` : '',
      permitRequirements.warnings.length ? `Warnings: ${permitRequirements.warnings.join(' | ')}` : ''
    ].filter(Boolean).join(' || ')
  })

  return {
    project: projectName,
    company: '',
    notes: mergePermitMetadataIntoNotes(visibleNotes, permitMeta),
    project_status: 'lead',
    project_phase: 'permit intake',
    project_next_action: projectEngine?.recommendedNext || 'Review analyzer-created project record and continue permit intake.',
    is_active_job: false
  }
}

function scoreScope(text = '') {
  const raw = String(text || '')
  const lower = raw.toLowerCase()

  const repeatedCount = (needle) => {
    const matches = lower.match(new RegExp(needle, 'g'))
    return matches ? matches.length : 0
  }

  const hasAny = (values = []) => values.some((value) => lower.includes(value))

  const scopeSignals = {
    trashEnclosure:
      repeatedCount('trash enclosure') * 4 +
      repeatedCount('trash enclosure plan') * 6 +
      repeatedCount('trash enclosure elevation') * 6 +
      repeatedCount('trash enclosure door') * 5 +
      repeatedCount('enclosure door') * 2,
    sitePlan:
      repeatedCount('site plan') * 4 +
      repeatedCount('lot') * 2 +
      repeatedCount('parking') * 2 +
      repeatedCount('bollard') * 2,
    signageStriping:
      repeatedCount('sign detail') * 4 +
      repeatedCount('sign') * 2 +
      repeatedCount('striping') * 3 +
      repeatedCount('parking detail') * 2
  }

  const detailSignals = {
    plan: repeatedCount(' site plan') + repeatedCount(' plan'),
    elevation: repeatedCount(' elevation'),
    section: repeatedCount(' section'),
    detail: repeatedCount(' detail'),
    schedule: repeatedCount(' schedule') + repeatedCount('door'),
    callout: repeatedCount(' typ.') + repeatedCount(' scale') + repeatedCount('ref.')
  }

  const strongDisciplineSignals = {
    plumbing:
      repeatedCount('plumbing plan') * 6 +
      repeatedCount('plumbing schedule') * 6 +
      repeatedCount('fixture schedule') * 5 +
      repeatedCount('sanitary riser') * 6 +
      repeatedCount('water line') * 4,
    framing:
      repeatedCount('framing plan') * 6 +
      repeatedCount('wall section') * 3 +
      repeatedCount('wood framing') * 5 +
      repeatedCount('stud wall') * 4 +
      repeatedCount('roof framing') * 6,
    electrical:
      repeatedCount('electrical plan') * 6 +
      repeatedCount('power plan') * 6 +
      repeatedCount('lighting plan') * 6 +
      repeatedCount('panel schedule') * 6 +
      repeatedCount('circuit') * 4
  }

  let summary = 'General construction project'
  let detectedScope = 'general construction'
  const why = []
  const primaryTrades = []
  const secondaryTrades = []
  const ignoredTrades = []
  const materials = []
  const supplierCategories = []
  const components = []
  const fieldChecks = []
  const nextActions = []
  const sheetDetails = []

  if (detailSignals.plan > 0) sheetDetails.push('plan')
  if (detailSignals.elevation > 0) sheetDetails.push('elevation')
  if (detailSignals.section > 0) sheetDetails.push('section')
  if (detailSignals.detail > 0) sheetDetails.push('detail')
  if (detailSignals.schedule > 0) sheetDetails.push('schedule')
  if (detailSignals.callout > 0) sheetDetails.push('callout references')

  if (scopeSignals.trashEnclosure >= 6) {
    detectedScope = 'trash enclosure package'
    summary = 'Trash enclosure construction scope tied to a site / detail sheet.'
    why.push('Repeated “trash enclosure” labels indicate the primary scope.')
    if (lower.includes('trash enclosure plan')) why.push('The sheet includes a “Trash Enclosure Plan.”')
    if (lower.includes('trash enclosure elevation')) why.push('The sheet includes one or more “Trash Enclosure Elevation” details.')
    if (lower.includes('trash enclosure door')) why.push('A “Trash Enclosure Door” schedule/detail is present.')
    if (lower.includes('site plan')) why.push('The enclosure is shown within a site-plan context.')

    primaryTrades.push('concrete', 'masonry', 'metal gate install')
    secondaryTrades.push('site layout', 'general labor')
    if (scopeSignals.signageStriping >= 4) secondaryTrades.push('signage / striping')

    if (strongDisciplineSignals.plumbing < 6) ignoredTrades.push('plumbing')
    if (strongDisciplineSignals.framing < 6) ignoredTrades.push('framing')
    if (strongDisciplineSignals.electrical < 6) ignoredTrades.push('electrical')

    materials.push('concrete', 'cmu block / masonry', 'steel posts', 'gate hardware', 'bollards / anchors')
    supplierCategories.push('concrete supplier', 'masonry yard', 'steel / gate fabricator', 'site hardware supplier')

    components.push(
      'trash enclosure walls',
      'gate / door assembly',
      'steel posts',
      'bollards',
      'concrete footing / slab tie-in'
    )

    if (lower.includes('trash enclosure door')) components.push('door / gate schedule reference')
    if (lower.includes('gate post')) components.push('gate post detail')
    if (lower.includes('bollard detail') || lower.includes('bollard')) components.push('bollard detail reference')
    if (lower.includes('parking detail')) components.push('related parking detail reference')

    fieldChecks.push(
      'Confirm dimensions from full plan set.',
      'Confirm wall material type and height requirements.',
      'Confirm gate / hardware specification and swing direction.',
      'Confirm footing detail, reinforcement, and anchor requirements.',
      'Confirm finish requirements and any site protection details.'
    )

    nextActions.push(
      'Generate a material buyout list for the trash enclosure package.',
      'Search suppliers for concrete, masonry, steel / gate fabrication, and site hardware.',
      'Build a crew plan for concrete, masonry, and gate install.',
      'Plan staged delivery for masonry, steel posts, and hardware.'
    )
  } else if (hasAny(['warehouse', 'industrial'])) {
    detectedScope = 'warehouse / industrial building'
    summary = 'Warehouse / industrial project'
    why.push('Warehouse / industrial terms appear in the document text.')
    primaryTrades.push('concrete', 'steel', 'framing')
    secondaryTrades.push('electrical', 'plumbing')
    materials.push('concrete', 'steel', 'lumber')
    supplierCategories.push('concrete supplier', 'steel supplier', 'lumber yard')
    fieldChecks.push('Confirm which building package this sheet belongs to.', 'Confirm structural and MEP scopes from related sheets.')
    nextActions.push('Start with supplier and crew sourcing for the core structural package.')
  } else if (hasAny(['office'])) {
    detectedScope = 'office / commercial interior'
    summary = 'Office / commercial interior project'
    why.push('Office / commercial wording appears in the document text.')
    primaryTrades.push('framing', 'drywall', 'electrical')
    secondaryTrades.push('plumbing', 'hvac')
    materials.push('lumber', 'drywall', 'electrical')
    supplierCategories.push('lumber yard', 'drywall supplier', 'electrical supplier')
    fieldChecks.push('Confirm room-by-room scope and finish schedule.')
    nextActions.push('Start with interior materials and crew coordination.')
  } else if (hasAny(['multifamily', 'apartment'])) {
    detectedScope = 'multifamily project'
    summary = 'Multifamily project'
    why.push('Multifamily / apartment wording appears in the document text.')
    primaryTrades.push('concrete', 'framing', 'plumbing', 'electrical')
    secondaryTrades.push('drywall', 'hvac')
    materials.push('concrete', 'lumber', 'plumbing', 'electrical')
    supplierCategories.push('concrete supplier', 'lumber yard', 'MEP supplier')
    fieldChecks.push('Confirm building type, unit count, and phase sequence from related sheets.')
    nextActions.push('Start with core trade and supplier planning for the active building phase.')
  } else {
    const broadTrades = []
    const tradeMap = [
      ['concrete', ['concrete', 'foundation', 'slab', 'flatwork', 'footing']],
      ['steel', ['steel', 'metal', 'rebar']],
      ['framing', ['frame', 'framing', 'wood framing']],
      ['drywall', ['drywall', 'sheetrock', 'gypsum']],
      ['electrical', ['electrical', 'power', 'lighting']],
      ['plumbing', ['plumbing', 'pipe', 'piping']],
      ['roofing', ['roof', 'roofing']],
      ['hvac', ['hvac', 'mechanical', 'air handler']],
      ['sitework', ['sitework', 'excavation', 'grading', 'dirt', 'parking', 'curb']]
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
      if (needles.some((needle) => lower.includes(needle))) broadTrades.push(value)
    })

    materialMap.forEach(([value, needles]) => {
      if (needles.some((needle) => lower.includes(needle))) materials.push(value)
    })

    const normalizedTrades = Array.from(new Set(broadTrades))
    primaryTrades.push(...normalizedTrades.slice(0, 3))
    secondaryTrades.push(...normalizedTrades.slice(3))
    supplierCategories.push(...Array.from(new Set(materials)).map((item) => `${titleCase(item)} supplier`))
    why.push('No dominant sub-scope label was detected, so the analyzer used trade / material signals from the document text.')
    fieldChecks.push('Confirm exact scope from related plan sheets and detail references.')
    nextActions.push('Start with one supplier search and one crew plan based on the strongest detected trade.')
  }

  const normalizedPrimary = uniqueList(primaryTrades)
  const normalizedSecondary = uniqueList(secondaryTrades).filter((item) => !normalizedPrimary.includes(item))
  const normalizedIgnored = uniqueList(ignoredTrades)
  const normalizedMaterials = uniqueList(materials)
  const normalizedSupplierCategories = uniqueList(supplierCategories)
  const normalizedComponents = uniqueList(components)
  const normalizedFieldChecks = uniqueList(fieldChecks)
  const normalizedNextActions = uniqueList(nextActions)
  const normalizedSheetDetails = uniqueList(sheetDetails)

  const tradeAliases = {
    'metal gate install': 'steel',
    'site layout': 'sitework',
    'general labor': 'sitework',
    'signage / striping': 'sitework'
  }

  const trades = uniqueList(
    [...normalizedPrimary, ...normalizedSecondary]
      .map((trade) => tradeAliases[trade] || trade)
      .filter(Boolean)
  )

  const crewSuggestion =
    detectedScope === 'trash enclosure package'
      ? 'Small targeted site package. Start with a concrete / masonry lead, one metal / gate installer, and general labor support.'
      : trades.length >= 5
        ? 'Multi-trade project. Start with contractor, concrete, steel/framing, electrical, and plumbing coverage.'
        : trades.length >= 3
          ? 'Mid-size project. Start with 2–4 core trades and phase supplier and delivery support.'
          : 'Smaller scope. Start with one lead trade and one supplier lane.'

  return {
    detectedScope,
    summary,
    why: uniqueList(why),
    sheetDetails: normalizedSheetDetails,
    components: normalizedComponents,
    primaryTrades: normalizedPrimary,
    secondaryTrades: normalizedSecondary,
    ignoredTrades: normalizedIgnored,
    trades,
    materials: normalizedMaterials,
    supplierCategories: normalizedSupplierCategories,
    fieldChecks: normalizedFieldChecks,
    nextActions: normalizedNextActions,
    crewSuggestion
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

function extractScopeDetails(text = '', detectedScope = '') {
  const raw = String(text || '')
  const lower = raw.toLowerCase()
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  const keywordMatchers =
    detectedScope === 'trash enclosure package'
      ? ['trash', 'enclosure', 'gate', 'door', 'post', 'bollard', 'footing', 'cmu', 'masonry', 'pipe', 'gauge']
      : ['detail', 'schedule', 'section', 'plan', 'elevation', 'dimension', 'footing', 'pipe', 'gauge']

  const hasKeyword = (line = '') => {
    const lowerLine = String(line || '').toLowerCase()
    return keywordMatchers.some((keyword) => lowerLine.includes(keyword))
  }

  const hasMeasurement = (line = '') =>
    /(\d+\s?'-\s?\d+\s?\d*\/\d*"?|\d+\s?'-\s?\d+"|\d+\s?\d*\/\d+"|\d+\"|\d+\s?ga\b|\d+\s?x\s?\d+|#\d+\b)/i.test(
      line
    )

  const detailLines = uniqueList(
    lines.filter((line) => hasKeyword(line) && hasMeasurement(line)).slice(0, 12)
  )

  const dimensions = uniqueList(
    (raw.match(/\b\d+\s?'-\s?\d+(?:\s?\d+\/\d+)?\"?|\b\d+(?:\s?\d+\/\d+)?\"/g) || [])
      .map((item) => item.replace(/\s+/g, ' ').trim())
  ).slice(0, 16)

  const steelGauge = uniqueList(
    (raw.match(/\b\d+\s?ga\b/gi) || []).map((item) => item.trim())
  )

  const pipeSizes = uniqueList(
    (raw.match(/\b\d+(?:\s?\d+\/\d+)?\"\s?(?:o\.?d\.?\s?)?(?:pipe|post)\b/gi) || [])
      .map((item) => item.trim())
  )

  const cmuSizes = uniqueList(
    (raw.match(/\b\d+\"\s?cmu\b/gi) || []).map((item) => item.trim())
  )

  const footingNotes = uniqueList(
    lines.filter((line) => /footing|concrete|anchor|reinf|rebar/i.test(line) && hasMeasurement(line)).slice(0, 8)
  )

  const gateDoorNotes = uniqueList(
    lines.filter((line) => /gate|door|latch|hinge|post/i.test(line) && (hasMeasurement(line) || /gauge|pipe/i.test(line))).slice(0, 8)
  )

  const verification = []
  if (!dimensions.length) verification.push('No clear overall dimensions were confidently extracted from OCR text.')
  if (!steelGauge.length) verification.push('Steel gauge was not confidently extracted. Verify from enlarged detail or schedule.')
  if (!pipeSizes.length) verification.push('Pipe / post size was not confidently extracted. Verify gate post and bollard details.')
  if (!cmuSizes.length && detectedScope === 'trash enclosure package') verification.push('Wall block / CMU size was not confidently extracted. Verify enclosure elevation / section.')
  if (!footingNotes.length) verification.push('Footing detail text needs verification from detail callouts or related sheets.')

  return {
    dimensions,
    steelGauge,
    pipeSizes,
    cmuSizes,
    footingNotes,
    gateDoorNotes,
    detailLines,
    verification: uniqueList(verification)
  }
}


function normalizeSourceText(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function inferDisciplineFromText(value = '') {
  const lower = String(value || '').toLowerCase()
  if (/electrical|lighting|panel|circuit|power/.test(lower)) return 'electrical'
  if (/plumbing|sanitary|fixture|water line|pipe/.test(lower)) return 'plumbing'
  if (/mechanical|hvac|duct|air handler/.test(lower)) return 'mechanical'
  if (/structural|steel|rebar|footing|foundation|cmu|masonry/.test(lower)) return 'structural'
  if (/site|grading|paving|bollard|parking|drainage|civil/.test(lower)) return 'civil'
  if (/plan|elevation|section|door|finish|interior|architect/.test(lower)) return 'architectural'
  if (/fire|sprinkler|alarm/.test(lower)) return 'fire'
  return 'general'
}

function inferSegmentType(value = '') {
  const lower = String(value || '').toLowerCase()
  if (/schedule/.test(lower)) return 'schedule'
  if (/detail/.test(lower)) return 'detail'
  if (/section/.test(lower)) return 'section'
  if (/elevation/.test(lower)) return 'elevation'
  if (/plan/.test(lower)) return 'plan'
  if (/note|general/.test(lower)) return 'note'
  return 'text'
}

function buildStructuredSegments(projectNotes = '', uploadedFiles = []) {
  const segments = []

  const pushSegment = ({ sourceFile, snippet, confidence = 0.7, sourceType = 'text' }) => {
    const normalized = normalizeSourceText(snippet)
    if (!normalized) return
    segments.push({
      id: `${sourceFile || 'source'}-${segments.length}`,
      sourceFile: sourceFile || 'Project Notes',
      sourceType,
      snippet: normalized,
      discipline: inferDisciplineFromText(normalized),
      segmentType: inferSegmentType(normalized),
      confidence
    })
  }

  String(projectNotes || '')
    .split(/(?<=[.!?])\s+|\n+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12)
    .forEach((snippet) => pushSegment({ sourceFile: 'Project Notes', snippet, confidence: 0.9, sourceType: 'notes' }))

  uploadedFiles.forEach((file) => {
    const lines = String(file?.extractedText || '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)

    lines
      .filter((line) => /plan|detail|section|schedule|elevation|door|gate|footing|electrical|plumbing|hvac|steel|cmu|dimension|sf|square feet/i.test(line))
      .slice(0, 14)
      .forEach((line) => {
        pushSegment({
          sourceFile: file?.name || 'Uploaded File',
          snippet: line,
          confidence: file?.ocrDone ? 0.78 : 0.64,
          sourceType: file?.ocrDone ? 'ocr' : 'file'
        })
      })
  })

  return segments.slice(0, 40)
}

function buildAnalyzerEvidence(projectSummary = {}, projectDetailSummary = {}, structuredSegments = []) {
  const evidence = []
  const used = new Set()

  const addEvidence = (label, value, matcher, fallbackConfidence = 0.72) => {
    if (!value) return
    const match = structuredSegments.find((segment) => matcher(segment))
    const key = `${label}-${value}`
    if (used.has(key)) return
    used.add(key)
    evidence.push({
      label,
      value,
      confidence: match?.confidence || fallbackConfidence,
      sourceFile: match?.sourceFile || 'Analyzer inference',
      sourceSnippet: match?.snippet || `Derived from analyzer signals for ${value}`
    })
  }

  ;(projectSummary.primaryTrades || []).slice(0, 6).forEach((trade) =>
    addEvidence('Trade', titleCase(trade), (segment) => segment.snippet.toLowerCase().includes(String(trade).toLowerCase()))
  )
  ;(projectSummary.materials || []).slice(0, 6).forEach((material) =>
    addEvidence('Material', titleCase(material), (segment) => segment.snippet.toLowerCase().includes(String(material).toLowerCase()), 0.68)
  )
  ;(projectDetailSummary.dimensions || []).slice(0, 6).forEach((dimension) =>
    addEvidence('Dimension', dimension, (segment) => segment.snippet.includes(String(dimension)), 0.84)
  )
  ;(projectDetailSummary.steelGauge || []).slice(0, 4).forEach((item) =>
    addEvidence('Steel gauge', item, (segment) => segment.snippet.toLowerCase().includes(String(item).toLowerCase()), 0.88)
  )
  ;(projectDetailSummary.pipeSizes || []).slice(0, 4).forEach((item) =>
    addEvidence('Pipe / post size', item, (segment) => segment.snippet.toLowerCase().includes(String(item).toLowerCase()), 0.86)
  )

  return evidence.slice(0, 14)
}

function buildPermitPrecheck(projectSummary = {}, projectDetailSummary = {}, fullText = '', structuredSegments = []) {
  const lower = String(fullText || '').toLowerCase()
  const disciplinesDetected = uniqueList(
    structuredSegments.map((segment) => segment.discipline).filter((value) => value && value !== 'general')
  )

  const expectedDisciplines = []
  if (/(warehouse|industrial|steel|framing|office|tenant|interior|remodel|apartment|multifamily)/.test(lower)) expectedDisciplines.push('architectural')
  if (/(concrete|steel|footing|foundation|cmu|masonry|rebar|structural)/.test(lower)) expectedDisciplines.push('structural')
  if (/(electrical|lighting|panel|power|conduit)/.test(lower)) expectedDisciplines.push('electrical')
  if (/(plumbing|sanitary|water line|fixture|pipe)/.test(lower)) expectedDisciplines.push('plumbing')
  if (/(mechanical|hvac|duct|air handler)/.test(lower)) expectedDisciplines.push('mechanical')
  if (/(site|grading|paving|drainage|parking|civil|bollard)/.test(lower)) expectedDisciplines.push('civil')
  if (/(fire|sprinkler|alarm)/.test(lower)) expectedDisciplines.push('fire')

  const missingDisciplines = uniqueList(expectedDisciplines).filter((item) => !disciplinesDetected.includes(item))
  const missing = []
  const unclear = []
  const conflicting = []
  if (!structuredSegments.some((segment) => segment.segmentType === 'plan')) missing.push('No clear plan sheet language detected.')
  if (!structuredSegments.some((segment) => segment.segmentType === 'detail')) missing.push('No strong detail callouts detected.')
  if (!structuredSegments.some((segment) => segment.segmentType === 'schedule')) unclear.push('No schedule language detected yet. Verify doors, panels, fixtures, or finish schedules.')
  if (!projectDetailSummary.dimensions?.length) missing.push('No clear dimensions extracted yet.')
  if (!extractZipFromText(fullText)) unclear.push('No ZIP or location signal detected from the uploaded scope.')
  if (!projectSummary.primaryTrades?.length) unclear.push('No dominant trade package identified with high confidence.')
  if (projectDetailSummary.verification?.length) unclear.push(...projectDetailSummary.verification)
  if (missingDisciplines.length) missing.push(`Weak coverage for: ${missingDisciplines.map(titleCase).join(', ')}.`)
  if (projectSummary.ignoredTrades?.length && projectSummary.primaryTrades?.length) conflicting.push(`Some trades were implied but not evidenced on this sheet: ${projectSummary.ignoredTrades.map(titleCase).join(', ')}.`)

  let readinessScore = 32
  readinessScore += Math.min(structuredSegments.length * 2, 18)
  readinessScore += Math.min((projectSummary.primaryTrades?.length || 0) * 6, 18)
  readinessScore += Math.min((projectDetailSummary.dimensions?.length || 0) * 3, 12)
  readinessScore += Math.min((disciplinesDetected.length || 0) * 5, 20)
  readinessScore -= missing.length * 6
  readinessScore -= unclear.length * 3
  readinessScore -= conflicting.length * 5
  readinessScore = Math.max(0, Math.min(100, readinessScore))

  return {
    readinessScore,
    disciplinesDetected,
    missingDisciplines,
    findings: {
      missing: uniqueList(missing).slice(0, 8),
      unclear: uniqueList(unclear).slice(0, 8),
      conflicting: uniqueList(conflicting).slice(0, 6)
    }
  }
}

function permitReadinessTone(score = 0) {
  if (score >= 80) return { background: '#dcf4e5', color: '#177245' }
  if (score >= 60) return { background: '#d8ecff', color: '#0d3f73' }
  if (score >= 40) return { background: '#fff0b4', color: '#111111' }
  return { background: '#ffe1dc', color: '#8a2d1f' }
}

function disciplineLabel(value = '') {
  return titleCase(String(value || '').replace(/_/g, ' '))
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
  if (/(cmu|block|brick|masonry)/.test(lower)) base.push('masonry')
  if (/(gate hardware|hinge|latch|bollard)/.test(lower)) base.push('site_hardware')
  if (lower.includes('anchors') || lower.includes('bolts') || lower.includes('screws')) base.push('fasteners')
  if (lower.includes('equipment') || lower.includes('lift')) base.push('equipment_rental')
  if (lower.includes('safety') || lower.includes('ppe')) base.push('safety_equipment')

  return uniqueList(base).map((material, index) => ({
    material: normalizeMaterialCategory(material),
    label: titleCase(normalizeMaterialCategory(material)),
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

function recommendedNextMove(scopeSignals = {}, deliveryPlan = {}) {
  const trades = Array.isArray(scopeSignals?.trades) ? scopeSignals.trades : []
  const materials = Array.isArray(scopeSignals?.materials) ? scopeSignals.materials : []
  const squareFeet = Number(scopeSignals?.squareFeet || 0)

  if (materials.length >= 3) return 'Start with suppliers and staged delivery planning.'
  if (trades.length >= 4 || squareFeet >= 15000) return 'Create a multi-trade crew post and source core trades first.'
  if (deliveryPlan?.suggestedLane === 'cargo_van_delivery') return 'Find local last-mile delivery support first.'
  return 'Start with one crew post and one supplier search to create momentum.'
}

function deliveryLaneLabel(value = '') {
  if (value === 'cargo_van_delivery') return 'Cargo Van / Local Delivery'
  if (value === 'material_delivery') return 'Material Delivery / Hot Shot'
  return titleCase(value)
}

function buildAnalyzerProjectPackage({
  scopeText = '',
  projectSummary = {},
  projectDetailSummary = {},
  permitPrecheck = {},
  permitRequirements = {},
  structuredSegments = [],
  analyzerEvidence = [],
  projectEngine = null,
  supplierForm = {},
  crewForm = {},
  deliveryForm = {},
  scopeTarget = ''
}) {
  const engine = projectEngine || {}
  const materialsPlan = engine.materialsPlan || buildMaterialsPlan(projectSummary, scopeText)
  const deliveryPlan = engine.deliveryPlan || buildDeliveryPlan(materialsPlan, projectSummary, scopeText)
  const supplierSignals = uniqueList([
    ...(projectSummary.supplierCategories || []),
    ...((engine.supplierGroups || []).map((group) => group.label).filter(Boolean))
  ])
  const primaryZip =
    engine.primaryZip ||
    extractZipFromText(scopeText) ||
    supplierForm.zip ||
    crewForm.zip ||
    deliveryForm.jobsiteZip ||
    deliveryForm.pickupZip ||
    ''

  return {
    project_name: `${titleCase(projectSummary.detectedScope || projectSummary.summary || 'Project')}${primaryZip ? ` - ${primaryZip}` : ''}`.slice(0, 120),
    summary: projectSummary.summary || 'General construction project',
    detected_scope: projectSummary.detectedScope || 'general construction',
    primary_zip: primaryZip,
    project_type: inferProjectTypeFromScope(projectSummary),
    square_footage: extractSquareFeet(scopeText),
    trades: uniqueList(projectSummary.trades || []),
    materials: materialsPlan,
    supplier_signals: supplierSignals,
    supplier_matches: (engine.supplierGroups || []).reduce((sum, group) => sum + ((group.suppliers || []).length), 0),
    crew_matches: (engine.crewPlan || []).reduce((sum, group) => sum + ((group.matches || []).length), 0),
    delivery_matches: (deliveryPlan.matches || []).length,
    delivery_lane: deliveryPlan.suggestedLane || '',
    delivery_notes: deliveryPlan.notes || '',
    permit_readiness_score: permitPrecheck.readinessScore || 0,
    permit_disciplines: permitPrecheck.disciplinesDetected || [],
    missing_items: permitPrecheck?.findings?.missing || [],
    unclear_items: permitPrecheck?.findings?.unclear || [],
    conflicting_items: permitPrecheck?.findings?.conflicting || [],
    required_permits: permitRequirements.required_permits || [],
    permit_missing_inputs: permitRequirements.missing_inputs || [],
    permit_warnings: permitRequirements.warnings || [],
    evidence: analyzerEvidence || [],
    structured_segments: structuredSegments || [],
    requested_scope: scopeTarget || '',
    recommended_next: engine.recommendedNext || recommendedNextMove({
      trades: projectSummary.trades,
      materials: projectSummary.materials,
      squareFeet: extractSquareFeet(scopeText)
    }, deliveryPlan)
  }
}

function buildAnalyzerProjectPackageText(pkg = {}) {
  return [
    'SURPLOX PROJECT PACKAGE',
    '',
    `PROJECT: ${pkg.project_name || 'Unnamed Project'}`,
    `SUMMARY: ${pkg.summary || '—'}`,
    `SCOPE: ${pkg.detected_scope || '—'}`,
    `ZIP: ${pkg.primary_zip || '—'}`,
    `PROJECT TYPE: ${pkg.project_type || '—'}`,
    `REQUESTED SCOPE: ${pkg.requested_scope || '—'}`,
    `SQUARE FOOTAGE: ${pkg.square_footage ? Number(pkg.square_footage).toLocaleString() : '—'}`,
    `TRADES: ${(pkg.trades || []).map(titleCase).join(', ') || '—'}`,
    `MATERIALS: ${(pkg.materials || []).map((item) => item.label || titleCase(item.material || '')).join(', ') || '—'}`,
    `SUPPLIER SIGNALS: ${(pkg.supplier_signals || []).join(', ') || '—'}`,
    `SUPPLIER MATCHES: ${pkg.supplier_matches || 0}`,
    `CREW MATCHES: ${pkg.crew_matches || 0}`,
    `DELIVERY MATCHES: ${pkg.delivery_matches || 0}`,
    `DELIVERY LANE: ${deliveryLaneLabel(pkg.delivery_lane || '') || '—'}`,
    `DELIVERY NOTES: ${pkg.delivery_notes || '—'}`,
    '',
    `PERMIT READINESS: ${pkg.permit_readiness_score || 0}/100`,
    `DISCIPLINES: ${(pkg.permit_disciplines || []).map(disciplineLabel).join(', ') || '—'}`,
    `REQUIRED PERMITS: ${(pkg.required_permits || []).join(', ') || '—'}`,
    `MISSING INPUTS: ${(pkg.permit_missing_inputs || []).join(' | ') || 'None'}`,
    `WARNINGS: ${(pkg.permit_warnings || []).join(' | ') || 'None'}`,
    `MISSING ITEMS: ${(pkg.missing_items || []).join(' | ') || 'None'}`,
    `UNCLEAR ITEMS: ${(pkg.unclear_items || []).join(' | ') || 'None'}`,
    `CONFLICTING ITEMS: ${(pkg.conflicting_items || []).join(' | ') || 'None'}`,
    '',
    `RECOMMENDED NEXT: ${pkg.recommended_next || '—'}`
  ].join('\n')
}


async function runSupplierEngine(materialsPlan = [], zip = '', supplierForm = {}) {
  const supplierGroups = []
  let localSupplierPool = null

  for (const item of materialsPlan.slice(0, 4)) {
    let groupSuppliers = []

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

      const data = await parseJsonOrTextResponse(response)
      if (response.ok && Array.isArray(data?.suppliers)) {
        groupSuppliers = data.suppliers.slice(0, 4)
      }
    } catch (error) {
      console.error(error)
    }

    if (!groupSuppliers.length) {
      try {
        if (!localSupplierPool) {
          localSupplierPool = await fetchSupplierCandidates()
        }
        groupSuppliers = matchSuppliersToMaterial(item, localSupplierPool, zip || supplierForm.zip).suppliers
      } catch (error) {
        console.error(error)
      }
    }

    supplierGroups.push({
      material: item.material,
      label: item.label,
      suppliers: Array.isArray(groupSuppliers) ? groupSuppliers.slice(0, 4) : []
    })
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

// ================= RFQ SYSTEM =================
async function createRFQ({ projectId, material, supplier }) {
  try {
    const { error } = await supabase.from('rfqs').insert([{
      project_id: projectId || null,
      material,
      supplier_id: supplier.id || null,
      supplier_name: supplier.business_name || supplier.display_name,
      status: 'pending',
      price: null,
      lead_time: null,
      notes: '',
      created_at: new Date().toISOString()
    }])
    if (error) throw error
    alert('RFQ sent successfully')
  } catch (err) {
    console.error(err)
    alert('Failed to send RFQ')
  }
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
          <button
            className="btn small"
            type="button"
            onClick={() => createRFQ({ material: supplier.engine_material || supplier.label || (Array.isArray(supplier.materials_categories) ? supplier.materials_categories[0] : '') || '', supplier })}
          >
            Send RFQ
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


async function parseJsonOrTextResponse(response) {
  const raw = await response.text()
  if (!raw) return {}

  try {
    return JSON.parse(raw)
  } catch (error) {
    console.error('Non-JSON response body:', raw)

    const normalized = String(raw || '').trim()
    if (/request entity too large/i.test(normalized) || /payload too large/i.test(normalized)) {
      throw new Error('Uploaded file is too large for the current OCR endpoint. Try a smaller PDF or increase the server request size limit.')
    }

    throw new Error(normalized.slice(0, 220) || 'OCR failed: server did not return valid JSON')
  }
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


async function extractUploadedFileText(file, mimeType = '') {
  const lower = String(file?.name || '').toLowerCase()
  const type = String(mimeType || file?.type || '').toLowerCase()

  if (type.startsWith('text/') || /\.(txt|md|json|csv)$/i.test(lower)) {
    return String(await file.text())
  }

  if (type === 'application/pdf' || /\.pdf$/i.test(lower) || type.startsWith('image/')) {
    return await handleLargeFileProcessing(file, type || 'application/octet-stream')
  }

  return ''
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

  const [tab, setTab] = useState('analyzer')
  const [busy, setBusy] = useState(false)
  const [analyzerBusy, setAnalyzerBusy] = useState(false)
  const [engineBusy, setEngineBusy] = useState(false)
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
  const [scopeTarget, setScopeTarget] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [hasAnalyzerRun, setHasAnalyzerRun] = useState(false)
  const [extractedText, setExtractedText] = useState('')
  const [projectEngine, setProjectEngine] = useState(null)
  const [analyzerMode, setAnalyzerMode] = useState('build')
  const [creatingProject, setCreatingProject] = useState(false)
  const [createdProjectId, setCreatedProjectId] = useState('')

  const structuredSegments = useMemo(
    () => buildStructuredSegments(projectNotes, uploadedFiles),
    [projectNotes, uploadedFiles]
  )

  const projectSummary = useMemo(
    () => scoreScope(`${projectNotes}\n${extractedText}`),
    [projectNotes, extractedText]
  )

  const projectDetailSummary = useMemo(
    () => extractScopeDetails(`${projectNotes}\n${extractedText}`, projectSummary.detectedScope),
    [projectNotes, extractedText, projectSummary.detectedScope]
  )

  const targetedScopeAnalysis = useMemo(
    () =>
      buildTargetedScopeAnalysis({
        scopeTarget,
        fullText: `${projectNotes}\n${extractedText}`,
        structuredSegments,
        projectSummary,
        projectDetailSummary
      }),
    [scopeTarget, projectNotes, extractedText, structuredSegments, projectSummary, projectDetailSummary]
  )

  const effectiveProjectSummary = useMemo(
    () => targetedScopeAnalysis.targetedSummary || projectSummary,
    [targetedScopeAnalysis, projectSummary]
  )

  const analyzerEvidence = useMemo(
    () => buildAnalyzerEvidence(effectiveProjectSummary, projectDetailSummary, structuredSegments),
    [effectiveProjectSummary, projectDetailSummary, structuredSegments]
  )

  const permitPrecheck = useMemo(
    () => buildPermitPrecheck(effectiveProjectSummary, projectDetailSummary, `${projectNotes}\n${extractedText}`, structuredSegments),
    [effectiveProjectSummary, projectDetailSummary, projectNotes, extractedText, structuredSegments]
  )

  const permitRequirements = useMemo(
    () => getPermitRequirements({ projectSummary: effectiveProjectSummary, projectDetailSummary, fullText: `${projectNotes}\n${extractedText}` }),
    [effectiveProjectSummary, projectDetailSummary, projectNotes, extractedText]
  )

  const detectedSheets = useMemo(
    () => detectSheetsFromText(extractedText),
    [extractedText]
  )

  const blueprintScopeMatches = useMemo(
    () =>
      buildBlueprintScopeMatches({
        scopeTarget,
        extractedText,
        detectedSheets,
        projectSummary: effectiveProjectSummary,
        structuredSegments
      }),
    [scopeTarget, extractedText, detectedSheets, effectiveProjectSummary, structuredSegments]
  )

  const likelyExclusions = useMemo(
    () =>
      buildLikelyExclusions({
        scopeTarget,
        projectSummary: effectiveProjectSummary,
        targetedScopeAnalysis
      }),
    [scopeTarget, effectiveProjectSummary, targetedScopeAnalysis]
  )

  const pageAwareMatches = useMemo(
    () =>
      buildPageAwareMatches({
        scopeTarget,
        extractedText,
        detectedSheets,
        projectSummary: effectiveProjectSummary
      }),
    [scopeTarget, extractedText, detectedSheets, effectiveProjectSummary]
  )



  const analyzerProjectPackage = useMemo(
    () =>
      buildAnalyzerProjectPackage({
        scopeText: [projectNotes, extractedText].filter(Boolean).join('\n\n'),
        projectSummary: effectiveProjectSummary,
        projectDetailSummary,
        permitPrecheck,
        permitRequirements,
        structuredSegments,
        analyzerEvidence,
        projectEngine,
        supplierForm,
        crewForm,
        deliveryForm,
        scopeTarget
      }),
    [
      projectNotes,
      extractedText,
      effectiveProjectSummary,
      projectDetailSummary,
      permitPrecheck,
      permitRequirements,
      structuredSegments,
      analyzerEvidence,
      projectEngine,
      supplierForm,
      crewForm,
      deliveryForm,
      scopeTarget
    ]
  )

  const analyzerProjectPackageText = useMemo(
    () => buildAnalyzerProjectPackageText(analyzerProjectPackage),
    [analyzerProjectPackage]
  )

  function copyAnalyzerProjectPackage() {
    try {
      navigator.clipboard.writeText(analyzerProjectPackageText)
      setMessage(copy.projectPackageCopied)
    } catch (error) {
      console.error(error)
      setMessage(copy.projectPackageCopyError)
    }
  }

  function downloadAnalyzerProjectPackagePdf() {
    try {
      const pkg = analyzerProjectPackage
      const pdf = new jsPDF('p', 'pt', 'a4')
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(18)
      pdf.text('Surplox Project Package', 40, 44)
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(11)
      pdf.text(`Project: ${pkg.project_name || 'Unnamed Project'}`, 40, 66)
      pdf.text(`Generated: ${new Date().toLocaleString()}`, 40, 82)

      autoTable(pdf, {
        startY: 100,
        theme: 'grid',
        head: [['Scope + Profile', 'Value']],
        body: [
          ['Summary', pkg.summary || '—'],
          ['Detected scope', pkg.detected_scope || '—'],
          ['Primary ZIP', pkg.primary_zip || '—'],
          ['Project type', pkg.project_type || '—'],
          ['Requested scope', pkg.requested_scope || '—'],
          ['Square footage', pkg.square_footage ? Number(pkg.square_footage).toLocaleString() : '—'],
          ['Trades', (pkg.trades || []).map(titleCase).join(', ') || '—'],
          ['Recommended next', pkg.recommended_next || '—']
        ],
        margin: { left: 40, right: 40 },
        styles: { fontSize: 10, cellPadding: 6 }
      })

      autoTable(pdf, {
        startY: pdf.lastAutoTable.finalY + 16,
        theme: 'grid',
        head: [['Materials + Suppliers', 'Value']],
        body: [
          ['Materials', (pkg.materials || []).map((item) => item.label || titleCase(item.material || '')).join(', ') || '—'],
          ['Supplier signals', (pkg.supplier_signals || []).join(', ') || '—'],
          ['Supplier matches', String(pkg.supplier_matches || 0)],
          ['Crew matches', String(pkg.crew_matches || 0)],
          ['Delivery matches', String(pkg.delivery_matches || 0)],
          ['Delivery lane', deliveryLaneLabel(pkg.delivery_lane || '') || '—'],
          ['Delivery notes', pkg.delivery_notes || '—']
        ],
        margin: { left: 40, right: 40 },
        styles: { fontSize: 10, cellPadding: 6 }
      })

      autoTable(pdf, {
        startY: pdf.lastAutoTable.finalY + 16,
        theme: 'grid',
        head: [['Permit Summary', 'Value']],
        body: [
          ['Permit readiness', `${pkg.permit_readiness_score || 0}/100`],
          ['Disciplines', (pkg.permit_disciplines || []).map(disciplineLabel).join(', ') || '—'],
          ['Required permits', (pkg.required_permits || []).join(', ') || '—'],
          ['Missing inputs', (pkg.permit_missing_inputs || []).join(' | ') || 'None'],
          ['Warnings', (pkg.permit_warnings || []).join(' | ') || 'None'],
          ['Missing items', (pkg.missing_items || []).join(' | ') || 'None'],
          ['Unclear items', (pkg.unclear_items || []).join(' | ') || 'None'],
          ['Conflicting items', (pkg.conflicting_items || []).join(' | ') || 'None']
        ],
        margin: { left: 40, right: 40 },
        styles: { fontSize: 10, cellPadding: 6 }
      })

      const materialRows = (pkg.materials || []).map((item) => [
        item.label || titleCase(item.material || ''),
        item.priority || '—'
      ])

      autoTable(pdf, {
        startY: pdf.lastAutoTable.finalY + 16,
        theme: 'grid',
        head: [['Material', 'Priority']],
        body: materialRows.length ? materialRows : [['No materials extracted yet.', '—']],
        margin: { left: 40, right: 40 },
        styles: { fontSize: 10, cellPadding: 6 }
      })

      const wrapped = pdf.splitTextToSize(analyzerProjectPackageText, 515)
      pdf.text(wrapped, 40, pdf.lastAutoTable.finalY + 24)
      const filename = `${String(pkg.project_name || 'surplox-project-package').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'surplox-project-package'}.pdf`
      pdf.save(filename)
      setMessage(copy.projectPackagePdfReady)
    } catch (error) {
      console.error(error)
      setMessage(copy.projectPackagePdfError)
    }
  }

  function setSupplierField(key, value) {
    setSupplierForm((prev) => ({ ...prev, [key]: value }))
  }

  function setCrewField(key, value) {
    setCrewForm((prev) => ({ ...prev, [key]: value }))
  }

  function setDeliveryField(key, value) {
    setDeliveryForm((prev) => ({ ...prev, [key]: value }))
  }

  function buildCombinedExtractedText(files = []) {
    return files
      .map((item) => String(item?.extractedText || '').trim())
      .filter(Boolean)
      .join('\n\n')
  }

  function removeUploadedFile(fileId) {
    const nextFiles = uploadedFiles.filter((file) => file.id !== fileId)
    setUploadedFiles(nextFiles)
    setExtractedText(buildCombinedExtractedText(nextFiles))
    setProjectEngine(null)
    setCreatedProjectId('')
    setHasAnalyzerRun(false)
  }

  function clearUploadedFiles() {
    setUploadedFiles([])
    setExtractedText('')
    setProjectEngine(null)
    setCreatedProjectId('')
    setHasAnalyzerRun(false)
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

  function openRepairSearch(overrides = {}) {
    pushWithParams('/mechanics', {
      q: overrides.q || 'diesel hydraulic trailer field service',
      zip: overrides.zip || deliveryForm.jobsiteZip || supplierForm.zip || crewForm.zip
    })
  }

  function openRepairPost(overrides = {}) {
    pushWithParams('/new', {
      type: 'discussion',
      category: 'jobsite_support',
      support: 'equipment_fleet_repair',
      title:
        overrides.title ||
        `Need mechanic / repair support near ${overrides.zip || deliveryForm.jobsiteZip || supplierForm.zip || crewForm.zip || ''}`,
      body:
        overrides.body ||
        projectNotes ||
        extractedText ||
        `Need mechanic or equipment repair support near ${overrides.zip || deliveryForm.jobsiteZip || supplierForm.zip || crewForm.zip || ''}.`,
      zip: overrides.zip || deliveryForm.jobsiteZip || supplierForm.zip || crewForm.zip,
      urgent: overrides.urgent || 'true'
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
    setAnalyzerBusy(true)
    setMessage('')
    setCreatedProjectId('')

    try {
      const response = await fetch(API_IMPORT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplierForm)
      })

      const data = await parseJsonOrTextResponse(response)
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
    setEngineBusy(true)
    setMessage('')

    try {
      const response = await fetch(API_SUPPLIER_SEARCH_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplierForm)
      })

      const data = await parseJsonOrTextResponse(response)
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
    if (!files.length) return

    setBusy(true)
    setMessage('')

    try {
      const next = []

      for (const file of files) {
        const lower = file.name.toLowerCase()
        const mimeType = file.type || 'application/octet-stream'
        let extractedTextForFile = ''
        let ocrReady = false
        let ocrDone = false

        if (mimeType.startsWith('text/') || /\.(txt|md|json|csv)$/i.test(lower)) {
          try {
            extractedTextForFile = await extractUploadedFileText(file, mimeType)
          } catch (error) {
            console.error(error)
          }
          ocrReady = false
          ocrDone = Boolean(extractedTextForFile)
        } else if (mimeType === 'application/pdf' || /\.pdf$/i.test(lower) || mimeType.startsWith('image/')) {
          ocrReady = true
          ocrDone = false
        }

        next.push({
          id: `${file.name}-${file.size}-${file.lastModified}`,
          file,
          name: file.name,
          mimeType,
          extractedText: extractedTextForFile,
          ocrReady,
          ocrDone
        })
      }

      setUploadedFiles(next)
      setExtractedText(buildCombinedExtractedText(next))
      setProjectEngine(null)
      setCreatedProjectId('')
      setHasAnalyzerRun(false)
      event.target.value = ''
    } finally {
      setBusy(false)
    }
  }

  async function runOcrForFile(fileId) {
    setBusy(true)
    setAnalyzerBusy(true)
    setMessage('')

    try {
      const target = uploadedFiles.find((item) => item.id === fileId)
      if (!target) throw new Error('File not found.')

      setMessage(`Analyzer: processing ${target.name}…`)
      const text = await handleLargeFileProcessing(target.file, target.mimeType)
      const nextFiles = uploadedFiles.map((item) =>
        item.id === fileId
          ? { ...item, extractedText: text, ocrDone: Boolean(text) }
          : item
      )

      setUploadedFiles(nextFiles)
      setExtractedText(buildCombinedExtractedText(nextFiles))
      setHasAnalyzerRun(true)
      setMessage('Project Analyzer scan complete.')
    } catch (error) {
      console.error(error)
      setMessage(`OCR failed: ${error.message || 'Unknown error'}`)
    } finally {
      setAnalyzerBusy(false)
      setBusy(false)
    }
  }

  async function handleRunAnalyzer() {
    const hasSourceText = Boolean(projectNotes.trim() || extractedText.trim() || uploadedFiles.length)
    if (!hasSourceText) {
      setMessage(copy.noSummary)
      return
    }

    setBusy(true)
    setAnalyzerBusy(true)
    setMessage('')

    try {
      let nextFiles = [...uploadedFiles]

      for (const file of nextFiles) {
        const needsOcr = Boolean(file.ocrReady && !String(file.extractedText || '').trim())
        if (!needsOcr) continue

        setMessage(`Analyzer: processing ${file.name}…`)
        const text = await handleLargeFileProcessing(file.file, file.mimeType)
        nextFiles = nextFiles.map((item) =>
          item.id === file.id
            ? { ...item, extractedText: text, ocrDone: Boolean(text) }
            : item
        )
      }

      setUploadedFiles(nextFiles)
      setExtractedText(buildCombinedExtractedText(nextFiles))
      setProjectEngine(null)
      setCreatedProjectId('')
      setHasAnalyzerRun(true)
      setMessage('Project Analyzer scan complete.')
    } catch (error) {
      console.error(error)
      setMessage(`OCR failed: ${error.message || 'Unknown error'}`)
    } finally {
      setAnalyzerBusy(false)
      setBusy(false)
    }
  }



  async function handleCreateProjectFromAnalysis() {
    const scopeText = [projectNotes, extractedText].filter(Boolean).join('\n\n').trim()
    if (!scopeText) {
      setMessage(copy.engineEmpty)
      return
    }

    setCreatingProject(true)
    setMessage('')

    try {
      const detectedZip =
        extractZipFromText(scopeText) ||
        supplierForm.zip ||
        crewForm.zip ||
        deliveryForm.jobsiteZip ||
        deliveryForm.pickupZip

      const fallbackEngine = projectEngine || {
        recommendedNext: recommendedNextMove(
          {
            trades: effectiveProjectSummary.trades,
            materials: effectiveProjectSummary.materials,
            squareFeet: extractSquareFeet(scopeText)
          },
          buildDeliveryPlan(buildMaterialsPlan(effectiveProjectSummary, scopeText), effectiveProjectSummary, scopeText)
        )
      }

      const payload = buildProjectRecordFromAnalysis({
        scopeText,
        projectSummary: effectiveProjectSummary,
        projectDetailSummary,
        detectedZip,
        supplierForm,
        projectEngine: fallbackEngine
      })

      const { data, error } = await supabase
        .from('admin_crm_records')
        .insert(payload)
        .select('*')
        .single()

      if (error) throw error

      setCreatedProjectId(data?.id || '')
      setMessage(copy.createProjectSuccess)
      navigate(`/admin/projects/${data.id}`)
    } catch (error) {
      console.error(error)
      setMessage(error.message || copy.createProjectError)
    } finally {
      setCreatingProject(false)
    }
  }

  async function runProjectEngine() {
    const scopeText = [projectNotes, extractedText].filter(Boolean).join('\n\n').trim()
    if (!scopeText) {
      setMessage(copy.engineEmpty)
      return
    }

    setBusy(true)
    setEngineBusy(true)
    setMessage('')

    try {
      const detectedZip =
        extractZipFromText(scopeText) ||
        supplierForm.zip ||
        crewForm.zip ||
        deliveryForm.jobsiteZip ||
        deliveryForm.pickupZip

      const materialsPlan = buildMaterialsPlan(effectiveProjectSummary, scopeText)
      const crewPlan = buildCrewPlan(effectiveProjectSummary, scopeText)
      const deliveryPlan = buildDeliveryPlan(materialsPlan, effectiveProjectSummary, scopeText)

      const supplierGroups = await runSupplierEngine(materialsPlan, detectedZip, supplierForm)
      const crewGroups = await runCrewEngine(crewPlan, detectedZip)
      const deliveryMatches = await runDeliveryEngine(
        deliveryPlan,
        supplierForm.zip || detectedZip,
        detectedZip
      )

      const nextEngine = {
        summary: effectiveProjectSummary.summary,
        primaryZip: detectedZip,
        permitPrecheck,
        permitRequirements,
        evidence: analyzerEvidence,
        structuredSegments,
        scopeSignals: {
          trades: effectiveProjectSummary.trades,
          materials: effectiveProjectSummary.materials,
          squareFeet: extractSquareFeet(scopeText),
          dimensions: projectDetailSummary.dimensions,
          steelGauge: projectDetailSummary.steelGauge,
          pipeSizes: projectDetailSummary.pipeSizes,
          cmuSizes: projectDetailSummary.cmuSizes
        },
        crewPlan: crewGroups,
        materialsPlan,
        supplierGroups,
        deliveryPlan: {
          ...deliveryPlan,
          matches: deliveryMatches
        },
        recommendedNext: recommendedNextMove(
          {
            trades: effectiveProjectSummary.trades,
            materials: effectiveProjectSummary.materials,
            squareFeet: extractSquareFeet(scopeText),
            dimensions: projectDetailSummary.dimensions,
            steelGauge: projectDetailSummary.steelGauge,
            pipeSizes: projectDetailSummary.pipeSizes,
            cmuSizes: projectDetailSummary.cmuSizes
          },
          deliveryPlan
        )
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
      setEngineBusy(false)
      setBusy(false)
    }
  }

  function useAnalyzerForSupplier() {
    const firstMaterial = effectiveProjectSummary.materials[0] || ''
    setSupplierForm((prev) => ({
      ...prev,
      material: firstMaterial || prev.material,
      zip: crewForm.zip || deliveryForm.jobsiteZip || prev.zip
    }))
    setTab('supplier')
  }

  function useAnalyzerForCrew() {
    const firstTrade = effectiveProjectSummary.trades[0] || ''
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
            {uploadedFiles.length > 0 ? (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
                <button className="btn small" type="button" onClick={clearUploadedFiles}>
                  {copy.clearFiles}
                </button>
              </div>
            ) : null}
          </div>

          {uploadedFiles.length > 0 ? (
            <div className="grid" style={{ gap: 12, marginTop: 16 }}>
              {uploadedFiles.map((file) => (
                <div key={file.id} className="card-soft">
                  <div style={{ fontWeight: 800 }}>{file.name}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                    <span className="badge">
                      {file.ocrDone
                        ? copy.fileOcrDone
                        : file.ocrReady
                          ? copy.fileOcrReady
                          : file.extractedText
                            ? copy.fileExtracted
                            : copy.fileReady}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
                    {(file.ocrReady || (file.mimeType === 'application/pdf' || /\.pdf$/i.test(file.name) || String(file.mimeType || '').startsWith('image/'))) ? (
                      <button
                        className="btn small"
                        type="button"
                        onClick={() => runOcrForFile(file.id)}
                        disabled={busy}
                      >
                        {analyzerBusy ? copy.runningOcr : copy.runOcr}
                      </button>
                    ) : null}
                    <button
                      className="btn small"
                      type="button"
                      onClick={() => removeUploadedFile(file.id)}
                    >
                      {copy.removeFile}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <div className="card-soft" style={{ marginTop: 16, background: '#f7f4ff' }}>
            <div className="card-section-title">{copy.scopeTargetTitle}</div>
            <p className="card-section-subtitle" style={{ marginTop: 8 }}>
              {copy.scopeTargetBody}
            </p>

            <div style={{ marginTop: 12 }}>
              <div className="muted" style={{ marginBottom: 8 }}>{copy.scopeTargetLabel}</div>
              <input
                className="input"
                value={scopeTarget}
                onChange={(e) => setScopeTarget(e.target.value)}
                placeholder={copy.scopeTargetPlaceholder}
              />
              <p className="card-section-subtitle" style={{ marginTop: 8 }}>
                {copy.scopeTargetHelp}
              </p>
            </div>
          </div>

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
            <button
              className="btn primary"
              type="button"
              onClick={handleRunAnalyzer}
              disabled={analyzerBusy || engineBusy || (!uploadedFiles.length && !projectNotes.trim())}
            >
              {analyzerBusy ? copy.runningOcr : copy.runOcr}
            </button>
            <Chip onClick={runProjectEngine}>{engineBusy ? copy.engineRunning : copy.engineRunButton}</Chip>
            <Chip onClick={useAnalyzerForSupplier}>{copy.supplierTab}</Chip>
            <Chip onClick={useAnalyzerForCrew}>{copy.crewTab}</Chip>
            <Chip onClick={useAnalyzerForDelivery}>{copy.deliveryTab}</Chip>
          </div>

          {hasAnalyzerRun ? (
            <div className="card-soft" style={{ marginTop: 12, background: '#eef7f1' }}>
              <div style={{ fontWeight: 800 }}>Project Analyzer ready</div>
              <div className="card-section-subtitle" style={{ marginTop: 6 }}>
                OCR and file extraction completed. Review the analyzer output below or run the Project Engine for the full handoff.
              </div>
            </div>
          ) : null}

          <div className="card-soft" style={{ marginTop: 16, background: analyzerMode === 'permit' ? '#fff4da' : '#eef5ff' }}>
            <div className="card-section-title">Analyzer Mode</div>
            <p className="card-section-subtitle" style={{ marginTop: 8 }}>
              {copy.permitModeBody}
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
              <Chip active={analyzerMode === 'build'} onClick={() => setAnalyzerMode('build')}>{copy.analyzerBuildMode}</Chip>
              <Chip active={analyzerMode === 'permit'} onClick={() => setAnalyzerMode('permit')}>{copy.analyzerPermitMode}</Chip>
            </div>
          </div>

          <div className="card-soft" style={{ marginTop: 16, background: '#eef7f1' }}>
            <div className="card-section-title">{copy.projectCreationTitle}</div>
            <p className="card-section-subtitle" style={{ marginTop: 8 }}>
              {copy.projectCreationBody}
            </p>
            <p className="card-section-subtitle" style={{ marginTop: 8 }}>
              {copy.createProjectHelp}
            </p>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
              <button
                className="btn primary"
                type="button"
                onClick={handleCreateProjectFromAnalysis}
                disabled={creatingProject || analyzerBusy || engineBusy}
              >
                {creatingProject ? copy.creatingProjectRecord : copy.createProjectRecord}
              </button>

              {createdProjectId ? (
                <Link className="btn" to={`/admin/projects/${createdProjectId}`}>
                  {copy.openCreatedProject}
                </Link>
              ) : null}
            </div>
          </div>

          <div className="card-soft" style={{ marginTop: 16, background: '#fffaf0' }}>
            <div className="card-section-title">{copy.engineLaunchpadTitle}</div>
            <p className="card-section-subtitle" style={{ marginTop: 8 }}>
              {copy.engineLaunchpadBody}
            </p>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
              <button className="btn" type="button" onClick={() => openSupplierSearch()}>
                {copy.openSupplierSearch}
              </button>
              <button className="btn" type="button" onClick={() => openCrewPost()}>
                {copy.openCrewPost}
              </button>
              <button className="btn" type="button" onClick={() => openDeliverySearch()}>
                {copy.openDelivery}
              </button>
              <button className="btn" type="button" onClick={() => openRepairSearch()}>
                {copy.engineUseRepair}
              </button>
              <Link className="btn" to="/messages">
                {copy.engineOpenMessages}
              </Link>
              <Link className="btn" to="/feed">
                {copy.engineOpenFeed}
              </Link>
            </div>
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

                <div className="card-soft" style={{ background: '#fffaf0' }}>
                  <div className="card-section-title">{copy.engineRunSummary}</div>
                  <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
                    <div><strong>{copy.engineCrewMatches}:</strong> {projectEngine.crewPlan?.reduce((sum, item) => sum + ((item.matches || []).length), 0) || 0}</div>
                    <div><strong>{copy.engineSupplierMatches}:</strong> {projectEngine.supplierGroups?.reduce((sum, item) => sum + ((item.suppliers || []).length), 0) || 0}</div>
                    <div><strong>{copy.engineDeliveryMatches}:</strong> {projectEngine.deliveryPlan?.matches?.length || 0}</div>
                    <div><strong>{copy.engineRecommendedNext}:</strong> {projectEngine.recommendedNext}</div>
                    <div><strong>Project record:</strong> Use the project creation card below to push this analysis into Admin Projects.</div>
                    <div><strong>Supplier matching:</strong> Supplier search now falls back to internal Surplox supplier matching when the external endpoint returns light results.</div>
                  </div>
                </div>

                <div className="card-soft" style={{ background: '#ffffff' }}>
                  <div className="card-section-title">{copy.engineScopeSignals}</div>
                  {(projectEngine.scopeSignals.trades || []).length || (projectEngine.scopeSignals.materials || []).length || projectEngine.scopeSignals.squareFeet ? (
                    <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {(projectEngine.scopeSignals.trades || []).map((trade) => (
                        <span key={`signal-trade-${trade}`} className="badge">{titleCase(trade)}</span>
                      ))}
                      {(projectEngine.scopeSignals.materials || []).map((material) => (
                        <span key={`signal-material-${material}`} className="badge">{titleCase(material)}</span>
                      ))}
                      {(projectEngine.scopeSignals.dimensions || []).slice(0, 6).map((dimension) => (
                        <span key={`signal-dimension-${dimension}`} className="badge">{dimension}</span>
                      ))}
                      {(projectEngine.scopeSignals.steelGauge || []).slice(0, 3).map((item) => (
                        <span key={`signal-gauge-${item}`} className="badge">{item}</span>
                      ))}
                      {(projectEngine.scopeSignals.pipeSizes || []).slice(0, 3).map((item) => (
                        <span key={`signal-pipe-${item}`} className="badge">{item}</span>
                      ))}
                      {(projectEngine.scopeSignals.cmuSizes || []).slice(0, 3).map((item) => (
                        <span key={`signal-cmu-${item}`} className="badge">{item}</span>
                      ))}
                      {projectEngine.scopeSignals.squareFeet ? (
                        <span className="badge">{projectEngine.scopeSignals.squareFeet.toLocaleString()} SF</span>
                      ) : null}
                    </div>
                  ) : (
                    <p className="card-section-subtitle" style={{ marginTop: 8 }}>{copy.engineNoSignals}</p>
                  )}
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
                            {deliveryLaneLabel(projectEngine.deliveryPlan.suggestedLane)}
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
                    material: effectiveProjectSummary.materials[0] || supplierForm.material,
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
                    trade: effectiveProjectSummary.trades[0] || crewForm.trade,
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

              <button
                className="btn"
                type="button"
                onClick={() =>
                  openRepairSearch({
                    zip: deliveryForm.jobsiteZip || supplierForm.zip || crewForm.zip
                  })
                }
              >
                {copy.engineUseRepair}
              </button>

              <button
                className="btn"
                type="button"
                onClick={() =>
                  openRepairPost({
                    zip: deliveryForm.jobsiteZip || supplierForm.zip || crewForm.zip,
                    body: extractedText || projectNotes
                  })
                }
              >
                {copy.engineBuildRepairPost}
              </button>
            </div>
          </div>

          <div className="card-soft" style={{ marginTop: 16, background: analyzerMode === 'permit' ? '#fffaf0' : '#ffffff' }}>
            <div className="card-section-title">{copy.permitPrecheckTitle}</div>
            <div className="grid two" style={{ gap: 14, marginTop: 12 }}>
              <div className="card-soft" style={{ background: '#ffffff' }}>
                <div className="muted">{copy.permitReadinessScore}</div>
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 32, fontWeight: 900 }}>{permitPrecheck.readinessScore}/100</div>
                  <span className="badge" style={permitReadinessTone(permitPrecheck.readinessScore)}>
                    {permitPrecheck.readinessScore >= 80 ? copy.permitReadySummary : permitPrecheck.readinessScore >= 50 ? copy.permitNeedsWorkSummary : copy.permitLowSummary}
                  </span>
                </div>
              </div>

              <div className="card-soft" style={{ background: '#ffffff' }}>
                <div className="muted">{copy.permitDisciplinesDetected}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                  {permitPrecheck.disciplinesDetected.length ? permitPrecheck.disciplinesDetected.map((item) => (
                    <span key={`discipline-${item}`} className="badge">{disciplineLabel(item)}</span>
                  )) : <span className="badge">No strong discipline coverage yet</span>}
                </div>
                <div className="muted" style={{ marginTop: 12 }}>{copy.permitMissingDisciplines}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                  {permitPrecheck.missingDisciplines.length ? permitPrecheck.missingDisciplines.map((item) => (
                    <span key={`missing-discipline-${item}`} className="badge" style={{ background: '#ffe1dc', color: '#8a2d1f' }}>{disciplineLabel(item)}</span>
                  )) : <span className="badge">No obvious missing discipline lanes</span>}
                </div>
              </div>
            </div>

            <div className="grid three" style={{ gap: 14, marginTop: 14 }}>
              <div className="card-soft" style={{ background: '#ffffff' }}>
                <div className="muted">{copy.permitMissingItems}</div>
                {permitPrecheck.findings.missing.length ? (
                  <ul style={{ margin: '10px 0 0 18px', padding: 0 }}>
                    {permitPrecheck.findings.missing.map((item) => (
                      <li key={`permit-missing-${item}`} style={{ marginTop: 4 }}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <div style={{ marginTop: 10 }}>{copy.permitNoFindings}</div>
                )}
              </div>

              <div className="card-soft" style={{ background: '#ffffff' }}>
                <div className="muted">{copy.permitUnclearItems}</div>
                {permitPrecheck.findings.unclear.length ? (
                  <ul style={{ margin: '10px 0 0 18px', padding: 0 }}>
                    {permitPrecheck.findings.unclear.map((item) => (
                      <li key={`permit-unclear-${item}`} style={{ marginTop: 4 }}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <div style={{ marginTop: 10 }}>{copy.permitNoFindings}</div>
                )}
              </div>

              <div className="card-soft" style={{ background: '#ffffff' }}>
                <div className="muted">{copy.permitConflictingItems}</div>
                {permitPrecheck.findings.conflicting.length ? (
                  <ul style={{ margin: '10px 0 0 18px', padding: 0 }}>
                    {permitPrecheck.findings.conflicting.map((item) => (
                      <li key={`permit-conflicting-${item}`} style={{ marginTop: 4 }}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <div style={{ marginTop: 10 }}>{copy.permitNoFindings}</div>
                )}
              </div>
            </div>
          </div>

          <div className="card-soft" style={{ marginTop: 16 }}>
            <div className="card-section-title">{copy.permitRequirementsTitle}</div>
            {(permitRequirements.required_permits.length || permitRequirements.missing_inputs.length || permitRequirements.warnings.length) ? (
              <div className="grid three" style={{ gap: 14, marginTop: 12 }}>
                <div className="card-soft" style={{ background: '#ffffff' }}>
                  <div className="muted">{copy.permitRequiredPermits}</div>
                  {permitRequirements.required_permits.length ? (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                      {permitRequirements.required_permits.map((item) => (
                        <span key={`required-permit-${item}`} className="badge">{item}</span>
                      ))}
                    </div>
                  ) : (
                    <div style={{ marginTop: 10 }}>{copy.permitNoRequirements}</div>
                  )}
                </div>

                <div className="card-soft" style={{ background: '#ffffff' }}>
                  <div className="muted">{copy.permitMissingInputs}</div>
                  {permitRequirements.missing_inputs.length ? (
                    <ul style={{ margin: '10px 0 0 18px', padding: 0 }}>
                      {permitRequirements.missing_inputs.map((item) => (
                        <li key={`permit-input-${item}`} style={{ marginTop: 4 }}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <div style={{ marginTop: 10 }}>{copy.permitNoFindings}</div>
                  )}
                </div>

                <div className="card-soft" style={{ background: '#ffffff' }}>
                  <div className="muted">{copy.permitWarnings}</div>
                  {permitRequirements.warnings.length ? (
                    <ul style={{ margin: '10px 0 0 18px', padding: 0 }}>
                      {permitRequirements.warnings.map((item) => (
                        <li key={`permit-warning-${item}`} style={{ marginTop: 4 }}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <div style={{ marginTop: 10 }}>{copy.permitNoFindings}</div>
                  )}
                </div>
              </div>
            ) : (
              <p className="card-section-subtitle" style={{ marginTop: 8 }}>{copy.permitNoRequirements}</p>
            )}
          </div>

          <div className="card-soft" style={{ marginTop: 16 }}>
            <div className="card-section-title">{copy.permitEvidenceTitle}</div>
            {analyzerEvidence.length ? (
              <div className="grid" style={{ gap: 12, marginTop: 12 }}>
                {analyzerEvidence.map((item, index) => (
                  <div key={`evidence-${item.label}-${item.value}-${index}`} className="card-soft" style={{ background: '#ffffff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                      <div style={{ fontWeight: 800 }}>{item.label}: {item.value}</div>
                      <span className="badge">Confidence {Math.round((item.confidence || 0) * 100)}%</span>
                    </div>
                    <div className="muted" style={{ marginTop: 8 }}>{item.sourceFile}</div>
                    <div style={{ marginTop: 8, lineHeight: 1.7 }}>{item.sourceSnippet}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="card-section-subtitle" style={{ marginTop: 8 }}>{copy.permitNoEvidence}</p>
            )}
          </div>

          <div className="card-soft" style={{ marginTop: 16 }}>
            <div className="card-section-title">{copy.permitSegmentTitle}</div>
            {structuredSegments.length ? (
              <div className="grid" style={{ gap: 12, marginTop: 12 }}>
                {structuredSegments.slice(0, 14).map((segment) => (
                  <div key={segment.id} className="card-soft" style={{ background: '#ffffff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                      <div style={{ fontWeight: 800 }}>{segment.sourceFile}</div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <span className="badge">{disciplineLabel(segment.discipline)}</span>
                        <span className="badge">{titleCase(segment.segmentType)}</span>
                      </div>
                    </div>
                    <div style={{ marginTop: 8, lineHeight: 1.7 }}>{segment.snippet}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="card-section-subtitle" style={{ marginTop: 8 }}>{copy.permitNoSegments}</p>
            )}
          </div>

          <div className="card-soft" style={{ marginTop: 16, background: '#f3f8ff' }}>
            <div className="card-section-title">{copy.blueprintIntelTitle}</div>
            <p className="card-section-subtitle" style={{ marginTop: 8 }}>
              {copy.blueprintIntelBody}
            </p>

            <div className="grid two" style={{ gap: 14, marginTop: 12 }}>
              <div className="card-soft" style={{ background: '#ffffff' }}>
                <div className="muted">{copy.blueprintDetectedSheets}</div>
                {detectedSheets.length ? (
                  <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
                    {detectedSheets.slice(0, 10).map((sheet) => (
                      <div key={sheet.id} className="card-soft" style={{ background: '#f8f7ef' }}>
                        <div style={{ fontWeight: 800 }}>
                          {sheet.sheetNumber} · {sheet.sheetTitle}
                        </div>
                        <div className="muted" style={{ marginTop: 6 }}>
                          {copy.blueprintDiscipline}: {disciplineLabel(sheet.discipline)}
                        </div>
                        <div className="muted" style={{ marginTop: 4 }}>
                          {copy.blueprintPageLabel}: {sheet.page || '—'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="card-section-subtitle" style={{ marginTop: 8 }}>{copy.blueprintNoSheets}</p>
                )}
              </div>

              <div className="card-soft" style={{ background: '#ffffff' }}>
                <div className="muted">{copy.blueprintSheetsTitle}</div>
                <p className="card-section-subtitle" style={{ marginTop: 8 }}>
                  {copy.blueprintSheetsBody}
                </p>
                {blueprintScopeMatches.length ? (
                  <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
                    {blueprintScopeMatches.map((sheet) => (
                      <div key={`blueprint-match-${sheet.id}`} className="card-soft" style={{ background: '#f8f7ef' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                          <div style={{ fontWeight: 800 }}>
                            {sheet.sheetNumber} · {sheet.sheetTitle}
                          </div>
                          <span className="badge">
                            {copy.blueprintMatchScore}: {sheet.score}
                          </span>
                        </div>
                        <div className="muted" style={{ marginTop: 6 }}>
                          {copy.blueprintDiscipline}: {disciplineLabel(sheet.discipline)}
                        </div>
                        {sheet.nearbySignals?.length ? (
                          <div style={{ marginTop: 10 }}>
                            <div className="muted">{copy.blueprintNearbySignals}</div>
                            <ul style={{ margin: '8px 0 0 18px', padding: 0 }}>
                              {sheet.nearbySignals.map((item) => (
                                <li key={`sheet-signal-${sheet.id}-${item}`} style={{ marginTop: 4 }}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="card-section-subtitle" style={{ marginTop: 8 }}>{copy.blueprintSheetsEmpty}</p>
                )}
              </div>
            </div>

            <div className="card-soft" style={{ marginTop: 14, background: '#ffffff' }}>
              <div className="muted">{copy.blueprintExclusionsTitle}</div>
              {likelyExclusions.length ? (
                <ul style={{ margin: '10px 0 0 18px', padding: 0 }}>
                  {likelyExclusions.map((item) => (
                    <li key={`likely-exclusion-${item}`} style={{ marginTop: 4 }}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="card-section-subtitle" style={{ marginTop: 8 }}>{copy.blueprintExclusionsEmpty}</p>
              )}
            </div>
          </div>

          <div className="card-soft" style={{ marginTop: 16, background: '#eef5ff' }}>
            <div className="card-section-title">{copy.blueprintScopeLocationTitle}</div>
            <p className="card-section-subtitle" style={{ marginTop: 8 }}>
              {copy.blueprintScopeLocationBody}
            </p>

            {pageAwareMatches.length ? (
              <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
                {pageAwareMatches.map((item) => (
                  <div key={`page-aware-${item.id}`} className="card-soft" style={{ background: '#ffffff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                      <div style={{ fontWeight: 800 }}>
                        {item.sheetNumber} · {item.sheetTitle}
                      </div>
                      <span className="badge">
                        {copy.blueprintMatchScore}: {item.score}
                      </span>
                    </div>
                    <div className="muted" style={{ marginTop: 6 }}>
                      {copy.blueprintPageLabel}: {item.page || '—'} · {copy.blueprintDiscipline}: {disciplineLabel(item.discipline)}
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <div className="muted">{copy.blueprintEvidenceExcerpt}</div>
                      <div style={{ marginTop: 6, lineHeight: 1.7 }}>
                        {item.evidenceExcerpt || item.evidenceBlock || 'No nearby evidence excerpt.'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="card-section-subtitle" style={{ marginTop: 8 }}>
                {copy.blueprintScopeLocationEmpty}
              </p>
            )}
          </div>

          <div className="card-soft" style={{ marginTop: 16, background: '#eef7ff' }}>
            <div className="card-section-title">{copy.scopeFocusTitle}</div>
            {scopeTarget.trim() ? (
              <div style={{ display: 'grid', gap: 14, marginTop: 12 }}>
                <div className="grid two" style={{ gap: 14 }}>
                  <div className="card-soft" style={{ background: '#ffffff' }}>
                    <div className="muted">{copy.scopeFocusSummary}</div>
                    <div style={{ marginTop: 8, lineHeight: 1.7 }}>
                      <strong>{titleCase(scopeTarget)}</strong><br />
                      {targetedScopeAnalysis.summary || copy.scopeFocusNoMatch}<br />
                      Match score: {targetedScopeAnalysis.matchScore}/100
                    </div>
                  </div>

                  <div className="card-soft" style={{ background: '#ffffff' }}>
                    <div className="muted">{copy.scopeFocusCrew}</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                      {(targetedScopeAnalysis.crewFocus || []).length ? targetedScopeAnalysis.crewFocus.map((item) => (
                        <span key={`target-crew-${item}`} className="badge">{titleCase(item)}</span>
                      )) : <span className="badge">No strong crew focus yet</span>}
                    </div>
                  </div>
                </div>

                <div className="card-soft" style={{ background: '#ffffff' }}>
                  <div className="muted">{copy.scopeFocusWork}</div>
                  {(targetedScopeAnalysis.workTypes || []).length ? (
                    <ul style={{ margin: '10px 0 0 18px', padding: 0 }}>
                      {targetedScopeAnalysis.workTypes.map((item) => (
                        <li key={`target-work-${item}`} style={{ marginTop: 4 }}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <div style={{ marginTop: 10 }}>{copy.scopeFocusNoMatch}</div>
                  )}
                </div>

                <div className="grid two" style={{ gap: 14 }}>
                  <div className="card-soft" style={{ background: '#ffffff' }}>
                    <div className="muted">{copy.scopeFocusMaterials}</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                      {(targetedScopeAnalysis.materials || []).length ? targetedScopeAnalysis.materials.map((item) => (
                        <span key={`target-material-${item}`} className="badge">{titleCase(item)}</span>
                      )) : <span className="badge">No direct materials isolated yet</span>}
                    </div>
                  </div>

                  <div className="card-soft" style={{ background: '#ffffff' }}>
                    <div className="muted">{copy.scopeFocusRisks}</div>
                    {(targetedScopeAnalysis.risks || []).length ? (
                      <ul style={{ margin: '10px 0 0 18px', padding: 0 }}>
                        {targetedScopeAnalysis.risks.map((item) => (
                          <li key={`target-risk-${item}`} style={{ marginTop: 4 }}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <div style={{ marginTop: 10 }}>No major targeted risk notes yet.</div>
                    )}
                  </div>
                </div>

                <div className="card-soft" style={{ background: '#ffffff' }}>
                  <div className="muted">{copy.scopeFocusEvidence}</div>
                  {(targetedScopeAnalysis.evidence || []).length ? (
                    <div className="grid" style={{ gap: 10, marginTop: 10 }}>
                      {targetedScopeAnalysis.evidence.map((item, index) => (
                        <div key={`target-evidence-${index}`} className="card-soft" style={{ background: '#f8f7ef' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                            <div style={{ fontWeight: 800 }}>{item.sourceFile}</div>
                            <span className="badge">{Math.round((item.confidence || 0) * 100)}%</span>
                          </div>
                          <div style={{ marginTop: 8, lineHeight: 1.7 }}>{item.snippet}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ marginTop: 10 }}>{copy.scopeFocusNoMatch}</div>
                  )}
                </div>
              </div>
            ) : (
              <p className="card-section-subtitle" style={{ marginTop: 8 }}>
                Add a specific scope above if you only need your trade isolated inside the larger bid package.
              </p>
            )}
          </div>

          <div className="card-soft" style={{ marginTop: 16 }}>
            <div className="card-section-title">{copy.summaryLabel}</div>
            {(projectNotes.trim() || extractedText.trim()) ? (
              <div style={{ marginTop: 10, display: 'grid', gap: 12 }}>
                <div><strong>Scope:</strong> {effectiveProjectSummary.detectedScope || effectiveProjectSummary.summary}</div>
                <div><strong>Project summary:</strong> {effectiveProjectSummary.summary}</div>

                {effectiveProjectSummary.why?.length ? (
                  <div>
                    <strong>Why:</strong>
                    <ul style={{ margin: '8px 0 0 18px', padding: 0 }}>
                      {effectiveProjectSummary.why.map((item) => (
                        <li key={`why-${item}`} style={{ marginTop: 4 }}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {effectiveProjectSummary.sheetDetails?.length ? (
                  <div>
                    <strong>Sheet details recognized:</strong>
                    <ul style={{ margin: '8px 0 0 18px', padding: 0 }}>
                      {effectiveProjectSummary.sheetDetails.map((item) => (
                        <li key={`sheet-detail-${item}`} style={{ marginTop: 4 }}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {effectiveProjectSummary.components?.length ? (
                  <div>
                    <strong>Components identified:</strong>
                    <ul style={{ margin: '8px 0 0 18px', padding: 0 }}>
                      {effectiveProjectSummary.components.map((item) => (
                        <li key={`component-${item}`} style={{ marginTop: 4 }}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div><strong>High confidence trades:</strong> {effectiveProjectSummary.primaryTrades?.length ? effectiveProjectSummary.primaryTrades.join(', ') : 'General construction'}</div>
                <div><strong>Secondary trades:</strong> {effectiveProjectSummary.secondaryTrades?.length ? effectiveProjectSummary.secondaryTrades.join(', ') : 'None detected'}</div>
                <div><strong>Not evidenced on this sheet:</strong> {effectiveProjectSummary.ignoredTrades?.length ? effectiveProjectSummary.ignoredTrades.join(', ') : 'None flagged'}</div>
                <div><strong>Supplier categories:</strong> {effectiveProjectSummary.supplierCategories?.length ? effectiveProjectSummary.supplierCategories.join(', ') : 'General materials'}</div>
                <div><strong>Likely materials:</strong> {effectiveProjectSummary.materials.length ? effectiveProjectSummary.materials.join(', ') : 'General materials'}</div>

                {effectiveProjectSummary.fieldChecks?.length ? (
                  <div>
                    <strong>Field checks needed:</strong>
                    <ul style={{ margin: '8px 0 0 18px', padding: 0 }}>
                      {effectiveProjectSummary.fieldChecks.map((item) => (
                        <li key={`field-check-${item}`} style={{ marginTop: 4 }}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {effectiveProjectSummary.nextActions?.length ? (
                  <div>
                    <strong>Next actions:</strong>
                    <ul style={{ margin: '8px 0 0 18px', padding: 0 }}>
                      {effectiveProjectSummary.nextActions.map((item) => (
                        <li key={`next-action-${item}`} style={{ marginTop: 4 }}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {(projectDetailSummary.dimensions.length ||
                  projectDetailSummary.steelGauge.length ||
                  projectDetailSummary.pipeSizes.length ||
                  projectDetailSummary.cmuSizes.length ||
                  projectDetailSummary.footingNotes.length ||
                  projectDetailSummary.gateDoorNotes.length ||
                  projectDetailSummary.detailLines.length) ? (
                  <div>
                    <strong>Refined details extracted:</strong>

                    {projectDetailSummary.dimensions.length ? (
                      <div style={{ marginTop: 8 }}>
                        <strong>Dimensions / measurements:</strong>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                          {projectDetailSummary.dimensions.slice(0, 12).map((item) => (
                            <span key={`detail-dimension-${item}`} className="badge">{item}</span>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {(projectDetailSummary.steelGauge.length ||
                      projectDetailSummary.pipeSizes.length ||
                      projectDetailSummary.cmuSizes.length) ? (
                      <div style={{ marginTop: 10, display: 'grid', gap: 6 }}>
                        <strong>Spec clues:</strong>
                        {projectDetailSummary.steelGauge.length ? (
                          <div><strong>Steel gauge:</strong> {projectDetailSummary.steelGauge.join(', ')}</div>
                        ) : null}
                        {projectDetailSummary.pipeSizes.length ? (
                          <div><strong>Pipe / post sizes:</strong> {projectDetailSummary.pipeSizes.join(', ')}</div>
                        ) : null}
                        {projectDetailSummary.cmuSizes.length ? (
                          <div><strong>CMU / wall sizes:</strong> {projectDetailSummary.cmuSizes.join(', ')}</div>
                        ) : null}
                      </div>
                    ) : null}

                    {projectDetailSummary.gateDoorNotes.length ? (
                      <div style={{ marginTop: 10 }}>
                        <strong>Gate / door detail lines:</strong>
                        <ul style={{ margin: '8px 0 0 18px', padding: 0 }}>
                          {projectDetailSummary.gateDoorNotes.map((item) => (
                            <li key={`detail-gate-${item}`} style={{ marginTop: 4 }}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {projectDetailSummary.footingNotes.length ? (
                      <div style={{ marginTop: 10 }}>
                        <strong>Footing / concrete detail lines:</strong>
                        <ul style={{ margin: '8px 0 0 18px', padding: 0 }}>
                          {projectDetailSummary.footingNotes.map((item) => (
                            <li key={`detail-footing-${item}`} style={{ marginTop: 4 }}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {projectDetailSummary.detailLines.length ? (
                      <div style={{ marginTop: 10 }}>
                        <strong>High-signal OCR lines:</strong>
                        <ul style={{ margin: '8px 0 0 18px', padding: 0 }}>
                          {projectDetailSummary.detailLines.map((item) => (
                            <li key={`detail-line-${item}`} style={{ marginTop: 4 }}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {projectDetailSummary.verification.length ? (
                      <div style={{ marginTop: 10 }}>
                        <strong>Needs verification:</strong>
                        <ul style={{ margin: '8px 0 0 18px', padding: 0 }}>
                          {projectDetailSummary.verification.map((item) => (
                            <li key={`detail-verify-${item}`} style={{ marginTop: 4 }}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <div><strong>Crew note:</strong> {effectiveProjectSummary.crewSuggestion}</div>
              </div>
            ) : (
              <p className="card-section-subtitle" style={{ marginTop: 8 }}>{copy.noSummary}</p>
            )}
          </div>


          <div className="card-soft" style={{ marginTop: 16 }}>
            <div className="card-section-title">{copy.projectPackageTitle}</div>
            <p className="card-section-subtitle" style={{ marginTop: 8 }}>
              {copy.projectPackageBody}
            </p>

            {projectEngine ? (
              <div style={{ display: 'grid', gap: 14, marginTop: 12 }}>
                <div className="grid two" style={{ gap: 14 }}>
                  <div className="card-soft" style={{ background: '#ffffff' }}>
                    <div className="muted">{copy.projectPackageScope}</div>
                    <div style={{ marginTop: 8, lineHeight: 1.7 }}>
                      <strong>{analyzerProjectPackage.project_name || 'Unnamed Project'}</strong><br />
                      {analyzerProjectPackage.summary || '—'}<br />
                      {analyzerProjectPackage.primary_zip || '—'} · {analyzerProjectPackage.project_type || '—'}<br />
                      {analyzerProjectPackage.square_footage ? `${Number(analyzerProjectPackage.square_footage).toLocaleString()} SF` : 'Square footage not detected'}
                    </div>
                  </div>

                  <div className="card-soft" style={{ background: '#ffffff' }}>
                    <div className="muted">{copy.projectPackagePermits}</div>
                    <div style={{ marginTop: 8, lineHeight: 1.7 }}>
                      Readiness: {analyzerProjectPackage.permit_readiness_score || 0}/100<br />
                      Required permits: {(analyzerProjectPackage.required_permits || []).join(', ') || '—'}<br />
                      Missing inputs: {(analyzerProjectPackage.permit_missing_inputs || []).join(' | ') || 'None'}
                    </div>
                  </div>
                </div>

                <div className="grid two" style={{ gap: 14 }}>
                  <div className="card-soft" style={{ background: '#ffffff' }}>
                    <div className="muted">{copy.projectPackageMaterials}</div>
                    {(analyzerProjectPackage.materials || []).length ? (
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                        {analyzerProjectPackage.materials.map((item) => (
                          <span key={`pkg-material-${item.material}`} className="badge">
                            {item.label} · {item.priority}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div style={{ marginTop: 10 }}>{copy.engineNoMaterials}</div>
                    )}
                  </div>

                  <div className="card-soft" style={{ background: '#ffffff' }}>
                    <div className="muted">{copy.projectPackageSupplierSignals}</div>
                    <div style={{ marginTop: 8, lineHeight: 1.7 }}>
                      {(analyzerProjectPackage.supplier_signals || []).join(', ') || 'No supplier signals yet.'}<br />
                      Supplier matches: {analyzerProjectPackage.supplier_matches || 0}<br />
                      Crew matches: {analyzerProjectPackage.crew_matches || 0}<br />
                      Delivery matches: {analyzerProjectPackage.delivery_matches || 0}
                    </div>
                  </div>
                </div>

                <div className="card-soft" style={{ background: '#ffffff' }}>
                  <div className="muted">{copy.projectPackageDeliveryLane}</div>
                  <div style={{ marginTop: 8, lineHeight: 1.7 }}>
                    {deliveryLaneLabel(analyzerProjectPackage.delivery_lane || '') || '—'}<br />
                    {analyzerProjectPackage.delivery_notes || 'No delivery notes yet.'}
                  </div>
                </div>

                <div className="card-soft" style={{ background: '#ffffff' }}>
                  <div className="muted">{copy.projectPackageFormatted}</div>
                  <pre style={{ marginTop: 10, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
{analyzerProjectPackageText}
                  </pre>
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button className="btn primary" type="button" onClick={copyAnalyzerProjectPackage}>
                    {copy.projectPackageCopy}
                  </button>
                  <button className="btn" type="button" onClick={downloadAnalyzerProjectPackagePdf}>
                    {copy.projectPackagePdf}
                  </button>
                </div>
              </div>
            ) : (
              <p className="card-section-subtitle" style={{ marginTop: 8 }}>{copy.projectPackageEmpty}</p>
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