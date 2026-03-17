import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

const STORAGE_KEY = 'surplox_admin_crm_v1'

const COPY = {
  en: {
    badge: 'Admin CRM',
    title: 'Track Capitol Building Group relationships inside Surplox.',
    body:
      'Use this internal CRM to keep up with leads, clients, follow-ups, and project-stage notes. This tool is admin-only for now and can later become a paid contractor feature.',
    back: 'Back to Admin',
    addLead: 'Add Lead / Client',
    emptyTitle: 'No CRM records yet.',
    emptyBody:
      'Add your first lead, client, or subcontractor relationship so Surplox can start acting like an operations system.',
    searchPlaceholder: 'Search company, contact, city, stage, notes...',
    allStages: 'All Stages',
    stageLead: 'Lead',
    stageBid: 'Bid / Estimate',
    stageActive: 'Active Client',
    stageFollowUp: 'Follow Up',
    stageWon: 'Won',
    stageLost: 'Lost',
    company: 'Company / Account',
    contact: 'Primary Contact',
    phone: 'Phone',
    email: 'Email',
    city: 'City',
    project: 'Project / Opportunity',
    value: 'Estimated Value ($)',
    stage: 'Stage',
    nextFollowUp: 'Next Follow-Up',
    notesPlaceholder: 'Scope, relationship notes, who introduced them, bid status, next steps...',
    save: 'Save CRM Entry',
    saving: 'Saving…',
    edit: 'Edit',
    delete: 'Delete',
    statsTotal: 'Total Records',
    statsOpen: 'Open Pipeline',
    statsWon: 'Won',
    statsFollowUp: 'Need Follow-Up'
  },
  es: {
    badge: 'CRM Admin',
    title: 'Gestiona relaciones de Capitol Building Group dentro de Surplox.',
    body:
      'Usa este CRM interno para dar seguimiento a prospectos, clientes, seguimientos y notas por etapa del proyecto. Esta herramienta es solo para admin por ahora y luego puede convertirse en una función paga.',
    back: 'Volver al Admin',
    addLead: 'Agregar Prospecto / Cliente',
    emptyTitle: 'Todavía no hay registros CRM.',
    emptyBody:
      'Agrega tu primer prospecto, cliente o relación de subcontratista para que Surplox empiece a funcionar como sistema operativo.',
    searchPlaceholder: 'Busca empresa, contacto, ciudad, etapa, notas...',
    allStages: 'Todas las Etapas',
    stageLead: 'Prospecto',
    stageBid: 'Cotización / Estimado',
    stageActive: 'Cliente Activo',
    stageFollowUp: 'Seguimiento',
    stageWon: 'Ganado',
    stageLost: 'Perdido',
    company: 'Empresa / Cuenta',
    contact: 'Contacto Principal',
    phone: 'Teléfono',
    email: 'Correo',
    city: 'Ciudad',
    project: 'Proyecto / Oportunidad',
    value: 'Valor Estimado ($)',
    stage: 'Etapa',
    nextFollowUp: 'Próximo Seguimiento',
    notesPlaceholder: 'Alcance, notas de relación, quién lo refirió, estatus de la cotización, próximos pasos...',
    save: 'Guardar Registro CRM',
    saving: 'Guardando…',
    edit: 'Editar',
    delete: 'Eliminar',
    statsTotal: 'Registros Totales',
    statsOpen: 'Pipeline Abierto',
    statsWon: 'Ganados',
    statsFollowUp: 'Necesitan Seguimiento'
  }
}

const STAGES = ['lead', 'bid', 'active', 'follow_up', 'won', 'lost']

function makeEmptyEntry() {
  return {
    id: '',
    company: '',
    contact: '',
    phone: '',
    email: '',
    city: '',
    project: '',
    estimatedValue: '',
    stage: 'lead',
    nextFollowUp: '',
    notes: '',
    createdAt: ''
  }
}

function labelForStage(stage, copy) {
  if (stage === 'lead') return copy.stageLead
  if (stage === 'bid') return copy.stageBid
  if (stage === 'active') return copy.stageActive
  if (stage === 'follow_up') return copy.stageFollowUp
  if (stage === 'won') return copy.stageWon
  if (stage === 'lost') return copy.stageLost
  return stage
}

