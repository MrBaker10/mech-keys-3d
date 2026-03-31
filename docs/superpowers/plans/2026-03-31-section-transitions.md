# Section Transitions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate hard cuts between all sections by adding scrub-bound entry/exit animations to ExplodeSection, SwitchSection, SoundSection, MaterialSection, and SpecsSection.

**Architecture:** Each pinned section gets an `innerRef` on its `h-screen` div and a `fromTo(innerRef, {opacity:0}, {opacity:1, duration:0.08})` inserted at position `0` of its existing GSAP timeline. SwitchSection additionally zooms in its left SVG panel. SoundSection adds a separate fade-only timeline with entry + exit. SpecsSection replaces IntersectionObserver with ScrollTrigger and adds a heading animation.

**Tech Stack:** GSAP 3, `@gsap/react` (`useGSAP`), ScrollTrigger, TypeScript, Next.js 15

---

### Task 1: ExplodeSection — entry fade

**Files:**
- Modify: `src/components/sections/ExplodeSection.tsx`

Current state: the inner `h-screen` div has no ref. The timeline has no entry animation — the first label starts fading in at progress 0.0–0.04, leaving a brief invisible gap at section start.

- [ ] **Step 1: Read the file**

```bash
cat src/components/sections/ExplodeSection.tsx
```

Confirm the inner div (`className="relative h-screen w-full overflow-hidden"`) has no `ref` attribute.

- [ ] **Step 2: Add `innerRef` declaration**

In the ref declarations block (after `labelRefs`), add:

```tsx
const innerRef = useRef<HTMLDivElement>(null);
```

- [ ] **Step 3: Attach `innerRef` to the inner div in JSX**

Change:
```tsx
<div className="relative h-screen w-full overflow-hidden">
```
To:
```tsx
<div ref={innerRef} className="relative h-screen w-full overflow-hidden">
```

- [ ] **Step 4: Insert entry fade at position 0 of the timeline**

In the `useGSAP` callback, immediately before the `LAYERS.forEach(...)` block, add:

```tsx
tl.fromTo(innerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.06 }, 0);
```

The full `useGSAP` body after the change looks like this (early-return for reduced-motion stays unchanged):

```tsx
useGSAP(
  () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        pin: true,
      },
    });

    // Entry fade — prevents hard cut from HeroSection
    tl.fromTo(innerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.06 }, 0);

    LAYERS.forEach((_, i) => {
      const el = labelRefs.current[i];
      if (!el) return;
      const windowStart = i * 0.2;
      const windowEnd = windowStart + 0.2;
      tl
        .fromTo(el, { opacity: 0 }, { opacity: 1, duration: FADE }, windowStart)
        .to(el, { opacity: 0, duration: FADE }, windowEnd - FADE);
    });

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  },
  { scope: sectionRef }
);
```

- [ ] **Step 5: Typecheck + lint**

```bash
pnpm build 2>&1 | tail -8
```

Expected: `✓ Compiled successfully`

- [ ] **Step 6: Commit**

```bash
git add src/components/sections/ExplodeSection.tsx
git commit -m "feat: add scrub entry fade to ExplodeSection"
```

---

### Task 2: SwitchSection — entry fade + SVG zoom

**Files:**
- Modify: `src/components/sections/SwitchSection.tsx`

Current state: no entry animation. The left panel (SVG cross-section diagram) and the inner grid both appear abruptly when Explode ends. Two refs to add: `gridRef` (inner grid div) and `leftPanelRef` (left SVG panel).

- [ ] **Step 1: Read the file**

```bash
cat src/components/sections/SwitchSection.tsx
```

Confirm:
- Inner grid div: `className="relative grid h-screen w-full grid-cols-1 md:grid-cols-[1fr_1fr]"` — no ref
- Left panel div: `className="relative hidden items-center justify-center border-r border-[--color-border] md:flex"` — no ref

- [ ] **Step 2: Add ref declarations**

