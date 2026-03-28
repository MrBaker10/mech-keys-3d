import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

// ─── Heading ─────────────────────────────────────────────────────────────────

type HeadingSize = "xl" | "lg" | "md" | "sm";
type HeadingTag = "h1" | "h2" | "h3" | "h4";

const headingStyles: Record<HeadingSize, string> = {
  xl: "text-[clamp(3.5rem,8vw,7rem)] font-bold leading-none tracking-[-0.04em]",
  lg: "text-[clamp(2rem,5vw,4rem)] font-bold leading-[1.05] tracking-[-0.03em]",
  md: "text-[clamp(1.25rem,3vw,2rem)] font-semibold leading-[1.15] tracking-[-0.02em]",
  sm: "text-[clamp(1rem,2vw,1.25rem)] font-semibold leading-[1.3] tracking-[0]",
};

const defaultTag: Record<HeadingSize, HeadingTag> = {
  xl: "h1",
  lg: "h2",
  md: "h3",
  sm: "h4",
};

interface HeadingProps {
  size?: HeadingSize;
  as?: HeadingTag;
  className?: string;
  children: ReactNode;
}

export function Heading({ size = "xl", as, className = "", children }: HeadingProps) {
  const Tag = as ?? defaultTag[size];
  return (
    <Tag
      className={twMerge(`text-[--color-text] ${headingStyles[size]}`, className)}
      style={{ fontFamily: "var(--font-display)" }}
    >
      {children}
    </Tag>
  );
}

// ─── Text ─────────────────────────────────────────────────────────────────────

type TextSize = "sm" | "base" | "lg";

const textStyles: Record<TextSize, string> = {
  lg: "text-[1.125rem] leading-[1.7]",
  base: "text-[1rem] leading-[1.65]",
  sm: "text-[0.875rem] leading-[1.5]",
};

interface TextProps {
  size?: TextSize;
  muted?: boolean;
  className?: string;
  children: ReactNode;
}

export function Text({ size = "base", muted = false, className = "", children }: TextProps) {
  return (
    <p
      className={twMerge(
        `${textStyles[size]} ${muted ? "text-[--color-muted]" : "text-[--color-text]"}`,
        className
      )}
      style={{ fontFamily: "var(--font-body)" }}
    >
      {children}
    </p>
  );
}

// ─── Mono ─────────────────────────────────────────────────────────────────────

interface MonoProps {
  className?: string;
  children: ReactNode;
}

export function Mono({ className = "", children }: MonoProps) {
  return (
    <span
      className={twMerge(
        "text-[0.75rem] tracking-[0.1em] uppercase text-[--color-accent]",
        className
      )}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </span>
  );
}
