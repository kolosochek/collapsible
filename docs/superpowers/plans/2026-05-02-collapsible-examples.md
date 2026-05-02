# Collapsible Examples, Sandbox, Presets and GitHub Pages — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a Vite-based playground with five static examples, an interactive sandbox with named profiles, three first-class animation presets on `<Collapsible />`, and a GitHub Pages deployment.

**Architecture:** The library lives in `src/` and is built by `tsup` into `dist/`; the playground lives in `playground/` and is built by Vite. Both share `tsconfig.json`. A new `animationPreset` prop selects from three named configs (`gentle`, `wobbly`, `stiff`); explicit `animationHeightConfig` overrides per-key. GitHub Actions builds the playground on push to `main` and deploys via `actions/deploy-pages@v4`.

**Tech Stack:** React 18+, TypeScript, `@react-spring/web@9.7.5`, `tsup` (library build), Vite 5 + `@vitejs/plugin-react` (playground), GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-05-02-collapsible-examples-design.md`

---

## Pre-flight notes

- **No test runner.** The spec defers automated testing. Each task ends with deterministic verification (`tsc --noEmit`, `npm run build`) plus manual smoke checks against the playground at `http://localhost:5173`. There is no `vitest`/`jest` setup; do not add one.
- **Branch.** Work on a feature branch off `main` (e.g., `feat/playground-and-presets`). Final merge strategy is the maintainer's choice.
- **Commit style.** Follow existing repo style — short imperative subject, optional body. Co-Author footer included as per global instructions.
- **Stage specifically.** Never `git add .` / `-A`. Always stage named files.

---

## File Structure

| Path | Action | Purpose |
|---|---|---|
| `package.json` | modify | scripts, deps, peer-deps, version 2.0.0 |
| `.gitignore` | modify | un-ignore `package-lock.json`, ignore `playground-dist` |
| `tsconfig.json` | modify | `jsx: react-jsx`, include playground |
| `tsconfig.lib.json` | create | tsup-only TS config |
| `tsup.config.ts` | create | library build config |
| `vite.config.ts` | create | Vite config with `base: /collapsible/` |
| `src/index.tsx` | rewrite | exports only — no React render |
| `src/components/Collapsible/presets.ts` | create | `PRESETS`, `TAnimationPreset` |
| `src/components/Collapsible/Collapsible.tsx` | modify | wire `animationPreset` prop |
| `src/types/collapsible.ts` | modify | add `animationPreset` to props type |
| `playground/index.html` | create | Vite entry HTML |
| `playground/main.tsx` | create | React root mount |
| `playground/App.tsx` | create | layout + nav state |
| `playground/styles/global.css` | create | base styles |
| `playground/nav/Sidebar.tsx` | create | view switcher |
| `playground/examples/shared/ExamplePage.tsx` | create | layout wrapper |
| `playground/examples/shared/ConfigCard.tsx` | create | toggleable card with config label |
| `playground/examples/shared/content.ts` | create | lorem snippets |
| `playground/examples/PresetsExample.tsx` | create | preset showcase |
| `playground/examples/MassSpectrumExample.tsx` | create | mass spectrum |
| `playground/examples/TensionSpectrumExample.tsx` | create | tension spectrum |
| `playground/examples/FrictionSpectrumExample.tsx` | create | friction spectrum |
| `playground/examples/AccordionExample.tsx` | create | FAQ accordion |
| `playground/examples/registry.ts` | create | view → component mapping |
| `playground/sandbox/types.ts` | create | `TSandboxConfig`, `TProfilesStore` |
| `playground/sandbox/controls/Slider.tsx` | create | range input primitive |
| `playground/sandbox/controls/Toggle.tsx` | create | checkbox primitive |
| `playground/sandbox/controls/Select.tsx` | create | select primitive |
| `playground/sandbox/useProfiles.ts` | create | localStorage hook |
| `playground/sandbox/ControlsPanel.tsx` | create | all controls |
| `playground/sandbox/ProfilesPanel.tsx` | create | save/load/delete UI |
| `playground/sandbox/Sandbox.tsx` | create | composite |
| `playground/sandbox/styles.module.css` | create | sandbox layout |
| `.github/workflows/deploy-playground.yml` | create | CI deploy |
| `README.md` | rewrite | docs + migration + playground link |
| `public/index.html` | delete | replaced by `playground/index.html` |

---

## Task 1: Tooling overhaul (package.json, tsconfigs, tsup config)

**Files:**
- Modify: `package.json`
- Modify: `.gitignore`
- Modify: `tsconfig.json`
- Create: `tsconfig.lib.json`
- Create: `tsup.config.ts`

- [ ] **Step 1: Rewrite `package.json`**

Replace the file contents with:

```jsonc
{
  "name": "collapsible",
  "version": "2.0.0",
  "description": "Collapse\\expand block for any react applications",
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
  "repository": {
    "type": "git",
    "url": "git+https://github.com/kolosochek/collapsible.git#main"
  },
  "keywords": ["react", "react-spring", "collapse", "expand", "animation"],
  "author": "Dmitriy Kolosovskiy",
  "license": "GPL-3.0-or-later",
  "bugs": {
    "url": "https://github.com/kolosochek/collapsible/issues"
  },
  "homepage": "https://github.com/kolosochek/collapsible/tree/main#readme",
  "peerDependencies": {
    "react": ">=18",
    "react-dom": ">=18",
    "@react-spring/web": "^9.7.5"
  },
  "devDependencies": {
    "@react-spring/web": "^9.7.5",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tsup": "^8.3.5",
    "typescript": "^5.6.3",
    "vite": "^5.4.0"
  }
}
```

> **Note:** `typescript` is pinned to `^5.6.3` (latest TS5) instead of `latest`. TypeScript 6 introduces stricter checks (`moduleResolution: "node"` becomes a hard error, `react-jsx` transform changes children inference) that conflict with `@react-spring/web@9.7.5`'s typings. Pinning to TS5 keeps the plan working as written. React/react-dom and their types are pinned to known-good 18.x rather than `latest` for the same stability reason.

- [ ] **Step 2: Update `.gitignore`**

Replace contents with:

```
node_modules
dist
playground-dist
.idea
.DS_Store
```

(Removed `package-lock.json` so the lockfile is committed for reproducible CI builds. Added `playground-dist`.)

- [ ] **Step 3: Update `tsconfig.json`**

Replace contents with:

```jsonc
{
  "compilerOptions": {
    "target": "es2023",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src", "playground"]
}
```

- [ ] **Step 4: Create `tsconfig.lib.json`**

```jsonc
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": false,
    "declaration": true
  },
  "include": ["src"],
  "exclude": ["playground"]
}
```

- [ ] **Step 5: Create `tsup.config.ts`**

```ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.tsx"],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  external: ["react", "react-dom", "@react-spring/web"],
  tsconfig: "tsconfig.lib.json",
});
```

- [ ] **Step 6: Install dependencies**

Run: `npm install`
Expected: completes without errors. `package-lock.json` is generated.

- [ ] **Step 7: Verify type-check still passes**

Run: `npm run lint`
Expected: no TypeScript errors. Note that `src/index.tsx` still contains the React render at this point — that's fine for tsc, it's removed in Task 4.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json .gitignore tsconfig.json tsconfig.lib.json tsup.config.ts
git commit -m "$(cat <<'EOF'
Configure Vite + tsup tooling and bump deps

- Move react/react-dom/@react-spring/web from deps to peerDeps
- Add Vite + plugin-react devDeps
- Add tsup.config.ts and tsconfig.lib.json (library-only build)
- Bump version 1.0.0 -> 2.0.0
- Commit package-lock.json for reproducible CI

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Vite + minimal playground bootstrap

**Files:**
- Create: `vite.config.ts`
- Create: `playground/index.html`
- Create: `playground/main.tsx`
- Create: `playground/App.tsx` (placeholder)
- Create: `playground/styles/global.css`
- Delete: `public/index.html`

- [ ] **Step 1: Create `vite.config.ts`**

