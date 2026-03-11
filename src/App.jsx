import React, { useEffect, useMemo, useState } from 'react'
import { Routes, Route, Navigate, useNavigate, NavLink, useLocation } from 'react-router-dom'
import { supabase } from './supabaseClient'
import { t } from './i18n'
import Home from './pages/Home.jsx'
import Auth from './pages/Auth.jsx'
import Onboarding from './pages/Onboarding.jsx'
import Feed from './pages/Feed.jsx'
import NewPost from './pages/NewPost.jsx'
import PostDetail from './pages/PostDetail.jsx'
import AdminDirectory from './pages/AdminDirectory.jsx'
import Channels from './pages/Channels.jsx'
import MyAccount from './pages/MyAccount.jsx'
import Notifications from './pages/Notifications.jsx'
import WorkerProfile from './pages/WorkerProfile.jsx'
import logo from './assets/logo.png'

function SessionOnly({ session, children }) {
  if (!session) return <Navigate to="/auth?mode=signin" replace />
  return children
}

function CoreProfileOnly({ session, profileChecked, profileReady, children, lang }) {
  if (!session) return <Navigate to="/auth?mode=signin" replace />
  if (!profileChecked) return <div className="card">{t(lang, 'checking_permissions')}</div>
  if (!profileReady) return <Navigate to="/onboarding" replace />
  return children
}

function AdminOnly({ session, profileChecked, profileReady, isAdmin, adminChecked, children, lang }) {
  if (!session) return <Navigate to="/auth?mode=signin" replace />
  if (!profileChecked) return <div className="card">{t(lang, 'checking_permissions')}</div>
  if (!profileReady) return <Navigate to="/onboarding" replace />
  if (!adminChecked) return <div className="card">{t(lang, 'checking_permissions')}</div>
  if (!isAdmin) return <Navigate to="/feed" replace />
  return children
}

function AccountIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="nav-icon-svg">
      <circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <path
        d="M4 20c1.8-3.8 5-5.7 8-5.7s6.2 1.9 8 5.7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="nav-icon-svg">
      <path d="M4 7h16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M4 12h16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M4 17h16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