After the existing ref declarations (after `specRefs`), add:

```tsx
const gridRef = useRef<HTMLDivElement>(null);
const leftPanelRef = useRef<HTMLDivElement>(null);
```

- [ ] **Step 3: Attach refs in JSX**

Change the inner grid div:
```tsx
<div className="relative grid h-screen w-full grid-cols-1 md:grid-cols-[1fr_1fr]">
```
To:
```tsx
<div ref={gridRef} className="relative grid h-screen w-full grid-cols-1 md:grid-cols-[1fr_1fr]">
```

Change the left panel div:
```tsx
<div className="relative hidden items-center justify-center border-r border-[--color-border] md:flex">
```
To:
```tsx
<div ref={leftPanelRef} className="relative hidden items-center justify-center border-r border-[--color-border] md:flex">
```

- [ ] **Step 4: Update the reduced-motion block**

The existing reduced-motion block sets final states. Add `gridRef` and `leftPanelRef` to it:

```tsx
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  gsap.set(
    [
      titleRef.current,
      subtitleRef.current,
      accentRef.current,
      gridRef.current,
      leftPanelRef.current,
      ...specRefs.current.filter(Boolean),
      gsap.utils.toArray(".sw-word"),
    ],
    { opacity: 1, y: 0, scale: 1 }
  );
  return;
}
```

- [ ] **Step 5: Insert entry fade and SVG zoom at position 0**

In the `useGSAP` callback, immediately after the `tl` is created and before the first `tl.fromTo(titleRef...)` call, add:

```tsx
// Entry fade — prevents hard cut from ExplodeSection
tl.fromTo(gridRef.current, { opacity: 0 }, { opacity: 1, duration: 0.08 }, 0);

// SVG zoom — left panel scales in from 55% ("switch zoom")
tl.fromTo(
  leftPanelRef.current,
  { scale: 0.55, opacity: 0, transformOrigin: "center center" },
  { scale: 1, opacity: 1, duration: 0.20 },
  0
);
```

The full updated `useGSAP` body (only the changed parts shown; rest is unchanged):

```tsx
useGSAP(
  () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(
        [
          titleRef.current,
          subtitleRef.current,
          accentRef.current,
          gridRef.current,
          leftPanelRef.current,
          ...specRefs.current.filter(Boolean),
          gsap.utils.toArray(".sw-word"),
        ],
        { opacity: 1, y: 0, scale: 1 }
      );
      return;
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        pin: true,
      },
    });

    // Entry fade — prevents hard cut from ExplodeSection
    tl.fromTo(gridRef.current, { opacity: 0 }, { opacity: 1, duration: 0.08 }, 0);

    // SVG zoom — left panel scales in from 55%
    tl.fromTo(
      leftPanelRef.current,
      { scale: 0.55, opacity: 0, transformOrigin: "center center" },
      { scale: 1, opacity: 1, duration: 0.20 },
      0
    );

    tl.fromTo(titleRef.current, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.12, ease: "power2.out" }, 0);
    tl.fromTo(subtitleRef.current, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.12, ease: "power2.out" }, 0.12);
    tl.fromTo(accentRef.current, { scaleX: 0, transformOrigin: "left center" }, { scaleX: 1, duration: 0.08 }, 0.20);

    specRefs.current.forEach((el, i) => {
      if (!el) return;
      tl.fromTo(el, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.07, ease: "power2.out" }, 0.30 + i * 0.07);
    });

    const words = gsap.utils.toArray<HTMLSpanElement>(".sw-word");
    if (words.length > 0) {
      tl.fromTo(words, { opacity: 0.1 }, { opacity: 1, stagger: 0.012, duration: 0.02 }, 0.50);
    }

    tl.to(contentRef.current, { opacity: 0, duration: 0.20 }, 0.80);

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  },
  { scope: sectionRef }
);
```

- [ ] **Step 6: Typecheck + lint**

```bash
pnpm build 2>&1 | tail -8
```

