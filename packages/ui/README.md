# `@repo/ui`

shadcn/ui component library for the monorepo. Built on **Base UI** primitives
(`base-nova` preset, `neutral` base color, Lucide icons) with Tailwind v4.
The preset's Geist font and neutral palette are overridden in `globals.css` —
see DECISIONS.md.

Source-only package — there is no build step. Consumers import `.tsx`/`.ts`
directly through the `exports` map and compile it themselves.

## Adding components

Run from this directory so the CLI picks up `components.json`:

```sh
pnpm dlx shadcn@latest add <component>
```

Components land in `src/components/`, hooks in `src/hooks/`, helpers in
`src/lib/`. Anything the CLI needs is added to this package's dependencies.

## Consuming

```ts
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
```

The consuming app must import the stylesheet once, at its CSS entry point:

```css
@import "@repo/ui/globals.css";
```

`globals.css` carries its own `@source "../**/*.{ts,tsx}"`, so Tailwind scans
this package's sources without the app needing to configure anything. It also
owns the theme tokens, `:root`/`.dark` palettes, and the `@layer base` resets —
so an app importing it should not re-import `tailwindcss` itself.
