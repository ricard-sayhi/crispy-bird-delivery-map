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
const img = (f) => `img/${f}.webp`;

// options: which choices the item modal asks for. `free` marks an included dip.
export const MENU = [
  // Combos (20% off: `was` is the normal price)
  { id: 'meal-deal-small', cat: 'combos', name: 'Meal Deal Small', desc: D('Burger naar keuze, friet en een dip.', 'Burger of your choice, fries and a dip.'), price: 16.8, was: 21.0, img: img('8f0d4951a35342c7dcb7b1e5a3eb6b8f'), tags: ['gluten', 'halal'], options: { burger: 1, dip: 1 }, best: true },
  { id: 'meal-deal', cat: 'combos', name: 'Meal Deal', desc: D('Burger naar keuze, friet, drankje en een dip.', 'Burger of your choice, fries, a drink and a dip.'), price: 18.0, was: 22.5, img: img('6ae4966bb4de8_Crispy_Chicken_Burger_Feast'), tags: ['gluten', 'halal'], options: { burger: 1, drink: 1, dip: 1 }, best: true },
  { id: 'meal-deal-xl', cat: 'combos', name: 'Meal Deal XL', desc: D('Burger, 4 tenders, coleslaw, friet, drankje en een gratis dip.', 'Burger, 4 tenders, coleslaw, fries, a drink and a free dip.'), price: 28.4, was: 35.5, img: img('c45aa3e26025cacff5007df127b9c050'), tags: ['gluten', 'halal'], options: { burger: 1, drink: 1, dip: 1, freeDip: true } },
  { id: 'everything', cat: 'combos', name: 'Everything', desc: D('Alle 4 burgers, 8 tenders, 2x coleslaw, 3x friet, 4 drankjes, alle dips en 2 brownies.', 'All 4 burgers, 8 tenders, 2x coleslaw, 3x fries, 4 drinks, every dip and 2 brownies.'), price: 95.6, was: 119.5, img: img('ba997706caeeea7e47afbbab7df490fc'), tags: ['gluten', 'noten', 'halal'] },
  // Burgers
  { id: 'classic', cat: 'burgers', name: 'Classic Chicken Burger', desc: D('Tomaat, mayo en een sesam-brioche.', 'Tomato, mayo and a sesame brioche.'), price: 9.99, img: img('6ae75cf252a54_Crispy_Chicken_Burger_on_Wooden_Board'), tags: ['gluten', 'ei', 'melk', 'halal'] },
  { id: 'italian', cat: 'burgers', name: 'Italian Chicken Burger', desc: D('Basilicummayo en gesmolten kaas.', 'Basil mayo and melted cheese.'), price: 14.0, img: img('7465ef9251ed03559889c0296b034e7b'), tags: ['gluten', 'halal'] },
  { id: 'nashville', cat: 'burgers', name: 'Nashville Hot Chicken Burger', desc: D('Augurk en BBQ-saus. Heet, zoals het hoort.', 'Pickles and BBQ sauce. Hot, the way it should be.'), price: 14.0, img: img('f305e500d35f45c34abaf0218abaf1fe'), tags: ['gluten', 'halal', 'pittig'] },
  { id: 'korean', cat: 'burgers', name: 'Korean Chicken Burger', desc: D('Kimchi-slaw en gochujang-mayo.', 'Kimchi slaw and gochujang mayo.'), price: 14.0, img: img('36a33aab802c41fbeb6f3d5d2743a08f'), tags: ['gluten', 'halal'] },
  { id: 'halloumi', cat: 'burgers', name: 'Halloumi Burger', desc: D('Vega. Gebakken ui, augurk en BBQ-saus.', 'Veggie. Fried onion, pickles and BBQ sauce.'), price: 14.0, img: img('d0f151a011182b1b03859df1197cbc1f'), tags: ['gluten', 'vega'] },
  // Sides
  { id: 'tenders', cat: 'sides', name: 'Chicken Tenders', desc: D('Handgepaneerd, met dip. Nu 1+1 gratis.', 'Hand-breaded, with a dip. Now buy 1 get 1 free.'), price: 10.0, img: img('bc3a0ea7fdaf03535be37d36d9fa84c7'), tags: ['gluten', 'halal'], options: { dip: 1, freeDip: true }, promo: 'tenders11', best: true },
  { id: 'friet', cat: 'sides', name: 'Friet', desc: D('Goudbruin en krokant.', 'Golden and crispy.'), price: 4.5, img: img('7d36f512afaa6e423cd7298226ed1079'), tags: ['gluten', 'vega'] },
  { id: 'coleslaw', cat: 'sides', name: 'Coleslaw', desc: D('Romig, fris en knapperig.', 'Creamy, fresh and crunchy.'), price: 3.0, img: img('fcdaeffc2142e3f248dd6e340204a46e'), tags: ['vega'] },
  // Dips
  { id: 'mayo', cat: 'dips', name: 'Mayo', desc: D('De klassieker.', 'The classic.'), price: 1.5, img: img('5bf681059c6073242f231d4359d306c8'), tags: [] },
  { id: 'spicy-mayo', cat: 'dips', name: 'Spicy Mayo', desc: D('Mayo met een kick.', 'Mayo with a kick.'), price: 1.5, img: img('51e80056873cca33bd6069c9c71fa1d7'), tags: ['pittig'] },
  { id: 'knoflookmayo', cat: 'dips', name: 'Knoflookmayo', desc: D('Romig en vol knoflook.', 'Creamy and full of garlic.'), price: 1.5, img: img('5bf681059c6073242f231d4359d306c8'), tags: [] },
  { id: 'spicy-bbq', cat: 'dips', name: 'Spicy BBQ', desc: D('Rokerig, zoet en pittig.', 'Smoky, sweet and spicy.'), price: 1.5, img: img('0b81d824fb48a91bb42cb145163f015b'), tags: ['vegan', 'pittig'] },
  // Kids
  { id: 'kids-meal', cat: 'kids', name: 'Kids Meal', desc: D('3 tenders, friet, een dip en appelsap.', '3 tenders, fries, a dip and apple juice.'), price: 10.0, was: 12.5, img: img('2e79d519ec4dbd2a830d672ea21965e0'), tags: ['gluten', 'halal'], options: { dip: 1 } },
  // Desserts
  { id: 'brownie', cat: 'desserts', name: 'Brownie', desc: D('Chocolade met walnoten.', 'Chocolate with walnuts.'), price: 3.5, img: img('352670751edb3d25b411fca8b99b60d9'), tags: ['noten', 'vega'] },
  // Drinks
  { id: 'coca-cola', cat: 'drinks', name: 'Coca-Cola', size: '330ml', desc: D('Blikje 330 ml.', 'Can, 330 ml.'), price: 2.95, img: img('8372783d63f5ea9f9c2da3e2286c62ae'), tags: [] },
  { id: 'sprite', cat: 'drinks', name: 'Sprite', size: '330ml', desc: D('Blikje 330 ml.', 'Can, 330 ml.'), price: 2.95, img: img('6ae498e99a21d_sprite'), tags: [] },
  { id: 'diet-coke', cat: 'drinks', name: 'Diet Coke', size: '330ml', desc: D('Blikje 330 ml.', 'Can, 330 ml.'), price: 2.95, img: img('6ae498f6f381c_diet_coke'), tags: [] },
  { id: 'lipton', cat: 'drinks', name: 'Lipton Iced Tea', size: '330ml', desc: D('Blikje 330 ml.', 'Can, 330 ml.'), price: 2.95, img: img('5d1d530a6cd66a1a77236047b8d74d8b'), tags: [] },
  { id: 'fanta', cat: 'drinks', name: 'Fanta Orange', size: '330ml', desc: D('Blikje 330 ml.', 'Can, 330 ml.'), price: 2.95, img: img('6ae49901161e2_fanta'), tags: [] },
  { id: 'spa-rood', cat: 'drinks', name: 'Spa Rood', size: '500ml', desc: D('Bruisend water, 500 ml.', 'Sparkling water, 500 ml.'), price: 2.95, img: img('534205b56fd107431de263f15cc605a2'), tags: [] },
  { id: 'spa-blauw', cat: 'drinks', name: 'Spa Blauw', size: '500ml', desc: D('Plat water, 500 ml.', 'Still water, 500 ml.'), price: 2.95, img: img('a3926257cc9625e36b3da9c48f86b062'), tags: [] },
  { id: 'red-bull', cat: 'drinks', name: 'Red Bull', size: '250ml', desc: D('Blikje 250 ml.', 'Can, 250 ml.'), price: 3.95, img: img('6ae499170f46a_Redbull'), tags: [] },
  // Team combos
  { id: 'two-burgers', cat: 'team', name: '2 Burgers', desc: D('Kies twee burgers naar keuze en bespaar €2.', 'Pick any two burgers and save €2.'), price: 26.0, img: img('6ae4cc4f03e77_Crispy_Chicken_Burgers_on_Wooden_Board'), tags: ['gluten', 'halal'], options: { burger: 2 } },
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
  { id: 'combos20', item: 'meal-deal', img: 'img/deal-combo.webp', badge: D('-20%', '-20%'), title: D("20% korting op combo's", '20% off all combos'), body: D('Alle Meal Deals, de Kids Meal en Everything: de korting zit al in de prijs.', 'Every Meal Deal, the Kids Meal and Everything: the discount is already in the price.'), expires: null },
  { id: 'tenders11', item: 'tenders', img: 'img/deal-tenders.webp', badge: D('1+1', '1+1'), title: D('1+1 Tenders', 'Tenders 1+1'), body: D('Bestel Chicken Tenders, krijg er nog een portie bij. Inclusief gratis dipsaus.', 'Order Chicken Tenders, get a second portion free. Free dip included.'), expires: null },
];

