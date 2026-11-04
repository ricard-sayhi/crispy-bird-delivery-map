import type { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson';

export type Status = 'open' | 'locked';

export interface Area {
  postcode: string;
  city: string;
  neighbourhood: string;
  minOrder: number;
  deliveryFee: number;
  freeFrom: number;
  /** Google Place ID of the postcode (optional; enables Google's own postcode outline). */
  placeId?: string;
  status: Status;
}

export type AreaFeature = Feature<Polygon | MultiPolygon, Area & { approximate?: boolean }>;

/** Minimal RFC 4180 CSV parser (handles quotes, commas and newlines inside quotes). */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',' || ch === ';') { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter(r => r.some(c => c.trim()));
}

const money = (v = '') => {
  const n = parseFloat(v.replace(/[€\s]/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
};

const LOCKED_WORDS = ['locked', 'closed', 'gesloten', 'dicht', 'unavailable', 'niet beschikbaar', 'no', 'nee', 'false', '0'];

/** Turns the areas CSV (bundled file or published Google Sheet) into Area objects. */
export function areasFromCsv(text: string): Area[] {
  const [header, ...rows] = parseCsv(text);
  const col = (name: string) => header.findIndex(h => h.trim().toLowerCase().replace(/\s+/g, '_') === name);
  const idx = {
    postcode: col('postcode'), city: col('city'), neighbourhood: col('neighbourhood'),
    min: col('min_order'), fee: col('delivery_fee'), free: col('free_from'), status: col('status'), placeId: col('place_id'),
  };
  if (idx.postcode < 0) throw new Error('Areas CSV needs a "postcode" column');
  return rows
    .map(r => ({
      postcode: (r[idx.postcode] ?? '').trim().slice(0, 4),
      city: (r[idx.city] ?? '').trim(),
      neighbourhood: (r[idx.neighbourhood] ?? '').trim(),
      minOrder: money(r[idx.min]),
      deliveryFee: money(r[idx.fee]),
      freeFrom: money(r[idx.free]),
      placeId: (r[idx.placeId] ?? '').trim() || undefined,
      status: (LOCKED_WORDS.includes((r[idx.status] ?? '').trim().toLowerCase()) ? 'locked' : 'open') as Status,
    }))
    .filter(a => /^\d{4}$/.test(a.postcode));
}

/** Joins area info onto the boundary polygons by postcode. Areas without a polygon are reported. */
export function joinAreas(areas: Area[], boundaries: FeatureCollection): { features: AreaFeature[]; missing: string[] } {
  const byPc = new Map(boundaries.features.map(f => [String(f.properties?.postcode), f]));
  const features: AreaFeature[] = [];
  const missing: string[] = [];
  for (const a of areas) {
    const b = byPc.get(a.postcode);
    if (!b) { missing.push(a.postcode); continue; }
    features.push({
      type: 'Feature',
      id: Number(a.postcode),
      geometry: b.geometry as Polygon | MultiPolygon,
      properties: { ...a, approximate: !!b.properties?.approximate },
    });
  }
  return { features, missing };
}
