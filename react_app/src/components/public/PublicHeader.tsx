import { NavLink } from 'react-router-dom';
import { Button } from 'components/ui/Button';
import { cn } from 'lib/cn';
import { routes } from 'lib/routes';
import { useAuthModal } from 'hooks/useAuthModal';

export function PublicHeader() {
  const { openAuth } = useAuthModal();
  const desktopLink = ({ isActive }: { isActive: boolean }) => cn(
    'inline-flex min-h-10 items-center justify-center rounded-full px-4 text-sm font-bold text-[color:var(--txt1)] transition hover:bg-white/70 hover:text-primary',
    isActive && 'border-[1.5px] border-charcoal/75 bg-white/85 text-on-surface shadow-tactile-sm',
  );
  const mobileLink = ({ isActive }: { isActive: boolean }) => cn(
    'inline-flex min-h-10 items-center justify-center rounded-2xl border border-outline-variant bg-white/80 px-4 text-sm font-semibold text-[color:var(--txt1)] transition',
    isActive ? 'border-charcoal/70 bg-surface-container text-on-surface' : 'hover:bg-white',
  );

  return (
    <>
      <nav className="sticky top-0 z-40 hidden min-h-[68px] border-b border-charcoal/10 bg-background/85 shadow-[0_8px_24px_rgba(28,28,24,0.05)] backdrop-blur-xl md:block">
        <div className="mx-auto grid min-h-[68px] w-full max-w-[1120px] grid-cols-[auto_1fr_auto] items-center gap-4 px-4 sm:px-6 lg:px-8">
          <NavLink className="inline-flex w-max items-center font-headline text-2xl font-extrabold tracking-[-0.03em] text-on-surface" to={routes.home}>meowfolio</NavLink>
          <div className="flex items-center justify-self-center gap-2">
            <NavLink className={desktopLink} to={routes.home}>Home</NavLink>
            <NavLink className={desktopLink} to={routes.about}>About</NavLink>
          </div>
          <div className="justify-self-end">
            <Button onClick={() => openAuth()}>Login / Signup</Button>
          </div>
        </div>
      </nav>

      <div className="sticky top-0 z-40 flex min-h-[56px] items-center gap-3 border-b border-charcoal/10 bg-background/90 px-4 backdrop-blur-xl md:hidden">
        <NavLink className="inline-flex items-center font-headline text-lg font-extrabold tracking-[-0.03em] text-on-surface" to={routes.home}>meowfolio</NavLink>
        <div className="ml-auto">
          <Button variant="link" onClick={() => openAuth()}>Login</Button>
        </div>
      </div>

      <div className="flex gap-3 border-b border-charcoal/10 bg-background/95 px-4 py-3 md:hidden">
        <NavLink className={mobileLink} to={routes.home}>Home</NavLink>
        <NavLink className={mobileLink} to={routes.about}>About</NavLink>
      </div>
    </>
  );
}