```ts
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

- [ ] **Step 2: Create `playground/index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Collapsible — Playground</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Create `playground/main.tsx`**

```tsx
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/global.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element with id 'root' was not found");
}
createRoot(rootElement).render(<App />);
```

- [ ] **Step 4: Create `playground/styles/global.css`**

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body,
#root {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue",
    Arial, sans-serif;
  color: #1a1a1a;
  background: #fafafa;
}

a {
  color: #0a66c2;
}

h1 {
  margin: 0 0 0.25rem;
  font-size: 1.6rem;
}

p {
  line-height: 1.55;
}
```

- [ ] **Step 5: Create `playground/App.tsx` (placeholder)**

```tsx
const App = () => {
  return (
    <div style={{ padding: 24 }}>
      <h1>Collapsible — Playground</h1>
      <p>Bootstrap OK. Sidebar and content come in Task 5.</p>
    </div>
  );
};

export default App;
```

- [ ] **Step 6: Delete `public/index.html`**

Run: `rm public/index.html && rmdir public`
Expected: `public/` directory removed.

- [ ] **Step 7: Run dev server and verify**

Run: `npm run dev`
Expected: browser opens at `http://localhost:5173/` and shows "Collapsible — Playground / Bootstrap OK." Stop the dev server with Ctrl+C.

- [ ] **Step 8: Run lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 9: Commit**

```bash
git add vite.config.ts playground/
git rm public/index.html
git commit -m "$(cat <<'EOF'
Bootstrap Vite playground with placeholder App

- vite.config.ts with base /collapsible/ and root playground/
- playground/index.html, main.tsx, App.tsx placeholder
- Global stylesheet (typography + reset)
- Remove obsolete public/index.html

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Library — animation presets file

**Files:**
- Create: `src/components/Collapsible/presets.ts`

- [ ] **Step 1: Create the presets file**

```ts
import { SpringConfig } from "@react-spring/web";

export const PRESETS = {
  gentle: { mass: 1, tension: 120, friction: 14 },
  wobbly: { mass: 1, tension: 180, friction: 12 },
  stiff: { mass: 1, tension: 210, friction: 20 },
} as const satisfies Record<string, SpringConfig>;

export type TAnimationPreset = keyof typeof PRESETS;
```

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/Collapsible/presets.ts
git commit -m "$(cat <<'EOF'
Add animation presets module

Three named SpringConfigs (gentle/wobbly/stiff) matching react-spring's
built-in named configs. Used by the new animationPreset prop.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Library — wire `animationPreset` prop into Collapsible

**Files:**
- Modify: `src/types/collapsible.ts`
- Modify: `src/components/Collapsible/Collapsible.tsx`
- Modify: `src/index.tsx`

- [ ] **Step 1: Add `animationPreset` to props type**

In `src/types/collapsible.ts`, add the import at the top and the new prop in `ICollapsibleBaseProps`:

```ts
import React, { Dispatch, SetStateAction } from "react";
import { SpringConfig, SpringValues } from "@react-spring/web";
import { TAnimationPreset } from "../components/Collapsible/presets";

export type TContainerHeight = SpringValues<{
  height: number | string;
  maxWidth: number | string;
  opacity: number;
}>;

const collapsibleStylesArr = ["wrapper", "content"] as const;
type TCollapsibleStylesSection = (typeof collapsibleStylesArr)[number];

type TCollapsibleStyles = Partial<{
  [key in TCollapsibleStylesSection]: React.CSSProperties;
}>;

interface ICollapsibleBaseProps {
  content: React.ReactNode;
  isExpanded: boolean;
  isInitiallyExpanded?: boolean;
  setIsExpanded: Dispatch<SetStateAction<boolean>> | ((flag: boolean) => void);
  isOverflowHidden?: boolean;
  isAnimateOpacity?: boolean;
  isAnimateHeight?: boolean;
  isSetHeightAuto?: boolean;
  isContentSelectable?: boolean;
  animationPreset?: TAnimationPreset;
  animationHeightConfig?: SpringConfig;
  animationOpacityConfig?: SpringConfig;
  customStyles?: TCollapsibleStyles;
  minHeight?: number | string;
  onAnimationFinished?: () => void;
  wrapperClassName?: string;
  finalHeight?: string;
}

interface ICollapsibleAccordionNeverProps {
  isAccordion?: never;
  accordionTabId?: never;
  openedTabId?: never;
  setOpenedTabId?: never;
}

interface ICollapsibleAccordionProps {
  isAccordion: boolean;
  accordionTabId: string;
  openedTabId: string;
  setOpenedTabId: Dispatch<SetStateAction<string>>;
}

export type TCollapsibleProps = ICollapsibleBaseProps &
  (ICollapsibleAccordionProps | ICollapsibleAccordionNeverProps);
```

- [ ] **Step 2: Update `Collapsible.tsx` — destructure and resolve config**

In `src/components/Collapsible/Collapsible.tsx`, change the destructure block and add the resolution. The full updated file:

```tsx
import React from "react";
import { useEffect, useRef } from "react";
import { animated, useSpring, SpringConfig } from "@react-spring/web";
import styles from "./styles.module.css";
import { PRESETS } from "./presets";
import { TCollapsibleProps, TContainerHeight } from "../../types/collapsible";
import { isFunction, isUndefined } from "../../types/typeguards";

const Collapsible = ({
  content,
  isExpanded,
  setIsExpanded,
  isOverflowHidden = true,
  isAnimateOpacity = true,
  isAnimateHeight = true,
  isSetHeightAuto = true,
  isAccordion = false,
  isContentSelectable = true,
  minHeight,
  animationPreset = "gentle",
  animationHeightConfig,
  animationOpacityConfig = {
    duration: 250,
  },
  wrapperClassName = "",
  customStyles,
  accordionTabId,
  openedTabId,
  setOpenedTabId,
  finalHeight = "auto",
  onAnimationFinished,
}: TCollapsibleProps) => {
  const isExpandedRef = useRef<boolean>(isExpanded);
  const isMountedRef = useRef<boolean>(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const containerContentRef = useRef<HTMLDivElement | null>(null);

  const resolvedHeightConfig: SpringConfig = {
    ...PRESETS[animationPreset],
    ...animationHeightConfig,
  };

  const handleAnimationStart = () => {
    wrapperRef.current?.classList.add(styles.state__animate);
  };

  const animationRestRef = useRef<() => void>(() => {});
  animationRestRef.current = () => {
    if (isExpandedRef.current && isSetHeightAuto) {
      api.start({
        height: finalHeight,
        immediate: true,
      });
    }
    wrapperRef.current?.classList.remove(styles.state__animate);
    if (isFunction(onAnimationFinished)) {
      onAnimationFinished();
    }
  };

  const handleAnimationRest = () => animationRestRef.current();

  const [{ height, opacity }, api] = useSpring<TContainerHeight>(() => {
    const resultContainerHeight = containerRef.current
      ? containerRef.current?.offsetHeight
      : 0;

    return {
      from: {
        height: isExpandedRef.current
          ? finalHeight
          : isAnimateHeight
          ? minHeight ?? 0
          : finalHeight,
        opacity: isUndefined(minHeight) && isAnimateOpacity ? 0 : 1,
      },
      to: {
        height: isExpandedRef.current ? finalHeight : resultContainerHeight,
        opacity: 1,
      },
      immediate: !isAnimateHeight,
      onStart: handleAnimationStart,
      onRest: handleAnimationRest,
      config: (key: string) => {
        if (key === "height") {
          return resolvedHeightConfig;
        } else if (key === "opacity" && isAnimateOpacity) {
          return animationOpacityConfig;
        }
      },
    };
  });

  const collapseContainer = (isClearAccordionTab: boolean = true) => {
    const resultContainerHeight = containerRef.current
      ? containerRef.current?.offsetHeight
      : 0;

    isExpandedRef.current = false;
    setIsExpanded(false);
    if (isFunction(setOpenedTabId) && isClearAccordionTab) {
      setOpenedTabId("");
    }
    api.start({
      from: {
        height: resultContainerHeight,
        opacity: 1,
      },
      to: {
        height: minHeight ?? 0,
        opacity: isUndefined(minHeight) && isAnimateOpacity ? 0 : 1,
      },
      immediate: !isAnimateHeight,
      onStart: handleAnimationStart,
      onRest: handleAnimationRest,
    });
  };

  const expandContainer = () => {
    if (!containerContentRef.current) return;

    isExpandedRef.current = true;
    setIsExpanded(true);
    if (isFunction(setOpenedTabId) && accordionTabId) {
      setOpenedTabId(accordionTabId);
    }
    api.start({
      height: containerContentRef.current.offsetHeight,
      opacity: 1,
      onStart: handleAnimationStart,
      onRest: handleAnimationRest,
    });
  };

  const handleStopPropagation = (
    ev: MouseEvent | React.MouseEvent | React.TouchEvent
  ) => {
    ev.stopPropagation();
  };

  const containerStyle = {
    opacity: isAnimateOpacity ? opacity : 1,
    height: height,
  };

  useEffect(() => {
    if (isAccordion && openedTabId !== accordionTabId) {
      collapseContainer(false);
    }
  }, [openedTabId]);

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      isExpandedRef.current = isExpanded;
      return;
    }

    if (!isExpanded && isExpandedRef.current) {
      collapseContainer(!isAccordion);
    } else if (isExpanded && !isExpandedRef.current) {
      expandContainer();
    }
  }, [isExpanded]);

  return (
    <div
      ref={wrapperRef}
      className={`${styles.wrapper}${
        wrapperClassName ? ` ${wrapperClassName}` : ""
      }${!isContentSelectable ? ` ${styles.state__unselectable}` : ""}${
        isOverflowHidden ? ` ${styles.state__overflow_hidden}` : ""
      }`}
      style={customStyles?.wrapper}
    >
      <animated.div
        ref={containerRef}
        style={containerStyle}
        onClick={handleStopPropagation}
        className={styles.content_wrapper}
      >
        <div ref={containerContentRef} style={customStyles?.content}>
          {content}
        </div>
      </animated.div>
    </div>
  );
};

