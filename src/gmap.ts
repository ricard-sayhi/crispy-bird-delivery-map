// Google Maps helpers: script loader, HTML markers and the hatched "locked area" overlay.
import type { Polygon, MultiPolygon } from 'geojson';

let loading: Promise<void> | undefined;

/** Loads the Google Maps JavaScript API once per page (shared by all widgets). */
export function loadGoogleMaps(key: string, language: string, onAuthFailure: () => void): Promise<void> {
  const w = window as any;
  w.gm_authFailure = onAuthFailure; // Google calls this global when the key is invalid / not allowed for this site.
  if (w.google?.maps?.importLibrary) return importLibs();
  loading ??= new Promise<void>((resolve, reject) => {
    const cb = '__cdmGoogleMapsReady';
    w[cb] = () => resolve();
    const params = new URLSearchParams({ v: 'weekly', loading: 'async', language, region: 'NL', callback: cb });
    if (key) params.set('key', key);
    const s = document.createElement('script');
    s.src = `https://maps.googleapis.com/maps/api/js?${params}`;
    s.async = true;
    s.onerror = () => reject(new Error('Google Maps script failed to load'));
    document.head.appendChild(s);
  }).then(importLibs);
  return loading;
}

async function importLibs() {
  await Promise.all([google.maps.importLibrary('core'), google.maps.importLibrary('maps'), google.maps.importLibrary('geocoding')]);
}

export type HtmlMarker = google.maps.OverlayView & {
  setPosition(p: google.maps.LatLngLiteral): void;
};

/** A plain HTML element pinned to a coordinate (centred on it). No Map ID needed. */
export function createHtmlMarker(map: google.maps.Map, pos: google.maps.LatLngLiteral, el: HTMLElement, zIndex = 1): HtmlMarker {
  class Marker extends google.maps.OverlayView {
    constructor() { super(); }
    onAdd() {
      el.style.position = 'absolute';
      el.style.zIndex = String(zIndex);
      google.maps.OverlayView.preventMapHitsAndGesturesFrom(el);
      this.getPanes()!.overlayMouseTarget.appendChild(el);
    }
    draw() {
      const p = this.getProjection()?.fromLatLngToDivPixel(pos);
      if (p) { el.style.left = `${p.x}px`; el.style.top = `${p.y}px`; }
    }
    onRemove() { el.remove(); }
    setPosition(p: google.maps.LatLngLiteral) { pos = p; this.draw(); }
  }
  const m = new Marker();
  m.setMap(map);
  return m;
}

export interface HatchShape { id: string; geometry: Polygon | MultiPolygon; opacity: number }

/**
 * Draws locked areas as an SVG on top of the map: diagonal grey stripes + dashed outline.
 * (Google Maps polygons can't do patterns or dashed borders themselves.)
 */
export function createHatchOverlay(map: google.maps.Map, color: string) {
  const uid = 'cdm-hatch-' + Math.random().toString(36).slice(2, 8);
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'cdm-hatch');
  svg.style.cssText = 'position:absolute;overflow:visible;pointer-events:none';
  svg.innerHTML = `<defs><pattern id="${uid}" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="3.2" height="9" fill="${color}" fill-opacity=".55"/></pattern></defs><g></g>`;
  const g = svg.querySelector('g')!;
  let shapes: HatchShape[] = [];

  class Hatch extends google.maps.OverlayView {
    onAdd() { this.getPanes()!.overlayLayer.appendChild(svg); }
    onRemove() { svg.remove(); }
    draw() {
      const proj = this.getProjection();
      if (!proj) return;
      const pt = ([lng, lat]: number[]) => proj.fromLatLngToDivPixel({ lat, lng })!;
      g.innerHTML = '';
      for (const s of shapes) {
        if (s.opacity <= 0) continue;
        const polys = s.geometry.type === 'Polygon' ? [s.geometry.coordinates] : s.geometry.coordinates;
        const d = polys.flatMap(rings => rings.map(ring =>
          ring.map((c, i) => { const p = pt(c); return `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`; }).join('') + 'Z')).join('');
        const path = document.createElementNS(NS, 'path');
        path.setAttribute('d', d);
        path.setAttribute('fill', `url(#${uid})`);
        path.setAttribute('fill-rule', 'evenodd');
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', '2.4');
        path.setAttribute('stroke-dasharray', '7 5');
        path.setAttribute('stroke-linejoin', 'round');
        path.setAttribute('opacity', String(s.opacity));
        g.appendChild(path);
      }
    }
  }
  const overlay = new Hatch();
  overlay.setMap(map);
  return {
    update(next: HatchShape[]) { shapes = next; overlay.draw(); },
  };
}

/** Signed area of a ring (shoelace) — used to give fog holes the opposite winding to the outer ring. */
export function ringArea(ring: number[][]) {
  let a = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) a += (ring[j][0] - ring[i][0]) * (ring[j][1] + ring[i][1]);
  return a / 2;
}

/**
 * Finds the Google Place ID (and centre) of each 4-digit postcode with the Geocoding service.
 * Results are cached in the visitor's browser; prefer filling the place_id column (npm run place-ids).
 */
export async function geocodePostcodes(pcs: string[]): Promise<Map<string, { placeId: string; lat: number; lng: number }>> {
  const KEY = 'cdm-pc-places-v1';
  let cache: Record<string, { placeId: string; lat: number; lng: number }> = {};
  try { cache = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { /* storage unavailable */ }
  const geocoder = new google.maps.Geocoder();
  await Promise.all(pcs.filter(pc => !cache[pc]).map(async pc => {
    try {
      const { results } = await geocoder.geocode({ componentRestrictions: { country: 'NL', postalCode: pc } });
      const r = results.find(x => x.types.includes('postal_code')) ?? results[0];
      if (r) cache[pc] = { placeId: r.place_id, lat: r.geometry.location.lat(), lng: r.geometry.location.lng() };
    } catch (e) { console.warn('[crispy-delivery-map] geocode failed for', pc, e); }
  }));
  try { localStorage.setItem(KEY, JSON.stringify(cache)); } catch { /* ignore */ }
  return new Map(pcs.filter(pc => cache[pc]).map(pc => [pc, cache[pc]]));
}
