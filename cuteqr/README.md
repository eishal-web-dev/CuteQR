# CuteQR 🐾

Turn any link into an adorable, genuinely scannable animal-themed QR code.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- `qr-code-styling` for QR generation (client-side only)
- `jsQR` for in-browser scan validation
- Self-hosted fonts via `@fontsource` (Baloo 2 + Inter) — no external font requests
- Lucide icons

100% client-side. No backend, no database, no auth, no paid APIs, no AI APIs.

## Running locally

```bash
npm install
npm run dev
```

Visit http://localhost:3000

## Deploying to Vercel

```bash
npx vercel
```

Or connect the repo directly in the Vercel dashboard — zero configuration
needed, it's a standard Next.js app.

## How QR reliability works

This was the most important part of the brief, so here's exactly how it's
enforced (see `src/lib/qr.ts`):

1. **Error correction is always set to `H`** (highest level, ~30% of the
   code can be damaged/covered and still decode).
2. **Finder pattern corners are always high-contrast dark**, never a pastel
   theme color — this was an actual bug found during development: pastel
   corner colors caused 100% decode failure in testing, even when
   everything else about the QR was fine. Corners are intentionally not
   user-customizable for this reason.
3. **A contrast ratio pre-check** runs before attempting a styled render —
   if the user's chosen colors don't have enough contrast, it skips
   straight to the safe fallback rather than wasting a render cycle.
4. **Every generated QR is decoded back in-browser** using `jsQR` and
   compared against the original URL before showing "✅ Scan tested."
5. **If validation fails**, it automatically regenerates using a forced
   black/white, square-module fallback and validates again. A broken QR is
   never presented as downloadable without a warning.
6. Animal decorations (ears, paws, eyes, whiskers) are positioned via CSS
   entirely **outside** the QR image's own bounding box — they're part of
   the surrounding frame, never overlaid on top of QR modules. This means
   scannability can't be broken by decoration placement, by construction.

## What's intentionally NOT included (per the brief)

No database, no accounts, no payment processing, no AI generation — the
codebase is structured so these can be added later (dynamic QR
destinations, premium animal packs, accounts, Shopify integration) without
requiring a rewrite, but none of that is built yet.

## Project structure

```
src/
  app/            — Next.js App Router pages, layout, global styles
  components/      — Hero, AnimalPicker, AnimalFrame, QRGenerator, etc.
  lib/
    animals.ts     — animal theme configuration (colors, labels)
    qr.ts          — QR generation + validation logic (the important part)
```
