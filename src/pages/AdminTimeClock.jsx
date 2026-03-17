import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

const STORAGE_KEY = 'surplox_admin_timeclock_v1'

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
    outAt: 'Out'
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
    outAt: 'Salida'
  }
}

export default function AdminTimeClock({ lang = 'en' }) {
  const copy = COPY[lang] || COPY.en
  const [entries, setEntries] = useState([])
  const [jobsite, setJobsite] = useState('')
  const [worker, setWorker] = useState('')
  const [role, setRole] = useState('')

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      setEntries(Array.isArray(stored) ? stored : [])
    } catch (error) {
      console.error(error)
      setEntries([])
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  }, [entries])

  const activeEntries = useMemo(
    () => entries.filter((entry) => !entry.clockOutAt).sort((a, b) => new Date(b.clockInAt).getTime() - new Date(a.clockInAt).getTime()),
    [entries]
  )

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

  function handleClockIn(event) {
    event.preventDefault()
    if (!String(jobsite || '').trim() || !String(worker || '').trim()) return

    setEntries((prev) => [
      {
        id: crypto.randomUUID(),
        jobsite: String(jobsite || '').trim(),
        worker: String(worker || '').trim(),
        role: String(role || '').trim(),
        clockInAt: new Date().toISOString(),
        clockOutAt: ''
      },
      ...prev
    ])

    setWorker('')
    setRole('')
  }

  function handleClockOut(id) {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === id && !entry.clockOutAt
          ? { ...entry, clockOutAt: new Date().toISOString() }
          : entry
      )
    )
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
          <div className="card-section-title">{copy.clockIn}</div>
          <form onSubmit={handleClockIn} className="grid" style={{ gap: 12, marginTop: 14 }}>
            <input className="input" value={jobsite} onChange={(e) => setJobsite(e.target.value)} placeholder={copy.jobsite} />
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
