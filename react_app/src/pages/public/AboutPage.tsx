import { Badge } from 'components/ui/Badge';
import { Button } from 'components/ui/Button';
import { useAuthModal } from 'hooks/useAuthModal';

const missionCards = [
  {
    code: 'FR',
    title: 'Always free',
    copy: 'The product stays focused on low-friction resume building instead of pushing people through paywall anxiety.',
    tone: 'bg-primary-fixed text-primary',
  },
  {
    code: 'ST',
    title: 'Student-first',
    copy: 'The writing guidance, structure, and workflows are built with early-career users in mind.',
    tone: 'bg-tertiary-fixed text-tertiary',
  },
  {
    code: 'OK',
    title: 'Honest by default',
    copy: 'The product tries to make resumes clearer and stronger without encouraging fake experience or keyword spam.',
    tone: 'bg-secondary-fixed text-secondary',
  },
] as const;

const texCards = [
  {
    code: 'PX',
    title: 'Pixel-stable output',
    copy: 'TeX gives us reliable typography, consistent margins, and fewer layout surprises than ad hoc document editing.',
  },
  {
    code: 'AT',
    title: 'ATS-safe structure',
    copy: 'The app keeps resume content in a canonical schema so analysis and PDF generation stay aligned.',
  },
  {
    code: 'LP',
    title: 'Shared product loop',
    copy: 'The same resume flows through editor, ATS, and JD instead of fragmenting into separate tools.',
  },
] as const;

