export const css = /* css */ `
:host {
  /* Theme tokens: override these from the host page, e.g. crispy-delivery-map { --cdm-green: #1f8f45 } */
  --cdm-green: #2e9e4f;
  --cdm-green-dark: #1f7a3a;
  --cdm-green-fill: #4cc46c;
  --cdm-locked: #8b9098;
  --cdm-locked-dark: #5d626b;
  --cdm-outside: #c2410c;
  --cdm-ink: #1d1f22;
  --cdm-muted: #6a6f76;
  --cdm-surface: #ffffff;
  --cdm-subtle: #f4f5f3;
  --cdm-line: #e3e5e1;
  --cdm-radius: 14px;
  --cdm-map-height: 560px;

  display: block;
  font-family: inherit;
  color: var(--cdm-ink);
  -webkit-font-smoothing: antialiased;
}
* { box-sizing: border-box; }
button, input, select { font: inherit; color: inherit; }

.cdm { background: var(--cdm-surface); border: 1px solid var(--cdm-line); border-radius: var(--cdm-radius); overflow: hidden; }

/* ---------- Search ---------- */
.top { display: flex; gap: 8px; padding: 14px 14px 10px; align-items: center; }
.search { position: relative; flex: 1; min-width: 0; }
.search svg.icon { position: absolute; left: 14px; top: 50%; translate: 0 -50%; width: 18px; height: 18px; color: var(--cdm-muted); pointer-events: none; }
.search input {
  width: 100%; height: 48px; padding: 0 44px 0 42px; border-radius: 999px;
  border: 1.5px solid var(--cdm-line); background: var(--cdm-subtle); font-size: 16px; outline: none;
  transition: border-color .15s, background .15s, box-shadow .15s;
}
.search input:focus { border-color: var(--cdm-green); background: #fff; box-shadow: 0 0 0 4px color-mix(in srgb, var(--cdm-green) 18%, transparent); }
.search input::-webkit-search-cancel-button { display: none; }
.search .clear { position: absolute; right: 8px; top: 50%; translate: 0 -50%; width: 32px; height: 32px; border: 0; border-radius: 50%; background: transparent; cursor: pointer; color: var(--cdm-muted); font-size: 20px; line-height: 1; }
.search .clear:hover { background: var(--cdm-line); }
.search .clear[hidden] { display: none; }

.suggest {
  position: absolute; z-index: 20; left: 0; right: 0; top: calc(100% + 6px); margin: 0; padding: 6px; list-style: none;
  background: #fff; border: 1px solid var(--cdm-line); border-radius: 14px; box-shadow: 0 12px 32px rgb(0 0 0 / .14);
  max-height: 340px; overflow: auto;
}
.suggest[hidden] { display: none; }
.suggest .group { padding: 8px 10px 4px; font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--cdm-muted); }
.suggest .item { display: flex; gap: 10px; align-items: center; padding: 9px 10px; border-radius: 10px; cursor: pointer; font-size: 14.5px; }
.suggest .item[aria-selected="true"], .suggest .item:hover { background: var(--cdm-subtle); }
.suggest .item .dot { width: 10px; height: 10px; border-radius: 3px; flex: none; background: var(--cdm-green-fill); outline: 2px solid var(--cdm-green); outline-offset: -1px; }
.suggest .item .dot.locked { background: var(--cdm-locked); outline-color: var(--cdm-locked-dark); }
.suggest .item .dot.addr { background: none; outline: none; width: 14px; height: 14px; color: var(--cdm-muted); }
.suggest .item .sub { margin-left: auto; color: var(--cdm-muted); font-size: 12.5px; white-space: nowrap; }
.suggest .note { padding: 10px; color: var(--cdm-muted); font-size: 13.5px; }

.lang { height: 48px; min-width: 48px; border-radius: 999px; border: 1.5px solid var(--cdm-line); background: var(--cdm-surface); font-weight: 700; font-size: 13px; cursor: pointer; letter-spacing: .04em; }
.lang:hover { border-color: var(--cdm-muted); }

/* ---------- Filters ---------- */
.filters { display: flex; flex-wrap: wrap; gap: 8px 18px; align-items: center; padding: 0 14px 12px; }
.fgroup { display: flex; align-items: center; gap: 6px; min-width: 0; }
.flabel { font-size: 12px; font-weight: 700; color: var(--cdm-muted); text-transform: uppercase; letter-spacing: .05em; margin-right: 2px; white-space: nowrap; }
.chips { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; }
.chips::-webkit-scrollbar { display: none; }
.chip {
  height: 32px; padding: 0 12px; border-radius: 999px; border: 1.5px solid var(--cdm-line); background: var(--cdm-surface);
  font-size: 13.5px; cursor: pointer; white-space: nowrap; transition: background .12s, border-color .12s, color .12s;
}
.chip:hover { border-color: var(--cdm-muted); }
.chip[aria-pressed="true"] { background: var(--cdm-ink); border-color: var(--cdm-ink); color: #fff; }
.select { height: 32px; border-radius: 999px; border: 1.5px solid var(--cdm-line); background: var(--cdm-surface); padding: 0 10px; font-size: 13.5px; max-width: 220px; cursor: pointer; }
.toggle { display: inline-flex; align-items: center; gap: 8px; font-size: 13.5px; cursor: pointer; user-select: none; }
.toggle input { appearance: none; width: 34px; height: 20px; border-radius: 999px; background: var(--cdm-line); position: relative; cursor: pointer; transition: background .15s; margin: 0; }
.toggle input::after { content: ""; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 50%; background: #fff; box-shadow: 0 1px 2px rgb(0 0 0 / .25); transition: translate .15s; }
.toggle input:checked { background: var(--cdm-locked-dark); }
.toggle input:checked::after { translate: 14px 0; }
.count { margin-left: auto; font-size: 12.5px; color: var(--cdm-muted); white-space: nowrap; }

/* ---------- Map ---------- */
.mapwrap { position: relative; height: var(--cdm-map-height); border-top: 1px solid var(--cdm-line); background: #e9ece8; }
::slotted(.cdm-gmap) { position: absolute !important; inset: 0; }
.status { position: absolute; inset: 0; z-index: 4; display: grid; place-items: center; color: var(--cdm-muted); font-size: 14px; pointer-events: none; }
.status[hidden] { display: none; }

.legend {
  position: absolute; left: 10px; top: 10px; z-index: 2; display: flex; flex-direction: column; gap: 6px;
  background: rgb(255 255 255 / .92); backdrop-filter: blur(6px); border-radius: 10px; padding: 8px 10px; font-size: 12px;
  box-shadow: 0 2px 8px rgb(0 0 0 / .12);
}
.legend .row { display: flex; align-items: center; gap: 8px; }
.legend .sw { width: 16px; height: 12px; border-radius: 3px; border: 2px solid var(--cdm-green); background: color-mix(in srgb, var(--cdm-green-fill) 30%, transparent); }
.legend .sw.locked { border: 2px dashed var(--cdm-locked-dark); background: repeating-linear-gradient(45deg, color-mix(in srgb, var(--cdm-locked) 45%, transparent) 0 2px, transparent 2px 5px); }
.legend .approx { color: var(--cdm-muted); font-size: 11px; max-width: 170px; }
.legend .credit { color: var(--cdm-muted); font-size: 10px; }

/* ---------- Result card ---------- */
.card {
  /* bottom offset keeps Google's logo and terms line visible */
  position: absolute; z-index: 3; left: 12px; right: 60px; bottom: 30px; max-width: 380px; margin-left: auto;
  background: #fff; border-radius: 16px; padding: 16px 16px 14px; box-shadow: 0 12px 36px rgb(0 0 0 / .22);
  border-top: 5px solid var(--cdm-green); animation: rise .22s ease-out;
}
.card[hidden] { display: none; }
.card.locked { border-top-color: var(--cdm-locked-dark); }
.card.outside { border-top-color: var(--cdm-outside); }
@keyframes rise { from { transform: translateY(12px); opacity: 0 } to { transform: none; opacity: 1 } }
.card .x { position: absolute; top: 8px; right: 8px; width: 30px; height: 30px; border: 0; border-radius: 50%; background: transparent; cursor: pointer; font-size: 18px; color: var(--cdm-muted); }
.card .x:hover { background: var(--cdm-subtle); }
.card .head { display: flex; gap: 12px; align-items: center; padding-right: 26px; }
.card .badge { flex: none; width: 38px; height: 38px; border-radius: 12px; display: grid; place-items: center; background: color-mix(in srgb, var(--cdm-green) 14%, #fff); color: var(--cdm-green-dark); }
.card.locked .badge { background: color-mix(in srgb, var(--cdm-locked) 22%, #fff); color: var(--cdm-locked-dark); }
.card.outside .badge { background: color-mix(in srgb, var(--cdm-outside) 12%, #fff); color: var(--cdm-outside); }
.card .badge svg { width: 20px; height: 20px; }
.card .title { font-weight: 800; font-size: 16.5px; line-height: 1.2; }
.card .area { color: var(--cdm-muted); font-size: 13px; margin-top: 2px; }
.card .addr { font-size: 13.5px; margin-top: 10px; }
.card .body { font-size: 13.5px; color: var(--cdm-muted); margin-top: 8px; }
.card dl { display: flex; gap: 8px; margin: 12px 0 0; }
.card dl div { flex: 1; background: var(--cdm-subtle); border-radius: 10px; padding: 8px 10px; }
.card dt { font-size: 11px; color: var(--cdm-muted); text-transform: uppercase; letter-spacing: .05em; font-weight: 700; }
.card dd { margin: 2px 0 0; font-weight: 800; font-size: 15px; font-variant-numeric: tabular-nums; }
.card .cta { display: flex; justify-content: center; align-items: center; gap: 6px; margin-top: 12px; height: 44px; border-radius: 999px; background: var(--cdm-green); color: #fff; text-decoration: none; font-weight: 800; font-size: 15px; }
.card .cta:hover { background: var(--cdm-green-dark); }


@media (max-width: 600px) {
  :host { --cdm-map-height: 480px; }
  .top { padding: 12px 12px 8px; }
  .filters { padding: 0 12px 10px; gap: 8px 12px; }
  .fgroup { max-width: 100%; }
  .count { margin-left: 0; }
  .legend .approx { display: none; }
  .card { left: 8px; right: 8px; bottom: 30px; max-width: none; }
  .legend .credit { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .card { animation: none; }
}
`;

