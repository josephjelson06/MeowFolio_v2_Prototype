import { Button } from 'components/ui/Button';
import { routes } from 'lib/routes';

export function Error500Page() {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <article className="grid gap-5 rounded-[2rem] border-[1.5px] border-charcoal/75 bg-white/85 p-8 shadow-tactile md:p-10">
        <div className="font-headline text-7xl font-extrabold leading-none text-[color:var(--warn)] md:text-8xl">500</div>
        <h1 className="font-headline text-4xl font-extrabold tracking-[-0.04em] text-on-surface md:text-5xl">
          The workspace hit a temporary snag.
        </h1>
        <p className="max-w-2xl text-base leading-8 text-[color:var(--txt2)]">
          Something broke on the way through the product loop. The structure is still here, but this screen couldn&apos;t
          finish loading cleanly.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button to={routes.home}>Back Home</Button>
          {/* <Button to={routes.about} variant="secondary">
            Read About
          </Button> */}
        </div>
      </article>

      {/* <article className="grid content-start gap-4 rounded-[2rem] border-[1.5px] border-charcoal/75 bg-white/85 p-8 shadow-tactile md:p-10">
        <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">STATUS</div>
        <h2 className="font-headline text-3xl font-extrabold tracking-[-0.03em] text-on-surface">
          When this clears, the same workflow is waiting.
        </h2>
        <p className="text-base leading-8 text-[color:var(--txt2)]">
          Once the issue is gone, the user lands back in the same dashboard, resumes, editor, JD, and profile loop.
          This fallback shares the same tactile meowfolio visual system as the rest of the product.
        </p>
      </article> */}
    </section>
  );
}
