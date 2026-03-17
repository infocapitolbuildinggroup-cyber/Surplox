import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

const COPY = {
  en: {
    badge: 'Materials Search',
    title: 'Search suppliers by material.',
    body:
      'Use the materials tab to find suppliers by material category, supplier name, ZIP, storefront status, and delivery radius.',
    searchLabel: 'Search bar',
    searchPlaceholder: 'Search concrete, lumber, drywall, supplier name, ZIP...',
    zipLabel: 'ZIP',
    zipPlaceholder: 'Filter by ZIP',
    materialLabel: 'Material',
    allMaterials: 'All materials',
    storefrontOnly: 'Storefront only',
    sortLabel: 'Sort by',
    sortBest: 'Best match',
    sortRadius: 'Largest delivery radius',
    sortName: 'Supplier name',
    resultsLabel: 'results',
    clear: 'Clear filters',
    loading: 'Loading suppliers…',
    error: 'Unable to load suppliers.',
    emptyTitle: 'No suppliers found.',
    emptyBody: 'Try a broader search or clear one of the filters.',
    supplier: 'Supplier',
    zip: 'ZIP',
    deliveryRadius: 'Delivery Radius',
    miles: 'mi',
    storefrontYes: 'Storefront',
    storefrontNo: 'No storefront flag',
    materials: 'Materials',
    noMaterials: 'No materials listed yet.',
    about: 'About',
    noBio: 'No supplier bio added yet.',
    openStorefront: 'Open Storefront',
    openProfile: 'Open Profile',
    website: 'Website',
    phone: 'Phone',
    sourceImported: 'Google-imported',
    sourceNative: 'Surplox account'
  },
  es: {
    badge: 'Búsqueda de materiales',
    title: 'Busca proveedores por material.',
    body:
      'Usa la pestaña de materiales para encontrar proveedores por categoría de material, nombre del proveedor, ZIP, tienda física y radio de entrega.',
    searchLabel: 'Barra de búsqueda',
    searchPlaceholder: 'Busca concreto, madera, drywall, nombre del proveedor, ZIP...',
    zipLabel: 'ZIP',
    zipPlaceholder: 'Filtrar por ZIP',
    materialLabel: 'Material',
    allMaterials: 'Todos los materiales',
    storefrontOnly: 'Solo tienda física',
    sortLabel: 'Ordenar por',
    sortBest: 'Mejor coincidencia',
    sortRadius: 'Mayor radio de entrega',
    sortName: 'Nombre del proveedor',
    resultsLabel: 'resultados',
    clear: 'Limpiar filtros',
    loading: 'Cargando proveedores…',
    error: 'No se pudieron cargar los proveedores.',
    emptyTitle: 'No se encontraron proveedores.',
    emptyBody: 'Prueba una búsqueda más amplia o limpia uno de los filtros.',
    supplier: 'Proveedor',
    zip: 'ZIP',
    deliveryRadius: 'Radio de entrega',
    miles: 'mi',
    storefrontYes: 'Tienda física',
    storefrontNo: 'Sin indicador de tienda',
    materials: 'Materiales',
    noMaterials: 'Todavía no hay materiales listados.',
    about: 'Acerca de',
    noBio: 'Este proveedor todavía no agregó biografía.',
    openStorefront: 'Abrir tienda',
    openProfile: 'Abrir perfil',
    website: 'Sitio web',
    phone: 'Teléfono',
    sourceImported: 'Importado de Google',
    sourceNative: 'Cuenta Surplox'
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
  return list
    .map((item) => String(item || '').trim())
    .filter(Boolean)
}

function normalizeMaterialLabel(value) {
  const v = String(value || '').trim()
  if (!v) return ''
  return v
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeText(value) {
  return String(value || '').trim()
}

function scoreSupplier(supplier, query, material, zipFilter, storefrontOnly) {
  let score = 0

  const haystack = [
    supplier.business_name,
    supplier.display_name,
    supplier.business_zip,
    supplier.bio,
    supplier.phone,
    supplier.website_url,
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
      score += 20
    }
  }

  if (zipFilter && String(supplier.business_zip || '').trim() === zipFilter.trim()) {
    score += 10
  }

  if (storefrontOnly && supplier.storefront) {
    score += 6
  }

  if (supplier.source === 'native') score += 4
  score += Math.min(Number(supplier.delivery_radius || 0), 100) / 10

  return score
}

function makeNativeSupplier(item) {
  return {
    id: item.user_id,
    source: 'native',
    user_id: item.user_id,
    display_name: normalizeText(item.display_name),
    business_name: normalizeText(item.business_name) || normalizeText(item.display_name),
    business_zip: normalizeText(item.business_zip),
    delivery_radius: Number(item.delivery_radius || 0) || 0,
    materials_categories: normalizeMaterials(item.materials_categories).map(normalizeMaterialLabel),
    storefront: Boolean(item.storefront),
    bio: normalizeText(item.bio),
    phone: '',
    website_url: ''
  }
}

function makeImportedSupplier(item) {
  return {
    id: item.id || item.external_id,
    external_id: item.external_id,
    source: 'imported',
    user_id: null,
    display_name: normalizeText(item.display_name) || normalizeText(item.business_name),
    business_name: normalizeText(item.business_name) || normalizeText(item.display_name),
    business_zip: normalizeText(item.business_zip),
    delivery_radius: Number(item.delivery_radius || 0) || 0,
    materials_categories: normalizeMaterials(item.materials_categories).map(normalizeMaterialLabel),
    storefront: Boolean(item.storefront),
    bio: normalizeText(item.bio),
    phone: normalizeText(item.phone),
    website_url: normalizeText(item.website_url)
  }
}

export default function Materials({ lang = 'en' }) {
  const copy = COPY[lang] || COPY.en

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [suppliers, setSuppliers] = useState([])

  const [query, setQuery] = useState('')
  const [zipFilter, setZipFilter] = useState('')
  const [material, setMaterial] = useState('')
  const [storefrontOnly, setStorefrontOnly] = useState(false)
  const [sortBy, setSortBy] = useState('best')

  useEffect(() => {
    let active = true

    async function loadSuppliers() {
      setLoading(true)
      setError('')

      try {
        const [nativeResponse, importedResponse] = await Promise.all([
          supabase
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
            .order('business_name', { ascending: true }),
          supabase
            .from('external_suppliers')
            .select(`
              id,
              external_id,
              display_name,
              business_name,
              business_zip,
              delivery_radius,
              materials_categories,
              storefront,
              bio,
              phone,
              website_url
            `)
            .order('business_name', { ascending: true })
        ])

        if (nativeResponse.error) throw nativeResponse.error
        if (importedResponse.error && importedResponse.error.code !== 'PGRST116') {
          throw importedResponse.error
        }

        if (!active) return

        const nativeSuppliers = (nativeResponse.data || []).map(makeNativeSupplier)
        const importedSuppliers = (importedResponse.data || []).map(makeImportedSupplier)

        const deduped = Array.from(
          new Map(
            [...nativeSuppliers, ...importedSuppliers].map((item) => {
              const key = `${normalizeText(item.business_name).toLowerCase()}::${normalizeText(item.business_zip)}`
              return [key, item]
            })
          ).values()
        )

        setSuppliers(deduped)
      } catch (err) {
        console.error(err)
        if (!active) return
        setError(copy.error)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadSuppliers()

    return () => {
      active = false
    }
  }, [copy.error])

  const materialOptions = useMemo(() => {
    const set = new Set(DEFAULT_MATERIALS.map(normalizeMaterialLabel))

    suppliers.forEach((supplier) => {
      supplier.materials_categories.forEach((item) => {
        if (item) set.add(item)
      })
    })

    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [suppliers])

  const filteredSuppliers = useMemo(() => {
    let next = [...suppliers]

    if (query.trim()) {
      const q = query.trim().toLowerCase()
      next = next.filter((supplier) => {
        const haystack = [
          supplier.business_name,
          supplier.display_name,
          supplier.business_zip,
          supplier.bio,
          supplier.phone,
          supplier.website_url,
          ...supplier.materials_categories
        ]
          .join(' ')
          .toLowerCase()

        return haystack.includes(q)
      })
    }

    if (zipFilter.trim()) {
      next = next.filter((supplier) => String(supplier.business_zip || '').trim() === zipFilter.trim())
    }

    if (material) {
      next = next.filter((supplier) =>
        supplier.materials_categories.some((item) => item.toLowerCase() === material.toLowerCase())
      )
    }

    if (storefrontOnly) {
      next = next.filter((supplier) => supplier.storefront)
    }

    if (sortBy === 'radius') {
      next.sort((a, b) => Number(b.delivery_radius || 0) - Number(a.delivery_radius || 0))
    } else if (sortBy === 'name') {
      next.sort((a, b) =>
        String(a.business_name || a.display_name || '').localeCompare(
          String(b.business_name || b.display_name || '')
        )
      )
    } else {
      next.sort((a, b) => {
        const scoreA = scoreSupplier(a, query, material, zipFilter, storefrontOnly)
        const scoreB = scoreSupplier(b, query, material, zipFilter, storefrontOnly)
        return scoreB - scoreA
      })
    }

    return next
  }, [suppliers, query, zipFilter, material, storefrontOnly, sortBy])

  function clearFilters() {
    setQuery('')
    setZipFilter('')
    setMaterial('')
    setStorefrontOnly(false)
    setSortBy('best')
  }

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
          background: 'linear-gradient(180deg, #fff7c8 0%, #f7f7f2 100%)'
        }}
      >
        <div className="badge" style={{ marginBottom: 14, background: '#f1e7a8' }}>
          {copy.badge}
        </div>

        <div className="h1" style={{ maxWidth: 760 }}>{copy.title}</div>

        <p className="muted" style={{ marginTop: 12, maxWidth: 860, fontSize: 17, lineHeight: 1.7 }}>
          {copy.body}
        </p>
      </div>

      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="grid" style={{ gap: 14 }}>
          <div>
            <div className="muted" style={{ marginBottom: 8 }}>{copy.searchLabel}</div>
            <input
              className="input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={copy.searchPlaceholder}
            />
          </div>

          <div className="grid two" style={{ gap: 14 }}>
            <div>
              <div className="muted" style={{ marginBottom: 8 }}>{copy.zipLabel}</div>
              <input
                className="input"
                value={zipFilter}
                onChange={(e) => setZipFilter(e.target.value.replace(/[^\d]/g, '').slice(0, 5))}
                placeholder={copy.zipPlaceholder}
              />
            </div>

            <div>
              <div className="muted" style={{ marginBottom: 8 }}>{copy.materialLabel}</div>
              <select className="input" value={material} onChange={(e) => setMaterial(e.target.value)}>
                <option value="">{copy.allMaterials}</option>
                {materialOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid two" style={{ gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                type="button"
                className={storefrontOnly ? 'btn primary' : 'btn'}
                onClick={() => setStorefrontOnly((prev) => !prev)}
              >
                {copy.storefrontOnly}
              </button>
            </div>

            <div>
              <div className="muted" style={{ marginBottom: 8 }}>{copy.sortLabel}</div>
              <select className="input" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="best">{copy.sortBest}</option>
                <option value="radius">{copy.sortRadius}</option>
                <option value="name">{copy.sortName}</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <button type="button" className="btn small" onClick={clearFilters}>
              {copy.clear}
            </button>

            <span className="badge">
              {filteredSuppliers.length} {copy.resultsLabel}
            </span>
          </div>
        </div>
      </div>

      {filteredSuppliers.length === 0 ? (
        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">{copy.emptyTitle}</div>
          <p className="card-section-subtitle" style={{ marginTop: 8 }}>
            {copy.emptyBody}
          </p>
        </div>
      ) : (
        <div className="grid" style={{ gap: 16 }}>
          {filteredSuppliers.map((supplier) => (
            <div key={supplier.id || supplier.external_id || supplier.business_name} className="card rounded-xl" style={{ padding: 22 }}>
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
                  <div className="h2" style={{ fontSize: 24 }}>
                    {supplier.business_name || supplier.display_name || copy.supplier}
                  </div>

                  <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span className="badge">
                      {supplier.source === 'imported' ? copy.sourceImported : copy.sourceNative}
                    </span>

                    <span className="badge">
                      {supplier.storefront ? copy.storefrontYes : copy.storefrontNo}
                    </span>

                    <span className="badge">
                      {copy.zip}: {supplier.business_zip || '—'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {supplier.source === 'native' && supplier.user_id ? (
                    <>
                      <Link className="btn small primary" to={`/supplier/${supplier.user_id}`}>
                        {copy.openStorefront}
                      </Link>
                      <Link className="btn small" to={`/u/${supplier.user_id}`}>
                        {copy.openProfile}
                      </Link>
                    </>
                  ) : (
                    <Link className="btn small" to="/ai-tools">
                      {copy.openStorefront}
                    </Link>
                  )}
                </div>
              </div>

              <div className="grid two" style={{ gap: 14, marginTop: 16 }}>
                <div className="card-soft" style={{ background: '#fffaf0' }}>
                  <div className="card-section-title" style={{ fontSize: 15 }}>
                    {copy.deliveryRadius}
                  </div>
                  <div className="muted" style={{ marginTop: 6 }}>
                    {Number(supplier.delivery_radius || 0) > 0
                      ? `${Number(supplier.delivery_radius)} ${copy.miles}`
                      : '—'}
                  </div>
                </div>

                <div className="card-soft" style={{ background: '#fffaf0' }}>
                  <div className="card-section-title" style={{ fontSize: 15 }}>
                    {copy.materials}
                  </div>
                  {supplier.materials_categories.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                      {supplier.materials_categories.map((item) => (
                        <span key={`${supplier.id || supplier.external_id}-${item}`} className="badge">
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="muted" style={{ marginTop: 6 }}>
                      {copy.noMaterials}
                    </div>
                  )}
                </div>
              </div>

              {(supplier.phone || supplier.website_url) ? (
                <div className="grid two" style={{ gap: 14, marginTop: 16 }}>
                  <div className="card-soft">
                    <div className="card-section-title" style={{ fontSize: 15 }}>
                      {copy.phone}
                    </div>
                    <div className="muted" style={{ marginTop: 6 }}>
                      {supplier.phone || '—'}
                    </div>
                  </div>

                  <div className="card-soft">
                    <div className="card-section-title" style={{ fontSize: 15 }}>
                      {copy.website}
                    </div>
                    <div className="muted" style={{ marginTop: 6, overflowWrap: 'anywhere' }}>
                      {supplier.website_url || '—'}
                    </div>
                  </div>
                </div>
              ) : null}

              <div style={{ marginTop: 16 }}>
                <div className="muted">{copy.about}</div>
                <p style={{ marginTop: 8, lineHeight: 1.7 }}>
                  {supplier.bio || copy.noBio}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
