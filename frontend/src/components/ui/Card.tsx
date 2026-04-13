import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from 'lib/cn';

export function Card({
  children,
  className,
  ...rest
}: {
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLElement>) {
  return (
    <article className={cn(className)} {...rest}>
      {children}
    </article>
  );
}
