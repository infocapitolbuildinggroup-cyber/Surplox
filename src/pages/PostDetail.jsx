import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useParams, Link } from 'react-router-dom'

function timeAgo(ts) {
  const d = new Date(ts)
  const diff = (Date.now() - d.getTime()) / 1000

  if (diff < 60) return `${Math.floor(diff)}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function PostDetail() {
  const { id } = useParams()

  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [score, setScore] = useState(0)
  const [myVote, setMyVote] = useState(0)
  const [newComment, setNewComment] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadAll() {
    setLoading(true)
    setMsg('')

    try {
      const { data: p, error: pErr } = await supabase
        .from('posts')
        .select('id,title,body,center_zip,radius_miles,created_at,trade_id,trades(name),author_id,profiles(display_name)')
        .eq('id', id)
        .single()

      if (pErr) throw pErr

      setPost({
        ...p,
        trade_name: p.trades?.name || 'General Discussion',
        author_name: p.profiles?.display_name || 'Unknown Member'
      })

      const { data: c, error: cErr } = await supabase
        .from('comments')
        .select('id,body,created_at,author_id,profiles(display_name)')
        .eq('post_id', id)
        .order('created_at', { ascending: true })

      if (cErr) throw cErr

      setComments(
        (c || []).map((x) => ({
          ...x,
          author_name: x.profiles?.display_name || 'Unknown Member'
        }))
      )

      const { data: v, error: vErr } = await supabase
        .from('votes')
        .select('value, voter_id')
        .eq('post_id', id)

      if (vErr) throw vErr

      const totalScore = (v || []).reduce((a, r) => a + r.value, 0)
      setScore(totalScore)

      const { data: sessionData } = await supabase.auth.getSession()
      const uid = sessionData.session?.user?.id
      const currentVote = (v || []).find((r) => r.voter_id === uid)?.value || 0
      setMyVote(currentVote)
    } catch (err) {
      console.error(err)
      setMsg(err.message || 'Unable to load this post right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [id])

  async function vote(val) {
    setMsg('')

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const uid = sessionData.session?.user?.id
      if (!uid) throw new Error('Not signed in')

      const newVal = myVote === val ? 0 : val

      if (newVal === 0) {
        const { error } = await supabase
          .from('votes')
          .delete()
          .eq('post_id', id)
          .eq('voter_id', uid)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('votes')
          .upsert({
            post_id: id,
            voter_id: uid,
            value: newVal
          })

        if (error) throw error
      }

      await loadAll()
    } catch (err) {
      console.error(err)
      setMsg(err.message || 'Unable to save your vote.')
    }
  }

  async function addComment() {
    setMsg('')

    try {
      if (!newComment.trim()) throw new Error('Comment cannot be empty')

      const { data: sessionData } = await supabase.auth.getSession()
      const uid = sessionData.session?.user?.id
      if (!uid) throw new Error('Not signed in')

      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: id,
          author_id: uid,
          body: newComment.trim()
        })

      if (error) throw error

      setNewComment('')
      await loadAll()
    } catch (err) {
      console.error(err)
      setMsg(err.message || 'Unable to post your comment.')
    }
  }

  if (loading) {
    return <div className="card">Loading discussion…</div>
  }

  if (!post) {
    return (
      <div className="card card-message">
        <div className="card-section-title">Post Not Found</div>
        <p className="card-section-subtitle">
          This discussion may have been removed or is no longer available.
        </p>
        <div style={{ marginTop: 12 }}>
          <Link className="btn primary" to="/feed">Return to Feed</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="grid" style={{ gap: 12 }}>
      <div className="card">
        <div className="postMeta">
          <span className="badge">{post.trade_name}</span>
          <span className="badge">ZIP {post.center_zip}</span>
          <span className="badge">{post.radius_miles} mi radius</span>
          <span>Posted by {post.author_name}</span>
          <span>•</span>
          <span>{timeAgo(post.created_at)}</span>
        </div>

        <h2 className="h2" style={{ marginTop: 10 }}>{post.title}</h2>

        <p className="muted" style={{ whiteSpace: 'pre-wrap' }}>
          {post.body}
        </p>

        <hr />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 10,
            flexWrap: 'wrap',
            alignItems: 'center'
          }}
        >
          <div className="voteBox">
            <button className="btn small" onClick={() => vote(1)}>
              {myVote === 1 ? '▲ Upvoted' : '▲ Upvote'}
            </button>

            <div className="score">{score}</div>

            <button className="btn small" onClick={() => vote(-1)}>
              {myVote === -1 ? '▼ Downvoted' : '▼ Downvote'}
            </button>
          </div>

          <Link className="btn small" to="/feed">
            Back to Feed
          </Link>
        </div>

        {msg && (
          <div className="card card-message" style={{ marginTop: 12 }}>
            {msg}
          </div>
        )}
      </div>

      <div className="card">
        <div className="h1" style={{ fontSize: 20, marginTop: 0 }}>
          Discussion
        </div>

        <p className="muted">
          Join the conversation and share your experience, feedback, or recommendations.
        </p>

        <div className="list" style={{ marginTop: 12 }}>
          {comments.length === 0 ? (
            <div className="card card-soft">
              <div className="card-section-title">No Replies Yet</div>
              <p className="card-section-subtitle">
                Be the first to respond to this discussion.
              </p>
            </div>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="card card-soft">
                <div className="postMeta">
                  <span>{c.author_name}</span>
                  <span>•</span>
                  <span>{timeAgo(c.created_at)}</span>
                </div>

                <div style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>
                  {c.body}
                </div>
              </div>
            ))
          )}
        </div>

        <hr />

        <div className="muted" style={{ marginBottom: 6 }}>
          Add a Reply
        </div>

        <textarea
          className="input"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your advice, experience, or answer here."
        />

        <div style={{ marginTop: 12 }}>
          <button className="btn primary" onClick={addComment}>
            Post Reply
          </button>
        </div>
      </div>
    </div>
  )
}