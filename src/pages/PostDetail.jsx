import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useParams, Link } from 'react-router-dom'
import { t } from '../i18n'
import { detectLikelyLanguage, translateText } from '../translate'

function timeAgo(ts) {
  const d = new Date(ts)
  const diff = (Date.now() - d.getTime()) / 1000

  if (diff < 60) return `${Math.floor(diff)}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function postTypeLabel(type, lang) {
  if (lang === 'es') {
    if (type === 'need_crew') return 'Se necesita cuadrilla'
    if (type === 'looking_for_work') return 'Buscando trabajo'
    return 'Discusión'
  }

  if (type === 'need_crew') return 'Need Crew'
  if (type === 'looking_for_work') return 'Looking for Work'
  return 'Discussion'
}

function roleLabel(role, lang) {
  if (!role) return ''
  const map = {
    laborer: { en: 'Laborer', es: 'Trabajador' },
    subcontractor: { en: 'Subcontractor', es: 'Subcontratista' },
    contractor: { en: 'Contractor', es: 'Contratista' },
    supplier: { en: 'Supplier', es: 'Proveedor' }
  }
  return map[role]?.[lang] || map[role]?.en || role
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
  const [lang, setLang] = useState(localStorage.getItem('surplox_lang') || 'en')

  const [translatedPostBody, setTranslatedPostBody] = useState('')
  const [showTranslatedPost, setShowTranslatedPost] = useState(false)
  const [translatingPost, setTranslatingPost] = useState(false)

  const [translatedComments, setTranslatedComments] = useState({})
  const [visibleTranslatedComments, setVisibleTranslatedComments] = useState({})
  const [translatingCommentId, setTranslatingCommentId] = useState(null)

  async function loadAll() {
    setLoading(true)
    setMsg('')

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const uid = sessionData.session?.user?.id

      if (uid) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('preferred_language')
          .eq('user_id', uid)
          .maybeSingle()

        const userLang = prof?.preferred_language || 'en'
        setLang(userLang)
        localStorage.setItem('surplox_lang', userLang)
      }

      const { data: p, error: pErr } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          body,
          center_zip,
          radius_miles,
          created_at,
          trade_id,
          post_type,
          needed_crew_size,
          compensation,
          start_date,
          trades(name),
          author_id,
          profiles(display_name, role)
        `)
        .eq('id', id)
        .single()

      if (pErr) throw pErr

      const computedLang = detectLikelyLanguage(`${p.title || ''} ${p.body || ''}`)

      setPost({
        ...p,
        trade_name: p.trades?.name || t(lang, 'detail_general'),
        author_name: p.profiles?.display_name || 'Unknown Member',
        author_role: p.profiles?.role || '',
        source_language: computedLang
      })

      const { data: c, error: cErr } = await supabase
        .from('comments')
        .select('id,body,created_at,author_id,profiles(display_name, role)')
        .eq('post_id', id)
        .order('created_at', { ascending: true })

      if (cErr) throw cErr

      setComments(
        (c || []).map((x) => ({
          ...x,
          author_name: x.profiles?.display_name || 'Unknown Member',
          author_role: x.profiles?.role || '',
          source_language: detectLikelyLanguage(x.body || '')
        }))
      )

      const { data: v, error: vErr } = await supabase
        .from('votes')
        .select('value, voter_id')
        .eq('post_id', id)

      if (vErr) throw vErr

      const totalScore = (v || []).reduce((a, r) => a + r.value, 0)
      setScore(totalScore)

      const currentVote = (v || []).find((r) => r.voter_id === uid)?.value || 0
      setMyVote(currentVote)

      setTranslatedPostBody('')
      setShowTranslatedPost(false)
      setTranslatedComments({})
      setVisibleTranslatedComments({})
    } catch (err) {
      console.error(err)
      setMsg(err.message || t(lang, 'detail_load_error'))
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
      setMsg(err.message || t(lang, 'detail_vote_error'))
    }
  }

  async function addComment() {
    setMsg('')

    try {
      if (!newComment.trim()) throw new Error(t(lang, 'detail_comment_empty'))

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

      if (post?.author_id && post.author_id !== uid) {
        const { error: relationshipErr } = await supabase
          .from('user_relationships')
          .upsert(
            {
              source_user_id: uid,
              target_user_id: post.author_id,
              relationship_type: 'replied_to_post',
              post_id: String(id),
              metadata: { post_type: post.post_type || 'discussion' }
            },
            {
              onConflict: 'source_user_id,target_user_id,relationship_type,post_id'
            }
          )

        if (relationshipErr) {
          console.error('Relationship graph insert failed:', relationshipErr)
        }
      }

      setNewComment('')
      await loadAll()
    } catch (err) {
      console.error(err)
      setMsg(err.message || t(lang, 'detail_comment_error'))
    }
  }

  async function handleTranslatePost() {
    if (!post) return

    if (showTranslatedPost) {
      setShowTranslatedPost(false)
      return
    }

    if (translatedPostBody) {
      setShowTranslatedPost(true)
      return
    }

    try {
      setTranslatingPost(true)
      const translated = await translateText({
        text: post.body || '',
        from: post.source_language || 'en',
        to: lang
      })
      setTranslatedPostBody(translated)
      setShowTranslatedPost(true)
    } catch (err) {
      console.error(err)
      setMsg('Unable to translate this post right now.')
    } finally {
      setTranslatingPost(false)
    }
  }

  async function handleTranslateComment(comment) {
    const currentVisible = visibleTranslatedComments[comment.id]

    if (currentVisible) {
      setVisibleTranslatedComments((prev) => ({
        ...prev,
        [comment.id]: false
      }))
      return
    }

    if (translatedComments[comment.id]) {
      setVisibleTranslatedComments((prev) => ({
        ...prev,
        [comment.id]: true
      }))
      return
    }

    try {
      setTranslatingCommentId(comment.id)
      const translated = await translateText({
        text: comment.body || '',
        from: comment.source_language || 'en',
        to: lang
      })

      setTranslatedComments((prev) => ({
        ...prev,
        [comment.id]: translated
      }))

      setVisibleTranslatedComments((prev) => ({
        ...prev,
        [comment.id]: true
      }))
    } catch (err) {
      console.error(err)
      setMsg('Unable to translate this reply right now.')
    } finally {
      setTranslatingCommentId(null)
    }
  }

  if (loading) {
    return <div className="card">{t(lang, 'detail_loading')}</div>
  }

  if (!post) {
    return (
      <div className="card card-message">
        <div className="card-section-title">{t(lang, 'detail_not_found')}</div>
        <p className="card-section-subtitle">
          {t(lang, 'detail_not_found_body')}
        </p>
        <div style={{ marginTop: 12 }}>
          <Link className="btn primary" to="/feed">{t(lang, 'detail_return_feed')}</Link>
        </div>
      </div>
    )
  }

  const shouldOfferPostTranslation = post.body && post.source_language !== lang
  const isOpportunity = post.post_type === 'need_crew' || post.post_type === 'looking_for_work'

  return (
    <div className="grid" style={{ gap: 12 }}>
      <div
        className="card"
        style={{
          borderColor: isOpportunity ? 'rgba(255, 222, 89, 0.45)' : undefined,
          background: isOpportunity ? 'rgba(255, 222, 89, 0.05)' : undefined
        }}
      >
        <div className="postMeta">
          <span className="badge">{postTypeLabel(post.post_type || 'discussion', lang)}</span>
          <span className="badge">{post.trade_name}</span>
          <span className="badge">ZIP {post.center_zip}</span>
          <span className="badge">{post.radius_miles} mi</span>
          {post.author_role ? <span className="badge">{roleLabel(post.author_role, lang)}</span> : null}
          <span>{t(lang, 'detail_posted_by')} {post.author_name}</span>
          <span>•</span>
          <span>{timeAgo(post.created_at)}</span>
        </div>

        <h2 className="h2" style={{ marginTop: 10 }}>{post.title}</h2>

        {isOpportunity && (
          <div
            className="card card-soft"
            style={{
              marginBottom: 12,
              borderColor: 'rgba(255, 222, 89, 0.35)',
              background: 'rgba(255, 222, 89, 0.06)'
            }}
          >
            <div className="card-section-title">
              {post.post_type === 'need_crew' ? 'Opportunity Details' : 'Availability Details'}
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
              {post.post_type === 'need_crew' && post.needed_crew_size ? (
                <span className="badge">Crew Needed: {post.needed_crew_size}</span>
              ) : null}

              {post.compensation ? (
                <span className="badge">Pay / Rate: {post.compensation}</span>
              ) : null}

              {post.start_date ? (
                <span className="badge">
                  Start: {new Date(post.start_date).toLocaleDateString()}
                </span>
              ) : null}
            </div>
          </div>
        )}

        <p className="muted" style={{ whiteSpace: 'pre-wrap' }}>
          {post.body}
        </p>

        {shouldOfferPostTranslation && (
          <div style={{ marginTop: 10 }}>
            <button className="btn small" onClick={handleTranslatePost} disabled={translatingPost}>
              {translatingPost
                ? (lang === 'es' ? 'Traduciendo…' : 'Translating…')
                : (showTranslatedPost
                    ? (lang === 'es' ? 'Ver original' : 'Show original')
                    : (lang === 'es' ? 'Traducir' : 'Translate'))}
            </button>
          </div>
        )}

        {showTranslatedPost && translatedPostBody && (
          <div className="card card-soft" style={{ marginTop: 12 }}>
            <div className="card-section-title">
              {lang === 'es' ? 'Versión traducida' : 'Translated version'}
            </div>
            <p className="card-section-subtitle" style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>
              {translatedPostBody}
            </p>
          </div>
        )}

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
              {myVote === 1 ? t(lang, 'detail_upvoted') : t(lang, 'detail_upvote')}
            </button>

            <div className="score">{score}</div>

            <button className="btn small" onClick={() => vote(-1)}>
              {myVote === -1 ? t(lang, 'detail_downvoted') : t(lang, 'detail_downvote')}
            </button>
          </div>

          <Link className="btn small" to="/feed">
            {t(lang, 'detail_back_feed')}
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
          {t(lang, 'detail_discussion')}
        </div>

        <p className="muted">
          {t(lang, 'detail_discussion_intro')}
        </p>

        <div className="list" style={{ marginTop: 12 }}>
          {comments.length === 0 ? (
            <div className="card card-soft">
              <div className="card-section-title">{t(lang, 'detail_no_replies')}</div>
              <p className="card-section-subtitle">
                {t(lang, 'detail_no_replies_body')}
              </p>
            </div>
          ) : (
            comments.map((c) => {
              const canTranslate = c.source_language !== lang
              const showTranslated = visibleTranslatedComments[c.id]
              const translated = translatedComments[c.id]

              return (
                <div key={c.id} className="card card-soft">
                  <div className="postMeta">
                    <span>{c.author_name}</span>
                    {c.author_role ? (
                      <>
                        <span>•</span>
                        <span>{roleLabel(c.author_role, lang)}</span>
                      </>
                    ) : null}
                    <span>•</span>
                    <span>{timeAgo(c.created_at)}</span>
                  </div>

                  <div style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>
                    {c.body}
                  </div>

                  {canTranslate && (
                    <div style={{ marginTop: 10 }}>
                      <button
                        className="btn small"
                        onClick={() => handleTranslateComment(c)}
                        disabled={translatingCommentId === c.id}
                      >
                        {translatingCommentId === c.id
                          ? (lang === 'es' ? 'Traduciendo…' : 'Translating…')
                          : (showTranslated
                              ? (lang === 'es' ? 'Ver original' : 'Show original')
                              : (lang === 'es' ? 'Traducir' : 'Translate'))}
                      </button>
                    </div>
                  )}

                  {showTranslated && translated && (
                    <div className="card" style={{ marginTop: 12 }}>
                      <div className="card-section-title">
                        {lang === 'es' ? 'Versión traducida' : 'Translated version'}
                      </div>
                      <p className="card-section-subtitle" style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>
                        {translated}
                      </p>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        <hr />

        <div className="muted" style={{ marginBottom: 6 }}>
          {t(lang, 'detail_add_reply')}
        </div>

        <textarea
          className="input"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={t(lang, 'detail_reply_placeholder')}
        />

        <div style={{ marginTop: 12 }}>
          <button className="btn primary" onClick={addComment}>
            {t(lang, 'detail_post_reply')}
          </button>
        </div>
      </div>
    </div>
  )
}