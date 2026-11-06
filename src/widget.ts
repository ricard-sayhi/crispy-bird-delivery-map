import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import bbox from '@turf/bbox';
import centroid from '@turf/centroid';
import type { FeatureCollection } from 'geojson';
import { areasFromCsv, joinAreas, type AreaFeature } from './data';
import { STRINGS, type Lang, type Strings } from './i18n';
import { lookup, suggest, type Place, type Suggestion } from './pdok';
import { css, globalCss } from './styles';
import { createHatchOverlay, createHtmlMarker, geocodePostcodes, loadGoogleMaps, ringArea, type HtmlMarker } from './gmap';

// Resolve bundled data files next to the script, so the widget works when embedded on another domain.
const SCRIPT_BASE = new URL('.', (document.currentScript as HTMLScriptElement | null)?.src || location.href).href;

const DEFAULT_ORDER_URL = 'https://bestellen.thecrispybird.nl/';

type AreaState = { hover?: boolean; selected?: boolean; dim?: boolean; hidden?: boolean };
type Bounds = [number, number, number, number]; // west, south, east, north

// Pins and the map itself live in the page (light DOM) because Google Maps injects its CSS into
// document.head, which can't reach inside a Shadow DOM. Their styles are added to the page once.
function injectGlobalCss() {
  if (document.getElementById('cdm-global-css')) return;
  const st = document.createElement('style');
  st.id = 'cdm-global-css';
  st.textContent = globalCss;
  document.head.appendChild(st);
}

const ICON = {
  search: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5Zm-3 8V7a3 3 0 1 1 6 0v3H9Z"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  cross: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  pin: '<svg class="dot addr" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z"/></svg>',
};

const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

type Option =
  | { kind: 'area'; pc: string; label: string; sub: string; locked: boolean }
  | { kind: 'addr'; s: Suggestion };

class CrispyDeliveryMap extends HTMLElement {
  static observedAttributes = ['lang'];

  private root = this.attachShadow({ mode: 'open' });
  private locale: Lang = 'nl';
  private t: Strings = STRINGS.nl;
  private map?: google.maps.Map;
  private data?: google.maps.Data;
  /** Google's own postcode boundaries (data-driven styling), when the Map ID supports them. */
  private pcLayer?: google.maps.FeatureLayer;
  private placeToPc = new Map<string, string>();
  private fog?: google.maps.Polygon;
  private hatch?: ReturnType<typeof createHatchOverlay>;
  private mapEl!: HTMLDivElement;
  private features: AreaFeature[] = [];
  private state = new Map<string, AreaState>();
  private markers = new Map<string, HTMLElement>();
  private pinPos = new Map<string, HtmlMarker>();
  private youMarker?: HtmlMarker;
  private selected: string | null = null;
  private hovered: string | null = null;
  private filter = { city: '', min: -1, postcode: '', showLocked: true };
  private lastResult: { pc: string | null; place?: Place } | null = null;
  private options: Option[] = [];
  private active = -1;
  private searchAbort?: AbortController;
  private debounce?: number;
  private el!: Record<string, HTMLElement>;

  connectedCallback() {
    if (this.el) return;
    const attrLang = this.getAttribute('lang');
    this.locale = attrLang === 'en' || attrLang === 'nl' ? attrLang : navigator.language.startsWith('nl') ? 'nl' : 'en';
    this.t = STRINGS[this.locale];
    this.render();
    this.init().catch(err => {
      console.error('[crispy-delivery-map]', err);
      this.el.status.textContent = this.t.error;
      this.el.status.hidden = false;
    });
  }

  attributeChangedCallback(name: string, _old: string | null, value: string | null) {
    if (name === 'lang' && this.el && (value === 'nl' || value === 'en') && value !== this.locale) this.setLang(value);
  }

  // ---------------------------------------------------------------- DOM

