import React from 'react'
import { Link } from 'react-router-dom'

const COPY = {
  en: {
    heroBadge: 'Construction operating network',
    heroTitle: 'Labor, suppliers, delivery, and repair — connected around the jobsite.',
    heroBody:
      'Surplox helps crews, laborers, contractors, suppliers, runners, delivery support, and repair support connect faster so work keeps moving. Start with labor today. Expand into supplier access, cargo van delivery, material delivery, and fleet support as the network grows.',
    ctaPrimary: 'Enter Surplox',
    ctaSecondary: 'View Channels',

    proof1: 'Need crew',
    proof2: 'Looking for work',
    proof3: 'Material delivery / hot shot',
    proof4: 'Cargo van / local delivery',
    proof5: 'Equipment / fleet repair',
    proof6: 'Supplier network',

    missionTitle: 'Built around real construction operations',
    missionBody:
      'A jobsite does not only need labor. It also needs suppliers, materials moved, equipment kept running, and trusted people who can respond fast. Surplox is being built to connect that ecosystem one layer at a time.',

    pillarsTitle: 'The Surplox ecosystem',
    pillarLaborTitle: 'Labor Network',
    pillarLaborBody:
      'Crews, laborers, tradesmen, and subcontractors can post availability, ask questions, and fill manpower gaps faster.',
    pillarDemandTitle: 'Contractor Demand',
    pillarDemandBody:
      'Contractors and foremen can post crew needs, find local labor, and build a stronger repeat network over time.',
    pillarSupplierTitle: 'Supplier Access',
    pillarSupplierBody:
      'Suppliers can stay visible to the field, show what they provide, and become part of the local operating network around active jobsites.',
    pillarDeliveryTitle: 'Material Delivery / Hot Shot',
    pillarDeliveryBody:
      'Cargo vans, pickups, flatbeds, and goosenecks can support local material runs, jobsite pickups, and urgent supply movement.',
    pillarCargoVanTitle: 'Cargo Van / Local Delivery',
    pillarCargoVanBody:
      'Cargo van operators can handle local runs, same-day pickups, last-mile delivery, tools, and lighter material movement between yards, stores, and jobsites.',
    pillarRepairTitle: 'Equipment / Fleet Repair',
    pillarRepairBody:
      'Diesel mechanics, trailer repair, and heavy equipment support help jobsites stay moving when equipment problems hit.',

    lanesTitle: 'Why this matters',
    lane1Title: 'Keep labor connected',
    lane1Body:
      'Workers need visibility and contractors need fast access to available people nearby.',
    lane2Title: 'Keep suppliers and materials moving',
    lane2Body:
      'Jobsites constantly lose time when someone has to leave for tools, supplies, deliveries, or last-minute pickups.',
    lane3Title: 'Keep equipment running',
    lane3Body:
      'Breakdowns stop work. Repair support close to the field can protect uptime and project momentum.',

    roadmapTitle: 'The growth path',
    roadmap1: 'Start with labor liquidity in one market',
    roadmap2: 'Add contractor demand and repeat hiring',
    roadmap3: 'Layer in supplier and jobsite support users',
    roadmap4: 'Expand into cargo van, material delivery, and repair support',

    supportTitle: 'Now entering Jobsite Support',
    supportBody:
      'Surplox is expanding carefully into construction-adjacent operations without losing focus. That means keeping the app centered on jobsite activity — not turning it into a generic gig marketplace.',
    supportDelivery: 'Material Delivery / Hot Shot',
    supportCargoVan: 'Cargo Van / Local Delivery',
    supportRepair: 'Equipment / Fleet Repair',

    finalTitle: 'A network built to compound',
    finalBody:
      'The more real workers, contractors, suppliers, runners, drivers, mechanics, and repair specialists who use Surplox locally, the more valuable the network becomes for everyone inside it.',
    finalCtaPrimary: 'Sign In',
    finalCtaSecondary: 'Explore Channels'
  },
  es: {
    heroBadge: 'Red operativa de construcción',
    heroTitle: 'Mano de obra, proveedores, entrega y reparación — conectadas alrededor de la obra.',
    heroBody:
      'Surplox ayuda a cuadrillas, trabajadores, contratistas, proveedores, runners, soporte de entrega y soporte de reparación a conectarse más rápido para que el trabajo siga avanzando. Empieza con mano de obra hoy. Expándete hacia acceso a proveedores, cargo van, entrega de materiales y soporte de flota conforme crece la red.',
    ctaPrimary: 'Entrar a Surplox',
    ctaSecondary: 'Ver canales',

    proof1: 'Se necesita cuadrilla',
    proof2: 'Buscando trabajo',
    proof3: 'Entrega de materiales / hot shot',
    proof4: 'Cargo van / entrega local',
    proof5: 'Reparación de equipo / flota',
    proof6: 'Red de proveedores',

    missionTitle: 'Construido alrededor de operaciones reales de obra',
    missionBody:
      'Una obra no solo necesita mano de obra. También necesita proveedores, mover materiales, mantener el equipo funcionando y personas confiables que puedan responder rápido. Surplox se está construyendo para conectar ese ecosistema una capa a la vez.',

    pillarsTitle: 'El ecosistema de Surplox',
    pillarLaborTitle: 'Red de mano de obra',
    pillarLaborBody:
      'Cuadrillas, trabajadores, oficios y subcontratistas pueden publicar disponibilidad, hacer preguntas y cubrir faltantes de personal más rápido.',
    pillarDemandTitle: 'Demanda del contratista',
    pillarDemandBody:
      'Contratistas y capataces pueden publicar necesidades de cuadrilla, encontrar mano de obra local y construir una red de confianza con el tiempo.',
    pillarSupplierTitle: 'Acceso a proveedores',
    pillarSupplierBody:
      'Los proveedores pueden mantenerse visibles para el campo, mostrar lo que suministran y formar parte de la red operativa local alrededor de obras activas.',
    pillarDeliveryTitle: 'Entrega de materiales / Hot Shot',
    pillarDeliveryBody:
      'Cargo vans, pickups, flatbeds y goosenecks pueden apoyar viajes locales de materiales, recolecciones en tienda y movimiento urgente de suministros.',
    pillarCargoVanTitle: 'Cargo Van / Entrega local',
    pillarCargoVanBody:
      'Los operadores con cargo van pueden cubrir viajes locales, recogidas el mismo día, última milla, herramientas y movimiento ligero de materiales entre patios, tiendas y obras.',
    pillarRepairTitle: 'Reparación de equipo / flota',
    pillarRepairBody:
      'Mecánicos diésel, reparación de remolques y soporte de equipo pesado ayudan a que las obras sigan activas cuando aparecen problemas mecánicos.',

    lanesTitle: 'Por qué importa',
    lane1Title: 'Mantener conectada la mano de obra',
    lane1Body:
      'Los trabajadores necesitan visibilidad y los contratistas necesitan acceso rápido a gente disponible cerca.',
    lane2Title: 'Mantener proveedores y materiales moviéndose',
    lane2Body:
      'Las obras pierden tiempo constantemente cuando alguien tiene que salir por herramientas, suministros, entregas o recogidas de último minuto.',
    lane3Title: 'Mantener el equipo funcionando',
    lane3Body:
      'Las fallas detienen el trabajo. Tener soporte de reparación cerca del campo protege el tiempo activo y el avance del proyecto.',

    roadmapTitle: 'La ruta de crecimiento',
    roadmap1: 'Empezar con liquidez laboral en un mercado',
    roadmap2: 'Agregar demanda de contratistas y contrataciones repetidas',
    roadmap3: 'Incorporar proveedores y usuarios de soporte de obra',
    roadmap4: 'Expandirse hacia cargo van, entrega de materiales y soporte de reparación',

    supportTitle: 'Ahora entrando a Soporte de obra',
    supportBody:
      'Surplox se está expandiendo con cuidado hacia operaciones adyacentes a la construcción sin perder enfoque. Eso significa mantener la app centrada en la actividad de obra, no convertirla en un marketplace genérico.',
    supportDelivery: 'Entrega de materiales / Hot Shot',
    supportCargoVan: 'Cargo Van / Entrega local',
    supportRepair: 'Reparación de equipo / flota',

    finalTitle: 'Una red hecha para acumular valor',
    finalBody:
      'Entre más trabajadores, contratistas, proveedores, runners, conductores, mecánicos y especialistas de reparación usen Surplox localmente, más valiosa se vuelve la red para todos los que están dentro.',
    finalCtaPrimary: 'Entrar',
    finalCtaSecondary: 'Explorar canales'
  }
}

