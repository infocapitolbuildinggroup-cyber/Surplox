import React from 'react'
import { nextWorkflowAction, prettyStatus, statusStyle } from '../common/Shared'

export default function RequestCard({ request, items, saving, onAdvance }) {
  const action = nextWorkflowAction(request.status)
  const isUrgent = request.priority === 'urgent' || request.priority === 'shutdown-critical'

  return (
    <div className="card-soft" style={isUrgent ? { border: '1px solid #d97706', background: '#fffaf0' } : undefined}>
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
          <span className="badge" style={isUrgent ? { background: '#fff0b4', color: '#111111' } : undefined}>
            {prettyStatus(request.priority || 'normal')}
          </span>
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
          <button className="btn primary small" type="button" disabled={saving} onClick={() => onAdvance(request)}>
            {action.label}
          </button>
        ) : null}
      </div>
    </div>
  )
}