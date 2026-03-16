import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { t } from '../i18n'

const POST_TYPE_OPTIONS = [
  { value: 'discussion', en: 'Discussion', es: 'Discusión' },
  { value: 'need_crew', en: 'Need Crew', es: 'Se necesita cuadrilla' },
  { value: 'looking_for_work', en: 'Looking for Work', es: 'Buscando trabajo' }
]

const CATEGORY_GROUP_OPTIONS = [
  { value: 'trade', en: 'Trades', es: 'Oficios' },
  { value: 'jobsite_support', en: 'Jobsite Support', es: 'Soporte de obra' }
]

const JOBSITE_SUPPORT_OPTIONS = [
  {
    value: 'material_delivery',
    en: 'Material Delivery / Hot Shot',
    es: 'Entrega de materiales / Hot Shot'
  },
  {
    value: 'cargo_van_delivery',
    en: 'Cargo Van / Local Delivery',
    es: 'Cargo Van / Entrega local'
  },
  {
    value: 'equipment_fleet_repair',
    en: 'Equipment / Fleet Repair',
    es: 'Reparación de equipo / flota'
  }
]

const MATERIAL_DELIVERY_SERVICE_TAGS = [
  { value: 'material_delivery', en: 'Material Delivery', es: 'Entrega de materiales' },
  { value: 'hot_shot', en: 'Hot Shot', es: 'Hot Shot' },
  { value: 'last_mile_delivery', en: 'Last Mile Delivery', es: 'Entrega última milla' },
  { value: 'local_runs', en: 'Local Runs', es: 'Viajes locales' },
  { value: 'same_day_delivery', en: 'Same Day Delivery', es: 'Entrega el mismo día' },
  { value: 'long_distance', en: 'Long Distance', es: 'Larga distancia' }
]

const MATERIAL_DELIVERY_EQUIPMENT_TAGS = [
  { value: 'pickup_truck', en: 'Pickup Truck', es: 'Pickup' },
  { value: 'cargo_van', en: 'Cargo Van', es: 'Cargo van' },
  { value: 'flatbed_trailer', en: 'Flatbed Trailer', es: 'Remolque plataforma' },
  { value: 'gooseneck_trailer', en: 'Gooseneck Trailer', es: 'Remolque gooseneck' }
]

const FLEET_REPAIR_SERVICE_TAGS = [
  { value: 'diesel_mechanic', en: 'Diesel Mechanic', es: 'Mecánico diésel' },
  { value: 'heavy_equipment_repair', en: 'Heavy Equipment Repair', es: 'Reparación de equipo pesado' },
  { value: 'trailer_repair', en: 'Trailer Repair', es: 'Reparación de remolques' },
  { value: 'emergency_repair', en: 'Emergency Repair', es: 'Reparación de emergencia' },
  { value: 'jobsite_service', en: 'Jobsite Service', es: 'Servicio en obra' }
]

const FLEET_REPAIR_EQUIPMENT_TAGS = [
  { value: 'mobile_repair_truck', en: 'Mobile Repair Truck', es: 'Camión de reparación móvil' },
  { value: 'diesel_diagnostics', en: 'Diesel Diagnostics', es: 'Diagnóstico diésel' },
  { value: 'trailer_brake_tools', en: 'Trailer Brake Tools', es: 'Herramientas de frenos de remolque' }
]

function postTypeLabel(type, lang) {
  const match = POST_TYPE_OPTIONS.find((x) => x.value === type)
  if (!match) return type
  return lang === 'es' ? match.es : match.en
}

function categoryGroupLabel(value, lang) {
  const match = CATEGORY_GROUP_OPTIONS.find((x) => x.value === value)
  if (!match) return value
  return lang === 'es' ? match.es : match.en
}

function jobsiteSupportLabel(value, lang) {
  const match = JOBSITE_SUPPORT_OPTIONS.find((x) => x.value === value)
  if (!match) return value
  return lang === 'es' ? match.es : match.en
}

function getValidPostType(type) {
  return POST_TYPE_OPTIONS.some((x) => x.value === type) ? type : 'discussion'
}

function getValidCategoryGroup(value) {
  return CATEGORY_GROUP_OPTIONS.some((x) => x.value === value) ? value : 'trade'
}

function getValidSupportType(value) {
  return JOBSITE_SUPPORT_OPTIONS.some((x) => x.value === value) ? value : 'material_delivery'
}

function getPostTypeTheme(type) {
  if (type === 'need_crew') {
    return {
      badge: { background: '#ffde59', color: '#111111' },
      hero: { background: 'linear-gradient(180deg, #fff7cf 0%, #ffffff 100%)' },
      panel: { background: '#fffaf0' }
    }
  }

  if (type === 'looking_for_work') {
    return {
      badge: { background: '#fff0b4', color: '#111111' },
      hero: { background: 'linear-gradient(180deg, #f8f7ef 0%, #ffffff 100%)' },
      panel: { background: '#f8f7ef' }
    }
  }

  return {
    badge: { background: '#ecebe3', color: '#111111' },
    hero: { background: 'linear-gradient(180deg, #f5f4ec 0%, #ffffff 100%)' },
    panel: { background: '#f8f8f4' }
  }
}

