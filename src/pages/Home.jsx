import React from 'react'
import { Link } from 'react-router-dom'

export default function Home({ session }) {
  return (
    <div className="grid two">
      <div className="card">
        <div className="h1">Texas Trades Network</div>
        <p className="muted">
          Surplox is a members-only network for subcontractors and laborers across Texas.
          Join local trade discussions, ask questions by ZIP and radius, and stay connected
          to nearby crews.
        </p>

        <hr />

        {!session ? (
          <>
            <p className="muted" style={{ marginTop: 0 }}>
              Create your account to join the network.
            </p>

            <div className="row">
              <Link className="btn primary" to="/auth">Join Surplox</Link>
            </div>
          </>
        ) : (
          <>
            <p className="muted" style={{ marginTop: 0 }}>
              You’re signed in and ready to browse local discussions.
            </p>

            <div className="row">
              <Link className="btn primary" to="/feed">Go to Feed</Link>
              <Link className="btn" to="/new">Create Post</Link>
            </div>
          </>
        )}
      </div>

      <div className="card">
        <div className="h1">How It Works</div>
        <p className="muted">
          Posts are organized by trade and location. When someone creates a post,
          they choose a ZIP code and radius. Nearby members inside that area can
          see and respond.
        </p>

        <hr />

        <div className="muted">
          Example:
        </div>
        <p className="muted" style={{ marginTop: 8 }}>
          A post created in <span className="kbd">76031</span> with a radius of
          <span className="kbd"> 100 miles </span>
          will appear to members whose location falls inside that area.
        </p>
      </div>
    </div>
  )
}