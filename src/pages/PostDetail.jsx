import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useParams, Link } from 'react-router-dom'
import { t } from '../i18n'
import { detectLikelyLanguage, translateText } from '../translate'

function timeAgo(ts, lang = 'en') {
  const d = new Date(ts)
  const diff = (Date.now() - d.getTime()) / 1000

  if (lang === 'es') {
    if (diff < 60) return `hace ${Math.floor(diff)} s`
    if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`
    return `hace ${Math.floor(diff / 86400)} d`
  }

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
  if (status === 'full') return { background: '#fff0b4', color: '#111111' }
  if (status === 'closed') return { background: '#111111', color: '#ffffff' }
  return { background: '#ecebe3', color: '#111111' }
}

function getPostTypeStyles(type) {
  if (type === 'need_crew') {
    return {
      shell: {
        background: 'linear-gradient(180deg, #fff7cf 0%, #ffffff 100%)'
      },
      badge: {
        background: '#ffde59',
        color: '#111111'
      },
      accent: '#ffde59'
    }
  }

  if (type === 'looking_for_work') {
    return {
      shell: {
        background: 'linear-gradient(180deg, #fff1e6 0%, #ffffff 100%)'
      },
      badge: {
        background: '#ffd7b0',
        color: '#111111'
      },
      accent: '#ffb067'
    }
  }

  return {
    shell: {
      background: '#ffffff'
    },
    badge: {
      background: '#ecebe3',
      color: '#111111'
    },
    accent: '#d9d7cc'
  }
}

function roleBadgeStyle(role) {
  if (role === 'contractor') return { background: '#111111', color: '#ffffff' }
  if (role === 'subcontractor') return { background: '#fff0b4', color: '#111111' }
  if (role === 'laborer') return { background: '#ecebe3', color: '#111111' }
  if (role === 'supplier') return { background: '#ffd7b0', color: '#111111' }
  return {}
}

function tradeBadgeStyle() {
  return { background: '#f1f1eb', color: '#111111' }
}

function memberStatusLabel(status, lang) {
  if (lang === 'es') {
    return status === 'hired' ? 'Contratado' : 'Unido'
  }
  return status === 'hired' ? 'Hired' : 'Joined'
}

function memberStatusBadgeStyle(status) {
  if (status === 'hired') return { background: '#fff0b4', color: '#111111' }
  return { background: '#ecebe3', color: '#111111' }
}

function formatPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '')
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  return phone || ''
}

function availabilityBadgeStyle(isAvailable) {
  if (!isAvailable) return null
  return { background: '#dcf4e5', color: '#177245' }
}

const UI = {
  en: {
    unknownMember: 'Unknown Member',
    notSignedIn: 'Not signed in',
    inviteLinkUnavailable: 'Invite link unavailable.',
    inviteLinkCopied: 'Invite link copied.',
    unableCopyInvite: 'Unable to copy invite link.',
    unableShareMenu: 'Unable to open share menu.',
    unableOpenTextInvite: 'Unable to open text invite.',
    unableOpenEmailInvite: 'Unable to open email invite.',
    workerProfileCopied: 'Worker profile link copied.',
    unableCopyWorkerProfile: 'Unable to copy worker profile link.',
    replyNotification: 'Someone replied to your post.',
    crewHiredNotification: 'You were marked as hired on a crew post.',
    crewJoinNotification: 'Someone joined your crew request.',
    onlyOwnerCrewStatus: 'Only the post owner can change crew status.',
    unableUpdateCrewStatus: 'Unable to update crew status right now.',
    onlyOwnerMemberStatus: 'Only the post owner can change member status.',
    unableUpdateMemberStatus: 'Unable to update member status right now.',
    postOwnerCannotJoin: 'Post owners cannot join their own crew request.',
    crewNotOpen: 'This crew request is not open.',
    crewAlreadyFull: 'This crew request is already full.',
    unableJoinCrew: 'Unable to join this crew right now.',
    unableLeaveCrew: 'Unable to leave this crew right now.',
    unableTranslatePost: 'Unable to translate this post right now.',
    unableTranslateReply: 'Unable to translate this reply right now.',
    trade: 'Trade',
    zip: 'ZIP',
    start: 'Start',
    pay: 'Pay',
    viewProfile: 'View Profile',
    available: 'Available',
    opportunityDetails: 'Opportunity Details',
    availabilityDetails: 'Availability Details',
    crewNeeded: 'Crew Needed',
    filled: 'Filled',
    hired: 'Hired',
    payRate: 'Pay / Rate',
    crewBuilder: 'Crew Builder',
    crewBuilderBody:
      'Build a crew directly from this post. Workers can join the roster, and the post owner can control whether the crew request is open, full, or closed.',
    inviteCrew: 'Invite Crew',
    inviteCrewBody:
      'Share this crew post with workers, subs, or people already in your network.',
    copyInviteLink: 'Copy Invite Link',
    share: 'Share',
    textInvite: 'Text Invite',
    emailInvite: 'Email Invite',
    contractorControls: 'Contractor Controls',
    saving: 'Saving…',
    markOpen: 'Mark Open',
    markCrewFull: 'Mark Crew Full',
    closePost: 'Close Post',
    joining: 'Joining…',
    joinCrew: 'Join Crew',
    leaving: 'Leaving…',
    leaveCrew: 'Leave Crew',
    youPostedThis: 'You posted this crew request',
    crewFull: 'Crew Full',
    postClosed: 'Post Closed',
    crewRoster: 'Crew Roster',
    noOneJoined: 'No one has joined this crew yet.',
    joinedAt: 'Joined',
    workedBefore: 'Worked With Before',
    contactCard: 'Contact Card',
    phone: 'Phone',
    email: 'Email',
    city: 'City',
    notAvailable: 'Not available',
    rehireShare: 'Rehire / Share',
    markHired: 'Mark Hired',
    moveBackToJoined: 'Move Back to Joined',
    translating: 'Translating…',
    showOriginal: 'Show original',
    translate: 'Translate',
    translatedVersion: 'Translated version',
    heroBadge: 'Post detail',
    heroTitle: 'A cleaner post view built for action.',
    heroBody:
      'See the full post, reply faster, review the crew roster, and move from conversation to work without the clutter.',
    replies: 'Replies',
    addReply: 'Add Reply',
    replyPlaceholder: 'Share your advice, experience, or answer here.',
    postReply: 'Post Reply',
    noReplies: 'No replies yet.',
    discussionThread: 'Discussion Thread',
    backToFeed: 'Back to Feed'
  },
  es: {
    unknownMember: 'Miembro desconocido',
    notSignedIn: 'No has iniciado sesión',
    inviteLinkUnavailable: 'El enlace de invitación no está disponible.',
    inviteLinkCopied: 'Enlace de invitación copiado.',
    unableCopyInvite: 'No se pudo copiar el enlace de invitación.',
    unableShareMenu: 'No se pudo abrir el menú de compartir.',
    unableOpenTextInvite: 'No se pudo abrir la invitación por texto.',
    unableOpenEmailInvite: 'No se pudo abrir la invitación por correo.',
    workerProfileCopied: 'Enlace del perfil copiado.',
    unableCopyWorkerProfile: 'No se pudo copiar el enlace del perfil.',
    replyNotification: 'Alguien respondió a tu publicación.',
    crewHiredNotification: 'Fuiste marcado como contratado en una publicación de cuadrilla.',
    crewJoinNotification: 'Alguien se unió a tu solicitud de cuadrilla.',
    onlyOwnerCrewStatus: 'Solo el dueño de la publicación puede cambiar el estado de la cuadrilla.',
    unableUpdateCrewStatus: 'No se pudo actualizar el estado de la cuadrilla.',
    onlyOwnerMemberStatus: 'Solo el dueño de la publicación puede cambiar el estado del miembro.',
    unableUpdateMemberStatus: 'No se pudo actualizar el estado del miembro.',
    postOwnerCannotJoin: 'El dueño de la publicación no puede unirse a su propia solicitud.',
    crewNotOpen: 'Esta solicitud de cuadrilla no está abierta.',
    crewAlreadyFull: 'Esta solicitud de cuadrilla ya está llena.',
    unableJoinCrew: 'No se pudo unir a esta cuadrilla.',
    unableLeaveCrew: 'No se pudo salir de esta cuadrilla.',
    unableTranslatePost: 'No se pudo traducir esta publicación.',
    unableTranslateReply: 'No se pudo traducir esta respuesta.',
    trade: 'Oficio',
    zip: 'Código postal',
    start: 'Inicio',
    pay: 'Pago',
    viewProfile: 'Ver perfil',
    available: 'Disponible',
    opportunityDetails: 'Detalles de la oportunidad',
    availabilityDetails: 'Detalles de disponibilidad',
    crewNeeded: 'Cuadrilla necesaria',
    filled: 'Llenos',
    hired: 'Contratados',
    payRate: 'Pago / tarifa',
    crewBuilder: 'Constructor de cuadrilla',
    crewBuilderBody:
      'Construye una cuadrilla directamente desde esta publicación. Los trabajadores pueden unirse y el dueño puede controlar si la solicitud está abierta, llena o cerrada.',
    inviteCrew: 'Invitar cuadrilla',
    inviteCrewBody:
      'Comparte esta publicación con trabajadores, subcontratistas o gente de tu red.',
    copyInviteLink: 'Copiar enlace',
    share: 'Compartir',
    textInvite: 'Invitar por texto',
    emailInvite: 'Invitar por correo',
    contractorControls: 'Controles del contratista',
    saving: 'Guardando…',
    markOpen: 'Marcar abierta',
    markCrewFull: 'Marcar cuadrilla llena',
    closePost: 'Cerrar publicación',
    joining: 'Uniéndose…',
    joinCrew: 'Unirse a cuadrilla',
    leaving: 'Saliendo…',
    leaveCrew: 'Salir de cuadrilla',
    youPostedThis: 'Tú publicaste esta solicitud',
    crewFull: 'Cuadrilla llena',
    postClosed: 'Publicación cerrada',
    crewRoster: 'Lista de cuadrilla',
    noOneJoined: 'Nadie se ha unido a esta cuadrilla todavía.',
    joinedAt: 'Se unió',
    workedBefore: 'Ya trabajaron antes',
    contactCard: 'Tarjeta de contacto',
    phone: 'Teléfono',
    email: 'Correo',
    city: 'Ciudad',
    notAvailable: 'No disponible',
    rehireShare: 'Recontratar / compartir',
    markHired: 'Marcar contratado',
    moveBackToJoined: 'Volver a unido',
    translating: 'Traduciendo…',
    showOriginal: 'Ver original',
    translate: 'Traducir',
    translatedVersion: 'Versión traducida',
    heroBadge: 'Detalle de publicación',
    heroTitle: 'Una vista más limpia para tomar acción.',
    heroBody:
      'Ve la publicación completa, responde más rápido, revisa la cuadrilla y pasa de conversación a trabajo sin tanto ruido.',
    replies: 'Respuestas',
    addReply: 'Agregar respuesta',
    replyPlaceholder: 'Comparte tu consejo, experiencia o respuesta aquí.',
    postReply: 'Publicar respuesta',
    noReplies: 'Todavía no hay respuestas.',
    discussionThread: 'Hilo de discusión',
    backToFeed: 'Volver al feed'
  }
}

function MetaStat({ label, value }) {
  return (
    <div className="card-soft" style={{ minHeight: 92 }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--muted-soft)'
        }}
      >
        {label}
      </div>
      <div style={{ marginTop: 8, fontSize: 18, fontWeight: 900 }}>{value}</div>
    </div>
  )
}

export default function PostDetail({ lang: langProp = 'en' }) {
  const { id } = useParams()

  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [score, setScore] = useState(0)
  const [myVote, setMyVote] = useState(0)
  const [newComment, setNewComment] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [lang, setLang] = useState(langProp || localStorage.getItem('surplox_lang') || 'en')
  const [currentUserId, setCurrentUserId] = useState(null)

  const [crewMembers, setCrewMembers] = useState([])
  const [myCrewMembership, setMyCrewMembership] = useState(false)
  const [crewActionLoading, setCrewActionLoading] = useState(false)
  const [workedBeforeMap, setWorkedBeforeMap] = useState({})

  const [translatedPostBody, setTranslatedPostBody] = useState('')
  const [showTranslatedPost, setShowTranslatedPost] = useState(false)
  const [translatingPost, setTranslatingPost] = useState(false)

  const [translatedComments, setTranslatedComments] = useState({})
  const [visibleTranslatedComments, setVisibleTranslatedComments] = useState({})
  const [translatingCommentId, setTranslatingCommentId] = useState(null)

  const copy = UI[lang] || UI.en

  useEffect(() => {
    setLang(langProp || localStorage.getItem('surplox_lang') || 'en')
  }, [langProp])

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

  function getInviteUrl() {
    if (typeof window === 'undefined') return ''
    return `${window.location.origin}/p/${id}`
  }

  function getInviteText() {
    if (!post) return ''

    if (lang === 'es') {
      const tradePart = post.trade_name ? `${copy.trade}: ${post.trade_name}. ` : ''
      const zipPart = post.center_zip ? `${copy.zip}: ${post.center_zip}. ` : ''
      const startPart = post.start_date
        ? `${copy.start}: ${new Date(post.start_date).toLocaleDateString()}. `
        : ''
      const payPart = post.compensation ? `${copy.pay}: ${post.compensation}. ` : ''

      return `Mira esta publicación de Surplox: ${post.title}. ${tradePart}${zipPart}${startPart}${payPart}${getInviteUrl()}`
    }

    const tradePart = post.trade_name ? `Trade: ${post.trade_name}. ` : ''
    const zipPart = post.center_zip ? `ZIP: ${post.center_zip}. ` : ''
    const startPart = post.start_date
      ? `Start: ${new Date(post.start_date).toLocaleDateString()}. `
      : ''
    const payPart = post.compensation ? `Pay: ${post.compensation}. ` : ''

    return `Check out this Surplox post: ${post.title}. ${tradePart}${zipPart}${startPart}${payPart}${getInviteUrl()}`
  }

  async function copyInviteLink() {
    try {
      const url = getInviteUrl()
      if (!url) throw new Error(copy.inviteLinkUnavailable)

      await navigator.clipboard.writeText(url)
      setMsg(copy.inviteLinkCopied)
    } catch (err) {
      console.error(err)
      setMsg(copy.unableCopyInvite)
    }
  }

  async function shareInviteLink() {
    try {
      const url = getInviteUrl()
      const text = getInviteText()
      if (!url) throw new Error(copy.inviteLinkUnavailable)

      if (navigator.share) {
        await navigator.share({
          title: post?.title || 'Surplox crew post',
          text,
          url
        })
      } else {
        await copyInviteLink()
      }
    } catch (err) {
      if (err?.name === 'AbortError') return
      console.error(err)
      setMsg(copy.unableShareMenu)
    }
  }

  function openTextInvite() {
    try {
      const text = encodeURIComponent(getInviteText())
      window.open(`sms:?&body=${text}`, '_self')
    } catch (err) {
      console.error(err)
      setMsg(copy.unableOpenTextInvite)
    }
  }

  function openEmailInvite() {
    try {
      const subject = encodeURIComponent(post?.title || 'Surplox crew post')
      const body = encodeURIComponent(getInviteText())
      window.location.href = `mailto:?subject=${subject}&body=${body}`
    } catch (err) {
      console.error(err)
      setMsg(copy.unableOpenEmailInvite)
    }
  }

  async function copyWorkerProfile(userId) {
    try {
      const url = `${window.location.origin}/u/${userId}`
      await navigator.clipboard.writeText(url)
      setMsg(copy.workerProfileCopied)
    } catch (err) {
      console.error(err)
      setMsg(copy.unableCopyWorkerProfile)
    }
  }

  async function loadAll() {
    setLoading(true)
    setMsg('')

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const uid = sessionData.session?.user?.id || null
      setCurrentUserId(uid)

      let activeLang = langProp || localStorage.getItem('surplox_lang') || 'en'

      if (uid) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('preferred_language')
          .eq('user_id', uid)
          .maybeSingle()

        activeLang = prof?.preferred_language || activeLang
      }

      setLang(activeLang)
      localStorage.setItem('surplox_lang', activeLang)

      const activeCopy = UI[activeLang] || UI.en

      const { data: p, error: pErr } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          body,
          source_language,
          center_zip,
          radius_miles,
          created_at,
          trade_id,
          post_type,
          crew_status,
          needed_crew_size,
          compensation,
          start_date,
          author_id,
          trades(name),
          author_profile:profiles!posts_author_id_fkey(display_name, role, is_available)
        `)
        .eq('id', id)
        .maybeSingle()

      if (pErr) throw pErr
      if (!p) {
        setPost(null)
        setComments([])
        setCrewMembers([])
        setMyCrewMembership(false)
        setWorkedBeforeMap({})
        setScore(0)
        setMyVote(0)
        return
      }

      const detectedLang = detectLikelyLanguage(`${p.title || ''} ${p.body || ''}`)

      setPost({
        ...p,
        trade_name: p.trades?.name || t(activeLang, 'detail_general'),
        author_name: p.author_profile?.display_name || activeCopy.unknownMember,
        author_role: p.author_profile?.role || '',
        author_available: Boolean(p.author_profile?.is_available),
        source_language: p.source_language || detectedLang
      })

      const { data: c, error: cErr } = await supabase
        .from('comments')
        .select(`
          id,
          body,
          created_at,
          author_id,
          author_profile:profiles!comments_author_id_fkey(display_name, role, is_available)
        `)
        .eq('post_id', id)
        .order('created_at', { ascending: true })

      if (cErr) throw cErr

      setComments(
        (c || []).map((x) => ({
          ...x,
          author_name: x.author_profile?.display_name || activeCopy.unknownMember,
          author_role: x.author_profile?.role || '',
          author_available: Boolean(x.author_profile?.is_available),
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
            .select('user_id, display_name, role, is_available')
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
            display_name: profile?.display_name || activeCopy.unknownMember,
            role: profile?.role || '',
            is_available: Boolean(profile?.is_available),
            phone: contact?.phone || '',
            email: contact?.email || '',
            city: contact?.city || ''
          }
        })

        setCrewMembers(members)
        setMyCrewMembership(members.some((member) => member.user_id === uid))

        if (p.author_id && members.length > 0) {
          const counterpartIds = members.map((m) => m.user_id)

          const { data: relA } = await supabase
            .from('user_relationships')
            .select('source_user_id, target_user_id, relationship_type, created_at')
            .eq('source_user_id', p.author_id)
            .in('target_user_id', counterpartIds)

          const { data: relB } = await supabase
            .from('user_relationships')
            .select('source_user_id, target_user_id, relationship_type, created_at')
            .eq('target_user_id', p.author_id)
            .in('source_user_id', counterpartIds)

          const workedMap = {}
          ;[...(relA || []), ...(relB || [])].forEach((rel) => {
            const counterpart =
              rel.source_user_id === p.author_id ? rel.target_user_id : rel.source_user_id

            if (!workedMap[counterpart]) {
              workedMap[counterpart] = {
                count: 0,
                latest_type: rel.relationship_type,
                latest_at: rel.created_at
              }
            }

            workedMap[counterpart].count += 1

            if (
              !workedMap[counterpart].latest_at ||
              new Date(rel.created_at).getTime() > new Date(workedMap[counterpart].latest_at).getTime()
            ) {
              workedMap[counterpart].latest_type = rel.relationship_type
              workedMap[counterpart].latest_at = rel.created_at
            }
          })

          setWorkedBeforeMap(workedMap)
        } else {
          setWorkedBeforeMap({})
        }
      } else {
        setCrewMembers([])
        setMyCrewMembership(false)
        setWorkedBeforeMap({})
      }

      setTranslatedPostBody('')
      setShowTranslatedPost(false)
      setTranslatedComments({})
      setVisibleTranslatedComments({})
    } catch (err) {
      console.error(err)
      setMsg(err.message || t(lang, 'detail_load_error'))
      setPost(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, langProp])

  async function vote(val) {
    setMsg('')

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const uid = sessionData.session?.user?.id
      if (!uid) throw new Error(copy.notSignedIn)

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
      if (!uid) throw new Error(copy.notSignedIn)

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
          message: copy.replyNotification
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
      if (!uid) throw new Error(copy.notSignedIn)
      if (uid !== post.author_id) throw new Error(copy.onlyOwnerCrewStatus)

      const { error } = await supabase
        .from('posts')
        .update({ crew_status: nextStatus })
        .eq('id', id)

      if (error) throw error

      await loadAll()
    } catch (err) {
      console.error(err)
      setMsg(err.message || copy.unableUpdateCrewStatus)
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
      if (!uid) throw new Error(copy.notSignedIn)
      if (uid !== post.author_id) throw new Error(copy.onlyOwnerMemberStatus)

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
          message: copy.crewHiredNotification
        })
      }

      await loadAll()
    } catch (err) {
      console.error(err)
      setMsg(err.message || copy.unableUpdateMemberStatus)
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
      if (!uid) throw new Error(copy.notSignedIn)
      if (uid === post.author_id) throw new Error(copy.postOwnerCannotJoin)
      if ((post.crew_status || 'open') !== 'open') throw new Error(copy.crewNotOpen)

      const needed = Number(post.needed_crew_size || 0)
      if (needed > 0 && crewMembers.length >= needed) {
        throw new Error(copy.crewAlreadyFull)
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
        message: copy.crewJoinNotification
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
      setMsg(err.message || copy.unableJoinCrew)
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
      if (!uid) throw new Error(copy.notSignedIn)

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
      setMsg(err.message || copy.unableLeaveCrew)
    } finally {
      setCrewActionLoading(false)
    }
  }

  async function togglePostTranslation() {
    if (!post) return

    if (showTranslatedPost) {
      setShowTranslatedPost(false)
      return
    }

    try {
      setTranslatingPost(true)

      if (!translatedPostBody) {
        const translated = await translateText({
          text: post.body || '',
          from: post.source_language || detectLikelyLanguage(post.body || ''),
          to: lang
        })
        setTranslatedPostBody(translated)
      }

      setShowTranslatedPost(true)
    } catch (err) {
      console.error(err)
      setMsg(copy.unableTranslatePost)
    } finally {
      setTranslatingPost(false)
    }
  }

  async function toggleCommentTranslation(commentId) {
    const comment = comments.find((x) => x.id === commentId)
    if (!comment) return

    if (visibleTranslatedComments[commentId]) {
      setVisibleTranslatedComments((prev) => ({ ...prev, [commentId]: false }))
      return
    }

    try {
      setTranslatingCommentId(commentId)

      if (!translatedComments[commentId]) {
        const translated = await translateText({
          text: comment.body || '',
          from: comment.source_language || detectLikelyLanguage(comment.body || ''),
          to: lang
        })

        setTranslatedComments((prev) => ({
          ...prev,
          [commentId]: translated
        }))
      }

      setVisibleTranslatedComments((prev) => ({
        ...prev,
        [commentId]: true
      }))
    } catch (err) {
      console.error(err)
      setMsg(copy.unableTranslateReply)
    } finally {
      setTranslatingCommentId(null)
    }
  }

  const isOwner = useMemo(() => currentUserId && post?.author_id === currentUserId, [currentUserId, post])
  const typeStyles = getPostTypeStyles(post?.post_type || 'discussion')
  const postBodyToRender = showTranslatedPost ? translatedPostBody : post?.body || ''

  if (loading) {
    return <div className="card">{t(lang, 'detail_loading')}</div>
  }

  if (!post) {
    return (
      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="card-section-title">{t(lang, 'detail_not_found')}</div>
        <p className="card-section-subtitle" style={{ marginTop: 8 }}>
          {msg || t(lang, 'detail_not_found_body')}
        </p>
        <div style={{ marginTop: 14 }}>
          <Link className="btn primary" to="/feed">
            {t(lang, 'detail_return_feed')}
          </Link>
        </div>
      </div>
    )
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
          ...typeStyles.shell
        }}
      >
        <div className="badge" style={{ ...typeStyles.badge, marginBottom: 14 }}>
          {copy.heroBadge}
        </div>

        <div className="h1" style={{ maxWidth: 760 }}>
          {copy.heroTitle}
        </div>

        <p className="muted" style={{ marginTop: 12, maxWidth: 820, fontSize: 17, lineHeight: 1.7 }}>
          {copy.heroBody}
        </p>
      </div>

      <div className="card rounded-xl" style={{ padding: 0, overflow: 'hidden', ...typeStyles.shell }}>
        <div style={{ height: 6, background: typeStyles.accent }} />
        <div style={{ padding: 24 }}>
          <div className="postMeta" style={{ marginBottom: 12 }}>
            <span className="badge" style={typeStyles.badge}>
              {postTypeLabel(post.post_type || 'discussion', lang)}
            </span>

            {post.trade_name ? (
              <span className="badge" style={tradeBadgeStyle()}>
                {post.trade_name}
              </span>
            ) : null}

            {post.center_zip ? (
              <span className="badge">
                {copy.zip} {post.center_zip}
              </span>
            ) : null}

            {post.author_role ? (
              <span className="badge" style={roleBadgeStyle(post.author_role)}>
                {roleLabel(post.author_role, lang)}
              </span>
            ) : null}

            {post.author_available ? (
              <span className="badge" style={availabilityBadgeStyle(true)}>
                {copy.available}
              </span>
            ) : null}

            {post.post_type === 'need_crew' ? (
              <span className="badge" style={crewStatusBadgeStyle(post.crew_status || 'open')}>
                {crewStatusLabel(post.crew_status || 'open', lang)}
              </span>
            ) : null}
          </div>

          <div className="h1" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginTop: 0 }}>
            {post.title}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
              alignItems: 'center',
              marginTop: 10
            }}
          >
            <div className="postMeta">
              <span>{t(lang, 'detail_posted_by')}</span>
              <Link to={`/u/${post.author_id}`} style={{ fontWeight: 800, color: 'var(--text)' }}>
                {post.author_name}
              </Link>
              <span>•</span>
              <span>{timeAgo(post.created_at, lang)}</span>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Link className="btn small" to="/feed">
                {copy.backToFeed}
              </Link>
              <button className="btn small" onClick={copyInviteLink}>
                {copy.copyInviteLink}
              </button>
              <button className="btn small" onClick={shareInviteLink}>
                {copy.share}
              </button>
            </div>
          </div>

          <div className="grid two" style={{ marginTop: 18 }}>
            <MetaStat label="Score" value={score} />
            <MetaStat label="Radius" value={`${post.radius_miles || 0} mi`} />
            {post.compensation ? <MetaStat label={copy.payRate} value={post.compensation} /> : null}
            {post.start_date ? (
              <MetaStat
                label={copy.start}
                value={new Date(post.start_date).toLocaleDateString()}
              />
            ) : null}
            {post.post_type === 'need_crew' && post.needed_crew_size ? (
              <MetaStat label={copy.crewNeeded} value={post.needed_crew_size} />
            ) : null}
            {post.post_type === 'need_crew' ? (
              <MetaStat label={copy.filled} value={`${crewMembers.length}`} />
            ) : null}
          </div>

          <div style={{ marginTop: 18, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              className={myVote === 1 ? 'btn primary' : 'btn'}
              onClick={() => vote(1)}
            >
              {myVote === 1 ? t(lang, 'detail_upvoted') : t(lang, 'detail_upvote')}
            </button>

            <button
              className={myVote === -1 ? 'btn primary' : 'btn'}
              onClick={() => vote(-1)}
            >
              {myVote === -1 ? t(lang, 'detail_downvoted') : t(lang, 'detail_downvote')}
            </button>

            <button className="btn" onClick={togglePostTranslation} disabled={translatingPost}>
              {translatingPost
                ? copy.translating
                : showTranslatedPost
                  ? copy.showOriginal
                  : copy.translate}
            </button>
          </div>

          <div
            style={{
              marginTop: 18,
              fontSize: 15,
              lineHeight: 1.75,
              whiteSpace: 'pre-wrap'
            }}
          >
            {postBodyToRender}
          </div>

          {showTranslatedPost ? (
            <div className="card-soft" style={{ marginTop: 14 }}>
              <div className="card-section-title" style={{ fontSize: 15 }}>
                {copy.translatedVersion}
              </div>
            </div>
          ) : null}

          {post.post_type === 'need_crew' ? (
            <div className="grid two" style={{ marginTop: 20 }}>
              <div className="card-soft" style={{ background: '#fffaf0' }}>
                <div className="card-section-title" style={{ fontSize: 16 }}>
                  {copy.crewBuilder}
                </div>
                <p className="card-section-subtitle" style={{ marginTop: 8 }}>
                  {copy.crewBuilderBody}
                </p>

                <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {isOwner ? (
                    <span className="badge" style={{ background: '#111111', color: '#ffffff' }}>
                      {copy.youPostedThis}
                    </span>
                  ) : null}

                  {!isOwner && !myCrewMembership && (post.crew_status || 'open') === 'open' ? (
                    <button className="btn primary" onClick={joinCrew} disabled={crewActionLoading}>
                      {crewActionLoading ? copy.joining : copy.joinCrew}
                    </button>
                  ) : null}

                  {!isOwner && myCrewMembership ? (
                    <button className="btn" onClick={leaveCrew} disabled={crewActionLoading}>
                      {crewActionLoading ? copy.leaving : copy.leaveCrew}
                    </button>
                  ) : null}

                  {(post.crew_status || 'open') === 'full' ? (
                    <span className="badge" style={{ background: '#fff0b4', color: '#111111' }}>
                      {copy.crewFull}
                    </span>
                  ) : null}

                  {(post.crew_status || 'open') === 'closed' ? (
                    <span className="badge" style={{ background: '#111111', color: '#ffffff' }}>
                      {copy.postClosed}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="card-soft" style={{ background: '#f8f8f4' }}>
                <div className="card-section-title" style={{ fontSize: 16 }}>
                  {copy.inviteCrew}
                </div>
                <p className="card-section-subtitle" style={{ marginTop: 8 }}>
                  {copy.inviteCrewBody}
                </p>

                <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button className="btn small primary" onClick={copyInviteLink}>
                    {copy.copyInviteLink}
                  </button>
                  <button className="btn small" onClick={shareInviteLink}>
                    {copy.share}
                  </button>
                  <button className="btn small" onClick={openTextInvite}>
                    {copy.textInvite}
                  </button>
                  <button className="btn small" onClick={openEmailInvite}>
                    {copy.emailInvite}
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {isOwner && post.post_type === 'need_crew' ? (
            <div className="card rounded-xl" style={{ marginTop: 18, padding: 22 }}>
              <div className="card-section-title">{copy.contractorControls}</div>
              <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button className="btn" onClick={() => updateCrewStatus('open')} disabled={crewActionLoading}>
                  {crewActionLoading ? copy.saving : copy.markOpen}
                </button>
                <button className="btn" onClick={() => updateCrewStatus('full')} disabled={crewActionLoading}>
                  {crewActionLoading ? copy.saving : copy.markCrewFull}
                </button>
                <button className="btn danger" onClick={() => updateCrewStatus('closed')} disabled={crewActionLoading}>
                  {crewActionLoading ? copy.saving : copy.closePost}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {post.post_type === 'need_crew' ? (
        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">{copy.crewRoster}</div>
          <p className="card-section-subtitle" style={{ marginTop: 8 }}>
            {crewMembers.length === 0 ? copy.noOneJoined : ''}
          </p>

          {crewMembers.length > 0 ? (
            <div className="list" style={{ marginTop: 14 }}>
              {crewMembers.map((member) => {
                const workedBefore = workedBeforeMap[member.user_id]

                return (
                  <div key={member.user_id} className="card-soft" style={{ background: '#ffffff' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 12,
                        flexWrap: 'wrap',
                        alignItems: 'flex-start'
                      }}
                    >
                      <div style={{ flex: '1 1 360px' }}>
                        <div className="postMeta">
                          <Link to={`/u/${member.user_id}`} style={{ fontWeight: 800, color: 'var(--text)' }}>
                            {member.display_name}
                          </Link>

                          {member.role ? (
                            <span className="badge" style={roleBadgeStyle(member.role)}>
                              {roleLabel(member.role, lang)}
                            </span>
                          ) : null}

                          {member.is_available ? (
                            <span className="badge" style={availabilityBadgeStyle(true)}>
                              {copy.available}
                            </span>
                          ) : (
                            <span className="badge">{copy.notAvailable}</span>
                          )}

                          <span className="badge" style={memberStatusBadgeStyle(member.status)}>
                            {memberStatusLabel(member.status, lang)}
                          </span>
                        </div>

                        <div className="muted" style={{ marginTop: 10 }}>
                          {copy.joinedAt}: {new Date(member.created_at).toLocaleString()}
                        </div>

                        {workedBefore ? (
                          <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <span className="badge">
                              {copy.workedBefore}: {workedBefore.count}
                            </span>
                            <span className="badge">{workedBefore.latest_type}</span>
                          </div>
                        ) : null}

                        {isOwner ? (
                          <div className="grid two" style={{ marginTop: 12 }}>
                            {member.phone ? (
                              <div className="card-soft">
                                <div className="card-section-title" style={{ fontSize: 14 }}>
                                  {copy.phone}
                                </div>
                                <div style={{ marginTop: 6 }}>{formatPhone(member.phone)}</div>
                              </div>
                            ) : null}

                            {member.email ? (
                              <div className="card-soft">
                                <div className="card-section-title" style={{ fontSize: 14 }}>
                                  {copy.email}
                                </div>
                                <div style={{ marginTop: 6 }}>{member.email}</div>
                              </div>
                            ) : null}

                            {member.city ? (
                              <div className="card-soft">
                                <div className="card-section-title" style={{ fontSize: 14 }}>
                                  {copy.city}
                                </div>
                                <div style={{ marginTop: 6 }}>{member.city}</div>
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </div>

                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <Link className="btn small primary" to={`/u/${member.user_id}`}>
                          {copy.viewProfile}
                        </Link>

                        <button className="btn small" onClick={() => copyWorkerProfile(member.user_id)}>
                          {copy.rehireShare}
                        </button>

                        {isOwner && member.status !== 'hired' ? (
                          <button
                            className="btn small"
                            onClick={() => updateMemberStatus(member.user_id, 'hired')}
                            disabled={crewActionLoading}
                          >
                            {copy.markHired}
                          </button>
                        ) : null}

                        {isOwner && member.status === 'hired' ? (
                          <button
                            className="btn small"
                            onClick={() => updateMemberStatus(member.user_id, 'joined')}
                            disabled={crewActionLoading}
                          >
                            {copy.moveBackToJoined}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="card-section-title">{copy.discussionThread}</div>
        <p className="card-section-subtitle" style={{ marginTop: 8 }}>
          {comments.length === 0 ? copy.noReplies : `${copy.replies}: ${comments.length}`}
        </p>

        <div className="card-soft" style={{ marginTop: 14 }}>
          <div className="card-section-title" style={{ fontSize: 16 }}>
            {copy.addReply}
          </div>
          <textarea
            className="input"
            style={{ marginTop: 12 }}
            value={newComment}
            placeholder={copy.replyPlaceholder}
            onChange={(e) => setNewComment(e.target.value)}
          />

          <div style={{ marginTop: 12 }}>
            <button className="btn primary" onClick={addComment}>
              {copy.postReply}
            </button>
          </div>
        </div>

        {comments.length > 0 ? (
          <div className="list" style={{ marginTop: 14 }}>
            {comments.map((comment) => (
              <div key={comment.id} className="card-soft" style={{ background: '#ffffff' }}>
                <div className="postMeta">
                  <Link to={`/u/${comment.author_id}`} style={{ fontWeight: 800, color: 'var(--text)' }}>
                    {comment.author_name}
                  </Link>

                  {comment.author_role ? (
                    <span className="badge" style={roleBadgeStyle(comment.author_role)}>
                      {roleLabel(comment.author_role, lang)}
                    </span>
                  ) : null}

                  {comment.author_available ? (
                    <span className="badge" style={availabilityBadgeStyle(true)}>
                      {copy.available}
                    </span>
                  ) : null}

                  <span>{timeAgo(comment.created_at, lang)}</span>
                </div>

                <div style={{ marginTop: 12, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                  {visibleTranslatedComments[comment.id]
                    ? translatedComments[comment.id]
                    : comment.body}
                </div>

                <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Link className="btn small" to={`/u/${comment.author_id}`}>
                    {copy.viewProfile}
                  </Link>
                  <button
                    className="btn small"
                    onClick={() => toggleCommentTranslation(comment.id)}
                    disabled={translatingCommentId === comment.id}
                  >
                    {translatingCommentId === comment.id
                      ? copy.translating
                      : visibleTranslatedComments[comment.id]
                        ? copy.showOriginal
                        : copy.translate}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}