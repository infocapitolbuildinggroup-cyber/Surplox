import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const COPY = {
  en: {
    badge: 'Invoices & Estimates',
    title: 'Create rough estimates and invoices inside Surplox.',
    body:
      'Build invoices with branding, customer details, project-linked costs, and downloadable PDF output.',
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
    lineItem: 'Description',
    qty: 'Qty',
    unitPrice: 'Unit Price',
    amount: 'Total',
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
    duplicate: 'Duplicate',
    copyShare: 'Copy',
    email: 'Email',
    sms: 'SMS',
    loading: 'Loading invoices…',
    loadError: 'Unable to load invoices right now.',
    saveError: 'Unable to save invoice right now.',
    deleteError: 'Unable to delete invoice right now.',
    clientRequired: 'Client / Company is required.',
    saved: 'Invoice saved.',
    deleted: 'Invoice deleted.',
    pdf: 'Download PDF',
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
    today: 'Today',
    companyName: 'Company Name',
    companyAddress: 'Company Address',
    companyPhone: 'Company Phone',
    companyEmail: 'Company Email',
    logoUpload: 'Logo Upload',
    invoiceFor: 'Invoice For',
    payableTo: 'Payable To',
    customerPhone: 'Customer Phone',
    customerEmail: 'Customer Email',
    invoiceDate: 'Invoice Date',
    referenceNumber: 'Reference Number',
    shareCopied: 'Invoice copied to clipboard.',
    quickPay: 'Quick Pay',
    downloadReady: 'PDF downloaded.',
    paymentMethod: 'Payment Method',
    partialPayment: 'Add Partial Payment',
    paymentHistoryTitle: 'Payment History',
    paymentAmount: 'Payment Amount',
    paymentNotes: 'Payment Notes',
    card: 'Card',
    cash: 'Cash',
    check: 'Check',
    wire: 'Wire',
    ach: 'ACH',
    other: 'Other',
    noPaymentHistory: 'No payment history yet.',
    publicLink: 'Public Link',
    openLink: 'Open Link',
    copyLink: 'Copy Link',
    shareLinkCopied: 'Share link copied.',
    attachPdfHelp: 'Download the PDF, then attach it to your email from your mail app.',
    sendShareTitle: 'Send / Share',
    paymentAdded: 'Payment recorded.'
  },
  es: {
    badge: 'Facturas y Estimados',
    title: 'Crea estimados y facturas dentro de Surplox.',
    body:
      'Crea facturas con branding, datos del cliente, costos del proyecto y PDF descargable.',
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
    lineItem: 'Descripción',
    qty: 'Cant.',
    unitPrice: 'Precio Unitario',
    amount: 'Total',
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
    duplicate: 'Duplicar',
    copyShare: 'Copiar',
    email: 'Email',
    sms: 'SMS',
    loading: 'Cargando facturas…',
    loadError: 'No se pudieron cargar las facturas.',
    saveError: 'No se pudo guardar la factura.',
    deleteError: 'No se pudo eliminar la factura.',
    clientRequired: 'Cliente / Empresa es obligatorio.',
    saved: 'Factura guardada.',
    deleted: 'Factura eliminada.',
    pdf: 'Descargar PDF',
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
    today: 'Hoy',
    companyName: 'Nombre de la Empresa',
    companyAddress: 'Dirección de la Empresa',
    companyPhone: 'Teléfono de la Empresa',
    companyEmail: 'Email de la Empresa',
    logoUpload: 'Subir Logo',
    invoiceFor: 'Factura Para',
    payableTo: 'Pagadero A',
    customerPhone: 'Teléfono del Cliente',
    customerEmail: 'Email del Cliente',
    invoiceDate: 'Fecha de Factura',
    referenceNumber: 'Número de Referencia',
    shareCopied: 'Factura copiada al portapapeles.',
    quickPay: 'Pago Rápido',
    downloadReady: 'PDF descargado.',
    paymentMethod: 'Método de Pago',
    partialPayment: 'Agregar Pago Parcial',
    paymentHistoryTitle: 'Historial de Pagos',
    paymentAmount: 'Monto del Pago',
    paymentNotes: 'Notas del Pago',
    card: 'Tarjeta',
    cash: 'Efectivo',
    check: 'Cheque',
    wire: 'Transferencia',
    ach: 'ACH',
    other: 'Otro',
    noPaymentHistory: 'Todavía no hay historial de pagos.',
    publicLink: 'Enlace Público',
    openLink: 'Abrir Enlace',
    copyLink: 'Copiar Enlace',
    shareLinkCopied: 'Enlace copiado.',
    attachPdfHelp: 'Descarga el PDF y luego adjúntalo desde tu app de correo.',
    sendShareTitle: 'Enviar / Compartir',
    paymentAdded: 'Pago registrado.'
  }
}

