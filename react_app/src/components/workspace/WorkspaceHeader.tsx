import { NavLink, useLocation } from 'react-router-dom';
import { cn } from 'lib/cn';
import { routes } from 'lib/routes';
import { useSession } from 'state/session/sessionContext';

export function WorkspaceHeader() {
  const location = useLocation();
  const { initials } = useSession();
  const resumesActive = location.pathname === routes.resumes || location.pathname === routes.editor;
  const linkClass = (active: boolean) => cn(
    'inline-flex min-h-10 items-center justify-center rounded-full px-4 text-sm font-bold text-[color:var(--txt1)] transition hover:bg-white/70 hover:text-primary',
    active && 'border-[1.5px] border-charcoal/75 bg-white/85 text-on-surface shadow-tactile-sm',
  );

  return (
    <nav className="sticky top-0 z-40 hidden min-h-[68px] grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-charcoal/10 bg-background/85 px-4 shadow-[0_8px_24px_rgba(28,28,24,0.05)] backdrop-blur-xl md:grid md:px-8">
      <NavLink className="inline-flex w-max items-center font-headline text-2xl font-extrabold tracking-[-0.03em] text-on-surface" to={routes.dashboard}>meowfolio</NavLink>
      <div className="flex items-center justify-self-center gap-2">
        <NavLink className={({ isActive }) => linkClass(isActive)} to={routes.dashboard}>Dashboard</NavLink>
        <NavLink className={linkClass(resumesActive)} to={routes.resumes}>Resumes</NavLink>
        <NavLink className={({ isActive }) => linkClass(isActive)} to={routes.jds}>JDs</NavLink>
      </div>
      <div className="justify-self-end">
        <NavLink className="grid size-9 place-items-center rounded-full border-[1.5px] border-charcoal/75 bg-white/85 font-headline text-xs font-bold text-secondary shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:shadow-tactile" to={routes.profile}>{initials}</NavLink>
      </div>
    </nav>
  );
}
