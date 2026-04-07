import type { ComponentPropsWithoutRef } from 'react';
import { cn } from 'lib/cn';
import { publicSectionShell } from 'components/public/publicStyles';

type PublicSectionProps = ComponentPropsWithoutRef<'section'>;

export function PublicSection({ className, children, ...props }: PublicSectionProps) {
  return (
    <section className={cn(publicSectionShell, className)} {...props}>
      {children}
    </section>
  );
}
