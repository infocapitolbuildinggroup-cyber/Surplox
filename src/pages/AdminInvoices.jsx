import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

const COPY = {
  en: {
    badge: 'Invoices & Estimates',
    title: 'Create rough estimates and invoices inside Surplox.',
    body:
      'This first version is intentionally simple: build line items, total them instantly, and store records in the database until you are ready to wire this into your production billing flow.',
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
    deleted: 'Invoice deleted.'
  },
  es: {
    badge: 'Facturas y Estimados',
    title: 'Crea estimados y facturas dentro de Surplox.',
    body:
      'Esta primera versión es intencionalmente simple: crea partidas, suma totales al instante y guarda registros en la base de datos hasta que conectemos el flujo de facturación real.',
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
    deleted: 'Factura eliminada.'
  }
}

function makeLineItem() {
  return { id: crypto.randomUUID(), label: '', amount: '' }
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
    createdAt: ''
  }
}

function money(value) {
  const number = Number(value || 0)
  return `$${number.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
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
    createdAt: row.created_at || ''
  }
}

export default function AdminInvoices({ lang = 'en' }) {
  const copy = COPY[lang] || COPY.en
  const [documents, setDocuments] = useState([])
  const [form, setForm] = useState(makeEmptyDoc())
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true

    async function loadDocuments() {
      setLoading(true)
      setMessage('')

      try {
        const { data, error } = await supabase
          .from('admin_invoices')
          .select('id, type, client, project, status, notes, items, created_at')
          .order('created_at', { ascending: false })

        if (error) throw error
        if (!active) return

        setDocuments(Array.isArray(data) ? data.map(mapDbRowToDoc) : [])
      } catch (error) {
        console.error(error)
        if (!active) return
        setMessage(copy.loadError)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadDocuments()

    return () => {
      active = false
    }
  }, [copy.loadError])

  const subtotal = useMemo(
    () => form.items.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [form.items]
  )

  const stats = useMemo(() => {
    const totalValue = documents.reduce(
      (sum, doc) => sum + (doc.items || []).reduce((inner, item) => inner + Number(item.amount || 0), 0),
      0
    )
    const paidValue = documents
      .filter((doc) => doc.status === 'paid')
      .reduce(
        (sum, doc) => sum + (doc.items || []).reduce((inner, item) => inner + Number(item.amount || 0), 0),
        0
      )

    return { totalDocs: documents.length, totalValue, paidValue }
  }, [documents])

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

    const payload = {
      type: String(form.type || 'estimate'),
      client: String(form.client || '').trim(),
      project: String(form.project || '').trim() || null,
      status: String(form.status || 'draft'),
      notes: String(form.notes || '').trim() || null,
      items: cleanedItems.length > 0 ? cleanedItems : [makeLineItem()]
    }

    try {
      if (form.id) {
        const { data, error } = await supabase
          .from('admin_invoices')
          .update(payload)
          .eq('id', form.id)
          .select('id, type, client, project, status, notes, items, created_at')
          .single()

        if (error) throw error

        const mapped = mapDbRowToDoc(data)
        setDocuments((prev) => prev.map((doc) => (doc.id === mapped.id ? mapped : doc)))
      } else {
        const { data, error } = await supabase
          .from('admin_invoices')
          .insert(payload)
          .select('id, type, client, project, status, notes, items, created_at')
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
            <input className="input" value={form.client} onChange={(e) => setField('client', e.target.value)} placeholder={copy.client} />
            <input className="input" value={form.project} onChange={(e) => setField('project', e.target.value)} placeholder={copy.project} />

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
            <textarea className="input" value={form.notes} onChange={(e) => setField('notes', e.target.value)} placeholder={copy.notes} />
            <div className="card-soft" style={{ background: '#ffffff' }}>
              <div className="muted">{copy.subtotal}</div>
              <div style={{ fontSize: 28, fontWeight: 900, marginTop: 8 }}>{money(subtotal)}</div>
            </div>
            <button className="btn primary" type="submit" disabled={saving}>{saving ? copy.saving : copy.save}</button>
          </form>
        </div>

        <div className="grid" style={{ gap: 14 }}>
          <div className="grid two">
            <div className="card-soft"><div className="muted">{copy.totalDocs}</div><div style={{ fontSize: 28, fontWeight: 900, marginTop: 8 }}>{stats.totalDocs}</div></div>
            <div className="card-soft"><div className="muted">{copy.totalValue}</div><div style={{ fontSize: 28, fontWeight: 900, marginTop: 8 }}>{money(stats.totalValue)}</div></div>
            <div className="card-soft"><div className="muted">{copy.paidValue}</div><div style={{ fontSize: 28, fontWeight: 900, marginTop: 8 }}>{money(stats.paidValue)}</div></div>
          </div>

          <div className="card rounded-xl" style={{ padding: 22 }}>
            {documents.length === 0 ? (
              <div className="card-soft">
                <div className="card-section-title">{copy.emptyTitle}</div>
                <p className="card-section-subtitle" style={{ marginTop: 8 }}>{copy.emptyBody}</p>
              </div>
            ) : (
              <div className="list">
                {documents
                  .slice()
                  .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
                  .map((doc) => {
                    const total = (doc.items || []).reduce((sum, item) => sum + Number(item.amount || 0), 0)
                    return (
                      <div key={doc.id} className="card-soft" style={{ background: '#ffffff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                          <div style={{ fontWeight: 900, fontSize: 18 }}>{doc.client}</div>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <span className="badge">{doc.type === 'estimate' ? copy.estimate : copy.invoice}</span>
                            <span className="badge">{doc.status === 'draft' ? copy.draft : doc.status === 'sent' ? copy.sent : copy.paid}</span>
                          </div>
                        </div>
                        {doc.project ? <div className="muted" style={{ marginTop: 8 }}>{doc.project}</div> : null}
                        <div style={{ marginTop: 12, fontWeight: 900 }}>{money(total)}</div>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
                          <button type="button" className="btn small" onClick={() => handleEdit(doc)}>{copy.edit}</button>
                          <button type="button" className="btn small" onClick={() => handleDelete(doc.id)}>{copy.delete}</button>
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
