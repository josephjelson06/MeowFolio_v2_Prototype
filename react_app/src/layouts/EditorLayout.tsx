import { Outlet } from 'react-router-dom';
import { WorkspaceHeader } from 'components/workspace/WorkspaceHeader';
import { WorkspaceBottomNav } from 'components/workspace/WorkspaceBottomNav';

export function EditorLayout() {
  return (
    <>
      <WorkspaceHeader />
      <main className="ra-workspace-main ra-editor-main">
        <Outlet />
      </main>
      <WorkspaceBottomNav />
    </>
  );
}
