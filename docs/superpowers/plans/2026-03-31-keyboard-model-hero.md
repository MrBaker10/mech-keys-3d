# KeyboardModel Hero Component Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder box in HeroSection with the real GLB keyboard model, with rim light and scroll-driven animation.

**Architecture:** Create `KeyboardModel.tsx` as a drop-in replacement for `KeyboardPlaceholder` — same `progressRef` interface, same `useFrame` scroll pattern, zero re-renders. The GLB is loaded with `useGLTF`, only the two `Keyboard`-material meshes are rendered (Wood_00 skipped). A `spotLight` rim light sits in the unscaled group so its world-space position is independent of model scale.

**Tech Stack:** React Three Fiber, @react-three/drei (`useGLTF`, `Center`), three-stdlib (GLTF types), GSAP ScrollTrigger (via ref — no direct import needed here)

---

### Task 1: Create KeyboardModel.tsx

**Files:**
- Create: `src/components/three/KeyboardModel.tsx`

- [ ] **Step 1: Write the component**

Create `src/components/three/KeyboardModel.tsx` with this exact content:

```tsx
"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Center } from "@react-three/drei";
import type { Group, Mesh, MeshStandardMaterial } from "three";
import type { GLTF } from "three-stdlib";

type KeyboardGLTF = GLTF & {
  nodes: {
    defaultMaterial: Mesh;
    defaultMaterial_1: Mesh;
    defaultMaterial_2: Mesh;
  };
  materials: {
    Keyboard: MeshStandardMaterial;
    Wood_00: MeshStandardMaterial;
  };
};

interface KeyboardModelProps {
  progressRef: React.MutableRefObject<number>;
}

export function KeyboardModel({ progressRef }: KeyboardModelProps) {
  const groupRef = useRef<Group>(null);
  const { nodes, materials } = useGLTF(
    "/models/keyboard-draco.glb"
  ) as KeyboardGLTF;

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const p = progressRef.current;

    // Idle y-rotation — slows to near-stop as scroll progresses
    groupRef.current.rotation.y += delta * 0.35 * (1 - p * 0.9);
    // Slight tilt — increases as keyboard recedes
    groupRef.current.rotation.x = -0.12 + p * 0.18;
    // Rise with the page + recede into distance
    groupRef.current.position.y = -1 + p * 3;
    groupRef.current.position.z = -p * 2;
  });

  return (
    <group ref={groupRef}>
      {/* Rim light in unscaled space — neon-lime edge on left shoulder */}
      <spotLight
        position={[-4, 3, -2]}
        intensity={8}
        color="#E8FF47"
        angle={0.25}
        penumbra={0.8}
        distance={15}
      />

      {/* Scale-normalised model — ~4 world units wide; tune if needed */}
      <group scale={0.01}>
        <Center>
          <group rotation={[-Math.PI / 2, 0, 0]}>
            <group rotation={[Math.PI / 2, 0, 0]}>
              {/* Keyboard body */}
              <mesh
                geometry={nodes.defaultMaterial.geometry}
                material={materials.Keyboard}
                position={[0, -23.907, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                scale={100}
              />
              {/* defaultMaterial_1 (Wood_00 desk surface) intentionally omitted */}
              {/* Keyboard detail mesh (keycap area / secondary body) */}
              <mesh
                geometry={nodes.defaultMaterial_2.geometry}
                material={materials.Keyboard}
                position={[-21.666, 173.137, -75.702]}
                rotation={[-1.476, 0, 0]}
                scale={5.744}
              />
            </group>
          </group>
        </Center>
      </group>
    </group>
  );
}

useGLTF.preload("/models/keyboard-draco.glb");
```

- [ ] **Step 2: Typecheck**

```bash
pnpm typecheck
```

Expected: no errors. If `three-stdlib` types are missing, install: `pnpm add -D @types/three`.

- [ ] **Step 3: Lint**

```bash
pnpm lint
```

Expected: no errors or warnings for the new file.

- [ ] **Step 4: Commit**