export default Collapsible;
```

Key changes vs. v1:
- `animationPreset = "gentle"` default added.
- `animationHeightConfig` no longer has a literal default (was `{ mass: 1, tension: 176, friction: 26 }`).
- `resolvedHeightConfig = { ...PRESETS[animationPreset], ...animationHeightConfig }` computed once per render.
- `useSpring` config callback for `"height"` returns `resolvedHeightConfig`.

- [ ] **Step 3: Replace `src/index.tsx` with library exports only**

```tsx
export { default as Collapsible } from "./components/Collapsible/Collapsible";
export { PRESETS } from "./components/Collapsible/presets";
export type { TAnimationPreset } from "./components/Collapsible/presets";
export type { TCollapsibleProps } from "./types/collapsible";
```

- [ ] **Step 4: Run lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 5: Run library build**

Run: `npm run build`
Expected: `dist/index.js`, `dist/index.mjs`, `dist/index.d.ts` are created. Inspect `dist/index.mjs` to confirm no `createRoot` calls — only exports.

Run: `grep -c "createRoot" dist/index.mjs || echo "0 matches"`
Expected: `0 matches`.

- [ ] **Step 6: Commit**

```bash
git add src/types/collapsible.ts src/components/Collapsible/Collapsible.tsx src/index.tsx
git commit -m "$(cat <<'EOF'
Add animationPreset prop and clean library entry

- New animationPreset prop (gentle|wobbly|stiff), default "gentle"
- Explicit animationHeightConfig overrides preset per-key
- Clean src/index.tsx to exports-only (fixes v1 bug where
  importing the package executed ReactDOM.createRoot)

BREAKING CHANGE: default animation config changes from
{tension:176, friction:26} to gentle {tension:120, friction:14}.
Pass animationHeightConfig={{mass:1,tension:176,friction:26}} to
restore v1 behavior.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Sidebar nav + App layout

**Files:**
- Create: `playground/nav/Sidebar.tsx`
- Modify: `playground/App.tsx`
- Modify: `playground/styles/global.css` (add layout classes)

- [ ] **Step 1: Add layout styles to `playground/styles/global.css`**

Append to the existing file:

```css
.app__layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  min-height: 100vh;
}

.app__sidebar {
  background: #fff;
  border-right: 1px solid #e5e5e5;
  padding: 24px 0;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

.app__sidebar h2 {
  margin: 0 24px 16px;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #6b6b6b;
}

.app__nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.app__nav-item {
  display: block;
  width: 100%;
  text-align: left;
  background: transparent;
  border: none;
  padding: 10px 24px;
  font: inherit;
  color: #1a1a1a;
  cursor: pointer;
}

.app__nav-item:hover {
  background: #f1f1f1;
}

.app__nav-item--active {
  background: #1a1a1a;
  color: #fff;
}

.app__main {
  padding: 32px 40px 80px;
  max-width: 960px;
  width: 100%;
}
```

- [ ] **Step 2: Create `playground/nav/Sidebar.tsx`**

```tsx
import "../styles/global.css";

export type TView =
  | "presets"
  | "mass"
  | "tension"
  | "friction"
  | "accordion"
  | "sandbox";

const NAV_ITEMS: Array<{ id: TView; label: string; group: "examples" | "interactive" }> = [
  { id: "presets", label: "1. Presets", group: "examples" },
  { id: "mass", label: "2. Mass spectrum", group: "examples" },
  { id: "tension", label: "3. Tension spectrum", group: "examples" },
  { id: "friction", label: "4. Friction spectrum", group: "examples" },
  { id: "accordion", label: "5. FAQ accordion", group: "examples" },
  { id: "sandbox", label: "Sandbox", group: "interactive" },
];

type Props = {
  active: TView;
  onChange: (view: TView) => void;
};

const Sidebar = ({ active, onChange }: Props) => {
  const examples = NAV_ITEMS.filter((i) => i.group === "examples");
  const interactive = NAV_ITEMS.filter((i) => i.group === "interactive");

  return (
    <aside className="app__sidebar">
      <h2>Examples</h2>
      <ul className="app__nav-list">
        {examples.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={`app__nav-item${
                active === item.id ? " app__nav-item--active" : ""
              }`}
              onClick={() => onChange(item.id)}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
      <h2 style={{ marginTop: 24 }}>Interactive</h2>
      <ul className="app__nav-list">
        {interactive.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={`app__nav-item${
                active === item.id ? " app__nav-item--active" : ""
              }`}
              onClick={() => onChange(item.id)}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
```

- [ ] **Step 3: Update `playground/App.tsx`**

Replace the placeholder with:

```tsx
import { useState } from "react";
import Sidebar, { TView } from "./nav/Sidebar";

const App = () => {
  const [view, setView] = useState<TView>("presets");

  return (
    <div className="app__layout">
      <Sidebar active={view} onChange={setView} />
      <main className="app__main">
        <h1>{view}</h1>
        <p>View "{view}" — content arrives in later tasks.</p>
      </main>
    </div>
  );
};

export default App;
```

- [ ] **Step 4: Run lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 5: Manual verify**

Run: `npm run dev` (in another terminal). At `http://localhost:5173/`:
- Sidebar shows two groups (Examples / Interactive) with six clickable items.
- Clicking a sidebar item swaps the heading in the main area.
- Active item is visually highlighted.

Stop with Ctrl+C.

- [ ] **Step 6: Commit**

```bash
git add playground/nav/Sidebar.tsx playground/App.tsx playground/styles/global.css
git commit -m "$(cat <<'EOF'
Add sidebar nav and view switching in playground

- TView union for the six available views
- Sidebar groups examples + interactive sections
- App.tsx wires useState<TView> to Sidebar.onChange

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Shared example primitives (content + ExamplePage + ConfigCard)

**Files:**
- Create: `playground/examples/shared/content.ts`
- Create: `playground/examples/shared/ExamplePage.tsx`
- Create: `playground/examples/shared/ConfigCard.tsx`
- Create: `playground/examples/shared/styles.module.css`

- [ ] **Step 1: Create `playground/examples/shared/content.ts`**

```ts
export type TContentLength = "short" | "medium" | "long";

