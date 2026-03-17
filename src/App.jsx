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
import MechanicRepair from './pages/MechanicRepair'
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


function GuidedStartModal({ lang, open, onClose }) {
  if (!open) return null

  const copy =
    lang === 'es'
      ? {
          badge: 'Empieza aquí',
          title: '¿Qué necesitas hacer ahora?',
          body:
            'En vez de dejarte caer en la app sin dirección, Surplox puede llevarte directo al siguiente paso más útil.',
          findCrew: 'Encontrar cuadrilla',
          findWork: 'Encontrar trabajo',
          findMaterials: 'Encontrar materiales',
          findDelivery: 'Encontrar entrega',
          findRepair: 'Encontrar reparación',
          crewBody: 'Abre el feed con publicaciones de Se necesita cuadrilla.',
          workBody: 'Abre el feed con gente buscando trabajo y disponibilidad.',
          materialsBody: 'Abre la búsqueda de proveedores y materiales.',
          deliveryBody: 'Abre la búsqueda de conductores de entrega.',
          repairBody: 'Abre la búsqueda de mecánica y reparación de equipo.',
          skip: 'Seguir al feed',
          close: 'Cerrar'
        }
      : {
          badge: 'Start Here',
          title: 'What do you need to do right now?',
          body:
            'Instead of dropping you into the app cold, Surplox can send you straight to the most useful next step.',
          findCrew: 'Find crew',
          findWork: 'Find work',
          findMaterials: 'Find materials',
          findDelivery: 'Find delivery',
          findRepair: 'Find repair',
          crewBody: 'Open the feed focused on Need Crew posts.',
          workBody: 'Open the feed focused on Looking for Work posts and availability.',
          materialsBody: 'Open supplier and materials search.',
          deliveryBody: 'Open delivery driver search.',
          repairBody: 'Open mechanic and equipment repair search.',
          skip: 'Continue to feed',
          close: 'Close'
        }

  const options = [
    { to: '/feed?type=need_crew', title: copy.findCrew, body: copy.crewBody },
    { to: '/feed?type=looking_for_work', title: copy.findWork, body: copy.workBody },
    { to: '/materials', title: copy.findMaterials, body: copy.materialsBody },
    { to: '/delivery', title: copy.findDelivery, body: copy.deliveryBody },
    { to: '/mechanics', title: copy.findRepair, body: copy.repairBody }
  ]

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 120,
        background: 'rgba(17,17,17,0.48)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18
      }}
    >
      <div
        className="card rounded-xl"
        style={{
          width: 'min(980px, 100%)',
          maxHeight: 'calc(100vh - 36px)',
          overflowY: 'auto',
          padding: 24
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
            alignItems: 'flex-start'
          }}
        >
          <div>
            <div className="badge" style={{ marginBottom: 12, background: '#f1e7a8' }}>
              {copy.badge}
            </div>
            <div className="h1" style={{ marginTop: 0 }}>{copy.title}</div>
            <p className="muted" style={{ marginTop: 10, maxWidth: 760, lineHeight: 1.7 }}>
              {copy.body}
            </p>
          </div>

          <button type="button" className="btn small" onClick={onClose}>
            {copy.close}
          </button>
        </div>

        <div className="grid two" style={{ gap: 14, marginTop: 18 }}>
          {options.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="card-soft"
              onClick={onClose}
              style={{
                textDecoration: 'none',
                color: 'inherit',
                minHeight: 128,
                display: 'block'
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 18, lineHeight: 1.2 }}>{item.title}</div>
              <p className="muted" style={{ marginTop: 10, lineHeight: 1.7 }}>{item.body}</p>
            </Link>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
          <Link to="/feed" className="btn" onClick={onClose}>
            {copy.skip}
          </Link>
        </div>
      </div>
    </div>
  )
}

function AppShell({ lang, setLang }) {
  const location = useLocation()
  const [session, setSession] = useState(null)
  const [loadingSession, setLoadingSession] = useState(true)
  const [logoError, setLogoError] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showGuidedStart, setShowGuidedStart] = useState(false)

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
    if (!session) {
      setShowGuidedStart(false)
      return
    }

    const dismissedKey = `surplox_guided_start_dismissed_${session.user.id}`
    const shouldShow =
      location.pathname === '/feed' &&
      sessionStorage.getItem(dismissedKey) !== '1'

    setShowGuidedStart(shouldShow)
  }, [session, location.pathname])


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
      repair: '/mechanics'
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
      { to: quickLinks.repair, label: lang === 'es' ? 'Mecánica / Reparación' : 'Mechanic / Repair' },
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

  const isRepairActive = location.pathname.startsWith('/mechanics')

  function handleCloseGuidedStart() {
    if (session?.user?.id) {
      sessionStorage.setItem(`surplox_guided_start_dismissed_${session.user.id}`, '1')
    }
    setShowGuidedStart(false)
  }

  async function handleSignOut() {
    setMobileMenuOpen(false)
    setShowGuidedStart(false)
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
      <GuidedStartModal lang={lang} open={showGuidedStart} onClose={handleCloseGuidedStart} />
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
              path="/mechanics"
              element={session ? <MechanicRepair lang={lang} /> : <Navigate to="/auth?mode=signin" replace />}
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
