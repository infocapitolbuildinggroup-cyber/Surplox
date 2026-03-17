import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

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
    statsFollowUp: 'Need Follow-Up',
    loading: 'Loading CRM…',
    loadError: 'Unable to load CRM records right now.',
    deleteError: 'Unable to delete CRM record right now.',
    saveError: 'Unable to save CRM record right now.',
    companyRequired: 'Company / Account is required.',
    saved: 'CRM entry saved.',
    deleted: 'CRM entry deleted.'
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
    statsFollowUp: 'Necesitan Seguimiento',
    loading: 'Cargando CRM…',
    loadError: 'No se pudieron cargar los registros CRM.',
    deleteError: 'No se pudo eliminar el registro CRM.',
    saveError: 'No se pudo guardar el registro CRM.',
    companyRequired: 'Empresa / Cuenta es obligatoria.',
    saved: 'Registro CRM guardado.',
    deleted: 'Registro CRM eliminado.'
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

function mapDbRowToEntry(row = {}) {
  return {
    id: row.id || '',
    company: row.company || '',
    contact: row.contact || '',
    phone: row.phone || '',
    email: row.email || '',
    city: row.city || '',
    project: row.project || '',
    estimatedValue: row.estimated_value || '',
    stage: row.stage || 'lead',
    nextFollowUp: row.next_follow_up || '',
    notes: row.notes || '',
    createdAt: row.created_at || ''
  }
}

export default function AdminCRM({ lang = 'en' }) {
  const copy = COPY[lang] || COPY.en
  const [entries, setEntries] = useState([])
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState(makeEmptyEntry())

  useEffect(() => {
    let active = true

    async function loadEntries() {
      setLoading(true)
      setMessage('')

      try {
        const { data, error } = await supabase
          .from('admin_crm_records')
          .select('id, company, contact, phone, email, city, project, estimated_value, stage, next_follow_up, notes, created_at')
          .order('created_at', { ascending: false })

        if (error) throw error
        if (!active) return

        setEntries(Array.isArray(data) ? data.map(mapDbRowToEntry) : [])
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

  const stats = useMemo(
    () => ({
      total: entries.length,
      open: entries.filter((entry) => ['lead', 'bid', 'active', 'follow_up'].includes(entry.stage)).length,
      won: entries.filter((entry) => entry.stage === 'won').length,
      needsFollowUp: entries.filter((entry) => entry.stage === 'follow_up').length
    }),
    [entries]
  )

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave(event) {
    event.preventDefault()

    if (!String(form.company || '').trim()) {
      setMessage(copy.companyRequired)
      return
    }

    setSaving(true)
    setMessage('')

    const payload = {
      company: String(form.company || '').trim(),
      contact: String(form.contact || '').trim() || null,
      phone: String(form.phone || '').trim() || null,
      email: String(form.email || '').trim() || null,
      city: String(form.city || '').trim() || null,
      project: String(form.project || '').trim() || null,
      estimated_value: String(form.estimatedValue || '').trim() || null,
      stage: String(form.stage || 'lead'),
      next_follow_up: String(form.nextFollowUp || '').trim() || null,
      notes: String(form.notes || '').trim() || null
    }

    try {
      if (form.id) {
        const { data, error } = await supabase
          .from('admin_crm_records')
          .update(payload)
          .eq('id', form.id)
          .select('id, company, contact, phone, email, city, project, estimated_value, stage, next_follow_up, notes, created_at')
          .single()

        if (error) throw error

        const mapped = mapDbRowToEntry(data)
        setEntries((prev) => prev.map((item) => (item.id === mapped.id ? mapped : item)))
      } else {
        const { data, error } = await supabase
          .from('admin_crm_records')
          .insert(payload)
          .select('id, company, contact, phone, email, city, project, estimated_value, stage, next_follow_up, notes, created_at')
          .single()

        if (error) throw error

        const mapped = mapDbRowToEntry(data)
        setEntries((prev) => [mapped, ...prev])
      }

      setForm(makeEmptyEntry())
      setMessage(copy.saved)
    } catch (error) {
      console.error(error)
      setMessage(copy.saveError)
    } finally {
      setSaving(false)
    }
  }

  function handleEdit(entry) {
    setForm(entry)
    setMessage('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleDelete(id) {
    try {
      setMessage('')
      const { error } = await supabase.from('admin_crm_records').delete().eq('id', id)
      if (error) throw error

      setEntries((prev) => prev.filter((entry) => entry.id !== id))
      if (form.id === id) setForm(makeEmptyEntry())
      setMessage(copy.deleted)
    } catch (error) {
      console.error(error)
      setMessage(copy.deleteError)
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