const SNIPPETS: Record<TContentLength, string> = {
  short:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur eget nisi a enim luctus efficitur.",
  medium:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur eget nisi a enim luctus efficitur. " +
    "Phasellus pellentesque, lectus id sodales pretium, lacus tortor convallis nibh, eu venenatis arcu eros vitae nibh. " +
    "Donec vitae diam et nibh sagittis suscipit a non quam. Aliquam erat volutpat.",
  long:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur eget nisi a enim luctus efficitur. " +
    "Phasellus pellentesque, lectus id sodales pretium, lacus tortor convallis nibh, eu venenatis arcu eros vitae nibh. " +
    "Donec vitae diam et nibh sagittis suscipit a non quam. Aliquam erat volutpat. " +
    "Sed ac libero in mauris pulvinar consequat. Suspendisse potenti. Nullam non purus a magna ullamcorper sodales. " +
    "Mauris pellentesque, sapien id rutrum euismod, eros lectus dictum erat, et tincidunt erat justo nec lacus. " +
    "Cras vitae nisl id risus aliquam pharetra. Etiam sit amet pretium tellus, in tristique tortor.",
};

export const getContent = (length: TContentLength = "medium"): string =>
  SNIPPETS[length];
```

- [ ] **Step 2: Create `playground/examples/shared/styles.module.css`**

```css
.lead {
  margin: 0 0 24px;
  color: #4a4a4a;
  font-size: 0.95rem;
}

.grid {
  display: grid;
  gap: 16px;
}

.grid_3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.grid_4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.grid_1 {
  grid-template-columns: 1fr;
}

.toolbar {
  display: flex;
  gap: 8px;
  margin: 0 0 16px;
}

.toolbar button {
  padding: 8px 14px;
  border: 1px solid #d4d4d4;
  background: #fff;
  border-radius: 6px;
  font: inherit;
  cursor: pointer;
}

.toolbar button:hover {
  background: #f3f3f3;
}

.card {
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  overflow: hidden;
}

.card_header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  font-family: ui-monospace, "SF Mono", Menlo, monospace;
  font-size: 0.85rem;
  background: #f7f7f7;
  cursor: pointer;
  user-select: none;
}

.card_header span:last-child {
  color: #6b6b6b;
}

.card_content {
  padding: 12px 14px;
  font-size: 0.9rem;
  line-height: 1.55;
  color: #333;
}
```

- [ ] **Step 3: Create `playground/examples/shared/ExamplePage.tsx`**

```tsx
import styles from "./styles.module.css";

type Props = {
  title: string;
  description: string;
  children: React.ReactNode;
};

const ExamplePage = ({ title, description, children }: Props) => (
  <section>
    <h1>{title}</h1>
    <p className={styles.lead}>{description}</p>
    {children}
  </section>
);

export default ExamplePage;
```

- [ ] **Step 4: Create `playground/examples/shared/ConfigCard.tsx`**

```tsx
import { useState, useEffect } from "react";
import { SpringConfig } from "@react-spring/web";
import { Collapsible, TAnimationPreset } from "../../../src";
import { getContent, TContentLength } from "./content";
import styles from "./styles.module.css";

export type TSyncCommand = { isOpen: boolean; key: number };

type Props = {
  label: string;
  preset?: TAnimationPreset;
  config?: SpringConfig;
  contentLength?: TContentLength;
  syncCommand?: TSyncCommand;
};

const ConfigCard = ({
  label,
  preset,
  config,
  contentLength = "medium",
  syncCommand,
}: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (syncCommand) setIsExpanded(syncCommand.isOpen);
  }, [syncCommand]);

  return (
    <article className={styles.card}>
      <header
        className={styles.card_header}
        onClick={() => setIsExpanded((p) => !p)}
      >
        <span>{label}</span>
        <span>{isExpanded ? "▲" : "▼"}</span>
      </header>
      <Collapsible
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        animationPreset={preset}
        animationHeightConfig={config}
        content={<div className={styles.card_content}>{getContent(contentLength)}</div>}
      />
    </article>
  );
};

export default ConfigCard;
```

The `syncCommand` carries a unique `key` per click, so React's identity check sees a new object each time and the effect re-fires even when `isOpen` repeats.

- [ ] **Step 5: Run lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add playground/examples/shared/
git commit -m "$(cat <<'EOF'
Add shared example primitives

- content.ts: lorem snippets in 3 lengths
- ExamplePage: title + lead + children wrapper
- ConfigCard: clickable header toggling a Collapsible
- syncedExpanded prop allows a parent to fire all cards together

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Five example pages

**Files:**
- Create: `playground/examples/PresetsExample.tsx`
- Create: `playground/examples/MassSpectrumExample.tsx`
- Create: `playground/examples/TensionSpectrumExample.tsx`
- Create: `playground/examples/FrictionSpectrumExample.tsx`
- Create: `playground/examples/AccordionExample.tsx`
- Create: `playground/examples/registry.ts`
- Modify: `playground/App.tsx` (use registry)

- [ ] **Step 1: Create `playground/examples/PresetsExample.tsx`**

```tsx
import { useRef, useState } from "react";
import { TAnimationPreset } from "../../src";
import ExamplePage from "./shared/ExamplePage";
import ConfigCard, { TSyncCommand } from "./shared/ConfigCard";
import styles from "./shared/styles.module.css";

const PRESETS_LIST: TAnimationPreset[] = ["gentle", "wobbly", "stiff"];

const PresetsExample = () => {
  const tickRef = useRef(0);
  const [syncCommand, setSyncCommand] = useState<TSyncCommand | undefined>(undefined);

  const fire = (isOpen: boolean) => {
    tickRef.current += 1;
    setSyncCommand({ isOpen, key: tickRef.current });
  };

  return (
    <ExamplePage
      title="1. Presets — gentle / wobbly / stiff"
      description="Three named presets. Click each card individually, or use Open all / Close all to fire them simultaneously and compare the easing characters side by side."
    >
      <div className={styles.toolbar}>
        <button type="button" onClick={() => fire(true)}>
          Open all
        </button>
        <button type="button" onClick={() => fire(false)}>
          Close all
        </button>
      </div>
      <div className={`${styles.grid} ${styles.grid_3}`}>
        {PRESETS_LIST.map((preset) => (
          <ConfigCard
            key={preset}
            label={`animationPreset="${preset}"`}
            preset={preset}
            syncCommand={syncCommand}
          />
        ))}
      </div>
    </ExamplePage>
  );
};

export default PresetsExample;
```

- [ ] **Step 2: Create `playground/examples/MassSpectrumExample.tsx`**

```tsx
import ExamplePage from "./shared/ExamplePage";
import ConfigCard from "./shared/ConfigCard";
import styles from "./shared/styles.module.css";

const MASS_VALUES = [0.5, 1, 2, 5];

const MassSpectrumExample = () => (
  <ExamplePage
    title="2. Mass spectrum"
    description="Increasing mass at fixed tension (180) and friction (18). Higher mass feels heavier and slower to start; lower mass feels light and snappy."
  >
    <div className={`${styles.grid} ${styles.grid_4}`}>
      {MASS_VALUES.map((mass) => (
        <ConfigCard
          key={mass}
          label={`mass: ${mass}`}
          config={{ mass, tension: 180, friction: 18 }}
        />
      ))}
    </div>
  </ExamplePage>
);

export default MassSpectrumExample;
```

- [ ] **Step 3: Create `playground/examples/TensionSpectrumExample.tsx`**

```tsx
import ExamplePage from "./shared/ExamplePage";
import ConfigCard from "./shared/ConfigCard";
import styles from "./shared/styles.module.css";

const TENSION_VALUES = [80, 150, 220, 400];

