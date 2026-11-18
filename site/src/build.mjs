// Builds the static Crispy Bird site into site/dist.  Run: node src/build.mjs
import { mkdirSync, writeFileSync, copyFileSync, readdirSync, existsSync, rmSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as D from './data.mjs';

const { BRAND, HOURS, AREA_GROUPS, LOCKED_AREAS, CATEGORIES, TAGS, MENU, CHOICES, DEALS, REVIEWS } = D;
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'dist');
const require = createRequire(import.meta.url);
const TABLER = require('@iconify-json/tabler/icons.json');

// ---------------------------------------------------------------- helpers
const esc = (s = '') => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
/** Bilingual inline text: Dutch in the page, English swapped in by app.js. */
const t = (nl, en = nl) => (nl === en ? nl : `<span data-en="${esc(en)}">${nl}</span>`);
/** Bilingual attribute (placeholder, aria-label, alt, title). */
const ta = (attr, nl, en = nl) => `${attr}="${esc(nl)}"${nl === en ? '' : ` data-en-${attr}="${esc(en)}"`}`;
const eur = n => `€${n.toFixed(2).replace('.', ',')}`;
const money = n => `<span class="money" data-v="${n}">${eur(n)}</span>`;
const icon = (name, cls = 'ic') => {
  const i = TABLER.icons[name];
  if (!i) throw new Error('missing icon ' + name);
  return `<svg class="${cls}" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">${i.body}</svg>`;
};
const byId = Object.fromEntries(MENU.map(m => [m.id, m]));
const SIZES = JSON.parse(readFileSync(join(ROOT, 'img', 'w', 'sizes.json'), 'utf8'));
const dim = src => { const [w, h] = SIZES[src.split('/').pop()] || [560, 560]; return `width="${w}" height="${h}"`; };
const year = 2026;

// ---------------------------------------------------------------- shared chrome
const NAV = [
  { href: 'index.html', nl: 'Home', en: 'Home' },
  { href: 'menu.html', nl: 'Menu', en: 'Menu' },
  { href: 'deals.html', nl: 'Deals', en: 'Deals' },
  { href: 'contact.html', nl: 'Contact', en: 'Contact' },
];

const logo = (cls = '') => `<a class="brand ${cls}" href="index.html" aria-label="The Crispy Bird, home">
  <img src="img/logo-192.png" width="44" height="44" alt="">
  <span class="brand-word">The Crispy Bird</span></a>`;

const header = page => `
<a class="skip" href="#main">${t('Naar de inhoud', 'Skip to content')}</a>
<div class="topbar">
  <div class="wrap topbar-in">
    <p class="status" data-status aria-live="polite"><span class="dot" aria-hidden="true"></span><span data-status-text>${t('Openingstijden laden…', 'Loading hours…')}</span></p>
    <div class="topbar-right">
      <div class="mode" role="group" ${ta('aria-label', 'Bezorgen of afhalen', 'Delivery or pickup')}>
        <button type="button" data-mode="delivery" aria-pressed="true">${icon('truck-delivery')}${t('Bezorgen', 'Delivery')}</button>
        <button type="button" data-mode="pickup" aria-pressed="false">${icon('walk')}${t('Afhalen', 'Pickup')}</button>
      </div>
    </div>
  </div>
</div>
<header class="site-header" data-header>
  <div class="wrap header-in">
    ${logo()}
    <nav class="nav" id="nav" ${ta('aria-label', 'Hoofdmenu', 'Main menu')}>
      <ul>${NAV.map(n => `<li><a href="${n.href}"${n.href === page ? ' aria-current="page"' : ''}>${t(n.nl, n.en)}</a></li>`).join('')}</ul>
    </nav>
    <div class="header-actions">
      <button type="button" class="cart-btn" data-cart-open ${ta('aria-label', 'Winkelmand openen', 'Open cart')}>
        ${icon('shopping-bag')}<span class="cart-count" data-cart-count hidden>0</span>
      </button>
      <a class="btn btn-gold btn-order" href="menu.html">${t('Bestel nu', 'Order now')}</a>
      <button type="button" class="burger" data-nav-toggle aria-expanded="false" aria-controls="nav" ${ta('aria-label', 'Menu openen of sluiten', 'Open or close menu')}>${icon('menu-2', 'ic ic-menu')}${icon('x', 'ic ic-x')}</button>
    </div>
  </div>
</header>`;

const hoursRows = () => HOURS.map(h => `<tr data-day="${h.day}"><th scope="row">${t(h.nl, h.en)}</th><td>${h.open ? `${h.open}–${h.close}` : t('Gesloten', 'Closed')}</td></tr>`).join('');

