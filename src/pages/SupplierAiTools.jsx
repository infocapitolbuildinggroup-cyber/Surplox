import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

const COPY = {
  en: {
    badge: 'Surplox AI Tools',
    title: 'AI tools for project planning, hiring, supply, and logistics.',
    body:
      'This hub is where Surplox AI tools live. Start with Supplier Suggestions, Crew Matching, and Delivery Coordination, then expand into project analysis.',
    supplierTab: 'Supplier Suggestions AI',
    crewTab: 'Crew Matching AI',
    deliveryTab: 'Delivery Coordination AI',
    projectTab: 'Project Analyzer AI',
    supplierTitle: 'Find the best nearby suppliers for a jobsite.',
    supplierBody:
      'Search Surplox supplier records by material, ZIP, storefront status, business name, and delivery radius to get ranked supplier suggestions.',
    materialLabel: 'Material category',
    allMaterials: 'All materials',
    supplierSearchLabel: 'Supplier / keyword search',
    supplierSearchPlaceholder: 'Concrete, lumber, drywall, rebar, supplier name...',
    supplierZipLabel: 'Jobsite ZIP',
    supplierZipPlaceholder: '76102',
    storefrontOnly: 'Storefront only',
    runSupplier: 'Run Supplier Suggestions',
    supplierResults: 'Suggested suppliers',
    noSupplierResults: 'No supplier suggestions yet. Try a broader material or ZIP search.',
    supplierWhy: 'Why this matched',
    openStorefront: 'Open Storefront',
    openProfile: 'Open Profile',
    supplierRadius: 'Delivery Radius',
    supplierMaterials: 'Materials',
    supplierZip: 'Business ZIP',
    miles: 'mi',
    crewTitle: 'Match the best nearby workers and crews for a job.',
    crewBody:
      'Use current Surplox worker profiles to rank crew candidates by trade, local fit, availability, crew size, and profile strength.',
    tradeLabel: 'Needed trade',
    allTrades: 'All trades',
    crewZipLabel: 'Jobsite ZIP',
    crewZipPlaceholder: '76102',
    radiusLabel: 'Search radius / local fit',
    minCrewLabel: 'Minimum crew size',
    availabilityLabel: 'Availability',
    allAvailability: 'All availability',
    availableNow: 'Available now',
    availableThisWeek: 'Available this week',
    runCrew: 'Run Crew Matching',
    crewResults: 'Ranked crew matches',
    noCrewResults: 'No crew matches yet. Try widening the filters or posting a Need Crew request.',
    whyMatched: 'Why this matched',
    matchScore: 'Match score',
    openWorker: 'Open Worker Profile',
    createNeedCrew: 'Create Need Crew Post',
    role: 'Role',
    trade: 'Trade',
    zip: 'ZIP',
    availability: 'Availability',
    crewSize: 'Crew Size',
    travelRadius: 'Travel Radius',
    profileStrength: 'Profile Strength',
    noBio: 'No bio added yet.',
    storefront: 'Storefront',
    loading: 'Loading AI tools…',
    loadError: 'Unable to load Surplox data right now.',
    exactZip: 'Exact ZIP match',
    nearbyZip: 'Nearby ZIP pattern match',
    materialMatch: 'Material match',
    storefrontBoost: 'Storefront-ready supplier',
    deliveryCoverage: 'Delivery coverage fit',
    tradeMatch: 'Trade match',
    availabilityMatch: 'Availability fit',
    crewSizeMatch: 'Crew size fit',
    profileComplete: 'Stronger profile',
    radiusFit: 'Travel radius fit',
    supplierReady: 'Supplier chosen',
    laneMatch: 'Delivery lane fit',
    payloadFit: 'Payload fit',
    trailerFit: 'Trailer fit',
    vehicleFit: 'Vehicle fit',
    supplierZipFit: 'Pickup ZIP fit',
    deliveryTitle: 'Coordinate the best delivery support from supplier to jobsite.',
    deliveryBody:
      'Start with a supplier or pickup ZIP, then rank nearby Surplox drivers by lane, vehicle, trailer, payload, delivery radius, and local fit.',
    chooseSupplier: 'Supplier pickup point',
    allSuppliers: 'All suppliers',
    supplierOptional: 'Optional: choose a supplier storefront',
    pickupZipLabel: 'Pickup ZIP',
    pickupZipPlaceholder: '76102',
    jobsiteZipLabel: 'Jobsite ZIP',
    jobsiteZipPlaceholder: '76028',
    deliveryLaneLabel: 'Delivery lane',
    allDeliveryLanes: 'All delivery lanes',
    vehicleLabel: 'Vehicle type',
    allVehicles: 'All vehicles',
    trailerLabel: 'Trailer type',
    allTrailers: 'All trailers',
    minPayloadLabel: 'Minimum payload (lbs)',
    minTrailerLengthLabel: 'Minimum trailer length (ft)',
    minDeliveryRadiusLabel: 'Minimum delivery radius (mi)',
    runDelivery: 'Run Delivery Coordination',
    deliveryResults: 'Ranked delivery matches',
    noDeliveryResults:
      'No delivery matches yet. Try widening the lane, trailer, payload, or ZIP filters while more drivers join Surplox.',
    openDriver: 'Open Driver Profile',
    createDeliveryPost: 'Create Delivery Support Post',
    supportLane: 'Delivery Lane',
    vehicleType: 'Vehicle',
    trailerType: 'Trailer',
    payloadCapacity: 'Payload',
    deliveryRadiusLabel: 'Delivery Radius',
    trailerLength: 'Trailer Length',
    serviceTags: 'Service Tags',
    noServiceTags: 'No service tags listed yet.',
    city: 'City',
    noCity: 'No city listed',
    pounds: 'lbs',
    feet: 'ft',
    pickupSummary: 'Pickup / Supplier',
    jobsiteSummary: 'Jobsite',
    projectTitle: 'Turn project notes into a crew, supplier, and logistics plan.',
    projectBody:
      'This first Project Analyzer AI turns pasted blueprint notes, scope descriptions, or bid summaries into a project summary, required trades, suggested crew sizing, supplier categories, and delivery coordination notes. File parsing can be layered in next.',
    projectPasteLabel: 'Paste blueprint notes / project scope',
    projectPastePlaceholder:
      'Example: 18,000 sq ft ground-up retail shell in Fort Worth with sitework, concrete slab, structural steel, framing, roofing, HVAC, plumbing, electrical, storefront glass, drywall, paint, and final finishes. 6 month schedule.',
    projectTypeLabel: 'Project type',
    projectTypeGeneral: 'General build',
    projectTypeGroundUp: 'Ground-up',
    projectTypeTenant: 'Tenant finish / remodel',
    projectTypeSitework: 'Sitework / civil',
    projectTypeIndustrial: 'Industrial / warehouse',
    projectTypeResidential: 'Residential',
    projectSizeLabel: 'Project size',
    projectSizeSmall: 'Small',
    projectSizeMedium: 'Medium',
    projectSizeLarge: 'Large',
    projectFloorsLabel: 'Floors / levels',
    projectUrgencyLabel: 'Schedule urgency',
    projectUrgencyNormal: 'Normal schedule',
    projectUrgencyFast: 'Fast-track',
    projectUrgencyEmergency: 'Emergency / immediate',
    runProject: 'Run Project Analyzer',
    projectSummary: 'Project summary',
    requiredTradesTitle: 'Required trades',
    suggestedCrewTitle: 'Suggested crew sizing',
    supplierPlanTitle: 'Supplier suggestion categories',
    deliveryPlanTitle: 'Delivery coordination notes',
    projectAssumptionsTitle: 'Assumptions',
    analyzerReady: 'Project Analyzer AI is ready',
    analyzerReadyBody:
      'Paste project notes now. This first version uses Surplox-side heuristics and your current marketplace data. Blueprint upload parsing can be added next as a second phase.',
    noProjectInput: 'Add project notes or blueprint scope text to generate a project analysis.',
    summaryFallback: 'General construction project with multiple scopes that will need phased labor, supplier support, and delivery coordination.',
    projectTitle: 'Convierte notas del proyecto en un plan de cuadrilla, proveedores y logística.',
    projectBody:
      'Esta primera versión del AI de Análisis de Proyecto convierte notas pegadas de planos, alcances o resúmenes de oferta en un resumen del proyecto, oficios requeridos, tamaño sugerido de cuadrillas, categorías de proveedores y notas de coordinación de entrega. El análisis directo de archivos se puede agregar después.',
    projectPasteLabel: 'Pega notas del plano / alcance del proyecto',
    projectPastePlaceholder:
      'Ejemplo: obra comercial nueva de 18,000 pies cuadrados en Fort Worth con sitework, losa de concreto, acero estructural, framing, roofing, HVAC, plumbing, electrical, vidrio de fachada, drywall, pintura y acabados finales. Programa de 6 meses.',
    projectTypeLabel: 'Tipo de proyecto',
    projectTypeGeneral: 'Construcción general',
    projectTypeGroundUp: 'Obra nueva',
    projectTypeTenant: 'Acabado interior / remodelación',
    projectTypeSitework: 'Sitework / civil',
    projectTypeIndustrial: 'Industrial / bodega',
    projectTypeResidential: 'Residencial',
    projectSizeLabel: 'Tamaño del proyecto',
    projectSizeSmall: 'Pequeño',
    projectSizeMedium: 'Mediano',
    projectSizeLarge: 'Grande',
    projectFloorsLabel: 'Pisos / niveles',
    projectUrgencyLabel: 'Urgencia del programa',
    projectUrgencyNormal: 'Programa normal',
    projectUrgencyFast: 'Fast-track',
    projectUrgencyEmergency: 'Emergencia / inmediato',
    runProject: 'Ejecutar análisis',
    projectSummary: 'Resumen del proyecto',
    requiredTradesTitle: 'Oficios requeridos',
    suggestedCrewTitle: 'Tamaño sugerido de cuadrillas',
    supplierPlanTitle: 'Categorías sugeridas de proveedores',
    deliveryPlanTitle: 'Notas de coordinación de entrega',
    projectAssumptionsTitle: 'Suposiciones',
    analyzerReady: 'El AI de Análisis de Proyecto ya está listo',
    analyzerReadyBody:
      'Pega notas del proyecto ahora. Esta primera versión usa heurísticas de Surplox y los datos actuales del marketplace. El análisis directo de planos/archivos se puede agregar en una segunda fase.',
    noProjectInput: 'Agrega notas del proyecto o texto del alcance para generar el análisis.',
    summaryFallback: 'Proyecto de construcción general con múltiples alcances que necesitará mano de obra por fases, soporte de proveedores y coordinación de entregas.',
    quickNote:
      'This first version ranks existing Surplox records. Later versions can add external supplier enrichment, project analysis, and smarter logistics coordination.'
  },
  es: {
    badge: 'Herramientas AI de Surplox',
    title: 'Herramientas AI para planeación, contratación, suministro y logística.',
    body:
      'Este centro reúne las herramientas AI de Surplox. Empieza con Sugerencias de Proveedores, Crew Matching y Coordinación de Entrega, y luego expándelo hacia análisis de proyectos.',
    supplierTab: 'AI de Proveedores',
    crewTab: 'AI de Crew Matching',
    deliveryTab: 'AI de Coordinación de Entrega',
    projectTab: 'AI de Análisis de Proyecto',
    supplierTitle: 'Encuentra los mejores proveedores cercanos para una obra.',
    supplierBody:
      'Busca registros de proveedores de Surplox por material, ZIP, tienda física, nombre comercial y radio de entrega para obtener sugerencias clasificadas.',
    materialLabel: 'Categoría de material',
    allMaterials: 'Todos los materiales',
    supplierSearchLabel: 'Búsqueda de proveedor / palabra clave',
    supplierSearchPlaceholder: 'Concreto, madera, drywall, varilla, nombre del proveedor...',
    supplierZipLabel: 'ZIP de la obra',
    supplierZipPlaceholder: '76102',
    storefrontOnly: 'Solo tienda física',
    runSupplier: 'Ejecutar sugerencias',
    supplierResults: 'Proveedores sugeridos',
    noSupplierResults: 'Todavía no hay sugerencias. Prueba con un material o ZIP más amplio.',
    supplierWhy: 'Por qué coincidió',
    openStorefront: 'Abrir tienda',
    openProfile: 'Abrir perfil',
    supplierRadius: 'Radio de entrega',
    supplierMaterials: 'Materiales',
    supplierZip: 'ZIP comercial',
    miles: 'mi',
    crewTitle: 'Empareja a los mejores trabajadores y cuadrillas cercanas para un trabajo.',
    crewBody:
      'Usa los perfiles actuales de Surplox para clasificar candidatos por oficio, cercanía local, disponibilidad, tamaño de cuadrilla y fuerza del perfil.',
    tradeLabel: 'Oficio necesario',
    allTrades: 'Todos los oficios',
    crewZipLabel: 'ZIP de la obra',
    crewZipPlaceholder: '76102',
    radiusLabel: 'Radio de búsqueda / encaje local',
    minCrewLabel: 'Tamaño mínimo de cuadrilla',
    availabilityLabel: 'Disponibilidad',
    allAvailability: 'Toda disponibilidad',
    availableNow: 'Disponible ahora',
    availableThisWeek: 'Disponible esta semana',
    runCrew: 'Ejecutar crew matching',
    crewResults: 'Mejores coincidencias',
    noCrewResults: 'Todavía no hay coincidencias. Amplía los filtros o crea una publicación de Se necesita cuadrilla.',
    whyMatched: 'Por qué coincidió',
    matchScore: 'Puntuación',
    openWorker: 'Abrir perfil',
    createNeedCrew: 'Crear publicación de cuadrilla',
    role: 'Rol',
    trade: 'Oficio',
    zip: 'ZIP',
    availability: 'Disponibilidad',
    crewSize: 'Tamaño de cuadrilla',
    travelRadius: 'Radio de viaje',
    profileStrength: 'Fuerza del perfil',
    noBio: 'Todavía no agregó biografía.',
    storefront: 'Tienda física',
    loading: 'Cargando herramientas AI…',
    loadError: 'No se pudieron cargar los datos de Surplox.',
    exactZip: 'Coincidencia exacta de ZIP',
    nearbyZip: 'Coincidencia local por patrón de ZIP',
    materialMatch: 'Coincidencia de material',
    storefrontBoost: 'Proveedor listo para tienda',
    deliveryCoverage: 'Encaje por cobertura de entrega',
    tradeMatch: 'Coincidencia de oficio',
    availabilityMatch: 'Encaje por disponibilidad',
    crewSizeMatch: 'Encaje por tamaño de cuadrilla',
    profileComplete: 'Perfil más fuerte',
    radiusFit: 'Encaje por radio de viaje',
    supplierReady: 'Proveedor seleccionado',
    laneMatch: 'Encaje por línea de entrega',
    payloadFit: 'Encaje por carga',
    trailerFit: 'Encaje por remolque',
    vehicleFit: 'Encaje por vehículo',
    supplierZipFit: 'Encaje por ZIP de recolección',
    deliveryTitle: 'Coordina el mejor soporte de entrega desde proveedor hasta obra.',
    deliveryBody:
      'Empieza con un proveedor o ZIP de recolección y luego clasifica conductores cercanos de Surplox por línea, vehículo, remolque, carga, radio de entrega y encaje local.',
    chooseSupplier: 'Punto de recolección del proveedor',
    allSuppliers: 'Todos los proveedores',
    supplierOptional: 'Opcional: elige una tienda proveedora',
    pickupZipLabel: 'ZIP de recolección',
    pickupZipPlaceholder: '76102',
    jobsiteZipLabel: 'ZIP de la obra',
    jobsiteZipPlaceholder: '76028',
    deliveryLaneLabel: 'Línea de entrega',
    allDeliveryLanes: 'Todas las líneas de entrega',
    vehicleLabel: 'Tipo de vehículo',
    allVehicles: 'Todos los vehículos',
    trailerLabel: 'Tipo de remolque',
    allTrailers: 'Todos los remolques',
    minPayloadLabel: 'Carga mínima (lbs)',
    minTrailerLengthLabel: 'Largo mínimo del remolque (ft)',
    minDeliveryRadiusLabel: 'Radio mínimo de entrega (mi)',
    runDelivery: 'Ejecutar coordinación de entrega',
    deliveryResults: 'Mejores coincidencias de entrega',
    noDeliveryResults:
      'Todavía no hay coincidencias de entrega. Amplía los filtros de línea, remolque, carga o ZIP mientras más conductores se unen a Surplox.',
    openDriver: 'Abrir perfil del conductor',
    createDeliveryPost: 'Crear publicación de entrega',
    supportLane: 'Línea de entrega',
    vehicleType: 'Vehículo',
    trailerType: 'Remolque',
    payloadCapacity: 'Capacidad de carga',
    deliveryRadiusLabel: 'Radio de entrega',
    trailerLength: 'Largo del remolque',
    serviceTags: 'Etiquetas de servicio',
    noServiceTags: 'Todavía no hay etiquetas de servicio.',
    city: 'Ciudad',
    noCity: 'Sin ciudad',
    pounds: 'lbs',
    feet: 'ft',
    pickupSummary: 'Recolección / Proveedor',
    jobsiteSummary: 'Obra',
    quickNote:
      'Esta primera versión clasifica registros existentes de Surplox. Las siguientes pueden agregar enriquecimiento externo de proveedores, análisis de proyectos y coordinación logística más inteligente.'
  }
}