export default function App() {
  const [session, setSession] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminChecked, setAdminChecked] = useState(false)
  const [profileChecked, setProfileChecked] = useState(false)
  const [profileReady, setProfileReady] = useState(false)
  const [lang, setLang] = useState(localStorage.getItem('surplox_lang') || 'en')
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [savingLang, setSavingLang] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess)
      setAdminChecked(false)
      setProfileChecked(false)
      setMobileMenuOpen(false)

      if (!sess) {
        setIsAdmin(false)
        setProfileReady(false)
        setUnreadNotifications(0)
        const localLang = localStorage.getItem('surplox_lang') || 'en'
        setLang(localLang)
      }
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    async function checkProfile() {
      if (!session?.user) return

      setProfileChecked(false)
      setAdminChecked(false)

      try {
        const { data: prof, error } = await supabase
          .from('profiles')
          .select('user_id, display_name, trade_id, home_zip, preferred_language')
          .eq('user_id', session.user.id)
          .maybeSingle()

        if (error) {
          console.error(error)
        }

        const hasCoreProfile = Boolean(
          prof &&
            String(prof.display_name || '').trim() &&
            prof.trade_id &&
            String(prof.home_zip || '').trim()
        )

        setProfileReady(hasCoreProfile)
        setProfileChecked(true)

        const userLang = prof?.preferred_language || localStorage.getItem('surplox_lang') || 'en'
        setLang(userLang)
        localStorage.setItem('surplox_lang', userLang)

        if (!hasCoreProfile) {
          setIsAdmin(false)
          setAdminChecked(true)

          if (location.pathname !== '/onboarding' && location.pathname !== '/auth') {
            navigate('/onboarding', { replace: true })
          }
          return
        }

        const { data: adminFlag, error: adminErr } = await supabase.rpc('is_admin')
        if (adminErr) console.error(adminErr)

        setIsAdmin(Boolean(adminFlag))
        setAdminChecked(true)

        if (location.pathname === '/auth') {
          navigate('/feed', { replace: true })
        }
      } catch (err) {
        console.error(err)
        setProfileReady(false)
        setProfileChecked(true)
      }
    }

    checkProfile()
  }, [session?.user?.id, session?.access_token, navigate, location.pathname])

  useEffect(() => {
    async function loadUnreadCount() {
      if (!session?.user?.id || !profileReady) return

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id)
        .eq('is_read', false)

      if (error) {
        console.error(error)
        return
      }

      setUnreadNotifications(count || 0)
    }

    loadUnreadCount()
  }, [session?.user?.id, profileReady, location.pathname])

  async function updateLanguage(newLang) {
    if (!newLang || newLang === lang) return

    setLang(newLang)
    localStorage.setItem('surplox_lang', newLang)

    if (!session?.user?.id) return

    try {
      setSavingLang(true)

      const { error } = await supabase
        .from('profiles')
        .update({ preferred_language: newLang })
        .eq('user_id', session.user.id)

      if (error) {
        console.error(error)
      }
    } finally {
      setSavingLang(false)
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setMobileMenuOpen(false)
    setIsAdmin(false)
    setAdminChecked(false)
    setProfileChecked(false)
    setProfileReady(false)
    setUnreadNotifications(0)
    navigate('/', { replace: true })
  }

  function navBtnClass({ isActive }) {
    return isActive ? 'btn small nav-link nav-link-active' : 'btn small nav-link'
  }

  function adminNavBtnClass({ isActive }) {
    return isActive ? 'btn small primary nav-link nav-link-active' : 'btn small primary nav-link'
  }

  const brandTarget = session && profileChecked && !profileReady ? '/onboarding' : '/'
  const showFullAppNav = Boolean(session && profileChecked && profileReady)

  const menuItems = useMemo(() => {
    if (!showFullAppNav) return []

    const items = [
      { key: 'feed', to: '/feed', label: t(lang, 'nav_feed'), className: navBtnClass },
      { key: 'channels', to: '/channels', label: t(lang, 'nav_channels'), className: navBtnClass },
      { key: 'new', to: '/new', label: t(lang, 'nav_new_post'), className: navBtnClass },
      {
        key: 'notifications',
        to: '/notifications',
        label: t(lang, 'nav_alerts') || 'Alerts',
        className: navBtnClass,
        badge: unreadNotifications > 0 ? unreadNotifications : null
      }
    ]

    if (isAdmin) {
      items.push({
        key: 'admin',
        to: '/admin',
        label: t(lang, 'nav_admin') || 'Admin',
        className: adminNavBtnClass
      })
    }

    return items
  }, [showFullAppNav, lang, unreadNotifications, isAdmin])

  return (
    <>
      <div className="nav">
        <div className="nav-inner">
          <div className="nav-brand-row">
            <div className="nav-brand-group">
              <NavLink className="brand" to={brandTarget}>
                <img src={logo} alt="Surplox logo" className="logo" />
              </NavLink>

              <span aria-label="Surplox beta" className="beta-pill">
                Beta
              </span>
            </div>

            <div className="nav-links">
              <div className="nav-language-group">
                <button
                  type="button"
                  className={lang === 'en' ? 'btn small primary' : 'btn small'}
                  onClick={() => updateLanguage('en')}
                  disabled={savingLang}
                  aria-pressed={lang === 'en'}
                >
                  EN
                </button>

                <button
                  type="button"
                  className={lang === 'es' ? 'btn small primary' : 'btn small'}
                  onClick={() => updateLanguage('es')}
                  disabled={savingLang}
                  aria-pressed={lang === 'es'}
                >
                  ES
                </button>
              </div>

              {session ? (
                <>
                  {showFullAppNav ? (
                    <>
                      <div className="nav-desktop-links">
                        {menuItems.map((item) => (
                          <NavLink key={item.key} className={item.className} to={item.to}>
                            {item.label}
                            {item.badge ? (
                              <span
                                className="badge"
                                style={{
                                  marginLeft: 8,
                                  color: '#ff751f',
                                  borderColor: 'rgba(255, 222, 89, 0.65)',
                                  background: 'rgba(255, 222, 89, 0.14)'
                                }}
                              >
                                {item.badge}
                              </span>
                            ) : null}
                          </NavLink>
                        ))}

                        <NavLink className={navBtnClass} to="/account">
                          {t(lang, 'nav_account')}
                        </NavLink>

                        <button className="btn small danger" onClick={signOut}>
                          {t(lang, 'nav_sign_out')}
                        </button>
                      </div>

                      <div className="nav-mobile-actions">
                        <NavLink
                          className={({ isActive }) =>
                            isActive
                              ? 'btn small primary nav-icon-btn nav-link nav-link-active'
                              : 'btn small primary nav-icon-btn nav-link'
                          }
                          to="/account"
                          aria-label={t(lang, 'nav_account')}
                          title={t(lang, 'nav_account')}
                        >
                          <AccountIcon />
                        </NavLink>

                        <button
                          type="button"
                          className={`btn small nav-icon-btn ${mobileMenuOpen ? 'nav-link-active' : ''}`}
                          onClick={() => setMobileMenuOpen((prev) => !prev)}
                          aria-expanded={mobileMenuOpen}
                          aria-controls="surplox-mobile-menu"
                          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                          title={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                        >
                          <MenuIcon />
                        </button>
                      </div>
                    </>
                  ) : (
                    <NavLink className="btn small primary nav-link" to="/onboarding">
                      Finish Setup
                    </NavLink>
                  )}
                </>
              ) : (
                <NavLink className="btn small primary nav-link" to="/auth?mode=signin">
                  {t(lang, 'nav_sign_in')}
                </NavLink>
              )}
            </div>
          </div>

          {session && showFullAppNav && mobileMenuOpen ? (
            <div id="surplox-mobile-menu" className="nav-mobile-menu card-soft">
              <div className="nav-mobile-menu-list">
                {menuItems.map((item) => (
                  <NavLink key={item.key} className={item.className} to={item.to}>
                    {item.label}
                    {item.badge ? (
                      <span
                        className="badge"
                        style={{
                          marginLeft: 8,
                          color: '#ff751f',
                          borderColor: 'rgba(255, 222, 89, 0.65)',
                          background: 'rgba(255, 222, 89, 0.14)'
                        }}
                      >
                        {item.badge}
                      </span>
                    ) : null}
                  </NavLink>
                ))}

                <NavLink className={navBtnClass} to="/account">
                  {t(lang, 'nav_account')}
                </NavLink>

                <button className="btn small danger nav-mobile-signout" onClick={signOut}>
                  {t(lang, 'nav_sign_out')}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="container">
        <Routes>
          <Route path="/" element={<Home session={session} lang={lang} />} />
          <Route path="/join" element={<Home session={session} lang={lang} variant="join" />} />
          <Route path="/auth" element={<Auth lang={lang} setLang={updateLanguage} />} />

          <Route
            path="/onboarding"
            element={
              <SessionOnly session={session}>
                <Onboarding lang={lang} setLang={updateLanguage} />
              </SessionOnly>
            }
          />

          <Route
            path="/feed"
            element={
              <CoreProfileOnly
                session={session}
                profileChecked={profileChecked}
                profileReady={profileReady}
                lang={lang}
              >
                <Feed lang={lang} />
              </CoreProfileOnly>
            }
          />

          <Route
            path="/channels"
            element={
              <CoreProfileOnly
                session={session}
                profileChecked={profileChecked}
                profileReady={profileReady}
                lang={lang}
              >
                <Channels lang={lang} />
              </CoreProfileOnly>
            }
          />

          <Route
            path="/new"
            element={
              <CoreProfileOnly
                session={session}
                profileChecked={profileChecked}
                profileReady={profileReady}
                lang={lang}
              >
                <NewPost lang={lang} />
              </CoreProfileOnly>
            }
          />

          <Route
            path="/notifications"
            element={
              <CoreProfileOnly
                session={session}
                profileChecked={profileChecked}
                profileReady={profileReady}
                lang={lang}
              >
                <Notifications lang={lang} />
              </CoreProfileOnly>
            }
          />

          <Route
            path="/account"
            element={
              <CoreProfileOnly
                session={session}
                profileChecked={profileChecked}
                profileReady={profileReady}
                lang={lang}
              >
                <MyAccount lang={lang} setLang={updateLanguage} />
              </CoreProfileOnly>
            }
          />

          <Route
            path="/u/:userId"
            element={
              <CoreProfileOnly
                session={session}
                profileChecked={profileChecked}
                profileReady={profileReady}
                lang={lang}
              >
                <WorkerProfile lang={lang} />
              </CoreProfileOnly>
            }
          />

          <Route
            path="/p/:id"
            element={
              <CoreProfileOnly
                session={session}
                profileChecked={profileChecked}
                profileReady={profileReady}
                lang={lang}
              >
                <PostDetail lang={lang} />
              </CoreProfileOnly>
            }
          />

          <Route
            path="/admin"
            element={
              <AdminOnly
                session={session}
                profileChecked={profileChecked}
                profileReady={profileReady}
                isAdmin={isAdmin}
                adminChecked={adminChecked}
                lang={lang}
              >
                <AdminDirectory lang={lang} />
              </AdminOnly>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <div className="footerNote">{t(lang, 'footer_note')}</div>
      </div>
    </>
  )
}