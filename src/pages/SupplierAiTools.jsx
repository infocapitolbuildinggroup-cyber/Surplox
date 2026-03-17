import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

const API_IMPORT_ENDPOINT =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_SUPPLIER_IMPORT_ENDPOINT) ||
  '/api/import-suppliers'

const API_SUPPLIER_SEARCH_ENDPOINT =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_SUPPLIER_SEARCH_ENDPOINT) ||
  '/api/supplier-search'

const COPY = {
  en: {
    badge: 'Surplox AI Tools',
    title: 'Construction AI tools built into Surplox.',
    body:
      'Use Surplox AI to analyze project scope, suggest suppliers, match crews, and coordinate delivery from one place.',
    supplierTab: 'Supplier Suggestions',
    crewTab: 'Crew Matching',
    deliveryTab: 'Delivery Coordination',
    analyzerTab: 'Project Analyzer',
    importerTitle: 'Supplier Storefront Importer',
    importerBody:
      'Import real supplier candidates by material and ZIP so Surplox can start auto-populating storefront-ready supplier records.',
    materialLabel: 'Material',
    materialPlaceholder: 'Concrete, lumber, drywall, steel...',
    zipLabel: 'ZIP',
    zipPlaceholder: '76102',
    cityLabel: 'City (optional)',
    cityPlaceholder: 'Fort Worth',
    stateLabel: 'State',
    importButton: 'Import Suppliers',
    importing: 'Importing suppliers…',
    importedLabel: 'Imported supplier candidates',
    noImported: 'No supplier candidates imported yet.',
    importSuccess: 'Supplier candidates imported successfully.',
    importError: 'Unable to import supplier candidates right now.',
    openMaterials: 'Open Materials',
    supplierSuggestionsTitle: 'Supplier Suggestions AI',
    supplierSuggestionsBody:
      'Search your internal Surplox supplier suggestions endpoint to rank nearby supplier options for a material and jobsite ZIP.',
    searchButton: 'Run Supplier Suggestions',
    searching: 'Searching suppliers…',
    suggestionsLabel: 'Supplier suggestions',
    noSuggestions: 'No supplier suggestions yet.',
    crewTitle: 'Crew Matching AI',
    crewBody:
      'This tool stays ready for ranking nearby Surplox workers and crews by trade, ZIP fit, availability, travel radius, and crew size.',
    deliveryTitle: 'Delivery Coordination AI',
    deliveryBody:
      'This tool stays ready for coordinating supplier pickup, jobsite delivery, and hauling support using Surplox driver records.',
    analyzerTitle: 'Project Analyzer AI',
    analyzerBody:
      'Paste project notes or blueprint summary text to generate a quick project summary and handoff into supplier, crew, and delivery tools.',
    notesLabel: 'Project scope notes',
    notesPlaceholder:
      'Example: 18,000 SF tilt wall warehouse in 76140. Needs concrete, steel, framing, drywall, electrical, plumbing, site materials, and staged deliveries.',
    analyzeButton: 'Analyze Scope',
    summaryLabel: 'Project summary',
    noSummary: 'No project analysis generated yet.',
    openDelivery: 'Open Delivery',
    openNewPost: 'Open New Post',
    openChannels: 'Open Channels',
    fitLabel: 'Fit',
    website: 'Website',
    phone: 'Phone',
    address: 'Address',
    categories: 'Categories',
    rating: 'Rating'
  }
}