function PillarCard({ badge, title, body, dark = false }) {
  return (
    <div
      className={dark ? 'card surface-dark rounded-xl' : 'card rounded-xl'}
      style={{ padding: 22 }}
    >
      <div
        className="badge"
        style={
          dark
            ? { background: 'rgba(255,255,255,0.12)', color: '#ffffff' }
            : { background: '#f1e7a8', color: '#111111' }
        }
      >
        {badge}
      </div>
      <div style={{ marginTop: 14, fontWeight: 900, fontSize: 24, lineHeight: 1.12 }}>
        {title}
      </div>
      <p
        style={{
          marginTop: 10,
          lineHeight: 1.7,
          color: dark ? 'rgba(255,255,255,0.82)' : 'var(--muted)'
        }}
      >
        {body}
      </p>
    </div>
  )
}

export default function Home({ lang = 'en' }) {
  const copy = COPY[lang] || COPY.en

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div
        className="card rounded-xl"
        style={{
          padding: 32,
          background: 'linear-gradient(180deg, #fff7c8 0%, #ffffff 100%)'
        }}
      >
        <div className="badge" style={{ marginBottom: 16, background: '#f1e7a8' }}>
          {copy.heroBadge}
        </div>

        <div className="grid two" style={{ alignItems: 'start' }}>
          <div>
            <div className="h1" style={{ maxWidth: 760 }}>
              {copy.heroTitle}
            </div>

            <p
              className="muted"
              style={{
                marginTop: 14,
                fontSize: 18,
                lineHeight: 1.75,
                maxWidth: 820
              }}
            >
              {copy.heroBody}
            </p>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 20 }}>
              <Link className="btn primary" to="/auth">
                {copy.ctaPrimary}
              </Link>
              <Link className="btn" to="/channels">
                {copy.ctaSecondary}
              </Link>
            </div>
          </div>

          <div className="grid" style={{ gap: 12 }}>
            <div className="card-soft" style={{ minHeight: 92 }}>
              <div style={{ fontWeight: 800, fontSize: 16 }}>{copy.proof1}</div>
            </div>
            <div className="card-soft" style={{ minHeight: 92 }}>
              <div style={{ fontWeight: 800, fontSize: 16 }}>{copy.proof2}</div>
            </div>
            <div className="card-soft" style={{ minHeight: 92 }}>
              <div style={{ fontWeight: 800, fontSize: 16 }}>{copy.proof3}</div>
            </div>
            <div className="card-soft" style={{ minHeight: 92 }}>
              <div style={{ fontWeight: 800, fontSize: 16 }}>{copy.proof4}</div>
            </div>
            <div className="card-soft" style={{ minHeight: 92 }}>
              <div style={{ fontWeight: 800, fontSize: 16 }}>{copy.proof5}</div>
            </div>
            <div className="card-soft" style={{ minHeight: 92 }}>
              <div style={{ fontWeight: 800, fontSize: 16 }}>{copy.proof6}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card rounded-xl" style={{ padding: 24 }}>
        <div className="card-section-title">{copy.missionTitle}</div>
        <p className="card-section-subtitle" style={{ marginTop: 10, lineHeight: 1.8 }}>
          {copy.missionBody}
        </p>
      </div>

      <div className="card rounded-xl" style={{ padding: 24 }}>
        <div className="card-section-title">{copy.pillarsTitle}</div>

        <div className="grid two" style={{ marginTop: 16 }}>
          <PillarCard
            badge={lang === 'es' ? 'Labor' : 'Labor'}
            title={copy.pillarLaborTitle}
            body={copy.pillarLaborBody}
          />
          <PillarCard
            badge={lang === 'es' ? 'Demanda' : 'Demand'}
            title={copy.pillarDemandTitle}
            body={copy.pillarDemandBody}
          />
          <PillarCard
            badge={lang === 'es' ? 'Proveedor' : 'Supplier'}
            title={copy.pillarSupplierTitle}
            body={copy.pillarSupplierBody}
          />
          <PillarCard
            badge={lang === 'es' ? 'Entrega' : 'Delivery'}
            title={copy.pillarDeliveryTitle}
            body={copy.pillarDeliveryBody}
          />
          <PillarCard
            badge={lang === 'es' ? 'Cargo Van' : 'Cargo Van'}
            title={copy.pillarCargoVanTitle}
            body={copy.pillarCargoVanBody}
          />
          <PillarCard
            badge={lang === 'es' ? 'Reparación' : 'Repair'}
            title={copy.pillarRepairTitle}
            body={copy.pillarRepairBody}
          />
        </div>
      </div>

      <div className="grid two">
        <PillarCard
          badge="01"
          title={copy.lane1Title}
          body={copy.lane1Body}
        />
        <PillarCard
          badge="02"
          title={copy.lane2Title}
          body={copy.lane2Body}
        />
        <PillarCard
          badge="03"
          title={copy.lane3Title}
          body={copy.lane3Body}
          dark
        />
      </div>

      <div className="card rounded-xl" style={{ padding: 24 }}>
        <div className="card-section-title">{copy.roadmapTitle}</div>

        <div className="grid two" style={{ marginTop: 16 }}>
          <div className="card-soft"><div style={{ fontWeight: 800 }}>{copy.roadmap1}</div></div>
          <div className="card-soft"><div style={{ fontWeight: 800 }}>{copy.roadmap2}</div></div>
          <div className="card-soft"><div style={{ fontWeight: 800 }}>{copy.roadmap3}</div></div>
          <div className="card-soft"><div style={{ fontWeight: 800 }}>{copy.roadmap4}</div></div>
        </div>
      </div>

      <div
        className="card rounded-xl"
        style={{
          padding: 24,
          background: 'linear-gradient(180deg, #f5f3e8 0%, #ffffff 100%)'
        }}
      >
        <div className="card-section-title">{copy.supportTitle}</div>
        <p className="card-section-subtitle" style={{ marginTop: 10, lineHeight: 1.8 }}>
          {copy.supportBody}
        </p>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
          <Link
            className="btn"
            to="/feed?category=jobsite_support&support=material_delivery"
          >
            {copy.supportDelivery}
          </Link>
          <Link
            className="btn"
            to="/feed?category=jobsite_support&support=cargo_van_delivery"
          >
            {copy.supportCargoVan}
          </Link>
          <Link
            className="btn"
            to="/feed?category=jobsite_support&support=equipment_fleet_repair"
          >
            {copy.supportRepair}
          </Link>
        </div>
      </div>

      <div className="card rounded-xl" style={{ padding: 28, background: '#111111', color: '#ffffff' }}>
        <div className="h1" style={{ maxWidth: 760 }}>
          {copy.finalTitle}
        </div>

        <p
          style={{
            marginTop: 12,
            maxWidth: 820,
            lineHeight: 1.75,
            color: 'rgba(255,255,255,0.82)'
          }}
        >
          {copy.finalBody}
        </p>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
          <Link className="btn primary" to="/auth">
            {copy.finalCtaPrimary}
          </Link>
          <Link className="btn" to="/channels">
            {copy.finalCtaSecondary}
          </Link>
        </div>
      </div>
    </div>
  )
}