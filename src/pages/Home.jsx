import React from 'react'
import { Link } from 'react-router-dom'

const COPY = {
  en: {
    heroBadge: 'Built for the field',
    heroTitle: 'The construction network for crews, opportunities, and local trade activity.',
    heroBody:
      'Surplox helps laborers, subcontractors, contractors, and suppliers stay connected in one place. Discover nearby work, post crew needs, show availability, build your network, and move faster on the job.',
    ctaPrimary: 'Join Surplox',
    ctaSecondary: 'Sign In',
    signedInPrimary: 'Go to Feed',
    signedInSecondary: 'Create Post',

    panelTitle: 'What you can do in Surplox',
    panelBody:
      'Surplox is no longer just a discussion board. It is a live local trades network designed to help the right people find each other faster.',

    feature1Title: 'Post Opportunities',
    feature1Body:
      'Create Need Crew and Looking for Work posts tied to real ZIP codes, radius, start timing, and pay details.',

    feature2Title: 'Build Crews',
    feature2Body:
      'Turn a post into a crew builder where workers can join, get marked hired, and help fill real job needs.',

    feature3Title: 'Show Availability',
    feature3Body:
      'Profiles can show role, trade, travel radius, and availability so nearby companies and crews can spot active workers.',

    feature4Title: 'Grow Your Network',
    feature4Body:
      'Stay visible in your trade, get activity alerts, share crew posts, and build repeat working relationships across your market.',

    whoTitle: 'Who Surplox is for',
    whoBody:
      'Laborers, subcontractors, contractors, and suppliers using one local network to find work, fill jobs, and stay connected to trade activity.',

    who1: 'Laborers looking for nearby work and visibility',
    who2: 'Subcontractors building crews and finding help',
    who3: 'Contractors posting opportunities and filling labor gaps',
    who4: 'Suppliers staying connected to active trade markets',

    footerTitle: 'Built for local execution',
    footerBody:
      'Surplox organizes trade activity by location so the right posts, workers, and crews are easier to discover in the markets that matter.'
  },
  es: {
    heroBadge: 'Hecho para el trabajo en campo',
    heroTitle: 'La red de construcción para cuadrillas, oportunidades y actividad local del oficio.',
    heroBody:
      'Surplox ayuda a trabajadores, subcontratistas, contratistas y proveedores a mantenerse conectados en un solo lugar. Descubre trabajo cercano, publica necesidades de cuadrilla, muestra disponibilidad, construye tu red y avanza más rápido en cada proyecto.',
    ctaPrimary: 'Unirse a Surplox',
    ctaSecondary: 'Iniciar sesión',
    signedInPrimary: 'Ir al Feed',
    signedInSecondary: 'Crear publicación',

    panelTitle: 'Lo que puedes hacer en Surplox',
    panelBody:
      'Surplox ya no es solo un foro de discusión. Ahora es una red activa local para la industria donde las personas correctas pueden encontrarse más rápido.',

    feature1Title: 'Publicar oportunidades',
    feature1Body:
      'Crea publicaciones de Se necesita cuadrilla y Buscando trabajo con ZIP real, radio, fecha de inicio y detalles de pago.',

    feature2Title: 'Armar cuadrillas',
    feature2Body:
      'Convierte una publicación en una herramienta para formar cuadrilla donde los trabajadores pueden unirse y ser marcados como contratados.',

    feature3Title: 'Mostrar disponibilidad',
    feature3Body:
      'Los perfiles pueden mostrar rol, oficio, radio de trabajo y disponibilidad para que empresas y cuadrillas cercanas encuentren gente activa.',

    feature4Title: 'Hacer crecer tu red',
    feature4Body:
      'Mantente visible en tu oficio, recibe alertas de actividad, comparte publicaciones de cuadrilla y crea relaciones de trabajo repetidas.',

    whoTitle: 'Para quién es Surplox',
    whoBody:
      'Trabajadores, subcontratistas, contratistas y proveedores usando una sola red local para encontrar trabajo, llenar vacantes y mantenerse conectados.',

    who1: 'Trabajadores buscando trabajo cercano y visibilidad',
    who2: 'Subcontratistas armando cuadrillas y encontrando apoyo',
    who3: 'Contratistas publicando oportunidades y cubriendo faltantes',
    who4: 'Proveedores conectados con mercados activos del oficio',

    footerTitle: 'Hecho para la ejecución local',
    footerBody:
      'Surplox organiza la actividad del oficio por ubicación para que publicaciones, trabajadores y cuadrillas sean más fáciles de descubrir.'
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
          boxShadow: '0 0 28px rgba(255, 222, 89, 0.06)'
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
          {copy.heroBadge}
        </div>

        <div className="h1" style={{ maxWidth: 900 }}>
          {copy.heroTitle}
        </div>

        <p className="muted" style={{ marginTop: 12, maxWidth: 920, fontSize: 17, lineHeight: 1.65 }}>
          {copy.heroBody}
        </p>

        <div className="row" style={{ marginTop: 18, gap: 10, flexWrap: 'wrap' }}>
          {!session ? (
            <>
              <Link className="btn primary" to="/auth">
                {copy.ctaPrimary}
              </Link>
              <Link className="btn" to="/auth">
                {copy.ctaSecondary}
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

      <div className="grid two" style={{ gap: 16 }}>
        <div className="card">
          <div className="h1">{copy.panelTitle}</div>
          <p className="muted" style={{ marginTop: 10 }}>
            {copy.panelBody}
          </p>

          <div className="grid" style={{ gap: 10, marginTop: 16 }}>
            <div
              className="card card-soft"
              style={{
                borderColor: 'rgba(255, 222, 89, 0.22)',
                background: 'rgba(255, 222, 89, 0.04)'
              }}
            >
              <div className="card-section-title">{copy.feature1Title}</div>
              <p className="card-section-subtitle" style={{ marginTop: 6 }}>
                {copy.feature1Body}
              </p>
            </div>

            <div
              className="card card-soft"
              style={{
                borderColor: 'rgba(255, 117, 31, 0.22)',
                background: 'rgba(255, 117, 31, 0.04)'
              }}
            >
              <div className="card-section-title">{copy.feature2Title}</div>
              <p className="card-section-subtitle" style={{ marginTop: 6 }}>
                {copy.feature2Body}
              </p>
            </div>

            <div
              className="card card-soft"
              style={{
                borderColor: 'rgba(255, 222, 89, 0.22)',
                background: 'rgba(255, 222, 89, 0.04)'
              }}
            >
              <div className="card-section-title">{copy.feature3Title}</div>
              <p className="card-section-subtitle" style={{ marginTop: 6 }}>
                {copy.feature3Body}
              </p>
            </div>

            <div
              className="card card-soft"
              style={{
                borderColor: 'rgba(255, 117, 31, 0.22)',
                background: 'rgba(255, 117, 31, 0.04)'
              }}
            >
              <div className="card-section-title">{copy.feature4Title}</div>
              <p className="card-section-subtitle" style={{ marginTop: 6 }}>
                {copy.feature4Body}
              </p>
            </div>
          </div>
        </div>

        <div className="grid" style={{ gap: 16 }}>
          <div className="card">
            <div className="h1">{copy.whoTitle}</div>
            <p className="muted" style={{ marginTop: 10 }}>
              {copy.whoBody}
            </p>

            <div className="grid" style={{ gap: 10, marginTop: 16 }}>
              {[copy.who1, copy.who2, copy.who3, copy.who4].map((item) => (
                <div
                  key={item}
                  className="card card-soft"
                  style={{
                    padding: 14,
                    borderColor: 'rgba(255, 222, 89, 0.18)',
                    background: 'rgba(255, 222, 89, 0.03)'
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{item}</div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="card"
            style={{
              borderColor: 'rgba(255, 117, 31, 0.24)',
              background: 'rgba(255, 117, 31, 0.04)'
            }}
          >
            <div className="card-section-title">{copy.footerTitle}</div>
            <p className="card-section-subtitle" style={{ marginTop: 8 }}>
              {copy.footerBody}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}