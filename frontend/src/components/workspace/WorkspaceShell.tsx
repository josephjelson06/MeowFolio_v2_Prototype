import type { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from 'lib/cn';
import { routes } from 'app/router/routes';
import { useSession } from 'state/session/sessionContext';

function workspaceLinkClass(active: boolean) {
  return cn(
    'inline-flex min-h-10 items-center justify-center rounded-full px-4 text-sm font-bold text-[color:var(--txt1)] transition hover:bg-white/70 hover:text-primary',
    active && 'border-[1.5px] border-charcoal/75 bg-white/85 text-on-surface shadow-tactile-sm',
  );
}

export function WorkspaceShell({
  children,
  title,
  mainClassName = 'mx-auto w-full max-w-[1220px] px-4 pb-28 pt-7 sm:px-6 lg:px-8',
  showMobileTopBar = true,
}: {
  children: ReactNode;
  title: string;
  mainClassName?: string;
  showMobileTopBar?: boolean;
}) {
  const location = useLocation();
  const { initials } = useSession();
  const resumesActive = location.pathname === routes.resumes || location.pathname === routes.editor;
  const mobileTabClass = (active: boolean) =>
    cn(
      'flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-medium text-[color:var(--txt2)] transition',
      active && 'text-primary',
    );

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-40 hidden min-h-[68px] grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-charcoal/10 bg-background/85 px-4 shadow-[0_8px_24px_rgba(28,28,24,0.05)] backdrop-blur-xl md:grid md:px-8">
        <NavLink className="inline-flex w-max items-center font-headline text-2xl font-extrabold tracking-[-0.03em] text-on-surface" to={routes.dashboard}>
          meowfolio
        </NavLink>
        <div className="flex items-center justify-self-center gap-2">
          <NavLink className={({ isActive }) => workspaceLinkClass(isActive)} to={routes.dashboard}>
            Dashboard
          </NavLink>
          <NavLink className={workspaceLinkClass(resumesActive)} to={routes.resumes}>
            Resumes
          </NavLink>
          <NavLink className={({ isActive }) => workspaceLinkClass(isActive)} to={routes.jds}>
            JDs
          </NavLink>
        </div>
        <div className="justify-self-end">
          <NavLink className="grid size-9 place-items-center rounded-full border-[1.5px] border-charcoal/75 bg-white/85 font-headline text-xs font-bold text-secondary shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:shadow-tactile" to={routes.profile}>
            {initials}
          </NavLink>
        </div>
      </nav>

      {showMobileTopBar ? (
        <div className="sticky top-0 z-40 flex min-h-[56px] items-center gap-3 border-b border-charcoal/10 bg-background/92 px-4 backdrop-blur-xl md:hidden">
          <NavLink className="inline-flex items-center font-headline text-lg font-extrabold tracking-[-0.03em] text-on-surface" to={routes.dashboard}>
            meowfolio
          </NavLink>
          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-on-surface">{title}</span>
          <NavLink className="grid size-9 place-items-center rounded-full border-[1.5px] border-charcoal/75 bg-white/85 font-headline text-xs font-bold text-secondary shadow-tactile-sm" to={routes.profile}>
            {initials}
          </NavLink>
        </div>
      ) : null}

      <main className={mainClassName}>{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex min-h-[calc(60px+env(safe-area-inset-bottom))] border-t border-charcoal/10 bg-background/95 px-3 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_18px_rgba(28,28,24,0.05)] backdrop-blur-xl md:hidden" aria-label="Mobile navigation">
        <NavLink className={({ isActive }) => mobileTabClass(isActive)} to={routes.dashboard}>
          <div className="text-base">&#8862;</div>
          <span>Dashboard</span>
        </NavLink>
        <NavLink className={mobileTabClass(resumesActive)} to={routes.resumes}>
          <div className="text-base">&#9776;</div>
          <span>Resumes</span>
        </NavLink>
        <NavLink className={({ isActive }) => mobileTabClass(isActive)} to={routes.jds}>
          <div className="text-base">&#8857;</div>
          <span>JDs</span>
        </NavLink>
        <NavLink className={({ isActive }) => mobileTabClass(isActive)} to={routes.profile}>
          <div className="text-base">&#9675;</div>
          <span>Profile</span>
        </NavLink>
      </nav>
    </div>
  );
}