const footer = () => `
<footer class="site-footer">
  <div class="wrap footer-grid">
    <div class="f-brand">
      <img src="img/logo-192.png" width="72" height="72" alt="The Crispy Bird logo" loading="lazy">
      <p class="f-tag">Lekker Crispy.<br>Made to deliver.</p>
      <p class="f-trust">${icon('certificate')}${t('100% halal · gratis bezorging', '100% halal · free delivery')}</p>
      <p class="pay-badge" ${ta('aria-label', 'Online betalen met iDEAL of Wero', 'Pay online with iDEAL or Wero')}><span>iDEAL</span><span aria-hidden="true">|</span><span>Wero</span></p>
    </div>
    <nav ${ta('aria-label', 'Snelle links', 'Quick links')}><h2>${t('Snel naar', 'Quick links')}</h2><ul>${NAV.map(n => `<li><a href="${n.href}">${t(n.nl, n.en)}</a></li>`).join('')}<li><a href="index.html#reviews">Reviews</a></li><li><a href="contact.html#bezorging">${t('Bezorging', 'Delivery')}</a></li></ul></nav>
    <nav ${ta('aria-label', 'Menucategorieën', 'Menu categories')}><h2>Menu</h2><ul>${CATEGORIES.map(c => `<li><a href="menu.html#${c.id}">${t(c.nl, c.en)}</a></li>`).join('')}</ul></nav>
    <div><h2>${t('Bezorggebieden', 'Delivery areas')}</h2><ul class="f-areas">${AREA_GROUPS.map(a => `<li>${t(a.nl.split(':')[0], a.en.split(':')[0])} <span>${t('min.', 'min.')} ${money(a.min)}</span></li>`).join('')}</ul></div>
    <div><h2>${t('Openingstijden', 'Opening hours')}</h2><table class="hours hours-sm"><tbody>${hoursRows()}</tbody></table><p class="f-note">${t('Op zondag en feestdagen kan het iets langer duren.', 'Sundays and public holidays can take a little longer.')}</p></div>
    <div><h2>Contact</h2><address>${BRAND.street}<br>${BRAND.postcode} ${BRAND.city}<br><a href="${BRAND.phoneHref}">${BRAND.phone}</a></address>
      ${BRAND.socials.length ? `<ul class="socials">${BRAND.socials.map(s => `<li><a href="${s.url}" rel="noopener" aria-label="${esc(s.name)}">${icon('brand-' + s.name.toLowerCase())}</a></li>`).join('')}</ul>` : ''}
    </div>
  </div>
  <div class="wrap footer-legal">
    <p>© ${year} The Crispy Bird</p>
    <ul><li><a href="menu.html#allergenen">${t('Allergeneninformatie', 'Allergen information')}</a></li><li><a href="privacy.html">${t('Privacybeleid', 'Privacy policy')}</a></li></ul>
  </div>
</footer>`;

const cartDrawer = () => `
<div class="scrim" data-scrim hidden></div>
<aside class="drawer" id="cart" role="dialog" aria-modal="true" aria-labelledby="cart-title" data-drawer hidden>
  <header class="drawer-head">
    <h2 id="cart-title">${t('Je bestelling', 'Your order')}</h2>
    <button type="button" class="icon-btn" data-cart-close ${ta('aria-label', 'Winkelmand sluiten', 'Close cart')}>${icon('x')}</button>
  </header>
  <div class="mode mode-lg" role="group" ${ta('aria-label', 'Bezorgen of afhalen', 'Delivery or pickup')}>
    <button type="button" data-mode="delivery" aria-pressed="true">${icon('truck-delivery')}${t('Bezorgen', 'Delivery')}</button>
    <button type="button" data-mode="pickup" aria-pressed="false">${icon('walk')}${t('Afhalen', 'Pickup')}</button>
  </div>
  <div class="drawer-body">
    <div class="cart-pc" data-cart-pc></div>
    <ul class="lines" data-lines></ul>
    <div class="empty" data-empty>
      <img src="img/w/logo-line.png" alt="" width="80" height="116">
      <p>${t('Nog leeg. Je bird wacht op je.', 'Still empty. Your bird is waiting.')}</p>
      <a class="btn btn-black" href="menu.html">${t('Naar het menu', 'Go to the menu')}</a>
    </div>
  </div>
  <footer class="drawer-foot" data-foot>
    <div class="minbar" data-minbar><div class="minbar-track"><span data-minbar-fill></span></div><p data-minbar-text></p></div>
    <dl class="sums" data-sums></dl>
    <p class="trust-row">${icon('certificate')}${t('100% halal', '100% halal')}<span aria-hidden="true">·</span>${icon('truck-delivery')}${t('Gratis bezorging', 'Free delivery')}</p>
    <a class="btn btn-gold btn-block" href="afrekenen.html" data-checkout>${t('Afrekenen', 'Checkout')} <span data-checkout-total></span></a>
    <p class="allergy-mini">${icon('alert-triangle')}${t('Allergie? Meld het bij je bestelling.', 'Allergy? Mention it with your order.')}</p>
  </footer>
</aside>`;

const itemModal = () => `
<dialog class="modal" data-modal ${ta('aria-label', 'Kies je opties', 'Choose your options')}>
  <form method="dialog" class="modal-in" data-modal-form>
    <button type="submit" value="cancel" class="icon-btn modal-x" formnovalidate ${ta('aria-label', 'Sluiten', 'Close')}>${icon('x')}</button>
    <div class="modal-media"><img data-modal-img src="" alt="" width="280" height="280"></div>
    <div class="modal-body">
      <h2 data-modal-title></h2>
      <p class="modal-desc" data-modal-desc></p>
      <div data-modal-groups></div>
      <label class="note-field">${t('Opmerking of allergie', 'Note or allergy')}<textarea name="note" rows="2" ${ta('placeholder', 'Bijv. zonder augurk, of een allergie', 'E.g. no pickles, or an allergy')}></textarea></label>
    </div>
    <div class="modal-foot">
      <div class="stepper" data-modal-qty><button type="button" data-q="-1" ${ta('aria-label', 'Minder', 'Fewer')}>${icon('minus')}</button><output>1</output><button type="button" data-q="1" ${ta('aria-label', 'Meer', 'More')}>${icon('plus')}</button></div>
      <button type="submit" value="add" class="btn btn-gold" data-modal-add>${t('Voeg toe', 'Add')} <span data-modal-price></span></button>
    </div>
  </form>
</dialog>`;

const mobileBar = () => `
<div class="lang-fab"><button type="button" class="lang" data-lang-toggle aria-label="Switch to English" data-en-aria-label="Wissel naar Nederlands">${icon('world')}<span data-lang-label>EN</span></button></div>
<div class="mbar" data-mbar>
  <button type="button" class="lang lang-mbar" data-lang-toggle aria-label="Switch to English" data-en-aria-label="Wissel naar Nederlands">${icon('world')}<span data-lang-label>EN</span></button>
  <a class="btn btn-gold mbar-order" href="menu.html" data-mbar-order>${icon('flame')}${t('Bestel nu', 'Order now')}</a>
  <button type="button" class="mbar-cart" data-cart-open ${ta('aria-label', 'Winkelmand openen', 'Open cart')}>${icon('shopping-bag')}<span data-cart-total>${eur(0)}</span><span class="cart-count" data-cart-count hidden>0</span></button>
</div>
<div class="toast" data-toast role="status" aria-live="polite" hidden></div>`;

