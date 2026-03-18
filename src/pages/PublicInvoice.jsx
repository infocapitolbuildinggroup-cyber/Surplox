import React, { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import jsPDF from 'jspdf'
import { autoTable } from 'jspdf-autotable'

function money(value) {
  const number = Number(value || 0)
  return `$${number.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
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
  return { id: item.id || crypto.randomUUID(), label: item.label || '', qty, unitPrice, amount }
}

function docTotal(doc) {
  return (doc.items || []).reduce((sum, item) => sum + Number(normalizeItem(item).amount || 0), 0)
}

function mapDbRowToDoc(row = {}) {
  return {
    id: row.id || '',
    client: row.client || '',
    project: row.project || '',
    notes: row.notes || '',
    items: Array.isArray(row.items) ? row.items.map(normalizeItem) : [],
    amountPaid: Number(row.amount_paid || 0),
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
    paymentHistory: Array.isArray(row.payment_history) ? row.payment_history : []
  }
}

function computedStatus(doc) {
  const total = docTotal(doc)
  const amountPaid = Number(doc.amountPaid || 0)
  if (amountPaid >= total && total > 0) return 'paid'
  if (doc.dueDate && new Date(doc.dueDate).getTime() < new Date(new Date().setHours(0, 0, 0, 0)).getTime()) return 'overdue'
  if (amountPaid > 0) return 'partial'
  return 'sent'
}

function statusLabel(status) {
  if (status === 'paid') return 'Paid'
  if (status === 'partial') return 'Partial'
  if (status === 'overdue') return 'Overdue'
  return 'Sent'
}

function generatePdf(doc) {
  const pdf = new jsPDF('p', 'pt', 'a4')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const left = 40
  const right = pageWidth - 40
  const total = docTotal(doc)
  const amountPaid = Number(doc.amountPaid || 0)
  const balanceDue = Math.max(total - amountPaid, 0)

  if (doc.logoUrl) {
    try {
      pdf.addImage(doc.logoUrl, 'PNG', left, 28, 120, 48)
    } catch (e) {
      console.error('Unable to add logo image to invoice PDF', e)
    }
  }

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(16)
  pdf.text(doc.companyName || 'Capitol Building Group', left, 95)

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(10)
  const addressLines = [doc.companyAddress || '', doc.companyPhone || '', doc.companyEmail || ''].filter(Boolean)
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
  pdf.text('Invoice #:', right - 180, 95)
  pdf.setFont('helvetica', 'normal')
  pdf.text(doc.invoiceNumber || '—', right - 95, 95)

  pdf.setFont('helvetica', 'bold')
  pdf.text('Reference #:', right - 180, 110)
  pdf.setFont('helvetica', 'normal')
  pdf.text(doc.referenceNumber || '—', right - 95, 110)

  pdf.setFont('helvetica', 'bold')
  pdf.text('Invoice Date:', right - 180, 125)
  pdf.setFont('helvetica', 'normal')
  pdf.text(doc.invoiceDate ? new Date(doc.invoiceDate).toLocaleDateString() : new Date().toLocaleDateString(), right - 95, 125)

  pdf.setFont('helvetica', 'bold')
  pdf.text('Due Date:', right - 180, 140)
  pdf.setFont('helvetica', 'normal')
  pdf.text(doc.dueDate ? new Date(doc.dueDate).toLocaleDateString() : 'No due date', right - 95, 140)

  pdf.setFont('helvetica', 'bold')
  pdf.text('Status:', right - 180, 155)
  pdf.setFont('helvetica', 'normal')
  pdf.text(statusLabel(computedStatus(doc)), right - 95, 155)

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(11)
  pdf.text('Invoice For', left, 190)
  pdf.text('Payable To', 310, 190)

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(10)
  const invoiceForLines = [doc.invoiceForName || doc.client || '', doc.project || '', doc.customerPhone || '', doc.customerEmail || ''].filter(Boolean)
  let y1 = 205
  invoiceForLines.forEach((line) => {
    pdf.text(String(line), left, y1)
    y1 += 13
  })

  const payableLines = [doc.payableToName || doc.companyName || '', doc.companyAddress || '', doc.companyPhone || '', doc.companyEmail || ''].filter(Boolean)
  let y2 = 205
  payableLines.forEach((line) => {
    pdf.text(String(line), 310, y2)
    y2 += 13
  })

  const bodyRows = (doc.items || []).map((item) => {
    const normalized = normalizeItem(item)
    return [normalized.label || '', String(normalized.qty || 1), money(normalized.unitPrice || 0), money(normalized.amount || 0)]
  })

  autoTable(pdf, {
    startY: 275,
    head: [['Description', 'Qty', 'Unit Price', 'Total']],
    body: bodyRows,
    theme: 'grid',
    styles: { font: 'helvetica', fontSize: 10, cellPadding: 8 },
    headStyles: { fillColor: [245, 245, 245], textColor: 17 },
    margin: { left, right: 40 }
  })

  const finalY = pdf.lastAutoTable.finalY + 18
  pdf.setFont('helvetica', 'normal')
  pdf.text('Notes', left, finalY)
  const notesLines = pdf.splitTextToSize(doc.notes || '—', 250)
  pdf.text(notesLines, left, finalY + 14)

  const totalsX = right - 180
  pdf.text('Subtotal', totalsX, finalY)
  pdf.text(money(total), right, finalY, { align: 'right' })
  pdf.text('Paid', totalsX, finalY + 16)
  pdf.text(money(amountPaid), right, finalY + 16, { align: 'right' })
  pdf.setFont('helvetica', 'bold')
  pdf.text('Balance Due', totalsX, finalY + 34)
  pdf.text(money(balanceDue), right, finalY + 34, { align: 'right' })
  pdf.save(`${doc.invoiceNumber || 'invoice'}.pdf`)
}

export default function PublicInvoice() {
  const { id } = useParams()
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    async function loadInvoice() {
      try {
        const { data, error } = await supabase
          .from('admin_invoices')
          .select('id, client, project, notes, items, amount_paid, payment_received_at, due_date, invoice_number, created_at, company_name, company_address, company_phone, company_email, logo_url, invoice_for_name, payable_to_name, customer_phone, customer_email, invoice_date, reference_number, payment_method, payment_history')
          .eq('id', id)
          .maybeSingle()

        if (error) throw error
        if (!active) return
        if (!data) {
          setError('Invoice not found.')
        } else {
          setInvoice(mapDbRowToDoc(data))
        }
      } catch (err) {
        console.error(err)
        if (!active) return
        setError('Unable to load invoice.')
      } finally {
        if (active) setLoading(false)
      }
    }
    loadInvoice()
    return () => {
      active = false
    }
  }, [id])

  const total = useMemo(() => (invoice ? docTotal(invoice) : 0), [invoice])
  const balanceDue = useMemo(() => Math.max(total - Number(invoice?.amountPaid || 0), 0), [total, invoice])

  if (loading) return <div className="card">Loading invoice…</div>
  if (error) return <div className="card">{error}</div>
  if (!invoice) return <div className="card">Invoice not found.</div>

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="card rounded-xl" style={{ padding: 26, background: 'linear-gradient(180deg, #f3f3f3 0%, #f7f7f2 100%)' }}>
        <div className="h1">Invoice {invoice.invoiceNumber || ''}</div>
        <p className="muted" style={{ marginTop: 10 }}>
          {invoice.client} {invoice.project ? `· ${invoice.project}` : ''}
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
          <button type="button" className="btn primary" onClick={() => generatePdf(invoice)}>Download PDF</button>
          <Link className="btn" to="/">Back to Surplox</Link>
        </div>
      </div>

      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 20 }}>{invoice.companyName}</div>
            <div className="muted" style={{ marginTop: 8, lineHeight: 1.7 }}>
              {[invoice.companyAddress, invoice.companyPhone, invoice.companyEmail].filter(Boolean).join(' · ')}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="badge">Status: {statusLabel(computedStatus(invoice))}</div>
            <div className="muted" style={{ marginTop: 8 }}>Due: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'No due date'}</div>
            <div className="muted" style={{ marginTop: 6 }}>Balance: {money(balanceDue)}</div>
          </div>
        </div>

        <div className="grid two" style={{ marginTop: 18 }}>
          <div className="card-soft">
            <div className="card-section-title" style={{ fontSize: 15 }}>Invoice For</div>
            <div style={{ marginTop: 10, lineHeight: 1.7 }}>
              {[invoice.invoiceForName || invoice.client, invoice.project, invoice.customerPhone, invoice.customerEmail].filter(Boolean).map((line, idx) => (
                <div key={idx}>{line}</div>
              ))}
            </div>
          </div>
          <div className="card-soft">
            <div className="card-section-title" style={{ fontSize: 15 }}>Payable To</div>
            <div style={{ marginTop: 10, lineHeight: 1.7 }}>
              {[invoice.payableToName || invoice.companyName, invoice.companyAddress, invoice.companyPhone, invoice.companyEmail].filter(Boolean).map((line, idx) => (
                <div key={idx}>{line}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="list" style={{ marginTop: 18 }}>
          {(invoice.items || []).map((item) => {
            const normalized = normalizeItem(item)
            return (
              <div key={normalized.id} className="card-soft" style={{ background: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ fontWeight: 800 }}>{normalized.label}</div>
                  <div>{money(normalized.amount)}</div>
                </div>
                <div className="muted" style={{ marginTop: 8 }}>
                  Qty: {normalized.qty} · Unit Price: {money(normalized.unitPrice)}
                </div>
              </div>
            )
          })}
        </div>

        <div className="grid two" style={{ marginTop: 18 }}>
          <div className="card-soft">
            <div className="card-section-title" style={{ fontSize: 15 }}>Notes</div>
            <div style={{ marginTop: 10, lineHeight: 1.7 }}>{invoice.notes || '—'}</div>
          </div>
          <div className="card-soft">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}><span>Subtotal</span><strong>{money(total)}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 8 }}><span>Paid</span><strong>{money(invoice.amountPaid)}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 8 }}><span>Payment Method</span><strong>{invoice.paymentMethod || '—'}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 8 }}><span>Balance Due</span><strong>{money(balanceDue)}</strong></div>
          </div>
        </div>

        {invoice.paymentHistory?.length ? (
          <div className="card-soft" style={{ marginTop: 18 }}>
            <div className="card-section-title" style={{ fontSize: 15 }}>Payment History</div>
            <div className="list" style={{ marginTop: 10 }}>
              {invoice.paymentHistory.map((entry, idx) => (
                <div key={idx} className="card-soft" style={{ background: '#ffffff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div>{entry.date ? new Date(entry.date).toLocaleDateString() : 'No date'}</div>
                    <div>{money(entry.amount || 0)}</div>
                  </div>
                  <div className="muted" style={{ marginTop: 8 }}>{entry.method || 'No method'}{entry.notes ? ` · ${entry.notes}` : ''}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
