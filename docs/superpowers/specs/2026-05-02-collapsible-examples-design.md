# Collapsible — Examples, Sandbox, Animation Presets and GitHub Pages

**Date:** 2026-05-02
**Status:** Design (approved)
**Author:** Dmitriy Kolosovskiy (with Claude)

## 1. Goals

1. Showcase the expressive range of `react-spring` through a curated set of static examples.
2. Provide an interactive sandbox with parameter sliders and named profiles persisted to `localStorage`.
3. Add three first-class animation presets (`gentle`, `wobbly`, `stiff`) to the `<Collapsible />` component, switchable via prop, with a default value.
4. Host the playground on GitHub Pages at `https://kolosochek.github.io/collapsible/`.

## 2. Non-goals

- Test runner / CI test suite (no testing infrastructure exists today; adding one is out of scope).
- Storybook or other documentation framework.
- React Router or any client-side routing inside the playground.
- URL-shareable sandbox state (deferred — `localStorage`-only persistence in v1).
- Migration shims for the v1 default animation config; consumers opt back via explicit `animationHeightConfig`.

## 3. Architecture

### 3.1 Repository layout

```
collapsible/
├── .github/
│   └── workflows/
│       └── deploy-playground.yml
├── src/                              # library
│   ├── index.tsx                     # exports only — no React render
│   ├── components/
│   │   └── Collapsible/
│   │       ├── Collapsible.tsx
│   │       ├── presets.ts            # NEW
│   │       └── styles.module.css
│   └── types/
│       ├── collapsible.ts
│       └── typeguards.ts
├── playground/                       # demo app (Vite)
│   ├── index.html
│   ├── main.tsx
│   ├── App.tsx
│   ├── nav/
│   │   └── Sidebar.tsx
│   ├── examples/
│   │   ├── PresetsExample.tsx
│   │   ├── MassSpectrumExample.tsx
│   │   ├── TensionSpectrumExample.tsx
│   │   ├── FrictionSpectrumExample.tsx
│   │   ├── AccordionExample.tsx
│   │   ├── shared/
│   │   │   ├── ExamplePage.tsx
│   │   │   ├── ConfigCard.tsx
│   │   │   └── content.ts
│   │   └── registry.ts
│   ├── sandbox/
│   │   ├── Sandbox.tsx
│   │   ├── ControlsPanel.tsx
│   │   ├── ProfilesPanel.tsx
│   │   ├── useProfiles.ts
│   │   ├── controls/
│   │   │   ├── Slider.tsx
│   │   │   ├── Toggle.tsx
│   │   │   └── Select.tsx
│   │   ├── types.ts
│   │   └── styles.module.css
│   └── styles/
│       └── global.css
├── vite.config.ts
├── tsconfig.json
├── tsconfig.lib.json
├── tsup.config.ts
├── package.json
└── README.md
```

`public/index.html` is removed — its role is replaced by `playground/index.html`.

### 3.2 Library / playground separation

- `src/` is the published npm package. Built by `tsup` into `dist/`.
- `playground/` is a Vite app that imports `Collapsible` from `'../src'` (path alias resolved by Vite). Never bundled into the library.
- `tsconfig.lib.json` is consumed by `tsup`; it includes `src/` and excludes `playground/` so the playground is never type-checked as part of a library build.
- The root `tsconfig.json` includes both `src` and `playground` so editor tooling and `npm run lint` cover the whole repo.

## 4. Library changes

### 4.1 Animation presets

Three named presets, exported from `src/components/Collapsible/presets.ts`:

```ts
import { SpringConfig } from "@react-spring/web";

export const PRESETS = {
  gentle: { mass: 1, tension: 120, friction: 14 },
  wobbly: { mass: 1, tension: 180, friction: 12 },
  stiff:  { mass: 1, tension: 210, friction: 20 },
} as const satisfies Record<string, SpringConfig>;

export type TAnimationPreset = keyof typeof PRESETS;
```

Names mirror `react-spring`'s built-in named configs so consumers familiar with the library transfer their intuition.

### 4.2 Prop API

A new prop on `<Collapsible />`:

```ts
animationPreset?: TAnimationPreset;   // default: "gentle"
```

Resolution rule for the height-spring config:

