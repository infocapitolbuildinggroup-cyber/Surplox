import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'
import { t } from '../i18n'

const COPY = {
  en: {
    needCrewBadge: 'Need Crew',
    workBadge: 'Looking for Work',
    discussionBadge: 'Trade Board',
    supportBadge: 'Jobsite Support',
    deliveryBadge: 'Delivery',
    cargoVanBadge: 'Delivery',
    repairBadge: 'Mechanic / Repair',
    supplierBadge: 'Supplier',
    heroBadge: 'Trades + actions',
    heroTitle: 'Move faster through the right channels.',
    heroBody:
      'Jump directly into labor requests, availability posts, trade discussions, supplier visibility, delivery support, or fleet repair activity without digging through the wrong feed.',
    stat1: 'Quick post shortcuts',
    stat2: 'Trade-based browsing',
    stat3: 'Cleaner jobsite support discovery',
    title: 'Channels',
    intro:
      'Browse labor channels, trade boards, supplier visibility lanes, and the new Jobsite Support sections built around real construction operations.',
    quickActions: 'Quick Actions',
    quickActionsIntro:
      'Start the exact kind of post you need so nearby workers, suppliers, runners, drivers, and repair support can find it faster.',
    needCrewTitle: 'Need a Crew',
    needCrewBody:
      'Post labor demand for nearby crews, workers, and subs. Best for filling manpower needs quickly.',
    needCrewButton: 'Create Need Crew Post',
    workTitle: 'Looking for Work',
    workBody:
      'Post your availability so contractors, crews, and nearby jobsites can find you faster.',
    workButton: 'Create Looking for Work Post',
    supportDeliveryTitle: 'Delivery',
    supportDeliveryBody:
      'Post hot shot, cargo van, pickup, flatbed, or gooseneck support for local material runs, tool transport, same-day pickups, last-mile delivery, and jobsite deliveries.',
    supportDeliveryButton: 'Create Delivery Support Post',
    supportRepairTitle: 'Equipment / Fleet Repair',
    supportRepairBody:
      'Post diesel mechanic, trailer repair, or heavy equipment support for field service and jobsite uptime.',
    supportRepairButton: 'Create Repair Support Post',
    supplierActionTitle: 'Supplier Visibility',
    supplierActionBody:
      'Create supplier-facing discussion and visibility posts so contractors and crews can discover materials, yard locations, and storefront supply options faster.',
    supplierActionButton: 'Create Supplier Post',
    allTradesTitle: 'Trade Boards',
    allTradesIntro:
      'Open a trade-specific feed to browse local discussion and labor activity.',
    emptyTitle: 'No Channels Found',
    emptyBody: 'No trade boards are available yet.',
    viewPosts: 'Open channel'
  }
}

function InfoTile({ value }) {
  return (
    <div className="card-soft" style={{ minHeight: 92 }}>
      <div style={{ fontWeight: 800, fontSize: 16, lineHeight: 1.35 }}>{value}</div>
    </div>
  )
}

export default function Channels({ lang: langProp = 'en' }) {
  const [trades, setTrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [lang, setLang] = useState(langProp || localStorage.getItem('surplox_lang') || 'en')

  const copy = COPY[lang] || COPY.en

  useEffect(() => {
    async function load() {
      setLoading(true)
      setMsg('')

      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const user = sessionData.session?.user

        let activeLang = langProp || localStorage.getItem('surplox_lang') || 'en'

        if (user) {
          const { data: prof } = await supabase
            .from('profiles')
            .select('preferred_language')
            .eq('user_id', user.id)
            .maybeSingle()

          activeLang = prof?.preferred_language || activeLang
        }

        setLang(activeLang)
        localStorage.setItem('surplox_lang', activeLang)

        const { data, error } = await supabase
          .from('trades')
          .select('id,name')
          .order('name')

        if (error) {
          console.error(error)
          setMsg(t(activeLang, 'channels_error'))
        } else {
          setTrades(data || [])
        }
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [langProp])

  const tradeLinks = useMemo(() => {
    return trades.map((trade) => ({
      ...trade,
      href: `/feed?trade=${encodeURIComponent(trade.name)}`
    }))
  }, [trades])

  if (loading) {
    return <div className="card">{t(lang, 'channels_loading')}</div>
  }

  if (msg) {
    return (
      <div className="card">
        <div className="h1" style={{ fontSize: 18 }}>
          {t(lang, 'channels_unavailable')}
        </div>
        <div className="muted" style={{ marginTop: 8 }}>
          {msg}
        </div>
      </div>
    )
  }

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="badge" style={{ background: '#ecebe3', color: '#111111' }}>
          {copy.heroBadge}
        </div>

        <div style={{ fontWeight: 900, fontSize: 28, marginTop: 14 }}>
          {copy.title}
        </div>

        <p className="muted" style={{ marginTop: 10 }}>
          {copy.intro}
        </p>

        <div className="grid three" style={{ marginTop: 14 }}>
          <InfoTile value={copy.stat1} />
          <InfoTile value={copy.stat2} />
          <InfoTile value={copy.stat3} />
        </div>
      </div>

      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="card-section-title">{copy.quickActions}</div>

        <p className="card-section-subtitle" style={{ marginTop: 8 }}>
          {copy.quickActionsIntro}
        </p>

        <div className="grid two" style={{ marginTop: 14 }}>
          <Link className="card rounded-xl" to="/new?type=need_crew">
            <div className="badge">{copy.needCrewBadge}</div>
            <div style={{ fontWeight: 900, fontSize: 22 }}>{copy.needCrewTitle}</div>
          </Link>

          <Link className="card rounded-xl" to="/new?type=looking_for_work">
            <div className="badge">{copy.workBadge}</div>
            <div style={{ fontWeight: 900, fontSize: 22 }}>{copy.workTitle}</div>
          </Link>
        </div>
      </div>

      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="card-section-title">{copy.allTradesTitle}</div>

        {tradeLinks.length === 0 ? (
          <div className="card-soft">{copy.emptyTitle}</div>
        ) : (
          <div className="grid two">
            {tradeLinks.map((trade) => (
              <Link key={trade.id} className="card" to={trade.href}>
                {trade.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
