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

function LanguageSlider({ lang, setLang }) {
  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-grid',
        gridTemplateColumns: '1fr 1fr',
        alignItems: 'center',
        width: 148,
        padding: 4,
        borderRadius: 999,
        background: '#ecebe6',
        border: '1px solid rgba(17,17,17,0.05)'
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 4,
          left: lang === 'en' ? 4 : 'calc(50% + 0px)',
          width: 'calc(50% - 4px)',
          height: 'calc(100% - 8px)',
          borderRadius: 999,
          background: 'var(--accent)',
          transition: 'left 0.22s ease'
        }}
      />

      <button
        type="button"
        onClick={() => setLang('en')}
        style={{
          position: 'relative',
          zIndex: 1,
          border: 'none',
          background: 'transparent',
          padding: '10px 14px',
          borderRadius: 999,
          fontWeight: 800,
          fontSize: 14,
          color: '#111111',
          cursor: 'pointer'
        }}
      >
        EN
      </button>

      <button
        type="button"
        onClick={() => setLang('es')}
        style={{
          position: 'relative',
          zIndex: 1,
          border: 'none',
          background: 'transparent',
          padding: '10px 14px',
          borderRadius: 999,
          fontWeight: 800,
          fontSize: 14,
          color: '#111111',
          cursor: 'pointer'
        }}
      >
        ES
      </button>
    </div>
  )
}

