import type { PropsWithChildren } from "react";

type PublicSectionProps = PropsWithChildren<{
  className?: string;
}>;

/**
 * Neutral section wrapper:
 * - handles semantics
 * - does not impose a visual shell by default
 * - lets each page decide whether a section should feel open or boxed
 */
export function PublicSection({ className = "", children }: PublicSectionProps) {
  return <section className={`relative w-full ${className}`}>{children}</section>;
}
