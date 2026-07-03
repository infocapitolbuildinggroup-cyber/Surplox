import React from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
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
          Surplox Industrial
        </div>

        <div className="h1" style={{ maxWidth: 920 }}>
          Industrial material management for the yard, warehouse, and field.
        </div>

        <p className="muted" style={{ marginTop: 12, maxWidth: 920, fontSize: 17, lineHeight: 1.75 }}>
          Digitize field material requests, warehouse inventory, vendor receiving, issue tracking,
          returns, damaged material, plant locations, and communication in one role-based system.
        </p>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
          <Link className="btn primary" to="/auth?mode=signin">
            Sign In
          </Link>

          <Link className="btn" to="/auth?mode=signup">
            Create Account
          </Link>
        </div>
      </div>

      <div className="grid three">
        <FeatureCard title="Digital FMRs" body="Create, track, accept, pick, load, deliver, and close field material requests." />
        <FeatureCard title="Warehouse Inventory" body="Keep the master inventory visible to warehouse users while hiding counts from field users." />
        <FeatureCard title="Vendor Receiving" body="Log incoming vendor deliveries, packing slips, POs, offload locations, and checked-in material." />
        <FeatureCard title="Field Deliveries" body="Track material leaving the yard and moving to the correct plant location." />
        <FeatureCard title="Returns" body="Document unused material returning from the field and add it back to usable inventory." />
        <FeatureCard title="Damaged Material" body="Record unusable, rejected, or damaged material so inventory stays accurate." />
      </div>

      <div className="card rounded-xl" style={{ padding: 24 }}>
        <div className="card-section-title">Built for role-based industrial workflows</div>
        <p className="muted" style={{ marginTop: 10, lineHeight: 1.75, maxWidth: 920 }}>
          Warehouse workers see receiving, inventory, field delivery, returns, and damaged material.
          Field workers only see request creation, request status, plant locations, messages, and alerts.
        </p>

        <div className="grid two" style={{ marginTop: 16 }}>
          <AccessCard
            title="Warehouse Operations"
            items={[
              'FMR Queue',
              'Inventory',
              'Receiving',
              'Field Delivery',
              'Returns',
              'Damaged Material'
            ]}
          />

          <AccessCard
            title="Field Operations"
            items={[
              'New FMR',
              'My Requests',
              'Delivery Status',
              'Plant Map',
              'Messages',
              'Alerts'
            ]}
          />
        </div>
      </div>

      <div className="card surface-dark rounded-xl" style={{ padding: 28 }}>
        <div className="h1" style={{ color: '#ffffff', maxWidth: 860 }}>
          Replace paper forms, scattered calls, and unknown material status.
        </div>

        <p
          style={{
            marginTop: 12,
            color: 'rgba(255,255,255,0.82)',
            lineHeight: 1.8,
            maxWidth: 900
          }}
        >
          Surplox Industrial gives industrial construction teams one operating board for material
          requests, movement, receiving, and yard communication.
        </p>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
          <Link className="btn primary" to="/auth?mode=signin">
            Enter Yard Manager
          </Link>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ title, body }) {
  return (
    <div className="card rounded-xl" style={{ padding: 22 }}>
      <div className="badge" style={{ marginBottom: 12, background: '#f1e7a8', color: '#111111' }}>
        Yard Manager
      </div>

      <div style={{ fontWeight: 900, fontSize: 22, lineHeight: 1.15 }}>
        {title}
      </div>

      <p className="muted" style={{ marginTop: 10, lineHeight: 1.7 }}>
        {body}
      </p>
    </div>
  )
}

function AccessCard({ title, items }) {
  return (
    <div className="card-soft">
      <div style={{ fontWeight: 900, fontSize: 18 }}>
        {title}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
        {items.map((item) => (
          <span key={item} className="badge">
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}