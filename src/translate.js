export function detectLikelyLanguage(text = '') {
  const value = String(text || '').trim()
  if (!value) return 'en'

  const spanishSignals = [
    ' el ',
    ' la ',
    ' los ',
    ' las ',
    ' de ',
    ' que ',
    ' y ',
    ' para ',
    ' con ',
    ' en ',
    ' por ',
    ' una ',
    ' un ',
    ' como ',
    ' dónde ',
    ' cómo ',
    ' cuál ',
    ' porque ',
    ' trabajo ',
    ' soldador ',
    ' concreto ',
    ' cuadrilla ',
    ' contratista ',
    ' subcontratista ',
    ' proveedor ',
    ' entrega ',
    ' materiales ',
    ' remolque ',
    ' mecánico ',
    ' obra ',
    ' urgente ',
    ' necesito ',
    ' busco '
  ]

  const englishSignals = [
    ' the ',
    ' and ',
    ' for ',
    ' with ',
    ' in ',
    ' need ',
    ' looking ',
    ' work ',
    ' crew ',
    ' contractor ',
    ' supplier ',
    ' driver ',
    ' mechanic ',
    ' delivery ',
    ' trailer ',
    ' repair ',
    ' available ',
    ' urgent '
  ]

  const lower = ` ${value.toLowerCase()} `

  let spanishScore = 0
  let englishScore = 0

  for (const token of spanishSignals) {
    if (lower.includes(token)) spanishScore += 1
  }

  for (const token of englishSignals) {
    if (lower.includes(token)) englishScore += 1
  }

  if (/[áéíóúñ¿¡]/i.test(value)) spanishScore += 2

  // Prefer English on ties so neutral/short English text
  // does not get misclassified as Spanish.
  if (spanishScore > englishScore) return 'es'
  return 'en'
}

function normalizeLanguageCode(value) {
  const lang = String(value || '').trim().toLowerCase()
  if (lang.startsWith('es')) return 'es'
  return 'en'
}

function extractGoogleTranslateText(payload) {
  if (!Array.isArray(payload) || !Array.isArray(payload[0])) return ''

  return payload[0]
    .map((chunk) => {
      if (!Array.isArray(chunk)) return ''
      return chunk[0] || ''
    })
    .join('')
    .trim()
}

async function translateWithCustomEndpoint({ text, from, to }) {
  const endpoint = String(import.meta.env.VITE_TRANSLATE_ENDPOINT || '').trim()
  if (!endpoint) return ''

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text,
      from,
      to
    })
  })

  if (!response.ok) {
    throw new Error(`Custom translation endpoint failed with status ${response.status}`)
  }

  const data = await response.json()

  return String(
    data?.translatedText ||
      data?.translated_text ||
      data?.translation ||
      data?.text ||
      ''
  ).trim()
}

async function translateWithGoogle({ text, from, to }) {
  const url =
    'https://translate.googleapis.com/translate_a/single' +
    `?client=gtx&sl=${encodeURIComponent(from)}&tl=${encodeURIComponent(to)}&dt=t&q=${encodeURIComponent(text)}`

  const response = await fetch(url, {
    method: 'GET'
  })

  if (!response.ok) {
    throw new Error(`Google fallback translation failed with status ${response.status}`)
  }

  const data = await response.json()
  return extractGoogleTranslateText(data)
}

export async function translateText({ text, from, to }) {
  const source = String(text || '').trim()
  if (!source) return ''

  const sourceLang = normalizeLanguageCode(from || detectLikelyLanguage(source))
  const targetLang = normalizeLanguageCode(to)

  if (!targetLang || sourceLang === targetLang) return source

  try {
    const customTranslation = await translateWithCustomEndpoint({
      text: source,
      from: sourceLang,
      to: targetLang
    })

    if (customTranslation) return customTranslation
  } catch (error) {
    console.error('Custom translation endpoint failed:', error)
  }

  try {
    const googleTranslation = await translateWithGoogle({
      text: source,
      from: sourceLang,
      to: targetLang
    })

    if (googleTranslation) return googleTranslation
  } catch (error) {
    console.error('Google translation fallback failed:', error)
  }

  return targetLang === 'es'
    ? `[No translation service available right now]\n\n${source}`
    : `[Servicio de traducción no disponible en este momento]\n\n${source}`
}