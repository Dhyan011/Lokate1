# Plan: Animated R3F Hero Background

## Context

The project is a bare React + Vite + Tailwind v4 starter. We need to build a live, animated React Three Fiber scene that replaces the "hero-3d-placeholder" Figma layer. The scene sits behind DOM-layer text (z-index layering). The canvas must be transparent, fitting the page's `#F7F5F1` background.

## New packages to install

```
pnpm add three @react-three/fiber @react-three/drei @react-three/postprocessing
pnpm add -D @types/three
```

## File plan

### `src/App.tsx`
Becomes the hero shell. Full-viewport layout with a `position: relative` wrapper. The R3F canvas is `position: absolute, inset: 0` (z-index 0). A DOM overlay div (`z-index: 10`) holds headline text, subhead, and CTA buttons layered on top.

### `src/components/HeroScene.tsx`  
The R3F `<Canvas>` component. Wrapped in `<Suspense>`. Uses IntersectionObserver to unmount the entire `<Canvas>` when off-screen (fully releases the WebGL context, better for GPU/battery). Do NOT use `frameloop="demand"` for this — demand mode only re-renders on explicit `invalidate()` calls and won't drive continuous animation. Contains:

- `<NodeGraph />` — the main scene object
- `<PostProcessing />` — bloom pass
- Camera and lighting setup

### `src/components/NodeGraph.tsx`
The animated graph scene. Responsibilities:
- Generate 25-30 nodes at mount with `useMemo`: random positions within an 8×5×4 bounding box, biased toward upper-right (add +2 offset on X, +1.5 on Y). Each node stores: position, radius (0.15–0.4), phase offset (random 0–2π), period (3–5s), and `isActive` flag (4-6 nodes marked active with green #4A7C59 vs amber #C97A4A).
- Compute edges with `useMemo`: for each node, find 2-3 nearest neighbors (sort by distance, take the closest 2-3, skip if already connected in reverse). Edges stored as pairs of indices.
- Slow Y-axis rotation of the whole group: `groupRef.current.rotation.y += delta * (2 * Math.PI / 50)` (~50s period) in `useFrame`.
- Per-node pulse: each node's scale and emissiveIntensity driven by `Math.sin(time + phase) * 0.075 + 1.0` (scale) and `Math.sin(time + phase) * 0.3 + 0.4` (emissive).
- Pointer parallax: inside `useFrame((state) => {...})`, read `state.pointer.x` and `state.pointer.y` (R3F updates these from window-level pointer events automatically — do NOT use `onPointerMove` on scene objects, which only fires when the pointer hits a mesh). Lerp camera position toward the pointer offset each frame (`lerp` factor 0.05, shift ±0.5 units). DOM overlay text (headline, subhead) must have `pointer-events: none` so events reach the canvas; only CTA buttons retain pointer events.

### Node rendering
`<mesh>` with `<sphereGeometry args={[radius, 16, 16]} />` and `<meshStandardMaterial color={nodeColor} emissive={nodeColor} emissiveIntensity={pulsedIntensity} roughness={0.6} metalness={0.1} />`.

### Edge rendering
Use `<Line>` from `@react-three/drei` with `vertexColors` for the gradient effect (start color: transparent/dark `#1E2233` at 0 opacity, bright at node proximity). Alternatively: `THREE.BufferGeometry` line segments with vertex colors computed per-segment (3 points: start → mid → end, colors alpha-blended). Opacity: 0.25 base, additive blend.

Simpler approach (Phase 1): flat-color `<Line>` with color `#1E2233` opacity 0.3. Gradient can be added in Phase 2.

### `src/components/PostProcessing.tsx`
```tsx
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'

<EffectComposer>
  <Bloom luminanceThreshold={0.4} luminanceSmoothing={0.9} intensity={0.6} blendFunction={BlendFunction.ADD} />
</EffectComposer>
```

### Lighting
```tsx
<ambientLight intensity={0.4} color="#FFF8F0" />
<directionalLight position={[4, 6, 3]} intensity={0.8} color="#FFE8CC" />
```

No harsh specular — roughness 0.6 ensures soft diffuse only.

### Canvas setup
```tsx
<Canvas
  camera={{ position: [0, 0, 8], fov: 50 }}
  gl={{ alpha: true, antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.85 }}
  {/* NOTE: ACESFilmicToneMapping at 0.85 exposure will shift rendered colors from the exact CSS hex values — verify by eye in Phase 2 */}
  style={{ position: 'absolute', inset: 0 }}
>
```

### Static fallback
Use this function (called once at module level, not per-render) to detect WebGL capability — checking the constructor alone is insufficient since GPU blacklisting/driver issues can fail silently:

```ts
function canUseWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch (e) {
    return false
  }
}

const WEBGL_AVAILABLE = canUseWebGL()
```

If `!WEBGL_AVAILABLE`, render a `<div>` with a CSS radial gradient approximating the amber glow cluster.

## Build sequence (per brief spec)

1. **Phase 1**: 10 static nodes, no pulse, no parallax, no bloom → confirm 60fps
2. **Phase 2**: add 25-30 nodes + Y-axis rotation + per-node pulse
3. **Phase 3**: add pointer parallax
4. **Phase 4**: add bloom postprocessing

The plan file tracks all phases but implementation should follow this sequence.

## Verification

- Run `pnpm dev` (already running on $PORT), open preview panel
- Visually confirm: transparent canvas, amber nodes, green active nodes, thin edges, slow rotation
- Open browser DevTools → Performance tab, record 5s → confirm ~60fps on the animated scene
- Cover/shrink the viewport: IntersectionObserver should pause the render loop (frameloop="demand" + no rAF)
- Disable WebGL in DevTools (simulate) or check the fallback branch renders the gradient div
