// Downloads the official PC4 polygons (CBS & Kadaster, CC BY 4.0, via Opendatasoft)
// for every postcode in public/areas.csv and writes public/boundaries.geojson.
import { readFileSync, writeFileSync } from 'node:fs';

const codes = readFileSync('public/areas.csv', 'utf8').trim().split('\n').slice(1).map(l => l.split(',')[0]);
const base = 'https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/georef-netherlands-postcode-pc4/exports/geojson';
const where = `pc4_code in (${codes.map(c => `"${c}"`).join(',')})`;

const res = await fetch(`${base}?where=${encodeURIComponent(where)}`);
if (!res.ok) throw new Error(`Opendatasoft returned ${res.status}: ${await res.text()}`);
const fc = await res.json();

const r = n => Math.round(n * 1e5) / 1e5;
const round = c => (typeof c[0] === 'number' ? [r(c[0]), r(c[1])] : c.map(round));
const features = fc.features.map(f => {
  const p = f.properties;
  const pc = String(p.pc4_code ?? p.pc4 ?? p.postcode).padStart(4, '0');
  return { type: 'Feature', properties: { postcode: pc }, geometry: { type: f.geometry.type, coordinates: round(f.geometry.coordinates) } };
});
const missing = codes.filter(c => !features.some(f => f.properties.postcode === c));
if (missing.length) console.warn('No polygon found for:', missing.join(', '));
writeFileSync('public/boundaries.geojson', JSON.stringify({ type: 'FeatureCollection', features }));
console.log(`wrote ${features.length} official PC4 areas to public/boundaries.geojson`);
