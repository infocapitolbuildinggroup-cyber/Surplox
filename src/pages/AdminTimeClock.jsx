// UPDATED with Active Jobsite Awareness
import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function AdminTimeClock() {
  const [activeJob, setActiveJob] = useState(null)
  const [entries, setEntries] = useState([])

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data: active } = await supabase
      .from('admin_crm_records')
      .select('*')
      .eq('is_active_job', true)
      .single()

    const { data: time } = await supabase
      .from('admin_time_entries')
      .select('*')
      .order('clock_in_at', { ascending: false })

    setActiveJob(active)
    setEntries(time || [])
  }

  return (
    <div className="grid" style={{ gap: 18 }}>
      {activeJob && (
        <div className="card">
          <div className="badge">ACTIVE JOBSITE</div>
          <div className="h1">{activeJob.project}</div>
        </div>
      )}

      <div className="card">
        <div className="h1">Time Entries</div>
        {entries.map((e) => (
          <div key={e.id} className="card-soft">
            {e.worker} - {e.jobsite}
          </div>
        ))}
      </div>
    </div>
  )
}
