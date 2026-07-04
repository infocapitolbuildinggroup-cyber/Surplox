import React from 'react'
import { fieldStatusLabel, fieldStatusStyle, prettyStatus } from '../common/Shared'

export default function FieldRequestCard({ request, items, compact = false }) {
  const isUrgent = request.priority === 'urgent' || request.priority === 'shutdown-critical'

  return (
    <div className="card-soft" style={isUrgent ? { border: '1px solid #d97706', background: '#fffaf0' } : undefined}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontWeight: 950, fontSize: 18 }}>
            {request.fmr_number || 'Request Pending'}
          </div>
          <div className="muted" style={{ marginTop: 4 }}>
            {request.dropoff_location || request.building_area || 'No delivery location'}
          </div>
        </div>

        <span className="badge" style={fieldStatusStyle(request.status)}>
          {fieldStatusLabel(request.status)}
        </span>
      </div>

      {!compact ? (
        <>
          <div className="muted" style={{ marginTop: 10 }}>
            Requested: {request.request_date || 'No date'} · Priority: {prettyStatus(request.priority || 'normal')}
          </div>

          <div style={{ marginTop: 12 }}>
            {items.length === 0 ? (
              <div className="muted">No items attached.</div>
            ) : (
              items.slice(0, 4).map((item) => (
                <div key={item.id} className="muted">
                  {item.quantity_requested} {item.unit || 'ea'} · {item.item_name}
                </div>
              ))
            )}
            {items.length > 4 ? <div className="muted">+ {items.length - 4} more items</div> : null}
          </div>
        </>
      ) : null}
    </div>
  )
}