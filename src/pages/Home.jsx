import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

const COPY = {
  en: {
    heroBadge: 'Construction operating network',
    heroTitle: 'Labor, suppliers, delivery, and repair — connected around the jobsite.',
    heroBody:
      'Surplox helps crews, laborers, contractors, suppliers, runners, delivery support, and repair support connect faster so work keeps moving. Start with labor today. Expand into supplier storefronts, supplier access, cargo van delivery, material delivery, and fleet support as the network grows.',
    ctaPrimary: 'Enter Surplox',
    ctaSecondary: 'View Channels',

    proof1: 'Need crew',
    proof2: 'Looking for work',
    proof3: 'Material delivery / hot shot',
    proof4: 'Cargo van / local delivery',
    proof5: 'Equipment / fleet repair',
    proof6: 'Supplier storefronts',

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
    pillarSupplierTitle: 'Supplier Storefronts',
    pillarSupplierBody:
      'Suppliers can stay visible to the field, show business location details, materials categories, delivery radius, and become part of the local operating network around active jobsites.',
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
      'Jobsites constantly lose time when someone has to leave for tools, supplies, deliveries, or last-minute pickups. Supplier storefront visibility helps close that gap.',
    lane3Title: 'Keep equipment running',
    lane3Body:
      'Breakdowns stop work. Repair support close to the field can protect uptime and project momentum.',

    roadmapTitle: 'The growth path',
    roadmap1: 'Start with labor liquidity in one market',
    roadmap2: 'Add contractor demand and repeat hiring',
    roadmap3: 'Layer in supplier storefronts and jobsite support users',
    roadmap4: 'Expand into cargo van, material delivery, and repair support',

    supportTitle: 'Now entering Jobsite Support',
    supportBody:
      'Surplox is expanding carefully into construction-adjacent operations without losing focus. That means keeping the app centered on jobsite activity — not turning it into a generic gig marketplace.',
    supportDelivery: 'Material Delivery / Hot Shot',
    supportCargoVan: 'Cargo Van / Local Delivery',
    supportRepair: 'Equipment / Fleet Repair',

    storefrontTitle: 'Supplier storefronts built for the field',
    storefrontBody:
      'Supplier accounts are not just contact records. They are storefront-ready business locations that can show materials categories, business location, hours, and delivery coverage so contractors and crews can make faster decisions.',
    storefrontPoint1: 'Business location visibility',
    storefrontPoint2: 'Materials category discovery',
    storefrontPoint3: 'Storefront and yard presence',
    storefrontPoint4: 'Delivery radius and local supply access',

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
      'Surplox ayuda a cuadrillas, trabajadores, contratistas, proveedores, runners, soporte de entrega y soporte de reparación a conectarse más rápido para que el trabajo siga avanzando. Empieza con mano de obra hoy. Expándete hacia tiendas proveedoras, acceso a proveedores, cargo van, entrega de materiales y soporte de flota conforme crece la red.',
    ctaPrimary: 'Entrar a Surplox',
    ctaSecondary: 'Ver canales',

    proof1: 'Se necesita cuadrilla',
    proof2: 'Buscando trabajo',
    proof3: 'Entrega de materiales / hot shot',
    proof4: 'Cargo van / entrega local',
    proof5: 'Reparación de equipo / flota',
    proof6: 'Tiendas proveedoras',

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
    pillarSupplierTitle: 'Tiendas proveedoras',
    pillarSupplierBody:
      'Los proveedores pueden mantenerse visibles para el campo, mostrar detalles del negocio, categorías de materiales, radio de entrega y formar parte de la red operativa local alrededor de obras activas.',
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
      'Las obras pierden tiempo constantemente cuando alguien tiene que salir por herramientas, suministros, entregas o recogidas de último minuto. La visibilidad de tiendas proveedoras ayuda a cerrar esa brecha.',
    lane3Title: 'Mantener el equipo funcionando',
    lane3Body:
      'Las fallas detienen el trabajo. Tener soporte de reparación cerca del campo protege el tiempo activo y el avance del proyecto.',

    roadmapTitle: 'La ruta de crecimiento',
    roadmap1: 'Empezar con liquidez laboral en un mercado',
    roadmap2: 'Agregar demanda de contratistas y contrataciones repetidas',
    roadmap3: 'Incorporar tiendas proveedoras y usuarios de soporte de obra',
    roadmap4: 'Expandirse hacia cargo van, entrega de materiales y soporte de reparación',

    supportTitle: 'Ahora entrando a Soporte de obra',
    supportBody:
      'Surplox se está expandiendo con cuidado hacia operaciones adyacentes a la construcción sin perder enfoque. Eso significa mantener la app centrada en la actividad de obra, no convertirla en un marketplace genérico.',
    supportDelivery: 'Entrega de materiales / Hot Shot',
    supportCargoVan: 'Cargo Van / Entrega local',
    supportRepair: 'Reparación de equipo / flota',

    storefrontTitle: 'Tiendas proveedoras hechas para el campo',
    storefrontBody:
      'Las cuentas de proveedor no son solo registros de contacto. Son ubicaciones comerciales listas para tienda que pueden mostrar categorías de materiales, ubicación del negocio, horarios y cobertura de entrega para que contratistas y cuadrillas decidan más rápido.',
    storefrontPoint1: 'Visibilidad de ubicación comercial',
    storefrontPoint2: 'Descubrimiento por categoría de materiales',
    storefrontPoint3: 'Presencia de tienda y patio',
    storefrontPoint4: 'Radio de entrega y acceso local a suministros',

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

function ProofTile({ value }) {
  return (
    <div className="card-soft" style={{ minHeight: 92 }}>
      <div style={{ fontWeight: 800, fontSize: 16, lineHeight: 1.35 }}>{value}</div>
    </div>
  )
}


function roleCardConfig(profile, lang = 'en') {
  const role = String(profile?.role || '').trim()
  const isEs = lang === 'es'

  if (role === 'contractor') {
    return {
      badge: isEs ? 'Experiencia del contratista' : 'Contractor experience',
      title: isEs ? 'Convierte Surplox en tu tablero de ejecución.' : 'Turn Surplox into your execution board.',
      body: isEs
        ? 'Inicia el Project Engine, publica solicitudes de cuadrilla, descubre proveedores y coordina entregas desde un solo lugar.'
        : 'Launch the Project Engine, post crew demand, discover suppliers, and coordinate delivery from one place.',
      primaryLabel: isEs ? 'Abrir Project Engine' : 'Open Project Engine',
      primaryTo: '/ai-tools',
      secondaryLabel: isEs ? 'Crear publicación de cuadrilla' : 'Create Need Crew Post',
      secondaryTo: '/new?type=need_crew'
    }
  }

  if (role === 'supplier') {
    return {
      badge: isEs ? 'Experiencia del proveedor' : 'Supplier experience',
      title: isEs ? 'Haz que tu tienda esté visible para la obra.' : 'Make your storefront visible to the field.',
      body: isEs
        ? 'Actualiza materiales, horas, radio de entrega y usa la búsqueda de materiales para ver cómo te descubre la red.'
        : 'Update materials, hours, delivery radius, and use materials search to see how the network discovers you.',
      primaryLabel: isEs ? 'Abrir materiales' : 'Open Materials',
      primaryTo: '/materials',
      secondaryLabel: isEs ? 'Abrir mi cuenta' : 'Open My Account',
      secondaryTo: '/account'
    }
  }

  if (role === 'driver') {
    return {
      badge: isEs ? 'Experiencia del conductor' : 'Driver experience',
      title: isEs ? 'Encuentra entregas que encajen con tu capacidad.' : 'Find deliveries that fit your capability.',
      body: isEs
        ? 'Busca por vehículo, remolque, carga útil y radio para posicionarte en la línea proveedor → conductor → obra.'
        : 'Search by vehicle, trailer, payload, and radius to position yourself in the supplier → driver → jobsite lane.',
      primaryLabel: isEs ? 'Abrir entrega' : 'Open Delivery',
      primaryTo: '/delivery',
      secondaryLabel: isEs ? 'Crear publicación de entrega' : 'Create Delivery Support Post',
      secondaryTo: '/new?category=jobsite_support&support=material_delivery'
    }
  }

  if (role === 'mechanic') {
    return {
      badge: isEs ? 'Experiencia de reparación' : 'Repair experience',
      title: isEs ? 'Mantente visible para soporte urgente de obra.' : 'Stay visible for urgent field repair support.',
      body: isEs
        ? 'Usa canales y el feed para responder más rápido a necesidades de reparación de equipo y flota.'
        : 'Use channels and the feed to respond faster to equipment and fleet repair needs.',
      primaryLabel: isEs ? 'Abrir canales' : 'Open Channels',
      primaryTo: '/channels',
      secondaryLabel: isEs ? 'Crear publicación de reparación' : 'Create Repair Support Post',
      secondaryTo: '/new?category=jobsite_support&support=equipment_fleet_repair'
    }
  }

  return {
    badge: isEs ? 'Experiencia de Surplox' : 'Surplox experience',
    title: isEs ? 'Ve directo a las oportunidades locales.' : 'Jump straight into local opportunities.',
    body: isEs
      ? 'Abre el feed, revisa canales y mantén tu perfil listo para nuevas conexiones.'
      : 'Open the feed, check channels, and keep your profile ready for new connections.',
    primaryLabel: isEs ? 'Abrir feed' : 'Open Feed',
    primaryTo: '/feed',
    secondaryLabel: isEs ? 'Abrir canales' : 'Open Channels',
    secondaryTo: '/channels'
  }
}

export default function Home({ lang = 'en' }) {
  const copy = COPY[lang] || COPY.en
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    let mounted = true

    async function load() {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      const nextSession = data.session || null
      setSession(nextSession)

      if (nextSession?.user?.id) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('user_id, role, display_name, business_name, category_group')
          .eq('user_id', nextSession.user.id)
          .maybeSingle()

        if (!mounted) return
        setProfile(profileData || null)
      } else {
        setProfile(null)
      }
    }

    load()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession || null)

      if (!nextSession?.user?.id) {
        setProfile(null)
        return
      }

      supabase
        .from('profiles')
        .select('user_id, role, display_name, business_name, category_group')
        .eq('user_id', nextSession.user.id)
        .maybeSingle()
        .then(({ data: profileData }) => {
          if (mounted) setProfile(profileData || null)
        })
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const roleExperience = useMemo(() => roleCardConfig(profile, lang), [profile, lang])

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

        <div className="h1" style={{ maxWidth: 900 }}>
          {copy.heroTitle}
        </div>

        <p className="muted" style={{ marginTop: 12, maxWidth: 920, fontSize: 17, lineHeight: 1.75 }}>
          {copy.heroBody}
        </p>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
          <Link className="btn primary" to="/auth?mode=signup">
            {copy.ctaPrimary}
          </Link>

          <Link className="btn" to="/channels">
            {copy.ctaSecondary}
          </Link>
        </div>

        
      </div>

      {session ? (
        <div
          className="card rounded-xl"
          style={{
            padding: 24,
            background: 'linear-gradient(180deg, #eef3ff 0%, #ffffff 100%)'
          }}
        >
          <div className="badge" style={{ marginBottom: 14, background: '#d8ecff', color: '#0d3f73' }}>
            {roleExperience.badge}
          </div>

          <div className="h2" style={{ fontSize: 28, maxWidth: 860 }}>
            {roleExperience.title}
          </div>

          <p className="muted" style={{ marginTop: 10, maxWidth: 900, lineHeight: 1.75 }}>
            {roleExperience.body}
          </p>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
            <Link className="btn primary" to={roleExperience.primaryTo}>
              {roleExperience.primaryLabel}
            </Link>
            <Link className="btn" to={roleExperience.secondaryTo}>
              {roleExperience.secondaryLabel}
            </Link>
          </div>
        </div>
      ) : null}


      <div className="card rounded-xl" style={{ padding: 24 }}>
        <div className="card-section-title">{copy.missionTitle}</div>
        <p className="muted" style={{ marginTop: 10, lineHeight: 1.75 }}>
          {copy.missionBody}
        </p>
      </div>

      <div className="grid two">
        <PillarCard
          badge={lang === 'es' ? 'Mano de obra' : 'Labor'}
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

      <div className="card rounded-xl" style={{ padding: 24, background: '#fffaf0' }}>
        <div className="card-section-title">{copy.storefrontTitle}</div>
        <p className="muted" style={{ marginTop: 10, lineHeight: 1.75, maxWidth: 920 }}>
          {copy.storefrontBody}
        </p>

        <div className="grid two" style={{ marginTop: 16 }}>
          <ProofTile value={copy.storefrontPoint1} />
          <ProofTile value={copy.storefrontPoint2} />
          <ProofTile value={copy.storefrontPoint3} />
          <ProofTile value={copy.storefrontPoint4} />
        </div>
      </div>

      <div className="grid three">
        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">{copy.lane1Title}</div>
          <p className="muted" style={{ marginTop: 10, lineHeight: 1.7 }}>
            {copy.lane1Body}
          </p>
        </div>

        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">{copy.lane2Title}</div>
          <p className="muted" style={{ marginTop: 10, lineHeight: 1.7 }}>
            {copy.lane2Body}
          </p>
        </div>

        <div className="card rounded-xl" style={{ padding: 22 }}>
          <div className="card-section-title">{copy.lane3Title}</div>
          <p className="muted" style={{ marginTop: 10, lineHeight: 1.7 }}>
            {copy.lane3Body}
          </p>
        </div>
      </div>

      <div className="card rounded-xl" style={{ padding: 24 }}>
        <div className="card-section-title">{copy.roadmapTitle}</div>

        <div className="grid two" style={{ marginTop: 16 }}>
          <ProofTile value={copy.roadmap1} />
          <ProofTile value={copy.roadmap2} />
          <ProofTile value={copy.roadmap3} />
          <ProofTile value={copy.roadmap4} />
        </div>
      </div>

      <div className="card rounded-xl" style={{ padding: 24 }}>
        <div className="card-section-title">{copy.supportTitle}</div>
        <p className="muted" style={{ marginTop: 10, lineHeight: 1.75, maxWidth: 920 }}>
          {copy.supportBody}
        </p>

        <div className="grid three" style={{ marginTop: 16 }}>
          <ProofTile value={copy.supportDelivery} />
          <ProofTile value={copy.supportCargoVan} />
          <ProofTile value={copy.supportRepair} />
        </div>
      </div>

      <div className="card surface-dark rounded-xl" style={{ padding: 28 }}>
        <div className="h1" style={{ color: '#ffffff', maxWidth: 860 }}>
          {copy.finalTitle}
        </div>

        <p
          style={{
            marginTop: 12,
            color: 'rgba(255,255,255,0.82)',
            lineHeight: 1.8,
            maxWidth: 900
          }}
        >
          {copy.finalBody}
        </p>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
          <Link className="btn primary" to="/auth?mode=signin">
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