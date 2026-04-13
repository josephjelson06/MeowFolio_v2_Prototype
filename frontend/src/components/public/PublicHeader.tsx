import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { BrandLink } from 'components/BrandLink';
import { cn } from 'lib/cn';
import { routes } from 'app/router/routes';
import { PublicAction } from 'components/public/PublicAction';
import { PUBLIC_SURFACE_WIDTH } from 'components/public/publicStyles';

import { useAutoHideHeader } from '@/hooks/useAutoHideHeader';

export function PublicHeader({ onOpenAuth }: { onOpenAuth: () => void }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const desktopLink = ({ isActive }: { isActive: boolean }) =>
    cn(
      'inline-flex min-h-10 items-center justify-center rounded-full px-4 text-sm font-semibold text-[color:var(--txt1)] transition hover:bg-white/90 hover:text-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:px-5',
      isActive && 'bg-white text-on-surface shadow-tactile-sm',
    );

  const isHidden = useAutoHideHeader();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    }

    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 w-full border-b border-charcoal/10 bg-background/92 backdrop-blur-xl transition-transform duration-300 ease-out',
          isHidden && !mobileMenuOpen ? '-translate-y-full' : 'translate-y-0',
        )}
      >
        <div className={`mx-auto w-full ${PUBLIC_SURFACE_WIDTH} px-4 sm:px-6 lg:px-8`}>
          <div className="hidden min-h-[78px] grid-cols-[auto_1fr_auto] items-center gap-6 md:grid">
            <BrandLink to={routes.home} />

            <nav className="flex items-center justify-self-center gap-2">
              <NavLink className={desktopLink} to={routes.home} end>
                Home
              </NavLink>
              <NavLink className={desktopLink} to={routes.about}>
                About
              </NavLink>
            </nav>

            <div className="justify-self-end">
              <PublicAction className="px-5 lg:px-6" onClick={onOpenAuth} size="md">
                Login / Signup
              </PublicAction>
            </div>
          </div>

          <div className="flex min-h-[64px] items-center justify-between gap-3 py-3 md:hidden">
            <BrandLink compact to={routes.home} />

            <button
              className="grid size-11 place-items-center rounded-full border-[1.5px] border-charcoal/75 bg-white/90 text-on-surface shadow-tactile-sm transition hover:bg-white"
              type="button"
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="grid gap-1.5">
                <span className="block h-0.5 w-5 rounded-full bg-current" />
                <span className="block h-0.5 w-5 rounded-full bg-current" />
                <span className="block h-0.5 w-5 rounded-full bg-current" />
              </span>
            </button>
          </div>
        </div>
      </header>

      <div
        className={cn(
          'fixed inset-0 z-50 md:hidden',
          mobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none',
        )}
        aria-hidden={!mobileMenuOpen}
      >
        <div
          className={cn(
            'absolute inset-0 bg-charcoal/25 backdrop-blur-sm transition-opacity duration-200',
            mobileMenuOpen ? 'opacity-100' : 'opacity-0',
          )}
          onClick={() => setMobileMenuOpen(false)}
        />

        <div
          className={cn(
            'absolute inset-0 overflow-y-auto bg-[rgba(255,252,247,0.985)] transition-transform duration-300 ease-out',
            mobileMenuOpen ? 'translate-y-0' : '-translate-y-full',
          )}
        >
          <div className={`mx-auto flex min-h-screen w-full flex-col px-6 pb-10 pt-6 ${PUBLIC_SURFACE_WIDTH}`}>
            <div className="flex items-center justify-between gap-4">
              <BrandLink compact to={routes.home} />
              <button
                className="grid size-11 place-items-center rounded-full border-[1.5px] border-charcoal/75 bg-white/90 text-on-surface shadow-tactile-sm transition hover:bg-white"
                type="button"
                aria-label="Close navigation menu"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="relative block h-5 w-5">
                  <span className="absolute left-1/2 top-1/2 block h-0.5 w-5 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-current" />
                  <span className="absolute left-1/2 top-1/2 block h-0.5 w-5 -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-full bg-current" />
                </span>
              </button>
            </div>

            <nav className="mt-12 grid gap-4">
              <NavLink
                className={({ isActive }) =>
                  cn(
                    'inline-flex min-h-[3.5rem] items-center rounded-[1.2rem] border border-charcoal/15 bg-white/85 px-5 font-headline text-xl font-extrabold text-on-surface shadow-tactile-sm transition hover:bg-white',
                    isActive && 'border-charcoal/75 shadow-tactile',
                  )
                }
                to={routes.home}
                end
              >
                Home
              </NavLink>
              <NavLink
                className={({ isActive }) =>
                  cn(
                    'inline-flex min-h-[3.5rem] items-center rounded-[1.2rem] border border-charcoal/15 bg-white/85 px-5 font-headline text-xl font-extrabold text-on-surface shadow-tactile-sm transition hover:bg-white',
                    isActive && 'border-charcoal/75 shadow-tactile',
                  )
                }
                to={routes.about}
              >
                About
              </NavLink>
            </nav>

            <div className="mt-10">
              <PublicAction
                className="w-full justify-center"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth();
                }}
                size="lg"
              >
                Sign-Up / Login
              </PublicAction>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
