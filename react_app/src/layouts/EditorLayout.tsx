import { Outlet } from 'react-router-dom';
import { WorkspaceHeader } from 'components/workspace/WorkspaceHeader';
import { WorkspaceBottomNav } from 'components/workspace/WorkspaceBottomNav';

export function EditorLayout() {
  return (
    <div className="min-h-screen">
      <WorkspaceHeader />
      <main className="mx-auto w-full max-w-[1320px] px-3 pb-28 pt-7 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <WorkspaceBottomNav />
    </div>
  );
}
