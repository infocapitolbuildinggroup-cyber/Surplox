import React, { useMemo, useState } from 'react'

const COPY = {
  en: {
    badge: 'Surplox Deal OS',
    title: 'Flip Engine',
    body:
      'Generate distressed-property opportunities, score them for execution, and rank each deal by projected profitability, confidence, and remodel fit.',
    filtersTitle: 'Opportunity Filters',
    filtersBody:
      'Set your target buy box and let the engine generate ranked opportunities with rehab budgets, ARV ranges, crew plans, suppliers, delivery planning, and compliance snapshots.',
    county: 'County',
    city: 'City / ZIP',
    distressType: 'Distress Type',
    targetMargin: 'Target Margin %',
    targetProfit: 'Target Profit $',
    maxRehab: 'Max Rehab Budget $',
    propertyType: 'Property Type',
    occupancy: 'Occupancy Preference',
    dealCount: 'Deal Count',
    sortBy: 'Sort By',
    arvMode: 'ARV Mode',
    riskTolerance: 'Risk Tolerance',
    all: 'All',
    any: 'Any',
    ownerOccupied: 'Owner Occupied',
    vacant: 'Vacant / Likely Vacant',
    singleFamily: 'Single Family',
    townhome: 'Townhome',
    smallMultifamily: '2-4 Unit',
    preforeclosure: 'Pre-Foreclosure',
    taxDelinquent: 'Tax Delinquent',
    codeViolation: 'Code Violation',
    probate: 'Probate',
    inherited: 'Inherited / Estate',
    conservative: 'Conservative',
    balanced: 'Balanced',
    aggressive: 'Aggressive',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    byScore: 'Best Score',
    byProfit: 'Highest Profit',
    byMargin: 'Highest Margin',
    byLowestRehab: 'Lowest Rehab',
    generate: 'Generate Properties',
    generating: 'Generating Properties…',
    opportunitySummary: 'Opportunity Summary',
    totalResults: 'Generated Deals',
    avgProfit: 'Average Net Profit',
    bestDeal: 'Best Deal',
    avgMargin: 'Average Margin',
    savedDeals: 'Saved Deals',
    rankedResults: 'Ranked Opportunities',
    resultsBody: 'These opportunities are ranked by Flip Opportunity Score so you see the best combinations of spread, confidence, and execution fit first.',
    noResults: 'No opportunities generated yet. Set your filters and run the engine.',
    score: 'Flip Score',
    executionFit: 'Execution Fit',
    confidence: 'Confidence',
    difficulty: 'Execution Difficulty',
    source: 'Deal Source',
    distress: 'Distress',
    buyPrice: 'Estimated Buy',
    rehab: 'Estimated Rehab',
    arv: 'Projected ARV',
    netProfit: 'Projected Net Profit',
    marginPct: 'Projected Margin %',
    recommendedAction: 'Recommended Action',
    openDetails: 'Open Deal Packet',
    hideDetails: 'Hide Deal Packet',
    sourceSection: 'Deal Source',
    scoringSection: 'Deal Scoring',
    engineSection: 'Flip Engine Details',
    complianceSection: 'Compliance Layer',
    rehabScope: 'Rehab Scope',
    crewNeeded: 'Crew Needed',
    suppliers: 'Suppliers',
    deliveryPlan: 'Delivery Plan',
    notes: 'Notes',
    ownerName: 'Owner',
    filingDate: 'Filing Date',
    auctionDate: 'Auction / Deadline',
    lienAmount: 'Lien / Default',
    occupancySignal: 'Occupancy Signal',
    titleRisk: 'Title Risk',
    financingFit: 'Financing Fit',
    resaleConfidence: 'Resale Confidence',
    doNotCall: 'Do Not Call Flag',
    callStatus: 'Call Status',
    outreachReady: 'Outreach Ready',
    holdCost: 'Holding Cost',
    sellCost: 'Selling Cost',
    contingency: 'Contingency',
    contractorMargin: 'Contractor Margin',
    profitBand: 'Profit Band',
    thinDeal: 'Too thin unless buy price improves.',
    workableDeal: 'Workable deal if scope stays controlled.',
    strongDeal: 'Strong flip candidate.',
    eliteDeal: 'Top-ranked opportunity with strong spread and fit.',
    pursue: 'Pursue Immediately',
    underwrite: 'Worth Full Underwrite',
    renegotiate: 'Needs Better Buy Price',
    skip: 'Skip / Low Margin',
    dataGenerated: 'Phase 2 adds scenario modeling, rehab line items, max allowable offer logic, saved deals, and outreach-ready notes while keeping this workflow self-contained.',
    rehabBreakdown: 'Rehab Breakdown',
    scenarioModel: 'Scenario Model',
    compsSummary: 'Comps / ARV Snapshot',
    maxOffer: 'Max Allowable Offer',
    saveDeal: 'Save Deal',
    saved: 'Saved',
    removeSaved: 'Remove Saved',
    shortlist: 'Shortlist',
    removeShortlist: 'Remove Shortlist',
    outreachPlan: 'Outreach Plan',
    underwritingQueue: 'Underwriting Queue',
    queueDeal: 'Queue Deal',
    queued: 'Queued',
    startOutreach: 'Start Outreach',
    notStarted: 'Not Started',
    compConfidence: 'Comp Confidence',
    monthsHeld: 'Months Held',
    estClosingTimeline: 'Estimated Close + Rehab Timeline',
    arvLow: 'ARV Low',
    arvHigh: 'ARV High',
    baseCase: 'Base Case',
    downside: 'Downside Case',
    upside: 'Upside Case',
    rehabPerSqft: 'Rehab / SF',
    targetWindow: 'Target Buy Window',
    timeline: 'Timeline',
    propertyQueueEmpty: 'No deals have been saved yet.',
    savedSection: 'Saved / Shortlisted Deals',
    saveHint: 'Save the strongest opportunities here while you move into outreach or deeper underwriting.',
    exportReady: 'Export-ready summary',
    executionLane: 'Execution lane',
    autoGeneratedPct: 'Auto-generated return profile',
    targetGap: 'Target Gap',
    exceedsTarget: 'Above Target',
    belowTarget: 'Below Target',
    closeWindow: 'Closing Window',
    outreachScript: 'Outreach Starter',
    underwritingNotes: 'Underwriting Notes'
  },
  es: {
    badge: 'Surplox Deal OS',
    title: 'Flip Engine',
    body:
      'Genera oportunidades de propiedades en distress, califícalas para la ejecución y ordénalas por rentabilidad proyectada, confianza y ajuste de remodelación.',
    filtersTitle: 'Filtros de Oportunidad',
    filtersBody:
      'Define tu caja de compra y deja que el motor genere oportunidades con presupuesto de rehab, rango ARV, cuadrillas, proveedores, entrega y cumplimiento.',
    county: 'Condado',
    city: 'Ciudad / ZIP',
    distressType: 'Tipo de Distress',
    targetMargin: 'Margen Objetivo %',
    targetProfit: 'Ganancia Objetivo $',
    maxRehab: 'Rehab Máximo $',
    propertyType: 'Tipo de Propiedad',
    occupancy: 'Preferencia de Ocupación',
    dealCount: 'Cantidad de Deals',
    sortBy: 'Ordenar Por',
    arvMode: 'Modo ARV',
    riskTolerance: 'Tolerancia de Riesgo',
    all: 'Todas',
    any: 'Cualquiera',
    ownerOccupied: 'Ocupada por Dueño',
    vacant: 'Vacía / Probablemente Vacía',
    singleFamily: 'Casa Unifamiliar',
    townhome: 'Townhome',
    smallMultifamily: '2-4 Unidades',
    preforeclosure: 'Pre-Ejecución',
    taxDelinquent: 'Impuestos Morosos',
    codeViolation: 'Violación de Código',
    probate: 'Sucesión',
    inherited: 'Herencia / Estate',
    conservative: 'Conservador',
    balanced: 'Balanceado',
    aggressive: 'Agresivo',
    low: 'Bajo',
    medium: 'Medio',
    high: 'Alto',
    byScore: 'Mejor Score',
    byProfit: 'Mayor Ganancia',
    byMargin: 'Mayor Margen',
    byLowestRehab: 'Menor Rehab',
    generate: 'Generar Propiedades',
    generating: 'Generando Propiedades…',
    opportunitySummary: 'Resumen de Oportunidades',
    totalResults: 'Deals Generados',
    avgProfit: 'Ganancia Neta Promedio',
    bestDeal: 'Mejor Deal',
    avgMargin: 'Margen Promedio',
    savedDeals: 'Deals Guardados',
    rankedResults: 'Oportunidades Ordenadas',
    resultsBody: 'Estas oportunidades se ordenan por Flip Opportunity Score para que veas primero las mejores combinaciones de utilidad, confianza y ajuste operativo.',
    noResults: 'Todavía no se generan oportunidades. Ajusta los filtros y corre el motor.',
    score: 'Flip Score',
    executionFit: 'Ajuste de Ejecución',
    confidence: 'Confianza',
    difficulty: 'Dificultad de Ejecución',
    source: 'Fuente del Deal',
    distress: 'Distress',
    buyPrice: 'Compra Estimada',
    rehab: 'Rehab Estimado',
    arv: 'ARV Proyectado',
    netProfit: 'Ganancia Neta Proyectada',
    marginPct: 'Margen Proyectado %',
    recommendedAction: 'Acción Recomendada',
    openDetails: 'Abrir Paquete del Deal',
    hideDetails: 'Ocultar Paquete del Deal',
    sourceSection: 'Fuente del Deal',
    scoringSection: 'Puntuación del Deal',
    engineSection: 'Detalles del Flip Engine',
    complianceSection: 'Capa de Cumplimiento',
    rehabScope: 'Alcance de Rehab',
    crewNeeded: 'Cuadrilla Necesaria',
    suppliers: 'Proveedores',
    deliveryPlan: 'Plan de Entrega',
    notes: 'Notas',
    ownerName: 'Propietario',
    filingDate: 'Fecha de Registro',
    auctionDate: 'Subasta / Fecha Límite',
    lienAmount: 'Gravamen / Default',
    occupancySignal: 'Señal de Ocupación',
    titleRisk: 'Riesgo de Título',
    financingFit: 'Ajuste de Financiamiento',
    resaleConfidence: 'Confianza de Reventa',
    doNotCall: 'Bandera No Llamar',
    callStatus: 'Estado de Llamada',
    outreachReady: 'Listo para Contacto',
    holdCost: 'Costo de Holding',
    sellCost: 'Costo de Venta',
    contingency: 'Contingencia',
    contractorMargin: 'Margen del Contratista',
    profitBand: 'Banda de Ganancia',
    thinDeal: 'Muy delgado salvo que mejore el precio de compra.',
    workableDeal: 'Deal trabajable si el alcance se controla.',
    strongDeal: 'Buen candidato de flip.',
    eliteDeal: 'Oportunidad top con buen spread y fit.',
    pursue: 'Perseguir Inmediatamente',
    underwrite: 'Vale Underwrite Completo',
    renegotiate: 'Necesita Mejor Precio',
    skip: 'Saltar / Bajo Margen',
    dataGenerated: 'La Fase 2 agrega modelado de escenarios, partidas de rehab, lógica de oferta máxima, deals guardados y notas listas para outreach dentro del mismo flujo.',
    rehabBreakdown: 'Desglose de Rehab',
    scenarioModel: 'Modelo de Escenario',
    compsSummary: 'Resumen de Comps / ARV',
    maxOffer: 'Oferta Máxima Permitida',
    saveDeal: 'Guardar Deal',
    saved: 'Guardado',
    removeSaved: 'Quitar Guardado',
    shortlist: 'Shortlist',
    removeShortlist: 'Quitar Shortlist',
    outreachPlan: 'Plan de Outreach',
    underwritingQueue: 'Cola de Underwriting',
    queueDeal: 'Poner en Cola',
    queued: 'En Cola',
    startOutreach: 'Iniciar Outreach',
    notStarted: 'No Iniciado',
    compConfidence: 'Confianza de Comps',
    monthsHeld: 'Meses de Holding',
    estClosingTimeline: 'Tiempo Estimado de Cierre + Rehab',
    arvLow: 'ARV Bajo',
    arvHigh: 'ARV Alto',
    baseCase: 'Caso Base',
    downside: 'Caso Bajo',
    upside: 'Caso Alto',
    rehabPerSqft: 'Rehab / SF',
    targetWindow: 'Rango Objetivo de Compra',
    timeline: 'Cronograma',
    propertyQueueEmpty: 'Todavía no hay deals guardados.',
    savedSection: 'Deals Guardados / Shortlist',
    saveHint: 'Guarda aquí las oportunidades más fuertes mientras avanzas a outreach o underwriting más profundo.',
    exportReady: 'Resumen listo para exportar',
    executionLane: 'Línea de ejecución',
    autoGeneratedPct: 'Perfil de retorno auto-generado',
    targetGap: 'Brecha al Objetivo',
    exceedsTarget: 'Arriba del Objetivo',
    belowTarget: 'Abajo del Objetivo',
    closeWindow: 'Ventana de Cierre',
    outreachScript: 'Inicio de Outreach',
    underwritingNotes: 'Notas de Underwriting'
  }
}

