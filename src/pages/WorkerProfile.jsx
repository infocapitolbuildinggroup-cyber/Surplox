import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useParams, Link } from 'react-router-dom'

function roleLabel(role) {
  const map = {
    laborer: 'Laborer',
    subcontractor: 'Subcontractor',
    contractor: 'Contractor',
    supplier: 'Supplier'
  }
  return map[role] || role || 'Member'
}

function roleBadgeStyle(role) {
  if (role === 'contractor') {
    return {
      color: '#ffde59',
      borderColor: 'rgba(255, 117, 31, 0.55)',
      background: 'rgba(255, 117, 31, 0.12)'
    }
  }

  if (role === 'subcontractor') {
    return {
      color: '#ff751f',
      borderColor: 'rgba(255, 222, 89, 0.55)',
      background: 'rgba(255, 222, 89, 0.12)'
    }
  }

  if (role === 'laborer') {
    return {
      color: '#ffde59',
      borderColor: 'rgba(255, 222, 89, 0.35)',
      background: 'rgba(255, 222, 89, 0.05)'
    }
  }

  if (role === 'supplier') {
    return {
      color: '#ffd6b5',
      borderColor: 'rgba(255, 117, 31, 0.4)',
      background: 'rgba(255, 117, 31, 0.08)'
    }
  }

  return {}
}

function availabilityBadgeStyle(isAvailable) {
  if (!isAvailable) return {}
  return {
    color: '#ff751f',
    borderColor: 'rgba(255, 222, 89, 0.65)',
    background: 'rgba(255, 222, 89, 0.14)'
  }
}

function postTypeLabel(type) {
  if (type === 'need_crew') return '🚧 Need Crew'
  if (type === 'looking_for_work') return '🛠️ Looking for Work'
  return '💬 Discussion'
}

