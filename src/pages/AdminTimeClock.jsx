import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

const COPY = {
  en: {
    badge: 'Admin Time Clock',
    title: 'Track clock in / clock out activity by jobsite.',
    body:
      'This first version gives Capitol Building Group a simple internal time clock. Workers can be added manually for now, and later this can connect to live worker accounts and real jobsite attendance.',
    back: 'Back to Admin',
    jobsite: 'Jobsite',
    worker: 'Worker Name',
    role: 'Role / Trade',
    clockIn: 'Clock In',
    clockOut: 'Clock Out',
    activeWorkers: 'Currently Clocked In',
    recentEntries: 'Recent Time Entries',
    emptyActive: 'No one is clocked in right now.',
    emptyEntries: 'No time entries yet.',
    totalEntries: 'Entries',
    activeCount: 'Active',
    totalHours: 'Estimated Hours',
    inAt: 'In',
    outAt: 'Out',
    loading: 'Loading time clock…',
    loadError: 'Unable to load time entries right now.',
    saveError: 'Unable to clock in right now.',
    clockOutError: 'Unable to clock out right now.',
    requiredFields: 'Jobsite and worker name are required.',
    clockedIn: 'Worker clocked in.',
    clockedOut: 'Worker clocked out.',
    crmJobsiteHint: 'Choose an existing CRM project/jobsite or type a new one.',
    noCrmRecords: 'No CRM project records found yet. You can still type a jobsite manually.',
    activeJobsite: 'Active Jobsite',
    noActiveJobsite: 'No active jobsite right now.',
    activeJobsiteBody: 'Start a jobsite from the project command center and it will appear here for live field tracking.'
  },
  es: {
    badge: 'Reloj Admin',
    title: 'Da seguimiento a entradas y salidas por obra.',
    body:
      'Esta primera versión le da a Capitol Building Group un reloj interno simple. Por ahora los trabajadores se agregan manualmente y luego esto puede conectarse a cuentas reales y asistencia en obra.',
    back: 'Volver al Admin',
    jobsite: 'Obra',
    worker: 'Nombre del Trabajador',
    role: 'Rol / Oficio',
    clockIn: 'Entrada',
    clockOut: 'Salida',
    activeWorkers: 'Actualmente Activos',
    recentEntries: 'Entradas Recientes',
    emptyActive: 'No hay nadie activo en este momento.',
    emptyEntries: 'Todavía no hay registros.',
    totalEntries: 'Registros',
    activeCount: 'Activos',
    totalHours: 'Horas Estimadas',
    inAt: 'Entrada',
    outAt: 'Salida',
    loading: 'Cargando reloj…',
    loadError: 'No se pudieron cargar los registros de tiempo.',
    saveError: 'No se pudo registrar la entrada.',
    clockOutError: 'No se pudo registrar la salida.',
    requiredFields: 'Obra y nombre del trabajador son obligatorios.',
    clockedIn: 'Trabajador registrado en entrada.',
    clockedOut: 'Trabajador registrado en salida.',
    crmJobsiteHint: 'Elige un proyecto/obra existente del CRM o escribe uno nuevo.',
    noCrmRecords: 'Todavía no hay proyectos CRM. Aún puedes escribir la obra manualmente.',
    activeJobsite: 'Obra Activa',
    noActiveJobsite: 'No hay una obra activa en este momento.',
    activeJobsiteBody: 'Inicia una obra desde el panel del proyecto y aparecerá aquí para el seguimiento en campo.'
  }
}

function mapDbRowToEntry(row = {}) {
  return {
    id: row.id || '',
    jobsite: row.jobsite || '',
    worker: row.worker || '',
    role: row.role || '',
    clockInAt: row.clock_in_at || '',
    clockOutAt: row.clock_out_at || ''
  }
}

