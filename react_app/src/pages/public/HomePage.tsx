import { useEffect, useRef, useState } from 'react';
import { Badge } from 'components/ui/Badge';
import { Button } from 'components/ui/Button';
import { PublicSection } from 'components/public/PublicSection';
import { useAuthModal } from 'hooks/useAuthModal';
import {
  publicBodyClass,
  publicCardShell,
  publicHeadingClass,
} from 'components/public/publicStyles';
import { routes } from 'lib/routes';
import { templateService } from 'services/templateService';
import type { TemplateRecord } from 'types/template';

const storyCards = [
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

const features = [
  {
    title: 'Build from Scratch',
    description: 'The editor writes directly into the canonical resume schema and updates the live canvas as you type.',
    icon: 'NEW',
    toneClass: 'bg-primary-fixed text-primary',
  },
  {
    title: 'Import & Refine',
    description: 'Paste resume text or upload `.txt`, `.md`, `.pdf`, and `.docx` files, then clean everything up in one workspace.',
    icon: 'IN',
    toneClass: 'bg-tertiary-fixed text-tertiary',
  },
  {
    title: 'Compile, Match & Score',
    description: 'Generate a TeX-backed PDF, then inspect ATS output health and JD evidence against the same shared resume state.',
    icon: 'OUT',
    toneClass: 'bg-secondary-fixed text-secondary',
  },
] as const;

const faqs = [
  {
    question: 'Is it really free?',
    answer: 'Yes. The app is local-first right now and focused on keeping the core resume loop usable without hiding features behind a paywall.',
  },
  {
    question: 'Does it actually generate PDFs now?',
    answer: 'Yes. The editor produces TeX-backed output and keeps template, ATS, and JD analysis in the same connected workflow.',
  },
  {
    question: 'Why keep the split workspace?',
    answer: 'Because the editor, ATS, and JD screens work best as focused tool surfaces, while the public pages explain the product clearly and calmly.',
  },
  {
    question: 'What carries across the app?',
    answer: 'Your resume data, template choice, ATS analysis, and JD match flow through one shared workspace instead of fragmenting into disconnected tools.',
  },
] as const;

function RoundRailButton({
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
  const { openAuth } = useAuthModal();
  const [templateItems, setTemplateItems] = useState<TemplateRecord[]>([]);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const storyRailRef = useRef<HTMLDivElement | null>(null);
  const templateRailRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    void templateService.list().then(setTemplateItems);
  }, []);

  function openHomeAuth() {
    openAuth({
      copy: 'The public pages now live inside the same meowfolio prototype system as the rest of the app. Sign in here and continue directly into the existing dashboard flow.',
      accent: 'GOOGLE ONLY',
    });
  }

  function scrollRail(ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right', ratio: number) {
    const container = ref.current;
    if (!container) return;
    const amount = container.clientWidth * ratio;
    container.scrollBy({
      behavior: 'smooth',
      left: direction === 'left' ? -amount : amount,
    });
  }

  return (
    <>
      <PublicSection className="relative">
        <div className="absolute left-12 top-12 h-40 w-40 rounded-full bg-primary-fixed blur-3xl"></div>
        <div className="absolute bottom-10 right-16 h-48 w-48 rounded-full bg-secondary-fixed blur-3xl"></div>

        <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:gap-14 xl:gap-20">
          <div className="grid content-start gap-6 lg:pr-6">
            <div>
              <Badge size="md" variant="info">FREE FOREVER. NO WATERMARKS.</Badge>
            </div>

            <div className="max-w-[10ch] font-headline text-4xl font-extrabold leading-[0.94] tracking-[-0.05em] text-on-surface sm:text-5xl lg:text-6xl">
              Build resumes that <span className="text-coral underline decoration-4 underline-offset-8">actually</span> get read.
            </div>

            <div className="grid gap-3 sm:gap-4">
              <p className="max-w-lg text-lg font-semibold leading-8 text-[color:var(--txt1)] sm:text-xl md:text-2xl md:leading-9">
                Even a cat got hired. You&apos;re next.
              </p>
              <p className={`max-w-2xl ${publicBodyClass}`}>
                Build the resume in one workspace, generate TeX-backed PDFs, and carry the same structured profile into ATS and JD analysis without jumping between disconnected tools.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <Button className="px-8" onClick={openHomeAuth} size="lg">Get Started</Button>
              <Button className="px-8" size="lg" to={routes.about} variant="secondary">Read the story</Button>
            </div>
          </div>

          <div className="relative mx-auto min-w-0 w-full max-w-[52rem] lg:ml-auto">
            <div className="absolute -left-4 top-8 hidden h-[86%] w-[88%] rounded-[2rem] bg-primary-fixed lg:block"></div>
            <div className="relative overflow-hidden rounded-[2rem] border-[1.5px] border-charcoal/75 bg-white/95 p-3 shadow-tactile-lg sm:rotate-2 sm:p-4 lg:p-5">
              <div className="overflow-hidden rounded-[1.5rem] border border-charcoal/10 bg-surface-container-low">
                <img
                  className="h-full w-full object-cover"
                  src="/Images/Mochii.png"
                  alt="Mochii hero illustration"
                />
              </div>
            </div>
          </div>
        </div>
      </PublicSection>

      <PublicSection>
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h2 className={publicHeadingClass}>How one cat changed everything.</h2>
            <p className={`mt-3 max-w-xl ${publicBodyClass}`}>Swipe through Mochii&apos;s journey and see how the product loop moves from panic to a cleaner workflow.</p>
          </div>
          <div className="flex items-center gap-3">
            <RoundRailButton label="Show previous story cards" onClick={() => scrollRail(storyRailRef, 'left', 0.8)} />
            <RoundRailButton label="Show next story cards" onClick={() => scrollRail(storyRailRef, 'right', 0.8)} />
          </div>
        </div>

        <div className="hide-scrollbar flex max-w-full snap-x snap-mandatory gap-5 overflow-x-auto pb-3 lg:gap-6" ref={storyRailRef}>
          {storyCards.map((card, index) => (
            <article className={`grid w-[18rem] flex-none snap-start content-start gap-4 bg-white/90 p-5 sm:w-[19rem] sm:p-6 lg:w-[20rem] ${publicCardShell}`} key={card.title}>
              <div className={`grid aspect-square place-items-center overflow-hidden rounded-[1.2rem] border border-charcoal/15 ${card.shellClass}`}>
                <img className="h-full w-full object-cover" src={card.image} alt={card.title} loading="lazy" />
              </div>
              <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">{String(index + 1).padStart(2, '0')}</div>
              <p className="font-headline text-xl font-extrabold leading-tight text-on-surface sm:text-2xl">{card.title}</p>
              {/* <p className="text-sm leading-7 text-[color:var(--txt2)]">{card.copy}</p> */}
            </article>
          ))}

          <article className="flex w-[18rem] flex-none snap-start flex-col items-center justify-center gap-6 rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-coral p-8 text-center shadow-tactile sm:w-[19rem] lg:w-[20rem]">
            <h3 className="font-headline text-3xl font-extrabold text-white sm:text-4xl">Write your story</h3>
            <Button className="bg-white text-on-surface hover:text-primary" onClick={openHomeAuth} size="lg">Get Started</Button>
          </article>
        </div>
      </PublicSection>

      <PublicSection>
        <div className="mx-auto mb-12 grid max-w-4xl justify-items-center gap-4 text-center sm:gap-5">
          <h2 className={publicHeadingClass}>Everything you need.</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Badge size="md" variant="info">FREE FOREVER</Badge>
            <Badge size="md" className="border-tertiary/30 bg-tertiary-fixed text-tertiary">NO WATERMARKS</Badge>
            <Badge size="md" variant="accent">ATS-READY</Badge>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map(feature => (
            <article className={`grid h-full content-start gap-5 bg-white/90 p-6 transition hover:-translate-x-px hover:-translate-y-px sm:p-7 md:min-h-[17rem] ${publicCardShell}`} key={feature.title}>
              <div className={`grid size-16 place-items-center rounded-2xl border border-charcoal/20 font-headline text-base font-bold sm:size-[4.5rem] ${feature.toneClass}`}>
                {feature.icon}
              </div>
              <h3 className="font-headline text-2xl font-extrabold leading-tight text-on-surface">{feature.title}</h3>
              <p className={publicBodyClass}>{feature.description}</p>
            </article>
          ))}
        </div>
      </PublicSection>

      <PublicSection>
        <div className="mb-8 flex flex-col gap-5 md:mb-10 md:flex-row md:items-center md:justify-between">
          <h2 className={publicHeadingClass}>Pick your vibe.</h2>
          <div className="flex items-center gap-3">
            <RoundRailButton label="Show previous templates" onClick={() => scrollRail(templateRailRef, 'left', 0.82)} />
            <RoundRailButton label="Show next templates" onClick={() => scrollRail(templateRailRef, 'right', 0.82)} />
          </div>
        </div>

        <div className="hide-scrollbar flex max-w-full snap-x snap-mandatory gap-5 overflow-x-auto pb-3 lg:gap-6" ref={templateRailRef}>
          {templateItems.map(template => (
            <article className={`grid w-[18rem] flex-none snap-start overflow-hidden bg-white/90 sm:w-[19rem] lg:w-[20rem] ${publicCardShell}`} key={template.id}>
              <div className="bg-surface-container-low px-4 pb-4 pt-4 sm:px-5 sm:pt-5">
                <div className="overflow-hidden rounded-[1.25rem] bg-white p-3 shadow-ambient sm:p-4">
                  {template.previewImageUrl ? (
                    <img className="h-[16rem] w-full rounded-[1rem] bg-white object-cover object-top sm:h-[17rem]" src={template.previewImageUrl} alt={`${template.name} template preview`} loading="lazy" />
                  ) : null}
                </div>
              </div>

              <div className="grid gap-4 p-5 text-center sm:p-6">
                <h3 className="font-headline text-2xl font-extrabold text-on-surface">{template.badge}</h3>
                <p className={publicBodyClass}>{template.bestFor}</p>
                <div className="pt-1">
                  <Button className="px-6" onClick={openHomeAuth} size="lg">Use this template</Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </PublicSection>

      <PublicSection>
        <div className="grid gap-8 lg:grid-cols-[minmax(300px,0.72fr)_minmax(0,1.28fr)] lg:items-stretch lg:gap-10">
          <div className="grid">
            <div className={`grid h-full content-between gap-5 bg-white/95 p-4 sm:p-5 ${publicCardShell}`}>
              <div className="grid min-h-[16rem] place-items-center rounded-[1.4rem] bg-surface-container-low sm:min-h-[19rem] lg:min-h-[22rem]">
                <div className="grid size-40 place-items-center rounded-full bg-primary-fixed sm:size-48 lg:size-56">
                  <img className="h-28 w-28 object-contain md:h-36 md:w-36" src="/Images/Prof_Mochii.png" alt="Professor Mochii illustration" loading="lazy" />
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

          <div className="grid content-start gap-6 lg:pt-2">
            <h2 className={publicHeadingClass}>Got questions?</h2>
            <div className="space-y-5">
              {faqs.map((faq, index) => {
                const open = openFaqIndex === index;

                return (
                  <article className={`overflow-hidden bg-white/90 ${publicCardShell}`} key={faq.question}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left sm:px-7 sm:py-6 md:px-8"
                      onClick={() => setOpenFaqIndex(open ? null : index)}
                      aria-expanded={open}
                      aria-controls={`home-faq-answer-${index}`}
                    >
                      <span className="pr-4 font-headline text-xl font-extrabold leading-tight text-on-surface">{faq.question}</span>
                      <span className="text-2xl font-bold text-[color:var(--txt1)]">{open ? '\u2212' : '+'}</span>
                    </button>
                    {open ? (
                      <div className="border-t border-outline-variant/30 px-6 py-5 sm:px-7 sm:py-6 md:px-8" id={`home-faq-answer-${index}`}>
                        <p className={publicBodyClass}>{faq.answer}</p>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </PublicSection>
    </>
  );
}
