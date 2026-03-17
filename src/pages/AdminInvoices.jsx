import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

const STORAGE_KEY = 'surplox_admin_invoices_v1'

const COPY = {
  en: {
    badge: 'Invoices & Estimates',
    title: 'Create rough estimates and invoices inside Surplox.',
    body:
      'This first version is intentionally simple: build line items, total them instantly, and store records locally until you are ready to wire this into your production billing flow.',
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
    delete: 'Delete'
  },
  es: {
    badge: 'Facturas y Estimados',
    title: 'Crea estimados y facturas dentro de Surplox.',
    body:
      'Esta primera versión es intencionalmente simple: crea partidas, suma totales al instante y guarda registros localmente hasta que conectemos el flujo de facturación real.',
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
    delete: 'Eliminar'
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

export default function AdminInvoices({ lang = 'en' }) {
  const copy = COPY[lang] || COPY.en
  const [documents, setDocuments] = useState([])
  const [form, setForm] = useState(makeEmptyDoc())
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      setDocuments(Array.isArray(stored) ? stored : [])
    } catch (error) {
      console.error(error)
      setDocuments([])
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(documents))
  }, [documents])

  const subtotal = useMemo(
    () => form.items.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [form.items]
  )

  const stats = useMemo(() => {
    const totalValue = documents.reduce((sum, doc) => sum + (doc.items || []).reduce((inner, item) => inner + Number(item.amount || 0), 0), 0)
    const paidValue = documents
      .filter((doc) => doc.status === 'paid')
      .reduce((sum, doc) => sum + (doc.items || []).reduce((inner, item) => inner + Number(item.amount || 0), 0), 0)

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

  function handleSave(event) {
    event.preventDefault()
    if (!String(form.client || '').trim()) return

    setSaving(true)
    const payload = {
      ...form,
      id: form.id || crypto.randomUUID(),
      client: String(form.client || '').trim(),
      project: String(form.project || '').trim(),
      notes: String(form.notes || '').trim(),
      createdAt: form.createdAt || new Date().toISOString()
    }

    setDocuments((prev) => {
      const idx = prev.findIndex((doc) => doc.id === payload.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = payload
        return next
      }
      return [payload, ...prev]
    })

    setForm(makeEmptyDoc())
    setSaving(false)
  }

  function handleEdit(doc) {
    setForm(doc)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleDelete(id) {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id))
    if (form.id === id) setForm(makeEmptyDoc())
  }

  return (
    <div className="grid" style={{ gap: 18 }}>
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
