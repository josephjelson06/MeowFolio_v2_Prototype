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
    copy: 'The first draft is always messy. What matters is having one calm place to begin.',
    image: '/Images/Scene1.jpg',
    shellClass: 'pub-home-story-media-cream',
  },
  {
    title: 'Sent 47 resumes to top tech companies.',
    copy: 'Volume is easy. Useful iteration and cleaner signals are the hard part.',
    image: '/Images/Scene2.jpg',
    shellClass: 'pub-home-story-media-lavender',
  },
  {
    title: '47 rejections. Not enough experience in napping.',
    copy: 'When formatting and structure fall apart, every rejection feels heavier than it should.',
    image: '/Images/Scene3.png',
    shellClass: 'pub-home-story-media-cream',
  },
  {
    title: 'Discovers meowfolio. A glimmer of hope.',
    copy: 'The public side should feel like the same product world, not a separate brochure.',
    image: '/Images/Scene4.jpg',
    shellClass: 'pub-home-story-media-coral',
  },
  {
    title: 'Builds a professional resume in one workspace.',
    copy: 'Import, refine, preview, and export while ATS and JD tools stay connected to the same data.',
    image: '/Images/Scene5.jpg',
    shellClass: 'pub-home-story-media-mint',
  },
  {
    title: 'Hired. Senior Treat Officer at Global Meow Inc.',
    copy: 'A better workflow does not guarantee outcomes, but it gives the work a fairer shot.',
    image: '/Images/Scene6.jpg',
    shellClass: 'pub-home-story-media-cream',
  },
] as const;

