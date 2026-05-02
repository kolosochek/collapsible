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
