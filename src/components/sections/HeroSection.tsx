"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        headlineRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1 }
      )
        .fromTo(
          subtitleRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.5"
        )
        .fromTo(
          scrollIndicatorRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.6 },
          "-=0.3"
        );
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      aria-label="Hero"
      className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-[--color-bg]"
    >
      {/* Content */}
      <div className="flex flex-col items-center gap-6 px-6 text-center">
        <h1
          ref={headlineRef}
          className="text-[clamp(4rem,12vw,10rem)] font-bold leading-none tracking-tighter text-[--color-text]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          MechKeys
        </h1>
        <p
          ref={subtitleRef}
          className="max-w-md text-[clamp(1rem,2vw,1.25rem)] leading-relaxed text-[--color-muted]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Precision crafted. Tactile perfection.
          <br />
          Scroll to explore the anatomy of sound.
        </p>
      </div>

      {/* Scroll indicator */}
      <div
        ref={scrollIndicatorRef}
        className="absolute bottom-10 flex flex-col items-center gap-2"
        aria-hidden="true"
      >
        <span
          className="text-xs uppercase tracking-[0.2em] text-[--color-muted]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Scroll
        </span>
        <div className="scroll-arrow h-8 w-px bg-[--color-border]" />
      </div>
    </section>
  );
}
