import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

function money(value) {
  const number = Number(value || 0)
  return `$${number.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function normalizeProject(record) {
  return {
    ...record,
    project_status: record?.project_status || 'active',
    project_phase: record?.project_phase || '',
    project_next_action: record?.project_next_action || ''
  }
}

function badgeStyleForStatus(status) {
  if (status === 'completed') return { background: '#dcf4e5', color: '#177245' }
  if (status === 'paused') return { background: '#fff0b4', color: '#111111' }
  if (status === 'archived') return { background: '#ecebe3', color: '#111111' }
  if (status === 'lead') return { background: '#d8ecff', color: '#0d3f73' }
  if (status === 'estimating') return { background: '#f1e7a8', color: '#111111' }
  return { background: '#111111', color: '#ffffff' }
}

export default function AdminProjects({ lang = 'en' }) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

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

        const crm = (crmRes.data || []).map(normalizeProject)
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

  const statusCounts = useMemo(() => {
    return {
      active: projects.filter((project) => project.project_status === 'active').length,
      estimating: projects.filter((project) => project.project_status === 'estimating').length,
      completed: projects.filter((project) => project.project_status === 'completed').length
    }
  }, [projects])

  const filteredProjects = useMemo(() => {
    let rows = [...projects]

    if (statusFilter !== 'all') {
      if (statusFilter === 'no_invoices') {
        rows = rows.filter((project) => project.invoiceCount === 0)
      } else if (statusFilter === 'no_time') {
        rows = rows.filter((project) => project.timeEntries === 0)
      } else {
        rows = rows.filter((project) => project.project_status === statusFilter)
      }
    }

    if (sortBy === 'highest_value') {
      rows.sort((a, b) => b.totalValue - a.totalValue)
    } else if (sortBy === 'most_hours') {
      rows.sort((a, b) => b.totalHours - a.totalHours)
    } else if (sortBy === 'fewest_invoices') {
      rows.sort((a, b) => a.invoiceCount - b.invoiceCount)
    } else {
      rows.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    }

    return rows
  }, [projects, statusFilter, sortBy])

  if (loading) {
    return <div className="card">Loading projects...</div>
  }

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="card rounded-xl" style={{ padding: 26 }}>
        <div className="badge">Projects Dashboard</div>
        <div className="h1">Projects / Jobs</div>
        <p className="muted" style={{ marginTop: 10 }}>
          This is your operational overview. Track clients, invoices, status, phase, next actions, and jobsite activity in one place.
        </p>

        <div className="grid three" style={{ marginTop: 16 }}>
          <div className="card-soft" style={{ background: '#ffffff' }}>
            <div className="muted">Total Projects</div>
            <div style={{ marginTop: 8, fontSize: 28, fontWeight: 900 }}>{projects.length}</div>
          </div>
          <div className="card-soft" style={{ background: '#ffffff' }}>
            <div className="muted">Active</div>
            <div style={{ marginTop: 8, fontSize: 28, fontWeight: 900 }}>{statusCounts.active}</div>
          </div>
          <div className="card-soft" style={{ background: '#ffffff' }}>
            <div className="muted">Estimating</div>
            <div style={{ marginTop: 8, fontSize: 28, fontWeight: 900 }}>{statusCounts.estimating}</div>
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <Link className="btn" to="/admin">Back to Admin</Link>
        </div>
      </div>

      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="card-section-title">Project Filters + Sorting</div>
        <div className="grid two" style={{ marginTop: 14 }}>
          <div>
            <div className="muted" style={{ marginBottom: 6 }}>Filter</div>
            <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Projects</option>
              <option value="active">Active Only</option>
              <option value="estimating">Estimating Only</option>
              <option value="completed">Completed Only</option>
              <option value="paused">Paused Only</option>
              <option value="lead">Lead Only</option>
              <option value="archived">Archived Only</option>
              <option value="no_invoices">No Invoices</option>
              <option value="no_time">No Time Entries</option>
            </select>
          </div>

          <div>
            <div className="muted" style={{ marginBottom: 6 }}>Sort</div>
            <select className="input" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest</option>
              <option value="highest_value">Highest Value</option>
              <option value="most_hours">Most Hours</option>
              <option value="fewest_invoices">Fewest Invoices</option>
            </select>
          </div>
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="card-soft">No projects match the current filter.</div>
      ) : (
        <div className="list">
          {filteredProjects.map((project) => (
            <Link
              key={project.id}
              to={`/admin/projects/${project.id}`}
              className="card-soft"
              style={{ background: '#fff', textDecoration: 'none', display: 'block' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ fontWeight: 900, fontSize: 18 }}>
                  {project.project || 'Unnamed Project'}
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span className="badge" style={badgeStyleForStatus(project.project_status)}>
                    {project.project_status || 'active'}
                  </span>
                  {project.project_phase ? (
                    <span className="badge">Phase: {project.project_phase}</span>
                  ) : null}
                </div>
              </div>

              <div className="muted" style={{ marginTop: 6 }}>
                {project.company}
              </div>

              <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <span className="badge">Invoices: {project.invoiceCount}</span>
                <span className="badge">Time Entries: {project.timeEntries}</span>
                <span className="badge">Value: {money(project.totalValue)}</span>
                <span className="badge">Hours: {project.totalHours.toFixed(1)}</span>
              </div>

              {project.project_next_action ? (
                <div className="card-soft" style={{ marginTop: 14, background: '#faf9f4' }}>
                  <div className="muted">Next Action</div>
                  <div style={{ marginTop: 8, lineHeight: 1.7 }}>{project.project_next_action}</div>
                </div>
              ) : null}

              <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <span className="btn small">Open Project</span>
                <span className="btn small">CRM</span>
                <span className="btn small">Invoices</span>
                <span className="btn small">Time Clock</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
