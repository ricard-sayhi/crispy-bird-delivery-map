# The Crispy Bird website (prototype)

A multi-page site for The Crispy Bird: home (with a reviews carousel), menu with cart and item options, deals, contact with the delivery map, and checkout. Dutch first, with an English switch that stays at the bottom of the screen.

Live preview: https://ricard-sayhi.github.io/crispy-bird-delivery-map/site/

## Build

```bash
npm install
npm run build      # writes the static site to dist/
npm run serve      # optional local preview on http://localhost:8080
```

`dist/` is plain HTML, CSS and JS, so it can go on any web host. The site has no backend.

## Where to change things

Everything the owner edits is in `src/data.mjs`:

| What | Where in `src/data.mjs` |
|---|---|
| Menu items, prices, descriptions, allergens | `MENU` |
| Opening and delivery hours | `HOURS` |
| Delivery areas and minimum order | `AREA_GROUPS`, `LOCKED_AREAS` |
| Deals and end dates | `DEALS` (`expires: '2026-12-31'` shows a countdown badge) |
| Reviews (home page carousel) | `REVIEWS`: add as many as you like; each card shows its source |
| Phone, address, socials, domain, Google Maps key | `BRAND` |

Then run `npm run build` again.

## Not connected yet (prototype)

- **Orders and payment.** Checkout runs through all three steps (details, promo code + iDEAL/Wero, confirm) but places no order. The last step says so and links to the current ordering system. Going live needs an ordering/payment backend, or SiteDish's ordering page linked from the "Bestel nu" buttons.
- **Promo codes.** No codes are configured, so every code is reported as unknown.
- **Newsletter form.** It validates and confirms, but sends nothing. Connect it to a newsletter tool.
- **Pickup minimum.** Set to €0 (`PICKUP_MIN`). Confirm with the owner.

## Owner to confirm or supply

- Google Maps reviews: Google does not allow exporting them (its API returns at most 5). Paste them into `REVIEWS` by hand, with `source: 'Google'`.
- Allergen tags come from the current ordering site plus the brief. Please check every dish.
- The privacy policy is a draft and must be reviewed.
- Final domain (`BRAND.url`) for SEO tags and the sitemap.
- Social media links (none were found on the current site).
- A Google Maps API key for the delivery map on the contact page (`BRAND.googleMapsKey`).
- A high-resolution hero photo. The current dish photos are 280 to 890 px wide, so the hero uses a "plate" layout that suits them; a large photo would allow a full-bleed hero.

## Design notes

- Brand colours are sampled from the logo: gold `#c8902a` and black. A deeper shade of the same gold (`#8a5c10`) is used for gold text on light backgrounds, because the brand gold on white fails contrast (2.8:1).
- Fonts: Bowlby One (headings), Archivo (menu and prices), Permanent Marker (small hand-written accents that echo the line-drawn logo).
- All photos are the restaurant's own, taken from the current ordering site, then denoised, upscaled 2x where small, and given a pure-white backdrop (food pixels untouched). Cards show whole photos, never cropped.
- Menu and deals pages use a dark theme (#1A1A1A); the rest stays light.
- Checked with axe (WCAG 2 A/AA): no violations on any page.
