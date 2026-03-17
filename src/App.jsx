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
import SupplierStorefront from './pages/SupplierStorefront'
import Materials from './pages/Materials'
import Delivery from './pages/Delivery'
import SupplierAiTools from './pages/SupplierAiTools'

import './styles.css'

const ADMIN_EMAILS = new Set(['david@capitolbuildinggroup.com'])

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
      className="lang-toggle"
      aria-label={lang === 'es' ? 'Selector de idioma' : 'Language selector'}
    >
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

function HamburgerIcon() {
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 4,
        width: 18,
        minWidth: 18
      }}
    >
      <span
        style={{
          display: 'block',
          width: '100%',
          height: 2,
          borderRadius: 999,
          background: 'currentColor'
        }}
      />
      <span
        style={{
          display: 'block',
          width: '100%',
          height: 2,
          borderRadius: 999,
          background: 'currentColor'
        }}
      />
      <span
        style={{
          display: 'block',
          width: '100%',
          height: 2,
          borderRadius: 999,
          background: 'currentColor'
        }}
      />
    </span>
  )
}

function getCandidateEmails(user) {
  if (!user) return []

  const identityEmails = Array.isArray(user.identities)
    ? user.identities
        .flatMap((identity) => [identity?.email, identity?.identity_data?.email])
        .filter(Boolean)
    : []

  return Array.from(
    new Set(
      [
        user.email,
        user.new_email,
        user.email_change,
        user.user_metadata?.email,
        user.app_metadata?.email,
        ...identityEmails
      ]
        .map((value) => String(value || '').trim().toLowerCase())
        .filter(Boolean)
    )
  )
}

function hasAdminAccess(user) {
  return getCandidateEmails(user).some((email) => ADMIN_EMAILS.has(email))
}

