import React, { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

function money(value) {
  const number = Number(value || 0)
  return `$${number.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function AdminProjectDetail() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [invoices, setInvoices] = useState([])
  const [timeEntries, setTimeEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [savingInvoice, setSavingInvoice] = useState(false)
  const [clockingIn, setClockingIn] = useState(false)

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
            setLoading(false)
          }
          return
        }

        const [invRes, timeRes] = await Promise.all([
          supabase.from('admin_invoices').select('*'),
          supabase.from('admin_time_entries').select('*')
        ])

        if (invRes.error) throw invRes.error
        if (timeRes.error) throw timeRes.error
        if (!active) return

        const projectInvoices = (invRes.data || []).filter(
          (invoice) => invoice.project === crm.project && invoice.client === crm.company
        )

        const projectTime = (timeRes.data || []).filter(
          (entry) => entry.jobsite === crm.project
        )

        setProject(crm)
        setInvoices(projectInvoices)
        setTimeEntries(projectTime)
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

  const totalHours = useMemo(() => {
    return timeEntries.reduce((sum, entry) => {
      if (!entry.clock_out_at) return sum
      const diff = (new Date(entry.clock_out_at).getTime() - new Date(entry.clock_in_at).getTime()) / 3600000
      return sum + Math.max(diff, 0)
    }, 0)
  }, [timeEntries])

  const laborCost = useMemo(() => totalHours * 35, [totalHours])
  const profitability = useMemo(() => totalValue - laborCost, [totalValue, laborCost])

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
        items: cleanedItems
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
          <span className="badge">Invoices: {invoices.length}</span>
          <span className="badge">Time Entries: {timeEntries.length}</span>
          <span className="badge">Revenue: {money(totalValue)}</span>
          <span className="badge">Hours: {totalHours.toFixed(1)}</span>
        </div>

        <div style={{ marginTop: 14 }}>
          <Link className="btn" to="/admin/projects">Back</Link>
        </div>
      </div>

      <div className="grid three">
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

        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">Project Profitability Summary</div>
          <div className="list" style={{ marginTop: 14 }}>
            <div className="card-soft" style={{ background: '#ffffff' }}>
              <div className="muted">Revenue</div>
              <div style={{ marginTop: 8, fontSize: 28, fontWeight: 900 }}>{money(totalValue)}</div>
            </div>
            <div className="card-soft" style={{ background: '#ffffff' }}>
              <div className="muted">Labor Hours</div>
              <div style={{ marginTop: 8, fontSize: 28, fontWeight: 900 }}>{totalHours.toFixed(1)}</div>
            </div>
            <div className="card-soft" style={{ background: '#ffffff' }}>
              <div className="muted">Estimated Labor Cost @ $35/hr</div>
              <div style={{ marginTop: 8, fontSize: 28, fontWeight: 900 }}>{money(laborCost)}</div>
            </div>
            <div className="card-soft" style={{ background: '#ffffff' }}>
              <div className="muted">Estimated Gross Margin</div>
              <div style={{ marginTop: 8, fontSize: 28, fontWeight: 900 }}>{money(profitability)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid two">
        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">Invoices</div>
          {invoices.length === 0 ? (
            <div className="card-soft" style={{ marginTop: 14 }}>No invoices tied to this project yet.</div>
          ) : (
            <div className="list" style={{ marginTop: 14 }}>
              {invoices.map((invoice) => {
                const total = (invoice.items || []).reduce((sum, item) => sum + Number(item.amount || 0), 0)
                return (
                  <div key={invoice.id} className="card-soft" style={{ background: '#ffffff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                      <div style={{ fontWeight: 900 }}>{invoice.type === 'estimate' ? 'Estimate' : 'Invoice'}</div>
                      <span className="badge">{invoice.status || 'draft'}</span>
                    </div>
                    <div className="muted" style={{ marginTop: 8 }}>{invoice.client}</div>
                    <div style={{ marginTop: 10, fontWeight: 900 }}>{money(total)}</div>
                  </div>
                )
              })}
            </div>
          )}
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