  private render() {
    this.root.innerHTML = `
      <style>${css}</style>
      <div class="cdm" part="root">
        <div class="top">
          <div class="search">
            ${ICON.search}
            <input id="q" type="search" autocomplete="off" spellcheck="false" role="combobox"
              aria-autocomplete="list" aria-expanded="false" aria-controls="suggest">
            <button class="clear" hidden type="button">×</button>
            <ul class="suggest" id="suggest" role="listbox" hidden></ul>
          </div>
          <button class="lang" type="button"></button>
        </div>
        <div class="filters">
          <div class="fgroup"><span class="flabel" data-t="city"></span><div class="chips" data-f="city"></div></div>
          <div class="fgroup"><span class="flabel" data-t="minOrder"></span><div class="chips" data-f="min"></div></div>
          <div class="fgroup"><select class="select" data-f="postcode"></select></div>
          <label class="toggle"><input type="checkbox" data-f="locked" checked><span data-t="showLocked"></span></label>
          <span class="count" aria-live="polite"></span>
        </div>
        <div class="mapwrap">
          <slot name="map"></slot>
          <div class="legend"></div>
          <div class="card" hidden role="status"></div>
          <div class="status"></div>
        </div>
      </div>`;
    const $ = (s: string) => this.root.querySelector(s) as HTMLElement;
    this.el = {
      input: $('#q'), clear: $('.clear'), suggest: $('.suggest'), lang: $('.lang'),
      city: $('[data-f="city"]'), min: $('[data-f="min"]'), postcode: $('[data-f="postcode"]'), locked: $('[data-f="locked"]'),
      count: $('.count'), legend: $('.legend'), card: $('.card'), status: $('.status'),
    };
    injectGlobalCss();
    this.mapEl = document.createElement('div');
    this.mapEl.slot = 'map';
    this.mapEl.className = 'cdm-gmap';
    this.appendChild(this.mapEl);
    this.applyStrings();
    this.bindUi();
  }

  private applyStrings() {
    const input = this.el.input as HTMLInputElement;
    input.placeholder = this.t.searchPlaceholder;
    input.setAttribute('aria-label', this.t.searchLabel);
    this.el.clear.setAttribute('aria-label', this.t.clear);
    this.el.lang.textContent = this.locale === 'nl' ? 'EN' : 'NL';
    this.el.lang.setAttribute('aria-label', this.locale === 'nl' ? 'Switch to English' : 'Wissel naar Nederlands');
    this.root.querySelectorAll<HTMLElement>('[data-t]').forEach(n => (n.textContent = String(this.t[n.dataset.t as keyof Strings])));
    if (!this.features.length) this.el.status.textContent = this.t.loading;
  }

  private setLang(lang: Lang) {
    this.locale = lang;
    this.t = STRINGS[lang];
    this.applyStrings();
    this.buildFilters();
    this.renderLegend();
    this.applyFilter(false);
    if (this.lastResult) this.showCard(this.lastResult.pc, this.lastResult.place);
  }

  /**
   * Analytics: fires a DOM event (cdm-track) and, if Google Tag Manager / GA4 is on the page,
   * pushes the same data to window.dataLayer. No personal data is sent (no addresses).
   */
  private track(event: string, detail: Record<string, string | number | null>) {
    const data = { event: `delivery_map_${event}`, ...detail };
    this.dispatchEvent(new CustomEvent('cdm-track', { detail: data, bubbles: true, composed: true }));
    const w = window as any;
    if (Array.isArray(w.dataLayer)) w.dataLayer.push(data);
    else if (typeof w.gtag === 'function') w.gtag('event', data.event, detail);
  }

  private money(n: number) {
    return new Intl.NumberFormat(this.locale === 'nl' ? 'nl-NL' : 'en-IE', { style: 'currency', currency: 'EUR' }).format(n);
  }

  // ---------------------------------------------------------------- data + map

