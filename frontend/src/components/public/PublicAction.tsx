import type { ReactNode } from 'react';
import { Button } from 'components/ui/Button';
import { cn } from 'lib/cn';

export type PublicActionVariant = 'primary' | 'secondary' | 'link';
export type PublicActionSize = 'md' | 'lg';

export function PublicAction({
  children,
  className,
  onClick,
  size = 'md',
  to,
  variant = 'primary',
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  size?: PublicActionSize;
  to?: string;
  variant?: PublicActionVariant;
}) {
  const sizeClass =
    variant === 'link'
      ? size === 'lg'
        ? 'min-h-11 px-5 py-2.5 text-sm'
        : 'min-h-10 px-4 py-2 text-xs'
      : size === 'lg'
        ? 'min-h-[3.5rem] px-7 py-3.5 text-base'
        : 'min-h-12 px-6 py-3 text-sm';
  const variantClass =
    variant === 'primary'
      ? 'bg-white/95 text-on-surface hover:bg-surface-container-low hover:text-primary hover:shadow-tactile'
      : variant === 'secondary'
        ? 'bg-white/85 font-sans font-semibold text-[color:var(--txt1)] hover:bg-white hover:text-on-surface hover:shadow-tactile'
        : 'border-charcoal/65 bg-white/80 font-sans font-semibold text-[color:var(--txt1)] hover:bg-white hover:text-on-surface hover:shadow-tactile-sm';
  const actionClass = cn(
    'inline-flex items-center justify-center gap-2 rounded-full border-2 border-charcoal text-center font-headline font-bold tracking-[0.01em] transition duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
    'shadow-tactile-sm hover:-translate-x-px hover:-translate-y-px active:translate-x-px active:translate-y-px active:shadow-none',
    sizeClass,
    variantClass,
    className,
  );

  return (
    <Button className={actionClass} to={to} type="button" onClick={onClick}>
      {children}
    </Button>
  );
}
