// Single source of truth for the site: menu, prices, hours, delivery areas, deals.
// Prices are exactly as supplied by the owner (brief, Nov 2026). Allergen tags come from the
// current ordering site (bestellen.thecrispybird.nl) plus the brief; OWNER: please verify them.

export const BRAND = {
  name: 'The Crispy Bird',
  tagline: { nl: 'Lekker Crispy. Made to deliver.', en: 'Lekker Crispy. Made to deliver.' },
  street: 'Kruyderlaan 3a',
  postcode: '3431 BM',
  city: 'Nieuwegein',
  country: 'NL',
  geo: { lat: 52.03224, lng: 5.08812 }, // from PDOK address lookup
  phone: '+31 6 26469115',
  phoneHref: 'tel:+31626469115',
  email: '', // OWNER: add a public e-mail address if you want one shown
  orderSystem: 'https://bestellen.thecrispybird.nl/',
  rating: { value: 4, count: 5 },
  socials: [], // OWNER: e.g. { name: 'Instagram', url: 'https://instagram.com/...' }
  url: 'https://www.thecrispybird.nl/', // OWNER: final domain, used for SEO tags
  googleMapsKey: '', // OWNER: Google Maps API key for the delivery map on the contact page (see delivery-map guide)
};

// Opening and delivery hours. Day 0 = Sunday (JS getDay()).
export const HOURS = [
  { day: 1, nl: 'Maandag', en: 'Monday', open: '16:00', close: '21:30' },
  { day: 2, nl: 'Dinsdag', en: 'Tuesday', open: null, close: null },
  { day: 3, nl: 'Woensdag', en: 'Wednesday', open: null, close: null },
  { day: 4, nl: 'Donderdag', en: 'Thursday', open: '16:00', close: '21:30' },
  { day: 5, nl: 'Vrijdag', en: 'Friday', open: '16:00', close: '21:30' },
  { day: 6, nl: 'Zaterdag', en: 'Saturday', open: '16:00', close: '21:30' },
  { day: 0, nl: 'Zondag', en: 'Sunday', open: '16:00', close: '21:30' },
];

// Delivery is free everywhere; the minimum order depends on the area.
export const AREA_GROUPS = [
  { id: 'nieuwegein', nl: 'Nieuwegein', en: 'Nieuwegein', codes: ['3431','3432','3433','3434','3435','3436','3437','3438','3439'], min: 17.5 },
  { id: 'ijsselstein', nl: 'IJsselstein', en: 'IJsselstein', codes: ['3401','3402','3403','3404'], min: 25 },
  { id: 'utrecht-a', nl: 'Utrecht: Rivierenwijk, Nieuw Hoograven, Industriegebied', en: 'Utrecht: Rivierenwijk, Nieuw Hoograven, industrial area', codes: ['3522','3525','3526'], min: 25 },
  { id: 'utrecht-b', nl: 'Utrecht: Lunetten, Van Vollenhovelaan, Papendorp', en: 'Utrecht: Lunetten, Van Vollenhovelaan, Papendorp', codes: ['3524','3527','3528'], min: 30 },
  { id: 'vianen', nl: 'Vianen', en: 'Vianen', codes: ['4132','4133'], min: 35 },
];
export const LOCKED_AREAS = [{ code: '4131', nl: 'Vianen Industrieterrein', en: 'Vianen industrial estate' }];

export const CATEGORIES = [
  { id: 'combos', nl: 'Combos', en: 'Combos' },
  { id: 'burgers', nl: 'Burgers', en: 'Burgers' },
  { id: 'sides', nl: 'Sides', en: 'Sides' },
  { id: 'dips', nl: 'Dips', en: 'Dips' },
  { id: 'kids', nl: 'Kids Menu', en: 'Kids Menu' },
  { id: 'desserts', nl: 'Desserts', en: 'Desserts' },
  { id: 'drinks', nl: 'Drankjes', en: 'Drinks' },
  { id: 'team', nl: 'Team Combos', en: 'Team Combos' },
];

export const TAGS = {
  gluten: { nl: 'Gluten', en: 'Gluten', icon: 'wheat' },
  ei: { nl: 'Ei', en: 'Egg', icon: 'egg' },
  melk: { nl: 'Melk', en: 'Milk', icon: 'milk' },
  noten: { nl: 'Noten', en: 'Nuts', icon: 'nut' },
  halal: { nl: 'Halal', en: 'Halal', icon: 'certificate' },
  vega: { nl: 'Vegetarisch', en: 'Vegetarian', icon: 'leaf' },
  vegan: { nl: 'Vegan', en: 'Vegan', icon: 'plant' },
  pittig: { nl: 'Pittig', en: 'Spicy', icon: 'pepper' },
};

