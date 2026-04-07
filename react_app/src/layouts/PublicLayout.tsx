import { Outlet } from 'react-router-dom';
import { PublicHeader } from 'components/public/PublicHeader';
import { PublicFooter } from 'components/public/PublicFooter';

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="mx-auto flex w-full max-w-[1120px] flex-1 flex-col gap-16 overflow-hidden px-4 py-8 sm:px-6 md:gap-20 md:py-10 lg:gap-24 lg:px-8">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}
