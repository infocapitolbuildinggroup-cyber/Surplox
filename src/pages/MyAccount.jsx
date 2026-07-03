import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useUser } from '../context/UserContext'

const YARD_OPTIONS = [
  'Warehouse / Main Yard',
  'Mexico',
  'Oklahoma Yard',
  'Stainless Tent',
  'Receiving Gate',
  'Field / Plant'
]

const SHIFT_OPTIONS = ['Day Shift', 'Night Shift', 'Swing Shift', 'Rotating', 'Other']

const ROLE_OPTIONS = [
  {
    value: 'warehouse_hand',
    label: 'Warehouse Hand',
    permission_group: 'warehouse_operations',
    access_type: 'warehouse_worker'
  },
  {
    value: 'warehouse_lead',
    label: 'Warehouse Lead',
    permission_group: 'warehouse_operations',
    access_type: 'warehouse_worker'
  },
  {
    value: 'warehouse_supervisor',
    label: 'Warehouse Supervisor',
    permission_group: 'supervisor',
    access_type: 'supervisor'
  },
  {
    value: 'pipefitter',
    label: 'Pipefitter',
    permission_group: 'field_operations',
    access_type: 'field_worker'
  },
  {
    value: 'welder',
    label: 'Welder',
    permission_group: 'field_operations',
    access_type: 'field_worker'
  },
  {
    value: 'ironworker',
    label: 'Ironworker',
    permission_group: 'field_operations',
    access_type: 'field_worker'
  },
  {
    value: 'rigger',
    label: 'Rigger',
    permission_group: 'field_operations',
    access_type: 'field_worker'
  },
  {
    value: 'foreman',
    label: 'Foreman',
    permission_group: 'field_leadership',
    access_type: 'field_supervisor'
  },
  {
    value: 'project_engineer',
    label: 'Project Engineer',
    permission_group: 'project_controls',
    access_type: 'project_controls'
  },
  {
    value: 'superintendent',
    label: 'Superintendent',
    permission_group: 'supervisor',
    access_type: 'supervisor'
  },
  {
    value: 'project_manager',
    label: 'Project Manager',
    permission_group: 'supervisor',
    access_type: 'supervisor'
  },
  {
    value: 'administrator',
    label: 'Administrator',
    permission_group: 'admin',
    access_type: 'admin'
  }
]

function emptyForm() {
  return {
    full_name: '',
    company: 'Summit Industrial',
    project_name: 'IREN Childress Data Center',
    department: 'Material Handling',
    role_title: '',
    employee_role: 'pipefitter',
    permission_group: 'field_operations',
    access_type: 'field_worker',
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
    notifications_receiving: false,
    notifications_inventory: false,
    notes: ''
  }
}

