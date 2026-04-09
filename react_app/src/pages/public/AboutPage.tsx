import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuthModal } from 'hooks/useAuthModal';
import { cn } from 'lib/cn';
import { routes } from 'lib/routes';

const aboutSurfaceWidth = 'w-full max-w-[1360px]';
const aboutBodyClass = 'text-base leading-7 text-[color:var(--txt2)] lg:text-lg lg:leading-8';
const aboutCardShell = 'rounded-[1.75rem] border-[1.5px] border-charcoal/75 shadow-tactile';
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

type AboutActionVariant = 'primary' | 'secondary' | 'link';
type AboutActionSize = 'md' | 'lg';
type AboutPillVariant = 'accent' | 'info' | 'outline';

function AboutAction({
  children,
  className,
  onClick,
  size = 'md',
  to,
  variant = 'primary',
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  size?: AboutActionSize;
  to?: string;
  variant?: AboutActionVariant;
}) {
  const sizeClass =
    variant === 'link'
      ? size === 'lg'
        ? 'min-h-11 px-5 py-2.5 text-sm'
        : 'min-h-10 px-4 py-2 text-xs'
      : size === 'lg'
        ? 'min-h-[3.5rem] px-7 py-3.5 text-base'
        : 'min-h-12 px-6 py-3 text-sm';
  const variantClass =
    variant === 'primary'
      ? 'bg-white/95 text-on-surface hover:bg-surface-container-low hover:text-primary hover:shadow-tactile'
      : variant === 'secondary'
        ? 'bg-white/85 font-sans font-semibold text-[color:var(--txt1)] hover:bg-white hover:text-on-surface hover:shadow-tactile'
        : 'border-charcoal/65 bg-white/80 font-sans font-semibold text-[color:var(--txt1)] hover:bg-white hover:text-on-surface hover:shadow-tactile-sm';
  const actionClass = cn(
    'inline-flex items-center justify-center gap-2 rounded-full border-2 border-charcoal text-center font-headline font-bold tracking-[0.01em] transition duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
    'shadow-tactile-sm hover:-translate-x-px hover:-translate-y-px active:translate-x-px active:translate-y-px active:shadow-none',
    sizeClass,
    variantClass,
    className,
  );

  if (to) {
    return (
      <Link className={actionClass} to={to}>
        {children}
      </Link>
    );
  }

  return (
    <button className={actionClass} type="button" onClick={onClick}>
      {children}
    </button>
  );
}

function AboutPill({
  children,
  className,
  variant = 'outline',
}: {
  children: ReactNode;
  className?: string;
  variant?: AboutPillVariant;
}) {
  const toneClass =
    variant === 'accent'
      ? 'border-primary/40 bg-primary-fixed text-primary'
      : variant === 'info'
        ? 'border-secondary/35 bg-secondary-fixed text-secondary'
        : 'border-charcoal/65 bg-white/80 text-[color:var(--txt2)]';

  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full border-[1.5px] px-4 py-1.5 font-headline text-[11px] font-bold uppercase tracking-[0.14em] sm:text-xs',
        toneClass,
        className,
      )}
    >
      {children}
    </span>
  );
}

