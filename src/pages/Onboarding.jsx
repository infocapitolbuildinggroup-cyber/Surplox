import React, { useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'

const ROLE_OPTIONS = [
  { value: 'warehouse_hand', label: 'Warehouse Hand', department: 'Warehouse', permission_group: 'warehouse_operations', access_type: 'warehouse_worker' },
  { value: 'warehouse_lead', label: 'Warehouse Lead', department: 'Warehouse', permission_group: 'warehouse_operations', access_type: 'warehouse_worker' },
  { value: 'receiving_clerk', label: 'Receiving Clerk', department: 'Receiving', permission_group: 'warehouse_operations', access_type: 'warehouse_worker' },
  { value: 'inventory_manager', label: 'Inventory Manager', department: 'Warehouse', permission_group: 'supervisor', access_type: 'supervisor' },
  { value: 'warehouse_supervisor', label: 'Warehouse Supervisor', department: 'Warehouse', permission_group: 'supervisor', access_type: 'supervisor' },
  { value: 'pipefitter', label: 'Pipefitter', department: 'Field Operations', permission_group: 'field_operations', access_type: 'field_worker' },
  { value: 'welder', label: 'Welder', department: 'Field Operations', permission_group: 'field_operations', access_type: 'field_worker' },
  { value: 'electrician', label: 'Electrician', department: 'Field Operations', permission_group: 'field_operations', access_type: 'field_worker' },
  { value: 'ironworker', label: 'Ironworker', department: 'Field Operations', permission_group: 'field_operations', access_type: 'field_worker' },
  { value: 'millwright', label: 'Millwright', department: 'Field Operations', permission_group: 'field_operations', access_type: 'field_worker' },
  { value: 'instrumentation', label: 'Instrumentation', department: 'Field Operations', permission_group: 'field_operations', access_type: 'field_worker' },
  { value: 'civil', label: 'Civil', department: 'Field Operations', permission_group: 'field_operations', access_type: 'field_worker' },
  { value: 'foreman', label: 'Foreman', department: 'Field Leadership', permission_group: 'field_leadership', access_type: 'field_supervisor' },
  { value: 'general_foreman', label: 'General Foreman', department: 'Field Leadership', permission_group: 'field_leadership', access_type: 'field_supervisor' },
  { value: 'superintendent', label: 'Superintendent', department: 'Field Leadership', permission_group: 'supervisor', access_type: 'supervisor' },
  { value: 'project_engineer', label: 'Project Engineer', department: 'Project Controls', permission_group: 'project_controls', access_type: 'project_controls' },
  { value: 'purchasing', label: 'Purchasing', department: 'Project Controls', permission_group: 'project_controls', access_type: 'project_controls' },
  { value: 'project_manager', label: 'Project Manager', department: 'Administration', permission_group: 'supervisor', access_type: 'supervisor' },
  { value: 'administrator', label: 'Administrator', department: 'Administration', permission_group: 'admin', access_type: 'admin' }
]

const DEPARTMENTS = ['Warehouse', 'Receiving', 'Field Operations', 'Field Leadership', 'Project Controls', 'Administration']
const SHIFTS = ['Day Shift', 'Night Shift', 'Swing Shift', 'Rotating', 'Other']
const YARDS = ['Warehouse / Main Yard', 'Mexico', 'Oklahoma Yard', 'Stainless Tent', 'Receiving Gate', 'Field / Plant']

function getRole(value) {
  return ROLE_OPTIONS.find((role) => role.value === value) || ROLE_OPTIONS[5]
}

export default function Onboarding() {
  const navigate = useNavigate()
  const { user, reloadUser } = useUser()

  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const [form, setForm] = useState({
    full_name: '',
    company: 'Summit Industrial',
    project_name: 'IREN Childress Data Center',
    department: 'Field Operations',
    employee_role: 'pipefitter',
    shift: '',
    assigned_yard: '',
    phone: '',
    email: user?.email || '',
    supervisor: '',
    forklift_certified: false,
    telehandler_certified: false,
    rigger: false,
    pipefitter: false,
    osha_certified: false,
    nccer_certified: false,
    twic: false,
    msha: false,
    notes: ''
  })

  const filteredRoles = useMemo(() => {
    return ROLE_OPTIONS.filter((role) => role.department === form.department)
  }, [form.department])

  const selectedRole = getRole(form.employee_role)

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function setDepartment(value) {
    const firstRole = ROLE_OPTIONS.find((role) => role.department === value) || ROLE_OPTIONS[5]

    setForm((prev) => ({
      ...prev,
      department: value,
      employee_role: firstRole.value
    }))
  }

  async function saveOnboarding() {
    setSaving(true)
    setMsg('')

    try {
      if (!user?.id) throw new Error('You must be signed in.')
      if (!form.full_name.trim()) throw new Error('Enter your full name.')

      const role = getRole(form.employee_role)

      const payload = {
        user_id: user.id,
        full_name: form.full_name.trim(),
        company: form.company.trim(),
        project_name: form.project_name.trim(),
        department: form.department,
        role_title: role.label,
        employee_role: role.value,
        permission_group: role.permission_group,
        access_type: role.access_type,
        shift: form.shift,
        assigned_yard: form.assigned_yard,
        phone: form.phone.trim(),
        email: form.email.trim(),
        supervisor: form.supervisor.trim(),
        forklift_certified: Boolean(form.forklift_certified),
        telehandler_certified: Boolean(form.telehandler_certified),
        rigger: Boolean(form.rigger),
        pipefitter: Boolean(form.pipefitter || role.value === 'pipefitter'),
        notifications_new_fmrs: true,
        notifications_status_changes: true,
        notifications_receiving:
          role.permission_group === 'warehouse_operations' ||
          role.permission_group === 'supervisor' ||
          role.permission_group === 'admin',
        notifications_inventory:
          role.permission_group === 'warehouse_operations' ||
          role.permission_group === 'supervisor' ||
          role.permission_group === 'admin' ||
          role.permission_group === 'project_controls',
        notes: [
          form.notes.trim(),
          form.osha_certified ? 'OSHA certified' : '',
          form.nccer_certified ? 'NCCER certified' : '',
          form.twic ? 'TWIC' : '',
          form.msha ? 'MSHA' : ''
        ]
          .filter(Boolean)
          .join(' | ')
      }

      const { error } = await supabase
        .from('industrial_user_profiles')
        .upsert(payload, { onConflict: 'user_id' })

      if (error) throw error

      await reloadUser()
      navigate('/yard', { replace: true })
    } catch (error) {
      console.error(error)
      setMsg(error?.message || 'Unable to finish onboarding.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="card rounded-xl" style={{ padding: 28, background: 'linear-gradient(180deg, #fff7cf 0%, #ffffff 100%)' }}>
        <div className="badge" style={{ marginBottom: 14, background: '#f1e7a8' }}>
          Surplox Industrial Setup
        </div>

        <div className="h1">Configure your project access.</div>

        <p className="muted" style={{ marginTop: 10, lineHeight: 1.75, maxWidth: 900 }}>
          Set up your account for the current project. Your role controls which Yard Manager tools you can access.
        </p>
      </div>

      {msg ? <div className="card-soft" style={{ background: '#fff4da' }}>{msg}</div> : null}

      <div className="grid two" style={{ alignItems: 'start' }}>
        <div className="card rounded-xl grid" style={{ padding: 24, gap: 14 }}>
          <div className="card-section-title">Personal Information</div>

          <Input label="Full Name" value={form.full_name} onChange={(value) => setField('full_name', value)} />
          <Input label="Phone" value={form.phone} onChange={(value) => setField('phone', value)} />
          <Input label="Email" type="email" value={form.email} onChange={(value) => setField('email', value)} />
          <Input label="Supervisor" value={form.supervisor} onChange={(value) => setField('supervisor', value)} />
        </div>

        <div className="card rounded-xl grid" style={{ padding: 24, gap: 14 }}>
          <div className="card-section-title">Project Assignment</div>

          <Input label="Company" value={form.company} onChange={(value) => setField('company', value)} />
          <Input label="Project" value={form.project_name} onChange={(value) => setField('project_name', value)} />

          <div>
            <label className="muted">Department</label>
            <select value={form.department} onChange={(e) => setDepartment(e.target.value)}>
              {DEPARTMENTS.map((department) => (
                <option key={department} value={department}>{department}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="muted">Role</label>
            <select value={form.employee_role} onChange={(e) => setField('employee_role', e.target.value)}>
              {filteredRoles.map((role) => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="muted">Shift</label>
            <select value={form.shift} onChange={(e) => setField('shift', e.target.value)}>
              <option value=""></option>
              {SHIFTS.map((shift) => (
                <option key={shift} value={shift}>{shift}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="muted">Assigned Yard / Area</label>
            <select value={form.assigned_yard} onChange={(e) => setField('assigned_yard', e.target.value)}>
              <option value=""></option>
              {YARDS.map((yard) => (
                <option key={yard} value={yard}>{yard}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid two" style={{ alignItems: 'start' }}>
        <div className="card rounded-xl" style={{ padding: 24 }}>
          <div className="card-section-title">Certifications / Capabilities</div>

          <div className="grid" style={{ gap: 12, marginTop: 14 }}>
            <CheckRow label="Forklift Certified" checked={form.forklift_certified} onChange={(value) => setField('forklift_certified', value)} />
            <CheckRow label="Telehandler Certified" checked={form.telehandler_certified} onChange={(value) => setField('telehandler_certified', value)} />
            <CheckRow label="Rigger" checked={form.rigger} onChange={(value) => setField('rigger', value)} />
            <CheckRow label="Pipefitter" checked={form.pipefitter} onChange={(value) => setField('pipefitter', value)} />
            <CheckRow label="OSHA Certified" checked={form.osha_certified} onChange={(value) => setField('osha_certified', value)} />
            <CheckRow label="NCCER Certified" checked={form.nccer_certified} onChange={(value) => setField('nccer_certified', value)} />
            <CheckRow label="TWIC" checked={form.twic} onChange={(value) => setField('twic', value)} />
            <CheckRow label="MSHA" checked={form.msha} onChange={(value) => setField('msha', value)} />
          </div>
        </div>

        <div className="card rounded-xl" style={{ padding: 24 }}>
          <div className="card-section-title">Access Summary</div>

          <div className="grid" style={{ gap: 12, marginTop: 14 }}>
            <SummaryRow label="Role" value={selectedRole.label} />
            <SummaryRow label="Permission Group" value={selectedRole.permission_group} />
            <SummaryRow label="Access Type" value={selectedRole.access_type} />
            <SummaryRow label="Project" value={form.project_name} />
            <SummaryRow label="Shift" value={form.shift || 'Not selected'} />
            <SummaryRow label="Assigned Yard" value={form.assigned_yard || 'Not selected'} />
          </div>

          <textarea
            className="input"
            style={{ marginTop: 14 }}
            value={form.notes}
            onChange={(e) => setField('notes', e.target.value)}
            placeholder="Notes, responsibilities, special access, or project comments..."
          />
        </div>
      </div>

      <div className="card surface-dark rounded-xl" style={{ padding: 28 }}>
        <div className="h1" style={{ color: '#ffffff' }}>
          Ready to begin.
        </div>

        <p style={{ marginTop: 10, color: 'rgba(255,255,255,0.82)', lineHeight: 1.75 }}>
          {form.full_name || 'Your account'} will enter as {selectedRole.label} for {form.project_name}.
        </p>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
          <button className="btn primary" type="button" onClick={saveOnboarding} disabled={saving}>
            {saving ? 'Saving…' : 'Enter Yard Manager'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Input({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="muted">{label}</label>
      <input className="input" type={type} value={value} onChange={(e) => onChange(e.target.value)} />
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

function SummaryRow({ label, value }) {
  return (
    <div className="card-soft">
      <div className="muted">{label}</div>
      <div style={{ fontWeight: 900 }}>{value}</div>
    </div>
  )
}