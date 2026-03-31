# Design Spec: Section Transitions

**Date:** 2026-03-31
**Status:** Approved

## Goal

Eliminate hard cuts between all 7 sections by adding scrub-bound entry and exit animations. Each section that currently has no entry animation receives one. No new 3D assets required.

## Root Cause

All sections share `bg-[--color-bg]` (same background), so there are no color-hard-cuts. The problem is **content hard cuts**: sections appear/disappear abruptly because only SwitchSection has an explicit exit animation (at 0.80–1.00), and no section has an entry animation.

## General Pattern

All entry animations follow the same shape:

```ts
tl.fromTo(targetRef.current, { opacity: 0 }, { opacity: 1, duration: 0.08 }, 0)
```

- Inserted at position `0` of the existing GSAP timeline (no new ScrollTrigger object)
- `scrub: 1` is inherited from the existing ScrollTrigger — frame-exact, user-controlled
- Covers roughly 8–12% of the section's scroll distance

SoundSection is the exception: it has no timeline (uses `onUpdate` only). It gets a separate fade-only timeline on the same trigger element.

## Transition Specifications

### 1. Hero → Explode — `ExplodeSection.tsx`

**Problem:** ExplodeSection's first label (Keycaps) fades in at progress 0.0–0.04, but the section wrapper has no entry fade. Brief dark frame possible.

**Fix:** Add entry fade on the `innerRef` (the pinned `h-screen` div):
```ts
tl.fromTo(innerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.08 }, 0)
```

No change to the per-label stagger logic. 3D continuity is handled by `heroProgressRef` → `explodeProgressRef` in Scene.tsx.

---

### 2. Explode → Switch — `SwitchSection.tsx`

**Problem:** ExplodeSection ends with all labels faded out and 3D canvas empty. SwitchSection has no entry animation — its title just appears.

**Fix A — Section entry fade:** On the section's `sectionRef` wrapper:
```ts
tl.fromTo(sectionRef.current, { opacity: 0 }, { opacity: 1, duration: 0.08 }, 0)
```

**Fix B — SVG zoom-in (the "Switch Zoom"):** The left panel ref (`leftPanelRef`, the SVG cross-section diagram) zooms in from 55% scale:
```ts
tl.fromTo(
  leftPanelRef.current,
  { scale: 0.55, opacity: 0 },
  { scale: 1, opacity: 1, duration: 0.20 },
  0
)
```

Both run simultaneously at position 0. The zoom overlaps with the existing title fade-in (0.00–0.12), creating a layered "section is opening" feel.

Note: `transformOrigin: "center center"` must be set on the left panel to scale from the middle.

---

### 3. Switch → Sound — `SoundSection.tsx`

**Problem:** SwitchSection fades out at 0.80–1.00, but SoundSection has no entry animation. Waveform canvas appears abruptly.

**Fix:** SoundSection currently uses `onUpdate` only (no timeline). Add a separate scrub-bound fade timeline on the same trigger:

```ts
const fadeTl = gsap.timeline({
  scrollTrigger: {
    trigger: sectionRef.current,
    start: "top top",
    end: "+=200%",
    scrub: 1,
  },
});
fadeTl.fromTo(innerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.08 }, 0);
```

`innerRef` = the pinned `h-screen` div inside SoundSection. Two ScrollTriggers on the same element is supported by GSAP.

---

### 4. Sound → Material — `SoundSection.tsx` + `MaterialSection.tsx`

**Problem:** Waveform runs at full amplitude at progress=1, then MaterialSection's Aluminum gradient appears immediately. Hard cut.

**Fix A — SoundSection exit fade:** Extend the fade timeline from fix 3:
```ts
fadeTl.to(innerRef.current, { opacity: 0, duration: 0.12 }, 0.88)
```
At 88% of SoundSection's scroll, content fades to black. User arrives at MaterialSection on a dark screen.

**Fix B — MaterialSection entry fade:** Add entry fade on MaterialSection's inner wrapper:
```ts
tl.fromTo(innerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.08 }, 0)
```

---

### 5. Material → Specs — `SpecsSection.tsx`

**Problem:** MaterialSection unpins, then SpecsSection's cards are invisible until IntersectionObserver fires at 12% threshold. Brief dark screen between material gradient disappearing and cards animating.

**Fix:** Replace IntersectionObserver with ScrollTrigger (`toggleActions` only — still time-based, not scrub):

```ts
useGSAP(() => {
  gsap.fromTo(
    cards,
    { opacity: 0, y: 36 },
    {
      opacity: 1,
      y: 0,
      duration: 0.65,
      stagger: 0.07,
      ease: "power3.out",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 90%",   // fires earlier than the old 12% threshold
        toggleActions: "play none none none",
      },
    }
  );

  // Heading/subheading enter slightly before cards
  gsap.fromTo(
    [headingRef.current, subheadingRef.current],
    { opacity: 0, y: 24 },
    {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 90%",
        toggleActions: "play none none none",
      },
    }
  );
}, { scope: sectionRef });
```

The IntersectionObserver + `useEffect` block is removed entirely.

---

### 6. Specs → CTA — no change

CTASection already has a working entrance animation (`start: "top 75%"`). No modifications needed.

---

## Files Changed

| File | Change |
|---|---|
| `src/components/sections/ExplodeSection.tsx` | Add `fromTo(innerRef, opacity 0→1)` at tl position 0 |
| `src/components/sections/SwitchSection.tsx` | Add section entry fade + SVG left panel zoom at tl position 0 |
| `src/components/sections/SoundSection.tsx` | Add separate fade timeline (entry 0.0–0.08, exit 0.88–1.0) |
| `src/components/sections/MaterialSection.tsx` | Add `fromTo(innerRef, opacity 0→1)` at tl position 0 |
| `src/components/sections/SpecsSection.tsx` | Replace IntersectionObserver with ScrollTrigger; add heading fade |

## Refs Required

| Section | Ref needed | Already exists? |
|---|---|---|
| ExplodeSection | `innerRef` (pinned h-screen div) | Verify — may need to add |
| SwitchSection | `leftPanelRef` (SVG left panel) | Verify — may need to add |
| SoundSection | `innerRef` (pinned h-screen div) | Verify — may need to add |
| MaterialSection | `innerRef` (pinned h-screen div) | Verify — may need to add |
| SpecsSection | `headingRef`, `subheadingRef` | Verify — may need to add |

The implementer must read each file, check if the ref exists, and add it if missing before applying the animation.
