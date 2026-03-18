import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

const COPY = {
  en: {
    badge: 'Invoices & Estimates',
    title: 'Create rough estimates and invoices inside Surplox.',
    body:
      'This first version is intentionally simple: build line items, total them instantly, store records in the database, connect them to CRM clients/projects, track payments, and export a printable PDF view.',
    back: 'Back to Admin',
    formTitle: 'Create Estimate / Invoice',
    type: 'Document Type',
    estimate: 'Estimate',
    invoice: 'Invoice',
    client: 'Client / Company',
    project: 'Project Name',
    status: 'Status',
    draft: 'Draft',
    sent: 'Sent',
    paid: 'Paid',
    partial: 'Partial',
    overdue: 'Overdue',
    lineItem: 'Line Item',
    amount: 'Amount',
    addItem: 'Add Line Item',
    notes: 'Notes',
    save: 'Save Document',
    saving: 'Saving…',
    subtotal: 'Subtotal',
    totalDocs: 'Documents',
    totalValue: 'Pipeline Value',
    paidValue: 'Paid Value',
    unpaidValue: 'Unpaid Value',
    emptyTitle: 'No documents yet.',
    emptyBody: 'Create your first estimate or invoice to start building this contractor workflow inside Surplox.',
    edit: 'Edit',
    delete: 'Delete',
    loading: 'Loading invoices…',
    loadError: 'Unable to load invoices right now.',
    saveError: 'Unable to save invoice right now.',
    deleteError: 'Unable to delete invoice right now.',
    clientRequired: 'Client / Company is required.',
    saved: 'Invoice saved.',
    deleted: 'Invoice deleted.',
    pdf: 'Generate PDF',
    noCrmRecords: 'No CRM client records found yet. You can still type client and project manually.',
    crmClientHint: 'Choose an existing CRM client or type a new one.',
    crmProjectHint: 'Choose an existing project from CRM or type a new project name.',
    notesPlaceholder: 'Scope notes, payment terms, inclusions, exclusions, due date details, or internal summary...',
    paymentTracking: 'Payment Tracking',
    amountPaid: 'Amount Paid',
    paymentDate: 'Payment Date',
    markPaid: 'Mark Paid',
    paymentSaved: 'Payment updated.',
    paymentError: 'Unable to update payment right now.',
    balanceDue: 'Balance Due',
    noPaymentDate: 'No payment date',
    importProjectCosts: 'Import Project Costs',
    importingCosts: 'Importing costs…',
    importedCosts: 'Project costs imported.',
    importCostsError: 'Unable to import project costs right now.',
    importProjectRequired: 'Select a project before importing costs.',
    noProjectCostsFound: 'No completed labor or material costs found for that project.',
    invoiceNumber: 'Invoice #',
    dueDate: 'Due Date',
    noDueDate: 'No due date',
    filters: 'Filters',
    all: 'All',
    unpaid: 'Unpaid',
    today: 'Today'
  },
  es: {
    badge: 'Facturas y Estimados',
    title: 'Crea estimados y facturas dentro de Surplox.',
    body:
      'Esta primera versión es intencionalmente simple: crea partidas, suma totales al instante, guarda registros en la base de datos, conéctalos a clientes/proyectos del CRM, da seguimiento a pagos y exporta una vista imprimible en PDF.',
    back: 'Volver al Admin',
    formTitle: 'Crear Estimado / Factura',
    type: 'Tipo de Documento',
    estimate: 'Estimado',
    invoice: 'Factura',
    client: 'Cliente / Empresa',
    project: 'Nombre del Proyecto',
    status: 'Estatus',
    draft: 'Borrador',
    sent: 'Enviado',
    paid: 'Pagado',
    partial: 'Parcial',
    overdue: 'Vencida',
    lineItem: 'Concepto',
    amount: 'Monto',
    addItem: 'Agregar Partida',
    notes: 'Notas',
    save: 'Guardar Documento',
    saving: 'Guardando…',
    subtotal: 'Subtotal',
    totalDocs: 'Documentos',
    totalValue: 'Valor Total',
    paidValue: 'Valor Pagado',
    unpaidValue: 'Valor No Pagado',
    emptyTitle: 'Todavía no hay documentos.',
    emptyBody: 'Crea tu primer estimado o factura para empezar a construir este flujo del contratista dentro de Surplox.',
    edit: 'Editar',
    delete: 'Eliminar',
    loading: 'Cargando facturas…',
    loadError: 'No se pudieron cargar las facturas.',
    saveError: 'No se pudo guardar la factura.',
    deleteError: 'No se pudo eliminar la factura.',
    clientRequired: 'Cliente / Empresa es obligatorio.',
    saved: 'Factura guardada.',
    deleted: 'Factura eliminada.',
    pdf: 'Generar PDF',
    noCrmRecords: 'Todavía no hay registros CRM. Aún puedes escribir cliente y proyecto manualmente.',
    crmClientHint: 'Elige un cliente existente del CRM o escribe uno nuevo.',
    crmProjectHint: 'Elige un proyecto existente del CRM o escribe un proyecto nuevo.',
    notesPlaceholder: 'Notas de alcance, términos de pago, inclusiones, exclusiones, vencimiento o resumen interno...',
    paymentTracking: 'Seguimiento de Pago',
    amountPaid: 'Monto Pagado',
    paymentDate: 'Fecha de Pago',
    markPaid: 'Marcar Pagado',
    paymentSaved: 'Pago actualizado.',
    paymentError: 'No se pudo actualizar el pago.',
    balanceDue: 'Saldo Pendiente',
    noPaymentDate: 'Sin fecha de pago',
    importProjectCosts: 'Importar Costos del Proyecto',
    importingCosts: 'Importando costos…',
    importedCosts: 'Costos del proyecto importados.',
    importCostsError: 'No se pudieron importar los costos del proyecto.',
    importProjectRequired: 'Selecciona un proyecto antes de importar costos.',
    noProjectCostsFound: 'No se encontraron costos de materiales o mano de obra completada para ese proyecto.',
    invoiceNumber: 'Factura #',
    dueDate: 'Fecha de Vencimiento',
    noDueDate: 'Sin vencimiento',
    filters: 'Filtros',
    all: 'Todas',
    unpaid: 'No Pagadas',
    today: 'Hoy'
  }
}

