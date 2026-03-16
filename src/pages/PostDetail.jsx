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
    supplier: { en: 'Supplier', es: 'Proveedor' },
    driver: { en: 'Driver', es: 'Conductor' },
    mechanic: { en: 'Mechanic', es: 'Mecánico' }
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

function availabilityStatusLabel(status, lang) {
  const map = {
    available_now: { en: 'Available Now', es: 'Disponible ahora' },
    available_this_week: { en: 'Available This Week', es: 'Disponible esta semana' },
    busy: { en: 'Busy', es: 'Ocupado' }
  }
  return map[status]?.[lang] || map[status]?.en || status
}

function detectSupportType(serviceTags = [], vehicleType = '') {
  const repairTags = new Set([
    'diesel_mechanic',
    'heavy_equipment_repair',
    'trailer_repair',
    'emergency_repair',
    'jobsite_service'
  ])

  if (serviceTags.some((tag) => repairTags.has(tag))) {
    return 'equipment_fleet_repair'
  }

  if (serviceTags.includes('local_runs') || serviceTags.includes('last_mile_delivery') || vehicleType === 'cargo_van') {
    return 'cargo_van_delivery'
  }

  return 'material_delivery'
}

function supportTypeLabel(value, lang) {
  const map = {
    material_delivery: {
      en: 'Material Delivery / Hot Shot',
      es: 'Entrega de materiales / Hot Shot'
    },
    cargo_van_delivery: {
      en: 'Cargo Van / Local Delivery',
      es: 'Cargo Van / Entrega local'
    },
    equipment_fleet_repair: {
      en: 'Equipment / Fleet Repair',
      es: 'Reparación de equipo / flota'
    }
  }
  return map[value]?.[lang] || map[value]?.en || value
}

