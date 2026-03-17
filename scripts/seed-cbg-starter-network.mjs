import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in your terminal environment.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const ORG_NAME = 'Capitol Building Group'

const starterAccounts = [
  {
    key: 'cbg-concrete',
    email: 'concrete@capitolbuildinggroup.com',
    password: 'SurploxStarter123!',
    display_name: 'CBG Concrete Desk',
    first_name: 'CBG',
    last_name: 'Concrete',
    role: 'laborer',
    trade_slug: 'concrete',
    home_zip: '76031',
    travel_radius_miles: 60,
    crew_size: 1,
    city: 'Cleburne',
    phone: '8175554101',
    bio: 'Capitol Building Group managed starter account for concrete labor demand and availability conversations.',
    preferred_language: 'en',
    is_available: true
  },
  {
    key: 'cbg-framing',
    email: 'framing@capitolbuildinggroup.com',
    password: 'SurploxStarter123!',
    display_name: 'CBG Framing Desk',
    first_name: 'CBG',
    last_name: 'Framing',
    role: 'subcontractor',
    trade_slug: 'framing',
    home_zip: '76102',
    travel_radius_miles: 75,
    crew_size: 4,
    city: 'Fort Worth',
    phone: '8175554102',
    bio: 'Capitol Building Group managed starter account for framing-related visibility and crew coordination.',
    preferred_language: 'en',
    is_available: true
  },
  {
    key: 'cbg-welding',
    email: 'welding@capitolbuildinggroup.com',
    password: 'SurploxStarter123!',
    display_name: 'CBG Welding Desk',
    first_name: 'CBG',
    last_name: 'Welding',
    role: 'laborer',
    trade_slug: 'welding',
    home_zip: '76018',
    travel_radius_miles: 80,
    crew_size: 1,
    city: 'Arlington',
    phone: '8175554103',
    bio: 'Capitol Building Group managed starter account for welding availability and trade discussion.',
    preferred_language: 'en',
    is_available: true
  },
  {
    key: 'cbg-roofing',
    email: 'roofing@capitolbuildinggroup.com',
    password: 'SurploxStarter123!',
    display_name: 'CBG Roofing Desk',
    first_name: 'CBG',
    last_name: 'Roofing',
    role: 'subcontractor',
    trade_slug: 'roofing',
    home_zip: '75201',
    travel_radius_miles: 70,
    crew_size: 5,
    city: 'Dallas',
    phone: '2145554104',
    bio: 'Capitol Building Group managed starter account for roofing demand and subcontractor coordination.',
    preferred_language: 'en',
    is_available: true
  },
  {
    key: 'cbg-sitework',
    email: 'sitework@capitolbuildinggroup.com',
    password: 'SurploxStarter123!',
    display_name: 'CBG Site Work Desk',
    first_name: 'CBG',
    last_name: 'Site Work',
    role: 'laborer',
    trade_slug: 'sitework',
    home_zip: '75052',
    travel_radius_miles: 65,
    crew_size: 1,
    city: 'Grand Prairie',
    phone: '9725554105',
    bio: 'Capitol Building Group managed starter account for site work labor visibility and field discussion.',
    preferred_language: 'en',
    is_available: true
  },
  {
    key: 'cbg-electrical',
    email: 'electrical@capitolbuildinggroup.com',
    password: 'SurploxStarter123!',
    display_name: 'CBG Electrical Desk',
    first_name: 'CBG',
    last_name: 'Electrical',
    role: 'laborer',
    trade_slug: 'electrical',
    home_zip: '76051',
    travel_radius_miles: 55,
    crew_size: 1,
    city: 'Grapevine',
    phone: '8175554106',
    bio: 'Capitol Building Group managed starter account for electrical helper availability and trade Q&A.',
    preferred_language: 'en',
    is_available: true
  },
  {
    key: 'cbg-ops',
    email: 'fieldops@capitolbuildinggroup.com',
    password: 'SurploxStarter123!',
    display_name: 'CBG Field Ops',
    first_name: 'CBG',
    last_name: 'Operations',
    role: 'contractor',
    trade_slug: 'concrete',
    home_zip: '76104',
    travel_radius_miles: 100,
    crew_size: 8,
    city: 'Fort Worth',
    phone: '8175554107',
    bio: 'Capitol Building Group managed operations account for labor requests, coordination, and starter network activity.',
    preferred_language: 'en',
    is_available: false
  },
  {
    key: 'cbg-masonry',
    email: 'masonry@capitolbuildinggroup.com',
    password: 'SurploxStarter123!',
    display_name: 'CBG Masonry Desk',
    first_name: 'CBG',
    last_name: 'Masonry',
    role: 'subcontractor',
    trade_slug: 'masonry',
    home_zip: '76010',
    travel_radius_miles: 60,
    crew_size: 3,
    city: 'Arlington',
    phone: '8175554108',
    bio: 'Capitol Building Group managed starter account for masonry repair and trade discussion.',
    preferred_language: 'en',
    is_available: true
  }
]