const D = (nl, en) => ({ nl, en });

// options: which choices the item modal asks for. `free` marks an included dip.
export const MENU = [
  // Combos (20% off: `was` is the normal price)
  { id: 'meal-deal-small', cat: 'combos', name: 'Meal Deal Small', desc: D('Burger naar keuze, friet en een dip.', 'Burger of your choice, fries and a dip.'), price: 16.8, was: 21.0, img: 'img/dishes/combos/meal-deal-small.webp', tags: ['gluten', 'halal'], options: { burger: 1, dip: 1 }, best: true },
  { id: 'meal-deal', cat: 'combos', name: 'Meal Deal', desc: D('Burger naar keuze, friet, drankje en een dip.', 'Burger of your choice, fries, a drink and a dip.'), price: 18.0, was: 22.5, img: 'img/dishes/combos/meal-deal.webp', tags: ['gluten', 'halal'], options: { burger: 1, drink: 1, dip: 1 }, best: true },
  { id: 'meal-deal-xl', cat: 'combos', name: 'Meal Deal XL', desc: D('Burger, 4 tenders, coleslaw, friet, drankje en een gratis dip.', 'Burger, 4 tenders, coleslaw, fries, a drink and a free dip.'), price: 28.4, was: 35.5, img: 'img/dishes/combos/meal-deal-xl.webp', tags: ['gluten', 'halal'], options: { burger: 1, drink: 1, dip: 1, freeDip: true } },
  { id: 'everything', cat: 'combos', name: 'Everything', desc: D('Alle 4 burgers, 8 tenders, 2x coleslaw, 3x friet, 4 drankjes, alle dips en 2 brownies.', 'All 4 burgers, 8 tenders, 2x coleslaw, 3x fries, 4 drinks, every dip and 2 brownies.'), price: 95.6, was: 119.5, img: 'img/dishes/combos/everything.webp', tags: ['gluten', 'noten', 'halal'] },
  // Burgers
  { id: 'classic', cat: 'burgers', name: 'Classic Chicken Burger', desc: D('Tomaat, mayo en een sesam-brioche.', 'Tomato, mayo and a sesame brioche.'), price: 9.99, img: 'img/dishes/burgers/classic-chicken-burger.webp', tags: ['gluten', 'ei', 'melk', 'halal'] },
  { id: 'italian', cat: 'burgers', name: 'Italian Chicken Burger', desc: D('Basilicummayo en gesmolten kaas.', 'Basil mayo and melted cheese.'), price: 14.0, img: 'img/dishes/burgers/italian-chicken-burger.webp', tags: ['gluten', 'halal'] },
  { id: 'nashville', cat: 'burgers', name: 'Nashville Hot Chicken Burger', desc: D('Augurk en BBQ-saus. Heet, zoals het hoort.', 'Pickles and BBQ sauce. Hot, the way it should be.'), price: 14.0, img: 'img/dishes/burgers/nashville-hot-chicken-burger.webp', tags: ['gluten', 'halal', 'pittig'] },
  { id: 'korean', cat: 'burgers', name: 'Korean Chicken Burger', desc: D('Kimchi-slaw en gochujang-mayo.', 'Kimchi slaw and gochujang mayo.'), price: 14.0, img: 'img/dishes/burgers/korean-chicken-burger.webp', tags: ['gluten', 'halal'] },
  { id: 'halloumi', cat: 'burgers', name: 'Halloumi Burger', desc: D('Vega. Gebakken ui, augurk en BBQ-saus.', 'Veggie. Fried onion, pickles and BBQ sauce.'), price: 14.0, img: 'img/dishes/burgers/halloumi-burger.webp', tags: ['gluten', 'vega'] },
  // Sides
  { id: 'tenders', cat: 'sides', name: 'Chicken Tenders', desc: D('Handgepaneerd, met dip. Nu 1+1 gratis.', 'Hand-breaded, with a dip. Now buy 1 get 1 free.'), price: 10.0, img: 'img/dishes/sides/chicken-tenders.webp', tags: ['gluten', 'halal'], options: { dip: 1, freeDip: true }, promo: 'tenders11', best: true },
  { id: 'friet', cat: 'sides', name: 'Friet', desc: D('Goudbruin en krokant.', 'Golden and crispy.'), price: 4.5, img: 'img/dishes/sides/friet.webp', tags: ['gluten', 'vega'] },
  { id: 'coleslaw', cat: 'sides', name: 'Coleslaw', desc: D('Romig, fris en knapperig.', 'Creamy, fresh and crunchy.'), price: 3.0, img: 'img/dishes/sides/coleslaw.webp', tags: ['vega'] },
  // Dips
  { id: 'mayo', cat: 'dips', name: 'Mayo', desc: D('De klassieker.', 'The classic.'), price: 1.5, img: 'img/dishes/dips/mayo.webp', tags: [] },
  { id: 'spicy-mayo', cat: 'dips', name: 'Spicy Mayo', desc: D('Mayo met een kick.', 'Mayo with a kick.'), price: 1.5, img: 'img/dishes/dips/spicy-mayo.webp', tags: ['pittig'] },
  { id: 'knoflookmayo', cat: 'dips', name: 'Knoflookmayo', desc: D('Romig en vol knoflook.', 'Creamy and full of garlic.'), price: 1.5, img: 'img/dishes/dips/knoflookmayo.webp', tags: [] },
  { id: 'spicy-bbq', cat: 'dips', name: 'Spicy BBQ', desc: D('Rokerig, zoet en pittig.', 'Smoky, sweet and spicy.'), price: 1.5, img: 'img/dishes/dips/spicy-bbq.webp', tags: ['vegan', 'pittig'] },
  // Kids
  { id: 'kids-meal', cat: 'kids', name: 'Kids Meal', desc: D('3 tenders, friet, een dip en appelsap.', '3 tenders, fries, a dip and apple juice.'), price: 10.0, was: 12.5, img: 'img/dishes/kids/kids-meal.webp', tags: ['gluten', 'halal'], options: { dip: 1 } },
  // Desserts
  { id: 'brownie', cat: 'desserts', name: 'Brownie', desc: D('Chocolade met walnoten.', 'Chocolate with walnuts.'), price: 3.5, img: 'img/dishes/desserts/brownie.webp', tags: ['noten', 'vega'] },
  // Drinks
  { id: 'coca-cola', cat: 'drinks', name: 'Coca-Cola', size: '330ml', desc: D('Blikje 330 ml.', 'Can, 330 ml.'), price: 2.95, img: 'img/dishes/drinks/coca-cola.webp', tags: [] },
  { id: 'sprite', cat: 'drinks', name: 'Sprite', size: '330ml', desc: D('Blikje 330 ml.', 'Can, 330 ml.'), price: 2.95, img: 'img/dishes/drinks/sprite.webp', tags: [] },
  { id: 'diet-coke', cat: 'drinks', name: 'Diet Coke', size: '330ml', desc: D('Blikje 330 ml.', 'Can, 330 ml.'), price: 2.95, img: 'img/dishes/drinks/diet-coke.webp', tags: [] },
  { id: 'lipton', cat: 'drinks', name: 'Lipton Iced Tea', size: '330ml', desc: D('Blikje 330 ml.', 'Can, 330 ml.'), price: 2.95, img: 'img/dishes/drinks/lipton-iced-tea.webp', tags: [] },
  { id: 'fanta', cat: 'drinks', name: 'Fanta Orange', size: '330ml', desc: D('Blikje 330 ml.', 'Can, 330 ml.'), price: 2.95, img: 'img/dishes/drinks/fanta-orange.webp', tags: [] },
  { id: 'spa-rood', cat: 'drinks', name: 'Spa Rood', size: '500ml', desc: D('Bruisend water, 500 ml.', 'Sparkling water, 500 ml.'), price: 2.95, img: 'img/dishes/drinks/spa-rood.webp', tags: [] },
  { id: 'spa-blauw', cat: 'drinks', name: 'Spa Blauw', size: '500ml', desc: D('Plat water, 500 ml.', 'Still water, 500 ml.'), price: 2.95, img: 'img/dishes/drinks/spa-blauw.webp', tags: [] },
  { id: 'red-bull', cat: 'drinks', name: 'Red Bull', size: '250ml', desc: D('Blikje 250 ml.', 'Can, 250 ml.'), price: 3.95, img: 'img/dishes/drinks/red-bull.webp', tags: [] },
  // Team combos
  { id: 'two-burgers', cat: 'team', name: '2 Burgers', desc: D('Kies twee burgers naar keuze en bespaar €2.', 'Pick any two burgers and save €2.'), price: 26.0, img: 'img/dishes/team/2-burgers.webp', tags: ['gluten', 'halal'], options: { burger: 2 } },
];

