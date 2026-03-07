export function detectLikelyLanguage(text = '') {
  const value = String(text || '').trim()
  if (!value) return 'en'

  const spanishSignals = [
    ' el ', ' la ', ' los ', ' las ', ' de ', ' que ', ' y ', ' para ',
    ' con ', ' en ', ' por ', ' una ', ' un ', ' como ', 'dónde', 'cómo',
    'cuál', 'porque', 'trabajo', 'soldador', 'concreto', 'cuadrilla'
  ]

  const lower = ` ${value.toLowerCase()} `

  let score = 0
  for (const token of spanishSignals) {
    if (lower.includes(token)) score += 1
  }

  if (/[áéíóúñ¿¡]/i.test(value)) score += 2

  return score >= 2 ? 'es' : 'en'
}

export async function translateText({ text, from, to }) {
  const source = String(text || '').trim()
  if (!source) return ''

  if (from === to) return source

  if (to === 'es') {
    return `[Traducción pendiente]\n\n${source}`
  }

  return `[Translation pending]\n\n${source}`
}