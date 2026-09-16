# Zero To Online Income — launch experience

A static, scroll-driven site. No build step, no framework, no install.

```
index.html          the experience: markup, SEO/Open Graph, Book JSON-LD, book <template>
privacy.html        privacy policy          terms.html     terms of sale
contact.html        contact page            404.html       not-found page
style.css           visual system → book → acts → components → responsive → reduced motion
script.js           config block, then the experience layer (GSAP + ScrollTrigger)
vercel.json         clean URLs, security headers, cache policy
robots.txt          sitemap.xml
assets/images/      og.jpg (social card) · og-source.svg (its editable master) · book-cover-art.svg
assets/icons/       favicon.svg · favicon-32.png · apple-touch-icon.png
```

GSAP and ScrollTrigger load from cdnjs. Everything else is local. Scrolling is native; no smooth-scroll library.

## Run it

```bash
python3 -m http.server 4321
```

Then open http://localhost:4321.

## The story, in order

| Act | What happens |
| --- | --- |
| The void | "For people who are done waiting." Type is pushed apart and left behind as you scroll. |
| The problem | Five statements arrive from different directions and leave. The last one lands in ember. |
| The book appears | The book rises out of the dark spine-first, then turns to face the reader. |
| The book opens | The cover swings open across a long scroll; the printed pages become readable. |
| The content reveals itself | What is printed inside is read out at full size, then the page floods the screen and becomes the site. |
| The method | Find · Build · Package · Sell · Repeat, each a full editorial stage with an oversized outlined number. |
| The chapter journey | A pinned panel; the active chapter dominates while the other five stay faintly visible. |
| The transformation | Idea/Stuck/Unused/Unpackaged is wiped away in ember by Product/Packaged/Positioned/Sold. |
| The product | The book returns larger, beside what actually ships. |
| The $19 decision | "Start for $19 and build from there." |
| Final CTA | "Your idea doesn't need more waiting. It needs a product." |

## The only things you normally edit

All at the top of `script.js`, in the `01 — CONFIG` block:

- `PAYMENT_LINK` — set once. Every `[data-buy]` CTA reads it. While it is the placeholder, those buttons scroll to the price section.
- `PRICE` — amount and currency. Drives the price display and the count-up.
- `PRODUCT_INCLUDES` — what the buyer receives; the "What you get" list is rendered from it. Only add entries for things that genuinely ship.
- `IMAGES` — optional image slots, all `null` by default. The page is designed to work with zero images: the book, the lighting and the grain are CSS/SVG. Point an entry at a file in `assets/images/` to enable it; nothing breaks when a slot stays `null`.

If you change the price, also update `offers.price` in the JSON-LD block in `index.html`. Replace `https://your-domain.com` (canonical, `og:url`, `og:image`) with the real host before launch.

## Notes

- **No claims.** No testimonials, ratings, customer counts, income figures or guarantees — in the copy or the structured data. The only number on the page is the real price.
- **The book** is one CSS 3D object: front cover pushed forward 22px, spine as a real left-side face behind it, page block with a ruled edge, printed inner cover. It is stamped from a `<template>` into two stages (the opening act and the product section) so neither timeline can leave state on the other's object. Its cover text scales with the book itself via container query units.
- **Motion hierarchy.** Scroll storytelling first (all of it scrubbed, nothing autoplays), section reveals second, hover third.
- **Reduced motion.** With `prefers-reduced-motion: reduce`, `initStatic()` runs instead of the experience: no GSAP timelines, no scroll animation, the acts collapse into a readable static document with the book shown as a still composition. Every CTA and all copy remain present.
- **Performance.** Transform/opacity/clip-path only, `will-change` on the handful of elements that need it, one debounced `ScrollTrigger.refresh()` behind resize/orientation/ResizeObserver, and no infinite loops (the scroll indicator's 1px sweep is the only ambient animation).


## Before you announce the link

Three things need your own facts. Search for the highlighted `[...]` fields:

- `privacy.html` — `[DATE]`, `[YOUR EMAIL]`
- `terms.html` — `[DATE]`, `[YOUR EMAIL]`, `[YOUR REFUND POLICY]`, `[YOUR COUNTRY / STATE]`
- `contact.html` — `[YOUR EMAIL]`

And if the deployed host is not `zero-to-online-income.vercel.app`, change the domain in `index.html` (canonical, `og:url`, `og:image`, `twitter:image`), `robots.txt`, `sitemap.xml`, and the `canonical` in each document page.

## Production setup

Deployed as a static site on Vercel — no build step, no dependencies.

- **Clean URLs.** `vercel.json` sets `cleanUrls`, so the footer links `/privacy`, `/terms`, `/contact` resolve. On a plain local server use `privacy.html` etc. instead.
- **Security headers** (`vercel.json`): a Content-Security-Policy that allows only self, cdnjs (GSAP) and Google Fonts; HSTS with preload; `nosniff`; `strict-origin-when-cross-origin` referrer; a Permissions-Policy that denies camera, microphone and geolocation; `frame-ancestors 'none'`. The CSP was verified against the live page — GSAP, fonts and the JSON-LD block all pass.
- **Subresource Integrity.** Both GSAP files carry a `sha384` integrity hash, so a compromised CDN cannot swap the script. If you change the GSAP version, recompute the hashes or the scripts will refuse to run (the page then falls back to its static, no-JavaScript layout).
- **Caching.** `/assets/*` is immutable for a year; CSS and JS revalidate weekly; the HTML is always revalidated. Stylesheet and script URLs carry a `?v=` number — bump it whenever you edit those files.
- **Social card.** `assets/images/og.jpg` is 1200×630 with matching `og:image:width/height/alt` and a Twitter image. Re-render it from `og-source.svg` if the wording changes.
- **No analytics.** Nothing is tracked, which is what the privacy page says. If you add analytics later, update `privacy.html` and add the domain to the CSP `script-src` and `connect-src`.