function prettyLabel(value) {
  return String(value || '')
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function getRole(value) {
  return ROLE_OPTIONS.find((role) => role.value === value) || ROLE_OPTIONS[3]
}

export default function MyAccount({ lang = 'en' }) {
  const { reloadUser } = useUser()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [userId, setUserId] = useState('')
  const [form, setForm] = useState(emptyForm())

  const selectedRole = useMemo(() => getRole(form.employee_role), [form.employee_role])

  const copy =
    lang === 'es'
      ? {
          loading: 'Cargando cuenta…',
          title: 'Mi cuenta',
          intro: 'Perfil interno para Surplox Industrial, permisos, FMRs, inventario y comunicación del proyecto.',
          personal: 'Información personal',
          employment: 'Empleo / proyecto',
          access: 'Acceso del sistema',
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
          employeeRole: 'Rol del empleado',
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
          inventory: 'Movimientos de inventario',
          permissionGroup: 'Grupo de permisos',
          accessType: 'Tipo de acceso'
        }
      : {
          loading: 'Loading account…',
          title: 'My Account',
          intro: 'Internal profile for Surplox Industrial permissions, FMRs, inventory, and project communication.',
          personal: 'Personal information',
          employment: 'Employment / project',
          access: 'System access',
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
          employeeRole: 'Employee role',
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
          inventory: 'Inventory movements',
          permissionGroup: 'Permission group',
          accessType: 'Access type'
        }

  function setField(key, value) {
    setForm((prev) => ({
      ...prev,
      [key]: value
    }))
  }

  function setEmployeeRole(value) {
    const role = getRole(value)

    setForm((prev) => ({
      ...prev,
      employee_role: role.value,
      role_title: role.label,
      permission_group: role.permission_group,
      access_type: role.access_type,
      notifications_receiving:
        role.permission_group === 'warehouse_operations' ||
        role.permission_group === 'supervisor' ||
        role.permission_group === 'admin',
      notifications_inventory:
        role.permission_group === 'warehouse_operations' ||
        role.permission_group === 'supervisor' ||
        role.permission_group === 'admin' ||
        role.permission_group === 'project_controls'
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
        const role = getRole(data.employee_role || 'pipefitter')

        setForm({
          ...emptyForm(),
          ...data,
          employee_role: role.value,
          role_title: data.role_title || role.label,
          permission_group: data.permission_group || role.permission_group,
          access_type: data.access_type || role.access_type,
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

      const role = getRole(form.employee_role)

      const payload = {
        user_id: userId,
        full_name: form.full_name.trim(),
        company: form.company.trim(),
        project_name: form.project_name.trim(),
        department: form.department.trim(),
        role_title: role.label,
        employee_role: role.value,
        permission_group: role.permission_group,
        access_type: role.access_type,
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
      await reloadUser()
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
          <div className="card-section-title">{copy.personal}</div>

          <div className="grid" style={{ marginTop: 16, gap: 14 }}>
            <Input label={copy.fullName} value={form.full_name} onChange={(value) => setField('full_name', value)} />
            <Input label={copy.phone} value={form.phone} onChange={(value) => setField('phone', value)} />
            <Input label={copy.email} type="email" value={form.email} onChange={(value) => setField('email', value)} />
            <Input label={copy.supervisor} value={form.supervisor} onChange={(value) => setField('supervisor', value)} />
          </div>
        </div>

        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">{copy.employment}</div>

          <div className="grid" style={{ marginTop: 16, gap: 14 }}>
            <Input label={copy.company} value={form.company} onChange={(value) => setField('company', value)} />
            <Input label={copy.project} value={form.project_name} onChange={(value) => setField('project_name', value)} />
            <Input label={copy.department} value={form.department} onChange={(value) => setField('department', value)} />

            <div>
              <label className="muted">{copy.employeeRole}</label>
              <select value={form.employee_role} onChange={(e) => setEmployeeRole(e.target.value)}>
                {ROLE_OPTIONS.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="muted">{copy.shift}</label>
              <select value={form.shift} onChange={(e) => setField('shift', e.target.value)}>
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
              <select value={form.assigned_yard} onChange={(e) => setField('assigned_yard', e.target.value)}>
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

      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="card-section-title">{copy.access}</div>

        <div className="grid two" style={{ marginTop: 16 }}>
          <div className="card-soft">
            <div className="muted">{copy.permissionGroup}</div>
            <div className="h2">{prettyLabel(selectedRole.permission_group)}</div>
          </div>

          <div className="card-soft">
            <div className="muted">{copy.accessType}</div>
            <div className="h2">{prettyLabel(selectedRole.access_type)}</div>
          </div>
        </div>
      </div>

      <div className="grid two" style={{ alignItems: 'start' }}>
        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">{copy.certifications}</div>

          <div className="grid" style={{ marginTop: 16, gap: 12 }}>
            <CheckRow label={copy.forklift} checked={form.forklift_certified} onChange={(value) => setField('forklift_certified', value)} />
            <CheckRow label={copy.telehandler} checked={form.telehandler_certified} onChange={(value) => setField('telehandler_certified', value)} />
            <CheckRow label={copy.rigger} checked={form.rigger} onChange={(value) => setField('rigger', value)} />
            <CheckRow label={copy.pipefitter} checked={form.pipefitter} onChange={(value) => setField('pipefitter', value)} />
          </div>
        </div>

        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">{copy.notifications}</div>

          <div className="grid" style={{ marginTop: 16, gap: 12 }}>
            <CheckRow label={copy.newFmrs} checked={form.notifications_new_fmrs} onChange={(value) => setField('notifications_new_fmrs', value)} />
            <CheckRow label={copy.statusChanges} checked={form.notifications_status_changes} onChange={(value) => setField('notifications_status_changes', value)} />
            <CheckRow label={copy.receiving} checked={form.notifications_receiving} onChange={(value) => setField('notifications_receiving', value)} />
            <CheckRow label={copy.inventory} checked={form.notifications_inventory} onChange={(value) => setField('notifications_inventory', value)} />
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

function Input({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <div>
      <label className="muted">{label}</label>
      <input className="input" type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}

function CheckRow({ label, checked, onChange }) {
  return (
    <label className="form-check">
      <input className="form-check-input" type="checkbox" checked={Boolean(checked)} onChange={(e) => onChange(e.target.checked)} />
      <span className="form-check-label">{label}</span>
    </label>
  )
}