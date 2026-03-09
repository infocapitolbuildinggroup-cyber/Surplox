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
    if (type === 'need_crew') return '🚧 Se necesita cuadrilla'
    if (type === 'looking_for_work') return '🛠️ Buscando trabajo'
    return '💬 Discusión'
  }

  if (type === 'need_crew') return '🚧 Need Crew'
  if (type === 'looking_for_work') return '🛠️ Looking for Work'
  return '💬 Discussion'
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

function crewStatusLabel(status, lang) {
  if (lang === 'es') {
    if (status === 'full') return 'Cuadrilla llena'
    if (status === 'closed') return 'Cerrado'
    return 'Abierto'
  }

  if (status === 'full') return 'Crew Full'
  if (status === 'closed') return 'Closed'
  return 'Open'
}

function crewStatusBadgeStyle(status) {
  if (status === 'full') {
    return {
      color: '#ff751f',
      borderColor: 'rgba(255, 222, 89, 0.65)',
      background: 'rgba(255, 222, 89, 0.14)'
    }
  }

  if (status === 'closed') {
    return {
      color: '#ffde59',
      borderColor: 'rgba(255, 117, 31, 0.55)',
      background: 'rgba(255, 117, 31, 0.12)'
    }
  }

  return {
    color: '#ff751f',
    borderColor: 'rgba(255, 222, 89, 0.4)',
    background: 'rgba(255, 222, 89, 0.06)'
  }
}

