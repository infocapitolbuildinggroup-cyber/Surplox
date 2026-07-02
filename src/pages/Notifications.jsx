import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

function todayDate() {
  return new Date().toISOString().slice(0, 10)
}

function timeAgo(ts) {
  if (!ts) return ''

  const date = new Date(ts)
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`

  return `${Math.floor(seconds / 86400)}d ago`
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
  return { background: '#ecebe3', color: '#111111' }
}

function priorityStyle(priority) {
  if (priority === 'shutdown-critical') return { background: '#111111', color: '#ffffff' }
  if (priority === 'urgent') return { background: '#ffde59', color: '#111111' }
  return { background: '#ecebe3', color: '#111111' }
}

function movementStyle(type) {
  if (type === 'received') return { background: '#dcf4e5', color: '#177245' }
  if (type === 'issued_to_field') return { background: '#d8ecff', color: '#0d3f73' }
  if (type === 'returned_from_field') return { background: '#fff0b4', color: '#111111' }
  if (type === 'damaged') return { background: '#111111', color: '#ffffff' }
  if (type === 'adjustment') return { background: '#ecebe3', color: '#111111' }
  return { background: '#ecebe3', color: '#111111' }
}

export default function Notifications() {
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [requests, setRequests] = useState([])
  const [requestItems, setRequestItems] = useState([])
  const [receivingLogs, setReceivingLogs] = useState([])
  const [movements, setMovements] = useState([])

  useEffect(() => {
    loadAlerts()
  }, [])

  async function loadAlerts() {
    setLoading(true)
    setMessage('')

    try {
      const [requestsRes, requestItemsRes, receivingRes, movementsRes] = await Promise.all([
        supabase
          .from('yard_requests')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(75),

        supabase
          .from('yard_request_items')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(200),

        supabase
          .from('receiving_log')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50),

        supabase
          .from('yard_inventory_movements')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(75)
      ])

      if (requestsRes.error) throw requestsRes.error
      if (requestItemsRes.error) throw requestItemsRes.error
      if (receivingRes.error) throw receivingRes.error
      if (movementsRes.error) throw movementsRes.error

      setRequests(requestsRes.data || [])
      setRequestItems(requestItemsRes.data || [])
      setReceivingLogs(receivingRes.data || [])
      setMovements(movementsRes.data || [])
    } catch (error) {
      console.error(error)
      setMessage('Unable to load industrial alerts.')
    } finally {
      setLoading(false)
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

  const today = todayDate()

  const stats = useMemo(() => {
    return {
      newRequests: requests.filter((item) => item.status === 'new').length,
      picking: requests.filter((item) => item.status === 'picking' || item.status === 'partial').length,
      ready: requests.filter((item) => item.status === 'ready').length,
      deliveredToday: requests.filter(
        (item) => item.status === 'delivered' && String(item.issued_date || '').slice(0, 10) === today
      ).length,
      urgent: requests.filter(
        (item) => item.priority === 'urgent' || item.priority === 'shutdown-critical'
      ).length,
      receivingToday: receivingLogs.filter(
        (item) => String(item.received_date || '').slice(0, 10) === today
      ).length,
      damaged: movements.filter((item) => item.movement_type === 'damaged').length,
      returns: movements.filter((item) => item.movement_type === 'returned_from_field').length
    }
  }, [requests, receivingLogs, movements, today])

  const priorityRequests = useMemo(() => {
    return requests
      .filter((item) => item.priority === 'urgent' || item.priority === 'shutdown-critical' || item.status === 'new')
      .slice(0, 12)
  }, [requests])

  const readyRequests = useMemo(() => {
    return requests.filter((item) => item.status === 'ready').slice(0, 10)
  }, [requests])

  const activeRequests = useMemo(() => {
    return requests
      .filter((item) => !['delivered', 'closed'].includes(item.status))
      .slice(0, 20)
  }, [requests])

  const recentOperations = useMemo(() => {
    const receivingEvents = receivingLogs.slice(0, 12).map((item) => ({
      id: `receiving-${item.id}`,
      type: 'receiving',
      title: item.vendor || item.manufacturer || 'Vendor delivery',
      subtitle: `Packing Slip: ${item.packing_slip_number || '—'} · PO: ${item.po_number || '—'}`,
      detail: `Offload: ${item.offload_location || 'No location'} · Status: ${prettyStatus(item.status)}`,
      created_at: item.created_at,
      badge: 'Receiving',
      style: { background: '#dcf4e5', color: '#177245' }
    }))

    const movementEvents = movements.slice(0, 18).map((item) => ({
      id: `movement-${item.id}`,
      type: 'movement',
      title: prettyStatus(item.movement_type),
      subtitle: `${item.quantity || 0} ${item.unit || 'ea'} · ${item.reference_number || 'No reference'}`,
      detail: item.notes || 'No notes',
      created_at: item.created_at,
      badge: prettyStatus(item.movement_type),
      style: movementStyle(item.movement_type)
    }))

    return [...receivingEvents, ...movementEvents]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 18)
  }, [receivingLogs, movements])

  if (loading) {
    return <div className="card">Loading industrial alerts…</div>
  }

  return (
    <div className="grid" style={{ gap: 18 }}>
      {message ? (
        <div className="card-soft" style={{ background: '#fff4da' }}>
          {message}
        </div>
      ) : null}

      <div
        className="card rounded-xl"
        style={{
          padding: 24,
          background: 'linear-gradient(180deg, #fff7cf 0%, #ffffff 100%)'
        }}
      >
        <div className="badge">Surplox Industrial Alerts</div>

        <div className="h1" style={{ marginTop: 14 }}>
          Order Queue & Material Alerts
        </div>

        <p className="muted" style={{ marginTop: 10, maxWidth: 900, lineHeight: 1.7 }}>
          Live view of FMRs, receiving activity, inventory movements, returns, damaged material, and ready-for-delivery requests.
        </p>

        <div className="row" style={{ marginTop: 18 }}>
          <Link className="btn primary" to="/yard">
            Open Yard Manager
          </Link>

          <button className="btn" type="button" onClick={loadAlerts}>
            Refresh Alerts
          </button>
        </div>
      </div>

      <div className="row">
        <Metric title="New FMRs" value={stats.newRequests} />
        <Metric title="Picking / Partial" value={stats.picking} />
        <Metric title="Ready" value={stats.ready} />
        <Metric title="Urgent / Critical" value={stats.urgent} />
        <Metric title="Delivered Today" value={stats.deliveredToday} />
        <Metric title="Receiving Today" value={stats.receivingToday} />
        <Metric title="Returns" value={stats.returns} />
        <Metric title="Damaged" value={stats.damaged} />
      </div>

      {priorityRequests.length > 0 ? (
        <div className="card rounded-xl" style={{ padding: 22, background: '#fffaf0' }}>
          <div className="card-section-title">Priority FMRs</div>
          <p className="card-section-subtitle" style={{ marginTop: 8 }}>
            New, urgent, and shutdown-critical requests that need yard attention.
          </p>

          <div className="list" style={{ marginTop: 14 }}>
            {priorityRequests.map((request) => (
              <RequestAlert
                key={request.id}
                request={request}
                items={itemsByRequestId[request.id] || []}
              />
            ))}
          </div>
        </div>
      ) : null}

      {readyRequests.length > 0 ? (
        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">Ready for Field Delivery</div>
          <p className="card-section-subtitle" style={{ marginTop: 8 }}>
            Requests marked ready and waiting to be taken from the yard to the plant.
          </p>

          <div className="list" style={{ marginTop: 14 }}>
            {readyRequests.map((request) => (
              <RequestAlert
                key={request.id}
                request={request}
                items={itemsByRequestId[request.id] || []}
              />
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid two" style={{ alignItems: 'start' }}>
        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">Active FMR Queue</div>
          <p className="card-section-subtitle" style={{ marginTop: 8 }}>
            All open requests that are not delivered or closed.
          </p>

          {activeRequests.length === 0 ? (
            <div className="card-soft" style={{ marginTop: 14 }}>
              No active FMRs right now.
            </div>
          ) : (
            <div className="list" style={{ marginTop: 14 }}>
              {activeRequests.map((request) => (
                <RequestAlert
                  key={request.id}
                  request={request}
                  items={itemsByRequestId[request.id] || []}
                  compact
                />
              ))}
            </div>
          )}
        </div>

        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">Recent Operations</div>
          <p className="card-section-subtitle" style={{ marginTop: 8 }}>
            Receiving, inventory updates, field issues, returns, and damaged material.
          </p>

          {recentOperations.length === 0 ? (
            <div className="card-soft" style={{ marginTop: 14 }}>
              No recent operations yet.
            </div>
          ) : (
            <div className="list" style={{ marginTop: 14 }}>
              {recentOperations.map((event) => (
                <div key={event.id} className="card-soft">
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontWeight: 900 }}>{event.title}</div>
                      <div className="muted">{event.subtitle}</div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span className="badge" style={event.style}>
                        {event.badge}
                      </span>
                      <span className="badge">
                        {timeAgo(event.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="muted" style={{ marginTop: 8 }}>
                    {event.detail}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
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

function RequestAlert({ request, items, compact = false }) {
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

          {!compact ? (
            <div className="muted">
              Equipment: {request.equipment_tag || '—'} · ISO: {request.iso_number || '—'}
            </div>
          ) : null}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'start' }}>
          <span className="badge" style={priorityStyle(request.priority)}>
            {prettyStatus(request.priority || 'normal')}
          </span>
          <span className="badge" style={statusStyle(request.status)}>
            {prettyStatus(request.status)}
          </span>
          <span className="badge">
            {timeAgo(request.created_at)}
          </span>
        </div>
      </div>

      {!compact ? (
        <div style={{ marginTop: 12 }}>
          {items.length === 0 ? (
            <div className="muted">No items attached.</div>
          ) : (
            items.slice(0, 6).map((item) => (
              <div key={item.id} className="muted">
                {item.quantity_requested} {item.unit || 'ea'} · {item.item_name}
                {item.notes ? ` · ${item.notes}` : ''}
              </div>
            ))
          )}

          {items.length > 6 ? (
            <div className="muted">+ {items.length - 6} more items</div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}