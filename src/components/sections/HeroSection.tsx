"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Mono } from "@/components/ui/Typography";

const TITLE = "MechKeys";
const letters = TITLE.split("");

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Respect prefers-reduced-motion
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      let pulseTween: gsap.core.Tween | undefined;

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // 1. Letter stagger
      tl.fromTo(
        letterRefs.current.filter(Boolean),
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.04 }
      )
        // 2. Subtitle
        .fromTo(
          subtitleRef.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.7 },
          "-=0.3"
        )
        // 3. Scroll indicator fade-in
        .fromTo(
          scrollIndicatorRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.5 },
          "-=0.2"
        )
        // 4. Pulse loop starts 0.3s after timeline ends
        .call(
          () => {
            pulseTween = gsap.to(lineRef.current, {
              scaleY: 0.4,
              opacity: 0.3,
              duration: 1.2,
              ease: "power2.inOut",
              yoyo: true,
              repeat: -1,
              transformOrigin: "top",
            });
          },
          [],
          "+=0.3"
        );

      return () => pulseTween?.kill();
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      aria-label="Hero"
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[--color-bg]"
    >
      <div className="flex flex-col items-center gap-6 px-6 text-center">
        {/* Title with letter-stagger */}
        <h1
          className="font-bold leading-none tracking-[-0.05em] text-[--color-text] text-[clamp(4rem,12vw,10rem)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {/* Screen-reader text */}
          <span className="sr-only">{TITLE}</span>
          {/* Visual letter spans */}
          <span aria-hidden="true">
            {letters.map((char, i) => (
              <span
                key={char + i}
                ref={(el) => {
                  letterRefs.current[i] = el;
                }}
                className="inline-block"
              >
                {char}
              </span>
            ))}
          </span>
        </h1>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="max-w-lg text-[1.125rem] leading-[1.7] text-[--color-muted]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Precision Crafted Mechanical Keyboards
        </p>
      </div>

      {/* Scroll indicator */}
      <div
        ref={scrollIndicatorRef}
        className="absolute bottom-10 flex flex-col items-center gap-3"
        aria-hidden="true"
      >
        <Mono>Scroll to explore</Mono>
        <div
          ref={lineRef}
          className="h-10 w-px bg-[--color-border]"
          style={{ animation: "none", transformOrigin: "top" }}
        />
      </div>
    </section>
  );
}