// Choice lists used by the item modal.
export const CHOICES = {
  burger: ['classic', 'italian', 'nashville', 'korean', 'halloumi'],
  dip: ['mayo', 'spicy-mayo', 'knoflookmayo', 'spicy-bbq'],
  drink: ['coca-cola', 'sprite', 'diet-coke', 'lipton', 'fanta', 'spa-rood', 'spa-blauw'],
};

// Active promotions. `expires`: ISO date or null (null shows "zolang de actie loopt").
// OWNER: set real end dates if a deal has one.
export const DEALS = [
  { id: 'combos20', item: 'meal-deal', img: 'img/deals/combos-20-procent.webp', badge: D('-20%', '-20%'), title: D("20% korting op combo's", '20% off all combos'), body: D('Alle Meal Deals, de Kids Meal en Everything: de korting zit al in de prijs.', 'Every Meal Deal, the Kids Meal and Everything: the discount is already in the price.'), expires: null },
  { id: 'tenders11', item: 'tenders', img: 'img/deals/tenders-1-plus-1.webp', badge: D('1+1', '1+1'), title: D('1+1 Tenders', 'Tenders 1+1'), body: D('Bestel Chicken Tenders, krijg er nog een portie bij. Inclusief gratis dipsaus.', 'Order Chicken Tenders, get a second portion free. Free dip included.'), expires: null },
];

