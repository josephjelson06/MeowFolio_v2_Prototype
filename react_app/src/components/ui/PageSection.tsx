import type { PropsWithChildren, ReactNode } from 'react';
import { cn } from 'lib/cn';

interface PageSectionProps {
  kicker?: string;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageSection({
  kicker,
  title,
  subtitle,
  actions,
  className = '',
  children,
}: PropsWithChildren<PageSectionProps>) {
  return (
    <section className={cn('rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/85 p-5 shadow-tactile backdrop-blur-sm md:p-6', className)}>
      {(kicker || title || subtitle || actions) && (
        <header className="grid gap-2.5">
          {kicker ? <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--txt2)]">{kicker}</div> : null}
          {title ? <h2 className="font-headline text-2xl font-extrabold leading-tight text-on-surface">{title}</h2> : null}
          {subtitle ? <p className="max-w-4xl text-base leading-7 text-[color:var(--txt2)]">{subtitle}</p> : null}
          {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
        </header>
      )}
      {children}
    </section>
  );
}
