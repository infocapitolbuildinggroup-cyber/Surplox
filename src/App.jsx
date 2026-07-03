import React, { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation, useSearchParams } from 'react-router-dom'
import { supabase } from './supabaseClient'
import { UserProvider, useUser } from './context/UserContext'

import Home from './pages/Home'
import Auth from './pages/Auth'
import MyAccount from './pages/MyAccount'
import Notifications from './pages/Notifications'
import Onboarding from './pages/Onboarding'
import PublicInvoice from './pages/PublicInvoice'
import YardManager from './pages/YardManager'

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
    <div className="lang-toggle" aria-label={lang === 'es' ? 'Selector de idioma' : 'Language selector'}>
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
      <span style={{ display: 'block', width: '100%', height: 2, borderRadius: 999, background: 'currentColor' }} />
      <span style={{ display: 'block', width: '100%', height: 2, borderRadius: 999, background: 'currentColor' }} />
      <span style={{ display: 'block', width: '100%', height: 2, borderRadius: 999, background: 'currentColor' }} />
    </span>
  )
}

function timeAgoLabel(ts, lang = 'en') {
  if (!ts) return ''

  const date = new Date(ts)
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)

  if (seconds < 60) return lang === 'es' ? 'ahora' : 'now'
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60)
    return lang === 'es' ? `hace ${mins} min` : `${mins}m ago`
  }
  if (seconds < 86400) {
    const hrs = Math.floor(seconds / 3600)
    return lang === 'es' ? `hace ${hrs} h` : `${hrs}h ago`
  }

  const days = Math.floor(seconds / 86400)
  return lang === 'es' ? `hace ${days} d` : `${days}d ago`
}

