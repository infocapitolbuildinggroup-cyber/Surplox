import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useUser } from '../context/UserContext'

const STORAGE_AREAS = ['Mexico', 'Oklahoma Yard', 'Warehouse / Main Yard', 'Stainless Tent']
const REQUEST_STATUSES = ['new', 'accepted', 'picking', 'partial', 'ready', 'loaded', 'in_transit', 'delivered', 'closed']
const PRIORITIES = ['normal', 'urgent', 'shutdown-critical']
const UNITS = ['ea', 'sticks', 'ft', 'boxes', 'crates', 'bundles']

function todayDate() {
  return new Date().toISOString().slice(0, 10)
}

function nowIso() {
  return new Date().toISOString()
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

function emptyMovementForm(type = 'adjustment') {
  return {
    inventory_id: '',
    movement_type: type,
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

function statusStyle(status) {
  if (status === 'new') return { background: '#fff0b4', color: '#111111' }
  if (status === 'accepted') return { background: '#f1e7a8', color: '#111111' }
  if (status === 'picking') return { background: '#d8ecff', color: '#0d3f73' }
  if (status === 'partial') return { background: '#fff4da', color: '#8a5a00' }
  if (status === 'ready') return { background: '#dcf4e5', color: '#177245' }
  if (status === 'loaded') return { background: '#e8f6ee', color: '#177245' }
  if (status === 'in_transit') return { background: '#111111', color: '#ffffff' }
  if (status === 'delivered') return { background: '#111111', color: '#ffffff' }
  if (status === 'closed') return { background: '#ecebe3', color: '#111111' }
  return {}
}

function movementLabel(type) {
  if (type === 'issued_to_field') return 'Issued To Field'
  if (type === 'returned_from_field') return 'Returned From Field'
  if (type === 'damaged') return 'Damaged Material'
  if (type === 'received') return 'Received'
  return prettyStatus(type)
}

function nextWorkflowAction(status) {
  if (status === 'new') return { label: 'Accept Order', next: 'accepted' }
  if (status === 'accepted') return { label: 'Start Picking', next: 'picking' }
  if (status === 'picking' || status === 'partial') return { label: 'Mark Ready', next: 'ready' }
  if (status === 'ready') return { label: 'Load Material', next: 'loaded' }
  if (status === 'loaded') return { label: 'Start Delivery', next: 'in_transit' }
  if (status === 'in_transit') return { label: 'Mark Delivered', next: 'delivered' }
  if (status === 'delivered') return { label: 'Close FMR', next: 'closed' }
  return null
}

export default function YardManager() {
  const { user, profile, permissions } = useUser()

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

  const workerName =
    profile?.full_name ||
    profile?.role_title ||
    user?.email ||
    'Warehouse User'

  useEffect(() => {
    loadAll()
  }, [permissions?.inventory, permissions?.receiving, permissions?.fieldDelivery, permissions?.returns, permissions?.damaged])

  useEffect(() => {
    if (!canUseTab(activeTab)) {
      setActiveTab('dashboard')
    }
  }, [activeTab, permissions])

  function canUseTab(tab) {
    if (tab === 'dashboard') return Boolean(permissions.dashboard)
    if (tab === 'new-fmr') return Boolean(permissions.newFMR)
    if (tab === 'my-requests') return Boolean(permissions.myRequests)
    if (tab === 'queue') return Boolean(permissions.queue)
    if (tab === 'inventory') return Boolean(permissions.inventory)
    if (tab === 'receiving') return Boolean(permissions.receiving)
    if (tab === 'field-delivery') return Boolean(permissions.fieldDelivery)
    if (tab === 'returns') return Boolean(permissions.returns)
    if (tab === 'damaged') return Boolean(permissions.damaged)
    if (tab === 'plant-map') return Boolean(permissions.plantMap)
    return false
  }

  async function loadAll() {
    setLoading(true)
    setError('')

    try {
      const requestQuery = supabase
        .from('yard_requests')
        .select('*')
        .order('created_at', { ascending: false })

      const [
        requestsRes,
        requestItemsRes,
        locationsRes,
        inventoryRes,
        receivingRes,
        movementsRes
      ] = await Promise.all([
        requestQuery,
        supabase.from('yard_request_items').select('*').order('created_at', { ascending: true }),
        supabase.from('plant_locations').select('*').order('location_name'),
        permissions.inventory || permissions.fieldDelivery || permissions.returns || permissions.damaged
          ? supabase.from('yard_inventory').select('*').order('item_name')
          : Promise.resolve({ data: [], error: null }),
        permissions.receiving
          ? supabase.from('receiving_log').select('*').order('created_at', { ascending: false })
          : Promise.resolve({ data: [], error: null }),
        permissions.inventory || permissions.fieldDelivery || permissions.returns || permissions.damaged
          ? supabase.from('yard_inventory_movements').select('*').order('created_at', { ascending: false }).limit(75)
          : Promise.resolve({ data: [], error: null })
      ])

      if (requestsRes.error) throw requestsRes.error
      if (requestItemsRes.error) throw requestItemsRes.error
      if (locationsRes.error) throw locationsRes.error
      if (inventoryRes.error) throw inventoryRes.error
      if (receivingRes.error) throw receivingRes.error
      if (movementsRes.error) throw movementsRes.error

      setRequests(requestsRes.data || [])
      setRequestItems(requestItemsRes.data || [])
      setPlantLocations(locationsRes.data || [])
      setInventory(inventoryRes.data || [])
      setReceivingLogs(receivingRes.data || [])
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

  function openMovementTab(type, tab) {
    if (!canUseTab(tab)) return
    setMovementForm(emptyMovementForm(type))
    setActiveTab(tab)
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

      const userId = user?.id || null

      const { data: request, error: requestError } = await supabase
        .from('yard_requests')
        .insert({
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
        })
        .select('*')
        .single()

      if (requestError) throw requestError

      const { error: itemError } = await supabase.from('yard_request_items').insert(
        validItems.map((item) => ({
          request_id: request.id,
          item_name: item.item_name,
          quantity_requested: item.quantity_requested,
          unit: item.unit,
          notes: item.notes
        }))
      )

      if (itemError) throw itemError

      setFmrForm(emptyFmrForm())
      showMessage(`Created ${request.fmr_number || 'new FMR'}.`)
      await loadAll()
      setActiveTab(permissions.queue ? 'queue' : 'my-requests')
    } catch (err) {
      console.error(err)
      setError(err?.message || 'Unable to create FMR.')
    } finally {
      setSaving(false)
    }
  }

  async function advanceRequest(request) {
    const action = nextWorkflowAction(request.status)
    if (!action) return

    setSaving(true)
    setError('')

    try {
      const payload = {
        status: action.next,
        updated_by: user?.id || null
      }

      if (action.next === 'accepted') {
        payload.assigned_to = request.assigned_to || workerName
        payload.accepted_at = request.accepted_at || nowIso()
      }

      if (action.next === 'picking') {
        payload.assigned_to = request.assigned_to || workerName
        payload.picking_started_at = request.picking_started_at || nowIso()
      }

      if (action.next === 'ready') {
        payload.picking_finished_at = request.picking_finished_at || nowIso()
      }

      if (action.next === 'loaded') {
        payload.loaded_at = request.loaded_at || nowIso()
      }

      if (action.next === 'in_transit') {
        payload.delivery_started_at = request.delivery_started_at || nowIso()
        payload.delivered_by = request.delivered_by || workerName
      }

      if (action.next === 'delivered') {
        payload.delivered_at = request.delivered_at || nowIso()
        payload.issued_date = todayDate()
        payload.delivered_by = request.delivered_by || workerName
      }

      if (action.next === 'closed') {
        payload.closed_at = request.closed_at || nowIso()
      }

      const { error: updateError } = await supabase
        .from('yard_requests')
        .update(payload)
        .eq('id', request.id)

      if (updateError) throw updateError

      showMessage(`${request.fmr_number || 'FMR'} moved to ${prettyStatus(action.next)}.`)
      await loadAll()
    } catch (err) {
      console.error(err)
      setError(err?.message || 'Unable to update FMR workflow.')
    } finally {
      setSaving(false)
    }
  }

  async function updateRequestStatus(request, nextStatus) {
    setSaving(true)
    setError('')

    try {
      const payload = { status: nextStatus, updated_by: user?.id || null }

      if (nextStatus === 'delivered') {
        payload.delivered_at = nowIso()
        payload.issued_date = todayDate()
        payload.delivered_by = request.delivered_by || workerName
      }

      if (nextStatus === 'closed') {
        payload.closed_at = nowIso()
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
      if (!permissions.inventory) throw new Error('You do not have access to inventory.')
      if (!inventoryForm.item_name.trim()) throw new Error('Item name is required.')

      const { error: insertError } = await supabase.from('yard_inventory').insert({
        item_name: inventoryForm.item_name.trim(),
        quantity_on_hand: cleanNumber(inventoryForm.quantity_on_hand),
        unit: inventoryForm.unit,
        storage_area: inventoryForm.storage_area,
        storage_detail: inventoryForm.storage_detail.trim(),
        notes: inventoryForm.notes.trim(),
        created_by: user?.id || null,
        updated_by: user?.id || null
      })

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
      const tabAllowed =
        (movementForm.movement_type === 'issued_to_field' && permissions.fieldDelivery) ||
        (movementForm.movement_type === 'returned_from_field' && permissions.returns) ||
        (movementForm.movement_type === 'damaged' && permissions.damaged) ||
        permissions.inventory

      if (!tabAllowed) throw new Error('You do not have access to this inventory movement.')
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

      const { error: movementError } = await supabase.from('yard_inventory_movements').insert({
        inventory_id: selected.id,
        movement_type: movementForm.movement_type,
        quantity: qty,
        unit: movementForm.unit,
        from_location: movementForm.from_location.trim(),
        to_location: movementForm.to_location.trim(),
        reference_number: movementForm.reference_number.trim(),
        notes: movementForm.notes.trim(),
        created_by: user?.id || null
      })

      if (movementError) throw movementError

      const { error: updateError } = await supabase
        .from('yard_inventory')
        .update({
          quantity_on_hand: nextQty,
          updated_by: user?.id || null
        })
        .eq('id', selected.id)

      if (updateError) throw updateError

      const label = movementLabel(movementForm.movement_type)
      setMovementForm(emptyMovementForm(movementForm.movement_type))
      showMessage(`${label} saved.`)
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
      if (!permissions.receiving) throw new Error('You do not have access to receiving.')
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
          created_by: user?.id || null,
          updated_by: user?.id || null
        })
        .select('*')
        .single()

      if (receivingError) throw receivingError

      const { error: itemError } = await supabase.from('receiving_log_items').insert(
        validItems.map((item) => ({
          receiving_id: receiving.id,
          item_name: item.item_name,
          quantity_received: item.quantity_received,
          unit: item.unit,
          storage_area: item.storage_area,
          notes: item.notes
        }))
      )

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
                updated_by: user?.id || null
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
              created_by: user?.id || null
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
                created_by: user?.id || null,
                updated_by: user?.id || null
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
                created_by: user?.id || null
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

  const itemsByRequestId = useMemo(() => {
    const map = {}
    requestItems.forEach((item) => {
      if (!map[item.request_id]) map[item.request_id] = []
      map[item.request_id].push(item)
    })
    return map
  }, [requestItems])

  const myRequests = useMemo(() => {
    return requests.filter((request) => {
      if (request.created_by && user?.id && request.created_by === user.id) return true
      if (profile?.full_name && request.requested_by === profile.full_name) return true
      if (user?.email && request.field_contact === user.email) return true
      return false
    })
  }, [requests, user?.id, user?.email, profile?.full_name])

  const visibleDashboardRequests = permissions.queue ? requests : myRequests

  const stats = useMemo(() => {
    const today = todayDate()
    const statRequests = permissions.queue ? requests : myRequests

    return {
      newRequests: statRequests.filter((r) => r.status === 'new').length,
      picking: statRequests.filter((r) => r.status === 'picking' || r.status === 'partial').length,
      ready: statRequests.filter((r) => r.status === 'ready').length,
      deliveredToday: statRequests.filter((r) => r.status === 'delivered' && String(r.issued_date || '').slice(0, 10) === today).length,
      receivingToday: permissions.receiving ? receivingLogs.filter((r) => String(r.received_date || '').slice(0, 10) === today).length : 0,
      inventoryRows: permissions.inventory ? inventory.length : 0,
      returns: permissions.returns ? movements.filter((m) => m.movement_type === 'returned_from_field').length : 0,
      damaged: permissions.damaged ? movements.filter((m) => m.movement_type === 'damaged').length : 0
    }
  }, [requests, myRequests, receivingLogs, inventory, movements, permissions])

  const filteredRequests = useMemo(() => {
    const base = permissions.queue ? requests : myRequests
    const q = requestSearch.trim().toLowerCase()
    if (!q) return base

    return base.filter((request) => {
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
  }, [requests, myRequests, requestSearch, itemsByRequestId, permissions.queue])

  const filteredInventory = useMemo(() => {
    const q = inventorySearch.trim().toLowerCase()
    if (!q) return inventory

    return inventory.filter((item) => {
      const haystack = [item.item_name, item.storage_area, item.storage_detail, item.notes, item.unit]
        .join(' ')
        .toLowerCase()

      return haystack.includes(q)
    })
  }, [inventory, inventorySearch])

  if (loading) {
    return <div className="card">Loading Yard Manager…</div>
  }

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="card rounded-xl" style={{ padding: 24, background: 'linear-gradient(180deg, #fff7cf 0%, #ffffff 100%)' }}>
        <div className="badge" style={{ marginBottom: 12 }}>
          {profile?.permission_group ? prettyStatus(profile.permission_group) : 'Surplox Industrial'}
        </div>
        <div className="h1">Yard Manager</div>
        <p className="muted" style={{ marginTop: 10, maxWidth: 900, lineHeight: 1.7 }}>
          Digital FMRs, request tracking, material movement, plant locations, and role-based access for field and warehouse teams.
        </p>

        <div className="row" style={{ marginTop: 18 }}>
          {permissions.dashboard ? <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')}>Dashboard</TabButton> : null}
          {permissions.newFMR ? <TabButton active={activeTab === 'new-fmr'} onClick={() => setActiveTab('new-fmr')}>New FMR</TabButton> : null}
          {permissions.myRequests ? <TabButton active={activeTab === 'my-requests'} onClick={() => setActiveTab('my-requests')}>My Requests</TabButton> : null}
          {permissions.queue ? <TabButton active={activeTab === 'queue'} onClick={() => setActiveTab('queue')}>FMR Queue</TabButton> : null}
          {permissions.inventory ? <TabButton active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')}>Inventory</TabButton> : null}
          {permissions.receiving ? <TabButton active={activeTab === 'receiving'} onClick={() => setActiveTab('receiving')}>Receiving</TabButton> : null}
          {permissions.fieldDelivery ? <TabButton active={activeTab === 'field-delivery'} onClick={() => openMovementTab('issued_to_field', 'field-delivery')}>Field Delivery</TabButton> : null}
          {permissions.returns ? <TabButton active={activeTab === 'returns'} onClick={() => openMovementTab('returned_from_field', 'returns')}>Returns</TabButton> : null}
          {permissions.damaged ? <TabButton active={activeTab === 'damaged'} onClick={() => openMovementTab('damaged', 'damaged')}>Damaged</TabButton> : null}
          {permissions.plantMap ? <TabButton active={activeTab === 'plant-map'} onClick={() => setActiveTab('plant-map')}>Plant Map</TabButton> : null}
        </div>
      </div>

      {error ? <div className="card-soft" style={{ background: '#fff4da' }}>{error}</div> : null}
      {msg ? <div className="card-soft" style={{ background: '#dcf4e5', color: '#177245' }}>{msg}</div> : null}

      {activeTab === 'dashboard' ? (
        <Dashboard
          permissions={permissions}
          stats={stats}
          requests={visibleDashboardRequests}
          itemsByRequestId={itemsByRequestId}
          movements={movements}
          saving={saving}
          onAdvance={advanceRequest}
          setActiveTab={setActiveTab}
          openMovementTab={openMovementTab}
        />
      ) : null}

      {activeTab === 'new-fmr' && permissions.newFMR ? (
        <NewFmrForm
          form={fmrForm}
          setField={updateFmrField}
          setItem={updateFmrItem}
          addItem={addFmrItem}
          removeItem={removeFmrItem}
          onSubmit={createFmr}
          saving={saving}
        />
      ) : null}

      {activeTab === 'my-requests' && permissions.myRequests ? (
        <RequestList
          title="My Requests"
          requests={filteredRequests}
          itemsByRequestId={itemsByRequestId}
          saving={saving}
          onAdvance={permissions.queue ? advanceRequest : null}
          requestSearch={requestSearch}
          setRequestSearch={setRequestSearch}
        />
      ) : null}

      {activeTab === 'queue' && permissions.queue ? (
        <RequestList
          title="FMR Queue"
          requests={filteredRequests}
          itemsByRequestId={itemsByRequestId}
          saving={saving}
          onAdvance={advanceRequest}
          requestSearch={requestSearch}
          setRequestSearch={setRequestSearch}
        />
      ) : null}

      {activeTab === 'inventory' && permissions.inventory ? (
        <InventoryTab
          inventoryForm={inventoryForm}
          setInventoryForm={setInventoryForm}
          filteredInventory={filteredInventory}
          inventorySearch={inventorySearch}
          setInventorySearch={setInventorySearch}
          addInventory={addInventory}
          saving={saving}
        />
      ) : null}

      {activeTab === 'receiving' && permissions.receiving ? (
        <ReceivingTab
          form={receivingForm}
          setForm={setReceivingForm}
          updateItem={updateReceivingItem}
          addItem={addReceivingItem}
          removeItem={removeReceivingItem}
          onSubmit={createReceivingLog}
          receivingLogs={receivingLogs}
          saving={saving}
        />
      ) : null}

      {['field-delivery', 'returns', 'damaged'].includes(activeTab) && canUseTab(activeTab) ? (
        <MovementTab
          activeTab={activeTab}
          inventory={inventory}
          movementForm={movementForm}
          setMovementForm={setMovementForm}
          onSubmit={applyInventoryMovement}
          saving={saving}
        />
      ) : null}

      {activeTab === 'plant-map' && permissions.plantMap ? (
        <PlantMapTab plantLocations={plantLocations} />
      ) : null}
    </div>
  )
}

function TabButton({ active, onClick, children }) {
  return (
    <button className={`btn ${active ? 'primary' : ''}`} type="button" onClick={onClick}>
      {children}
    </button>
  )
}

function Dashboard({ permissions, stats, requests, itemsByRequestId, movements, saving, onAdvance, setActiveTab, openMovementTab }) {
  return (
    <div className="grid">
      <div className="row">
        <Metric title="New FMRs" value={stats.newRequests} />
        <Metric title="Picking / Partial" value={stats.picking} />
        <Metric title="Ready" value={stats.ready} />
        <Metric title="Delivered Today" value={stats.deliveredToday} />
        {permissions.receiving ? <Metric title="Receiving Today" value={stats.receivingToday} /> : null}
        {permissions.inventory ? <Metric title="Inventory Rows" value={stats.inventoryRows} /> : null}
        {permissions.returns ? <Metric title="Returns" value={stats.returns} /> : null}
        {permissions.damaged ? <Metric title="Damaged" value={stats.damaged} /> : null}
      </div>

      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="card-section-title">Quick Actions</div>
        <div className="row" style={{ marginTop: 14 }}>
          {permissions.newFMR ? <button className="btn primary" type="button" onClick={() => setActiveTab('new-fmr')}>Create FMR</button> : null}
          {permissions.myRequests ? <button className="btn" type="button" onClick={() => setActiveTab('my-requests')}>My Requests</button> : null}
          {permissions.queue ? <button className="btn" type="button" onClick={() => setActiveTab('queue')}>Open FMR Queue</button> : null}
          {permissions.receiving ? <button className="btn" type="button" onClick={() => setActiveTab('receiving')}>Receive Vendor Delivery</button> : null}
          {permissions.fieldDelivery ? <button className="btn" type="button" onClick={() => openMovementTab('issued_to_field', 'field-delivery')}>Field Delivery</button> : null}
          {permissions.returns ? <button className="btn" type="button" onClick={() => openMovementTab('returned_from_field', 'returns')}>Return Material</button> : null}
          {permissions.damaged ? <button className="btn" type="button" onClick={() => openMovementTab('damaged', 'damaged')}>Report Damaged</button> : null}
        </div>
      </div>

      <div className="grid two">
        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">{permissions.queue ? 'Newest FMRs' : 'My Recent Requests'}</div>
          <div className="list">
            {requests.slice(0, 6).map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                items={itemsByRequestId[request.id] || []}
                saving={saving}
                onAdvance={permissions.queue ? onAdvance : null}
              />
            ))}
          </div>
        </div>

        {permissions.inventory ? (
          <div className="card rounded-xl" style={{ padding: 22 }}>
            <div className="card-section-title">Recent Inventory Movements</div>
            <div className="list">
              {movements.slice(0, 8).map((move) => (
                <div key={move.id} className="card-soft">
                  <div style={{ fontWeight: 900 }}>{movementLabel(move.movement_type)}</div>
                  <div className="muted">{move.quantity} {move.unit} · {move.reference_number || 'No reference'}</div>
                  <div className="muted">{move.notes || 'No notes'}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card rounded-xl" style={{ padding: 22 }}>
            <div className="card-section-title">Request Status Guide</div>
            <div className="list">
              {REQUEST_STATUSES.map((status) => (
                <div key={status} className="card-soft">
                  <span className="badge" style={statusStyle(status)}>{prettyStatus(status)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function RequestList({ title, requests, itemsByRequestId, saving, onAdvance, requestSearch, setRequestSearch }) {
  return (
    <div className="card rounded-xl" style={{ padding: 22 }}>
      <div className="card-section-title">{title}</div>
      <input
        className="input"
        style={{ marginTop: 14 }}
        value={requestSearch}
        onChange={(e) => setRequestSearch(e.target.value)}
        placeholder="Search FMR number, requester, ISO, equipment tag, item, or delivery area..."
      />

      <div className="list" style={{ marginTop: 16 }}>
        {requests.map((request) => (
          <RequestCard
            key={request.id}
            request={request}
            items={itemsByRequestId[request.id] || []}
            saving={saving}
            onAdvance={onAdvance}
          />
        ))}
      </div>
    </div>
  )
}

function NewFmrForm({ form, setField, setItem, addItem, removeItem, onSubmit, saving }) {
  return (
    <form onSubmit={onSubmit} className="card rounded-xl grid" style={{ padding: 22 }}>
      <div>
        <div className="card-section-title">Create Field Material Request</div>
        <p className="card-section-subtitle">Digital version of the paper FMR. New requests automatically receive an FMR number.</p>
      </div>

      <label className="form-check">
        <input className="form-check-input" type="checkbox" checked={form.is_legacy_paper_fmr} onChange={(e) => setField('is_legacy_paper_fmr', e.target.checked)} />
        <span className="form-check-label">This is an old paper FMR being entered into the system</span>
      </label>

      {form.is_legacy_paper_fmr ? (
        <div className="row">
          <Input label="Original Paper Request Date" type="date" value={form.legacy_request_date} onChange={(v) => setField('legacy_request_date', v)} />
          <Input label="Original Requested By" value={form.legacy_requested_by} onChange={(v) => setField('legacy_requested_by', v)} />
        </div>
      ) : null}

      <div className="row">
        <Input label="Requested By" value={form.requested_by} onChange={(v) => setField('requested_by', v)} />
        <Input label="Company" value={form.company} onChange={(v) => setField('company', v)} />
        <Input label="Foreman / Crew" value={form.crew_or_foreman} onChange={(v) => setField('crew_or_foreman', v)} />
      </div>

      <div className="row">
        <Input label="Request Date" type="date" value={form.request_date} onChange={(v) => setField('request_date', v)} />
        <Input label="Needed By" type="datetime-local" value={form.needed_by} onChange={(v) => setField('needed_by', v)} />
        <div>
          <label className="muted">Priority</label>
          <select value={form.priority} onChange={(e) => setField('priority', e.target.value)}>
            {PRIORITIES.map((p) => <option key={p} value={p}>{prettyStatus(p)}</option>)}
          </select>
        </div>
      </div>

      <div className="row">
        <Input label="Equipment Tag No." value={form.equipment_tag} onChange={(v) => setField('equipment_tag', v)} />
        <Input label="ISO Number" value={form.iso_number} onChange={(v) => setField('iso_number', v)} />
        <Input label="Building / Area" value={form.building_area} onChange={(v) => setField('building_area', v)} />
      </div>

      <Input
        label="Delivery Area / Drop-off Location"
        value={form.dropoff_location}
        onChange={(v) => setField('dropoff_location', v)}
        placeholder="Example: Building 2, pipe rack west side, mechanical yard..."
      />

      <div className="card-soft">
        <div className="card-section-title">Material Items</div>
        <div className="list">
          {form.items.map((item, index) => (
            <div key={index} className="row" style={{ alignItems: 'end' }}>
              <Input label="Qty" type="number" value={item.quantity_requested} onChange={(v) => setItem(index, 'quantity_requested', v)} />
              <div>
                <label className="muted">Unit</label>
                <select value={item.unit} onChange={(e) => setItem(index, 'unit', e.target.value)}>
                  {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div style={{ flex: 3 }}>
                <Input label="Item" value={item.item_name} onChange={(v) => setItem(index, 'item_name', v)} placeholder='Example: 20" Shoe B1500 SP' />
              </div>
              <div style={{ flex: 2 }}>
                <Input label="Notes" value={item.notes} onChange={(v) => setItem(index, 'notes', v)} />
              </div>
              <button className="btn small danger" type="button" onClick={() => removeItem(index)}>Remove</button>
            </div>
          ))}
        </div>
        <button className="btn small" type="button" onClick={addItem} style={{ marginTop: 12 }}>+ Add Item</button>
      </div>

      <div>
        <label className="muted">Notes</label>
        <textarea className="input" value={form.notes} onChange={(e) => setField('notes', e.target.value)} />
      </div>

      <button className="btn primary" type="submit" disabled={saving}>{saving ? 'Creating…' : 'Create FMR'}</button>
    </form>
  )
}

function InventoryTab({ inventoryForm, setInventoryForm, filteredInventory, inventorySearch, setInventorySearch, addInventory, saving }) {
  return (
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

      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="card-section-title">Inventory Search</div>
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
  )
}

function MovementTab({ activeTab, inventory, movementForm, setMovementForm, onSubmit, saving }) {
  const title =
    activeTab === 'field-delivery'
      ? 'Field Delivery / Issue Material'
      : activeTab === 'returns'
        ? 'Returned Material'
        : 'Damaged Material'

  const subtitle =
    activeTab === 'field-delivery'
      ? 'Use this when material leaves the yard and goes to a requested plant location.'
      : activeTab === 'returns'
        ? 'Use this when unused material comes back from the field and needs to be added back into usable inventory.'
        : 'Use this when material is damaged, unusable, rejected, or needs to be removed from usable inventory.'

  return (
    <form onSubmit={onSubmit} className="card rounded-xl grid" style={{ padding: 22 }}>
      <div>
        <div className="card-section-title">{title}</div>
        <p className="card-section-subtitle" style={{ marginTop: 8 }}>{subtitle}</p>
      </div>

      <div>
        <label className="muted">Inventory Item</label>
        <select value={movementForm.inventory_id} onChange={(e) => setMovementForm((p) => ({ ...p, inventory_id: e.target.value }))}>
          <option value="">Select inventory item</option>
          {inventory.map((item) => (
            <option key={item.id} value={item.id}>
              {item.item_name} · {item.storage_area} · Qty {item.quantity_on_hand} {item.unit}
            </option>
          ))}
        </select>
      </div>

      <div className="row">
        <Input label="Quantity" type="number" value={movementForm.quantity} onChange={(v) => setMovementForm((p) => ({ ...p, quantity: v }))} />
        <div>
          <label className="muted">Unit</label>
          <select value={movementForm.unit} onChange={(e) => setMovementForm((p) => ({ ...p, unit: e.target.value }))}>
            {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>

      <div className="row">
        <Input label="From Location" value={movementForm.from_location} onChange={(v) => setMovementForm((p) => ({ ...p, from_location: v }))} placeholder="Warehouse / Main Yard, field area, etc." />
        <Input label="To Location" value={movementForm.to_location} onChange={(v) => setMovementForm((p) => ({ ...p, to_location: v }))} placeholder="Building, plant area, return area, scrap, etc." />
      </div>

      <Input label="Reference Number" value={movementForm.reference_number} onChange={(v) => setMovementForm((p) => ({ ...p, reference_number: v }))} placeholder="FMR number, packing slip, damage tag..." />

      <div>
        <label className="muted">Notes</label>
        <textarea className="input" value={movementForm.notes} onChange={(e) => setMovementForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Who requested it, who returned it, why it was damaged, where it went..." />
      </div>

      <button className="btn primary" type="submit" disabled={saving}>{saving ? 'Saving…' : `Save ${title}`}</button>
    </form>
  )
}

function ReceivingTab({ form, setForm, updateItem, addItem, removeItem, onSubmit, receivingLogs, saving }) {
  return (
    <div className="grid two" style={{ alignItems: 'start' }}>
      <form onSubmit={onSubmit} className="card rounded-xl grid" style={{ padding: 22 }}>
        <div className="card-section-title">Receiving Log</div>

        <div className="row">
          <input className="input" placeholder="Vendor" value={form.vendor} onChange={(e) => setForm((p) => ({ ...p, vendor: e.target.value }))} />
          <input className="input" placeholder="Manufacturer" value={form.manufacturer} onChange={(e) => setForm((p) => ({ ...p, manufacturer: e.target.value }))} />
        </div>

        <div className="row">
          <input className="input" placeholder="Carrier" value={form.carrier} onChange={(e) => setForm((p) => ({ ...p, carrier: e.target.value }))} />
          <input className="input" placeholder="Truck type" value={form.truck_type} onChange={(e) => setForm((p) => ({ ...p, truck_type: e.target.value }))} />
        </div>

        <div className="row">
          <input className="input" placeholder="PO Number" value={form.po_number} onChange={(e) => setForm((p) => ({ ...p, po_number: e.target.value }))} />
          <input className="input" placeholder="Packing Slip Number" value={form.packing_slip_number} onChange={(e) => setForm((p) => ({ ...p, packing_slip_number: e.target.value }))} />
        </div>

        <div className="row">
          <input className="input" placeholder="Received By" value={form.received_by} onChange={(e) => setForm((p) => ({ ...p, received_by: e.target.value }))} />
          <input className="input" type="date" value={form.received_date} onChange={(e) => setForm((p) => ({ ...p, received_date: e.target.value }))} />
        </div>

        <select value={form.offload_location} onChange={(e) => setForm((p) => ({ ...p, offload_location: e.target.value }))}>
          {STORAGE_AREAS.map((area) => <option key={area} value={area}>{area}</option>)}
        </select>

        <label className="form-check">
          <input className="form-check-input" type="checkbox" checked={form.paperwork_signed} onChange={(e) => setForm((p) => ({ ...p, paperwork_signed: e.target.checked }))} />
          <span className="form-check-label">Paperwork signed</span>
        </label>

        <label className="form-check">
          <input className="form-check-input" type="checkbox" checked={form.checked_into_inventory} onChange={(e) => setForm((p) => ({ ...p, checked_into_inventory: e.target.checked }))} />
          <span className="form-check-label">Check these items into inventory now</span>
        </label>

        <div className="card-soft">
          <div className="card-section-title">Received Items</div>
          <div className="list">
            {form.items.map((item, index) => (
              <div key={index} className="row" style={{ alignItems: 'end' }}>
                <input className="input" placeholder="Item name" value={item.item_name} onChange={(e) => updateItem(index, 'item_name', e.target.value)} />
                <input className="input" type="number" min="0" step="0.01" placeholder="Qty" value={item.quantity_received} onChange={(e) => updateItem(index, 'quantity_received', e.target.value)} />
                <select value={item.unit} onChange={(e) => updateItem(index, 'unit', e.target.value)}>
                  {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
                <select value={item.storage_area} onChange={(e) => updateItem(index, 'storage_area', e.target.value)}>
                  {STORAGE_AREAS.map((area) => <option key={area} value={area}>{area}</option>)}
                </select>
                <button className="btn small danger" type="button" onClick={() => removeItem(index)}>Remove</button>
              </div>
            ))}
          </div>
          <button className="btn small" type="button" onClick={addItem} style={{ marginTop: 12 }}>+ Add Item</button>
        </div>

        <textarea className="input" placeholder="Notes" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
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
  )
}

function PlantMapTab({ plantLocations }) {
  return (
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
  )
}

function Input({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <div>
      <label className="muted">{label}</label>
      <input className="input" type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
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

function RequestCard({ request, items, saving, onAdvance }) {
  const action = nextWorkflowAction(request.status)

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
          <div className="muted">
            Assigned To: {request.assigned_to || 'Unassigned'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'start' }}>
          <span className="badge" style={statusStyle(request.status)}>{prettyStatus(request.status)}</span>
          <span className="badge">{prettyStatus(request.priority || 'normal')}</span>
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
        {onAdvance && action ? (
          <button
            className="btn primary small"
            type="button"
            disabled={saving}
            onClick={() => onAdvance(request)}
          >
            {action.label}
          </button>
        ) : null}
      </div>
    </div>
  )
}