// JSON the client needs (menu, choices, areas, hours) - small and shared by every page.
const clientData = JSON.stringify({
  menu: MENU.map(({ id, cat, name, desc, price, was, img, tags, options, promo, size }) => ({ id, cat, name, desc, price, was, img, tags, options, promo, size })),
  choices: CHOICES, areas: AREA_GROUPS, locked: LOCKED_AREAS, hours: HOURS, pickupMin: D.PICKUP_MIN, orderSystem: BRAND.orderSystem,
  tags: TAGS,
}).replace(/</g, '\\u003c');

// ---------------------------------------------------------------- SEO
const restaurantLd = (withMenu = false) => {
  const days = { 0: 'Sunday', 1: 'Monday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday' };
  const ld = {
    '@context': 'https://schema.org', '@type': 'Restaurant', name: BRAND.name, url: BRAND.url,
    image: BRAND.url + 'img/banner.webp', logo: BRAND.url + 'img/logo-512.png', telephone: BRAND.phone,
    servesCuisine: ['Fried chicken', 'Burgers', 'Halal'], priceRange: '€€',
    address: { '@type': 'PostalAddress', streetAddress: BRAND.street, postalCode: BRAND.postcode, addressLocality: BRAND.city, addressCountry: BRAND.country },
    geo: { '@type': 'GeoCoordinates', latitude: BRAND.geo.lat, longitude: BRAND.geo.lng },
    openingHoursSpecification: HOURS.filter(h => h.open).map(h => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: 'https://schema.org/' + days[h.day], opens: h.open, closes: h.close })),
    aggregateRating: { '@type': 'AggregateRating', ratingValue: BRAND.rating.value, reviewCount: BRAND.rating.count, bestRating: 5 },
    acceptsReservations: false, hasMenu: BRAND.url + 'menu.html',
  };
  if (withMenu) {
    ld.hasMenu = {
      '@type': 'Menu', name: 'The Crispy Bird menu', inLanguage: 'nl',
      hasMenuSection: CATEGORIES.map(c => ({
        '@type': 'MenuSection', name: c.nl,
        hasMenuItem: MENU.filter(m => m.cat === c.id).map(m => ({
          '@type': 'MenuItem', name: m.name + (m.size ? ' ' + m.size : ''), description: m.desc.nl, image: BRAND.url + m.img,
          offers: { '@type': 'Offer', price: m.price.toFixed(2), priceCurrency: 'EUR' },
          ...(m.tags.includes('vega') || m.tags.includes('vegan') ? { suitableForDiet: 'https://schema.org/' + (m.tags.includes('vegan') ? 'VeganDiet' : 'VegetarianDiet') } : {}),
          ...(m.tags.includes('halal') ? { suitableForDiet: 'https://schema.org/HalalDiet' } : {}),
        })),
      })),
    };
  }
  return `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`;
};

const layout = ({ page, title, description, body, ld = '', bodyClass = '' }) => `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${BRAND.url}${page === 'index.html' ? '' : page}">
<meta name="theme-color" content="#c8902a">
<meta property="og:type" content="restaurant.restaurant">
<meta property="og:site_name" content="The Crispy Bird">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${BRAND.url}img/banner.webp">
<meta property="og:locale" content="nl_NL">
<meta property="og:locale:alternate" content="en_GB">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="img/favicon.ico" sizes="any">
<link rel="apple-touch-icon" href="img/apple-touch-icon.png">
<link rel="manifest" href="site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800&family=Bowlby+One&family=Permanent+Marker&display=swap">
<link rel="stylesheet" href="assets/app.css">
${ld}
</head>
<body class="${bodyClass}">
${header(page)}
<main id="main" tabindex="-1">
${body}
</main>
${footer()}
${cartDrawer()}
${itemModal()}
${mobileBar()}
<script type="application/json" id="site-data">${clientData}</script>
<script src="assets/app.js" defer></script>
</body>
</html>`;

// ---------------------------------------------------------------- components
const tagList = m => m.tags.length ? `<ul class="tags">${m.tags.map(k => `<li title="${esc(TAGS[k].nl)}" data-en-title="${esc(TAGS[k].en)}" class="tag tag-${k}">${icon(TAGS[k].icon)}<span class="sr">${t(TAGS[k].nl, TAGS[k].en)}</span></li>`).join('')}</ul>` : '';

const dishCard = (m, { big = false } = {}) => {
  const badgeTxt = m.promo === 'tenders11' ? '1+1' : m.was ? `-${Math.round((1 - m.price / m.was) * 100)}%` : '';
  const badge = badgeTxt ? `<span class="badge"><span>${badgeTxt}</span></span>` : '';
  const name = m.name + (m.size ? ` <span class="size">${m.size}</span>` : '');
  return `<article class="dish${big ? ' dish-big' : ''}" data-cat="${m.cat}" data-reveal>
  <div class="dish-media">${badge}<img src="${m.img}" alt="${esc(m.name)}: ${esc(m.desc.nl)}" data-en-alt="${esc(m.name)}: ${esc(m.desc.en)}" ${dim(m.img)} loading="lazy" decoding="async"></div>
  <div class="dish-body">
    <h3>${name}</h3>
    <p>${t(m.desc.nl, m.desc.en)}</p>
    ${tagList(m)}
    <div class="dish-foot">
      <p class="price">${money(m.price)}${m.was ? ` <s ${ta('aria-label', 'was ' + eur(m.was), 'was ' + eur(m.was))}>${money(m.was)}</s>` : ''}</p>
      <button type="button" class="add" data-add="${m.id}" aria-label="${esc(m.name)} ${m.options ? 'kiezen' : 'toevoegen'}" data-en-aria-label="${m.options ? 'Choose' : 'Add'} ${esc(m.name)}">${icon('plus')}<span>${m.options ? t('Kies', 'Choose') : t('Voeg toe', 'Add')}</span></button>
    </div>
  </div>
</article>`;
};

