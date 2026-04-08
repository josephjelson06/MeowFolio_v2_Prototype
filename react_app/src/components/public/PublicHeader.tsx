import { NavLink } from "react-router-dom";
import { Button } from "components/ui/Button";
import { cn } from "lib/cn";
import { routes } from "lib/routes";
import { useAuthModal } from "hooks/useAuthModal";
import { publicSurfaceWidth } from "components/public/publicStyles";

export function PublicHeader() {
  const { openAuth } = useAuthModal();

  const desktopLink = ({ isActive }: { isActive: boolean }) =>
    cn(
      "inline-flex min-h-11 items-center justify-center rounded-[9999px] border border-transparent px-5 text-sm font-semibold text-[color:var(--txt1)] transition hover:bg-white/80 hover:text-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:px-6 lg:text-base",
      isActive && "border-charcoal/65 bg-white/90 text-on-surface shadow-tactile-sm",
    );

  const mobileLink = ({ isActive }: { isActive: boolean }) =>
    cn(
      "inline-flex min-h-11 flex-1 items-center justify-center rounded-2xl border px-4 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
      isActive
        ? "border-charcoal/70 bg-surface-container text-on-surface"
        : "border-outline-variant bg-white/80 text-[color:var(--txt1)] hover:bg-white",
    );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-charcoal/10 bg-background/92 backdrop-blur-xl">
      <div className={`mx-auto w-full ${publicSurfaceWidth} px-4 sm:px-6 lg:px-8`}>
        <div className="hidden min-h-[76px] items-center gap-6 md:grid md:grid-cols-[auto_1fr_auto]">
          <NavLink
            className="inline-flex w-max items-center font-headline text-2xl font-extrabold tracking-[-0.03em] text-on-surface"
            to={routes.home}
          >
            meowfolio
          </NavLink>

          <nav className="flex items-center justify-self-center gap-2">
            <NavLink className={desktopLink} to={routes.home}>
              Home
            </NavLink>
            <NavLink className={desktopLink} to={routes.about}>
              About
            </NavLink>
          </nav>

          <div className="justify-self-end">
            <Button size="lg" onClick={() => openAuth()}>
              Login / Signup
            </Button>
          </div>
        </div>

        <div className="md:hidden">
          <div className="flex min-h-[60px] items-center gap-3 py-3">
            <NavLink
              className="inline-flex items-center font-headline text-lg font-extrabold tracking-[-0.03em] text-on-surface"
              to={routes.home}
            >
              meowfolio
            </NavLink>

            <div className="ml-auto">
              <Button size="lg" variant="link" onClick={() => openAuth()}>
                Login
              </Button>
            </div>
          </div>

          <nav className="flex gap-3 pb-3">
            <NavLink className={mobileLink} to={routes.home}>
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
