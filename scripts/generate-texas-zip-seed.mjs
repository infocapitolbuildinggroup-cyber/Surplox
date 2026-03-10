import fs from 'node:fs'
import path from 'node:path'
import zipcodes from 'zipcodes-us'

function sqlEscape(value = '') {
  return String(value).replace(/'/g, "''")
}

const rows = []

for (let i = 0; i <= 99999; i += 1) {
  const zip = String(i).padStart(5, '0')
  const info = zipcodes.find(zip)

  if (!info?.isValid) continue
  if (info.stateCode !== 'TX') continue

  const lat = Number(info.latitude)
  const lon = Number(info.longitude)

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue

  rows.push({
    zip,
    city: info.city || '',
    state: 'TX',
    lat,
    lon
  })
}

rows.sort((a, b) => a.zip.localeCompare(b.zip))

const valuesSql = rows
  .map(
    (row) =>
      `('${sqlEscape(row.zip)}', '${sqlEscape(row.city)}', '${sqlEscape(row.state)}', ${row.lat}, ${row.lon})`
  )
  .join(',\n')

const sql = `begin;

create extension if not exists postgis;

create table if not exists public.zipcodes (
  zip text primary key,
  city text,
  state text,
  lat double precision,
  lon double precision,
  point geography(point, 4326) generated always as
    (st_setsrid(st_makepoint(lon, lat), 4326)::geography) stored
);

insert into public.zipcodes (zip, city, state, lat, lon)
values
${valuesSql}
on conflict (zip) do update
set
  city = excluded.city,
  state = excluded.state,
  lat = excluded.lat,
  lon = excluded.lon;

update public.profiles p
set
  home_point = z.point
from public.zipcodes z
where p.home_zip = z.zip;

update public.posts p
set
  center_point = z.point
from public.zipcodes z
where p.center_zip = z.zip;

commit;
`

const outputDir = path.resolve(process.cwd(), 'generated')
fs.mkdirSync(outputDir, { recursive: true })

const outputPath = path.join(outputDir, 'texas_zip_seed.sql')
fs.writeFileSync(outputPath, sql)

console.log(`Generated ${rows.length} Texas ZIP rows -> ${outputPath}`)