const features = [
  {
    title: 'Build from Scratch',
    description: 'The editor writes directly into the canonical resume schema and updates the live canvas as you type.',
    icon: 'NEW',
    toneClass: 'pub-home-feature-icon-coral',
  },
  {
    title: 'Import & Refine',
    description: 'Paste resume text or upload `.txt`, `.md`, `.pdf`, and `.docx` files, then clean everything up in one workspace.',
    icon: 'IN',
    toneClass: 'pub-home-feature-icon-mint',
  },
  {
    title: 'Compile, Match & Score',
    description: 'Generate a TeX-backed PDF, then inspect ATS output health and JD evidence against the same shared resume state.',
    icon: 'OUT',
    toneClass: 'pub-home-feature-icon-lavender',
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
      copy: 'The public pages now live inside the same prototype system as the rest of the app. Sign in here and continue directly into the existing dashboard flow.',
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
      <section className="pub-panel pub-home-hero-core">
        <div className="pub-home-hero-orb pub-home-hero-orb-left"></div>
        <div className="pub-home-hero-orb pub-home-hero-orb-right"></div>

        <div className="pub-home-hero-grid-core">
          <div className="pub-home-copy-core">
            <Badge variant="info" className="pub-home-eyebrow">FREE FOREVER. NO WATERMARKS.</Badge>

            <h1 className="pub-home-title-core">
              Build resumes that <span className="pub-home-title-accent">actually</span> get read.
            </h1>

            <div className="pub-home-copy-stack">
              <p className="pub-home-lead-core">Even a cat got hired. You&apos;re next.</p>
              <p className="pub-home-body-core">
                Build the resume in one workspace, generate TeX-backed PDFs, and carry the same structured profile into ATS and JD analysis without jumping between disconnected tools.
              </p>
            </div>

            <div className="pub-home-cta-row">
              <Button onClick={openHomeAuth} className="pub-home-cta-primary">Get Started</Button>
              <Button to={routes.about} variant="secondary" className="pub-home-cta-secondary">Read the story</Button>
            </div>
          </div>

          <div className="pub-home-hero-art">
            <div className="pub-home-hero-art-shadow"></div>
            <div className="pub-home-hero-doc">
              <div className="pub-home-hero-doc-inner">
                <div className="pub-home-doc-head">
                  <div>
                    <div className="pub-home-doc-title"></div>
                    <div className="pub-home-doc-subtitle"></div>
                  </div>
                  <div className="pub-home-doc-pill">ATS READY</div>
                </div>

                <div className="pub-home-doc-grid">
                  <div className="pub-home-doc-copy">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>

                  <div className="pub-home-doc-side">
                    <span className="pub-home-doc-panel pub-home-doc-panel-coral"></span>
                    <span className="pub-home-doc-panel pub-home-doc-panel-lavender"></span>
                    <span className="pub-home-doc-panel pub-home-doc-panel-mint"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pub-panel pub-home-story-core">
        <div className="pub-home-section-head">
          <h2 className="pub-home-section-title">How one cat changed everything.</h2>
          <p className="pub-home-section-meta">Swipe through Mochii&apos;s journey &#8594;</p>
        </div>

        <div className="pub-home-rail" ref={storyRailRef}>
          {storyCards.map((card, index) => (
            <article className="pub-home-story-shell" key={card.title}>
              <div className={`pub-home-story-media-shell ${card.shellClass}`}>
                <img src={card.image} alt={card.title} loading="lazy" />
              </div>
              <p className="pub-home-story-title">{card.title}</p>
              <p className="pub-home-story-copy">{card.copy}</p>
              <div className="pub-home-story-step">{String(index + 1).padStart(2, '0')}</div>
            </article>
          ))}

          <article className="pub-home-story-cta">
            <h3>Write your story</h3>
            <Button onClick={openHomeAuth} className="pub-home-story-cta-btn">Get Started</Button>
          </article>
        </div>

        <div className="pub-home-rail-controls">
          <button type="button" className="pub-home-round-btn" onClick={() => scrollRail(storyRailRef, 'left', 0.8)} aria-label="Show previous story cards">&#8592;</button>
          <button type="button" className="pub-home-round-btn" onClick={() => scrollRail(storyRailRef, 'right', 0.8)} aria-label="Show next story cards">&#8594;</button>
        </div>
      </section>

      <section className="pub-panel pub-home-capabilities-core">
        <div className="pub-home-cap-header">
          <h2 className="pub-home-section-title">Everything you need.</h2>
          <div className="pub-home-cap-chips">
            <Badge variant="info">FREE FOREVER</Badge>
            <Badge className="pub-home-success-badge">NO WATERMARKS</Badge>
            <Badge variant="accent">ATS-READY</Badge>
          </div>
        </div>

        <div className="pub-home-feature-grid">
          {features.map(feature => (
            <article className="pub-home-feature-card" key={feature.title}>
              <div className={`pub-home-feature-icon ${feature.toneClass}`}>{feature.icon}</div>
              <h3 className="pub-home-feature-title">{feature.title}</h3>
              <p className="pub-home-feature-copy">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="pub-panel pub-home-template-core">
        <div className="pub-home-template-head">
          <h2 className="pub-home-section-title">Pick your vibe.</h2>
          <div className="pub-home-rail-controls">
            <button type="button" className="pub-home-round-btn" onClick={() => scrollRail(templateRailRef, 'left', 0.82)} aria-label="Show previous templates">&#8592;</button>
            <button type="button" className="pub-home-round-btn" onClick={() => scrollRail(templateRailRef, 'right', 0.82)} aria-label="Show next templates">&#8594;</button>
          </div>
        </div>

        <div className="pub-home-template-rail" ref={templateRailRef}>
          {templateItems.map(template => (
            <article className="pub-home-template-card" key={template.id}>
              <div className="pub-home-template-preview-shell">
                <div className="pub-home-template-preview-frame">
                  {template.previewImageUrl ? (
                    <img src={template.previewImageUrl} alt={`${template.name} template preview`} className="pub-home-template-preview-img" loading="lazy" />
                  ) : null}
                </div>
                <div className="pub-home-template-action">
                  <Button onClick={openHomeAuth} className="pub-home-template-btn">Use this template</Button>
                </div>
              </div>

              <div className="pub-home-template-meta">
                <h3 className="pub-home-template-title">{template.badge}</h3>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="pub-panel pub-home-faq-core">
        <div className="pub-home-faq-grid">
          <div className="pub-home-faq-visual">
            <div className="pub-home-faq-visual-card">
              <div className="pub-home-faq-visual-circle">
                <img src="/Images/Prof_Mochii.png" alt="Professor Mochii illustration" loading="lazy" />
              </div>
            </div>
            <div className="pub-home-faq-quote">
              <p>&quot;Curious about something? I&apos;ve got the answers right here, human.&quot;</p>
              <span>- Professor Mochii</span>
            </div>
          </div>

          <div className="pub-home-faq-copy">
            <h2 className="pub-home-section-title">Got questions?</h2>
            <div className="pub-home-faq-list">
              {faqs.map((faq, index) => {
                const open = openFaqIndex === index;

                return (
                  <article className={`pub-home-faq-item${open ? ' open' : ''}`} key={faq.question}>
                    <button
                      type="button"
                      className="pub-home-faq-trigger"
                      onClick={() => setOpenFaqIndex(open ? null : index)}
                      aria-expanded={open}
                      aria-controls={`home-faq-answer-${index}`}
                    >
                      <span>{faq.question}</span>
                      <span>{open ? '\u2212' : '+'}</span>
                    </button>
                    {open ? (
                      <div className="pub-home-faq-answer" id={`home-faq-answer-${index}`}>
                        <p>{faq.answer}</p>
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