// Photos that are not a dish or a deal. To change one, replace the file in site/images/
// (same name), or point `src` at a new file. Width and height are read from the file itself.
// `alt` describes the photo for screen readers and search engines (NL + EN); leave both empty
// for a purely decorative photo.
export const PAGE_IMAGES = {
  hero: { src: 'img/page/home-hero.webp', alt: D('Classic Chicken Burger met krokante kippendij op een houten plank', 'Classic Chicken Burger with crispy chicken thigh on a wooden board') },
  step1: { src: 'img/page/home-step-1.webp', alt: D('', '') },
  banner: { src: 'img/page/home-banner.webp', alt: D('Tafel vol crispy chicken burgers, friet en dips', 'A table full of crispy chicken burgers, fries and dips') },
  // Shown when a page is shared on WhatsApp, Facebook etc. Best at 1200x630.
  share: 'img/page/home-banner.webp',
};

// Logo files (site/images/brand/). Keep the sizes: 192x192 and 512x512 PNG, square.
export const LOGO = {
  small: 'img/brand/logo-192.png',
  large: 'img/brand/logo-512.png',
  line: 'img/brand/logo-line.png',   // line drawing, used in the hero stamp and the empty cart
  favicon: 'img/brand/favicon.ico',
  appleTouch: 'img/brand/apple-touch-icon.png',
};

// Free delivery everywhere; pickup has no minimum order (OWNER: confirm).
export const PICKUP_MIN = 0;

// The 5 real reviews, copied verbatim from bestellen.thecrispybird.nl/beoordelingen (Nov 2026).
// Scores are per category (1-5). `mentions` is only filled where the review itself names a dish.
// The ordering system does not publish what each reviewer ordered.
// Add Google reviews by hand with source: 'Google' (Google does not allow exporting them).
export const REVIEWS = [
  { name: 'Jamie T', date: '2026-11-10', text: 'Restaurant quality, chicken is tender inside and crispy outside. Nashville Hot was our favourite by far.\n\nDelivery was quick too.', scores: { kwaliteit: 5 }, mentions: 'nashville' },
  { name: 'Aravind', date: '2026-11-10', text: 'Good breading, crispy juicy chicken. Love it!\n\nQuite on the expensive side\n\nWhy not sell fired chicken buckets??', scores: { kwaliteit: 5, bezorging: 5 } },
  { name: 'zeynep', date: '2026-11-09', text: 'Omdat onze vorige bestelling koud was aangekomen, kregen we als vergoeding drankjes en een brownies. Dat was heel aardig van jullie, hartelijk dank. Deze keer waren de gerechten warm en lekker, en we waren tevreden. :)', scores: { kwaliteit: 4, bezorging: 5 } },
  { name: 'Peter', date: '2026-11-06', text: 'Eten smaakt goed en is netjes verpakt.', scores: { kwaliteit: 5, bezorging: 4 } },
  { name: 'zeynep', date: '2026-11-03', text: 'Mijn bestelling kwam 2 uur te laat aan en het eten was helemaal koud. Ik was helemaal niet tevreden met deze situatie, heel jammer', scores: { kwaliteit: 3, bezorging: 3 } },
];
