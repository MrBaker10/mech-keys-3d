# Design Spec: KeyboardModel Hero Component

**Date:** 2026-03-31
**Status:** Approved

## Goal

Replace the placeholder box in `KeyboardPlaceholder.tsx` with the real GLB keyboard model for the HeroSection. The model floats, rotates idly, and animates out as the user scrolls.

## Model Analysis

- File: `public/models/keyboard-draco.glb` (10 MB, already Draco-compressed)
- Source: Sketchfab — "Custom - Mechanical Keyboard" by unknown.fbx, CC-BY-4.0
- Nodes: `defaultMaterial`, `defaultMaterial_1`, `defaultMaterial_2`
- Materials: `Keyboard` (used by nodes 0 and 2), `Wood_00` (used by node 1 — wooden desk surface)
- Internal structure: double rotation group (`-π/2` + `π/2`), mesh scale `100`, position y=`-23.907`

## Component Interface

Drop-in replacement for `KeyboardPlaceholder` — no changes to `Scene.tsx` caller signature:

```ts
interface KeyboardModelProps {
  progressRef: React.MutableRefObject<number>;
}
```

## Rendering

- Load via `useGLTF('/models/keyboard-draco.glb')` (drei handles DRACOLoader automatically)
- Render only `nodes.defaultMaterial` + `nodes.defaultMaterial_2` (both `Keyboard` material)
- Skip `nodes.defaultMaterial_1` (`Wood_00`) — keyboard floats free in dark space
- Wrap rendered nodes in drei's `<Center>` for automatic origin-centering
- Outer `<group ref={groupRef} scale={0.012}>` normalizes size to ~4 world units wide
- `useGLTF.preload('/models/keyboard-draco.glb')` at file end

## Lighting

Existing lights in `Scene.tsx` stay unchanged:
- `<ambientLight intensity={0.3} />`
- `<directionalLight position={[5,5,5]} intensity={1.2} />`
- `<Environment preset="city" />`

Rim light added inside `KeyboardModel.tsx`:
- Type: `<spotLight>`
- Position: `[-4, 3, -2]` (left, above, behind)
- Color: `#E8FF47` (design system accent)
- Intensity: `8`
- Angle: `0.25`
- Penumbra: `0.8`
- Distance: `15`

Effect: neon-lime edge on the left shoulder, city environment provides soft reflections on the Keyboard material.

## Scroll Behavior

Driven by `progressRef` (written by `ScrollTrigger.onUpdate` in `Scene.tsx`, read in `useFrame` — zero re-renders):

| Property | Formula | Effect |
|---|---|---|
| `rotation.y` | `+= delta * 0.35 * (1 - p * 0.9)` | Idle spin, slows as user scrolls |
| `rotation.x` | `-0.12 + p * 0.18` | Slight tilt increases |
| `position.y` | `-1 + p * 3` | Rises and exits viewport top |
| `position.z` | `-p * 2` | Recedes into depth |

## Integration

`Scene.tsx` change — one import and one JSX element:

```diff
- import { KeyboardPlaceholder } from "./KeyboardPlaceholder";
+ import { KeyboardModel } from "./KeyboardModel";
...
- <KeyboardPlaceholder progressRef={heroProgressRef} />
+ <KeyboardModel progressRef={heroProgressRef} />
```

`KeyboardPlaceholder.tsx` is kept for now (not used by ExplodeSection).

## Performance Note

`keyboard-draco.glb` at 10 MB exceeds the < 5 MB budget in `PERFORMANCE.md`. After implementation, attempt further reduction with:

```bash
npx gltf-pipeline -i public/models/keyboard-draco.glb \
  -o public/models/keyboard-draco.glb \
  --draco.compressionLevel 10
```

If the file remains > 5 MB, document as a known exception (model from Sketchfab, CC-BY-4.0, not modifiable without quality loss).

## Files Touched

| File | Action |
|---|---|
| `src/components/three/KeyboardModel.tsx` | Create |
| `src/components/three/Scene.tsx` | Update import + JSX |
| `src/components/three/index.ts` | Add export |
