# Surplox MVP (Directory + Trade Forum + ZIP Radius)

This is a beginner-friendly MVP:
- Members (subs/laborers) can sign up, set trade + home ZIP, and post threads.
- Threads require a ZIP + radius (miles). The feed shows posts "near me".
- Upvotes + comments.
- **Admin-only directory** shows member contact info (only you).

## What you need
- A free Supabase project (DB + Auth)
- A ZIP-to-lat/lon dataset imported into the `zipcodes` table
- Cloudflare Pages (free) to host the built static site

---

## 1) Create Supabase project
1. Go to Supabase → New project.
2. Name it `surplox`.
3. Set a DB password (save it).
4. Create project.

Then:
- Settings → API → copy:
  - Project URL
  - anon public key

---

## 2) Create DB tables + security
In Supabase:
- SQL Editor → New query → paste the SQL from `SUPABASE.sql` → Run

---

## 3) Create your admin account
In the app (after you run it locally), sign up with your admin email:
- david@capitolbuildinggroup.com

Then in Supabase SQL editor run:

```sql
insert into public.admin_users(user_id)
select id from auth.users where email = 'david@capitolbuildinggroup.com'
on conflict do nothing;
```

---

## 4) Import ZIP data (required for radius)
You need ZIP codes with lat/lon.

### Recommended source
- SimpleMaps US ZIP dataset (free but may require attribution) or another ZIP dataset.
Import columns: zip, city, state, lat, lon

In Supabase:
- Table Editor → zipcodes → Import data → CSV

---

## 5) Configure environment variables (local)
Copy `.env.example` to `.env` and fill values:

```bash
cp .env.example .env
```

---

## 6) Run locally
Install Node.js (LTS), then:

```bash
npm install
npm run dev
```

Open: http://localhost:5173

---

## 7) Deploy to Cloudflare Pages (free)
1. Create a GitHub repo and push this folder.
2. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to GitHub.
3. Build settings:
   - Framework preset: None
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Add environment variables in Cloudflare Pages:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy.

---

## 8) Point your domain (GoDaddy) to Cloudflare
Best practice:
- Put domain on Cloudflare (nameservers in GoDaddy)
- Add `surplox.com` and `www.surplox.com` as custom domains in Cloudflare Pages

---

## Notes
- This MVP is a **static app**; all reads/writes go directly to Supabase using RLS security.
- No DMs by design.
