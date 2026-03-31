import type { PropsWithChildren } from 'react';

type BadgeVariant = 'accent' | 'info' | 'outline';

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = 'outline', className = '' }: PropsWithChildren<BadgeProps>) {
  const badgeClass = variant === 'accent'
    ? 'badge-accent'
    : variant === 'info'
      ? 'badge-info'
      : 'badge-outline';

  return <span className={`${badgeClass}${className ? ` ${className}` : ''}`}>{children}</span>;
}
