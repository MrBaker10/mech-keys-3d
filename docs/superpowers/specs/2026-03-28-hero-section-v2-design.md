# HeroSection v2 — Design Spec

**Datum:** 2026-03-28
**Scope:** `src/components/sections/HeroSection.tsx` (Rewrite), `src/app/page.tsx` (verify clean)
**Kontext:** Erster vollständiger Scroll-Abschnitt der MechKeys Landing Page. Ersetzt den bestehenden HeroSection-Platzhalter mit UI-Komponenten und Letter-Stagger-Animation.

---

## Ziel

Eine fullscreen Hero-Sektion mit dramatischer Letter-Stagger-Einblendung des Titels, die den Industrial-Premium-Charakter der Marke unmittelbar kommuniziert. Kein 3D in dieser Phase — reine Typografie und Bewegung.

---

## Struktur

```
<section aria-label="Hero" ref={sectionRef}>         ← direktes <section>, kein SectionContainer
  <div className="flex flex-col items-center justify-center h-screen ...">
    <div className="flex flex-col items-center gap-6 text-center">
      <h1 style={displayFont}>                        ← nativer h1, kein <Heading> (braucht Span-Children)
        <span className="sr-only">MechKeys</span>     ← Screen-Reader-Text
        <span aria-hidden="true">                     ← visuelles Buchstaben-Splitting
          {letters.map((char, i) => (
            <span key={i} ref={...} className="inline-block">
              {char}
            </span>
          ))}
        </span>
      </h1>
      <p ref={subtitleRef} style={bodyFont}>          ← nativer <p> mit gleichen Styles wie <Text>
        Precision Crafted Mechanical Keyboards
      </Text>
    </div>

    <div ref={scrollRef} className="absolute bottom-10 ...">
      <Mono>Scroll to explore</Mono>                  ← <Mono> Komponente
      <div ref={lineRef} className="scroll-line ..."/>← animierte Linie
    </div>
  </div>
</section>
```

**Warum kein `<SectionContainer>` und kein `<Heading>`:**
- `SectionContainer` hat einen inner `<div class="section-container">` mit max-width 1440px — der Hero ist absichtlich fullscreen/centered ohne seitliches Padding
- `<Heading>` rendert ein opakes Tag-Element; für Letter-Splitting brauchen wir direkten Zugriff auf die Buchstaben-Spans als Children des `<h1>`
- `<Mono>` für das Scroll-Label passt direkt (kein ref nötig)
- Subtitle braucht ein `ref` für GSAP → nativer `<p>` mit identischen Styles wie `<Text size="lg" muted>` (keine `forwardRef`-Erweiterung nötig)

---

## Typo-Stile

| Element | Font | Größe | Tracking | Weight |
|---------|------|-------|----------|--------|
| Titel `<h1>` | `var(--font-display)` | `clamp(4rem, 12vw, 10rem)` | `tighter` (-0.05em) | 700 |
| Subtitle | `<Text size="lg" muted>` | 1.125rem | — | 400 |
| Scroll-Label | `<Mono>` | 0.75rem uppercase | 0.1em | — |

---

## GSAP-Animationssequenz

```
useGSAP({ scope: sectionRef })

Timeline defaults: ease: "power3.out"

1. Letter-Spans (stagger):
   fromTo: opacity 0→1, y 30→0
   duration: 0.6 per letter
   stagger: 0.04
   start: sofort (position 0)

2. Subtitle:
   fromTo: opacity 0→1, y 16→0
   duration: 0.7
   position: "-=0.3" (überlappend mit letztem Buchstaben)

3. Scroll-Indikator (wrapper div):
   fromTo: opacity 0→1
   duration: 0.5
   position: "-=0.2"

4. Scroll-Linie (Puls-Loop, nach Timeline):
   gsap.to(lineRef, {
     scaleY: 0.4, opacity: 0.3,
     duration: 1.2,
     ease: "power2.inOut",
     yoyo: true,
     repeat: -1,
     delay: 0.5   ← startet nach Timeline
   })
```

---

## Barrierefreiheit

- `<span className="sr-only">MechKeys</span>` — Screen-Reader liest den echten Text
- `aria-hidden="true"` auf dem Buchstaben-Container — verhindert doppeltes Vorlesen
- Scroll-Indikator: `aria-hidden="true"`
- `prefers-reduced-motion`: GSAP-Timeline wird geskippt (bereits global in `globals.css` gehandelt für CSS-Animationen; für GSAP: `gsap.matchMedia()` oder `window.matchMedia`)

---

## Scroll-Indikator Linie

Bestehende CSS-Klasse `.scroll-arrow` + `@keyframes scroll-pulse` bleibt in `globals.css`. Die GSAP-Puls-Animation (`gsap.to` auf `lineRef`) **ersetzt** die CSS-Animation auf dem Element — deswegen `animation: none` via Inline-Style auf dem Line-Element um Konflikte zu vermeiden.

---

## Nicht in Scope

- Scroll-gesteuerte Kamera-Rückfahrt (kommt mit 3D-Canvas)
- Hintergrund-Effekte / Grain / Noise-Overlay
- Mobile-spezifische Breakpoint-Anpassungen der Animation
