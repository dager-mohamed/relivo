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
icons/    text-black.svg, text-white.svg
```

The `exports` wildcard is `"./*": "./*"`, so new folders work without touching
`package.json`.

## Notes

- Importing an SVG gives a URL, not a component. Rendering it inline (to
  recolour it with CSS) would need `vite-plugin-svgr` and `?react` imports in
  the consuming app — not set up.
- UI icons come from `lucide-react` in `@repo/ui`. This package is for brand
  marks and images.