export function AboutPage() {
  const { openAuth } = useAuthModal();

  function openAboutAuth() {
    openAuth({
      copy: 'The About page now lives inside the same meowfolio prototype system as the rest of the app. Sign in here and continue directly into the workspace flow.',
      accent: 'GOOGLE ONLY',
      info: 'SAME PRODUCT',
      outline: 'DASHBOARD READY',
      previewTitle: 'One product, one path',
      previewCopy:
        'Home, About, 404, 500, and the auth modal now share the same navigation, mobile treatment, and tactile design system as the workspace.',
      note: 'No separate signup form on this prototype.',
    });
  }

  return (
    <>
      <section className="rounded-[2.25rem] border-[1.5px] border-charcoal/75 bg-white/75 px-6 py-8 shadow-tactile backdrop-blur-sm md:px-10 md:py-12 lg:px-14 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-center">
          <div className="grid gap-6">
            <div>
              <Badge variant="info">THE STORY BEHIND MEOWFOLIO</Badge>
            </div>
            <h1 className="max-w-[40rem] font-headline text-5xl font-extrabold leading-[0.95] tracking-[-0.05em] text-on-surface md:text-7xl">
              Built by a student. <span className="text-coral underline decoration-4 underline-offset-8">For students.</span>
            </h1>
            <p className="max-w-2xl text-base leading-8 text-[color:var(--txt2)] md:text-lg">
              meowfolio started from the same frustration most early-career people know well: good experience trapped inside
              bad tooling, awkward documents, and confusing workflow jumps.
            </p>
            <div className="flex flex-wrap gap-3">
              <Badge className="border-tertiary/30 bg-tertiary-fixed text-tertiary">TEX-FIRST OUTPUT</Badge>
              <Badge variant="accent">STUDENT-FRIENDLY WORKFLOW</Badge>
              <Badge variant="info">SHARED EDITOR + ATS + JD</Badge>
            </div>
          </div>

          <article className="grid gap-5 rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/95 p-6 shadow-tactile lg:p-7">
            <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">ORIGIN STORY</div>
            <h2 className="font-headline text-3xl font-extrabold leading-tight text-on-surface md:text-4xl">
              Mochii got tired of bad resumes.
            </h2>
            <p className="text-base leading-8 text-[color:var(--txt2)]">
              The original idea was simple: use the power of TeX without making users touch raw TeX, and wrap it in a visual
              language that feels encouraging instead of sterile.
            </p>
            <div className="overflow-hidden rounded-[1.35rem] border border-charcoal/10 bg-surface-container-low">
              <img
                className="aspect-[4/3] w-full object-cover"
                src="/Images/Graduation_Day.png"
                alt="Graduation day image representing the builder journey"
              />
            </div>
            <div className="rounded-[1.35rem] border-[1.5px] border-charcoal/75 bg-white px-5 py-4 font-headline text-xl font-extrabold italic leading-snug text-on-surface shadow-tactile-sm">
              &quot;Resume building should not require a design degree or a broken Word doc.&quot;
            </div>
          </article>
        </div>
      </section>

      <section className="rounded-[2.25rem] border-[1.5px] border-charcoal/75 bg-white/75 px-6 py-8 shadow-tactile backdrop-blur-sm md:px-10 md:py-12 lg:px-14 lg:py-14">
        <div className="mx-auto max-w-4xl text-center">
          <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">MISSION</div>
          <h2 className="mt-3 font-headline text-4xl font-extrabold tracking-[-0.04em] text-on-surface md:text-5xl">
            Make powerful resume tooling feel approachable.
          </h2>
          <p className="mt-4 text-base leading-8 text-[color:var(--txt2)]">
            The product tries to keep the serious parts serious and the intimidating parts softer. That means real structure,
            real output quality, and a friendlier surface.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {missionCards.map(card => (
            <article
              className="grid gap-5 rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/90 p-6 shadow-tactile"
              key={card.title}
            >
              <div className={`grid size-16 place-items-center rounded-2xl border border-charcoal/20 font-headline text-base font-bold ${card.tone}`}>
                {card.code}
              </div>
              <h3 className="font-headline text-2xl font-extrabold leading-tight text-on-surface">{card.title}</h3>
              <p className="text-sm leading-7 text-[color:var(--txt2)]">{card.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[2.25rem] border-[1.5px] border-charcoal/75 bg-white/75 px-6 py-8 shadow-tactile backdrop-blur-sm md:px-10 md:py-12 lg:px-14 lg:py-14">
        <div className="max-w-3xl">
          <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">WHY TEX</div>
          <h2 className="mt-3 font-headline text-4xl font-extrabold tracking-[-0.04em] text-on-surface md:text-5xl">
            Serious output without making users think like typesetters.
          </h2>
          <p className="mt-4 text-base leading-8 text-[color:var(--txt2)]">
            TeX stays under the hood. The user works with structured resume data, templates, and output controls instead of
            wrestling a document editor.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {texCards.map(card => (
            <article
              className="grid gap-5 rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/90 p-6 shadow-tactile"
              key={card.title}
            >
              <div className="grid size-16 place-items-center rounded-2xl border border-charcoal/20 bg-secondary-fixed text-base font-headline font-bold text-secondary">
                {card.code}
              </div>
              <h3 className="font-headline text-2xl font-extrabold leading-tight text-on-surface">{card.title}</h3>
              <p className="text-sm leading-7 text-[color:var(--txt2)]">{card.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[2.25rem] border-[1.5px] border-charcoal/75 bg-white/75 px-6 py-8 shadow-tactile backdrop-blur-sm md:px-10 md:py-12 lg:px-14 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
          <article className="rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/95 p-3 shadow-tactile">
            <div className="overflow-hidden rounded-[1.4rem] bg-surface-container-low">
              <img className="aspect-[4/5] w-full object-cover" src="/Images/DP.jpg" alt="Profile photo of the builder" loading="lazy" />
            </div>
          </article>

          <div className="grid gap-5">
            <div className="flex flex-wrap gap-3">
              <Badge variant="accent">SOLO BUILD</Badge>
              <Badge variant="info">PRODUCT-FIRST</Badge>
            </div>
            <h2 className="max-w-3xl font-headline text-4xl font-extrabold tracking-[-0.04em] text-on-surface md:text-5xl">
              One important workflow should feel coherent from end to end.
            </h2>
            <p className="max-w-3xl text-base leading-8 text-[color:var(--txt2)]">
              meowfolio is not trying to be every job tool at once. It is trying to make one important workflow feel coherent:
              write a better resume, render it well, and understand how it performs.
            </p>
            <p className="max-w-3xl text-base leading-8 text-[color:var(--txt2)]">
              That is why the editor, ATS, and JD tools stay connected through the same schema and workspace instead of
              turning into disconnected screens with different data shapes.
            </p>
            <div>
              <Button onClick={openAboutAuth}>Enter the Workspace</Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