```ts
const resolvedHeightConfig: SpringConfig = {
  ...PRESETS[animationPreset],
  ...animationHeightConfig,           // explicit prop wins per-key
};
```

Behavior:
- `<Collapsible />` — uses `gentle`.
- `<Collapsible animationPreset="wobbly" />` — uses `wobbly`.
- `<Collapsible animationPreset="wobbly" animationHeightConfig={{ tension: 300 }} />` — wobbly mass/friction with overridden tension.
- `<Collapsible animationHeightConfig={{ mass: 1, tension: 176, friction: 26 }} />` — full v1-compatible behavior.

The opacity spring is unaffected; it continues to use `animationOpacityConfig` (default `{ duration: 250 }`).

### 4.3 Internals (`Collapsible.tsx`)

Single point of change: replace the literal default for `animationHeightConfig` with `animationPreset = "gentle"`, compute `resolvedHeightConfig` once per render, and pass it through to the existing `useSpring` config callback for the `"height"` key. No other rendering logic changes.

### 4.4 Library entry (`src/index.tsx`)

Replaces the current React-rendering entry with pure exports:

```ts
export { default as Collapsible } from "./components/Collapsible/Collapsible";
export { PRESETS } from "./components/Collapsible/presets";
export type { TAnimationPreset } from "./components/Collapsible/presets";
export type { TCollapsibleProps } from "./types/collapsible";
```

This fixes a v1 bug: importing the published package previously executed `ReactDOM.createRoot(...)` because the lib entry doubled as the demo. The fix lands in the same major bump.

### 4.5 Versioning

Major bump 1.0.0 → 2.0.0:
- New default config (`gentle` vs current `{tension:176, friction:26}`) for consumers not passing `animationHeightConfig`.
- Removed React-render side-effect from the lib entry.

A "Migrating from 1.x" section in the README explains how to restore v1 behavior:

```tsx
<Collapsible animationHeightConfig={{ mass: 1, tension: 176, friction: 26 }} />
```

## 5. Playground

### 5.1 Vite configuration

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: "playground",
  base: "/collapsible/",
  build: {
    outDir: "../playground-dist",
    emptyOutDir: true,
  },
  server: { port: 5173, open: true },
});
```

`base` only applies to `vite build`; local `vite` dev server serves from `/`.

### 5.2 Layout and navigation

`App.tsx` holds a single `useState<TView>` and renders a sidebar plus a content area. No router.

```ts
type TView = "presets" | "mass" | "tension" | "friction" | "accordion" | "sandbox";
```

Layout: 280px sidebar on the left, max-width 960px content area on the right, sticky header per view with the example title.

### 5.3 Examples (5 pages)

Each example uses a shared `ExamplePage` wrapper (title + lead description + grid of cards) and `ConfigCard` (a header that toggles a `<Collapsible />` underneath, labeled with the parameter being demonstrated).

| # | View id | File | Demonstrates | Layout |
|---|---|---|---|---|
| 1 | `presets` | `PresetsExample.tsx` | `animationPreset="gentle"\|"wobbly"\|"stiff"` plus a "Toggle all" button to fire all cards simultaneously | grid 3 cols |
| 2 | `mass` | `MassSpectrumExample.tsx` | `mass: 0.5 / 1 / 2 / 5` at fixed `tension=180, friction=18` | grid 4 cols |
| 3 | `tension` | `TensionSpectrumExample.tsx` | `tension: 80 / 150 / 220 / 400` at fixed `mass=1, friction=18` | grid 4 cols |
| 4 | `friction` | `FrictionSpectrumExample.tsx` | `friction: 8 / 16 / 26 / 60` at fixed `mass=1, tension=180` | grid 4 cols |
| 5 | `accordion` | `AccordionExample.tsx` | `isAccordion=true` with three FAQ tabs, `animationPreset="wobbly"` | vertical stack |

Each card uses one of three lorem snippets (short / medium / long) from `examples/shared/content.ts`. Spectrum examples use `medium` to keep heights comparable.

### 5.4 Sandbox

#### 5.4.1 State shape

```ts
// playground/sandbox/types.ts
export type TSandboxConfig = {
  preset: TAnimationPreset;
  heightConfig: { mass: number; tension: number; friction: number };
  opacityDuration: number;
  isAnimateOpacity: boolean;
  isAnimateHeight: boolean;
  isOverflowHidden: boolean;
  isContentSelectable: boolean;
  minHeight: number;
};