// Styles for elements rendered in the page (outside the Shadow DOM): map badges and the address dot.
export const globalCss = /* css */ `
.cdm-gmap .cdm-pin {
  translate: -50% -50%; display: inline-flex; align-items: center; font-family: inherit; line-height: 1.2; gap: 4px; padding: 3px 8px; border-radius: 999px; cursor: pointer;
  font-size: 12px; font-weight: 700; letter-spacing: .02em; background: #fff; color: var(--cdm-green-dark);
  border: 2px solid var(--cdm-green); box-shadow: 0 2px 6px rgb(0 0 0 / .18);
  transition: transform .15s, opacity .2s;
}
.cdm-gmap .cdm-pin:hover, .cdm-gmap .cdm-pin.selected { transform: scale(1.12); }
.cdm-gmap .cdm-pin.selected { background: var(--cdm-green); color: #fff; }
.cdm-gmap .cdm-pin.locked { color: #fff; background: var(--cdm-locked-dark); border-color: #fff; }
.cdm-gmap .cdm-pin.locked svg { width: 12px; height: 12px; }
.cdm-gmap .cdm-pin.dim { opacity: .3; }
.cdm-gmap.z-small .cdm-pin { font-size: 10.5px; padding: 1px 6px; border-width: 1.5px; }
.cdm-gmap.z-dots .cdm-pin:not(.selected) { font-size: 0; gap: 0; padding: 0; width: 12px; height: 12px; justify-content: center; }
.cdm-gmap.z-dots .cdm-pin.locked:not(.selected) { width: 18px; height: 18px; }
.cdm-gmap.z-dots .cdm-pin.locked svg { width: 10px; height: 10px; }
.cdm-gmap .cdm-pin.hidden { display: none; }

.cdm-gmap .cdm-you { width: 22px; height: 22px; border-radius: 50%; background: var(--cdm-ink); border: 3px solid #fff; box-shadow: 0 2px 8px rgb(0 0 0 / .35); position: relative; }
.cdm-gmap .cdm-you::after { content: ""; position: absolute; inset: -10px; border-radius: 50%; border: 2px solid var(--cdm-ink); opacity: 0; animation: cdm-ping 1.8s ease-out infinite; }
@keyframes cdm-ping { 0% { transform: scale(.4); opacity: .7 } 100% { transform: scale(1.3); opacity: 0 } }

.cdm-gmap .cdm-you { translate: -50% -50%; }
.cdm-gmap .cdm-pin span { pointer-events: none; }
@media (prefers-reduced-motion: reduce) { .cdm-gmap .cdm-you::after { animation: none; } }
`;
