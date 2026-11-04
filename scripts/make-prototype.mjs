// Builds prototype.html: one self-contained file (widget + data inlined). Open it in a browser.
import { readFileSync, writeFileSync } from 'node:fs';
const js = readFileSync('dist/crispy-delivery-map.js', 'utf8').replace(/<\/script/gi, '<\\/script');
const dataUrl = (file, type) => `data:${type};base64,${readFileSync(file).toString('base64')}`;
const html = `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Crispy Bird Delivery Map</title>
<style>
  body { margin: 0; padding: 24px 16px; font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; background: #fafaf8; color: #1d1f22; }
  main { max-width: 1040px; margin: 0 auto; display: grid; gap: 16px; }
  h1 { font-size: 28px; margin: 0; }
  .key { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; font-size: 13px; color: #6a6f76; }
  .key input { flex: 1 1 260px; height: 34px; padding: 0 12px; border: 1.5px solid #e3e5e1; border-radius: 999px; font: inherit; }
  .key button { height: 34px; padding: 0 14px; border: 0; border-radius: 999px; background: #2e9e4f; color: #fff; font-weight: 700; cursor: pointer; }
</style>
</head>
<body>
<main>
  <h1>The Crispy Bird Delivery Area</h1>
  <form class="key" id="keyform">
    <label for="k">Google Maps API key (optional, beta only):</label>
    <input id="k" placeholder="Without a key, Google shows a darkened development map" autocomplete="off">
    <button>Load</button>
  </form>
  <div id="slot"></div>
</main>
<script>
  var AREAS = "${dataUrl('public/areas.csv', 'text/csv')}";
  var SHAPES = "${dataUrl('public/boundaries.geojson', 'application/geo+json')}";
  var q = new URLSearchParams(location.search), key = q.get('key') || '';
  document.getElementById('k').value = key;
  document.getElementById('keyform').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = document.getElementById('k').value.trim();
    location.search = v ? '?key=' + encodeURIComponent(v) : '';
  });
  var m = document.createElement('crispy-delivery-map');
  m.setAttribute('areas-csv', AREAS);
  m.setAttribute('boundaries', SHAPES);
  if (key) m.setAttribute('google-maps-key', key);
  if (q.get('mapid')) m.setAttribute('map-id', q.get('mapid'));
  if (q.get('lang')) m.setAttribute('lang', q.get('lang'));
  document.getElementById('slot').appendChild(m);
</script>
<script>${js}</script>
</body>
</html>`;
writeFileSync('prototype.html', html);
console.log('wrote prototype.html', (html.length / 1024).toFixed(0) + ' KB');