export type TProfilesStore = {
  schemaVersion: 1;
  profiles: Record<string, TSandboxConfig>;
};
```

#### 5.4.2 Persistence (`useProfiles`)

- Storage key: `collapsible-playground:profiles`.
- On mount: read `localStorage`. If missing or `schemaVersion !== 1`, start with an empty store. No migration logic in v1.
- Mutations are flushed synchronously via `localStorage.setItem`. All access wrapped in `try/catch` — on failure the profile lives in memory only and a toast informs the user that persistence is disabled.
- API: `save(name, config)`, `load(name)`, `remove(name)`, `list()`. `save` with an existing name overwrites; the UI prompts for confirmation before calling `save` in that case.

#### 5.4.3 Slider ranges and initial values

| Control | min | max | step | initial |
|---|---|---|---|---|
| mass | 0.1 | 5 | 0.1 | 1 |
| tension | 1 | 500 | 1 | 180 |
| friction | 1 | 100 | 1 | 18 |
| opacityDuration | 0 | 2000 | 50 | 250 |
| minHeight | 0 | 200 | 5 | 0 |

v1 always boots with these `initial` values regardless of whether saved profiles exist. Auto-loading the most-recently-used profile on mount is deferred (see §11 O1).

#### 5.4.4 Boolean toggles

- `isAnimateOpacity` (default `true`)
- `isAnimateHeight` (default `true`)
- `isOverflowHidden` (default `true`)
- `isContentSelectable` (default `true`)

#### 5.4.5 Preset selector

A `<select>` with `gentle / wobbly / stiff`. When the selector changes:
- `config.preset` is updated.
- `config.heightConfig` mass/tension/friction are *replaced* with the preset values, so the sliders move to reflect the chosen preset.
- After the user moves a slider, `heightConfig` diverges from the preset — that's expected and matches the override semantics in the library.

### 5.5 Slider, Toggle, Select primitives

Native HTML `<input type="range">`, `<input type="checkbox">`, `<select>` styled via CSS modules. No external UI library. Each primitive renders its current value beside the control.

## 6. Tooling

### 6.1 `package.json`

```jsonc
{
  "name": "collapsible",
  "version": "2.0.0",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "sideEffects": false,
  "scripts": {
    "dev": "vite",
    "lint": "tsc --noEmit",
    "build": "tsup --config tsup.config.ts",
    "playground:build": "vite build",
    "playground:preview": "vite preview"
  },
  "peerDependencies": {
    "react": ">=18",
    "react-dom": ">=18",
    "@react-spring/web": "^9.7.5"
  },
  "devDependencies": {
    "vite": "^5.4.0",
    "@vitejs/plugin-react": "^4.3.0",
    "tsup": "^8.3.5",
    "typescript": "latest",
    "react": "latest",
    "react-dom": "latest",
    "@react-spring/web": "^9.7.5",
    "@types/react": "latest",
    "@types/react-dom": "latest"
  }
}
```

Notes:
- `tsup`, `react`, `react-dom`, `@react-spring/web` move from `dependencies` to `devDependencies` (and the latter three are re-declared as `peerDependencies`). This ships the package without forcing duplicate copies on consumers.
- `files` ensures only the built `dist/` is published.

### 6.2 `tsconfig.json`

Two changes:
- `"jsx": "react-jsx"` (was `"react"`). Modern JSX transform — no need to import React in every file.
- `"include": ["src", "playground"]`.

### 6.3 `tsconfig.lib.json` (new)

```jsonc
{
  "extends": "./tsconfig.json",
  "compilerOptions": { "noEmit": false, "declaration": true },
  "include": ["src"],
  "exclude": ["playground"]
}
```

### 6.4 `tsup.config.ts` (new)

```ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.tsx"],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  external: ["react", "react-dom", "@react-spring/web"],
});
```

## 7. GitHub Pages deployment

`.github/workflows/deploy-playground.yml`:

```yaml
name: Deploy Playground to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run playground:build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./playground-dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

