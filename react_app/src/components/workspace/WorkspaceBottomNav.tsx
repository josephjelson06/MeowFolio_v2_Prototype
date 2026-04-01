import { NavLink, useLocation } from 'react-router-dom';
import { routes } from 'lib/routes';

export function WorkspaceBottomNav() {
  const location = useLocation();
  const resumesActive = location.pathname === routes.resumes || location.pathname === routes.editor;

  return (
    <nav className="mob-bottombar" aria-label="Mobile navigation">
      <NavLink className={({ isActive }) => `mob-tab${isActive ? ' active' : ''}`} to={routes.dashboard}>
        <div className="mob-tab-icon">&#8862;</div>
        <span>Dashboard</span>
      </NavLink>
      <NavLink className={`mob-tab${resumesActive ? ' active' : ''}`} to={routes.resumes}>
        <div className="mob-tab-icon">&#9776;</div>
        <span>Resumes</span>
      </NavLink>
      <NavLink className={({ isActive }) => `mob-tab${isActive ? ' active' : ''}`} to={routes.jds}>
        <div className="mob-tab-icon">&#8857;</div>
        <span>JDs</span>
      </NavLink>
      <NavLink className={({ isActive }) => `mob-tab${isActive ? ' active' : ''}`} to={routes.profile}>
        <div className="mob-tab-icon">&#9675;</div>
        <span>Profile</span>
      </NavLink>
    </nav>
  );
}
