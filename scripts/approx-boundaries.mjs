// TEMPORARY placeholder shapes: Voronoi cells around each PC4 centre point.
// Run `npm run boundaries` (needs public.opendatasoft.com) to replace them
// with the official CBS/Kadaster PC4 polygons.
import { readFileSync, writeFileSync } from 'node:fs';
import { Delaunay } from 'd3-delaunay';

const centroids = JSON.parse(readFileSync('data/pc4-centroids.json', 'utf8'));
const wanted = readFileSync('public/areas.csv', 'utf8').trim().split('\n').slice(1).map(l => l.split(',')[0]);

// All PC4 points in a box around the delivery region, so cells are bounded by real neighbours.
const box = [4.85, 51.85, 5.30, 52.20]; // minLng, minLat, maxLng, maxLat
const pts = Object.entries(centroids)
  .map(([pc, [lat, lng]]) => ({ pc, lng, lat }))
  .filter(p => p.lng > box[0] && p.lng < box[2] && p.lat > box[1] && p.lat < box[3]);

const delaunay = Delaunay.from(pts, p => p.lng, p => p.lat);
const vor = delaunay.voronoi(box);
const r = n => Math.round(n * 1e5) / 1e5;

const features = wanted.map(pc => {
  const i = pts.findIndex(p => p.pc === pc);
  if (i < 0) { console.warn('missing centroid for', pc); return null; }
  // Cap each cell at ~2.2 km from its centre so rural cells don't sprawl.
  const c = pts[i], maxD = 0.032;
  const ring = vor.cellPolygon(i).map(([x, y]) => {
    const dx = (x - c.lng) * 0.62, dy = y - c.lat, d = Math.hypot(dx, dy);
    const k = d > maxD ? maxD / d : 1;
    return [r(c.lng + (x - c.lng) * k), r(c.lat + dy * k)];
  });
  return { type: 'Feature', properties: { postcode: pc, approximate: true }, geometry: { type: 'Polygon', coordinates: [ring] } };
}).filter(Boolean);

writeFileSync('public/boundaries.geojson', JSON.stringify({ type: 'FeatureCollection', features }));
console.log(`wrote ${features.length} APPROXIMATE areas to public/boundaries.geojson`);