One-time manual setup in GitHub UI: Settings → Pages → Source: **GitHub Actions**. This is documented in the updated README.

## 8. README updates

- Add a short "Animation presets" section with a `<Collapsible animationPreset="..." />` example.
- Add a "Migrating from 1.x" section.
- Add a "Playground" section linking to `https://kolosochek.github.io/collapsible/`.
- Replace the CodeSandbox link with the GitHub Pages link.

## 9. Verification (manual)

| # | Action | Expected |
|---|---|---|
| 1 | `npm install` | Completes without errors |
| 2 | `npm run lint` | `tsc --noEmit` passes for `src` + `playground` |
| 3 | `npm run dev`, open `http://localhost:5173` | Sidebar + Presets example render |
| 4 | Click each sidebar item | Each view renders without runtime errors |
| 5 | Presets example: open all three cards | Visibly different easing per preset |
| 6 | Mass / Tension / Friction examples | Spectrum cards open with visibly different character |
| 7 | Accordion example: open tab 1, then tab 2 | Tab 1 collapses automatically |
| 8 | Sandbox: drag tension slider | Live preview re-springs with the new tension |
| 9 | Sandbox: "Save as…" → name → reload page | Profile persists, visible in profiles list |
| 10 | Sandbox: load saved profile | Controls and live preview restore from the profile |
| 11 | `npm run build` | `dist/index.{js,mjs,d.ts}` emitted; bundle does not call `ReactDOM.createRoot` |
| 12 | `npm run playground:build` | `playground-dist/index.html` references `/collapsible/assets/...` |
| 13 | Push to main → GH Actions green | Live URL `https://kolosochek.github.io/collapsible/` serves the playground |

## 10. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Breaking change: default config flips from `{tension:176, friction:26}` to `gentle{120,14}` | Major bump 2.0.0 + "Migrating from 1.x" README section with the one-line restore snippet. |
| v1 lib entry rendered React on import (bug) | Fixed in 2.0.0 as a side-effect of cleaning `src/index.tsx`. Documented in the major bump notes. |
| `localStorage` unavailable (private mode, quota) | `useProfiles` wraps access in try/catch; profiles fall back to in-memory; UI shows "Persistence disabled" toast. |
| CSS conflicts between playground and library | Library uses CSS modules under `src/components/...`; playground uses its own modules under `playground/...`. No global stylesheet from the library. |
| GH Pages first deploy requires UI toggle | Documented in README; first deploy may require flipping Source to "GitHub Actions" once. |
| `base: "/collapsible/"` could break local dev | Vite only applies `base` during `build`; dev server serves at `/`. Verified by Vite's documented behavior. |
| Type-checking `playground/` slows CI | Acceptable; full repo lint is one `tsc --noEmit` run. If it becomes an issue, split into `lint:lib` and `lint:playground`. |

## 11. Open questions / explicit deferrals

- **O1.** Auto-loading the most-recently-used profile on mount is deferred to a future version. v1 always uses the hard-coded `initial` slider values from §5.4.3. `TProfilesStore` does not need a `lastUsed` field.
- **O2.** URL-shareable sandbox state — explicitly deferred (see Non-goals).
- **O3.** Test runner setup — explicitly deferred (see Non-goals).

## 12. Summary of decisions

| Decision | Choice |
|---|---|
| Project structure | Vite + `playground/` folder; library entry cleaned to exports only |
| Preset names | `gentle / wobbly / stiff` (matches react-spring) |
| Default preset | `"gentle"` |
| Preset prop API | `animationPreset?: TAnimationPreset = "gentle"`; explicit `animationHeightConfig` overrides per-key |
| Examples | 5 pages: Presets, Mass, Tension, Friction, FAQ Accordion |
| Sandbox controls | Sliders for all numeric params, toggles for booleans, preset selector |
| Sandbox persistence | Named profiles in `localStorage` (no URL share in v1) |
| Navigation | Sidebar + `useState`, no router |
| Sliders | Native `<input type="range">` styled via CSS modules |
| Versioning | Major bump 1.0.0 → 2.0.0 |
| Hosting | GitHub Pages from Actions, modern (no `gh-pages` branch) |
