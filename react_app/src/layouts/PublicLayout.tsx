import { Outlet } from 'react-router-dom';
import { PublicHeader } from 'components/public/PublicHeader';
import { PublicFooter } from 'components/public/PublicFooter';
import { publicSurfaceWidth } from 'components/public/publicStyles';

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex w-full flex-1 justify-center overflow-x-clip px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className={`mx-auto flex min-h-full flex-col gap-6 ${publicSurfaceWidth} sm:gap-8 lg:gap-10`}>
          <Outlet />
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
