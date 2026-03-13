import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const COPY = {
  en: {
    badge: 'Built for local construction',
    title: 'The network where crews, workers, and opportunities move faster.',
    body:
      'Surplox helps laborers, subcontractors, contractors, and suppliers stay connected in one place. Discover nearby work, post crew needs, show availability, grow your network, and stay in the loop on real trade activity happening around you.',
    primaryCta: 'Join Surplox',
    joinBadge: 'Fast signup for crews, classmates, and local workers',
    joinTitle: 'Join the Surplox construction network before the next opportunity moves without you.',
    joinBody:
      'Create your profile, get visible to local trade activity, and invite your crew or classmates onto Surplox in a few taps.',
    joinPrimaryCta: 'Create Your Profile',
    joinSecondaryCta: 'Already have an account? Sign In',
    joinPoint1: 'Find crews and nearby work',
    joinPoint2: 'Ask trade questions and stay visible',
    joinPoint3: 'Invite your class or crew with one link',
    secondaryCta: 'Sign In',
    signedInPrimary: 'Go to Feed',
    signedInSecondary: 'Create Post',

    valueTitle: 'What Surplox does now',
    valueBody:
      'Surplox is no longer just a forum. It is a live local construction network built to help the right people find each other faster and keep work moving.',

    card1Title: 'Find nearby opportunities',
    card1Body:
      'See local trade activity based on ZIP code and radius so relevant work, discussions, and crew needs are easier to discover.',

    card2Title: 'Build and fill crews',
    card2Body:
      'Post when you need labor, track who joins, and move people into real job opportunities faster.',

    card3Title: 'Show availability',
    card3Body:
      'Workers and subs can stay visible with profiles, trade details, travel radius, and current availability.',

    card4Title: 'Strengthen your network',
    card4Body:
      'Stay connected through activity, alerts, replies, and repeat working relationships across your market.',

    audienceTitle: 'Who it is for',
    audience1: 'Laborers looking for local work and visibility',
    audience2: 'Subcontractors building crews and finding help',
    audience3: 'Contractors filling labor gaps and posting opportunities',
    audience4: 'Suppliers staying connected to active job markets',

    bottomTitle: 'Built for the field, not the office.',
    bottomBody:
      'Surplox is designed around how construction actually moves — through people, timing, location, and trusted local connections.',

    inviteHint: 'Someone in your network invited you to join Surplox.',
    heroTag1: 'Local network',
    heroTag2: 'Crew activity',
    heroTag3: 'Faster field visibility',
    stat1Label: 'Built for',
    stat1Value: 'Laborers, subs, contractors, suppliers',
    stat2Label: 'What moves here',
    stat2Value: 'Work, crews, trade activity, visibility',
    stat3Label: 'Why it matters',
    stat3Value: 'Faster local connections'
  },
  es: {
    badge: 'Hecho para la construcción local',
    title: 'La red donde cuadrillas, trabajadores y oportunidades avanzan más rápido.',
    body:
      'Surplox ayuda a trabajadores, subcontratistas, contratistas y proveedores a mantenerse conectados en un solo lugar. Descubre trabajo cercano, publica necesidades de cuadrilla, muestra disponibilidad, haz crecer tu red y mantente al tanto de la actividad real del oficio cerca de ti.',
    primaryCta: 'Unirse a Surplox',
    joinBadge: 'Registro rápido para cuadrillas, compañeros y trabajadores locales',
    joinTitle: 'Únete a la red de construcción Surplox antes de que la próxima oportunidad se mueva sin ti.',
    joinBody:
      'Crea tu perfil, mantente visible para la actividad local del oficio e invita a tu cuadrilla o compañeros a Surplox en pocos toques.',
    joinPrimaryCta: 'Crear tu perfil',
    joinSecondaryCta: '¿Ya tienes cuenta? Inicia sesión',
    joinPoint1: 'Encuentra cuadrillas y trabajo cercano',
    joinPoint2: 'Haz preguntas del oficio y mantente visible',
    joinPoint3: 'Invita a tu clase o cuadrilla con un solo enlace',
    secondaryCta: 'Iniciar sesión',
    signedInPrimary: 'Ir al Feed',
    signedInSecondary: 'Crear publicación',

    valueTitle: 'Lo que hace Surplox ahora',
    valueBody:
      'Surplox ya no es solo un foro. Ahora es una red activa local de construcción diseñada para que la gente correcta se encuentre más rápido y el trabajo siga avanzando.',

    card1Title: 'Encontrar oportunidades cercanas',
    card1Body:
      'Ve actividad local del oficio según ZIP y radio para descubrir trabajo, conversaciones y necesidades de cuadrilla más relevantes.',

    card2Title: 'Armar y llenar cuadrillas',
    card2Body:
      'Publica cuando necesites personal, revisa quién se une y mueve gente hacia oportunidades reales más rápido.',

    card3Title: 'Mostrar disponibilidad',
    card3Body:
      'Trabajadores y subcontratistas pueden mantenerse visibles con perfiles, oficio, radio de trabajo y disponibilidad actual.',

    card4Title: 'Fortalecer tu red',
    card4Body:
      'Mantente conectado mediante actividad, alertas, respuestas y relaciones de trabajo repetidas dentro de tu mercado.',

    audienceTitle: 'Para quién es',
    audience1: 'Trabajadores buscando visibilidad y trabajo local',
    audience2: 'Subcontratistas armando cuadrillas y encontrando apoyo',
    audience3: 'Contratistas cubriendo faltantes y publicando oportunidades',
    audience4: 'Proveedores conectados a mercados activos de trabajo',

    bottomTitle: 'Hecho para el campo, no para la oficina.',
    bottomBody:
      'Surplox está diseñado alrededor de cómo realmente se mueve la construcción: personas, tiempo, ubicación y conexiones locales de confianza.',

    inviteHint: 'Alguien de tu red te invitó a unirte a Surplox.',
    heroTag1: 'Red local',
    heroTag2: 'Actividad de cuadrillas',
    heroTag3: 'Más visibilidad en campo',
    stat1Label: 'Hecho para',
    stat1Value: 'Trabajadores, subs, contratistas, proveedores',
    stat2Label: 'Lo que se mueve aquí',
    stat2Value: 'Trabajo, cuadrillas, actividad del oficio, visibilidad',
    stat3Label: 'Por qué importa',
    stat3Value: 'Conexiones locales más rápidas'
  }
}