export default function WorkerProfile() {
  const { userId } = useParams()

  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [currentUserId, setCurrentUserId] = useState(null)
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState({
    crewsJoined: 0,
    hiredCount: 0,
    repliesMade: 0,
    networkCount: 0
  })
  const [recentPosts, setRecentPosts] = useState([])
  const [savingAvailability, setSavingAvailability] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setMsg('')

      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const uid = sessionData.session?.user?.id || null
        setCurrentUserId(uid)

        const { data: prof, error: profErr } = await supabase
          .from('profiles')
          .select('user_id, display_name, role, home_zip, travel_radius_miles, is_available')
          .eq('user_id', userId)
          .maybeSingle()

        if (profErr) throw profErr
        if (!prof) throw new Error('Worker profile not found.')

        setProfile(prof)

        const { count: crewsJoinedCount } = await supabase
          .from('user_relationships')
          .select('*', { count: 'exact', head: true })
          .eq('source_user_id', userId)
          .eq('relationship_type', 'joined_crew_post')

        const { count: hiredCount } = await supabase
          .from('user_relationships')
          .select('*', { count: 'exact', head: true })
          .eq('target_user_id', userId)
          .eq('relationship_type', 'hired_from_crew_post')

        const { count: repliesMadeCount } = await supabase
          .from('user_relationships')
          .select('*', { count: 'exact', head: true })
          .eq('source_user_id', userId)
          .eq('relationship_type', 'replied_to_post')

        const { data: outgoingRels } = await supabase
          .from('user_relationships')
          .select('target_user_id')
          .eq('source_user_id', userId)

        const { data: incomingRels } = await supabase
          .from('user_relationships')
          .select('source_user_id')
          .eq('target_user_id', userId)

        const networkIds = new Set([
          ...(outgoingRels || []).map((x) => x.target_user_id).filter(Boolean),
          ...(incomingRels || []).map((x) => x.source_user_id).filter(Boolean)
        ])

        setStats({
          crewsJoined: crewsJoinedCount || 0,
          hiredCount: hiredCount || 0,
          repliesMade: repliesMadeCount || 0,
          networkCount: networkIds.size
        })

        const { data: postsData, error: postsErr } = await supabase
          .from('posts')
          .select('id, title, post_type, created_at, crew_status')
          .eq('author_id', userId)
          .order('created_at', { ascending: false })
          .limit(10)

        if (postsErr) throw postsErr
        setRecentPosts(postsData || [])
      } catch (err) {
        console.error(err)
        setMsg(err.message || 'Unable to load worker profile right now.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [userId])

  async function toggleAvailability() {
    if (!profile || currentUserId !== profile.user_id) return

    try {
      setSavingAvailability(true)
      const nextValue = !profile.is_available

      const { error } = await supabase
        .from('profiles')
        .update({ is_available: nextValue })
        .eq('user_id', profile.user_id)

      if (error) throw error

      setProfile((prev) => ({ ...prev, is_available: nextValue }))
    } catch (err) {
      console.error(err)
      setMsg(err.message || 'Unable to update availability.')
    } finally {
      setSavingAvailability(false)
    }
  }

  if (loading) {
    return <div className="card">Loading worker profile…</div>
  }

  if (!profile) {
    return <div className="card card-message">{msg || 'Worker profile not found.'}</div>
  }

  const isOwnProfile = currentUserId === profile.user_id

  return (
    <div className="grid" style={{ gap: 12 }}>
      <div className="card">
        <div className="postMeta" style={{ marginBottom: 10 }}>
          <span className="badge" style={roleBadgeStyle(profile.role)}>
            {roleLabel(profile.role)}
          </span>

          {profile.is_available ? (
            <span className="badge" style={availabilityBadgeStyle(true)}>
              Available for Work
            </span>
          ) : (
            <span className="badge">Not Marked Available</span>
          )}
        </div>

        <div className="h1" style={{ marginTop: 0 }}>{profile.display_name || 'Unknown Member'}</div>

        <div className="grid two" style={{ marginTop: 10 }}>
          <div className="card card-soft">
            <div className="card-section-title" style={{ fontSize: 15 }}>Home ZIP</div>
            <div className="muted" style={{ marginTop: 6 }}>{profile.home_zip || 'Not set'}</div>
          </div>

          <div className="card card-soft">
            <div className="card-section-title" style={{ fontSize: 15 }}>Travel Radius</div>
            <div className="muted" style={{ marginTop: 6 }}>
              {profile.travel_radius_miles ? `${profile.travel_radius_miles} miles` : 'Not set'}
            </div>
          </div>
        </div>

        {isOwnProfile ? (
          <div style={{ marginTop: 12 }}>
            <button className="btn primary" onClick={toggleAvailability} disabled={savingAvailability}>
              {savingAvailability
                ? 'Saving…'
                : profile.is_available
                  ? 'Turn Off Availability'
                  : 'Mark Available for Work'}
            </button>
          </div>
        ) : null}
      </div>

      <div className="card">
        <div className="card-section-title">Reputation Graph</div>
        <p className="card-section-subtitle">
          These stats build from crew joins, hires, replies, and network connections.
        </p>

        <div className="grid two" style={{ marginTop: 12 }}>
          <div className="card card-soft">
            <div className="card-section-title" style={{ fontSize: 15 }}>Crews Joined</div>
            <div className="h1" style={{ fontSize: 28, margin: '8px 0 0' }}>{stats.crewsJoined}</div>
          </div>

          <div className="card card-soft">
            <div className="card-section-title" style={{ fontSize: 15 }}>Marked Hired</div>
            <div className="h1" style={{ fontSize: 28, margin: '8px 0 0' }}>{stats.hiredCount}</div>
          </div>

          <div className="card card-soft">
            <div className="card-section-title" style={{ fontSize: 15 }}>Replies Made</div>
            <div className="h1" style={{ fontSize: 28, margin: '8px 0 0' }}>{stats.repliesMade}</div>
          </div>

          <div className="card card-soft">
            <div className="card-section-title" style={{ fontSize: 15 }}>Network Connections</div>
            <div className="h1" style={{ fontSize: 28, margin: '8px 0 0' }}>{stats.networkCount}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-section-title">Recent Activity</div>
        <p className="card-section-subtitle">
          Most recent posts from this worker profile.
        </p>

        {recentPosts.length === 0 ? (
          <div className="card card-soft" style={{ marginTop: 12 }}>
            <div className="muted">No recent posts yet.</div>
          </div>
        ) : (
          <div className="list" style={{ marginTop: 12 }}>
            {recentPosts.map((post) => (
              <Link key={post.id} to={`/p/${post.id}`} className="card card-soft">
                <div className="postMeta">
                  <span className="badge">{postTypeLabel(post.post_type)}</span>
                  {post.post_type === 'need_crew' ? (
                    <span className="badge">{post.crew_status || 'open'}</span>
                  ) : null}
                  <span>{new Date(post.created_at).toLocaleString()}</span>
                </div>

                <div className="postTitle" style={{ marginTop: 8 }}>
                  {post.title}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {msg ? <div className="card card-message">{msg}</div> : null}
    </div>
  )
}