const COUNTY_OPTIONS = ['Dallas County', 'Tarrant County', 'Denton County', 'Collin County', 'Ellis County', 'Johnson County']
const CITY_OPTIONS = ['Dallas', 'Fort Worth', 'Arlington', 'Irving', 'Plano', 'Frisco', 'Midlothian', 'Mansfield']
const DISTRESS_OPTIONS = ['preforeclosure', 'tax_delinquent', 'code_violation', 'probate', 'inherited']
const PROPERTY_TYPES = ['single_family', 'townhome', 'small_multifamily']
const OCCUPANCY_OPTIONS = ['any', 'owner_occupied', 'vacant']
const DEAL_COUNT_OPTIONS = [5, 10, 15]

function currency(value) {
  return `$${Math.round(Number(value || 0)).toLocaleString()}`
}

function pct(value) {
  return `${Number(value || 0).toFixed(1)}%`
}

function titleCase(value = '') {
  return String(value || '')
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max)
}

function formatDateOffset(days = 0) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toLocaleDateString()
}

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function buildSuppliers(distressType = '', propertyType = '') {
  const pool = {
    paint: 'Sherwin-Williams / Paint Supply',
    flooring: 'Floor & Decor / Flooring Yard',
    drywall: 'Drywall Supply / Gypsum Yard',
    roofing: 'ABC Supply / Roofing',
    concrete: 'Ready-Mix / Concrete Yard',
    cabinetry: 'Cabinet Supplier / Millwork Shop',
    electrical: 'Electrical Supply House',
    plumbing: 'Plumbing Supply House'
  }

  const base = [pool.paint, pool.flooring, pool.drywall, pool.cabinetry]
  if (distressType === 'code_violation') base.push(pool.concrete)
  if (distressType === 'preforeclosure' || propertyType === 'small_multifamily') base.push(pool.roofing)
  base.push(pool.electrical, pool.plumbing)
  return Array.from(new Set(base)).slice(0, 5)
}

