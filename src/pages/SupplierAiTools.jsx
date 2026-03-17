import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

const COPY = {
  en: {
    heroBadge: 'Surplox AI Tools',
    heroTitle: 'AI tools built around real jobsite operations.',
    heroBody:
      'This is the home for Surplox AI tools. We are starting with Supplier Suggestions so jobsites can quickly find nearby supply options based on material need, ZIP, storefront presence, and delivery coverage.',
    supplierCardBadge: 'Live now',
    supplierCardTitle: 'Supplier Suggestions AI',
    supplierCardBody:
      'Get ranked supplier suggestions using the supplier data already inside Surplox. This is the first step toward a bigger AI Blueprint that will eventually connect projects, crews, suppliers, and delivery support.',
    supplierCardPoint1: 'Match by material category',
    supplierCardPoint2: 'Prioritize nearby ZIPs',
    supplierCardPoint3: 'Favor storefront and delivery-ready suppliers',
    supplierCardPoint4: 'Create a cleaner shortlist for outreach',
    upcomingTitle: 'Upcoming AI tools',
    upcomingBody:
      'Project Analyzer, Crew Matching, and Delivery Coordination can live here next as the Surplox network grows.',
    builderTitle: 'Supplier Suggestions AI',
    builderBody:
      'Start with a material need and jobsite ZIP. Surplox will rank supplier storefronts already in the network and return the strongest nearby supply options first.',
    materialLabel: 'Material need',
    allMaterials: 'All materials',
    zipLabel: 'Jobsite ZIP',
    zipPlaceholder: '76102',
    queryLabel: 'Keyword',
    queryPlaceholder: 'Concrete, lumber, rebar, tools, supplier name...',
    storefrontOnly: 'Storefront only',
    deliveryReadyOnly: 'Delivery-ready only',
    runSuggestions: 'Run Supplier Suggestions',
    rerunSuggestions: 'Refresh Suggestions',
    clear: 'Clear',
    loading: 'Loading supplier suggestions…',
    emptyTitle: 'No supplier suggestions yet.',
    emptyBody:
      'Choose a material or enter a jobsite ZIP to generate supplier suggestions from the supplier storefront data already inside Surplox.',
    noMatchesTitle: 'No suppliers matched this request.',
    noMatchesBody: 'Try removing one filter, changing the ZIP, or broadening the material need.',
    resultsTitle: 'Suggested suppliers',
    resultReason: 'Why this supplier ranked well',
    resultReasonMaterial: 'Material match',
    resultReasonZip: 'ZIP match',
    resultReasonStorefront: 'Storefront-ready',
    resultReasonDelivery: 'Delivery coverage',
    supplier: 'Supplier',
    zip: 'ZIP',
    materials: 'Materials',
    deliveryRadius: 'Delivery Radius',
    storefront: 'Storefront',
    storefrontYes: 'Yes',
    storefrontNo: 'No',
    about: 'About',
    noBio: 'No supplier bio added yet.',
    openStorefront: 'Open Storefront',
    openProfile: 'Open Profile',
    miles: 'mi',
    aiScore: 'AI Score',
    noMaterials: 'No material categories listed yet.',
    toolHubTitle: 'Tool hub',
    toolHubBody:
      'Surplox AI Tools will become the command center for future project-based workflows. For now, Supplier Suggestions is the first tool going live inside this hub.'
  },
  es: {
    heroBadge: 'Herramientas AI de Surplox',
    heroTitle: 'Herramientas AI construidas alrededor de operaciones reales de obra.',
    heroBody:
      'Este es el hogar de las herramientas AI de Surplox. Empezamos con Sugerencias de Proveedores para que las obras encuentren opciones cercanas según material, ZIP, tienda física y cobertura de entrega.',
    supplierCardBadge: 'Disponible ahora',
    supplierCardTitle: 'AI de Sugerencias de Proveedores',
    supplierCardBody:
      'Obtén sugerencias clasificadas usando los datos de proveedores que ya existen dentro de Surplox. Este es el primer paso hacia un AI Blueprint más grande que luego conectará proyectos, cuadrillas, proveedores y soporte de entrega.',
    supplierCardPoint1: 'Coincidencia por categoría de material',
    supplierCardPoint2: 'Prioridad a ZIP cercanos',
    supplierCardPoint3: 'Favorece proveedores con tienda y entrega',
    supplierCardPoint4: 'Crea una lista más limpia para contacto',
    upcomingTitle: 'Próximas herramientas AI',
    upcomingBody:
      'Project Analyzer, Crew Matching y Delivery Coordination pueden vivir aquí después conforme crece la red de Surplox.',
    builderTitle: 'AI de Sugerencias de Proveedores',
    builderBody:
      'Empieza con una necesidad de material y el ZIP de la obra. Surplox clasificará las tiendas proveedoras ya dentro de la red y devolverá primero las opciones más fuertes.',
    materialLabel: 'Material necesario',
    allMaterials: 'Todos los materiales',
    zipLabel: 'ZIP de la obra',
    zipPlaceholder: '76102',
    queryLabel: 'Palabra clave',
    queryPlaceholder: 'Concreto, madera, varilla, herramientas, nombre del proveedor...',
    storefrontOnly: 'Solo tienda física',
    deliveryReadyOnly: 'Solo con entrega',
    runSuggestions: 'Generar sugerencias',
    rerunSuggestions: 'Actualizar sugerencias',
    clear: 'Limpiar',
    loading: 'Cargando sugerencias de proveedores…',
    emptyTitle: 'Todavía no hay sugerencias.',
    emptyBody:
      'Elige un material o ingresa un ZIP de obra para generar sugerencias desde los datos de tiendas proveedoras que ya existen dentro de Surplox.',
    noMatchesTitle: 'No hubo coincidencias para esta solicitud.',
    noMatchesBody: 'Prueba quitando un filtro, cambiando el ZIP o ampliando la necesidad de material.',
    resultsTitle: 'Proveedores sugeridos',
    resultReason: 'Por qué este proveedor clasificó bien',
    resultReasonMaterial: 'Coincidencia de material',
    resultReasonZip: 'Coincidencia de ZIP',
    resultReasonStorefront: 'Listo para tienda',
    resultReasonDelivery: 'Cobertura de entrega',
    supplier: 'Proveedor',
    zip: 'ZIP',
    materials: 'Materiales',
    deliveryRadius: 'Radio de entrega',
    storefront: 'Tienda',
    storefrontYes: 'Sí',
    storefrontNo: 'No',
    about: 'Acerca de',
    noBio: 'Todavía no hay biografía del proveedor.',
    openStorefront: 'Abrir tienda',
    openProfile: 'Abrir perfil',
    miles: 'mi',
    aiScore: 'Puntaje AI',
    noMaterials: 'Todavía no hay categorías de materiales.',
    toolHubTitle: 'Centro de herramientas',
    toolHubBody:
      'Surplox AI Tools se convertirá en el centro de mando para futuros flujos basados en proyectos. Por ahora, Sugerencias de Proveedores es la primera herramienta en vivo dentro de este centro.'
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

function normalizeMaterials(list) {
  if (!Array.isArray(list)) return []
  return list.map((item) => String(item || '').trim()).filter(Boolean)
}

function normalizeMaterialLabel(value) {
  const v = String(value || '').trim()
  if (!v) return ''
  return v.replace(/_/g, ' ').replace(/\s+/g, ' ').trim()
}

function scoreSupplier(supplier, query, material, zipFilter, storefrontOnly, deliveryReadyOnly) {
  let score = 0

  const haystack = [
    supplier.business_name,
    supplier.display_name,
    supplier.business_zip,
    supplier.bio,
    ...supplier.materials_categories
  ]
    .join(' ')
    .toLowerCase()

  if (query.trim()) {
    const terms = query
      .toLowerCase()
      .split(/\s+/)
      .map((term) => term.trim())
      .filter(Boolean)

    terms.forEach((term) => {
      if (haystack.includes(term)) score += 5
      if (supplier.materials_categories.some((item) => item.toLowerCase().includes(term))) score += 10
      if (String(supplier.business_name || '').toLowerCase().includes(term)) score += 9
      if (String(supplier.display_name || '').toLowerCase().includes(term)) score += 7
      if (String(supplier.business_zip || '').toLowerCase() === term) score += 8
    })
  }

  if (material) {
    if (supplier.materials_categories.some((item) => item.toLowerCase() === material.toLowerCase())) {
      score += 22
    }
  }

  if (zipFilter && String(supplier.business_zip || '').trim() === zipFilter.trim()) {
    score += 12
  }

  if (storefrontOnly && supplier.storefront) {
    score += 8
  }

  if (deliveryReadyOnly && Number(supplier.delivery_radius || 0) > 0) {
    score += 8
  }

  score += Math.min(Number(supplier.delivery_radius || 0), 150) / 8

  return Math.round(score)
}

function suggestionReasons(supplier, material, zipFilter) {
  const reasons = []

  if (
    material &&
    supplier.materials_categories.some((item) => item.toLowerCase() === material.toLowerCase())
  ) {
    reasons.push('material')
  }

  if (zipFilter && String(supplier.business_zip || '').trim() === zipFilter.trim()) {
    reasons.push('zip')
  }

  if (supplier.storefront) {
    reasons.push('storefront')
  }

  if (Number(supplier.delivery_radius || 0) > 0) {
    reasons.push('delivery')
  }

  return reasons
}

function InfoTile({ value }) {
  return (
    <div className="card-soft" style={{ minHeight: 92 }}>
      <div style={{ fontWeight: 800, fontSize: 16, lineHeight: 1.35 }}>{value}</div>
    </div>
  )
}

export default function SupplierAiTools({ lang = 'en' }) {
  const copy = COPY[lang] || COPY.en
  const [loading, setLoading] = useState(true)
  const [ranTool, setRanTool] = useState(false)
  const [suppliers, setSuppliers] = useState([])
  const [error, setError] = useState('')

  const [query, setQuery] = useState('')
  const [jobZip, setJobZip] = useState('')
  const [material, setMaterial] = useState('')
  const [storefrontOnly, setStorefrontOnly] = useState(true)
  const [deliveryReadyOnly, setDeliveryReadyOnly] = useState(false)

  useEffect(() => {
    let active = true

    async function loadSuppliers() {
      setLoading(true)
      setError('')

      try {
        const { data, error: supplierError } = await supabase
          .from('profiles')
          .select(`
            user_id,
            display_name,
            business_name,
            business_zip,
            delivery_radius,
            materials_categories,
            storefront,
            bio,
            role
          `)
          .eq('role', 'supplier')
          .order('business_name', { ascending: true })

        if (supplierError) throw supplierError
        if (!active) return

        setSuppliers(
          (data || []).map((item) => ({
            ...item,
            materials_categories: normalizeMaterials(item.materials_categories).map(normalizeMaterialLabel)
          }))
        )
      } catch (err) {
        console.error(err)
        if (!active) return
        setError('Unable to load suppliers.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadSuppliers()

    return () => {
      active = false
    }
  }, [])

  const materialOptions = useMemo(() => {
    const set = new Set(DEFAULT_MATERIALS.map(normalizeMaterialLabel))

    suppliers.forEach((supplier) => {
      supplier.materials_categories.forEach((item) => {
        if (item) set.add(item)
      })
    })

    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [suppliers])

  const suggestions = useMemo(() => {
    let next = [...suppliers]

    if (query.trim()) {
      const q = query.trim().toLowerCase()
      next = next.filter((supplier) => {
        const haystack = [
          supplier.business_name,
          supplier.display_name,
          supplier.business_zip,
          supplier.bio,
          ...supplier.materials_categories
        ]
          .join(' ')
          .toLowerCase()

        return haystack.includes(q)
      })
    }

    if (jobZip.trim()) {
      next = next.filter((supplier) => String(supplier.business_zip || '').trim() === jobZip.trim())
    }

    if (material) {
      next = next.filter((supplier) =>
        supplier.materials_categories.some((item) => item.toLowerCase() === material.toLowerCase())
      )
    }

    if (storefrontOnly) {
      next = next.filter((supplier) => supplier.storefront)
    }

    if (deliveryReadyOnly) {
      next = next.filter((supplier) => Number(supplier.delivery_radius || 0) > 0)
    }

    next = next
      .map((supplier) => ({
        ...supplier,
        ai_score: scoreSupplier(supplier, query, material, jobZip, storefrontOnly, deliveryReadyOnly),
        ai_reasons: suggestionReasons(supplier, material, jobZip)
      }))
      .sort((a, b) => b.ai_score - a.ai_score)

    return next
  }, [suppliers, query, jobZip, material, storefrontOnly, deliveryReadyOnly])

  function runTool() {
    setRanTool(true)
  }

  function clearTool() {
    setQuery('')
    setJobZip('')
    setMaterial('')
    setStorefrontOnly(true)
    setDeliveryReadyOnly(false)
    setRanTool(false)
  }

  const visibleSuggestions = ranTool ? suggestions : []

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div
        className="card rounded-xl"
        style={{
          padding: 28,
          background: 'linear-gradient(180deg, #efe7ff 0%, #f7f7f2 100%)'
        }}
      >
        <div className="badge" style={{ marginBottom: 14, background: '#e8defa', color: '#4d2f82' }}>
          {copy.heroBadge}
        </div>

        <div className="h1" style={{ maxWidth: 820 }}>{copy.heroTitle}</div>

        <p className="muted" style={{ marginTop: 12, maxWidth: 920, fontSize: 17, lineHeight: 1.7 }}>
          {copy.heroBody}
        </p>

        <div className="grid three" style={{ marginTop: 18 }}>
          <InfoTile value={copy.supplierCardPoint1} />
          <InfoTile value={copy.supplierCardPoint2} />
          <InfoTile value={copy.supplierCardPoint3} />
        </div>
      </div>

      <div className="grid two" style={{ gap: 18 }}>
        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="badge" style={{ marginBottom: 12, background: '#f1e7a8' }}>
            {copy.supplierCardBadge}
          </div>
          <div className="card-section-title">{copy.supplierCardTitle}</div>
          <p className="card-section-subtitle" style={{ marginTop: 8 }}>
            {copy.supplierCardBody}
          </p>
        </div>

        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">{copy.toolHubTitle}</div>
          <p className="card-section-subtitle" style={{ marginTop: 8 }}>
            {copy.toolHubBody}
          </p>
          <div className="card-soft" style={{ marginTop: 14, background: '#ffffff' }}>
            <div style={{ fontWeight: 900 }}>{copy.upcomingTitle}</div>
            <p className="muted" style={{ marginTop: 8, lineHeight: 1.7 }}>{copy.upcomingBody}</p>
          </div>
        </div>
      </div>

      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="card-section-title">{copy.builderTitle}</div>
        <p className="card-section-subtitle" style={{ marginTop: 8 }}>{copy.builderBody}</p>

        {loading ? <div className="card-soft" style={{ marginTop: 16 }}>{copy.loading}</div> : null}
        {error ? <div className="card-soft" style={{ marginTop: 16 }}>{error}</div> : null}

        {!loading ? (
          <div className="grid" style={{ gap: 14, marginTop: 16 }}>
            <div className="grid two" style={{ gap: 14 }}>
              <div>
                <div className="muted" style={{ marginBottom: 8 }}>{copy.materialLabel}</div>
                <select className="input" value={material} onChange={(e) => setMaterial(e.target.value)}>
                  <option value="">{copy.allMaterials}</option>
                  {materialOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="muted" style={{ marginBottom: 8 }}>{copy.zipLabel}</div>
                <input
                  className="input"
                  value={jobZip}
                  onChange={(e) => setJobZip(e.target.value.replace(/[^\d]/g, '').slice(0, 5))}
                  placeholder={copy.zipPlaceholder}
                />
              </div>
            </div>

            <div>
              <div className="muted" style={{ marginBottom: 8 }}>{copy.queryLabel}</div>
              <input
                className="input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={copy.queryPlaceholder}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                className={storefrontOnly ? 'btn primary small' : 'btn small'}
                onClick={() => setStorefrontOnly((prev) => !prev)}
              >
                {copy.storefrontOnly}
              </button>

              <button
                type="button"
                className={deliveryReadyOnly ? 'btn primary small' : 'btn small'}
                onClick={() => setDeliveryReadyOnly((prev) => !prev)}
              >
                {copy.deliveryReadyOnly}
              </button>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button type="button" className="btn primary" onClick={runTool}>
                {ranTool ? copy.rerunSuggestions : copy.runSuggestions}
              </button>
              <button type="button" className="btn" onClick={clearTool}>
                {copy.clear}
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {!loading && ranTool && visibleSuggestions.length === 0 ? (
        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">{suppliers.length === 0 ? copy.emptyTitle : copy.noMatchesTitle}</div>
          <p className="card-section-subtitle" style={{ marginTop: 8 }}>
            {suppliers.length === 0 ? copy.emptyBody : copy.noMatchesBody}
          </p>
        </div>
      ) : null}

      {!loading && visibleSuggestions.length > 0 ? (
        <div className="grid" style={{ gap: 16 }}>
          <div className="card rounded-xl" style={{ padding: 22 }}>
            <div className="card-section-title">{copy.resultsTitle}</div>
          </div>

          {visibleSuggestions.map((supplier) => {
            const displayName = supplier.business_name || supplier.display_name || copy.supplier
            return (
              <div key={supplier.user_id} className="card rounded-xl" style={{ padding: 22 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    flexWrap: 'wrap',
                    alignItems: 'flex-start'
                  }}
                >
                  <div>
                    <div className="h2" style={{ fontSize: 24 }}>{displayName}</div>
                    <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span className="badge" style={{ background: '#e8defa', color: '#4d2f82' }}>
                        {copy.aiScore}: {supplier.ai_score}
                      </span>
                      <span className="badge">
                        {copy.zip}: {supplier.business_zip || '—'}
                      </span>
                      <span className="badge">
                        {copy.storefront}: {supplier.storefront ? copy.storefrontYes : copy.storefrontNo}
                      </span>
                      <span className="badge">
                        {copy.deliveryRadius}: {Number(supplier.delivery_radius || 0) > 0 ? `${supplier.delivery_radius} ${copy.miles}` : '—'}
                      </span>
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

                <div className="grid two" style={{ gap: 14, marginTop: 16 }}>
                  <div className="card-soft" style={{ background: '#f8f7ef' }}>
                    <div className="card-section-title" style={{ fontSize: 15 }}>{copy.resultReason}</div>
                    <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {supplier.ai_reasons.includes('material') ? <span className="badge">{copy.resultReasonMaterial}</span> : null}
                      {supplier.ai_reasons.includes('zip') ? <span className="badge">{copy.resultReasonZip}</span> : null}
                      {supplier.ai_reasons.includes('storefront') ? <span className="badge">{copy.resultReasonStorefront}</span> : null}
                      {supplier.ai_reasons.includes('delivery') ? <span className="badge">{copy.resultReasonDelivery}</span> : null}
                    </div>
                  </div>

                  <div className="card-soft" style={{ background: '#fffaf0' }}>
                    <div className="card-section-title" style={{ fontSize: 15 }}>{copy.materials}</div>
                    <div className="muted" style={{ marginTop: 8 }}>
                      {supplier.materials_categories.length > 0
                        ? supplier.materials_categories.join(', ')
                        : copy.noMaterials}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 16 }}>
                  <div className="muted">{copy.about}</div>
                  <p style={{ marginTop: 8, lineHeight: 1.7 }}>{supplier.bio || copy.noBio}</p>
                </div>
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
