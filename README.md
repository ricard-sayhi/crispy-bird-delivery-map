# crispy-bird-delivery-map

Interactive delivery map area searcher for [The Crispy Bird](https://bestellen.thecrispybird.nl/).

- **Live prototype:** https://ricard-sayhi.github.io/crispy-bird-delivery-map/
- **Setup guide for the site owner:** https://ricard-sayhi.github.io/crispy-bird-delivery-map/guide.html
- **Iframe version:** https://ricard-sayhi.github.io/crispy-bird-delivery-map/widget/embed.html

The map runs in Google's "development only" mode (darkened, watermarked) until a Google Maps API key
is added: paste it in the box at the top of the prototype, or add `?key=YOUR_KEY` to the iframe URL.
Add `https://ricard-sayhi.github.io/*` to the key's allowed websites first.

> ⚠ The area borders are still approximate placeholders. See "Replace the placeholder area shapes" below.

---

## About the project
An embeddable `<crispy-delivery-map>` widget. It replaces the delivery-area table with:

- the standard Google Maps view (streets, place names, Map/Satellite switch) with the delivery areas drawn on top. Delivery areas have a green outline and a light green fill. Temporarily closed areas are grey, hatched and dashed, with a 🔒 badge. Everything outside the zone is slightly darkened, like a game map.
- one search box for postcode (`3401` or `3401AB 12`), street + number, neighbourhood or town. The result says *We deliver here* (with minimum order and delivery cost, plus an **Order now** button), *Temporarily closed*, or *Not in our area*.
- filters for town, minimum order and postcode, plus a switch to show or hide closed areas.
- Dutch and English, with a switch.

| Part | Tech | Cost / key |
|---|---|---|
| Map | [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript) (default Google view) | API key with billing enabled; free monthly allowance, see below |
| Address search | [PDOK Locatieserver](https://www.pdok.nl/pdok-locatieserver) (Dutch government) | free, no key |
| Area shapes | CBS & Kadaster PC4 postcode areas (CC BY 4.0), via Opendatasoft | free |
| Area data | `public/areas.csv`, or a published Google Sheet | free |

## Commands

```bash
npm install
npm run dev          # local demo at http://localhost:5173
npm run build        # → dist/ (upload this folder anywhere)
npm run boundaries   # download the OFFICIAL postcode shapes (see below)
```

## ⚠ Replace the placeholder area shapes first

`public/boundaries.geojson` currently has **approximate** shapes. They are generated around each postcode's centre point, and the map shows "Area borders are approximate" while they're in use. Get the real borders with:

```bash
npm run boundaries && npm run build
```

This needs internet access to `public.opendatasoft.com`. After it runs, the warning disappears.

## Google Maps API key

1. Go to <https://console.cloud.google.com/>, create a project (e.g. "Crispy Bird map") and set up billing. Google requires billing to be enabled, but every Maps API has a free monthly usage allowance; a restaurant info page normally stays within it. Check [current pricing](https://mapsplatform.google.com/pricing/) and optionally set a budget alert.
2. **APIs & Services → Library →** enable **Maps JavaScript API**. That is the only Google API the widget uses: the address search uses the free PDOK service.
3. **APIs & Services → Credentials → Create credentials → API key.** Then restrict it:
   - *Application restrictions:* **Websites**, and add `https://bestellen.thecrispybird.nl/*` plus the address where you host the widget (e.g. `https://YOUR-HOST/*`). Add `http://localhost:5173/*` for local testing.
   - *API restrictions:* **Maps JavaScript API** only.
4. Put the key in the `google-maps-key` attribute (or `?key=` for the iframe). A browser key is visible to visitors by design; the restrictions above stop others from using it.

Without a key the map still loads, but Google darkens it, shows "For development purposes only" watermarks and a "can't load Google Maps correctly" dialog.

Optional: create a **Map ID** (Google Cloud → Map Management) and pass it as `map-id` to use Google's newer vector map and cloud-based styling.

## Updating areas: Google Sheet

1. Make a new Google Sheet and use **File → Import → Upload `public/areas.csv`**. The columns are:
   `postcode, city, neighbourhood, min_order, delivery_fee, free_from, status`
2. To close an area, set `status` to `locked` (or `gesloten`). To reopen it, set it to `open`. Amounts can be written as `17.50` or `17,50`.
3. Go to **File → Share → Publish to web**, choose the sheet and **Comma-separated values (.csv)**, then click Publish and copy the link.
4. Give that link to the widget: `areas-csv="…"` for the script embed, or `?sheet=…` for the iframe. The map then reads the sheet on every page load. Google may cache the published file for up to about 5 minutes.

If the sheet can't be loaded, the widget falls back to the bundled `areas.csv`.
A **new** postcode also needs a shape, so run `npm run boundaries` again after adding one. Status and price changes don't need a rebuild.

## Embedding

Upload the contents of `dist/` to any static host, e.g. Netlify, Cloudflare Pages or GitHub Pages. The example URL below is a placeholder.

**A. Script (best, if the ordering platform allows custom HTML/JS):**

```html
<crispy-delivery-map
  google-maps-key="YOUR_GOOGLE_MAPS_KEY"
  lang="nl"
  areas-csv="https://docs.google.com/spreadsheets/d/e/XXXX/pub?output=csv"
  order-url="https://bestellen.thecrispybird.nl/">
</crispy-delivery-map>
<script src="https://YOUR-HOST/crispy-delivery-map.js"></script>
```

The widget's controls are isolated in a Shadow DOM. The map itself and its badges sit in the page, because Google Maps requires that; their CSS classes all start with `cdm-`, so they won't clash with the site. Colours can be changed from the host page:

```css
crispy-delivery-map {
  --cdm-accent: #c8902a;  /* brand colour: buttons, selected filters, focus (Crispy Bird theme colour) */
  --cdm-green: #2e9e4f;   /* delivery areas */
  --cdm-grass: #2f6b3a;   /* grass and parks on the Google map (ignored when a map-id is set: style it in the Map ID instead) */
  --cdm-map-height: 600px;
}
```

**B. Iframe (if only iframes or HTML embeds are allowed):**

```html
<iframe src="https://YOUR-HOST/embed.html?key=YOUR_GOOGLE_MAPS_KEY&lang=nl&sheet=ENCODED_SHEET_URL"
        style="width:100%;height:760px;border:0" loading="lazy" title="Bezorggebied"></iframe>
```

### Attributes

| Attribute | Default | |
|---|---|---|
| `google-maps-key` | – | **required** for production (see above) |
| `map-id` | – | optional Google Map ID |
| `lang` | browser language (`nl`/`en`) | starting language (Google's map labels follow the starting language) |
| `areas-csv` | bundled `areas.csv` | published Google Sheet CSV URL |
| `boundaries` | bundled `boundaries.geojson` | area shapes |
| `order-url` | `https://bestellen.thecrispybird.nl/` | target of the **Order now** button |

## Files

```
src/widget.ts      the custom element (map, search, filters, result card)
src/gmap.ts        Google Maps loader, HTML badges, striped overlay for locked areas
src/data.ts        CSV parsing + joining areas to shapes
src/pdok.ts        PDOK address search
src/i18n.ts        NL / EN text
src/styles.ts      all styling (theme tokens at the top)
public/areas.csv   delivery areas (fallback when no sheet is set)
public/boundaries.geojson   area shapes
scripts/           boundary download + placeholder generator
```

## GitHub Pages

The site is served from `docs/`: `docs/index.html` (prototype), `docs/guide.html` (setup guide) and
`docs/widget/` (the built widget files). After changing the code, refresh them with:

```bash
npm run build && node scripts/make-prototype.mjs && cp prototype.html docs/index.html && cp dist/* docs/widget/
```