const pageHead = (kicker, title, sub = '') => `
<section class="page-head">
  <div class="wrap">
    <p class="kicker">${kicker}</p>
    <h1>${title}</h1>
    ${sub ? `<p class="lede">${sub}</p>` : ''}
  </div>
  <div class="crunch-edge" aria-hidden="true"></div>
</section>`;

const postcodeForm = (id, big = false) => `
<form class="pc-form${big ? ' pc-big' : ''}" data-pc-form novalidate>
  <label for="${id}">${t('Bezorgen we bij jou?', 'Do we deliver to you?')}</label>
  <div class="pc-row">
    ${icon('map-pin')}
    <input id="${id}" name="postcode" inputmode="text" autocomplete="postal-code" maxlength="7" ${ta('placeholder', 'Je postcode, bijv. 3431 BM', 'Your postcode, e.g. 3431 BM')} required>
    <button type="submit" class="btn btn-black">${t('Check', 'Check')}</button>
  </div>
  <p class="pc-result" data-pc-result aria-live="polite"></p>
</form>`;

const stars = (n, label = true) => `<span class="stars"${label ? ' role="img"' : ''} ${label ? ta('aria-label', `${n} van 5 sterren`, `${n} out of 5 stars`) : 'aria-hidden="true"'}>${[1, 2, 3, 4, 5].map(i => icon(i <= n ? 'star-filled' : 'star', 'ic star' + (i <= n ? ' on' : ''))).join('')}</span>`;

const fmtDate = (iso, lang) => new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : 'nl-NL', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso + 'T12:00:00'));

const reviewCard = r => `<article class="review">
  <header><p class="r-name">${esc(r.name)}</p><p class="r-date"><time datetime="${r.date}">${t(fmtDate(r.date, 'nl'), fmtDate(r.date, 'en'))}</time></p></header>
  <blockquote>${esc(r.text).replace(/\n\n/g, '<br><br>')}</blockquote>
  <dl class="r-scores">${Object.entries(r.scores).map(([k, v]) => `<div><dt>${k === 'kwaliteit' ? t('Kwaliteit', 'Quality') : t('Bezorging', 'Delivery')}</dt><dd>${stars(v)}</dd></div>`).join('')}</dl>
  <p class="r-src">${r.source === 'Google' ? 'Via Google' : t('Via bestelsysteem', 'Via ordering system')}</p>
  ${r.mentions ? `<p class="r-ordered">${t('Noemt', 'Mentions')}: <a href="menu.html#burgers">${byId[r.mentions].name}</a></p>` : ''}
</article>`;

const ratingBadge = () => `<div class="rating-badge">
  <p class="rb-num"><span>${BRAND.rating.value}</span><small>/5</small></p>
  <div>${stars(BRAND.rating.value)}<p class="rb-count">${t(`Op basis van ${BRAND.rating.count} reviews`, `Based on ${BRAND.rating.count} reviews`)}</p></div>
</div>`;

// ---------------------------------------------------------------- pages
const pages = {};

