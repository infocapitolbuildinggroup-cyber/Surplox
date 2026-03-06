import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate, NavLink } from 'react-router-dom'
import { supabase } from './supabaseClient'
import Home from './pages/Home.jsx'
import Auth from './pages/Auth.jsx'
import Onboarding from './pages/Onboarding.jsx'
import Feed from './pages/Feed.jsx'
import NewPost from './pages/NewPost.jsx'
import PostDetail from './pages/PostDetail.jsx'
import AdminDirectory from './pages/AdminDirectory.jsx'
import Channels from './pages/Channels.jsx'
import MyAccount from './pages/MyAccount.jsx'
import logo from './assets/logo.png'

function Protected({ session, children }) {
  if (!session) return <Navigate to="/auth" replace />
  return children
}

function AdminOnly({ session, isAdmin, adminChecked, children }) {
  if (!session) return <Navigate to="/auth" replace />
  if (!adminChecked) return <div className="card">Checking permissions…</div>
  if (!isAdmin) return <Navigate to="/feed" replace />
  return children
}

export default function App() {
  const [session, setSession] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminChecked, setAdminChecked] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess)
      setAdminChecked(false)

      if (!sess) {
        setIsAdmin(false)
      }
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    async function checkProfile() {
      if (!session?.user) return

      const { data: prof, error } = await supabase
        .from('profiles')
        .select('user_id, home_zip')
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (error) console.error(error)

      if (!prof) {
        navigate('/onboarding', { replace: true })
        return
      }

      const { data: adminFlag, error: adminErr } = await supabase.rpc('is_admin')
      if (adminErr) console.error(adminErr)

      setIsAdmin(Boolean(adminFlag))
      setAdminChecked(true)
    }

    checkProfile()
  }, [session?.user?.id, session?.access_token, navigate])

  async function signOut() {
    await supabase.auth.signOut()
    setIsAdmin(false)
    setAdminChecked(false)
    navigate('/', { replace: true })
  }

  function navBtnClass({ isActive }) {
    return isActive ? 'btn small nav-link nav-link-active' : 'btn small nav-link'
  }

  function adminNavBtnClass({ isActive }) {
    return isActive ? 'btn small primary nav-link nav-link-active' : 'btn small primary nav-link'
  }

  return (
    <>
      <div className="nav">
        <div className="nav-inner">
          <NavLink className="brand" to="/">
            <img src={logo} alt="Surplox logo" className="logo" />
            <span>Surplox</span>
          </NavLink>

          <div className="nav-links">
            {session ? (
              <>
                <NavLink className={navBtnClass} to="/feed">
                  Feed
                </NavLink>

                <NavLink className={navBtnClass} to="/channels">
                  Channels
                </NavLink>

                <NavLink className={navBtnClass} to="/new">
                  New Post
                </NavLink>

                <NavLink className={navBtnClass} to="/account">
                  My Account
                </NavLink>

                {isAdmin && (
                  <NavLink className={adminNavBtnClass} to="/admin">
                    Directory
                  </NavLink>
                )}

                <button className="btn small danger" onClick={signOut}>
                  Sign Out
                </button>
              </>
            ) : (
              <NavLink className="btn small primary nav-link" to="/auth">
                Sign In
              </NavLink>
            )}
          </div>
        </div>
      </div>

      <div className="container">
        <Routes>
          <Route path="/" element={<Home session={session} />} />
          <Route path="/auth" element={<Auth />} />

          <Route
            path="/onboarding"
            element={
              <Protected session={session}>
                <Onboarding />
              </Protected>
            }
          />

          <Route
            path="/feed"
            element={
              <Protected session={session}>
                <Feed />
              </Protected>
            }
          />

          <Route
            path="/channels"
            element={
              <Protected session={session}>
                <Channels />
              </Protected>
            }
          />

          <Route
            path="/new"
            element={
              <Protected session={session}>
                <NewPost />
              </Protected>
            }
          />

          <Route
            path="/account"
            element={
              <Protected session={session}>
                <MyAccount />
              </Protected>
            }
          />

          <Route
            path="/p/:id"
            element={
              <Protected session={session}>
                <PostDetail />
              </Protected>
            }
          />

          <Route
            path="/admin"
            element={
              <AdminOnly
                session={session}
                isAdmin={isAdmin}
                adminChecked={adminChecked}
              >
                <AdminDirectory />
              </AdminOnly>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <div className="footerNote">
          No direct messages by design. Discussions are visible only to members inside the network.
        </div>
      </div>
    </>
  )
}