function makeLineItem(label = '', qty = 1, unitPrice = '', amount = '') {
  return { id: crypto.randomUUID(), label, qty, unitPrice, amount }
}

function normalizeItem(item = {}) {
  const qty = Number(item.qty || 1)
  const unitPrice =
    item.unitPrice !== undefined && item.unitPrice !== null && item.unitPrice !== ''
      ? Number(item.unitPrice || 0)
      : item.amount !== undefined && item.amount !== null && item.amount !== ''
        ? Number(item.amount || 0)
        : 0
  const amount = qty * unitPrice

  return {
    id: item.id || crypto.randomUUID(),
    label: item.label || '',
    qty,
    unitPrice,
    amount
  }
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
    createdAt: '',
    companyName: 'Capitol Building Group',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    logoUrl: '',
    invoiceForName: '',
    payableToName: 'Capitol Building Group',
    customerPhone: '',
    customerEmail: '',
    invoiceDate: '',
    referenceNumber: '',
    paymentMethod: '',
    paymentHistory: [],
    paymentAmount: '',
    paymentNotes: ''
  }
}

function money(value) {
  const number = Number(value || 0)
  return `$${number.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function docTotal(doc) {
  return (doc.items || []).reduce((sum, item) => {
    const normalized = normalizeItem(item)
    return sum + Number(normalized.amount || 0)
  }, 0)
}

function mapDbRowToDoc(row = {}) {
  return {
    id: row.id || '',
    type: row.type || 'estimate',
    client: row.client || '',
    project: row.project || '',
    status: row.status || 'draft',
    notes: row.notes || '',
    items: Array.isArray(row.items) && row.items.length > 0 ? row.items.map(normalizeItem) : [makeLineItem()],
    amountPaid: row.amount_paid ?? '',
    paymentDate: row.payment_received_at || '',
    dueDate: row.due_date || '',
    invoiceNumber: row.invoice_number || '',
    createdAt: row.created_at || '',
    companyName: row.company_name || 'Capitol Building Group',
    companyAddress: row.company_address || '',
    companyPhone: row.company_phone || '',
    companyEmail: row.company_email || '',
    logoUrl: row.logo_url || '',
    invoiceForName: row.invoice_for_name || '',
    payableToName: row.payable_to_name || 'Capitol Building Group',
    customerPhone: row.customer_phone || '',
    customerEmail: row.customer_email || '',
    invoiceDate: row.invoice_date || '',
    referenceNumber: row.reference_number || '',
    paymentMethod: row.payment_method || '',
    paymentHistory: Array.isArray(row.payment_history) ? row.payment_history : [],
    paymentAmount: '',
    paymentNotes: ''
  }
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
            .select('id, type, client, project, status, notes, items, amount_paid, payment_received_at, due_date, invoice_number, created_at, company_name, company_address, company_phone, company_email, logo_url, invoice_for_name, payable_to_name, customer_phone, customer_email, invoice_date, reference_number, payment_method, payment_history')
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
    () => form.items.reduce((sum, item) => sum + Number(normalizeItem(item).amount || 0), 0),
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
      items: prev.items.map((item) => {
        if (item.id !== id) return item
        const next = { ...item, [key]: value }
        const normalized = normalizeItem(next)
        return {
          ...next,
          qty: normalized.qty,
          unitPrice: normalized.unitPrice,
          amount: normalized.amount
        }
      })
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
      if (!String(prev.invoiceForName || '').trim()) {
        next.invoiceForName = value
      }

      return next
    })
  }

  async function handleLogoUpload(event) {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setForm((prev) => ({ ...prev, logoUrl: String(reader.result || '') }))
    }
    reader.readAsDataURL(file)
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
      if (totalMaterials > 0) importedItems.push(makeLineItem('Materials Cost', 1, totalMaterials, totalMaterials))
      if (totalLabor > 0) importedItems.push(makeLineItem('Labor Cost', 1, totalLabor, totalLabor))

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
    const pdf = new jsPDF('p', 'pt', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const left = 40
    const right = pageWidth - 40
    const total = docTotal(doc)
    const amountPaid = Number(doc.amountPaid || 0)
    const balanceDue = Math.max(total - amountPaid, 0)
    const smartStatus = computedStatus(doc)

    if (doc.logoUrl) {
      try {
        const logoProps = pdf.getImageProperties(doc.logoUrl)
        const maxLogoWidth = 120
        const maxLogoHeight = 48
        const widthRatio = maxLogoWidth / logoProps.width
        const heightRatio = maxLogoHeight / logoProps.height
        const scale = Math.min(widthRatio, heightRatio)
        const renderWidth = logoProps.width * scale
        const renderHeight = logoProps.height * scale
        pdf.addImage(doc.logoUrl, 'PNG', left, 28, renderWidth, renderHeight)
      } catch (e) {
        console.error('Unable to add logo image to invoice PDF', e)
      }
    }

    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(16)
    pdf.text(doc.companyName || 'Capitol Building Group', left, 95)

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    const addressLines = [
      doc.companyAddress || '',
      doc.companyPhone || '',
      doc.companyEmail || ''
    ].filter(Boolean)
    let addressY = 110
    addressLines.forEach((line) => {
      pdf.text(String(line), left, addressY)
      addressY += 13
    })

    pdf.setFillColor(230, 230, 230)
    pdf.rect(right - 180, 35, 180, 40, 'F')
    pdf.setTextColor(40, 40, 40)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(20)
    pdf.text('INVOICE', right - 90, 61, { align: 'center' })
    pdf.setTextColor(17, 17, 17)

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')
    pdf.text(`${copy.invoiceNumber}:`, right - 190, 95)
    pdf.setFont('helvetica', 'normal')
    pdf.text(doc.invoiceNumber || '—', right - 70, 95)

    pdf.setFont('helvetica', 'bold')
    pdf.text(`${copy.referenceNumber}:`, right - 190, 110)
    pdf.setFont('helvetica', 'normal')
    pdf.text(doc.referenceNumber || '—', right - 70, 110)

    pdf.setFont('helvetica', 'bold')
    pdf.text(`${copy.invoiceDate}:`, right - 190, 125)
    pdf.setFont('helvetica', 'normal')
    pdf.text(doc.invoiceDate ? new Date(doc.invoiceDate).toLocaleDateString() : new Date().toLocaleDateString(), right - 70, 125)

    pdf.setFont('helvetica', 'bold')
    pdf.text(`${copy.dueDate}:`, right - 190, 140)
    pdf.setFont('helvetica', 'normal')
    pdf.text(doc.dueDate ? new Date(doc.dueDate).toLocaleDateString() : copy.noDueDate, right - 70, 140)

    pdf.setFont('helvetica', 'bold')
    pdf.text(`${copy.status}:`, right - 190, 155)
    pdf.setFont('helvetica', 'normal')
    pdf.text(statusLabel(smartStatus, copy), right - 70, 155)

    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(11)
    pdf.text(copy.invoiceFor, left, 190)
    pdf.text(copy.payableTo, 310, 190)

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    const invoiceForLines = [
      doc.invoiceForName || doc.client || '',
      doc.project || '',
      doc.customerPhone || '',
      doc.customerEmail || ''
    ].filter(Boolean)
    let y1 = 205
    invoiceForLines.forEach((line) => {
      pdf.text(String(line), left, y1)
      y1 += 13
    })

    const payableLines = [
      doc.payableToName || doc.companyName || '',
      doc.companyAddress || '',
      doc.companyPhone || '',
      doc.companyEmail || ''
    ].filter(Boolean)
    let y2 = 205
    payableLines.forEach((line) => {
      pdf.text(String(line), 310, y2)
      y2 += 13
    })

    const bodyRows = (doc.items || []).map((item) => {
      const normalized = normalizeItem(item)
      return [
        String(normalized.label || '').trim(),
        String(normalized.qty || 1),
        money(normalized.unitPrice || 0),
        money(normalized.amount || 0)
      ]
    })

    autoTable(pdf, {
      startY: 275,
      head: [[copy.lineItem, copy.qty, copy.unitPrice, copy.amount]],
      body: bodyRows,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 10,
        cellPadding: 6,
        overflow: 'linebreak',
        valign: 'middle'
      },
      headStyles: {
        fillColor: [245, 245, 245],
        textColor: 17,
        halign: 'center',
        valign: 'middle'
      },
      bodyStyles: {
        valign: 'middle'
      },
      columnStyles: {
        0: { cellWidth: 260, halign: 'left' },
        1: { cellWidth: 45, halign: 'center' },
        2: { cellWidth: 90, halign: 'right' },
        3: { cellWidth: 90, halign: 'right' }
      },
      margin: { left, right: 40 }
    })

    const finalY = pdf.lastAutoTable.finalY + 18

    pdf.setFont('helvetica', 'normal')
    pdf.text(copy.notes, left, finalY)
    pdf.setFont('helvetica', 'normal')
    const notesLines = pdf.splitTextToSize(doc.notes || '—', 250)
    pdf.text(notesLines, left, finalY + 14)

    const totalsX = right - 180
    pdf.setFont('helvetica', 'normal')
    pdf.text(copy.subtotal, totalsX, finalY)
    pdf.text(money(total), right, finalY, { align: 'right' })
    pdf.text(copy.amountPaid, totalsX, finalY + 16)
    pdf.text(money(amountPaid), right, finalY + 16, { align: 'right' })
    pdf.setFont('helvetica', 'bold')
    pdf.text(copy.balanceDue, totalsX, finalY + 34)
    pdf.text(money(balanceDue), right, finalY + 34, { align: 'right' })

    pdf.save(`${doc.invoiceNumber || 'invoice'}.pdf`)
    setMessage(copy.downloadReady)
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
      .map((item) => normalizeItem(item))
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
      invoice_number: invoiceNumber,
      company_name: String(form.companyName || '').trim() || null,
      company_address: String(form.companyAddress || '').trim() || null,
      company_phone: String(form.companyPhone || '').trim() || null,
      company_email: String(form.companyEmail || '').trim() || null,
      logo_url: String(form.logoUrl || '').trim() || null,
      invoice_for_name: String(form.invoiceForName || '').trim() || null,
      payable_to_name: String(form.payableToName || '').trim() || null,
      customer_phone: String(form.customerPhone || '').trim() || null,
      customer_email: String(form.customerEmail || '').trim() || null,
      invoice_date: form.invoiceDate || null,
      reference_number: String(form.referenceNumber || '').trim() || null,
      payment_method: String(form.paymentMethod || '').trim() || null,
      payment_history: Array.isArray(form.paymentHistory) ? form.paymentHistory : []
    }

    try {
      if (form.id) {
        const { data, error } = await supabase
          .from('admin_invoices')
          .update(payload)
          .eq('id', form.id)
          .select('id, type, client, project, status, notes, items, amount_paid, payment_received_at, due_date, invoice_number, created_at, company_name, company_address, company_phone, company_email, logo_url, invoice_for_name, payable_to_name, customer_phone, customer_email, invoice_date, reference_number, payment_method, payment_history')
          .single()

        if (error) throw error
        const mapped = mapDbRowToDoc(data)
        setDocuments((prev) => prev.map((doc) => (doc.id === mapped.id ? mapped : doc)))
      } else {
        const { data, error } = await supabase
          .from('admin_invoices')
          .insert(payload)
          .select('id, type, client, project, status, notes, items, amount_paid, payment_received_at, due_date, invoice_number, created_at, company_name, company_address, company_phone, company_email, logo_url, invoice_for_name, payable_to_name, customer_phone, customer_email, invoice_date, reference_number, payment_method, payment_history')
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
      items: Array.isArray(doc.items) && doc.items.length > 0 ? doc.items.map(normalizeItem) : [makeLineItem()]
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
        payment_received_at: new Date().toISOString().slice(0, 10),
        payment_method: doc.paymentMethod || null,
        payment_history: [
          ...(Array.isArray(doc.paymentHistory) ? doc.paymentHistory : []),
          {
            amount: Math.max(total - Number(doc.amountPaid || 0), 0),
            date: new Date().toISOString(),
            method: doc.paymentMethod || '',
            notes: 'Marked paid'
          }
        ]
      }

      const { data, error } = await supabase
        .from('admin_invoices')
        .update(payload)
        .eq('id', doc.id)
        .select('id, type, client, project, status, notes, items, amount_paid, payment_received_at, due_date, invoice_number, created_at, company_name, company_address, company_phone, company_email, logo_url, invoice_for_name, payable_to_name, customer_phone, customer_email, invoice_date, reference_number, payment_method, payment_history')
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
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function shareInvoice(doc) {
    const total = docTotal(doc)
    const shareText = `Invoice ${doc.invoiceNumber || ''}\nClient: ${doc.client}\nProject: ${doc.project}\nTotal: ${money(total)}\nDue: ${doc.dueDate || 'N/A'}\n\n- Sent via Surplox`
    navigator.clipboard.writeText(shareText)
    setMessage(copy.shareCopied)
  }

  function emailInvoice(doc) {
    const total = docTotal(doc)
    const body = encodeURIComponent(`Invoice ${doc.invoiceNumber || ''}\nClient: ${doc.client}\nProject: ${doc.project}\nTotal: ${money(total)}\nDue: ${doc.dueDate || 'N/A'}\nLink: ${getPublicInvoiceLink(doc)}\n\n${copy.attachPdfHelp}`)
    window.open(`mailto:${doc.customerEmail || ''}?subject=Invoice ${doc.invoiceNumber || ''}&body=${body}`)
  }

  function smsInvoice(doc) {
    const total = docTotal(doc)
    const body = encodeURIComponent(`Invoice ${doc.invoiceNumber || ''}\nTotal: ${money(total)}\nDue: ${doc.dueDate || 'N/A'}\nLink: ${getPublicInvoiceLink(doc)}`)
    window.open(`sms:${doc.customerPhone || ''}?body=${body}`)
  }


  function getPublicInvoiceLink(doc) {
    return `${window.location.origin}/invoice/${doc.id}`
  }

  function copyInvoiceLink(doc) {
    navigator.clipboard.writeText(getPublicInvoiceLink(doc))
    setMessage(copy.shareLinkCopied)
  }

  function openInvoiceLink(doc) {
    window.open(getPublicInvoiceLink(doc), '_blank')
  }

  async function recordPayment(doc, amountOverride = null) {
    try {
      const paymentAmount = Number(amountOverride ?? doc.paymentAmount ?? 0)
      if (!paymentAmount || paymentAmount <= 0) return

      const existingHistory = Array.isArray(doc.paymentHistory) ? doc.paymentHistory : []
      const nextHistory = [
        ...existingHistory,
        {
          amount: paymentAmount,
          date: new Date().toISOString(),
          method: doc.paymentMethod || '',
          notes: String(doc.paymentNotes || '').trim()
        }
      ]

      const totalPaid = Math.min(Number(doc.amountPaid || 0) + paymentAmount, docTotal(doc))
      const nextStatus = totalPaid >= docTotal(doc) && docTotal(doc) > 0 ? 'paid' : 'sent'

      const { data, error } = await supabase
        .from('admin_invoices')
        .update({
          amount_paid: totalPaid,
          payment_received_at: new Date().toISOString().slice(0, 10),
          payment_method: doc.paymentMethod || null,
          payment_history: nextHistory,
          status: nextStatus
        })
        .eq('id', doc.id)
        .select('id, type, client, project, status, notes, items, amount_paid, payment_received_at, due_date, invoice_number, created_at, company_name, company_address, company_phone, company_email, logo_url, invoice_for_name, payable_to_name, customer_phone, customer_email, invoice_date, reference_number, payment_method, payment_history')
        .single()

      if (error) throw error

      const mapped = mapDbRowToDoc(data)
      setDocuments((prev) => prev.map((item) => (item.id === mapped.id ? mapped : item)))
      if (form.id === mapped.id) {
        setForm((prev) => ({ ...mapped, paymentAmount: '', paymentNotes: '' }))
      }
      setMessage(copy.paymentAdded)
    } catch (error) {
      console.error(error)
      setMessage(copy.paymentError)
    }
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
              <input className="input" value={form.invoiceNumber} onChange={(e) => setField('invoiceNumber', e.target.value)} placeholder={copy.invoiceNumber} />
              <input className="input" type="date" value={form.invoiceDate} onChange={(e) => setField('invoiceDate', e.target.value)} />
            </div>

            <div className="grid two">
              <input className="input" type="date" value={form.dueDate} onChange={(e) => setField('dueDate', e.target.value)} />
              <input className="input" value={form.referenceNumber} onChange={(e) => setField('referenceNumber', e.target.value)} placeholder={copy.referenceNumber} />
            </div>

            <div className="grid two">
              <input className="input" value={form.companyName} onChange={(e) => setField('companyName', e.target.value)} placeholder={copy.companyName} />
              <input className="input" value={form.payableToName} onChange={(e) => setField('payableToName', e.target.value)} placeholder={copy.payableTo} />
            </div>

            <textarea className="input" value={form.companyAddress} onChange={(e) => setField('companyAddress', e.target.value)} placeholder={copy.companyAddress} />
            <div className="grid two">
              <input className="input" value={form.companyPhone} onChange={(e) => setField('companyPhone', e.target.value)} placeholder={copy.companyPhone} />
              <input className="input" value={form.companyEmail} onChange={(e) => setField('companyEmail', e.target.value)} placeholder={copy.companyEmail} />
            </div>

            <div>
              <div className="muted" style={{ marginBottom: 6 }}>{copy.logoUpload}</div>
              <input className="input" type="file" accept="image/*" onChange={handleLogoUpload} />
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

            <div className="grid two">
              <input className="input" value={form.invoiceForName} onChange={(e) => setField('invoiceForName', e.target.value)} placeholder={copy.invoiceFor} />
              <input className="input" value={form.customerPhone} onChange={(e) => setField('customerPhone', e.target.value)} placeholder={copy.customerPhone} />
            </div>

            <input className="input" value={form.customerEmail} onChange={(e) => setField('customerEmail', e.target.value)} placeholder={copy.customerEmail} />

            <div className="grid" style={{ gap: 10 }}>
              {form.items.map((item) => (
                <div key={item.id} className="grid" style={{ gap: 8 }}>
                  <input className="input" value={item.label} onChange={(e) => updateItem(item.id, 'label', e.target.value)} placeholder={copy.lineItem} />
                  <div className="grid two" style={{ alignItems: 'center' }}>
                    <input className="input" type="number" step="1" value={item.qty} onChange={(e) => updateItem(item.id, 'qty', e.target.value)} placeholder={copy.qty} />
                    <input className="input" type="number" step="0.01" value={item.unitPrice} onChange={(e) => updateItem(item.id, 'unitPrice', e.target.value)} placeholder={copy.unitPrice} />
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input className="input" value={money(normalizeItem(item).amount)} readOnly placeholder={copy.amount} />
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
                <input className="input" type="number" step="0.01" value={form.amountPaid} onChange={(e) => setField('amountPaid', e.target.value)} placeholder={copy.amountPaid} />
                <input className="input" type="date" value={form.paymentDate} onChange={(e) => setField('paymentDate', e.target.value)} />
              </div>
              <select className="input" style={{ marginTop: 12 }} value={form.paymentMethod} onChange={(e) => setField('paymentMethod', e.target.value)}>
                <option value="">{copy.paymentMethod}</option>
                <option value="card">{copy.card}</option>
                <option value="cash">{copy.cash}</option>
                <option value="check">{copy.check}</option>
                <option value="wire">{copy.wire}</option>
                <option value="ach">{copy.ach}</option>
                <option value="other">{copy.other}</option>
              </select>
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
                          <button type="button" className="btn small" onClick={() => duplicateInvoice(doc)}>{copy.duplicate}</button>
                          <button type="button" className="btn small" onClick={() => shareInvoice(doc)}>{copy.copyShare}</button>
                          <button type="button" className="btn small" onClick={() => copyInvoiceLink(doc)}>{copy.copyLink}</button>
                          <button type="button" className="btn small" onClick={() => openInvoiceLink(doc)}>{copy.openLink}</button>
                          <button type="button" className="btn small" onClick={() => emailInvoice(doc)}>{copy.email}</button>
                          <button type="button" className="btn small" onClick={() => smsInvoice(doc)}>{copy.sms}</button>
                          <button type="button" className="btn small" onClick={() => quickAddPayment(doc,100)}>+100</button>
                          <button type="button" className="btn small" onClick={() => quickAddPayment(doc,500)}>+500</button>
                          <button type="button" className="btn small" onClick={() => quickAddPayment(doc,1000)}>+1000</button>
                          {smartStatus !== 'paid' ? (
                            <button type="button" className="btn small" onClick={() => handleMarkPaid(doc)}>{copy.markPaid}</button>
                          ) : null}
                        </div>
                        <div className="grid two" style={{ marginTop: 12 }}>
                          <select className="input" value={doc.paymentMethod || ''} onChange={(e) => setDocuments((prev) => prev.map((item) => item.id === doc.id ? { ...item, paymentMethod: e.target.value } : item))}>
                            <option value="">{copy.paymentMethod}</option>
                            <option value="card">{copy.card}</option>
                            <option value="cash">{copy.cash}</option>
                            <option value="check">{copy.check}</option>
                            <option value="wire">{copy.wire}</option>
                            <option value="ach">{copy.ach}</option>
                            <option value="other">{copy.other}</option>
                          </select>
                          <input className="input" type="number" step="0.01" value={doc.paymentAmount || ''} onChange={(e) => setDocuments((prev) => prev.map((item) => item.id === doc.id ? { ...item, paymentAmount: e.target.value } : item))} placeholder={copy.paymentAmount} />
                        </div>
                        <input className="input" style={{ marginTop: 10 }} value={doc.paymentNotes || ''} onChange={(e) => setDocuments((prev) => prev.map((item) => item.id === doc.id ? { ...item, paymentNotes: e.target.value } : item))} placeholder={copy.paymentNotes} />
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
                          <button type="button" className="btn small primary" onClick={() => recordPayment(doc)}>{copy.partialPayment}</button>
                          <span className="badge">{copy.publicLink}: /invoice/{doc.id}</span>
                        </div>
                        <div className="card-soft" style={{ marginTop: 12, background: '#f8f8f4' }}>
                          <div className="card-section-title" style={{ fontSize: 15 }}>{copy.paymentHistoryTitle}</div>
                          {Array.isArray(doc.paymentHistory) && doc.paymentHistory.length > 0 ? (
                            <div className="list" style={{ marginTop: 10 }}>
                              {doc.paymentHistory.map((entry, idx) => (
                                <div key={idx} className="card-soft" style={{ background: '#ffffff' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                                    <div>{entry.date ? new Date(entry.date).toLocaleDateString() : copy.noPaymentDate}</div>
                                    <div>{money(entry.amount || 0)}</div>
                                  </div>
                                  <div className="muted" style={{ marginTop: 8 }}>{entry.method || '—'}{entry.notes ? ` · ${entry.notes}` : ''}</div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="muted" style={{ marginTop: 10 }}>{copy.noPaymentHistory}</div>
                          )}
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
