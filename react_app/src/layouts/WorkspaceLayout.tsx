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
    <>
      <WorkspaceHeader />
      <WorkspaceTopbar title={title} />
      <main className="ra-workspace-main">
        <Outlet />
      </main>
      <WorkspaceBottomNav />
    </>
  );
}