export default function AdminCRM({ lang = 'en' }) {
  const copy = COPY[lang] || COPY.en
  const [entries, setEntries] = useState([])
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(makeEmptyEntry())

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

  const filteredEntries = useMemo(() => {
    const q = search.trim().toLowerCase()
    return entries
      .filter((entry) => {
        if (stageFilter && entry.stage !== stageFilter) return false
        if (!q) return true
        const haystack = [
          entry.company,
          entry.contact,
          entry.phone,
          entry.email,
          entry.city,
          entry.project,
          entry.notes,
          entry.stage
        ].join(' ').toLowerCase()
        return haystack.includes(q)
      })
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
  }, [entries, search, stageFilter])

  const stats = useMemo(() => ({
    total: entries.length,
    open: entries.filter((entry) => ['lead', 'bid', 'active', 'follow_up'].includes(entry.stage)).length,
    won: entries.filter((entry) => entry.stage === 'won').length,
    needsFollowUp: entries.filter((entry) => entry.stage === 'follow_up').length
  }), [entries])

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSave(event) {
    event.preventDefault()
    if (!String(form.company || '').trim()) return

    setSaving(true)
    const payload = {
      ...form,
      id: form.id || crypto.randomUUID(),
      company: String(form.company || '').trim(),
      contact: String(form.contact || '').trim(),
      phone: String(form.phone || '').trim(),
      email: String(form.email || '').trim(),
      city: String(form.city || '').trim(),
      project: String(form.project || '').trim(),
      estimatedValue: String(form.estimatedValue || '').trim(),
      notes: String(form.notes || '').trim(),
      createdAt: form.createdAt || new Date().toISOString()
    }

    setEntries((prev) => {
      const idx = prev.findIndex((item) => item.id === payload.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = payload
        return next
      }
      return [payload, ...prev]
    })

    setForm(makeEmptyEntry())
    setSaving(false)
  }

  function handleEdit(entry) {
    setForm(entry)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleDelete(id) {
    setEntries((prev) => prev.filter((entry) => entry.id !== id))
    if (form.id === id) setForm(makeEmptyEntry())
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
          <div className="card-section-title">{copy.addLead}</div>
          <form onSubmit={handleSave} className="grid" style={{ gap: 12, marginTop: 14 }}>
            <input className="input" value={form.company} onChange={(e) => updateField('company', e.target.value)} placeholder={copy.company} />
            <input className="input" value={form.contact} onChange={(e) => updateField('contact', e.target.value)} placeholder={copy.contact} />
            <div className="grid two">
              <input className="input" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder={copy.phone} />
              <input className="input" value={form.email} onChange={(e) => updateField('email', e.target.value)} placeholder={copy.email} />
            </div>
            <div className="grid two">
              <input className="input" value={form.city} onChange={(e) => updateField('city', e.target.value)} placeholder={copy.city} />
              <input className="input" value={form.project} onChange={(e) => updateField('project', e.target.value)} placeholder={copy.project} />
            </div>
            <div className="grid two">
              <input className="input" value={form.estimatedValue} onChange={(e) => updateField('estimatedValue', e.target.value)} placeholder={copy.value} />
              <input className="input" type="date" value={form.nextFollowUp} onChange={(e) => updateField('nextFollowUp', e.target.value)} />
            </div>
            <select className="input" value={form.stage} onChange={(e) => updateField('stage', e.target.value)}>
              {STAGES.map((stage) => (
                <option key={stage} value={stage}>{labelForStage(stage, copy)}</option>
              ))}
            </select>
            <textarea className="input" value={form.notes} onChange={(e) => updateField('notes', e.target.value)} placeholder={copy.notesPlaceholder} />
            <button className="btn primary" type="submit" disabled={saving}>
              {saving ? copy.saving : copy.save}
            </button>
          </form>
        </div>

        <div className="grid" style={{ gap: 14 }}>
          <div className="grid two">
            <div className="card-soft"><div className="muted">{copy.statsTotal}</div><div style={{ fontSize: 28, fontWeight: 900, marginTop: 8 }}>{stats.total}</div></div>
            <div className="card-soft"><div className="muted">{copy.statsOpen}</div><div style={{ fontSize: 28, fontWeight: 900, marginTop: 8 }}>{stats.open}</div></div>
            <div className="card-soft"><div className="muted">{copy.statsWon}</div><div style={{ fontSize: 28, fontWeight: 900, marginTop: 8 }}>{stats.won}</div></div>
            <div className="card-soft"><div className="muted">{copy.statsFollowUp}</div><div style={{ fontSize: 28, fontWeight: 900, marginTop: 8 }}>{stats.needsFollowUp}</div></div>
          </div>

          <div className="card rounded-xl" style={{ padding: 22 }}>
            <div className="grid two" style={{ marginBottom: 14 }}>
              <input className="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={copy.searchPlaceholder} />
              <select className="input" value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
                <option value="">{copy.allStages}</option>
                {STAGES.map((stage) => (
                  <option key={stage} value={stage}>{labelForStage(stage, copy)}</option>
                ))}
              </select>
            </div>

            {filteredEntries.length === 0 ? (
              <div className="card-soft">
                <div className="card-section-title">{copy.emptyTitle}</div>
                <p className="card-section-subtitle" style={{ marginTop: 8 }}>{copy.emptyBody}</p>
              </div>
            ) : (
              <div className="list">
                {filteredEntries.map((entry) => (
                  <div key={entry.id} className="card-soft" style={{ background: '#ffffff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                      <div style={{ fontWeight: 900, fontSize: 18 }}>{entry.company}</div>
                      <span className="badge">{labelForStage(entry.stage, copy)}</span>
                    </div>
                    <div className="muted" style={{ marginTop: 8 }}>
                      {entry.contact || '—'} · {entry.city || '—'}
                    </div>
                    {entry.project ? <div style={{ marginTop: 8 }}>{entry.project}</div> : null}
                    {entry.notes ? <div style={{ marginTop: 10, lineHeight: 1.7 }}>{entry.notes}</div> : null}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                      {entry.phone ? <span className="badge">{entry.phone}</span> : null}
                      {entry.email ? <span className="badge">{entry.email}</span> : null}
                      {entry.estimatedValue ? <span className="badge">${entry.estimatedValue}</span> : null}
                      {entry.nextFollowUp ? <span className="badge">{copy.nextFollowUp}: {entry.nextFollowUp}</span> : null}
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
                      <button type="button" className="btn small" onClick={() => handleEdit(entry)}>{copy.edit}</button>
                      <button type="button" className="btn small" onClick={() => handleDelete(entry.id)}>{copy.delete}</button>
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