// Free delivery everywhere; pickup has no minimum order (OWNER: confirm).
export const PICKUP_MIN = 0;

// The 5 real reviews, copied verbatim from bestellen.thecrispybird.nl/beoordelingen (Nov 2026).
// Scores are per category (1-5). `mentions` is only filled where the review itself names a dish.
// The ordering system does not publish what each reviewer ordered.
export const REVIEWS = [
  { name: 'Jamie T', date: '2026-11-10', text: 'Restaurant quality, chicken is tender inside and crispy outside. Nashville Hot was our favourite by far.\n\nDelivery was quick too.', scores: { kwaliteit: 5 }, mentions: 'nashville' },
  { name: 'Aravind', date: '2026-11-10', text: 'Good breading, crispy juicy chicken. Love it!\n\nQuite on the expensive side\n\nWhy not sell fired chicken buckets??', scores: { kwaliteit: 5, bezorging: 5 } },
  { name: 'zeynep', date: '2026-11-09', text: 'Omdat onze vorige bestelling koud was aangekomen, kregen we als vergoeding drankjes en een brownies. Dat was heel aardig van jullie, hartelijk dank. Deze keer waren de gerechten warm en lekker, en we waren tevreden. :)', scores: { kwaliteit: 4, bezorging: 5 } },
  { name: 'Peter', date: '2026-11-06', text: 'Eten smaakt goed en is netjes verpakt.', scores: { kwaliteit: 5, bezorging: 4 } },
  { name: 'zeynep', date: '2026-11-03', text: 'Mijn bestelling kwam 2 uur te laat aan en het eten was helemaal koud. Ik was helemaal niet tevreden met deze situatie, heel jammer', scores: { kwaliteit: 3, bezorging: 3 } },
];
