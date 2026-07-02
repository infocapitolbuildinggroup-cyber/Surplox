import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'

const STORAGE_AREAS = [
  'Mexico',
  'Oklahoma Yard',
  'Warehouse / Main Yard',
  'Stainless Tent'
]

const REQUEST_STATUSES = ['new', 'picking', 'partial', 'ready', 'delivered', 'closed']
const PRIORITIES = ['normal', 'urgent', 'shutdown-critical']
const MOVEMENT_TYPES = ['received', 'issued_to_field', 'returned_from_field', 'damaged', 'adjustment']
const UNITS = ['ea', 'sticks', 'ft', 'boxes', 'crates', 'bundles']

function todayDate() {
  return new Date().toISOString().slice(0, 10)
}

function emptyFmrForm() {
  return {
    requested_by: '',
    company: '',
    crew_or_foreman: '',
    field_contact: '',
    request_date: todayDate(),
    needed_by: '',
    equipment_tag: '',
    iso_number: '',
    building_area: '',
    dropoff_location: '',
    delivery_area: '',
    priority: 'normal',
    notes: '',
    is_legacy_paper_fmr: false,
    legacy_request_date: '',
    legacy_requested_by: '',
    items: [{ quantity_requested: '1', item_name: '', unit: 'ea', notes: '' }]
  }
}

function emptyInventoryForm() {
  return {
    item_name: '',
    quantity_on_hand: '',
    unit: 'ea',
    storage_area: 'Warehouse / Main Yard',
    storage_detail: '',
    notes: ''
  }
}

function emptyMovementForm() {
  return {
    inventory_id: '',
    movement_type: 'adjustment',
    quantity: '',
    unit: 'ea',
    from_location: '',
    to_location: '',
    reference_number: '',
    notes: ''
  }
}

function emptyReceivingForm() {
  return {
    vendor: '',
    manufacturer: '',
    carrier: '',
    driver_name: '',
    truck_type: '',
    po_number: '',
    packing_slip_number: '',
    received_by: '',
    received_date: todayDate(),
    offload_location: 'Warehouse / Main Yard',
    paperwork_signed: false,
    checked_into_inventory: false,
    notes: '',
    items: [{ item_name: '', quantity_received: '1', unit: 'ea', storage_area: 'Warehouse / Main Yard', notes: '' }]
  }
}

