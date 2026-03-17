// AdminInvoices with Supabase (drop-in replacement)
import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

const COPY = {
  en: {
    badge: 'Invoices & Estimates',
    title: 'Create rough estimates and invoices inside Surplox.',
    body:
      'This first version is intentionally simple: build line items, total them instantly, and store records in the database.',
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
    emptyBody: 'Create your first estimate or invoice.',
    edit: 'Edit',
    delete: 'Delete'
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
    load()
  }, [])

  async function load() {
    const { data } = await supabase.from('admin_invoices').select('*').order('created_at', { ascending: false })
    setDocuments(data || [])
  }

  const subtotal = useMemo(
    () => form.items.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [form.items]
  )

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

  async function handleSave(e) {
    e.preventDefault()
    if (!form.client) return
    setSaving(true)

    const payload = {
      type: form.type,
      client: form.client,
      project: form.project,
      status: form.status,
      notes: form.notes,
      items: form.items
    }

    if (form.id) {
      await supabase.from('admin_invoices').update(payload).eq('id', form.id)
    } else {
      await supabase.from('admin_invoices').insert(payload)
    }

    setForm(makeEmptyDoc())
    setSaving(false)
    load()
  }

  async function handleDelete(id) {
    await supabase.from('admin_invoices').delete().eq('id', id)
    load()
  }

  function handleEdit(doc) {
    setForm({ ...doc })
  }

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="card rounded-xl" style={{ padding: 26 }}>
        <div className="h1">{copy.title}</div>
        <Link className="btn" to="/admin">{copy.back}</Link>
      </div>

      <div className="grid two">
        <div className="card rounded-xl" style={{ padding: 22 }}>
          <form onSubmit={handleSave} className="grid" style={{ gap: 12 }}>
            <input className="input" value={form.client} onChange={(e) => setField('client', e.target.value)} placeholder={copy.client} />
            {form.items.map(item => (
              <div key={item.id} className="grid two">
                <input className="input" value={item.label} onChange={(e) => updateItem(item.id, 'label', e.target.value)} />
                <input className="input" value={item.amount} onChange={(e) => updateItem(item.id, 'amount', e.target.value)} />
              </div>
            ))}
            <button type="button" onClick={addItem}>+</button>
            <button type="submit">{saving ? copy.saving : copy.save}</button>
          </form>
        </div>

        <div>
          {documents.map(doc => (
            <div key={doc.id}>
              <div>{doc.client}</div>
              <button onClick={() => handleEdit(doc)}>Edit</button>
              <button onClick={() => handleDelete(doc.id)}>Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
