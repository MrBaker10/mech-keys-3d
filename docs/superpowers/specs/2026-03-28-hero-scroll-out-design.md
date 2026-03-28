# HeroSection Scroll-Out Animation — Design Spec

**Datum:** 2026-03-28
**Scope:** `src/components/sections/HeroSection.tsx` (Erweiterung), `src/app/page.tsx` (Platzhalter-Sektion)
**Kontext:** Erweiterung der bestehenden HeroSection um eine scroll-gesteuerte Ausblend-Animation.

---

## Ziel

Beim Scrollen über die HeroSection verschwindet der Inhalt dramatisch: der Titel bewegt sich nach oben und fadet aus, der Subtitle fadet schneller weg, der Scroll-Indikator verschwindet sofort, und die gesamte Sektion skaliert subtil auf 0.95. Kein `pin` — die Sektion scrollt natürlich weg.

---

## Änderungen

### 1. `src/components/sections/HeroSection.tsx`

**Neuer Ref:**
```ts
const headlineRef = useRef<HTMLHeadingElement>(null);
```
Auf dem `<h1>` Element setzen — nötig für die Scroll-Out-Animation (bewegt den gesamten Titel, nicht Einzelbuchstaben).

**`prefers-reduced-motion` Handling (angepasst):**
Wenn `prefers-reduced-motion: reduce` aktiv ist: alle animierten Elemente via `gsap.set()` sofort auf ihren sichtbaren Endstand bringen (opacity 1, y 0), dann `return`. Verhindert leeren Screen.

```ts
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  gsap.set(
    [
      letterRefs.current.filter(Boolean),
      subtitleRef.current,
      scrollIndicatorRef.current,
    ],
    { opacity: 1, y: 0 }
  );
  return;
}
```

**Scroll-Out-Timeline** (nach der Lade-Timeline, innerhalb desselben `useGSAP`-Callbacks):

```ts
gsap.timeline({
  scrollTrigger: {
    trigger: sectionRef.current,
    start: "top top",
    end: "bottom top",
    scrub: 1,
  },
})
  // Scroll-Indikator: sofort weg
  .to(scrollIndicatorRef.current, { opacity: 0, duration: 0.15 }, 0)
  // Subtitle: fadet schneller aus
  .to(subtitleRef.current, { opacity: 0, duration: 0.4 }, 0)
  // Titel: nach oben + leichtes Ausblenden
  .to(headlineRef.current, { y: -80, opacity: 0.2, duration: 1 }, 0)
  // Sektion: subtiler Scale-Down
  .to(sectionRef.current, { scale: 0.95, transformOrigin: "center top", duration: 1 }, 0);
```

**ScrollTrigger Import:** `import { ScrollTrigger } from "gsap/ScrollTrigger"` hinzufügen. Kein `gsap.registerPlugin(ScrollTrigger)` — bereits global in `SmoothScrollProvider` registriert.

**Integration:** Alles bleibt in einem `useGSAP({ scope: sectionRef })`. Kein zweiter Hook.

---

### 2. `src/app/page.tsx`

Platzhalter-Sektion nach `<HeroSection />` einfügen, damit der Scroll-Übergang sichtbar ist:

```tsx
<section
  className="min-h-screen bg-[--color-bg]"
  aria-hidden="true"
/>
```

---

## Nicht in Scope

- Inhalt der Platzhalter-Sektion (wird später durch echte Sektion ersetzt)
- Scroll-getriggerte Kamera-Animation (3D-Phase)
- Parallax-Hintergrundeffekte
