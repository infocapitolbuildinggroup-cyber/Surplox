import React from 'react'
import { Link } from 'react-router-dom'
import { t } from '../i18n'

export default function Home({ session, lang = 'en' }) {
  return (
    <div className="grid two">
      <div className="card">
        <div className="h1">{t(lang, 'home_title')}</div>
        <p className="muted">
          {t(lang, 'home_intro')}
        </p>

        <hr />

        {!session ? (
          <>
            <p className="muted" style={{ marginTop: 0 }}>
              {t(lang, 'home_join_prompt')}
            </p>

            <div className="row">
              <Link className="btn primary" to="/auth">{t(lang, 'home_join_button')}</Link>
            </div>
          </>
        ) : (
          <>
            <p className="muted" style={{ marginTop: 0 }}>
              {t(lang, 'home_signed_in_prompt')}
            </p>

            <div className="row">
              <Link className="btn primary" to="/feed">{t(lang, 'home_go_feed')}</Link>
              <Link className="btn" to="/new">{t(lang, 'home_create_post')}</Link>
            </div>
          </>
        )}
      </div>

      <div className="card">
        <div className="h1">{t(lang, 'home_how_it_works')}</div>
        <p className="muted">
          {t(lang, 'home_how_it_works_body')}
        </p>

        <hr />

        <div className="muted">
          {t(lang, 'home_example_label')}
        </div>
        <p className="muted" style={{ marginTop: 8 }}>
          {t(lang, 'home_example_body')}
        </p>
      </div>
    </div>
  )
}