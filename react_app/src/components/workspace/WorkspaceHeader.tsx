import { NavLink } from 'react-router-dom';
import { routes } from 'lib/routes';

export function WorkspaceHeader() {
  return (
    <nav className="gnav">
      <NavLink className="gnav-logo" to={routes.dashboard}>resumeai</NavLink>
      <div className="gnav-links">
        <NavLink className={({ isActive }) => `gnav-link${isActive ? ' active' : ''}`} to={routes.dashboard}>Dashboard</NavLink>
        <NavLink className={({ isActive }) => `gnav-link${isActive ? ' active' : ''}`} to={routes.resumes}>Resumes</NavLink>
        <NavLink className={({ isActive }) => `gnav-link${isActive ? ' active' : ''}`} to={routes.jds}>JDs</NavLink>
      </div>
      <div className="gnav-right">
        <NavLink className="avatar" to={routes.profile}>AK</NavLink>
      </div>
    </nav>
  );
}
