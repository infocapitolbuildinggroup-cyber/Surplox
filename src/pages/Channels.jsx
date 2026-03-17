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
    repairBadge: 'Mechanic / Equipment Repair',
    supplierBadge: 'Supplier',
    heroBadge: 'Trades + actions',
    heroTitle: 'Move faster through the right channels.',
    heroBody:
      'Jump directly into labor requests, availability posts, trade discussions, supplier visibility, delivery support, or mechanic and equipment repair activity without digging through the wrong feed.',
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
    supportCargoVanTitle: 'Delivery',
    supportCargoVanBody:
      'Post delivery support for cargo vans, local runs, last-mile delivery, same-day pickups, tool transport, and lighter material movement between yards, stores, and jobsites.',
    supportCargoVanButton: 'Create Delivery Support Post',
    supportRepairTitle: 'Mechanic / Equipment Repair',
    supportRepairBody:
      'Post diesel mechanic, small engine repair, skid steer repair, tractor repair, trailer repair, hydraulic repair, or mobile field service for jobsite uptime.',
    supportRepairButton: 'Create Repair Support Post',
    supplierActionTitle: 'Supplier Visibility',
    supplierActionBody:
      'Create supplier-facing discussion and visibility posts so contractors and crews can discover materials, yard locations, and storefront supply options faster.',
    supplierActionButton: 'Create Supplier Post',
    supplierBoardsTitle: 'Supplier Storefront Discovery',
    supplierBoardsIntro:
      'Browse supplier activity and storefront visibility for materials, tools, equipment rental, and nearby construction supply access.',
    supplierFeedTitle: 'Supplier Feed',
    supplierFeedBody:
      'Open supplier-authored posts and storefront visibility activity across the Surplox network.',
    supplierMaterialsTitle: 'Materials & Inventory Visibility',
    supplierMaterialsBody:
      'Best for concrete, lumber, steel, drywall, tools, fasteners, safety equipment, and nearby supplier discovery.',
    viewSupplierFeed: 'Browse supplier feed',
    allTradesTitle: 'Trade Boards',
    allTradesIntro:
      'Open a trade-specific feed to browse local discussion and labor activity.',
    jobsiteSupportTitle: 'Jobsite Support Boards',
    jobsiteSupportIntro:
      'Browse support lanes for delivery movement and fleet or equipment repair around active jobsites.',
    emptyTitle: 'No Channels Found',
    emptyBody: 'No trade boards are available yet.',
    viewPosts: 'Open channel',
    viewSupportPosts: 'Browse support feed',
    materialDeliveryTitle: 'Delivery',
    materialDeliveryBody:
      'Best for hot shot, pickups, flatbeds, goosenecks, local runs, same-day delivery, and urgent material support.',
    cargoVanDeliveryTitle: 'Delivery',
    cargoVanDeliveryBody:
      'Best for cargo van operators handling local runs, last-mile delivery, same-day pickups, tools, and lighter materials between stores, yards, and jobsites.',
    fleetRepairTitle: 'Mechanic / Equipment Repair',
    fleetRepairBody:
      'Best for diesel mechanics, small engine repair, skid steer and tractor repair, trailer repair, hydraulic work, and emergency field support.'
  },
  es: {
    needCrewBadge: 'Se necesita cuadrilla',
    workBadge: 'Buscando trabajo',
    discussionBadge: 'Tablero de oficio',
    supportBadge: 'Soporte de obra',
    deliveryBadge: 'Entrega',
    cargoVanBadge: 'Entrega',
    repairBadge: 'Mecánica / Reparación de equipo',
    supplierBadge: 'Proveedor',
    heroBadge: 'Oficios + acciones',
    heroTitle: 'Muévete más rápido por los canales correctos.',
    heroBody:
      'Entra directo a solicitudes de mano de obra, publicaciones de disponibilidad, discusiones del oficio, visibilidad de proveedores, soporte de entrega o actividad de mecánica y reparación de equipo sin perder tiempo en el feed equivocado.',
    stat1: 'Atajos para publicar',
    stat2: 'Exploración por oficio',
    stat3: 'Descubrimiento más limpio de soporte de obra',
    title: 'Canales',
    intro:
      'Explora canales de mano de obra, tableros de oficio, visibilidad para proveedores y las nuevas secciones de Soporte de obra basadas en operaciones reales de construcción.',
    quickActions: 'Acciones rápidas',
    quickActionsIntro:
      'Empieza exactamente el tipo de publicación que necesitas para que trabajadores, proveedores, runners, conductores y soporte de reparación cercanos te encuentren más rápido.',
    needCrewTitle: 'Necesito cuadrilla',
    needCrewBody:
      'Publica demanda de mano de obra para cuadrillas, trabajadores y subcontratistas cercanos. Ideal para cubrir personal rápido.',
    needCrewButton: 'Crear publicación de cuadrilla',
    workTitle: 'Buscando trabajo',
    workBody:
      'Publica tu disponibilidad para que contratistas, cuadrillas y obras cercanas te encuentren más rápido.',
    workButton: 'Crear publicación de disponibilidad',
    supportDeliveryTitle: 'Entrega',
    supportDeliveryBody:
      'Publica soporte de hot shot, cargo van, pickup, flatbed o gooseneck para viajes locales de materiales, transporte de herramientas, recogidas el mismo día, última milla y entregas en obra.',
    supportDeliveryButton: 'Crear publicación de entrega',
    supportCargoVanTitle: 'Entrega',
    supportCargoVanBody:
      'Publica soporte de entrega para cargo vans, viajes locales, última milla, recogidas el mismo día, transporte de herramientas y movimiento ligero de materiales entre patios, tiendas y obras.',
    supportCargoVanButton: 'Crear publicación de entrega',
    supportRepairTitle: 'Mecánica / Reparación de equipo',
    supportRepairBody:
      'Publica soporte de mecánico diésel, motores pequeños, reparación de skid steer, tractor, remolques, hidráulica o servicio móvil en campo para continuidad en obra.',
    supportRepairButton: 'Crear publicación de reparación',
    supplierActionTitle: 'Visibilidad de proveedor',
    supplierActionBody:
      'Crea publicaciones de visibilidad para proveedores para que contratistas y cuadrillas descubran materiales, patios y opciones de suministro más rápido.',
    supplierActionButton: 'Crear publicación de proveedor',
    supplierBoardsTitle: 'Descubrimiento de tiendas proveedoras',
    supplierBoardsIntro:
      'Explora actividad de proveedores y visibilidad de tiendas para materiales, herramientas, renta de equipo y acceso cercano a suministros de construcción.',
    supplierFeedTitle: 'Feed de proveedores',
    supplierFeedBody:
      'Abre publicaciones hechas por proveedores y actividad de visibilidad de tiendas dentro de la red Surplox.',
    supplierMaterialsTitle: 'Materiales e inventario',
    supplierMaterialsBody:
      'Ideal para concreto, madera, acero, drywall, herramientas, sujetadores, seguridad y descubrimiento de proveedores cercanos.',
    viewSupplierFeed: 'Explorar feed de proveedores',
    allTradesTitle: 'Tableros de oficio',
    allTradesIntro:
      'Abre un feed específico por oficio para ver discusión local y actividad de mano de obra.',
    jobsiteSupportTitle: 'Tableros de soporte de obra',
    jobsiteSupportIntro:
      'Explora secciones de soporte para movimiento de entregas y mecánica / reparación de equipo alrededor de obras activas.',
    emptyTitle: 'No se encontraron canales',
    emptyBody: 'Todavía no hay tableros de oficio disponibles.',
    viewPosts: 'Abrir canal',
    viewSupportPosts: 'Explorar soporte',
    materialDeliveryTitle: 'Entrega',
    materialDeliveryBody:
      'Ideal para hot shot, pickups, flatbeds, goosenecks, viajes locales, entregas el mismo día y soporte urgente de materiales.',
    cargoVanDeliveryTitle: 'Entrega',
    cargoVanDeliveryBody:
      'Ideal para operadores con cargo van que manejan viajes locales, última milla, recogidas el mismo día, herramientas y materiales ligeros entre tiendas, patios y obras.',
    fleetRepairTitle: 'Mecánica / Reparación de equipo',
    fleetRepairBody:
      'Ideal para mecánicos diésel, motores pequeños, reparación de skid steer y tractor, remolques, hidráulica y soporte de emergencia en campo.'
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
      <div
        className="card rounded-xl"
        style={{
          padding: 28,
          background: 'linear-gradient(180deg, #fff7c8 0%, #f7f7f2 100%)'
        }}
      >
        <div className="badge" style={{ marginBottom: 14, background: '#f1e7a8' }}>
          {copy.heroBadge}
        </div>

        <div className="h1" style={{ maxWidth: 760 }}>
          {copy.heroTitle}
        </div>

        <p className="muted" style={{ marginTop: 12, maxWidth: 820, fontSize: 17, lineHeight: 1.7 }}>
          {copy.heroBody}
        </p>

        <div className="grid two" style={{ marginTop: 18 }}>
          <InfoTile value={copy.stat1} />
          <InfoTile value={copy.stat2} />
          <InfoTile value={copy.stat3} />
        </div>
      </div>

      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="h1">{copy.title}</div>
        <p className="muted" style={{ marginTop: 8 }}>
          {copy.intro}
        </p>
      </div>

      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="card-section-title">{copy.quickActions}</div>

        <p className="card-section-subtitle" style={{ marginTop: 8 }}>
          {copy.quickActionsIntro}
        </p>

        <div className="grid two" style={{ marginTop: 14 }}>
          <Link
            className="card rounded-xl"
            to="/new?type=need_crew"
            style={{
              padding: 22,
              background: 'linear-gradient(180deg, #fffaf0 0%, #ffffff 100%)'
            }}
          >
            <div className="badge" style={{ background: '#ffde59', color: '#111111' }}>
              {copy.needCrewBadge}
            </div>

            <div style={{ fontWeight: 900, fontSize: 22, marginTop: 14, lineHeight: 1.15 }}>
              {copy.needCrewTitle}
            </div>

            <div className="muted" style={{ marginTop: 8, lineHeight: 1.6 }}>
              {copy.needCrewBody}
            </div>

            <div style={{ marginTop: 16 }}>
              <span className="btn small primary">{copy.needCrewButton}</span>
            </div>
          </Link>

          <Link
            className="card rounded-xl"
            to="/new?type=looking_for_work"
            style={{
              padding: 22,
              background: 'linear-gradient(180deg, #f8f7ef 0%, #ffffff 100%)'
            }}
          >
            <div className="badge" style={{ background: '#fff0b4', color: '#111111' }}>
              {copy.workBadge}
            </div>

            <div style={{ fontWeight: 900, fontSize: 22, marginTop: 14, lineHeight: 1.15 }}>
              {copy.workTitle}
            </div>

            <div className="muted" style={{ marginTop: 8, lineHeight: 1.6 }}>
              {copy.workBody}
            </div>

            <div style={{ marginTop: 16 }}>
              <span className="btn small">{copy.workButton}</span>
            </div>
          </Link>

          <Link
            className="card rounded-xl"
            to="/new?type=discussion&group=jobsite_support&support=material_delivery"
            style={{
              padding: 22,
              background: 'linear-gradient(180deg, #fff4da 0%, #ffffff 100%)'
            }}
          >
            <div className="badge" style={{ background: '#111111', color: '#ffffff' }}>
              {copy.deliveryBadge}
            </div>

            <div style={{ fontWeight: 900, fontSize: 22, marginTop: 14, lineHeight: 1.15 }}>
              {copy.supportDeliveryTitle}
            </div>

            <div className="muted" style={{ marginTop: 8, lineHeight: 1.6 }}>
              {copy.supportDeliveryBody}
            </div>

            <div style={{ marginTop: 16 }}>
              <span className="btn small primary">{copy.supportDeliveryButton}</span>
            </div>
          </Link>

          <Link
            className="card rounded-xl"
            to="/new?type=discussion&group=jobsite_support&support=cargo_van_delivery"
            style={{
              padding: 22,
              background: 'linear-gradient(180deg, #eef6ff 0%, #ffffff 100%)'
            }}
          >
            <div className="badge" style={{ background: '#d8ecff', color: '#0d3f73' }}>
              {copy.cargoVanBadge}
            </div>

            <div style={{ fontWeight: 900, fontSize: 22, marginTop: 14, lineHeight: 1.15 }}>
              {copy.supportCargoVanTitle}
            </div>

            <div className="muted" style={{ marginTop: 8, lineHeight: 1.6 }}>
              {copy.supportCargoVanBody}
            </div>

            <div style={{ marginTop: 16 }}>
              <span className="btn small">{copy.supportCargoVanButton}</span>
            </div>
          </Link>

          <Link
            className="card rounded-xl"
            to="/new?type=discussion&group=jobsite_support&support=equipment_fleet_repair"
            style={{
              padding: 22,
              background: 'linear-gradient(180deg, #f3f1e8 0%, #ffffff 100%)'
            }}
          >
            <div className="badge" style={{ background: '#f1e7a8', color: '#111111' }}>
              {copy.repairBadge}
            </div>

            <div style={{ fontWeight: 900, fontSize: 22, marginTop: 14, lineHeight: 1.15 }}>
              {copy.supportRepairTitle}
            </div>

            <div className="muted" style={{ marginTop: 8, lineHeight: 1.6 }}>
              {copy.supportRepairBody}
            </div>

            <div style={{ marginTop: 16 }}>
              <span className="btn small">{copy.supportRepairButton}</span>
            </div>
          </Link>

          <Link
            className="card rounded-xl"
            to="/new?type=discussion"
            style={{
              padding: 22,
              background: 'linear-gradient(180deg, #fff7cf 0%, #ffffff 100%)'
            }}
          >
            <div className="badge" style={{ background: '#f1e7a8', color: '#111111' }}>
              {copy.supplierBadge}
            </div>

            <div style={{ fontWeight: 900, fontSize: 22, marginTop: 14, lineHeight: 1.15 }}>
              {copy.supplierActionTitle}
            </div>

            <div className="muted" style={{ marginTop: 8, lineHeight: 1.6 }}>
              {copy.supplierActionBody}
            </div>

            <div style={{ marginTop: 16 }}>
              <span className="btn small">{copy.supplierActionButton}</span>
            </div>
          </Link>
        </div>
      </div>

      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="card-section-title">{copy.supplierBoardsTitle}</div>

        <p className="card-section-subtitle" style={{ marginTop: 8 }}>
          {copy.supplierBoardsIntro}
        </p>

        <div className="grid two" style={{ marginTop: 14 }}>
          <Link
            className="card rounded-xl"
            to="/feed?role=supplier"
            style={{
              padding: 20,
              background: '#ffffff'
            }}
          >
            <div className="badge" style={{ background: '#f1e7a8', color: '#111111' }}>
              {copy.supplierBadge}
            </div>

            <div
              style={{
                fontWeight: 900,
                fontSize: 20,
                marginTop: 14,
                lineHeight: 1.15
              }}
            >
              {copy.supplierFeedTitle}
            </div>

            <div className="muted" style={{ marginTop: 8, lineHeight: 1.6 }}>
              {copy.supplierFeedBody}
            </div>

            <div style={{ marginTop: 16 }}>
              <span className="btn small">{copy.viewSupplierFeed}</span>
            </div>
          </Link>

          <Link
            className="card rounded-xl"
            to="/feed?role=supplier"
            style={{
              padding: 20,
              background: '#ffffff'
            }}
          >
            <div className="badge" style={{ background: '#ecebe3', color: '#111111' }}>
              {copy.discussionBadge}
            </div>

            <div
              style={{
                fontWeight: 900,
                fontSize: 20,
                marginTop: 14,
                lineHeight: 1.15
              }}
            >
              {copy.supplierMaterialsTitle}
            </div>

            <div className="muted" style={{ marginTop: 8, lineHeight: 1.6 }}>
              {copy.supplierMaterialsBody}
            </div>

            <div style={{ marginTop: 16 }}>
              <span className="btn small">{copy.viewSupplierFeed}</span>
            </div>
          </Link>
        </div>
      </div>

      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="card-section-title">{copy.jobsiteSupportTitle}</div>

        <p className="card-section-subtitle" style={{ marginTop: 8 }}>
          {copy.jobsiteSupportIntro}
        </p>

        <div className="grid two" style={{ marginTop: 14 }}>
          <Link
            className="card rounded-xl"
            to="/feed?category=jobsite_support&support=material_delivery"
            style={{
              padding: 20,
              background: '#ffffff'
            }}
          >
            <div className="badge" style={{ background: '#111111', color: '#ffffff' }}>
              {copy.deliveryBadge}
            </div>

            <div
              style={{
                fontWeight: 900,
                fontSize: 20,
                marginTop: 14,
                lineHeight: 1.15
              }}
            >
              {copy.materialDeliveryTitle}
            </div>

            <div className="muted" style={{ marginTop: 8, lineHeight: 1.6 }}>
              {copy.materialDeliveryBody}
            </div>

            <div style={{ marginTop: 16 }}>
              <span className="btn small">{copy.viewSupportPosts}</span>
            </div>
          </Link>

          <Link
            className="card rounded-xl"
            to="/feed?category=jobsite_support&support=cargo_van_delivery"
            style={{
              padding: 20,
              background: '#ffffff'
            }}
          >
            <div className="badge" style={{ background: '#d8ecff', color: '#0d3f73' }}>
              {copy.cargoVanBadge}
            </div>

            <div
              style={{
                fontWeight: 900,
                fontSize: 20,
                marginTop: 14,
                lineHeight: 1.15
              }}
            >
              {copy.cargoVanDeliveryTitle}
            </div>

            <div className="muted" style={{ marginTop: 8, lineHeight: 1.6 }}>
              {copy.cargoVanDeliveryBody}
            </div>

            <div style={{ marginTop: 16 }}>
              <span className="btn small">{copy.viewSupportPosts}</span>
            </div>
          </Link>

          <Link
            className="card rounded-xl"
            to="/feed?category=jobsite_support&support=equipment_fleet_repair"
            style={{
              padding: 20,
              background: '#ffffff'
            }}
          >
            <div className="badge" style={{ background: '#f1e7a8', color: '#111111' }}>
              {copy.repairBadge}
            </div>

            <div
              style={{
                fontWeight: 900,
                fontSize: 20,
                marginTop: 14,
                lineHeight: 1.15
              }}
            >
              {copy.fleetRepairTitle}
            </div>

            <div className="muted" style={{ marginTop: 8, lineHeight: 1.6 }}>
              {copy.fleetRepairBody}
            </div>

            <div style={{ marginTop: 16 }}>
              <span className="btn small">{copy.viewSupportPosts}</span>
            </div>
          </Link>
        </div>
      </div>

      <div className="card rounded-xl" style={{ padding: 22 }}>
        <div className="card-section-title">{copy.allTradesTitle}</div>

        <p className="card-section-subtitle" style={{ marginTop: 8 }}>
          {copy.allTradesIntro}
        </p>

        {tradeLinks.length === 0 ? (
          <div className="card-soft" style={{ marginTop: 14 }}>
            <div className="card-section-title">{copy.emptyTitle}</div>

            <p className="card-section-subtitle" style={{ marginTop: 8 }}>
              {copy.emptyBody}
            </p>
          </div>
        ) : (
          <div className="grid two" style={{ marginTop: 14 }}>
            {tradeLinks.map((trade) => (
              <Link
                key={trade.id}
                className="card rounded-xl"
                to={trade.href}
                style={{
                  padding: 20,
                  background: '#ffffff'
                }}
              >
                <div className="badge" style={{ background: '#ecebe3', color: '#111111' }}>
                  {copy.discussionBadge}
                </div>

                <div
                  style={{
                    fontWeight: 900,
                    fontSize: 20,
                    marginTop: 14,
                    lineHeight: 1.15
                  }}
                >
                  {trade.name}
                </div>

                <div className="muted" style={{ marginTop: 8 }}>
                  {copy.viewPosts}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}