"use client";

import { Suspense, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { KeyboardModel } from "./KeyboardModel";
import { KeyboardExplode } from "./KeyboardExplode";

export function Scene() {
  // ─── Hero progress ──────────────────────────────────────────────────────────
  // Written by ScrollTrigger, read by useFrame — no setState, no re-renders.
  const heroProgressRef = useRef(0);

  // ─── Explode progress + visibility ──────────────────────────────────────────
  const explodeProgressRef = useRef(0);
  const explodeActiveRef   = useRef(false);

  useEffect(() => {
    const heroTrigger = ScrollTrigger.create({
      trigger: "#hero",
      start: "top top",
      end: "bottom top",
      onUpdate: (self) => { heroProgressRef.current = self.progress; },
    });

    const explodeTrigger = ScrollTrigger.create({
      trigger: "#explode-section",
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => { explodeProgressRef.current = self.progress; },
      // onToggle fires on both enter and leave; isActive reflects current state
      onToggle: (self) => { explodeActiveRef.current = self.isActive; },
    });

    return () => {
      heroTrigger.kill();
      explodeTrigger.kill();
    };
  }, []);

  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 5], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      role="img"
      aria-label="3D mechanical keyboard visualization"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />

        {/* Hero section: keyboard floats below title, rises out as user scrolls */}
        <KeyboardModel progressRef={heroProgressRef} />

        {/* Explode section: keyboard only visible inside ExplodeSection */}
        <KeyboardExplode
          progressRef={explodeProgressRef}
          activeRef={explodeActiveRef}
        />

        <Environment preset="city" />
      </Suspense>
    </Canvas>
  );
}
