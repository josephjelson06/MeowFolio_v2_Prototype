import type { ReactNode } from 'react';
import { cn } from 'lib/cn';

export function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={cn(className)}>{children}</span>;
}