const DEFAULT_MATERIALS = [
  'Concrete',
  'Lumber',
  'Steel',
  'Electrical',
  'Plumbing',
  'Drywall',
  'Fasteners',
  'Tools',
  'Equipment Rental',
  'Safety Equipment'
]

const VEHICLE_LABELS = {
  pickup_truck: { en: 'Pickup Truck', es: 'Pickup' },
  cargo_van: { en: 'Cargo Van', es: 'Cargo van' },
  box_truck: { en: 'Box Truck', es: 'Camión caja' },
  flatbed_truck: { en: 'Flatbed Truck', es: 'Camión plataforma' }
}

const TRAILER_LABELS = {
  none: { en: 'No Trailer', es: 'Sin remolque' },
  no_trailer: { en: 'No Trailer', es: 'Sin remolque' },
  utility_trailer: { en: 'Utility Trailer', es: 'Remolque utilitario' },
  flatbed_trailer: { en: 'Flatbed Trailer', es: 'Remolque plataforma' },
  gooseneck_trailer: { en: 'Gooseneck Trailer', es: 'Remolque gooseneck' },
  equipment_trailer: { en: 'Equipment Trailer', es: 'Remolque para equipo' },
  enclosed_trailer: { en: 'Enclosed Trailer', es: 'Remolque cerrado' }
}

