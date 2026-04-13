import { NavLink } from 'react-router-dom';
import { cn } from 'lib/cn';
import { routes } from 'app/router/routes';
import { PublicAction } from 'components/public/PublicAction';
import { PUBLIC_SURFACE_WIDTH } from 'components/public/publicStyles';

import { useAutoHideHeader } from '@/hooks/useAutoHideHeader';

export function PublicHeader({ onOpenAuth }: { onOpenAuth: () => void }) {
  const desktopLink = ({ isActive }: { isActive: boolean }) =>
    cn(
      'inline-flex min-h-10 items-center justify-center rounded-full px-4 text-sm font-semibold text-[color:var(--txt1)] transition hover:bg-white/90 hover:text-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:px-5',
      isActive && 'bg-white text-on-surface shadow-tactile-sm',
    );

  const mobileLink = ({ isActive }: { isActive: boolean }) =>
    cn(
      'inline-flex min-h-10 flex-1 items-center justify-center rounded-[1rem] px-4 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
      isActive
        ? 'bg-white text-on-surface shadow-tactile-sm'
        : 'text-[color:var(--txt1)] hover:bg-white/90 hover:text-on-surface',
    );

  const isHidden = useAutoHideHeader();

  return (
    <header className={cn("sticky top-0 z-40 w-full border-b border-charcoal/10 bg-background/92 backdrop-blur-xl transition-transform duration-300 ease-out", isHidden ? '-translate-y-full' : 'translate-y-0')}>
      <div className={`mx-auto w-full ${PUBLIC_SURFACE_WIDTH} px-4 sm:px-6 lg:px-8`}>
        <div className="hidden min-h-[78px] items-center justify-between gap-6 md:flex">
          <NavLink
            className="flex items-center gap-3"
            to={routes.home}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-charcoal bg-primary shadow-tactile-sm">
              <span className="material-symbols-outlined text-[22px] text-on-primary" style={{ fontVariationSettings: '"FILL" 1' }}>
                pets
              </span>
            </div>
            <span className="font-headline text-xl font-extrabold tracking-tight text-on-surface">
              MeowFolio
            </span>
          </NavLink>

          <div className="flex items-center gap-3 lg:gap-4">
            <nav className="flex items-center gap-1 rounded-full border border-charcoal/15 bg-white/72 p-1 shadow-ambient">
              <NavLink className={desktopLink} to={routes.home} end>
                Home
              </NavLink>
              <NavLink className={desktopLink} to={routes.about}>
                About
              </NavLink>
            </nav>

            <PublicAction className="px-5 lg:px-6" onClick={onOpenAuth} size="md">
              Login / Signup
            </PublicAction>
          </div>
        </div>

        <div className="grid gap-3 py-3 md:hidden">
          <div className="flex min-h-[52px] items-center justify-between gap-3">
            <NavLink
              className="inline-flex items-center font-headline text-lg font-extrabold tracking-[-0.03em] text-on-surface"
              to={routes.home}
            >
              meowfolio
            </NavLink>

            <div className="ml-auto shrink-0">
              <PublicAction className="px-4" onClick={onOpenAuth} size="md" variant="link">
                Login
              </PublicAction>
            </div>
          </div>

          <nav className="grid grid-cols-2 gap-2 rounded-[1.35rem] border border-charcoal/15 bg-white/72 p-1 shadow-ambient">
            <NavLink className={mobileLink} to={routes.home} end>
              Home
            </NavLink>
            <NavLink className={mobileLink} to={routes.about}>
              About
            </NavLink>
          </nav>
        </div>
      </div>
    </header >
  );
}
