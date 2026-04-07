import { Outlet } from 'react-router-dom';
import { PublicHeader } from 'components/public/PublicHeader';
import { PublicFooter } from 'components/public/PublicFooter';
import { publicSurfaceWidth } from 'components/public/publicStyles';

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1 overflow-x-clip px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className={`mx-auto flex min-h-full w-full flex-1 flex-col gap-6 ${publicSurfaceWidth} sm:gap-8 lg:gap-10`}>
          <Outlet />
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
