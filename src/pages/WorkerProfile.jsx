import React, { useEffect, useMemo, useState } from 'react'
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
  if (role === 'contractor') return { background: '#111111', color: '#ffffff' }
  if (role === 'subcontractor') return { background: '#fff0b4', color: '#111111' }
  if (role === 'laborer') return { background: '#ecebe3', color: '#111111' }
  if (role === 'supplier') return { background: '#ffd7b0', color: '#111111' }
  return {}
}

function availabilityBadgeStyle(isAvailable) {
  if (!isAvailable) return {}
  return { background: '#dcf4e5', color: '#177245' }
}

function postTypeLabel(type) {
  if (type === 'need_crew') return '🚧 Need Crew'
  if (type === 'looking_for_work') return '🛠️ Looking for Work'
  return '💬 Discussion'
}

function relationshipLabel(type) {
  if (type === 'hired_from_crew_post') return 'Marked Hired'
  if (type === 'joined_crew_post') return 'Joined Crew'
  if (type === 'replied_to_post') return 'Replied to Post'
  return 'Connected'
}

function StatCard({ label, value, dark = false }) {
  return (
    <div
      className={dark ? 'card surface-dark rounded-xl' : 'card-soft'}
      style={{ minHeight: 112, padding: 18 }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: dark ? 'rgba(255,255,255,0.72)' : 'var(--muted-soft)'
        }}
      >
        {label}
      </div>
      <div style={{ marginTop: 10, fontSize: 30, fontWeight: 900, lineHeight: 1 }}>
        {value}
      </div>
    </div>
  )
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
  const [workedWith, setWorkedWith] = useState([])
  const [copyMsg, setCopyMsg] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setMsg('')
      setCopyMsg('')

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
          .select('source_user_id, target_user_id, relationship_type, post_id, created_at')
          .eq('source_user_id', userId)

        const { data: incomingRels } = await supabase
          .from('user_relationships')
          .select('source_user_id, target_user_id, relationship_type, post_id, created_at')
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

        const allRels = [...(outgoingRels || []), ...(incomingRels || [])]
        const counterpartIds = Array.from(
          new Set(
            allRels
              .map((rel) => {
                if (rel.source_user_id === userId) return rel.target_user_id
                if (rel.target_user_id === userId) return rel.source_user_id
                return null
              })
              .filter(Boolean)
          )
        )

        let workedProfiles = []
        if (counterpartIds.length > 0) {
          const { data: wp, error: wpErr } = await supabase
            .from('profiles')
            .select('user_id, display_name, role, is_available')
            .in('user_id', counterpartIds)

          if (wpErr) throw wpErr
          workedProfiles = wp || []
        }

        const profileMap = new Map(workedProfiles.map((p) => [p.user_id, p]))

        const grouped = counterpartIds.map((counterpartId) => {
          const rels = allRels.filter((rel) => {
            return (
              (rel.source_user_id === userId && rel.target_user_id === counterpartId) ||
              (rel.target_user_id === userId && rel.source_user_id === counterpartId)
            )
          })

          const latest = rels
            .slice()
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]

          return {
            ...(profileMap.get(counterpartId) || {
              user_id: counterpartId,
              display_name: 'Unknown Member',
              role: '',
              is_available: false
            }),
            connection_count: rels.length,
            latest_type: latest?.relationship_type || '',
            latest_post_id: latest?.post_id || '',
            last_seen_at: latest?.created_at || null
          }
        })

        setWorkedWith(
          grouped.sort((a, b) => {
            return (b.connection_count || 0) - (a.connection_count || 0)
          })
        )

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

  async function copyProfileInvite() {
    try {
      const url = `${window.location.origin}/u/${userId}`
      await navigator.clipboard.writeText(url)
      setCopyMsg('Profile link copied.')
    } catch (err) {
      console.error(err)
      setCopyMsg('Unable to copy profile link.')
    }
  }

  const isOwnProfile = useMemo(() => currentUserId === profile?.user_id, [currentUserId, profile])

  if (loading) {
    return <div className="card">Loading worker profile…</div>
  }

  if (!profile) {
    return <div className="card card-message">{msg || 'Worker profile not found.'}</div>
  }

  return (
    <div className="grid" style={{ gap: 18 }}>
      {msg ? (
        <div className="card-message" style={{ padding: 14, borderRadius: 18 }}>
          {msg}
        </div>
      ) : null}

      <div
        className="card rounded-xl"
        style={{
          padding: 28,
          background: 'linear-gradient(180deg, #fff7c8 0%, #f7f7f2 100%)'
        }}
      >
        <div className="badge" style={{ marginBottom: 14, background: '#f1e7a8' }}>
          Worker profile
        </div>

        <div className="postMeta" style={{ marginBottom: 12 }}>
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

        <div className="h1" style={{ marginTop: 0 }}>
          {profile.display_name || 'Unknown Member'}
        </div>

        <p className="muted" style={{ marginTop: 10, maxWidth: 760, fontSize: 17, lineHeight: 1.7 }}>
          A cleaner reputation-first Surplox profile view built for rehiring, crew decisions, and trusted repeat connections.
        </p>

        <div className="grid two" style={{ marginTop: 18 }}>
          <div className="card-soft">
            <div className="card-section-title" style={{ fontSize: 15 }}>Home ZIP</div>
            <div className="muted" style={{ marginTop: 6 }}>{profile.home_zip || 'Not set'}</div>
          </div>

          <div className="card-soft">
            <div className="card-section-title" style={{ fontSize: 15 }}>Travel Radius</div>
            <div className="muted" style={{ marginTop: 6 }}>
              {profile.travel_radius_miles ? `${profile.travel_radius_miles} miles` : 'Not set'}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {isOwnProfile ? (
            <button className="btn primary" onClick={toggleAvailability} disabled={savingAvailability}>
              {savingAvailability
                ? 'Saving…'
                : profile.is_available
                  ? 'Turn Off Availability'
                  : 'Mark Available for Work'}
            </button>
          ) : null}

          <button className="btn" onClick={copyProfileInvite}>
            Rehire / Share Profile
          </button>
        </div>

        {copyMsg ? (
          <div className="card-soft" style={{ marginTop: 14 }}>
            {copyMsg}
          </div>
        ) : null}
      </div>

      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="card-section-title">Reputation Graph</div>
        <p className="card-section-subtitle" style={{ marginTop: 8 }}>
          These stats build from crew joins, hires, replies, and network connections.
        </p>

        <div className="grid two" style={{ marginTop: 14 }}>
          <StatCard label="Crews Joined" value={stats.crewsJoined} dark />
          <StatCard label="Marked Hired" value={stats.hiredCount} />
          <StatCard label="Replies Made" value={stats.repliesMade} />
          <StatCard label="Network Connections" value={stats.networkCount} />
        </div>
      </div>

      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="card-section-title">Worked With</div>
        <p className="card-section-subtitle" style={{ marginTop: 8 }}>
          These are people connected through crew joins, hiring, and post activity.
        </p>

        {workedWith.length === 0 ? (
          <div className="card-soft" style={{ marginTop: 14 }}>
            <div className="muted">No worked-with connections yet.</div>
          </div>
        ) : (
          <div className="list" style={{ marginTop: 14 }}>
            {workedWith.map((person) => (
              <div key={person.user_id} className="card-soft" style={{ background: '#ffffff' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 10,
                    flexWrap: 'wrap',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div className="postMeta">
                      <Link to={`/u/${person.user_id}`} style={{ fontWeight: 800, color: 'var(--text)' }}>
                        {person.display_name}
                      </Link>

                      {person.role ? (
                        <span className="badge" style={roleBadgeStyle(person.role)}>
                          {roleLabel(person.role)}
                        </span>
                      ) : null}

                      {person.is_available ? (
                        <span className="badge" style={availabilityBadgeStyle(true)}>
                          Available
                        </span>
                      ) : null}

                      <span className="badge">{person.connection_count} connections</span>
                    </div>

                    <div className="muted" style={{ marginTop: 8 }}>
                      Latest: {relationshipLabel(person.latest_type)}
                    </div>

                    {person.latest_post_id ? (
                      <div style={{ marginTop: 8 }}>
                        <Link className="btn small" to={`/p/${person.latest_post_id}`}>
                          Open Related Post
                        </Link>
                      </div>
                    ) : null}
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Link className="btn small primary" to={`/u/${person.user_id}`}>
                      View Profile
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="card-section-title">Recent Activity</div>
        <p className="card-section-subtitle" style={{ marginTop: 8 }}>
          Most recent posts from this worker profile.
        </p>

        {recentPosts.length === 0 ? (
          <div className="card-soft" style={{ marginTop: 14 }}>
            <div className="muted">No recent posts yet.</div>
          </div>
        ) : (
          <div className="list" style={{ marginTop: 14 }}>
            {recentPosts.map((post) => (
              <Link key={post.id} to={`/p/${post.id}`} className="card-soft" style={{ background: '#ffffff' }}>
                <div className="postMeta">
                  <span className="badge">{postTypeLabel(post.post_type)}</span>
                  {post.post_type === 'need_crew' ? (
                    <span className="badge">{post.crew_status || 'open'}</span>
                  ) : null}
                  <span>{new Date(post.created_at).toLocaleString()}</span>
                </div>

                <div style={{ marginTop: 10, fontWeight: 900, fontSize: 18, lineHeight: 1.2 }}>
                  {post.title}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}