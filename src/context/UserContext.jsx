import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'
import { getPermissions } from '../lib/permissions'

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loadingUser, setLoadingUser] = useState(true)

  async function loadUser(nextSession = null) {
    setLoadingUser(true)

    const activeSession = nextSession || (await supabase.auth.getSession()).data.session || null
    setSession(activeSession)

    const user = activeSession?.user

    if (!user) {
      setProfile(null)
      setLoadingUser(false)
      return
    }

    const { data, error } = await supabase
      .from('industrial_user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) {
      console.error(error)
      setProfile(null)
      setLoadingUser(false)
      return
    }

    setProfile(
      data || {
        user_id: user.id,
        email: user.email || '',
        employee_role: 'pipefitter',
        permission_group: 'field_operations',
        access_type: 'field_worker'
      }
    )

    setLoadingUser(false)
  }

  useEffect(() => {
    let mounted = true

    async function init() {
      if (!mounted) return
      await loadUser()
    }

    init()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      loadUser(nextSession)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const permissions = useMemo(() => {
    return getPermissions(profile?.permission_group)
  }, [profile?.permission_group])

  const value = {
    session,
    user: session?.user || null,
    profile,
    permissions,
    permissionGroup: profile?.permission_group || 'field_operations',
    loadingUser,
    reloadUser: loadUser
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)

  if (!context) {
    throw new Error('useUser must be used inside UserProvider')
  }

  return context
}