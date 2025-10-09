Reactive Cursors - package

Click effects

- You can pass a `clickEffect` prop to `ReactiveCursor` in the component package. It accepts an object or an array of objects. Each object has:

- `type`: "scale" | "ripple" | "rotate" | "colorShift" | "burst"
- (aliases) Each effect can also be referenced with the `onclick_` prefix, for example `onclick_ripple` or `onclick_scale`. The component will accept either name.
- `amount?`: number - meaning depends on the effect (scale multiplier, ripple size in px, burst particle count, etc.)
- `durationMs?`: number - animation duration in ms (default 250)
- `color?`: string - CSS color used for ripple/burst/colorShift accents

Loader & adding new effects

- The package includes a small dynamic loader that scans `package/src/effects/` for `*.ts` effect modules during development (Vite) and builds a registry automatically. Drop a new effect file into that folder (default-exporting the effect handler) and it becomes available without editing the registry.
- Naming convention: use `onclick_` prefix for files that are explicitly click effects (e.g. `onclick_ripple.ts`). The loader will also register an alias without the prefix (so both `ripple` and `onclick_ripple` work).

Effect developer contract

- Default export should be a function with the signature (cfg, ctx) => void where:
  - cfg: { type, amount?, durationMs?, color? }
  - ctx: { event: PointerEvent, cursorRef: HTMLDivElement | null, layerElements: HTMLElement[], zIndex: number }
- Effects should be responsible for cleanup (remove DOM nodes, restore attributes) or use setTimeout to revert visual changes after `cfg.durationMs`.

Examples


Single effect:

```jsx
<ReactiveCursor clickEffect={{ type: "scale", amount: 1.6, durationMs: 220 }} />
```

Multiple effects:

```jsx
<ReactiveCursor
  clickEffect={[
    { type: "scale", amount: 1.4 },
    // or use the alias:
    { type: "onclick_ripple", amount: 120, color: "rgba(255,255,255,0.9)" },
  ]}
/>
```
