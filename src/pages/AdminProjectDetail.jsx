import React, { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import jsPDF from 'jspdf'
import { autoTable } from 'jspdf-autotable'

const PROJECT_STATUSES = [
  { value: 'lead', label: 'Lead' },
  { value: 'estimating', label: 'Estimating' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' }
]

const PERMIT_STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'revisions_required', label: 'Revisions Required' },
  { value: 'approved', label: 'Approved' }
]

const PROJECT_TYPE_OPTIONS = [
  { value: '', label: 'Select project type' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'residential', label: 'Residential' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'civil_site', label: 'Civil / Site' },
  { value: 'tenant_improvement', label: 'Tenant Improvement' },
  { value: 'remodel', label: 'Remodel / Renovation' }
]

const PERMIT_TYPE_OPTIONS = [
  'Building',
  'Structural',
  'Electrical',
  'Mechanical',
  'Plumbing',
  'Fire',
  'Site / Civil',
  'Demolition',
  'Utilities',
  'Accessibility',
  'Zoning / Planning'
]

const EMBEDDED_PERMIT_META_START = '[[SURPLOX_PROJECT_META_START]]'
const EMBEDDED_PERMIT_META_END = '[[SURPLOX_PROJECT_META_END]]'

function money(value) {
  const number = Number(value || 0)
  return `$${number.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function safeNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function normalizePermitMetadata(value = {}) {
  const permitTypes = Array.isArray(value.permit_types)
    ? value.permit_types.map((item) => String(item || '').trim()).filter(Boolean)
    : []

  const normalizedScopes = Array.isArray(value.scopes)
    ? value.scopes.map((item) => String(item || '').trim()).filter(Boolean)
    : typeof value.scopes === 'string'
      ? value.scopes
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      : []

  return {
    location_city: String(value.location_city || '').trim(),
    location_county: String(value.location_county || '').trim(),
    location_state: String(value.location_state || 'TX').trim() || 'TX',
    location_zip: String(value.location_zip || '').replace(/\D/g, '').slice(0, 5),
    project_type: String(value.project_type || '').trim(),
    square_footage: String(value.square_footage || '').trim(),
    estimated_value: String(value.estimated_value || '').trim(),
    scopes: normalizedScopes,
    permit_required: value.permit_required !== false,
    permit_status: String(value.permit_status || 'not_started').trim() || 'not_started',
    jurisdiction: String(value.jurisdiction || '').trim(),
    permit_types: permitTypes,
    intake_notes: String(value.intake_notes || '').trim()
  }
}

function getEmbeddedPermitMetadata(notes = '') {
  const text = String(notes || '')
  const start = text.indexOf(EMBEDDED_PERMIT_META_START)
  const end = text.indexOf(EMBEDDED_PERMIT_META_END)

  if (start === -1 || end === -1 || end <= start) return normalizePermitMetadata()

  const jsonText = text
    .slice(start + EMBEDDED_PERMIT_META_START.length, end)
    .trim()

  if (!jsonText) return normalizePermitMetadata()

  try {
    return normalizePermitMetadata(JSON.parse(jsonText))
  } catch (error) {
    console.error('Unable to parse embedded permit metadata', error)
    return normalizePermitMetadata()
  }
}

function stripEmbeddedPermitMetadata(notes = '') {
  const text = String(notes || '')
  const start = text.indexOf(EMBEDDED_PERMIT_META_START)
  const end = text.indexOf(EMBEDDED_PERMIT_META_END)

  if (start === -1 || end === -1 || end <= start) return text.trim()

  return `${text.slice(0, start)}${text.slice(end + EMBEDDED_PERMIT_META_END.length)}`.trim()
}

function mergePermitMetadataIntoNotes(visibleNotes = '', permitMeta = {}) {
  const cleanVisibleNotes = stripEmbeddedPermitMetadata(visibleNotes)
  const metadataBlock = `${EMBEDDED_PERMIT_META_START}\n${JSON.stringify(normalizePermitMetadata(permitMeta), null, 2)}\n${EMBEDDED_PERMIT_META_END}`
  return cleanVisibleNotes ? `${cleanVisibleNotes}\n\n${metadataBlock}` : metadataBlock
}

function normalizeProject(record) {
  const embeddedPermitMeta = getEmbeddedPermitMetadata(record?.notes || '')

  return {
    ...record,
    project_status: record?.project_status || 'active',
    project_phase: record?.project_phase || '',
    project_next_action: record?.project_next_action || '',
    is_active_job: !!record?.is_active_job,
    job_started_at: record?.job_started_at || '',
    notes: stripEmbeddedPermitMetadata(record?.notes || ''),
    permit_meta: embeddedPermitMeta
  }
}

function materialTotal(row) {
  return Number(row.quantity || 0) * Number(row.unit_cost || 0)
}

function inferPermitSignals(project, materials = []) {
  const haystack = [
    project?.project || '',
    project?.notes || '',
    project?.project_phase || '',
    project?.project_next_action || '',
    ...materials.map((row) => [row.item_name, row.supplier_name, row.notes].filter(Boolean).join(' '))
  ]
    .join(' ')
    .toLowerCase()

  const matches = []

  const rules = [
    { label: 'Building', terms: ['building', 'framing', 'drywall', 'roof', 'remodel', 'tenant'] },
    { label: 'Structural', terms: ['steel', 'rebar', 'foundation', 'footing', 'structural', 'concrete'] },
    { label: 'Electrical', terms: ['electrical', 'lighting', 'panel', 'conduit', 'wire'] },
    { label: 'Mechanical', terms: ['mechanical', 'hvac', 'air handler', 'duct'] },
    { label: 'Plumbing', terms: ['plumbing', 'pipe', 'water line', 'sanitary', 'fixture'] },
    { label: 'Fire', terms: ['fire', 'sprinkler', 'alarm'] },
    { label: 'Site / Civil', terms: ['site', 'grading', 'drainage', 'paving', 'asphalt', 'utility trench'] },
    { label: 'Demolition', terms: ['demo', 'demolition'] },
    { label: 'Accessibility', terms: ['ada', 'accessible', 'accessibility'] }
  ]

  rules.forEach((rule) => {
    if (rule.terms.some((term) => haystack.includes(term))) {
      matches.push(rule.label)
    }
  })

  return Array.from(new Set(matches))
}

function calculatePermitReadiness(permitMeta, project, materials) {
  let score = 0
  const blockers = []

  if (String(project?.company || '').trim()) score += 8
  else blockers.push('Client / company is missing.')

  if (String(project?.project || '').trim()) score += 8
  else blockers.push('Project name is missing.')

  if (String(permitMeta.location_city || '').trim()) score += 10
  else blockers.push('Project city is missing.')

  if (String(permitMeta.location_county || '').trim()) score += 8
  else blockers.push('County is missing.')

  if (String(permitMeta.location_zip || '').trim()) score += 8
  else blockers.push('Project ZIP is missing.')

  if (String(permitMeta.jurisdiction || '').trim()) score += 12
  else blockers.push('Jurisdiction has not been set.')

  if (String(permitMeta.project_type || '').trim()) score += 10
  else blockers.push('Project type is not set.')

  if (permitMeta.scopes.length > 0) score += 10
  else blockers.push('Scope classification is still blank.')

  if (permitMeta.permit_types.length > 0) score += 12
  else blockers.push('Permit types have not been selected.')

  if (String(permitMeta.square_footage || '').trim()) score += 7
  else blockers.push('Square footage is missing.')

  if (String(permitMeta.estimated_value || '').trim()) score += 7
  else blockers.push('Estimated value is missing.')

  if (!permitMeta.permit_required) score += 8
  else if (permitMeta.permit_status !== 'not_started') score += 8
  else blockers.push('Permit status is still set to not started.')

  if (materials.length > 0) score += 8
  else blockers.push('No project materials or cost items have been logged yet.')

  return {
    score: Math.min(score, 100),
    blockers
  }
}


function getPermitRequirements({ scopes = [], materials = [], projectType = '' }) {
  const required_permits = []
  const missing_inputs = []
  const warnings = []

  const normalizedScopes = Array.isArray(scopes)
    ? scopes.map((item) => String(item || '').trim().toLowerCase()).filter(Boolean)
    : []

  const materialHaystack = (materials || [])
    .map((row) => [row.item_name, row.notes, row.supplier_name].filter(Boolean).join(' '))
    .join(' ')
    .toLowerCase()

  if (normalizedScopes.some((item) => item.includes('electrical')) || /electrical|lighting|panel|conduit|wire/.test(materialHaystack)) {
    required_permits.push('Electrical')
  }

  if (normalizedScopes.some((item) => item.includes('plumbing')) || /plumbing|pipe|water line|sanitary|fixture/.test(materialHaystack)) {
    required_permits.push('Plumbing')
  }

  if (
    normalizedScopes.some((item) => item.includes('mechanical') || item.includes('hvac')) ||
    /mechanical|hvac|duct|air handler/.test(materialHaystack)
  ) {
    required_permits.push('Mechanical')
  }

  if (
    normalizedScopes.some((item) => item.includes('concrete') || item.includes('foundation') || item.includes('steel') || item.includes('masonry')) ||
    /concrete|foundation|footing|rebar|steel|cmu|masonry/.test(materialHaystack)
  ) {
    required_permits.push('Structural')
  }

  if (
    normalizedScopes.some((item) => item.includes('framing') || item.includes('building') || item.includes('drywall') || item.includes('roof')) ||
    ['commercial', 'industrial', 'residential', 'tenant_improvement', 'remodel'].includes(String(projectType || '').trim())
  ) {
    required_permits.push('Building')
  }

  if (
    normalizedScopes.some((item) => item.includes('sitework') || item.includes('site') || item.includes('civil')) ||
    /site|grading|drainage|paving|asphalt|parking|bollard/.test(materialHaystack)
  ) {
    required_permits.push('Site / Civil')
  }

  if (!normalizedScopes.length) missing_inputs.push('Project scopes not defined yet.')
  if (!String(projectType || '').trim()) missing_inputs.push('Project type is still missing.')
  if (!(materials || []).length) warnings.push('No materials logged yet, so permit detection may still be incomplete.')

  return {
    required_permits: Array.from(new Set(required_permits)),
    missing_inputs,
    warnings
  }
}


function getJurisdictionRequirements(city = '', projectType = '') {
  const normalizedCity = String(city || '').trim().toLowerCase()
  const normalizedType = String(projectType || '').trim().toLowerCase()

  const base = {
    required_documents: ['Project Description', 'Scope Summary'],
    required_fields: ['location_city', 'location_county', 'location_zip', 'project_type'],
    review_lanes: ['Building'],
    warnings: []
  }

  const cityRules = {
    dallas: {
      commercial: {
        required_documents: ['Site Plan', 'Architectural Plans', 'Structural Drawings', 'MEP Plans'],
        required_fields: ['square_footage', 'estimated_value', 'jurisdiction'],
        review_lanes: ['Building', 'Structural', 'MEP', 'Planning']
      },
      tenant_improvement: {
        required_documents: ['Floor Plan', 'Life Safety Notes', 'MEP Plans'],
        required_fields: ['square_footage', 'estimated_value', 'jurisdiction'],
        review_lanes: ['Building', 'MEP']
      }
    },
    'fort worth': {
      commercial: {
        required_documents: ['Site Plan', 'Architectural Plans', 'Structural Drawings', 'MEP Plans'],
        required_fields: ['square_footage', 'estimated_value', 'jurisdiction'],
        review_lanes: ['Building', 'Structural', 'MEP']
      },
      civil_site: {
        required_documents: ['Civil Plan Set', 'Drainage / Grading Sheets', 'Utility Information'],
        required_fields: ['estimated_value', 'jurisdiction'],
        review_lanes: ['Civil', 'Utilities']
      }
    }
  }

  const cityMatch = cityRules[normalizedCity] || {}
  const typeMatch = cityMatch[normalizedType] || {}

  return {
    required_documents: Array.from(new Set([...(base.required_documents || []), ...(typeMatch.required_documents || [])])),
    required_fields: Array.from(new Set([...(base.required_fields || []), ...(typeMatch.required_fields || [])])),
    review_lanes: Array.from(new Set([...(base.review_lanes || []), ...(typeMatch.review_lanes || [])])),
    warnings: [
      ...(base.warnings || []),
      ...(typeMatch.warnings || []),
      !normalizedCity ? 'Jurisdiction city is not set, so city-specific checklist rules are limited.' : '',
      !normalizedType ? 'Project type is not set, so the jurisdiction checklist may be incomplete.' : ''
    ].filter(Boolean)
  }
}



function buildDeliveryPlanFromProject({ materials = [], permitMeta = {}, supplierSignals = [] }) {
  const heavyKeywords = ['concrete', 'rebar', 'steel', 'cmu', 'masonry', 'lumber', 'drywall']
  const heavyMaterialRows = (materials || []).filter((row) => {
    const haystack = [row.item_name, row.notes, row.supplier_name].filter(Boolean).join(' ').toLowerCase()
    return heavyKeywords.some((term) => haystack.includes(term))
  })

  const needsHeavyHaul = heavyMaterialRows.length > 0
  const primaryLane = needsHeavyHaul ? 'Material Delivery / Hot Shot' : 'Cargo Van / Local Delivery'

  const notes = []
  if (supplierSignals.length > 0) notes.push('Supplier pickup points are logged and can be routed into the delivery lane.')
  else notes.push('Add supplier sources to strengthen pickup routing.')
  if (needsHeavyHaul) notes.push('Heavy material signals detected, so trailer/payload matching matters.')
  else notes.push('Current material signals look lighter and may fit smaller delivery setups.')

  return {
    primary_lane: primaryLane,
    supplier_pickups: supplierSignals,
    heavy_material_count: heavyMaterialRows.length,
    notes
  }
}

function buildProjectPackage({
  project,
  permitMeta,
  permitRequirements,
  permitReadiness,
  jurisdictionRequirements,
  jurisdictionMissingFields,
  jurisdictionMissingDocuments,
  materials,
  assignedWorkers,
  supplierSignals,
  nextActions,
  riskLevel,
  profitability,
  totalValue,
  laborCost,
  materialCost,
  totalHours
}) {
  const materialRows = (materials || []).map((row) => ({
    item_name: String(row.item_name || '').trim(),
    supplier_name: String(row.supplier_name || '').trim(),
    quantity: Number(row.quantity || 0),
    unit_cost: Number(row.unit_cost || 0),
    total_cost: Number((Number(row.quantity || 0) * Number(row.unit_cost || 0)).toFixed(2)),
    notes: String(row.notes || '').trim()
  }))

  const deliveryPlan = buildDeliveryPlanFromProject({
    materials,
    permitMeta,
    supplierSignals
  })

  return {
    project_name: project?.project || '',
    client: project?.company || '',
    project_status: project?.project_status || '',
    project_phase: project?.project_phase || '',
    next_action: project?.project_next_action || '',
    location: {
      city: permitMeta.location_city || '',
      county: permitMeta.location_county || '',
      state: permitMeta.location_state || 'TX',
      zip: permitMeta.location_zip || '',
      jurisdiction: permitMeta.jurisdiction || ''
    },
    project_type: permitMeta.project_type || '',
    square_footage: permitMeta.square_footage || '',
    estimated_value: permitMeta.estimated_value || '',
    scopes: permitMeta.scopes || [],
    permit_summary: {
      permit_required: permitMeta.permit_required !== false,
      permit_status: permitMeta.permit_status || 'not_started',
      selected_permit_types: permitMeta.permit_types || [],
      ai_required_permits: permitRequirements.required_permits || [],
      readiness_score: permitReadiness.score,
      risk_level: riskLevel,
      missing_inputs: permitRequirements.missing_inputs || [],
      warnings: permitRequirements.warnings || [],
      blockers: permitReadiness.blockers || []
    },
    jurisdiction_summary: {
      review_lanes: jurisdictionRequirements.review_lanes || [],
      required_fields: jurisdictionRequirements.required_fields || [],
      required_documents: jurisdictionRequirements.required_documents || [],
      missing_fields: jurisdictionMissingFields || [],
      missing_documents: jurisdictionMissingDocuments || [],
      warnings: jurisdictionRequirements.warnings || []
    },
    execution_summary: {
      assigned_workers: (assignedWorkers || []).map((row) => ({
        worker_name: row.worker_name || '',
        role: row.role || ''
      })),
      materials: materialRows,
      supplier_signals: supplierSignals || [],
      delivery_plan: deliveryPlan,
      next_actions: nextActions || []
    },
    commercial_summary: {
      revenue: Number(totalValue || 0),
      labor_cost: Number(laborCost || 0),
      material_cost: Number(materialCost || 0),
      estimated_gross_margin: Number(profitability || 0),
      labor_hours: Number(totalHours || 0)
    },
    notes: {
      visible_project_notes: String(project?.notes || '').trim(),
      permit_intake_notes: String(permitMeta.intake_notes || '').trim()
    }
  }
}

function buildProjectPackageText(pkg) {
  return [
    `PROJECT PACKAGE`,
    ``,
    `PROJECT: ${pkg.project_name || 'Unnamed Project'}`,
    `CLIENT: ${pkg.client || 'Unknown Client'}`,
    `STATUS: ${pkg.project_status || '—'}`,
    `PHASE: ${pkg.project_phase || '—'}`,
    `NEXT ACTION: ${pkg.next_action || '—'}`,
    ``,
    `LOCATION`,
    `City: ${pkg.location?.city || '—'}`,
    `County: ${pkg.location?.county || '—'}`,
    `State: ${pkg.location?.state || '—'}`,
    `ZIP: ${pkg.location?.zip || '—'}`,
    `Jurisdiction: ${pkg.location?.jurisdiction || '—'}`,
    ``,
    `PROJECT PROFILE`,
    `Type: ${pkg.project_type || '—'}`,
    `Square Footage: ${pkg.square_footage || '—'}`,
    `Estimated Value: ${pkg.estimated_value || '—'}`,
    `Scopes: ${(pkg.scopes || []).join(', ') || '—'}`,
    ``,
    `PERMIT SUMMARY`,
    `Permit Required: ${pkg.permit_summary?.permit_required ? 'Yes' : 'No'}`,
    `Permit Status: ${pkg.permit_summary?.permit_status || '—'}`,
    `Selected Permits: ${(pkg.permit_summary?.selected_permit_types || []).join(', ') || '—'}`,
    `AI Required Permits: ${(pkg.permit_summary?.ai_required_permits || []).join(', ') || '—'}`,
    `Readiness Score: ${pkg.permit_summary?.readiness_score || 0}/100`,
    `Risk Level: ${pkg.permit_summary?.risk_level || '—'}`,
    `Missing Inputs: ${(pkg.permit_summary?.missing_inputs || []).join(' | ') || 'None'}`,
    `Warnings: ${(pkg.permit_summary?.warnings || []).join(' | ') || 'None'}`,
    `Blockers: ${(pkg.permit_summary?.blockers || []).join(' | ') || 'None'}`,
    ``,
    `JURISDICTION SUMMARY`,
    `Review Lanes: ${(pkg.jurisdiction_summary?.review_lanes || []).join(', ') || '—'}`,
    `Required Fields: ${(pkg.jurisdiction_summary?.required_fields || []).join(', ') || '—'}`,
    `Required Documents: ${(pkg.jurisdiction_summary?.required_documents || []).join(', ') || '—'}`,
    `Missing Fields: ${(pkg.jurisdiction_summary?.missing_fields || []).join(' | ') || 'None'}`,
    `Missing Documents: ${(pkg.jurisdiction_summary?.missing_documents || []).join(' | ') || 'None'}`,
    ``,
    `EXECUTION SUMMARY`,
    `Assigned Workers: ${(pkg.execution_summary?.assigned_workers || []).map((row) => row.worker_name).join(', ') || 'None'}`,
    `Suppliers: ${(pkg.execution_summary?.supplier_signals || []).join(', ') || 'None'}`,
    `Delivery Lane: ${pkg.execution_summary?.delivery_plan?.primary_lane || '—'}`,
    `Delivery Notes: ${(pkg.execution_summary?.delivery_plan?.notes || []).join(' | ') || 'None'}`,
    `Next Actions: ${(pkg.execution_summary?.next_actions || []).join(' | ') || 'None'}`,
    ``,
    `COMMERCIAL SUMMARY`,
    `Revenue: $${Number(pkg.commercial_summary?.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    `Labor Cost: $${Number(pkg.commercial_summary?.labor_cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    `Material Cost: $${Number(pkg.commercial_summary?.material_cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    `Estimated Gross Margin: $${Number(pkg.commercial_summary?.estimated_gross_margin || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    `Labor Hours: ${Number(pkg.commercial_summary?.labor_hours || 0).toFixed(1)}`,
    ``,
    `NOTES`,
    `${pkg.notes?.permit_intake_notes || pkg.notes?.visible_project_notes || 'No notes yet.'}`
  ].join('\n')
}

function permitStatusTone(status) {
  if (status === 'approved') return { background: '#dcf4e5', color: '#177245' }
  if (status === 'submitted' || status === 'under_review') return { background: '#d8ecff', color: '#0d3f73' }
  if (status === 'revisions_required') return { background: '#fff0b4', color: '#111111' }
  if (status === 'in_progress') return { background: '#f1e7a8', color: '#111111' }
  return { background: '#ecebe3', color: '#111111' }
}

export default function AdminProjectDetail() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [invoices, setInvoices] = useState([])
  const [timeEntries, setTimeEntries] = useState([])
  const [materials, setMaterials] = useState([])
  const [assignedWorkers, setAssignedWorkers] = useState([])
  const [workerRates, setWorkerRates] = useState({})
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [savingInvoice, setSavingInvoice] = useState(false)
  const [clockingIn, setClockingIn] = useState(false)
  const [savingProjectMeta, setSavingProjectMeta] = useState(false)
  const [savingMaterial, setSavingMaterial] = useState(false)
  const [savingActiveJob, setSavingActiveJob] = useState(false)
  const [savingWorkerAssignment, setSavingWorkerAssignment] = useState(false)
  const [savingPermitMeta, setSavingPermitMeta] = useState(false)
  const [rfqs, setRfqs] = useState([])
  const [savingRfqId, setSavingRfqId] = useState('')

  const [invoiceForm, setInvoiceForm] = useState({
    type: 'invoice',
    status: 'draft',
    notes: '',
    items: [{ id: crypto.randomUUID(), label: '', amount: '' }]
  })

  const [timeForm, setTimeForm] = useState({
    worker: '',
    role: ''
  })

  const [projectMeta, setProjectMeta] = useState({
    project_status: 'active',
    project_phase: '',
    project_next_action: ''
  })

  const [permitForm, setPermitForm] = useState(normalizePermitMetadata())
  const [scopeInput, setScopeInput] = useState('')

  const [materialForm, setMaterialForm] = useState({
    item_name: '',
    supplier_name: '',
    quantity: '',
    unit_cost: '',
    notes: ''
  })

  const [workerForm, setWorkerForm] = useState({
    worker_name: '',
    role: ''
  })

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)

      try {
        const { data: crm, error: crmError } = await supabase
          .from('admin_crm_records')
          .select('*')
          .eq('id', id)
          .single()

        if (crmError) throw crmError
        if (!crm) {
          if (active) {
            setProject(null)
            setInvoices([])
            setTimeEntries([])
            setMaterials([])
            setAssignedWorkers([])
            setLoading(false)
          }
          return
        }

        const normalizedProject = normalizeProject(crm)

        const [invRes, timeRes, materialsRes, workersRes, adminWorkersRes, rfqsRes] = await Promise.all([
          supabase.from('admin_invoices').select('*'),
          supabase.from('admin_time_entries').select('*'),
          supabase.from('admin_project_materials').select('*').eq('project_record_id', id).order('created_at', { ascending: false }),
          supabase.from('admin_project_workers').select('*').eq('project_record_id', id).order('created_at', { ascending: false }),
          supabase.from('admin_workers').select('name, hourly_rate'),
          supabase.from('rfqs').select('*').eq('project_id', id).order('created_at', { ascending: false })
        ])

        if (invRes.error) throw invRes.error
        if (timeRes.error) throw timeRes.error
        if (materialsRes.error) throw materialsRes.error
        if (workersRes.error) throw workersRes.error
        if (adminWorkersRes.error) throw adminWorkersRes.error
        if (rfqsRes.error) throw rfqsRes.error
        if (!active) return

        const projectInvoices = (invRes.data || []).filter(
          (invoice) => invoice.project === normalizedProject.project && invoice.client === normalizedProject.company
        )

        const projectTime = (timeRes.data || []).filter(
          (entry) => entry.jobsite === normalizedProject.project
        )

        setProject(normalizedProject)
        setProjectMeta({
          project_status: normalizedProject.project_status || 'active',
          project_phase: normalizedProject.project_phase || '',
          project_next_action: normalizedProject.project_next_action || ''
        })
        setPermitForm(normalizedProject.permit_meta || normalizePermitMetadata())
        setScopeInput((normalizedProject.permit_meta?.scopes || []).join(', '))
        setInvoices(projectInvoices)
        setTimeEntries(projectTime)
        setMaterials(materialsRes.data || [])
        setAssignedWorkers(workersRes.data || [])
        setRfqs(rfqsRes.data || [])
        const rateMap = {}
        ;(adminWorkersRes.data || []).forEach((row) => {
          rateMap[String(row.name || '').trim()] = Number(row.hourly_rate || 0)
        })
        setWorkerRates(rateMap)
      } catch (error) {
        console.error(error)
        if (!active) return
        setProject(null)
      } finally {
        if (active) setLoading(false)
      }
    }

    load()

    
useEffect(() => {
  if (project?.id) fetchRFQs(project.id)
}, [project?.id])

return (
) => {
      active = false
    }
  }, [id])

  const totalValue = useMemo(() => {
    return invoices.reduce((sum, doc) => {
      return sum + (doc.items || []).reduce((inner, item) => inner + Number(item.amount || 0), 0)
    }, 0)
  }, [invoices])

  const totalPaid = useMemo(() => {
    return invoices.reduce((sum, doc) => sum + Number(doc.amount_paid || 0), 0)
  }, [invoices])

  const totalHours = useMemo(() => {
    return timeEntries.reduce((sum, entry) => {
      if (!entry.clock_out_at) return sum
      const diff = (new Date(entry.clock_out_at).getTime() - new Date(entry.clock_in_at).getTime()) / 3600000
      return sum + Math.max(diff, 0)
    }, 0)
  }, [timeEntries])

  const laborCost = useMemo(() => {
    return timeEntries.reduce((sum, entry) => {
      if (!entry.clock_out_at) return sum
      const diff = (new Date(entry.clock_out_at).getTime() - new Date(entry.clock_in_at).getTime()) / 3600000
      const hours = Math.max(diff, 0)
      const rate = workerRates[String(entry.worker || '').trim()] || 35
      return sum + hours * rate
    }, 0)
  }, [timeEntries, workerRates])
  const materialCost = useMemo(() => materials.reduce((sum, row) => sum + materialTotal(row), 0), [materials])
  const profitability = useMemo(() => totalValue - laborCost - materialCost, [totalValue, laborCost, materialCost])

  const activeCrew = useMemo(() => {
    if (!project?.project) return []
    return timeEntries.filter((entry) => !entry.clock_out_at && entry.jobsite === project.project)
  }, [timeEntries, project])

  const laborBreakdown = useMemo(() => {
    const map = new Map()

    timeEntries.forEach((entry) => {
      if (!entry.clock_out_at) return

      const workerName = String(entry.worker || '').trim() || 'Unknown Worker'
      const rate = workerRates[workerName] || 35
      const hours = Math.max(
        (new Date(entry.clock_out_at).getTime() - new Date(entry.clock_in_at).getTime()) / 3600000,
        0
      )
      const cost = hours * rate

      if (!map.has(workerName)) {
        map.set(workerName, {
          worker: workerName,
          role: entry.role || '',
          hours: 0,
          rate,
          cost: 0
        })
      }

      const current = map.get(workerName)
      current.hours += hours
      current.cost += cost
      current.rate = rate
      if (!current.role && entry.role) current.role = entry.role
    })

    return Array.from(map.values()).sort((a, b) => b.cost - a.cost)
  }, [timeEntries, workerRates])

  const permitSignals = useMemo(() => inferPermitSignals(project, materials), [project, materials])

  const permitReadiness = useMemo(() => {
    return calculatePermitReadiness(permitForm, project, materials)
  }, [permitForm, project, materials])

  const scopeSuggestions = useMemo(() => {
    return Array.from(new Set([...(permitForm.scopes || []), ...permitSignals]))
  }, [permitForm.scopes, permitSignals])


  const riskLevel = useMemo(() => {
    if (permitReadiness.score >= 80) return 'Low'
    if (permitReadiness.score >= 50) return 'Medium'
    return 'High'
  }, [permitReadiness.score])

  const supplierSignals = useMemo(() => {
    return Array.from(
      new Set(
        materials
          .map((row) => String(row.supplier_name || '').trim())
          .filter(Boolean)
      )
    )
  }, [materials])

  const nextActions = useMemo(() => {
    const actions = []

    if (permitForm.permit_required && permitForm.permit_status === 'not_started') {
      actions.push('Start permit application and intake routing.')
    }

    if (!String(permitForm.jurisdiction || '').trim()) {
      actions.push('Set the jurisdiction / permit authority for this project.')
    }

    if (!String(permitForm.location_city || '').trim()) {
      actions.push('Add the project city so permitting can be routed correctly.')
    }

    if (!String(permitForm.location_county || '').trim()) {
      actions.push('Add the project county for jurisdiction and review mapping.')
    }

    if ((permitReadiness.blockers || []).length > 0) {
      actions.push('Resolve the top permit readiness blockers before submission.')
    }

    if (materials.length === 0) {
      actions.push('Add material costs so scope and permit signals become stronger.')
    }

    if (assignedWorkers.length === 0) {
      actions.push('Assign workers or crew coverage to this project.')
    }

    if (!String(projectMeta.project_next_action || '').trim()) {
      actions.push('Record the next operational action for the team.')
    }

    return Array.from(new Set(actions)).slice(0, 6)
  }, [
    permitForm.permit_required,
    permitForm.permit_status,
    permitForm.jurisdiction,
    permitForm.location_city,
    permitForm.location_county,
    permitReadiness.blockers,
    materials.length,
    assignedWorkers.length,
    projectMeta.project_next_action
  ])


  const permitRequirements = useMemo(() => {
    return getPermitRequirements({
      scopes: permitForm.scopes || [],
      materials,
      projectType: permitForm.project_type
    })
  }, [permitForm.scopes, materials, permitForm.project_type])

  
  const permitIntakePackage = useMemo(() => {
    const pkg = {
      project_name: project?.project || '',
      client: project?.company || '',
      city: permitForm.location_city || '',
      county: permitForm.location_county || '',
      state: permitForm.location_state || 'TX',
      zip: permitForm.location_zip || '',
      jurisdiction: permitForm.jurisdiction || '',
      project_type: permitForm.project_type || '',
      square_footage: permitForm.square_footage || '',
      estimated_value: permitForm.estimated_value || '',
      scopes: permitForm.scopes || [],
      selected_permit_types: permitForm.permit_types || [],
      ai_required_permits: permitRequirements.required_permits || [],
      missing_inputs: permitRequirements.missing_inputs || [],
      warnings: permitRequirements.warnings || [],
      readiness_score: permitReadiness.score,
      risk_level: riskLevel,
      top_blockers: (permitReadiness.blockers || []).slice(0, 5),
      intake_notes: permitForm.intake_notes || ''
    }
    return pkg
  }, [
    project,
    permitForm,
    permitRequirements,
    permitReadiness,
    riskLevel
  ])

  const permitIntakeText = useMemo(() => {
    const p = permitIntakePackage
    return [
      `PROJECT: ${p.project_name}`,
      `CLIENT: ${p.client}`,
      `LOCATION: ${p.city}, ${p.county}, ${p.state} ${p.zip}`,
      `JURISDICTION: ${p.jurisdiction || 'TBD'}`,
      `TYPE: ${p.project_type || 'TBD'}`,
      `SF: ${p.square_footage || 'TBD'}`,
      `VALUE: ${p.estimated_value || 'TBD'}`,
      `SCOPES: ${(p.scopes || []).join(', ') || 'TBD'}`,
      `PERMITS (SELECTED): ${(p.selected_permit_types || []).join(', ') || 'None'}`,
      `PERMITS (AI): ${(p.ai_required_permits || []).join(', ') || 'None'}`,
      `READINESS: ${p.readiness_score}/100 (${p.risk_level})`,
      `BLOCKERS: ${(p.top_blockers || []).join(' | ') || 'None'}`,
      `MISSING: ${(p.missing_inputs || []).join(' | ') || 'None'}`,
      `WARNINGS: ${(p.warnings || []).join(' | ') || 'None'}`,
      `NOTES: ${p.intake_notes || ''}`
    ].join('\n')
  }, [permitIntakePackage])


  const jurisdictionRequirements = useMemo(() => {
    return getJurisdictionRequirements(permitForm.location_city, permitForm.project_type)
  }, [permitForm.location_city, permitForm.project_type])

  const jurisdictionMissingFields = useMemo(() => {
    return (jurisdictionRequirements.required_fields || []).filter((field) => {
      const value = permitForm?.[field]
      if (Array.isArray(value)) return value.length === 0
      return !String(value || '').trim()
    })
  }, [jurisdictionRequirements, permitForm])

  const jurisdictionMissingDocuments = useMemo(() => {
    const notesHaystack = [
      project?.notes || '',
      permitForm.intake_notes || '',
      ...materials.map((row) => [row.item_name, row.notes].filter(Boolean).join(' '))
    ].join(' ').toLowerCase()

    return (jurisdictionRequirements.required_documents || []).filter((doc) => {
      const normalized = String(doc || '').toLowerCase()
      if (normalized.includes('site plan')) return !/site plan/.test(notesHaystack)
      if (normalized.includes('architectural')) return !/architect|floor plan|elevation|section/.test(notesHaystack)
      if (normalized.includes('structural')) return !/structural|foundation|footing|rebar|steel/.test(notesHaystack)
      if (normalized.includes('mep')) return !/electrical|mechanical|plumbing|hvac/.test(notesHaystack)
      if (normalized.includes('civil')) return !/civil|grading|drainage|utility|paving/.test(notesHaystack)
      if (normalized.includes('project description')) return !String(project?.notes || '').trim()
      if (normalized.includes('scope summary')) return !(permitForm.scopes || []).length
      return false
    })
  }, [jurisdictionRequirements, project, permitForm, materials])

  const jurisdictionReady = useMemo(() => {
    return jurisdictionMissingFields.length === 0 && jurisdictionMissingDocuments.length === 0
  }, [jurisdictionMissingFields, jurisdictionMissingDocuments])


  function copyPermitIntake() {
    try {
      navigator.clipboard.writeText(permitIntakeText)
      setMessage('Permit intake package copied to clipboard.')
    } catch (e) {
      setMessage('Unable to copy package.')
    }
  }

const suggestedPermitTypes = useMemo(() => {
    return (permitRequirements.required_permits || []).filter(
      (type) => !(permitForm.permit_types || []).includes(type)
    )
  }, [permitRequirements, permitForm.permit_types])


  const projectPackage = useMemo(() => {
    return buildProjectPackage({
      project,
      permitMeta: permitForm,
      permitRequirements,
      permitReadiness,
      jurisdictionRequirements,
      jurisdictionMissingFields,
      jurisdictionMissingDocuments,
      materials,
      assignedWorkers,
      supplierSignals,
      nextActions,
      riskLevel,
      profitability,
      totalValue,
      laborCost,
      materialCost,
      totalHours
    })
  }, [
    project,
    permitForm,
    permitRequirements,
    permitReadiness,
    jurisdictionRequirements,
    jurisdictionMissingFields,
    jurisdictionMissingDocuments,
    materials,
    assignedWorkers,
    supplierSignals,
    nextActions,
    riskLevel,
    profitability,
    totalValue,
    laborCost,
    materialCost,
    totalHours
  ])

  const projectPackageText = useMemo(() => {
    return buildProjectPackageText(projectPackage)
  }, [projectPackage])

  const rfqMetrics = useMemo(() => {
    return {
      total: rfqs.length,
      pending: rfqs.filter((row) => row.status === 'pending').length,
      quoted: rfqs.filter((row) => row.status === 'quoted').length,
      selected: rfqs.filter((row) => row.status === 'selected').length
    }
  }, [rfqs])

  const quoteComparisonRows = useMemo(() => {
    return rfqs
      .filter((row) => row.price !== null && row.price !== undefined && String(row.price).trim() !== '')
      .slice()
      .sort((a, b) => Number(a.price || 0) - Number(b.price || 0))
  }, [rfqs])

  const recommendedQuote = useMemo(() => {
    return quoteComparisonRows[0] || null
  }, [quoteComparisonRows])

  function copyProjectPackage() {
    try {
      navigator.clipboard.writeText(projectPackageText)
      setMessage('Project package copied to clipboard.')
    } catch (error) {
      console.error(error)
      setMessage('Unable to copy project package right now.')
    }
  }

  function downloadProjectPackagePdf() {
    try {
      const pdf = new jsPDF('p', 'pt', 'a4')
      const left = 40
      const pageWidth = pdf.internal.pageSize.getWidth()

      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(18)
      pdf.text('Surplox Project Package', left, 44)

      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(11)
      pdf.text(`Project: ${projectPackage.project_name || 'Unnamed Project'}`, left, 68)
      pdf.text(`Client: ${projectPackage.client || 'Unknown Client'}`, left, 84)
      pdf.text(`Location: ${projectPackage.location.city || '—'}, ${projectPackage.location.county || '—'} ${projectPackage.location.zip || ''}`, left, 100)
      pdf.text(`Generated: ${new Date().toLocaleString()}`, left, 116)

      autoTable(pdf, {
        startY: 136,
        theme: 'grid',
        head: [['Project Profile', 'Value']],
        body: [
          ['Status', projectPackage.project_status || '—'],
          ['Phase', projectPackage.project_phase || '—'],
          ['Next Action', projectPackage.next_action || '—'],
          ['Project Type', projectPackage.project_type || '—'],
          ['Square Footage', projectPackage.square_footage || '—'],
          ['Estimated Value', projectPackage.estimated_value || '—'],
          ['Scopes', (projectPackage.scopes || []).join(', ') || '—']
        ],
        margin: { left: 40, right: 40 },
        styles: { fontSize: 10, cellPadding: 6 }
      })

      autoTable(pdf, {
        startY: pdf.lastAutoTable.finalY + 16,
        theme: 'grid',
        head: [['Permit Summary', 'Value']],
        body: [
          ['Permit Required', projectPackage.permit_summary.permit_required ? 'Yes' : 'No'],
          ['Permit Status', projectPackage.permit_summary.permit_status || '—'],
          ['Selected Permits', (projectPackage.permit_summary.selected_permit_types || []).join(', ') || '—'],
          ['AI Required Permits', (projectPackage.permit_summary.ai_required_permits || []).join(', ') || '—'],
          ['Readiness', `${projectPackage.permit_summary.readiness_score || 0}/100`],
          ['Risk', projectPackage.permit_summary.risk_level || '—'],
          ['Missing Inputs', (projectPackage.permit_summary.missing_inputs || []).join(' | ') || 'None'],
          ['Warnings', (projectPackage.permit_summary.warnings || []).join(' | ') || 'None'],
          ['Blockers', (projectPackage.permit_summary.blockers || []).join(' | ') || 'None']
        ],
        margin: { left: 40, right: 40 },
        styles: { fontSize: 10, cellPadding: 6 }
      })

      autoTable(pdf, {
        startY: pdf.lastAutoTable.finalY + 16,
        theme: 'grid',
        head: [['Jurisdiction Readiness', 'Value']],
        body: [
          ['Jurisdiction', projectPackage.location.jurisdiction || '—'],
          ['Review Lanes', (projectPackage.jurisdiction_summary.review_lanes || []).join(', ') || '—'],
          ['Required Fields', (projectPackage.jurisdiction_summary.required_fields || []).join(', ') || '—'],
          ['Missing Fields', (projectPackage.jurisdiction_summary.missing_fields || []).join(' | ') || 'None'],
          ['Required Documents', (projectPackage.jurisdiction_summary.required_documents || []).join(', ') || '—'],
          ['Missing Documents', (projectPackage.jurisdiction_summary.missing_documents || []).join(' | ') || 'None']
        ],
        margin: { left: 40, right: 40 },
        styles: { fontSize: 10, cellPadding: 6 }
      })

      autoTable(pdf, {
        startY: pdf.lastAutoTable.finalY + 16,
        theme: 'grid',
        head: [['Execution Summary', 'Value']],
        body: [
          ['Assigned Workers', (projectPackage.execution_summary.assigned_workers || []).map((row) => row.worker_name).join(', ') || 'None'],
          ['Suppliers', (projectPackage.execution_summary.supplier_signals || []).join(', ') || 'None'],
          ['Delivery Lane', projectPackage.execution_summary.delivery_plan.primary_lane || '—'],
          ['Delivery Notes', (projectPackage.execution_summary.delivery_plan.notes || []).join(' | ') || 'None'],
          ['Next Actions', (projectPackage.execution_summary.next_actions || []).join(' | ') || 'None']
        ],
        margin: { left: 40, right: 40 },
        styles: { fontSize: 10, cellPadding: 6 }
      })

      const materialBody = (projectPackage.execution_summary.materials || []).map((row) => [
        row.item_name || '—',
        row.supplier_name || '—',
        String(row.quantity || 0),
        money(row.unit_cost || 0),
        money(row.total_cost || 0)
      ])

      autoTable(pdf, {
        startY: pdf.lastAutoTable.finalY + 16,
        theme: 'grid',
        head: [['Materials', 'Supplier', 'Qty', 'Unit Cost', 'Total']],
        body: materialBody.length ? materialBody : [['No materials logged yet.', '', '', '', '']],
        margin: { left: 40, right: 40 },
        styles: { fontSize: 10, cellPadding: 6 }
      })

      autoTable(pdf, {
        startY: pdf.lastAutoTable.finalY + 16,
        theme: 'grid',
        head: [['Commercial Summary', 'Value']],
        body: [
          ['Revenue', money(projectPackage.commercial_summary.revenue || 0)],
          ['Labor Cost', money(projectPackage.commercial_summary.labor_cost || 0)],
          ['Material Cost', money(projectPackage.commercial_summary.material_cost || 0)],
          ['Estimated Gross Margin', money(projectPackage.commercial_summary.estimated_gross_margin || 0)],
          ['Labor Hours', Number(projectPackage.commercial_summary.labor_hours || 0).toFixed(1)]
        ],
        margin: { left: 40, right: 40 },
        styles: { fontSize: 10, cellPadding: 6 }
      })

      const finalY = pdf.lastAutoTable.finalY + 18
      const wrappedNotes = pdf.splitTextToSize(
        projectPackage.notes.permit_intake_notes || projectPackage.notes.visible_project_notes || 'No notes yet.',
        pageWidth - 80
      )
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(12)
      pdf.text('Notes', 40, finalY)
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(10)
      pdf.text(wrappedNotes, 40, finalY + 16)

      const filename = `${String(projectPackage.project_name || 'surplox-project-package').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'surplox-project-package'}.pdf`
      pdf.save(filename)
      setMessage('Project package PDF downloaded.')
    } catch (error) {
      console.error(error)
      setMessage('Unable to generate project package PDF right now.')
    }
  }

  async function handleUpdateRfq(rfqId, updates = {}) {
    try {
      setSavingRfqId(rfqId)
      setMessage('')
      const { data, error } = await supabase
        .from('rfqs')
        .update(updates)
        .eq('id', rfqId)
        .select('*')
        .single()

      if (error) throw error

      setRfqs((prev) => prev.map((row) => (row.id === rfqId ? data : row)))
      setMessage('RFQ updated.')
    } catch (error) {
      console.error(error)
      setMessage('Unable to update RFQ right now.')
    } finally {
      setSavingRfqId('')
    }
  }

  async function handleSelectRfq(rfqId) {
    try {
      setSavingRfqId(rfqId)
      setMessage('')

      const currentSelected = rfqs.find((row) => row.status === 'selected' && row.id !== rfqId)
      if (currentSelected) {
        const { error: resetError } = await supabase
          .from('rfqs')
          .update({ status: 'quoted' })
          .eq('id', currentSelected.id)
        if (resetError) throw resetError
      }

      const { data, error } = await supabase
        .from('rfqs')
        .update({ status: 'selected' })
        .eq('id', rfqId)
        .select('*')
        .single()

      if (error) throw error

      setRfqs((prev) =>
        prev.map((row) => {
          if (row.id === rfqId) return data
          if (row.status === 'selected') return { ...row, status: 'quoted' }
          return row
        })
      )
      setMessage('Supplier selected for this project.')
    } catch (error) {
      console.error(error)
      setMessage('Unable to select supplier right now.')
    } finally {
      setSavingRfqId('')
    }
  }

  function updateInvoiceItem(id, key, value) {
    setInvoiceForm((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === id ? { ...item, [key]: value } : item))
    }))
  }

  function addInvoiceItem() {
    setInvoiceForm((prev) => ({
      ...prev,
      items: [...prev.items, { id: crypto.randomUUID(), label: '', amount: '' }]
    }))
  }

  function removeInvoiceItem(id) {
    setInvoiceForm((prev) => ({
      ...prev,
      items: prev.items.length > 1 ? prev.items.filter((item) => item.id !== id) : prev.items
    }))
  }

  async function handleCreateInvoice(event) {
    event.preventDefault()
    if (!project) return

    const cleanedItems = (invoiceForm.items || [])
      .map((item) => ({
        id: item.id || crypto.randomUUID(),
        label: String(item.label || '').trim(),
        amount: String(item.amount || '').trim()
      }))
      .filter((item) => item.label || item.amount)

    if (cleanedItems.length === 0) {
      setMessage('Add at least one line item before creating an invoice.')
      return
    }

    setSavingInvoice(true)
    setMessage('')

    try {
      const payload = {
        type: invoiceForm.type,
        client: project.company || '',
        project: project.project || '',
        status: invoiceForm.status,
        notes: String(invoiceForm.notes || '').trim() || null,
        items: cleanedItems,
        amount_paid: 0,
        payment_received_at: null
      }

      const { data, error } = await supabase
        .from('admin_invoices')
        .insert(payload)
        .select('*')
        .single()

      if (error) throw error

      setInvoices((prev) => [data, ...prev])
      setInvoiceForm({
        type: 'invoice',
        status: 'draft',
        notes: '',
        items: [{ id: crypto.randomUUID(), label: '', amount: '' }]
      })
      setMessage('Invoice created for this project.')
    } catch (error) {
      console.error(error)
      setMessage('Unable to create invoice right now.')
    } finally {
      setSavingInvoice(false)
    }
  }

  async function handleClockIn(event) {
    event.preventDefault()
    if (!project) return
    if (!String(timeForm.worker || '').trim()) {
      setMessage('Worker name is required to clock into this project.')
      return
    }

    setClockingIn(true)
    setMessage('')

    try {
      const payload = {
        jobsite: project.project || '',
        worker: String(timeForm.worker || '').trim(),
        role: String(timeForm.role || '').trim() || null,
        clock_in_at: new Date().toISOString(),
        clock_out_at: null
      }

      const { data, error } = await supabase
        .from('admin_time_entries')
        .insert(payload)
        .select('*')
        .single()

      if (error) throw error

      setTimeEntries((prev) => [data, ...prev])
      setTimeForm({ worker: '', role: '' })
      setMessage('Worker clocked into this project.')
    } catch (error) {
      console.error(error)
      setMessage('Unable to clock worker in right now.')
    } finally {
      setClockingIn(false)
    }
  }

  async function handleSaveProjectMeta(event) {
    event.preventDefault()
    if (!project) return

    setSavingProjectMeta(true)
    setMessage('')

    try {
      const payload = {
        project_status: projectMeta.project_status,
        project_phase: String(projectMeta.project_phase || '').trim() || null,
        project_next_action: String(projectMeta.project_next_action || '').trim() || null
      }

      const { data, error } = await supabase
        .from('admin_crm_records')
        .update(payload)
        .eq('id', project.id)
        .select('*')
        .single()

      if (error) throw error

      const normalized = normalizeProject({ ...data, notes: project.notes || '' })
      setProject((prev) => ({ ...prev, ...normalized, permit_meta: prev?.permit_meta || normalized.permit_meta }))
      setProjectMeta({
        project_status: normalized.project_status || 'active',
        project_phase: normalized.project_phase || '',
        project_next_action: normalized.project_next_action || ''
      })
      setMessage('Project status and phase updated.')
    } catch (error) {
      console.error(error)
      setMessage('Unable to update project status right now.')
    } finally {
      setSavingProjectMeta(false)
    }
  }

  async function handleSavePermitMeta(event) {
    event.preventDefault()
    if (!project) return

    const nextPermitMeta = normalizePermitMetadata({
      ...permitForm,
      scopes: scopeInput
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    })

    setSavingPermitMeta(true)
    setMessage('')

    try {
      const nextNotes = mergePermitMetadataIntoNotes(project.notes || '', nextPermitMeta)

      const { data, error } = await supabase
        .from('admin_crm_records')
        .update({ notes: nextNotes })
        .eq('id', project.id)
        .select('*')
        .single()

      if (error) throw error

      const normalized = normalizeProject(data)
      setProject(normalized)
      setPermitForm(normalized.permit_meta || nextPermitMeta)
      setScopeInput((normalized.permit_meta?.scopes || []).join(', '))
      setMessage('Permitting foundation saved to this project.')
    } catch (error) {
      console.error(error)
      setMessage('Unable to save permitting data right now.')
    } finally {
      setSavingPermitMeta(false)
    }
  }

  async function handleAddMaterial(event) {
    event.preventDefault()
    if (!project) return
    if (!String(materialForm.item_name || '').trim()) {
      setMessage('Material item name is required.')
      return
    }

    setSavingMaterial(true)
    setMessage('')

    try {
      const payload = {
        project_record_id: project.id,
        project_name: project.project || '',
        client_name: project.company || '',
        item_name: String(materialForm.item_name || '').trim(),
        supplier_name: String(materialForm.supplier_name || '').trim() || null,
        quantity: Number(materialForm.quantity || 0),
        unit_cost: Number(materialForm.unit_cost || 0),
        notes: String(materialForm.notes || '').trim() || null
      }

      const { data, error } = await supabase
        .from('admin_project_materials')
        .insert(payload)
        .select('*')
        .single()

      if (error) throw error

      setMaterials((prev) => [data, ...prev])
      setMaterialForm({
        item_name: '',
        supplier_name: '',
        quantity: '',
        unit_cost: '',
        notes: ''
      })
      setMessage('Material cost added to this project.')
    } catch (error) {
      console.error(error)
      setMessage('Unable to add material right now.')
    } finally {
      setSavingMaterial(false)
    }
  }

  async function handleToggleActiveJob(nextValue) {
    if (!project) return

    setSavingActiveJob(true)
    setMessage('')

    try {
      if (nextValue) {
        await supabase
          .from('admin_crm_records')
          .update({ is_active_job: false })
          .eq('is_active_job', true)
      }

      const payload = {
        is_active_job: nextValue,
        job_started_at: nextValue ? new Date().toISOString() : null
      }

      const { data, error } = await supabase
        .from('admin_crm_records')
        .update(payload)
        .eq('id', project.id)
        .select('*')
        .single()

      if (error) throw error

      setProject((prev) => normalizeProject({ ...prev, ...data, notes: mergePermitMetadataIntoNotes(prev?.notes || '', prev?.permit_meta || normalizePermitMetadata()) }))
      setMessage(nextValue ? 'Active jobsite mode started.' : 'Active jobsite mode ended.')
    } catch (error) {
      console.error(error)
      setMessage('Unable to update active jobsite mode right now.')
    } finally {
      setSavingActiveJob(false)
    }
  }

  async function handleAssignWorker(event) {
    event.preventDefault()
    if (!project) return
    if (!String(workerForm.worker_name || '').trim()) {
      setMessage('Worker name is required.')
      return
    }

    setSavingWorkerAssignment(true)
    setMessage('')

    try {
      const payload = {
        project_record_id: project.id,
        project_name: project.project || '',
        worker_name: String(workerForm.worker_name || '').trim(),
        role: String(workerForm.role || '').trim() || null
      }

      const { data, error } = await supabase
        .from('admin_project_workers')
        .insert(payload)
        .select('*')
        .single()

      if (error) throw error

      setAssignedWorkers((prev) => [data, ...prev])
      setWorkerForm({ worker_name: '', role: '' })
      setMessage('Worker assigned to this project.')
    } catch (error) {
      console.error(error)
      setMessage('Unable to assign worker right now.')
    } finally {
      setSavingWorkerAssignment(false)
    }
  }

  async function handleRemoveWorker(id) {
    try {
      setMessage('')
      const { error } = await supabase.from('admin_project_workers').delete().eq('id', id)
      if (error) throw error
      setAssignedWorkers((prev) => prev.filter((worker) => worker.id !== id))
      setMessage('Worker removed from this project.')
    } catch (error) {
      console.error(error)
      setMessage('Unable to remove worker right now.')
    }
  }

  if (loading) return <div className="card">Loading project...</div>
  if (!project) return <div className="card">Project not found.</div>

  return (
    <div className="grid" style={{ gap: 18 }}>
      {message ? (
        <div className="card-message" style={{ padding: 14, borderRadius: 18 }}>
          {message}
        </div>
      ) : null}

      <div className="card rounded-xl" style={{ padding: 26, background: 'linear-gradient(180deg, #fff7c8 0%, #f7f7f2 100%)' }}>
        <div className="badge">Project Command Center</div>
        <div className="h1" style={{ marginTop: 10 }}>{project.project || 'Unnamed Project'}</div>
        <div className="muted" style={{ marginTop: 8 }}>{project.company || 'Unknown Client'}</div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
          <span className="badge">Status: {project.project_status || 'active'}</span>
          {project.project_phase ? <span className="badge">Phase: {project.project_phase}</span> : null}
          <span className="badge">Invoices: {invoices.length}</span>
          <span className="badge">Time Entries: {timeEntries.length}</span>
          <span className="badge">Revenue: {money(totalValue)}</span>
          <span className="badge">Paid In: {money(totalPaid)}</span>
          <span className="badge">Hours: {totalHours.toFixed(1)}</span>
          <span className="badge" style={permitStatusTone(permitForm.permit_status)}>
            Permit: {PERMIT_STATUS_OPTIONS.find((item) => item.value === permitForm.permit_status)?.label || 'Not Started'}
          </span>
          <span className="badge">Readiness: {permitReadiness.score}/100</span>
          <span className="badge">Risk: {riskLevel}</span>
          <span className="badge">{project.is_active_job ? 'ACTIVE JOBSITE' : 'Inactive Jobsite'}</span>
          <span className="badge">Assigned Workers: {assignedWorkers.length}</span>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
          <button
            type="button"
            className="btn primary"
            onClick={() => handleToggleActiveJob(!project.is_active_job)}
            disabled={savingActiveJob}
          >
            {savingActiveJob
              ? 'Saving…'
              : project.is_active_job
                ? 'End Jobsite'
                : 'Start Jobsite'}
          </button>
          <Link className="btn" to="/admin/projects">Back</Link>
        </div>

        {project.job_started_at ? (
          <div style={{ marginTop: 12 }}>
            <span className="badge">Started: {new Date(project.job_started_at).toLocaleString()}</span>
            <span className="badge" style={{ marginLeft: 8 }}>Crew On Site: {activeCrew.length}</span>
          </div>
        ) : null}
      </div>

      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="card-section-title">Recommended Next Actions</div>
        <div className="muted" style={{ marginTop: 8 }}>
          These actions are generated from permit status, intake blockers, staffing, and material coverage.
        </div>

        {nextActions.length === 0 ? (
          <div className="card-soft" style={{ marginTop: 14, background: '#ffffff' }}>
            No immediate actions. This project looks relatively stable right now.
          </div>
        ) : (
          <div className="list" style={{ marginTop: 14 }}>
            {nextActions.map((action, index) => (
              <div key={`${action}-${index}`} className="card-soft" style={{ background: '#ffffff' }}>
                <div style={{ fontWeight: 800, lineHeight: 1.7 }}>• {action}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid three">
        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">Project Status + Phase Tracking</div>
          <form onSubmit={handleSaveProjectMeta} className="grid" style={{ gap: 12, marginTop: 14 }}>
            <select
              className="input"
              value={projectMeta.project_status}
              onChange={(e) => setProjectMeta((prev) => ({ ...prev, project_status: e.target.value }))}
            >
              {PROJECT_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>

            <input
              className="input"
              value={projectMeta.project_phase}
              onChange={(e) => setProjectMeta((prev) => ({ ...prev, project_phase: e.target.value }))}
              placeholder="Current phase (demo, framing, rough-in, finish, etc.)"
            />

            <textarea
              className="input"
              value={projectMeta.project_next_action}
              onChange={(e) => setProjectMeta((prev) => ({ ...prev, project_next_action: e.target.value }))}
              placeholder="Next action / blocker / priority"
            />

            <button className="btn primary" type="submit" disabled={savingProjectMeta}>
              {savingProjectMeta ? 'Saving…' : 'Save Project Status'}
            </button>
          </form>
        </div>

        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">Create Invoice for This Project</div>
          <form onSubmit={handleCreateInvoice} className="grid" style={{ gap: 12, marginTop: 14 }}>
            <div className="grid two">
              <select
                className="input"
                value={invoiceForm.type}
                onChange={(e) => setInvoiceForm((prev) => ({ ...prev, type: e.target.value }))}
              >
                <option value="estimate">Estimate</option>
                <option value="invoice">Invoice</option>
              </select>
              <select
                className="input"
                value={invoiceForm.status}
                onChange={(e) => setInvoiceForm((prev) => ({ ...prev, status: e.target.value }))}
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            {invoiceForm.items.map((item) => (
              <div key={item.id} className="grid two" style={{ alignItems: 'center' }}>
                <input
                  className="input"
                  value={item.label}
                  onChange={(e) => updateInvoiceItem(item.id, 'label', e.target.value)}
                  placeholder="Line Item"
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    value={item.amount}
                    onChange={(e) => updateInvoiceItem(item.id, 'amount', e.target.value)}
                    placeholder="Amount"
                  />
                  <button type="button" className="btn" onClick={() => removeInvoiceItem(item.id)}>×</button>
                </div>
              </div>
            ))}

            <button type="button" className="btn" onClick={addInvoiceItem}>Add Line Item</button>

            <textarea
              className="input"
              value={invoiceForm.notes}
              onChange={(e) => setInvoiceForm((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Notes"
            />

            <button className="btn primary" type="submit" disabled={savingInvoice}>
              {savingInvoice ? 'Creating…' : 'Create Invoice'}
            </button>
          </form>
        </div>

        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">Clock Worker into This Project</div>
          <form onSubmit={handleClockIn} className="grid" style={{ gap: 12, marginTop: 14 }}>
            <input
              className="input"
              value={project.project || ''}
              readOnly
              placeholder="Jobsite"
            />
            <input
              className="input"
              value={timeForm.worker}
              onChange={(e) => setTimeForm((prev) => ({ ...prev, worker: e.target.value }))}
              placeholder="Worker Name"
            />
            <input
              className="input"
              value={timeForm.role}
              onChange={(e) => setTimeForm((prev) => ({ ...prev, role: e.target.value }))}
              placeholder="Role / Trade"
            />
            <button className="btn primary" type="submit" disabled={clockingIn}>
              {clockingIn ? 'Clocking In…' : 'Clock In Worker'}
            </button>
          </form>
        </div>
      </div>

      <div className="grid two">
        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">Permitting Status + Intake Foundation</div>
          <div className="muted" style={{ marginTop: 8 }}>
            This first layer starts the government permitting path without changing your existing database structure.
          </div>

          <form onSubmit={handleSavePermitMeta} className="grid" style={{ gap: 12, marginTop: 14 }}>
            <div className="grid two">
              <input
                className="input"
                value={permitForm.location_city}
                onChange={(e) => setPermitForm((prev) => ({ ...prev, location_city: e.target.value }))}
                placeholder="Project city"
              />
              <input
                className="input"
                value={permitForm.location_county}
                onChange={(e) => setPermitForm((prev) => ({ ...prev, location_county: e.target.value }))}
                placeholder="County"
              />
            </div>

            <div className="grid two">
              <input
                className="input"
                value={permitForm.location_zip}
                onChange={(e) => setPermitForm((prev) => ({ ...prev, location_zip: e.target.value.replace(/\D/g, '').slice(0, 5) }))}
                placeholder="Project ZIP"
              />
              <input
                className="input"
                value={permitForm.jurisdiction}
                onChange={(e) => setPermitForm((prev) => ({ ...prev, jurisdiction: e.target.value }))}
                placeholder="Jurisdiction / permit authority"
              />
            </div>

            <div className="grid two">
              <select
                className="input"
                value={permitForm.project_type}
                onChange={(e) => setPermitForm((prev) => ({ ...prev, project_type: e.target.value }))}
              >
                {PROJECT_TYPE_OPTIONS.map((item) => (
                  <option key={item.value || 'blank'} value={item.value}>{item.label}</option>
                ))}
              </select>

              <select
                className="input"
                value={permitForm.permit_status}
                onChange={(e) => setPermitForm((prev) => ({ ...prev, permit_status: e.target.value }))}
              >
                {PERMIT_STATUS_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </div>

            <div className="grid two">
              <input
                className="input"
                value={permitForm.square_footage}
                onChange={(e) => setPermitForm((prev) => ({ ...prev, square_footage: e.target.value }))}
                placeholder="Square footage"
              />
              <input
                className="input"
                value={permitForm.estimated_value}
                onChange={(e) => setPermitForm((prev) => ({ ...prev, estimated_value: e.target.value }))}
                placeholder="Estimated project value"
              />
            </div>

            <textarea
              className="input"
              value={scopeInput}
              onChange={(e) => setScopeInput(e.target.value)}
              placeholder="Scopes (comma separated): concrete, electrical, plumbing, framing"
            />

            <div className="card-soft" style={{ background: '#ffffff' }}>
              <div className="muted">Permit types</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                {PERMIT_TYPE_OPTIONS.map((type) => {
                  const selected = permitForm.permit_types.includes(type)
                  return (
                    <button
                      key={type}
                      type="button"
                      className="btn"
                      onClick={() => {
                        setPermitForm((prev) => ({
                          ...prev,
                          permit_types: selected
                            ? prev.permit_types.filter((item) => item !== type)
                            : [...prev.permit_types, type]
                        }))
                      }}
                      style={selected ? { background: '#111111', color: '#ffffff' } : undefined}
                    >
                      {type}
                    </button>
                  )
                })}
              </div>
            </div>

            <label style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={permitForm.permit_required}
                onChange={(e) => setPermitForm((prev) => ({ ...prev, permit_required: e.target.checked }))}
              />
              <span>Permit required</span>
            </label>

            <textarea
              className="input"
              value={permitForm.intake_notes}
              onChange={(e) => setPermitForm((prev) => ({ ...prev, intake_notes: e.target.value }))}
              placeholder="Permit intake notes, missing docs, reviewer comments, routing notes"
            />

            <button className="btn primary" type="submit" disabled={savingPermitMeta}>
              {savingPermitMeta ? 'Saving…' : 'Save Permitting Foundation'}
            </button>
          </form>
        </div>

        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">Permit Readiness Snapshot</div>
          <div className="list" style={{ marginTop: 14 }}>
            <div className="card-soft" style={{ background: '#ffffff' }}>
              <div className="muted">Submission readiness</div>
              <div style={{ marginTop: 8, fontSize: 32, fontWeight: 900 }}>{permitReadiness.score}/100</div>
            </div>

            <div className="card-soft" style={{ background: '#ffffff' }}>
              <div className="muted">Jurisdiction</div>
              <div style={{ marginTop: 8, fontWeight: 800 }}>{permitForm.jurisdiction || 'Not set yet'}</div>
            </div>

            <div className="card-soft" style={{ background: '#ffffff' }}>
              <div className="muted">Project risk level</div>
              <div style={{ marginTop: 8, fontWeight: 800 }}>{riskLevel}</div>
            </div>

            <div className="card-soft" style={{ background: '#ffffff' }}>
              <div className="muted">Suppliers used</div>
              {supplierSignals.length === 0 ? (
                <div style={{ marginTop: 8, fontWeight: 800 }}>No suppliers logged yet.</div>
              ) : (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                  {supplierSignals.map((supplier) => (
                    <span key={supplier} className="badge">{supplier}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="card-soft" style={{ background: '#ffffff' }}>
              <div className="muted">Delivery planning signal</div>
              <div style={{ marginTop: 8, lineHeight: 1.7 }}>
                {supplierSignals.length > 0
                  ? 'Supplier records are present, so this project is ready to connect supply pickups into the delivery lane.'
                  : 'Log at least one supplier or material source to start delivery planning from supplier to jobsite.'}
              </div>
            </div>

            <div className="card-soft" style={{ background: '#ffffff' }}>
              <div className="muted">Detected permit signals</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                {permitSignals.length === 0 ? <span className="badge">No signals yet</span> : permitSignals.map((signal) => <span key={signal} className="badge">{signal}</span>)}
              </div>
            </div>

            <div className="card-soft" style={{ background: '#ffffff' }}>
              <div className="muted">Scope suggestions</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                {scopeSuggestions.length === 0 ? <span className="badge">No scopes yet</span> : scopeSuggestions.map((signal) => <span key={signal} className="badge">{signal}</span>)}
              </div>
            </div>

            <div className="card-soft" style={{ background: '#ffffff' }}>
              <div className="muted">Top blockers</div>
              {permitReadiness.blockers.length === 0 ? (
                <div style={{ marginTop: 8, fontWeight: 800 }}>No major intake blockers detected.</div>
              ) : (
                <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                  {permitReadiness.blockers.slice(0, 6).map((item) => (
                    <div key={item} style={{ lineHeight: 1.6 }}>• {item}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>


      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="card-section-title">Permit Intake Package</div>
        <div className="muted" style={{ marginTop: 8 }}>
          This is a structured, submission-ready draft generated from project + permit data.
        </div>

        <div className="list" style={{ marginTop: 14 }}>
          <div className="card-soft" style={{ background: '#ffffff' }}>
            <div style={{ fontWeight: 900 }}>{permitIntakePackage.project_name || 'Unnamed Project'}</div>
            <div className="muted" style={{ marginTop: 6 }}>
              {permitIntakePackage.client || 'Unknown Client'}
            </div>
          </div>

          <div className="card-soft" style={{ background: '#ffffff' }}>
            <div className="muted">Location</div>
            <div style={{ marginTop: 8 }}>
              {permitIntakePackage.city || '—'}, {permitIntakePackage.county || '—'} {permitIntakePackage.zip || ''}
            </div>
          </div>

          <div className="card-soft" style={{ background: '#ffffff' }}>
            <div className="muted">Permit Summary</div>
            <div style={{ marginTop: 8, lineHeight: 1.7 }}>
              Required (AI): {(permitIntakePackage.ai_required_permits || []).join(', ') || 'None'}<br />
              Selected: {(permitIntakePackage.selected_permit_types || []).join(', ') || 'None'}
            </div>
          </div>

          <div className="card-soft" style={{ background: '#ffffff' }}>
            <div className="muted">Readiness + Risk</div>
            <div style={{ marginTop: 8 }}>
              {permitIntakePackage.readiness_score}/100 · {permitIntakePackage.risk_level}
            </div>
          </div>

          <div className="card-soft" style={{ background: '#ffffff' }}>
            <div className="muted">Missing + Warnings</div>
            <div style={{ marginTop: 8, lineHeight: 1.7 }}>
              Missing: {(permitIntakePackage.missing_inputs || []).join(' | ') || 'None'}<br />
              Warnings: {(permitIntakePackage.warnings || []).join(' | ') || 'None'}
            </div>
          </div>

          <div className="card-soft" style={{ background: '#ffffff' }}>
            <div className="muted">Formatted Intake</div>
            <pre style={{ marginTop: 10, whiteSpace: 'pre-wrap' }}>
{permitIntakeText}
            </pre>
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <button className="btn primary" onClick={copyPermitIntake}>
            Copy Intake Package
          </button>
        </div>
      </div>

      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="card-section-title">AI Permit Requirements</div>
        <div className="muted" style={{ marginTop: 8 }}>
          This layer turns saved project scope and material signals into suggested permit lanes, missing inputs, and review warnings.
        </div>

        <div className="list" style={{ marginTop: 14 }}>
          <div className="card-soft" style={{ background: '#ffffff' }}>
            <div className="muted">Required permits (AI detected)</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
              {permitRequirements.required_permits.length === 0 ? (
                <span className="badge">None detected yet</span>
              ) : (
                permitRequirements.required_permits.map((item) => (
                  <span key={`required-permit-${item}`} className="badge">{item}</span>
                ))
              )}
            </div>
          </div>

          <div className="card-soft" style={{ background: '#ffffff' }}>
            <div className="muted">Suggested permit additions</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
              {suggestedPermitTypes.length === 0 ? (
                <span className="badge">All detected permits already accounted for</span>
              ) : (
                suggestedPermitTypes.map((item) => (
                  <span
                    key={`suggested-permit-${item}`}
                    className="badge"
                    style={{ background: '#d8ecff', color: '#0d3f73' }}
                  >
                    {item}
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="card-soft" style={{ background: '#ffffff' }}>
            <div className="muted">Missing inputs</div>
            {permitRequirements.missing_inputs.length === 0 ? (
              <div style={{ marginTop: 8, fontWeight: 800 }}>No obvious missing permit inputs right now.</div>
            ) : (
              <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                {permitRequirements.missing_inputs.map((item) => (
                  <div key={`missing-input-${item}`} style={{ lineHeight: 1.6 }}>• {item}</div>
                ))}
              </div>
            )}
          </div>

          <div className="card-soft" style={{ background: '#ffffff' }}>
            <div className="muted">Warnings</div>
            {permitRequirements.warnings.length === 0 ? (
              <div style={{ marginTop: 8, fontWeight: 800 }}>No additional warnings from the permit engine.</div>
            ) : (
              <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                {permitRequirements.warnings.map((item) => (
                  <div key={`permit-warning-${item}`} style={{ lineHeight: 1.6 }}>• {item}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="card-section-title">Jurisdiction Requirements Engine</div>
        <div className="muted" style={{ marginTop: 8 }}>
          This layer applies early city + project-type rules so you can see required documents, required fields, review lanes, and what is still missing before submission.
        </div>

        <div className="list" style={{ marginTop: 14 }}>
          <div className="card-soft" style={{ background: '#ffffff' }}>
            <div className="muted">Submission status</div>
            <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span className="badge" style={jurisdictionReady ? { background: '#dcf4e5', color: '#177245' } : { background: '#fff0b4', color: '#111111' }}>
                {jurisdictionReady ? 'Ready for jurisdiction checklist review' : 'More jurisdiction inputs needed'}
              </span>
              <span className="badge">{permitForm.location_city || 'City not set'}</span>
              <span className="badge">{permitForm.project_type || 'Project type not set'}</span>
            </div>
          </div>

          <div className="card-soft" style={{ background: '#ffffff' }}>
            <div className="muted">Required review lanes</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
              {(jurisdictionRequirements.review_lanes || []).map((lane) => (
                <span key={`lane-${lane}`} className="badge">{lane}</span>
              ))}
            </div>
          </div>

          <div className="card-soft" style={{ background: '#ffffff' }}>
            <div className="muted">Required fields</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
              {(jurisdictionRequirements.required_fields || []).map((field) => (
                <span
                  key={`field-${field}`}
                  className="badge"
                  style={jurisdictionMissingFields.includes(field) ? { background: '#ffe1dc', color: '#8a2d1f' } : { background: '#dcf4e5', color: '#177245' }}
                >
                  {field}
                </span>
              ))}
            </div>
          </div>

          <div className="card-soft" style={{ background: '#ffffff' }}>
            <div className="muted">Required documents</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
              {(jurisdictionRequirements.required_documents || []).map((doc) => (
                <span
                  key={`doc-${doc}`}
                  className="badge"
                  style={jurisdictionMissingDocuments.includes(doc) ? { background: '#ffe1dc', color: '#8a2d1f' } : { background: '#dcf4e5', color: '#177245' }}
                >
                  {doc}
                </span>
              ))}
            </div>
          </div>

          <div className="card-soft" style={{ background: '#ffffff' }}>
            <div className="muted">Engine warnings</div>
            {jurisdictionRequirements.warnings.length === 0 ? (
              <div style={{ marginTop: 8, fontWeight: 800 }}>No additional jurisdiction warnings.</div>
            ) : (
              <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                {jurisdictionRequirements.warnings.map((item) => (
                  <div key={`jurisdiction-warning-${item}`} style={{ lineHeight: 1.6 }}>• {item}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>


      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="card-section-title">Project Package Generator</div>
        <div className="muted" style={{ marginTop: 8 }}>
          This converts project, permit, supplier, delivery, labor, and cost data into a client-ready execution package you can copy or export.
        </div>

        <div className="list" style={{ marginTop: 14 }}>
          <div className="card-soft" style={{ background: '#ffffff' }}>
            <div className="muted">Project + location</div>
            <div style={{ marginTop: 8, lineHeight: 1.7 }}>
              <strong>{projectPackage.project_name || 'Unnamed Project'}</strong><br />
              {projectPackage.client || 'Unknown Client'}<br />
              {projectPackage.location.city || '—'}, {projectPackage.location.county || '—'} {projectPackage.location.zip || ''}<br />
              {projectPackage.location.jurisdiction || 'Jurisdiction not set'}
            </div>
          </div>

          <div className="grid two">
            <div className="card-soft" style={{ background: '#ffffff' }}>
              <div className="muted">Execution package summary</div>
              <div style={{ marginTop: 8, lineHeight: 1.7 }}>
                Suppliers: {(projectPackage.execution_summary.supplier_signals || []).length}<br />
                Materials: {(projectPackage.execution_summary.materials || []).length}<br />
                Assigned workers: {(projectPackage.execution_summary.assigned_workers || []).length}<br />
                Delivery lane: {projectPackage.execution_summary.delivery_plan.primary_lane || '—'}
              </div>
            </div>

            <div className="card-soft" style={{ background: '#ffffff' }}>
              <div className="muted">Commercial snapshot</div>
              <div style={{ marginTop: 8, lineHeight: 1.7 }}>
                Revenue: {money(projectPackage.commercial_summary.revenue || 0)}<br />
                Labor cost: {money(projectPackage.commercial_summary.labor_cost || 0)}<br />
                Material cost: {money(projectPackage.commercial_summary.material_cost || 0)}<br />
                Margin: {money(projectPackage.commercial_summary.estimated_gross_margin || 0)}
              </div>
            </div>
          </div>

          <div className="card-soft" style={{ background: '#ffffff' }}>
            <div className="muted">Formatted project package</div>
            <pre style={{ marginTop: 10, whiteSpace: 'pre-wrap' }}>
{projectPackageText}
            </pre>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
          <button className="btn primary" type="button" onClick={copyProjectPackage}>
            Copy Project Package
          </button>
          <button className="btn" type="button" onClick={downloadProjectPackagePdf}>
            Download Project Package PDF
          </button>
        </div>
      </div>

      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="card-section-title">Project RFQs & Quote Comparison</div>
        <div className="muted" style={{ marginTop: 8 }}>
          Track pending quote requests, compare supplier pricing, and select the winning supplier for this project.
        </div>

        <div className="grid two" style={{ marginTop: 14 }}>
          <div className="card-soft" style={{ background: '#ffffff' }}>
            <div className="muted">RFQ metrics</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
              <span className="badge">Total: {rfqMetrics.total}</span>
              <span className="badge">Pending: {rfqMetrics.pending}</span>
              <span className="badge">Quoted: {rfqMetrics.quoted}</span>
              <span className="badge">Selected: {rfqMetrics.selected}</span>
            </div>
          </div>

          <div className="card-soft" style={{ background: '#ffffff' }}>
            <div className="muted">Best current quote</div>
            {recommendedQuote ? (
              <div style={{ marginTop: 10, lineHeight: 1.7 }}>
                <strong>{recommendedQuote.supplier_name || 'Unknown Supplier'}</strong><br />
                {recommendedQuote.material || 'Material not set'}<br />
                Price: {money(recommendedQuote.price || 0)}<br />
                Lead time: {recommendedQuote.lead_time || '—'}
              </div>
            ) : (
              <div style={{ marginTop: 10 }}>No quoted RFQs yet.</div>
            )}
          </div>
        </div>

        {rfqs.length === 0 ? (
          <div className="card-soft" style={{ marginTop: 14, background: '#ffffff' }}>
            No RFQs tied to this project yet.
          </div>
        ) : (
          <div className="list" style={{ marginTop: 14 }}>
            {rfqs.map((rfq) => (
              <div key={rfq.id} className="card-soft" style={{ background: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 900 }}>{rfq.supplier_name || 'Unknown Supplier'}</div>
                    <div className="muted" style={{ marginTop: 6 }}>{rfq.material || 'Material not set'}</div>
                  </div>
                  <span
                    className="badge"
                    style={
                      rfq.status === 'selected'
                        ? { background: '#dcf4e5', color: '#177245' }
                        : rfq.status === 'quoted'
                          ? { background: '#d8ecff', color: '#0d3f73' }
                          : { background: '#fff0b4', color: '#111111' }
                    }
                  >
                    {rfq.status || 'pending'}
                  </span>
                </div>

                <div className="grid three" style={{ marginTop: 12 }}>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    value={rfq.price ?? ''}
                    onChange={(e) => setRfqs((prev) => prev.map((row) => row.id === rfq.id ? { ...row, price: e.target.value } : row))}
                    placeholder="Quote Price"
                  />
                  <input
                    className="input"
                    value={rfq.lead_time || ''}
                    onChange={(e) => setRfqs((prev) => prev.map((row) => row.id === rfq.id ? { ...row, lead_time: e.target.value } : row))}
                    placeholder="Lead Time"
                  />
                  <input
                    className="input"
                    value={rfq.notes || ''}
                    onChange={(e) => setRfqs((prev) => prev.map((row) => row.id === rfq.id ? { ...row, notes: e.target.value } : row))}
                    placeholder="Quote Notes"
                  />
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => handleUpdateRfq(rfq.id, {
                      price: rfq.price === '' ? null : Number(rfq.price || 0),
                      lead_time: String(rfq.lead_time || '').trim() || null,
                      notes: String(rfq.notes || '').trim() || null,
                      status: rfq.price !== '' && rfq.price !== null && rfq.price !== undefined ? 'quoted' : rfq.status || 'pending'
                    })}
                    disabled={savingRfqId === rfq.id}
                  >
                    {savingRfqId === rfq.id ? 'Saving…' : 'Save Quote'}
                  </button>

                  <button
                    type="button"
                    className="btn"
                    onClick={() => handleUpdateRfq(rfq.id, { status: 'pending' })}
                    disabled={savingRfqId === rfq.id}
                  >
                    Mark Pending
                  </button>

                  <button
                    type="button"
                    className="btn"
                    onClick={() => handleUpdateRfq(rfq.id, { status: 'quoted' })}
                    disabled={savingRfqId === rfq.id}
                  >
                    Mark Quoted
                  </button>

                  <button
                    type="button"
                    className="btn primary"
                    onClick={() => handleSelectRfq(rfq.id)}
                    disabled={savingRfqId === rfq.id}
                  >
                    {savingRfqId === rfq.id ? 'Selecting…' : 'Select Supplier'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid two">
        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">Worker Assignment</div>
          <form onSubmit={handleAssignWorker} className="grid" style={{ gap: 12, marginTop: 14 }}>
            <input
              className="input"
              value={workerForm.worker_name}
              onChange={(e) => setWorkerForm((prev) => ({ ...prev, worker_name: e.target.value }))}
              placeholder="Worker Name"
            />
            <input
              className="input"
              value={workerForm.role}
              onChange={(e) => setWorkerForm((prev) => ({ ...prev, role: e.target.value }))}
              placeholder="Role / Trade"
            />
            <button className="btn primary" type="submit" disabled={savingWorkerAssignment}>
              {savingWorkerAssignment ? 'Assigning…' : 'Assign Worker'}
            </button>
          </form>

          {assignedWorkers.length === 0 ? (
            <div className="card-soft" style={{ marginTop: 14 }}>No workers assigned yet.</div>
          ) : (
            <div className="list" style={{ marginTop: 14 }}>
              {assignedWorkers.map((worker) => (
                <div key={worker.id} className="card-soft" style={{ background: '#ffffff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ fontWeight: 900 }}>{worker.worker_name}</div>
                    <button type="button" className="btn small" onClick={() => handleRemoveWorker(worker.id)}>
                      Remove
                    </button>
                  </div>
                  <div className="muted" style={{ marginTop: 8 }}>{worker.role || 'No role set'}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">Materials / Cost Tracking</div>
          <form onSubmit={handleAddMaterial} className="grid" style={{ gap: 12, marginTop: 14 }}>
            <input
              className="input"
              value={materialForm.item_name}
              onChange={(e) => setMaterialForm((prev) => ({ ...prev, item_name: e.target.value }))}
              placeholder="Material / Cost Item"
            />
            <input
              className="input"
              value={materialForm.supplier_name}
              onChange={(e) => setMaterialForm((prev) => ({ ...prev, supplier_name: e.target.value }))}
              placeholder="Supplier"
            />
            <div className="grid two">
              <input
                className="input"
                type="number"
                step="0.01"
                value={materialForm.quantity}
                onChange={(e) => setMaterialForm((prev) => ({ ...prev, quantity: e.target.value }))}
                placeholder="Quantity"
              />
              <input
                className="input"
                type="number"
                step="0.01"
                value={materialForm.unit_cost}
                onChange={(e) => setMaterialForm((prev) => ({ ...prev, unit_cost: e.target.value }))}
                placeholder="Unit Cost"
              />
            </div>
            <textarea
              className="input"
              value={materialForm.notes}
              onChange={(e) => setMaterialForm((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Notes"
            />
            <button className="btn primary" type="submit" disabled={savingMaterial}>
              {savingMaterial ? 'Saving…' : 'Add Material Cost'}
            </button>
          </form>

          {materials.length === 0 ? (
            <div className="card-soft" style={{ marginTop: 14 }}>No materials or costs logged yet.</div>
          ) : (
            <div className="list" style={{ marginTop: 14 }}>
              {materials.map((row) => (
                <div key={row.id} className="card-soft" style={{ background: '#ffffff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ fontWeight: 900 }}>{row.item_name}</div>
                    <span className="badge">{money(materialTotal(row))}</span>
                  </div>
                  <div className="muted" style={{ marginTop: 8 }}>
                    {row.supplier_name || 'No supplier'} · Qty {Number(row.quantity || 0)} @ {money(row.unit_cost || 0)}
                  </div>
                  {row.notes ? <div style={{ marginTop: 8, lineHeight: 1.7 }}>{row.notes}</div> : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid two">
        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">Project Profitability Summary</div>
          <div className="list" style={{ marginTop: 14 }}>
            <div className="card-soft" style={{ background: '#ffffff' }}>
              <div className="muted">Revenue</div>
              <div style={{ marginTop: 8, fontSize: 28, fontWeight: 900 }}>{money(totalValue)}</div>
            </div>
            <div className="card-soft" style={{ background: '#ffffff' }}>
              <div className="muted">Payments Received</div>
              <div style={{ marginTop: 8, fontSize: 28, fontWeight: 900 }}>{money(totalPaid)}</div>
            </div>
            <div className="card-soft" style={{ background: '#ffffff' }}>
              <div className="muted">Labor Hours</div>
              <div style={{ marginTop: 8, fontSize: 28, fontWeight: 900 }}>{totalHours.toFixed(1)}</div>
            </div>
            <div className="card-soft" style={{ background: '#ffffff' }}>
              <div className="muted">Labor Cost (real worker rates)</div>
              <div style={{ marginTop: 8, fontSize: 28, fontWeight: 900 }}>{money(laborCost)}</div>
            </div>
            <div className="card-soft" style={{ background: '#ffffff' }}>
              <div className="muted">Material Cost</div>
              <div style={{ marginTop: 8, fontSize: 28, fontWeight: 900 }}>{money(materialCost)}</div>
            </div>
            <div className="card-soft" style={{ background: '#ffffff' }}>
              <div className="muted">Estimated Gross Margin</div>
              <div style={{ marginTop: 8, fontSize: 28, fontWeight: 900 }}>{money(profitability)}</div>
            </div>
            {project.project_next_action ? (
              <div className="card-soft" style={{ background: '#ffffff' }}>
                <div className="muted">Next Action</div>
                <div style={{ marginTop: 8, lineHeight: 1.7 }}>{project.project_next_action}</div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">Labor Cost Breakdown</div>
          {laborBreakdown.length === 0 ? (
            <div className="card-soft" style={{ marginTop: 14 }}>No completed labor entries to cost yet.</div>
          ) : (
            <div className="list" style={{ marginTop: 14 }}>
              {laborBreakdown.map((row) => (
                <div key={row.worker} className="card-soft" style={{ background: '#ffffff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ fontWeight: 900 }}>{row.worker}</div>
                    <span className="badge">{money(row.cost)}</span>
                  </div>
                  <div className="muted" style={{ marginTop: 8 }}>
                    {row.role ? `${row.role} · ` : ''}{row.hours.toFixed(1)} hrs @ {money(row.rate)}/hr
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">Live Crew On Site</div>
          {activeCrew.length === 0 ? (
            <div className="card-soft" style={{ marginTop: 14 }}>No crew clocked in on this jobsite right now.</div>
          ) : (
            <div className="list" style={{ marginTop: 14 }}>
              {activeCrew.map((entry) => (
                <div key={entry.id} className="card-soft" style={{ background: '#ffffff' }}>
                  <div style={{ fontWeight: 900 }}>{entry.worker}</div>
                  <div className="muted" style={{ marginTop: 8 }}>
                    {entry.role ? `${entry.role} · ` : ''}{entry.jobsite}
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <span className="badge">In: {new Date(entry.clock_in_at).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="card-section-title">Time Entries</div>
        {timeEntries.length === 0 ? (
          <div className="card-soft" style={{ marginTop: 14 }}>No time entries tied to this project yet.</div>
        ) : (
          <div className="list" style={{ marginTop: 14 }}>
            {timeEntries.map((entry) => (
              <div key={entry.id} className="card-soft" style={{ background: '#ffffff' }}>
                <div style={{ fontWeight: 900 }}>{entry.worker}</div>
                <div className="muted" style={{ marginTop: 8 }}>
                  {entry.role ? `${entry.role} · ` : ''}{entry.jobsite}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                  <span className="badge">In: {new Date(entry.clock_in_at).toLocaleString()}</span>
                  <span className="badge">Out: {entry.clock_out_at ? new Date(entry.clock_out_at).toLocaleString() : '—'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {project.notes ? (
        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">Project Notes</div>
          <div style={{ marginTop: 12, lineHeight: 1.7 }}>{project.notes}</div>
        </div>
      ) : null}
    </div>
  )
}