```bash
git add src/components/three/KeyboardModel.tsx
git commit -m "feat: add KeyboardModel component with GLB model and rim light"
```

---

### Task 2: Wire KeyboardModel into Scene.tsx

**Files:**
- Modify: `src/components/three/Scene.tsx`

- [ ] **Step 1: Update import and JSX in Scene.tsx**

In `src/components/three/Scene.tsx`, make two changes:

Change the import line (line 7):
```diff
- import { KeyboardPlaceholder } from "./KeyboardPlaceholder";
+ import { KeyboardModel } from "./KeyboardModel";
```

Change the JSX (line 61):
```diff
- <KeyboardPlaceholder progressRef={heroProgressRef} />
+ <KeyboardModel progressRef={heroProgressRef} />
```

- [ ] **Step 2: Typecheck**

```bash
pnpm typecheck
```

Expected: no errors.

- [ ] **Step 3: Visual verification — run dev server**

```bash
pnpm dev
```

Open `http://localhost:3000`. Verify:
- Keyboard 3D model visible in hero section (not a box)
- Model rotates idly (slow y-rotation)
- Neon-lime rim light visible on left edge of keyboard
- On scroll: model rises and recedes, rotation slows
- No console errors about missing files or WebGL

**Scale tuning:** If the model appears too large or too small, adjust `scale={0.01}` in `KeyboardModel.tsx`. Increase to `0.012` if too small, decrease to `0.008` if too large. The target is roughly the same footprint as the previous placeholder box (~4 world units wide).

- [ ] **Step 4: Commit**

```bash
git add src/components/three/Scene.tsx
git commit -m "feat: swap KeyboardPlaceholder for real GLB KeyboardModel in Scene"
```

---

### Task 3: Export KeyboardModel from index.ts

**Files:**
- Modify: `src/components/three/index.ts`

- [ ] **Step 1: Add export**

In `src/components/three/index.ts`, add one line:

```diff
  export { Scene } from "./Scene";
+ export { KeyboardModel } from "./KeyboardModel";
  export { KeyboardPlaceholder } from "./KeyboardPlaceholder";
  export { KeyboardExplode } from "./KeyboardExplode";
```

- [ ] **Step 2: Typecheck + lint**

```bash
pnpm typecheck && pnpm lint
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/three/index.ts
git commit -m "chore: export KeyboardModel from three index"
```

---

### Task 4: Attempt further Draco compression

**Files:**
- Modify: `public/models/keyboard-draco.glb` (in-place recompression)

Current size: ~10 MB (target: < 5 MB per PERFORMANCE.md budget).

- [ ] **Step 1: Run gltf-pipeline at max compression**

```bash
npx gltf-pipeline \
  -i public/models/keyboard.glb \
  -o public/models/keyboard-draco.glb \
  --draco.compressionLevel 10
```

Note: use the original `keyboard.glb` as input to avoid re-compressing already-compressed data.

- [ ] **Step 2: Check resulting file size**

```bash
ls -lh public/models/keyboard-draco.glb
```

Expected: file size reduced from 10 MB. If < 5 MB: budget met. If still > 5 MB: document as known exception (model geometry complexity from Sketchfab source, CC-BY-4.0 license — no remodelling allowed).

- [ ] **Step 3: Verify model still renders**

```bash
pnpm dev
```

Reload `http://localhost:3000` and confirm the model loads and looks identical.

- [ ] **Step 4: Commit**

```bash
git add public/models/keyboard-draco.glb
git commit -m "perf: recompress keyboard GLB at Draco level 10"
```

If file size did not improve meaningfully (< 10% reduction), add a note to `PERFORMANCE.md`:

```markdown
## Known Exceptions

- `keyboard-draco.glb` (~10 MB): Sketchfab source model (CC-BY-4.0). Draco level 10
  applied. Further reduction requires mesh simplification which would alter the model.
  Accepted as a known exception until a custom low-poly model is available.
```

Then commit that too:

```bash
git add docs/PERFORMANCE.md
git commit -m "docs: note keyboard-draco.glb as known performance exception"
```
