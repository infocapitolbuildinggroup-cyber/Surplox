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

const ADMIN_EMAIL = 'davd@capitolbuildinggroup.com'

function usePreferredLanguage() {
  const [lang, setLang] = useState(localStorage.getItem('surplox_lang') || 'en')

  useEffect(() => {
    localStorage.setItem('surplox_lang', lang)
  }, [lang])

  return [lang, setLang]
}

function LanguageSlider({ lang, setLang }) {
  return (
    <div className="lang-toggle" aria-label="Language switcher">
      <div className={`lang-toggle-thumb ${lang === 'es' ? 'is-es' : 'is-en'}`} />

      <button
        type="button"
        onClick={() => setLang('en')}
        className={`lang-toggle-btn ${lang === 'en' ? 'is-active' : ''}`}
      >
        EN
      </button>

      <button
        type="button"
        onClick={() => setLang('es')}
        className={`lang-toggle-btn ${lang === 'es' ? 'is-active' : ''}`}
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

  const currentEmail = session?.user?.email?.toLowerCase?.() || ''
  const isAdmin = currentEmail === ADMIN_EMAIL

  const navItems = useMemo(() => {
    if (!session) return []

    const items = [
      { to: '/feed', label: 'Feed' },
      { to: '/channels', label: lang === 'es' ? 'Canales' : 'Channels' },
      { to: '/new', label: lang === 'es' ? 'Nueva publicación' : 'New Post' },
      { to: '/notifications', label: lang === 'es' ? 'Alertas' : 'Alerts' },
      { to: '/account', label: lang === 'es' ? 'Mi cuenta' : 'My Account' },
      {
        to: '/feed?category=jobsite_support&support=material_delivery',
        label: lang === 'es' ? 'Hot Shot / Entrega' : 'Hot Shot / Delivery',
        isSearchActive: 'support=material_delivery'
      },
      {
        to: '/feed?category=jobsite_support&support=equipment_fleet_repair',
        label: lang === 'es' ? 'Equipo / Reparación de flota' : 'Equipment / Fleet Repair',
        isSearchActive: 'support=equipment_fleet_repair'
      }
    ]

    if (isAdmin) {
      items.push({
        to: '/admin',
        label: 'Admin'
      })
    }

    return items
  }, [session, lang, isAdmin])

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

  const isActive = (item) => {
    if (item.isSearchActive) {
      return location.pathname === '/feed' && location.search.includes(item.isSearchActive)
    }
    if (item.to === '/') return location.pathname === '/'
    return location.pathname.startsWith(item.to)
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
        <div className="container nav-shell">
          <div className="nav-shell-left">
            <Link
              to="/"
              aria-label={lang === 'es' ? 'Ir al inicio de Surplox' : 'Go to Surplox home'}
              className="nav-logo-link"
            >
              {!logoError ? (
                <img
                  src="/logo.png"
                  alt="Surplox"
                  className="nav-logo-image"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="nav-logo-fallback">S</div>
              )}
            </Link>

            {session ? (
              <div className="nav-session-shortcuts">
                {quickLinks.map((item) => (
                  <Link key={item.to} className="badge" to={item.to}>
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
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={isActive(item) ? 'btn primary small' : 'btn small'}
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
                ? navItems.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={isActive(item) ? 'btn primary small' : 'btn small'}
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
              element={
                session && isAdmin ? (
                  <AdminDirectory lang={lang} />
                ) : (
                  <Navigate to="/feed" replace />
                )
              }
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