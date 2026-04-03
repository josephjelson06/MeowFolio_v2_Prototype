import { Outlet, useLocation } from 'react-router-dom';
import { WorkspaceHeader } from 'components/workspace/WorkspaceHeader';
import { WorkspaceTopbar } from 'components/workspace/WorkspaceTopbar';
import { WorkspaceBottomNav } from 'components/workspace/WorkspaceBottomNav';
import { routes } from 'lib/routes';

function getTitle(pathname: string) {
  if (pathname.startsWith(routes.resumes)) return 'Resumes';
  if (pathname.startsWith(routes.jds)) return 'JD Match';
  if (pathname.startsWith(routes.profile)) return 'Profile';
  return 'Dashboard';
}

export function WorkspaceLayout() {
  const location = useLocation();
  const title = getTitle(location.pathname);

  return (
    <div className="min-h-screen">
      <WorkspaceHeader />
      <WorkspaceTopbar title={title} />
      <main className="mx-auto w-full max-w-[1220px] px-4 pb-28 pt-7 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <WorkspaceBottomNav />
    </div>
  );
}
