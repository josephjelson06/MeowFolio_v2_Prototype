import { Button } from 'components/ui/Button';
import { routes } from 'lib/routes';

export function NotFoundPage() {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <article className="grid gap-5 rounded-[2rem] border-[1.5px] border-charcoal/75 bg-white/85 p-8 shadow-tactile md:p-10">
        <div className="font-headline text-7xl font-extrabold leading-none text-primary md:text-8xl">404</div>
        <h1 className="font-headline text-4xl font-extrabold tracking-[-0.04em] text-on-surface md:text-5xl">
          That page wandered off.
        </h1>
        <p className="max-w-2xl text-base leading-8 text-[color:var(--txt2)]">
          The route you opened doesn&apos;t exist in the current meowfolio flow. If this came from an older link, the
          product likely moved on while the cat kept working.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button to={routes.home}>Back Home</Button>
        </div>
      </article>

      {/* <article className="grid content-start gap-4 rounded-[2rem] border-[1.5px] border-charcoal/75 bg-white/85 p-8 shadow-tactile md:p-10">
        <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">NEXT STEP</div>
        <h2 className="font-headline text-3xl font-extrabold tracking-[-0.03em] text-on-surface">
          The workspace is still one click away.
        </h2>
        <p className="text-base leading-8 text-[color:var(--txt2)]">
          Start again from Home or jump into the About page. The main workspace flow is still intact.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button to={routes.about} variant="secondary">
            Open About
          </Button>
        </div>
      </article> */}
    </section>
  );
}
