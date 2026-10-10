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

## Supabase catalog, admin, and contact enquiries
The Vercel frontend connects to Supabase for persistent products and contact enquiries. The browser uses only the public anon key; row-level security policies protect the database.

1. In Supabase, open **SQL Editor** and run `supabase/migrations/001_catalog_and_enquiries.sql`.
2. In **Authentication → Settings**, disable public sign-ups.
3. In **Authentication → Users**, create the administrator account. Sign in at `/admin/login` with that email and password.
4. Redeploy the Vercel site. The project URL and anon key are configured in `src/lib/supabase.ts`; optional `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` build variables override them.

The migration enables public product reads and contact-form submissions; product CRUD and enquiry management require an authenticated user. Only create trusted admin users while public sign-ups are disabled. Product images can be site paths or HTTPS URLs.

For local development, run `npm install` and `npm run dev`; the Supabase-backed frontend does not need a separate Node API process. The legacy `server.mjs` remains available for Render deployments but is not used by the Vercel frontend.

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
`npm run build`, upload `dist/` to a static host (Netlify, Vercel, Cloudflare Pages, S3). The app is configured to run from the domain root.
The `public/_redirects` fallback is copied into `dist/` so direct links to app routes such as `/products`, `/product`, and `/checkout` serve the SPA on Netlify and Cloudflare Pages. Products, admin CRUD, and contact submissions are stored in Supabase.
