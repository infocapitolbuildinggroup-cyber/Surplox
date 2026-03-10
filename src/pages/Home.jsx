import React from 'react'
import { Link } from 'react-router-dom'

const COPY = {
  en: {
    badge: 'Built for local construction',
    title: 'The network where crews, workers, and opportunities move faster.',
    body:
      'Surplox helps laborers, subcontractors, contractors, and suppliers stay connected in one place. Discover nearby work, post crew needs, show availability, grow your network, and stay in the loop on real trade activity happening around you.',
    primaryCta: 'Join Surplox',
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
      'Surplox is designed around how construction actually moves — through people, timing, location, and trusted local connections.'
  },
  es: {
    badge: 'Hecho para la construcción local',
    title: 'La red donde cuadrillas, trabajadores y oportunidades avanzan más rápido.',
    body:
      'Surplox ayuda a trabajadores, subcontratistas, contratistas y proveedores a mantenerse conectados en un solo lugar. Descubre trabajo cercano, publica necesidades de cuadrilla, muestra disponibilidad, haz crecer tu red y mantente al tanto de la actividad real del oficio cerca de ti.',
    primaryCta: 'Unirse a Surplox',
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
      'Surplox está diseñado alrededor de cómo realmente se mueve la construcción: personas, tiempo, ubicación y conexiones locales de confianza.'
  }
}

export default function Home({ session, lang = 'en' }) {
  const copy = COPY[lang] || COPY.en

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div
        className="card"
        style={{
          borderColor: 'rgba(255, 222, 89, 0.28)',
          background:
            'linear-gradient(180deg, rgba(10,14,24,0.98) 0%, rgba(8,11,18,0.98) 100%)',
          boxShadow: '0 0 30px rgba(255, 222, 89, 0.07)'
        }}
      >
        <div
          className="badge"
          style={{
            marginBottom: 14,
            color: '#ff751f',
            borderColor: 'rgba(255, 222, 89, 0.55)',
            background: 'rgba(255, 222, 89, 0.12)'
          }}
        >
          {copy.badge}
        </div>

        <div className="h1" style={{ maxWidth: 920 }}>
          {copy.title}
        </div>

        <p
          className="muted"
          style={{ marginTop: 12, maxWidth: 920, fontSize: 17, lineHeight: 1.65 }}
        >
          {copy.body}
        </p>

        <div className="row" style={{ marginTop: 18, gap: 10, flexWrap: 'wrap' }}>
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

      <div className="grid two">
        <div className="card card-soft">
          <div className="card-section-title">{copy.valueTitle}</div>
          <p className="card-section-subtitle" style={{ marginTop: 8 }}>
            {copy.valueBody}
          </p>
        </div>

        <div className="card card-soft">
          <div className="card-section-title">{copy.audienceTitle}</div>
          <div className="grid" style={{ gap: 8, marginTop: 10 }}>
            <div>{copy.audience1}</div>
            <div>{copy.audience2}</div>
            <div>{copy.audience3}</div>
            <div>{copy.audience4}</div>
          </div>
        </div>
      </div>

      <div className="grid two">
        <div className="card">
          <div className="card-section-title">{copy.card1Title}</div>
          <p className="card-section-subtitle" style={{ marginTop: 8 }}>
            {copy.card1Body}
          </p>
        </div>

        <div className="card">
          <div className="card-section-title">{copy.card2Title}</div>
          <p className="card-section-subtitle" style={{ marginTop: 8 }}>
            {copy.card2Body}
          </p>
        </div>

        <div className="card">
          <div className="card-section-title">{copy.card3Title}</div>
          <p className="card-section-subtitle" style={{ marginTop: 8 }}>
            {copy.card3Body}
          </p>
        </div>

        <div className="card">
          <div className="card-section-title">{copy.card4Title}</div>
          <p className="card-section-subtitle" style={{ marginTop: 8 }}>
            {copy.card4Body}
          </p>
        </div>
      </div>

      <div
        className="card"
        style={{
          borderColor: 'rgba(255, 222, 89, 0.24)',
          background:
            'linear-gradient(180deg, rgba(12,16,28,0.98) 0%, rgba(8,11,18,0.98) 100%)'
        }}
      >
        <div className="h1" style={{ maxWidth: 760 }}>
          {copy.bottomTitle}
        </div>
        <p className="muted" style={{ marginTop: 12, maxWidth: 820 }}>
          {copy.bottomBody}
        </p>
      </div>
    </div>
  )
}