function MenuIcon() {
  return (
    <svg className="nav-icon-svg" viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg className="nav-icon-svg" viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function AppShell({ lang, setLang }) {
  const location = useLocation()
  const [session, setSession] = useState(null)
  const [loadingSession, setLoadingSession] = useState(true)
  const [logoError, setLogoError] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname, location.search])

  const navItems = useMemo(() => {
    if (!session) return []

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

  const quickLinks = useMemo(() => {
    if (!session) return []

    return [
      { to: homeCtaLinks.labor, label: lang === 'es' ? 'Labor' : 'Labor' },
      { to: homeCtaLinks.delivery, label: lang === 'es' ? 'Entrega' : 'Delivery' },
      { to: homeCtaLinks.repair, label: lang === 'es' ? 'Reparación' : 'Repair' }
    ]
  }, [homeCtaLinks, lang, session])

  const extendedNavItems = useMemo(() => {
    if (!session) return []

    return [
      ...navItems,
      {
        to: '/feed?category=jobsite_support&support=material_delivery',
        label: lang === 'es' ? 'Hot Shot / Entrega' : 'Hot Shot / Delivery',
        isActive: location.pathname === '/feed' && location.search.includes('support=material_delivery')
      },
      {
        to: '/feed?category=jobsite_support&support=equipment_fleet_repair',
        label: lang === 'es' ? 'Reparación de flota' : 'Fleet Repair',
        isActive:
          location.pathname === '/feed' &&
          location.search.includes('support=equipment_fleet_repair')
      },
      {
        to: '/admin',
        label: 'Admin',
        isActive: location.pathname.startsWith('/admin')
      }
    ]
  }, [lang, location.pathname, location.search, navItems, session])

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

  const showNav = navItems.length > 0 || !!session

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
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
            paddingTop: 10,
            paddingBottom: 10
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
            <Link
              to="/"
              aria-label={lang === 'es' ? 'Ir al inicio de Surplox' : 'Go to Surplox home'}
              style={{
                display: 'inline-flex',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                textDecoration: 'none',
                color: 'var(--text)',
                marginTop: -2
              }}
            >
              {!logoError ? (
                <img
                  src="/logo.png"
                  alt="Surplox"
                  style={{
                    width: 58,
                    height: 58,
                    objectFit: 'contain',
                    display: 'block'
                  }}
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 16,
                    background: '#111111',
                    color: '#ffffff',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 900,
                    fontSize: 20
                  }}
                >
                  S
                </div>
              )}
            </Link>

            {session ? (
              <div className="nav-session-shortcuts">
                {quickLinks.map((item) => (
                  <Link key={item.to} className="badge" to={item.to} style={{ textDecoration: 'none' }}>
                    {item.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>

          <div className="nav-header-actions">
            <LanguageSlider lang={lang} setLang={setLang} />

            <div className="nav-desktop-auth">
              {session ? (
                <button className="btn" onClick={handleSignOut}>
                  {lang === 'es' ? 'Salir' : 'Sign Out'}
                </button>
              ) : (
                <>
                  <Link className="btn" to="/auth?mode=signin">
                    {lang === 'es' ? 'Entrar' : 'Sign In'}
                  </Link>
                  <Link className="btn primary" to="/auth?mode=signup">
                    {lang === 'es' ? 'Únete' : 'Join'}
                  </Link>
                </>
              )}
            </div>

            <button
              type="button"
              className="btn nav-mobile-toggle"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {showNav ? (
          <div className="container nav-desktop-nav" style={{ paddingBottom: 12 }}>
            <nav
              style={{
                display: 'flex',
                gap: 10,
                flexWrap: 'wrap'
              }}
            >
              {extendedNavItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={item.isActive || isActive(item.to) ? 'btn primary small' : 'btn small'}
                  style={{ textDecoration: 'none' }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        ) : null}

        {mobileMenuOpen ? (
          <div className="container nav-mobile-menu">
            {quickLinks.length > 0 ? (
              <div className="nav-mobile-shortcuts">
                {quickLinks.map((item) => (
                  <Link key={item.to} className="badge" to={item.to}>
                    {item.label}
                  </Link>
                ))}
              </div>
            ) : null}

            <div className="nav-mobile-menu-list">
              {session
                ? extendedNavItems.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={item.isActive || isActive(item.to) ? 'btn primary small' : 'btn small'}
                    >
                      {item.label}
                    </Link>
                  ))
                : null}

              {session ? (
                <button className="btn nav-mobile-signout" onClick={handleSignOut}>
                  {lang === 'es' ? 'Salir' : 'Sign Out'}
                </button>
              ) : (
                <>
                  <Link className="btn" to="/auth?mode=signin">
                    {lang === 'es' ? 'Entrar' : 'Sign In'}
                  </Link>
                  <Link className="btn primary" to="/auth?mode=signup">
                    {lang === 'es' ? 'Únete' : 'Join'}
                  </Link>
                </>
              )}
            </div>
          </div>
        ) : null}
      </header>

      <main>
        <div className="container" style={{ paddingTop: 22, paddingBottom: 32 }}>
          <Routes>
            <Route path="/" element={<Home lang={lang} />} />
            <Route path="/auth" element={<Auth lang={lang} setLang={setLang} />} />
            <Route
              path="/feed"
              element={session ? <Feed lang={lang} /> : <Navigate to="/auth?mode=signin" replace />}
            />
            <Route
              path="/new"
              element={session ? <NewPost lang={lang} /> : <Navigate to="/auth?mode=signin" replace />}
            />
            <Route
              path="/p/:id"
              element={session ? <PostDetail lang={lang} /> : <Navigate to="/auth?mode=signin" replace />}
            />
            <Route
              path="/u/:userId"
              element={session ? <WorkerProfile lang={lang} /> : <Navigate to="/auth?mode=signin" replace />}
            />
            <Route
              path="/account"
              element={
                session ? (
                  <MyAccount lang={lang} setLang={setLang} />
                ) : (
                  <Navigate to="/auth?mode=signin" replace />
                )
              }
            />
            <Route
              path="/notifications"
              element={session ? <Notifications lang={lang} /> : <Navigate to="/auth?mode=signin" replace />}
            />
            <Route
              path="/channels"
              element={session ? <Channels lang={lang} /> : <Navigate to="/auth?mode=signin" replace />}
            />
            <Route
              path="/onboarding"
              element={
                session ? (
                  <Onboarding lang={lang} setLang={setLang} />
                ) : (
                  <Navigate to="/auth?mode=signin" replace />
                )
              }
            />
            <Route
              path="/admin"
              element={session ? <AdminDirectory lang={lang} /> : <Navigate to="/auth?mode=signin" replace />}
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