function getPostTypeStyles(type, categoryGroup, isUrgent) {
  if (categoryGroup === 'jobsite_support') {
    return {
      shell: {
        background: isUrgent
          ? 'linear-gradient(180deg, #fff4da 0%, #ffffff 100%)'
          : 'linear-gradient(180deg, #f8f7ef 0%, #ffffff 100%)'
      },
      badge: {
        background: isUrgent ? '#ffde59' : '#f1e7a8',
        color: '#111111'
      },
      accent: isUrgent ? '#d4b21f' : '#111111',
      softPanel: isUrgent ? '#fff4da' : '#f8f7ef'
    }
  }

  if (type === 'need_crew') {
    return {
      shell: {
        background: 'linear-gradient(180deg, #fffaf0 0%, #ffffff 100%)'
      },
      badge: {
        background: '#ffde59',
        color: '#111111'
      },
      accent: '#ffde59',
      softPanel: '#fffaf0'
    }
  }

  if (type === 'looking_for_work') {
    return {
      shell: {
        background: 'linear-gradient(180deg, #f8f7ef 0%, #ffffff 100%)'
      },
      badge: {
        background: '#fff0b4',
        color: '#111111'
      },
      accent: '#d4b21f',
      softPanel: '#f8f7ef'
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
    accent: '#d9d7cc',
    softPanel: '#f8f8f4'
  }
}

function roleBadgeStyle(role) {
  if (role === 'contractor') return { background: '#111111', color: '#ffffff' }
  if (role === 'subcontractor') return { background: '#fff0b4', color: '#111111' }
  if (role === 'laborer') return { background: '#ecebe3', color: '#111111' }
  if (role === 'supplier') return { background: '#f1e7a8', color: '#111111' }
  if (role === 'driver') return { background: '#d8ecff', color: '#0d3f73' }
  if (role === 'mechanic') return { background: '#e8defa', color: '#4d2f82' }
  return {}
}

function tradeBadgeStyle() {
  return { background: '#f1f1eb', color: '#111111' }
}

function urgentBadgeStyle() {
  return { background: '#111111', color: '#ffffff' }
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

function formatTagLabel(tag) {
  const map = {
    material_delivery: 'Material Delivery',
    hot_shot: 'Hot Shot',
    last_mile_delivery: 'Last Mile Delivery',
    local_runs: 'Local Runs',
    same_day_delivery: 'Same Day Delivery',
    long_distance: 'Long Distance',
    pickup_truck: 'Pickup Truck',
    cargo_van: 'Cargo Van',
    flatbed_trailer: 'Flatbed Trailer',
    gooseneck_trailer: 'Gooseneck Trailer',
    diesel_mechanic: 'Diesel Mechanic',
    heavy_equipment_repair: 'Heavy Equipment Repair',
    trailer_repair: 'Trailer Repair',
    emergency_repair: 'Emergency Repair',
    jobsite_service: 'Jobsite Service',
    mobile_repair_truck: 'Mobile Repair Truck',
    diesel_diagnostics: 'Diesel Diagnostics',
    trailer_brake_tools: 'Trailer Brake Tools'
  }
  return map[tag] || tag
}

function formatMaterialCategoryLabel(value, lang = 'en') {
  const map = {
    lumber: { en: 'Lumber', es: 'Madera' },
    concrete: { en: 'Concrete', es: 'Concreto' },
    steel: { en: 'Steel', es: 'Acero' },
    electrical: { en: 'Electrical', es: 'Eléctrico' },
    plumbing: { en: 'Plumbing', es: 'Plomería' },
    drywall: { en: 'Drywall', es: 'Tablaroca' },
    fasteners: { en: 'Fasteners', es: 'Sujetadores' },
    equipment_rental: { en: 'Equipment Rental', es: 'Renta de equipo' },
    tools: { en: 'Tools', es: 'Herramientas' },
    safety_equipment: { en: 'Safety Equipment', es: 'Equipo de seguridad' }
  }
  return map[value]?.[lang] || map[value]?.en || value
}

function vehicleTypeLabel(value, lang = 'en') {
  const map = {
    pickup_truck: { en: 'Pickup Truck', es: 'Pickup' },
    cargo_van: { en: 'Cargo Van', es: 'Cargo van' },
    box_truck: { en: 'Box Truck', es: 'Camión caja' },
    flatbed_truck: { en: 'Flatbed Truck', es: 'Camión plataforma' }
  }
  return map[value]?.[lang] || map[value]?.en || value || '—'
}

function trailerTypeLabel(value, lang = 'en') {
  const map = {
    none: { en: 'No Trailer', es: 'Sin remolque' },
    no_trailer: { en: 'No Trailer', es: 'Sin remolque' },
    utility_trailer: { en: 'Utility Trailer', es: 'Remolque utilitario' },
    flatbed_trailer: { en: 'Flatbed Trailer', es: 'Remolque plataforma' },
    gooseneck_trailer: { en: 'Gooseneck Trailer', es: 'Remolque gooseneck' },
    equipment_trailer: { en: 'Equipment Trailer', es: 'Remolque para equipo' },
    enclosed_trailer: { en: 'Enclosed Trailer', es: 'Remolque cerrado' }
  }
  return map[value]?.[lang] || map[value]?.en || value || '—'
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
    unableLoadImage: 'Unable to load image.',
    trade: 'Trade',
    zip: 'ZIP',
    start: 'Start',
    pay: 'Pay',
    viewProfile: 'View Profile',
    viewStorefront: 'View Storefront',
    available: 'Available',
    category: 'Category',
    supportType: 'Support Type',
    serviceTags: 'Services',
    equipmentTags: 'Equipment',
    photos: 'Photos',
    urgent: 'Urgent',
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
      'Share this post with workers, runners, repair support, subs, or people already in your network.',
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
    backToFeed: 'Back to Feed',
    jobsiteSupport: 'Jobsite Support',
    trades: 'Trades',
    supplierBusiness: 'Supplier Business',
    supplierMaterials: 'Materials',
    businessZip: 'Business ZIP',
    deliveryRadius: 'Delivery Radius',
    storefront: 'Storefront',
    miles: 'miles',
    vehicleType: 'Vehicle Type',
    trailerType: 'Trailer Type',
    trailerLength: 'Trailer Length',
    payloadCapacity: 'Payload Capacity',
    feetShort: 'ft',
    poundsShort: 'lbs',
    driverCapabilities: 'Driver Capabilities',
    noTrailer: 'No Trailer'
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
    unableLoadImage: 'No se pudo cargar la imagen.',
    trade: 'Oficio',
    zip: 'Código postal',
    start: 'Inicio',
    pay: 'Pago',
    viewProfile: 'Ver perfil',
    viewStorefront: 'Ver tienda',
    available: 'Disponible',
    category: 'Categoría',
    supportType: 'Tipo de soporte',
    serviceTags: 'Servicios',
    equipmentTags: 'Equipo',
    photos: 'Fotos',
    urgent: 'Urgente',
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
      'Comparte esta publicación con trabajadores, runners, soporte de reparación, subcontratistas o gente de tu red.',
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
    backToFeed: 'Volver al feed',
    jobsiteSupport: 'Soporte de obra',
    trades: 'Oficios',
    supplierBusiness: 'Negocio proveedor',
    supplierMaterials: 'Materiales',
    businessZip: 'ZIP comercial',
    deliveryRadius: 'Radio de entrega',
    storefront: 'Tienda física',
    miles: 'millas',
    vehicleType: 'Tipo de vehículo',
    trailerType: 'Tipo de remolque',
    trailerLength: 'Largo del remolque',
    payloadCapacity: 'Capacidad de carga',
    feetShort: 'ft',
    poundsShort: 'lbs',
    driverCapabilities: 'Capacidades del conductor',
    noTrailer: 'Sin remolque'
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
  const [imageUrls, setImageUrls] = useState({})

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

  async function loadSignedUrls(paths = []) {
    if (!paths.length) {
      setImageUrls({})
      return
    }

    try {
      const entries = await Promise.all(
        paths.map(async (path) => {
          const { data, error } = await supabase.storage
            .from('post-images')
            .createSignedUrl(path, 60 * 60)

          if (error) {
            console.error('Signed URL error:', error)
            return [path, null]
          }

          return [path, data?.signedUrl || null]
        })
      )

      setImageUrls(Object.fromEntries(entries))
    } catch (err) {
      console.error(err)
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
      if (!url) throw new Error(copy.inviteLinkUnavailable)

      if (navigator.share) {
        await navigator.share({
          title: post?.title || 'Surplox',
          text: getInviteText(),
          url
        })
      } else {
        await navigator.clipboard.writeText(url)
        setMsg(copy.inviteLinkCopied)
      }
    } catch (err) {
      console.error(err)
      setMsg(copy.unableShareMenu)
    }
  }

  async function textInviteLink() {
    try {
      const text = getInviteText()
      if (!text) throw new Error(copy.unableOpenTextInvite)
      window.location.href = `sms:?&body=${encodeURIComponent(text)}`
    } catch (err) {
      console.error(err)
      setMsg(copy.unableOpenTextInvite)
    }
  }

  async function emailInviteLink() {
    try {
      const text = getInviteText()
      if (!text) throw new Error(copy.unableOpenEmailInvite)
      const subject = post?.title || 'Surplox'
      window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`
    } catch (err) {
      console.error(err)
      setMsg(copy.unableOpenEmailInvite)
    }
  }

  async function copyWorkerProfileLink(userId) {
    try {
      const url = `${window.location.origin}/u/${userId}`
      await navigator.clipboard.writeText(url)
      setMsg(copy.workerProfileCopied)
    } catch (err) {
      console.error(err)
      setMsg(copy.unableCopyWorkerProfile)
    }
  }

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setMsg('')

      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const uid = sessionData.session?.user?.id || null
        if (!active) return
        setCurrentUserId(uid)

        const { data: postRow, error: postErr } = await supabase
          .from('posts')
          .select(
            `
            *,
            author:profiles!posts_author_id_fkey(
              user_id,
              display_name,
              role,
              is_available,
              availability_status,
              contractor_verified,
              category_group,
              service_tags,
              equipment_tags,
              trade_id,
              home_zip,
              travel_radius_miles,
              bio,
              business_name,
              business_address,
              business_zip,
              materials_categories,
              storefront,
              delivery_radius,
              vehicle_type,
              trailer_type,
              trailer_length,
              payload_capacity,
              trades(name)
            ),
            trades(name)
          `
          )
          .eq('id', id)
          .maybeSingle()

        if (postErr) throw postErr
        if (!postRow) throw new Error('Post not found.')

        const serviceTags = Array.isArray(postRow.service_tags) ? postRow.service_tags : []
        const equipmentTags = Array.isArray(postRow.equipment_tags) ? postRow.equipment_tags : []
        const categoryGroup = postRow.category_group || 'trade'
        const supportType =
          categoryGroup === 'jobsite_support'
            ? postRow.support_type || detectSupportType(serviceTags)
            : null

        const author = postRow.author || {}
        const authorServiceTags = Array.isArray(author.service_tags) ? author.service_tags : []
        const authorEquipmentTags = Array.isArray(author.equipment_tags) ? author.equipment_tags : []
        const authorCategoryGroup = author.category_group || 'trade'
        const authorSupportType =
          authorCategoryGroup === 'jobsite_support'
            ? detectSupportType(authorServiceTags, author.vehicle_type || '')
            : null

        const normalizedPost = {
          ...postRow,
          service_tags: serviceTags,
          equipment_tags: equipmentTags,
          category_group: categoryGroup,
          support_type: supportType,
          trade_name: postRow.trades?.name || '',
          author_name: author.display_name || copy.unknownMember,
          author_role: author.role || '',
          author_is_available: Boolean(author.is_available),
          author_availability_status: author.availability_status || '',
          author_contractor_verified: Boolean(author.contractor_verified),
          author_category_group: authorCategoryGroup,
          author_service_tags: authorServiceTags,
          author_equipment_tags: authorEquipmentTags,
          author_support_type: authorSupportType,
          author_trade_name: author.trades?.name || '',
          author_home_zip: author.home_zip || '',
          author_travel_radius_miles: author.travel_radius_miles || 0,
          author_bio: author.bio || '',
          author_business_name: author.business_name || '',
          author_business_address: author.business_address || '',
          author_business_zip: author.business_zip || '',
          author_materials_categories: Array.isArray(author.materials_categories)
            ? author.materials_categories
            : [],
          author_storefront: Boolean(author.storefront),
          author_delivery_radius: author.delivery_radius || 0,
          author_vehicle_type: author.vehicle_type || '',
          author_trailer_type: author.trailer_type || '',
          author_trailer_length: author.trailer_length || 0,
          author_payload_capacity: author.payload_capacity || 0
        }

        if (!active) return
        setPost(normalizedPost)
        setTranslatedPostBody('')
        setShowTranslatedPost(false)

        await loadSignedUrls(Array.isArray(postRow.image_paths) ? postRow.image_paths : [])

        const { data: commentRows, error: commentsErr } = await supabase
          .from('comments')
          .select(
            `
            *,
            author:profiles!comments_author_id_fkey(
              user_id,
              display_name,
              role
            )
          `
          )
          .eq('post_id', id)
          .order('created_at', { ascending: true })

        if (commentsErr) throw commentsErr

        if (!active) return
        setComments(
          (commentRows || []).map((row) => ({
            ...row,
            author_name: row.author?.display_name || copy.unknownMember,
            author_role: row.author?.role || ''
          }))
        )

        const { data: voteRows, error: votesErr } = await supabase
          .from('votes')
          .select('*')
          .eq('post_id', id)

        if (votesErr) throw votesErr

        if (!active) return
        setScore((voteRows || []).reduce((sum, row) => sum + Number(row.value || 0), 0))
        setMyVote(Number((voteRows || []).find((row) => row.user_id === uid)?.value || 0))

        if (normalizedPost.post_type === 'need_crew') {
          const { data: membershipRows, error: membersErr } = await supabase
            .from('crew_memberships')
            .select(
              `
              *,
              member:profiles!crew_memberships_user_id_fkey(
                user_id,
                display_name,
                role,
                is_available,
                availability_status,
                category_group,
                service_tags,
                equipment_tags,
                trade_id,
                home_zip,
                travel_radius_miles,
                bio,
                trades(name)
              )
            `
            )
            .eq('post_id', id)
            .order('created_at', { ascending: true })

          if (membersErr) throw membersErr

          const normalizedMembers = (membershipRows || []).map((row) => {
            const member = row.member || {}
            const memberServiceTags = Array.isArray(member.service_tags) ? member.service_tags : []
            const memberEquipmentTags = Array.isArray(member.equipment_tags) ? member.equipment_tags : []
            const memberCategoryGroup = member.category_group || 'trade'
            const memberSupportType =
              memberCategoryGroup === 'jobsite_support'
                ? detectSupportType(memberServiceTags)
                : null

            return {
              ...row,
              display_name: member.display_name || copy.unknownMember,
              role: member.role || '',
              is_available: Boolean(member.is_available),
              availability_status: member.availability_status || '',
              category_group: memberCategoryGroup,
              service_tags: memberServiceTags,
              equipment_tags: memberEquipmentTags,
              support_type: memberSupportType,
              trade_name: member.trades?.name || '',
              home_zip: member.home_zip || '',
              travel_radius_miles: member.travel_radius_miles || 0,
              bio: member.bio || ''
            }
          })

          if (!active) return
          setCrewMembers(normalizedMembers)
          setMyCrewMembership(Boolean(uid && normalizedMembers.find((m) => m.user_id === uid)))

          const ids = Array.from(
            new Set([normalizedPost.author_id, ...normalizedMembers.map((m) => m.user_id)].filter(Boolean))
          )

          if (ids.length > 1) {
            const { data: relationshipRows, error: relErr } = await supabase
              .from('user_relationships')
              .select('source_user_id,target_user_id,relationship_type')
              .in('source_user_id', ids)
              .in('target_user_id', ids)

            if (relErr) throw relErr

            const nextWorkedMap = {}
            ;(relationshipRows || []).forEach((rel) => {
              if (
                rel.relationship_type === 'hired_from_crew_post' ||
                rel.relationship_type === 'joined_crew_post'
              ) {
                nextWorkedMap[`${rel.source_user_id}:${rel.target_user_id}`] = true
                nextWorkedMap[`${rel.target_user_id}:${rel.source_user_id}`] = true
              }
            })

            if (!active) return
            setWorkedBeforeMap(nextWorkedMap)
          } else {
            if (!active) return
            setWorkedBeforeMap({})
          }
        } else {
          if (!active) return
          setCrewMembers([])
          setMyCrewMembership(false)
          setWorkedBeforeMap({})
        }
      } catch (err) {
        console.error(err)
        if (!active) return
        setMsg(err.message || 'Unable to load post.')
      } finally {
        if (!active) return
        setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [id, langProp])

  const currentCommentLang = useMemo(() => detectLikelyLanguage(newComment || ''), [newComment])

  const postLang = useMemo(() => {
    return detectLikelyLanguage(post?.body || '')
  }, [post?.body])

  const renderedPostBody = useMemo(() => {
    if (!post?.body) return ''
    if (showTranslatedPost && translatedPostBody) return translatedPostBody
    return post.body
  }, [post?.body, showTranslatedPost, translatedPostBody])

  async function translatePostBody() {
    try {
      if (!post?.body) return
      if (postLang === lang) return

      if (translatedPostBody) {
        setShowTranslatedPost((prev) => !prev)
        return
      }

      setTranslatingPost(true)
      const translated = await translateText({
        text: post.body,
        from: postLang,
        to: lang
      })
      setTranslatedPostBody(translated)
      setShowTranslatedPost(true)
    } catch (err) {
      console.error(err)
      setMsg(copy.unableTranslatePost)
    } finally {
      setTranslatingPost(false)
    }
  }

  async function vote(value) {
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const uid = sessionData.session?.user?.id

      if (!uid) {
        setMsg(copy.notSignedIn)
        return
      }

      const { error } = await supabase
        .from('votes')
        .upsert({
          user_id: uid,
          post_id: id,
          value
        })

      if (error) throw error

      setMyVote(value)

      const { data: votes } = await supabase
        .from('votes')
        .select('value')
        .eq('post_id', id)

      setScore((votes || []).reduce((s, v) => s + Number(v.value || 0), 0))
    } catch (err) {
      console.error(err)
      setMsg(err.message)
    }
  }

  async function addComment() {
    if (!newComment.trim()) return

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const uid = sessionData.session?.user?.id

      if (!uid) {
        setMsg(copy.notSignedIn)
        return
      }

      const { error } = await supabase.from('comments').insert({
        post_id: id,
        author_id: uid,
        body: newComment.trim()
      })

      if (error) throw error

      if (post?.author_id && post.author_id !== uid) {
        await createNotification({
          userId: post.author_id,
          actorUserId: uid,
          postId: id,
          type: 'reply',
          message: copy.replyNotification
        })
      }

      setNewComment('')

      const { data } = await supabase
        .from('comments')
        .select(
          `
          *,
          author:profiles!comments_author_id_fkey(
            user_id,
            display_name,
            role
          )
        `
        )
        .eq('post_id', id)
        .order('created_at', { ascending: true })

      setComments(
        (data || []).map((row) => ({
          ...row,
          author_name: row.author?.display_name || copy.unknownMember,
          author_role: row.author?.role || ''
        }))
      )
    } catch (err) {
      console.error(err)
      setMsg(err.message)
    }
  }

  async function changeCrewStatus(status) {
    try {
      if (currentUserId !== post.author_id) {
        setMsg(copy.onlyOwnerCrewStatus)
        return
      }

      setCrewActionLoading(true)

      const { error } = await supabase
        .from('posts')
        .update({ crew_status: status })
        .eq('id', id)

      if (error) throw error

      setPost((prev) => ({ ...prev, crew_status: status }))
    } catch (err) {
      console.error(err)
      setMsg(copy.unableUpdateCrewStatus)
    } finally {
      setCrewActionLoading(false)
    }
  }

  async function changeMemberStatus(userId, status) {
    try {
      if (currentUserId !== post.author_id) {
        setMsg(copy.onlyOwnerMemberStatus)
        return
      }

      setCrewActionLoading(true)

      const { error } = await supabase
        .from('crew_memberships')
        .update({ status })
        .eq('post_id', id)
        .eq('user_id', userId)

      if (error) throw error

      if (status === 'hired') {
        await createNotification({
          userId,
          actorUserId: currentUserId,
          postId: id,
          type: 'crew_hired',
          message: copy.crewHiredNotification
        })

        const { error: relErr } = await supabase.from('user_relationships').upsert({
          source_user_id: post.author_id,
          target_user_id: userId,
          relationship_type: 'hired_from_crew_post',
          post_id: id
        })

        if (relErr) console.error(relErr)
      }

      setCrewMembers((prev) => prev.map((m) => (m.user_id === userId ? { ...m, status } : m)))
    } catch (err) {
      console.error(err)
      setMsg(copy.unableUpdateMemberStatus)
    } finally {
      setCrewActionLoading(false)
    }
  }

  async function joinCrew() {
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const uid = sessionData.session?.user?.id

      if (!uid) {
        setMsg(copy.notSignedIn)
        return
      }

      if (uid === post.author_id) {
        setMsg(copy.postOwnerCannotJoin)
        return
      }

      if (post.crew_status !== 'open') {
        setMsg(copy.crewNotOpen)
        return
      }

      if (post.needed_count && crewMembers.length >= post.needed_count) {
        setMsg(copy.crewAlreadyFull)
        return
      }

      setCrewActionLoading(true)

      const { error } = await supabase
        .from('crew_memberships')
        .insert({
          post_id: id,
          user_id: uid,
          status: 'joined'
        })

      if (error) throw error

      await createNotification({
        userId: post.author_id,
        actorUserId: uid,
        postId: id,
        type: 'crew_join',
        message: copy.crewJoinNotification
      })

      const { error: relErr } = await supabase.from('user_relationships').upsert({
        source_user_id: uid,
        target_user_id: post.author_id,
        relationship_type: 'joined_crew_post',
        post_id: id
      })

      if (relErr) console.error(relErr)

      const { data } = await supabase
        .from('crew_memberships')
        .select(
          `
          *,
          member:profiles!crew_memberships_user_id_fkey(
            user_id,
            display_name,
            role,
            is_available,
            availability_status,
            category_group,
            service_tags,
            equipment_tags,
            trade_id,
            home_zip,
            travel_radius_miles,
            bio,
            trades(name)
          )
        `
        )
        .eq('post_id', id)
        .order('created_at', { ascending: true })

      const normalizedMembers = (data || []).map((row) => {
        const member = row.member || {}
        const memberServiceTags = Array.isArray(member.service_tags) ? member.service_tags : []
        const memberEquipmentTags = Array.isArray(member.equipment_tags) ? member.equipment_tags : []
        const memberCategoryGroup = member.category_group || 'trade'
        const memberSupportType =
          memberCategoryGroup === 'jobsite_support'
            ? detectSupportType(memberServiceTags)
            : null

        return {
          ...row,
          display_name: member.display_name || copy.unknownMember,
          role: member.role || '',
          is_available: Boolean(member.is_available),
          availability_status: member.availability_status || '',
          category_group: memberCategoryGroup,
          service_tags: memberServiceTags,
          equipment_tags: memberEquipmentTags,
          support_type: memberSupportType,
          trade_name: member.trades?.name || '',
          home_zip: member.home_zip || '',
          travel_radius_miles: member.travel_radius_miles || 0,
          bio: member.bio || ''
        }
      })

      setCrewMembers(normalizedMembers)
      setMyCrewMembership(true)
    } catch (err) {
      console.error(err)
      setMsg(copy.unableJoinCrew)
    } finally {
      setCrewActionLoading(false)
    }
  }

  async function leaveCrew() {
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const uid = sessionData.session?.user?.id

      if (!uid) {
        setMsg(copy.notSignedIn)
        return
      }

      setCrewActionLoading(true)

      const { error } = await supabase
        .from('crew_memberships')
        .delete()
        .eq('post_id', id)
        .eq('user_id', uid)

      if (error) throw error

      setCrewMembers((prev) => prev.filter((m) => m.user_id !== uid))
      setMyCrewMembership(false)
    } catch (err) {
      console.error(err)
      setMsg(copy.unableLeaveCrew)
    } finally {
      setCrewActionLoading(false)
    }
  }

  async function translateReply(commentId, body) {
    try {
      const detected = detectLikelyLanguage(body)

      if (detected === lang) return

      if (translatedComments[commentId]) {
        setVisibleTranslatedComments((prev) => ({
          ...prev,
          [commentId]: !prev[commentId]
        }))
        return
      }

      setTranslatingCommentId(commentId)
      const translated = await translateText({
        text: body,
        from: detected,
        to: lang
      })

      setTranslatedComments((prev) => ({
        ...prev,
        [commentId]: translated
      }))

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

  if (loading) {
    return <div className="card">Loading…</div>
  }

  if (!post) {
    return <div className="card">Post not found.</div>
  }

  const styles = getPostTypeStyles(post.post_type, post.category_group, post.is_urgent)

  const crewFull = post.needed_count && crewMembers.length >= post.needed_count

  const canJoinCrew =
    post.post_type === 'need_crew' &&
    post.crew_status === 'open' &&
    !crewFull &&
    !myCrewMembership &&
    currentUserId &&
    currentUserId !== post.author_id

  return (
    <div className="grid" style={{ gap: 20 }}>
      {msg && (
        <div className="card-message" style={{ padding: 14 }}>
          {msg}
        </div>
      )}

      <div
        className="card rounded-xl"
        style={{
          padding: 28,
          background: 'linear-gradient(180deg, #fff7c8 0%, #f7f7f2 100%)'
        }}
      >
        <div className="badge" style={{ marginBottom: 14, background: '#f1e7a8' }}>
          {copy.heroBadge}
        </div>

        <div className="h1" style={{ maxWidth: 820 }}>
          {copy.heroTitle}
        </div>

        <p className="muted" style={{ marginTop: 12, maxWidth: 900, fontSize: 17, lineHeight: 1.7 }}>
          {copy.heroBody}
        </p>

        <div style={{ marginTop: 18 }}>
          <Link className="btn" to="/feed">
            {copy.backToFeed}
          </Link>
        </div>
      </div>

      <div className="card rounded-xl" style={{ ...styles.shell, padding: 24 }}>
        <div className="postMeta" style={{ marginBottom: 10 }}>
          <span className="badge" style={styles.badge}>
            {postTypeLabel(post.post_type, lang)}
          </span>

          <span className="badge">
            {post.category_group === 'jobsite_support' ? copy.jobsiteSupport : copy.trades}
          </span>

          {post.category_group === 'jobsite_support' && post.support_type ? (
            <span className="badge">{supportTypeLabel(post.support_type, lang)}</span>
          ) : null}

          {post.trade_name ? (
            <span className="badge" style={tradeBadgeStyle()}>
              {post.trade_name}
            </span>
          ) : null}

          {post.is_urgent ? (
            <span className="badge" style={urgentBadgeStyle()}>
              {copy.urgent}
            </span>
          ) : null}

          <span className="badge">{timeAgo(post.created_at, lang)}</span>
        </div>

        <div className="h2">{post.title}</div>

        {post.body ? (
          <div
            style={{
              marginTop: 12,
              lineHeight: 1.75,
              fontSize: 16,
              whiteSpace: 'pre-wrap'
            }}
          >
            {renderedPostBody}
          </div>
        ) : null}

        {postLang !== lang && post.body ? (
          <div style={{ marginTop: 12 }}>
            <button className="btn small" onClick={translatePostBody} disabled={translatingPost}>
              {translatingPost
                ? copy.translating
                : translatedPostBody && showTranslatedPost
                  ? copy.showOriginal
                  : copy.translate}
            </button>

            {showTranslatedPost && translatedPostBody ? (
              <div className="muted" style={{ marginTop: 8 }}>
                {copy.translatedVersion}
              </div>
            ) : null}
          </div>
        ) : null}

        {post.image_paths && post.image_paths.length > 0 ? (
          <div style={{ marginTop: 18 }}>
            <div className="card-section-title" style={{ fontSize: 16 }}>
              {copy.photos}
            </div>

            <div
              style={{
                marginTop: 12,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: 10
              }}
            >
              {post.image_paths.map((path, idx) => {
                const url = imageUrls[path]
                if (!url) return null

                return (
                  <img
                    key={`${path}-${idx}`}
                    src={url}
                    alt="Post"
                    style={{
                      width: '100%',
                      borderRadius: 14,
                      objectFit: 'cover'
                    }}
                    onError={() => setMsg(copy.unableLoadImage)}
                  />
                )
              })}
            </div>
          </div>
        ) : null}

        <div style={{ marginTop: 18, display: 'flex', gap: 8 }}>
          <button className={`btn small ${myVote === 1 ? 'primary' : ''}`} onClick={() => vote(1)}>
            ▲
          </button>

          <div className="badge">{score}</div>

          <button className={`btn small ${myVote === -1 ? 'primary' : ''}`} onClick={() => vote(-1)}>
            ▼
          </button>
        </div>
      </div>

      <div className="grid two">
        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">{copy.opportunityDetails}</div>

          <div className="grid two" style={{ marginTop: 14 }}>
            {post.center_zip ? <MetaStat label={copy.zip} value={post.center_zip} /> : null}
            {post.start_date ? (
              <MetaStat label={copy.start} value={new Date(post.start_date).toLocaleDateString()} />
            ) : null}
            {post.compensation ? <MetaStat label={copy.payRate} value={post.compensation} /> : null}

            {post.post_type === 'need_crew' ? (
              <>
                <MetaStat label={copy.crewNeeded} value={post.needed_count || 0} />
                <MetaStat label={copy.filled} value={crewMembers.length} />
                <MetaStat
                  label={copy.hired}
                  value={crewMembers.filter((m) => m.status === 'hired').length}
                />
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
                    Status
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <span className="badge" style={crewStatusBadgeStyle(post.crew_status)}>
                      {crewStatusLabel(post.crew_status, lang)}
                    </span>
                  </div>
                </div>
              </>
            ) : null}
          </div>

          {post.category_group === 'jobsite_support' && post.service_tags?.length > 0 ? (
            <div style={{ marginTop: 16 }}>
              <div className="muted">{copy.serviceTags}</div>
              <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {post.service_tags.map((tag) => (
                  <span key={`post-service-${tag}`} className="badge">
                    {formatTagLabel(tag)}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {post.category_group === 'jobsite_support' && post.equipment_tags?.length > 0 ? (
            <div style={{ marginTop: 16 }}>
              <div className="muted">{copy.equipmentTags}</div>
              <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {post.equipment_tags.map((tag) => (
                  <span key={`post-equipment-${tag}`} className="badge">
                    {formatTagLabel(tag)}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">{copy.contactCard}</div>

          <div className="postMeta" style={{ marginTop: 12 }}>
            {post.author_role ? (
              <span className="badge" style={roleBadgeStyle(post.author_role)}>
                {roleLabel(post.author_role, lang)}
              </span>
            ) : null}

            <span className="badge">
              {post.author_role === 'supplier' && post.author_business_name
                ? post.author_business_name
                : post.author_name}
            </span>

            {post.author_trade_name ? (
              <span className="badge" style={tradeBadgeStyle()}>
                {post.author_trade_name}
              </span>
            ) : null}

            {post.author_category_group === 'jobsite_support' && post.author_support_type ? (
              <span className="badge">{supportTypeLabel(post.author_support_type, lang)}</span>
            ) : null}

            {post.author_is_available ? (
              <span className="badge" style={availabilityBadgeStyle(true)}>
                {availabilityStatusLabel(post.author_availability_status, lang)}
              </span>
            ) : (
              <span className="badge">{copy.notAvailable}</span>
            )}

            {post.author_contractor_verified ? (
              <span className="badge" style={{ background: '#111111', color: '#ffffff' }}>
                Verified Contractor
              </span>
            ) : null}

            {post.author_role === 'supplier' && post.author_storefront ? (
              <span className="badge">{copy.storefront}</span>
            ) : null}
          </div>

          {post.author_role === 'supplier' ? (
            <div style={{ marginTop: 14 }}>
              <div className="muted">{copy.supplierBusiness}</div>

              <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
                {post.author_business_address ? <span>{post.author_business_address}</span> : null}

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {post.author_business_zip ? (
                    <span className="badge">
                      {copy.businessZip}: {post.author_business_zip}
                    </span>
                  ) : null}

                  {Number(post.author_delivery_radius || 0) > 0 ? (
                    <span className="badge">
                      {copy.deliveryRadius}: {post.author_delivery_radius} {copy.miles}
                    </span>
                  ) : null}
                </div>
              </div>

              {post.author_materials_categories?.length > 0 ? (
                <div style={{ marginTop: 14 }}>
                  <div className="muted">{copy.supplierMaterials}</div>
                  <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {post.author_materials_categories.map((tag) => (
                      <span
                        key={`author-material-${tag}`}
                        className="badge"
                        style={{ background: '#f1e7a8', color: '#111111' }}
                      >
                        {formatMaterialCategoryLabel(tag, lang)}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {post.author_role === 'driver' ? (
            <div style={{ marginTop: 14 }}>
              <div className="muted">{copy.driverCapabilities}</div>

              <div className="grid two" style={{ marginTop: 10 }}>
                <div className="card-soft" style={{ minHeight: 'auto', padding: 14, background: '#eef6ff' }}>
                  <div className="muted" style={{ marginBottom: 6 }}>{copy.vehicleType}</div>
                  <div style={{ fontWeight: 800 }}>
                    {vehicleTypeLabel(post.author_vehicle_type, lang)}
                  </div>

                  <div className="muted" style={{ marginTop: 10, marginBottom: 6 }}>{copy.trailerType}</div>
                  <div style={{ fontWeight: 800 }}>
                    {trailerTypeLabel(post.author_trailer_type, lang)}
                  </div>
                </div>

                <div className="card-soft" style={{ minHeight: 'auto', padding: 14, background: '#fffaf0' }}>
                  <div className="muted" style={{ marginBottom: 6 }}>{copy.trailerLength}</div>
                  <div style={{ fontWeight: 800 }}>
                    {Number(post.author_trailer_length || 0) > 0
                      ? `${post.author_trailer_length} ${copy.feetShort}`
                      : '—'}
                  </div>

                  <div className="muted" style={{ marginTop: 10, marginBottom: 6 }}>{copy.payloadCapacity}</div>
                  <div style={{ fontWeight: 800 }}>
                    {Number(post.author_payload_capacity || 0) > 0
                      ? `${post.author_payload_capacity} ${copy.poundsShort}`
                      : '—'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                {post.author_home_zip ? (
                  <span className="badge">
                    {copy.zip}: {post.author_home_zip}
                  </span>
                ) : null}

                {Number(post.author_delivery_radius || 0) > 0 ? (
                  <span className="badge">
                    {copy.deliveryRadius}: {post.author_delivery_radius} {copy.miles}
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}

          {post.author_role !== 'supplier' && post.author_role !== 'driver' && (post.author_home_zip || post.author_travel_radius_miles) ? (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
              {post.author_home_zip ? (
                <span className="badge">
                  {copy.zip}: {post.author_home_zip}
                </span>
              ) : null}
              <span className="badge">Radius: {post.author_travel_radius_miles || 0}</span>
            </div>
          ) : null}

          {post.author_service_tags?.length > 0 ? (
            <div style={{ marginTop: 14 }}>
              <div className="muted">{copy.serviceTags}</div>
              <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {post.author_service_tags.map((tag) => (
                  <span key={`author-service-${tag}`} className="badge">
                    {formatTagLabel(tag)}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {post.author_equipment_tags?.length > 0 ? (
            <div style={{ marginTop: 14 }}>
              <div className="muted">{copy.equipmentTags}</div>
              <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {post.author_equipment_tags.map((tag) => (
                  <span key={`author-equipment-${tag}`} className="badge">
                    {formatTagLabel(tag)}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {post.author_bio ? <p style={{ marginTop: 14, lineHeight: 1.7 }}>{post.author_bio}</p> : null}

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
            <Link className="btn primary" to={`/u/${post.author_id}`}>
              {copy.viewProfile}
            </Link>

            {post.author_role === 'supplier' ? (
              <Link className="btn" to={`/supplier/${post.author_id}`}>
                {copy.viewStorefront}
              </Link>
            ) : null}

            <button className="btn" type="button" onClick={() => copyWorkerProfileLink(post.author_id)}>
              Copy Profile Link
            </button>
          </div>
        </div>
      </div>

      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="card-section-title">{copy.crewBuilder}</div>
        <p className="card-section-subtitle" style={{ marginTop: 8 }}>
          {copy.crewBuilderBody}
        </p>

        <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn" onClick={copyInviteLink}>
            {copy.copyInviteLink}
          </button>

          <button className="btn" onClick={shareInviteLink}>
            {copy.share}
          </button>

          <button className="btn" onClick={textInviteLink}>
            {copy.textInvite}
          </button>

          <button className="btn" onClick={emailInviteLink}>
            {copy.emailInvite}
          </button>
        </div>

        {post.post_type === 'need_crew' ? (
          <div style={{ marginTop: 16 }}>
            {canJoinCrew ? (
              <button className="btn primary" onClick={joinCrew} disabled={crewActionLoading}>
                {crewActionLoading ? copy.joining : copy.joinCrew}
              </button>
            ) : null}

            {myCrewMembership ? (
              <button className="btn" onClick={leaveCrew} disabled={crewActionLoading}>
                {crewActionLoading ? copy.leaving : copy.leaveCrew}
              </button>
            ) : null}

            {post.author_id === currentUserId ? (
              <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="btn" onClick={() => changeCrewStatus('open')} disabled={crewActionLoading}>
                  {copy.markOpen}
                </button>

                <button className="btn" onClick={() => changeCrewStatus('full')} disabled={crewActionLoading}>
                  {copy.markCrewFull}
                </button>

                <button className="btn" onClick={() => changeCrewStatus('closed')} disabled={crewActionLoading}>
                  {copy.closePost}
                </button>
              </div>
            ) : null}

            {post.author_id === currentUserId ? (
              <div className="card-soft" style={{ marginTop: 14, background: '#fffaf0' }}>
                <div className="card-section-title" style={{ fontSize: 15 }}>
                  {copy.contractorControls}
                </div>
                <p className="card-section-subtitle" style={{ marginTop: 8 }}>
                  {copy.crewBuilderBody}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {post.post_type === 'need_crew' ? (
        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">{copy.crewRoster}</div>

          {crewMembers.length === 0 ? (
            <div className="card-soft" style={{ marginTop: 14 }}>
              <div className="muted">{copy.noOneJoined}</div>
            </div>
          ) : (
            <div className="list" style={{ marginTop: 14 }}>
              {crewMembers.map((member) => {
                const workedKey = `${post.author_id}:${member.user_id}`
                const workedBefore = Boolean(workedBeforeMap[workedKey])

                return (
                  <div
                    key={member.user_id}
                    className="card-soft"
                    style={{
                      background: '#ffffff',
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 14,
                      flexWrap: 'wrap',
                      alignItems: 'flex-start'
                    }}
                  >
                    <div style={{ flex: '1 1 420px' }}>
                      <div className="postMeta">
                        {member.role ? (
                          <span className="badge" style={roleBadgeStyle(member.role)}>
                            {roleLabel(member.role, lang)}
                          </span>
                        ) : null}

                        {member.trade_name ? (
                          <span className="badge" style={tradeBadgeStyle()}>
                            {member.trade_name}
                          </span>
                        ) : null}

                        {member.support_type ? (
                          <span className="badge">{supportTypeLabel(member.support_type, lang)}</span>
                        ) : null}

                        <span className="badge" style={memberStatusBadgeStyle(member.status)}>
                          {memberStatusLabel(member.status, lang)}
                        </span>

                        {member.is_available ? (
                          <span className="badge" style={availabilityBadgeStyle(true)}>
                            {availabilityStatusLabel(member.availability_status, lang)}
                          </span>
                        ) : null}

                        {workedBefore ? <span className="badge">{copy.workedBefore}</span> : null}
                      </div>

                      <div style={{ marginTop: 10, fontWeight: 900, fontSize: 18 }}>
                        {member.display_name}
                      </div>

                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                        {member.home_zip ? (
                          <span className="badge">
                            {copy.zip}: {member.home_zip}
                          </span>
                        ) : null}
                        <span className="badge">Radius: {member.travel_radius_miles || 0}</span>
                        <span className="badge">
                          {copy.joinedAt}: {timeAgo(member.created_at, lang)}
                        </span>
                      </div>

                      {member.service_tags?.length > 0 ? (
                        <div style={{ marginTop: 12 }}>
                          <div className="muted">{copy.serviceTags}</div>
                          <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {member.service_tags.map((tag) => (
                              <span key={`${member.user_id}-service-${tag}`} className="badge">
                                {formatTagLabel(tag)}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {member.equipment_tags?.length > 0 ? (
                        <div style={{ marginTop: 12 }}>
                          <div className="muted">{copy.equipmentTags}</div>
                          <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {member.equipment_tags.map((tag) => (
                              <span key={`${member.user_id}-equipment-${tag}`} className="badge">
                                {formatTagLabel(tag)}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {member.bio ? <p style={{ marginTop: 12, lineHeight: 1.7 }}>{member.bio}</p> : null}
                    </div>

                    <div style={{ minWidth: 220, display: 'grid', gap: 10 }}>
                      <Link className="btn small primary" to={`/u/${member.user_id}`}>
                        {copy.viewProfile}
                      </Link>

                      <button
                        className="btn small"
                        type="button"
                        onClick={() => copyWorkerProfileLink(member.user_id)}
                      >
                        Copy Profile Link
                      </button>

                      {post.author_id === currentUserId ? (
                        <>
                          <button
                            className="btn small"
                            type="button"
                            onClick={() => changeMemberStatus(member.user_id, 'joined')}
                            disabled={crewActionLoading}
                          >
                            {copy.moveBackToJoined}
                          </button>

                          <button
                            className="btn small"
                            type="button"
                            onClick={() => changeMemberStatus(member.user_id, 'hired')}
                            disabled={crewActionLoading}
                          >
                            {copy.markHired}
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ) : null}

      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="card-section-title">{copy.discussionThread}</div>

        <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
          <textarea
            className="input"
            rows={4}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={copy.replyPlaceholder}
          />

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <button className="btn primary" onClick={addComment}>
              {copy.postReply}
            </button>

            <span className="muted">
              {currentCommentLang === 'es' ? 'Español' : 'English'}
            </span>
          </div>
        </div>

        {comments.length === 0 ? (
          <div className="card-soft" style={{ marginTop: 14 }}>
            <div className="muted">{copy.noReplies}</div>
          </div>
        ) : (
          <div className="list" style={{ marginTop: 14 }}>
            {comments.map((comment) => {
              const detectedLang = detectLikelyLanguage(comment.body || '')
              const translated = translatedComments[comment.id]
              const showTranslated = Boolean(visibleTranslatedComments[comment.id])

              return (
                <div key={comment.id} className="card-soft" style={{ background: '#ffffff' }}>
                  <div className="postMeta">
                    {comment.author_role ? (
                      <span className="badge" style={roleBadgeStyle(comment.author_role)}>
                        {roleLabel(comment.author_role, lang)}
                      </span>
                    ) : null}

                    <span className="badge">{comment.author_name}</span>
                    <span className="badge">{timeAgo(comment.created_at, lang)}</span>
                  </div>

                  <div style={{ marginTop: 10, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                    {showTranslated && translated ? translated : comment.body}
                  </div>

                  {detectedLang !== lang ? (
                    <button
                      className="btn small"
                      style={{ marginTop: 10 }}
                      onClick={() => translateReply(comment.id, comment.body)}
                      disabled={translatingCommentId === comment.id}
                    >
                      {translatingCommentId === comment.id
                        ? copy.translating
                        : translated && showTranslated
                          ? copy.showOriginal
                          : copy.translate}
                    </button>
                  ) : null}

                  {showTranslated && translated ? (
                    <div className="muted" style={{ marginTop: 8 }}>
                      {copy.translatedVersion}
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}