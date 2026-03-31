"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Mono } from "@/components/ui/Typography";

// ─── Material data ────────────────────────────────────────────────────────────

const MATERIALS = [
  {
    lines: ["Aluminum"],
    subtitle: "CNC-machined 6063 alloy",
    index: "01",
    // Diagonal stripes suggest brushed-metal grain
    bg: [
      "linear-gradient(160deg, #3c3c3c 0%, #1a1a1a 28%, #2e2e2e 50%, #141414 72%, #0c0c0c 100%)",
      "repeating-linear-gradient(92deg, transparent 0px, transparent 3px, rgba(255,255,255,0.018) 3px, rgba(255,255,255,0.018) 6px)",
    ].join(", "),
  },
  {
    lines: ["PBT", "Keycaps"],
    subtitle: "Double-shot, textured surface",
    index: "02",
    // Cross-hatch fine grid suggests PBT surface texture
    bg: [
      "radial-gradient(ellipse at 65% 35%, #3e2e1e 0%, #201810 50%, #0e0b09 100%)",
      "repeating-linear-gradient(0deg, transparent 0px, transparent 4px, rgba(255,255,255,0.02) 4px, rgba(255,255,255,0.02) 5px)",
      "repeating-linear-gradient(90deg, transparent 0px, transparent 4px, rgba(255,255,255,0.01) 4px, rgba(255,255,255,0.01) 5px)",
    ].join(", "),
  },
  {
    lines: ["Silicone", "Dampener"],
    subtitle: "Sound-absorbing gasket mount",
    index: "03",
    // Soft organic green glow suggests translucent silicone
    bg: "radial-gradient(ellipse at 45% 65%, #203020 0%, #121912 50%, #080d08 100%)",
  },
] as const;

// Crossfade timing (all values are fractions of the 1.0 s timeline)
// Crossfade window: [START, START + DURATION] — mid-point at 0.33 and 0.66
const FADE_A_B_START = 0.28; // 0.28 → 0.38, mid 0.33
const FADE_B_C_START = 0.61; // 0.61 → 0.71, mid 0.66
const FADE_DURATION = 0.10;

// ─── Component ────────────────────────────────────────────────────────────────

export function MaterialSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const innerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      // ScrollTrigger pin — created regardless of reducedMotion so
      // the 300vh section scrolls correctly in all cases.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          pin: true,
          scrub: 1,
        },
      });

      if (reducedMotion) {
        // Only slide 0 visible; no crossfade animation
        gsap.set([slideRefs.current[0], textRefs.current[0], innerRef.current], { opacity: 1 });
        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
        };
      }

      // ── Fix timeline duration to exactly 1 s ─────────────────────────────
      // Without this the timeline ends at ~0.71 s and the crossfade positions
      // (0.28, 0.61) would map to ~39% and ~86% of scroll instead of 33%/66%.
      tl.to({}, { duration: 1 }, 0);

      // Entry fade — prevents hard cut from SoundSection
      tl.fromTo(innerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.06 }, 0);

      // ── Crossfade A → B (Aluminum → PBT Keycaps) ─────────────────────────
      tl
        // Outgoing A: fade out + scale down
        .to(
          slideRefs.current[0],
          { opacity: 0, scale: 0.96, duration: FADE_DURATION },
          FADE_A_B_START
        )
        .to(
          textRefs.current[0],
          { y: -24, opacity: 0, duration: FADE_DURATION },
          FADE_A_B_START
        )
        // Incoming B: fade in + scale up to 1
        .fromTo(
          slideRefs.current[1],
          { opacity: 0, scale: 1.04 },
          { opacity: 1, scale: 1, duration: FADE_DURATION },
          FADE_A_B_START
        )
        .fromTo(
          textRefs.current[1],
          { y: 28, opacity: 0 },
          { y: 0, opacity: 1, duration: FADE_DURATION },
          FADE_A_B_START
        )
        // Progress dots
        .to(
          dotRefs.current[0],
          { opacity: 0.3, duration: FADE_DURATION },
          FADE_A_B_START
        )
        .fromTo(
          dotRefs.current[1],
          { opacity: 0.3 },
          { opacity: 1, duration: FADE_DURATION },
          FADE_A_B_START
        );

      // ── Crossfade B → C (PBT Keycaps → Silicone Dampener) ────────────────
      tl
        .to(
          slideRefs.current[1],
          { opacity: 0, scale: 0.96, duration: FADE_DURATION },
          FADE_B_C_START
        )
        .to(
          textRefs.current[1],
          { y: -24, opacity: 0, duration: FADE_DURATION },
          FADE_B_C_START
        )
        .fromTo(
          slideRefs.current[2],
          { opacity: 0, scale: 1.04 },
          { opacity: 1, scale: 1, duration: FADE_DURATION },
          FADE_B_C_START
        )
        .fromTo(
          textRefs.current[2],
          { y: 28, opacity: 0 },
          { y: 0, opacity: 1, duration: FADE_DURATION },
          FADE_B_C_START
        )
        .to(
          dotRefs.current[1],
          { opacity: 0.3, duration: FADE_DURATION },
          FADE_B_C_START
        )
        .fromTo(
          dotRefs.current[2],
          { opacity: 0.3 },
          { opacity: 1, duration: FADE_DURATION },
          FADE_B_C_START
        );

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="material-section"
      ref={sectionRef}
      aria-label="Materials"
      className="relative z-[2] h-[300vh]"
    >
      {/* ── Pinned 100vh viewport ──────────────────────────────────────────── */}
      <div ref={innerRef} className="relative h-screen w-full overflow-hidden">

        {/* Slide stack — absolutely layered, crossfaded by GSAP */}
        {MATERIALS.map((mat, i) => (
          <div
            key={mat.index}
            ref={(el) => {
              slideRefs.current[i] = el;
            }}
            className="absolute inset-0"
            style={{
              background: mat.bg,
              opacity: i === 0 ? 1 : 0,
              transform: i === 0 ? "scale(1)" : "scale(1.04)",
            }}
            aria-hidden={i !== 0}
          >
            {/* Index counter — upper right */}
            <div className="absolute right-[8vw] top-10">
              <Mono className="text-[--color-muted] opacity-50" aria-hidden="true">{mat.index} / 03</Mono>
            </div>

            {/* Text block — lower left */}
            <div
              ref={(el) => {
                textRefs.current[i] = el;
              }}
              className="absolute bottom-[12vh] left-[8vw]"
            >
              {/* Material name — Display font, very large */}
              <h2
                className="font-bold leading-[0.9] tracking-[-0.04em] text-[--color-text] text-[clamp(3.5rem,9vw,7.5rem)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {mat.lines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </h2>

              {/* Subtitle — Mono, muted */}
              <Mono className="mt-5 text-[--color-muted]">{mat.subtitle}</Mono>
            </div>
          </div>
        ))}

        {/* Progress dots — right edge, centred vertically */}
        <div
          className="absolute right-8 top-1/2 flex -translate-y-1/2 flex-col gap-3"
          aria-hidden="true"
        >
          {MATERIALS.map((_, i) => (
            <div
              key={i}
              ref={(el) => {
                dotRefs.current[i] = el;
              }}
              className="h-1.5 w-1.5 rounded-full bg-[--color-accent]"
              style={{ opacity: i === 0 ? 1 : 0.3 }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
