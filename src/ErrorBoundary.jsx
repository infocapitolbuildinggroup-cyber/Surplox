import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Surplox runtime crash:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            background: '#f7f7f2',
            color: '#111111',
            padding: '40px',
            fontFamily:
              'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial'
          }}
        >
          <div
            style={{
              maxWidth: '900px',
              margin: '0 auto',
              background: '#ffffff',
              border: '1px solid #e6e5dc',
              borderRadius: '18px',
              padding: '24px',
              boxShadow: '0 10px 28px rgba(17, 17, 17, 0.06)'
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                padding: '8px 12px',
                borderRadius: '999px',
                background: '#fff0b4',
                fontWeight: 800,
                marginBottom: '14px'
              }}
            >
              Surplox Runtime Error
            </div>

            <h1 style={{ margin: 0, fontSize: '28px', lineHeight: 1.1 }}>
              The live app hit a client-side crash.
            </h1>

            <p style={{ marginTop: '12px', color: '#5f5f57', lineHeight: 1.7 }}>
              This usually means a render path, browser state, or runtime dependency failed after deployment.
            </p>

            <pre
              style={{
                marginTop: '18px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                background: '#f8f7ef',
                borderRadius: '14px',
                padding: '16px',
                overflowX: 'auto'
              }}
            >
              {String(this.state.error)}
            </pre>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}