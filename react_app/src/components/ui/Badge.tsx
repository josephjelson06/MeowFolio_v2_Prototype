import type { PropsWithChildren } from 'react';
import { cn } from 'lib/cn';

type BadgeVariant = 'accent' | 'info' | 'outline';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

export function Badge({ children, variant = 'outline', size = 'sm', className = '' }: PropsWithChildren<BadgeProps>) {
  const badgeClass = variant === 'accent'
    ? 'border-primary/40 bg-primary-fixed text-primary'
    : variant === 'info'
      ? 'border-secondary/35 bg-secondary-fixed text-secondary'
      : 'border-charcoal/65 bg-white/80 text-[color:var(--txt2)]';
  const sizeClass = size === 'md'
    ? 'px-3.5 py-1.5 text-[10px] tracking-[0.14em] sm:text-[11px]'
    : 'px-2.5 py-1 text-[9px] tracking-[0.12em]';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border-[1.5px] font-headline font-bold uppercase',
        sizeClass,
        badgeClass,
        className,
      )}
    >
      {children}
    </span>
  );
}
