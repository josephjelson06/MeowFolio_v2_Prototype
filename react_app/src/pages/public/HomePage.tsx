import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuthModal } from 'hooks/useAuthModal';
import { cn } from 'lib/cn';
import { routes } from 'lib/routes';
import { templateService } from 'services/templateService';
import type { TemplateRecord } from 'types/template';

const homeSurfaceWidth = 'w-full max-w-[1360px]';
const homePageSection = 'w-full py-5 sm:py-7 lg:py-10';
const homeCardShell = 'rounded-[1.75rem] border-[1.5px] border-charcoal/75 shadow-tactile';
const homeHeadingClass =
  'font-headline text-3xl font-extrabold leading-[0.98] tracking-[-0.04em] text-on-surface sm:text-4xl lg:text-[3.25rem]';
const homeBodyClass = 'text-base leading-7 text-[color:var(--txt2)] lg:text-lg lg:leading-8';

const homeStoryCards = [
  {
    title: 'Mochii starts the job search journey.',
    image: '/Images/Scene1.jpg',
    shellClass: 'bg-cream',
  },
  {
    title: 'Sent 47 resumes to top tech companies.',
    image: '/Images/Scene2.jpg',
    shellClass: 'bg-lavender',
  },
  {
    title: '47 rejections. Not enough experience in napping.',
    image: '/Images/Scene3.png',
    shellClass: 'bg-cream',
  },
  {
    title: 'Discovers meowfolio. A glimmer of hope.',
    image: '/Images/Scene4.jpg',
    shellClass: 'bg-primary-fixed',
  },
  {
    title: 'Builds a professional resume in one workspace.',
    image: '/Images/Scene5.jpg',
    shellClass: 'bg-tertiary-fixed',
  },
  {
    title: 'Hired. Senior Treat Officer at Global Meow Inc.',
    image: '/Images/Scene6.jpg',
    shellClass: 'bg-cream',
  },
] as const;

const homeFeatures = [
  {
    title: 'Build from Scratch',
    description:
      'The editor writes directly into the canonical resume schema and updates the live canvas as you type.',
    icon: 'NEW',
    toneClass: 'bg-primary-fixed text-primary',
  },
  {
    title: 'Import & Refine',
    description:
      'Paste resume text or upload `.txt`, `.md`, `.pdf`, and `.docx` files, then clean everything up in one workspace.',
    icon: 'IN',
    toneClass: 'bg-tertiary-fixed text-tertiary',
  },
  {
    title: 'Compile, Match & Score',
    description:
      'Generate a TeX-backed PDF, then inspect ATS output health and JD evidence against the same shared resume state.',
    icon: 'OUT',
    toneClass: 'bg-secondary-fixed text-secondary',
  },
] as const;

const homeFaqs = [
  {
    question: 'Is it really free?',
    answer:
      'Yes. The app is local-first right now and focused on keeping the core resume loop usable without hiding features behind a paywall.',
  },
  {
    question: 'Does it actually generate PDFs now?',
    answer:
      'Yes. The editor produces TeX-backed output and keeps template, ATS, and JD analysis in the same connected workflow.',
  },
  {
    question: 'Why keep the split workspace?',
    answer:
      'Because the editor, ATS, and JD screens work best as focused tool surfaces, while the public pages explain the product clearly and calmly.',
  },
  {
    question: 'What carries across the app?',
    answer:
      'Your resume data, template choice, ATS analysis, and JD match flow through one shared workspace instead of fragmenting into disconnected tools.',
  },
] as const;

type HomeActionVariant = 'primary' | 'secondary' | 'link';
type HomeActionSize = 'md' | 'lg';
type HomePillVariant = 'accent' | 'info' | 'outline';

