import { NavLink, useLocation } from 'react-router-dom';
import { cn } from 'lib/cn';
import { routes } from 'lib/routes';

export function WorkspaceBottomNav() {
  const location = useLocation();
  const resumesActive = location.pathname === routes.resumes || location.pathname === routes.editor;
  const tabClass = (active: boolean) => cn(
    'flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-medium text-[color:var(--txt2)] transition',
    active && 'text-primary',
  );

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex min-h-[calc(60px+env(safe-area-inset-bottom))] border-t border-charcoal/10 bg-background/95 px-3 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_18px_rgba(28,28,24,0.05)] backdrop-blur-xl md:hidden" aria-label="Mobile navigation">
      <NavLink className={({ isActive }) => tabClass(isActive)} to={routes.dashboard}>
        <div className="text-base">&#8862;</div>
        <span>Dashboard</span>
      </NavLink>
      <NavLink className={tabClass(resumesActive)} to={routes.resumes}>
        <div className="text-base">&#9776;</div>
        <span>Resumes</span>
      </NavLink>
      <NavLink className={({ isActive }) => tabClass(isActive)} to={routes.jds}>
        <div className="text-base">&#8857;</div>
        <span>JDs</span>
      </NavLink>
      <NavLink className={({ isActive }) => tabClass(isActive)} to={routes.profile}>
        <div className="text-base">&#9675;</div>
        <span>Profile</span>
      </NavLink>
    </nav>
  );
}
