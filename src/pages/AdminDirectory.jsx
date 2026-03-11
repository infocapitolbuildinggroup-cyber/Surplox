import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

const COPY = {
  en: {
    pageTitle: 'Admin Dashboard',
    pageIntro:
      'Monitor network health, review worker quality, identify supply and demand gaps, and manage growth from one place.',

    analyticsTitle: 'Platform Overview',
    marketTitle: 'Market Intelligence',
    workerIntelTitle: 'Worker Intelligence',
    activityTitle: 'Activity Review',
    exportTitle: 'Export / Ops',
    filtersTitle: 'Admin Filters',
    filtersIntro:
      'Search the network by role, trade, ZIP, radius, availability, and crew size.',

    totalUsers: 'Total Users',
    laborers: 'Laborers',
    subcontractors: 'Subcontractors',
    contractors: 'Contractors',
    suppliers: 'Suppliers',
    availableWorkers: 'Available Workers',
    totalPosts: 'Total Posts',
    needCrewPosts: 'Need Crew Posts',
    lookingForWorkPosts: 'Looking for Work Posts',
    discussions: 'Discussions',
    crewJoins: 'Crew Joins',
    hires: 'Hires',
    openCrewPosts: 'Open Crew Posts',
    fullCrewPosts: 'Full Crew Posts',
    closedCrewPosts: 'Closed Crew Posts',
    totalComments: 'Total Comments',
    completedProfiles: 'Completed Profiles',
    incompleteProfiles: 'Incomplete Profiles',

    topTradesByUsers: 'Top Trades by User Count',
    topTradesByDemand: 'Top Trades by Post Demand',
    topZipsByWorkers: 'Top ZIPs by Worker Count',
    topZipsByCrewRequests: 'Top ZIPs by Crew Requests',
    marketGapFinder: 'Marketplace Gap Finder',
    supply: 'Supply',
    demand: 'Demand',
    gap: 'Gap',
    surplus: 'Surplus',
    shortage: 'Shortage',
    balanced: 'Balanced',

    newestUsers: 'Newest Users',
    newestPosts: 'Newest Posts',
    newestCrewJoins: 'Newest Crew Joins',
    newestHires: 'Newest Hires',
    mostActiveMembers: 'Most Active Members',

    role: 'Role',
    trade: 'Trade',
    city: 'City',
    zip: 'ZIP',
    radius: 'Radius',
    availability: 'Availability',
    privateRating: 'Private Admin Rating',
    privateNotes: 'Private Notes',
    followUpStatus: 'Follow-Up Status',
    workedWithCount: 'Worked-With Count',
    hiresCount: 'Hires Count',
    crewsJoinedCount: 'Crews Joined',
    noData: 'No data yet.',
    unknown: 'Unknown',
    unknownMember: 'Unknown Member',
    available: 'Available',
    notAvailable: 'Not Available',

    searchLabel: 'Search',
    searchPlaceholder: 'Search by name, trade, city, ZIP, role, or bio',
    tradeLabel: 'Trade',
    allTrades: 'All Trades',
    roleLabel: 'Role',
    allRoles: 'All Roles',
    zipLabel: 'Job ZIP',
    radiusLabel: 'Job Radius (miles)',
    availabilityLabel: 'Availability',
    availabilityAll: 'All Availability',
    availabilityAvailable: 'Available Only',
    availabilityUnavailable: 'Unavailable Only',
    minCrewLabel: 'Minimum Crew Size',
    profileCompletionLabel: 'Profile Completion',
    profileCompletionAll: 'All Profiles',
    profileCompletionComplete: 'Completed Only',
    profileCompletionIncomplete: 'Incomplete Only',

    exportFiltered: 'Export Filtered Results',
    exportWorkers: 'Export Worker List',
    exportContractors: 'Export Contractor List',
    exportAvailable: 'Export Available Workers',
    exportByTrade: 'Export Selected Trade',
    exportByZip: 'Export Selected ZIP',
    results: 'results',

    location: 'Location',
    crewRadius: 'Crew / Radius',
    bio: 'Bio',
    contact: 'Contact',
    privateAdmin: 'Private Admin Controls',
    ratingPlaceholder: '1 to 5',
    notesPlaceholder:
      'Private notes for reliability, pricing, follow-up, communication, or job history.',
    followUpPlaceholder: 'Example: Call Tuesday, strong lead, needs follow-up',
    save: 'Save',
    saving: 'Saving...',
    saved: 'Admin notes saved.',
    saveError: 'Unable to save admin data right now.',
    loading: 'Loading admin dashboard…',

    userCount: 'users',
    workers: 'workers',
    requests: 'requests',
    milesAway: 'mi away',
    crewSize: 'Crew Size',
    travelRadius: 'Travel Radius',
    openPost: 'Open Post',
    openProfile: 'Open Profile',
    connections: 'connections',
    profileStatus: 'Profile Status',
    profileComplete: 'Complete',
    profileIncomplete: 'Incomplete',
    missingFields: 'Missing Fields'
  },
  es: {
    pageTitle: 'Panel de Administración',
    pageIntro:
      'Monitorea la salud de la red, revisa la calidad de los trabajadores, identifica faltantes de oferta y demanda, y administra el crecimiento desde un solo lugar.',

    analyticsTitle: 'Resumen de la Plataforma',
    marketTitle: 'Inteligencia de Mercado',
    workerIntelTitle: 'Inteligencia de Trabajadores',
    activityTitle: 'Revisión de Actividad',
    exportTitle: 'Exportación / Operaciones',
    filtersTitle: 'Filtros de Administración',
    filtersIntro:
      'Busca en la red por rol, oficio, ZIP, radio, disponibilidad y tamaño de cuadrilla.',

    totalUsers: 'Usuarios Totales',
    laborers: 'Trabajadores',
    subcontractors: 'Subcontratistas',
    contractors: 'Contratistas',
    suppliers: 'Proveedores',
    availableWorkers: 'Trabajadores Disponibles',
    totalPosts: 'Publicaciones Totales',
    needCrewPosts: 'Publicaciones de Se Necesita Cuadrilla',
    lookingForWorkPosts: 'Publicaciones de Buscando Trabajo',
    discussions: 'Discusiones',
    crewJoins: 'Uniones a Cuadrillas',
    hires: 'Contrataciones',
    openCrewPosts: 'Publicaciones Abiertas',
    fullCrewPosts: 'Cuadrillas Llenas',
    closedCrewPosts: 'Publicaciones Cerradas',
    totalComments: 'Comentarios Totales',
    completedProfiles: 'Perfiles Completos',
    incompleteProfiles: 'Perfiles Incompletos',

    topTradesByUsers: 'Oficios Principales por Cantidad de Usuarios',
    topTradesByDemand: 'Oficios Principales por Demanda',
    topZipsByWorkers: 'ZIPs Principales por Cantidad de Trabajadores',
    topZipsByCrewRequests: 'ZIPs Principales por Solicitudes de Cuadrilla',
    marketGapFinder: 'Detector de Brechas del Mercado',
    supply: 'Oferta',
    demand: 'Demanda',
    gap: 'Brecha',
    surplus: 'Superávit',
    shortage: 'Faltante',
    balanced: 'Balanceado',

    newestUsers: 'Usuarios Más Nuevos',
    newestPosts: 'Publicaciones Más Nuevas',
    newestCrewJoins: 'Uniones Más Nuevas',
    newestHires: 'Contrataciones Más Nuevas',
    mostActiveMembers: 'Miembros Más Activos',

    role: 'Rol',
    trade: 'Oficio',
    city: 'Ciudad',
    zip: 'ZIP',
    radius: 'Radio',
    availability: 'Disponibilidad',
    privateRating: 'Calificación Privada de Admin',
    privateNotes: 'Notas Privadas',
    followUpStatus: 'Estado de Seguimiento',
    workedWithCount: 'Cantidad de Trabajó Con',
    hiresCount: 'Cantidad de Contrataciones',
    crewsJoinedCount: 'Cuadrillas Unidas',
    noData: 'Todavía no hay datos.',
    unknown: 'Desconocido',
    unknownMember: 'Miembro Desconocido',
    available: 'Disponible',
    notAvailable: 'No Disponible',

    searchLabel: 'Buscar',
    searchPlaceholder: 'Busca por nombre, oficio, ciudad, ZIP, rol o biografía',
    tradeLabel: 'Oficio',
    allTrades: 'Todos los Oficios',
    roleLabel: 'Rol',
    allRoles: 'Todos los Roles',
    zipLabel: 'ZIP del Trabajo',
    radiusLabel: 'Radio del Trabajo (millas)',
    availabilityLabel: 'Disponibilidad',
    availabilityAll: 'Toda Disponibilidad',
    availabilityAvailable: 'Solo Disponibles',
    availabilityUnavailable: 'Solo No Disponibles',
    minCrewLabel: 'Tamaño Mínimo de Cuadrilla',
    profileCompletionLabel: 'Estado del Perfil',
    profileCompletionAll: 'Todos los Perfiles',
    profileCompletionComplete: 'Solo Completos',
    profileCompletionIncomplete: 'Solo Incompletos',

    exportFiltered: 'Exportar Resultados Filtrados',
    exportWorkers: 'Exportar Lista de Trabajadores',
    exportContractors: 'Exportar Lista de Contratistas',
    exportAvailable: 'Exportar Disponibles',
    exportByTrade: 'Exportar Oficio Seleccionado',
    exportByZip: 'Exportar ZIP Seleccionado',
    results: 'resultados',

    location: 'Ubicación',
    crewRadius: 'Cuadrilla / Radio',
    bio: 'Biografía',
    contact: 'Contacto',
    privateAdmin: 'Controles Privados de Admin',
    ratingPlaceholder: '1 a 5',
    notesPlaceholder:
      'Notas privadas sobre confiabilidad, precios, seguimiento, comunicación o historial.',
    followUpPlaceholder: 'Ejemplo: Llamar el martes, buen prospecto, necesita seguimiento',
    save: 'Guardar',
    saving: 'Guardando...',
    saved: 'Notas de admin guardadas.',
    saveError: 'No se pudo guardar la información de admin en este momento.',
    loading: 'Cargando panel de administración…',

    userCount: 'usuarios',
    workers: 'trabajadores',
    requests: 'solicitudes',
    milesAway: 'mi de distancia',
    crewSize: 'Tamaño de Cuadrilla',
    travelRadius: 'Radio de Viaje',
    openPost: 'Abrir Publicación',
    openProfile: 'Abrir Perfil',
    connections: 'conexiones',
    profileStatus: 'Estado del Perfil',
    profileComplete: 'Completo',
    profileIncomplete: 'Incompleto',
    missingFields: 'Campos Faltantes'
  }
}