const TensionSpectrumExample = () => (
  <ExamplePage
    title="3. Tension spectrum"
    description="Increasing tension at fixed mass (1) and friction (18). Higher tension means a stiffer spring — faster acceleration, sharper finish."
  >
    <div className={`${styles.grid} ${styles.grid_4}`}>
      {TENSION_VALUES.map((tension) => (
        <ConfigCard
          key={tension}
          label={`tension: ${tension}`}
          config={{ mass: 1, tension, friction: 18 }}
        />
      ))}
    </div>
  </ExamplePage>
);

export default TensionSpectrumExample;
```

- [ ] **Step 4: Create `playground/examples/FrictionSpectrumExample.tsx`**

```tsx
import ExamplePage from "./shared/ExamplePage";
import ConfigCard from "./shared/ConfigCard";
import styles from "./shared/styles.module.css";

const FRICTION_VALUES = [8, 16, 26, 60];

const FrictionSpectrumExample = () => (
  <ExamplePage
    title="4. Friction spectrum"
    description="Increasing friction at fixed mass (1) and tension (180). Lower friction lets the spring overshoot and bounce; higher friction critically damps it."
  >
    <div className={`${styles.grid} ${styles.grid_4}`}>
      {FRICTION_VALUES.map((friction) => (
        <ConfigCard
          key={friction}
          label={`friction: ${friction}`}
          config={{ mass: 1, tension: 180, friction }}
        />
      ))}
    </div>
  </ExamplePage>
);

export default FrictionSpectrumExample;
```

- [ ] **Step 5: Create `playground/examples/AccordionExample.tsx`**

```tsx
import { useState } from "react";
import { Collapsible } from "../../src";
import ExamplePage from "./shared/ExamplePage";
import styles from "./shared/styles.module.css";

const FAQ = [
  {
    id: "what",
    question: "What is this library?",
    answer:
      "A small React component for collapse/expand interactions, animated by react-spring. " +
      "It exposes a controlled isExpanded prop and a rich set of animation knobs.",
  },
  {
    id: "physics",
    question: "How does the animation work?",
    answer:
      "The component uses a react-spring useSpring hook to animate height and opacity. " +
      "The height spring config is selected from a preset (gentle, wobbly, stiff) and can be " +
      "overridden per-key via animationHeightConfig.",
  },
  {
    id: "accordion",
    question: "Can I use this as an accordion?",
    answer:
      "Yes — pass isAccordion=true and a shared openedTabId state. When one tab opens, " +
      "the others collapse automatically.",
  },
];

const AccordionExample = () => {
  const [openedTabId, setOpenedTabId] = useState("");
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});

  const setIsExpandedFor = (id: string) => (flag: boolean) => {
    setExpandedMap((prev) => ({ ...prev, [id]: flag }));
  };

  return (
    <ExamplePage
      title="5. FAQ Accordion"
      description="A real-world use of isAccordion=true with the wobbly preset. Opening one tab collapses the others."
    >
      <div className={`${styles.grid} ${styles.grid_1}`}>
        {FAQ.map((item) => (
          <article key={item.id} className={styles.card}>
            <header
              className={styles.card_header}
              onClick={() => setIsExpandedFor(item.id)(!expandedMap[item.id])}
            >
              <span>{item.question}</span>
              <span>{expandedMap[item.id] ? "▲" : "▼"}</span>
            </header>
            <Collapsible
              isExpanded={!!expandedMap[item.id]}
              setIsExpanded={setIsExpandedFor(item.id)}
              isAccordion
              accordionTabId={item.id}
              openedTabId={openedTabId}
              setOpenedTabId={setOpenedTabId}
              animationPreset="wobbly"
              content={<div className={styles.card_content}>{item.answer}</div>}
            />
          </article>
        ))}
      </div>
    </ExamplePage>
  );
};

export default AccordionExample;
```

- [ ] **Step 6: Create `playground/examples/registry.ts`**

```ts
import { ComponentType } from "react";
import { TView } from "../nav/Sidebar";
import PresetsExample from "./PresetsExample";
import MassSpectrumExample from "./MassSpectrumExample";
import TensionSpectrumExample from "./TensionSpectrumExample";
import FrictionSpectrumExample from "./FrictionSpectrumExample";
import AccordionExample from "./AccordionExample";

export const REGISTRY: Record<Exclude<TView, "sandbox">, ComponentType> = {
  presets: PresetsExample,
  mass: MassSpectrumExample,
  tension: TensionSpectrumExample,
  friction: FrictionSpectrumExample,
  accordion: AccordionExample,
};
```

- [ ] **Step 7: Update `playground/App.tsx` to use registry**

```tsx
import { useState } from "react";
import Sidebar, { TView } from "./nav/Sidebar";
import { REGISTRY } from "./examples/registry";

const App = () => {
  const [view, setView] = useState<TView>("presets");

  if (view === "sandbox") {
    return (
      <div className="app__layout">
        <Sidebar active={view} onChange={setView} />
        <main className="app__main">
          <h1>Sandbox</h1>
          <p>Sandbox arrives in Tasks 8–12.</p>
        </main>
      </div>
    );
  }

  const ActiveView = REGISTRY[view];

  return (
    <div className="app__layout">
      <Sidebar active={view} onChange={setView} />
      <main className="app__main">
        <ActiveView />
      </main>
    </div>
  );
};

export default App;
```

- [ ] **Step 8: Run lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 9: Manual verify all five examples**

Run: `npm run dev`. At `http://localhost:5173/`:
- "1. Presets": three cards labeled gentle/wobbly/stiff. "Open all" expands them simultaneously — visibly different animation characters (gentle smoother, wobbly bounces, stiff faster).
- "2. Mass spectrum": four cards (0.5/1/2/5). Higher mass = slower start.
- "3. Tension spectrum": four cards (80/150/220/400). Higher tension = quicker.
- "4. Friction spectrum": four cards (8/16/26/60). Friction 8 visibly bounces; friction 60 is critically damped.
- "5. FAQ Accordion": three FAQ items; clicking a closed tab opens it and closes any other open tab.

Stop with Ctrl+C.

- [ ] **Step 10: Commit**

```bash
git add playground/examples/ playground/App.tsx
git commit -m "$(cat <<'EOF'
Add five example pages and registry

- PresetsExample with Open all / Close all toolbar
- Mass / Tension / Friction spectrum examples
- FAQ AccordionExample using isAccordion + wobbly preset
- registry.ts maps view ids to components

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Sandbox types + control primitives

**Files:**
- Create: `playground/sandbox/types.ts`
- Create: `playground/sandbox/controls/Slider.tsx`
- Create: `playground/sandbox/controls/Toggle.tsx`
- Create: `playground/sandbox/controls/Select.tsx`
- Create: `playground/sandbox/styles.module.css`

- [ ] **Step 1: Create `playground/sandbox/types.ts`**

```ts
import { TAnimationPreset } from "../../src";

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

export const INITIAL_CONFIG: TSandboxConfig = {
  preset: "gentle",
  heightConfig: { mass: 1, tension: 180, friction: 18 },
  opacityDuration: 250,
  isAnimateOpacity: true,
  isAnimateHeight: true,
  isOverflowHidden: true,
  isContentSelectable: true,
  minHeight: 0,
};
```

- [ ] **Step 2: Create `playground/sandbox/styles.module.css`**

```css
.layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.panel {
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 16px;
}

.panel_title {
  margin: 0 0 12px;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #6b6b6b;
}

.control_row {
  display: grid;
  grid-template-columns: 110px 1fr 60px;
  align-items: center;
  gap: 12px;
  margin: 8px 0;
}

.control_row label {
  font-size: 0.85rem;
  font-family: ui-monospace, "SF Mono", Menlo, monospace;
}

.control_row input[type="range"] {
  width: 100%;
}

.control_row .value {
  font-size: 0.85rem;
  font-family: ui-monospace, "SF Mono", Menlo, monospace;
  text-align: right;
  color: #444;
}

