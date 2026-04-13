import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { cn } from 'lib/cn';
import { routes } from 'lib/routes';
import { useUiContext } from 'state/ui/uiContext';

const errorSurfaceWidth = 'w-full max-w-[1360px]';
const errorBodyClass = 'text-base leading-7 text-[color:var(--txt2)] lg:text-lg lg:leading-8';
const errorCardShell = 'rounded-[1.75rem] border-[1.5px] border-charcoal/75 shadow-tactile';

type ErrorActionVariant = 'primary' | 'secondary' | 'link';
type ErrorActionSize = 'md' | 'lg';

function ErrorAction({
  children,
  className,
  onClick,
  size = 'md',
  to,
  variant = 'primary',
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  size?: ErrorActionSize;
  to?: string;
  variant?: ErrorActionVariant;
}) {
  const sizeClass =
    variant === 'link'
      ? size === 'lg'
        ? 'min-h-11 px-5 py-2.5 text-sm'
        : 'min-h-10 px-4 py-2 text-xs'
      : size === 'lg'
        ? 'min-h-[3.5rem] px-7 py-3.5 text-base'
        : 'min-h-12 px-6 py-3 text-sm';
  const variantClass =
    variant === 'primary'
      ? 'bg-white/95 text-on-surface hover:bg-surface-container-low hover:text-primary hover:shadow-tactile'
      : variant === 'secondary'
        ? 'bg-white/85 font-sans font-semibold text-[color:var(--txt1)] hover:bg-white hover:text-on-surface hover:shadow-tactile'
        : 'border-charcoal/65 bg-white/80 font-sans font-semibold text-[color:var(--txt1)] hover:bg-white hover:text-on-surface hover:shadow-tactile-sm';
  const actionClass = cn(
    'inline-flex items-center justify-center gap-2 rounded-full border-2 border-charcoal text-center font-headline font-bold tracking-[0.01em] transition duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
    'shadow-tactile-sm hover:-translate-x-px hover:-translate-y-px active:translate-x-px active:translate-y-px active:shadow-none',
    sizeClass,
    variantClass,
    className,
  );

  if (to) {
    return (
      <Link className={actionClass} to={to}>
        {children}
      </Link>
    );
  }

  return (
    <button className={actionClass} type="button" onClick={onClick}>
      {children}
    </button>
  );
}

function ErrorHeader({ onOpenAuth }: { onOpenAuth: () => void }) {
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

  return (
    <header className="sticky top-0 z-40 w-full border-b border-charcoal/10 bg-background/92 backdrop-blur-xl">
      <div className={`mx-auto w-full ${errorSurfaceWidth} px-4 sm:px-6 lg:px-8`}>
        <div className="hidden min-h-[78px] items-center justify-between gap-6 md:flex">
          <NavLink
            className="inline-flex w-max items-center font-headline text-2xl font-extrabold tracking-[-0.03em] text-on-surface"
            to={routes.home}
          >
            meowfolio
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

            <ErrorAction className="px-5 lg:px-6" onClick={onOpenAuth} size="md">
              Login / Signup
            </ErrorAction>
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
              <ErrorAction className="px-4" onClick={onOpenAuth} size="md" variant="link">
                Login
              </ErrorAction>
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
    </header>
  );
}

function ErrorFooter() {
  return (
    <footer className="mt-auto w-full border-t border-charcoal/10 bg-charcoal text-white/90">
      <div className={`mx-auto w-full ${errorSurfaceWidth} px-4 py-6 sm:px-6 lg:px-8 lg:py-7`}>
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <div className="space-y-1">
            <span className="block font-medium">&copy; 2026 meowfolio</span>
            <p className="max-w-xl text-sm leading-6 text-white/70">
              Built for focused resume work, playful storytelling, and a calmer public surface.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/65 md:justify-end">
            <span>Public surface</span>
            <span className="hidden h-1 w-1 rounded-full bg-white/35 md:inline-block" />
            <span>Prototype system</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function Error500Page() {
  const { openAuth } = useUiContext();

  return (
    <div className="flex min-h-screen flex-col">
      <ErrorHeader onOpenAuth={() => openAuth()} />

      <main className="flex w-full flex-1 justify-center overflow-x-clip px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12">
        <section className={`mx-auto flex min-h-[calc(100vh-13rem)] w-full items-center justify-center ${errorSurfaceWidth}`}>
          <div className="relative w-full max-w-[36rem] py-12 text-center">
            <div className="absolute inset-x-10 top-10 h-36 rounded-full bg-[color:var(--warn)]/12 blur-3xl" />

            <div className="relative z-10 grid justify-items-center gap-7 sm:gap-8">
              <div className="grid size-28 place-items-center rounded-full bg-[color:var(--warn-bg)] text-[color:var(--warn)] shadow-[inset_0_0_0_1px_rgba(28,28,24,0.12)] sm:size-32">
                <span className="font-headline text-7xl font-extrabold leading-none tracking-[-0.06em] sm:text-[5rem]">500</span>
              </div>

              <div className="inline-flex rounded-full border border-[color:var(--warn)]/35 bg-[color:var(--warn-bg)] px-4 py-1.5 font-headline text-[11px] font-bold uppercase tracking-[0.16em] text-[color:var(--warn)]">
                Error 500
              </div>

              <h1 className="max-w-[22rem] font-headline text-4xl font-extrabold leading-[1.02] tracking-[-0.04em] text-on-surface sm:text-[3.25rem]">
                The workspace hit a temporary snag.
              </h1>

              <p className={`max-w-[26rem] ${errorBodyClass}`}>
                Something broke on the way through the product loop. The structure is still here, but this screen
                couldn&apos;t finish loading cleanly.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <ErrorAction to={routes.home} size="lg">
                  Back Home
                </ErrorAction>
                <ErrorAction to={routes.dashboard} variant="secondary" size="lg">
                  Go to Dashboard
                </ErrorAction>
              </div>
            </div>

            <div className={cn('pointer-events-none absolute inset-0 -z-10 rounded-[2rem] bg-white/60', errorCardShell)} />
          </div>
        </section>
      </main>

      <ErrorFooter />
    </div>
  );
}
