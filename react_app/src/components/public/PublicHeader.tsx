import { NavLink } from 'react-router-dom';
import { Button } from 'components/ui/Button';
import { cn } from 'lib/cn';
import { routes } from 'lib/routes';
import { useAuthModal } from 'hooks/useAuthModal';
import { publicSurfaceWidth } from 'components/public/publicStyles';

export function PublicHeader() {
  const { openAuth } = useAuthModal();
  const desktopLink = ({ isActive }: { isActive: boolean }) => cn(
    'inline-flex min-h-12 items-center justify-center rounded-full border border-transparent px-6 text-base font-semibold text-[color:var(--txt1)] transition hover:bg-white/80 hover:text-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
    isActive && 'border-charcoal/65 bg-white/90 text-on-surface shadow-tactile-sm',
  );
  const mobileLink = ({ isActive }: { isActive: boolean }) => cn(
    'inline-flex min-h-11 flex-1 items-center justify-center rounded-2xl border border-outline-variant bg-white/80 px-4 text-sm font-semibold text-[color:var(--txt1)] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
    isActive ? 'border-charcoal/70 bg-surface-container text-on-surface' : 'hover:bg-white',
  );

  return (
    <>
      <nav className="sticky top-0 z-40 hidden w-full border-b border-charcoal/10 bg-background/95 shadow-[0_8px_24px_rgba(28,28,24,0.05)] backdrop-blur-xl md:block">
        <div className={`mx-auto grid min-h-[76px] w-full grid-cols-[auto_1fr_auto] items-center gap-6 px-4 sm:px-6 lg:px-8 ${publicSurfaceWidth}`}>
          <NavLink className="inline-flex w-max items-center font-headline text-2xl font-extrabold tracking-[-0.03em] text-on-surface" to={routes.home}>meowfolio</NavLink>
          <div className="flex items-center justify-self-center gap-2">
            <NavLink className={desktopLink} to={routes.home}>Home</NavLink>
            <NavLink className={desktopLink} to={routes.about}>About</NavLink>
          </div>
          <div className="justify-self-end">
            <Button size="lg" onClick={() => openAuth()}>Login / Signup</Button>
          </div>
        </div>
      </nav>

      <div className="sticky top-0 z-40 border-b border-charcoal/10 bg-background/95 backdrop-blur-xl md:hidden">
        <div className={`mx-auto flex min-h-[60px] w-full items-center gap-3 px-4 sm:px-6 ${publicSurfaceWidth}`}>
          <NavLink className="inline-flex items-center font-headline text-lg font-extrabold tracking-[-0.03em] text-on-surface" to={routes.home}>meowfolio</NavLink>
          <div className="ml-auto">
            <Button size="lg" variant="link" onClick={() => openAuth()}>Login</Button>
          </div>
        </div>
      </div>

      <div className="border-b border-charcoal/10 bg-background/95 md:hidden">
        <div className={`mx-auto flex w-full gap-3 px-4 py-3 sm:px-6 ${publicSurfaceWidth}`}>
          <NavLink className={mobileLink} to={routes.home}>Home</NavLink>
          <NavLink className={mobileLink} to={routes.about}>About</NavLink>
        </div>
      </div>
    </>
  );
}
