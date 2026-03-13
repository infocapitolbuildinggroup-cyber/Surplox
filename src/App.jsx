import React, { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { supabase } from './supabaseClient'

import Home from './pages/Home'
import Auth from './pages/Auth'
import Feed from './pages/Feed'
import NewPost from './pages/NewPost'
import PostDetail from './pages/PostDetail'
import WorkerProfile from './pages/WorkerProfile'
import MyAccount from './pages/MyAccount'
import Notifications from './pages/Notifications'
import Channels from './pages/Channels'
import Onboarding from './pages/Onboarding'
import AdminDirectory from './pages/AdminDirectory'

import './styles.css'

function usePreferredLanguage() {
  const [lang, setLang] = useState(localStorage.getItem('surplox_lang') || 'en')

  useEffect(() => {
    localStorage.setItem('surplox_lang', lang)
  }, [lang])

  return [lang, setLang]
}

function AppShell({ lang, setLang }) {
  const location = useLocation()
  const [session, setSession] = useState(null)
  const [loadingSession, setLoadingSession] = useState(true)
  const [logoError, setLogoError] = useState(false)

  useEffect(() => {
    let mounted = true

    async function loadSession() {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      setSession(data.session || null)
      setLoadingSession(false)
    }

    loadSession()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession || null)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const navItems = useMemo(() => {
    if (!session) {
      return [
        { to: '/', label: lang === 'es' ? 'Inicio' : 'Home' },
        { to: '/auth', label: lang === 'es' ? 'Entrar' : 'Sign In' }
      ]
    }

    return [
      { to: '/feed', label: 'Feed' },
      { to: '/channels', label: lang === 'es' ? 'Canales' : 'Channels' },
      { to: '/new', label: lang === 'es' ? 'Nueva publicación' : 'New Post' },
      { to: '/notifications', label: lang === 'es' ? 'Alertas' : 'Alerts' },
      { to: '/account', label: lang === 'es' ? 'Mi cuenta' : 'My Account' }
    ]
  }, [session, lang])

  const homeCtaLinks = useMemo(() => {
    return {
      labor: '/feed',
      delivery: '/feed?category=jobsite_support&support=material_delivery',
      repair: '/feed?category=jobsite_support&support=equipment_fleet_repair'
    }
  }, [])

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/'
    return location.pathname.startsWith(to)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  if (loadingSession) {
    return (
      <div className="page-shell">
        <div className="container" style={{ paddingTop: 40, paddingBottom: 40 }}>
          <div className="card">Loading Surplox…</div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-shell">
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backdropFilter: 'blur(16px)',
          background: 'rgba(255,255,255,0.82)',
          borderBottom: '1px solid rgba(17,17,17,0.06)'
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            paddingTop: 14,
            paddingBottom: 14
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <Link
              to={session ? '/feed' : '/'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                textDecoration: 'none',
                color: 'var(--text)'
              }}
            >
              {!logoError ? (
                <img
                  src="/logo.png"
                  alt="Surplox"
                  style={{
                    width: 34,
                    height: 34,
                    objectFit: 'contain',
                    display: 'block'
                  }}
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: '#111111',
                    color: '#ffffff',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 900,
                    fontSize: 14
                  }}
                >
                  S
                </div>
              )}

              <div>
                <div
                  style={{
                    fontWeight: 900,
                    fontSize: 20,
                    letterSpacing: '-0.04em',
                    lineHeight: 1
                  }}
                >
                  Surplox
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--muted-soft)',
                    marginTop: 3
                  }}
                >
                  {lang === 'es'
                    ? 'Red de operaciones de obra'
                    : 'Jobsite operations network'}
                </div>
              </div>
            </Link>

            {session ? (
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  flexWrap: 'wrap'
                }}
              >
                <Link className="badge" to={homeCtaLinks.labor} style={{ textDecoration: 'none' }}>
                  {lang === 'es' ? 'Labor' : 'Labor'}
                </Link>
                <Link className="badge" to={homeCtaLinks.delivery} style={{ textDecoration: 'none' }}>
                  {lang === 'es' ? 'Entrega' : 'Delivery'}
                </Link>
                <Link className="badge" to={homeCtaLinks.repair} style={{ textDecoration: 'none' }}>
                  {lang === 'es' ? 'Reparación' : 'Repair'}
                </Link>
              </div>
            ) : null}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flexWrap: 'wrap',
              justifyContent: 'flex-end'
            }}
          >
            <select
              className="input"
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              style={{
                width: 112,
                minWidth: 112,
                paddingTop: 10,
                paddingBottom: 10
              }}
            >
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>

            {session ? (
              <button className="btn" onClick={handleSignOut}>
                {lang === 'es' ? 'Salir' : 'Sign Out'}
              </button>
            ) : (
              <Link className="btn primary" to="/auth">
                {lang === 'es' ? 'Entrar' : 'Sign In'}
              </Link>
            )}
          </div>
        </div>

        <div className="container" style={{ paddingBottom: 12 }}>
          <nav
            style={{
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap'
            }}
          >
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={isActive(item.to) ? 'btn primary small' : 'btn small'}
                style={{ textDecoration: 'none' }}
              >
                {item.label}
              </Link>
            ))}

            {session ? (
              <>
                <Link
                  to="/feed?category=jobsite_support&support=material_delivery"
                  className={
                    location.search.includes('support=material_delivery')
                      ? 'btn primary small'
                      : 'btn small'
                  }
                  style={{ textDecoration: 'none' }}
                >
                  {lang === 'es' ? 'Hot Shot / Entrega' : 'Hot Shot / Delivery'}
                </Link>

                <Link
                  to="/feed?category=jobsite_support&support=equipment_fleet_repair"
                  className={
                    location.search.includes('support=equipment_fleet_repair')
                      ? 'btn primary small'
                      : 'btn small'
                  }
                  style={{ textDecoration: 'none' }}
                >
                  {lang === 'es' ? 'Reparación de flota' : 'Fleet Repair'}
                </Link>

                <Link
                  to="/admin"
                  className={isActive('/admin') ? 'btn primary small' : 'btn small'}
                  style={{ textDecoration: 'none' }}
                >
                  Admin
                </Link>
              </>
            ) : null}
          </nav>
        </div>
      </header>

      <main>
        <div className="container" style={{ paddingTop: 22, paddingBottom: 32 }}>
          <Routes>
            <Route path="/" element={<Home lang={lang} />} />
            <Route path="/auth" element={<Auth lang={lang} setLang={setLang} />} />
            <Route
              path="/feed"
              element={session ? <Feed lang={lang} /> : <Navigate to="/auth" replace />}
            />
            <Route
              path="/new"
              element={session ? <NewPost lang={lang} /> : <Navigate to="/auth" replace />}
            />
            <Route
              path="/p/:id"
              element={session ? <PostDetail lang={lang} /> : <Navigate to="/auth" replace />}
            />
            <Route
              path="/u/:userId"
              element={session ? <WorkerProfile lang={lang} /> : <Navigate to="/auth" replace />}
            />
            <Route
              path="/account"
              element={
                session ? (
                  <MyAccount lang={lang} setLang={setLang} />
                ) : (
                  <Navigate to="/auth" replace />
                )
              }
            />
            <Route
              path="/notifications"
              element={session ? <Notifications lang={lang} /> : <Navigate to="/auth" replace />}
            />
            <Route
              path="/channels"
              element={session ? <Channels lang={lang} /> : <Navigate to="/auth" replace />}
            />
            <Route
              path="/onboarding"
              element={
                session ? (
                  <Onboarding lang={lang} setLang={setLang} />
                ) : (
                  <Navigate to="/auth" replace />
                )
              }
            />
            <Route
              path="/admin"
              element={session ? <AdminDirectory lang={lang} /> : <Navigate to="/auth" replace />}
            />
            <Route path="*" element={<Navigate to={session ? '/feed' : '/'} replace />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

export default function App() {
  const [lang, setLang] = usePreferredLanguage()
  return <AppShell lang={lang} setLang={setLang} />
}