import React, { useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate, useSearchParams } from 'react-router-dom'

const ROLE_OPTIONS = [
  { value: 'warehouse_hand', label: 'Warehouse Hand', group: 'Warehouse Operations', permission_group: 'warehouse_operations', access_type: 'warehouse_worker' },
  { value: 'warehouse_lead', label: 'Warehouse Lead', group: 'Warehouse Operations', permission_group: 'warehouse_operations', access_type: 'warehouse_worker' },
  { value: 'warehouse_supervisor', label: 'Warehouse Supervisor', group: 'Warehouse Operations', permission_group: 'supervisor', access_type: 'supervisor' },
  { value: 'receiving_clerk', label: 'Receiving Clerk', group: 'Warehouse Operations', permission_group: 'warehouse_operations', access_type: 'warehouse_worker' },
  { value: 'inventory_manager', label: 'Inventory Manager', group: 'Warehouse Operations', permission_group: 'supervisor', access_type: 'supervisor' },
  { value: 'material_coordinator', label: 'Material Coordinator', group: 'Warehouse Operations', permission_group: 'warehouse_operations', access_type: 'warehouse_worker' },
  { value: 'pipefitter', label: 'Pipefitter', group: 'Field Operations', permission_group: 'field_operations', access_type: 'field_worker' },
  { value: 'welder', label: 'Welder', group: 'Field Operations', permission_group: 'field_operations', access_type: 'field_worker' },
  { value: 'electrician', label: 'Electrician', group: 'Field Operations', permission_group: 'field_operations', access_type: 'field_worker' },
  { value: 'instrumentation', label: 'Instrumentation', group: 'Field Operations', permission_group: 'field_operations', access_type: 'field_worker' },
  { value: 'civil', label: 'Civil', group: 'Field Operations', permission_group: 'field_operations', access_type: 'field_worker' },
  { value: 'hvac', label: 'HVAC', group: 'Field Operations', permission_group: 'field_operations', access_type: 'field_worker' },
  { value: 'millwright', label: 'Millwright', group: 'Field Operations', permission_group: 'field_operations', access_type: 'field_worker' },
  { value: 'foreman', label: 'Foreman', group: 'Field Leadership', permission_group: 'field_leadership', access_type: 'field_supervisor' },
  { value: 'general_foreman', label: 'General Foreman', group: 'Field Leadership', permission_group: 'field_leadership', access_type: 'field_supervisor' },
  { value: 'superintendent', label: 'Superintendent', group: 'Field Leadership', permission_group: 'supervisor', access_type: 'supervisor' },
  { value: 'project_engineer', label: 'Project Engineer', group: 'Project Controls', permission_group: 'project_controls', access_type: 'project_controls' },
  { value: 'purchasing', label: 'Purchasing', group: 'Project Controls', permission_group: 'project_controls', access_type: 'project_controls' },
  { value: 'project_manager', label: 'Project Manager', group: 'Administration', permission_group: 'supervisor', access_type: 'supervisor' },
  { value: 'administrator', label: 'Administrator', group: 'Administration', permission_group: 'admin', access_type: 'admin' }
]

function normalizeMode(value) {
  return value === 'signup' ? 'signup' : 'signin'
}

function roleByValue(value) {
  return ROLE_OPTIONS.find((role) => role.value === value) || ROLE_OPTIONS[6]
}

function groupedRoles() {
  return ROLE_OPTIONS.reduce((acc, role) => {
    if (!acc[role.group]) acc[role.group] = []
    acc[role.group].push(role)
    return acc
  }, {})
}