function buildCrewNeeded(rehabLevel = 'moderate', propertyType = '') {
  const crew = ['Project manager / superintendent', 'Demo + cleanup labor', 'Painter / finish crew']
  if (rehabLevel !== 'light') crew.push('Drywall + texture crew', 'Flooring installer')
  if (rehabLevel === 'heavy' || rehabLevel === 'full_gut') crew.push('Electrician', 'Plumber')
  if (rehabLevel === 'full_gut' || propertyType === 'small_multifamily') crew.push('Framing / carpentry crew', 'Roofing crew')
  return crew.slice(0, 7)
}

function buildRehabBreakdown(rehabLevel = 'moderate', rehabTotal = 0, sqft = 0) {
  const templates = {
    light: [
      ['Paint + prep', 0.22],
      ['Flooring', 0.21],
      ['Fixtures + hardware', 0.12],
      ['Cleanup + punch', 0.08],
      ['Exterior touch-up', 0.12],
      ['Contingency in scope', 0.25]
    ],
    moderate: [
      ['Paint + prep', 0.16],
      ['Flooring', 0.17],
      ['Drywall + texture', 0.11],
      ['Kitchen / bath refresh', 0.18],
      ['Fixtures + electrical trim', 0.09],
      ['Plumbing / misc repairs', 0.08],
      ['Contingency in scope', 0.21]
    ],
    heavy: [
      ['Demo + haul-off', 0.11],
      ['Drywall + texture', 0.12],
      ['Flooring', 0.12],
      ['Kitchen / bath package', 0.2],
      ['Electrical', 0.1],
      ['Plumbing', 0.09],
      ['Roof / exterior', 0.08],
      ['Contingency in scope', 0.18]
    ],
    full_gut: [
      ['Demo + haul-off', 0.12],
      ['Framing / carpentry', 0.12],
      ['Drywall + texture', 0.11],
      ['Kitchen / bath package', 0.18],
      ['Electrical', 0.11],
      ['Plumbing', 0.1],
      ['Roof / exterior', 0.1],
      ['Windows / doors', 0.06],
      ['Contingency in scope', 0.1]
    ]
  }

  const selected = templates[rehabLevel] || templates.moderate
  const parts = selected.map(([label, weight], index) => ({
    id: `${rehabLevel}-${index}`,
    label,
    amount: Math.round(rehabTotal * weight)
  }))

  const rehabPerSqft = sqft > 0 ? rehabTotal / sqft : 0
  return { parts, rehabPerSqft }
}

function profitBandLabel(marginPctValue, copy) {
  if (marginPctValue >= 20) return copy.eliteDeal
  if (marginPctValue >= 15) return copy.strongDeal
  if (marginPctValue >= 10) return copy.workableDeal
  return copy.thinDeal
}

function recommendedActionLabel(score, margin, copy) {
  if (score >= 86 && margin >= 18) return copy.pursue
  if (score >= 72 && margin >= 12) return copy.underwrite
  if (margin >= 6) return copy.renegotiate
  return copy.skip
}

function buildArvBand(arv, mode = 'balanced') {
  const spread = mode === 'conservative' ? 0.09 : mode === 'aggressive' ? 0.15 : 0.12
  return {
    low: Math.round(arv * (1 - spread * 0.55)),
    base: Math.round(arv),
    high: Math.round(arv * (1 + spread * 0.45))
  }
}

function buildScenarioModel({
  arvBand,
  buyTarget,
  rehab,
  closingCosts,
  holdingCosts,
  sellingCosts,
  contingency,
  contractorMargin
}) {
  const buildScenario = (label, arvValue, rehabMultiplier, holdMultiplier) => {
    const rehabAdjusted = Math.round(rehab * rehabMultiplier)
    const holdAdjusted = Math.round(holdingCosts * holdMultiplier)
    const totalCost = buyTarget + rehabAdjusted + closingCosts + holdAdjusted + sellingCosts + contingency
    const netProfit = Math.round(arvValue - totalCost + contractorMargin)
    const margin = totalCost > 0 ? (netProfit / totalCost) * 100 : 0
    return {
      label,
      arv: arvValue,
      rehab: rehabAdjusted,
      hold: holdAdjusted,
      totalCost,
      netProfit,
      margin
    }
  }

  return [
    buildScenario('downside', arvBand.low, 1.08, 1.15),
    buildScenario('base', arvBand.base, 1, 1),
    buildScenario('upside', arvBand.high, 0.95, 0.9)
  ]
}

function getHoldMonths(rehabLevel = 'moderate', riskTolerance = 'medium') {
  const base = rehabLevel === 'full_gut' ? 7 : rehabLevel === 'heavy' ? 5.5 : rehabLevel === 'moderate' ? 4 : 3
  const modifier = riskTolerance === 'low' ? 0.5 : riskTolerance === 'high' ? -0.3 : 0
  return Math.max(2, Math.round((base + modifier) * 10) / 10)
}

