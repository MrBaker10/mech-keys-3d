"use client";

import { useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Mono } from "@/components/ui/Typography";

// ─── Static data ──────────────────────────────────────────────────────────────

const TYPES = ["Thocky", "Clacky", "Linear"] as const;
type SoundType = (typeof TYPES)[number];

// Waveform accent colours match --color-accent and --color-accent-2
const C_ACCENT   = "#e8ff47";
const C_ACCENT_2 = "#ff6b35";

// ─── Waveform draw helper ────────────────────────────────────────────────────
// Draws 3 layered sin waves on the canvas using current time + progress.
// Called from the GSAP ticker — NOT a React render.

function drawWave(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  progress: number
) {
  ctx.clearRect(0, 0, w, h);
  if (progress < 0.01) return;

  const centerY   = h / 2;
  const maxAmp    = h * 0.38;
  const amplitude = maxAmp * progress;

  for (let layer = 0; layer < 3; layer++) {
    // Frequency increases slightly with each layer and with progress
    const freq   = ((1.8 + progress * 3.5 + layer * 1.3) / w) * Math.PI * 2;
    const speed  = (0.7 + layer * 0.4) * time;
    const alpha  = (1 - layer * 0.3) * Math.min(1, progress * 2.5);
    const amp    = amplitude * (1 - layer * 0.18);
    const lw     = Math.max(0.5, 2.5 - layer * 0.8);
    const blur   = Math.max(0, (8 - layer * 3) * progress);

    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, C_ACCENT);
    grad.addColorStop(1, C_ACCENT_2);

    ctx.beginPath();
    ctx.strokeStyle  = grad;
    ctx.globalAlpha  = alpha;
    ctx.lineWidth    = lw;
    ctx.shadowBlur   = blur;
    ctx.shadowColor  = C_ACCENT;

    for (let x = 0; x <= w; x += 1) {
      const y = centerY + Math.sin(x * freq + speed) * amp;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
  ctx.shadowBlur  = 0;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SoundSection() {
  const sectionRef  = useRef<HTMLElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(0);
  const innerRef    = useRef<HTMLDivElement>(null);

  const [activeType, setActiveType] = useState<SoundType>("Thocky");

  useGSAP(
    () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const resize = () => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      };
      resize();
      window.addEventListener("resize", resize);

      // Pin trigger — unchanged from original
      const trigger = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom bottom",
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          progressRef.current = self.progress;
        },
      });

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(innerRef.current, { opacity: 1 });
        return () => {
          window.removeEventListener("resize", resize);
          trigger.kill();
        };
      }

      // Fade timeline — entry (0→8%) and exit (88→100%)
      const fadeTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      });
      fadeTl
        .fromTo(innerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.08 }, 0)
        .to(innerRef.current, { opacity: 0, duration: 0.12 }, 0.88);

      const tick = (time: number) => {
        drawWave(ctx, canvas.offsetWidth, canvas.offsetHeight, time, progressRef.current);
      };
      gsap.ticker.add(tick);

      return () => {
        window.removeEventListener("resize", resize);
        gsap.ticker.remove(tick);
        trigger.kill();
        fadeTl.scrollTrigger?.kill();
        fadeTl.kill();
      };
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="sound-section"
      ref={sectionRef}
      aria-label="Switch Sound Signature"
      className="relative z-[2] h-[200vh] bg-[--color-bg]"
    >
      {/* ── Pinned 100vh viewport ────────────────────────────────────────── */}
      <div ref={innerRef} className="relative flex h-screen w-full flex-col items-center justify-center gap-14 px-[8vw] opacity-0">

        {/* Waveform canvas */}
        <div className="w-full max-w-4xl" style={{ height: "180px" }}>
          <canvas
            ref={canvasRef}
            className="h-full w-full"
            aria-hidden="true"
          />
        </div>

        {/* Heading */}
        <div className="text-center">
          <h2
            className="text-[clamp(1.8rem,4vw,3rem)] font-bold leading-none tracking-[-0.03em] text-[--color-text]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            The Sound of Precision
          </h2>
          <p
            className="mt-3 text-[0.9rem] text-[--color-muted]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Scroll to hear the character.
          </p>
        </div>

        {/* Type toggles — visual only for now */}
        <div
          className="flex items-center gap-10"
          role="group"
          aria-label="Switch sound type"
        >
          {TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`border-b pb-1 transition-colors duration-200 ${
                activeType === type
                  ? "border-[--color-accent]"
                  : "border-transparent"
              }`}
              aria-pressed={activeType === type}
            >
              <Mono
                className={
                  activeType === type
                    ? "text-[--color-accent]"
                    : "text-[--color-muted] hover:text-[--color-text]"
                }
              >
                {type}
              </Mono>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
