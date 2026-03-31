# Performance

## Budget

| Metrik | Ziel |
|---|---|
| Lighthouse Performance | ≥ 85 (Mobile) |
| LCP | < 2.5s |
| CLS | < 0.1 |
| JS Bundle (Initial) | < 200kB gzipped |
| 3D-Modelle (gesamt) | < 5MB Draco-komprimiert |
| Texturen | WebP/AVIF, max 2048px |
| Scroll-FPS | ≥ 55fps auf Mid-Range |

## Strategien

### 3D-Modelle
- **Draco-Kompression** für alle GLB-Dateien
- **LOD** (Level of Detail): Vereinfachte Geometrie für entfernte/kleine Darstellung
- **KTX2** Compressed Textures wo möglich
- `useGLTF.preload('/models/keyboard.glb')` am Seitenende für Preloading

### Code-Splitting
- Schwere Sektionen per `next/dynamic` lazy laden
- Three.js / R3F nur client-seitig importieren
- `<Suspense>` Boundaries mit Skeleton-Loader oder Fade-In

### Rendering
- `dpr={[1, 1.5]}` statt voller Device-Auflösung
- `frameloop="demand"` wenn keine kontinuierliche Animation nötig
- `will-change` sparsam — nur bei aktiven Animationen setzen, danach entfernen
- `transform: translateZ(0)` für GPU-Compositing bei CSS-Animationen

### Bilder & Assets
- WebP/AVIF für alle Rasterbilder
- `next/image` mit `priority` nur für Above-the-Fold
- Texturen: Power-of-Two Dimensionen (512, 1024, 2048)
- Environment Maps: Komprimierte HDR oder Low-Res Cubemap

### Monitoring
- Lighthouse CI im Build-Prozess
- Chrome DevTools Performance Tab für Scroll-FPS
- `Stats` Component aus Drei (nur in Dev) für R3F FPS-Monitor

## Accessibility & Fallbacks

- `prefers-reduced-motion`: Scroll-Animationen deaktivieren, statische Ansichten zeigen
- WebGL nicht verfügbar: Fallback-Bilder statt 3D-Canvas
- `<Canvas>` bekommt `role="img"` und beschreibendes `aria-label`
- Alle Texte müssen ohne JS/3D lesbar sein (Graceful Degradation)
- Kontrast: WCAG AA minimum (4.5:1)

## Known Exceptions

- `keyboard-draco.glb` (~10.3 MB): Premium Sketchfab source model (CC-BY-4.0 license).
  Draco compression level 10 applied; no further size reduction possible without mesh
  simplification. Accepted as exception until a custom low-poly hero model is available.
