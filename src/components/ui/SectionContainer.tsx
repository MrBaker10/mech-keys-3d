import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface SectionContainerProps {
  id?: string;
  fullHeight?: boolean;
  pinned?: boolean;
  className?: string;
  children: ReactNode;
}

export function SectionContainer({
  id,
  fullHeight = true,
  pinned = false,
  className,
  children,
}: SectionContainerProps) {
  // pinned takes precedence: 200vh for ScrollTrigger scrub sections
  const heightClass = pinned ? "min-h-[200vh]" : fullHeight ? "min-h-screen" : "";

  return (
    <section id={id} className={twMerge("relative", heightClass, className)}>
      <div className="section-container">{children}</div>
    </section>
  );
}