function getTimelineLabel(monthsHeld = 4) {
  if (monthsHeld >= 6) return 'Long / complex'
  if (monthsHeld >= 4.5) return 'Moderate'
  return 'Fast-turn'
}

function buildOutreachScript(deal) {
  return `Hi, I’m reaching out about ${deal.address}. We review off-market property situations and can evaluate a direct purchase path if you are considering selling.`
}

function buildUnderwritingNotes({ score, confidence, marginPctValue, financingFit, titleRisk }) {
  const notes = []
  if (score >= 85) notes.push('Strong ranking across spread and execution.')
  if (confidence < 70) notes.push('Comp confidence should be tightened before final pursuit.')
  if (marginPctValue < 10) notes.push('Thin margin. Focus on better entry price or lighter scope.')
  if (financingFit < 70) notes.push('Loan structure may need a stronger rehab packet and ARV support.')
  if (titleRisk > 60) notes.push('Title review should happen early.')
  return notes
}

function computeTargetGap(netProfit, targetProfit) {
  return Math.round(netProfit - Number(targetProfit || 0))
}

function generateProperty(seedIndex, filters, copy) {
  const county = filters.county || COUNTY_OPTIONS[seedIndex % COUNTY_OPTIONS.length]
  const city = filters.city || CITY_OPTIONS[seedIndex % CITY_OPTIONS.length]
  const distressType = filters.distressType === 'all' ? DISTRESS_OPTIONS[seedIndex % DISTRESS_OPTIONS.length] : filters.distressType
  const propertyType = filters.propertyType === 'all' ? PROPERTY_TYPES[seedIndex % PROPERTY_TYPES.length] : filters.propertyType
  const occupancy = filters.occupancy === 'any' ? OCCUPANCY_OPTIONS[(seedIndex % 2) + 1] : filters.occupancy

  const beds = 2 + Math.floor(seededRandom(seedIndex + 1) * 3)
  const baths = 1 + Math.floor(seededRandom(seedIndex + 2) * 3)
  const sqft = 980 + Math.round(seededRandom(seedIndex + 3) * (propertyType === 'small_multifamily' ? 2200 : 1250))
  const rehabIntensityScore = 35 + seededRandom(seedIndex + 4) * 55
  const rehabLevel = rehabIntensityScore > 78 ? 'full_gut' : rehabIntensityScore > 62 ? 'heavy' : rehabIntensityScore > 45 ? 'moderate' : 'light'

  const arvBase = propertyType === 'small_multifamily' ? 365000 : propertyType === 'townhome' ? 285000 : 315000
  const marketBoost = county.includes('Collin') || county.includes('Denton') ? 30000 : county.includes('Ellis') ? 15000 : 0
  const modeMultiplier = filters.arvMode === 'conservative' ? 0.96 : filters.arvMode === 'aggressive' ? 1.05 : 1
  const arv = Math.round((arvBase + marketBoost + seededRandom(seedIndex + 5) * 165000) * modeMultiplier)
  const rehabCap = Number(filters.maxRehab || 150000)
  const rehab = Math.round(Math.min(rehabCap, 35000 + rehabIntensityScore * 1550 + seededRandom(seedIndex + 6) * 25000))
  const riskBuyModifier = filters.riskTolerance === 'low' ? -0.03 : filters.riskTolerance === 'high' ? 0.025 : 0
  const buyTarget = Math.round(arv * (0.48 + seededRandom(seedIndex + 7) * 0.16 + riskBuyModifier) - rehab * (0.28 + seededRandom(seedIndex + 8) * 0.1))
  const closingCosts = Math.round(arv * 0.02)
  const monthsHeld = getHoldMonths(rehabLevel, filters.riskTolerance)
  const holdingCosts = Math.round((8500 + rehab * 0.08 + seededRandom(seedIndex + 9) * 5000) * (monthsHeld / 4))
  const sellingCosts = Math.round(arv * 0.065)
  const contingency = Math.round(rehab * (filters.riskTolerance === 'low' ? 0.14 : filters.riskTolerance === 'high' ? 0.1 : 0.12))
  const contractorMargin = Math.round(rehab * (0.12 + seededRandom(seedIndex + 10) * 0.08))
  const totalCost = buyTarget + rehab + closingCosts + holdingCosts + sellingCosts + contingency
  const netProfit = Math.round(arv - totalCost + contractorMargin)
  const marginPctValue = totalCost > 0 ? (netProfit / totalCost) * 100 : 0

  const dataQuality = 68 + seededRandom(seedIndex + 11) * 28
  const titleRisk = 20 + seededRandom(seedIndex + 12) * 60
  const financingFit = 62 + seededRandom(seedIndex + 13) * 30
  const resaleConfidence = 58 + seededRandom(seedIndex + 14) * 35
  const executionFit = clamp(55 + (propertyType === 'single_family' ? 12 : 0) + (rehabLevel === 'moderate' ? 10 : rehabLevel === 'heavy' ? -2 : 4) + seededRandom(seedIndex + 15) * 22, 0, 100)
  const confidence = clamp((dataQuality * 0.45) + (resaleConfidence * 0.35) + ((100 - titleRisk) * 0.2), 0, 100)
  const difficulty = clamp((rehabIntensityScore * 0.55) + (titleRisk * 0.25) + (propertyType === 'small_multifamily' ? 18 : 0), 0, 100)
  const score = clamp(
    ((netProfit / Math.max(Number(filters.targetProfit || 45000), 1)) * 20) +
    (marginPctValue * 1.8) +
    (confidence * 0.22) +
    (executionFit * 0.18) -
    (difficulty * 0.16),
    0,
    100
  )

  const houseNumber = 1100 + Math.floor(seededRandom(seedIndex + 16) * 7800)
  const streetNames = ['Oakridge Dr', 'Willow Bend Ln', 'Cedar Hollow Ct', 'Mesa Ridge Ave', 'Stonebridge Way', 'Briar Meadow Dr', 'Elm Fork Trl']
  const street = streetNames[seedIndex % streetNames.length]
  const zip = 75000 + Math.floor(seededRandom(seedIndex + 17) * 1200)

  const sourceSiteMap = {
    preforeclosure: `${county} Clerk Foreclosure Records`,
    tax_delinquent: `${county} Tax Assessor Delinquent Roll`,
    code_violation: `${city} Code Compliance Records`,
    probate: `${county} Probate Court Filings`,
    inherited: `${county} Estate / Heirship Filings`
  }

  const source = sourceSiteMap[distressType] || `${county} Public Records`
  const ownerName = ['Garcia', 'Johnson', 'Rodriguez', 'Smith', 'Martinez', 'Nguyen', 'Lopez'][seedIndex % 7]
  const supplierList = buildSuppliers(distressType, propertyType)
  const crewNeeded = buildCrewNeeded(rehabLevel, propertyType)
  const deliveryPlan = rehabLevel === 'full_gut' || rehabLevel === 'heavy'
    ? 'Stage demo haul-off, flooring, drywall, cabinets, and final fixture deliveries in 3-4 waves.'
    : 'Two delivery waves: rough materials first, finishes second.'
  const rehabBreakdown = buildRehabBreakdown(rehabLevel, rehab, sqft)
  const arvBand = buildArvBand(arv, filters.arvMode)
  const scenarios = buildScenarioModel({
    arvBand,
    buyTarget,
    rehab,
    closingCosts,
    holdingCosts,
    sellingCosts,
    contingency,
    contractorMargin
  })
  const maxAllowableOffer = Math.round(arvBand.base * 0.7 - rehab - contingency - holdingCosts)
  const targetGap = computeTargetGap(netProfit, filters.targetProfit)
  const compConfidence = Math.round((confidence * 0.55) + (resaleConfidence * 0.45))
  const underwritingNotes = buildUnderwritingNotes({ score, confidence, marginPctValue, financingFit, titleRisk })

  return {
    id: `flip-${seedIndex}`,
    address: `${houseNumber} ${street}, ${city}, TX ${zip}`,
    county,
    city,
    zip: String(zip),
    distressType,
    propertyType,
    occupancy,
    beds,
    baths,
    sqft,
    buyTarget,
    rehab,
    arv,
    arvBand,
    holdingCosts,
    sellingCosts,
    contingency,
    contractorMargin,
    netProfit,
    marginPctValue,
    executionFit: Math.round(executionFit),
    confidence: Math.round(confidence),
    difficulty: Math.round(difficulty),
    score: Math.round(score),
    source,
    ownerName,
    filingDate: formatDateOffset(-Math.floor(seededRandom(seedIndex + 18) * 34)),
    auctionDate: formatDateOffset(5 + Math.floor(seededRandom(seedIndex + 19) * 28)),
    lienAmount: Math.round(buyTarget * (0.54 + seededRandom(seedIndex + 20) * 0.2)),
    titleRisk: Math.round(titleRisk),
    financingFit: Math.round(financingFit),
    resaleConfidence: Math.round(resaleConfidence),
    rehabLevel,
    crewNeeded,
    supplierList,
    deliveryPlan,
    doNotCall: seededRandom(seedIndex + 21) > 0.86,
    outreachReady: seededRandom(seedIndex + 22) > 0.22,
    callStatus: seededRandom(seedIndex + 23) > 0.65 ? 'Not Called' : seededRandom(seedIndex + 24) > 0.5 ? 'Needs Review' : 'Ready for Outreach',
    profitBand: profitBandLabel(marginPctValue, copy),
    recommendedAction: recommendedActionLabel(score, marginPctValue, copy),
    notes:
      rehabLevel === 'full_gut'
        ? 'High upside if bought right, but the remodel will require tighter scope control, stronger draw management, and deeper contingency discipline.'
        : rehabLevel === 'heavy'
          ? 'Strong candidate if the buy stays discounted and the scope avoids major hidden structural surprises.'
          : 'Cleaner execution path with lighter capital intensity and faster turn potential.',
    rehabBreakdown,
    scenarios,
    maxAllowableOffer,
    targetGap,
    monthsHeld,
    closeWindow: getTimelineLabel(monthsHeld),
    compConfidence,
    outreachScript: buildOutreachScript({ address: `${houseNumber} ${street}, ${city}, TX ${zip}` }),
    underwritingNotes
  }
}

