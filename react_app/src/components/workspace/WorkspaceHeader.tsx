import { NavLink, useLocation } from 'react-router-dom';
import { routes } from 'lib/routes';

export function WorkspaceHeader() {
  const location = useLocation();
  const resumesActive = location.pathname === routes.resumes || location.pathname === routes.editor;

  return (
    <nav className="gnav">
      <NavLink className="gnav-logo" to={routes.dashboard}>resumeai</NavLink>
      <div className="gnav-links">
        <NavLink className={({ isActive }) => `gnav-link${isActive ? ' active' : ''}`} to={routes.dashboard}>Dashboard</NavLink>
        <NavLink className={`gnav-link${resumesActive ? ' active' : ''}`} to={routes.resumes}>Resumes</NavLink>
        <NavLink className={({ isActive }) => `gnav-link${isActive ? ' active' : ''}`} to={routes.jds}>JDs</NavLink>
      </div>
      <div className="gnav-right">
        <NavLink className="avatar" to={routes.profile}>AK</NavLink>
      </div>
    </nav>
  );
}