function HomeAction({
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
  size?: HomeActionSize;
  to?: string;
  variant?: HomeActionVariant;
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

function HomePill({
  children,
  className,
  variant = 'outline',
}: {
  children: ReactNode;
  className?: string;
  variant?: HomePillVariant;
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

function HomeRailButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="grid size-10 shrink-0 place-items-center rounded-full border-[1.5px] border-charcoal/75 bg-white/90 text-lg text-on-surface shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:shadow-tactile sm:size-11"
      onClick={onClick}
      aria-label={label}
    >
      {label.includes('previous') ? '\u2190' : '\u2192'}
    </button>
  );
}

function HomeHeader({ onOpenAuth }: { onOpenAuth: () => void }) {
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
      <div className={`mx-auto w-full ${homeSurfaceWidth} px-4 sm:px-6 lg:px-8`}>
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

            <HomeAction className="px-5 lg:px-6" onClick={onOpenAuth} size="md">
              Login / Signup
            </HomeAction>
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
              <HomeAction className="px-4" onClick={onOpenAuth} size="md" variant="link">
                Login
              </HomeAction>
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

function HomeFooter() {
  return (
    <footer className="mt-auto w-full border-t border-charcoal/10 bg-charcoal text-white/90">
      <div className={`mx-auto w-full ${homeSurfaceWidth} px-4 py-6 sm:px-6 lg:px-8 lg:py-7`}>
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

export function HomePage() {
  const { openAuth } = useAuthModal();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [templateItems, setTemplateItems] = useState<TemplateRecord[]>([]);
  const storyRailRef = useRef<HTMLDivElement | null>(null);
  const templateRailRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    void templateService.list().then(setTemplateItems);
  }, []);

  function openHomeAuth() {
    openAuth({
      copy:
        'The public pages now live inside the same meowfolio prototype system as the rest of the app. Sign in here and continue directly into the existing dashboard flow.',
      accent: 'GOOGLE ONLY',
    });
  }

  function scrollRail(ref: RefObject<HTMLDivElement | null>, direction: 'left' | 'right', widthFactor: number) {
    const rail = ref.current;
    if (!rail) return;
    rail.scrollBy({
      behavior: 'smooth',
      left: direction === 'left' ? -rail.clientWidth * widthFactor : rail.clientWidth * widthFactor,
    });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <HomeHeader onOpenAuth={openHomeAuth} />

      <main className="flex w-full flex-1 justify-center overflow-x-clip px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12">
        <div className={`mx-auto flex w-full flex-col gap-12 sm:gap-14 lg:gap-16 ${homeSurfaceWidth}`}>
          <section className={`${homePageSection} relative overflow-hidden`}>
            <div className="absolute left-8 top-10 h-32 w-32 rounded-full bg-primary-fixed/85 blur-3xl sm:h-40 sm:w-40" />
            <div className="absolute bottom-8 right-10 h-40 w-40 rounded-full bg-secondary-fixed/85 blur-3xl sm:h-48 sm:w-48" />

            <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-10 xl:gap-14">
              <div className="grid content-start gap-7 lg:pr-4">
                <div>
                  <HomePill variant="info">FREE FOREVER. NO WATERMARKS.</HomePill>
                </div>

                <div className="max-w-[11ch] font-headline text-4xl font-extrabold leading-[0.93] tracking-[-0.055em] text-on-surface sm:text-5xl lg:text-[5.15rem]">
                  Build resumes that{' '}
                  <span className="text-coral underline decoration-4 underline-offset-8">actually</span> get read.
                </div>

                <div className="grid gap-4">
                  <p className="max-w-lg text-lg font-semibold leading-8 text-[color:var(--txt1)] sm:text-xl md:text-2xl md:leading-9">
                    Even a cat got hired. You&apos;re next.
                  </p>
                  <p className={`max-w-xl ${homeBodyClass}`}>
                    Build the resume in one workspace, generate TeX-backed PDFs, and carry the same structured profile
                    into ATS and JD analysis without jumping between disconnected tools.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-1">
                  <HomeAction className="px-7" onClick={openHomeAuth} size="lg">
                    Get Started
                  </HomeAction>
                  <HomeAction className="px-7" size="lg" to={routes.about} variant="secondary">
                    Read the story
                  </HomeAction>
                </div>
              </div>

              <div className="relative mx-auto min-w-0 w-full max-w-[43rem] lg:ml-auto">
                <div className="absolute -left-5 top-6 hidden h-[84%] w-[84%] rounded-[2.2rem] bg-primary-fixed/85 lg:block" />
                <div className="relative overflow-hidden rounded-[2.2rem] border-[1.5px] border-charcoal/75 bg-white/96 p-3 shadow-tactile-lg sm:rotate-[1.5deg] sm:p-4 lg:p-5">
                  <div className="aspect-[5/4] overflow-hidden rounded-[1.6rem] border border-charcoal/10 bg-surface-container-low">
                    <img
                      className="h-full w-full object-cover object-center"
                      src="/Images/Mochii.png"
                      alt="Mochii hero illustration"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className={homePageSection}>
            <div className="mb-8 flex flex-col gap-5 md:mb-9 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl">
                <h2 className={homeHeadingClass}>How one cat changed everything.</h2>
                <p className={`mt-3 max-w-2xl ${homeBodyClass}`}>
                  Swipe through Mochii&apos;s journey and see how the product loop moves from panic to a cleaner workflow.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <HomeRailButton
                  label="Show previous story cards"
                  onClick={() => scrollRail(storyRailRef, 'left', 0.8)}
                />
                <HomeRailButton
                  label="Show next story cards"
                  onClick={() => scrollRail(storyRailRef, 'right', 0.8)}
                />
              </div>
            </div>

            <div
              className="hide-scrollbar flex max-w-full snap-x snap-mandatory gap-5 overflow-x-auto pb-4 lg:gap-6"
              ref={storyRailRef}
            >
              {homeStoryCards.map((card, index) => (
                <article
                  className={cn(
                    'flex w-[16.75rem] flex-none snap-start flex-col overflow-hidden bg-white/92 transition hover:-translate-y-1 sm:w-[18rem] lg:w-[19rem]',
                    homeCardShell,
                  )}
                  key={card.title}
                >
                  <div className={cn('grid aspect-square place-items-center overflow-hidden border-b border-charcoal/10', card.shellClass)}>
                    <img className="h-full w-full object-cover" src={card.image} alt={card.title} loading="lazy" />
                  </div>

                  <div className="grid gap-3 p-5 sm:p-6">
                    <div className="font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <p className="font-headline text-[1.85rem] font-extrabold leading-[1.02] tracking-[-0.03em] text-on-surface">
                      {card.title}
                    </p>
                  </div>
                </article>
              ))}

              <article className="flex w-[16.75rem] flex-none snap-start flex-col items-center justify-center gap-6 rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-coral p-7 text-center shadow-tactile sm:w-[18rem] sm:p-8 lg:w-[19rem]">
                <h3 className="font-headline text-3xl font-extrabold text-white sm:text-4xl">Write your story</h3>
                <HomeAction className="bg-white text-on-surface hover:text-primary" onClick={openHomeAuth} size="lg">
                  Get Started
                </HomeAction>
              </article>
            </div>
          </section>

          <section className={homePageSection}>
            <div className="mx-auto mb-10 grid max-w-3xl justify-items-center gap-4 text-center sm:mb-11">
              <h2 className={homeHeadingClass}>Everything you need.</h2>
              <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3">
                <HomePill variant="info">FREE FOREVER</HomePill>
                <HomePill className="border-tertiary/30 bg-tertiary-fixed text-tertiary">NO WATERMARKS</HomePill>
                <HomePill variant="accent">ATS-READY</HomePill>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3 lg:gap-6">
              {homeFeatures.map(feature => (
                <article
                  className={cn(
                    'flex h-full flex-col gap-4 bg-white/92 p-5 transition hover:-translate-y-1 sm:p-6 md:min-h-[14.75rem]',
                    homeCardShell,
                  )}
                  key={feature.title}
                >
                  <div
                    className={cn(
                      'grid size-14 place-items-center rounded-[1.2rem] border border-charcoal/20 font-headline text-base font-bold sm:size-16',
                      feature.toneClass,
                    )}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="font-headline text-2xl font-extrabold leading-tight text-on-surface">{feature.title}</h3>
                  <p className={homeBodyClass}>{feature.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={homePageSection}>
            <div className="mb-8 flex flex-col gap-5 md:mb-10 md:flex-row md:items-center md:justify-between">
              <h2 className={homeHeadingClass}>Pick your vibe.</h2>
              <div className="flex items-center gap-3">
                <HomeRailButton
                  label="Show previous templates"
                  onClick={() => scrollRail(templateRailRef, 'left', 0.82)}
                />
                <HomeRailButton
                  label="Show next templates"
                  onClick={() => scrollRail(templateRailRef, 'right', 0.82)}
                />
              </div>
            </div>

            <div
              className="hide-scrollbar flex max-w-full snap-x snap-mandatory gap-5 overflow-x-auto pb-4 lg:gap-6"
              ref={templateRailRef}
            >
              {templateItems.map(template => (
                <article
                  className={cn(
                    'flex w-[16.75rem] flex-none snap-start flex-col overflow-hidden bg-white/92 sm:w-[17.5rem] lg:w-[18rem]',
                    homeCardShell,
                  )}
                  key={template.id}
                >
                  <div className="bg-surface-container-low px-4 pb-3 pt-4 sm:px-5 sm:pt-5">
                    <div className="overflow-hidden rounded-[1.25rem] bg-white p-3 shadow-ambient sm:p-4">
                      {template.previewImageUrl ? (
                        <img
                          className="h-[14.5rem] w-full rounded-[1rem] bg-white object-cover object-top sm:h-[15rem]"
                          src={template.previewImageUrl}
                          alt={`${template.name} template preview`}
                          loading="lazy"
                        />
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col gap-4 p-5 text-center sm:p-6">
                    <h3 className="font-headline text-2xl font-extrabold text-on-surface">{template.badge}</h3>
                    <p className={homeBodyClass}>{template.bestFor}</p>
                    <div className="mt-auto pt-1">
                      <HomeAction className="w-full justify-center px-6" onClick={openHomeAuth} size="lg">
                        Use this template
                      </HomeAction>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className={homePageSection}>
            <div className="grid gap-7 lg:grid-cols-[minmax(260px,0.68fr)_minmax(0,1.32fr)] lg:items-stretch lg:gap-8">
              <div className="grid">
                <div className={cn('grid h-full content-start gap-4 bg-white/95 p-5 sm:p-6', homeCardShell)}>
                  <div className="grid min-h-[12.5rem] place-items-center rounded-[1.6rem] bg-surface-container-low sm:min-h-[14rem] lg:min-h-[16rem]">
                    <div className="grid size-32 place-items-center rounded-full bg-primary-fixed sm:size-36 lg:size-40">
                      <img
                        className="h-24 w-24 object-contain sm:h-28 sm:w-28 lg:h-32 lg:w-32"
                        src="/Images/Prof_Mochii.png"
                        alt="Professor Mochii illustration"
                        loading="lazy"
                      />
                    </div>
                  </div>
                  <div className="rounded-[1.25rem] border-[1.5px] border-charcoal/75 bg-coral p-5 shadow-tactile">
                    <p className="font-headline text-lg font-extrabold italic leading-snug text-white sm:text-xl">
                      &quot;Curious about something? I&apos;ve got the answers right here, human.&quot;
                    </p>
                    <p className="mt-2 text-sm font-black text-white">- Professor Mochii</p>
                  </div>
                </div>
              </div>

              <div className="grid content-start gap-4 lg:pt-1">
                <h2 className={homeHeadingClass}>Got questions?</h2>
                <div className="space-y-4">
                  {homeFaqs.map((faq, index) => {
                    const open = openFaqIndex === index;

                    return (
                      <article className={cn('overflow-hidden bg-white/90', homeCardShell)} key={faq.question}>
                        <button
                          type="button"
                          className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-6 sm:py-5 md:px-7"
                          onClick={() => setOpenFaqIndex(open ? null : index)}
                          aria-expanded={open}
                          aria-controls={`home-faq-answer-${index}`}
                        >
                          <span className="pr-4 font-headline text-lg font-extrabold leading-tight text-on-surface sm:text-xl">
                            {faq.question}
                          </span>
                          <span className="text-2xl font-bold text-[color:var(--txt1)]">{open ? '\u2212' : '+'}</span>
                        </button>
                        {open ? (
                          <div
                            className="border-t border-outline-variant/30 px-5 py-5 sm:px-6 sm:py-5 md:px-7"
                            id={`home-faq-answer-${index}`}
                          >
                            <p className={homeBodyClass}>{faq.answer}</p>
                          </div>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}