function cleanNumber(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function prettyStatus(value) {
  return String(value || '')
    .replace(/-/g, ' ')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function statusStyle(status) {
  if (status === 'new') return { background: '#fff0b4', color: '#111111' }
  if (status === 'picking') return { background: '#d8ecff', color: '#0d3f73' }
  if (status === 'partial') return { background: '#fff4da', color: '#8a5a00' }
  if (status === 'ready') return { background: '#dcf4e5', color: '#177245' }
  if (status === 'delivered') return { background: '#111111', color: '#ffffff' }
  if (status === 'closed') return { background: '#ecebe3', color: '#111111' }
  return {}
}

export default function YardManager() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  const [inventory, setInventory] = useState([])
  const [requests, setRequests] = useState([])
  const [requestItems, setRequestItems] = useState([])
  const [receivingLogs, setReceivingLogs] = useState([])
  const [plantLocations, setPlantLocations] = useState([])
  const [movements, setMovements] = useState([])

  const [fmrForm, setFmrForm] = useState(emptyFmrForm())
  const [inventoryForm, setInventoryForm] = useState(emptyInventoryForm())
  const [movementForm, setMovementForm] = useState(emptyMovementForm())
  const [receivingForm, setReceivingForm] = useState(emptyReceivingForm())

  const [inventorySearch, setInventorySearch] = useState('')
  const [requestSearch, setRequestSearch] = useState('')

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    setLoading(true)
    setError('')

    try {
      const [
        inventoryRes,
        requestsRes,
        requestItemsRes,
        receivingRes,
        locationsRes,
        movementsRes
      ] = await Promise.all([
        supabase.from('yard_inventory').select('*').order('item_name'),
        supabase.from('yard_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('yard_request_items').select('*').order('created_at', { ascending: true }),
        supabase.from('receiving_log').select('*').order('created_at', { ascending: false }),
        supabase.from('plant_locations').select('*').order('location_name'),
        supabase.from('yard_inventory_movements').select('*').order('created_at', { ascending: false }).limit(50)
      ])

      if (inventoryRes.error) throw inventoryRes.error
      if (requestsRes.error) throw requestsRes.error
      if (requestItemsRes.error) throw requestItemsRes.error
      if (receivingRes.error) throw receivingRes.error
      if (locationsRes.error) throw locationsRes.error
      if (movementsRes.error) throw movementsRes.error

      setInventory(inventoryRes.data || [])
      setRequests(requestsRes.data || [])
      setRequestItems(requestItemsRes.data || [])
      setReceivingLogs(receivingRes.data || [])
      setPlantLocations(locationsRes.data || [])
      setMovements(movementsRes.data || [])
    } catch (err) {
      console.error(err)
      setError(err?.message || 'Unable to load Yard Manager.')
    } finally {
      setLoading(false)
    }
  }

  function showMessage(text) {
    setMsg(text)
    window.setTimeout(() => setMsg(''), 3500)
  }

  function updateFmrField(key, value) {
    setFmrForm((prev) => ({ ...prev, [key]: value }))
  }

  function updateFmrItem(index, key, value) {
    setFmrForm((prev) => {
      const items = [...prev.items]
      items[index] = { ...items[index], [key]: value }
      return { ...prev, items }
    })
  }

  function addFmrItem() {
    setFmrForm((prev) => ({
      ...prev,
      items: [...prev.items, { quantity_requested: '1', item_name: '', unit: 'ea', notes: '' }]
    }))
  }

  function removeFmrItem(index) {
    setFmrForm((prev) => ({
      ...prev,
      items: prev.items.length === 1 ? prev.items : prev.items.filter((_, i) => i !== index)
    }))
  }

  async function createFmr(event) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      if (!fmrForm.requested_by.trim()) throw new Error('Requested By is required.')
      if (!fmrForm.dropoff_location.trim()) throw new Error('Delivery Area / Drop-off Location is required.')

      const validItems = fmrForm.items
        .map((item) => ({
          item_name: item.item_name.trim(),
          quantity_requested: cleanNumber(item.quantity_requested),
          unit: item.unit || 'ea',
          notes: item.notes || ''
        }))
        .filter((item) => item.item_name && item.quantity_requested > 0)

      if (validItems.length === 0) throw new Error('Add at least one material item.')

      const { data: sessionData } = await supabase.auth.getSession()
      const userId = sessionData.session?.user?.id || null

      const requestPayload = {
        requested_by: fmrForm.requested_by.trim(),
        company: fmrForm.company.trim(),
        crew_or_foreman: fmrForm.crew_or_foreman.trim(),
        field_contact: fmrForm.field_contact.trim(),
        request_date: fmrForm.request_date || todayDate(),
        needed_by: fmrForm.needed_by || null,
        equipment_tag: fmrForm.equipment_tag.trim(),
        iso_number: fmrForm.iso_number.trim(),
        building_area: fmrForm.building_area.trim(),
        dropoff_location: fmrForm.dropoff_location.trim(),
        priority: fmrForm.priority,
        status: 'new',
        notes: fmrForm.notes.trim(),
        is_legacy_paper_fmr: !!fmrForm.is_legacy_paper_fmr,
        legacy_request_date: fmrForm.legacy_request_date || null,
        legacy_requested_by: fmrForm.legacy_requested_by.trim(),
        created_by: userId,
        updated_by: userId
      }

      const { data: request, error: requestError } = await supabase
        .from('yard_requests')
        .insert(requestPayload)
        .select('*')
        .single()

      if (requestError) throw requestError

      const itemRows = validItems.map((item) => ({
        request_id: request.id,
        item_name: item.item_name,
        quantity_requested: item.quantity_requested,
        unit: item.unit,
        notes: item.notes
      }))

      const { error: itemError } = await supabase.from('yard_request_items').insert(itemRows)
      if (itemError) throw itemError

      setFmrForm(emptyFmrForm())
      showMessage(`Created ${request.fmr_number || 'new FMR'}.`)
      await loadAll()
      setActiveTab('queue')
    } catch (err) {
      console.error(err)
      setError(err?.message || 'Unable to create FMR.')
    } finally {
      setSaving(false)
    }
  }

  async function updateRequestStatus(request, nextStatus) {
    setSaving(true)
    setError('')

    try {
      const payload = { status: nextStatus }

      if (nextStatus === 'delivered') {
        payload.delivered_at = new Date().toISOString()
        payload.issued_date = todayDate()
      }

      if (nextStatus === 'closed') {
        payload.closed_at = new Date().toISOString()
      }

      const { error: updateError } = await supabase
        .from('yard_requests')
        .update(payload)
        .eq('id', request.id)

      if (updateError) throw updateError

      showMessage(`${request.fmr_number || 'FMR'} moved to ${prettyStatus(nextStatus)}.`)
      await loadAll()
    } catch (err) {
      console.error(err)
      setError(err?.message || 'Unable to update FMR status.')
    } finally {
      setSaving(false)
    }
  }

  async function addInventory(event) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      if (!inventoryForm.item_name.trim()) throw new Error('Item name is required.')

      const { data: sessionData } = await supabase.auth.getSession()
      const userId = sessionData.session?.user?.id || null

      const payload = {
        item_name: inventoryForm.item_name.trim(),
        quantity_on_hand: cleanNumber(inventoryForm.quantity_on_hand),
        unit: inventoryForm.unit,
        storage_area: inventoryForm.storage_area,
        storage_detail: inventoryForm.storage_detail.trim(),
        notes: inventoryForm.notes.trim(),
        created_by: userId,
        updated_by: userId
      }

      const { error: insertError } = await supabase.from('yard_inventory').insert(payload)
      if (insertError) throw insertError

      setInventoryForm(emptyInventoryForm())
      showMessage('Inventory item added.')
      await loadAll()
    } catch (err) {
      console.error(err)
      setError(err?.message || 'Unable to add inventory.')
    } finally {
      setSaving(false)
    }
  }

  async function applyInventoryMovement(event) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      if (!movementForm.inventory_id) throw new Error('Select an inventory item.')
      if (cleanNumber(movementForm.quantity) <= 0) throw new Error('Quantity must be greater than zero.')

      const selected = inventory.find((item) => item.id === movementForm.inventory_id)
      if (!selected) throw new Error('Inventory item not found.')

      const qty = cleanNumber(movementForm.quantity)
      const currentQty = cleanNumber(selected.quantity_on_hand)

      let nextQty = currentQty

      if (movementForm.movement_type === 'received') nextQty = currentQty + qty
      if (movementForm.movement_type === 'returned_from_field') nextQty = currentQty + qty
      if (movementForm.movement_type === 'issued_to_field') nextQty = currentQty - qty
      if (movementForm.movement_type === 'damaged') nextQty = currentQty - qty
      if (movementForm.movement_type === 'adjustment') nextQty = qty

      if (nextQty < 0) nextQty = 0

      const { data: sessionData } = await supabase.auth.getSession()
      const userId = sessionData.session?.user?.id || null

      const { error: movementError } = await supabase.from('yard_inventory_movements').insert({
        inventory_id: selected.id,
        movement_type: movementForm.movement_type,
        quantity: qty,
        unit: movementForm.unit,
        from_location: movementForm.from_location.trim(),
        to_location: movementForm.to_location.trim(),
        reference_number: movementForm.reference_number.trim(),
        notes: movementForm.notes.trim(),
        created_by: userId
      })

      if (movementError) throw movementError

      const { error: updateError } = await supabase
        .from('yard_inventory')
        .update({
          quantity_on_hand: nextQty,
          updated_by: userId
        })
        .eq('id', selected.id)

      if (updateError) throw updateError

      setMovementForm(emptyMovementForm())
      showMessage('Inventory movement saved.')
      await loadAll()
    } catch (err) {
      console.error(err)
      setError(err?.message || 'Unable to update inventory.')
    } finally {
      setSaving(false)
    }
  }

  function updateReceivingItem(index, key, value) {
    setReceivingForm((prev) => {
      const items = [...prev.items]
      items[index] = { ...items[index], [key]: value }
      return { ...prev, items }
    })
  }

  function addReceivingItem() {
    setReceivingForm((prev) => ({
      ...prev,
      items: [...prev.items, { item_name: '', quantity_received: '1', unit: 'ea', storage_area: 'Warehouse / Main Yard', notes: '' }]
    }))
  }

  function removeReceivingItem(index) {
    setReceivingForm((prev) => ({
      ...prev,
      items: prev.items.length === 1 ? prev.items : prev.items.filter((_, i) => i !== index)
    }))
  }

  async function createReceivingLog(event) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      if (!receivingForm.vendor.trim() && !receivingForm.manufacturer.trim()) {
        throw new Error('Vendor or manufacturer is required.')
      }

      const validItems = receivingForm.items
        .map((item) => ({
          item_name: item.item_name.trim(),
          quantity_received: cleanNumber(item.quantity_received),
          unit: item.unit || 'ea',
          storage_area: item.storage_area || receivingForm.offload_location,
          notes: item.notes || ''
        }))
        .filter((item) => item.item_name && item.quantity_received > 0)

      if (validItems.length === 0) throw new Error('Add at least one received item.')

      const { data: sessionData } = await supabase.auth.getSession()
      const userId = sessionData.session?.user?.id || null

      const { data: receiving, error: receivingError } = await supabase
        .from('receiving_log')
        .insert({
          vendor: receivingForm.vendor.trim(),
          manufacturer: receivingForm.manufacturer.trim(),
          carrier: receivingForm.carrier.trim(),
          driver_name: receivingForm.driver_name.trim(),
          truck_type: receivingForm.truck_type.trim(),
          po_number: receivingForm.po_number.trim(),
          packing_slip_number: receivingForm.packing_slip_number.trim(),
          received_by: receivingForm.received_by.trim(),
          received_date: receivingForm.received_date || todayDate(),
          offload_location: receivingForm.offload_location,
          paperwork_signed: !!receivingForm.paperwork_signed,
          checked_into_inventory: !!receivingForm.checked_into_inventory,
          status: receivingForm.checked_into_inventory ? 'checked_in' : 'received',
          notes: receivingForm.notes.trim(),
          created_by: userId,
          updated_by: userId
        })
        .select('*')
        .single()

      if (receivingError) throw receivingError

      const receivingItems = validItems.map((item) => ({
        receiving_id: receiving.id,
        item_name: item.item_name,
        quantity_received: item.quantity_received,
        unit: item.unit,
        storage_area: item.storage_area,
        notes: item.notes
      }))

      const { error: itemError } = await supabase.from('receiving_log_items').insert(receivingItems)
      if (itemError) throw itemError

      if (receivingForm.checked_into_inventory) {
        for (const item of validItems) {
          const { data: existing } = await supabase
            .from('yard_inventory')
            .select('*')
            .eq('item_name', item.item_name)
            .eq('storage_area', item.storage_area)
            .maybeSingle()

          if (existing) {
            await supabase
              .from('yard_inventory')
              .update({
                quantity_on_hand: cleanNumber(existing.quantity_on_hand) + item.quantity_received,
                updated_by: userId
              })
              .eq('id', existing.id)

            await supabase.from('yard_inventory_movements').insert({
              inventory_id: existing.id,
              movement_type: 'received',
              quantity: item.quantity_received,
              unit: item.unit,
              to_location: item.storage_area,
              reference_type: 'receiving_log',
              reference_id: receiving.id,
              reference_number: receivingForm.packing_slip_number.trim(),
              notes: `Received from ${receivingForm.vendor || receivingForm.manufacturer}`,
              created_by: userId
            })
          } else {
            const { data: createdInventory } = await supabase
              .from('yard_inventory')
              .insert({
                item_name: item.item_name,
                quantity_on_hand: item.quantity_received,
                unit: item.unit,
                storage_area: item.storage_area,
                notes: item.notes,
                created_by: userId,
                updated_by: userId
              })
              .select('*')
              .single()

            if (createdInventory) {
              await supabase.from('yard_inventory_movements').insert({
                inventory_id: createdInventory.id,
                movement_type: 'received',
                quantity: item.quantity_received,
                unit: item.unit,
                to_location: item.storage_area,
                reference_type: 'receiving_log',
                reference_id: receiving.id,
                reference_number: receivingForm.packing_slip_number.trim(),
                notes: `Received from ${receivingForm.vendor || receivingForm.manufacturer}`,
                created_by: userId
              })
            }
          }
        }
      }

      setReceivingForm(emptyReceivingForm())
      showMessage('Receiving log saved.')
      await loadAll()
      setActiveTab('receiving')
    } catch (err) {
      console.error(err)
      setError(err?.message || 'Unable to save receiving log.')
    } finally {
      setSaving(false)
    }
  }

  const stats = useMemo(() => {
    const today = todayDate()
    return {
      newRequests: requests.filter((r) => r.status === 'new').length,
      picking: requests.filter((r) => r.status === 'picking' || r.status === 'partial').length,
      ready: requests.filter((r) => r.status === 'ready').length,
      deliveredToday: requests.filter((r) => r.status === 'delivered' && String(r.issued_date || '').slice(0, 10) === today).length,
      receivingToday: receivingLogs.filter((r) => String(r.received_date || '').slice(0, 10) === today).length,
      inventoryRows: inventory.length
    }
  }, [requests, receivingLogs, inventory])

  const itemsByRequestId = useMemo(() => {
    const map = {}
    requestItems.forEach((item) => {
      if (!map[item.request_id]) map[item.request_id] = []
      map[item.request_id].push(item)
    })
    return map
  }, [requestItems])

  const filteredRequests = useMemo(() => {
    const q = requestSearch.trim().toLowerCase()
    if (!q) return requests

    return requests.filter((request) => {
      const items = itemsByRequestId[request.id] || []
      const haystack = [
        request.fmr_number,
        request.requested_by,
        request.company,
        request.crew_or_foreman,
        request.equipment_tag,
        request.iso_number,
        request.building_area,
        request.dropoff_location,
        request.priority,
        request.status,
        request.notes,
        ...items.map((item) => item.item_name)
      ].join(' ').toLowerCase()

      return haystack.includes(q)
    })
  }, [requests, requestSearch, itemsByRequestId])

  const filteredInventory = useMemo(() => {
    const q = inventorySearch.trim().toLowerCase()
    if (!q) return inventory

    return inventory.filter((item) => {
      const haystack = [
        item.item_name,
        item.storage_area,
        item.storage_detail,
        item.notes,
        item.unit
      ].join(' ').toLowerCase()

      return haystack.includes(q)
    })
  }, [inventory, inventorySearch])

  if (loading) {
    return <div className="card">Loading Yard Manager…</div>
  }

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="card rounded-xl" style={{ padding: 24, background: 'linear-gradient(180deg, #fff7cf 0%, #ffffff 100%)' }}>
        <div className="badge" style={{ marginBottom: 12 }}>Surplox Yard Manager MVP</div>
        <div className="h1">Field Material Request System</div>
        <p className="muted" style={{ marginTop: 10, maxWidth: 900, lineHeight: 1.7 }}>
          Replace paper FMRs with a live yard workflow: requests, picking, receiving, inventory movements, returns, damaged material, and plant locations.
        </p>

        <div className="row" style={{ marginTop: 18 }}>
          <button className={`btn ${activeTab === 'dashboard' ? 'primary' : ''}`} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
          <button className={`btn ${activeTab === 'new-fmr' ? 'primary' : ''}`} onClick={() => setActiveTab('new-fmr')}>New FMR</button>
          <button className={`btn ${activeTab === 'queue' ? 'primary' : ''}`} onClick={() => setActiveTab('queue')}>FMR Queue</button>
          <button className={`btn ${activeTab === 'inventory' ? 'primary' : ''}`} onClick={() => setActiveTab('inventory')}>Inventory</button>
          <button className={`btn ${activeTab === 'receiving' ? 'primary' : ''}`} onClick={() => setActiveTab('receiving')}>Receiving</button>
          <button className={`btn ${activeTab === 'plant-map' ? 'primary' : ''}`} onClick={() => setActiveTab('plant-map')}>Plant Map</button>
        </div>
      </div>

      {error ? <div className="card-soft" style={{ background: '#fff4da' }}>{error}</div> : null}
      {msg ? <div className="card-soft" style={{ background: '#dcf4e5', color: '#177245' }}>{msg}</div> : null}

      {activeTab === 'dashboard' ? (
        <div className="grid">
          <div className="row">
            <Metric title="New FMRs" value={stats.newRequests} />
            <Metric title="Picking / Partial" value={stats.picking} />
            <Metric title="Ready" value={stats.ready} />
            <Metric title="Delivered Today" value={stats.deliveredToday} />
            <Metric title="Receiving Today" value={stats.receivingToday} />
            <Metric title="Inventory Rows" value={stats.inventoryRows} />
          </div>

          <div className="grid two">
            <div className="card rounded-xl">
              <div className="card-section-title">Newest FMRs</div>
              <div className="list">
                {requests.slice(0, 6).map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    items={itemsByRequestId[request.id] || []}
                    onStatusChange={updateRequestStatus}
                    saving={saving}
                  />
                ))}
              </div>
            </div>

            <div className="card rounded-xl">
              <div className="card-section-title">Recent Inventory Movements</div>
              <div className="list">
                {movements.slice(0, 8).map((move) => (
                  <div key={move.id} className="card-soft">
                    <div style={{ fontWeight: 900 }}>{prettyStatus(move.movement_type)}</div>
                    <div className="muted">{move.quantity} {move.unit} · {move.reference_number || 'No reference'}</div>
                    <div className="muted">{move.notes || 'No notes'}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {activeTab === 'new-fmr' ? (
        <form onSubmit={createFmr} className="card rounded-xl grid" style={{ padding: 22 }}>
          <div>
            <div className="card-section-title">Create Field Material Request</div>
            <p className="card-section-subtitle">Digital version of your paper FMR. New requests automatically receive an FMR number.</p>
          </div>

          <label className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              checked={fmrForm.is_legacy_paper_fmr}
              onChange={(e) => updateFmrField('is_legacy_paper_fmr', e.target.checked)}
            />
            <span className="form-check-label">This is an old paper FMR being entered into the system</span>
          </label>

          {fmrForm.is_legacy_paper_fmr ? (
            <div className="row">
              <div>
                <label className="muted">Original Paper Request Date</label>
                <input className="input" type="date" value={fmrForm.legacy_request_date} onChange={(e) => updateFmrField('legacy_request_date', e.target.value)} />
              </div>
              <div>
                <label className="muted">Original Requested By</label>
                <input className="input" value={fmrForm.legacy_requested_by} onChange={(e) => updateFmrField('legacy_requested_by', e.target.value)} />
              </div>
            </div>
          ) : null}

          <div className="row">
            <div>
              <label className="muted">Requested By</label>
              <input className="input" value={fmrForm.requested_by} onChange={(e) => updateFmrField('requested_by', e.target.value)} />
            </div>
            <div>
              <label className="muted">Company</label>
              <input className="input" value={fmrForm.company} onChange={(e) => updateFmrField('company', e.target.value)} />
            </div>
            <div>
              <label className="muted">Foreman / Crew</label>
              <input className="input" value={fmrForm.crew_or_foreman} onChange={(e) => updateFmrField('crew_or_foreman', e.target.value)} />
            </div>
          </div>

          <div className="row">
            <div>
              <label className="muted">Request Date</label>
              <input className="input" type="date" value={fmrForm.request_date} onChange={(e) => updateFmrField('request_date', e.target.value)} />
            </div>
            <div>
              <label className="muted">Needed By</label>
              <input className="input" type="datetime-local" value={fmrForm.needed_by} onChange={(e) => updateFmrField('needed_by', e.target.value)} />
            </div>
            <div>
              <label className="muted">Priority</label>
              <select value={fmrForm.priority} onChange={(e) => updateFmrField('priority', e.target.value)}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{prettyStatus(p)}</option>)}
              </select>
            </div>
          </div>

          <div className="row">
            <div>
              <label className="muted">Equipment Tag No.</label>
              <input className="input" value={fmrForm.equipment_tag} onChange={(e) => updateFmrField('equipment_tag', e.target.value)} />
            </div>
            <div>
              <label className="muted">ISO Number</label>
              <input className="input" value={fmrForm.iso_number} onChange={(e) => updateFmrField('iso_number', e.target.value)} />
            </div>
            <div>
              <label className="muted">Building / Area</label>
              <input className="input" value={fmrForm.building_area} onChange={(e) => updateFmrField('building_area', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="muted">Delivery Area / Drop-off Location</label>
            <input className="input" value={fmrForm.dropoff_location} onChange={(e) => updateFmrField('dropoff_location', e.target.value)} placeholder="Example: Building 2, pipe rack west side, mechanical yard..." />
          </div>

          <div className="card-soft">
            <div className="card-section-title">Material Items</div>
            <div className="list">
              {fmrForm.items.map((item, index) => (
                <div key={index} className="row" style={{ alignItems: 'end' }}>
                  <div>
                    <label className="muted">Qty</label>
                    <input className="input" type="number" min="0" step="0.01" value={item.quantity_requested} onChange={(e) => updateFmrItem(index, 'quantity_requested', e.target.value)} />
                  </div>
                  <div>
                    <label className="muted">Unit</label>
                    <select value={item.unit} onChange={(e) => updateFmrItem(index, 'unit', e.target.value)}>
                      {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: 3 }}>
                    <label className="muted">Item</label>
                    <input className="input" value={item.item_name} onChange={(e) => updateFmrItem(index, 'item_name', e.target.value)} placeholder='Example: 20" Shoe B1500 SP' />
                  </div>
                  <div style={{ flex: 2 }}>
                    <label className="muted">Notes</label>
                    <input className="input" value={item.notes} onChange={(e) => updateFmrItem(index, 'notes', e.target.value)} />
                  </div>
                  <button className="btn small danger" type="button" onClick={() => removeFmrItem(index)}>Remove</button>
                </div>
              ))}
            </div>
            <button className="btn small" type="button" onClick={addFmrItem} style={{ marginTop: 12 }}>+ Add Item</button>
          </div>

          <div>
            <label className="muted">Notes</label>
            <textarea className="input" value={fmrForm.notes} onChange={(e) => updateFmrField('notes', e.target.value)} />
          </div>

          <button className="btn primary" type="submit" disabled={saving}>{saving ? 'Creating…' : 'Create FMR'}</button>
        </form>
      ) : null}

      {activeTab === 'queue' ? (
        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">FMR Queue</div>
          <input className="input" style={{ marginTop: 14 }} value={requestSearch} onChange={(e) => setRequestSearch(e.target.value)} placeholder="Search FMR number, requester, ISO, equipment tag, item, or delivery area..." />

          <div className="list" style={{ marginTop: 16 }}>
            {filteredRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                items={itemsByRequestId[request.id] || []}
                onStatusChange={updateRequestStatus}
                saving={saving}
              />
            ))}
          </div>
        </div>
      ) : null}

      {activeTab === 'inventory' ? (
        <div className="grid two" style={{ alignItems: 'start' }}>
          <form onSubmit={addInventory} className="card rounded-xl grid" style={{ padding: 22 }}>
            <div className="card-section-title">Add Inventory Item</div>
            <input className="input" placeholder="Item name" value={inventoryForm.item_name} onChange={(e) => setInventoryForm((p) => ({ ...p, item_name: e.target.value }))} />
            <div className="row">
              <input className="input" type="number" min="0" step="0.01" placeholder="Quantity" value={inventoryForm.quantity_on_hand} onChange={(e) => setInventoryForm((p) => ({ ...p, quantity_on_hand: e.target.value }))} />
              <select value={inventoryForm.unit} onChange={(e) => setInventoryForm((p) => ({ ...p, unit: e.target.value }))}>
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <select value={inventoryForm.storage_area} onChange={(e) => setInventoryForm((p) => ({ ...p, storage_area: e.target.value }))}>
              {STORAGE_AREAS.map((area) => <option key={area} value={area}>{area}</option>)}
            </select>
            <input className="input" placeholder="Storage detail" value={inventoryForm.storage_detail} onChange={(e) => setInventoryForm((p) => ({ ...p, storage_detail: e.target.value }))} />
            <textarea className="input" placeholder="Notes" value={inventoryForm.notes} onChange={(e) => setInventoryForm((p) => ({ ...p, notes: e.target.value }))} />
            <button className="btn primary" type="submit" disabled={saving}>Add Inventory</button>
          </form>

          <form onSubmit={applyInventoryMovement} className="card rounded-xl grid" style={{ padding: 22 }}>
            <div className="card-section-title">Inventory Movement</div>
            <select value={movementForm.inventory_id} onChange={(e) => setMovementForm((p) => ({ ...p, inventory_id: e.target.value }))}>
              <option value="">Select inventory item</option>
              {inventory.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.item_name} · {item.storage_area} · Qty {item.quantity_on_hand} {item.unit}
                </option>
              ))}
            </select>
            <select value={movementForm.movement_type} onChange={(e) => setMovementForm((p) => ({ ...p, movement_type: e.target.value }))}>
              {MOVEMENT_TYPES.map((type) => <option key={type} value={type}>{prettyStatus(type)}</option>)}
            </select>
            <div className="row">
              <input className="input" type="number" min="0" step="0.01" placeholder="Quantity" value={movementForm.quantity} onChange={(e) => setMovementForm((p) => ({ ...p, quantity: e.target.value }))} />
              <select value={movementForm.unit} onChange={(e) => setMovementForm((p) => ({ ...p, unit: e.target.value }))}>
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <input className="input" placeholder="Reference number / FMR / packing slip" value={movementForm.reference_number} onChange={(e) => setMovementForm((p) => ({ ...p, reference_number: e.target.value }))} />
            <textarea className="input" placeholder="Notes" value={movementForm.notes} onChange={(e) => setMovementForm((p) => ({ ...p, notes: e.target.value }))} />
            <button className="btn primary" type="submit" disabled={saving}>Save Movement</button>
          </form>

          <div className="card rounded-xl" style={{ padding: 22, gridColumn: '1 / -1' }}>
            <div className="card-section-title">Inventory List</div>
            <input className="input" style={{ marginTop: 14 }} value={inventorySearch} onChange={(e) => setInventorySearch(e.target.value)} placeholder="Search material, location, notes..." />
            <div className="list">
              {filteredInventory.map((item) => (
                <div key={item.id} className="card-soft">
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontWeight: 900 }}>{item.item_name}</div>
                      <div className="muted">{item.storage_area} · {item.storage_detail || 'No detail'}</div>
                      <div className="muted">{item.notes || 'No notes'}</div>
                    </div>
                    <div className="badge">{item.quantity_on_hand || 0} {item.unit || 'ea'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {activeTab === 'receiving' ? (
        <div className="grid two" style={{ alignItems: 'start' }}>
          <form onSubmit={createReceivingLog} className="card rounded-xl grid" style={{ padding: 22 }}>
            <div className="card-section-title">Receiving Log</div>

            <div className="row">
              <input className="input" placeholder="Vendor" value={receivingForm.vendor} onChange={(e) => setReceivingForm((p) => ({ ...p, vendor: e.target.value }))} />
              <input className="input" placeholder="Manufacturer" value={receivingForm.manufacturer} onChange={(e) => setReceivingForm((p) => ({ ...p, manufacturer: e.target.value }))} />
            </div>

            <div className="row">
              <input className="input" placeholder="Carrier" value={receivingForm.carrier} onChange={(e) => setReceivingForm((p) => ({ ...p, carrier: e.target.value }))} />
              <input className="input" placeholder="Truck type" value={receivingForm.truck_type} onChange={(e) => setReceivingForm((p) => ({ ...p, truck_type: e.target.value }))} />
            </div>

            <div className="row">
              <input className="input" placeholder="PO Number" value={receivingForm.po_number} onChange={(e) => setReceivingForm((p) => ({ ...p, po_number: e.target.value }))} />
              <input className="input" placeholder="Packing Slip Number" value={receivingForm.packing_slip_number} onChange={(e) => setReceivingForm((p) => ({ ...p, packing_slip_number: e.target.value }))} />
            </div>

            <div className="row">
              <input className="input" placeholder="Received By" value={receivingForm.received_by} onChange={(e) => setReceivingForm((p) => ({ ...p, received_by: e.target.value }))} />
              <input className="input" type="date" value={receivingForm.received_date} onChange={(e) => setReceivingForm((p) => ({ ...p, received_date: e.target.value }))} />
            </div>

            <select value={receivingForm.offload_location} onChange={(e) => setReceivingForm((p) => ({ ...p, offload_location: e.target.value }))}>
              {STORAGE_AREAS.map((area) => <option key={area} value={area}>{area}</option>)}
            </select>

            <label className="form-check">
              <input className="form-check-input" type="checkbox" checked={receivingForm.paperwork_signed} onChange={(e) => setReceivingForm((p) => ({ ...p, paperwork_signed: e.target.checked }))} />
              <span className="form-check-label">Paperwork signed</span>
            </label>

            <label className="form-check">
              <input className="form-check-input" type="checkbox" checked={receivingForm.checked_into_inventory} onChange={(e) => setReceivingForm((p) => ({ ...p, checked_into_inventory: e.target.checked }))} />
              <span className="form-check-label">Check these items into inventory now</span>
            </label>

            <div className="card-soft">
              <div className="card-section-title">Received Items</div>
              <div className="list">
                {receivingForm.items.map((item, index) => (
                  <div key={index} className="row" style={{ alignItems: 'end' }}>
                    <input className="input" placeholder="Item name" value={item.item_name} onChange={(e) => updateReceivingItem(index, 'item_name', e.target.value)} />
                    <input className="input" type="number" min="0" step="0.01" placeholder="Qty" value={item.quantity_received} onChange={(e) => updateReceivingItem(index, 'quantity_received', e.target.value)} />
                    <select value={item.unit} onChange={(e) => updateReceivingItem(index, 'unit', e.target.value)}>
                      {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                    <select value={item.storage_area} onChange={(e) => updateReceivingItem(index, 'storage_area', e.target.value)}>
                      {STORAGE_AREAS.map((area) => <option key={area} value={area}>{area}</option>)}
                    </select>
                    <button className="btn small danger" type="button" onClick={() => removeReceivingItem(index)}>Remove</button>
                  </div>
                ))}
              </div>
              <button className="btn small" type="button" onClick={addReceivingItem} style={{ marginTop: 12 }}>+ Add Item</button>
            </div>

            <textarea className="input" placeholder="Notes" value={receivingForm.notes} onChange={(e) => setReceivingForm((p) => ({ ...p, notes: e.target.value }))} />
            <button className="btn primary" type="submit" disabled={saving}>Save Receiving Log</button>
          </form>

          <div className="card rounded-xl" style={{ padding: 22 }}>
            <div className="card-section-title">Recent Receiving</div>
            <div className="list">
              {receivingLogs.map((log) => (
                <div key={log.id} className="card-soft">
                  <div style={{ fontWeight: 900 }}>{log.vendor || log.manufacturer || 'Unknown vendor'}</div>
                  <div className="muted">Packing Slip: {log.packing_slip_number || '—'} · PO: {log.po_number || '—'}</div>
                  <div className="muted">Received: {log.received_date || '—'} · {log.offload_location || 'No location'}</div>
                  <div className="badge" style={{ marginTop: 10 }}>{prettyStatus(log.status)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {activeTab === 'plant-map' ? (
        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">Plant Map / Jobsite Locations</div>
          <p className="card-section-subtitle">MVP location directory. Later this can become an uploaded map with clickable pins.</p>

          <div className="list">
            {plantLocations.map((location) => (
              <div key={location.id} className="card-soft">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontWeight: 900 }}>{location.location_name}</div>
                    <div className="muted">{location.location_code || 'No code'} · {location.area_type || 'Location'} · {location.plant_zone || 'No zone'}</div>
                    <div style={{ marginTop: 8 }}>{location.description || 'No description yet.'}</div>
                    <div className="muted" style={{ marginTop: 8 }}>Delivery notes: {location.delivery_notes || '—'}</div>
                  </div>
                  <div className="badge">{prettyStatus(location.status)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function Metric({ title, value }) {
  return (
    <div className="card-soft">
      <div className="muted">{title}</div>
      <div className="h2">{value}</div>
    </div>
  )
}

function RequestCard({ request, items, onStatusChange, saving }) {
  return (
    <div className="card-soft">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontWeight: 900 }}>
            {request.fmr_number || 'FMR Pending'} · {request.requested_by || 'Unknown Requester'}
          </div>
          <div className="muted">
            {request.request_date || 'No date'} · {request.dropoff_location || 'No delivery area'}
          </div>
          <div className="muted">
            Equipment: {request.equipment_tag || '—'} · ISO: {request.iso_number || '—'}
          </div>
        </div>

        <div>
          <span className="badge" style={statusStyle(request.status)}>{prettyStatus(request.status)}</span>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        {items.length === 0 ? (
          <div className="muted">No items attached.</div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="muted">
              {item.quantity_requested} {item.unit || 'ea'} · {item.item_name}
              {item.notes ? ` · ${item.notes}` : ''}
            </div>
          ))
        )}
      </div>

      <div className="row" style={{ marginTop: 14 }}>
        {REQUEST_STATUSES.map((status) => (
          <button
            key={status}
            className={`btn small ${request.status === status ? 'primary' : ''}`}
            type="button"
            disabled={saving}
            onClick={() => onStatusChange(request, status)}
          >
            {prettyStatus(status)}
          </button>
        ))}
      </div>
    </div>
  )
}