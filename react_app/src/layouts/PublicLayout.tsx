import { Outlet } from 'react-router-dom';
import { PublicHeader } from 'components/public/PublicHeader';
import { PublicFooter } from 'components/public/PublicFooter';

export function PublicLayout() {
  return (
    <div className="min-h-screen">
      <PublicHeader />
      <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <Outlet />
        <PublicFooter />
      </main>
    </div>
  );
}