function MessagesCenter({ lang = 'en' }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [setupSoftError, setSetupSoftError] = useState('')
  const [currentUserId, setCurrentUserId] = useState(null)
  const [profilesById, setProfilesById] = useState({})
  const [messages, setMessages] = useState([])
  const [selectedUserId, setSelectedUserId] = useState(searchParams.get('to') || '')
  const [draft, setDraft] = useState(searchParams.get('draft') || '')
  const [recipientSearch, setRecipientSearch] = useState('')

  const copy =
    lang === 'es'
      ? {
          title: 'Mensajes',
          intro: 'Usa mensajes directos para coordinar solicitudes, entregas, inventario y seguimiento en campo.',
          loading: 'Cargando mensajes…',
          emptyTitle: 'Todavía no hay mensajes.',
          emptyBody: 'Cuando empieces una conversación, aparecerá aquí.',
          inbox: 'Bandeja',
          conversation: 'Conversación',
          chooseConversation: 'Elige una conversación',
          chooseConversationBody: 'Abre una conversación existente o empieza una nueva.',
          noRecipient: 'Selecciona un destinatario para enviar un mensaje.',
          draftPlaceholder: 'Escribe tu mensaje aquí…',
          send: 'Enviar',
          sending: 'Enviando…',
          setupSoftError: 'La tabla direct_messages todavía no está lista o no respondió.',
          goYard: 'Ir al Yard Manager',
          lastMessage: 'Último mensaje',
          you: 'Tú',
          startConversation: 'Inicia una conversación',
          searchPlaceholder: 'Buscar nombre…',
          messageStarter: 'Las conversaciones ayudan a cerrar dudas de material, entregas y solicitudes.'
        }
      : {
          title: 'Messages',
          intro: 'Use direct messages to coordinate requests, deliveries, inventory, and field follow-up.',
          loading: 'Loading messages…',
          emptyTitle: 'No messages yet.',
          emptyBody: 'When you start a conversation, it will appear here.',
          inbox: 'Inbox',
          conversation: 'Conversation',
          chooseConversation: 'Choose a conversation',
          chooseConversationBody: 'Open an existing thread or start a new one.',
          noRecipient: 'Select a recipient to send a message.',
          draftPlaceholder: 'Write your message here…',
          send: 'Send',
          sending: 'Sending…',
          setupSoftError: 'The direct_messages table is not ready yet or did not respond.',
          goYard: 'Go to Yard Manager',
          lastMessage: 'Last message',
          you: 'You',
          startConversation: 'Start a conversation',
          searchPlaceholder: 'Search name…',
          messageStarter: 'Conversations help close the loop on materials, deliveries, and requests.'
        }

  useEffect(() => {
    const to = searchParams.get('to') || ''
    const presetDraft = searchParams.get('draft') || ''

    if (to) setSelectedUserId(to)
    if (presetDraft) setDraft(presetDraft)
  }, [searchParams])

  useEffect(() => {
    let active = true

    async function loadAll() {
      setLoading(true)
      setError('')
      setSetupSoftError('')

      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const uid = sessionData.session?.user?.id || null

        if (!active) return
        setCurrentUserId(uid)

        if (!uid) {
          setMessages([])
          setProfilesById({})
          setLoading(false)
          return
        }

        const [{ data: outgoing, error: outgoingError }, { data: incoming, error: incomingError }] =
          await Promise.all([
            supabase
              .from('direct_messages')
              .select('id,sender_user_id,recipient_user_id,body,created_at,is_read')
              .eq('sender_user_id', uid)
              .order('created_at', { ascending: false }),
            supabase
              .from('direct_messages')
              .select('id,sender_user_id,recipient_user_id,body,created_at,is_read')
              .eq('recipient_user_id', uid)
              .order('created_at', { ascending: false })
          ])

        if (outgoingError || incomingError) {
          console.error(outgoingError || incomingError)
          if (!active) return
          setMessages([])
          setProfilesById({})
          setSetupSoftError(copy.setupSoftError)
          setLoading(false)
          return
        }

        const allMessages = [...(outgoing || []), ...(incoming || [])].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )

        const counterpartIds = Array.from(
          new Set(
            allMessages
              .map((item) => (item.sender_user_id === uid ? item.recipient_user_id : item.sender_user_id))
              .filter(Boolean)
          )
        )

        let profileRows = []

        if (counterpartIds.length > 0) {
          const { data: profs, error: profErr } = await supabase
            .from('profiles')
            .select('user_id,display_name,business_name,role')
            .in('user_id', counterpartIds)

          if (profErr) console.error(profErr)
          profileRows = profs || []
        }

        if (!active) return

        setMessages(allMessages)
        setProfilesById(
          Object.fromEntries(
            profileRows.map((row) => [
              row.user_id,
              {
                display_name: row.business_name || row.display_name || 'Member',
                role: row.role || 'member'
              }
            ])
          )
        )
      } catch (err) {
        console.error(err)
        if (!active) return
        setError(lang === 'es' ? 'No se pudieron cargar los mensajes.' : 'Unable to load messages.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadAll()

    return () => {
      active = false
    }
  }, [lang, copy.setupSoftError])

  const conversations = useMemo(() => {
    if (!currentUserId) return []

    const map = new Map()

    messages.forEach((item) => {
      const counterpartId = item.sender_user_id === currentUserId ? item.recipient_user_id : item.sender_user_id
      if (!counterpartId) return

      if (!map.has(counterpartId)) {
        map.set(counterpartId, {
          userId: counterpartId,
          lastMessage: item,
          unreadCount: 0,
          items: []
        })
      }

      const entry = map.get(counterpartId)
      entry.items.push(item)

      if (item.recipient_user_id === currentUserId && !item.is_read) {
        entry.unreadCount += 1
      }

      if (new Date(item.created_at).getTime() > new Date(entry.lastMessage.created_at).getTime()) {
        entry.lastMessage = item
      }
    })

    let rows = Array.from(map.values())

    if (recipientSearch.trim()) {
      const q = recipientSearch.trim().toLowerCase()
      rows = rows.filter((row) =>
        String(profilesById[row.userId]?.display_name || row.userId).toLowerCase().includes(q)
      )
    }

    return rows.sort(
      (a, b) => new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
    )
  }, [messages, currentUserId, profilesById, recipientSearch])

  const activeConversation = useMemo(() => {
    if (!selectedUserId || !currentUserId) return []

    return messages
      .filter((item) => {
        const pairA = item.sender_user_id === currentUserId && item.recipient_user_id === selectedUserId
        const pairB = item.sender_user_id === selectedUserId && item.recipient_user_id === currentUserId
        return pairA || pairB
      })
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  }, [messages, selectedUserId, currentUserId])

  async function handleSend() {
    if (!currentUserId) return

    if (!selectedUserId) {
      setError(copy.noRecipient)
      return
    }

    if (!String(draft || '').trim()) return

    setSending(true)
    setError('')

    try {
      const { data: inserted, error: insertErr } = await supabase
        .from('direct_messages')
        .insert({
          sender_user_id: currentUserId,
          recipient_user_id: selectedUserId,
          body: String(draft || '').trim()
        })
        .select('id,sender_user_id,recipient_user_id,body,created_at,is_read')
        .single()

      if (insertErr) {
        console.error(insertErr)
        setSetupSoftError(copy.setupSoftError)
        return
      }

      setMessages((prev) =>
        [...prev, inserted].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      )

      setDraft('')
      setSearchParams(selectedUserId ? { to: selectedUserId } : {})
    } catch (err) {
      console.error(err)
      setError(lang === 'es' ? 'No se pudo enviar el mensaje.' : 'Unable to send message.')
    } finally {
      setSending(false)
    }
  }

  async function markConversationRead() {
    if (!currentUserId || !selectedUserId) return

    try {
      await supabase
        .from('direct_messages')
        .update({ is_read: true })
        .eq('recipient_user_id', currentUserId)
        .eq('sender_user_id', selectedUserId)
        .eq('is_read', false)

      setMessages((prev) =>
        prev.map((item) =>
          item.recipient_user_id === currentUserId && item.sender_user_id === selectedUserId
            ? { ...item, is_read: true }
            : item
        )
      )
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (selectedUserId) {
      markConversationRead()
    }
  }, [selectedUserId])

  if (loading) {
    return <div className="card">{copy.loading}</div>
  }

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div
        className="card rounded-xl nav-mobile-menu-scroll"
        style={{
          padding: 24,
          background: 'linear-gradient(180deg, #e8f6ee 0%, #f7f7f2 100%)'
        }}
      >
        <div className="badge" style={{ marginBottom: 12, background: '#dcf4e5', color: '#177245' }}>
          {copy.title}
        </div>
        <div className="h1">{copy.title}</div>
        <p className="muted" style={{ marginTop: 10, maxWidth: 860, lineHeight: 1.7 }}>
          {copy.intro}
        </p>

        {setupSoftError ? (
          <div className="card-soft" style={{ marginTop: 14, background: '#fffaf0' }}>
            {setupSoftError}
          </div>
        ) : null}

        {error ? (
          <div className="card-soft" style={{ marginTop: 14, background: '#fff4da' }}>
            {error}
          </div>
        ) : null}
      </div>

      <div className="grid two" style={{ alignItems: 'start' }}>
        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">{copy.inbox}</div>

          <div style={{ marginTop: 12 }}>
            <input
              className="input"
              value={recipientSearch}
              onChange={(e) => setRecipientSearch(e.target.value)}
              placeholder={copy.searchPlaceholder}
            />
          </div>

          {conversations.length === 0 ? (
            <div className="card-soft" style={{ marginTop: 14 }}>
              <div className="card-section-title" style={{ fontSize: 15 }}>
                {copy.emptyTitle}
              </div>
              <p className="card-section-subtitle" style={{ marginTop: 8 }}>
                {copy.emptyBody}
              </p>
              <div className="muted" style={{ marginTop: 12 }}>
                {copy.messageStarter}
              </div>
            </div>
          ) : (
            <div className="list" style={{ marginTop: 14 }}>
              {conversations.map((row) => {
                const active = selectedUserId === row.userId
                const profile = profilesById[row.userId] || {}

                return (
                  <button
                    key={row.userId}
                    type="button"
                    className="card-soft"
                    onClick={() => {
                      setSelectedUserId(row.userId)
                      setSearchParams({ to: row.userId })
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      border: active ? '1px solid #111111' : '1px solid transparent',
                      background: active ? '#f8f7ef' : undefined
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ fontWeight: 900 }}>{profile.display_name || row.userId}</div>
                      <div className="muted">{timeAgoLabel(row.lastMessage?.created_at, lang)}</div>
                    </div>

                    <div className="muted" style={{ marginTop: 8 }}>
                      {copy.lastMessage}:{' '}
                      {row.lastMessage?.sender_user_id === currentUserId ? `${copy.you}: ` : ''}
                      {row.lastMessage?.body || ''}
                    </div>

                    {row.unreadCount > 0 ? (
                      <div style={{ marginTop: 10 }}>
                        <span className="badge">{row.unreadCount}</span>
                      </div>
                    ) : null}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">{copy.conversation}</div>

          {selectedUserId ? (
            <>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12, alignItems: 'center' }}>
                <span className="badge">{profilesById[selectedUserId]?.display_name || selectedUserId}</span>
              </div>

              <div className="list" style={{ marginTop: 14 }}>
                {activeConversation.length === 0 ? (
                  <div className="card-soft">
                    <div className="muted">{copy.startConversation}</div>
                  </div>
                ) : (
                  activeConversation.map((item) => {
                    const mine = item.sender_user_id === currentUserId

                    return (
                      <div
                        key={item.id}
                        className="card-soft"
                        style={{
                          background: mine ? '#f8f7ef' : '#ffffff',
                          border: mine ? '1px solid rgba(17,17,17,0.08)' : '1px solid rgba(17,17,17,0.05)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                          <div style={{ fontWeight: 900 }}>
                            {mine ? copy.you : profilesById[selectedUserId]?.display_name || selectedUserId}
                          </div>
                          <div className="muted">{timeAgoLabel(item.created_at, lang)}</div>
                        </div>
                        <div style={{ marginTop: 8, lineHeight: 1.7 }}>{item.body}</div>
                      </div>
                    )
                  })
                )}
              </div>

              <div style={{ marginTop: 14 }}>
                <textarea
                  className="input"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={copy.draftPlaceholder}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
                <button className="btn primary" type="button" onClick={handleSend} disabled={sending}>
                  {sending ? copy.sending : copy.send}
                </button>
              </div>
            </>
          ) : (
            <div className="card-soft" style={{ marginTop: 14 }}>
              <div className="card-section-title" style={{ fontSize: 15 }}>
                {copy.chooseConversation}
              </div>
              <p className="card-section-subtitle" style={{ marginTop: 8 }}>
                {copy.chooseConversationBody}
              </p>
              <div style={{ marginTop: 14 }}>
                <Link className="btn" to="/yard">
                  {copy.goYard}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AppShell({ lang, setLang }) {
  const location = useLocation()
  const { session, loadingUser, permissions } = useUser()
  const [logoError, setLogoError] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname, location.search])

  const navItems = useMemo(() => {
    if (!session) return []

    const items = []

    if (permissions.dashboard) {
      items.push({ to: '/yard', label: lang === 'es' ? 'Yard Manager' : 'Yard Manager' })
    }

    if (permissions.messages) {
      items.push({ to: '/messages', label: lang === 'es' ? 'Mensajes' : 'Messages' })
    }

    if (permissions.alerts) {
      items.push({ to: '/notifications', label: lang === 'es' ? 'Alertas' : 'Alerts' })
    }

    items.push({ to: '/account', label: lang === 'es' ? 'Mi cuenta' : 'My Account' })

    return items
  }, [session, lang, permissions])

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/'
    return location.pathname.startsWith(to)
  }

  async function handleSignOut() {
    setMobileMenuOpen(false)
    await supabase.auth.signOut()
  }

  if (loadingUser) {
    return (
      <div className="page-shell">
        <div className="container" style={{ paddingTop: 40, paddingBottom: 40 }}>
          <div className="card">Loading Surplox Industrial…</div>
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
                to={session ? '/yard' : '/'}
                aria-label={lang === 'es' ? 'Ir a Surplox Industrial' : 'Go to Surplox Industrial'}
                className="nav-logo-link"
              >
                {!logoError ? (
                  <img
                    src="/logo.png"
                    alt="Surplox Industrial"
                    className="nav-logo-image"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <div className="nav-logo-fallback">SI</div>
                )}
              </Link>
            </div>

            <div className="nav-header-actions">
              <LanguageSlider lang={lang} setLang={setLang} />

              {session ? (
                <button
                  type="button"
                  className="btn nav-mobile-toggle"
                  onClick={() => setMobileMenuOpen((prev) => !prev)}
                  aria-expanded={mobileMenuOpen}
                  aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <HamburgerIcon />
                </button>
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
                    aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
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
              <nav style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
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
                  <button type="button" className="btn small" onClick={handleSignOut}>
                    {lang === 'es' ? 'Salir' : 'Sign Out'}
                  </button>
                ) : null}
              </nav>
            </div>
          ) : null}

          {mobileMenuOpen ? (
            <div className="nav-mobile-menu" style={{ paddingBottom: 12 }}>
              <div
                className="card rounded-xl"
                style={{
                  maxHeight: 'min(72vh, calc(100dvh - 112px))',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  overscrollBehavior: 'contain',
                  WebkitOverflowScrolling: 'touch',
                  touchAction: 'pan-y',
                  padding: 14
                }}
              >
                {session ? (
                  <div className="nav-mobile-menu-list" style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 12 }}>
                    {navItems.map((item) => (
                      <Link key={item.to} to={item.to} className={isActive(item.to) ? 'btn primary' : 'btn'}>
                        {item.label}
                      </Link>
                    ))}

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
            <Route path="/" element={session ? <Navigate to="/yard" replace /> : <Home lang={lang} />} />

            <Route path="/auth" element={<Auth lang={lang} setLang={setLang} />} />

            <Route
              path="/yard"
              element={session ? <YardManager lang={lang} /> : <Navigate to="/auth?mode=signin" replace />}
            />

            <Route
              path="/messages"
              element={
                session && permissions.messages ? (
                  <MessagesCenter lang={lang} />
                ) : (
                  <Navigate to={session ? '/yard' : '/auth?mode=signin'} replace />
                )
              }
            />

            <Route
              path="/notifications"
              element={
                session && permissions.alerts ? (
                  <Notifications lang={lang} />
                ) : (
                  <Navigate to={session ? '/yard' : '/auth?mode=signin'} replace />
                )
              }
            />

            <Route
              path="/account"
              element={session ? <MyAccount lang={lang} setLang={setLang} /> : <Navigate to="/auth?mode=signin" replace />}
            />

            <Route
              path="/onboarding"
              element={session ? <Onboarding lang={lang} setLang={setLang} /> : <Navigate to="/auth?mode=signin" replace />}
            />

            <Route path="/invoice/:id" element={<PublicInvoice />} />

            <Route path="*" element={<Navigate to={session ? '/yard' : '/'} replace />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

function AppWithUserProvider({ lang, setLang }) {
  return (
    <UserProvider>
      <AppShell lang={lang} setLang={setLang} />
    </UserProvider>
  )
}

export default function App() {
  const [lang, setLang] = usePreferredLanguage()
  return <AppWithUserProvider lang={lang} setLang={setLang} />
}