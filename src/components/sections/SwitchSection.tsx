"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Mono } from "@/components/ui/Typography";

// ─── Static data ──────────────────────────────────────────────────────────────

const SPECS = [
  { value: "45",  unit: "g",  label: "Actuation Force" },
  { value: "4.0", unit: "mm", label: "Travel Distance" },
  { value: "2.0", unit: "mm", label: "Actuation Point" },
] as const;

const DESCRIPTION =
  "The tactile bump delivers crisp feedback at the actuation point, letting you register keystrokes with precision and confidence.";

const WORDS = DESCRIPTION.split(" ");

// ─── Component ────────────────────────────────────────────────────────────────

export function SwitchSection() {
  const sectionRef  = useRef<HTMLElement>(null);
  const contentRef  = useRef<HTMLDivElement>(null);
  const titleRef    = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const accentRef   = useRef<HTMLDivElement>(null);
  const specRefs    = useRef<(HTMLDivElement | null)[]>([]);
  const gridRef     = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);

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

      // Main scrub timeline — total implicit duration = 1.0
      // → progress 0–1 maps 1:1 to scroll through the 250vh section.
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

      // SVG zoom — left panel scales in from 55% ("switch zoom")
      tl.fromTo(
        leftPanelRef.current,
        { scale: 0.55, opacity: 0, transformOrigin: "center center" },
        { scale: 1, opacity: 1, duration: 0.20 },
        0
      );

      // ── 0.00–0.12  Title block slides up & fades in
      tl.fromTo(
        titleRef.current,
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.12, ease: "power2.out" },
        0
      );

      // ── 0.12–0.24  Subtitle fades in
      tl.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.12, ease: "power2.out" },
        0.12
      );

      // ── 0.20–0.28  Accent line extends
      tl.fromTo(
        accentRef.current,
        { scaleX: 0, transformOrigin: "left center" },
        { scaleX: 1, duration: 0.08 },
        0.20
      );

      // ── 0.30–0.48  Spec rows stagger in
      specRefs.current.forEach((el, i) => {
        if (!el) return;
        tl.fromTo(
          el,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.07, ease: "power2.out" },
          0.30 + i * 0.07
        );
      });

      // ── 0.50–0.78  Word-by-word reveal (ANIMATION_PATTERNS.md pattern)
      const words = gsap.utils.toArray<HTMLSpanElement>(".sw-word");
      if (words.length > 0) {
        tl.fromTo(
          words,
          { opacity: 0.1 },
          {
            opacity: 1,
            stagger: 0.012,
            duration: 0.02,
          },
          0.50
        );
      }

      // ── 0.80–1.00  Full content fades out for transition
      tl.to(contentRef.current, { opacity: 0, duration: 0.20 }, 0.80);

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="switch-section"
      ref={sectionRef}
      aria-label="Switch Technical Details"
      className="relative z-[2] h-[250vh] bg-[--color-bg]"
    >
      {/* ── Pinned 100vh viewport ──────────────────────────────────────────── */}
      <div ref={gridRef} className="relative grid h-screen w-full grid-cols-1 md:grid-cols-[1fr_1fr]">

        {/* ── Left — 3D placeholder (hidden on mobile) ─────────────────────── */}
        <div ref={leftPanelRef} className="relative hidden items-center justify-center border-r border-[--color-border] md:flex">
          {/* Stylised switch cross-section — replaced by R3F model later */}
          <div
            className="relative flex h-56 w-32 flex-col items-center border border-[--color-border]"
            aria-hidden="true"
          >
            {/* Stem */}
            <div className="mt-4 h-16 w-8 border border-[--color-border] bg-[--color-surface]" />
            {/* Housing top */}
            <div className="mt-2 h-2 w-full bg-[--color-surface]" />
            {/* Spring (dashed center line) */}
            <div className="mt-4 h-12 w-px border-l border-dashed border-[--color-border]" />
            {/* Contact */}
            <div className="mt-2 h-1 w-6 bg-[--color-accent] opacity-60" />
          </div>
          {/* Corner label */}
          <div className="absolute bottom-8 left-8">
            <Mono className="text-[--color-muted] opacity-50">3D Model</Mono>
          </div>
        </div>

        {/* ── Right — Specs content ────────────────────────────────────────── */}
        <div
          ref={contentRef}
          className="relative flex flex-col justify-center px-[8vw]"
        >
          {/* Title block */}
          <div ref={titleRef} className="mb-2 opacity-0">
            <h2
              className="text-[clamp(2.5rem,6vw,5rem)] font-bold leading-none tracking-[-0.04em] text-[--color-text]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Cherry MX
            </h2>
          </div>

          {/* Subtitle */}
          <p
            ref={subtitleRef}
            className="mb-8 text-[1rem] text-[--color-muted] opacity-0"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Tactile Switch
          </p>

          {/* Accent divider */}
          <div
            ref={accentRef}
            className="mb-10 h-px w-16 origin-left bg-[--color-accent]"
            style={{ transform: "scaleX(0)" }}
            aria-hidden="true"
          />

          {/* Spec rows — large number + muted label */}
          <div className="mb-10 flex flex-col gap-6">
            {SPECS.map((spec, i) => (
              <div
                key={spec.label}
                ref={(el) => { specRefs.current[i] = el; }}
                className="opacity-0"
              >
                <div className="flex items-baseline gap-1.5">
                  <span
                    className="text-[clamp(2rem,4.5vw,3.5rem)] font-bold leading-none text-[--color-text]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {spec.value}
                  </span>
                  <span
                    className="text-[1.25rem] text-[--color-muted]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {spec.unit}
                  </span>
                </div>
                <Mono className="mt-1 text-[--color-muted]">{spec.label}</Mono>
              </div>
            ))}
          </div>

          {/* Word-by-word description */}
          <p
            className="max-w-xs text-[0.9rem] leading-[1.8] text-[--color-muted]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {WORDS.map((word, i) => (
              <span
                key={i}
                className="sw-word inline-block opacity-10"
                style={{ marginRight: "0.3em" }}
              >
                {word}
              </span>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}
