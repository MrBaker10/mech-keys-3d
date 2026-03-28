# UI Basis-Komponenten — Design Spec

**Datum:** 2026-03-28
**Scope:** `src/components/ui/Typography.tsx`, `Button.tsx`, `SectionContainer.tsx`
**Kontext:** Industrial-Premium Mechanical Keyboard Landing Page (Next.js 15, Tailwind CSS 4, GSAP)

---

## 1. Typography.tsx

### `<Heading>`

Rendert ein semantisches Heading-Element. Props bestimmen Größe und optionales Tag-Override.

**Props:**

| Prop | Type | Default | Beschreibung |
|------|------|---------|--------------|
| `size` | `'xl' \| 'lg' \| 'md' \| 'sm'` | `'xl'` | Visuelle Größe |
| `as` | `'h1' \| 'h2' \| 'h3' \| 'h4'` | Folgt `size` (xl→h1, lg→h2, md→h3, sm→h4) | Semantisches Element |
| `className` | `string` | — | Zusätzliche Klassen |
| `children` | `ReactNode` | — | Inhalt |

**Größen-Skala (fluid clamp):**

| size | font-size | letter-spacing | font-weight | line-height |
|------|-----------|----------------|-------------|-------------|
| `xl` | `clamp(3.5rem, 8vw, 7rem)` | `-0.04em` | 700 | 1 |
| `lg` | `clamp(2rem, 5vw, 4rem)` | `-0.03em` | 700 | 1.05 |
| `md` | `clamp(1.25rem, 3vw, 2rem)` | `-0.02em` | 600 | 1.15 |
| `sm` | `clamp(1rem, 2vw, 1.25rem)` | `0` | 600 | 1.3 |

Font: `var(--font-display)` (PP Neue Montreal, Fallback: Helvetica Neue).
Farbe: `var(--color-text)` — überschreibbar via `className`.

**Default-`as`-Mapping** (wenn `as` nicht explizit gesetzt):
- `size="xl"` → `<h1>`
- `size="lg"` → `<h2>`
- `size="md"` → `<h3>`
- `size="sm"` → `<h4>`

---

### `<Text>`

Rendert einen `<p>`-Absatz in Body-Schrift.

**Props:**

| Prop | Type | Default | Beschreibung |
|------|------|---------|--------------|
| `size` | `'sm' \| 'base' \| 'lg'` | `'base'` | Schriftgröße |
| `muted` | `boolean` | `false` | Farbe `var(--color-muted)` statt `var(--color-text)` |
| `className` | `string` | — | Zusätzliche Klassen |
| `children` | `ReactNode` | — | Inhalt |

**Größen:**

| size | font-size | line-height |
|------|-----------|-------------|
| `lg` | `1.125rem` | `1.7` |
| `base` | `1rem` | `1.65` |
| `sm` | `0.875rem` | `1.5` |

Font: `var(--font-body)` (Geist, Fallback: system-ui).

---

### `<Mono>`

Rendert ein `<span>` in Monospace für technische Werte, Labels, Specs.

**Props:**

| Prop | Type | Default | Beschreibung |
|------|------|---------|--------------|
| `className` | `string` | — | Zusätzliche Klassen (z.B. Farb-Override) |
| `children` | `ReactNode` | — | Inhalt |

**Feste Styles:**
- Font: `var(--font-mono)` (Geist Mono, Fallback: JetBrains Mono)
- `font-size: 0.75rem`
- `letter-spacing: 0.1em`
- `text-transform: uppercase`
- Farbe: `var(--color-accent)` (Neon-Lime `#E8FF47`) — überschreibbar via `className`

---

## 2. Button.tsx

**Stil-Entscheidung:** Variante B — Accent-Undercut. Hartkantiger Square (`border-radius: 0`), dicker Akzentunterstrich, Hover hebt den Button leicht an.

### Varianten

**`primary`:**
- Background: `var(--color-accent)` (`#E8FF47`)
- Textfarbe: `var(--color-bg)` (`#0A0A0A`) — dunkel auf hell
- Border-bottom: `2px solid #b8cf00` (gedämpftes Lime)
- Hover: `background: white`, `transform: translateY(-2px)`, `border-bottom-color: #ccc`
- Transition: `all 0.15s ease`

**`ghost`:**
- Background: `transparent`
- Textfarbe: `var(--color-text)`
- Border: `1px solid var(--color-border)`, `border-bottom: 2px solid var(--color-accent)`
- Hover: `border-color: var(--color-accent)`, `color: var(--color-accent)`, `background: var(--color-surface)`
- Transition: `all 0.2s ease`

### Größen

| size | font-size | padding | tracking |
|------|-----------|---------|----------|
| `sm` | `11px` | `0.5rem 1rem` | `0.12em` |
| `md` | `13px` | `0.75rem 1.5rem` | `0.12em` |
| `lg` | `15px` | `1rem 2.5rem` | `0.1em` |

Alle Varianten: `font-weight: 700`, `text-transform: uppercase`, `border-radius: 0`, `font-family: var(--font-display)`.

### Props

| Prop | Type | Default |
|------|------|---------|
| `variant` | `'primary' \| 'ghost'` | `'primary'` |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` |
| `as` | `'button' \| 'a'` | `'button'` |
| `href` | `string` | — | Nur relevant wenn `as="a"` |
| `className` | `string` | — |
| `children` | `ReactNode` | — |

Alle weiteren HTML-Attribute werden via `...rest` durchgereicht (`ButtonHTMLAttributes` bzw. `AnchorHTMLAttributes`).

---

## 3. SectionContainer.tsx

Wrapper-Komponente für jede Scroll-Sektion. Kombiniert semantisches `<section>` mit dem `.section-container` CSS (max-width 1440px, fluid padding).

### Props

| Prop | Type | Default | Beschreibung |
|------|------|---------|--------------|
| `id` | `string` | — | Für GSAP ScrollTrigger-Targeting |
| `fullHeight` | `boolean` | `true` | `min-h-screen` auf `<section>` |
| `pinned` | `boolean` | `false` | `min-h-[200vh]` für gepinnte ScrollTrigger-Sektionen |
| `className` | `string` | — | Zusätzliche Klassen auf `<section>` |
| `children` | `ReactNode` | — | Sektions-Inhalt |

**Struktur:**
```html
<section id={id} className="relative [min-h-screen | min-h-[200vh]] {className}">
  <div class="section-container">
    {children}
  </div>
</section>
```

`fullHeight` und `pinned` schließen sich aus — `pinned` hat Vorrang (gibt mehr Höhe).

---

## Nicht in Scope

- Hover-Animationen mit GSAP (Tailwind CSS transitions genügen hier)
- Komplexe Zustände (loading, disabled mit Icon, etc.)
- Dark/Light Mode Toggle (Projekt ist immer dark)
- Storybook oder Component-Dokumentation
