import type { PropsWithChildren } from 'react';
import { cn } from 'lib/cn';

type BadgeVariant = 'accent' | 'info' | 'outline';

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = 'outline', className = '' }: PropsWithChildren<BadgeProps>) {
  const badgeClass = variant === 'accent'
    ? 'border-primary/40 bg-primary-fixed text-primary'
    : variant === 'info'
      ? 'border-secondary/35 bg-secondary-fixed text-secondary'
      : 'border-charcoal/65 bg-white/80 text-[color:var(--txt2)]';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border-[1.5px] px-2.5 py-1 font-headline text-[9px] font-bold uppercase tracking-[0.12em]',
        badgeClass,
        className,
      )}
    >
      {children}
    </span>
  );
}