function getServiceAndEquipmentOptions(jobsiteSupportType) {
  if (jobsiteSupportType === 'material_delivery') {
    return {
      serviceOptions: MATERIAL_DELIVERY_SERVICE_TAGS,
      equipmentOptions: MATERIAL_DELIVERY_EQUIPMENT_TAGS
    }
  }

  if (jobsiteSupportType === 'cargo_van_delivery') {
    return {
      serviceOptions: MATERIAL_DELIVERY_SERVICE_TAGS.filter((option) =>
        ['material_delivery', 'last_mile_delivery', 'local_runs', 'same_day_delivery'].includes(option.value)
      ),
      equipmentOptions: MATERIAL_DELIVERY_EQUIPMENT_TAGS.filter((option) =>
        ['pickup_truck', 'cargo_van'].includes(option.value)
      )
    }
  }

  if (jobsiteSupportType === 'equipment_fleet_repair') {
    return {
      serviceOptions: FLEET_REPAIR_SERVICE_TAGS,
      equipmentOptions: FLEET_REPAIR_EQUIPMENT_TAGS
    }
  }

  return {
    serviceOptions: [],
    equipmentOptions: []
  }
}

function formatTagLabel(tag, lang = 'en') {
  const all = [
    ...MATERIAL_DELIVERY_SERVICE_TAGS,
    ...MATERIAL_DELIVERY_EQUIPMENT_TAGS,
    ...FLEET_REPAIR_SERVICE_TAGS,
    ...FLEET_REPAIR_EQUIPMENT_TAGS
  ]
  const found = all.find((item) => item.value === tag)
  if (!found) return tag
  return lang === 'es' ? found.es : found.en
}

async function uploadPostImages(files, userId) {
  if (!files?.length) return []

  const uploadedPaths = []

  for (const file of files) {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const safeName = `${userId}/${crypto.randomUUID()}.${ext}`

    const { error } = await supabase.storage.from('post-images').upload(safeName, file, {
      cacheControl: '3600',
      upsert: false
    })

    if (error) throw error
    uploadedPaths.push(safeName)
  }

  return uploadedPaths
}

