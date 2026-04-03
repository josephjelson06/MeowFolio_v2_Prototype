import type { PropsWithChildren } from 'react';
import { cn } from 'lib/cn';

interface CardProps {
  className?: string;
}

export function Card({ children, className = '' }: PropsWithChildren<CardProps>) {
  return (
    <section
      className={cn(
        'rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/85 p-5 shadow-tactile backdrop-blur-sm md:p-6',
        className,
      )}
    >
      {children}
    </section>
  );
}
