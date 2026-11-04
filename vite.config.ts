import { defineConfig } from 'vite';

// Builds dist/crispy-delivery-map.js (map library + styles included). Everything in public/
// (areas.csv, boundaries.geojson, embed.html, maplibre-gl-worker.mjs) is copied next to it.
// Note: the build prints an EMPTY_IMPORT_META warning from maplibre-gl; it's harmless because
// the widget sets the worker URL explicitly (see setWorkerUrl in src/widget.ts).
export default defineConfig({
  build: {
    lib: { entry: 'src/widget.ts', name: 'CrispyDeliveryMap', formats: ['iife'], fileName: () => 'crispy-delivery-map.js' },
    target: 'es2020',
    chunkSizeWarningLimit: 2000,
  },
});