function makeLineItem(label = '', amount = '') {
  return { id: crypto.randomUUID(), label, amount }
}

function makeEmptyDoc() {
  return {
    id: '',
    type: 'estimate',
    client: '',
    project: '',
    status: 'draft',
    notes: '',
    items: [makeLineItem()],
    amountPaid: '',
    paymentDate: '',
    dueDate: '',
    invoiceNumber: '',
    createdAt: ''
  }
}

function money(value) {
  const number = Number(value || 0)
  return `$${number.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function docTotal(doc) {
  return (doc.items || []).reduce((sum, item) => sum + Number(item.amount || 0), 0)
}

function mapDbRowToDoc(row = {}) {
  return {
    id: row.id || '',
    type: row.type || 'estimate',
    client: row.client || '',
    project: row.project || '',
    status: row.status || 'draft',
    notes: row.notes || '',
    items: Array.isArray(row.items) && row.items.length > 0 ? row.items : [makeLineItem()],
    amountPaid: row.amount_paid ?? '',
    paymentDate: row.payment_received_at || '',
    dueDate: row.due_date || '',
    invoiceNumber: row.invoice_number || '',
    createdAt: row.created_at || ''
  }
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function isOverdueDoc(doc) {
  if (String(doc.status || '') === 'paid') return false
  if (!doc.dueDate) return false
  return new Date(doc.dueDate).getTime() < startOfToday().getTime()
}

function computedStatus(doc) {
  const total = docTotal(doc)
  const amountPaid = Number(doc.amountPaid || 0)
  if (amountPaid >= total && total > 0) return 'paid'
  if (isOverdueDoc(doc)) return 'overdue'
  if (amountPaid > 0) return 'partial'
  return doc.status || 'draft'
}

function statusLabel(status, copy) {
  if (status === 'draft') return copy.draft
  if (status === 'sent') return copy.sent
  if (status === 'paid') return copy.paid
  if (status === 'partial') return copy.partial
  if (status === 'overdue') return copy.overdue
  return status
}

function renderPdfHtml(doc, copy) {
  const total = docTotal(doc)
  const amountPaid = Number(doc.amountPaid || 0)
  const balanceDue = Math.max(total - amountPaid, 0)
  const title = doc.type === 'estimate' ? copy.estimate : copy.invoice
  const statusText = statusLabel(computedStatus(doc), copy)

  const rows = (doc.items || [])
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #e7e5da;">${escapeHtml(item.label || '—')}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e7e5da;text-align:right;">${escapeHtml(money(item.amount || 0))}</td>
        </tr>
      `
    )
    .join('')

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(title)} - ${escapeHtml(doc.client || 'Surplox')}</title>
        <style>
          body { font-family: Arial, Helvetica, sans-serif; color: #111; margin: 32px; }
          .shell { max-width: 860px; margin: 0 auto; }
          .top { display:flex; justify-content:space-between; gap:24px; align-items:flex-start; }
          .brand { font-size: 28px; font-weight: 800; }
          .meta { text-align:right; }
          .badge { display:inline-block; padding:6px 10px; border-radius:999px; background:#f1e7a8; font-size:12px; font-weight:700; margin-bottom:8px; }
          .section { margin-top: 26px; }
          table { width:100%; border-collapse: collapse; margin-top: 10px; }
          th { text-align:left; padding:10px 12px; background:#f8f7ef; }
          .totals { margin-top: 18px; display:flex; justify-content:flex-end; }
          .totalbox { min-width: 280px; padding: 16px; border-radius: 14px; background:#f8f7ef; }
          .notes { white-space: pre-wrap; line-height:1.6; padding:16px; border-radius:14px; background:#faf9f4; }
          @media print { body { margin: 16px; } }
        </style>
      </head>
      <body>
        <div class="shell">
          <div class="top">
            <div>
              <div class="badge">${escapeHtml(title)}</div>
              <div class="brand">Surplox / Capitol Building Group</div>
              <div style="margin-top:10px;color:#555;">${escapeHtml(doc.client || '')}</div>
              ${doc.project ? `<div style="margin-top:6px;color:#555;">${escapeHtml(doc.project)}</div>` : ''}
            </div>
            <div class="meta">
              <div style="font-size:14px;color:#666;">${escapeHtml(copy.invoiceNumber)}</div>
              <div>${escapeHtml(doc.invoiceNumber || '—')}</div>
              <div style="margin-top:10px;font-size:14px;color:#666;">${escapeHtml(copy.status)}</div>
              <div style="font-weight:700;">${escapeHtml(statusText)}</div>
              <div style="margin-top:10px;font-size:14px;color:#666;">Created</div>
              <div>${escapeHtml(new Date(doc.createdAt || Date.now()).toLocaleString())}</div>
              <div style="margin-top:10px;font-size:14px;color:#666;">${escapeHtml(copy.dueDate)}</div>
              <div>${escapeHtml(doc.dueDate ? new Date(doc.dueDate).toLocaleDateString() : copy.noDueDate)}</div>
              <div style="margin-top:10px;font-size:14px;color:#666;">${escapeHtml(copy.paymentDate)}</div>
              <div>${escapeHtml(doc.paymentDate ? new Date(doc.paymentDate).toLocaleDateString() : copy.noPaymentDate)}</div>
            </div>
          </div>

          <div class="section">
            <table>
              <thead>
                <tr>
                  <th>${escapeHtml(copy.lineItem)}</th>
                  <th style="text-align:right;">${escapeHtml(copy.amount)}</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>

          <div class="totals">
            <div class="totalbox">
              <div style="display:flex;justify-content:space-between;gap:12px;"><span>${escapeHtml(copy.subtotal)}</span><strong>${escapeHtml(money(total))}</strong></div>
              <div style="display:flex;justify-content:space-between;gap:12px;margin-top:8px;"><span>${escapeHtml(copy.amountPaid)}</span><strong>${escapeHtml(money(amountPaid))}</strong></div>
              <div style="display:flex;justify-content:space-between;gap:12px;margin-top:8px;"><span>${escapeHtml(copy.balanceDue)}</span><strong>${escapeHtml(money(balanceDue))}</strong></div>
            </div>
          </div>

          ${
            doc.notes
              ? `<div class="section">
                  <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#666;margin-bottom:10px;">${escapeHtml(copy.notes)}</div>
                  <div class="notes">${escapeHtml(doc.notes)}</div>
                </div>`
              : ''
          }
        </div>
      </body>
    </html>
  `
}

export default function AdminInvoices({ lang = 'en' }) {
  const copy = COPY[lang] || COPY.en
  const [documents, setDocuments] = useState([])
  const [crmRecords, setCrmRecords] = useState([])
  const [form, setForm] = useState(makeEmptyDoc())
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [importingCosts, setImportingCosts] = useState(false)
  const [message, setMessage] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    let active = true

    async function loadAll() {
      setLoading(true)
      setMessage('')

      try {
        const [invoiceRes, crmRes] = await Promise.all([
          supabase
            .from('admin_invoices')
            .select('id, type, client, project, status, notes, items, amount_paid, payment_received_at, due_date, invoice_number, created_at')
            .order('created_at', { ascending: false }),
          supabase
            .from('admin_crm_records')
            .select('id, company, project, created_at')
            .order('created_at', { ascending: false })
        ])

        if (invoiceRes.error) throw invoiceRes.error
        if (crmRes.error) throw crmRes.error
        if (!active) return

        setDocuments(Array.isArray(invoiceRes.data) ? invoiceRes.data.map(mapDbRowToDoc) : [])
        setCrmRecords(Array.isArray(crmRes.data) ? crmRes.data : [])
      } catch (error) {
        console.error(error)
        if (!active) return
        setMessage(copy.loadError)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadAll()

    return () => {
      active = false
    }
  }, [copy.loadError])

  const crmClients = useMemo(() => {
    return Array.from(
      new Set(
        crmRecords
          .map((row) => String(row.company || '').trim())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b))
  }, [crmRecords])

  const crmProjects = useMemo(() => {
    const selectedClient = String(form.client || '').trim().toLowerCase()

    const source = selectedClient
      ? crmRecords.filter((row) => String(row.company || '').trim().toLowerCase() === selectedClient)
      : crmRecords

    return Array.from(
      new Set(
        source
          .map((row) => String(row.project || '').trim())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b))
  }, [crmRecords, form.client])

  const subtotal = useMemo(
    () => form.items.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [form.items]
  )

  const stats = useMemo(() => {
    const totalValue = documents.reduce((sum, doc) => sum + docTotal(doc), 0)
    const paidValue = documents.reduce((sum, doc) => sum + Number(doc.amountPaid || 0), 0)
    const unpaidValue = documents.reduce((sum, doc) => {
      const balance = Math.max(docTotal(doc) - Number(doc.amountPaid || 0), 0)
      return sum + balance
    }, 0)

    return { totalDocs: documents.length, totalValue, paidValue, unpaidValue }
  }, [documents])

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const status = computedStatus(doc)
      if (statusFilter === 'all') return true
      if (statusFilter === 'unpaid') return status !== 'paid'
      return status === statusFilter
    })
  }, [documents, statusFilter])

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function updateItem(id, key, value) {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === id ? { ...item, [key]: value } : item))
    }))
  }

  function addItem() {
    setForm((prev) => ({ ...prev, items: [...prev.items, makeLineItem()] }))
  }

  function removeItem(id) {
    setForm((prev) => ({
      ...prev,
      items: prev.items.length > 1 ? prev.items.filter((item) => item.id !== id) : prev.items
    }))
  }

  function handleClientChange(value) {
    setForm((prev) => {
      const next = { ...prev, client: value }
      const matchingProject =
        crmRecords.find(
          (row) =>
            String(row.company || '').trim().toLowerCase() === String(value || '').trim().toLowerCase() &&
            String(row.project || '').trim()
        )?.project || ''

      if (!String(prev.project || '').trim() && matchingProject) {
        next.project = matchingProject
      }

      return next
    })
  }

  async function getNextInvoiceNumber() {
    const { data, error } = await supabase
      .from('admin_invoices')
      .select('invoice_number')
      .not('invoice_number', 'is', null)

    if (error) throw error

    let maxNumber = 0
    ;(data || []).forEach((row) => {
      const raw = String(row.invoice_number || '')
      const match = raw.match(/(\d+)$/)
      if (!match) return
      maxNumber = Math.max(maxNumber, Number(match[1] || 0))
    })

    return `INV-${String(maxNumber + 1).padStart(4, '0')}`
  }

  async function handleImportProjectCosts() {
    const selectedProject = String(form.project || '').trim()
    if (!selectedProject) {
      setMessage(copy.importProjectRequired)
      return
    }

    try {
      setImportingCosts(true)
      setMessage('')

      const [materialsRes, timeRes, workersRes] = await Promise.all([
        supabase
          .from('admin_project_materials')
          .select('project_name, client_name, quantity, unit_cost')
          .eq('project_name', selectedProject),
        supabase
          .from('admin_time_entries')
          .select('jobsite, worker, role, clock_in_at, clock_out_at')
          .eq('jobsite', selectedProject),
        supabase
          .from('admin_workers')
          .select('name, hourly_rate')
      ])

      if (materialsRes.error) throw materialsRes.error
      if (timeRes.error) throw timeRes.error
      if (workersRes.error) throw workersRes.error

      const selectedClient = String(form.client || '').trim().toLowerCase()

      const filteredMaterials = selectedClient
        ? (materialsRes.data || []).filter(
            (row) => String(row.client_name || '').trim().toLowerCase() === selectedClient
          )
        : (materialsRes.data || [])

      const workerRateMap = new Map(
        (workersRes.data || []).map((row) => [String(row.name || '').trim(), Number(row.hourly_rate || 0)])
      )

      const totalMaterials = filteredMaterials.reduce(
        (sum, row) => sum + Number(row.quantity || 0) * Number(row.unit_cost || 0),
        0
      )

      const totalLabor = (timeRes.data || []).reduce((sum, row) => {
        if (!row.clock_out_at) return sum
        const hours = Math.max(
          (new Date(row.clock_out_at).getTime() - new Date(row.clock_in_at).getTime()) / 3600000,
          0
        )
        const rate = workerRateMap.get(String(row.worker || '').trim()) || 35
        return sum + hours * rate
      }, 0)

      if (totalMaterials <= 0 && totalLabor <= 0) {
        setMessage(copy.noProjectCostsFound)
        return
      }

      const importedItems = []
      if (totalMaterials > 0) importedItems.push(makeLineItem('Materials Cost', totalMaterials))
      if (totalLabor > 0) importedItems.push(makeLineItem('Labor Cost', totalLabor))

      setForm((prev) => ({
        ...prev,
        items: importedItems.length > 0 ? importedItems : prev.items
      }))
      setMessage(copy.importedCosts)
    } catch (error) {
      console.error(error)
      setMessage(copy.importCostsError)
    } finally {
      setImportingCosts(false)
    }
  }

  function generatePdf(doc) {
    const popup = window.open('', '_blank', 'width=960,height=720')
    if (!popup) return

    popup.document.open()
    popup.document.write(renderPdfHtml(doc, copy))
    popup.document.close()
    popup.focus()

    setTimeout(() => {
      popup.print()
    }, 250)
  }

  async function handleSave(event) {
    event.preventDefault()

    if (!String(form.client || '').trim()) {
      setMessage(copy.clientRequired)
      return
    }

    setSaving(true)
    setMessage('')

    const cleanedItems = (form.items || [])
      .map((item) => ({
        id: item.id || crypto.randomUUID(),
        label: String(item.label || '').trim(),
        amount: String(item.amount || '').trim()
      }))
      .filter((item) => item.label || item.amount)

    const total = cleanedItems.reduce((sum, item) => sum + Number(item.amount || 0), 0)
    const amountPaid = Math.min(Number(form.amountPaid || 0), total)

    let smartStatus = 'draft'
    if (amountPaid >= total && total > 0) smartStatus = 'paid'
    else if (amountPaid > 0) smartStatus = 'sent'
    else smartStatus = String(form.status || 'draft')

    const invoiceNumber = form.invoiceNumber || (await getNextInvoiceNumber())

    const payload = {
      type: String(form.type || 'estimate'),
      client: String(form.client || '').trim(),
      project: String(form.project || '').trim() || null,
      status: smartStatus,
      notes: String(form.notes || '').trim() || null,
      items: cleanedItems.length > 0 ? cleanedItems : [makeLineItem()],
      amount_paid: amountPaid || 0,
      payment_received_at: form.paymentDate || null,
      due_date: form.dueDate || null,
      invoice_number: invoiceNumber
    }

    try {
      if (form.id) {
        const { data, error } = await supabase
          .from('admin_invoices')
          .update(payload)
          .eq('id', form.id)
          .select('id, type, client, project, status, notes, items, amount_paid, payment_received_at, due_date, invoice_number, created_at')
          .single()

        if (error) throw error

        const mapped = mapDbRowToDoc(data)
        setDocuments((prev) => prev.map((doc) => (doc.id === mapped.id ? mapped : doc)))
      } else {
        const { data, error } = await supabase
          .from('admin_invoices')
          .insert(payload)
          .select('id, type, client, project, status, notes, items, amount_paid, payment_received_at, due_date, invoice_number, created_at')
          .single()

        if (error) throw error

        const mapped = mapDbRowToDoc(data)
        setDocuments((prev) => [mapped, ...prev])
      }

      setForm(makeEmptyDoc())
      setMessage(copy.saved)
    } catch (error) {
      console.error(error)
      setMessage(copy.saveError)
    } finally {
      setSaving(false)
    }
  }

  function handleEdit(doc) {
    setForm({
      ...doc,
      items: Array.isArray(doc.items) && doc.items.length > 0 ? doc.items : [makeLineItem()]
    })
    setMessage('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleDelete(id) {
    try {
      setMessage('')
      const { error } = await supabase.from('admin_invoices').delete().eq('id', id)
      if (error) throw error

      setDocuments((prev) => prev.filter((doc) => doc.id !== id))
      if (form.id === id) setForm(makeEmptyDoc())
      setMessage(copy.deleted)
    } catch (error) {
      console.error(error)
      setMessage(copy.deleteError)
    }
  }

  async function handleMarkPaid(doc) {
    try {
      setMessage('')
      const total = docTotal(doc)
      const payload = {
        status: 'paid',
        amount_paid: total,
        payment_received_at: new Date().toISOString().slice(0, 10)
      }

      const { data, error } = await supabase
        .from('admin_invoices')
        .update(payload)
        .eq('id', doc.id)
        .select('id, type, client, project, status, notes, items, amount_paid, payment_received_at, due_date, invoice_number, created_at')
        .single()

      if (error) throw error

      const mapped = mapDbRowToDoc(data)
      setDocuments((prev) => prev.map((item) => (item.id === mapped.id ? mapped : item)))
      setMessage(copy.paymentSaved)
    } catch (error) {
      console.error(error)
      setMessage(copy.paymentError)
    }
  }


  function duplicateInvoice(doc) {
    setForm({
      ...doc,
      id: '',
      invoiceNumber: '',
      createdAt: '',
      status: 'draft'
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function quickAddPayment(doc, amount) {
    const updated = Math.min(Number(doc.amountPaid || 0) + amount, docTotal(doc))
    setForm({ ...doc, amountPaid: updated })
  }

  function shareInvoice(doc) {
    const total = docTotal(doc)
    const message = `Invoice ${doc.invoiceNumber || ''}\nClient: ${doc.client}\nProject: ${doc.project}\nTotal: ${money(total)}\nDue: ${doc.dueDate || 'N/A'}\n\n- Sent via Surplox`
    navigator.clipboard.writeText(message)
    alert('Invoice copied to clipboard')
  }

  function emailInvoice(doc) {
    const total = docTotal(doc)
    const body = encodeURIComponent(`Invoice ${doc.invoiceNumber || ''}\nClient: ${doc.client}\nProject: ${doc.project}\nTotal: ${money(total)}\nDue: ${doc.dueDate || 'N/A'}`)
    window.open(`mailto:?subject=Invoice ${doc.invoiceNumber || ''}&body=${body}`)
  }

  function smsInvoice(doc) {
    const total = docTotal(doc)
    const body = encodeURIComponent(`Invoice ${doc.invoiceNumber || ''}\nTotal: ${money(total)}\nDue: ${doc.dueDate || 'N/A'}`)
    window.open(`sms:?body=${body}`)
  }

  if (loading) {
    return <div className="card">{copy.loading}</div>
  }

  return (
    <div className="grid" style={{ gap: 18 }}>
      {message ? (
        <div className="card-message" style={{ padding: 14, borderRadius: 18 }}>
          {message}
        </div>
      ) : null}

      <div className="card rounded-xl" style={{ padding: 26, background: 'linear-gradient(180deg, #fff7c8 0%, #f7f7f2 100%)' }}>
        <div className="badge" style={{ marginBottom: 12, background: '#f1e7a8' }}>{copy.badge}</div>
        <div className="h1">{copy.title}</div>
        <p className="muted" style={{ marginTop: 10, maxWidth: 900, lineHeight: 1.7 }}>{copy.body}</p>
        <div style={{ marginTop: 14 }}>
          <Link className="btn" to="/admin">{copy.back}</Link>
        </div>
      </div>

      <div className="grid two">
        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">{copy.formTitle}</div>
          <form onSubmit={handleSave} className="grid" style={{ gap: 12, marginTop: 14 }}>
            <div className="grid two">
              <select className="input" value={form.type} onChange={(e) => setField('type', e.target.value)}>
                <option value="estimate">{copy.estimate}</option>
                <option value="invoice">{copy.invoice}</option>
              </select>
              <select className="input" value={form.status} onChange={(e) => setField('status', e.target.value)}>
                <option value="draft">{copy.draft}</option>
                <option value="sent">{copy.sent}</option>
                <option value="paid">{copy.paid}</option>
              </select>
            </div>

            <div className="grid two">
              <input
                className="input"
                value={form.invoiceNumber}
                onChange={(e) => setField('invoiceNumber', e.target.value)}
                placeholder={copy.invoiceNumber}
              />
              <input
                className="input"
                type="date"
                value={form.dueDate}
                onChange={(e) => setField('dueDate', e.target.value)}
              />
            </div>

            <div>
              <input
                className="input"
                list="crm-client-options"
                value={form.client}
                onChange={(e) => handleClientChange(e.target.value)}
                placeholder={copy.client}
              />
              <datalist id="crm-client-options">
                {crmClients.map((client) => (
                  <option key={client} value={client} />
                ))}
              </datalist>
              <div className="muted" style={{ marginTop: 6 }}>
                {crmClients.length > 0 ? copy.crmClientHint : copy.noCrmRecords}
              </div>
            </div>

            <div>
              <input
                className="input"
                list="crm-project-options"
                value={form.project}
                onChange={(e) => setField('project', e.target.value)}
                placeholder={copy.project}
              />
              <datalist id="crm-project-options">
                {crmProjects.map((project) => (
                  <option key={project} value={project} />
                ))}
              </datalist>
              <div className="muted" style={{ marginTop: 6 }}>
                {copy.crmProjectHint}
              </div>
            </div>

            <div className="grid" style={{ gap: 10 }}>
              {form.items.map((item) => (
                <div key={item.id} className="grid two" style={{ alignItems: 'center' }}>
                  <input className="input" value={item.label} onChange={(e) => updateItem(item.id, 'label', e.target.value)} placeholder={copy.lineItem} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input className="input" type="number" step="0.01" value={item.amount} onChange={(e) => updateItem(item.id, 'amount', e.target.value)} placeholder={copy.amount} />
                    <button type="button" className="btn" onClick={() => removeItem(item.id)}>×</button>
                  </div>
                </div>
              ))}
            </div>

            <button type="button" className="btn" onClick={addItem}>{copy.addItem}</button>
            <textarea className="input" value={form.notes} onChange={(e) => setField('notes', e.target.value)} placeholder={copy.notesPlaceholder} />

            <div className="card-soft" style={{ background: '#ffffff' }}>
              <div className="card-section-title" style={{ fontSize: 15 }}>{copy.paymentTracking}</div>
              <div className="grid two" style={{ marginTop: 12 }}>
                <input
                  className="input"
                  type="number"
                  step="0.01"
                  value={form.amountPaid}
                  onChange={(e) => setField('amountPaid', e.target.value)}
                  placeholder={copy.amountPaid}
                />
                <input
                  className="input"
                  type="date"
                  value={form.paymentDate}
                  onChange={(e) => setField('paymentDate', e.target.value)}
                />
              </div>
            </div>

            <button type="button" className="btn" onClick={handleImportProjectCosts} disabled={importingCosts}>
              {importingCosts ? copy.importingCosts : copy.importProjectCosts}
            </button>

            <div className="card-soft" style={{ background: '#ffffff' }}>
              <div className="muted">{copy.subtotal}</div>
              <div style={{ fontSize: 28, fontWeight: 900, marginTop: 8 }}>{money(subtotal)}</div>
              <div className="muted" style={{ marginTop: 8 }}>{copy.balanceDue}: {money(Math.max(subtotal - Number(form.amountPaid || 0), 0))}</div>
            </div>
            <button className="btn primary" type="submit" disabled={saving}>{saving ? copy.saving : copy.save}</button>
          </form>
        </div>

        <div className="grid" style={{ gap: 14 }}>
          <div className="grid two">
            <div className="card-soft"><div className="muted">{copy.totalDocs}</div><div style={{ fontSize: 28, fontWeight: 900, marginTop: 8 }}>{stats.totalDocs}</div></div>
            <div className="card-soft"><div className="muted">{copy.totalValue}</div><div style={{ fontSize: 28, fontWeight: 900, marginTop: 8 }}>{money(stats.totalValue)}</div></div>
            <div className="card-soft"><div className="muted">{copy.paidValue}</div><div style={{ fontSize: 28, fontWeight: 900, marginTop: 8 }}>{money(stats.paidValue)}</div></div>
            <div className="card-soft"><div className="muted">{copy.unpaidValue}</div><div style={{ fontSize: 28, fontWeight: 900, marginTop: 8 }}>{money(stats.unpaidValue)}</div></div>
          </div>

          <div className="card rounded-xl" style={{ padding: 22 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
              <button type="button" className={statusFilter === 'all' ? 'btn primary small' : 'btn small'} onClick={() => setStatusFilter('all')}>{copy.all}</button>
              <button type="button" className={statusFilter === 'paid' ? 'btn primary small' : 'btn small'} onClick={() => setStatusFilter('paid')}>{copy.paid}</button>
              <button type="button" className={statusFilter === 'unpaid' ? 'btn primary small' : 'btn small'} onClick={() => setStatusFilter('unpaid')}>{copy.unpaid}</button>
              <button type="button" className={statusFilter === 'overdue' ? 'btn primary small' : 'btn small'} onClick={() => setStatusFilter('overdue')}>{copy.overdue}</button>
            </div>

            {filteredDocuments.length === 0 ? (
              <div className="card-soft">
                <div className="card-section-title">{copy.emptyTitle}</div>
                <p className="card-section-subtitle" style={{ marginTop: 8 }}>{copy.emptyBody}</p>
              </div>
            ) : (
              <div className="list">
                {filteredDocuments
                  .slice()
                  .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
                  .map((doc) => {
                    const total = docTotal(doc)
                    const amountPaid = Number(doc.amountPaid || 0)
                    const balanceDue = Math.max(total - amountPaid, 0)
                    const smartStatus = computedStatus(doc)

                    return (
                      <div key={doc.id} className="card-soft" style={{ background: '#ffffff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 900, fontSize: 18 }}>{doc.client}</div>
                            {doc.invoiceNumber ? <div className="muted" style={{ marginTop: 4 }}>{copy.invoiceNumber}: {doc.invoiceNumber}</div> : null}
                          </div>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <span className="badge">{doc.type === 'estimate' ? copy.estimate : copy.invoice}</span>
                            <span className="badge" style={smartStatus === 'overdue' ? { background: '#ffd8d8', color: '#8a1111' } : {}}>
                              {statusLabel(smartStatus, copy)}
                            </span>
                          </div>
                        </div>
                        {doc.project ? <div className="muted" style={{ marginTop: 8 }}>{doc.project}</div> : null}
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
                          <span className="badge">{copy.subtotal}: {money(total)}</span>
                          <span className="badge">{copy.amountPaid}: {money(amountPaid)}</span>
                          <span className="badge">{copy.balanceDue}: {money(balanceDue)}</span>
                          <span className="badge">{copy.dueDate}: {doc.dueDate ? new Date(doc.dueDate).toLocaleDateString() : copy.noDueDate}</span>
                          <span className="badge">{copy.paymentDate}: {doc.paymentDate ? new Date(doc.paymentDate).toLocaleDateString() : copy.noPaymentDate}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
                          <button type="button" className="btn small" onClick={() => handleEdit(doc)}>{copy.edit}</button>
                          <button type="button" className="btn small" onClick={() => handleDelete(doc.id)}>{copy.delete}</button>
                          <button type="button" className="btn small primary" onClick={() => generatePdf(doc)}>{copy.pdf}</button>
                          <button type="button" className="btn small" onClick={() => duplicateInvoice(doc)}>Duplicate</button>
                          <button type="button" className="btn small" onClick={() => shareInvoice(doc)}>Copy</button>
                          <button type="button" className="btn small" onClick={() => emailInvoice(doc)}>Email</button>
                          <button type="button" className="btn small" onClick={() => smsInvoice(doc)}>SMS</button>
                          <button type="button" className="btn small" onClick={() => quickAddPayment(doc,100)}>+100</button>
                          <button type="button" className="btn small" onClick={() => quickAddPayment(doc,500)}>+500</button>
                          <button type="button" className="btn small" onClick={() => quickAddPayment(doc,1000)}>+1000</button>
{smartStatus !== 'paid' ? (
                            <button type="button" className="btn small" onClick={() => handleMarkPaid(doc)}>{copy.markPaid}</button>
                          ) : null}
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