pages['index.html'] = {
  title: 'The Crispy Bird · Crispy chicken burgers & tenders in Nieuwegein',
  description: 'Lekker Crispy. Made to deliver. 100% halal kippendij, 24 uur in karnemelk, dubbel gefrituurd. Gratis bezorging in Nieuwegein, IJsselstein, Utrecht-Zuid en Vianen.',
  ld: restaurantLd(),
  bodyClass: 'home',
  body: `
<section class="hero">
  <div class="wrap hero-in">
    <div class="hero-copy">
      <p class="kicker kicker-dark">${t('Nieuwegein · 100% halal', 'Nieuwegein · 100% halal')}</p>
      <h1 class="hero-title"><span class="ht-1">Lekker</span> <span class="ht-2">Crispy.</span> <span class="ht-3">Made to deliver.</span></h1>
      <p class="hero-sub">${t('Kippendij, 24 uur in karnemelk, twee keer gefrituurd. Gratis bij je thuisgebracht.', 'Chicken thigh, 24 hours in buttermilk, fried twice. Delivered to your door for free.')}</p>
      ${postcodeForm('pc-hero', true)}
      <div class="hero-cta">
        <a class="btn btn-black btn-lg" href="menu.html" data-set-mode="delivery">${t('Bestel nu', 'Order now')} ${icon('arrow-right')}</a>
        <a class="btn btn-line btn-lg" href="menu.html" data-set-mode="pickup">${icon('walk')}${t('Afhalen', 'Pickup')}</a>
      </div>
    </div>
    <div class="hero-art" aria-hidden="false">
      <div class="plate"><img src="img/6ae75cf252a54_Crispy_Chicken_Burger_on_Wooden_Board.webp" ${dim('6ae75cf252a54_Crispy_Chicken_Burger_on_Wooden_Board.webp')} alt="Classic Chicken Burger met krokante kippendij op een houten plank" data-en-alt="Classic Chicken Burger with crispy chicken thigh on a wooden board" fetchpriority="high"></div>
      <svg class="stamp" viewBox="0 0 200 200" aria-hidden="true"><defs><path id="circ" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0"/></defs><text textLength="488" lengthAdjust="spacing"><textPath href="#circ" textLength="488" lengthAdjust="spacing">100% HALAL · 100% KIPPENDIJ · 2× GEFRITUURD · </textPath></text><image href="img/w/logo-line.png" x="72" y="56" width="58" height="84"/></svg>
      <a class="price-tag" href="menu.html#burgers" ${ta('aria-label', 'Classic Chicken Burger, €9,99', 'Classic Chicken Burger, €9.99')}><span class="pt-name">Classic</span><strong class="pt-price">${money(9.99)}</strong></a>
    </div>
  </div>
</section>

<section class="usp" ${ta('aria-label', 'Waarom The Crispy Bird', 'Why The Crispy Bird')}>
  <div class="usp-track">${[0, 1].map(k => `<ul${k ? ' aria-hidden="true"' : ''}>${[
    ['certificate', '100% halal', '100% halal'], ['flame', '100% kippendij', '100% chicken thigh'], ['clock-hour-4', '24u gemarineerd in karnemelk', '24h buttermilk marinade'],
    ['flame-filled', 'Dubbel gefrituurd', 'Double-fried'], ['truck-delivery', 'Gratis bezorging', 'Free delivery']].map(([i, nl, en]) => `<li>${icon(i)}${t(nl, en)}</li>`).join('')}</ul>`).join('')}</div>
</section>

<section class="sec sec-cream">
  <div class="wrap">
    <header class="sec-head"><h2>${t('Deals die knallen', 'Deals that crunch')}</h2><a class="link-arrow" href="deals.html">${t('Alle deals', 'All deals')} ${icon('arrow-right')}</a></header>
    <div class="deal-grid">${DEALS.map(dealCard).join('')}</div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <header class="sec-head"><div><p class="kicker">${t('Meest besteld', 'Most ordered')}</p><h2>${t('Onze hardlopers', 'Our bestsellers')}</h2></div><a class="link-arrow" href="menu.html">${t('Hele menu', 'Full menu')} ${icon('arrow-right')}</a></header>
    <div class="dish-grid dish-grid-3">${['tenders', 'meal-deal-small', 'meal-deal'].map(id => dishCard(byId[id], { big: true })).join('')}</div>
  </div>
</section>

<section class="sec sec-black how">
  <div class="wrap">
    <h2>${t('Zo simpel is het', "It's that simple")}</h2>
    <ol class="steps">
      <li data-reveal><span class="step-n">1</span><div class="step-art"><img src="img/7465ef9251ed03559889c0296b034e7b.webp" ${dim('7465ef9251ed03559889c0296b034e7b.webp')} alt="" loading="lazy"></div><h3><a class="step-link" href="menu.html">${t('Kies je bird', 'Pick your bird')}</a></h3><p>${t('Burger, tenders of een volle combo.', 'Burger, tenders or a full combo.')}</p><span class="step-go" aria-hidden="true">${t('Naar het menu', 'To the menu')} ${icon('arrow-right')}</span></li>
      <li data-reveal><span class="step-n">2</span><div class="step-art step-pay"><span>iDEAL</span><span>Wero</span></div><h3><a class="step-link" href="afrekenen.html" data-step-checkout>${t('Bestel & betaal met iDEAL', 'Order & pay with iDEAL')}</a></h3><p>${t('Of met Wero. Online, in een paar tikken.', 'Or with Wero. Online, in a few taps.')}</p><span class="step-go" aria-hidden="true">${t('Naar afrekenen', 'To checkout')} ${icon('arrow-right')}</span></li>
      <li data-reveal><span class="step-n">3</span><div class="step-art step-door">${icon('truck-delivery', 'ic ic-xl')}</div><h3><a class="step-link" href="contact.html#bezorging">${t('Crispy aan de deur', 'Crispy at your door')}</a></h3><p>${t('Gratis bezorgd. Of haal hem zelf op aan de Kruyderlaan.', 'Free delivery. Or pick it up yourself on Kruyderlaan.')}</p><span class="step-go" aria-hidden="true">${t('Bekijk de bezorgkaart', 'See the delivery map')} ${icon('arrow-right')}</span></li>
    </ol>
  </div>
</section>

<section class="sec reviews-sec" id="reviews" aria-labelledby="rev-h">
  <div class="wrap">
    <header class="sec-head rev-head">
      <div><p class="kicker">Reviews</p><h2 id="rev-h">${t('Wat bestellers zeggen', 'What customers say')}</h2></div>
      ${ratingBadge()}
    </header>
    <div class="carousel" data-carousel>
      <ul class="rv-track" data-track tabindex="0" ${ta('aria-label', 'Reviews, scroll horizontaal', 'Reviews, scroll sideways')}>${REVIEWS.map(r => `<li>${reviewCard(r)}</li>`).join('')}</ul>
      <div class="rv-controls">
        <p class="fine">${t('Echte reviews van klanten, ongewijzigd.', 'Real customer reviews, unedited.')} ${t('Na elke bestelling krijg je een uitnodiging per e-mail.', 'After every order you get an e-mail invitation.')}</p>
        <div class="rv-btns">
          <a class="btn btn-gold" href="${BRAND.orderSystem}beoordelingen" rel="noopener">${icon('star')}${t('Laat een review achter', 'Leave a review')}</a>
          <button type="button" class="round-btn" data-prev ${ta('aria-label', 'Vorige reviews', 'Previous reviews')}>${icon('arrow-right', 'ic flip')}</button>
          <button type="button" class="round-btn" data-next-rv ${ta('aria-label', 'Volgende reviews', 'Next reviews')}>${icon('arrow-right')}</button>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="final-cta">
  <div class="wrap final-in">
    <h2>${t('Honger? Je crispy bird is onderweg.', 'Hungry? Your crispy bird is on its way.')}</h2>
    <a class="btn btn-gold btn-lg" href="menu.html">${t('Bestel nu', 'Order now')} ${icon('arrow-right')}</a>
    <img class="final-img" src="img/banner.webp" width="889" height="667" alt="Tafel vol crispy chicken burgers, friet en dips" data-en-alt="A table full of crispy chicken burgers, fries and dips" loading="lazy">
  </div>
</section>`,
};

