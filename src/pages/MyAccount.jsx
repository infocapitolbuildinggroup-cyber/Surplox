import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const YARD_OPTIONS = [
  'Warehouse / Main Yard',
  'Mexico',
  'Oklahoma Yard',
  'Stainless Tent',
  'Receiving Gate',
  'Field / Plant'
]

const SHIFT_OPTIONS = [
  'Day Shift',
  'Night Shift',
  'Swing Shift',
  'Rotating',
  'Other'
]

function emptyForm() {
  return {
    full_name: '',
    company: 'Summit Industrial',
    project_name: 'IREN Childress Data Center',
    department: 'Material Handling',
    role_title: '',
    shift: '',
    assigned_yard: '',
    phone: '',
    email: '',
    supervisor: '',
    forklift_certified: false,
    telehandler_certified: false,
    rigger: false,
    pipefitter: false,
    notifications_new_fmrs: true,
    notifications_status_changes: true,
    notifications_receiving: true,
    notifications_inventory: true,
    notes: ''
  }
}

export default function MyAccount({ lang = 'en' }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [userId, setUserId] = useState('')
  const [form, setForm] = useState(emptyForm())

  const copy =
    lang === 'es'
      ? {
          loading: 'Cargando cuenta…',
          title: 'Mi cuenta',
          intro: 'Perfil interno para Surplox Industrial, material handling, FMRs, inventario y comunicación del proyecto.',
          identity: 'Identidad',
          jobInfo: 'Información del proyecto',
          certifications: 'Certificaciones / capacidades',
          notifications: 'Preferencias de alertas',
          notes: 'Notas',
          save: 'Guardar cambios',
          saving: 'Guardando…',
          saved: 'Cuenta actualizada.',
          loadError: 'No se pudo cargar la cuenta.',
          saveError: 'No se pudieron guardar los cambios.',
          signedOut: 'Debes iniciar sesión.',
          fullName: 'Nombre completo',
          company: 'Compañía',
          project: 'Proyecto',
          department: 'Departamento',
          role: 'Puesto / rol',
          shift: 'Turno',
          assignedYard: 'Yarda asignada',
          phone: 'Teléfono',
          email: 'Correo',
          supervisor: 'Supervisor',
          forklift: 'Forklift certificado',
          telehandler: 'Telehandler certificado',
          rigger: 'Rigger',
          pipefitter: 'Pipefitter',
          newFmrs: 'Nuevos FMRs',
          statusChanges: 'Cambios de estatus',
          receiving: 'Receiving / entregas de proveedor',
          inventory: 'Movimientos de inventario'
        }
      : {
          loading: 'Loading account…',
          title: 'My Account',
          intro: 'Internal profile for Surplox Industrial, material handling, FMRs, inventory, and project communication.',
          identity: 'Identity',
          jobInfo: 'Project information',
          certifications: 'Certifications / capabilities',
          notifications: 'Alert preferences',
          notes: 'Notes',
          save: 'Save changes',
          saving: 'Saving…',
          saved: 'Account updated.',
          loadError: 'Unable to load account.',
          saveError: 'Unable to save changes.',
          signedOut: 'You must be signed in.',
          fullName: 'Full name',
          company: 'Company',
          project: 'Project',
          department: 'Department',
          role: 'Position / role',
          shift: 'Shift',
          assignedYard: 'Assigned yard',
          phone: 'Phone',
          email: 'Email',
          supervisor: 'Supervisor',
          forklift: 'Forklift certified',
          telehandler: 'Telehandler certified',
          rigger: 'Rigger',
          pipefitter: 'Pipefitter',
          newFmrs: 'New FMRs',
          statusChanges: 'Status changes',
          receiving: 'Receiving / vendor deliveries',
          inventory: 'Inventory movements'
        }

  function setField(key, value) {
    setForm((prev) => ({
      ...prev,
      [key]: value
    }))
  }

  async function loadProfile() {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user

      if (!user) {
        setError(copy.signedOut)
        setLoading(false)
        return
      }

      setUserId(user.id)

      const { data, error: profileError } = await supabase
        .from('industrial_user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (profileError) throw profileError

      if (data) {
        setForm({
          ...emptyForm(),
          ...data,
          email: data.email || user.email || ''
        })
      } else {
        setForm({
          ...emptyForm(),
          email: user.email || ''
        })
      }
    } catch (err) {
      console.error(err)
      setError(copy.loadError)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  async function saveProfile(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    try {
      if (!userId) throw new Error(copy.signedOut)

      const payload = {
        user_id: userId,
        full_name: form.full_name.trim(),
        company: form.company.trim(),
        project_name: form.project_name.trim(),
        department: form.department.trim(),
        role_title: form.role_title.trim(),
        shift: form.shift.trim(),
        assigned_yard: form.assigned_yard.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        supervisor: form.supervisor.trim(),
        forklift_certified: Boolean(form.forklift_certified),
        telehandler_certified: Boolean(form.telehandler_certified),
        rigger: Boolean(form.rigger),
        pipefitter: Boolean(form.pipefitter),
        notifications_new_fmrs: Boolean(form.notifications_new_fmrs),
        notifications_status_changes: Boolean(form.notifications_status_changes),
        notifications_receiving: Boolean(form.notifications_receiving),
        notifications_inventory: Boolean(form.notifications_inventory),
        notes: form.notes.trim()
      }

      const { error: saveError } = await supabase
        .from('industrial_user_profiles')
        .upsert(payload, { onConflict: 'user_id' })

      if (saveError) throw saveError

      setMessage(copy.saved)
    } catch (err) {
      console.error(err)
      setError(copy.saveError)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="card">{copy.loading}</div>
  }

  return (
    <form onSubmit={saveProfile} className="grid" style={{ gap: 18 }}>
      <div
        className="card rounded-xl"
        style={{
          padding: 24,
          background: 'linear-gradient(180deg, #fff7cf 0%, #ffffff 100%)'
        }}
      >
        <div className="badge">Surplox Industrial</div>
        <div className="h1" style={{ marginTop: 14 }}>
          {copy.title}
        </div>
        <p className="muted" style={{ marginTop: 10, maxWidth: 820, lineHeight: 1.7 }}>
          {copy.intro}
        </p>
      </div>

      {error ? (
        <div className="card-soft" style={{ background: '#fff4da' }}>
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="card-soft" style={{ background: '#dcf4e5', color: '#177245' }}>
          {message}
        </div>
      ) : null}

      <div className="grid two" style={{ alignItems: 'start' }}>
        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">{copy.identity}</div>

          <div className="grid" style={{ marginTop: 16, gap: 14 }}>
            <div>
              <label className="muted">{copy.fullName}</label>
              <input
                className="input"
                value={form.full_name}
                onChange={(e) => setField('full_name', e.target.value)}
              />
            </div>

            <div>
              <label className="muted">{copy.phone}</label>
              <input
                className="input"
                value={form.phone}
                onChange={(e) => setField('phone', e.target.value)}
              />
            </div>

            <div>
              <label className="muted">{copy.email}</label>
              <input
                className="input"
                type="email"
                value={form.email}
                onChange={(e) => setField('email', e.target.value)}
              />
            </div>

            <div>
              <label className="muted">{copy.supervisor}</label>
              <input
                className="input"
                value={form.supervisor}
                onChange={(e) => setField('supervisor', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">{copy.jobInfo}</div>

          <div className="grid" style={{ marginTop: 16, gap: 14 }}>
            <div>
              <label className="muted">{copy.company}</label>
              <input
                className="input"
                value={form.company}
                onChange={(e) => setField('company', e.target.value)}
              />
            </div>

            <div>
              <label className="muted">{copy.project}</label>
              <input
                className="input"
                value={form.project_name}
                onChange={(e) => setField('project_name', e.target.value)}
              />
            </div>

            <div>
              <label className="muted">{copy.department}</label>
              <input
                className="input"
                value={form.department}
                onChange={(e) => setField('department', e.target.value)}
              />
            </div>

            <div>
              <label className="muted">{copy.role}</label>
              <input
                className="input"
                value={form.role_title}
                onChange={(e) => setField('role_title', e.target.value)}
                placeholder="Warehouse Hand, Material Handler, Foreman..."
              />
            </div>

            <div>
              <label className="muted">{copy.shift}</label>
              <select
                value={form.shift}
                onChange={(e) => setField('shift', e.target.value)}
              >
                <option value=""></option>
                {SHIFT_OPTIONS.map((shift) => (
                  <option key={shift} value={shift}>
                    {shift}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="muted">{copy.assignedYard}</label>
              <select
                value={form.assigned_yard}
                onChange={(e) => setField('assigned_yard', e.target.value)}
              >
                <option value=""></option>
                {YARD_OPTIONS.map((yard) => (
                  <option key={yard} value={yard}>
                    {yard}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid two" style={{ alignItems: 'start' }}>
        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">{copy.certifications}</div>

          <div className="grid" style={{ marginTop: 16, gap: 12 }}>
            <CheckRow
              label={copy.forklift}
              checked={form.forklift_certified}
              onChange={(value) => setField('forklift_certified', value)}
            />
            <CheckRow
              label={copy.telehandler}
              checked={form.telehandler_certified}
              onChange={(value) => setField('telehandler_certified', value)}
            />
            <CheckRow
              label={copy.rigger}
              checked={form.rigger}
              onChange={(value) => setField('rigger', value)}
            />
            <CheckRow
              label={copy.pipefitter}
              checked={form.pipefitter}
              onChange={(value) => setField('pipefitter', value)}
            />
          </div>
        </div>

        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">{copy.notifications}</div>

          <div className="grid" style={{ marginTop: 16, gap: 12 }}>
            <CheckRow
              label={copy.newFmrs}
              checked={form.notifications_new_fmrs}
              onChange={(value) => setField('notifications_new_fmrs', value)}
            />
            <CheckRow
              label={copy.statusChanges}
              checked={form.notifications_status_changes}
              onChange={(value) => setField('notifications_status_changes', value)}
            />
            <CheckRow
              label={copy.receiving}
              checked={form.notifications_receiving}
              onChange={(value) => setField('notifications_receiving', value)}
            />
            <CheckRow
              label={copy.inventory}
              checked={form.notifications_inventory}
              onChange={(value) => setField('notifications_inventory', value)}
            />
          </div>
        </div>
      </div>

      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="card-section-title">{copy.notes}</div>
        <textarea
          className="input"
          style={{ marginTop: 14 }}
          value={form.notes}
          onChange={(e) => setField('notes', e.target.value)}
          placeholder="Special responsibilities, yard notes, communication preferences..."
        />
      </div>

      <div>
        <button className="btn primary" type="submit" disabled={saving}>
          {saving ? copy.saving : copy.save}
        </button>
      </div>
    </form>
  )
}

function CheckRow({ label, checked, onChange }) {
  return (
    <label className="form-check">
      <input
        className="form-check-input"
        type="checkbox"
        checked={Boolean(checked)}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="form-check-label">{label}</span>
    </label>
  )
}