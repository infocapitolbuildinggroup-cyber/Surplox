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

function safeJsonParse(value, fallback = null) {
  if (!value || typeof value !== 'string') return fallback
  try {
    return JSON.parse(value)
  } catch (error) {
    return fallback
  }
}

function extractPermitMeta(record = {}) {
  const notes = String(record?.notes || '').trim()
  const parsedNotes = safeJsonParse(notes, null)
  const permitBlob =
    parsedNotes?.permitMeta ||
    parsedNotes?.permit_meta ||
    parsedNotes?.permit ||
    parsedNotes?.permitting ||
    null

  const locationBlob =
    parsedNotes?.projectLocation ||
    parsedNotes?.project_location ||
    parsedNotes?.location ||
    null

  const requirementsBlob =
    parsedNotes?.projectRequirements ||
    parsedNotes?.project_requirements ||
    parsedNotes?.requirements ||
    null

  const permitRequired =
    typeof permitBlob?.required === 'boolean'
      ? permitBlob.required
      : typeof permitBlob?.permit_required === 'boolean'
        ? permitBlob.permit_required
        : false

  const permitStatus = String(
    permitBlob?.status || permitBlob?.permit_status || (permitRequired ? 'not_started' : 'not_required') || 'not_required'
  ).trim()

  const permitTypes = Array.isArray(permitBlob?.permit_types)
    ? permitBlob.permit_types.map((item) => String(item || '').trim()).filter(Boolean)
    : Array.isArray(permitBlob?.types)
      ? permitBlob.types.map((item) => String(item || '').trim()).filter(Boolean)
      : []

  const jurisdiction = String(
    permitBlob?.jurisdiction || locationBlob?.jurisdiction || record?.project_jurisdiction || ''
  ).trim()

  const location = {
    city: String(locationBlob?.city || record?.project_city || '').trim(),
    county: String(locationBlob?.county || record?.project_county || '').trim(),
    zip: String(locationBlob?.zip || record?.project_zip || '').trim(),
    state: String(locationBlob?.state || record?.project_state || '').trim(),
    jurisdiction
  }

  const requirements = {
    projectType: String(
      requirementsBlob?.project_type || requirementsBlob?.projectType || record?.project_type || ''
    ).trim(),
    squareFootage: String(
      requirementsBlob?.square_footage || requirementsBlob?.squareFootage || record?.square_footage || ''
    ).trim(),
    estimatedValue: String(
      requirementsBlob?.estimated_value || requirementsBlob?.estimatedValue || record?.estimated_value || ''
    ).trim(),
    scopes: Array.isArray(requirementsBlob?.scopes)
      ? requirementsBlob.scopes.map((item) => String(item || '').trim()).filter(Boolean)
      : []
  }

  return {
    permitRequired,
    permitStatus,
    permitTypes,
    jurisdiction,
    location,
    requirements,
    intakeNotes: String(permitBlob?.intake_notes || permitBlob?.intakeNotes || '').trim()
  }
}

function permitBadgeStyle(status) {
  if (status === 'approved') return { background: '#dcf4e5', color: '#177245' }
  if (status === 'submitted') return { background: '#d8ecff', color: '#0d3f73' }
  if (status === 'in_progress') return { background: '#fff0b4', color: '#111111' }
  if (status === 'not_started') return { background: '#ffe1df', color: '#8a1c14' }
  if (status === 'not_required') return { background: '#ecebe3', color: '#111111' }
  return { background: '#ecebe3', color: '#111111' }
}

function permitStatusLabel(status) {
  if (status === 'approved') return 'Permit Approved'
  if (status === 'submitted') return 'Submitted'
  if (status === 'in_progress') return 'In Progress'
  if (status === 'not_started') return 'Not Started'
  if (status === 'not_required') return 'No Permit Flag'
  return 'Permit Review'
}