function dealCard(d) {
  const m = byId[d.item];
  return `<article class="deal" data-reveal>
    <div class="deal-media"><span class="deal-badge"><span>${t(d.badge.nl, d.badge.en)}</span></span><img src="${d.img}" alt="" ${dim(d.img)} loading="lazy"></div>
    <div class="deal-body">
      <p class="deal-exp" data-expires="${d.expires || ''}">${icon('clock')}<span>${d.expires ? '' : t('Tijdelijk', 'Limited time')}</span></p>
      <h3>${t(d.title.nl, d.title.en)}</h3>
      <p class="deal-text">${t(d.body.nl, d.body.en)}</p>
      <button type="button" class="btn btn-gold" data-add="${m.id}">${icon('plus')}${t('Voeg toe', 'Add')}</button>
    </div>
  </article>`;
}

pages['menu.html'] = {
  title: 'Menu · The Crispy Bird Nieuwegein',
  description: 'Bekijk het menu van The Crispy Bird: crispy chicken burgers, tenders, combo deals, sides, dips en drankjes. Bestel online en betaal met iDEAL of Wero.',
  ld: restaurantLd(true),
  bodyClass: 'menu-page dark',
  body: `
${pageHead(t('Vers gefrituurd, elke bestelling', 'Fried fresh, every order'), 'Menu', t('Alles 100% halal. Combo’s nu 20% goedkoper en Tenders 1+1.', 'Everything 100% halal. Combos 20% off and Tenders 1+1.'))}
<nav class="tabs" data-tabs ${ta('aria-label', 'Menucategorieën', 'Menu categories')}>
  <div class="wrap"><ul>${CATEGORIES.map((c, i) => `<li><a href="#${c.id}"${i === 0 ? ' aria-current="true"' : ''}>${t(c.nl, c.en)}</a></li>`).join('')}</ul></div>
</nav>
<div class="wrap menu-wrap">
  <p class="allergy-banner" role="note">${icon('alert-triangle')}<span>${t('<strong>Allergie?</strong> Vermeld het altijd bij je bestelling. Kruisbesmetting kunnen we in onze keuken niet volledig uitsluiten.', '<strong>Allergy?</strong> Always mention it with your order. We cannot fully rule out cross-contamination in our kitchen.')}</span></p>
  ${CATEGORIES.map(c => `<section class="menu-sec" id="${c.id}" data-cat="${c.id}" aria-labelledby="h-${c.id}">
    <h2 id="h-${c.id}">${t(c.nl, c.en)}</h2>
    <div class="dish-grid">${MENU.filter(m => m.cat === c.id).map(m => dishCard(m)).join('')}</div>
  </section>`).join('')}
  <section class="menu-sec allergen-sec" id="allergenen" aria-labelledby="h-all">
    <h2 id="h-all">${t('Allergenen & dieet', 'Allergens & diet')}</h2>
    <ul class="legend">${Object.entries(TAGS).map(([k, v]) => `<li class="tag tag-${k}">${icon(v.icon)}<span>${t(v.nl, v.en)}</span></li>`).join('')}</ul>
    <p>${t('De iconen tonen de belangrijkste allergenen en dieetinformatie per gerecht. We werken met verse ingrediënten in één keuken en één frituur: <strong>kruisbesmetting kunnen we niet volledig uitsluiten.</strong> Heb je een allergie? Zet het in de opmerking bij je bestelling of bel ons even op', 'The icons show the main allergens and diet information per dish. We cook with fresh ingredients in one kitchen and one fryer: <strong>we cannot fully rule out cross-contamination.</strong> Have an allergy? Add it as a note to your order or give us a call on')} <a href="${BRAND.phoneHref}">${BRAND.phone}</a>.</p>
  </section>
</div>`,
};

pages['deals.html'] = {
  title: 'Deals · The Crispy Bird',
  bodyClass: 'dark',
  description: "Actuele deals bij The Crispy Bird: 20% korting op combo's en 1+1 Chicken Tenders met gratis dipsaus. Meld je aan voor exclusieve kortingen.",
  ld: restaurantLd(),
  body: `
${pageHead(t('Meer crunch voor minder', 'More crunch for less'), 'Deals', t('De korting zit al in de prijs. Gewoon toevoegen en klaar.', 'The discount is already in the price. Just add it and go.'))}
<section class="sec">
  <div class="wrap">
    <div class="deal-grid deal-grid-page">${DEALS.map(dealCard).join('')}</div>
    <h2 class="sub-h">${t('Combo’s in de aanbieding', 'Combos on offer')}</h2>
    <div class="dish-grid">${MENU.filter(m => m.was).map(m => dishCard(m)).join('')}</div>
  </div>
</section>
<section class="sec sec-cream">
  <div class="wrap two-col">
    <div class="promo-explainer" data-reveal>
      <h2>${t('Kortingscode?', 'Got a promo code?')}</h2>
      <ol class="mini-steps">
        <li><strong>${t('Vul je mand', 'Fill your cart')}</strong> ${t('en klik op Afrekenen.', 'and click Checkout.')}</li>
        <li><strong>${t('Stap 2: Betalen', 'Step 2: Payment')}</strong> ${t('heeft een veld “Kortingscode”. Vul hem daar in.', 'has a “Promo code” field. Enter it there.')}</li>
        <li><strong>${t('Klaar.', 'Done.')}</strong> ${t('De korting zie je meteen in je totaal.', 'You will see the discount in your total straight away.')}</li>
      </ol>
      <p class="fine">${t('Eén code per bestelling. Niet te combineren met de 1+1 Tenders-actie, tenzij de code dat zegt.', 'One code per order. Cannot be combined with the Tenders 1+1 deal unless the code says so.')}</p>
    </div>
    <form class="newsletter" data-newsletter data-reveal novalidate>
      <h2>${t('Deals als eerste in je inbox', 'Get deals first, in your inbox')}</h2>
      <p>${t('Exclusieve kortingen voor abonnees. Hooguit twee mails per maand, afmelden kan altijd.', 'Exclusive discounts for subscribers. Two e-mails a month at most, unsubscribe any time.')}</p>
      <label for="nl-email">${t('E-mailadres', 'E-mail address')}</label>
      <div class="nl-row"><input id="nl-email" type="email" name="email" autocomplete="email" required ${ta('placeholder', 'jij@voorbeeld.nl', 'you@example.com')}><button class="btn btn-gold" type="submit">${t('Aanmelden', 'Sign up')}</button></div>
      <p class="form-msg" data-form-msg aria-live="polite"></p>
    </form>
  </div>
</section>`,
};

