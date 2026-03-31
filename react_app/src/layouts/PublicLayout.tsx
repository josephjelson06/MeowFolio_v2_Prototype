import { Outlet } from 'react-router-dom';
import { PublicHeader } from 'components/public/PublicHeader';
import { PublicFooter } from 'components/public/PublicFooter';

export function PublicLayout() {
  return (
    <>
      <PublicHeader />
      <main className="pub-desktop-body pub-page ra-public-main">
        <Outlet />
        <PublicFooter />
      </main>
    </>
  );
}