const SUPPORT_TYPE_LABELS = {
  material_delivery: { en: 'Material Delivery / Hot Shot', es: 'Entrega de materiales / Hot Shot' },
  cargo_van_delivery: { en: 'Cargo Van / Local Delivery', es: 'Cargo Van / Entrega local' }
}

const SERVICE_TAG_LABELS = {
  material_delivery: { en: 'Material Delivery', es: 'Entrega de materiales' },
  hot_shot: { en: 'Hot Shot', es: 'Hot Shot' },
  last_mile_delivery: { en: 'Last Mile Delivery', es: 'Última milla' },
  local_runs: { en: 'Local Runs', es: 'Viajes locales' },
  same_day_delivery: { en: 'Same Day Delivery', es: 'Entrega el mismo día' },
  long_distance: { en: 'Long Distance', es: 'Larga distancia' },
  cargo_van: { en: 'Cargo Van', es: 'Cargo van' },
  pickup_truck: { en: 'Pickup Truck', es: 'Pickup' }
}

function normalizeText(value) {
  return String(value || '').trim()
}

function normalizeMaterials(list) {
  if (!Array.isArray(list)) return []
  return list.map((item) => String(item || '').trim()).filter(Boolean)
}

function normalizeList(list) {
  if (!Array.isArray(list)) return []
  return list.map((item) => String(item || '').trim()).filter(Boolean)
}

function numericValue(value) {
  const num = Number(value)
  return Number.isFinite(num) ? num : 0
}

function prettyRole(role, lang = 'en') {
  const labels = {
    laborer: { en: 'Laborer', es: 'Trabajador' },
    subcontractor: { en: 'Subcontractor', es: 'Subcontratista' },
    contractor: { en: 'Contractor', es: 'Contratista' },
    supplier: { en: 'Supplier', es: 'Proveedor' },
    driver: { en: 'Driver', es: 'Conductor' },
    mechanic: { en: 'Mechanic', es: 'Mecánico' }
  }
  return labels[role]?.[lang] || labels[role]?.en || role || '—'
}

function availabilityLabel(value, lang = 'en') {
  const labels = {
    available_now: { en: 'Available Now', es: 'Disponible ahora' },
    available_this_week: { en: 'Available This Week', es: 'Disponible esta semana' },
    busy: { en: 'Busy', es: 'Ocupado' }
  }
  return labels[value]?.[lang] || labels[value]?.en || value || '—'
}

function labelForMap(map, value, lang = 'en') {
  const key = normalizeText(value)
  if (!key) return ''
  return map[key]?.[lang] || map[key]?.en || key.replace(/_/g, ' ')
}

function startsWithZipRegion(a, b) {
  const left = normalizeText(a)
  const right = normalizeText(b)
  if (!left || !right) return false
  return left.slice(0, 3) === right.slice(0, 3)
}

function detectSupportType(serviceTags = [], vehicleType = '') {
  if (
    serviceTags.includes('local_runs') ||
    serviceTags.includes('last_mile_delivery') ||
    vehicleType === 'cargo_van'
  ) {
    return 'cargo_van_delivery'
  }
  return 'material_delivery'
}

function profileStrength(worker) {
  let score = 0
  if (normalizeText(worker.display_name)) score += 1
  if (normalizeText(worker.first_name) && normalizeText(worker.last_name)) score += 1
  if (normalizeText(worker.home_zip)) score += 1
  if (normalizeText(worker.city)) score += 1
  if (normalizeText(worker.phone)) score += 1
  if (normalizeText(worker.bio)) score += 1
  if (worker.trade_id || normalizeText(worker.trade_name)) score += 1
  if (numericValue(worker.crew_size) > 1) score += 1
  if (normalizeText(worker.availability_status)) score += 1
  return score
}

function supplierReasons(supplier, { query, material, jobZip, copy }) {
  const reasons = []
  const materials = normalizeMaterials(supplier.materials_categories).map((item) => item.toLowerCase())
  const q = normalizeText(query).toLowerCase()
  const businessZip = normalizeText(supplier.business_zip)

  if (material && materials.includes(material.toLowerCase())) reasons.push(copy.materialMatch)
  if (jobZip && businessZip === jobZip) reasons.push(copy.exactZip)
  else if (jobZip && startsWithZipRegion(businessZip, jobZip)) reasons.push(copy.nearbyZip)
  if (supplier.storefront) reasons.push(copy.storefrontBoost)
  if (numericValue(supplier.delivery_radius) > 0) reasons.push(copy.deliveryCoverage)
  if (q) {
    const haystack = [
      supplier.business_name,
      supplier.display_name,
      supplier.bio,
      ...normalizeMaterials(supplier.materials_categories)
    ]
      .join(' ')
      .toLowerCase()
    if (haystack.includes(q)) reasons.push(copy.materialMatch)
  }

  return Array.from(new Set(reasons)).slice(0, 4)
}

function scoreSupplier(supplier, { query, material, jobZip, storefrontOnly }) {
  let score = 0
  const materials = normalizeMaterials(supplier.materials_categories)
  const q = normalizeText(query).toLowerCase()
  const businessZip = normalizeText(supplier.business_zip)

  const haystack = [
    supplier.business_name,
    supplier.display_name,
    supplier.bio,
    businessZip,
    ...materials
  ]
    .join(' ')
    .toLowerCase()

  if (q) {
    q.split(/\s+/).filter(Boolean).forEach((term) => {
      if (haystack.includes(term)) score += 8
      if (materials.some((item) => item.toLowerCase().includes(term))) score += 10
      if (String(supplier.business_name || '').toLowerCase().includes(term)) score += 9
    })
  }

  if (material && materials.some((item) => item.toLowerCase() === material.toLowerCase())) score += 24
  if (jobZip && businessZip === jobZip) score += 18
  else if (jobZip && startsWithZipRegion(businessZip, jobZip)) score += 9
  if (supplier.storefront) score += storefrontOnly ? 12 : 6
  score += Math.min(numericValue(supplier.delivery_radius), 150) / 6

  return score
}

function crewReasons(worker, { selectedTradeId, jobZip, minCrewSize, availability, copy }) {
  const reasons = []
  if (selectedTradeId && String(worker.trade_id || '') === String(selectedTradeId)) reasons.push(copy.tradeMatch)
  if (jobZip && normalizeText(worker.home_zip) === normalizeText(jobZip)) reasons.push(copy.exactZip)
  else if (jobZip && startsWithZipRegion(worker.home_zip, jobZip)) reasons.push(copy.nearbyZip)
  if (availability && normalizeText(worker.availability_status) === availability) reasons.push(copy.availabilityMatch)
  if (numericValue(minCrewSize) > 0 && numericValue(worker.crew_size) >= numericValue(minCrewSize)) {
    reasons.push(copy.crewSizeMatch)
  }
  if (profileStrength(worker) >= 6) reasons.push(copy.profileComplete)
  if (numericValue(worker.travel_radius_miles) > 0) reasons.push(copy.radiusFit)
  return Array.from(new Set(reasons)).slice(0, 4)
}

function scoreWorker(worker, { selectedTradeId, jobZip, radius, minCrewSize, availability }) {
  let score = 0

  if (selectedTradeId && String(worker.trade_id || '') === String(selectedTradeId)) score += 28
  if (jobZip && normalizeText(worker.home_zip) === normalizeText(jobZip)) score += 20
  else if (jobZip && startsWithZipRegion(worker.home_zip, jobZip)) score += 10

  const workerAvailability = normalizeText(worker.availability_status)
  if (availability && workerAvailability === availability) score += 16
  else if (!availability && workerAvailability === 'available_now') score += 8
  else if (!availability && workerAvailability === 'available_this_week') score += 5

  if (numericValue(minCrewSize) > 0) {
    if (numericValue(worker.crew_size) >= numericValue(minCrewSize)) score += 14
  } else {
    score += Math.min(numericValue(worker.crew_size), 10)
  }

  if (numericValue(radius) > 0 && numericValue(worker.travel_radius_miles) >= numericValue(radius)) {
    score += 10
  } else {
    score += Math.min(numericValue(worker.travel_radius_miles), 150) / 10
  }

  score += profileStrength(worker) * 2
  if (normalizeText(worker.bio)) score += 4

  return score
}

function deliveryReasons(driver, { supplier, pickupZip, jobsiteZip, supportType, vehicleType, trailerType, minPayload, minTrailerLength, minDeliveryRadius, copy }) {
  const reasons = []
  const driverHomeZip = normalizeText(driver.home_zip)
  const supplierZip = normalizeText(supplier?.business_zip) || normalizeText(pickupZip)
  const driverSupportType = normalizeText(driver.support_type)
  const driverVehicle = normalizeText(driver.vehicle_type)
  const driverTrailer = normalizeText(driver.trailer_type)

  if (supplier?.user_id) reasons.push(copy.supplierReady)
  if (supplierZip && driverHomeZip === supplierZip) reasons.push(copy.supplierZipFit)
  else if (supplierZip && startsWithZipRegion(driverHomeZip, supplierZip)) reasons.push(copy.nearbyZip)
  if (jobsiteZip && driverHomeZip === normalizeText(jobsiteZip)) reasons.push(copy.exactZip)
  else if (jobsiteZip && startsWithZipRegion(driverHomeZip, jobsiteZip)) reasons.push(copy.nearbyZip)
  if (supportType && driverSupportType === supportType) reasons.push(copy.laneMatch)
  if (vehicleType && driverVehicle === vehicleType) reasons.push(copy.vehicleFit)
  if (trailerType && driverTrailer === trailerType) reasons.push(copy.trailerFit)
  if (numericValue(minPayload) > 0 && numericValue(driver.payload_capacity) >= numericValue(minPayload)) reasons.push(copy.payloadFit)
  if (numericValue(minTrailerLength) > 0 && numericValue(driver.trailer_length) >= numericValue(minTrailerLength)) reasons.push(copy.trailerFit)
  if (numericValue(minDeliveryRadius) > 0 && numericValue(driver.delivery_radius) >= numericValue(minDeliveryRadius)) reasons.push(copy.deliveryCoverage)

  return Array.from(new Set(reasons)).slice(0, 5)
}

