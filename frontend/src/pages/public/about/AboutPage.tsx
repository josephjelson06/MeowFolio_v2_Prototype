import { cn } from 'lib/cn';
import { PublicAction } from 'components/public/PublicAction';
import { PublicLayout } from 'components/public/PublicLayout';
import { PublicPill } from 'components/public/PublicPill';
import { PUBLIC_BODY_CLASS, PUBLIC_CARD_SHELL, PUBLIC_SURFACE_WIDTH } from 'components/public/publicStyles';
import { useUiContext } from 'state/ui/uiContext';

const aboutEyebrowClass = 'font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary sm:text-xs';
const aboutHeadingClass =
  'font-headline text-3xl font-extrabold leading-[0.98] tracking-[-0.04em] text-on-surface sm:text-4xl lg:text-[3.25rem]';

const aboutProductCards = [
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
  const { openAuth } = useUiContext();

  function openAboutAuth() {
    openAuth({
      copy:
        'The About page lives inside the same meowfolio prototype system as the rest of the app. Sign in here and continue directly into the workspace flow.',
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
    <PublicLayout onOpenAuth={openAboutAuth}>
      <div className={`mx-auto flex w-full flex-col gap-12 sm:gap-14 lg:gap-16 ${PUBLIC_SURFACE_WIDTH}`}>
        <section className="w-full py-5 sm:py-7 lg:py-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)] lg:items-center lg:gap-12 xl:gap-16">
            <div className="grid content-start gap-6 lg:py-3">
              <PublicPill variant="info">THE STORY BEHIND MEOWFOLIO</PublicPill>

              <div className="grid gap-4">
                <div className={aboutEyebrowClass}>PROBLEM</div>
                <h1 className="max-w-[11ch] font-headline text-4xl font-extrabold leading-[0.96] tracking-[-0.05em] text-on-surface sm:text-5xl lg:text-6xl">
                  Good work gets buried by{' '}
                  <span className="text-coral underline decoration-4 underline-offset-8">bad resumes.</span>
                </h1>
              </div>

              <p className={`max-w-2xl ${PUBLIC_BODY_CLASS}`}>
                meowfolio started from a familiar frustration: early-career people have real experience, but the tools
                around them make the process awkward, unclear, and harder than it should be.
              </p>

              <div className="flex flex-wrap gap-3">
                <PublicPill className="border-tertiary/30 bg-tertiary-fixed text-tertiary">BAD WORKFLOWS</PublicPill>
                <PublicPill variant="accent">AWKWARD DOCUMENTS</PublicPill>
                <PublicPill variant="info">CONFUSING TOOLING</PublicPill>
              </div>
            </div>

            <article className={cn('overflow-hidden bg-white/95 p-4', PUBLIC_CARD_SHELL)}>
              <div className="overflow-hidden rounded-[1.35rem] border border-charcoal/10 bg-surface-container-low">
                <img
                  className="h-full min-h-[22rem] w-full object-cover object-center sm:min-h-[26rem] lg:min-h-[30rem]"
                  src="/Images/Graduation_Day.png"
                  alt="Graduation day image representing the builder journey"
                />
              </div>
            </article>
          </div>
        </section>
        <hr className="w-full border-t border-black"></hr>
        <section className="w-full py-5 sm:py-7 lg:py-10">
          <div className="mx-auto max-w-4xl text-center">
            <div className={aboutEyebrowClass}>PRODUCT</div>
            <h2 className={`mt-3 ${aboutHeadingClass}`}>Make powerful resume tooling feel approachable.</h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {aboutProductCards.map(card => (
              <article
                key={card.title}
                className={cn('flex h-full flex-col gap-5 bg-white/90 p-6 sm:p-7 md:min-h-[16.5rem]', PUBLIC_CARD_SHELL)}
              >
                <div className="grid size-16 place-items-center rounded-2xl border border-charcoal/20 bg-secondary-fixed font-headline text-base font-bold text-secondary">
                  {card.code}
                </div>
                <h3 className="font-headline text-2xl font-extrabold leading-tight text-on-surface">{card.title}</h3>
                <p className={PUBLIC_BODY_CLASS}>{card.copy}</p>
              </article>
            ))}
          </div>
        </section>
        <hr className="w-full border-t border-black"></hr>

        <section className="w-full py-10">

          <div className={cn(
            "flex w-full flex-col items-start gap-6 bg-white/95 p-6 sm:flex-row sm:items-center sm:gap-10 sm:p-7",
            PUBLIC_CARD_SHELL
          )}>

            {/* LEFT PROFILE */}
            <div className="flex shrink-0 items-center justify-center sm:justify-start">
              <img
                className="h-28 w-28 rounded-full object-cover sm:h-36 sm:w-36 lg:h-40 lg:w-40"
                src="/Images/DP.jpg"
                alt="Profile photo of the builder"
                loading="lazy"
              />

            </div>

            {/* RIGHT CONTENT */}
            <div className="flex flex-1 flex-col gap-6">

              <h2 className="font-headline text-4xl font-extrabold tracking-[-0.04em] text-on-surface sm:text-5xl">
                About Me
              </h2>

              <p className={PUBLIC_BODY_CLASS}>
                Hello Everyone! My name is Jelson Joseph, and I am a Software Engineer with a passion for crafting
                innovative solutions. I have a strong background in software development, and I am always eager to take
                on new challenges and learn new technologies. I believe in the power of collaboration and teamwork, and
                I am committed to delivering high-quality results in every project I undertake.
              </p>

              <div>
                <PublicAction onClick={openAboutAuth} size="lg">
                  Enter the Workspace
                </PublicAction>
              </div>

            </div>
          </div>

        </section>

        <hr className="w-full border-t border-black"></hr>

      </div>
    </PublicLayout>
  );
}
