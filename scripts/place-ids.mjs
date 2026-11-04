// Fills the place_id column of public/areas.csv with Google's Place ID for each 4-digit postcode,
// so the widget can draw Google's own postcode outline without geocoding in every visitor's browser.
// Usage: GOOGLE_MAPS_KEY=... npm run place-ids   (needs the Geocoding API enabled on that key;
// use an unrestricted or IP-restricted server key, not the website-restricted browser key)
import { readFileSync, writeFileSync } from 'node:fs';

const key = process.env.GOOGLE_MAPS_KEY;
if (!key) throw new Error('Set GOOGLE_MAPS_KEY');
const file = 'public/areas.csv';
const lines = readFileSync(file, 'utf8').trim().split('\n');
const header = lines[0].split(',');
let col = header.indexOf('place_id');
if (col < 0) { header.push('place_id'); col = header.length - 1; }

const out = [header.join(',')];
for (const line of lines.slice(1)) {
  const cells = line.split(',');
  const pc = cells[0];
  const url = `https://maps.googleapis.com/maps/api/geocode/json?components=country:NL|postal_code:${pc}&key=${key}`;
  const json = await (await fetch(url)).json();
  const r = json.results?.find(x => x.types.includes('postal_code')) ?? json.results?.[0];
  if (!r) console.warn(pc, json.status, json.error_message ?? 'no result');
  else console.log(pc, '→', r.place_id, r.formatted_address);
  cells[col] = r?.place_id ?? cells[col] ?? '';
  while (cells.length < header.length) cells.push('');
  out.push(cells.join(','));
}
writeFileSync(file, out.join('\n') + '\n');
console.log('updated', file);
