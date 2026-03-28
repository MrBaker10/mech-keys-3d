import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

type Variant = "primary" | "ghost";
type Size = "sm" | "md" | "lg";

const baseStyles =
  "inline-flex items-center justify-center uppercase font-bold cursor-pointer transition-colors transition-transform duration-150 select-none";

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-[--color-accent] text-[--color-bg] border-b-2 border-b-[--color-accent-dim] hover:bg-white hover:-translate-y-0.5 hover:border-b-[#cccccc]",
  ghost:
    "bg-transparent text-[--color-text] border border-[--color-border] hover:text-[--color-accent] hover:bg-[--color-surface] hover:border-[--color-accent]",
};

const sizeStyles: Record<Size, string> = {
  sm: "text-[11px] px-4 py-2 tracking-[0.12em]",
  md: "text-[13px] px-6 py-3 tracking-[0.12em]",
  lg: "text-[15px] px-10 py-4 tracking-[0.1em]",
};

// ─── Button as <button> ───────────────────────────────────────────────────────

interface ButtonAsButton extends ButtonHTMLAttributes<HTMLButtonElement> {
  as?: "button";
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

// ─── Button as <a> ───────────────────────────────────────────────────────────

interface ButtonAsAnchor extends AnchorHTMLAttributes<HTMLAnchorElement> {
  as: "a";
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

type ButtonProps = ButtonAsButton | ButtonAsAnchor;

/**
 * Polymorphic button primitive (renders as <button> or <a>).
 *
 * Note: `...rest` is cast after discriminant narrowing — a known TypeScript
 * limitation with discriminated union destructuring. Runtime behaviour is
 * correct; callers receive full attribute autocomplete per element type.
 *
 * Ghost variant: the accent bottom border is a permanent design signature
 * (Accent-Undercut style), visible in both idle and hover states.
 *
 * Accessibility: always provide an accessible name — either visible text
 * children or an `aria-label` when using icon-only content.
 */
export function Button({
  as,
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = twMerge(baseStyles, variantStyles[variant], sizeStyles[size], className);

  // Ghost variant: accent bottom border via inline style (avoids Tailwind specificity conflicts)
  const ghostBorderStyle =
    variant === "ghost"
      ? { borderBottomWidth: "2px", borderBottomColor: "var(--color-accent)" }
      : {};

  const sharedStyle = {
    fontFamily: "var(--font-display)",
    borderRadius: 0,
    ...ghostBorderStyle,
  };

  if (as === "a") {
    return (
      <a className={classes} style={sharedStyle} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} style={sharedStyle} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
