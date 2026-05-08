---
name: swap-wind-scene-assets
description: >
  Replace the basic SVG windmills and flowers in WindScene with custom images,
  sprites, or animations. Use when the user provides their own asset files and
  wants them wired into the interactive wind scene on the home page.
---

# Swap Wind Scene Assets

The interactive wind scene lives in `src/components/WindScene.tsx`.

## Architecture quick-reference

| Concept | Location in file |
|---|---|
| Element layout (position, scale, count) | `ELEMENTS` array at top of file |
| Physics constants (radius, damping, speed) | `INFLUENCE_RADIUS`, `DAMPING`, `VELOCITY_SCALE` constants |
| Windmill SVG | `Windmill` component — hub at SVG coords (30, 28), rotor `<g>` rotates |
| Flower SVG | `Flower` component — head center at (24, 24), head `<g>` rotates |
| Rotation hook-up | `rotorRef` prop → stored in `rotorRefs` map → mutated each RAF frame |

The key invariant: **whatever the user provides as an asset, the rotating part must be wrapped in a `<g>` (or `<div>` for img/video) that receives the `rotorRef` prop**. The physics engine sets `element.style.transform = rotate(Ndeg)` on that element every animation frame.

---

## Recipe 1 — Replace SVG blades with a custom image

User provides: `public/windmill-blades.png` (transparent background, blades centered in the image)

In `Windmill`:
```tsx
function Windmill({ rotorRef }: { rotorRef: (el: SVGGElement | null) => void }) {
  return (
    <svg width="60" height="130" viewBox="0 0 60 130" overflow="visible">
      {/* Keep tower and base polygons unchanged */}
      <polygon points="25,28 35,28 39,122 21,122" fill="#c8bfd4" />
      <rect x="15" y="120" width="30" height="7" rx="2" fill="#b8afc4" />

      {/* Replace the rotor <g> contents with a foreignObject wrapping an <img> */}
      <g ref={rotorRef} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
        <image
          href="/windmill-blades.png"
          x="6" y="4"          /* offset so image center aligns with hub (30, 28) */
          width="48" height="48"
        />
        {/* Keep hub cap on top */}
        <circle cx="30" cy="28" r="4.5" fill="#aa3bff" />
      </g>
    </svg>
  );
}
```

Adjust `x`, `y`, `width`, `height` so the image center sits at SVG coords (30, 28).

---

## Recipe 2 — Replace SVG flower head with a custom image

User provides: `public/flower-head.png` (transparent background, flower center in middle of image)

In `Flower`:
```tsx
{/* Replace the head <g> contents */}
<g ref={rotorRef} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
  <image
    href="/flower-head.png"
    x="4" y="4"              /* offset so image center aligns with (24, headCY) */
    width="40" height="40"
  />
</g>
```

---

## Recipe 3 — Use a `<div>` + `<img>` instead of SVG (for more control)

When the user provides separate PNG/WebP files for the full windmill or flower, convert the component away from SVG entirely. The `rotorRef` type changes to `HTMLDivElement`:

```tsx
function Windmill({ rotorRef }: { rotorRef: (el: HTMLDivElement | null) => void }) {
  return (
    <div style={{ position: 'relative', width: 60, height: 130 }}>
      {/* Static tower */}
      <img src="/windmill-tower.png" style={{ position: 'absolute', inset: 0, width: '100%' }} alt="" />
      {/* Rotating blades */}
      <div
        ref={rotorRef}
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '100%',
          transformOrigin: '50% 21.5%',   /* 28/130 ≈ 21.5% — hub position */
        }}
      >
        <img src="/windmill-blades.png" style={{ width: '100%' }} alt="" />
      </div>
    </div>
  );
}
```

**Important**: update the `rotorRefs` map type in `WindScene` to `Map<string, SVGGElement | HTMLDivElement>` and cast appropriately.

---

## Recipe 4 — Add a new element variant (e.g. a second windmill style)

1. Add `'windmill2'` to the `type` union in `ElementDef`.
2. Create a `Windmill2` component following the same `rotorRef` pattern.
3. Add entries to `ELEMENTS` with `type: 'windmill2'`.
4. Add a branch in the render: `el.type === 'windmill2' && <Windmill2 rotorRef={makeRotorRef(el.id)} />`.

---

## Recipe 5 — Lottie / CSS animation alternative

If the user prefers a Lottie JSON animation or CSS `@keyframes` spin instead of the JS physics loop:

- Install `lottie-react`: `bun add lottie-react`
- Replace the rotating `<g>` with `<Lottie animationData={data} loop speed={velocityValue} />`
- Drive `speed` from the physics velocity value using `useImperativeHandle` or a ref callback

For CSS keyframes, add a class `spinning` that is toggled on proximity. Adjust `animation-duration` dynamically via `el.style.animationDuration = \`${duration}ms\`` inside the RAF loop.

---

## Tuning the physics feel

All constants are at the top of `src/components/WindScene.tsx`:

| Constant | Default | Effect |
|---|---|---|
| `INFLUENCE_RADIUS` | 180 | px radius around each element that the cursor affects |
| `DAMPING` | 0.97 | Per-frame velocity multiplier (lower = stops faster) |
| `VELOCITY_SCALE` | 0.35 | How much cursor speed converts to spin speed |

---

## Adjusting the scene layout

Edit the `ELEMENTS` array in `WindScene.tsx`:

```ts
const ELEMENTS: ElementDef[] = [
  { id: 'w1', type: 'windmill', x: 17, y: 76, scale: 1.15 },
  // x = % of container width (horizontal center)
  // y = % of container height (bottom anchor of element)
  // scale = CSS scale applied to the whole element wrapper
];
```

Add, remove, or reposition entries freely. Each element auto-registers with the physics engine via its `id`.
