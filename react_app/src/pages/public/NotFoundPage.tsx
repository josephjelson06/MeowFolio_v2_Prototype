import { Button } from 'components/ui/Button';
import { routes } from 'lib/routes';

export function NotFoundPage() {
  return (
    <section className="flex flex-1 items-center justify-center px-4 py-10 md:px-6 md:py-14">
      <article className="relative w-full max-w-[30rem] overflow-hidden rounded-[2.25rem] border-[1.5px] border-charcoal/75 bg-white/90 px-7 py-10 text-center shadow-tactile-lg md:px-10 md:py-12">
        <div className="absolute inset-x-8 top-8 h-32 rounded-full bg-primary/12 blur-3xl" />

        <div className="relative z-10 grid justify-items-center gap-5">
          <div className="grid size-28 place-items-center rounded-full bg-primary-fixed text-primary shadow-[inset_0_0_0_1px_rgba(28,28,24,0.12)] md:size-32">
            <span className="font-headline text-6xl font-extrabold leading-none tracking-[-0.06em] md:text-7xl">
              404
            </span>
          </div>

          <div className="inline-flex rounded-full border border-primary/35 bg-primary-fixed px-4 py-1.5 font-headline text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
            Error 404
          </div>

          <h1 className="max-w-[18rem] font-headline text-3xl font-extrabold leading-tight tracking-[-0.04em] text-on-surface md:text-[2.5rem]">
            That page wandered off.
          </h1>

          <p className="max-w-[21rem] text-base font-medium leading-8 text-[color:var(--txt2)] md:text-lg">
            The page slipped out of the map, but the rest of meowfolio is still right where you left it.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button to={routes.home}>Back Home</Button>
            <Button to={routes.about} variant="secondary">
              Read About
            </Button>
          </div>
        </div>
      </article>
    </section>
  );
}