  private async init() {
    const sheet = this.getAttribute('areas-csv');
    const boundariesUrl = this.getAttribute('boundaries') || SCRIPT_BASE + 'boundaries.geojson';
    const bundledCsv = SCRIPT_BASE + 'areas.csv';
    const key = this.getAttribute('google-maps-key') || '';
    if (!key) console.warn('[crispy-delivery-map] No google-maps-key attribute: Google Maps runs in "development only" mode.');

    const loadCsv = async (url: string) => {
      const r = await fetch(url, { cache: 'no-cache' });
      if (!r.ok) throw new Error(`${url}: ${r.status}`);
      return areasFromCsv(await r.text());
    };
    const [areas, boundaries] = await Promise.all([
      sheet ? loadCsv(sheet).catch(e => (console.warn('[crispy-delivery-map] Sheet failed, using bundled areas.csv', e), loadCsv(bundledCsv))) : loadCsv(bundledCsv),
      fetch(boundariesUrl).then(r => r.json() as Promise<FeatureCollection>),
      loadGoogleMaps(key, this.locale, () => {
        this.el.status.textContent = this.t.keyError;
        this.el.status.hidden = false;
      }),
    ]);
    const { features, missing } = joinAreas(areas, boundaries);
    if (missing.length) console.warn('[crispy-delivery-map] No boundary for postcodes:', missing.join(', '));
    this.features = features;
    this.buildFilters();
    this.renderLegend();

    const mapId = this.getAttribute('map-id') || undefined;
    // Darker green for grass, parks and woodland so they stand out on the base map.
    // (With a Map ID, Google ignores this list: set the same colours in the Map ID's cloud style.)
    const grass = this.color('--cdm-grass');
    const styles: google.maps.MapTypeStyle[] = [
      { featureType: 'landscape.natural.landcover', elementType: 'geometry', stylers: [{ color: grass }] },
      { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: grass }] },
      { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#ffffff' }] },
      { featureType: 'poi.park', elementType: 'labels.text.stroke', stylers: [{ color: grass }] },
    ];
    const map = (this.map = new google.maps.Map(this.mapEl, {
      mapId,
      styles: mapId ? undefined : styles,
      center: { lat: 52.03, lng: 5.1 },
      zoom: 11,
      gestureHandling: 'cooperative', // one finger scrolls the page on phones; two fingers move the map
      clickableIcons: false,
      streetViewControl: false,
      mapTypeControl: true,
      mapTypeControlOptions: { position: google.maps.ControlPosition.TOP_RIGHT, style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR },
      fullscreenControl: true,
      fullscreenControlOptions: { position: google.maps.ControlPosition.RIGHT_TOP },
      zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_CENTER },
    }));
    this.fit(this.bounds(features), 30, 14);
    this.el.status.hidden = true;
    this.addLayers();
    this.addPins();
    await this.useGoogleBoundaries();
    this.bindMap();
    this.applyFilter(false);
  }

  private color(name: string) {
    return getComputedStyle(this).getPropertyValue(name).trim();
  }

  private bounds(fs: AreaFeature[]): Bounds {
    return bbox({ type: 'FeatureCollection', features: fs }) as Bounds;
  }

  /** fitBounds with a zoom ceiling (Google has no maxZoom option for fitBounds). */
  private fit([west, south, east, north]: Bounds, padding: number | google.maps.Padding, maxZoom = 14) {
    const map = this.map!;
    map.fitBounds({ west, south, east, north }, padding);
    google.maps.event.addListenerOnce(map, 'idle', () => { if ((map.getZoom() ?? 0) > maxZoom) map.setZoom(maxZoom); });
  }

  private st(pc: string): AreaState {
    let s = this.state.get(pc);
    if (!s) this.state.set(pc, (s = {}));
    return s;
  }

  private addLayers() {
    const map = this.map!;
    const green = this.color('--cdm-green'), greenFill = this.color('--cdm-green-fill');
    const locked = this.color('--cdm-locked'), lockedDark = this.color('--cdm-locked-dark');

    // "Fog of war": gently shade everything outside the delivery zone, like an unexplored game map.
    const outer = [[2, 50], [9, 50], [9, 54.5], [2, 54.5], [2, 50]];
    const outerSign = Math.sign(ringArea(outer));
    const holes = this.features
      .flatMap(f => (f.geometry.type === 'Polygon' ? [f.geometry.coordinates[0]] : f.geometry.coordinates.map(p => p[0])))
      .map(r => (Math.sign(ringArea(r)) === outerSign ? [...r].reverse() : r));
    this.fog = new google.maps.Polygon({
      map, clickable: false, strokeWeight: 0, fillColor: '#16301f', fillOpacity: 0.12, zIndex: 0,
      paths: [outer, ...holes].map(r => r.map(([lng, lat]) => ({ lat, lng }))),
    });

    const data = (this.data = new google.maps.Data({ map }));
    data.addGeoJson({ type: 'FeatureCollection', features: this.features }, { idPropertyName: 'postcode' });
    data.setStyle(f => {
      const s = this.st(String(f.getProperty('postcode')));
      const isLocked = f.getProperty('status') === 'locked';
      if (s.hidden) return { visible: false };
      return {
        cursor: 'pointer',
        zIndex: s.selected ? 3 : s.hover ? 2 : 1,
        fillColor: isLocked ? locked : greenFill,
        fillOpacity: s.dim ? 0.05 : s.selected ? 0.42 : s.hover ? 0.32 : isLocked ? 0.32 : 0.22,
        strokeColor: isLocked ? lockedDark : green,
        strokeOpacity: isLocked ? 0 : s.dim ? 0.3 : 1, // locked borders are drawn dashed by the hatch overlay
        strokeWeight: s.selected ? 4 : s.hover ? 3 : 2,
      };
    });
    this.hatch = createHatchOverlay(map, lockedDark);
  }

  /** Re-applies area styling after state changes. */
  private restyle() {
    const data = this.data;
    if (!data) return;
    data.setStyle(data.getStyle()!); // forces Google to re-run the style function
    if (this.pcLayer) this.pcLayer.style = this.pcLayer.style; // same for Google's postcode layer
    this.hatch?.update(this.features
      .filter(f => f.properties.status === 'locked')
      .map(f => {
        const s = this.st(f.properties.postcode);
        return { id: f.properties.postcode, geometry: f.geometry, opacity: s.hidden ? 0 : s.dim ? 0.25 : 1 };
      }));
  }

  /**
   * Switches to Google's own postcode outlines (exactly the shapes Google Maps shows) when the map
   * has a Map ID with the "Postal code" feature layer enabled. Otherwise the bundled shapes stay.
   */
  private async useGoogleBoundaries() {
    const map = this.map!;
    if (!this.getAttribute('map-id') || this.getAttribute('boundary-source') === 'bundled') return;
    let layer: google.maps.FeatureLayer;
    try { layer = map.getFeatureLayer(google.maps.FeatureType.POSTAL_CODE); } catch { return; }
    if (!layer.isAvailable) {
      console.info('[crispy-delivery-map] Google postal-code boundaries not enabled for this Map ID; using bundled shapes.');
      return;
    }
    const missing = this.features.filter(f => !f.properties.placeId).map(f => f.properties.postcode);
    const found = missing.length ? await geocodePostcodes(missing) : new Map();
    for (const f of this.features) {
      const id = f.properties.placeId ?? found.get(f.properties.postcode)?.placeId;
      if (id) this.placeToPc.set(id, f.properties.postcode);
    }
    if (!this.placeToPc.size) return;

    const green = this.color('--cdm-green'), greenFill = this.color('--cdm-green-fill');
    const locked = this.color('--cdm-locked'), lockedDark = this.color('--cdm-locked-dark');
    layer.style = ({ feature }) => {
      const pc = this.placeToPc.get((feature as google.maps.PlaceFeature).placeId);
      if (!pc) return null;
      const s = this.st(pc);
      if (s.hidden) return null;
      const isLocked = this.features.find(f => f.properties.postcode === pc)?.properties.status === 'locked';
      return {
        fillColor: isLocked ? locked : greenFill,
        fillOpacity: s.dim ? 0.05 : s.selected ? 0.42 : s.hover ? 0.32 : isLocked ? 0.38 : 0.22,
        strokeColor: isLocked ? lockedDark : green,
        strokeOpacity: s.dim ? 0.3 : 1,
        strokeWeight: s.selected ? 4 : s.hover ? 3 : 2,
      };
    };
    const pcOf = (e: google.maps.FeatureMouseEvent) => this.placeToPc.get((e.features[0] as google.maps.PlaceFeature)?.placeId);
    layer.addListener('click', (e: google.maps.FeatureMouseEvent) => { const pc = pcOf(e); if (pc) this.select(pc); });
    layer.addListener('mousemove', (e: google.maps.FeatureMouseEvent) => {
      const pc = pcOf(e) ?? null;
      if (pc === this.hovered) return;
      if (this.hovered) this.st(this.hovered).hover = false;
      this.hovered = pc;
      if (pc) this.st(pc).hover = true;
      this.restyle();
    });
    this.pcLayer = layer;
    // Google now draws the areas: hide the bundled shapes and the effects built from them,
    // so nothing is drawn with a slightly different outline on top.
    this.data?.setMap(null);
    this.fog?.setMap(null);
    this.hatch?.update([]);
    this.hatch = undefined;
    // Put the badges on Google's own centre point of each postcode.
    for (const [pc, g] of found) this.pinPos.get(pc)?.setPosition({ lat: g.lat, lng: g.lng });
    console.info(`[crispy-delivery-map] Using Google postcode boundaries for ${this.placeToPc.size} areas.`);
  }

  private addPins() {
    for (const f of this.features) {
      const p = f.properties;
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'cdm-pin' + (p.status === 'locked' ? ' locked' : '');
      el.innerHTML = (p.status === 'locked' ? ICON.lock : '') + `<span>${esc(p.postcode)}</span>`;
      el.setAttribute('aria-label', `${p.postcode} ${p.city} – ${p.neighbourhood}`);
      el.addEventListener('click', ev => { ev.stopPropagation(); this.select(p.postcode); });
      const [lng, lat] = centroid(f).geometry.coordinates;
      this.pinPos.set(p.postcode, createHtmlMarker(this.map!, { lat, lng }, el, p.status === 'locked' ? 3 : 2));
      this.markers.set(p.postcode, el);
    }
  }

  private bindMap() {
    const map = this.map!, data = this.data!;
    data.addListener('mouseover', (e: google.maps.Data.MouseEvent) => {
      this.hovered = String(e.feature.getProperty('postcode'));
      this.st(this.hovered).hover = true;
      this.restyle();
    });
    data.addListener('mouseout', () => {
      if (this.hovered) this.st(this.hovered).hover = false;
      this.hovered = null;
      this.restyle();
    });
    data.addListener('click', (e: google.maps.Data.MouseEvent) => this.select(String(e.feature.getProperty('postcode'))));
    map.addListener('click', () => this.closeCard());
    // Shrink area badges when zoomed out so they don't pile up (labels → small dots).
    const sizePins = () => {
      const z = map.getZoom() ?? 12;
      const narrow = this.mapEl.clientWidth < 600 ? 1 : 0; // phones need one more zoom level before labels fit
      this.mapEl.classList.toggle('z-small', z < 12 + narrow);
      this.mapEl.classList.toggle('z-dots', z < 11 + narrow);
    };
    map.addListener('zoom_changed', sizePins);
    sizePins();
  }

  // ---------------------------------------------------------------- filters

  private buildFilters() {
    const t = this.t;
    const cities = [...new Set(this.features.map(f => f.properties.city))].sort();
    const mins = [...new Set(this.features.map(f => f.properties.minOrder))].sort((a, b) => a - b);
    this.el.city.innerHTML = [`<button class="chip" type="button" data-v="">${t.all}</button>`,
      ...cities.map(c => `<button class="chip" type="button" data-v="${esc(c)}">${esc(c)}</button>`)].join('');
    this.el.min.innerHTML = [`<button class="chip" type="button" data-v="-1">${t.all}</button>`,
      ...mins.map(m => `<button class="chip" type="button" data-v="${m}">${this.money(m)}</button>`)].join('');
    const sorted = [...this.features].sort((a, b) => a.properties.postcode.localeCompare(b.properties.postcode));
    this.el.postcode.innerHTML = `<option value="">${t.allPostcodes}</option>` +
      sorted.map(f => `<option value="${f.properties.postcode}">${f.properties.postcode} · ${esc(f.properties.neighbourhood)}${f.properties.status === 'locked' ? ' 🔒' : ''}</option>`).join('');
    this.el.postcode.setAttribute('aria-label', t.postcode);
    (this.el.postcode as HTMLSelectElement).value = this.filter.postcode;
    this.syncChips();
  }

  private syncChips() {
    this.el.city.querySelectorAll<HTMLElement>('.chip').forEach(c => c.setAttribute('aria-pressed', String(c.dataset.v === this.filter.city)));
    this.el.min.querySelectorAll<HTMLElement>('.chip').forEach(c => c.setAttribute('aria-pressed', String(Number(c.dataset.v) === this.filter.min)));
  }

  private inFilter(f: AreaFeature) {
    const p = f.properties, fl = this.filter;
    return (!fl.city || p.city === fl.city) && (fl.min < 0 || p.minOrder === fl.min) && (!fl.postcode || p.postcode === fl.postcode);
  }

  private applyFilter(fit = true) {
    const map = this.map;
    const fl = this.filter;
    const any = !!(fl.city || fl.min >= 0 || fl.postcode);
    const shown: AreaFeature[] = [];
    for (const f of this.features) {
      const hidden = !fl.showLocked && f.properties.status === 'locked';
      const dim = !hidden && any && !this.inFilter(f);
      if (!hidden && !dim) shown.push(f);
      Object.assign(this.st(f.properties.postcode), { hidden, dim });
      const pin = this.markers.get(f.properties.postcode);
      pin?.classList.toggle('hidden', hidden);
      pin?.classList.toggle('dim', dim);
    }
    this.restyle();
    this.el.count.textContent = this.t.count(shown.length, this.features.length);
    if (fit) this.track('filter', { town: fl.city || null, min_order: fl.min >= 0 ? fl.min : null, postcode: fl.postcode || null });
    this.syncChips();
    if (fit && map && shown.length) this.fit(this.bounds(any ? shown : this.features), 50, 14);
  }

  // ---------------------------------------------------------------- selection + result card

  private select(pc: string | null, place?: Place, opts: { fit?: boolean } = {}) {
    const map = this.map!;
    if (this.selected) this.st(this.selected).selected = false;
    this.markers.get(this.selected ?? '')?.classList.remove('selected');
    this.selected = pc;
    const f = pc ? this.features.find(x => x.properties.postcode === pc) : undefined;
    if (f) {
      this.st(pc!).selected = true;
      this.markers.get(pc!)?.classList.add('selected');
    }
    this.restyle();
    this.youMarker?.setMap(null);
    this.youMarker = undefined;
    if (place) {
      const dot = document.createElement('div');
      dot.className = 'cdm-you';
      this.youMarker = createHtmlMarker(map, { lat: place.lat, lng: place.lng }, dot, 5);
    }
    this.lastResult = { pc: f ? pc : null, place };
    this.showCard(f ? pc : null, place);
    this.track('result', { result: f ? f.properties.status : 'outside', postcode: f ? pc : null, source: place ? 'address' : 'area' });
    if (opts.fit !== false) {
      const pad = { top: 60, left: 40, right: 40, bottom: this.el.card.offsetHeight + 40 };
      if (place && (place.type === 'adres' || !f)) {
        const d = 0.004; // ~400 m box around the address
        this.fit([place.lng - d, place.lat - d * 0.6, place.lng + d, place.lat + d * 0.6], pad, 16);
      } else if (f) this.fit(bbox(f) as Bounds, pad, 15);
    }
  }

  private showCard(pc: string | null, place?: Place) {
    const t = this.t;
    const f = pc ? this.features.find(x => x.properties.postcode === pc) : undefined;
    const card = this.el.card;
    const orderUrl = this.getAttribute('order-url') || DEFAULT_ORDER_URL;
    const addr = place ? `<div class="addr">${ICON.pin.replace('class="dot addr"', 'style="width:14px;height:14px;vertical-align:-2px;color:var(--cdm-muted)"')} ${esc(place.label)}</div>` : '';
    const vague = place && place.type !== 'adres' && place.type !== 'postcode' ? `<div class="body">${t.vague}</div>` : '';
    let state: 'open' | 'locked' | 'outside', html: string;
    if (!f) {
      state = 'outside';
      html = `<div class="head"><div class="badge">${ICON.cross}</div><div><div class="title">${t.outside}</div></div></div>${addr}<div class="body">${t.outsideBody}</div>${vague}`;
    } else {
      const p = f.properties;
      state = p.status;
      const area = `<div class="area">${p.postcode} · ${esc(p.city)} – ${esc(p.neighbourhood)}</div>`;
      const fee = p.deliveryFee > 0 ? this.money(p.deliveryFee) : t.free;
      const stats = `<dl><div><dt>${t.min}</dt><dd>${this.money(p.minOrder)}</dd></div><div><dt>${t.delivery}</dt><dd>${fee}</dd></div>${
        p.deliveryFee > 0 && p.freeFrom > 0 ? `<div><dt>${t.freeFrom}</dt><dd>${this.money(p.freeFrom)}</dd></div>` : ''}</dl>`;
      html = state === 'locked'
        ? `<div class="head"><div class="badge">${ICON.lock}</div><div><div class="title">${t.locked}</div>${area}</div></div>${addr}<div class="body">${t.lockedBody}</div>`
        : `<div class="head"><div class="badge">${ICON.check}</div><div><div class="title">${t.open}</div>${area}</div></div>${addr}${vague}${stats}<a class="cta" href="${esc(orderUrl)}" target="_top">${t.order} →</a>`;
    }
    card.className = `card ${state}`;
    card.innerHTML = `<button class="x" type="button" aria-label="${t.close}">×</button>${html}`;
    card.querySelector('.x')!.addEventListener('click', () => this.closeCard());
    card.querySelector('.cta')?.addEventListener('click', () => this.track('order_click', { postcode: f?.properties.postcode ?? null }));
    card.hidden = false;
  }

  private closeCard() {
    this.el.card.hidden = true;
    this.lastResult = null;
    if (this.selected) {
      this.st(this.selected).selected = false;
      this.markers.get(this.selected)?.classList.remove('selected');
    }
    this.selected = null;
    this.restyle();
    this.youMarker?.setMap(null);
    this.youMarker = undefined;
  }

  private renderLegend() {
    const approx = this.features.some(f => f.properties.approximate);
    const hasLocked = this.features.some(f => f.properties.status === 'locked');
    this.el.legend.innerHTML =
      `<div class="row"><span class="sw"></span>${this.t.legendOpen}</div>` +
      (hasLocked ? `<div class="row"><span class="sw locked"></span>${this.t.legendLocked}</div>` : '') +
      (approx ? `<div class="approx">⚠ ${this.t.approximate}</div>` : '') +
      `<div class="credit">Postcodegebieden © CBS, Kadaster</div>`;
  }

  // ---------------------------------------------------------------- search

  private bindUi() {
    const input = this.el.input as HTMLInputElement;
    input.addEventListener('input', () => {
      this.el.clear.hidden = !input.value;
      clearTimeout(this.debounce);
      this.debounce = window.setTimeout(() => this.runSearch(input.value), 180);
    });
    input.addEventListener('keydown', e => {
      const n = this.options.length;
      if (e.key === 'ArrowDown' && n) { e.preventDefault(); this.setActive((this.active + 1) % n); }
      else if (e.key === 'ArrowUp' && n) { e.preventDefault(); this.setActive((this.active - 1 + n) % n); }
      else if (e.key === 'Enter') { e.preventDefault(); this.choose(this.active >= 0 ? this.active : 0); }
      else if (e.key === 'Escape') this.closeSuggest();
    });
    input.addEventListener('focus', () => { if (this.options.length) this.openSuggest(); });
    input.addEventListener('blur', () => setTimeout(() => this.closeSuggest(), 150));
    this.el.clear.addEventListener('click', () => {
      input.value = ''; this.el.clear.hidden = true; this.options = []; this.closeSuggest(); this.closeCard(); input.focus();
    });
    this.el.suggest.addEventListener('mousedown', e => {
      const li = (e.target as HTMLElement).closest<HTMLElement>('[data-i]');
      if (li) { e.preventDefault(); this.choose(Number(li.dataset.i)); }
    });
    this.el.lang.addEventListener('click', () => this.setAttribute('lang', this.locale === 'nl' ? 'en' : 'nl'));

    this.el.city.addEventListener('click', e => {
      const v = (e.target as HTMLElement).closest<HTMLElement>('.chip')?.dataset.v;
      if (v == null) return;
      this.filter.city = v; this.filter.postcode = ''; (this.el.postcode as HTMLSelectElement).value = '';
      this.applyFilter();
    });
    this.el.min.addEventListener('click', e => {
      const v = (e.target as HTMLElement).closest<HTMLElement>('.chip')?.dataset.v;
      if (v == null) return;
      this.filter.min = Number(v); this.filter.postcode = ''; (this.el.postcode as HTMLSelectElement).value = '';
      this.applyFilter();
    });
    this.el.postcode.addEventListener('change', () => {
      const v = (this.el.postcode as HTMLSelectElement).value;
      this.filter = { ...this.filter, postcode: v, city: '', min: -1 };
      this.applyFilter(!v);
      if (v) this.select(v);
    });
    this.el.locked.addEventListener('change', () => {
      this.filter.showLocked = (this.el.locked as HTMLInputElement).checked;
      this.applyFilter(false);
    });
  }

  private localMatches(q: string): Option[] {
    const nq = norm(q);
    const digits = nq.replace(/\s/g, '').match(/^\d{1,4}/)?.[0];
    if (!digits && nq.length < 2) return [];
    return this.features
      .filter(f => {
        const p = f.properties;
        return digits ? p.postcode.startsWith(digits) : norm(`${p.neighbourhood} ${p.city}`).includes(nq);
      })
      .slice(0, 5)
      .map(f => ({
        kind: 'area' as const, pc: f.properties.postcode, locked: f.properties.status === 'locked',
        label: `${f.properties.postcode} · ${f.properties.neighbourhood}`, sub: f.properties.city,
      }));
  }

  private async runSearch(q: string) {
    this.searchAbort?.abort();
    if (!q.trim()) { this.options = []; this.closeSuggest(); return; }
    const local = this.localMatches(q);
    this.renderSuggest(local, [], 'loading');
    if (q.trim().length < 2) { this.renderSuggest(local, [], 'done'); return; }
    const ctrl = (this.searchAbort = new AbortController());
    try {
      const addrs = await suggest(q, ctrl.signal);
      if (!ctrl.signal.aborted) this.renderSuggest(local, addrs, 'done');
    } catch (e) {
      if (!ctrl.signal.aborted) this.renderSuggest(local, [], 'error');
    }
  }

  private renderSuggest(local: Option[], addrs: Suggestion[], state: 'loading' | 'done' | 'error') {
    const t = this.t;
    this.options = [...local, ...addrs.map(s => ({ kind: 'addr' as const, s }))];
    this.active = -1;
    let i = 0, html = '';
    if (local.length) {
      html += `<li class="group" role="presentation">${t.areasGroup}</li>`;
      for (const o of local) if (o.kind === 'area')
        html += `<li class="item" role="option" id="opt${i}" data-i="${i++}"><span class="dot${o.locked ? ' locked' : ''}"></span>${esc(o.label)}<span class="sub">${o.locked ? '🔒 ' : ''}${esc(o.sub)}</span></li>`;
    }
    if (addrs.length) {
      html += `<li class="group" role="presentation">${t.addressGroup}</li>`;
      for (const s of addrs) html += `<li class="item" role="option" id="opt${i}" data-i="${i++}">${ICON.pin}${esc(s.label)}</li>`;
    }
    if (state === 'error') html += `<li class="note" role="presentation">${t.searchOffline}</li>`;
    else if (state === 'done' && !this.options.length) html += `<li class="note" role="presentation">${t.noResults}</li>`;
    this.el.suggest.innerHTML = html;
    if (html) this.openSuggest(); else this.closeSuggest();
  }

  private setActive(i: number) {
    this.active = i;
    this.el.suggest.querySelectorAll<HTMLElement>('.item').forEach(li => li.setAttribute('aria-selected', String(Number(li.dataset.i) === i)));
    this.el.input.setAttribute('aria-activedescendant', `opt${i}`);
    this.el.suggest.querySelector(`#opt${i}`)?.scrollIntoView({ block: 'nearest' });
  }

  private openSuggest() { this.el.suggest.hidden = false; this.el.input.setAttribute('aria-expanded', 'true'); }
  private closeSuggest() { this.el.suggest.hidden = true; this.el.input.setAttribute('aria-expanded', 'false'); }

  private async choose(i: number) {
    const o = this.options[i];
    if (!o) return;
    const input = this.el.input as HTMLInputElement;
    this.closeSuggest();
    input.blur();
    if (o.kind === 'area') {
      input.value = o.label;
      this.select(o.pc);
      return;
    }
    input.value = o.s.label;
    try {
      const place = await lookup(o.s.id);
      // A town we deliver to: filter on it instead of pinning its centre.
      const city = this.features.find(f => norm(f.properties.city) === norm(place.label.split(',')[0]))?.properties.city;
      if (place.type === 'woonplaats' && city) {
        this.closeCard();
        this.filter = { ...this.filter, city, min: -1, postcode: '' };
        (this.el.postcode as HTMLSelectElement).value = '';
        this.applyFilter();
        return;
      }
      this.select(this.areaFor(place), place);
    } catch (e) {
      console.warn('[crispy-delivery-map] lookup failed', e);
    }
  }

  /** Which delivery area an address is in: by its postcode if known, else by point-in-polygon. */
  private areaFor(place: Place): string | null {
    const pc4 = place.postcode?.slice(0, 4);
    if (pc4) return this.features.some(f => f.properties.postcode === pc4) ? pc4 : null;
    const hit = this.features.find(f => booleanPointInPolygon([place.lng, place.lat], f));
    return hit?.properties.postcode ?? null;
  }
}

if (!customElements.get('crispy-delivery-map')) customElements.define('crispy-delivery-map', CrispyDeliveryMap);

declare global { interface HTMLElementTagNameMap { 'crispy-delivery-map': CrispyDeliveryMap } }
export {};