function getPostTypeStyles(type) {
  if (type === 'need_crew') {
    return {
      card: {
        borderColor: 'rgba(255, 222, 89, 0.55)',
        background: 'rgba(255, 222, 89, 0.08)',
        boxShadow: '0 0 16px rgba(255, 222, 89, 0.12)'
      },
      badge: {
        color: '#ff751f',
        borderColor: 'rgba(255, 222, 89, 0.65)',
        background: 'rgba(255, 222, 89, 0.14)',
        boxShadow: '0 0 10px rgba(255, 222, 89, 0.18)'
      }
    }
  }

  if (type === 'looking_for_work') {
    return {
      card: {
        borderColor: 'rgba(255, 117, 31, 0.42)',
        background: 'rgba(255, 117, 31, 0.06)',
        boxShadow: '0 0 14px rgba(255, 117, 31, 0.08)'
      },
      badge: {
        color: '#ffde59',
        borderColor: 'rgba(255, 117, 31, 0.55)',
        background: 'rgba(255, 117, 31, 0.12)',
        boxShadow: '0 0 10px rgba(255, 117, 31, 0.14)'
      }
    }
  }

  return {
    card: {},
    badge: {
      color: '#ff751f',
      borderColor: 'rgba(255, 222, 89, 0.35)',
      background: 'rgba(255, 222, 89, 0.05)'
    }
  }
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

function tradeBadgeStyle() {
  return {
    color: '#ffde59',
    borderColor: 'rgba(255, 222, 89, 0.4)',
    background: 'rgba(255, 222, 89, 0.05)'
  }
}

function memberStatusLabel(status, lang) {
  if (lang === 'es') {
    return status === 'hired' ? 'Contratado' : 'Unido'
  }
  return status === 'hired' ? 'Hired' : 'Joined'
}

function memberStatusBadgeStyle(status) {
  if (status === 'hired') {
    return {
      color: '#ff751f',
      borderColor: 'rgba(255, 222, 89, 0.65)',
      background: 'rgba(255, 222, 89, 0.14)'
    }
  }

  return {
    color: '#ffde59',
    borderColor: 'rgba(255, 222, 89, 0.35)',
    background: 'rgba(255, 222, 89, 0.05)'
  }
}

function formatPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '')
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  return phone || ''
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
  const [currentUserId, setCurrentUserId] = useState(null)

  const [crewMembers, setCrewMembers] = useState([])
  const [myCrewMembership, setMyCrewMembership] = useState(false)
  const [crewActionLoading, setCrewActionLoading] = useState(false)

  const [translatedPostBody, setTranslatedPostBody] = useState('')
  const [showTranslatedPost, setShowTranslatedPost] = useState(false)
  const [translatingPost, setTranslatingPost] = useState(false)

  const [translatedComments, setTranslatedComments] = useState({})
  const [visibleTranslatedComments, setVisibleTranslatedComments] = useState({})
  const [translatingCommentId, setTranslatingCommentId] = useState(null)

  async function createNotification({ userId, actorUserId, postId, type, message }) {
    if (!userId || !message) return

    const { error } = await supabase.from('notifications').insert({
      user_id: userId,
      actor_user_id: actorUserId || null,
      post_id: postId || null,
      type,
      message
    })

    if (error) {
      console.error('Notification insert failed:', error)
    }
  }

  async function loadAll() {
    setLoading(true)
    setMsg('')

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const uid = sessionData.session?.user?.id || null
      setCurrentUserId(uid)

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
          crew_status,
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

      if (p.post_type === 'need_crew') {
        const { data: crewRows, error: crewErr } = await supabase
          .from('crew_memberships')
          .select(`
            post_id,
            user_id,
            status,
            created_at
          `)
          .eq('post_id', id)
          .order('created_at', { ascending: true })

        if (crewErr) throw crewErr

        const joinedUserIds = (crewRows || []).map((row) => row.user_id)

        let profileMap = new Map()
        let contactMap = new Map()

        if (joinedUserIds.length > 0) {
          const { data: joinedProfiles, error: joinedProfilesErr } = await supabase
            .from('profiles')
            .select('user_id, display_name, role')
            .in('user_id', joinedUserIds)

          if (joinedProfilesErr) throw joinedProfilesErr

          profileMap = new Map((joinedProfiles || []).map((row) => [row.user_id, row]))

          if (uid === p.author_id) {
            const { data: contactRows, error: contactErr } = await supabase
              .from('contact_private')
              .select('user_id, phone, email, city')
              .in('user_id', joinedUserIds)

            if (contactErr) {
              console.error('Unable to load private contact data:', contactErr)
            } else {
              contactMap = new Map((contactRows || []).map((row) => [row.user_id, row]))
            }
          }
        }

        const members = (crewRows || []).map((row) => {
          const profile = profileMap.get(row.user_id)
          const contact = contactMap.get(row.user_id)

          return {
            user_id: row.user_id,
            created_at: row.created_at,
            status: row.status || 'joined',
            display_name: profile?.display_name || 'Unknown Member',
            role: profile?.role || '',
            phone: contact?.phone || '',
            email: contact?.email || '',
            city: contact?.city || ''
          }
        })

        setCrewMembers(members)
        setMyCrewMembership(members.some((member) => member.user_id === uid))
      } else {
        setCrewMembers([])
        setMyCrewMembership(false)
      }

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

        await createNotification({
          userId: post.author_id,
          actorUserId: uid,
          postId: id,
          type: 'post_reply',
          message: 'Someone replied to your post.'
        })
      }

      setNewComment('')
      await loadAll()
    } catch (err) {
      console.error(err)
      setMsg(err.message || t(lang, 'detail_comment_error'))
    }
  }

  async function updateCrewStatus(nextStatus) {
    if (!post || post.post_type !== 'need_crew') return

    try {
      setCrewActionLoading(true)
      setMsg('')

      const { data: sessionData } = await supabase.auth.getSession()
      const uid = sessionData.session?.user?.id
      if (!uid) throw new Error('Not signed in')
      if (uid !== post.author_id) throw new Error('Only the post owner can change crew status.')

      const { error } = await supabase
        .from('posts')
        .update({ crew_status: nextStatus })
        .eq('id', id)

      if (error) throw error

      await loadAll()
    } catch (err) {
      console.error(err)
      setMsg(err.message || 'Unable to update crew status right now.')
    } finally {
      setCrewActionLoading(false)
    }
  }

  async function updateMemberStatus(memberUserId, nextStatus) {
    if (!post || post.post_type !== 'need_crew') return

    try {
      setCrewActionLoading(true)
      setMsg('')

      const { data: sessionData } = await supabase.auth.getSession()
      const uid = sessionData.session?.user?.id
      if (!uid) throw new Error('Not signed in')
      if (uid !== post.author_id) throw new Error('Only the post owner can change member status.')

      const { error } = await supabase
        .from('crew_memberships')
        .update({ status: nextStatus })
        .eq('post_id', id)
        .eq('user_id', memberUserId)

      if (error) throw error

      if (nextStatus === 'hired') {
        const { error: relationshipErr } = await supabase
          .from('user_relationships')
          .upsert(
            {
              source_user_id: post.author_id,
              target_user_id: memberUserId,
              relationship_type: 'hired_from_crew_post',
              post_id: String(id),
              metadata: { post_type: 'need_crew' }
            },
            {
              onConflict: 'source_user_id,target_user_id,relationship_type,post_id'
            }
          )

        if (relationshipErr) {
          console.error('Relationship graph insert failed:', relationshipErr)
        }

        await createNotification({
          userId: memberUserId,
          actorUserId: post.author_id,
          postId: id,
          type: 'crew_hired',
          message: 'You were marked as hired on a crew post.'
        })
      }

      await loadAll()
    } catch (err) {
      console.error(err)
      setMsg(err.message || 'Unable to update member status right now.')
    } finally {
      setCrewActionLoading(false)
    }
  }

  async function joinCrew() {
    if (!post || post.post_type !== 'need_crew') return

    try {
      setCrewActionLoading(true)
      setMsg('')

      const { data: sessionData } = await supabase.auth.getSession()
      const uid = sessionData.session?.user?.id
      if (!uid) throw new Error('Not signed in')
      if (uid === post.author_id) throw new Error('Post owners cannot join their own crew request.')
      if ((post.crew_status || 'open') !== 'open') throw new Error('This crew request is not open.')

      const needed = Number(post.needed_crew_size || 0)
      if (needed > 0 && crewMembers.length >= needed) {
        throw new Error('This crew request is already full.')
      }

      const { error } = await supabase
        .from('crew_memberships')
        .insert({
          post_id: id,
          user_id: uid,
          status: 'joined'
        })

      if (error) throw error

      const { error: relationshipErr } = await supabase
        .from('user_relationships')
        .upsert(
          {
            source_user_id: uid,
            target_user_id: post.author_id,
            relationship_type: 'joined_crew_post',
            post_id: String(id),
            metadata: { post_type: 'need_crew' }
          },
          {
            onConflict: 'source_user_id,target_user_id,relationship_type,post_id'
          }
        )

      if (relationshipErr) {
        console.error('Relationship graph insert failed:', relationshipErr)
      }

      await createNotification({
        userId: post.author_id,
        actorUserId: uid,
        postId: id,
        type: 'crew_join',
        message: 'Someone joined your crew request.'
      })

      if (needed > 0 && crewMembers.length + 1 >= needed) {
        const { error: statusErr } = await supabase
          .from('posts')
          .update({ crew_status: 'full' })
          .eq('id', id)

        if (statusErr) {
          console.error('Auto-mark full failed:', statusErr)
        }
      }

      await loadAll()
    } catch (err) {
      console.error(err)
      setMsg(err.message || 'Unable to join this crew right now.')
    } finally {
      setCrewActionLoading(false)
    }
  }

  async function leaveCrew() {
    try {
      setCrewActionLoading(true)
      setMsg('')

      const { data: sessionData } = await supabase.auth.getSession()
      const uid = sessionData.session?.user?.id
      if (!uid) throw new Error('Not signed in')

      const { error } = await supabase
        .from('crew_memberships')
        .delete()
        .eq('post_id', id)
        .eq('user_id', uid)

      if (error) throw error

      if (post?.post_type === 'need_crew' && post?.crew_status === 'full') {
        const { error: reopenErr } = await supabase
          .from('posts')
          .update({ crew_status: 'open' })
          .eq('id', id)

        if (reopenErr) {
          console.error('Auto-reopen failed:', reopenErr)
        }
      }

      await loadAll()
    } catch (err) {
      console.error(err)
      setMsg(err.message || 'Unable to leave this crew right now.')
    } finally {
      setCrewActionLoading(false)
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
  const typeStyles = getPostTypeStyles(post.post_type || 'discussion')
  const isPostOwner = currentUserId && post.author_id === currentUserId
  const crewNeeded = Number(post.needed_crew_size || 0)
  const crewFilled = crewMembers.length
  const hiredCount = crewMembers.filter((member) => member.status === 'hired').length
  const crewStatus = post.crew_status || 'open'
  const crewOpen = crewStatus === 'open'
  const crewFull = crewStatus === 'full'
  const crewClosed = crewStatus === 'closed'

  return (
    <div className="grid" style={{ gap: 12 }}>
      <div className="card" style={typeStyles.card}>
        <div className="postMeta">
          <span className="badge" style={typeStyles.badge}>
            {postTypeLabel(post.post_type || 'discussion', lang)}
          </span>

          <span className="badge" style={tradeBadgeStyle()}>
            {post.trade_name}
          </span>

          <span className="badge">ZIP {post.center_zip}</span>
          <span className="badge">{post.radius_miles} mi</span>

          {post.author_role ? (
            <span className="badge" style={roleBadgeStyle(post.author_role)}>
              {roleLabel(post.author_role, lang)}
            </span>
          ) : null}

          {post.post_type === 'need_crew' ? (
            <span className="badge" style={crewStatusBadgeStyle(crewStatus)}>
              {crewStatusLabel(crewStatus, lang)}
            </span>
          ) : null}

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
              borderColor: post.post_type === 'need_crew'
                ? 'rgba(255, 222, 89, 0.35)'
                : 'rgba(255, 117, 31, 0.35)',
              background: post.post_type === 'need_crew'
                ? 'rgba(255, 222, 89, 0.06)'
                : 'rgba(255, 117, 31, 0.06)'
            }}
          >
            <div className="card-section-title">
              {post.post_type === 'need_crew' ? 'Opportunity Details' : 'Availability Details'}
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
              {post.post_type === 'need_crew' && post.needed_crew_size ? (
                <>
                  <span className="badge">Crew Needed: {post.needed_crew_size}</span>
                  <span className="badge">Filled: {crewFilled}/{post.needed_crew_size}</span>
                  <span className="badge">Hired: {hiredCount}</span>
                </>
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

            {post.post_type === 'need_crew' && (
              <div style={{ marginTop: 14 }}>
                <div className="card-section-title" style={{ fontSize: 16 }}>
                  Crew Builder
                </div>

                <p className="card-section-subtitle" style={{ marginTop: 6 }}>
                  Build a crew directly from this post. Workers can join the roster, and the post owner can control whether the crew request is open, full, or closed.
                </p>

                {isPostOwner && (
                  <div style={{ marginTop: 12 }}>
                    <div className="card-section-title" style={{ fontSize: 15 }}>
                      Contractor Controls
                    </div>

                    <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <button
                        className="btn primary"
                        onClick={() => updateCrewStatus('open')}
                        disabled={crewActionLoading || crewOpen}
                      >
                        {crewActionLoading && crewOpen ? 'Saving…' : 'Mark Open'}
                      </button>

                      <button
                        className="btn"
                        onClick={() => updateCrewStatus('full')}
                        disabled={crewActionLoading || crewFull}
                      >
                        {crewActionLoading && crewFull ? 'Saving…' : 'Mark Crew Full'}
                      </button>

                      <button
                        className="btn"
                        onClick={() => updateCrewStatus('closed')}
                        disabled={crewActionLoading || crewClosed}
                      >
                        {crewActionLoading && crewClosed ? 'Saving…' : 'Close Post'}
                      </button>
                    </div>
                  </div>
                )}

                <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {!isPostOwner && !myCrewMembership && crewOpen && (
                    <button className="btn primary" onClick={joinCrew} disabled={crewActionLoading}>
                      {crewActionLoading ? 'Joining…' : 'Join Crew'}
                    </button>
                  )}

                  {!isPostOwner && myCrewMembership && (
                    <button className="btn" onClick={leaveCrew} disabled={crewActionLoading}>
                      {crewActionLoading ? 'Leaving…' : 'Leave Crew'}
                    </button>
                  )}

                  {isPostOwner && (
                    <span className="badge">You posted this crew request</span>
                  )}

                  {crewFull && (
                    <span className="badge">Crew Full</span>
                  )}

                  {crewClosed && (
                    <span className="badge">Post Closed</span>
                  )}
                </div>

                <div style={{ marginTop: 14 }}>
                  <div className="card-section-title" style={{ fontSize: 16 }}>
                    Crew Roster
                  </div>

                  {crewMembers.length === 0 ? (
                    <p className="card-section-subtitle" style={{ marginTop: 8 }}>
                      No one has joined this crew yet.
                    </p>
                  ) : (
                    <div className="list" style={{ marginTop: 10 }}>
                      {crewMembers.map((member) => (
                        <div key={member.user_id} className="card card-soft">
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              gap: 10,
                              flexWrap: 'wrap',
                              alignItems: 'flex-start'
                            }}
                          >
                            <div style={{ flex: 1, minWidth: 240 }}>
                              <div className="postMeta">
                                <span>{member.display_name}</span>

                                {member.role ? (
                                  <span className="badge" style={roleBadgeStyle(member.role)}>
                                    {roleLabel(member.role, lang)}
                                  </span>
                                ) : null}

                                <span className="badge" style={memberStatusBadgeStyle(member.status)}>
                                  {memberStatusLabel(member.status, lang)}
                                </span>

                                <span>Joined {timeAgo(member.created_at)}</span>
                              </div>

                              {isPostOwner && (
                                <div
                                  className="card"
                                  style={{
                                    marginTop: 10,
                                    padding: 12,
                                    borderColor: 'rgba(255, 222, 89, 0.22)',
                                    background: 'rgba(255, 222, 89, 0.04)'
                                  }}
                                >
                                  <div className="card-section-title" style={{ fontSize: 14, marginBottom: 8 }}>
                                    Contact Card
                                  </div>

                                  <div className="stack-sm">
                                    {member.phone ? (
                                      <div className="muted">
                                        Phone: <a href={`tel:${member.phone}`}>{formatPhone(member.phone)}</a>
                                      </div>
                                    ) : (
                                      <div className="muted">Phone: Not available</div>
                                    )}

                                    {member.email ? (
                                      <div className="muted">
                                        Email: <a href={`mailto:${member.email}`}>{member.email}</a>
                                      </div>
                                    ) : (
                                      <div className="muted">Email: Not available</div>
                                    )}

                                    {member.city ? (
                                      <div className="muted">City: {member.city}</div>
                                    ) : (
                                      <div className="muted">City: Not available</div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>

                            {isPostOwner && (
                              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {member.status !== 'hired' ? (
                                  <button
                                    className="btn small primary"
                                    onClick={() => updateMemberStatus(member.user_id, 'hired')}
                                    disabled={crewActionLoading}
                                  >
                                    Mark Hired
                                  </button>
                                ) : (
                                  <button
                                    className="btn small"
                                    onClick={() => updateMemberStatus(member.user_id, 'joined')}
                                    disabled={crewActionLoading}
                                  >
                                    Move Back to Joined
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
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
                      <span className="badge" style={roleBadgeStyle(c.author_role)}>
                        {roleLabel(c.author_role, lang)}
                      </span>
                    ) : null}

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