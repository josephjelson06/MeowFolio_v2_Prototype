import type { ReactNode } from 'react';
import { cn } from 'lib/cn';

export function ModalShell({
  children,
  labelledBy,
  onClose,
  overlayClassName,
  panelClassName,
}: {
  children: ReactNode;
  labelledBy: string;
  onClose: () => void;
  overlayClassName?: string;
  panelClassName?: string;
}) {
  return (
    <div
      className={cn('fixed inset-0 z-[500] flex items-center justify-center px-4 py-6', overlayClassName)}
      aria-hidden="false"
      onClick={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={cn('relative w-full overflow-hidden rounded-[1.75rem]', panelClassName)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
      >
        {children}
      </div>
    </div>
  );
}
