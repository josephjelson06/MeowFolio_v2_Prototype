import type { ReactNode } from 'react';
import { PublicFooter } from 'components/public/PublicFooter';
import { PublicHeader } from 'components/public/PublicHeader';

export function PublicLayout({
  children,
  mainClassName = 'flex w-full flex-1 justify-center overflow-x-clip px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12',
  onOpenAuth,
}: {
  children: ReactNode;
  mainClassName?: string;
  onOpenAuth: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader onOpenAuth={onOpenAuth} />
      <main className={mainClassName}>{children}</main>
      <PublicFooter />
    </div>
  );
}
