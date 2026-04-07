import { Badge } from 'components/ui/Badge';
import { Button } from 'components/ui/Button';
import { PublicSection } from 'components/public/PublicSection';
import { useAuthModal } from 'hooks/useAuthModal';
import {
  publicBodyClass,
  publicCardShell,
  publicEyebrowClass,
  publicHeadingClass,
} from 'components/public/publicStyles';

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
      <PublicSection>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)] lg:items-center lg:gap-12 xl:gap-16">
          <div className="grid content-start gap-6 lg:py-3">
            <Badge size="md" variant="info">THE STORY BEHIND MEOWFOLIO</Badge>

            <div className="grid gap-4">
              <div className={publicEyebrowClass}>
                PROBLEM
              </div>
              <h1 className="max-w-[11ch] font-headline text-4xl font-extrabold leading-[0.96] tracking-[-0.05em] text-on-surface sm:text-5xl lg:text-6xl">
                Good work gets buried by{' '}
                <span className="text-coral underline decoration-4 underline-offset-8">
                  bad resumes.
                </span>
              </h1>
            </div>

            <p className={`max-w-2xl ${publicBodyClass}`}>
              meowfolio started from a familiar frustration: early-career people have real experience, but the tools around them
              make the process awkward, unclear, and harder than it should be.
            </p>

            <div className="flex flex-wrap gap-3">
              <Badge size="md" className="border-tertiary/30 bg-tertiary-fixed text-tertiary">
                BAD WORKFLOWS
              </Badge>
              <Badge size="md" variant="accent">AWKWARD DOCUMENTS</Badge>
              <Badge size="md" variant="info">CONFUSING TOOLING</Badge>
            </div>
          </div>

          <article className={`overflow-hidden bg-white/95 p-4 ${publicCardShell}`}>
            <div className="overflow-hidden rounded-[1.35rem] border border-charcoal/10 bg-surface-container-low">
              <img
                className="h-full min-h-[22rem] w-full object-cover object-center sm:min-h-[26rem] lg:min-h-[30rem]"
                src="/Images/Graduation_Day.png"
                alt="Graduation day image representing the builder journey"
              />
            </div>
          </article>
        </div>
      </PublicSection>

      <PublicSection>
        <div className="mx-auto max-w-4xl text-center">
          <div className={publicEyebrowClass}>
            PRODUCT
          </div>
          <h2 className={`mt-3 ${publicHeadingClass}`}>
            Make powerful resume tooling feel approachable.
          </h2>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {productCards.map(card => (
            <article
              key={card.title}
              className={`flex h-full flex-col gap-5 bg-white/90 p-6 sm:p-7 md:min-h-[16.5rem] ${publicCardShell}`}
            >
              <div className="grid size-16 place-items-center rounded-2xl border border-charcoal/20 bg-secondary-fixed text-base font-headline font-bold text-secondary">
                {card.code}
              </div>
              <h3 className="font-headline text-2xl font-extrabold leading-tight text-on-surface">
                {card.title}
              </h3>
              <p className={publicBodyClass}>{card.copy}</p>
            </article>
          ))}
        </div>
      </PublicSection>

      <PublicSection>
        <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start lg:gap-12 xl:grid-cols-[360px_minmax(0,1fr)]">
          <article className={`flex w-full items-center gap-5 bg-white/95 p-6 sm:p-7 ${publicCardShell}`}>
            <img
              className="h-24 w-24 shrink-0 rounded-full object-cover"
              src="/Images/DP.jpg"
              alt="Profile photo of the builder"
              loading="lazy"
            />

            <div className="flex min-w-0 flex-col gap-1">
              <h3 className="font-headline text-2xl font-extrabold text-on-surface">
                Jelson Joseph
              </h3>

              <p className="text-base font-semibold text-[color:var(--txt1)]">
                Software Engineer
              </p>

              <p className="max-w-[22rem] text-base leading-7 text-[color:var(--txt2)]">
                Passionate about crafting scalable and innovative solutions.
              </p>
            </div>
          </article>

          <div className="grid gap-6">
            <h2 className="max-w-3xl font-headline text-4xl font-extrabold tracking-[-0.04em] text-on-surface sm:text-5xl">
              About Me
            </h2>

            <p className={`max-w-3xl ${publicBodyClass}`}>
              Hello Everyone! My name is Jelson Joseph, and I am a Software Engineer with a passion for crafting innovative
              solutions. I have a strong background in software development, and I am always eager to take on new challenges
              and learn new technologies. I believe in the power of collaboration and teamwork, and I am committed to
              delivering high-quality results in every project I undertake.
            </p>

            <div>
              <Button onClick={openAboutAuth} size="lg">Enter the Workspace</Button>
            </div>
          </div>
        </div>
      </PublicSection>
    </>
  );
}