function isSupportSearchActive(search = '', values = []) {
  return values.some((value) => search.includes(`support=${value}`))
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

  useEffect(() => {
    const previousHtmlOverflow = document.documentElement.style.overflow
    const previousBodyOverflow = document.body.style.overflow

    if (mobileMenuOpen) {
      document.documentElement.style.overflow = 'hidden'
      document.body.style.overflow = 'hidden'
    } else {
      document.documentElement.style.overflow = previousHtmlOverflow
      document.body.style.overflow = previousBodyOverflow
    }

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow
      document.body.style.overflow = previousBodyOverflow
    }
  }, [mobileMenuOpen])

  const quickLinks = useMemo(() => {
    return {
      labor: '/feed',
      materials: '/materials',
      deliveryDirectory: '/delivery',
      repair: '/feed?category=jobsite_support&support=equipment_fleet_repair'
    }
  }, [])

  const navItems = useMemo(() => {
    if (!session) return []

    return [
      { to: '/feed', label: lang === 'es' ? 'Feed' : 'Feed' },
      { to: '/channels', label: lang === 'es' ? 'Canales' : 'Channels' },
      { to: '/new', label: lang === 'es' ? 'Nueva publicación' : 'New Post' },
      { to: '/materials', label: lang === 'es' ? 'Materiales' : 'Materials' },
      { to: '/delivery', label: lang === 'es' ? 'Delivery' : 'Delivery' },
      { to: quickLinks.repair, label: lang === 'es' ? 'Equipo / Reparación' : 'Equipment / Repair' },
      { to: '/ai-tools', label: lang === 'es' ? 'Surplox AI Tools' : 'Surplox AI Tools' },
      { to: '/notifications', label: lang === 'es' ? 'Alertas' : 'Alerts' },
      { to: '/account', label: lang === 'es' ? 'Mi cuenta' : 'My Account' }
    ]
  }, [session, lang, quickLinks.repair])

  const isAdmin = useMemo(() => hasAdminAccess(session?.user), [session?.user])

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/'
    return location.pathname.startsWith(to)
  }

  const isRepairActive =
    location.pathname.startsWith('/feed') &&
    isSupportSearchActive(location.search, ['equipment_fleet_repair'])

  async function handleSignOut() {
    setMobileMenuOpen(false)
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
        <div className="container">
          <div className="nav-shell">
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
            </div>

            <div className="nav-header-actions">
              <LanguageSlider lang={lang} setLang={setLang} />

              {session ? (
                <>
                  <button
                    type="button"
                    className="btn nav-mobile-toggle"
                    onClick={() => setMobileMenuOpen((prev) => !prev)}
                    aria-expanded={mobileMenuOpen}
                    aria-label={
                      mobileMenuOpen
                        ? lang === 'es'
                          ? 'Cerrar menú'
                          : 'Close menu'
                        : lang === 'es'
                          ? 'Abrir menú'
                          : 'Open menu'
                    }
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <HamburgerIcon />
                  </button>
                </>
              ) : (
                <>
                  <div className="nav-desktop-auth">
                    <Link className="btn" to="/auth?mode=signin">
                      {lang === 'es' ? 'Entrar' : 'Sign In'}
                    </Link>
                    <Link className="btn primary" to="/auth?mode=signup">
                      {lang === 'es' ? 'Únete' : 'Join'}
                    </Link>
                  </div>

                  <button
                    type="button"
                    className="btn nav-mobile-toggle"
                    onClick={() => setMobileMenuOpen((prev) => !prev)}
                    aria-expanded={mobileMenuOpen}
                    aria-label={
                      mobileMenuOpen
                        ? lang === 'es'
                          ? 'Cerrar menú'
                          : 'Close menu'
                        : lang === 'es'
                          ? 'Abrir menú'
                          : 'Open menu'
                    }
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <HamburgerIcon />
                  </button>
                </>
              )}
            </div>
          </div>

          {showNav ? (
            <div className="nav-desktop-nav" style={{ paddingBottom: 12 }}>
              <nav
                style={{
                  display: 'flex',
                  gap: 10,
                  flexWrap: 'wrap'
                }}
              >
                {navItems.map((item) => {
                  const itemIsRepair = item.to === quickLinks.repair
                  const active = itemIsRepair ? isRepairActive : isActive(item.to)

                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={active ? 'btn primary small' : 'btn small'}
                      style={{ textDecoration: 'none' }}
                    >
                      {item.label}
                    </Link>
                  )
                })}

                {session ? (
                  <>
                    {isAdmin ? (
                      <Link
                        to="/admin"
                        className={isActive('/admin') ? 'btn primary small' : 'btn small'}
                        style={{ textDecoration: 'none' }}
                      >
                        Admin
                      </Link>
                    ) : null}

                    <button type="button" className="btn small" onClick={handleSignOut}>
                      {lang === 'es' ? 'Salir' : 'Sign Out'}
                    </button>
                  </>
                ) : null}
              </nav>
            </div>
          ) : null}

          {mobileMenuOpen ? (
            <div className="nav-mobile-menu" style={{ paddingBottom: 12 }}>
              <div
                className="card rounded-xl"
                style={{
                  maxHeight: 'calc(100vh - 112px)',
                  overflowY: 'auto',
                  overscrollBehavior: 'contain',
                  WebkitOverflowScrolling: 'touch',
                  touchAction: 'pan-y',
                  padding: 14
                }}
              >
                {session ? (
                  <div
                    className="nav-mobile-menu-list"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                      paddingBottom: 12
                    }}
                  >
                    {navItems.map((item) => {
                      const itemIsRepair = item.to === quickLinks.repair
                      const active = itemIsRepair ? isRepairActive : isActive(item.to)

                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          className={active ? 'btn primary' : 'btn'}
                        >
                          {item.label}
                        </Link>
                      )
                    })}

                    {isAdmin ? (
                      <Link to="/admin" className={isActive('/admin') ? 'btn primary' : 'btn'}>
                        Admin
                      </Link>
                    ) : null}

                    <button type="button" className="btn nav-mobile-signout" onClick={handleSignOut}>
                      {lang === 'es' ? 'Salir' : 'Sign Out'}
                    </button>
                  </div>
                ) : (
                  <div className="nav-mobile-menu-list">
                    <Link className="btn" to="/auth?mode=signin">
                      {lang === 'es' ? 'Entrar' : 'Sign In'}
                    </Link>
                    <Link className="btn primary" to="/auth?mode=signup">
                      {lang === 'es' ? 'Únete' : 'Join'}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
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
              path="/materials"
              element={session ? <Materials lang={lang} /> : <Navigate to="/auth?mode=signin" replace />}
            />
            <Route
              path="/delivery"
              element={session ? <Delivery lang={lang} /> : <Navigate to="/auth?mode=signin" replace />}
            />
            <Route
              path="/ai-tools"
              element={session ? <SupplierAiTools lang={lang} /> : <Navigate to="/auth?mode=signin" replace />}
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
              path="/supplier/:userId"
              element={
                session ? <SupplierStorefront lang={lang} /> : <Navigate to="/auth?mode=signin" replace />
              }
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
              element={session && isAdmin ? <AdminDirectory lang={lang} /> : <Navigate to="/feed" replace />}
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
