import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  copy: string;
  action?: ReactNode;
}

export function EmptyState({ title, copy, action }: EmptyStateProps) {
  return (
    <div className="grid gap-4">
      <h3 className="font-headline text-2xl font-extrabold leading-tight text-on-surface">{title}</h3>
      <p className="max-w-2xl text-sm leading-7 text-[color:var(--txt2)]">{copy}</p>
      {action}
    </div>
  );
}
