export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb'
    }
  }
}

const ALLOWED_MATERIALS = {
  concrete: ['concrete supplier', 'ready mix concrete', 'concrete products'],
  lumber: ['lumber yard', 'building materials store', 'wood supplier'],
  steel: ['steel supplier', 'metal supplier', 'steel distributor'],
  electrical: ['electrical supply store', 'electrical wholesaler'],
  plumbing: ['plumbing supply store', 'pipe supplier'],
  drywall: ['drywall supply store', 'building materials store'],
  fasteners: ['fastener supplier', 'industrial supply store'],
  tools: ['tool store', 'industrial supply store'],
  equipment_rental: ['equipment rental agency', 'tool rental service'],
  safety_equipment: ['safety equipment supplier', 'industrial supply store']
}

const RATE_LIMIT = {}
const LIMIT = 30
const WINDOW_MS = 60 * 1000

function isLimited(ip) {
  const now = Date.now()
  RATE_LIMIT[ip] = (RATE_LIMIT[ip] || []).filter((ts) => now - ts < WINDOW_MS)
  if (RATE_LIMIT[ip].length >= LIMIT) return true
  RATE_LIMIT[ip].push(now)
  return false
}

function normalizeMaterial(value = '') {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, '_')
}

function getQueries(material, zip, city = '', state = '') {
  const key = normalizeMaterial(material)
  const baseQueries = ALLOWED_MATERIALS[key] || [String(material || '').trim() || 'building materials store']
  const place = [city, state, zip].filter(Boolean).join(' ').trim()
  return baseQueries.map((query) => `${query} near ${place}`.trim())
}

function pickPrimaryType(types = []) {
  if (!Array.isArray(types) || types.length === 0) return ''
  const preferred = [
    'hardware_store',
    'store',
    'building_material_store',
    'home_goods_store',
    'point_of_interest',
    'establishment'
  ]
  return preferred.find((type) => types.includes(type)) || types[0] || ''
}

function estimateDeliveryRadius(place) {
  const types = place.types || []
  if (types.includes('equipment_rental')) return 75
  if (types.includes('hardware_store') || types.includes('building_material_store')) return 35
  return 25
}

function scorePlace(place, materialKey, zip) {
  let score = 0
  const text = [
    place.displayName?.text,
    place.formattedAddress,
    ...(place.types || [])
  ].join(' ').toLowerCase()

  if (materialKey && text.includes(materialKey.replace(/_/g, ' '))) score += 15
  if (zip && String(place.shortFormattedAddress || place.formattedAddress || '').includes(zip)) score += 10
  if (place.regularOpeningHours?.openNow) score += 5
  if (place.rating) score += Math.min(Number(place.rating || 0), 5)
  if (place.userRatingCount) score += Math.min(Number(place.userRatingCount || 0), 200) / 40
  if (place.websiteUri) score += 2
  if (place.businessStatus === 'OPERATIONAL') score += 4
  return score
}

async function searchText(query, apiKey) {
  const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': [
        'places.id',
        'places.displayName',
        'places.formattedAddress',
        'places.shortFormattedAddress',
        'places.types',
        'places.googleMapsUri',
        'places.websiteUri',
        'places.internationalPhoneNumber',
        'places.businessStatus',
        'places.location',
        'places.rating',
        'places.userRatingCount',
        'places.regularOpeningHours.openNow',
        'places.regularOpeningHours.weekdayDescriptions'
      ].join(',')
    },
    body: JSON.stringify({
      textQuery: query,
      pageSize: 8,
      languageCode: 'en',
      regionCode: 'US'
    })
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data?.error?.message || 'Google Places text search failed')
  }
  return Array.isArray(data.places) ? data.places : []
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown'
    if (isLimited(ip)) {
      return res.status(429).json({ error: 'Too many supplier lookups. Please wait and try again.' })
    }

    const googleApiKey = process.env.GOOGLE_MAPS_API_KEY
    if (!googleApiKey) {
      return res.status(500).json({ error: 'Missing GOOGLE_MAPS_API_KEY' })
    }

    const { material, zip, city, state } = req.body || {}
    const materialKey = normalizeMaterial(material)

    if (!materialKey) {
      return res.status(400).json({ error: 'Material is required' })
    }

    if (!/^\d{5}$/.test(String(zip || '').trim())) {
      return res.status(400).json({ error: 'A valid 5-digit ZIP code is required' })
    }

    const queries = getQueries(materialKey, String(zip).trim(), String(city || '').trim(), String(state || '').trim())
    const allPlaces = []
    for (const query of queries.slice(0, 3)) {
      const places = await searchText(query, googleApiKey)
      allPlaces.push(...places)
    }

    const deduped = new Map()
    for (const place of allPlaces) {
      if (!place.id) continue
      if (!deduped.has(place.id)) deduped.set(place.id, place)
    }

    const suggestions = Array.from(deduped.values())
      .map((place) => ({
        source: 'google_places',
        place_id: place.id,
        business_name: place.displayName?.text || '',
        business_address: place.formattedAddress || '',
        business_zip: String(zip || '').trim(),
        materials_categories: [materialKey],
        storefront: true,
        delivery_radius: estimateDeliveryRadius(place),
        business_hours: place.regularOpeningHours?.weekdayDescriptions || [],
        open_now: Boolean(place.regularOpeningHours?.openNow),
        phone: place.internationalPhoneNumber || '',
        website: place.websiteUri || '',
        google_maps_url: place.googleMapsUri || '',
        place_types: place.types || [],
        primary_type: pickPrimaryType(place.types || []),
        business_status: place.businessStatus || '',
        rating: Number(place.rating || 0),
        user_rating_count: Number(place.userRatingCount || 0),
        lat: place.location?.latitude || null,
        lng: place.location?.longitude || null,
        score: scorePlace(place, materialKey, String(zip || '').trim())
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)

    return res.status(200).json({
      success: true,
      material: materialKey,
      zip: String(zip || '').trim(),
      suggestions
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: error.message || 'Supplier lookup failed' })
  }
}
