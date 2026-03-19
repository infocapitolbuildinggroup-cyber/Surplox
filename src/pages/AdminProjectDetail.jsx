import React, { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

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

        const [invRes, timeRes, materialsRes, workersRes, adminWorkersRes] = await Promise.all([
          supabase.from('admin_invoices').select('*'),
          supabase.from('admin_time_entries').select('*'),
          supabase.from('admin_project_materials').select('*').eq('project_record_id', id).order('created_at', { ascending: false }),
          supabase.from('admin_project_workers').select('*').eq('project_record_id', id).order('created_at', { ascending: false }),
          supabase.from('admin_workers').select('name, hourly_rate')
        ])

        if (invRes.error) throw invRes.error
        if (timeRes.error) throw timeRes.error
        if (materialsRes.error) throw materialsRes.error
        if (workersRes.error) throw workersRes.error
        if (adminWorkersRes.error) throw adminWorkersRes.error
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

    return () => {
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
