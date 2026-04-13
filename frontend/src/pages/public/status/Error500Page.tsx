import { cn } from 'lib/cn';
import { routes } from 'app/router/routes';
import { PublicAction } from 'components/public/PublicAction';
import { PublicLayout } from 'components/public/PublicLayout';
import { PUBLIC_BODY_CLASS, PUBLIC_CARD_SHELL, PUBLIC_SURFACE_WIDTH } from 'components/public/publicStyles';
import { useUiContext } from 'state/ui/uiContext';

export function Error500Page() {
  const { openAuth } = useUiContext();

  return (
    <PublicLayout onOpenAuth={() => openAuth()}>
      <section
        className={`mx-auto flex min-h-[calc(100vh-13rem)] w-full items-center justify-center ${PUBLIC_SURFACE_WIDTH}`}
      >
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

            <p className={`max-w-[26rem] ${PUBLIC_BODY_CLASS}`}>
              Something broke on the way through the product loop. The structure is still here, but this screen
              couldn&apos;t finish loading cleanly.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <PublicAction to={routes.home} size="lg">
                Back Home
              </PublicAction>
              <PublicAction to={routes.dashboard} variant="secondary" size="lg">
                Go to Dashboard
              </PublicAction>
            </div>
          </div>

          <div className={cn('pointer-events-none absolute inset-0 -z-10 rounded-[2rem] bg-white/60', PUBLIC_CARD_SHELL)} />
        </div>
      </section>
    </PublicLayout>
  );
}