function scoreScope(text = '') {
  const lower = String(text || '').toLowerCase()
  const trades = []
  const materials = []

  const tradeMap = [
    ['concrete', ['concrete', 'foundation', 'slab', 'flatwork']],
    ['steel', ['steel', 'metal', 'rebar']],
    ['framing', ['frame', 'framing', 'wood framing']],
    ['drywall', ['drywall', 'sheetrock', 'gypsum']],
    ['electrical', ['electrical', 'power', 'lighting']],
    ['plumbing', ['plumbing', 'pipe', 'piping']],
    ['roofing', ['roof', 'roofing']],
    ['hvac', ['hvac', 'mechanical', 'air handler']],
    ['sitework', ['sitework', 'excavation', 'grading', 'dirt']]
  ]

  const materialMap = [
    ['concrete', ['concrete', 'cement']],
    ['steel', ['steel', 'rebar']],
    ['lumber', ['lumber', 'framing']],
    ['drywall', ['drywall', 'sheetrock']],
    ['electrical', ['electrical', 'lighting']],
    ['plumbing', ['plumbing', 'pipe']],
    ['tools', ['tools']],
    ['fasteners', ['fasteners', 'screws', 'anchors']]
  ]

  tradeMap.forEach(([value, needles]) => {
    if (needles.some((needle) => lower.includes(needle))) trades.push(value)
  })

  materialMap.forEach(([value, needles]) => {
    if (needles.some((needle) => lower.includes(needle))) materials.push(value)
  })

  const normalizedTrades = Array.from(new Set(trades))
  const normalizedMaterials = Array.from(new Set(materials))

  let summary = 'General construction project'
  if (lower.includes('warehouse')) summary = 'Warehouse / industrial project'
  else if (lower.includes('office')) summary = 'Office / commercial interior project'
  else if (lower.includes('multifamily') || lower.includes('apartment')) summary = 'Multifamily project'
  else if (lower.includes('school')) summary = 'Education / institutional project'

  return {
    summary,
    trades: normalizedTrades,
    materials: normalizedMaterials,
    crewSuggestion:
      normalizedTrades.length >= 5
        ? 'Multi-trade project. Start with contractor, concrete, steel/framing, electrical, and plumbing coverage.'
        : normalizedTrades.length >= 3
          ? 'Mid-size project. Start with 2–4 core trades and phase supplier and delivery support.'
          : 'Smaller scope. Start with one lead trade and one supplier lane.'
  }
}

function Chip({ children, active = false, onClick, type = 'button' }) {
  return (
    <button
      type={type}
      className={active ? 'btn primary small' : 'btn small'}
      onClick={onClick}
      style={{ borderRadius: 999 }}
    >
      {children}
    </button>
  )
}