export default function NewPost({ lang: langProp = 'en' }) {
  const [trades, setTrades] = useState([])
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [lang, setLang] = useState(langProp || localStorage.getItem('surplox_lang') || 'en')
  const [profilePromptItems, setProfilePromptItems] = useState([])
  const [profileGateMessage, setProfileGateMessage] = useState('')
  const [profileReadyForPosting, setProfileReadyForPosting] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])

  const location = useLocation()
  const navigate = useNavigate()

  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const preselectedType = getValidPostType(params.get('type'))
  const preselectedCategory = getValidCategoryGroup(params.get('category') || params.get('group'))
  const preselectedSupport = getValidSupportType(params.get('support'))

  const [form, setForm] = useState({
    post_type: preselectedType,
    category_group: preselectedCategory,
    jobsite_support_type: preselectedSupport,
    trade_id: '',
    title: '',
    body: '',
    center_zip: '',
    radius_miles: 50,
    needed_crew_size: '',
    compensation: '',
    start_date: '',
    source_language: langProp || localStorage.getItem('surplox_lang') || 'en',
    service_tags: [],
    equipment_tags: [],
    is_urgent: false,
    poster_role: '',
    business_name: '',
    business_zip: ''
  })

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      post_type: preselectedType,
      category_group: preselectedCategory,
      jobsite_support_type: preselectedSupport
    }))
  }, [preselectedType, preselectedCategory, preselectedSupport])

  useEffect(() => {
    async function loadTradesAndProfile() {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user

      if (user) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        const { data: cp } = await supabase
          .from('contact_private')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        const userLang =
          prof?.preferred_language || langProp || localStorage.getItem('surplox_lang') || 'en'

        setLang(userLang)
        localStorage.setItem('surplox_lang', userLang)

        const role = String(prof?.role || '')
        const profileCategoryGroup = prof?.category_group || preselectedCategory || 'trade'
        const profileSupportType =
          profileCategoryGroup === 'jobsite_support' ? preselectedSupport : 'material_delivery'

        setForm((prev) => ({
          ...prev,
          source_language: prev.source_language || userLang,
          trade_id: prev.trade_id || (prof?.trade_id ? String(prof.trade_id) : ''),
          center_zip: prev.center_zip || String(prof?.business_zip || prof?.home_zip || ''),
          category_group:
            preselectedCategory === 'jobsite_support'
              ? 'jobsite_support'
              : role === 'supplier'
                ? 'trade'
                : profileCategoryGroup,
          jobsite_support_type: preselectedSupport || profileSupportType,
          poster_role: role,
          business_name: String(prof?.business_name || ''),
          business_zip: String(prof?.business_zip || ''),
          service_tags: Array.isArray(prof?.service_tags) ? prof.service_tags : prev.service_tags,
          equipment_tags: Array.isArray(prof?.equipment_tags) ? prof.equipment_tags : prev.equipment_tags
        }))

        const prompts = []

        if (!String(prof?.first_name || '').trim() || !String(prof?.last_name || '').trim()) {
          prompts.push(userLang === 'es' ? 'Agrega nombre y apellido' : 'Add first and last name')
        }

        if (!String(prof?.role || '').trim()) {
          prompts.push(userLang === 'es' ? 'Agrega rol principal' : 'Add primary role')
        }

        if (
          !['supplier', 'driver', 'mechanic'].includes(role) &&
          (!Number(prof?.crew_size || 0) || Number(prof?.crew_size || 0) <= 1)
        ) {
          prompts.push(userLang === 'es' ? 'Agrega tamaño de cuadrilla' : 'Add crew size')
        }

        if (!String(prof?.bio || '').trim()) {
          prompts.push(
            userLang === 'es'
              ? 'Agrega experiencia y certificaciones en tu biografía'
              : 'Add experience and certifications in your bio'
          )
        }

        if (!String(cp?.phone || '').trim()) {
          prompts.push(userLang === 'es' ? 'Agrega número de teléfono' : 'Add phone number')
        }

        if (!String(cp?.city || '').trim()) {
          prompts.push(userLang === 'es' ? 'Agrega ciudad' : 'Add city')
        }

        setProfilePromptItems(prompts)

        const hasCorePostingProfile = Boolean(
          prof &&
            String(prof.display_name || '').trim() &&
            String(prof.home_zip || '').trim() &&
            (
              prof.trade_id ||
              String(prof.bio || '').trim() ||
              (Array.isArray(prof?.service_tags) && prof.service_tags.length > 0) ||
              (
                role === 'supplier' &&
                String(prof.business_name || '').trim() &&
                String(prof.business_zip || prof.home_zip || '').trim() &&
                (
                  (Array.isArray(prof?.materials_categories) && prof.materials_categories.length > 0) ||
                  String(prof.bio || '').trim()
                )
              )
            )
        )

        setProfileReadyForPosting(hasCorePostingProfile)
      } else {
        const localLang = langProp || localStorage.getItem('surplox_lang') || 'en'
        setLang(localLang)
        setForm((prev) => ({
          ...prev,
          source_language: prev.source_language || localLang
        }))
      }

      const { data, error } = await supabase.from('trades').select('id,name').order('name')
      if (error) console.error(error)
      setTrades(data || [])
    }

    loadTradesAndProfile()
  }, [langProp, preselectedCategory, preselectedSupport])

  useEffect(() => {
    if (!profileReadyForPosting) {
      setProfileGateMessage(
        lang === 'es'
          ? 'Completa tu nombre visible, oficio y ZIP antes de publicar.'
          : 'Complete your display name, trade, and ZIP before posting.'
      )
      return
    }

    if (form.post_type === 'need_crew') {
      const needs = profilePromptItems.filter((item) =>
        [
          'Add crew size',
          'Add phone number',
          'Add city',
          'Agrega tamaño de cuadrilla',
          'Agrega número de teléfono',
          'Agrega ciudad'
        ].includes(item)
      )

      setProfileGateMessage(
        needs.length > 0
          ? lang === 'es'
            ? 'Para publicar "Se necesita cuadrilla", agrega tamaño de cuadrilla, teléfono y ciudad.'
            : 'To publish a Need Crew post, add crew size, phone number, and city.'
          : ''
      )
      return
    }

    if (form.post_type === 'looking_for_work') {
      const needs = profilePromptItems.filter((item) =>
        [
          'Add phone number',
          'Add experience and certifications in your bio',
          'Agrega número de teléfono',
          'Agrega experiencia y certificaciones en tu biografía'
        ].includes(item)
      )

      setProfileGateMessage(
        needs.length > 0
          ? lang === 'es'
            ? 'Para publicar "Buscando trabajo", agrega teléfono y experiencia en tu biografía.'
            : 'To publish a Looking for Work post, add phone number and experience in your bio.'
          : ''
      )
      return
    }

    if (form.poster_role === 'supplier') {
      setProfileGateMessage(
        lang === 'es'
          ? 'Las cuentas de proveedor funcionan mejor con publicaciones de discusión o visibilidad de materiales usando nombre comercial, ZIP comercial y materiales ofrecidos.'
          : 'Supplier accounts work best with discussion or material visibility posts using business name, business ZIP, and offered materials.'
      )
      return
    }

    setProfileGateMessage('')
  }, [form.post_type, form.poster_role, lang, profilePromptItems, profileReadyForPosting])

  useEffect(() => {
    if (form.poster_role === 'supplier' && form.category_group !== 'trade') {
      setForm((prev) => ({
        ...prev,
        category_group: 'trade'
      }))
    }
  }, [form.poster_role, form.category_group])

  useEffect(() => {
    if (form.category_group === 'jobsite_support') {
      setForm((prev) => ({
        ...prev,
        trade_id: '',
        service_tags:
          prev.service_tags.length > 0
            ? prev.service_tags
            : getServiceAndEquipmentOptions(prev.jobsite_support_type).serviceOptions
                .slice(0, 1)
                .map((x) => x.value)
      }))
    }
  }, [form.category_group])

  useEffect(() => {
    if (form.category_group !== 'jobsite_support') return

    const { serviceOptions, equipmentOptions } = getServiceAndEquipmentOptions(form.jobsite_support_type)
    const validServiceSet = new Set(serviceOptions.map((x) => x.value))
    const validEquipmentSet = new Set(equipmentOptions.map((x) => x.value))

    setForm((prev) => ({
      ...prev,
      service_tags: prev.service_tags.filter((tag) => validServiceSet.has(tag)),
      equipment_tags: prev.equipment_tags.filter((tag) => validEquipmentSet.has(tag))
    }))
  }, [form.jobsite_support_type, form.category_group])

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function toggleMultiTag(field, value) {
    setForm((prev) => {
      const current = Array.isArray(prev[field]) ? prev[field] : []
      const exists = current.includes(value)
      return {
        ...prev,
        [field]: exists ? current.filter((x) => x !== value) : [...current, value]
      }
    })
  }

  const helperCopy = useMemo(() => {
    if (lang === 'es') {
      return {
        postType: 'Tipo de publicación',
        categoryGroup: 'Grupo de categoría',
        jobsiteSupportType: 'Tipo de soporte de obra',
        postLanguage: 'Idioma de la publicación',
        english: 'English',
        spanish: 'Español',
        crewSize: 'Tamaño de cuadrilla',
        compensation: 'Pago / tarifa',
        startDate: 'Fecha de inicio',
        selectTrade: 'Discusión general',
        crewExample: 'Ejemplo: 2 trabajadores, empieza el lunes, $250/día',
        workExample: 'Ejemplo: soldador disponible esta semana en Dallas',
        crewTitle:
          'Ejemplo: Se necesitan 2 acabadores de concreto en Fort Worth para empezar el lunes',
        workTitle:
          'Ejemplo: Soldador de tubería disponible para trabajo de paro en DFW',
        supportDeliveryTitle:
          'Ejemplo: Cargo van disponible para entregas de materiales y herramientas en DFW',
        supportCargoVanTitle:
          'Ejemplo: Cargo van disponible para viajes locales, última milla y recogidas el mismo día en DFW',
        supportRepairTitle:
          'Ejemplo: Reparación de remolque y servicio diésel disponible en obra',
        supplierTitle:
          'Ejemplo: Patio de materiales con block, concreto y acero disponible en Fort Worth',
        supplierBody:
          'Describe la ubicación de tu negocio, qué materiales suministras, si ofreces entrega o pickup y cómo pueden contactarte.',
        supplierBusinessNotice:
          'Las cuentas de proveedor funcionan mejor como publicaciones de tienda/ubicación y no como perfiles de trabajador individual.',
        supplierSnapshot: 'Resumen del proveedor',
        businessName: 'Nombre comercial',
        businessZip: 'ZIP comercial',
        crewBody:
          'Describe el oficio, dónde está el trabajo, cuánta gente necesitas, cuándo inicia y los detalles de pago.',
        workBody:
          'Describe tu oficio, disponibilidad, radio de viaje, experiencia y qué tipo de trabajo estás buscando.',
        deliveryBody:
          'Describe el tipo de entrega, vehículo/equipo disponible, zona de cobertura y si haces viajes locales, urgentes o el mismo día.',
        repairBody:
          'Describe el servicio de reparación, el equipo o sistema que atiendes, si haces servicio móvil y tu zona de cobertura.',
        crewRequired:
          'El tamaño de cuadrilla debe ser por lo menos 1 para publicaciones de Se necesita cuadrilla.',
        opportunityIntro:
          'Crea una publicación local de alta visibilidad para que trabajadores y cuadrillas cercanas la encuentren rápidamente.',
        opportunityNotice:
          'Las publicaciones de oportunidad seguirán respetando el ZIP y el radio, pero deben estar escritas con claridad para que los miembros cercanos puedan actuar rápido.',
        discussionTitle:
          'Ejemplo: ¿Cuál es la mejor forma de poner bollards en suelo rocoso?',
        highVisibilityOpportunity: 'Oportunidad de alta visibilidad',
        availabilityPost: 'Publicación de disponibilidad',
        crewCompPlaceholder: '$250/día o $35/hora',
        workCompPlaceholder: '$30/hora deseado o por propuesta',
        invalidPostLanguage: 'Selecciona un idioma válido para la publicación.',
        strengthenTitle: 'Fortalece tu perfil mientras publicas',
        strengthenBody:
          'Ya puedes usar Surplox, pero completar tu perfil hará que tus publicaciones tengan más peso.',
        finishAccount: 'Terminar cuenta',
        heroTitle: 'Crea una publicación más limpia y más fuerte.',
        heroBody:
          'Usa el compositor más claro de Surplox para publicar más rápido y verte más creíble para miembros cercanos.',
        titleLabel: 'Título',
        bodyLabel: 'Detalles',
        radiusLabel: 'Radio (millas)',
        zipLabel: 'ZIP de la publicación',
        publish: 'Publicar',
        publishing: 'Publicando…',
        serviceTags: 'Etiquetas de servicio',
        equipmentTags: 'Etiquetas de equipo',
        urgent: 'Solicitud urgente',
        urgentBody: 'Haz que esta publicación se marque como urgente.',
        photos: 'Fotos de la publicación',
        photoHelp: 'Puedes subir hasta 4 imágenes.',
        categoryHelp:
          'Usa Oficios para mano de obra, discusiones y visibilidad de proveedores. Usa Soporte de obra para entrega de materiales o reparación de flota/equipo.',
        supplierTradeNote:
          'Las publicaciones de proveedor normalmente funcionan como discusión/visibilidad y no requieren un oficio.'
      }
    }

    return {
      postType: 'Post Type',
      categoryGroup: 'Category Group',
      jobsiteSupportType: 'Jobsite Support Type',
      postLanguage: 'Post Language',
      english: 'English',
      spanish: 'Español',
      crewSize: 'Crew Size Needed',
      compensation: 'Pay / Rate',
      startDate: 'Start Date',
      selectTrade: 'General Discussion',
      crewExample: 'Example: 2 workers, starts Monday, $250/day',
      workExample: 'Example: welder available this week in Dallas',
      crewTitle: 'Example: Need 2 concrete finishers in Fort Worth starting Monday',
      workTitle: 'Example: Pipe welder available for shutdown work in DFW',
      supportDeliveryTitle:
        'Example: Cargo van available for material and tool delivery across DFW',
      supportCargoVanTitle:
        'Example: Cargo van available for local runs, last-mile delivery, and same-day pickups in DFW',
      supportRepairTitle:
        'Example: Trailer repair and diesel service available at jobsites',
      supplierTitle:
        'Example: Material yard with block, concrete, and steel available in Fort Worth',
      supplierBody:
        'Describe your business location, what materials you supply, whether you offer delivery or pickup, and how nearby contractors should reach out.',
      supplierBusinessNotice:
        'Supplier accounts work best as storefront/location visibility posts rather than individual worker posts.',
      supplierSnapshot: 'Supplier snapshot',
      businessName: 'Business Name',
      businessZip: 'Business ZIP',
      crewBody:
        'Describe the trade, where the job is, how many people you need, start timing, and pay details.',
      workBody:
        'Describe your trade, availability, travel radius, experience, and what kind of work you want.',
      deliveryBody:
        'Describe the delivery service, vehicle/equipment available, coverage area, and whether you do local runs, urgent pickups, or same-day service.',
      repairBody:
        'Describe the repair service, what equipment or systems you work on, whether you provide mobile service, and your coverage area.',
      crewRequired: 'Crew size must be at least 1 for Need Crew posts.',
      opportunityIntro:
        'Create a high-visibility local opportunity post so nearby workers and crews can find it quickly.',
      opportunityNotice:
        'Opportunity posts will still respect ZIP and radius, but they should be written clearly so nearby members can act fast.',
      discussionTitle: 'Example: Best way to set bollards in rocky soil?',
      highVisibilityOpportunity: 'High Visibility Opportunity',
      availabilityPost: 'Availability Post',
      crewCompPlaceholder: '$250/day or $35/hr',
      workCompPlaceholder: '$30/hr desired or bid-based',
      invalidPostLanguage: 'Select a valid post language.',
      strengthenTitle: 'Strengthen your profile while you post',
      strengthenBody:
        'You can already use Surplox, but completing your profile will make your posts carry more weight.',
      finishAccount: 'Finish Account',
      heroTitle: 'Create a cleaner, stronger post.',
      heroBody:
        'Use the new flatter Surplox composer to publish faster and look more credible to nearby members.',
      titleLabel: 'Title',
      bodyLabel: 'Details',
      radiusLabel: 'Radius (miles)',
      zipLabel: 'Post ZIP',
      publish: 'Publish Post',
      publishing: 'Publishing…',
      serviceTags: 'Service Tags',
      equipmentTags: 'Equipment Tags',
      urgent: 'Urgent Request',
      urgentBody: 'Mark this post as urgent.',
      photos: 'Post Photos',
      photoHelp: 'You can upload up to 4 images.',
      categoryHelp:
        'Use Trades for labor, discussions, and supplier visibility. Use Jobsite Support for material delivery or fleet/equipment repair.',
      supplierTradeNote:
        'Supplier posts usually work as discussion/visibility posts and do not require selecting a trade.'
    }
  }, [lang])

  const { serviceOptions, equipmentOptions } = getServiceAndEquipmentOptions(form.jobsite_support_type)

  function titlePlaceholder() {
    if (form.category_group === 'jobsite_support') {
      if (form.jobsite_support_type === 'material_delivery') return helperCopy.supportDeliveryTitle
      if (form.jobsite_support_type === 'cargo_van_delivery') return helperCopy.supportCargoVanTitle
      return helperCopy.supportRepairTitle
    }
    if (form.poster_role === 'supplier') return helperCopy.supplierTitle
    if (form.post_type === 'need_crew') return helperCopy.crewTitle
    if (form.post_type === 'looking_for_work') return helperCopy.workTitle
    return helperCopy.discussionTitle
  }

  function bodyPlaceholder() {
    if (form.category_group === 'jobsite_support') {
      if (form.jobsite_support_type === 'material_delivery') return helperCopy.deliveryBody
      if (form.jobsite_support_type === 'cargo_van_delivery') return helperCopy.deliveryBody
      return helperCopy.repairBody
    }
    if (form.poster_role === 'supplier') return helperCopy.supplierBody
    if (form.post_type === 'need_crew') return helperCopy.crewBody
    if (form.post_type === 'looking_for_work') return helperCopy.workBody
    return t(lang, 'new_post_body_placeholder')
  }

  function exampleBody() {
    if (form.category_group === 'jobsite_support') {
      if (form.jobsite_support_type === 'material_delivery') return helperCopy.deliveryBody
      if (form.jobsite_support_type === 'cargo_van_delivery') return helperCopy.deliveryBody
      return helperCopy.repairBody
    }
    if (form.poster_role === 'supplier') return helperCopy.supplierBody
    if (form.post_type === 'need_crew') return helperCopy.crewExample
    if (form.post_type === 'looking_for_work') return helperCopy.workExample
    return t(lang, 'new_post_example_body')
  }

  async function create() {
    setSaving(true)
    setMsg('')

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user

      if (!user) {
        throw new Error(lang === 'es' ? 'No has iniciado sesión' : 'Not signed in')
      }

      if (!profileReadyForPosting) {
        throw new Error(profileGateMessage)
      }

      if (form.post_type === 'need_crew' && profileGateMessage) {
        throw new Error(profileGateMessage)
      }

      if (form.post_type === 'looking_for_work' && profileGateMessage) {
        throw new Error(profileGateMessage)
      }

      if (!POST_TYPE_OPTIONS.some((x) => x.value === form.post_type)) {
        throw new Error(
          lang === 'es' ? 'Selecciona un tipo de publicación válido.' : 'Select a valid post type.'
        )
      }

      if (!['en', 'es'].includes(form.source_language)) {
        throw new Error(helperCopy.invalidPostLanguage)
      }

      if (!['trade', 'jobsite_support'].includes(form.category_group)) {
        throw new Error(lang === 'es' ? 'Selecciona una categoría válida.' : 'Select a valid category.')
      }

      if (
        form.category_group === 'jobsite_support' &&
        !['material_delivery', 'cargo_van_delivery', 'equipment_fleet_repair'].includes(form.jobsite_support_type)
      ) {
        throw new Error(
          lang === 'es' ? 'Selecciona un tipo de soporte válido.' : 'Select a valid support type.'
        )
      }

      if (!form.title.trim()) throw new Error(t(lang, 'post_title_required'))
      if (!form.body.trim()) throw new Error(t(lang, 'post_body_required'))
      if (!/^[0-9]{5}$/.test(form.center_zip)) throw new Error(t(lang, 'post_zip_invalid'))

      const radius = Number(form.radius_miles)
      if (!radius || radius < 1 || radius > 300) {
        throw new Error(t(lang, 'post_radius_invalid'))
      }

      if (form.post_type === 'need_crew') {
        const neededCrew = Number(form.needed_crew_size || 0)
        if (!neededCrew || neededCrew < 1) {
          throw new Error(helperCopy.crewRequired)
        }
      }

      if (selectedFiles.length > 4) {
        throw new Error(lang === 'es' ? 'Máximo 4 imágenes.' : 'Maximum 4 images.')
      }

      const { data: zipRow, error: zipErr } = await supabase
        .from('zipcodes')
        .select('zip')
        .eq('zip', form.center_zip)
        .maybeSingle()

      if (zipErr) throw zipErr
      if (!zipRow?.zip) throw new Error(t(lang, 'post_zip_missing'))

      const uploadedPaths = await uploadPostImages(selectedFiles, user.id)

      const payload = {
        author_id: user.id,
        post_type: form.post_type,
        category_group: form.category_group,
        trade_id:
          form.category_group === 'trade' && form.trade_id && form.poster_role !== 'supplier'
            ? Number(form.trade_id)
            : null,
        title: form.title.trim(),
        body: form.body.trim(),
        center_zip: form.center_zip,
        radius_miles: radius,
        source_language: form.source_language,
        service_tags: form.category_group === 'jobsite_support' ? form.service_tags : [],
        equipment_tags: form.category_group === 'jobsite_support' ? form.equipment_tags : [],
        is_urgent: Boolean(form.is_urgent),
        image_urls: uploadedPaths
      }

      if (form.post_type === 'need_crew') {
        payload.needed_crew_size = Number(form.needed_crew_size || 0)
        payload.compensation = form.compensation.trim() || null
        payload.start_date = form.start_date || null
        payload.crew_status = 'open'
      }

      if (form.post_type === 'looking_for_work') {
        payload.compensation = form.compensation.trim() || null
        payload.start_date = form.start_date || null
      }

      const { data: inserted, error: insertErr } = await supabase
        .from('posts')
        .insert(payload)
        .select('id')
        .single()

      if (insertErr) throw insertErr

      navigate(`/p/${inserted.id}`, { replace: true })
    } catch (err) {
      console.error(err)
      setMsg(err.message || t(lang, 'post_create_error'))
    } finally {
      setSaving(false)
    }
  }

  const theme = getPostTypeTheme(form.post_type)
  const isSupplierPost = form.poster_role === 'supplier'

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div
        className="card rounded-xl"
        style={{
          padding: 28,
          ...theme.hero
        }}
      >
        <div className="badge" style={{ ...theme.badge, marginBottom: 14 }}>
          {isSupplierPost && form.category_group === 'trade'
            ? (lang === 'es' ? 'Proveedor' : 'Supplier')
            : postTypeLabel(form.post_type, lang)}
        </div>

        <div className="h1" style={{ maxWidth: 860 }}>
          {helperCopy.heroTitle}
        </div>

        <p className="muted" style={{ marginTop: 12, maxWidth: 820, fontSize: 17, lineHeight: 1.7 }}>
          {helperCopy.heroBody}
        </p>

        <div className="card-soft" style={{ marginTop: 16, background: 'rgba(255,255,255,0.58)' }}>
          <div className="card-section-title" style={{ fontSize: 16 }}>
            {isSupplierPost && form.category_group === 'trade'
              ? helperCopy.supplierSnapshot
              : form.post_type === 'discussion'
                ? t(lang, 'new_post_notice_title')
                : helperCopy.highVisibilityOpportunity}
          </div>
          <p className="card-section-subtitle" style={{ marginTop: 8 }}>
            {isSupplierPost && form.category_group === 'trade'
              ? helperCopy.supplierBusinessNotice
              : form.post_type === 'discussion'
                ? t(lang, 'new_post_notice_body')
                : helperCopy.opportunityNotice}
          </p>

          {isSupplierPost ? (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
              {form.business_name ? (
                <span className="badge">
                  {helperCopy.businessName}: {form.business_name}
                </span>
              ) : null}
              {form.business_zip ? (
                <span className="badge">
                  {helperCopy.businessZip}: {form.business_zip}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {profileGateMessage ? (
        <div className="card rounded-xl" style={{ padding: 22, background: '#fff4da' }}>
          <div className="card-section-title">{helperCopy.strengthenTitle}</div>
          <p className="card-section-subtitle" style={{ marginTop: 8 }}>
            {helperCopy.strengthenBody}
          </p>

          <div style={{ marginTop: 12, fontWeight: 700 }}>{profileGateMessage}</div>

          {profilePromptItems.length > 0 ? (
            <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {profilePromptItems.map((item) => (
                <span key={item} className="badge">
                  {item}
                </span>
              ))}
            </div>
          ) : null}

          <div style={{ marginTop: 14 }}>
            <Link className="btn primary" to="/account">
              {helperCopy.finishAccount}
            </Link>
          </div>
        </div>
      ) : null}

      {msg ? (
        <div className="card-message" style={{ padding: 14, borderRadius: 18 }}>
          {msg}
        </div>
      ) : null}

      <div className="grid two" style={{ alignItems: 'start' }}>
        <div className="card rounded-xl" style={{ padding: 24 }}>
          <div className="card-section-title">{helperCopy.postType}</div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
            {POST_TYPE_OPTIONS.map((option) => {
              const active = option.value === form.post_type
              return (
                <button
                  key={option.value}
                  type="button"
                  className={active ? 'btn primary' : 'btn'}
                  onClick={() => setField('post_type', option.value)}
                >
                  {postTypeLabel(option.value, lang)}
                </button>
              )
            })}
          </div>

          <div className="grid" style={{ gap: 14, marginTop: 18 }}>
            <div>
              <div className="muted" style={{ marginBottom: 6 }}>
                {helperCopy.categoryGroup}
              </div>
              <select
                className="input"
                value={form.category_group}
                onChange={(e) => setField('category_group', e.target.value)}
                disabled={isSupplierPost}
              >
                {CATEGORY_GROUP_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {categoryGroupLabel(option.value, lang)}
                  </option>
                ))}
              </select>
              <div className="muted" style={{ marginTop: 8 }}>
                {helperCopy.categoryHelp}
              </div>
              {isSupplierPost ? (
                <div className="muted" style={{ marginTop: 8 }}>
                  {helperCopy.supplierTradeNote}
                </div>
              ) : null}
            </div>

            {form.category_group === 'jobsite_support' ? (
              <div>
                <div className="muted" style={{ marginBottom: 6 }}>
                  {helperCopy.jobsiteSupportType}
                </div>
                <select
                  className="input"
                  value={form.jobsite_support_type}
                  onChange={(e) => setField('jobsite_support_type', e.target.value)}
                >
                  {JOBSITE_SUPPORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {jobsiteSupportLabel(option.value, lang)}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div className="grid two">
              <div>
                <div className="muted" style={{ marginBottom: 6 }}>
                  {helperCopy.postLanguage}
                </div>
                <select
                  className="input"
                  value={form.source_language}
                  onChange={(e) => setField('source_language', e.target.value)}
                >
                  <option value="en">{helperCopy.english}</option>
                  <option value="es">{helperCopy.spanish}</option>
                </select>
              </div>

              {form.category_group === 'trade' ? (
                <div>
                  <div className="muted" style={{ marginBottom: 6 }}>
                    {t(lang, 'new_post_trade')}
                  </div>
                  <select
                    className="input"
                    value={form.trade_id}
                    onChange={(e) => setField('trade_id', e.target.value)}
                    disabled={isSupplierPost}
                  >
                    <option value="">{helperCopy.selectTrade}</option>
                    {trades.map((trade) => (
                      <option key={trade.id} value={trade.id}>
                        {trade.name}
                      </option>
                    ))}
                  </select>
                  {isSupplierPost ? (
                    <div className="muted" style={{ marginTop: 8 }}>
                      {helperCopy.supplierTradeNote}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div>
                  <div className="muted" style={{ marginBottom: 6 }}>
                    {helperCopy.urgent}
                  </div>
                  <button
                    type="button"
                    className={form.is_urgent ? 'btn primary' : 'btn'}
                    style={{ width: '100%' }}
                    onClick={() => setField('is_urgent', !form.is_urgent)}
                  >
                    {helperCopy.urgent}
                  </button>
                  <div className="muted" style={{ marginTop: 8 }}>
                    {helperCopy.urgentBody}
                  </div>
                </div>
              )}
            </div>

            {form.category_group === 'jobsite_support' ? (
              <>
                <div>
                  <div className="muted" style={{ marginBottom: 6 }}>
                    {helperCopy.serviceTags}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {serviceOptions.map((tag) => {
                      const active = form.service_tags.includes(tag.value)
                      return (
                        <button
                          key={tag.value}
                          type="button"
                          className={active ? 'btn primary small' : 'btn small'}
                          onClick={() => toggleMultiTag('service_tags', tag.value)}
                        >
                          {lang === 'es' ? tag.es : tag.en}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <div className="muted" style={{ marginBottom: 6 }}>
                    {helperCopy.equipmentTags}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {equipmentOptions.map((tag) => {
                      const active = form.equipment_tags.includes(tag.value)
                      return (
                        <button
                          key={tag.value}
                          type="button"
                          className={active ? 'btn primary small' : 'btn small'}
                          onClick={() => toggleMultiTag('equipment_tags', tag.value)}
                        >
                          {lang === 'es' ? tag.es : tag.en}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </>
            ) : null}

            <div>
              <div className="muted" style={{ marginBottom: 6 }}>
                {helperCopy.photos}
              </div>
              <input
                className="input"
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []).slice(0, 4)
                  setSelectedFiles(files)
                }}
              />
              <div className="muted" style={{ marginTop: 8 }}>
                {helperCopy.photoHelp}
              </div>
              {selectedFiles.length > 0 ? (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                  {selectedFiles.map((file) => (
                    <span key={`${file.name}-${file.size}`} className="badge">
                      {file.name}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            {form.post_type !== 'discussion' || form.category_group === 'jobsite_support' || isSupplierPost ? (
              <div
                className="card-soft"
                style={{
                  marginTop: 2,
                  ...theme.panel
                }}
              >
                <div className="card-section-title" style={{ fontSize: 16 }}>
                  {isSupplierPost ? helperCopy.supplierSnapshot : helperCopy.opportunityIntro}
                </div>
                <p className="card-section-subtitle" style={{ marginTop: 8 }}>
                  {exampleBody()}
                </p>

                {form.category_group === 'jobsite_support' ? (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                    {form.service_tags.map((tag) => (
                      <span key={tag} className="badge">
                        {formatTagLabel(tag, lang)}
                      </span>
                    ))}
                    {form.equipment_tags.map((tag) => (
                      <span key={tag} className="badge">
                        {formatTagLabel(tag, lang)}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="card-soft" style={{ marginTop: 2 }}>
                <div className="card-section-title" style={{ fontSize: 16 }}>
                  {t(lang, 'new_post_example')}
                </div>
                <p className="card-section-subtitle" style={{ marginTop: 8 }}>
                  {t(lang, 'new_post_example_body')}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="card rounded-xl" style={{ padding: 24 }}>
          <div className="grid" style={{ gap: 14 }}>
            <div>
              <div className="muted" style={{ marginBottom: 6 }}>
                {helperCopy.titleLabel}
              </div>
              <input
                className="input"
                value={form.title}
                placeholder={titlePlaceholder()}
                onChange={(e) => setField('title', e.target.value)}
              />
            </div>

            <div>
              <div className="muted" style={{ marginBottom: 6 }}>
                {helperCopy.bodyLabel}
              </div>
              <textarea
                className="input"
                value={form.body}
                placeholder={bodyPlaceholder()}
                onChange={(e) => setField('body', e.target.value)}
              />
            </div>

            <div className="grid two">
              <div>
                <div className="muted" style={{ marginBottom: 6 }}>
                  {helperCopy.zipLabel}
                </div>
                <input
                  className="input"
                  value={form.center_zip}
                  inputMode="numeric"
                  onChange={(e) => setField('center_zip', e.target.value)}
                />
              </div>

              <div>
                <div className="muted" style={{ marginBottom: 6 }}>
                  {helperCopy.radiusLabel}
                </div>
                <input
                  className="input"
                  type="number"
                  value={form.radius_miles}
                  onChange={(e) => setField('radius_miles', e.target.value)}
                />
              </div>
            </div>

            {form.post_type === 'need_crew' ? (
              <div className="grid two">
                <div>
                  <div className="muted" style={{ marginBottom: 6 }}>
                    {helperCopy.crewSize}
                  </div>
                  <input
                    className="input"
                    type="number"
                    value={form.needed_crew_size}
                    onChange={(e) => setField('needed_crew_size', e.target.value)}
                  />
                </div>

                <div>
                  <div className="muted" style={{ marginBottom: 6 }}>
                    {helperCopy.compensation}
                  </div>
                  <input
                    className="input"
                    value={form.compensation}
                    placeholder={helperCopy.crewCompPlaceholder}
                    onChange={(e) => setField('compensation', e.target.value)}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <div className="muted" style={{ marginBottom: 6 }}>
                    {helperCopy.startDate}
                  </div>
                  <input
                    className="input"
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setField('start_date', e.target.value)}
                  />
                </div>
              </div>
            ) : null}

            {form.post_type === 'looking_for_work' ? (
              <div className="grid two">
                <div>
                  <div className="muted" style={{ marginBottom: 6 }}>
                    {helperCopy.compensation}
                  </div>
                  <input
                    className="input"
                    value={form.compensation}
                    placeholder={helperCopy.workCompPlaceholder}
                    onChange={(e) => setField('compensation', e.target.value)}
                  />
                </div>

                <div>
                  <div className="muted" style={{ marginBottom: 6 }}>
                    {helperCopy.startDate}
                  </div>
                  <input
                    className="input"
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setField('start_date', e.target.value)}
                  />
                </div>
              </div>
            ) : null}

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 6 }}>
              <button className="btn primary" type="button" onClick={create} disabled={saving}>
                {saving ? helperCopy.publishing : helperCopy.publish}
              </button>

              <Link className="btn" to="/feed">
                {t(lang, 'detail_back_feed')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}