import React, { useEffect, useState } from 'react'
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
  if (!session) return <Navigate to="/auth" replace />
  return children
}

function ProfileCompleteOnly({ session, profileChecked, profileComplete, children, lang }) {
  if (!session) return <Navigate to="/auth" replace />
  if (!profileChecked) return <div className="card">{t(lang, 'checking_permissions')}</div>
  if (!profileComplete) return <Navigate to="/onboarding" replace />
  return children
}

function AdminOnly({ session, profileChecked, profileComplete, isAdmin, adminChecked, children, lang }) {
  if (!session) return <Navigate to="/auth" replace />
  if (!profileChecked) return <div className="card">{t(lang, 'checking_permissions')}</div>
  if (!profileComplete) return <Navigate to="/onboarding" replace />
  if (!adminChecked) return <div className="card">{t(lang, 'checking_permissions')}</div>
  if (!isAdmin) return <Navigate to="/feed" replace />
  return children
}

export default function App() {
  const [session, setSession] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminChecked, setAdminChecked] = useState(false)
  const [profileChecked, setProfileChecked] = useState(false)
  const [profileComplete, setProfileComplete] = useState(false)
  const [lang, setLang] = useState(localStorage.getItem('surplox_lang') || 'en')
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [savingLang, setSavingLang] = useState(false)

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

      if (!sess) {
        setIsAdmin(false)
        setProfileComplete(false)
        setUnreadNotifications(0)
        const localLang = localStorage.getItem('surplox_lang') || 'en'
        setLang(localLang)
      }
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    async function checkProfile() {
      if (!session?.user) return

      setProfileChecked(false)
      setAdminChecked(false)

      try {
        const { data: prof, error } = await supabase
          .from('profiles')
          .select(
            'user_id, display_name, first_name, last_name, role, trade_id, home_zip, preferred_language'
          )
          .eq('user_id', session.user.id)
          .maybeSingle()

        if (error) {
          console.error(error)
        }

        const hasCompleteProfile = Boolean(
          prof &&
            prof.display_name &&
            prof.first_name &&
            prof.last_name &&
            prof.role &&
            prof.trade_id &&
            prof.home_zip
        )

        if (!hasCompleteProfile) {
          setProfileComplete(false)
          setProfileChecked(true)
          setIsAdmin(false)
          setAdminChecked(true)

          if (location.pathname !== '/onboarding') {
            navigate('/onboarding', { replace: true })
          }
          return
        }

        setProfileComplete(true)

        const userLang = prof?.preferred_language || localStorage.getItem('surplox_lang') || 'en'
        setLang(userLang)
        localStorage.setItem('surplox_lang', userLang)

        const { data: adminFlag, error: adminErr } = await supabase.rpc('is_admin')
        if (adminErr) console.error(adminErr)

        setIsAdmin(Boolean(adminFlag))
        setAdminChecked(true)
        setProfileChecked(true)

        if (location.pathname === '/auth' || location.pathname === '/onboarding') {
          navigate('/feed', { replace: true })
        }
      } catch (err) {
        console.error(err)
        setProfileComplete(false)
        setProfileChecked(true)
      }
    }

    checkProfile()
  }, [session?.user?.id, session?.access_token, navigate, location.pathname])

  useEffect(() => {
    async function loadUnreadCount() {
      if (!session?.user?.id || !profileComplete) return

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
  }, [session?.user?.id, profileComplete])

  async function updateLanguage(newLang) {
    if (!newLang || newLang === lang) return

    setLang(newLang)
    localStorage.setItem('surplox_lang', newLang)

    if (!session?.user?.id || !profileComplete) return

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
    setIsAdmin(false)
    setAdminChecked(false)
    setProfileChecked(false)
    setProfileComplete(false)
    setUnreadNotifications(0)
    navigate('/', { replace: true })
  }

  function navBtnClass({ isActive }) {
    return isActive ? 'btn small nav-link nav-link-active' : 'btn small nav-link'
  }

  function adminNavBtnClass({ isActive }) {
    return isActive ? 'btn small primary nav-link nav-link-active' : 'btn small primary nav-link'
  }

  const brandTarget = session && profileChecked && !profileComplete ? '/onboarding' : '/'
  const showFullAppNav = Boolean(session && profileChecked && profileComplete)

  return (
    <>
      <div className="nav">
        <div className="nav-inner">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flexWrap: 'wrap'
            }}
          >
            <NavLink className="brand" to={brandTarget}>
              <img src={logo} alt="Surplox logo" className="logo" />
            </NavLink>

            <span
              aria-label="Surplox beta"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px 10px',
                borderRadius: 999,
                border: '1px solid rgba(255, 222, 89, 0.65)',
                background: 'rgba(255, 117, 31, 0.08)',
                color: '#ff751f',
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                boxShadow: '0 0 10px rgba(255, 222, 89, 0.22)',
                userSelect: 'none',
                pointerEvents: 'none'
              }}
            >
              Beta
            </span>
          </div>

          <div className="nav-links">
            <div
              style={{
                display: 'flex',
                gap: 6,
                marginRight: 12,
                alignItems: 'center',
                flexWrap: 'wrap'
              }}
            >
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
                    <NavLink className={navBtnClass} to="/feed">
                      {t(lang, 'nav_feed')}
                    </NavLink>

                    <NavLink className={navBtnClass} to="/channels">
                      {t(lang, 'nav_channels')}
                    </NavLink>

                    <NavLink className={navBtnClass} to="/new">
                      {t(lang, 'nav_new_post')}
                    </NavLink>

                    <NavLink className={navBtnClass} to="/notifications">
                      {t(lang, 'nav_alerts') || 'Alerts'}
                      {unreadNotifications > 0 ? (
                        <span
                          className="badge"
                          style={{
                            marginLeft: 8,
                            color: '#ff751f',
                            borderColor: 'rgba(255, 222, 89, 0.65)',
                            background: 'rgba(255, 222, 89, 0.14)'
                          }}
                        >
                          {unreadNotifications}
                        </span>
                      ) : null}
                    </NavLink>

                    <NavLink className={navBtnClass} to="/account">
                      {t(lang, 'nav_account')}
                    </NavLink>

                    {isAdmin && (
                      <NavLink className={adminNavBtnClass} to="/admin">
                        {t(lang, 'nav_admin') || 'Admin'}
                      </NavLink>
                    )}
                  </>
                ) : (
                  <NavLink className="btn small primary nav-link" to="/onboarding">
                    Complete Profile
                  </NavLink>
                )}

                <button className="btn small danger" onClick={signOut}>
                  {t(lang, 'nav_sign_out')}
                </button>
              </>
            ) : (
              <NavLink className="btn small primary nav-link" to="/auth">
                {t(lang, 'nav_sign_in')}
              </NavLink>
            )}
          </div>
        </div>
      </div>

      <div className="container">
        <Routes>
          <Route path="/" element={<Home session={session} lang={lang} />} />
          <Route path="/auth" element={<Auth lang={lang} setLang={updateLanguage} />} />

          <Route
            path="/onboarding"
            element={
              <SessionOnly session={session}>
                {profileChecked && profileComplete ? (
                  <Navigate to="/feed" replace />
                ) : (
                  <Onboarding lang={lang} setLang={updateLanguage} />
                )}
              </SessionOnly>
            }
          />

          <Route
            path="/feed"
            element={
              <ProfileCompleteOnly
                session={session}
                profileChecked={profileChecked}
                profileComplete={profileComplete}
                lang={lang}
              >
                <Feed lang={lang} />
              </ProfileCompleteOnly>
            }
          />

          <Route
            path="/channels"
            element={
              <ProfileCompleteOnly
                session={session}
                profileChecked={profileChecked}
                profileComplete={profileComplete}
                lang={lang}
              >
                <Channels lang={lang} />
              </ProfileCompleteOnly>
            }
          />

          <Route
            path="/new"
            element={
              <ProfileCompleteOnly
                session={session}
                profileChecked={profileChecked}
                profileComplete={profileComplete}
                lang={lang}
              >
                <NewPost lang={lang} />
              </ProfileCompleteOnly>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProfileCompleteOnly
                session={session}
                profileChecked={profileChecked}
                profileComplete={profileComplete}
                lang={lang}
              >
                <Notifications lang={lang} />
              </ProfileCompleteOnly>
            }
          />

          <Route
            path="/account"
            element={
              <ProfileCompleteOnly
                session={session}
                profileChecked={profileChecked}
                profileComplete={profileComplete}
                lang={lang}
              >
                <MyAccount lang={lang} setLang={updateLanguage} />
              </ProfileCompleteOnly>
            }
          />

          <Route
            path="/u/:userId"
            element={
              <ProfileCompleteOnly
                session={session}
                profileChecked={profileChecked}
                profileComplete={profileComplete}
                lang={lang}
              >
                <WorkerProfile lang={lang} />
              </ProfileCompleteOnly>
            }
          />

          <Route
            path="/p/:id"
            element={
              <ProfileCompleteOnly
                session={session}
                profileChecked={profileChecked}
                profileComplete={profileComplete}
                lang={lang}
              >
                <PostDetail lang={lang} />
              </ProfileCompleteOnly>
            }
          />

          <Route
            path="/admin"
            element={
              <AdminOnly
                session={session}
                profileChecked={profileChecked}
                profileComplete={profileComplete}
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

        <div className="footerNote">
          {t(lang, 'footer_note')}
        </div>
      </div>
    </>
  )
}