function SupplierCard({ supplier, copy }) {
  const categories = Array.isArray(supplier.materials_categories) ? supplier.materials_categories : []

  return (
    <div className="card rounded-xl" style={{ padding: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div className="h2" style={{ fontSize: 22 }}>
            {supplier.business_name || supplier.display_name || 'Supplier'}
          </div>
          <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {supplier.business_zip ? <span className="badge">{supplier.business_zip}</span> : null}
            {supplier.google_rating ? (
              <span className="badge">
                {copy.rating}: {supplier.google_rating}
              </span>
            ) : null}
            <span className="badge">{copy.fitLabel}: storefront-ready</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link className="btn small" to="/materials">
            {copy.openMaterials}
          </Link>
        </div>
      </div>

      {supplier.business_address ? (
        <div style={{ marginTop: 14 }}>
          <div className="muted">{copy.address}</div>
          <div style={{ marginTop: 6 }}>{supplier.business_address}</div>
        </div>
      ) : null}

      {categories.length ? (
        <div style={{ marginTop: 14 }}>
          <div className="muted">{copy.categories}</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
            {categories.map((item) => (
              <span key={`${supplier.external_id || supplier.id}-${item}`} className="badge">
                {String(item).replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {(supplier.phone || supplier.website_url) ? (
        <div className="grid two" style={{ marginTop: 14, gap: 12 }}>
          <div className="card-soft">
            <div className="muted">{copy.phone}</div>
            <div style={{ marginTop: 6 }}>{supplier.phone || '—'}</div>
          </div>
          <div className="card-soft">
            <div className="muted">{copy.website}</div>
            <div style={{ marginTop: 6, overflowWrap: 'anywhere' }}>{supplier.website_url || '—'}</div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default function SupplierAiTools() {
  const copy = COPY.en
  const [tab, setTab] = useState('supplier')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [importedSuppliers, setImportedSuppliers] = useState([])
  const [supplierSuggestions, setSupplierSuggestions] = useState([])

  const [supplierForm, setSupplierForm] = useState({
    material: '',
    zip: '',
    city: '',
    state: 'TX'
  })

  const [projectNotes, setProjectNotes] = useState('')
  const projectSummary = useMemo(() => scoreScope(projectNotes), [projectNotes])

  function setSupplierField(key, value) {
    setSupplierForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleImportSuppliers(event) {
    event.preventDefault()
    setBusy(true)
    setMessage('')

    try {
      const response = await fetch(API_IMPORT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplierForm)
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || copy.importError)
      }

      setImportedSuppliers(Array.isArray(data.suppliers) ? data.suppliers : [])
      setMessage(copy.importSuccess)
    } catch (error) {
      console.error(error)
      setMessage(error.message || copy.importError)
    } finally {
      setBusy(false)
    }
  }

  async function handleSupplierSuggestions(event) {
    event.preventDefault()
    setBusy(true)
    setMessage('')

    try {
      const response = await fetch(API_SUPPLIER_SEARCH_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplierForm)
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error || copy.importError)
      }

      setSupplierSuggestions(Array.isArray(data.suppliers) ? data.suppliers : [])
    } catch (error) {
      console.error(error)
      setMessage(error.message || copy.importError)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div
        className="card rounded-xl"
        style={{
          padding: 28,
          background: 'linear-gradient(180deg, #efe8ff 0%, #f7f7f2 100%)'
        }}
      >
        <div className="badge" style={{ marginBottom: 14, background: '#e8defa', color: '#4d2f82' }}>
          {copy.badge}
        </div>

        <div className="h1" style={{ maxWidth: 820 }}>{copy.title}</div>
        <p className="muted" style={{ marginTop: 12, maxWidth: 920, fontSize: 17, lineHeight: 1.7 }}>
          {copy.body}
        </p>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
          <Chip active={tab === 'supplier'} onClick={() => setTab('supplier')}>{copy.supplierTab}</Chip>
          <Chip active={tab === 'crew'} onClick={() => setTab('crew')}>{copy.crewTab}</Chip>
          <Chip active={tab === 'delivery'} onClick={() => setTab('delivery')}>{copy.deliveryTab}</Chip>
          <Chip active={tab === 'analyzer'} onClick={() => setTab('analyzer')}>{copy.analyzerTab}</Chip>
        </div>
      </div>

      {message ? (
        <div className="card-message" style={{ padding: 14, borderRadius: 18 }}>
          {message}
        </div>
      ) : null}

      {tab === 'supplier' ? (
        <>
          <div className="card rounded-xl" style={{ padding: 22 }}>
            <div className="card-section-title">{copy.importerTitle}</div>
            <p className="card-section-subtitle" style={{ marginTop: 8 }}>
              {copy.importerBody}
            </p>

            <form onSubmit={handleImportSuppliers} className="grid" style={{ gap: 14, marginTop: 16 }}>
              <div className="grid two" style={{ gap: 14 }}>
                <div>
                  <div className="muted" style={{ marginBottom: 8 }}>{copy.materialLabel}</div>
                  <input
                    className="input"
                    value={supplierForm.material}
                    onChange={(e) => setSupplierField('material', e.target.value)}
                    placeholder={copy.materialPlaceholder}
                  />
                </div>

                <div>
                  <div className="muted" style={{ marginBottom: 8 }}>{copy.zipLabel}</div>
                  <input
                    className="input"
                    value={supplierForm.zip}
                    onChange={(e) => setSupplierField('zip', e.target.value.replace(/[^\d]/g, '').slice(0, 5))}
                    placeholder={copy.zipPlaceholder}
                  />
                </div>
              </div>

              <div className="grid two" style={{ gap: 14 }}>
                <div>
                  <div className="muted" style={{ marginBottom: 8 }}>{copy.cityLabel}</div>
                  <input
                    className="input"
                    value={supplierForm.city}
                    onChange={(e) => setSupplierField('city', e.target.value)}
                    placeholder={copy.cityPlaceholder}
                  />
                </div>

                <div>
                  <div className="muted" style={{ marginBottom: 8 }}>{copy.stateLabel}</div>
                  <input
                    className="input"
                    value={supplierForm.state}
                    onChange={(e) => setSupplierField('state', e.target.value.toUpperCase().slice(0, 2))}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button className="btn primary" type="submit" disabled={busy}>
                  {busy ? copy.importing : copy.importButton}
                </button>

                <button className="btn" type="button" onClick={handleSupplierSuggestions} disabled={busy}>
                  {busy ? copy.searching : copy.searchButton}
                </button>

                <Link className="btn" to="/materials">
                  {copy.openMaterials}
                </Link>
              </div>
            </form>
          </div>

          <div className="card rounded-xl" style={{ padding: 22 }}>
            <div className="card-section-title">{copy.importedLabel}</div>

            {importedSuppliers.length === 0 ? (
              <p className="card-section-subtitle" style={{ marginTop: 8 }}>
                {copy.noImported}
              </p>
            ) : (
              <div className="grid" style={{ gap: 16, marginTop: 14 }}>
                {importedSuppliers.map((supplier) => (
                  <SupplierCard
                    key={supplier.external_id || supplier.id || `${supplier.business_name}-${supplier.business_zip}`}
                    supplier={supplier}
                    copy={copy}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="card rounded-xl" style={{ padding: 22 }}>
            <div className="card-section-title">{copy.suggestionsLabel}</div>

            {supplierSuggestions.length === 0 ? (
              <p className="card-section-subtitle" style={{ marginTop: 8 }}>
                {copy.noSuggestions}
              </p>
            ) : (
              <div className="grid" style={{ gap: 16, marginTop: 14 }}>
                {supplierSuggestions.map((supplier) => (
                  <SupplierCard
                    key={supplier.external_id || supplier.id || `${supplier.business_name}-${supplier.business_zip}`}
                    supplier={supplier}
                    copy={copy}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}

      {tab === 'crew' ? (
        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">{copy.crewTitle}</div>
          <p className="card-section-subtitle" style={{ marginTop: 8 }}>
            {copy.crewBody}
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
            <Link className="btn" to="/channels">{copy.openChannels}</Link>
            <Link className="btn primary" to="/new">{copy.openNewPost}</Link>
          </div>
        </div>
      ) : null}

      {tab === 'delivery' ? (
        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">{copy.deliveryTitle}</div>
          <p className="card-section-subtitle" style={{ marginTop: 8 }}>
            {copy.deliveryBody}
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
            <Link className="btn primary" to="/delivery">{copy.openDelivery}</Link>
            <Link className="btn" to="/new">{copy.openNewPost}</Link>
          </div>
        </div>
      ) : null}

      {tab === 'analyzer' ? (
        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">{copy.analyzerTitle}</div>
          <p className="card-section-subtitle" style={{ marginTop: 8 }}>
            {copy.analyzerBody}
          </p>

          <div style={{ marginTop: 16 }}>
            <div className="muted" style={{ marginBottom: 8 }}>{copy.notesLabel}</div>
            <textarea
              className="input"
              value={projectNotes}
              onChange={(e) => setProjectNotes(e.target.value)}
              placeholder={copy.notesPlaceholder}
              style={{ minHeight: 180 }}
            />
          </div>

          <div className="card-soft" style={{ marginTop: 16 }}>
            <div className="card-section-title">{copy.summaryLabel}</div>
            {projectNotes.trim() ? (
              <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
                <div><strong>{projectSummary.summary}</strong></div>
                <div><strong>Trades:</strong> {projectSummary.trades.length ? projectSummary.trades.join(', ') : 'General construction'}</div>
                <div><strong>Supplier categories:</strong> {projectSummary.materials.length ? projectSummary.materials.join(', ') : 'General materials'}</div>
                <div><strong>Crew note:</strong> {projectSummary.crewSuggestion}</div>
              </div>
            ) : (
              <p className="card-section-subtitle" style={{ marginTop: 8 }}>
                {copy.noSummary}
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
