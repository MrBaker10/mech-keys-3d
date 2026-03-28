import { HeroSection } from "@/components/sections/HeroSection";

export default function Home() {
  return (
    <main>
      <HeroSection />
      {/* Placeholder for next section — replace when ExplodeSection is built */}
      <section className="min-h-screen bg-[--color-bg]" aria-hidden="true" />
    </main>
  );
}