function calculatePermitReadiness(project = {}) {
  const blockers = []
  let score = 0

  if (project.permitRequired) {
    score += 15
  } else {
    blockers.push('Permit requirement has not been confirmed yet.')
  }

  if (project.jurisdiction) {
    score += 20
  } else if (project.permitRequired) {
    blockers.push('Jurisdiction is missing.')
  }

  if (project.location?.city || project.location?.zip) {
    score += 15
  } else {
    blockers.push('Project location details are still missing.')
  }

  if (project.requirements?.projectType) {
    score += 10
  } else {
    blockers.push('Project type has not been captured yet.')
  }

  if (project.requirements?.scopes?.length) {
    score += 15
  } else {
    blockers.push('Project scopes have not been identified yet.')
  }

  if (project.permitTypes?.length) {
    score += 15
  } else if (project.permitRequired) {
    blockers.push('Permit types have not been assigned yet.')
  }

  if (project.permitStatus === 'submitted') score += 5
  if (project.permitStatus === 'approved') score += 10
  if (project.permitStatus === 'in_progress') score += 8

  return {
    score: Math.min(score, 100),
    blockers: blockers.slice(0, 3)
  }
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

          const permitMeta = extractPermitMeta(record)
          const permitReadiness = calculatePermitReadiness({ ...record, ...permitMeta })

          return {
            ...record,
            ...permitMeta,
            permitReadiness,
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

  const permitCounts = useMemo(() => {
    return {
      required: projects.filter((project) => project.permitRequired).length,
      notStarted: projects.filter((project) => project.permitRequired && project.permitStatus === 'not_started').length,
      inProgress: projects.filter((project) => project.permitRequired && project.permitStatus === 'in_progress').length,
      approved: projects.filter((project) => project.permitRequired && project.permitStatus === 'approved').length
    }
  }, [projects])

  const filteredProjects = useMemo(() => {
    let rows = [...projects]

    if (statusFilter !== 'all') {
      if (statusFilter === 'no_invoices') {
        rows = rows.filter((project) => project.invoiceCount === 0)
      } else if (statusFilter === 'no_time') {
        rows = rows.filter((project) => project.timeEntries === 0)
      } else if (statusFilter === 'permit_required') {
        rows = rows.filter((project) => project.permitRequired)
      } else if (statusFilter === 'permit_not_started') {
        rows = rows.filter((project) => project.permitRequired && project.permitStatus === 'not_started')
      } else if (statusFilter === 'permit_in_progress') {
        rows = rows.filter((project) => project.permitRequired && ['in_progress', 'submitted'].includes(project.permitStatus))
      } else if (statusFilter === 'permit_approved') {
        rows = rows.filter((project) => project.permitRequired && project.permitStatus === 'approved')
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
    } else if (sortBy === 'permit_readiness') {
      rows.sort((a, b) => b.permitReadiness.score - a.permitReadiness.score)
    } else {
      rows.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    }

    return rows
  }, [projects, statusFilter, sortBy])

  const dashboardMetrics = useMemo(() => {
    const unpaidValue = projects.reduce((sum, project) => {
      const unpaidProjectValue = project.invoiceCount > 0 ? project.totalValue : 0
      return sum + unpaidProjectValue
    }, 0)

    const noInvoiceCount = projects.filter((project) => project.invoiceCount === 0).length
    const noLaborCount = projects.filter((project) => project.timeEntries === 0).length
    const stalledCount = projects.filter(
      (project) =>
        ['active', 'estimating'].includes(project.project_status || 'active') &&
        !String(project.project_next_action || '').trim()
    ).length

    return {
      unpaidValue,
      noInvoiceCount,
      noLaborCount,
      stalledCount
    }
  }, [projects])

  const projectAlerts = useMemo(() => {
    const alerts = []

    projects.forEach((project) => {
      if (project.invoiceCount === 0) {
        alerts.push({
          id: `${project.id}-no-invoice`,
          level: 'warning',
          title: project.project || 'Unnamed Project',
          body: 'No invoice or estimate has been created for this project yet.'
        })
      }

      if (project.timeEntries === 0 && ['active', 'completed'].includes(project.project_status || 'active')) {
        alerts.push({
          id: `${project.id}-no-time`,
          level: 'warning',
          title: project.project || 'Unnamed Project',
          body: 'No labor has been logged for this project yet.'
        })
      }

      if (['active', 'estimating'].includes(project.project_status || 'active') && !String(project.project_next_action || '').trim()) {
        alerts.push({
          id: `${project.id}-no-next-action`,
          level: 'info',
          title: project.project || 'Unnamed Project',
          body: 'This project has no next action or blocker recorded.'
        })
      }

      if (project.permitRequired && project.permitStatus === 'not_started') {
        alerts.push({
          id: `${project.id}-permit-not-started`,
          level: 'warning',
          title: project.project || 'Unnamed Project',
          body: 'Permit review is marked as required, but the permit process has not been started yet.'
        })
      }

      if (project.permitRequired && !project.jurisdiction) {
        alerts.push({
          id: `${project.id}-permit-jurisdiction`,
          level: 'info',
          title: project.project || 'Unnamed Project',
          body: 'Jurisdiction is still missing, so this project is not ready for a clean permit-intake workflow yet.'
        })
      }
    })

    return alerts.slice(0, 8)
  }, [projects])

  if (loading) {
    return <div className="card">Loading projects...</div>
  }

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="card rounded-xl" style={{ padding: 26 }}>
        <div className="badge">Projects Dashboard</div>
        <div className="h1">Projects / Jobs</div>
        <p className="muted" style={{ marginTop: 10 }}>
          This is your operational overview. Track clients, invoices, status, phase, next actions, jobsite activity, and now early permit-readiness signals in one place.
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
          <div className="card-soft" style={{ background: '#ffffff' }}>
            <div className="muted">Completed</div>
            <div style={{ marginTop: 8, fontSize: 28, fontWeight: 900 }}>{statusCounts.completed}</div>
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
              <option value="permit_required">Permit Required</option>
              <option value="permit_not_started">Permit Not Started</option>
              <option value="permit_in_progress">Permit In Progress</option>
              <option value="permit_approved">Permit Approved</option>
            </select>
          </div>

          <div>
            <div className="muted" style={{ marginBottom: 6 }}>Sort</div>
            <select className="input" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest</option>
              <option value="highest_value">Highest Value</option>
              <option value="most_hours">Most Hours</option>
              <option value="fewest_invoices">Fewest Invoices</option>
              <option value="permit_readiness">Best Permit Readiness</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid two">
        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">Invoice Status Totals</div>
          <div className="grid two" style={{ marginTop: 14 }}>
            <div className="card-soft" style={{ background: '#ffffff' }}>
              <div className="muted">Tracked Project Value</div>
              <div style={{ marginTop: 8, fontSize: 28, fontWeight: 900 }}>{money(dashboardMetrics.unpaidValue)}</div>
            </div>
            <div className="card-soft" style={{ background: '#ffffff' }}>
              <div className="muted">Projects With No Invoice</div>
              <div style={{ marginTop: 8, fontSize: 28, fontWeight: 900 }}>{dashboardMetrics.noInvoiceCount}</div>
            </div>
            <div className="card-soft" style={{ background: '#ffffff' }}>
              <div className="muted">Projects With No Labor</div>
              <div style={{ marginTop: 8, fontSize: 28, fontWeight: 900 }}>{dashboardMetrics.noLaborCount}</div>
            </div>
            <div className="card-soft" style={{ background: '#ffffff' }}>
              <div className="muted">Stalled Jobs</div>
              <div style={{ marginTop: 8, fontSize: 28, fontWeight: 900 }}>{dashboardMetrics.stalledCount}</div>
            </div>
          </div>
        </div>

        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">Permit Readiness Totals</div>
          <div className="grid two" style={{ marginTop: 14 }}>
            <div className="card-soft" style={{ background: '#ffffff' }}>
              <div className="muted">Permit Required</div>
              <div style={{ marginTop: 8, fontSize: 28, fontWeight: 900 }}>{permitCounts.required}</div>
            </div>
            <div className="card-soft" style={{ background: '#ffffff' }}>
              <div className="muted">Not Started</div>
              <div style={{ marginTop: 8, fontSize: 28, fontWeight: 900 }}>{permitCounts.notStarted}</div>
            </div>
            <div className="card-soft" style={{ background: '#ffffff' }}>
              <div className="muted">In Progress</div>
              <div style={{ marginTop: 8, fontSize: 28, fontWeight: 900 }}>{permitCounts.inProgress}</div>
            </div>
            <div className="card-soft" style={{ background: '#ffffff' }}>
              <div className="muted">Approved</div>
              <div style={{ marginTop: 8, fontSize: 28, fontWeight: 900 }}>{permitCounts.approved}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="card-section-title">Project Health Alerts</div>
        {projectAlerts.length === 0 ? (
          <div className="card-soft" style={{ marginTop: 14 }}>No alerts right now.</div>
        ) : (
          <div className="list" style={{ marginTop: 14 }}>
            {projectAlerts.map((alert) => (
              <div key={alert.id} className="card-soft" style={{ background: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ fontWeight: 900 }}>{alert.title}</div>
                  <span
                    className="badge"
                    style={
                      alert.level === 'warning'
                        ? { background: '#fff0b4', color: '#111111' }
                        : { background: '#d8ecff', color: '#0d3f73' }
                    }
                  >
                    {alert.level === 'warning' ? 'Action Needed' : 'Review'}
                  </span>
                </div>
                <div className="muted" style={{ marginTop: 8, lineHeight: 1.7 }}>
                  {alert.body}
                </div>
              </div>
            ))}
          </div>
        )}
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
                  {project.permitRequired ? (
                    <span className="badge" style={permitBadgeStyle(project.permitStatus)}>
                      {permitStatusLabel(project.permitStatus)}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="muted" style={{ marginTop: 6 }}>
                {project.company}
              </div>

              {(project.jurisdiction || project.location?.city || project.location?.zip) ? (
                <div className="muted" style={{ marginTop: 8 }}>
                  {[project.jurisdiction, project.location?.city, project.location?.zip].filter(Boolean).join(' • ')}
                </div>
              ) : null}

              <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <span className="badge">Invoices: {project.invoiceCount}</span>
                <span className="badge">Time Entries: {project.timeEntries}</span>
                <span className="badge">Value: {money(project.totalValue)}</span>
                <span className="badge">Hours: {project.totalHours.toFixed(1)}</span>
                <span className="badge">Permit Readiness: {project.permitReadiness.score}%</span>
              </div>

              {(project.requirements?.projectType || project.permitTypes?.length || project.requirements?.scopes?.length) ? (
                <div className="card-soft" style={{ marginTop: 14, background: '#faf9f4' }}>
                  <div className="muted">Permit Snapshot</div>
                  <div style={{ marginTop: 8, lineHeight: 1.7 }}>
                    {project.requirements?.projectType ? `Type: ${project.requirements.projectType}` : 'Type not set'}
                    {project.permitTypes?.length ? ` • Permits: ${project.permitTypes.join(', ')}` : ''}
                    {project.requirements?.scopes?.length ? ` • Scopes: ${project.requirements.scopes.join(', ')}` : ''}
                  </div>
                </div>
              ) : null}

              {project.project_next_action ? (
                <div className="card-soft" style={{ marginTop: 14, background: '#faf9f4' }}>
                  <div className="muted">Next Action</div>
                  <div style={{ marginTop: 8, lineHeight: 1.7 }}>{project.project_next_action}</div>
                </div>
              ) : null}

              {project.permitReadiness.blockers.length > 0 ? (
                <div className="card-soft" style={{ marginTop: 14, background: '#fffaf0' }}>
                  <div className="muted">Permit Blockers</div>
                  <div style={{ marginTop: 8, lineHeight: 1.7 }}>
                    {project.permitReadiness.blockers.join(' ')}
                  </div>
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
