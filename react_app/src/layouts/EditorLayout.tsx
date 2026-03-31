import { Outlet } from 'react-router-dom';
import { WorkspaceHeader } from 'components/workspace/WorkspaceHeader';
import { WorkspaceTopbar } from 'components/workspace/WorkspaceTopbar';
import { WorkspaceBottomNav } from 'components/workspace/WorkspaceBottomNav';

export function EditorLayout() {
  return (
    <>
      <WorkspaceHeader />
      <WorkspaceTopbar title="resume_v3" editorMode />
      <main className="ra-workspace-main ra-editor-main">
        <Outlet />
      </main>
      <WorkspaceBottomNav />
    </>
  );
}