export default function Auth() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [mode, setMode] = useState(normalizeMode(searchParams.get('mode')))
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const [signInForm, setSignInForm] = useState({
    email: '',
    password: ''
  })

  const [signUpForm, setSignUpForm] = useState({
    full_name: '',
    email: '',
    password: '',
    company: 'Summit Industrial',
    project_name: 'IREN Childress Data Center',
    department: 'Material Handling',
    employee_role: 'pipefitter',
    shift: '',
    phone: ''
  })

  const groups = useMemo(() => groupedRoles(), [])

  function switchMode(nextMode) {
    const normalized = normalizeMode(nextMode)
    setMode(normalized)
    setMsg('')
    setSearchParams({ mode: normalized })
  }

  function updateSignInField(key, value) {
    setSignInForm((prev) => ({ ...prev, [key]: value }))
  }

  function updateSignUpField(key, value) {
    setSignUpForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSignIn(event) {
    event.preventDefault()
    setLoading(true)
    setMsg('')

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: String(signInForm.email || '').trim().toLowerCase(),
        password: signInForm.password
      })

      if (error) throw error

      navigate('/yard', { replace: true })
    } catch (error) {
      console.error(error)
      setMsg(error?.message || 'Unable to sign in.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSignUp(event) {
    event.preventDefault()
    setLoading(true)
    setMsg('')

    try {
      const fullName = String(signUpForm.full_name || '').trim()
      const email = String(signUpForm.email || '').trim().toLowerCase()
      const password = String(signUpForm.password || '')
      const selectedRole = roleByValue(signUpForm.employee_role)

      if (!fullName) throw new Error('Enter your full name.')
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email.')
      if (password.length < 6) throw new Error('Password must be at least 6 characters.')

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            employee_role: selectedRole.value
          }
        }
      })

      if (signUpError) throw signUpError

      const userId = authData.user?.id
      if (!userId) throw new Error('Unable to create user account.')

      const { error: profileError } = await supabase
        .from('industrial_user_profiles')
        .upsert(
          {
            user_id: userId,
            full_name: fullName,
            email,
            phone: String(signUpForm.phone || '').trim(),
            company: String(signUpForm.company || '').trim() || 'Summit Industrial',
            project_name: String(signUpForm.project_name || '').trim() || 'IREN Childress Data Center',
            department: String(signUpForm.department || '').trim() || 'Material Handling',
            role_title: selectedRole.label,
            employee_role: selectedRole.value,
            permission_group: selectedRole.permission_group,
            access_type: selectedRole.access_type,
            shift: String(signUpForm.shift || '').trim(),
            assigned_yard: '',
            forklift_certified: false,
            telehandler_certified: false,
            rigger: false,
            pipefitter: selectedRole.value === 'pipefitter',
            notifications_new_fmrs: true,
            notifications_status_changes: true,
            notifications_receiving:
              selectedRole.permission_group === 'warehouse_operations' ||
              selectedRole.permission_group === 'supervisor' ||
              selectedRole.permission_group === 'admin',
            notifications_inventory:
              selectedRole.permission_group === 'warehouse_operations' ||
              selectedRole.permission_group === 'supervisor' ||
              selectedRole.permission_group === 'admin' ||
              selectedRole.permission_group === 'project_controls',
            notes: ''
          },
          { onConflict: 'user_id' }
        )

      if (profileError) throw profileError

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError) throw signInError

      navigate('/yard', { replace: true })
    } catch (error) {
      console.error(error)
      setMsg(error?.message || 'Unable to create account.')
    } finally {
      setLoading(false)
    }
  }

  if (mode === 'signin') {
    return (
      <div className="grid two" style={{ alignItems: 'stretch', gap: 18 }}>
        <div className="card rounded-xl" style={{ padding: 24 }}>
          <div className="badge" style={{ marginBottom: 12, background: '#f1e7a8' }}>
            Surplox Industrial
          </div>

          <div className="h1">Sign in to Yard Manager</div>

          <p className="muted" style={{ marginTop: 10, lineHeight: 1.7 }}>
            Access digital FMRs, warehouse inventory, receiving, field deliveries, returns, damaged material tracking, plant locations, and team communication.
          </p>

          <form onSubmit={handleSignIn} className="grid" style={{ marginTop: 18, gap: 14 }}>
            <div>
              <div className="muted" style={{ marginBottom: 6 }}>Email</div>
              <input
                className="input"
                type="email"
                value={signInForm.email}
                placeholder="you@email.com"
                onChange={(e) => updateSignInField('email', e.target.value)}
              />
            </div>

            <div>
              <div className="muted" style={{ marginBottom: 6 }}>Password</div>
              <input
                className="input"
                type="password"
                value={signInForm.password}
                placeholder="Password"
                onChange={(e) => updateSignInField('password', e.target.value)}
              />
            </div>

            {msg ? <div className="card-soft">{msg}</div> : null}

            <button className="btn primary" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>

            <button className="btn" type="button" onClick={() => switchMode('signup')} disabled={loading}>
              Need access? Create account
            </button>
          </form>
        </div>

        <div className="card rounded-xl" style={{ padding: 24, background: '#fffaf0' }}>
          <div className="badge" style={{ marginBottom: 12 }}>
            Industrial Material Management
          </div>

          <div className="h1">Modern material control for industrial construction.</div>

          <p className="muted" style={{ marginTop: 10, lineHeight: 1.75 }}>
            Surplox Industrial helps material yards move from paper FMRs, scattered calls, and manual tracking into one live operating system for warehouse and field teams.
          </p>

          <div className="grid two" style={{ marginTop: 18 }}>
            <div className="card-soft">Digital Field Material Requests</div>
            <div className="card-soft">Warehouse Inventory</div>
            <div className="card-soft">Vendor Receiving</div>
            <div className="card-soft">Issue / Return Tracking</div>
            <div className="card-soft">Damaged Material Reports</div>
            <div className="card-soft">Plant Location Directory</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid two" style={{ alignItems: 'start', gap: 18 }}>
      <form onSubmit={handleSignUp} className="card rounded-xl grid" style={{ padding: 24, gap: 14 }}>
        <div>
          <div className="badge" style={{ marginBottom: 12, background: '#f1e7a8' }}>
            Surplox Industrial Access
          </div>

          <div className="h1">Create Your Yard Manager Account</div>

          <p className="muted" style={{ marginTop: 10, lineHeight: 1.7 }}>
            Select your project role so the app shows the correct tools. Field workers can request and track material. Warehouse users can manage FMRs, receiving, inventory, returns, and damaged material.
          </p>
        </div>

        <div>
          <div className="muted" style={{ marginBottom: 6 }}>Full Name</div>
          <input
            className="input"
            value={signUpForm.full_name}
            placeholder="David Gonzalez"
            onChange={(e) => updateSignUpField('full_name', e.target.value)}
          />
        </div>

        <div className="grid two">
          <div>
            <div className="muted" style={{ marginBottom: 6 }}>Company</div>
            <input
              className="input"
              value={signUpForm.company}
              onChange={(e) => updateSignUpField('company', e.target.value)}
            />
          </div>

          <div>
            <div className="muted" style={{ marginBottom: 6 }}>Project</div>
            <input
              className="input"
              value={signUpForm.project_name}
              onChange={(e) => updateSignUpField('project_name', e.target.value)}
            />
          </div>
        </div>

        <div className="grid two">
          <div>
            <div className="muted" style={{ marginBottom: 6 }}>Department</div>
            <input
              className="input"
              value={signUpForm.department}
              onChange={(e) => updateSignUpField('department', e.target.value)}
            />
          </div>

          <div>
            <div className="muted" style={{ marginBottom: 6 }}>Shift</div>
            <select
              className="input"
              value={signUpForm.shift}
              onChange={(e) => updateSignUpField('shift', e.target.value)}
            >
              <option value=""></option>
              <option value="Day Shift">Day Shift</option>
              <option value="Night Shift">Night Shift</option>
              <option value="Swing Shift">Swing Shift</option>
              <option value="Rotating">Rotating</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <div className="muted" style={{ marginBottom: 6 }}>Employee Role</div>
          <select
            className="input"
            value={signUpForm.employee_role}
            onChange={(e) => updateSignUpField('employee_role', e.target.value)}
          >
            {Object.entries(groups).map(([group, roles]) => (
              <optgroup key={group} label={group}>
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="grid two">
          <div>
            <div className="muted" style={{ marginBottom: 6 }}>Phone</div>
            <input
              className="input"
              value={signUpForm.phone}
              placeholder="Optional"
              onChange={(e) => updateSignUpField('phone', e.target.value)}
            />
          </div>

          <div>
            <div className="muted" style={{ marginBottom: 6 }}>Email</div>
            <input
              className="input"
              type="email"
              value={signUpForm.email}
              placeholder="you@email.com"
              onChange={(e) => updateSignUpField('email', e.target.value)}
            />
          </div>
        </div>

        <div>
          <div className="muted" style={{ marginBottom: 6 }}>Password</div>
          <input
            className="input"
            type="password"
            value={signUpForm.password}
            placeholder="Create a password"
            onChange={(e) => updateSignUpField('password', e.target.value)}
          />
        </div>

        {msg ? <div className="card-soft">{msg}</div> : null}

        <button className="btn primary" type="submit" disabled={loading}>
          {loading ? 'Creating account…' : 'Create Account'}
        </button>

        <button className="btn" type="button" onClick={() => switchMode('signin')} disabled={loading}>
          Already have an account? Sign in
        </button>
      </form>

      <div className="grid" style={{ gap: 18 }}>
        <div className="card rounded-xl" style={{ padding: 24, background: '#fffaf0' }}>
          <div className="badge" style={{ marginBottom: 12 }}>
            Role-Based Access
          </div>

          <div className="h1">Every user sees only what they need.</div>

          <p className="muted" style={{ marginTop: 10, lineHeight: 1.75 }}>
            Warehouse workers see inventory, receiving, field delivery, returns, and damaged material. Field users only see material requests, request status, plant locations, and communication.
          </p>
        </div>

        <div className="card rounded-xl" style={{ padding: 24 }}>
          <div className="card-section-title">Built for the material yard</div>

          <div className="grid" style={{ marginTop: 14, gap: 10 }}>
            <div className="card-soft">Replace paper FMR tracking</div>
            <div className="card-soft">Reduce duplicate picking and missed requests</div>
            <div className="card-soft">Keep inventory counts away from field over-ordering</div>
            <div className="card-soft">Track receiving from vendor delivery to inventory</div>
            <div className="card-soft">Document returns and damaged materials</div>
          </div>
        </div>
      </div>
    </div>
  )
}