const starterPosts = [
  {
    key: 'need-concrete',
    author: 'cbg-ops',
    trade_slug: 'concrete',
    post_type: 'need_crew',
    crew_status: 'open',
    title: 'Need 3 concrete laborers for slab prep tomorrow',
    body:
      'Need 3 laborers for slab prep and pour support tomorrow morning. Scope includes form cleanup, rebar support, and pour assistance. Must have boots and transportation.',
    center_zip: '76031',
    radius_miles: 60,
    needed_crew_size: 3,
    compensation: '$180-$220 day rate',
    start_date: '2026-03-11',
    source_language: 'en'
  },
  {
    key: 'need-framing',
    author: 'cbg-ops',
    trade_slug: 'framing',
    post_type: 'need_crew',
    crew_status: 'open',
    title: 'Need framing crew for small commercial buildout',
    body:
      'Looking for a framing crew for a small tenant buildout. Metal studs, interior framing, and layout support. One week of work to start.',
    center_zip: '76102',
    radius_miles: 70,
    needed_crew_size: 4,
    compensation: '$25-$32/hr depending on experience',
    start_date: '2026-03-12',
    source_language: 'en'
  },
  {
    key: 'need-roofing',
    author: 'cbg-ops',
    trade_slug: 'roofing',
    post_type: 'need_crew',
    crew_status: 'open',
    title: 'Need roofing crew for residential reroof',
    body:
      'Residential reroof job ready to start this week. Looking for a crew that can move quickly and has reliable transportation.',
    center_zip: '75201',
    radius_miles: 65,
    needed_crew_size: 5,
    compensation: 'Piece rate / bid based',
    start_date: '2026-03-13',
    source_language: 'en'
  },
  {
    key: 'work-welder',
    author: 'cbg-welding',
    trade_slug: 'welding',
    post_type: 'looking_for_work',
    crew_status: 'open',
    title: 'Welding availability for field repairs this week',
    body:
      'Available this week for MIG, stick, field repairs, and structural support. Have truck, PPE, and basic tools.',
    center_zip: '76018',
    radius_miles: 80,
    needed_crew_size: null,
    compensation: '$28-$35/hr target',
    start_date: '2026-03-11',
    source_language: 'en'
  },
  {
    key: 'work-site',
    author: 'cbg-sitework',
    trade_slug: 'sitework',
    post_type: 'looking_for_work',
    crew_status: 'open',
    title: 'General site work availability in DFW',
    body:
      'Available for trenching, material handling, grading support, cleanup, and general site work. Open to day work or week-long projects.',
    center_zip: '75052',
    radius_miles: 65,
    needed_crew_size: null,
    compensation: '$18-$24/hr',
    start_date: '2026-03-11',
    source_language: 'en'
  },
  {
    key: 'work-electrical',
    author: 'cbg-electrical',
    trade_slug: 'electrical',
    post_type: 'looking_for_work',
    crew_status: 'open',
    title: 'Electrical helper availability for weekend work',
    body:
      'Available for rough-in support, pulling wire, device install, and jobsite cleanup. Can travel around DFW.',
    center_zip: '76051',
    radius_miles: 55,
    needed_crew_size: null,
    compensation: '$20-$26/hr',
    start_date: '2026-03-15',
    source_language: 'en'
  },
  {
    key: 'discussion-rebar',
    author: 'cbg-concrete',
    trade_slug: 'concrete',
    post_type: 'discussion',
    crew_status: 'open',
    title: 'Best rebar cutter for small concrete crews?',
    body:
      'Looking for recommendations on a portable rebar cutter for smaller crews. Mostly cutting #3 to #5 bar. What has held up best for you?',
    center_zip: '76031',
    radius_miles: 100,
    needed_crew_size: null,
    compensation: null,
    start_date: null,
    source_language: 'en'
  },
  {
    key: 'discussion-masonry',
    author: 'cbg-masonry',
    trade_slug: 'masonry',
    post_type: 'discussion',
    crew_status: 'open',
    title: 'How do you price small masonry repair jobs?',
    body:
      'For small wall repairs and brick replacement work, are you pricing hourly, by square foot, or flat rate?',
    center_zip: '76010',
    radius_miles: 90,
    needed_crew_size: null,
    compensation: null,
    start_date: null,
    source_language: 'en'
  },
  {
    key: 'discussion-framing',
    author: 'cbg-framing',
    trade_slug: 'framing',
    post_type: 'discussion',
    crew_status: 'open',
    title: 'What is your go-to layout app for small framing jobs?',
    body:
      'Curious what other framing crews are using for simple measurements, markups, and field coordination.',
    center_zip: '76102',
    radius_miles: 80,
    needed_crew_size: null,
    compensation: null,
    start_date: null,
    source_language: 'en'
  },
  {
    key: 'welcome-post',
    author: 'cbg-ops',
    trade_slug: 'sitework',
    post_type: 'discussion',
    crew_status: 'open',
    title: 'Welcome to Surplox — local trades network by ZIP code',
    body:
      'Use this app to post crew needs, show availability, ask trade questions, and connect with nearby workers and subcontractors.',
    center_zip: '76104',
    radius_miles: 120,
    needed_crew_size: null,
    compensation: null,
    start_date: null,
    source_language: 'en'
  }
]

