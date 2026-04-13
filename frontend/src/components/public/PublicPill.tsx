import type { ReactNode } from 'react';
import { Badge } from 'components/ui/Badge';
import { cn } from 'lib/cn';

export type PublicPillVariant = 'accent' | 'info' | 'outline';

export function PublicPill({
  children,
  className,
  variant = 'outline',
}: {
  children: ReactNode;
  className?: string;
  variant?: PublicPillVariant;
}) {
  const toneClass =
    variant === 'accent'
      ? 'border-primary/40 bg-primary-fixed text-primary'
      : variant === 'info'
        ? 'border-secondary/35 bg-secondary-fixed text-secondary'
        : 'border-charcoal/65 bg-white/80 text-[color:var(--txt2)]';

  return (
    <Badge
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full border-[1.5px] px-4 py-1.5 font-headline text-[11px] font-bold uppercase tracking-[0.14em] sm:text-xs',
        toneClass,
        className,
      )}
    >
      {children}
    </Badge>
  );
}
