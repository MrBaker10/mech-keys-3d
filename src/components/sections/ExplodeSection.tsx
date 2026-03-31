"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Mono } from "@/components/ui/Typography";

// Explosion layers in reveal order — matches SECTIONS.md spec
const LAYERS = [
  { text: "Keycaps",  side: "left",  top: "38%" },
  { text: "Switches", side: "right", top: "54%" },
  { text: "Plate",    side: "left",  top: "46%" },
  { text: "PCB",      side: "right", top: "40%" },
  { text: "Case",     side: "left",  top: "58%" },
] as const;

// Each label occupies 20% of timeline; FADE is the in/out transition fraction
const FADE = 0.04;

export function ExplodeSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const innerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // Timeline duration is implicitly 1.0 — last tween ends at t=1.00,
      // so scrub maps scroll progress 0→1 directly to timeline progress 0→1.
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

        const windowStart = i * 0.2;       // 0, 0.2, 0.4, 0.6, 0.8
        const windowEnd   = windowStart + 0.2; // 0.2, 0.4, 0.6, 0.8, 1.0

        tl
          // Fade in at window start
          .fromTo(el, { opacity: 0 }, { opacity: 1, duration: FADE }, windowStart)
          // Fade out near window end
          .to(el, { opacity: 0, duration: FADE }, windowEnd - FADE);
      });

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="explode-section"
      ref={sectionRef}
      aria-label="Keyboard Exploded View"
      className="relative z-[2] h-[300vh] bg-[--color-bg]"
    >
      {/* Visible pinned area — only the first 100vh is shown while pinned */}
      <div ref={innerRef} className="relative h-screen w-full overflow-hidden">
        {LAYERS.map((layer, i) => (
          <div
            key={layer.text}
            ref={(el) => { labelRefs.current[i] = el; }}
            style={{ top: layer.top }}
            className={`absolute -translate-y-1/2 opacity-0 ${
              layer.side === "left" ? "left-[8vw]" : "right-[8vw]"
            }`}
          >
            {/* Index + accent rule + label */}
            <div className="flex items-center gap-3">
              <Mono className="text-[--color-muted] opacity-50" aria-hidden="true">0{i + 1}</Mono>
              <div className="h-px w-6 bg-[--color-accent]" aria-hidden="true" />
              <Mono className="text-[0.875rem]">{layer.text}</Mono>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