pages['contact.html'] = {
  title: 'Contact & bezorging · The Crispy Bird',
  description: 'The Crispy Bird, Kruyderlaan 3a, 3431 BM Nieuwegein. Bel +31 6 26469115. Gratis bezorging in Nieuwegein, IJsselstein, Utrecht-Zuid en Vianen. Check je adres op de kaart.',
  ld: restaurantLd(),
  bodyClass: 'contact-page',
  body: `
${pageHead(t('Contact & bezorging', 'Contact & delivery'), t('Bezorgen we bij jou?', 'Do we deliver to you?'), t('Zoek je adres op de kaart. Bezorgen is overal gratis, het minimum verschilt per wijk.', 'Find your address on the map. Delivery is free everywhere; the minimum differs per area.'))}
<section class="hub-sec" id="bezorging">
  <div class="wrap">
    <div class="hub">
      <div class="hub-map">
        <crispy-delivery-map lang="nl" order-url="menu.html" store="${BRAND.geo.lat},${BRAND.geo.lng}" store-label="The Crispy Bird" store-icon="img/logo-192.png" hide-lang${BRAND.googleMapsKey ? ` google-maps-key="${esc(BRAND.googleMapsKey)}"` : ''}></crispy-delivery-map>
      </div>
      <aside class="hub-side" ${ta('aria-label', 'Contactgegevens', 'Contact details')}>
        <section class="hub-block">
          <h2>${t('Hier zitten we', 'Find us here')}</h2>
          <address>${BRAND.street}<br>${BRAND.postcode} ${BRAND.city}</address>
          <div class="hub-actions">
            <a class="btn btn-gold" href="${BRAND.phoneHref}">${icon('phone')}${BRAND.phone}</a>
            <a class="btn btn-line" href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${BRAND.street}, ${BRAND.postcode} ${BRAND.city}`)}" rel="noopener">${icon('route')}${t('Route', 'Directions')}</a>
          </div>
          <p class="hub-note">${icon('walk')}<span>${t('Afhalen? Kies “Afhalen” en een tijd bij het bestellen. Je bestelling staat klaar op de Kruyderlaan 3a.', 'Picking up? Choose “Pickup” and a time when you order. Your order will be ready at Kruyderlaan 3a.')}</span></p>
        </section>
        <section class="hub-block">
          <h2>${t('Open & bezorging', 'Open & delivery')}</h2>
          <table class="hours"><tbody>${hoursRows()}</tbody></table>
          <p class="fine">${t('Op zondag en feestdagen kan het iets langer duren.', 'Sundays and public holidays can take a little longer.')}</p>
        </section>
        <section class="hub-block">
          <h2>${t('Minimum per wijk', 'Minimum per area')}</h2>
          <ul class="mins">${AREA_GROUPS.map(a => `<li><span>${t(a.nl, a.en)}<small>${a.codes.length > 4 ? `${a.codes[0]}–${a.codes.at(-1)}` : a.codes.join(', ')}</small></span><strong>${money(a.min)}</strong></li>`).join('')}
          ${LOCKED_AREAS.map(a => `<li class="locked"><span>${icon('lock')}${t(a.nl, a.en)}<small>${a.code}</small></span><strong>${t('Tijdelijk niet', 'Paused')}</strong></li>`).join('')}</ul>
        </section>
      </aside>
    </div>
  </div>
</section>
<script src="assets/map/crispy-delivery-map.js" defer></script>`,
};

pages['afrekenen.html'] = {
  title: 'Afrekenen · The Crispy Bird',
  description: 'Rond je bestelling bij The Crispy Bird af en betaal met iDEAL of Wero.',
  bodyClass: 'checkout-page',
  body: `