Expected: `✓ Compiled successfully`

- [ ] **Step 7: Commit**

```bash
git add src/components/sections/SwitchSection.tsx
git commit -m "feat: add entry fade and SVG zoom to SwitchSection"
```

---

### Task 3: SoundSection — entry + exit fade timeline

**Files:**
- Modify: `src/components/sections/SoundSection.tsx`

Current state: no entry or exit animation. The waveform canvas appears abruptly when Switch ends, and the Material slide appears abruptly when Sound ends. A second scrub-bound timeline (without `pin`) on the same trigger handles both fades.

- [ ] **Step 1: Read the file**

```bash
cat src/components/sections/SoundSection.tsx
```

Confirm:
- Inner div: `className="relative flex h-screen w-full flex-col items-center justify-center gap-14 px-[8vw]"` — no ref
- Existing ScrollTrigger uses `ScrollTrigger.create()` (not inside a timeline)

- [ ] **Step 2: Add `innerRef` declaration**

After the existing `progressRef` declaration, add:

```tsx
const innerRef = useRef<HTMLDivElement>(null);
```

- [ ] **Step 3: Attach `innerRef` to the inner div in JSX**

Change:
```tsx
<div className="relative flex h-screen w-full flex-col items-center justify-center gap-14 px-[8vw]">
```
To:
```tsx
<div ref={innerRef} className="relative flex h-screen w-full flex-col items-center justify-center gap-14 px-[8vw]">
```

- [ ] **Step 4: Rewrite the `useGSAP` block**

Replace the entire `useGSAP` block with this version. The pin trigger and ticker are unchanged; the fade timeline is new, inserted after the reduced-motion guard:

```tsx
useGSAP(
  () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Pin trigger — unchanged from original
    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "bottom bottom",
      pin: true,
      scrub: 1,
      onUpdate: (self) => {
        progressRef.current = self.progress;
      },
    });

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(innerRef.current, { opacity: 1 });
      return () => {
        window.removeEventListener("resize", resize);
        trigger.kill();
      };
    }

    // Fade timeline — entry (0→8%) and exit (88→100%)
    const fadeTl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
      },
    });
    fadeTl
      .fromTo(innerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.08 }, 0)
      .to(innerRef.current, { opacity: 0, duration: 0.12 }, 0.88);

    const tick = (time: number) => {
      drawWave(ctx, canvas.offsetWidth, canvas.offsetHeight, time, progressRef.current);
    };
    gsap.ticker.add(tick);

    return () => {
      window.removeEventListener("resize", resize);
      gsap.ticker.remove(tick);
      trigger.kill();
      fadeTl.scrollTrigger?.kill();
      fadeTl.kill();
    };
  },
  { scope: sectionRef }
);
```

- [ ] **Step 5: Typecheck + lint**

```bash
pnpm build 2>&1 | tail -8
```

Expected: `✓ Compiled successfully`

- [ ] **Step 6: Commit**

```bash
git add src/components/sections/SoundSection.tsx
git commit -m "feat: add scrub entry and exit fade to SoundSection"
```

---

### Task 4: MaterialSection — entry fade

**Files:**
- Modify: `src/components/sections/MaterialSection.tsx`

Current state: no entry animation. When SoundSection fades out, MaterialSection's first slide (Aluminum gradient) appears immediately at full opacity.

- [ ] **Step 1: Read the file**

```bash
cat src/components/sections/MaterialSection.tsx
```

Confirm:
- Inner div: `className="relative h-screen w-full overflow-hidden"` — no ref
- Timeline starts with `tl.to({}, { duration: 1 }, 0)` (dummy duration setter)

- [ ] **Step 2: Add `innerRef` declaration**

After the existing `dotRefs` declaration, add:

```tsx
const innerRef = useRef<HTMLDivElement>(null);
```

- [ ] **Step 3: Attach `innerRef` to the inner div in JSX**

