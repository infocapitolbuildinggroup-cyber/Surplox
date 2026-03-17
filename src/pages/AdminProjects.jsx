import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function AdminProjects({ lang = 'en' }) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)

      try {
        const [crmRes, invoiceRes, timeRes] = await Promise.all([
          supabase.from('admin_crm_records').select('*'),
          supabase.from('admin_invoices').select('*'),
          supabase.from('admin_time_entries').select('*')
        ])

        if (!active) return

        const crm = crmRes.data || []
        const invoices = invoiceRes.data || []
        const time = timeRes.data || []

        const grouped = crm.map((record) => {
          const projectName = record.project || 'Unnamed Project'

          const projectInvoices = invoices.filter(
            (invoice) => invoice.project === projectName && invoice.client === record.company
          )

          const projectTime = time.filter((entry) => entry.jobsite === projectName)

          const totalValue = projectInvoices.reduce((sum, doc) => {
            return sum + (doc.items || []).reduce((inner, item) => inner + Number(item.amount || 0), 0)
          }, 0)

          const totalHours = projectTime.reduce((sum, entry) => {
            if (!entry.clock_out_at) return sum
            const diff = (new Date(entry.clock_out_at).getTime() - new Date(entry.clock_in_at).getTime()) / 3600000
            return sum + Math.max(diff, 0)
          }, 0)

          return {
            ...record,
            totalValue,
            totalHours,
            invoiceCount: projectInvoices.length,
            timeEntries: projectTime.length
          }
        })

        setProjects(grouped)
      } catch (error) {
        console.error(error)
      } finally {
        if (active) setLoading(false)
      }
    }

    load()

    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return <div className="card">Loading projects...</div>
  }

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="card rounded-xl" style={{ padding: 26 }}>
        <div className="badge">Projects Dashboard</div>
        <div className="h1">Projects / Jobs</div>
        <p className="muted" style={{ marginTop: 10 }}>
          This is your operational overview. Track clients, invoices, and jobsite activity in one place.
        </p>

        <div style={{ marginTop: 14 }}>
          <Link className="btn" to="/admin">Back to Admin</Link>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="card-soft">No projects yet.</div>
      ) : (
        <div className="list">
          {projects.map((project) => (
            <div key={project.id} className="card-soft" style={{ background: '#fff' }}>
              <div style={{ fontWeight: 900, fontSize: 18 }}>
                {project.project || 'Unnamed Project'}
              </div>

              <div className="muted" style={{ marginTop: 6 }}>
                {project.company}
              </div>

              <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <span className="badge">Invoices: {project.invoiceCount}</span>
                <span className="badge">Time Entries: {project.timeEntries}</span>
              </div>

              <div style={{ marginTop: 12 }}>
                <div><strong>Value:</strong> ${project.totalValue.toFixed(2)}</div>
                <div><strong>Hours:</strong> {project.totalHours.toFixed(1)}</div>
              </div>

              <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Link className="btn small" to="/admin/crm">CRM</Link>
                <Link className="btn small" to="/admin/invoices">Invoices</Link>
                <Link className="btn small" to="/admin/timeclock">Time Clock</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