function haversineMiles(lat1, lon1, lat2, lon2) {
  const toRad = (x) => (x * Math.PI) / 180
  const R = 3958.8
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

function csvEscape(v) {
  const s = String(v ?? '')
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function roleLabel(role, copy) {
  if (role === 'laborer') return copy.laborers.replace(/s$/, '')
  if (role === 'subcontractor') return copy.subcontractors.replace(/s$/, '')
  if (role === 'contractor') return copy.contractors.replace(/s$/, '')
  if (role === 'supplier') return copy.suppliers.replace(/s$/, '')
  return role || copy.unknown
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

function formatDateTime(value) {
  if (!value) return ''
  return new Date(value).toLocaleString()
}

function getGapStatus(supply, demand) {
  const diff = supply - demand
  if (diff > 2) return 'surplus'
  if (diff < -2) return 'shortage'
  return 'balanced'
}

function makeCountMap(rows, keyField) {
  const map = new Map()
  ;(rows || []).forEach((row) => {
    const key = String(row?.[keyField] || '').trim()
    if (!key) return
    map.set(key, (map.get(key) || 0) + 1)
  })
  return map
}

function topEntriesFromMap(map, limit = 5) {
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
}

function getMissingProfileFields(worker, copy) {
  const missing = []

  if (!String(worker.first_name || '').trim()) missing.push('First Name')
  if (!String(worker.last_name || '').trim()) missing.push('Last Name')
  if (!String(worker.phone || '').trim()) missing.push(copy.contact === 'Contact' ? 'Phone' : 'Teléfono')
  if (!String(worker.city || '').trim()) missing.push(copy.city)
  if (!String(worker.role || '').trim()) missing.push(copy.role)
  if (!String(worker.bio || '').trim()) missing.push(copy.bio)
  if (!Number(worker.crew_size || 0) || Number(worker.crew_size || 0) <= 1) missing.push(copy.crewSize)
  if (!String(worker.display_name || '').trim()) missing.push('Display Name')
  if (!String(worker.home_zip || '').trim()) missing.push(copy.zip)
  if (!worker.trade_id && !String(worker.trade_name || '').trim()) missing.push(copy.trade)

  return missing
}

export default function AdminDirectory() {
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [savingId, setSavingId] = useState(null)
  const [lang, setLang] = useState(localStorage.getItem('surplox_lang') || 'en')

  const [trades, setTrades] = useState([])
  const [profiles, setProfiles] = useState([])
  const [privateRows, setPrivateRows] = useState([])
  const [posts, setPosts] = useState([])
  const [comments, setComments] = useState([])
  const [crewMemberships, setCrewMemberships] = useState([])
  const [relationships, setRelationships] = useState([])
  const [zipMap, setZipMap] = useState(new Map())

  const [filters, setFilters] = useState({
    job_zip: '',
    job_radius_miles: 50,
    trade_id: '',
    role: '',
    min_crew_size: 1,
    availability: 'all',
    profile_completion: 'all',
    q: ''
  })

  const copy = COPY[lang] || COPY.en

  useEffect(() => {
    let alive = true

    async function load() {
      setLoading(true)
      setMsg('')

      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const uid = sessionData.session?.user?.id

        if (uid) {
          const { data: profLang } = await supabase
            .from('profiles')
            .select('preferred_language')
            .eq('user_id', uid)
            .maybeSingle()

          const userLang = profLang?.preferred_language || 'en'
          setLang(userLang)
          localStorage.setItem('surplox_lang', userLang)
        }

        const [
          tradesRes,
          profilesRes,
          privateRes,
          postsRes,
          commentsRes,
          crewRes,
          relsRes
        ] = await Promise.all([
          supabase.from('trades').select('id, name').order('name'),
          supabase
            .from('profiles')
            .select(
              'user_id, display_name, first_name, last_name, role, trade_id, home_zip, travel_radius_miles, crew_size, bio, is_available, created_at'
            )
            .order('created_at', { ascending: false }),
          supabase
            .from('contact_private')
            .select(
              'user_id, phone, email, city, admin_rating, admin_notes, admin_follow_up_status'
            ),
          supabase
            .from('posts')
            .select(
              'id, author_id, title, post_type, crew_status, trade_id, center_zip, created_at'
            )
            .order('created_at', { ascending: false }),
          supabase
            .from('comments')
            .select('id, author_id, post_id, created_at')
            .order('created_at', { ascending: false }),
          supabase
            .from('crew_memberships')
            .select('post_id, user_id, status, created_at')
            .order('created_at', { ascending: false }),
          supabase
            .from('user_relationships')
            .select('source_user_id, target_user_id, relationship_type, post_id, created_at')
        ])

        if (tradesRes.error) throw tradesRes.error
        if (profilesRes.error) throw profilesRes.error
        if (privateRes.error) throw privateRes.error
        if (postsRes.error) throw postsRes.error
        if (commentsRes.error) throw commentsRes.error
        if (crewRes.error) throw crewRes.error
        if (relsRes.error) throw relsRes.error

        const prows = profilesRes.data || []

        const allZips = Array.from(
          new Set([
            ...prows.map((x) => String(x.home_zip || '')).filter((z) => /^[0-9]{5}$/.test(z)),
            ...(postsRes.data || [])
              .map((x) => String(x.center_zip || ''))
              .filter((z) => /^[0-9]{5}$/.test(z))
          ])
        )

        let builtZipMap = new Map()
        if (allZips.length > 0) {
          const { data: zipRows, error: zipErr } = await supabase
            .from('zipcodes')
            .select('zip, lat, lon')
            .in('zip', allZips)

          if (zipErr) throw zipErr
          builtZipMap = new Map((zipRows || []).map((z) => [String(z.zip), z]))
        }

        if (!alive) return

        setTrades(tradesRes.data || [])
        setProfiles(prows)
        setPrivateRows(privateRes.data || [])
        setPosts(postsRes.data || [])
        setComments(commentsRes.data || [])
        setCrewMemberships(crewRes.data || [])
        setRelationships(relsRes.data || [])
        setZipMap(builtZipMap)
      } catch (e) {
        console.error(e)
        if (!alive) return
        setMsg(e?.message || copy.saveError)
      } finally {
        if (!alive) return
        setLoading(false)
      }
    }

    load()
    return () => {
      alive = false
    }
  }, [])

  function setF(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const tradeNameById = useMemo(() => {
    const map = new Map()
    trades.forEach((tr) => map.set(String(tr.id), tr.name))
    return map
  }, [trades])

  const privateByUser = useMemo(() => {
    const map = new Map()
    privateRows.forEach((r) => map.set(r.user_id, r))
    return map
  }, [privateRows])

  const workedWithCountByUser = useMemo(() => {
    const counts = new Map()
    relationships.forEach((rel) => {
      const source = rel.source_user_id
      const target = rel.target_user_id
      if (!source || !target) return
      counts.set(source, (counts.get(source) || 0) + 1)
      counts.set(target, (counts.get(target) || 0) + 1)
    })
    return counts
  }, [relationships])

  const hiresCountByUser = useMemo(() => {
    const counts = new Map()
    relationships
      .filter((rel) => rel.relationship_type === 'hired_from_crew_post')
      .forEach((rel) => {
        const target = rel.target_user_id
        if (!target) return
        counts.set(target, (counts.get(target) || 0) + 1)
      })
    return counts
  }, [relationships])

  const crewsJoinedCountByUser = useMemo(() => {
    const counts = new Map()
    crewMemberships.forEach((row) => {
      if (!row.user_id) return
      counts.set(row.user_id, (counts.get(row.user_id) || 0) + 1)
    })
    return counts
  }, [crewMemberships])

  const mergedWorkers = useMemo(() => {
    return profiles.map((p) => {
      const priv = privateByUser.get(p.user_id) || {}
      const trade_name = tradeNameById.get(String(p.trade_id)) || ''
      const baseWorker = {
        ...p,
        trade_name,
        phone: priv.phone || '',
        email: priv.email || '',
        city: priv.city || '',
        admin_rating: priv.admin_rating ?? '',
        admin_notes: priv.admin_notes ?? '',
        admin_follow_up_status: priv.admin_follow_up_status ?? '',
        worked_with_count: workedWithCountByUser.get(p.user_id) || 0,
        hires_count: hiresCountByUser.get(p.user_id) || 0,
        crews_joined_count: crewsJoinedCountByUser.get(p.user_id) || 0
      }

      const missing_profile_fields = getMissingProfileFields(baseWorker, copy)

      return {
        ...baseWorker,
        missing_profile_fields,
        profile_complete: missing_profile_fields.length === 0
      }
    })
  }, [
    profiles,
    privateByUser,
    tradeNameById,
    workedWithCountByUser,
    hiresCountByUser,
    crewsJoinedCountByUser,
    copy
  ])

  const filteredWorkers = useMemo(() => {
    const q = String(filters.q || '').trim().toLowerCase()
    const tradeId = String(filters.trade_id || '')
    const role = String(filters.role || '')
    const minCrew = Number(filters.min_crew_size || 1)
    const jobZip = String(filters.job_zip || '').trim()
    const jobMiles = Number(filters.job_radius_miles || 0)
    const availability = String(filters.availability || 'all')
    const profileCompletion = String(filters.profile_completion || 'all')

    const jobRow = /^[0-9]{5}$/.test(jobZip) ? zipMap.get(jobZip) : null

    return mergedWorkers
      .filter((worker) => {
        if (tradeId && String(worker.trade_id) !== tradeId) return false
        if (role && String(worker.role) !== role) return false
        if (Number(worker.crew_size || 0) < minCrew) return false

        if (availability === 'available' && !worker.is_available) return false
        if (availability === 'unavailable' && worker.is_available) return false

        if (profileCompletion === 'complete' && !worker.profile_complete) return false
        if (profileCompletion === 'incomplete' && worker.profile_complete) return false

        if (q) {
          const haystack = [
            worker.display_name,
            worker.city,
            worker.home_zip,
            worker.trade_name,
            worker.bio,
            worker.role
          ]
            .join(' ')
            .toLowerCase()

          if (!haystack.includes(q)) return false
        }

        if (/^[0-9]{5}$/.test(jobZip) && jobRow?.lat && jobRow?.lon) {
          const homeZip = String(worker.home_zip || '')
          const homeRow = zipMap.get(homeZip)
          if (!homeRow?.lat || !homeRow?.lon) return false

          const dist = haversineMiles(
            Number(jobRow.lat),
            Number(jobRow.lon),
            Number(homeRow.lat),
            Number(homeRow.lon)
          )

          if (dist > jobMiles) return false
        }

        return true
      })
      .map((worker) => {
        const jobZip2 = String(filters.job_zip || '').trim()
        const jobRow2 = /^[0-9]{5}$/.test(jobZip2) ? zipMap.get(jobZip2) : null
        let distance_miles = null

        if (jobRow2?.lat && jobRow2?.lon) {
          const homeRow = zipMap.get(String(worker.home_zip || ''))
          if (homeRow?.lat && homeRow?.lon) {
            distance_miles = haversineMiles(
              Number(jobRow2.lat),
              Number(jobRow2.lon),
              Number(homeRow.lat),
              Number(homeRow.lon)
            )
          }
        }

        return { ...worker, distance_miles }
      })
      .sort((a, b) => {
        const ad = a.distance_miles
        const bd = b.distance_miles
        if (typeof ad === 'number' && typeof bd === 'number') return ad - bd
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
  }, [mergedWorkers, filters, zipMap])

  const analytics = useMemo(() => {
    const totalUsers = profiles.length
    const laborers = profiles.filter((p) => p.role === 'laborer').length
    const subcontractors = profiles.filter((p) => p.role === 'subcontractor').length
    const contractors = profiles.filter((p) => p.role === 'contractor').length
    const suppliers = profiles.filter((p) => p.role === 'supplier').length
    const availableWorkers = profiles.filter((p) => p.is_available).length

    const totalPosts = posts.length
    const needCrewPosts = posts.filter((p) => p.post_type === 'need_crew').length
    const lookingForWorkPosts = posts.filter((p) => p.post_type === 'looking_for_work').length
    const discussions = posts.filter((p) => p.post_type === 'discussion').length
    const openCrewPosts = posts.filter(
      (p) => p.post_type === 'need_crew' && (p.crew_status || 'open') === 'open'
    ).length
    const fullCrewPosts = posts.filter(
      (p) => p.post_type === 'need_crew' && p.crew_status === 'full'
    ).length
    const closedCrewPosts = posts.filter(
      (p) => p.post_type === 'need_crew' && p.crew_status === 'closed'
    ).length

    const totalComments = comments.length
    const crewJoins = crewMemberships.length
    const hires = crewMemberships.filter((m) => m.status === 'hired').length
    const completedProfiles = mergedWorkers.filter((w) => w.profile_complete).length
    const incompleteProfiles = mergedWorkers.filter((w) => !w.profile_complete).length

    return {
      totalUsers,
      laborers,
      subcontractors,
      contractors,
      suppliers,
      availableWorkers,
      totalPosts,
      needCrewPosts,
      lookingForWorkPosts,
      discussions,
      crewJoins,
      hires,
      openCrewPosts,
      fullCrewPosts,
      closedCrewPosts,
      totalComments,
      completedProfiles,
      incompleteProfiles
    }
  }, [profiles, posts, comments, crewMemberships, mergedWorkers])

  const marketIntel = useMemo(() => {
    const usersByTradeMap = new Map()
    profiles.forEach((p) => {
      const tradeName = tradeNameById.get(String(p.trade_id)) || copy.unknown
      usersByTradeMap.set(tradeName, (usersByTradeMap.get(tradeName) || 0) + 1)
    })

    const demandByTradeMap = new Map()
    posts
      .filter((p) => p.post_type === 'need_crew')
      .forEach((p) => {
        const tradeName = tradeNameById.get(String(p.trade_id)) || copy.unknown
        demandByTradeMap.set(tradeName, (demandByTradeMap.get(tradeName) || 0) + 1)
      })

    const workersByZipMap = makeCountMap(profiles, 'home_zip')
    const crewRequestsByZipMap = makeCountMap(
      posts.filter((p) => p.post_type === 'need_crew'),
      'center_zip'
    )

    const gapRows = Array.from(
      new Set([...Array.from(usersByTradeMap.keys()), ...Array.from(demandByTradeMap.keys())])
    )
      .map((tradeName) => {
        const supply = usersByTradeMap.get(tradeName) || 0
        const demand = demandByTradeMap.get(tradeName) || 0
        const status = getGapStatus(supply, demand)
        return {
          tradeName,
          supply,
          demand,
          gap: supply - demand,
          status
        }
      })
      .sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap))
      .slice(0, 8)

    return {
      topTradesByUsers: topEntriesFromMap(usersByTradeMap, 5),
      topTradesByDemand: topEntriesFromMap(demandByTradeMap, 5),
      topZipsByWorkers: topEntriesFromMap(workersByZipMap, 5),
      topZipsByCrewRequests: topEntriesFromMap(crewRequestsByZipMap, 5),
      gapRows
    }
  }, [profiles, posts, tradeNameById, copy.unknown])

  const activity = useMemo(() => {
    const newestUsers = profiles
      .slice()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)

    const newestPosts = posts
      .slice()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)

    const postTitleById = new Map(posts.map((p) => [String(p.id), p.title]))
    const profileById = new Map(profiles.map((p) => [p.user_id, p]))

    const newestCrewJoins = crewMemberships
      .slice()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map((row) => ({
        ...row,
        user_name: profileById.get(row.user_id)?.display_name || copy.unknownMember,
        post_title: postTitleById.get(String(row.post_id)) || copy.unknown
      }))

    const newestHires = crewMemberships
      .filter((row) => row.status === 'hired')
      .slice()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map((row) => ({
        ...row,
        user_name: profileById.get(row.user_id)?.display_name || copy.unknownMember,
        post_title: postTitleById.get(String(row.post_id)) || copy.unknown
      }))

    const activityMap = new Map()
    profiles.forEach((p) => activityMap.set(p.user_id, 0))
    posts.forEach((p) =>
      activityMap.set(p.author_id, (activityMap.get(p.author_id) || 0) + 1)
    )
    comments.forEach((c) =>
      activityMap.set(c.author_id, (activityMap.get(c.author_id) || 0) + 1)
    )
    crewMemberships.forEach((m) =>
      activityMap.set(m.user_id, (activityMap.get(m.user_id) || 0) + 1)
    )

    const mostActiveMembers = Array.from(activityMap.entries())
      .map(([userId, score]) => ({
        user_id: userId,
        score,
        display_name: profileById.get(userId)?.display_name || copy.unknownMember,
        role: profileById.get(userId)?.role || ''
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)

    return {
      newestUsers,
      newestPosts,
      newestCrewJoins,
      newestHires,
      mostActiveMembers
    }
  }, [profiles, posts, comments, crewMemberships, copy.unknownMember, copy.unknown])

  function exportRowsToCsv(filename, rows) {
    if (!rows.length) return

    const header = Object.keys(rows[0])
    const csv = [header, ...rows.map((r) => header.map((k) => csvEscape(r[k])))]
      .map((line) => line.join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  function makeWorkerExportRows(sourceRows) {
    return sourceRows.map((r) => ({
      display_name: r.display_name || '',
      role: r.role || '',
      trade: r.trade_name || '',
      city: r.city || '',
      zip: r.home_zip || '',
      travel_radius_miles: r.travel_radius_miles || '',
      crew_size: r.crew_size || '',
      is_available: r.is_available ? 'yes' : 'no',
      phone: r.phone || '',
      email: r.email || '',
      admin_rating: r.admin_rating || '',
      admin_follow_up_status: r.admin_follow_up_status || '',
      admin_notes: r.admin_notes || '',
      worked_with_count: r.worked_with_count || 0,
      hires_count: r.hires_count || 0,
      crews_joined_count: r.crews_joined_count || 0,
      profile_complete: r.profile_complete ? 'yes' : 'no',
      missing_profile_fields: (r.missing_profile_fields || []).join(' | ')
    }))
  }

  function exportFiltered() {
    exportRowsToCsv(
      'surplox_admin_filtered_results.csv',
      makeWorkerExportRows(filteredWorkers)
    )
  }

  function exportWorkers() {
    exportRowsToCsv(
      'surplox_worker_list.csv',
      makeWorkerExportRows(
        mergedWorkers.filter((w) => w.role === 'laborer' || w.role === 'subcontractor')
      )
    )
  }

  function exportContractors() {
    exportRowsToCsv(
      'surplox_contractor_list.csv',
      makeWorkerExportRows(mergedWorkers.filter((w) => w.role === 'contractor'))
    )
  }

  function exportAvailable() {
    exportRowsToCsv(
      'surplox_available_workers.csv',
      makeWorkerExportRows(mergedWorkers.filter((w) => w.is_available))
    )
  }

  function exportByTrade() {
    const tradeId = String(filters.trade_id || '')
    if (!tradeId) return
    exportRowsToCsv(
      'surplox_selected_trade.csv',
      makeWorkerExportRows(mergedWorkers.filter((w) => String(w.trade_id) === tradeId))
    )
  }

  function exportByZip() {
    const zip = String(filters.job_zip || '').trim()
    if (!zip) return
    exportRowsToCsv(
      'surplox_selected_zip.csv',
      makeWorkerExportRows(mergedWorkers.filter((w) => String(w.home_zip || '') === zip))
    )
  }

  async function saveAdminFields(userId, adminRating, adminNotes, followUpStatus) {
    setSavingId(userId)
    setMsg('')

    try {
      const ratingNum = adminRating === '' ? null : Number(adminRating)

      if (ratingNum !== null && (!Number.isFinite(ratingNum) || ratingNum < 1 || ratingNum > 5)) {
        throw new Error(copy.saveError)
      }

      const { error } = await supabase
        .from('contact_private')
        .upsert(
          {
            user_id: userId,
            admin_rating: ratingNum,
            admin_notes: String(adminNotes || ''),
            admin_follow_up_status: String(followUpStatus || '')
          },
          { onConflict: 'user_id' }
        )

      if (error) throw error

      setPrivateRows((prev) => {
        const exists = prev.some((row) => row.user_id === userId)
        if (exists) {
          return prev.map((row) =>
            row.user_id === userId
              ? {
                  ...row,
                  admin_rating: ratingNum,
                  admin_notes: String(adminNotes || ''),
                  admin_follow_up_status: String(followUpStatus || '')
                }
              : row
          )
        }

        return [
          ...prev,
          {
            user_id: userId,
            admin_rating: ratingNum,
            admin_notes: String(adminNotes || ''),
            admin_follow_up_status: String(followUpStatus || '')
          }
        ]
      })

      setMsg(copy.saved)
    } catch (e) {
      console.error(e)
      setMsg(e?.message || copy.saveError)
    } finally {
      setSavingId(null)
    }
  }

  if (loading) {
    return <div className="card">{copy.loading}</div>
  }

  return (
    <div className="grid" style={{ gap: 12 }}>
      <div className="card">
        <div className="h1" style={{ marginTop: 0, fontSize: 24 }}>
          {copy.pageTitle}
        </div>
        <p className="card-section-subtitle">{copy.pageIntro}</p>
      </div>

      <div className="card">
        <div className="card-section-title">{copy.analyticsTitle}</div>
        <div className="grid two" style={{ marginTop: 12 }}>
          {[
            [copy.totalUsers, analytics.totalUsers],
            [copy.laborers, analytics.laborers],
            [copy.subcontractors, analytics.subcontractors],
            [copy.contractors, analytics.contractors],
            [copy.suppliers, analytics.suppliers],
            [copy.availableWorkers, analytics.availableWorkers],
            [copy.completedProfiles, analytics.completedProfiles],
            [copy.incompleteProfiles, analytics.incompleteProfiles],
            [copy.totalPosts, analytics.totalPosts],
            [copy.needCrewPosts, analytics.needCrewPosts],
            [copy.lookingForWorkPosts, analytics.lookingForWorkPosts],
            [copy.discussions, analytics.discussions],
            [copy.crewJoins, analytics.crewJoins],
            [copy.hires, analytics.hires],
            [copy.openCrewPosts, analytics.openCrewPosts],
            [copy.fullCrewPosts, analytics.fullCrewPosts],
            [copy.closedCrewPosts, analytics.closedCrewPosts],
            [copy.totalComments, analytics.totalComments]
          ].map(([label, value]) => (
            <div key={label} className="card card-soft">
              <div className="card-section-title" style={{ fontSize: 15 }}>
                {label}
              </div>
              <div className="h1" style={{ fontSize: 28, margin: '8px 0 0' }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid two">
        <div className="card">
          <div className="card-section-title">{copy.marketTitle}</div>

          <div className="grid two" style={{ marginTop: 12 }}>
            <div className="card card-soft">
              <div className="card-section-title">{copy.topTradesByUsers}</div>
              <div style={{ marginTop: 10 }}>
                {marketIntel.topTradesByUsers.length ? (
                  marketIntel.topTradesByUsers.map(([name, count]) => (
                    <div key={name} className="row" style={{ justifyContent: 'space-between' }}>
                      <span>{name}</span>
                      <span className="badge">{count} {copy.userCount}</span>
                    </div>
                  ))
                ) : (
                  <div className="muted">{copy.noData}</div>
                )}
              </div>
            </div>

            <div className="card card-soft">
              <div className="card-section-title">{copy.topTradesByDemand}</div>
              <div style={{ marginTop: 10 }}>
                {marketIntel.topTradesByDemand.length ? (
                  marketIntel.topTradesByDemand.map(([name, count]) => (
                    <div key={name} className="row" style={{ justifyContent: 'space-between' }}>
                      <span>{name}</span>
                      <span className="badge">{count} {copy.requests}</span>
                    </div>
                  ))
                ) : (
                  <div className="muted">{copy.noData}</div>
                )}
              </div>
            </div>

            <div className="card card-soft">
              <div className="card-section-title">{copy.topZipsByWorkers}</div>
              <div style={{ marginTop: 10 }}>
                {marketIntel.topZipsByWorkers.length ? (
                  marketIntel.topZipsByWorkers.map(([name, count]) => (
                    <div key={name} className="row" style={{ justifyContent: 'space-between' }}>
                      <span>{name || copy.unknown}</span>
                      <span className="badge">{count} {copy.workers}</span>
                    </div>
                  ))
                ) : (
                  <div className="muted">{copy.noData}</div>
                )}
              </div>
            </div>

            <div className="card card-soft">
              <div className="card-section-title">{copy.topZipsByCrewRequests}</div>
              <div style={{ marginTop: 10 }}>
                {marketIntel.topZipsByCrewRequests.length ? (
                  marketIntel.topZipsByCrewRequests.map(([name, count]) => (
                    <div key={name} className="row" style={{ justifyContent: 'space-between' }}>
                      <span>{name || copy.unknown}</span>
                      <span className="badge">{count} {copy.requests}</span>
                    </div>
                  ))
                ) : (
                  <div className="muted">{copy.noData}</div>
                )}
              </div>
            </div>
          </div>

          <div className="card card-soft" style={{ marginTop: 12 }}>
            <div className="card-section-title">{copy.marketGapFinder}</div>
            <div className="grid" style={{ marginTop: 10, gap: 8 }}>
              {marketIntel.gapRows.length ? (
                marketIntel.gapRows.map((row) => (
                  <div
                    key={row.tradeName}
                    className="row"
                    style={{
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: 14,
                      border: '1px solid rgba(255, 222, 89, 0.16)',
                      background: 'rgba(255,255,255,0.02)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700 }}>{row.tradeName}</div>
                      <div className="muted" style={{ fontSize: 13 }}>
                        {copy.supply}: {row.supply} • {copy.demand}: {row.demand} • {copy.gap}:{' '}
                        {row.gap}
                      </div>
                    </div>
                    <span className="badge">
                      {row.status === 'surplus'
                        ? copy.surplus
                        : row.status === 'shortage'
                        ? copy.shortage
                        : copy.balanced}
                    </span>
                  </div>
                ))
              ) : (
                <div className="muted">{copy.noData}</div>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-section-title">{copy.activityTitle}</div>

          <div className="grid two" style={{ marginTop: 12 }}>
            <div className="card card-soft">
              <div className="card-section-title">{copy.newestUsers}</div>
              <div style={{ marginTop: 10 }}>
                {activity.newestUsers.length ? (
                  activity.newestUsers.map((row) => (
                    <div key={row.user_id} className="row" style={{ justifyContent: 'space-between' }}>
                      <span>{row.display_name || copy.unknownMember}</span>
                      <span className="muted">{formatDateTime(row.created_at)}</span>
                    </div>
                  ))
                ) : (
                  <div className="muted">{copy.noData}</div>
                )}
              </div>
            </div>

            <div className="card card-soft">
              <div className="card-section-title">{copy.newestPosts}</div>
              <div style={{ marginTop: 10 }}>
                {activity.newestPosts.length ? (
                  activity.newestPosts.map((row) => (
                    <div key={row.id} className="row" style={{ justifyContent: 'space-between' }}>
                      <span>{row.title || copy.unknown}</span>
                      <span className="muted">{formatDateTime(row.created_at)}</span>
                    </div>
                  ))
                ) : (
                  <div className="muted">{copy.noData}</div>
                )}
              </div>
            </div>

            <div className="card card-soft">
              <div className="card-section-title">{copy.newestCrewJoins}</div>
              <div style={{ marginTop: 10 }}>
                {activity.newestCrewJoins.length ? (
                  activity.newestCrewJoins.map((row, idx) => (
                    <div key={`${row.user_id}-${row.post_id}-${idx}`} className="row" style={{ justifyContent: 'space-between' }}>
                      <span>{row.user_name}</span>
                      <span className="muted">{row.post_title}</span>
                    </div>
                  ))
                ) : (
                  <div className="muted">{copy.noData}</div>
                )}
              </div>
            </div>

            <div className="card card-soft">
              <div className="card-section-title">{copy.newestHires}</div>
              <div style={{ marginTop: 10 }}>
                {activity.newestHires.length ? (
                  activity.newestHires.map((row, idx) => (
                    <div key={`${row.user_id}-${row.post_id}-${idx}`} className="row" style={{ justifyContent: 'space-between' }}>
                      <span>{row.user_name}</span>
                      <span className="muted">{row.post_title}</span>
                    </div>
                  ))
                ) : (
                  <div className="muted">{copy.noData}</div>
                )}
              </div>
            </div>
          </div>

          <div className="card card-soft" style={{ marginTop: 12 }}>
            <div className="card-section-title">{copy.mostActiveMembers}</div>
            <div style={{ marginTop: 10 }}>
              {activity.mostActiveMembers.length ? (
                activity.mostActiveMembers.map((row) => (
                  <div key={row.user_id} className="row" style={{ justifyContent: 'space-between' }}>
                    <div>
                      <div>{row.display_name}</div>
                      <div className="muted" style={{ fontSize: 13 }}>
                        {roleLabel(row.role, copy)}
                      </div>
                    </div>
                    <span className="badge">
                      {row.score} {copy.connections}
                    </span>
                  </div>
                ))
              ) : (
                <div className="muted">{copy.noData}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-section-title">{copy.filtersTitle}</div>
        <p className="card-section-subtitle" style={{ marginTop: 6 }}>
          {copy.filtersIntro}
        </p>

        <div className="grid two" style={{ marginTop: 12 }}>
          <div>
            <div className="muted" style={{ marginBottom: 6 }}>{copy.searchLabel}</div>
            <input
              className="input"
              value={filters.q}
              placeholder={copy.searchPlaceholder}
              onChange={(e) => setF('q', e.target.value)}
            />
          </div>

          <div>
            <div className="muted" style={{ marginBottom: 6 }}>{copy.tradeLabel}</div>
            <select
              className="input"
              value={filters.trade_id}
              onChange={(e) => setF('trade_id', e.target.value)}
            >
              <option value="">{copy.allTrades}</option>
              {trades.map((tr) => (
                <option key={tr.id} value={tr.id}>
                  {tr.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="muted" style={{ marginBottom: 6 }}>{copy.roleLabel}</div>
            <select
              className="input"
              value={filters.role}
              onChange={(e) => setF('role', e.target.value)}
            >
              <option value="">{copy.allRoles}</option>
              <option value="laborer">{copy.laborers}</option>
              <option value="subcontractor">{copy.subcontractors}</option>
              <option value="contractor">{copy.contractors}</option>
              <option value="supplier">{copy.suppliers}</option>
            </select>
          </div>

          <div>
            <div className="muted" style={{ marginBottom: 6 }}>{copy.profileCompletionLabel}</div>
            <select
              className="input"
              value={filters.profile_completion}
              onChange={(e) => setF('profile_completion', e.target.value)}
            >
              <option value="all">{copy.profileCompletionAll}</option>
              <option value="complete">{copy.profileCompletionComplete}</option>
              <option value="incomplete">{copy.profileCompletionIncomplete}</option>
            </select>
          </div>

          <div>
            <div className="muted" style={{ marginBottom: 6 }}>{copy.zipLabel}</div>
            <input
              className="input"
              value={filters.job_zip}
              onChange={(e) => setF('job_zip', e.target.value)}
            />
          </div>

          <div>
            <div className="muted" style={{ marginBottom: 6 }}>{copy.radiusLabel}</div>
            <input
              className="input"
              type="number"
              min="1"
              value={filters.job_radius_miles}
              onChange={(e) => setF('job_radius_miles', e.target.value)}
            />
          </div>

          <div>
            <div className="muted" style={{ marginBottom: 6 }}>{copy.availabilityLabel}</div>
            <select
              className="input"
              value={filters.availability}
              onChange={(e) => setF('availability', e.target.value)}
            >
              <option value="all">{copy.availabilityAll}</option>
              <option value="available">{copy.availabilityAvailable}</option>
              <option value="unavailable">{copy.availabilityUnavailable}</option>
            </select>
          </div>

          <div>
            <div className="muted" style={{ marginBottom: 6 }}>{copy.minCrewLabel}</div>
            <input
              className="input"
              type="number"
              min="1"
              value={filters.min_crew_size}
              onChange={(e) => setF('min_crew_size', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-section-title">{copy.exportTitle}</div>
        <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn primary" onClick={exportFiltered}>
            {copy.exportFiltered}
          </button>
          <button className="btn" onClick={exportWorkers}>
            {copy.exportWorkers}
          </button>
          <button className="btn" onClick={exportContractors}>
            {copy.exportContractors}
          </button>
          <button className="btn" onClick={exportAvailable}>
            {copy.exportAvailable}
          </button>
          <button className="btn" onClick={exportByTrade}>
            {copy.exportByTrade}
          </button>
          <button className="btn" onClick={exportByZip}>
            {copy.exportByZip}
          </button>
        </div>
      </div>

      {msg ? (
        <div className="card card-message">
          {msg}
        </div>
      ) : null}

      <div className="card">
        <div className="card-section-title">
          {copy.workerIntelTitle} • {filteredWorkers.length} {copy.results}
        </div>

        <div className="grid" style={{ gap: 12, marginTop: 12 }}>
          {filteredWorkers.map((worker) => (
            <div key={worker.user_id} className="card card-soft">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 280 }}>
                  <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div className="card-section-title" style={{ fontSize: 18 }}>
                        {worker.display_name || copy.unknownMember}
                      </div>
                      <div className="muted" style={{ marginTop: 4 }}>
                        {worker.trade_name || copy.unknown}
                      </div>
                    </div>

                    <div className="row">
                      {worker.role ? (
                        <span className="badge" style={roleBadgeStyle(worker.role)}>
                          {roleLabel(worker.role, copy)}
                        </span>
                      ) : null}

                      {worker.is_available ? (
                        <span className="badge" style={availabilityBadgeStyle(true)}>
                          {copy.available}
                        </span>
                      ) : (
                        <span className="badge">{copy.notAvailable}</span>
                      )}

                      {worker.trade_name ? <span className="badge">{worker.trade_name}</span> : null}

                      <span
                        className="badge"
                        style={worker.profile_complete
                          ? {
                              color: '#ff751f',
                              borderColor: 'rgba(255, 222, 89, 0.65)',
                              background: 'rgba(255, 222, 89, 0.14)'
                            }
                          : {
                              color: '#ffde59',
                              borderColor: 'rgba(255, 117, 31, 0.55)',
                              background: 'rgba(255, 117, 31, 0.12)'
                            }}
                      >
                        {copy.profileStatus}: {worker.profile_complete ? copy.profileComplete : copy.profileIncomplete}
                      </span>

                      {worker.distance_miles != null ? (
                        <span className="badge">
                          {worker.distance_miles.toFixed(1)} {copy.milesAway}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid two">
                    <div className="card card-soft">
                      <div className="card-section-title" style={{ fontSize: 15 }}>
                        {copy.location}
                      </div>
                      <div className="muted" style={{ marginTop: 6 }}>
                        {worker.city || copy.unknown} • ZIP {worker.home_zip || copy.unknown}
                      </div>
                    </div>

                    <div className="card card-soft">
                      <div className="card-section-title" style={{ fontSize: 15 }}>
                        {copy.crewRadius}
                      </div>
                      <div className="muted" style={{ marginTop: 6 }}>
                        {copy.crewSize}: {worker.crew_size || 0} • {copy.travelRadius}:{' '}
                        {worker.travel_radius_miles || 0} miles
                      </div>
                    </div>

                    <div className="card card-soft">
                      <div className="card-section-title" style={{ fontSize: 15 }}>
                        {copy.contact}
                      </div>
                      <div className="stack-sm" style={{ marginTop: 8 }}>
                        <div className="muted">Phone: {worker.phone || copy.unknown}</div>
                        <div className="muted">Email: {worker.email || copy.unknown}</div>
                        <div className="muted">City: {worker.city || copy.unknown}</div>
                      </div>
                    </div>

                    <div className="card card-soft">
                      <div className="card-section-title" style={{ fontSize: 15 }}>
                        {copy.bio}
                      </div>
                      <div className="muted" style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>
                        {worker.bio || copy.noData}
                      </div>
                    </div>

                    {!worker.profile_complete ? (
                      <div
                        className="card card-soft"
                        style={{
                          gridColumn: '1 / -1',
                          borderColor: 'rgba(255, 117, 31, 0.28)',
                          background: 'rgba(255, 117, 31, 0.05)'
                        }}
                      >
                        <div className="card-section-title" style={{ fontSize: 15 }}>
                          {copy.missingFields}
                        </div>
                        <div className="muted" style={{ marginTop: 8 }}>
                          {worker.missing_profile_fields.join(' • ')}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="row" style={{ marginTop: 12 }}>
                    <span className="badge">
                      {copy.workedWithCount}: {worker.worked_with_count || 0}
                    </span>
                    <span className="badge">
                      {copy.hiresCount}: {worker.hires_count || 0}
                    </span>
                    <span className="badge">
                      {copy.crewsJoinedCount}: {worker.crews_joined_count || 0}
                    </span>
                  </div>

                  <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <Link className="btn small primary" to={`/u/${worker.user_id}`}>
                      {copy.openProfile}
                    </Link>
                    {posts.find((p) => p.author_id === worker.user_id) ? (
                      <Link
                        className="btn small"
                        to={`/p/${posts.find((p) => p.author_id === worker.user_id).id}`}
                      >
                        {copy.openPost}
                      </Link>
                    ) : null}
                  </div>
                </div>

                <div style={{ width: 320, maxWidth: '100%' }}>
                  <div className="card card-soft">
                    <div className="card-section-title" style={{ fontSize: 15 }}>
                      {copy.privateAdmin}
                    </div>

                    <div style={{ marginTop: 10 }}>
                      <div className="muted" style={{ marginBottom: 6 }}>
                        {copy.privateRating}
                      </div>
                      <input
                        className="input"
                        type="number"
                        min="1"
                        max="5"
                        value={worker.admin_rating ?? ''}
                        placeholder={copy.ratingPlaceholder}
                        onChange={(e) => {
                          const next = e.target.value
                          setPrivateRows((prev) => {
                            const exists = prev.some((row) => row.user_id === worker.user_id)
                            if (exists) {
                              return prev.map((row) =>
                                row.user_id === worker.user_id
                                  ? { ...row, admin_rating: next }
                                  : row
                              )
                            }
                            return [...prev, { user_id: worker.user_id, admin_rating: next }]
                          })
                        }}
                      />
                    </div>

                    <div style={{ marginTop: 10 }}>
                      <div className="muted" style={{ marginBottom: 6 }}>
                        {copy.followUpStatus}
                      </div>
                      <input
                        className="input"
                        value={worker.admin_follow_up_status || ''}
                        placeholder={copy.followUpPlaceholder}
                        onChange={(e) => {
                          const next = e.target.value
                          setPrivateRows((prev) => {
                            const exists = prev.some((row) => row.user_id === worker.user_id)
                            if (exists) {
                              return prev.map((row) =>
                                row.user_id === worker.user_id
                                  ? { ...row, admin_follow_up_status: next }
                                  : row
                              )
                            }
                            return [
                              ...prev,
                              { user_id: worker.user_id, admin_follow_up_status: next }
                            ]
                          })
                        }}
                      />
                    </div>

                    <div style={{ marginTop: 10 }}>
                      <div className="muted" style={{ marginBottom: 6 }}>
                        {copy.privateNotes}
                      </div>
                      <textarea
                        className="input"
                        value={worker.admin_notes || ''}
                        placeholder={copy.notesPlaceholder}
                        onChange={(e) => {
                          const next = e.target.value
                          setPrivateRows((prev) => {
                            const exists = prev.some((row) => row.user_id === worker.user_id)
                            if (exists) {
                              return prev.map((row) =>
                                row.user_id === worker.user_id
                                  ? { ...row, admin_notes: next }
                                  : row
                              )
                            }
                            return [...prev, { user_id: worker.user_id, admin_notes: next }]
                          })
                        }}
                      />
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <button
                        className="btn primary"
                        disabled={savingId === worker.user_id}
                        onClick={() =>
                          saveAdminFields(
                            worker.user_id,
                            worker.admin_rating,
                            worker.admin_notes,
                            worker.admin_follow_up_status
                          )
                        }
                      >
                        {savingId === worker.user_id ? copy.saving : copy.save}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}