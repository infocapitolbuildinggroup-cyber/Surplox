import React from 'react'

export function prettyStatus(value) {
  return String(value || '')
    .replace(/-/g, ' ')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function fieldStatusLabel(status) {
  if (status === 'new') return 'Submitted'
  if (status === 'accepted') return 'Received by Warehouse'
  if (status === 'picking' || status === 'partial' || status === 'ready') return 'Being Gathered'
  if (status === 'loaded' || status === 'in_transit') return 'On The Way'
  if (status === 'delivered' || status === 'closed') return 'Delivered'
  return 'Submitted'
}

export function statusStyle(status) {
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

export function fieldStatusStyle(status) {
  if (status === 'new') return { background: '#fff0b4', color: '#111111' }
  if (status === 'accepted' || status === 'picking' || status === 'partial' || status === 'ready') {
    return { background: '#d8ecff', color: '#0d3f73' }
  }
  if (status === 'loaded' || status === 'in_transit') return { background: '#111111', color: '#ffffff' }
  if (status === 'delivered' || status === 'closed') return { background: '#dcf4e5', color: '#177245' }
  return {}
}

export function movementLabel(type) {
  if (type === 'issued_to_field') return 'Issued To Field'
  if (type === 'returned_from_field') return 'Returned From Field'
  if (type === 'damaged') return 'Damaged Material'
  if (type === 'received') return 'Received'
  return prettyStatus(type)
}

export function nextWorkflowAction(status) {
  if (status === 'new') return { label: 'Accept Order', next: 'accepted' }
  if (status === 'accepted') return { label: 'Start Picking', next: 'picking' }
  if (status === 'picking' || status === 'partial') return { label: 'Mark Ready', next: 'ready' }
  if (status === 'ready') return { label: 'Load Material', next: 'loaded' }
  if (status === 'loaded') return { label: 'Start Delivery', next: 'in_transit' }
  if (status === 'in_transit') return { label: 'Mark Delivered', next: 'delivered' }
  if (status === 'delivered') return { label: 'Close FMR', next: 'closed' }
  return null
}

export function TabButton({ active, onClick, children }) {
  return (
    <button className={`btn ${active ? 'primary' : ''}`} type="button" onClick={onClick}>
      {children}
    </button>
  )
}

export function Input({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <div>
      <label className="muted">{label}</label>
      <input className="input" type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}

export function Metric({ title, value }) {
  return (
    <div className="card-soft">
      <div className="muted">{title}</div>
      <div className="h2">{value}</div>
    </div>
  )
}