# The Crispy Bird website (prototype)

A complete multi-page site for The Crispy Bird: home, menu with cart and item options, deals, about us, reviews, contact with delivery areas, and checkout. Dutch first, with an English switch.

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
| Reviews | `REVIEWS` (copied from the current ordering system) |
| Phone, address, socials, domain, Google Maps key | `BRAND` |

Then run `npm run build` again.

## Not connected yet (prototype)

- **Orders and payment.** Checkout runs through all three steps (details, promo code + iDEAL/Wero, confirm) but places no order. The last step says so and links to the current ordering system. Going live needs an ordering/payment backend, or SiteDish's ordering page linked from the "Bestel nu" buttons.
- **Promo codes.** No codes are configured, so every code is reported as unknown.
- **Newsletter and contact forms.** They validate and confirm, but send nothing. Connect them to a mail or newsletter tool.
- **Pickup minimum.** Set to €0 (`PICKUP_MIN`). Confirm with the owner.

## Owner to confirm or supply

- The "Over ons" story is draft copy and is marked as such on the page.
- Two kitchen photo slots on "Over ons" are waiting for real photos.
- Allergen tags come from the current ordering site plus the brief. Please check every dish.
- The privacy policy is a draft and must be reviewed.
- Final domain (`BRAND.url`) for SEO tags and the sitemap.
- Social media links (none were found on the current site).
- A Google Maps API key for the delivery map on the contact page (`BRAND.googleMapsKey`).
- A high-resolution hero photo. The current dish photos are 280 to 890 px wide, so the hero uses a "plate" layout that suits them; a large photo would allow a full-bleed hero.

## Design notes

- Brand colours are sampled from the logo: gold `#c8902a` and black. A deeper shade of the same gold (`#8a5c10`) is used for gold text on light backgrounds, because the brand gold on white fails contrast (2.8:1).
- Fonts: Bowlby One (headings), Archivo (menu and prices), Permanent Marker (small hand-written accents that echo the line-drawn logo).
- All photos are the restaurant's own, taken from the current ordering site.
- Checked with axe (WCAG 2 A/AA): no violations on any page.
