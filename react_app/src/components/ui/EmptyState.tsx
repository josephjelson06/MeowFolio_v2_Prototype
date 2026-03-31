import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  copy: string;
  action?: ReactNode;
}

export function EmptyState({ title, copy, action }: EmptyStateProps) {
  return (
    <div className="ra-stack-md">
      <h3 className="ra-card-title">{title}</h3>
      <p className="ra-card-copy">{copy}</p>
      {action}
    </div>
  );
}
