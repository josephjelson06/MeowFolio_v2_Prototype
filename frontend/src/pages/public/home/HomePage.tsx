import { useRef, useState, type RefObject } from 'react';
import { cn } from 'lib/cn';
import { routes } from 'app/router/routes';
import { PublicAction } from 'components/public/PublicAction';
import { PublicLayout } from 'components/public/PublicLayout';
import { PublicPill } from 'components/public/PublicPill';
import { PUBLIC_BODY_CLASS, PUBLIC_CARD_SHELL, PUBLIC_SURFACE_WIDTH } from 'components/public/publicStyles';
import { useUiContext } from 'state/ui/uiContext';

const homePageSection = 'w-full py-5 sm:py-7 lg:py-10';
const homeHeadingClass =
  'font-headline text-3xl font-extrabold leading-[0.98] tracking-[-0.04em] text-on-surface sm:text-4xl lg:text-[3.25rem]';

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

export function HomePage() {
  const { openAuth } = useUiContext();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const storyRailRef = useRef<HTMLDivElement | null>(null);

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
    <PublicLayout onOpenAuth={openHomeAuth}>
      <div className={`mx-auto flex w-full flex-col gap-12 sm:gap-14 lg:gap-16 ${PUBLIC_SURFACE_WIDTH}`}>
        <section className={`${homePageSection} relative overflow-hidden`}>
          <div className="absolute left-8 top-10 h-32 w-32 rounded-full bg-primary-fixed/85 blur-3xl sm:h-40 sm:w-40" />
          <div className="absolute bottom-8 right-10 h-40 w-40 rounded-full bg-secondary-fixed/85 blur-3xl sm:h-48 sm:w-48" />

          <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-10 xl:gap-14">
            <div className="grid content-start gap-7 lg:pr-4">
              <div>
                <PublicPill variant="info">FREE FOREVER. NO WATERMARKS.</PublicPill>
              </div>

              <div className="max-w-[11ch] font-headline text-4xl font-extrabold leading-[0.93] tracking-[-0.055em] text-on-surface sm:text-5xl lg:text-[5.15rem]">
                Build resumes that{' '}
                <span className="text-coral underline decoration-4 underline-offset-8">actually</span> get read.
              </div>

              <div className="grid gap-4">
                <p className="max-w-lg text-lg font-semibold leading-8 text-[color:var(--txt1)] sm:text-xl md:text-2xl md:leading-9">
                  Even a cat got hired. You&apos;re next.
                </p>
                <p className={`max-w-xl ${PUBLIC_BODY_CLASS}`}>
                  Build the resume in one workspace, generate TeX-backed PDFs, and carry the same structured profile
                  into ATS and JD analysis without jumping between disconnected tools.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-1">
                <PublicAction className="px-7" onClick={openHomeAuth} size="lg">
                  Get Started
                </PublicAction>
                <PublicAction className="px-7" size="lg" to={routes.about} variant="secondary">
                  Read the story
                </PublicAction>
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
              <p className={`mt-3 max-w-2xl ${PUBLIC_BODY_CLASS}`}>
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
                  PUBLIC_CARD_SHELL,
                )}
                key={card.title}
              >
                <div
                  className={cn(
                    'grid aspect-square place-items-center overflow-hidden border-b border-charcoal/10',
                    card.shellClass,
                  )}
                >
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
              <PublicAction className="bg-white text-on-surface hover:text-primary" onClick={openHomeAuth} size="lg">
                Get Started
              </PublicAction>
            </article>
          </div>
        </section>

        <section className={homePageSection}>
          <div className="mx-auto mb-10 grid max-w-3xl justify-items-center gap-4 text-center sm:mb-11">
            <h2 className={homeHeadingClass}>Everything you need.</h2>
            <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3">
              <PublicPill variant="info">FREE FOREVER</PublicPill>
              <PublicPill className="border-tertiary/30 bg-tertiary-fixed text-tertiary">NO WATERMARKS</PublicPill>
              <PublicPill variant="accent">ATS-READY</PublicPill>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3 lg:gap-6">
            {homeFeatures.map(feature => (
              <article
                className={cn(
                  'flex h-full flex-col gap-4 bg-white/92 p-5 transition hover:-translate-y-1 sm:p-6 md:min-h-[14.75rem]',
                  PUBLIC_CARD_SHELL,
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
                <p className={PUBLIC_BODY_CLASS}>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={homePageSection}>
          <div className="grid gap-7 lg:grid-cols-[minmax(260px,0.68fr)_minmax(0,1.32fr)] lg:items-stretch lg:gap-8">
            <div className="grid">
              <div className={cn('grid h-full content-start gap-4 bg-white/95 p-5 sm:p-6', PUBLIC_CARD_SHELL)}>
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
                    <article className={cn('overflow-hidden bg-white/90', PUBLIC_CARD_SHELL)} key={faq.question}>
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
                          <p className={PUBLIC_BODY_CLASS}>{faq.answer}</p>
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
    </PublicLayout>
  );
}
