// UPDATED with Active Jobsite Mode
import React, { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function AdminProjectDetail() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [active, setActive] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [id])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('admin_crm_records').select('*').eq('id', id).single()
    setProject(data)
    setActive(!!data?.is_active_job)
    setLoading(false)
  }

  async function startJob() {
    await supabase.from('admin_crm_records').update({
      is_active_job: true,
      job_started_at: new Date().toISOString()
    }).eq('id', id)
    setActive(true)
  }

  async function stopJob() {
    await supabase.from('admin_crm_records').update({
      is_active_job: false
    }).eq('id', id)
    setActive(false)
  }

  if (loading) return <div className="card">Loading...</div>
  if (!project) return <div className="card">Not found</div>

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="card">
        <div className="h1">{project.project}</div>
        <div className="muted">{project.company}</div>

        <div style={{ marginTop: 14 }}>
          {active ? (
            <button className="btn primary" onClick={stopJob}>End Jobsite</button>
          ) : (
            <button className="btn primary" onClick={startJob}>Start Jobsite</button>
          )}
        </div>

        <div style={{ marginTop: 10 }}>
          Status: {active ? 'ACTIVE JOBSITE' : 'Inactive'}
        </div>

        <div style={{ marginTop: 14 }}>
          <Link className="btn" to="/admin/projects">Back</Link>
        </div>
      </div>
    </div>
  )
}
