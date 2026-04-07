import { Badge } from 'components/ui/Badge';
import { Button } from 'components/ui/Button';
import { useAuthModal } from 'hooks/useAuthModal';

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

const sectionShell =
  'w-full max-w-full overflow-hidden rounded-[2.25rem] border-[1.5px] border-charcoal/75 bg-white/75 px-5 py-10 shadow-tactile backdrop-blur-sm sm:px-6 md:px-8 md:py-14 lg:px-12 lg:py-16';

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
      <section className={sectionShell}>
        <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12">
          <div className="grid gap-6">
            <Badge variant="info">THE STORY BEHIND MEOWFOLIO</Badge>

            <div className="grid gap-4">
              <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                PROBLEM
              </div>
              <h1 className="max-w-[12ch] font-headline text-4xl font-extrabold leading-[0.98] tracking-[-0.05em] text-on-surface sm:text-5xl lg:text-6xl">
                Good work gets buried by{' '}
                <span className="text-coral underline decoration-4 underline-offset-8">
                  bad resumes.
                </span>
              </h1>
            </div>

            <p className="max-w-2xl text-base leading-8 text-[color:var(--txt2)] md:text-lg">
              meowfolio started from a familiar frustration: early-career people have real experience, but the tools around them
              make the process awkward, unclear, and harder than it should be.
            </p>

            <div className="flex flex-wrap gap-3">
              <Badge className="border-tertiary/30 bg-tertiary-fixed text-tertiary">
                BAD WORKFLOWS
              </Badge>
              <Badge variant="accent">AWKWARD DOCUMENTS</Badge>
              <Badge variant="info">CONFUSING TOOLING</Badge>
            </div>
          </div>

          <article className="overflow-hidden rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/95 p-3 shadow-tactile">
            <div className="overflow-hidden rounded-[1.35rem] border border-charcoal/10 bg-surface-container-low">
              <img
                className="aspect-[4/5] w-full object-cover md:aspect-[4/4.2]"
                src="/Images/Graduation_Day.png"
                alt="Graduation day image representing the builder journey"
              />
            </div>
          </article>
        </div>
      </section>

      <section className={sectionShell}>
        <div className="mx-auto max-w-4xl text-center">
          <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
            PRODUCT
          </div>
          <h2 className="mt-3 font-headline text-4xl font-extrabold leading-tight tracking-[-0.04em] text-on-surface md:text-5xl">
            Make powerful resume tooling feel approachable.
          </h2>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {productCards.map(card => (
            <article
              key={card.title}
              className="flex h-full flex-col gap-5 rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/90 p-6 shadow-tactile"
            >
              <div className="grid size-16 place-items-center rounded-2xl border border-charcoal/20 bg-secondary-fixed text-base font-headline font-bold text-secondary">
                {card.code}
              </div>
              <h3 className="font-headline text-2xl font-extrabold leading-tight text-on-surface">
                {card.title}
              </h3>
              <p className="text-sm leading-7 text-[color:var(--txt2)]">{card.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={sectionShell}>
        <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="flex items-center gap-5 rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/95 p-5 shadow-tactile w-fit">

            {/* Avatar - with round image */}
            <img
              className="w-20 h-20 rounded-full object-cover shrink-0"
              src="/Images/DP.jpg"
              alt="Profile photo of the builder"
              loading="lazy"
            />

            {/* Text Content */}
            <div className="flex flex-col">
              <h3 className="font-semibold text-lg text-on-surface">
                Jelson Joseph
              </h3>

              <p className="text-sm text-[color:var(--txt2)]">
                Software Engineer
              </p>

              <p className="text-xs text-[color:var(--txt2)] opacity-80 max-w-[220px]">
                Passionate about crafting scalable and innovative solutions.
              </p>
            </div>

          </article>

          <div className="grid gap-5">

            <h2 className="max-w-3xl font-headline text-4xl font-extrabold tracking-[-0.04em] text-on-surface md:text-5xl">
              About Me
            </h2>

            <p className="max-w-3xl text-base leading-8 text-[color:var(--txt2)]">
              Hello Everyone! My name is Jelson Joseph, and I am a Software Engineer with a passion for crafting innovative
              solutions. I have a strong background in software development, and I am always eager to take on new challenges
              and learn new technologies. I believe in the power of collaboration and teamwork, and I am committed to
              delivering high-quality results in every project I undertake.
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