function scoreDriver(driver, { supplier, pickupZip, jobsiteZip, supportType, vehicleType, trailerType, minPayload, minTrailerLength, minDeliveryRadius }) {
  let score = 0
  const supplierZip = normalizeText(supplier?.business_zip) || normalizeText(pickupZip)
  const driverHomeZip = normalizeText(driver.home_zip)
  const driverBusinessZip = normalizeText(driver.business_zip)
  const deliveryZipMatch = [driverHomeZip, driverBusinessZip].filter(Boolean)

  if (supplierZip) {
    if (deliveryZipMatch.includes(supplierZip)) score += 20
    else if (deliveryZipMatch.some((zip) => startsWithZipRegion(zip, supplierZip))) score += 10
  }

  if (jobsiteZip) {
    if (deliveryZipMatch.includes(normalizeText(jobsiteZip))) score += 14
    else if (deliveryZipMatch.some((zip) => startsWithZipRegion(zip, jobsiteZip))) score += 8
  }

  if (supportType && normalizeText(driver.support_type) === supportType) score += 22
  if (vehicleType && normalizeText(driver.vehicle_type) === vehicleType) score += 18
  if (trailerType && normalizeText(driver.trailer_type) === trailerType) score += 16
  if (numericValue(minPayload) > 0 && numericValue(driver.payload_capacity) >= numericValue(minPayload)) score += 18
  if (numericValue(minTrailerLength) > 0 && numericValue(driver.trailer_length) >= numericValue(minTrailerLength)) score += 12
  if (numericValue(minDeliveryRadius) > 0 && numericValue(driver.delivery_radius) >= numericValue(minDeliveryRadius)) score += 12

  score += Math.min(numericValue(driver.delivery_radius), 200) / 8
  score += Math.min(numericValue(driver.payload_capacity), 24000) / 1800
  if (!['', 'none', 'no_trailer'].includes(normalizeText(driver.trailer_type))) score += 4
  if (normalizeText(driver.bio)) score += 3

  return score
}

function InfoCard({ label, value }) {
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
      <div style={{ marginTop: 8, fontSize: 18, fontWeight: 900, lineHeight: 1.25 }}>{value}</div>
    </div>
  )
}


const PROJECT_SCOPE_LIBRARY = [
  {
    key: 'sitework_excavation',
    keywords: ['sitework', 'excavation', 'grading', 'earthwork', 'civil', 'utility trench', 'storm drain', 'paving'],
    tradeHint: 'Sitework & Excavation',
    supplierCategories: ['Concrete', 'Tools'],
    crew: { base: 4, medium: 6, large: 10 },
    delivery: 'Plan dirt-moving support, aggregate staging, and concrete or utility material drops early.'
  },
  {
    key: 'concrete',
    keywords: ['concrete', 'slab', 'footing', 'foundation', 'rebar', 'formwork'],
    tradeHint: 'Concrete & Flatwork',
    supplierCategories: ['Concrete', 'Tools', 'Fasteners'],
    crew: { base: 5, medium: 8, large: 12 },
    delivery: 'Coordinate concrete pours, rebar drops, form material staging, and same-day tool runs.'
  },
  {
    key: 'steel',
    keywords: ['steel', 'structural steel', 'joist', 'decking', 'metal building'],
    tradeHint: 'Welding & Fabrication',
    supplierCategories: ['Steel', 'Tools'],
    crew: { base: 4, medium: 6, large: 10 },
    delivery: 'Use heavier hauling capacity, trailer coordination, and scheduled steel deliveries.'
  },
  {
    key: 'framing',
    keywords: ['framing', 'carpentry', 'wood framing', 'metal stud', 'blocking'],
    tradeHint: 'Framing & Carpentry',
    supplierCategories: ['Lumber', 'Fasteners', 'Tools'],
    crew: { base: 4, medium: 6, large: 10 },
    delivery: 'Bundle framing material runs with fasteners and same-day pickup flexibility.'
  },
  {
    key: 'roofing',
    keywords: ['roof', 'roofing', 'tpo', 'shingle', 'flashing', 'waterproofing'],
    tradeHint: 'Roofing',
    supplierCategories: ['Tools', 'Safety Equipment'],
    crew: { base: 3, medium: 5, large: 8 },
    delivery: 'Sequence roof material drops carefully with weather windows and lift access.'
  },
  {
    key: 'hvac',
    keywords: ['hvac', 'duct', 'rtu', 'air handler', 'mechanical'],
    tradeHint: 'HVAC',
    supplierCategories: ['Tools', 'Safety Equipment'],
    crew: { base: 3, medium: 5, large: 8 },
    delivery: 'Plan equipment delivery windows for rooftop units, duct, and mechanical accessories.'
  },
  {
    key: 'plumbing',
    keywords: ['plumbing', 'pipe', 'domestic water', 'sanitary', 'waste', 'fixture'],
    tradeHint: 'Plumbing',
    supplierCategories: ['Plumbing', 'Tools'],
    crew: { base: 3, medium: 5, large: 8 },
    delivery: 'Keep local pipe, fittings, and fixture supply close for quick replenishment.'
  },
  {
    key: 'electrical',
    keywords: ['electrical', 'panel', 'conduit', 'wire', 'switchgear', 'lighting'],
    tradeHint: 'Electrical',
    supplierCategories: ['Electrical', 'Tools'],
    crew: { base: 3, medium: 5, large: 8 },
    delivery: 'Use local supply access for conduit, wire, gear, and same-day pickup support.'
  },
  {
    key: 'drywall',
    keywords: ['drywall', 'sheetrock', 'tape and bed', 'texture'],
    tradeHint: 'Drywall',
    supplierCategories: ['Drywall', 'Tools'],
    crew: { base: 4, medium: 6, large: 10 },
    delivery: 'Coordinate drywall drops floor-by-floor and keep damage replacement options nearby.'
  },
  {
    key: 'paint',
    keywords: ['paint', 'painting', 'coating'],
    tradeHint: 'Painting',
    supplierCategories: ['Tools', 'Safety Equipment'],
    crew: { base: 2, medium: 4, large: 6 },
    delivery: 'Plan smaller recurring paint and finish material runs rather than one large drop.'
  },
  {
    key: 'masonry',
    keywords: ['masonry', 'cmu', 'brick', 'block', 'stone'],
    tradeHint: 'Masonry',
    supplierCategories: ['Concrete', 'Tools'],
    crew: { base: 4, medium: 6, large: 10 },
    delivery: 'Coordinate pallets, mortar, block, and crane or forklift-compatible staging.'
  },
  {
    key: 'fencing',
    keywords: ['fence', 'fencing', 'gate'],
    tradeHint: 'Fencing & Gates',
    supplierCategories: ['Steel', 'Tools'],
    crew: { base: 2, medium: 4, large: 6 },
    delivery: 'Use trailer-capable delivery for panels, posts, and gate hardware.'
  }
]

function chooseCrewBand(size, libraryCrew) {
  if (size === 'large') return libraryCrew.large
  if (size === 'medium') return libraryCrew.medium
  return libraryCrew.base
}

function analyzeProjectScope({ projectText, projectType, projectSize, floors, urgency, trades }) {
  const text = normalizeText(projectText).toLowerCase()
  const matched = PROJECT_SCOPE_LIBRARY.filter((item) => item.keywords.some((keyword) => text.includes(keyword)))
  const uniqueTradeNames = []
  const supplierCategories = new Set()
  const deliveryNotes = []

  matched.forEach((item) => {
    if (!uniqueTradeNames.includes(item.tradeHint)) uniqueTradeNames.push(item.tradeHint)
    item.supplierCategories.forEach((cat) => supplierCategories.add(cat))
    deliveryNotes.push(item.delivery)
  })

  if (!matched.length) {
    uniqueTradeNames.push('General Construction')
    supplierCategories.add('Tools')
    supplierCategories.add('Safety Equipment')
    deliveryNotes.push('Stage basic tools, safety items, and flexible local delivery capacity while scope details become clearer.')
  }

  const tradeMap = new Map((trades || []).map((trade) => [String(trade.name || '').toLowerCase(), trade]))
  const tradeSummaries = uniqueTradeNames.map((tradeName) => {
    const libraryItem = matched.find((item) => item.tradeHint === tradeName)
    const baseSize = libraryItem ? chooseCrewBand(projectSize, libraryItem.crew) : (projectSize === 'large' ? 8 : projectSize === 'medium' ? 5 : 3)
    const adjustedSize = baseSize + Math.max(0, numericValue(floors) - 1)
    return {
      name: tradeName,
      tradeId: tradeMap.get(tradeName.toLowerCase())?.id || '',
      suggestedCrew: adjustedSize
    }
  })

  const typeLabelMap = {
    general: 'general construction',
    ground_up: 'ground-up',
    tenant_finish: 'tenant finish / remodel',
    sitework: 'sitework / civil',
    industrial: 'industrial / warehouse',
    residential: 'residential'
  }

  const urgencyLabelMap = {
    normal: 'normal schedule',
    fast_track: 'fast-track',
    emergency: 'emergency'
  }

  const summary = text
    ? `This looks like a ${typeLabelMap[projectType] || 'general construction'} project with ${tradeSummaries.length} main scope lanes, ${numericValue(floors) || 1} level(s), and a ${urgencyLabelMap[urgency] || 'normal schedule'} pace. ${matched.length ? 'The pasted scope clearly points to phased labor, supplier coordination, and delivery planning.' : 'The pasted scope is still broad, so this version is making a conservative first-pass recommendation.'}`
    : ''

  const assumptions = [
    'This v1 reads pasted scope text, not actual plan sheets or symbols yet.',
    'Crew sizing is a first-pass estimate and should be adjusted by square footage, phasing, schedule, and specialty complexity.',
    'Supplier categories are suggested from scope keywords and should later be tied to live external supplier enrichment.',
    'Delivery notes assume local Surplox drivers and hauling support are being used for staged material movement.'
  ]

  return {
    summary,
    tradeSummaries,
    supplierCategories: Array.from(supplierCategories),
    deliveryNotes: Array.from(new Set(deliveryNotes)).slice(0, 6),
    assumptions
  }
}