function AboutHeader({ onOpenAuth }: { onOpenAuth: () => void }) {
  const desktopLink = ({ isActive }: { isActive: boolean }) =>
    cn(
      'inline-flex min-h-10 items-center justify-center rounded-full px-4 text-sm font-semibold text-[color:var(--txt1)] transition hover:bg-white/90 hover:text-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:px-5',
      isActive && 'bg-white text-on-surface shadow-tactile-sm',
    );

  const mobileLink = ({ isActive }: { isActive: boolean }) =>
    cn(
      'inline-flex min-h-10 flex-1 items-center justify-center rounded-[1rem] px-4 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
      isActive
        ? 'bg-white text-on-surface shadow-tactile-sm'
        : 'text-[color:var(--txt1)] hover:bg-white/90 hover:text-on-surface',
    );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-charcoal/10 bg-background/92 backdrop-blur-xl">
      <div className={`mx-auto w-full ${aboutSurfaceWidth} px-4 sm:px-6 lg:px-8`}>
        <div className="hidden min-h-[78px] items-center justify-between gap-6 md:flex">
          <NavLink
            className="inline-flex w-max items-center font-headline text-2xl font-extrabold tracking-[-0.03em] text-on-surface"
            to={routes.home}
          >
            meowfolio
          </NavLink>

          <div className="flex items-center gap-3 lg:gap-4">
            <nav className="flex items-center gap-1 rounded-full border border-charcoal/15 bg-white/72 p-1 shadow-ambient">
              <NavLink className={desktopLink} to={routes.home} end>
                Home
              </NavLink>
              <NavLink className={desktopLink} to={routes.about}>
                About
              </NavLink>
            </nav>

            <AboutAction className="px-5 lg:px-6" onClick={onOpenAuth} size="md">
              Login / Signup
            </AboutAction>
          </div>
        </div>

        <div className="grid gap-3 py-3 md:hidden">
          <div className="flex min-h-[52px] items-center justify-between gap-3">
            <NavLink
              className="inline-flex items-center font-headline text-lg font-extrabold tracking-[-0.03em] text-on-surface"
              to={routes.home}
            >
              meowfolio
            </NavLink>

            <div className="ml-auto shrink-0">
              <AboutAction className="px-4" onClick={onOpenAuth} size="md" variant="link">
                Login
              </AboutAction>
            </div>
          </div>

          <nav className="grid grid-cols-2 gap-2 rounded-[1.35rem] border border-charcoal/15 bg-white/72 p-1 shadow-ambient">
            <NavLink className={mobileLink} to={routes.home} end>
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

function AboutFooter() {
  return (
    <footer className="mt-auto w-full border-t border-charcoal/10 bg-charcoal text-white/90">
      <div className={`mx-auto w-full ${aboutSurfaceWidth} px-4 py-6 sm:px-6 lg:px-8 lg:py-7`}>
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <div className="space-y-1">
            <span className="block font-medium">&copy; 2026 meowfolio</span>
            <p className="max-w-xl text-sm leading-6 text-white/70">
              Built for focused resume work, playful storytelling, and a calmer public surface.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/65 md:justify-end">
            <span>Public surface</span>
            <span className="hidden h-1 w-1 rounded-full bg-white/35 md:inline-block" />
            <span>Prototype system</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

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
    <div className="flex min-h-screen flex-col">
      <AboutHeader onOpenAuth={openAboutAuth} />

      <main className="flex w-full flex-1 justify-center overflow-x-clip px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12">
        <div className={`mx-auto flex w-full flex-col gap-12 sm:gap-14 lg:gap-16 ${aboutSurfaceWidth}`}>
          <section className="w-full py-5 sm:py-7 lg:py-10">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)] lg:items-center lg:gap-12 xl:gap-16">
              <div className="grid content-start gap-6 lg:py-3">
                <AboutPill variant="info">THE STORY BEHIND MEOWFOLIO</AboutPill>

                <div className="grid gap-4">
                  <div className={aboutEyebrowClass}>PROBLEM</div>
                  <h1 className="max-w-[11ch] font-headline text-4xl font-extrabold leading-[0.96] tracking-[-0.05em] text-on-surface sm:text-5xl lg:text-6xl">
                    Good work gets buried by{' '}
                    <span className="text-coral underline decoration-4 underline-offset-8">bad resumes.</span>
                  </h1>
                </div>

                <p className={`max-w-2xl ${aboutBodyClass}`}>
                  meowfolio started from a familiar frustration: early-career people have real experience, but the tools
                  around them make the process awkward, unclear, and harder than it should be.
                </p>

                <div className="flex flex-wrap gap-3">
                  <AboutPill className="border-tertiary/30 bg-tertiary-fixed text-tertiary">BAD WORKFLOWS</AboutPill>
                  <AboutPill variant="accent">AWKWARD DOCUMENTS</AboutPill>
                  <AboutPill variant="info">CONFUSING TOOLING</AboutPill>
                </div>
              </div>

              <article className={cn('overflow-hidden bg-white/95 p-4', aboutCardShell)}>
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

          <section className="w-full py-5 sm:py-7 lg:py-10">
            <div className="mx-auto max-w-4xl text-center">
              <div className={aboutEyebrowClass}>PRODUCT</div>
              <h2 className={`mt-3 ${aboutHeadingClass}`}>Make powerful resume tooling feel approachable.</h2>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {aboutProductCards.map(card => (
                <article
                  key={card.title}
                  className={cn('flex h-full flex-col gap-5 bg-white/90 p-6 sm:p-7 md:min-h-[16.5rem]', aboutCardShell)}
                >
                  <div className="grid size-16 place-items-center rounded-2xl border border-charcoal/20 bg-secondary-fixed font-headline text-base font-bold text-secondary">
                    {card.code}
                  </div>
                  <h3 className="font-headline text-2xl font-extrabold leading-tight text-on-surface">{card.title}</h3>
                  <p className={aboutBodyClass}>{card.copy}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="w-full py-5 sm:py-7 lg:py-10">
            <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start lg:gap-12 xl:grid-cols-[360px_minmax(0,1fr)]">
              <article className={cn('flex w-full items-center gap-5 bg-white/95 p-6 sm:p-7', aboutCardShell)}>
                <img
                  className="h-24 w-24 shrink-0 rounded-full object-cover"
                  src="/Images/DP.jpg"
                  alt="Profile photo of the builder"
                  loading="lazy"
                />

                <div className="flex min-w-0 flex-col gap-1">
                  <h3 className="font-headline text-2xl font-extrabold text-on-surface">Jelson Joseph</h3>
                  <p className="text-base font-semibold text-[color:var(--txt1)]">Software Engineer</p>
                  <p className="max-w-[22rem] text-base leading-7 text-[color:var(--txt2)]">
                    Passionate about crafting scalable and innovative solutions.
                  </p>
                </div>
              </article>

              <div className="grid gap-6">
                <h2 className="max-w-3xl font-headline text-4xl font-extrabold tracking-[-0.04em] text-on-surface sm:text-5xl">
                  About Me
                </h2>

                <p className={`max-w-3xl ${aboutBodyClass}`}>
                  Hello Everyone! My name is Jelson Joseph, and I am a Software Engineer with a passion for crafting
                  innovative solutions. I have a strong background in software development, and I am always eager to take
                  on new challenges and learn new technologies. I believe in the power of collaboration and teamwork, and
                  I am committed to delivering high-quality results in every project I undertake.
                </p>

                <div>
                  <AboutAction onClick={openAboutAuth} size="lg">
                    Enter the Workspace
                  </AboutAction>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <AboutFooter />
    </div>
  );
}