const starterComments = [
  {
    post: 'need-concrete',
    author: 'cbg-concrete',
    body: 'Availability open tomorrow morning for slab prep support and cleanup.'
  },
  {
    post: 'need-concrete',
    author: 'cbg-sitework',
    body: 'Can help with prep and cleanup if one more hand is needed.'
  },
  {
    post: 'need-framing',
    author: 'cbg-framing',
    body: 'Can handle interior framing and metal studs. What is the start time?'
  },
  {
    post: 'need-roofing',
    author: 'cbg-roofing',
    body: 'Roofing capacity available this week for residential reroof work.'
  },
  {
    post: 'discussion-rebar',
    author: 'cbg-welding',
    body: 'Milwaukee has been solid for portability, but shop equipment still wins for repeated use.'
  },
  {
    post: 'discussion-masonry',
    author: 'cbg-masonry',
    body: 'For very small repairs I usually do a minimum plus materials so the trip is still worth it.'
  },
  {
    post: 'discussion-framing',
    author: 'cbg-electrical',
    body: 'A lot of crews seem to rely on simple markup apps plus shared field photos.'
  },
  {
    post: 'welcome-post',
    author: 'cbg-concrete',
    body: 'Good to see a local trades network organized by ZIP and radius.'
  }
]

const starterCrewActions = [
  { post: 'need-concrete', user: 'cbg-concrete', status: 'joined' },
  { post: 'need-concrete', user: 'cbg-sitework', status: 'hired' },
  { post: 'need-framing', user: 'cbg-framing', status: 'joined' },
  { post: 'need-roofing', user: 'cbg-roofing', status: 'joined' }
]

async function listAllUsers() {
  const users = []
  let page = 1
  const perPage = 200

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })
    if (error) throw error

    const batch = data?.users || []
    users.push(...batch)

    if (batch.length < perPage) break
    page += 1
  }

  return users
}

async function getOrCreateUser(account) {
  const allUsers = await listAllUsers()
  const existing = allUsers.find(
    (u) => String(u.email || '').toLowerCase() === account.email.toLowerCase()
  )

  if (existing) {
    const { data, error } = await supabase.auth.admin.updateUserById(existing.id, {
      password: account.password,
      email_confirm: true,
      user_metadata: {
        seeded: true,
        team_content: true,
        managed_by_org: ORG_NAME,
        starter_account: true,
        account_key: account.key
      }
    })
    if (error) throw error
    return data.user
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: account.email,
    password: account.password,
    email_confirm: true,
    user_metadata: {
      seeded: true,
      team_content: true,
      managed_by_org: ORG_NAME,
      starter_account: true,
      account_key: account.key
    }
  })

  if (error) throw error
  return data.user
}

async function loadTradesMap() {
  const { data, error } = await supabase.from('trades').select('id, slug, name')
  if (error) throw error

  const bySlug = new Map()
  for (const row of data || []) {
    bySlug.set(row.slug, row)
  }
  return bySlug
}

