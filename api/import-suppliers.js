export const config = {
    api: {
      bodyParser: {
        sizeLimit: "2mb",
      },
    },
  }
  
  const RATE_LIMIT = {}
  const LIMIT = 10
  const WINDOW_MS = 60 * 1000
  
  const DEFAULT_IMPORT_LIMIT = 12
  const DEFAULT_DELIVERY_RADIUS = 25
  
  function allowRequest(ip) {
    const now = Date.now()
    RATE_LIMIT[ip] = (RATE_LIMIT[ip] || []).filter((ts) => now - ts < WINDOW_MS)
  
    if (RATE_LIMIT[ip].length >= LIMIT) return false
  
    RATE_LIMIT[ip].push(now)
    return true
  }
  
  function normalize(value) {
    return String(value || "").trim()
  }
  
  function extractZip(address) {
    const match = address?.match(/\b\d{5}\b/)
    return match ? match[0] : ""
  }
  
  async function googlePlacesSearch(query, apiKey) {
    const res = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.websiteUri,places.nationalPhoneNumber,places.primaryTypeDisplayName",
        },
        body: JSON.stringify({
          textQuery: query,
        }),
      }
    )
  
    const data = await res.json()
  
    if (!res.ok) {
      throw new Error(data?.error?.message || "Google Places search failed")
    }
  
    return data?.places || []
  }
  
  function normalizeSupplier(place, material, zip) {
    const name = normalize(place.displayName?.text)
    const address = normalize(place.formattedAddress)
    const businessZip = extractZip(address) || zip
  
    return {
      external_id: place.id,
      source: "google_places",
      display_name: name,
      business_name: name,
      business_address: address,
      business_zip: businessZip,
      materials_categories: [material.toLowerCase().replace(/\s/g, "_")],
      storefront: true,
      delivery_radius: DEFAULT_DELIVERY_RADIUS,
      bio: `Auto imported ${material} supplier`,
      phone: normalize(place.nationalPhoneNumber),
      website_url: normalize(place.websiteUri),
      google_rating: place.rating || null,
      google_user_ratings_total: place.userRatingCount || null,
    }
  }
  
  async function insertSuppliers(rows) {
    const supabaseUrl = process.env.VITE_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
    const res = await fetch(`${supabaseUrl}/rest/v1/external_suppliers`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify(rows),
    })
  
    const data = await res.json()
  
    if (!res.ok) {
      throw new Error(data?.message || "Supabase insert failed")
    }
  
    return data
  }
  
  export default async function handler(req, res) {
    try {
      if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" })
      }
  
      const ip =
        req.headers["x-forwarded-for"] ||
        req.socket.remoteAddress ||
        "unknown"
  
      if (!allowRequest(ip)) {
        return res.status(429).json({
          error: "Too many requests",
        })
      }
  
      const googleKey = process.env.GOOGLE_MAPS_API_KEY
  
      if (!googleKey) {
        return res.status(500).json({
          error: "Missing GOOGLE_MAPS_API_KEY",
        })
      }
  
      const { material, zip } = req.body
  
      if (!material || !zip) {
        return res.status(400).json({
          error: "material and zip required",
        })
      }
  
      const queries = [
        `${material} supplier near ${zip}`,
        `${material} building supply near ${zip}`,
        `${material} construction materials near ${zip}`,
      ]
  
      let places = []
  
      for (const q of queries) {
        const results = await googlePlacesSearch(q, googleKey)
        places.push(...results)
      }
  
      const unique = Object.values(
        places.reduce((acc, place) => {
          acc[place.id] = place
          return acc
        }, {})
      )
  
      const suppliers = unique
        .slice(0, DEFAULT_IMPORT_LIMIT)
        .map((p) => normalizeSupplier(p, material, zip))
  
      const inserted = await insertSuppliers(suppliers)
  
      return res.status(200).json({
        success: true,
        imported: inserted.length,
        suppliers: inserted,
      })
    } catch (err) {
      console.error(err)
  
      return res.status(500).json({
        error: err.message || "Importer failed",
      })
    }
  }