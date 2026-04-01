import { NavLink } from 'react-router-dom';
import { routes } from 'lib/routes';
import { useSession } from 'state/session/sessionContext';

interface WorkspaceTopbarProps {
  title: string;
  editorMode?: boolean;
}

export function WorkspaceTopbar({ title, editorMode = false }: WorkspaceTopbarProps) {
  const { initials } = useSession();
  if (editorMode) {
    return (
      <div className="mob-topbar editor-mobile-nav">
        <NavLink className="mob-back editor-back-link" to={routes.resumes}>&larr;</NavLink>
        <span className="mob-topbar-title">{title}</span>
        <NavLink className="mob-analyze-btn" to={routes.jds}>Analyze</NavLink>
        <NavLink className="avatar" to={routes.profile}>{initials}</NavLink>
      </div>
    );
  }

  return (
    <div className="mob-topbar">
      <NavLink className="mob-topbar-logo" to={routes.dashboard}>resumeai</NavLink>
      <span className="mob-topbar-title">{title}</span>
      <NavLink className="avatar" to={routes.profile}>{initials}</NavLink>
    </div>
  );
}
