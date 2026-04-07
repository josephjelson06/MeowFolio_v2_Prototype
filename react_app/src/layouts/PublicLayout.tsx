import { Outlet } from 'react-router-dom';
import { PublicHeader } from 'components/public/PublicHeader';
import { PublicFooter } from 'components/public/PublicFooter';

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}
