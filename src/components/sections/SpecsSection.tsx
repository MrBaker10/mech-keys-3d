"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Mono } from "@/components/ui/Typography";

gsap.registerPlugin(ScrollTrigger);

// ─── Spec data ────────────────────────────────────────────────────────────────
//
// colSpan controls the Bento grid layout at each breakpoint.
// Desktop (lg, 3 col): Layout=2, Keycaps=2, Software=2 — rest 1
// Tablet  (md, 2 col): Layout=2 — rest 1 (spans stay within 2-col grid)
// Mobile  (default, 1 col): all 1

const SPECS = [
  { label: "Layout",       value: "75%",             lg: "lg:col-span-2", md: "md:col-span-2" },
  { label: "Switches",     value: "Mechanical",       lg: "",              md: ""              },
  { label: "Battery",      value: "8000 mAh",         lg: "",              md: ""              },
  { label: "Weight",       value: "1.2 kg",           lg: "",              md: ""              },
  { label: "Keys",         value: "84",               lg: "",              md: ""              },
  { label: "Case",         value: "Aluminum",         lg: "",              md: ""              },
  { label: "Keycaps",      value: "PBT Double-Shot",  lg: "lg:col-span-2", md: ""              },
  { label: "Connectivity", value: "USB-C / BT 5.1",   lg: "",              md: ""              },
  { label: "Software",     value: "QMK/VIA",          lg: "lg:col-span-2", md: ""              },
] as const;

// Verify the desktop grid rows fill evenly (3-col): Layout(2)+Switches(1) |
// Battery(1)+Weight(1)+Keys(1) | Case(1)+Keycaps(2) | Connectivity(1)+Software(2)

// ─── Component ────────────────────────────────────────────────────────────────

export function SpecsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs   = useRef<(HTMLDivElement | null)[]>([]);
  const headingRef = useRef<HTMLDivElement>(null);

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

  return (
    <section
      id="specs-section"
      ref={sectionRef}
      aria-label="Specifications"
      className="relative z-[2] min-h-screen bg-[--color-bg] px-[8vw] pb-24 pt-28"
    >
      {/* ── Section heading ────────────────────────────────────────────────── */}
      <div ref={headingRef} className="mb-16">
        <Mono className="mb-4 block text-[--color-muted]">Technical Specs</Mono>
        <h2
          className="font-bold leading-none tracking-[-0.04em] text-[--color-text]"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.5rem, 6vw, 5rem)",
          }}
        >
          Precision in every detail.
        </h2>
      </div>

      {/* ── Bento grid ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {SPECS.map((spec, i) => (
          <div
            key={spec.label}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className={[
              // Base card style
              "flex min-h-[130px] flex-col justify-between",
              "border border-[--color-border] bg-[--color-surface]",
              "p-6 md:p-8",
              // Bento column spans
              spec.lg,
              spec.md,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {/* Value — large, Display font */}
            <p
              className="font-bold leading-none tracking-[-0.04em] text-[--color-text]"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.75rem, 3.5vw, 3rem)",
              }}
            >
              {spec.value}
            </p>

            {/* Label — Mono, muted */}
            <Mono className="mt-4 text-[--color-muted]">{spec.label}</Mono>
          </div>
        ))}
      </div>
    </section>
  );
}