.toggle_row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 6px 0;
  font-size: 0.85rem;
}

.select_row {
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 12px;
  align-items: center;
  margin: 8px 0;
}

.select_row select {
  padding: 6px 8px;
  border: 1px solid #d4d4d4;
  border-radius: 4px;
  font: inherit;
}

.profiles_list {
  list-style: none;
  margin: 0 0 12px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.profile_item {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 8px;
  align-items: center;
  padding: 6px 8px;
  background: #f7f7f7;
  border-radius: 4px;
  font-size: 0.85rem;
}

.profile_item button {
  padding: 4px 8px;
  border: 1px solid #d4d4d4;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  font: inherit;
  font-size: 0.8rem;
}

.profile_actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.preview {
  margin-top: 24px;
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 16px;
}

.preview button {
  padding: 8px 14px;
  border: 1px solid #d4d4d4;
  background: #fafafa;
  border-radius: 6px;
  cursor: pointer;
  font: inherit;
  margin-bottom: 12px;
}

.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: #1a1a1a;
  color: #fff;
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 0.85rem;
}
```

- [ ] **Step 3: Create `playground/sandbox/controls/Slider.tsx`**

```tsx
import styles from "../styles.module.css";

type Props = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
};

const Slider = ({ label, value, min, max, step, onChange, format }: Props) => (
  <div className={styles.control_row}>
    <label>{label}</label>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    />
    <span className={styles.value}>{format ? format(value) : value}</span>
  </div>
);

export default Slider;
```

- [ ] **Step 4: Create `playground/sandbox/controls/Toggle.tsx`**

```tsx
import styles from "../styles.module.css";

type Props = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

const Toggle = ({ label, checked, onChange }: Props) => (
  <label className={styles.toggle_row}>
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
    <span>{label}</span>
  </label>
);

export default Toggle;
```

- [ ] **Step 5: Create `playground/sandbox/controls/Select.tsx`**

```tsx
import styles from "../styles.module.css";

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
};

const Select = <T extends string>({ label, value, options, onChange }: Props<T>) => (
  <div className={styles.select_row}>
    <label>{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value as T)}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </div>
);

export default Select;
```

- [ ] **Step 6: Run lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add playground/sandbox/types.ts playground/sandbox/controls/ playground/sandbox/styles.module.css
git commit -m "$(cat <<'EOF'
Add sandbox types and control primitives

- TSandboxConfig, TProfilesStore, INITIAL_CONFIG
- Slider, Toggle, Select primitives (native inputs + CSS module)
- Sandbox layout styles

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: useProfiles localStorage hook

**Files:**
- Create: `playground/sandbox/useProfiles.ts`

- [ ] **Step 1: Create `playground/sandbox/useProfiles.ts`**

```ts
import { useCallback, useEffect, useRef, useState } from "react";
import { TProfilesStore, TSandboxConfig } from "./types";

const STORAGE_KEY = "collapsible-playground:profiles";
const SCHEMA_VERSION = 1 as const;

const emptyStore = (): TProfilesStore => ({
  schemaVersion: SCHEMA_VERSION,
  profiles: {},
});

const loadStore = (): { store: TProfilesStore; persistenceOk: boolean } => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { store: emptyStore(), persistenceOk: true };
    const parsed = JSON.parse(raw) as TProfilesStore;
    if (parsed.schemaVersion !== SCHEMA_VERSION) {
      return { store: emptyStore(), persistenceOk: true };
    }
    return { store: parsed, persistenceOk: true };
  } catch {
    return { store: emptyStore(), persistenceOk: false };
  }
};

const saveStore = (store: TProfilesStore): boolean => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    return true;
  } catch {
    return false;
  }
};

export type TUseProfiles = {
  list: () => string[];
  save: (name: string, config: TSandboxConfig) => void;
  load: (name: string) => TSandboxConfig | undefined;
  remove: (name: string) => void;
  exists: (name: string) => boolean;
  persistenceOk: boolean;
};

export const useProfiles = (): TUseProfiles => {
  const initial = useRef(loadStore());
  const [store, setStore] = useState<TProfilesStore>(initial.current.store);
  const [persistenceOk, setPersistenceOk] = useState(initial.current.persistenceOk);

  useEffect(() => {
    const ok = saveStore(store);
    if (!ok) setPersistenceOk(false);
  }, [store]);

  const list = useCallback(
    () => Object.keys(store.profiles).sort((a, b) => a.localeCompare(b)),
    [store]
  );

  const save = useCallback(
    (name: string, config: TSandboxConfig) => {
      setStore((prev) => ({
        ...prev,
        profiles: { ...prev.profiles, [name]: config },
      }));
    },
    []
  );

  const load = useCallback(
    (name: string): TSandboxConfig | undefined => {
      const entry = store.profiles[name];
      return entry ? { ...entry, heightConfig: { ...entry.heightConfig } } : undefined;
    },
    [store]
  );

  const remove = useCallback((name: string) => {
    setStore((prev) => {
      const next = { ...prev.profiles };
      delete next[name];
      return { ...prev, profiles: next };
    });
  }, []);

  const exists = useCallback((name: string) => name in store.profiles, [store]);

  return { list, save, load, remove, exists, persistenceOk };
};
```

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add playground/sandbox/useProfiles.ts
git commit -m "$(cat <<'EOF'
Add useProfiles hook for sandbox profile persistence

- localStorage-backed CRUD: list/save/load/remove/exists
- Schema versioning (v1) — older/missing data resets to empty
- persistenceOk flag flips false when localStorage throws,
  letting UI show a non-blocking notice

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: ControlsPanel + ProfilesPanel

**Files:**
- Create: `playground/sandbox/ControlsPanel.tsx`
- Create: `playground/sandbox/ProfilesPanel.tsx`

- [ ] **Step 1: Create `playground/sandbox/ControlsPanel.tsx`**

```tsx
import { TAnimationPreset, PRESETS } from "../../src";
import { TSandboxConfig } from "./types";
import Slider from "./controls/Slider";
import Toggle from "./controls/Toggle";
import Select from "./controls/Select";
import styles from "./styles.module.css";

type Props = {
  value: TSandboxConfig;
  onChange: (next: TSandboxConfig) => void;
};

const PRESET_OPTIONS: Array<{ value: TAnimationPreset; label: string }> = [
  { value: "gentle", label: "gentle" },
  { value: "wobbly", label: "wobbly" },
  { value: "stiff", label: "stiff" },
];

const ControlsPanel = ({ value, onChange }: Props) => {
  const setHeight = (key: "mass" | "tension" | "friction", n: number) =>
    onChange({
      ...value,
      heightConfig: { ...value.heightConfig, [key]: n },
    });

  const setPreset = (preset: TAnimationPreset) =>
    onChange({
      ...value,
      preset,
      heightConfig: { ...PRESETS[preset] },
    });

  return (
    <section className={styles.panel}>
      <h2 className={styles.panel_title}>Controls</h2>

      <Select
        label="preset"
        value={value.preset}
        options={PRESET_OPTIONS}
        onChange={setPreset}
      />

      <Slider
        label="mass"
        min={0.1}
        max={5}
        step={0.1}
        value={value.heightConfig.mass}
        onChange={(n) => setHeight("mass", n)}
        format={(n) => n.toFixed(1)}
      />
      <Slider
        label="tension"
        min={1}
        max={500}
        step={1}
        value={value.heightConfig.tension}
        onChange={(n) => setHeight("tension", n)}
      />
      <Slider
        label="friction"
        min={1}
        max={100}
        step={1}
        value={value.heightConfig.friction}
        onChange={(n) => setHeight("friction", n)}
      />
      <Slider
        label="opacity (ms)"
        min={0}
        max={2000}
        step={50}
        value={value.opacityDuration}
        onChange={(n) => onChange({ ...value, opacityDuration: n })}
      />
      <Slider
        label="minHeight"
        min={0}
        max={200}
        step={5}
        value={value.minHeight}
        onChange={(n) => onChange({ ...value, minHeight: n })}
      />

      <div style={{ marginTop: 12 }}>
        <Toggle
          label="isAnimateOpacity"
          checked={value.isAnimateOpacity}
          onChange={(b) => onChange({ ...value, isAnimateOpacity: b })}
        />
        <Toggle
          label="isAnimateHeight"
          checked={value.isAnimateHeight}
          onChange={(b) => onChange({ ...value, isAnimateHeight: b })}
        />
        <Toggle
          label="isOverflowHidden"
          checked={value.isOverflowHidden}
          onChange={(b) => onChange({ ...value, isOverflowHidden: b })}
        />
        <Toggle
          label="isContentSelectable"
          checked={value.isContentSelectable}
          onChange={(b) => onChange({ ...value, isContentSelectable: b })}
        />
      </div>
    </section>
  );
};