Change:
```tsx
<div className="relative h-screen w-full overflow-hidden">
```
To:
```tsx
<div ref={innerRef} className="relative h-screen w-full overflow-hidden">
```

- [ ] **Step 4: Update the reduced-motion block**

Add `innerRef` to the reduced-motion `gsap.set` call:

```tsx
if (reducedMotion) {
  gsap.set([slideRefs.current[0], textRefs.current[0], innerRef.current], { opacity: 1 });
  return () => {
    tl.scrollTrigger?.kill();
    tl.kill();
  };
}
```

- [ ] **Step 5: Insert entry fade after the dummy tween**

In the `useGSAP` callback, immediately after `tl.to({}, { duration: 1 }, 0)`, add:

```tsx
// Entry fade — prevents hard cut from SoundSection
tl.fromTo(innerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.06 }, 0);
```

The surrounding context:

```tsx
tl.to({}, { duration: 1 }, 0);

// Entry fade — prevents hard cut from SoundSection
tl.fromTo(innerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.06 }, 0);

// Crossfade A → B (Aluminum → PBT Keycaps)
tl
  .to(slideRefs.current[0], { opacity: 0, scale: 0.96, duration: FADE_DURATION }, FADE_A_B_START)
  // ... rest unchanged
```

- [ ] **Step 6: Typecheck + lint**

```bash
pnpm build 2>&1 | tail -8
```

Expected: `✓ Compiled successfully`

- [ ] **Step 7: Commit**

```bash
git add src/components/sections/MaterialSection.tsx
git commit -m "feat: add scrub entry fade to MaterialSection"
```

---

### Task 5: SpecsSection — replace IntersectionObserver with ScrollTrigger + heading animation

**Files:**
- Modify: `src/components/sections/SpecsSection.tsx`

Current state: uses IntersectionObserver with 12% threshold. Cards start invisible until the observer fires, causing a brief dark screen after MaterialSection unpins. No heading animation. After this task: ScrollTrigger fires at 90% viewport, heading animates in before cards.

- [ ] **Step 1: Read the file**

```bash
cat src/components/sections/SpecsSection.tsx
```

Confirm:
- `sectionRef` and `cardRefs` exist
- Heading block `<div className="mb-16">` has no ref
- Current imports: `gsap`, `useGSAP` — no ScrollTrigger import

- [ ] **Step 2: Add ScrollTrigger import and register**

At the top of the file, alongside the existing gsap imports, add:

```tsx
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
```

- [ ] **Step 3: Add `headingRef` declaration**

After `cardRefs`, add:

```tsx
const headingRef = useRef<HTMLDivElement>(null);
```

- [ ] **Step 4: Attach `headingRef` in JSX**

Change:
```tsx
<div className="mb-16">
```
To:
```tsx
<div ref={headingRef} className="mb-16">
```

- [ ] **Step 5: Replace the entire `useGSAP` body**

Replace everything inside `useGSAP(() => { ... }, { scope: sectionRef })` with:

```tsx
useGSAP(
  () => {
    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set([headingRef.current, ...cards], { opacity: 1, y: 0 });
      return;
    }

    // Heading fades in when section top reaches 90% down the viewport
    gsap.fromTo(
      headingRef.current,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 90%",
          toggleActions: "play none none none",
        },
      }
    );

    // Cards stagger in just after heading
    gsap.fromTo(
      cards,
      { opacity: 0, y: 36 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.07,
        duration: 0.65,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      }
    );
  },
  { scope: sectionRef }
);
```

Note: `start: "top 90%"` means "when the section top is 90% down the viewport" — fires earlier than the old 12% threshold, eliminating the dark-screen gap.

- [ ] **Step 6: Typecheck + lint**

```bash
pnpm build 2>&1 | tail -8
```

Expected: `✓ Compiled successfully`

- [ ] **Step 7: Commit**

```bash
git add src/components/sections/SpecsSection.tsx
git commit -m "feat: replace IntersectionObserver with ScrollTrigger in SpecsSection, add heading fade"
```