function SectionCard({ title, body }) {
  return (
    <div className="card" style={{ height: '100%' }}>
      <div className="card-section-title">{title}</div>
      <p className="card-section-subtitle" style={{ marginTop: 8 }}>
        {body}
      </p>
    </div>
  )
}

function MiniStat({ label, value }) {
  return (
    <div className="card-soft" style={{ gap: 8 }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--muted-soft)'
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 16,
          lineHeight: 1.35,
          fontWeight: 800,
          color: 'var(--text)'
        }}
      >
        {value}
      </div>
    </div>
  )
}

export default function Home({ session, lang = 'en', variant = 'default' }) {
  const copy = COPY[lang] || COPY.en
  const location = useLocation()
  const ref = new URLSearchParams(location.search).get('ref')
  const isJoinVariant = variant === 'join'
  const inviteHint = ref && !session ? copy.inviteHint : ''

  return (
    <div className="grid" style={{ gap: 18 }}>
      {isJoinVariant ? (
        <div
          className="card surface-warm rounded-xl"
          style={{
            padding: 28
          }}
        >
          <div
            className="badge"
            style={{
              marginBottom: 16,
              background: '#f1e7a8',
              color: 'var(--text)'
            }}
          >
            {copy.joinBadge}
          </div>

          <div className="h1" style={{ maxWidth: 980 }}>
            {copy.joinTitle}
          </div>

          <p
            className="muted"
            style={{
              marginTop: 14,
              maxWidth: 900,
              fontSize: 17,
              lineHeight: 1.7
            }}
          >
            {copy.joinBody}
          </p>

          {inviteHint ? (
            <div
              className="card-soft"
              style={{
                marginTop: 16,
                background: 'rgba(255,255,255,0.55)'
              }}
            >
              <div style={{ fontWeight: 700 }}>{inviteHint}</div>
            </div>
          ) : null}

          <div className="grid two" style={{ marginTop: 18 }}>
            <div className="card-soft">
              <div style={{ fontWeight: 800 }}>{copy.joinPoint1}</div>
            </div>
            <div className="card-soft">
              <div style={{ fontWeight: 800 }}>{copy.joinPoint2}</div>
            </div>
            <div className="card-soft">
              <div style={{ fontWeight: 800 }}>{copy.joinPoint3}</div>
            </div>
            <div className="card-soft">
              <div style={{ fontWeight: 800 }}>{copy.audience1}</div>
            </div>
          </div>

          <div className="row" style={{ marginTop: 18 }}>
            {!session ? (
              <>
                <Link className="btn primary" to="/auth?mode=signup">
                  {copy.joinPrimaryCta}
                </Link>
                <Link className="btn" to="/auth?mode=signin">
                  {copy.joinSecondaryCta}
                </Link>
              </>
            ) : (
              <>
                <Link className="btn primary" to="/feed">
                  {copy.signedInPrimary}
                </Link>
                <Link className="btn" to="/new">
                  {copy.signedInSecondary}
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}

      <div
        className="card rounded-xl"
        style={{
          padding: 28,
          background: 'linear-gradient(180deg, #fff7c8 0%, #f7f7f2 100%)'
        }}
      >
        <div
          className="badge"
          style={{
            marginBottom: 16,
            background: '#f1e7a8',
            color: 'var(--text)'
          }}
        >
          {copy.badge}
        </div>

        <div className="row" style={{ alignItems: 'stretch', gap: 18 }}>
          <div style={{ flex: '1 1 620px' }}>
            <div className="h1" style={{ maxWidth: 920 }}>
              {copy.title}
            </div>

            <p
              className="muted"
              style={{
                marginTop: 14,
                maxWidth: 860,
                fontSize: 18,
                lineHeight: 1.7
              }}
            >
              {copy.body}
            </p>

            <div
              style={{
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap',
                marginTop: 18
              }}
            >
              <span className="badge">{copy.heroTag1}</span>
              <span className="badge">{copy.heroTag2}</span>
              <span className="badge">{copy.heroTag3}</span>
            </div>

            <div className="row" style={{ marginTop: 20 }}>
              {!session ? (
                <>
                  <Link className="btn primary" to="/auth?mode=signup">
                    {copy.primaryCta}
                  </Link>
                  <Link className="btn" to="/auth?mode=signin">
                    {copy.secondaryCta}
                  </Link>
                </>
              ) : (
                <>
                  <Link className="btn primary" to="/feed">
                    {copy.signedInPrimary}
                  </Link>
                  <Link className="btn" to="/new">
                    {copy.signedInSecondary}
                  </Link>
                </>
              )}
            </div>
          </div>

          <div
            style={{
              flex: '1 1 320px',
              minWidth: 280,
              display: 'grid',
              gap: 12,
              alignSelf: 'stretch'
            }}
          >
            <MiniStat label={copy.stat1Label} value={copy.stat1Value} />
            <MiniStat label={copy.stat2Label} value={copy.stat2Value} />
            <MiniStat label={copy.stat3Label} value={copy.stat3Value} />
          </div>
        </div>
      </div>

      <div className="grid two">
        <div className="card-soft" style={{ padding: 22 }}>
          <div className="card-section-title">{copy.valueTitle}</div>
          <p className="card-section-subtitle" style={{ marginTop: 10 }}>
            {copy.valueBody}
          </p>
        </div>

        <div className="card-soft" style={{ padding: 22 }}>
          <div className="card-section-title">{copy.audienceTitle}</div>
          <div className="grid" style={{ gap: 10, marginTop: 12 }}>
            <div style={{ fontWeight: 700 }}>{copy.audience1}</div>
            <div style={{ fontWeight: 700 }}>{copy.audience2}</div>
            <div style={{ fontWeight: 700 }}>{copy.audience3}</div>
            <div style={{ fontWeight: 700 }}>{copy.audience4}</div>
          </div>
        </div>
      </div>

      <div className="grid two">
        <SectionCard title={copy.card1Title} body={copy.card1Body} />
        <SectionCard title={copy.card2Title} body={copy.card2Body} />
        <SectionCard title={copy.card3Title} body={copy.card3Body} />
        <SectionCard title={copy.card4Title} body={copy.card4Body} />
      </div>

      <div
        className="card surface-dark rounded-xl"
        style={{
          padding: 28
        }}
      >
        <div className="h2" style={{ marginBottom: 10 }}>
          {copy.bottomTitle}
        </div>

        <p
          className="muted"
          style={{
            maxWidth: 860,
            fontSize: 17,
            lineHeight: 1.7,
            margin: 0
          }}
        >
          {copy.bottomBody}
        </p>
      </div>
    </div>
  )
}