export default ControlsPanel;
```

- [ ] **Step 2: Create `playground/sandbox/ProfilesPanel.tsx`**

```tsx
import { useState } from "react";
import { TSandboxConfig, INITIAL_CONFIG } from "./types";
import { TUseProfiles } from "./useProfiles";
import styles from "./styles.module.css";

type Props = {
  profiles: TUseProfiles;
  currentConfig: TSandboxConfig;
  onLoad: (config: TSandboxConfig) => void;
};

const ProfilesPanel = ({ profiles, currentConfig, onLoad }: Props) => {
  const [draftName, setDraftName] = useState("");

  const handleSave = () => {
    const name = draftName.trim();
    if (!name) return;
    if (profiles.exists(name)) {
      const ok = window.confirm(`Profile "${name}" already exists. Overwrite?`);
      if (!ok) return;
    }
    profiles.save(name, currentConfig);
    setDraftName("");
  };

  const handleDelete = (name: string) => {
    const ok = window.confirm(`Delete profile "${name}"?`);
    if (ok) profiles.remove(name);
  };

  const items = profiles.list();

  return (
    <section className={styles.panel}>
      <h2 className={styles.panel_title}>Profiles</h2>

      {items.length === 0 ? (
        <p style={{ margin: "0 0 12px", color: "#6b6b6b", fontSize: "0.85rem" }}>
          No saved profiles yet. Tweak the controls and save them with a name.
        </p>
      ) : (
        <ul className={styles.profiles_list}>
          {items.map((name) => (
            <li key={name} className={styles.profile_item}>
              <span>{name}</span>
              <button
                type="button"
                onClick={() => {
                  const cfg = profiles.load(name);
                  if (cfg) onLoad(cfg);
                }}
              >
                Load
              </button>
              <button type="button" onClick={() => handleDelete(name)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className={styles.profile_actions}>
        <input
          type="text"
          placeholder="Profile name"
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
          }}
          style={{ flex: 1, padding: "6px 8px", border: "1px solid #d4d4d4", borderRadius: 4 }}
        />
        <button type="button" onClick={handleSave}>
          Save as…
        </button>
        <button type="button" onClick={() => onLoad(INITIAL_CONFIG)}>
          Reset
        </button>
      </div>
    </section>
  );
};

export default ProfilesPanel;
```

- [ ] **Step 3: Run lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add playground/sandbox/ControlsPanel.tsx playground/sandbox/ProfilesPanel.tsx
git commit -m "$(cat <<'EOF'
Add ControlsPanel and ProfilesPanel

- ControlsPanel: preset selector + 5 sliders + 4 toggles
  Changing preset replaces mass/tension/friction sliders
- ProfilesPanel: list of saved profiles with Load/Delete,
  Save as... with name input, Reset to INITIAL_CONFIG
  Overwrite confirm via window.confirm

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: Sandbox composite + wire into App

**Files:**
- Create: `playground/sandbox/Sandbox.tsx`
- Modify: `playground/App.tsx`

- [ ] **Step 1: Create `playground/sandbox/Sandbox.tsx`**

```tsx
import { useState } from "react";
import { Collapsible } from "../../src";
import { TSandboxConfig, INITIAL_CONFIG } from "./types";
import { useProfiles } from "./useProfiles";
import ControlsPanel from "./ControlsPanel";
import ProfilesPanel from "./ProfilesPanel";
import { getContent } from "../examples/shared/content";
import styles from "./styles.module.css";

const Sandbox = () => {
  const [config, setConfig] = useState<TSandboxConfig>(INITIAL_CONFIG);
  const [isExpanded, setIsExpanded] = useState(false);
  const profiles = useProfiles();

  return (
    <section>
      <h1>Sandbox</h1>
      <p style={{ margin: "0 0 24px", color: "#4a4a4a", fontSize: "0.95rem" }}>
        Live tweak every Collapsible knob and persist named profiles in localStorage.
      </p>

      <div className={styles.layout}>
        <ControlsPanel value={config} onChange={setConfig} />
        <ProfilesPanel
          profiles={profiles}
          currentConfig={config}
          onLoad={setConfig}
        />
      </div>

      <div className={styles.preview}>
        <button type="button" onClick={() => setIsExpanded((p) => !p)}>
          {isExpanded ? "Close preview" : "Open preview"}
        </button>
        <Collapsible
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
          animationPreset={config.preset}
          animationHeightConfig={config.heightConfig}
          animationOpacityConfig={{ duration: config.opacityDuration }}
          isAnimateOpacity={config.isAnimateOpacity}
          isAnimateHeight={config.isAnimateHeight}
          isOverflowHidden={config.isOverflowHidden}
          isContentSelectable={config.isContentSelectable}
          minHeight={config.minHeight}
          content={
            <div style={{ padding: 12, background: "#f7f7f7", borderRadius: 6 }}>
              {getContent("medium")}
            </div>
          }
        />
      </div>

      {!profiles.persistenceOk && (
        <div className={styles.toast}>
          localStorage is unavailable — profiles will not persist across reload.
        </div>
      )}
    </section>
  );
};

export default Sandbox;
```

- [ ] **Step 2: Update `playground/App.tsx`**

```tsx
import { useState } from "react";
import Sidebar, { TView } from "./nav/Sidebar";
import { REGISTRY } from "./examples/registry";
import Sandbox from "./sandbox/Sandbox";

const App = () => {
  const [view, setView] = useState<TView>("presets");

  const Body = view === "sandbox" ? Sandbox : REGISTRY[view];

  return (
    <div className="app__layout">
      <Sidebar active={view} onChange={setView} />
      <main className="app__main">
        <Body />
      </main>
    </div>
  );
};

export default App;
```

- [ ] **Step 3: Run lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 4: Manual verify the sandbox**

Run: `npm run dev`. Click "Sandbox" in the sidebar.

- The Controls panel shows a preset dropdown, five sliders, four toggles.
- The Preview area shows a button "Open preview" plus a Collapsible.
- Clicking the button toggles the collapsible. Changing the `tension` slider while open re-springs to the new value live.
- Changing the preset dropdown moves the mass/tension/friction sliders to match.
- Save as… "test-profile" → profile appears in the list.
- Reload the page → "test-profile" still in the list.
- Click Load on "test-profile" → sliders restore.
- Delete the profile via Delete → confirm → it disappears.
- Reset → controls revert to INITIAL_CONFIG.

Stop with Ctrl+C.

- [ ] **Step 5: Commit**

```bash
git add playground/sandbox/Sandbox.tsx playground/App.tsx
git commit -m "$(cat <<'EOF'
Add Sandbox composite and wire into App

- Sandbox holds TSandboxConfig + isExpanded state
- ControlsPanel + ProfilesPanel + live <Collapsible /> preview
- Toast surfaces localStorage failure (private mode / quota)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 12: GitHub Actions deployment workflow

**Files:**
- Create: `.github/workflows/deploy-playground.yml`

- [ ] **Step 1: Create the workflow file**

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

- [ ] **Step 2: Verify the playground build locally**

Run: `npm run playground:build`
Expected: `playground-dist/index.html` is created. Open it in a text editor and confirm asset paths reference `/collapsible/`.

Run: `grep -o 'src="[^"]*"' playground-dist/index.html`
Expected: paths starting with `/collapsible/assets/`.

- [ ] **Step 3: Verify build output**

Run: `npm run playground:preview`
Expected: starts a static server. The preview will serve under `/collapsible/` so it may not work as-is at root — that's fine; the published GitHub Pages URL (`/collapsible/`) is what matters.

Stop with Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/deploy-playground.yml
git commit -m "$(cat <<'EOF'
Add GitHub Pages deployment workflow

- Build playground on push to main
- Lint check before build
- Modern Pages flow via actions/deploy-pages@v4 (no gh-pages branch)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 13: README and migration notes

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace `README.md`**

```markdown
# Collapsible

A small, focused React component for collapse/expand interactions, animated by [react-spring](https://www.react-spring.dev/).

🎨 **Live playground:** https://kolosochek.github.io/collapsible/

## Install

```bash
npm install collapsible @react-spring/web
```

`react`, `react-dom`, and `@react-spring/web` are peer dependencies.

## Usage

```tsx
import { useState } from "react";
import { Collapsible } from "collapsible";

const App = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <>
      <button onClick={() => setIsExpanded((p) => !p)}>Toggle</button>
      <Collapsible
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        content={<p>Content goes here.</p>}
      />
    </>
  );
};
```

## Animation presets

The component ships three named presets that match react-spring's built-in named configs:

| Preset | mass | tension | friction | Character |
|---|---|---|---|---|
| `gentle` (default) | 1 | 120 | 14 | Soft, no overshoot |
| `wobbly` | 1 | 180 | 12 | Visible bounce |
| `stiff` | 1 | 210 | 20 | Fast, crisp |

```tsx
<Collapsible animationPreset="wobbly" /* ... */ />
```

Override individual keys with `animationHeightConfig` — explicit values win per-key:

```tsx
<Collapsible
  animationPreset="wobbly"
  animationHeightConfig={{ tension: 300 }}  // wobbly mass + friction, custom tension
/>
```

## Migrating from 1.x

The default animation config changed in 2.0.0. v1 used `{ mass: 1, tension: 176, friction: 26 }` — close to react-spring's `default`. v2 uses the new `gentle` preset (`{ mass: 1, tension: 120, friction: 14 }`).

To restore exact v1 behavior:

```tsx
<Collapsible
  animationHeightConfig={{ mass: 1, tension: 176, friction: 26 }}
  /* ... */
/>
```

Also: importing the package in v1 inadvertently called `ReactDOM.createRoot` because the lib entry doubled as a demo. v2 ships an exports-only entry; this side-effect is gone.

## Local development

```bash
npm install
npm run dev          # Vite playground at http://localhost:5173/
npm run lint         # tsc --noEmit
npm run build        # tsup library build into dist/
```

## Deploying the playground

The playground deploys to GitHub Pages automatically on push to `main` via `.github/workflows/deploy-playground.yml`. First-time setup: in the repo's **Settings → Pages**, set **Source** to **GitHub Actions**.

## License

GPL-3.0-or-later — see [LICENSE](./LICENSE).
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "$(cat <<'EOF'
Rewrite README for v2 and the new playground

- Document the three animation presets
- Migration section for 1.x consumers
- Note the v1 lib-entry side-effect fix
- Local dev / build / deploy commands
- Link to live GitHub Pages playground

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 14: Final verification

This task does not modify code — it runs the manual verification checklist from the spec end-to-end.

- [ ] **Step 1: Clean install**

Run: `rm -rf node_modules dist playground-dist && npm install`
Expected: completes without errors.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: zero errors across `src/` + `playground/`.

- [ ] **Step 3: Library build**

Run: `npm run build`
Expected: `dist/index.js`, `dist/index.mjs`, `dist/index.d.ts` exist.

Run: `grep -c "createRoot" dist/index.mjs || echo 0`
Expected: `0`.

- [ ] **Step 4: Playground build**

Run: `npm run playground:build`
Expected: `playground-dist/index.html` exists.

Run: `grep -o '/collapsible/assets/[^"]*' playground-dist/index.html | head -3`
Expected: at least one matching path is printed.

- [ ] **Step 5: Dev server smoke (golden path)**

Run: `npm run dev`. At `http://localhost:5173/`:

| Check | Expected |
|---|---|
| Sidebar renders six items in two groups | yes |
| 1. Presets — Open all → all three cards expand with visibly different easing | yes |
| 2. Mass spectrum — open mass=0.5 vs mass=5 | mass=5 noticeably slower to start |
| 3. Tension spectrum — open tension=80 vs tension=400 | tension=400 noticeably faster |
| 4. Friction spectrum — open friction=8 vs friction=60 | friction=8 visibly bounces |
| 5. FAQ Accordion — open tab 1, then tab 2 | tab 1 collapses |
| Sandbox — drag tension slider while preview open | preview re-springs live |
| Sandbox — Save as "test" → reload page | "test" still in profiles list |
| Sandbox — load "test" | controls + preview restore |
| Sandbox — Reset | controls revert to defaults |

Stop with Ctrl+C.

- [ ] **Step 6: Push and verify deploy**

Push the feature branch and open a PR (or, if working directly on main, push to main). After merging to main:

- The GitHub Actions workflow runs (`Deploy Playground to GitHub Pages`).
- First-time setup if needed: **Settings → Pages → Source → GitHub Actions**.
- After the workflow succeeds, visit `https://kolosochek.github.io/collapsible/` and re-run the smoke checks from Step 5.

This step requires GitHub credentials and is performed by the maintainer — not by the implementing agent.

- [ ] **Step 7: No commit needed**

Verification only — no code changes in this task.

---

## Summary of commits in execution order

1. `Configure Vite + tsup tooling and bump deps`
2. `Bootstrap Vite playground with placeholder App`
3. `Add animation presets module`
4. `Add animationPreset prop and clean library entry`
5. `Add sidebar nav and view switching in playground`
6. `Add shared example primitives`
7. `Add five example pages and registry`
8. `Add sandbox types and control primitives`
9. `Add useProfiles hook for sandbox profile persistence`
10. `Add ControlsPanel and ProfilesPanel`
11. `Add Sandbox composite and wire into App`
12. `Add GitHub Pages deployment workflow`
13. `Rewrite README for v2 and the new playground`
14. (no commit — verification only)

---

## Spec coverage check (self-review)

| Spec section / requirement | Task |
|---|---|
| §3.1 Repository layout | T1, T2, T6, T7, T8, T10, T11, T12 |
| §3.2 Library / playground separation | T1 (`tsconfig.lib.json`, `tsup.config.ts`) |
| §4.1 Presets file | T3 |
| §4.2 Prop API + override semantics | T4 |
| §4.3 `Collapsible.tsx` internals | T4 |
| §4.4 Library entry rewrite | T4 |
| §4.5 Versioning (2.0.0) | T1 |
| §5.1 Vite config | T2 |
| §5.2 Layout + nav | T5 |
| §5.3 Five examples | T7 (and T6 shared) |
| §5.4.1 State shape | T8 |
| §5.4.2 useProfiles | T9 |
| §5.4.3 Slider ranges + INITIAL_CONFIG | T8 |
| §5.4.4 Boolean toggles | T10 |
| §5.4.5 Preset selector behavior | T10 |
| §5.5 Native control primitives | T8 |
| §6.1 package.json | T1 |
| §6.2–6.4 tsconfig / tsconfig.lib / tsup | T1 |
| §7 GH Actions workflow | T12 |
| §8 README updates | T13 |
| §9 Manual verification | T14 |
| §10 Risks (peer deps, lib entry, base path, localStorage, CSS, GH Pages, lint scope) | mitigations applied across T1, T4, T2, T9, T6, T13, T1 |
| §11 O1 (no auto-load lastUsed) | T8 (`INITIAL_CONFIG` always boots) |
| §11 O2 (no URL share) | not implemented — explicit deferral |
| §11 O3 (no test runner) | not implemented — explicit deferral |