export default function AdminTimeClock({ lang = 'en' }) {
  const copy = COPY[lang] || COPY.en
  const [entries, setEntries] = useState([])
  const [crmRecords, setCrmRecords] = useState([])
  const [activeJob, setActiveJob] = useState(null)
  const [jobsite, setJobsite] = useState('')
  const [worker, setWorker] = useState('')
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true

    async function loadEntries() {
      setLoading(true)
      setMessage('')

      try {
        const [timeRes, crmRes, activeJobRes] = await Promise.all([
          supabase
            .from('admin_time_entries')
            .select('id, jobsite, worker, role, clock_in_at, clock_out_at')
            .order('clock_in_at', { ascending: false }),
          supabase
            .from('admin_crm_records')
            .select('id, company, project, created_at')
            .order('created_at', { ascending: false }),
          supabase
            .from('admin_crm_records')
            .select('id, company, project, is_active_job, job_started_at')
            .eq('is_active_job', true)
            .limit(1)
            .maybeSingle()
        ])

        if (timeRes.error) throw timeRes.error
        if (crmRes.error) throw crmRes.error
        if (activeJobRes.error) throw activeJobRes.error
        if (!active) return

        setEntries(Array.isArray(timeRes.data) ? timeRes.data.map(mapDbRowToEntry) : [])
        setCrmRecords(Array.isArray(crmRes.data) ? crmRes.data : [])
        setActiveJob(activeJobRes.data || null)

        if (!String(jobsite || '').trim() && activeJobRes.data?.project) {
          setJobsite(activeJobRes.data.project)
        }
      } catch (error) {
        console.error(error)
        if (!active) return
        setMessage(copy.loadError)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadEntries()

    return () => {
      active = false
    }
  }, [copy.loadError])

  const crmJobsites = useMemo(() => {
    return Array.from(
      new Set(
        crmRecords
          .map((row) => String(row.project || '').trim())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b))
  }, [crmRecords])

  const activeEntries = useMemo(
    () =>
      entries
        .filter((entry) => !entry.clockOutAt)
        .sort((a, b) => new Date(b.clockInAt).getTime() - new Date(a.clockInAt).getTime()),
    [entries]
  )

  const activeJobEntries = useMemo(() => {
    if (!activeJob?.project) return []
    return activeEntries.filter((entry) => entry.jobsite === activeJob.project)
  }, [activeEntries, activeJob])

  const stats = useMemo(() => {
    const totalHours = entries.reduce((sum, entry) => {
      if (!entry.clockOutAt) return sum
      const diff = (new Date(entry.clockOutAt).getTime() - new Date(entry.clockInAt).getTime()) / 3600000
      return sum + Math.max(diff, 0)
    }, 0)

    return {
      totalEntries: entries.length,
      activeCount: activeEntries.length,
      totalHours
    }
  }, [entries, activeEntries])

  async function handleClockIn(event) {
    event.preventDefault()

    if (!String(jobsite || '').trim() || !String(worker || '').trim()) {
      setMessage(copy.requiredFields)
      return
    }

    try {
      setMessage('')

      const payload = {
        jobsite: String(jobsite || '').trim(),
        worker: String(worker || '').trim(),
        role: String(role || '').trim() || null,
        clock_in_at: new Date().toISOString(),
        clock_out_at: null
      }

      const { data, error } = await supabase
        .from('admin_time_entries')
        .insert(payload)
        .select('id, jobsite, worker, role, clock_in_at, clock_out_at')
        .single()

      if (error) throw error

      const mapped = mapDbRowToEntry(data)
      setEntries((prev) => [mapped, ...prev])
      setWorker('')
      setRole('')
      setMessage(copy.clockedIn)
    } catch (error) {
      console.error(error)
      setMessage(copy.saveError)
    }
  }

  async function handleClockOut(id) {
    try {
      setMessage('')

      const { data, error } = await supabase
        .from('admin_time_entries')
        .update({ clock_out_at: new Date().toISOString() })
        .eq('id', id)
        .is('clock_out_at', null)
        .select('id, jobsite, worker, role, clock_in_at, clock_out_at')
        .single()

      if (error) throw error

      const mapped = mapDbRowToEntry(data)
      setEntries((prev) => prev.map((entry) => (entry.id === mapped.id ? mapped : entry)))
      setMessage(copy.clockedOut)
    } catch (error) {
      console.error(error)
      setMessage(copy.clockOutError)
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

      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="card-section-title">{copy.activeJobsite}</div>
        {activeJob ? (
          <div className="card-soft" style={{ marginTop: 14, background: '#ffffff' }}>
            <div style={{ fontWeight: 900, fontSize: 18 }}>{activeJob.project}</div>
            <div className="muted" style={{ marginTop: 8 }}>{activeJob.company}</div>
            {activeJob.job_started_at ? (
              <div style={{ marginTop: 10 }}>
                <span className="badge">{copy.inAt}: {new Date(activeJob.job_started_at).toLocaleString()}</span>
              </div>
            ) : null}
            <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span className="badge">Crew On Site: {activeJobEntries.length}</span>
            </div>
          </div>
        ) : (
          <div className="card-soft" style={{ marginTop: 14 }}>
            <div className="card-section-title" style={{ fontSize: 15 }}>{copy.noActiveJobsite}</div>
            <p className="card-section-subtitle" style={{ marginTop: 8 }}>{copy.activeJobsiteBody}</p>
          </div>
        )}
      </div>

      <div className="grid two">
        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">{copy.clockIn}</div>
          <form onSubmit={handleClockIn} className="grid" style={{ gap: 12, marginTop: 14 }}>
            <div>
              <input
                className="input"
                list="crm-jobsite-options"
                value={jobsite}
                onChange={(e) => setJobsite(e.target.value)}
                placeholder={copy.jobsite}
              />
              <datalist id="crm-jobsite-options">
                {crmJobsites.map((project) => (
                  <option key={project} value={project} />
                ))}
              </datalist>
              <div className="muted" style={{ marginTop: 6 }}>
                {crmJobsites.length > 0 ? copy.crmJobsiteHint : copy.noCrmRecords}
              </div>
            </div>

            <input className="input" value={worker} onChange={(e) => setWorker(e.target.value)} placeholder={copy.worker} />
            <input className="input" value={role} onChange={(e) => setRole(e.target.value)} placeholder={copy.role} />
            <button className="btn primary" type="submit">{copy.clockIn}</button>
          </form>

          <div className="grid two" style={{ marginTop: 16 }}>
            <div className="card-soft"><div className="muted">{copy.totalEntries}</div><div style={{ fontSize: 28, fontWeight: 900, marginTop: 8 }}>{stats.totalEntries}</div></div>
            <div className="card-soft"><div className="muted">{copy.activeCount}</div><div style={{ fontSize: 28, fontWeight: 900, marginTop: 8 }}>{stats.activeCount}</div></div>
            <div className="card-soft"><div className="muted">{copy.totalHours}</div><div style={{ fontSize: 28, fontWeight: 900, marginTop: 8 }}>{stats.totalHours.toFixed(1)}</div></div>
          </div>
        </div>

        <div className="grid" style={{ gap: 14 }}>
          <div className="card rounded-xl" style={{ padding: 22 }}>
            <div className="card-section-title">{copy.activeWorkers}</div>
            {activeEntries.length === 0 ? (
              <div className="card-soft" style={{ marginTop: 14 }}>{copy.emptyActive}</div>
            ) : (
              <div className="list" style={{ marginTop: 14 }}>
                {activeEntries.map((entry) => (
                  <div key={entry.id} className="card-soft" style={{ background: '#ffffff' }}>
                    <div style={{ fontWeight: 900 }}>{entry.worker}</div>
                    <div className="muted" style={{ marginTop: 8 }}>
                      {entry.jobsite} {entry.role ? `· ${entry.role}` : ''}
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <span className="badge">{copy.inAt}: {new Date(entry.clockInAt).toLocaleString()}</span>
                    </div>
                    <div style={{ marginTop: 14 }}>
                      <button type="button" className="btn small primary" onClick={() => handleClockOut(entry.id)}>
                        {copy.clockOut}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card rounded-xl" style={{ padding: 22 }}>
            <div className="card-section-title">{copy.recentEntries}</div>
            {entries.length === 0 ? (
              <div className="card-soft" style={{ marginTop: 14 }}>{copy.emptyEntries}</div>
            ) : (
              <div className="list" style={{ marginTop: 14 }}>
                {entries
                  .slice()
                  .sort((a, b) => new Date(b.clockInAt).getTime() - new Date(a.clockInAt).getTime())
                  .map((entry) => (
                    <div key={entry.id} className="card-soft" style={{ background: '#ffffff' }}>
                      <div style={{ fontWeight: 900 }}>{entry.worker}</div>
                      <div className="muted" style={{ marginTop: 8 }}>
                        {entry.jobsite} {entry.role ? `· ${entry.role}` : ''}
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                        <span className="badge">{copy.inAt}: {new Date(entry.clockInAt).toLocaleString()}</span>
                        <span className="badge">
                          {copy.outAt}: {entry.clockOutAt ? new Date(entry.clockOutAt).toLocaleString() : '—'}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
