import { useEffect, useRef, useState } from 'react';
import { Badge } from 'components/ui/Badge';
import { Button } from 'components/ui/Button';
import { useAuthModal } from 'hooks/useAuthModal';
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

const sectionShell =
  'w-full max-w-full overflow-hidden rounded-[2.25rem] border-[1.5px] border-charcoal/75 bg-white/75 px-5 py-10 shadow-tactile backdrop-blur-sm sm:px-6 md:px-8 md:py-14 lg:px-12 lg:py-16';

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
      className="grid size-11 place-items-center rounded-full border-2 border-charcoal/75 bg-white/90 text-lg text-on-surface shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:shadow-tactile"
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
      <section className={`relative overflow-hidden ${sectionShell}`}>
        <div className="absolute left-12 top-12 h-40 w-40 rounded-full bg-primary-fixed blur-3xl"></div>
        <div className="absolute bottom-10 right-16 h-48 w-48 rounded-full bg-secondary-fixed blur-3xl"></div>

        <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12">
          <div className="grid gap-6">
            <div>
              <Badge variant="info">FREE FOREVER. NO WATERMARKS.</Badge>
            </div>

            <div className="max-w-[34rem] font-headline text-4xl font-extrabold leading-[0.98] tracking-[-0.05em] text-on-surface sm:text-5xl lg:text-6xl">
              Build resumes that <span className="text-coral underline decoration-4 underline-offset-8">actually</span> get read.
            </div>

            <div className="grid gap-4">
              <p className="max-w-lg text-xl font-semibold leading-9 text-[color:var(--txt1)] md:text-2xl">
                Even a cat got hired. You&apos;re next.
              </p>
              <p className="max-w-xl text-base leading-8 text-[color:var(--txt2)] md:text-lg">
                Build the resume in one workspace, generate TeX-backed PDFs, and carry the same structured profile into ATS and JD analysis without jumping between disconnected tools.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button className="px-8 py-4 text-base" onClick={openHomeAuth}>Get Started</Button>
              <Button className="px-8 py-4 text-base" to={routes.about} variant="secondary">Read the story</Button>
            </div>
          </div>

          <div className="relative min-w-0">
            <div className="absolute -left-4 top-8 hidden h-[86%] w-[88%] rounded-[2rem] bg-primary-fixed lg:block"></div>
            <div className="relative max-w-full rotate-2 rounded-[2rem] border-[1.5px] border-charcoal/75 bg-white/95 p-4 shadow-tactile-lg">
              <div className="rounded-[1.5rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,244,239,0.98))] p-5">
                <div className="rounded-[1.2rem] bg-white p-5 shadow-ambient">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <div className="h-4 w-40 rounded-full bg-primary/80"></div>
                      <div className="mt-3 h-2 w-24 rounded-full bg-outline-variant/60"></div>
                    </div>
                    <div className="rounded-full bg-tertiary-fixed px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-tertiary">
                      ATS ready
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-[1.35fr_0.65fr]">
                    <div className="space-y-3">
                      <div className="h-2 w-full rounded-full bg-outline-variant/30"></div>
                      <div className="h-2 w-11/12 rounded-full bg-outline-variant/30"></div>
                      <div className="h-2 w-4/5 rounded-full bg-outline-variant/30"></div>
                      <div className="mt-5 space-y-2">
                        <div className="h-2 w-full rounded-full bg-outline-variant/25"></div>
                        <div className="h-2 w-5/6 rounded-full bg-outline-variant/25"></div>
                        <div className="h-2 w-4/5 rounded-full bg-outline-variant/25"></div>
                        <div className="h-2 w-3/4 rounded-full bg-outline-variant/25"></div>
                      </div>
                    </div>

                    <div className="space-y-4 rounded-[1rem] bg-surface-container-low p-4">
                      <div className="h-2 w-16 rounded-full bg-outline-variant/30"></div>
                      <div className="space-y-2">
                        <div className="h-10 rounded-xl bg-primary-fixed"></div>
                        <div className="h-10 rounded-xl bg-secondary-fixed"></div>
                        <div className="h-10 rounded-xl bg-tertiary-fixed"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={sectionShell}>
        <div className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h2 className="font-headline text-4xl font-extrabold leading-tight tracking-[-0.04em] text-on-surface md:text-5xl">How one cat changed everything.</h2>
            <p className="mt-3 text-sm leading-7 text-[color:var(--txt2)]">Swipe through Mochii&apos;s journey and see how the product loop moves from panic to a cleaner workflow.</p>
          </div>
          <div className="flex items-center gap-3">
            <RoundRailButton label="Show previous story cards" onClick={() => scrollRail(storyRailRef, 'left', 0.8)} />
            <RoundRailButton label="Show next story cards" onClick={() => scrollRail(storyRailRef, 'right', 0.8)} />
          </div>
        </div>

        <div className="hide-scrollbar flex max-w-full snap-x snap-mandatory gap-6 overflow-x-auto pb-2" ref={storyRailRef}>
          {storyCards.map((card, index) => (
            <article className="grid w-[20rem] flex-none snap-start gap-5 rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/90 p-5 shadow-tactile" key={card.title}>
              <div className={`grid aspect-square place-items-center overflow-hidden rounded-[1.2rem] border border-charcoal/15 ${card.shellClass}`}>
                <img className="h-full w-full object-cover" src={card.image} alt={card.title} loading="lazy" />
              </div>
              <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">{String(index + 1).padStart(2, '0')}</div>
              <p className="font-headline text-xl font-extrabold leading-tight text-on-surface">{card.title}</p>
              {/* <p className="text-sm leading-7 text-[color:var(--txt2)]">{card.copy}</p> */}
            </article>
          ))}

          <article className="flex w-[20rem] flex-none snap-start flex-col items-center justify-center gap-5 rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-coral p-8 text-center shadow-tactile">
            <h3 className="font-headline text-4xl font-extrabold text-white">Write your story</h3>
            <Button className="bg-white text-on-surface hover:text-primary" onClick={openHomeAuth}>Get Started</Button>
          </article>
        </div>
      </section>

      <section className={sectionShell}>
        <div className="mb-10 text-center">
          <h2 className="font-headline text-4xl font-extrabold tracking-[-0.04em] text-on-surface md:text-5xl">Everything you need.</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Badge variant="info">FREE FOREVER</Badge>
            <Badge className="border-tertiary/30 bg-tertiary-fixed text-tertiary">NO WATERMARKS</Badge>
            <Badge variant="accent">ATS-READY</Badge>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map(feature => (
            <article className="grid h-full gap-5 rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/90 p-6 shadow-tactile transition hover:-translate-x-px hover:-translate-y-px" key={feature.title}>
              <div className={`grid size-16 place-items-center rounded-2xl border border-charcoal/20 font-headline text-base font-bold ${feature.toneClass}`}>
                {feature.icon}
              </div>
              <h3 className="font-headline text-2xl font-extrabold leading-tight text-on-surface">{feature.title}</h3>
              <p className="text-sm leading-7 text-[color:var(--txt2)]">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={sectionShell}>
        <div className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-center md:justify-between">
          <h2 className="font-headline text-4xl font-extrabold tracking-[-0.04em] text-on-surface md:text-5xl">Pick your vibe.</h2>
          <div className="flex items-center gap-3">
            <RoundRailButton label="Show previous templates" onClick={() => scrollRail(templateRailRef, 'left', 0.82)} />
            <RoundRailButton label="Show next templates" onClick={() => scrollRail(templateRailRef, 'right', 0.82)} />
          </div>
        </div>

        <div className="hide-scrollbar flex max-w-full snap-x snap-mandatory gap-6 overflow-x-auto pb-2" ref={templateRailRef}>
          {templateItems.map(template => (
            <article className="grid w-[19rem] flex-none snap-start overflow-hidden rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/90 shadow-tactile" key={template.id}>
              <div className="relative bg-surface-container-low px-5 pb-6 pt-5">
                <div className="overflow-hidden rounded-[1.25rem] bg-white p-4 shadow-ambient">
                  {template.previewImageUrl ? (
                    <img className="h-[17rem] w-full rounded-[1rem] object-cover object-top" src={template.previewImageUrl} alt={`${template.name} template preview`} loading="lazy" />
                  ) : null}
                </div>
                <div className="absolute inset-x-0 bottom-3 flex justify-center">
                  <Button className="min-h-9 px-5 py-2 text-[10px]" onClick={openHomeAuth}>Use this template</Button>
                </div>
              </div>

              <div className="grid gap-2 p-5 text-center">
                <h3 className="font-headline text-2xl font-extrabold text-on-surface">{template.badge}</h3>
                <p className="text-sm leading-7 text-[color:var(--txt2)]">{template.bestFor}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={sectionShell}>
        <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="grid gap-5">
            <div className="relative rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/95 p-3 shadow-tactile">
              <div className="grid h-[23rem] place-items-center rounded-[1.4rem] bg-surface-container-low md:h-[30rem]">
                <div className="grid size-48 place-items-center rounded-full bg-primary-fixed md:size-60">
                  <img className="h-28 w-28 object-contain md:h-36 md:w-36" src="/Images/Prof_Mochii.png" alt="Professor Mochii illustration" loading="lazy" />
                </div>
              </div>
              <div className="absolute -bottom-6 left-4 right-4 rounded-[1.25rem] border-[1.5px] border-charcoal/75 bg-coral p-5 shadow-tactile md:left-6 md:right-6">
                <p className="font-headline text-lg font-extrabold italic leading-snug text-white md:text-xl">
                  &quot;Curious about something? I&apos;ve got the answers right here, human.&quot;
                </p>
                <p className="mt-2 text-sm font-black text-white">- Professor Mochii</p>
              </div>
            </div>
            <div className="h-10 lg:hidden"></div>
          </div>

          <div>
            <h2 className="mb-8 font-headline text-4xl font-extrabold tracking-[-0.04em] text-on-surface md:text-5xl">Got questions?</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => {
                const open = openFaqIndex === index;

                return (
                  <article className="overflow-hidden rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/90 shadow-tactile" key={faq.question}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left md:px-8 md:py-6"
                      onClick={() => setOpenFaqIndex(open ? null : index)}
                      aria-expanded={open}
                      aria-controls={`home-faq-answer-${index}`}
                    >
                      <span className="font-headline text-xl font-extrabold text-on-surface">{faq.question}</span>
                      <span className="text-xl font-bold text-[color:var(--txt1)]">{open ? '\u2212' : '+'}</span>
                    </button>
                    {open ? (
                      <div className="border-t border-outline-variant/30 px-6 py-5 md:px-8 md:py-6" id={`home-faq-answer-${index}`}>
                        <p className="text-sm leading-7 text-[color:var(--txt2)]">{faq.answer}</p>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
