import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function AdminProjectDetail() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [invoices, setInvoices] = useState([])
  const [timeEntries, setTimeEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)

      const { data: crm } = await supabase
        .from('admin_crm_records')
        .select('*')
        .eq('id', id)
        .single()

      if (!crm) {
        setLoading(false)
        return
      }

      const { data: inv } = await supabase
        .from('admin_invoices')
        .select('*')

      const { data: time } = await supabase
        .from('admin_time_entries')
        .select('*')

      const projectInvoices = (inv || []).filter(
        (i) => i.project === crm.project && i.client === crm.company
      )

      const projectTime = (time || []).filter(
        (t) => t.jobsite === crm.project
      )

      setProject(crm)
      setInvoices(projectInvoices)
      setTimeEntries(projectTime)
      setLoading(false)
    }

    load()
  }, [id])

  if (loading) return <div className="card">Loading project...</div>
  if (!project) return <div className="card">Project not found.</div>

  const totalValue = invoices.reduce((sum, doc) => {
    return sum + (doc.items || []).reduce((s, i) => s + Number(i.amount || 0), 0)
  }, 0)

  const totalHours = timeEntries.reduce((sum, t) => {
    if (!t.clock_out_at) return sum
    const diff =
      (new Date(t.clock_out_at) - new Date(t.clock_in_at)) / 3600000
    return sum + Math.max(diff, 0)
  }, 0)

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="card">
        <div className="h1">{project.project}</div>
        <div className="muted">{project.company}</div>

        <div style={{ marginTop: 12 }}>
          <Link className="btn" to="/admin/projects">Back</Link>
        </div>
      </div>

      <div className="grid two">
        <div className="card">
          <div className="card-section-title">Invoices</div>
          {invoices.map((i) => (
            <div key={i.id} className="card-soft">
              {i.client} - {i.project}
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-section-title">Time Entries</div>
          {timeEntries.map((t) => (
            <div key={t.id} className="card-soft">
              {t.worker} - {t.jobsite}
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <strong>Total Value:</strong> ${totalValue.toFixed(2)} <br />
        <strong>Total Hours:</strong> {totalHours.toFixed(1)}
      </div>
    </div>
  )
}