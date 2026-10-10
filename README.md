# Luxury Necklace — scroll-synced sequence site
React + Vite + TypeScript · GSAP ScrollTrigger · Lenis (desktop, optional) · Bootstrap 5 + custom CSS

## Run
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build → dist/
npm run preview
```
Optimized frames are already in `public/frames/` (desktop 121 + mobile 61 WebP, ~7 MB total).

## Admin and product catalog
The catalog and admin panel use the included Node API and a persistent `data/products.json` file. For local development:

1. Copy `.env.example` to `.env`, then replace the example admin password with a long, unique password.
2. Start the API in one terminal: `npm run api`.
3. Start the site in another terminal: `npm run dev`.
4. Open `/admin/login` to manage products. Creating a product returns to `/products`; edits and deletes stay in the admin panel.

The API protects admin routes with an HTTP-only session cookie and stores product changes on the server. Deploy this as a Node service (build with `npm run build`, then set `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `NODE_ENV=production`, and run `npm start`). Use HTTPS and a persistent disk for `data/products.json`; a static-only host cannot run the admin API or save product changes.

## Regenerate frames from your PNGs
Put the original 240 PNGs in `source-assets/frames_24fps/` (kept out of the web bundle), then:
```bash
pip install pillow numpy opencv-python
npm run frames            # add -- --keep-mark to keep the corner watermark untouched
```
The script measures frame-to-frame motion, samples frames evenly in "motion-weighted" time (endpoints kept, extra
frames around fast movement), writes `public/frames/{desktop,mobile}/NNN.webp` and `src/data/frames.json`.

## Owner-supplied data (nothing is invented)
Edit `src/data/product.ts`: brand name/contact/policies, price, currency, variants, care/shipping/returns text, `checkoutUrl`.
Empty fields are hidden. Price shows "Price to be confirmed" until set.
- **Checkout**: `src/lib/checkout.ts` is the single integration point (Stripe, Shopify permalink, etc.). No payment backend is included.
- **SEO**: set the real domain in the canonical tag and add `public/images/og.jpg` in `index.html`. Product JSON-LD is intentionally omitted until real price/availability exist.
- **3D**: no GLB model was supplied, so no fake 3D showcase is built. When you have one, add it to `public/models/` and lazy-load an R3F/Drei component (`npm i three @react-three/fiber @react-three/drei`).

## Tuning
Pin length: `end` in `NecklaceSequence.tsx` (4.4 × viewport desktop, 3.2 mobile). Chapter timing: `CHAPTERS`. Cache: `CAP`/`WIN` in `useImageSequence.ts`.

## Deploy
`npm run build`, upload `dist/` to any static host (Netlify, Vercel, Cloudflare Pages, S3). Relative base is set, so subfolders work.
The `public/_redirects` fallback is copied into `dist/` so direct links to app routes such as `/products`, `/product`, and `/checkout` serve the SPA on Netlify and Cloudflare Pages. The admin, product catalog, and contact submissions also require the Node API; a static-only upload can render routes but cannot persist these records.