async function seedAccounts(tradesBySlug) {
  const userIdByKey = new Map()

  for (const account of starterAccounts) {
    const authUser = await getOrCreateUser(account)
    const trade = tradesBySlug.get(account.trade_slug)

    if (!trade) throw new Error(`Trade slug not found: ${account.trade_slug}`)

    const { error: profileError } = await supabase.from('profiles').upsert({
      user_id: authUser.id,
      display_name: account.display_name,
      first_name: account.first_name,
      last_name: account.last_name,
      role: account.role,
      trade_id: trade.id,
      travel_radius_miles: account.travel_radius_miles,
      crew_size: account.crew_size,
      bio: account.bio,
      preferred_language: account.preferred_language,
      is_available: account.is_available,
      is_seeded: true,
      is_team_content: true,
      managed_by_org: ORG_NAME
    })

    if (profileError) throw profileError

    const { error: contactError } = await supabase.from('contact_private').upsert({
      user_id: authUser.id,
      phone: account.phone,
      email: account.email.toLowerCase(),
      city: account.city,
      notes: `${ORG_NAME} managed starter account`
    })

    if (contactError) throw contactError

    const { error: zipError } = await supabase.rpc('admin_set_profile_zip', {
      p_user_id: authUser.id,
      p_zip: account.home_zip
    })

    if (zipError) throw zipError

    userIdByKey.set(account.key, authUser.id)
    console.log(`Seeded account: ${account.display_name}`)
  }

  return userIdByKey
}

async function seedPosts(userIdByKey, tradesBySlug) {
  const postIdByKey = new Map()

  for (const post of starterPosts) {
    const authorId = userIdByKey.get(post.author)
    const trade = tradesBySlug.get(post.trade_slug)

    if (!authorId) throw new Error(`Author not found for post ${post.key}`)
    if (!trade) throw new Error(`Trade not found for post ${post.key}`)

    const { data, error } = await supabase.rpc('admin_create_seed_post', {
      p_author_id: authorId,
      p_trade_id: trade.id,
      p_title: post.title,
      p_body: post.body,
      p_center_zip: post.center_zip,
      p_radius_miles: post.radius_miles,
      p_post_type: post.post_type,
      p_needed_crew_size: post.needed_crew_size,
      p_compensation: post.compensation,
      p_start_date: post.start_date,
      p_source_language: post.source_language,
      p_crew_status: post.crew_status,
      p_is_seeded: true,
      p_is_team_content: true,
      p_managed_by_org: ORG_NAME
    })

    if (error) throw error
    postIdByKey.set(post.key, data)
    console.log(`Seeded post: ${post.title}`)
  }

  return postIdByKey
}

async function seedComments(userIdByKey, postIdByKey) {
  for (const item of starterComments) {
    const authorId = userIdByKey.get(item.author)
    const postId = postIdByKey.get(item.post)

    if (!authorId || !postId) {
      throw new Error(`Missing author or post for comment on ${item.post}`)
    }

    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      author_id: authorId,
      body: item.body,
      is_seeded: true,
      is_team_content: true,
      managed_by_org: ORG_NAME
    })

    if (error) throw error
  }

  console.log(`Seeded ${starterComments.length} comments`)
}

async function seedCrewActions(userIdByKey, postIdByKey) {
  for (const action of starterCrewActions) {
    const userId = userIdByKey.get(action.user)
    const postId = postIdByKey.get(action.post)

    if (!userId || !postId) {
      throw new Error(`Missing user or post for crew action ${action.post}`)
    }

    const { error: membershipError } = await supabase
      .from('crew_memberships')
      .upsert(
        {
          post_id: postId,
          user_id: userId,
          status: action.status
        },
        {
          onConflict: 'post_id,user_id'
        }
      )

    if (membershipError) throw membershipError
  }

  console.log(`Seeded ${starterCrewActions.length} crew actions`)
}

async function rebuildCrewStatuses(postIdByKey) {
  const concreteId = postIdByKey.get('need-concrete')

  if (concreteId) {
    const { error } = await supabase
      .from('posts')
      .update({ crew_status: 'full' })
      .eq('id', concreteId)

    if (error) throw error
  }
}

async function main() {
  console.log('Loading trades...')
  const tradesBySlug = await loadTradesMap()

  console.log('Seeding CBG starter accounts...')
  const userIdByKey = await seedAccounts(tradesBySlug)

  console.log('Seeding starter posts...')
  const postIdByKey = await seedPosts(userIdByKey, tradesBySlug)

  console.log('Seeding starter comments...')
  await seedComments(userIdByKey, postIdByKey)

  console.log('Seeding crew actions...')
  await seedCrewActions(userIdByKey, postIdByKey)

  console.log('Rebuilding crew statuses...')
  await rebuildCrewStatuses(postIdByKey)

  console.log('')
  console.log('Done.')
  console.log('Starter accounts created/updated:')
  for (const account of starterAccounts) {
    console.log(`- ${account.email} / ${account.password}`)
  }
}

main().catch((error) => {
  console.error('')
  console.error('Seed failed:')
  console.error(error)
  process.exit(1)
})