${pageHead(t('Bijna crispy', 'Almost crispy'), t('Afrekenen', 'Checkout'))}
<section class="sec">
  <div class="wrap checkout">
    <form class="co-form" data-checkout-form novalidate>
      <ol class="co-steps" aria-label="Stappen">
        <li aria-current="step" data-step-dot="1">${t('Gegevens', 'Details')}</li><li data-step-dot="2">${t('Betalen', 'Payment')}</li><li data-step-dot="3">${t('Bevestigen', 'Confirm')}</li>
      </ol>
      <fieldset data-step="1">
        <legend>${t('1. Je gegevens', '1. Your details')}</legend>
        <div class="field"><label for="co-name">${t('Naam', 'Name')}</label><input id="co-name" name="name" autocomplete="name" required></div>
        <div class="field"><label for="co-phone">${t('Telefoon', 'Phone')}</label><input id="co-phone" name="phone" type="tel" autocomplete="tel" required></div>
        <div class="field field-wide"><label for="co-email">${t('E-mail (voor je bevestiging)', 'E-mail (for your confirmation)')}</label><input id="co-email" name="email" type="email" autocomplete="email" required></div>
        <div class="delivery-only field-wide fields">
          <div class="field"><label for="co-street">${t('Straat en huisnummer', 'Street and number')}</label><input id="co-street" name="street" autocomplete="street-address" required></div>
          <div class="field"><label for="co-pc">${t('Postcode', 'Postcode')}</label><input id="co-pc" name="postcode" autocomplete="postal-code" required data-co-pc></div>
        </div>
        <div class="field field-wide"><label for="co-time">${t('Wanneer?', 'When?')}</label><select id="co-time" name="time" data-co-time></select></div>
        <div class="field field-wide"><label for="co-note">${t('Opmerking of allergie', 'Note or allergy')}</label><textarea id="co-note" name="note" rows="2"></textarea></div>
        <button type="button" class="btn btn-black" data-next="2">${t('Naar betalen', 'Continue to payment')} ${icon('arrow-right')}</button>
      </fieldset>
      <fieldset data-step="2" hidden>
        <legend>${t('2. Betalen', '2. Payment')}</legend>
        <div class="field field-wide"><label for="co-code">${t('Kortingscode', 'Promo code')}</label><div class="nl-row"><input id="co-code" name="code" autocomplete="off" data-co-code><button type="button" class="btn btn-line" data-apply-code>${t('Toepassen', 'Apply')}</button></div><p class="form-msg" data-code-msg aria-live="polite"></p></div>
        <div class="pay-options field-wide" role="radiogroup" aria-labelledby="pay-label">
          <p id="pay-label" class="label">${t('Betaalmethode', 'Payment method')}</p>
          <label class="pay"><input type="radio" name="pay" value="ideal" checked><span>iDEAL</span></label>
          <label class="pay"><input type="radio" name="pay" value="wero"><span>Wero</span></label>
        </div>
        <div class="co-nav"><button type="button" class="btn btn-line" data-next="1">${t('Terug', 'Back')}</button><button type="button" class="btn btn-black" data-next="3">${t('Naar overzicht', 'Review order')} ${icon('arrow-right')}</button></div>
      </fieldset>
      <fieldset data-step="3" hidden>
        <legend>${t('3. Bevestigen', '3. Confirm')}</legend>
        <div class="co-review" data-co-review></div>
        <p class="allergy-banner">${icon('alert-triangle')}<span>${t('Allergie? Zet het in de opmerking. Kruisbesmetting kunnen we niet volledig uitsluiten.', 'Allergy? Put it in the note. We cannot fully rule out cross-contamination.')}</span></p>
        <div class="co-nav"><button type="button" class="btn btn-line" data-next="2">${t('Terug', 'Back')}</button><button type="submit" class="btn btn-gold btn-lg">${t('Bestellen en betalen', 'Order and pay')}</button></div>
        <p class="form-msg" data-co-msg aria-live="polite"></p>
      </fieldset>
    </form>
    <aside class="co-summary" ${ta('aria-label', 'Je bestelling', 'Your order')}>
      <h2>${t('Je bestelling', 'Your order')}</h2>
      <ul class="lines lines-static" data-co-lines></ul>
      <dl class="sums" data-co-sums></dl>
      <p class="trust-row">${icon('certificate')}100% halal<span aria-hidden="true">·</span>${icon('truck-delivery')}${t('Gratis bezorging', 'Free delivery')}</p>
    </aside>
  </div>
</section>`,
};

pages['privacy.html'] = {
  title: 'Privacybeleid · The Crispy Bird',
  description: 'Hoe The Crispy Bird omgaat met je gegevens.',
  body: `
${pageHead('Privacy', t('Privacybeleid', 'Privacy policy'))}
<section class="sec"><div class="wrap prose">
  <div class="draft-note" role="note">${icon('info-circle')}<span>${t('Concept. De eigenaar moet dit laten controleren voordat de site live gaat.', 'Draft. The owner must have this reviewed before the site goes live.')}</span></div>
  <p>${t('We gebruiken je naam, telefoonnummer, e-mailadres en adres alleen om je bestelling te maken, te bezorgen en je een bevestiging en reviewuitnodiging te sturen. Betalingen lopen via iDEAL of Wero; wij zien je bankgegevens niet.', 'We only use your name, phone number, e-mail address and address to prepare and deliver your order, and to send you a confirmation and a review invitation. Payments go through iDEAL or Wero; we never see your bank details.')}</p>
  <p>${t('Deze site bewaart je winkelmand, taalkeuze en postcode alleen in je eigen browser. Vragen? Bel', 'This site keeps your cart, language choice and postcode only in your own browser. Questions? Call')} <a href="${BRAND.phoneHref}">${BRAND.phone}</a>.</p>
</div></section>`,
};

// ---------------------------------------------------------------- write
if (existsSync(OUT)) rmSync(OUT, { recursive: true });
mkdirSync(join(OUT, 'img'), { recursive: true });
mkdirSync(join(OUT, 'assets', 'map'), { recursive: true });
for (const [file, p] of Object.entries(pages)) writeFileSync(join(OUT, file), layout({ page: file, ...p }));
for (const f of readdirSync(join(ROOT, 'img', 'w'))) copyFileSync(join(ROOT, 'img', 'w', f), join(OUT, 'img', f));
mkdirSync(join(OUT, 'img', 'w'), { recursive: true });
copyFileSync(join(ROOT, 'img', 'w', 'logo-line.png'), join(OUT, 'img', 'w', 'logo-line.png'));
for (const f of ['app.css', 'app.js']) copyFileSync(join(ROOT, 'src', 'assets', f), join(OUT, 'assets', f));
// Delivery map widget (built in the parent project) + its data.
const MAP = join(ROOT, '..', 'dist');
for (const f of ['crispy-delivery-map.js', 'areas.csv', 'boundaries.geojson']) copyFileSync(join(MAP, f), join(OUT, 'assets', 'map', f));
writeFileSync(join(OUT, 'site.webmanifest'), JSON.stringify({ name: 'The Crispy Bird', short_name: 'Crispy Bird', start_url: 'index.html', display: 'standalone', background_color: '#14110c', theme_color: '#c8902a', icons: [{ src: 'img/logo-192.png', sizes: '192x192', type: 'image/png' }, { src: 'img/logo-512.png', sizes: '512x512', type: 'image/png' }] }, null, 1));
writeFileSync(join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /afrekenen.html\nSitemap: ${BRAND.url}sitemap.xml\n`);
writeFileSync(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${Object.keys(pages).filter(p => p !== 'afrekenen.html').map(p => `  <url><loc>${BRAND.url}${p === 'index.html' ? '' : p}</loc></url>`).join('\n')}\n</urlset>\n`);
console.log('built', Object.keys(pages).length, 'pages into', OUT);
