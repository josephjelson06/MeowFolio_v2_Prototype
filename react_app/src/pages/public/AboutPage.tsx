import { Badge } from 'components/ui/Badge';
import { Button } from 'components/ui/Button';
import { useAuthModal } from 'hooks/useAuthModal';

// const principleCards = [
//   {
//     code: 'FR',
//     title: 'Always free',
//     copy: 'Core resume building stays low-friction, so people can actually finish what they start.',
//     tone: 'bg-primary-fixed text-primary',
//   },
//   {
//     code: 'ST',
//     title: 'Student-first',
//     copy: 'Everything is shaped around early-career users who need clarity more than complexity.',
//     tone: 'bg-tertiary-fixed text-tertiary',
//   },
//   {
//     code: 'OK',
//     title: 'Honest by default',
//     copy: 'The product helps people present real experience better, without pushing keyword spam or exaggeration.',
//     tone: 'bg-secondary-fixed text-secondary',
//   },
// ] as const;

const productCards = [
  {
    code: 'PX',
    title: 'Stable output',
    copy: 'TeX keeps typography, spacing, and layout consistent so the final resume feels dependable.',
  },
  {
    code: 'AT',
    title: 'ATS-safe structure',
    copy: 'Resume content stays in one canonical shape, which keeps analysis and PDF output aligned.',
  },
  {
    code: 'LP',
    title: 'One shared flow',
    copy: 'Editor, ATS, and job description tools stay connected instead of splitting into separate experiences.',
  },
] as const;

export function AboutPage() {
  const { openAuth } = useAuthModal();

  function openAboutAuth() {
    openAuth({
      copy: 'The About page lives inside the same meowfolio prototype system as the rest of the app. Sign in here and continue directly into the workspace flow.',
      accent: 'GOOGLE ONLY',
      info: 'SAME PRODUCT',
      outline: 'DASHBOARD READY',
      previewTitle: 'One product, one path',
      previewCopy:
        'Home, About, 404, 500, and the auth modal all share the same navigation, mobile treatment, and tactile design system as the workspace.',
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
            <div className="grid gap-4">
              <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">PROBLEM</div>
              <h1 className="max-w-[40rem] font-headline text-5xl font-extrabold leading-[0.95] tracking-[-0.05em] text-on-surface md:text-7xl">
                Good work gets buried by <span className="text-coral underline decoration-4 underline-offset-8">bad resumes.</span>
              </h1>
            </div>
            <p className="max-w-2xl text-base leading-8 text-[color:var(--txt2)] md:text-lg">
              meowfolio started from a familiar frustration: early-career people have real experience, but the tools around them
              make the process awkward, unclear, and harder than it should be.
            </p>
            <div className="flex flex-wrap gap-3">
              <Badge className="border-tertiary/30 bg-tertiary-fixed text-tertiary">BAD WORKFLOWS</Badge>
              <Badge variant="accent">AWKWARD DOCUMENTS</Badge>
              <Badge variant="info">CONFUSING TOOLING</Badge>
            </div>
          </div>

          <article className="grid gap-5 rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/95 p-6 shadow-tactile lg:p-7">
            {/* <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">ABOUT ME</div> */}
            {/* <h2 className="font-headline text-3xl font-extrabold leading-tight text-on-surface md:text-4xl">
              Mochii built this because resumes felt too hard for no good reason.
            </h2> */}
            {/* <p className="text-base leading-8 text-[color:var(--txt2)]">
              The goal was simple: keep the power of TeX, but hide the complexity behind a friendlier product experience that
              feels encouraging instead of sterile.
            </p> */}
            <div className="overflow-hidden rounded-[1.35rem] border border-charcoal/10 bg-surface-container-low">
              <img
                className="aspect-[4/3] w-full object-cover"
                src="/Images/Graduation_Day.png"
                alt="Graduation day image representing the builder journey"
              />
            </div>
            {/* <div className="rounded-[1.35rem] border-[1.5px] border-charcoal/75 bg-white px-5 py-4 font-headline text-xl font-extrabold italic leading-snug text-on-surface shadow-tactile-sm">
              &quot;Batch of 2026.&quot;
            </div> */}
          </article>
        </div>
      </section>

      <section className="rounded-[2.25rem] border-[1.5px] border-charcoal/75 bg-white/75 px-6 py-8 shadow-tactile backdrop-blur-sm md:px-10 md:py-12 lg:px-14 lg:py-14">
        <div className="mx-auto max-w-4xl text-center">
          <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">PRODUCT</div>
          <h2 className="mt-3 font-headline text-4xl font-extrabold tracking-[-0.04em] text-on-surface md:text-5xl">
            Make powerful resume tooling feel approachable.
          </h2>
          <p className="mt-4 text-base leading-8 text-[color:var(--txt2)]">
            The product keeps the serious parts serious and the intimidating parts softer. That means real structure, real
            output quality, and a workflow that does not fight the user.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {productCards.map(card => (
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

      {/* <section className="rounded-[2.25rem] border-[1.5px] border-charcoal/75 bg-white/75 px-6 py-8 shadow-tactile backdrop-blur-sm md:px-10 md:py-12 lg:px-14 lg:py-14">
        <div className="max-w-3xl">
          <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">PRINCIPLES</div>
          <h2 className="mt-3 font-headline text-4xl font-extrabold tracking-[-0.04em] text-on-surface md:text-5xl">
            Keep the experience honest, simple, and student-friendly.
          </h2>
          <p className="mt-4 text-base leading-8 text-[color:var(--txt2)]">
            The product is designed to remove friction, not add it. It should help people build something stronger without
            making them feel like they need to be experts first.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {principleCards.map(card => (
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
      </section> */}

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
              About Me
            </h2>
            {/* <p className="max-w-3xl text-base leading-8 text-[color:var(--txt2)]">
              meowfolio is not trying to be every job tool at once. It is trying to make one important workflow feel coherent:
              write a better resume, render it well, and understand how it performs.
            </p> */}
            <p className="max-w-3xl text-base leading-8 text-[color:var(--txt2)]">
              {/* That is why the editor, ATS, and JD tools stay connected through the same schema and workspace instead of
              turning into disconnected screens with different data shapes. */}
              {/* I'm Trying to build a product that makes resume building less painful and more effective for early-career people, and I want to do it in a way that feels honest, approachable, and focused on real experience instead of keyword games. This prototype is a snapshot of that work in progress. */}
                Hello Everyone! My name is Jelson Joseph, and I'm a well say, a Software Engineer with a passion for crafting innovative solutions. I have a strong background in software development, and I'm always eager to take on new challenges and learn new technologies. I believe in the power of collaboration and teamwork, and I'm committed to delivering high-quality results in every project I undertake. 
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