function scoreTone(score) {
  if (score >= 85) return { background: '#dcf4e5', color: '#177245' }
  if (score >= 70) return { background: '#d8ecff', color: '#0d3f73' }
  if (score >= 55) return { background: '#fff0b4', color: '#111111' }
  return { background: '#ffe1df', color: '#8a1c14' }
}

function difficultyTone(value) {
  if (value <= 35) return { background: '#dcf4e5', color: '#177245' }
  if (value <= 60) return { background: '#fff0b4', color: '#111111' }
  return { background: '#ffe1df', color: '#8a1c14' }
}

function targetGapTone(value) {
  if (value >= 0) return { background: '#dcf4e5', color: '#177245' }
  if (value >= -10000) return { background: '#fff0b4', color: '#111111' }
  return { background: '#ffe1df', color: '#8a1c14' }
}

function ownerNameDisplay(lastName = '') {
  return `Owner ${lastName}`
}

export default function FlipEngine({ lang = 'en' }) {
  const copy = COPY[lang] || COPY.en
  const [busy, setBusy] = useState(false)
  const [expandedId, setExpandedId] = useState('')
  const [savedIds, setSavedIds] = useState([])
  const [shortlistIds, setShortlistIds] = useState([])
  const [queuedIds, setQueuedIds] = useState([])
  const [filters, setFilters] = useState({
    county: 'Dallas County',
    city: '',
    distressType: 'all',
    targetMargin: '15',
    targetProfit: '45000',
    maxRehab: '140000',
    propertyType: 'all',
    occupancy: 'any',
    dealCount: '10',
    sortBy: 'score',
    arvMode: 'balanced',
    riskTolerance: 'medium'
  })
  const [results, setResults] = useState([])

  function setField(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  function sortDeals(items = [], sortBy = 'score') {
    const rows = [...items]
    if (sortBy === 'profit') return rows.sort((a, b) => b.netProfit - a.netProfit || b.score - a.score)
    if (sortBy === 'margin') return rows.sort((a, b) => b.marginPctValue - a.marginPctValue || b.score - a.score)
    if (sortBy === 'rehab') return rows.sort((a, b) => a.rehab - b.rehab || b.score - a.score)
    return rows.sort((a, b) => b.score - a.score || b.netProfit - a.netProfit)
  }

  function handleGenerate() {
    setBusy(true)
    const count = Number(filters.dealCount || 10)
    const generated = sortDeals(
      Array.from({ length: count }, (_, index) => generateProperty(index + 1, filters, copy)),
      filters.sortBy
    )
    setResults(generated)
    setExpandedId(generated[0]?.id || '')
    setTimeout(() => setBusy(false), 250)
  }

  function toggleSaved(id) {
    setSavedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  function toggleShortlist(id) {
    setShortlistIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  function toggleQueued(id) {
    setQueuedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const metrics = useMemo(() => {
    if (!results.length) {
      return { total: 0, avgProfit: 0, bestDeal: 0, avgMargin: 0 }
    }
    return {
      total: results.length,
      avgProfit: results.reduce((sum, item) => sum + item.netProfit, 0) / results.length,
      bestDeal: results[0]?.netProfit || 0,
      avgMargin: results.reduce((sum, item) => sum + item.marginPctValue, 0) / results.length
    }
  }, [results])

  const savedDeals = useMemo(() => {
    return results.filter((item) => savedIds.includes(item.id) || shortlistIds.includes(item.id))
  }, [results, savedIds, shortlistIds])

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div
        className="card rounded-xl"
        style={{
          padding: 26,
          background: 'linear-gradient(180deg, #eef5ff 0%, #f7f7f2 100%)'
        }}
      >
        <div className="badge" style={{ marginBottom: 12, background: '#d8ecff', color: '#0d3f73' }}>
          {copy.badge}
        </div>
        <div className="h1">{copy.title}</div>
        <p className="muted" style={{ marginTop: 10, maxWidth: 920, lineHeight: 1.7 }}>
          {copy.body}
        </p>
      </div>

      <div className="grid two" style={{ alignItems: 'start' }}>
        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">{copy.filtersTitle}</div>
          <p className="card-section-subtitle" style={{ marginTop: 8 }}>{copy.filtersBody}</p>

          <div className="grid two" style={{ marginTop: 14 }}>
            <div>
              <div className="muted" style={{ marginBottom: 6 }}>{copy.county}</div>
              <select className="input" value={filters.county} onChange={(e) => setField('county', e.target.value)}>
                {COUNTY_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="muted" style={{ marginBottom: 6 }}>{copy.city}</div>
              <input
                className="input"
                value={filters.city}
                onChange={(e) => setField('city', e.target.value)}
                placeholder={CITY_OPTIONS.join(', ')}
              />
            </div>
            <div>
              <div className="muted" style={{ marginBottom: 6 }}>{copy.distressType}</div>
              <select className="input" value={filters.distressType} onChange={(e) => setField('distressType', e.target.value)}>
                <option value="all">{copy.all}</option>
                <option value="preforeclosure">{copy.preforeclosure}</option>
                <option value="tax_delinquent">{copy.taxDelinquent}</option>
                <option value="code_violation">{copy.codeViolation}</option>
                <option value="probate">{copy.probate}</option>
                <option value="inherited">{copy.inherited}</option>
              </select>
            </div>
            <div>
              <div className="muted" style={{ marginBottom: 6 }}>{copy.propertyType}</div>
              <select className="input" value={filters.propertyType} onChange={(e) => setField('propertyType', e.target.value)}>
                <option value="all">{copy.all}</option>
                <option value="single_family">{copy.singleFamily}</option>
                <option value="townhome">{copy.townhome}</option>
                <option value="small_multifamily">{copy.smallMultifamily}</option>
              </select>
            </div>
            <div>
              <div className="muted" style={{ marginBottom: 6 }}>{copy.occupancy}</div>
              <select className="input" value={filters.occupancy} onChange={(e) => setField('occupancy', e.target.value)}>
                <option value="any">{copy.any}</option>
                <option value="owner_occupied">{copy.ownerOccupied}</option>
                <option value="vacant">{copy.vacant}</option>
              </select>
            </div>
            <div>
              <div className="muted" style={{ marginBottom: 6 }}>{copy.dealCount}</div>
              <select className="input" value={filters.dealCount} onChange={(e) => setField('dealCount', e.target.value)}>
                {DEAL_COUNT_OPTIONS.map((count) => (
                  <option key={count} value={String(count)}>{count}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="muted" style={{ marginBottom: 6 }}>{copy.sortBy}</div>
              <select className="input" value={filters.sortBy} onChange={(e) => setField('sortBy', e.target.value)}>
                <option value="score">{copy.byScore}</option>
                <option value="profit">{copy.byProfit}</option>
                <option value="margin">{copy.byMargin}</option>
                <option value="rehab">{copy.byLowestRehab}</option>
              </select>
            </div>
            <div>
              <div className="muted" style={{ marginBottom: 6 }}>{copy.arvMode}</div>
              <select className="input" value={filters.arvMode} onChange={(e) => setField('arvMode', e.target.value)}>
                <option value="conservative">{copy.conservative}</option>
                <option value="balanced">{copy.balanced}</option>
                <option value="aggressive">{copy.aggressive}</option>
              </select>
            </div>
            <div>
              <div className="muted" style={{ marginBottom: 6 }}>{copy.riskTolerance}</div>
              <select className="input" value={filters.riskTolerance} onChange={(e) => setField('riskTolerance', e.target.value)}>
                <option value="low">{copy.low}</option>
                <option value="medium">{copy.medium}</option>
                <option value="high">{copy.high}</option>
              </select>
            </div>
            <div>
              <div className="muted" style={{ marginBottom: 6 }}>{copy.targetMargin}</div>
              <input className="input" type="number" value={filters.targetMargin} onChange={(e) => setField('targetMargin', e.target.value)} />
            </div>
            <div>
              <div className="muted" style={{ marginBottom: 6 }}>{copy.targetProfit}</div>
              <input className="input" type="number" value={filters.targetProfit} onChange={(e) => setField('targetProfit', e.target.value)} />
            </div>
            <div>
              <div className="muted" style={{ marginBottom: 6 }}>{copy.maxRehab}</div>
              <input className="input" type="number" value={filters.maxRehab} onChange={(e) => setField('maxRehab', e.target.value)} />
            </div>
          </div>

          <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn primary" type="button" onClick={handleGenerate} disabled={busy}>
              {busy ? copy.generating : copy.generate}
            </button>
          </div>
        </div>

        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">{copy.opportunitySummary}</div>
          <div className="grid two" style={{ marginTop: 14 }}>
            <div className="card-soft" style={{ background: '#ffffff' }}>
              <div className="muted">{copy.totalResults}</div>
              <div style={{ marginTop: 8, fontSize: 28, fontWeight: 900 }}>{metrics.total}</div>
            </div>
            <div className="card-soft" style={{ background: '#ffffff' }}>
              <div className="muted">{copy.avgProfit}</div>
              <div style={{ marginTop: 8, fontSize: 28, fontWeight: 900 }}>{currency(metrics.avgProfit)}</div>
            </div>
            <div className="card-soft" style={{ background: '#ffffff' }}>
              <div className="muted">{copy.bestDeal}</div>
              <div style={{ marginTop: 8, fontSize: 28, fontWeight: 900 }}>{currency(metrics.bestDeal)}</div>
            </div>
            <div className="card-soft" style={{ background: '#ffffff' }}>
              <div className="muted">{copy.avgMargin}</div>
              <div style={{ marginTop: 8, fontSize: 28, fontWeight: 900 }}>{pct(metrics.avgMargin)}</div>
            </div>
            <div className="card-soft" style={{ background: '#ffffff' }}>
              <div className="muted">{copy.savedDeals}</div>
              <div style={{ marginTop: 8, fontSize: 28, fontWeight: 900 }}>{savedDeals.length}</div>
            </div>
          </div>

          <div className="card-soft" style={{ marginTop: 14, background: '#ffffff' }}>
            <div className="muted" style={{ lineHeight: 1.7 }}>{copy.dataGenerated}</div>
          </div>
        </div>
      </div>

      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="card-section-title">{copy.savedSection}</div>
        <p className="card-section-subtitle" style={{ marginTop: 8 }}>{copy.saveHint}</p>

        {!savedDeals.length ? (
          <div className="card-soft" style={{ marginTop: 14 }}>{copy.propertyQueueEmpty}</div>
        ) : (
          <div className="list" style={{ marginTop: 14 }}>
            {savedDeals.map((deal) => (
              <div key={`saved-${deal.id}`} className="card-soft" style={{ background: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontWeight: 900 }}>{deal.address}</div>
                    <div className="muted" style={{ marginTop: 6 }}>
                      {copy.netProfit}: {currency(deal.netProfit)} · {copy.marginPct}: {pct(deal.marginPctValue)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span className="badge">{copy.score}: {deal.score}</span>
                    {shortlistIds.includes(deal.id) ? <span className="badge">{copy.shortlist}</span> : null}
                    {queuedIds.includes(deal.id) ? <span className="badge">{copy.queued}</span> : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="card-section-title">{copy.rankedResults}</div>
        <p className="card-section-subtitle" style={{ marginTop: 8 }}>{copy.resultsBody}</p>

        {!results.length ? (
          <div className="card-soft" style={{ marginTop: 14 }}>{copy.noResults}</div>
        ) : (
          <div className="list" style={{ marginTop: 14 }}>
            {results.map((deal) => {
              const expanded = expandedId === deal.id
              const isSaved = savedIds.includes(deal.id)
              const isShortlisted = shortlistIds.includes(deal.id)
              const isQueued = queuedIds.includes(deal.id)

              return (
                <div key={deal.id} className="card-soft" style={{ background: '#ffffff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 420px' }}>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span className="badge" style={scoreTone(deal.score)}>{copy.score}: {deal.score}</span>
                        <span className="badge">{copy.executionFit}: {deal.executionFit}</span>
                        <span className="badge">{copy.confidence}: {deal.confidence}</span>
                        <span className="badge" style={difficultyTone(deal.difficulty)}>{copy.difficulty}: {deal.difficulty}</span>
                        <span className="badge" style={targetGapTone(deal.targetGap)}>
                          {copy.targetGap}: {deal.targetGap >= 0 ? copy.exceedsTarget : copy.belowTarget} {currency(Math.abs(deal.targetGap))}
                        </span>
                      </div>

                      <div style={{ marginTop: 12, fontSize: 18, fontWeight: 900 }}>{deal.address}</div>
                      <div className="muted" style={{ marginTop: 8, lineHeight: 1.7 }}>
                        {deal.beds} bd · {deal.baths} ba · {deal.sqft.toLocaleString()} SF · {titleCase(deal.propertyType)}
                      </div>

                      <div className="grid two" style={{ marginTop: 14 }}>
                        <div><strong>{copy.source}:</strong> {deal.source}</div>
                        <div><strong>{copy.distress}:</strong> {titleCase(deal.distressType)}</div>
                        <div><strong>{copy.buyPrice}:</strong> {currency(deal.buyTarget)}</div>
                        <div><strong>{copy.rehab}:</strong> {currency(deal.rehab)}</div>
                        <div><strong>{copy.arv}:</strong> {currency(deal.arv)}</div>
                        <div><strong>{copy.netProfit}:</strong> {currency(deal.netProfit)}</div>
                        <div><strong>{copy.marginPct}:</strong> {pct(deal.marginPctValue)}</div>
                        <div><strong>{copy.recommendedAction}:</strong> {deal.recommendedAction}</div>
                        <div><strong>{copy.maxOffer}:</strong> {currency(deal.maxAllowableOffer)}</div>
                        <div><strong>{copy.closeWindow}:</strong> {deal.closeWindow}</div>
                      </div>
                    </div>

                    <div style={{ minWidth: 240, flex: '0 1 280px' }}>
                      <div className="card" style={{ padding: 16, background: '#f8f7ef', borderRadius: 18 }}>
                        <div className="muted">{copy.profitBand}</div>
                        <div style={{ marginTop: 8, fontWeight: 900, lineHeight: 1.6 }}>{deal.profitBand}</div>
                        <div className="muted" style={{ marginTop: 10, lineHeight: 1.7 }}>{deal.notes}</div>
                        <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button type="button" className="btn small" onClick={() => toggleSaved(deal.id)}>
                            {isSaved ? copy.removeSaved : copy.saveDeal}
                          </button>
                          <button type="button" className="btn small" onClick={() => toggleShortlist(deal.id)}>
                            {isShortlisted ? copy.removeShortlist : copy.shortlist}
                          </button>
                          <button type="button" className="btn small" onClick={() => toggleQueued(deal.id)}>
                            {isQueued ? copy.queued : copy.queueDeal}
                          </button>
                        </div>
                        <button
                          type="button"
                          className="btn small"
                          style={{ marginTop: 14 }}
                          onClick={() => setExpandedId(expanded ? '' : deal.id)}
                        >
                          {expanded ? copy.hideDetails : copy.openDetails}
                        </button>
                      </div>
                    </div>
                  </div>

                  {expanded ? (
                    <div className="grid two" style={{ marginTop: 16, alignItems: 'start' }}>
                      <div className="card" style={{ padding: 18, borderRadius: 18 }}>
                        <div className="card-section-title">{copy.sourceSection}</div>
                        <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                          <div><strong>{copy.source}:</strong> {deal.source}</div>
                          <div><strong>{copy.ownerName}:</strong> {ownerNameDisplay(deal.ownerName)}</div>
                          <div><strong>{copy.filingDate}:</strong> {deal.filingDate}</div>
                          <div><strong>{copy.auctionDate}:</strong> {deal.auctionDate}</div>
                          <div><strong>{copy.lienAmount}:</strong> {currency(deal.lienAmount)}</div>
                          <div><strong>{copy.occupancySignal}:</strong> {titleCase(deal.occupancy)}</div>
                        </div>
                      </div>

                      <div className="card" style={{ padding: 18, borderRadius: 18 }}>
                        <div className="card-section-title">{copy.scoringSection}</div>
                        <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                          <div><strong>{copy.score}:</strong> {deal.score}</div>
                          <div><strong>{copy.executionFit}:</strong> {deal.executionFit}</div>
                          <div><strong>{copy.confidence}:</strong> {deal.confidence}</div>
                          <div><strong>{copy.difficulty}:</strong> {deal.difficulty}</div>
                          <div><strong>{copy.titleRisk}:</strong> {deal.titleRisk}/100</div>
                          <div><strong>{copy.financingFit}:</strong> {deal.financingFit}/100</div>
                          <div><strong>{copy.resaleConfidence}:</strong> {deal.resaleConfidence}/100</div>
                          <div><strong>{copy.compConfidence}:</strong> {deal.compConfidence}/100</div>
                        </div>
                      </div>

                      <div className="card" style={{ padding: 18, borderRadius: 18 }}>
                        <div className="card-section-title">{copy.engineSection}</div>
                        <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                          <div><strong>{copy.buyPrice}:</strong> {currency(deal.buyTarget)}</div>
                          <div><strong>{copy.maxOffer}:</strong> {currency(deal.maxAllowableOffer)}</div>
                          <div><strong>{copy.rehab}:</strong> {currency(deal.rehab)}</div>
                          <div><strong>{copy.holdCost}:</strong> {currency(deal.holdingCosts)}</div>
                          <div><strong>{copy.sellCost}:</strong> {currency(deal.sellingCosts)}</div>
                          <div><strong>{copy.contingency}:</strong> {currency(deal.contingency)}</div>
                          <div><strong>{copy.contractorMargin}:</strong> {currency(deal.contractorMargin)}</div>
                          <div><strong>{copy.arv}:</strong> {currency(deal.arv)}</div>
                          <div><strong>{copy.netProfit}:</strong> {currency(deal.netProfit)}</div>
                          <div><strong>{copy.marginPct}:</strong> {pct(deal.marginPctValue)}</div>
                          <div><strong>{copy.rehabScope}:</strong> {titleCase(deal.rehabLevel)}</div>
                          <div><strong>{copy.timeline}:</strong> {deal.closeWindow}</div>
                          <div><strong>{copy.monthsHeld}:</strong> {deal.monthsHeld}</div>
                        </div>
                      </div>

                      <div className="card" style={{ padding: 18, borderRadius: 18 }}>
                        <div className="card-section-title">{copy.complianceSection}</div>
                        <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                          <div><strong>{copy.doNotCall}:</strong> {deal.doNotCall ? 'Yes' : 'No'}</div>
                          <div><strong>{copy.callStatus}:</strong> {deal.callStatus}</div>
                          <div><strong>{copy.outreachReady}:</strong> {deal.outreachReady && !deal.doNotCall ? 'Yes' : 'Review Needed'}</div>
                          <div><strong>{copy.recommendedAction}:</strong> {deal.recommendedAction}</div>
                          <div><strong>{copy.underwritingQueue}:</strong> {isQueued ? copy.queued : copy.notStarted}</div>
                        </div>
                      </div>

                      <div className="card" style={{ padding: 18, borderRadius: 18 }}>
                        <div className="card-section-title">{copy.rehabBreakdown}</div>
                        <div className="muted" style={{ marginTop: 8 }}>{copy.rehabPerSqft}: {currency(deal.rehabBreakdown.rehabPerSqft)}</div>
                        <ul style={{ margin: '10px 0 0 18px', padding: 0, lineHeight: 1.8 }}>
                          {deal.rehabBreakdown.parts.map((item) => (
                            <li key={`${deal.id}-rehab-${item.id}`}>{item.label}: {currency(item.amount)}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="card" style={{ padding: 18, borderRadius: 18 }}>
                        <div className="card-section-title">{copy.scenarioModel}</div>
                        <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
                          {deal.scenarios.map((scenario) => (
                            <div key={`${deal.id}-${scenario.label}`} className="card-soft" style={{ background: '#ffffff' }}>
                              <div style={{ fontWeight: 900 }}>
                                {scenario.label === 'downside' ? copy.downside : scenario.label === 'upside' ? copy.upside : copy.baseCase}
                              </div>
                              <div className="muted" style={{ marginTop: 6, lineHeight: 1.7 }}>
                                {copy.arv}: {currency(scenario.arv)} · {copy.rehab}: {currency(scenario.rehab)} · {copy.holdCost}: {currency(scenario.hold)} · {copy.netProfit}: {currency(scenario.netProfit)} · {copy.marginPct}: {pct(scenario.margin)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="card" style={{ padding: 18, borderRadius: 18 }}>
                        <div className="card-section-title">{copy.compsSummary}</div>
                        <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                          <div><strong>{copy.arvLow}:</strong> {currency(deal.arvBand.low)}</div>
                          <div><strong>{copy.arv}:</strong> {currency(deal.arvBand.base)}</div>
                          <div><strong>{copy.arvHigh}:</strong> {currency(deal.arvBand.high)}</div>
                          <div><strong>{copy.compConfidence}:</strong> {deal.compConfidence}/100</div>
                          <div><strong>{copy.targetWindow}:</strong> {currency(Math.max(deal.maxAllowableOffer - 12000, 0))} - {currency(deal.maxAllowableOffer)}</div>
                        </div>
                      </div>

                      <div className="card" style={{ padding: 18, borderRadius: 18 }}>
                        <div className="card-section-title">{copy.crewNeeded}</div>
                        <ul style={{ margin: '10px 0 0 18px', padding: 0, lineHeight: 1.8 }}>
                          {deal.crewNeeded.map((item) => (
                            <li key={`${deal.id}-crew-${item}`}>{item}</li>
                          ))}
                        </ul>
                        <div style={{ marginTop: 12 }}><strong>{copy.executionLane}:</strong> {titleCase(deal.rehabLevel)}</div>
                      </div>

                      <div className="card" style={{ padding: 18, borderRadius: 18 }}>
                        <div className="card-section-title">{copy.suppliers}</div>
                        <ul style={{ margin: '10px 0 0 18px', padding: 0, lineHeight: 1.8 }}>
                          {deal.supplierList.map((item) => (
                            <li key={`${deal.id}-supplier-${item}`}>{item}</li>
                          ))}
                        </ul>
                        <div style={{ marginTop: 12 }}>
                          <strong>{copy.deliveryPlan}:</strong>
                          <div className="muted" style={{ marginTop: 6, lineHeight: 1.7 }}>{deal.deliveryPlan}</div>
                        </div>
                      </div>

                      <div className="card" style={{ padding: 18, borderRadius: 18 }}>
                        <div className="card-section-title">{copy.outreachPlan}</div>
                        <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                          <div><strong>{copy.outreachScript}:</strong></div>
                          <div className="muted" style={{ lineHeight: 1.7 }}>{deal.outreachScript}</div>
                          <div><strong>{copy.underwritingNotes}:</strong></div>
                          <ul style={{ margin: '0 0 0 18px', padding: 0, lineHeight: 1.8 }}>
                            {deal.underwritingNotes.length ? deal.underwritingNotes.map((item) => (
                              <li key={`${deal.id}-note-${item}`}>{item}</li>
                            )) : <li>{copy.exportReady}</li>}
                          </ul>
                        </div>
                      </div>
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
