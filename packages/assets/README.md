# `@repo/assets`

Static images and SVGs shared across apps. No build step — files are resolved
straight through the `exports` map.

## Usage

Add the dependency, then import the file. The import resolves to a URL string:

```tsx
import wordmark from "@repo/assets/icons/text-black.svg";

<img src={wordmark} alt="Relivo" />;
```

Vite content-hashes the file and emits it into the build output. Types come
from `vite/client`, which declares `*.svg`, `*.png`, `*.jpg` and `*.webp` — so
no declaration file is needed here.

## Layout

```text
icons/
  text-black.svg      wordmark            191x49
  text-white.svg
  mark-black.svg      symbol              48x48
  mark-white.svg
  lockup-h-black.svg  mark + wordmark     259x49
  lockup-h-white.svg
  lockup-s-black.svg  mark over wordmark  191x123
  lockup-s-white.svg
  icon-ink.svg        backgrounded tile   48x48
  icon-paper.svg
  favicon.svg         adapts to colour scheme
  favicon.ico         16 / 32 / 48 packed
  png/                mark-{black,white}-{16..2048}.png            transparent
                      icon-{ink,paper}-{180,192,256,512,1024}.png  opaque
```

The `exports` wildcard is `"./*": "./*"`, so new folders work without touching
`package.json`.

## Brand marks

The symbol is two 150° arcs on a 48x48 grid — centre 24,24, centreline radius
16, stroke 8. That is a 19.6% stroke-to-diameter ratio, matched to the `o` in
the wordmark (outer diameter 35.33, stroke 6.912) so mark and name carry the
same weight when they sit together.

**Clear space** — one stroke width on all four sides, i.e. one sixth of the
mark's height. In a lockup, measure from the outermost ink, not the viewBox.

**Minimum sizes** — mark 16px; horizontal lockup 120px wide; stacked lockup
100px wide. Below 100px wide the wordmark's counters start to fill in.

**Optical variant** — `favicon.svg`, `favicon.ico` and the 16/32/48 PNGs use a
slightly tighter, heavier cut (radius 17.5, stroke 9) so the mark holds its
shape at small sizes. Everything 64px and up uses the standard geometry. Don't
scale the optical variant up; don't scale the standard one below 64px.

**Backgrounded tiles** — `icon-ink.*` and `icon-paper.*` are opaque squares
with the mark at 62% of the tile, the standard app-icon glyph proportion. Use
them anywhere transparency breaks: iOS app icons (Apple rejects alpha),
`apple-touch-icon`, and social avatars on GitHub / X / LinkedIn, which
circle-crop. The mark is a circle sitting well inside that crop, so nothing
clips. Ship the plain square — every platform applies its own corner masking,
so baking in rounded corners double-rounds it.

**Don't** — recolour outside ink `#1A1613` and white, rotate the mark, close
the two gaps, change the arc weights independently, or place the ink mark on a
dark background (use the white variant).

## Notes

- Importing an SVG gives a URL, not a component. Rendering it inline (to
  recolour it with CSS) would need `vite-plugin-svgr` and `?react` imports in
  the consuming app — not set up.
- UI icons come from `lucide-react` in `@repo/ui`. This package is for brand
  marks and images.