export default function SupplierAiTools({ lang = 'en' }) {
  const copy = COPY[lang] || COPY.en
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('supplier')
  const [trades, setTrades] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [workers, setWorkers] = useState([])
  const [drivers, setDrivers] = useState([])

  const [projectText, setProjectText] = useState('')
  const [projectType, setProjectType] = useState('general')
  const [projectSize, setProjectSize] = useState('medium')
  const [projectFloors, setProjectFloors] = useState(1)
  const [projectUrgency, setProjectUrgency] = useState('normal')
  const [ranProject, setRanProject] = useState(false)

  const [supplierQuery, setSupplierQuery] = useState('')
  const [supplierMaterial, setSupplierMaterial] = useState('')
  const [supplierZip, setSupplierZip] = useState('')
  const [storefrontOnly, setStorefrontOnly] = useState(false)
  const [ranSupplier, setRanSupplier] = useState(false)

  const [crewTradeId, setCrewTradeId] = useState('')
  const [crewZip, setCrewZip] = useState('')
  const [crewRadius, setCrewRadius] = useState(50)
  const [crewMinSize, setCrewMinSize] = useState(1)
  const [crewAvailability, setCrewAvailability] = useState('')
  const [ranCrew, setRanCrew] = useState(false)

  const [deliverySupplierId, setDeliverySupplierId] = useState('')
  const [pickupZip, setPickupZip] = useState('')
  const [deliveryJobsiteZip, setDeliveryJobsiteZip] = useState('')
  const [deliverySupportType, setDeliverySupportType] = useState('')
  const [deliveryVehicleType, setDeliveryVehicleType] = useState('')
  const [deliveryTrailerType, setDeliveryTrailerType] = useState('')
  const [deliveryMinPayload, setDeliveryMinPayload] = useState('')
  const [deliveryMinTrailerLength, setDeliveryMinTrailerLength] = useState('')
  const [deliveryMinRadius, setDeliveryMinRadius] = useState('')
  const [ranDelivery, setRanDelivery] = useState(false)

  useEffect(() => {
    let active = true

    async function loadData() {
      setLoading(true)
      setError('')

      try {
        const [
          { data: tradesData, error: tradesError },
          { data: supplierData, error: supplierError },
          { data: workerData, error: workerError },
          { data: driverData, error: driverError },
          { data: contactsData, error: contactsError }
        ] = await Promise.all([
          supabase.from('trades').select('id,name').order('name'),
          supabase
            .from('profiles')
            .select('user_id, display_name, business_name, business_address, business_zip, materials_categories, storefront, delivery_radius, bio, role')
            .eq('role', 'supplier')
            .order('business_name', { ascending: true }),
          supabase
            .from('profiles')
            .select('user_id, display_name, first_name, last_name, role, trade_id, home_zip, travel_radius_miles, crew_size, bio, availability_status, category_group, trades(name)')
            .in('role', ['laborer', 'subcontractor', 'contractor'])
            .order('display_name', { ascending: true }),
          supabase
            .from('profiles')
            .select('user_id, display_name, first_name, last_name, home_zip, bio, role, category_group, service_tags, vehicle_type, trailer_type, trailer_length, payload_capacity, delivery_radius, business_zip')
            .eq('role', 'driver')
            .order('display_name', { ascending: true }),
          supabase.from('contact_private').select('user_id, city, phone')
        ])

        if (tradesError) throw tradesError
        if (supplierError) throw supplierError
        if (workerError) throw workerError
        if (driverError) throw driverError
        if (contactsError) throw contactsError
        if (!active) return

        const contactMap = new Map((contactsData || []).map((row) => [row.user_id, row]))

        const normalizedSuppliers = (supplierData || []).map((item) => ({
          ...item,
          materials_categories: normalizeMaterials(item.materials_categories)
        }))

        setTrades(tradesData || [])
        setSuppliers(normalizedSuppliers)
        setWorkers(
          (workerData || []).map((item) => {
            const contact = contactMap.get(item.user_id) || {}
            return {
              ...item,
              trade_name: item.trades?.name || '',
              city: normalizeText(contact.city),
              phone: normalizeText(contact.phone)
            }
          })
        )
        setDrivers(
          (driverData || []).map((item) => {
            const contact = contactMap.get(item.user_id) || {}
            const serviceTags = normalizeList(item.service_tags)
            return {
              ...item,
              city: normalizeText(contact.city),
              phone: normalizeText(contact.phone),
              service_tags: serviceTags,
              support_type: detectSupportType(serviceTags, normalizeText(item.vehicle_type))
            }
          })
        )
      } catch (err) {
        console.error(err)
        if (!active) return
        setError(copy.loadError)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadData()
    return () => {
      active = false
    }
  }, [copy.loadError])

  const materialOptions = useMemo(() => {
    const set = new Set(DEFAULT_MATERIALS)
    suppliers.forEach((supplier) => {
      normalizeMaterials(supplier.materials_categories).forEach((item) => set.add(item))
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [suppliers])


  const projectAnalysis = useMemo(() => {
    return analyzeProjectScope({
      projectText,
      projectType,
      projectSize,
      floors: projectFloors,
      urgency: projectUrgency,
      trades
    })
  }, [projectText, projectType, projectSize, projectFloors, projectUrgency, trades])

  const selectedSupplier = useMemo(() => {
    return suppliers.find((supplier) => String(supplier.user_id) === String(deliverySupplierId)) || null
  }, [suppliers, deliverySupplierId])

  useEffect(() => {
    if (!selectedSupplier) return
    const nextPickupZip = normalizeText(selectedSupplier.business_zip)
    if (nextPickupZip) {
      setPickupZip(nextPickupZip)
    }
  }, [selectedSupplier])

  const supplierResults = useMemo(() => {
    let next = [...suppliers]
    if (supplierMaterial) {
      next = next.filter((supplier) =>
        normalizeMaterials(supplier.materials_categories).some(
          (item) => item.toLowerCase() === supplierMaterial.toLowerCase()
        )
      )
    }
    if (storefrontOnly) {
      next = next.filter((supplier) => supplier.storefront)
    }
    if (normalizeText(supplierZip)) {
      next = next.filter((supplier) => {
        const businessZip = normalizeText(supplier.business_zip)
        return businessZip === normalizeText(supplierZip) || startsWithZipRegion(businessZip, supplierZip)
      })
    }
    if (normalizeText(supplierQuery)) {
      const q = normalizeText(supplierQuery).toLowerCase()
      next = next.filter((supplier) => {
        const haystack = [
          supplier.business_name,
          supplier.display_name,
          supplier.business_zip,
          supplier.bio,
          ...normalizeMaterials(supplier.materials_categories)
        ]
          .join(' ')
          .toLowerCase()
        return haystack.includes(q)
      })
    }

    return next
      .map((supplier) => ({
        ...supplier,
        ai_score: scoreSupplier(supplier, {
          query: supplierQuery,
          material: supplierMaterial,
          jobZip: supplierZip,
          storefrontOnly
        }),
        reasons: supplierReasons(supplier, {
          query: supplierQuery,
          material: supplierMaterial,
          jobZip: supplierZip,
          copy
        })
      }))
      .sort((a, b) => b.ai_score - a.ai_score)
      .slice(0, 12)
  }, [suppliers, supplierMaterial, storefrontOnly, supplierZip, supplierQuery, copy])

  const crewResults = useMemo(() => {
    let next = [...workers]

    if (crewTradeId) {
      next = next.filter((worker) => String(worker.trade_id || '') === String(crewTradeId))
    }
    if (normalizeText(crewZip)) {
      next = next.filter((worker) => {
        const homeZip = normalizeText(worker.home_zip)
        return homeZip === normalizeText(crewZip) || startsWithZipRegion(homeZip, crewZip)
      })
    }
    if (crewAvailability) {
      next = next.filter((worker) => normalizeText(worker.availability_status) === crewAvailability)
    }
    if (numericValue(crewMinSize) > 0) {
      next = next.filter((worker) => numericValue(worker.crew_size) >= numericValue(crewMinSize))
    }

    return next
      .map((worker) => ({
        ...worker,
        match_score: scoreWorker(worker, {
          selectedTradeId: crewTradeId,
          jobZip: crewZip,
          radius: crewRadius,
          minCrewSize: crewMinSize,
          availability: crewAvailability
        }),
        strength: profileStrength(worker),
        reasons: crewReasons(worker, {
          selectedTradeId: crewTradeId,
          jobZip: crewZip,
          minCrewSize: crewMinSize,
          availability: crewAvailability,
          copy
        })
      }))
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, 12)
  }, [workers, crewTradeId, crewZip, crewAvailability, crewMinSize, crewRadius, copy])

  const deliveryResults = useMemo(() => {
    let next = [...drivers]
    const normalizedPickupZip = normalizeText(pickupZip) || normalizeText(selectedSupplier?.business_zip)
    const normalizedJobsiteZip = normalizeText(deliveryJobsiteZip)
    const minPayload = numericValue(deliveryMinPayload)
    const minTrailerLength = numericValue(deliveryMinTrailerLength)
    const minDeliveryRadius = numericValue(deliveryMinRadius)

    if (deliverySupportType) {
      next = next.filter((driver) => normalizeText(driver.support_type) === deliverySupportType)
    }
    if (deliveryVehicleType) {
      next = next.filter((driver) => normalizeText(driver.vehicle_type) === deliveryVehicleType)
    }
    if (deliveryTrailerType) {
      next = next.filter((driver) => normalizeText(driver.trailer_type) === deliveryTrailerType)
    }
    if (minPayload > 0) {
      next = next.filter((driver) => numericValue(driver.payload_capacity) >= minPayload)
    }
    if (minTrailerLength > 0) {
      next = next.filter((driver) => numericValue(driver.trailer_length) >= minTrailerLength)
    }
    if (minDeliveryRadius > 0) {
      next = next.filter((driver) => numericValue(driver.delivery_radius) >= minDeliveryRadius)
    }
    if (normalizedPickupZip) {
      next = next.filter((driver) => {
        const homeZip = normalizeText(driver.home_zip)
        const businessZip = normalizeText(driver.business_zip)
        return (
          homeZip === normalizedPickupZip ||
          businessZip === normalizedPickupZip ||
          startsWithZipRegion(homeZip, normalizedPickupZip) ||
          startsWithZipRegion(businessZip, normalizedPickupZip)
        )
      })
    }

    return next
      .map((driver) => ({
        ...driver,
        delivery_score: scoreDriver(driver, {
          supplier: selectedSupplier,
          pickupZip: normalizedPickupZip,
          jobsiteZip: normalizedJobsiteZip,
          supportType: deliverySupportType,
          vehicleType: deliveryVehicleType,
          trailerType: deliveryTrailerType,
          minPayload,
          minTrailerLength,
          minDeliveryRadius
        }),
        reasons: deliveryReasons(driver, {
          supplier: selectedSupplier,
          pickupZip: normalizedPickupZip,
          jobsiteZip: normalizedJobsiteZip,
          supportType: deliverySupportType,
          vehicleType: deliveryVehicleType,
          trailerType: deliveryTrailerType,
          minPayload,
          minTrailerLength,
          minDeliveryRadius,
          copy
        })
      }))
      .sort((a, b) => b.delivery_score - a.delivery_score)
      .slice(0, 12)
  }, [
    drivers,
    selectedSupplier,
    pickupZip,
    deliveryJobsiteZip,
    deliverySupportType,
    deliveryVehicleType,
    deliveryTrailerType,
    deliveryMinPayload,
    deliveryMinTrailerLength,
    deliveryMinRadius,
    copy
  ])

  const driverVehicleOptions = useMemo(() => {
    const set = new Set(Object.keys(VEHICLE_LABELS))
    drivers.forEach((driver) => {
      const value = normalizeText(driver.vehicle_type)
      if (value) set.add(value)
    })
    return Array.from(set)
  }, [drivers])

  const driverTrailerOptions = useMemo(() => {
    const set = new Set(Object.keys(TRAILER_LABELS))
    drivers.forEach((driver) => {
      const value = normalizeText(driver.trailer_type)
      if (value) set.add(value)
    })
    return Array.from(set)
  }, [drivers])

  const driverLaneOptions = useMemo(() => {
    const set = new Set(Object.keys(SUPPORT_TYPE_LABELS))
    drivers.forEach((driver) => {
      const value = normalizeText(driver.support_type)
      if (value) set.add(value)
    })
    return Array.from(set)
  }, [drivers])

  if (loading) {
    return <div className="card">{copy.loading}</div>
  }

  if (error) {
    return <div className="card">{error}</div>
  }

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div
        className="card rounded-xl"
        style={{
          padding: 28,
          background: 'linear-gradient(180deg, #f2ecff 0%, #f7f7f2 100%)'
        }}
      >
        <div className="badge" style={{ marginBottom: 14, background: '#e8defa', color: '#4d2f82' }}>
          {copy.badge}
        </div>

        <div className="h1" style={{ maxWidth: 860 }}>{copy.title}</div>

        <p className="muted" style={{ marginTop: 12, maxWidth: 920, fontSize: 17, lineHeight: 1.7 }}>
          {copy.body}
        </p>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
          <button
            type="button"
            className={tab === 'supplier' ? 'btn primary' : 'btn'}
            onClick={() => setTab('supplier')}
          >
            {copy.supplierTab}
          </button>
          <button
            type="button"
            className={tab === 'crew' ? 'btn primary' : 'btn'}
            onClick={() => setTab('crew')}
          >
            {copy.crewTab}
          </button>
          <button
            type="button"
            className={tab === 'delivery' ? 'btn primary' : 'btn'}
            onClick={() => setTab('delivery')}
          >
            {copy.deliveryTab}
          </button>
          <button
            type="button"
            className={tab === 'project' ? 'btn primary' : 'btn'}
            onClick={() => setTab('project')}
          >
            {copy.projectTab}
          </button>
        </div>
      </div>


      {tab === 'project' ? (
        <>
          <div className="card rounded-xl" style={{ padding: 22 }}>
            <div className="card-section-title">{copy.projectTitle}</div>
            <p className="card-section-subtitle" style={{ marginTop: 8 }}>{copy.projectBody}</p>

            <div className="card-soft" style={{ marginTop: 16, background: '#f8f7ef' }}>
              <div className="card-section-title" style={{ fontSize: 16 }}>{copy.analyzerReady}</div>
              <p className="card-section-subtitle" style={{ marginTop: 8 }}>{copy.analyzerReadyBody}</p>
            </div>

            <div className="grid" style={{ gap: 14, marginTop: 16 }}>
              <div>
                <div className="muted" style={{ marginBottom: 8 }}>{copy.projectPasteLabel}</div>
                <textarea
                  className="input"
                  value={projectText}
                  onChange={(e) => setProjectText(e.target.value)}
                  placeholder={copy.projectPastePlaceholder}
                  style={{ minHeight: 180 }}
                />
              </div>

              <div className="grid two" style={{ gap: 14 }}>
                <div>
                  <div className="muted" style={{ marginBottom: 8 }}>{copy.projectTypeLabel}</div>
                  <select className="input" value={projectType} onChange={(e) => setProjectType(e.target.value)}>
                    <option value="general">{copy.projectTypeGeneral}</option>
                    <option value="ground_up">{copy.projectTypeGroundUp}</option>
                    <option value="tenant_finish">{copy.projectTypeTenant}</option>
                    <option value="sitework">{copy.projectTypeSitework}</option>
                    <option value="industrial">{copy.projectTypeIndustrial}</option>
                    <option value="residential">{copy.projectTypeResidential}</option>
                  </select>
                </div>

                <div>
                  <div className="muted" style={{ marginBottom: 8 }}>{copy.projectSizeLabel}</div>
                  <select className="input" value={projectSize} onChange={(e) => setProjectSize(e.target.value)}>
                    <option value="small">{copy.projectSizeSmall}</option>
                    <option value="medium">{copy.projectSizeMedium}</option>
                    <option value="large">{copy.projectSizeLarge}</option>
                  </select>
                </div>
              </div>

              <div className="grid two" style={{ gap: 14 }}>
                <div>
                  <div className="muted" style={{ marginBottom: 8 }}>{copy.projectFloorsLabel}</div>
                  <input
                    className="input"
                    type="number"
                    min="1"
                    value={projectFloors}
                    onChange={(e) => setProjectFloors(e.target.value)}
                  />
                </div>

                <div>
                  <div className="muted" style={{ marginBottom: 8 }}>{copy.projectUrgencyLabel}</div>
                  <select className="input" value={projectUrgency} onChange={(e) => setProjectUrgency(e.target.value)}>
                    <option value="normal">{copy.projectUrgencyNormal}</option>
                    <option value="fast_track">{copy.projectUrgencyFast}</option>
                    <option value="emergency">{copy.projectUrgencyEmergency}</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <button type="button" className="btn primary" onClick={() => setRanProject(true)}>
                  {copy.runProject}
                </button>
              </div>
            </div>
          </div>

          {ranProject ? (
            normalizeText(projectText) ? (
              <div className="grid" style={{ gap: 16 }}>
                <div className="card rounded-xl" style={{ padding: 22 }}>
                  <div className="card-section-title">{copy.projectSummary}</div>
                  <p style={{ marginTop: 10, lineHeight: 1.7 }}>{projectAnalysis.summary || copy.summaryFallback}</p>
                </div>

                <div className="card rounded-xl" style={{ padding: 22 }}>
                  <div className="card-section-title">{copy.requiredTradesTitle}</div>
                  <div className="grid" style={{ gap: 12, marginTop: 14 }}>
                    {projectAnalysis.tradeSummaries.map((trade) => (
                      <div key={trade.name} className="card-soft" style={{ background: '#ffffff' }}>
                        <div style={{ fontWeight: 900 }}>{trade.name}</div>
                        <div className="muted" style={{ marginTop: 8 }}>
                          {copy.suggestedCrewTitle}: {trade.suggestedCrew}
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                          {trade.tradeId ? (
                            <button
                              type="button"
                              className="btn small"
                              onClick={() => {
                                setCrewTradeId(String(trade.tradeId))
                                setTab('crew')
                                setRanCrew(true)
                              }}
                            >
                              {copy.crewTab}
                            </button>
                          ) : null}
                          <Link className="btn small primary" to="/new?type=need_crew">
                            {copy.createNeedCrew}
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card rounded-xl" style={{ padding: 22 }}>
                  <div className="card-section-title">{copy.supplierPlanTitle}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                    {projectAnalysis.supplierCategories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        className="badge"
                        style={{ border: 'none', cursor: 'pointer' }}
                        onClick={() => {
                          setSupplierMaterial(category)
                          setTab('supplier')
                          setRanSupplier(true)
                        }}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="card rounded-xl" style={{ padding: 22 }}>
                  <div className="card-section-title">{copy.deliveryPlanTitle}</div>
                  <div className="list" style={{ marginTop: 14 }}>
                    {projectAnalysis.deliveryNotes.map((note, index) => (
                      <div key={`${index}-${note}`} className="card-soft" style={{ background: '#ffffff' }}>
                        {note}
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
                    <button
                      type="button"
                      className="btn small"
                      onClick={() => {
                        setTab('delivery')
                        setRanDelivery(true)
                      }}
                    >
                      {copy.deliveryTab}
                    </button>
                    <Link className="btn small primary" to="/new?category=jobsite_support&support=material_delivery">
                      {copy.createDeliveryPost}
                    </Link>
                  </div>
                </div>

                <div className="card rounded-xl" style={{ padding: 22 }}>
                  <div className="card-section-title">{copy.projectAssumptionsTitle}</div>
                  <div className="list" style={{ marginTop: 14 }}>
                    {projectAnalysis.assumptions.map((item, index) => (
                      <div key={`${index}-${item}`} className="card-soft" style={{ background: '#ffffff' }}>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="card rounded-xl" style={{ padding: 22 }}>
                <div className="card-section-subtitle">{copy.noProjectInput}</div>
              </div>
            )
          ) : null}
        </>
      ) : null}

      {tab === 'supplier' ? (
        <>
          <div className="card rounded-xl" style={{ padding: 22 }}>
            <div className="card-section-title">{copy.supplierTitle}</div>
            <p className="card-section-subtitle" style={{ marginTop: 8 }}>{copy.supplierBody}</p>

            <div className="grid" style={{ gap: 14, marginTop: 16 }}>
              <div className="grid two" style={{ gap: 14 }}>
                <div>
                  <div className="muted" style={{ marginBottom: 8 }}>{copy.materialLabel}</div>
                  <select
                    className="input"
                    value={supplierMaterial}
                    onChange={(e) => setSupplierMaterial(e.target.value)}
                  >
                    <option value="">{copy.allMaterials}</option>
                    {materialOptions.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="muted" style={{ marginBottom: 8 }}>{copy.supplierZipLabel}</div>
                  <input
                    className="input"
                    value={supplierZip}
                    onChange={(e) => setSupplierZip(e.target.value.replace(/[^\d]/g, '').slice(0, 5))}
                    placeholder={copy.supplierZipPlaceholder}
                  />
                </div>
              </div>

              <div>
                <div className="muted" style={{ marginBottom: 8 }}>{copy.supplierSearchLabel}</div>
                <input
                  className="input"
                  value={supplierQuery}
                  onChange={(e) => setSupplierQuery(e.target.value)}
                  placeholder={copy.supplierSearchPlaceholder}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  type="button"
                  className={storefrontOnly ? 'btn primary' : 'btn'}
                  onClick={() => setStorefrontOnly((prev) => !prev)}
                >
                  {copy.storefrontOnly}
                </button>
                <button type="button" className="btn primary" onClick={() => setRanSupplier(true)}>
                  {copy.runSupplier}
                </button>
              </div>
            </div>
          </div>

          {ranSupplier ? (
            <div className="grid" style={{ gap: 16 }}>
              <div className="card rounded-xl" style={{ padding: 22 }}>
                <div className="card-section-title">{copy.supplierResults}</div>
              </div>

              {supplierResults.length === 0 ? (
                <div className="card rounded-xl" style={{ padding: 22 }}>
                  <div className="card-section-subtitle">{copy.noSupplierResults}</div>
                </div>
              ) : (
                supplierResults.map((supplier) => (
                  <div key={supplier.user_id} className="card rounded-xl" style={{ padding: 22 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                      <div>
                        <div className="h2" style={{ fontSize: 24 }}>
                          {normalizeText(supplier.business_name) || normalizeText(supplier.display_name) || 'Supplier'}
                        </div>
                        <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <span className="badge">AI {copy.matchScore}: {supplier.ai_score}</span>
                          {supplier.storefront ? <span className="badge">{copy.storefront}</span> : null}
                          <span className="badge">{copy.supplierZip}: {normalizeText(supplier.business_zip) || '—'}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <Link className="btn small primary" to={`/supplier/${supplier.user_id}`}>
                          {copy.openStorefront}
                        </Link>
                        <Link className="btn small" to={`/u/${supplier.user_id}`}>
                          {copy.openProfile}
                        </Link>
                      </div>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: 14,
                      marginTop: 16
                    }}>
                      <InfoCard label={copy.supplierMaterials} value={normalizeMaterials(supplier.materials_categories).slice(0, 3).join(', ') || '—'} />
                      <InfoCard label={copy.supplierRadius} value={numericValue(supplier.delivery_radius) > 0 ? `${numericValue(supplier.delivery_radius)} ${copy.miles}` : '—'} />
                      <InfoCard label={copy.supplierWhy} value={supplier.reasons.join(' • ') || '—'} />
                    </div>

                    <div style={{ marginTop: 16 }}>
                      <div className="muted">About</div>
                      <p style={{ marginTop: 8, lineHeight: 1.7 }}>{normalizeText(supplier.bio) || '—'}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : null}
        </>
      ) : null}

      {tab === 'crew' ? (
        <>
          <div className="card rounded-xl" style={{ padding: 22 }}>
            <div className="card-section-title">{copy.crewTitle}</div>
            <p className="card-section-subtitle" style={{ marginTop: 8 }}>{copy.crewBody}</p>

            <div className="grid" style={{ gap: 14, marginTop: 16 }}>
              <div className="grid two" style={{ gap: 14 }}>
                <div>
                  <div className="muted" style={{ marginBottom: 8 }}>{copy.tradeLabel}</div>
                  <select className="input" value={crewTradeId} onChange={(e) => setCrewTradeId(e.target.value)}>
                    <option value="">{copy.allTrades}</option>
                    {trades.map((trade) => (
                      <option key={trade.id} value={trade.id}>{trade.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="muted" style={{ marginBottom: 8 }}>{copy.crewZipLabel}</div>
                  <input
                    className="input"
                    value={crewZip}
                    onChange={(e) => setCrewZip(e.target.value.replace(/[^\d]/g, '').slice(0, 5))}
                    placeholder={copy.crewZipPlaceholder}
                  />
                </div>
              </div>

              <div className="grid two" style={{ gap: 14 }}>
                <div>
                  <div className="muted" style={{ marginBottom: 8 }}>{copy.radiusLabel}</div>
                  <input
                    className="input"
                    type="number"
                    value={crewRadius}
                    onChange={(e) => setCrewRadius(e.target.value)}
                  />
                </div>

                <div>
                  <div className="muted" style={{ marginBottom: 8 }}>{copy.minCrewLabel}</div>
                  <input
                    className="input"
                    type="number"
                    value={crewMinSize}
                    onChange={(e) => setCrewMinSize(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div className="muted" style={{ marginBottom: 8 }}>{copy.availabilityLabel}</div>
                <select className="input" value={crewAvailability} onChange={(e) => setCrewAvailability(e.target.value)}>
                  <option value="">{copy.allAvailability}</option>
                  <option value="available_now">{copy.availableNow}</option>
                  <option value="available_this_week">{copy.availableThisWeek}</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button type="button" className="btn primary" onClick={() => setRanCrew(true)}>
                  {copy.runCrew}
                </button>
                <Link className="btn" to="/new?type=need_crew">{copy.createNeedCrew}</Link>
              </div>
            </div>
          </div>

          {ranCrew ? (
            <div className="grid" style={{ gap: 16 }}>
              <div className="card rounded-xl" style={{ padding: 22 }}>
                <div className="card-section-title">{copy.crewResults}</div>
              </div>

              {crewResults.length === 0 ? (
                <div className="card rounded-xl" style={{ padding: 22 }}>
                  <div className="card-section-subtitle">{copy.noCrewResults}</div>
                </div>
              ) : (
                crewResults.map((worker) => (
                  <div key={worker.user_id} className="card rounded-xl" style={{ padding: 22 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                      <div>
                        <div className="h2" style={{ fontSize: 24 }}>
                          {normalizeText(worker.display_name) || normalizeText(`${worker.first_name || ''} ${worker.last_name || ''}`) || 'Member'}
                        </div>
                        <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <span className="badge">AI {copy.matchScore}: {worker.match_score}</span>
                          <span className="badge">{copy.role}: {prettyRole(worker.role, lang)}</span>
                          <span className="badge">{copy.trade}: {normalizeText(worker.trade_name) || '—'}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <Link className="btn small primary" to={`/u/${worker.user_id}`}>
                          {copy.openWorker}
                        </Link>
                      </div>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: 14,
                      marginTop: 16
                    }}>
                      <InfoCard label={copy.zip} value={normalizeText(worker.home_zip) || '—'} />
                      <InfoCard label={copy.availability} value={availabilityLabel(worker.availability_status, lang)} />
                      <InfoCard label={copy.crewSize} value={numericValue(worker.crew_size) || '—'} />
                      <InfoCard label={copy.travelRadius} value={numericValue(worker.travel_radius_miles) > 0 ? `${numericValue(worker.travel_radius_miles)} ${copy.miles}` : '—'} />
                      <InfoCard label={copy.profileStrength} value={`${worker.strength}/9`} />
                      <InfoCard label={copy.whyMatched} value={worker.reasons.join(' • ') || '—'} />
                    </div>

                    <div style={{ marginTop: 16 }}>
                      <div className="muted">Bio</div>
                      <p style={{ marginTop: 8, lineHeight: 1.7 }}>{normalizeText(worker.bio) || copy.noBio}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : null}
        </>
      ) : null}

      {tab === 'delivery' ? (
        <>
          <div className="card rounded-xl" style={{ padding: 22 }}>
            <div className="card-section-title">{copy.deliveryTitle}</div>
            <p className="card-section-subtitle" style={{ marginTop: 8 }}>{copy.deliveryBody}</p>

            <div className="grid" style={{ gap: 14, marginTop: 16 }}>
              <div>
                <div className="muted" style={{ marginBottom: 8 }}>{copy.chooseSupplier}</div>
                <select className="input" value={deliverySupplierId} onChange={(e) => setDeliverySupplierId(e.target.value)}>
                  <option value="">{copy.allSuppliers}</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.user_id} value={supplier.user_id}>
                      {normalizeText(supplier.business_name) || normalizeText(supplier.display_name) || 'Supplier'}
                    </option>
                  ))}
                </select>
                <div className="muted" style={{ marginTop: 8, fontSize: 13 }}>{copy.supplierOptional}</div>
              </div>

              <div className="grid two" style={{ gap: 14 }}>
                <div>
                  <div className="muted" style={{ marginBottom: 8 }}>{copy.pickupZipLabel}</div>
                  <input
                    className="input"
                    value={pickupZip}
                    onChange={(e) => setPickupZip(e.target.value.replace(/[^\d]/g, '').slice(0, 5))}
                    placeholder={copy.pickupZipPlaceholder}
                  />
                </div>

                <div>
                  <div className="muted" style={{ marginBottom: 8 }}>{copy.jobsiteZipLabel}</div>
                  <input
                    className="input"
                    value={deliveryJobsiteZip}
                    onChange={(e) => setDeliveryJobsiteZip(e.target.value.replace(/[^\d]/g, '').slice(0, 5))}
                    placeholder={copy.jobsiteZipPlaceholder}
                  />
                </div>
              </div>

              <div className="grid two" style={{ gap: 14 }}>
                <div>
                  <div className="muted" style={{ marginBottom: 8 }}>{copy.deliveryLaneLabel}</div>
                  <select className="input" value={deliverySupportType} onChange={(e) => setDeliverySupportType(e.target.value)}>
                    <option value="">{copy.allDeliveryLanes}</option>
                    {driverLaneOptions.map((option) => (
                      <option key={option} value={option}>{labelForMap(SUPPORT_TYPE_LABELS, option, lang)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="muted" style={{ marginBottom: 8 }}>{copy.vehicleLabel}</div>
                  <select className="input" value={deliveryVehicleType} onChange={(e) => setDeliveryVehicleType(e.target.value)}>
                    <option value="">{copy.allVehicles}</option>
                    {driverVehicleOptions.map((option) => (
                      <option key={option} value={option}>{labelForMap(VEHICLE_LABELS, option, lang)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid two" style={{ gap: 14 }}>
                <div>
                  <div className="muted" style={{ marginBottom: 8 }}>{copy.trailerLabel}</div>
                  <select className="input" value={deliveryTrailerType} onChange={(e) => setDeliveryTrailerType(e.target.value)}>
                    <option value="">{copy.allTrailers}</option>
                    {driverTrailerOptions.map((option) => (
                      <option key={option} value={option}>{labelForMap(TRAILER_LABELS, option, lang)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="muted" style={{ marginBottom: 8 }}>{copy.minPayloadLabel}</div>
                  <input
                    className="input"
                    type="number"
                    value={deliveryMinPayload}
                    onChange={(e) => setDeliveryMinPayload(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid two" style={{ gap: 14 }}>
                <div>
                  <div className="muted" style={{ marginBottom: 8 }}>{copy.minTrailerLengthLabel}</div>
                  <input
                    className="input"
                    type="number"
                    value={deliveryMinTrailerLength}
                    onChange={(e) => setDeliveryMinTrailerLength(e.target.value)}
                  />
                </div>

                <div>
                  <div className="muted" style={{ marginBottom: 8 }}>{copy.minDeliveryRadiusLabel}</div>
                  <input
                    className="input"
                    type="number"
                    value={deliveryMinRadius}
                    onChange={(e) => setDeliveryMinRadius(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button type="button" className="btn primary" onClick={() => setRanDelivery(true)}>
                  {copy.runDelivery}
                </button>
                <Link className="btn" to="/new?category=jobsite_support&support=material_delivery">
                  {copy.createDeliveryPost}
                </Link>
              </div>
            </div>
          </div>

          {ranDelivery ? (
            <div className="grid" style={{ gap: 16 }}>
              <div className="card rounded-xl" style={{ padding: 22 }}>
                <div className="card-section-title">{copy.deliveryResults}</div>
              </div>

              {deliveryResults.length === 0 ? (
                <div className="card rounded-xl" style={{ padding: 22 }}>
                  <div className="card-section-subtitle">{copy.noDeliveryResults}</div>
                </div>
              ) : (
                deliveryResults.map((driver) => (
                  <div key={driver.user_id} className="card rounded-xl" style={{ padding: 22 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                      <div>
                        <div className="h2" style={{ fontSize: 24 }}>
                          {normalizeText(driver.display_name) || normalizeText(`${driver.first_name || ''} ${driver.last_name || ''}`) || prettyRole('driver', lang)}
                        </div>
                        <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <span className="badge">AI {copy.matchScore}: {driver.delivery_score}</span>
                          <span className="badge">{copy.supportLane}: {labelForMap(SUPPORT_TYPE_LABELS, driver.support_type, lang) || '—'}</span>
                          <span className="badge">{copy.city}: {normalizeText(driver.city) || copy.noCity}</span>
                          <span className="badge">{copy.zip}: {normalizeText(driver.home_zip) || normalizeText(driver.business_zip) || '—'}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <Link className="btn small primary" to={`/u/${driver.user_id}`}>
                          {copy.openDriver}
                        </Link>
                      </div>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: 14,
                      marginTop: 16
                    }}>
                      <InfoCard label={copy.pickupSummary} value={normalizeText(selectedSupplier?.business_name) || normalizeText(selectedSupplier?.display_name) || normalizeText(pickupZip) || '—'} />
                      <InfoCard label={copy.jobsiteSummary} value={normalizeText(deliveryJobsiteZip) || '—'} />
                      <InfoCard label={copy.vehicleType} value={labelForMap(VEHICLE_LABELS, driver.vehicle_type, lang) || '—'} />
                      <InfoCard label={copy.trailerType} value={labelForMap(TRAILER_LABELS, driver.trailer_type, lang) || '—'} />
                      <InfoCard label={copy.payloadCapacity} value={numericValue(driver.payload_capacity) > 0 ? `${numericValue(driver.payload_capacity)} ${copy.pounds}` : '—'} />
                      <InfoCard label={copy.deliveryRadiusLabel} value={numericValue(driver.delivery_radius) > 0 ? `${numericValue(driver.delivery_radius)} ${copy.miles}` : '—'} />
                      <InfoCard label={copy.trailerLength} value={numericValue(driver.trailer_length) > 0 ? `${numericValue(driver.trailer_length)} ${copy.feet}` : '—'} />
                      <InfoCard label={copy.whyMatched} value={driver.reasons.join(' • ') || '—'} />
                    </div>

                    <div style={{ marginTop: 16 }}>
                      <div className="muted">{copy.serviceTags}</div>
                      {driver.service_tags.length > 0 ? (
                        <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {driver.service_tags.map((tag) => (
                            <span key={`${driver.user_id}-${tag}`} className="badge" style={{ background: '#d8ecff', color: '#0d3f73' }}>
                              {labelForMap(SERVICE_TAG_LABELS, tag, lang)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="muted" style={{ marginTop: 8 }}>{copy.noServiceTags}</div>
                      )}
                    </div>

                    <div style={{ marginTop: 16 }}>
                      <div className="muted">About</div>
                      <p style={{ marginTop: 8, lineHeight: 1.7 }}>{normalizeText(driver.bio) || copy.noBio}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : null}
        </>
      ) : null}

      <div className="card rounded-xl" style={{ padding: 22, background: '#fffaf0' }}>
        <div className="card-section-subtitle">{copy.quickNote}</div>
      </div>
    </div>
  )
}
