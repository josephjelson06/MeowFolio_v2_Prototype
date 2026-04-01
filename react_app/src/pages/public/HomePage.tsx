import { useEffect, useState } from 'react';
import { Badge } from 'components/ui/Badge';
import { Button } from 'components/ui/Button';
import { FaqList } from 'components/public/FaqList';
import { StoryRail } from 'components/public/StoryRail';
import { TemplateRail } from 'components/public/TemplateRail';
import { useAuthModal } from 'hooks/useAuthModal';
import { routes } from 'lib/routes';
import { templateService } from 'services/templateService';
import type { TemplateRecord } from 'types/template';

const storyItems = [
  { step: '01', title: 'Mochii starts the job search journey.', copy: 'Every resume process starts with a first draft and a lot of unknowns.', image: '/Images/Scene1.jpg', alt: 'Mochii starting the job search' },
  { step: '02', title: '47 resumes sent to top tech companies.', copy: 'Volume is easy. Useful feedback and clean iteration are the hard part.', image: '/Images/Scene2.jpg', alt: 'Mochii sending resumes' },
  { step: '03', title: '47 rejections. Not enough experience in napping.', copy: 'Bad formatting and weak signal make every rejection feel heavier.', image: '/Images/Scene3.png', alt: 'Mochii facing rejection' },
  { step: '04', title: 'A glimmer of hope appears.', copy: 'The public side now leads users into the same product loop instead of a disconnected landing page.', image: '/Images/Scene4.jpg', alt: 'Mochii finding resumeai' },
  { step: '05', title: 'Builds a purr-fect resume.', copy: 'Import, refine, preview, and export from one coherent workspace.', image: '/Images/Scene5.jpg', alt: 'Mochii building a resume' },
  { step: '06', title: 'Hired as Senior Treat Officer.', copy: 'A better system does not guarantee outcomes, but it gives the work a fairer shot.', image: '/Images/Scene6.jpg', alt: 'Mochii getting hired' },
];

const faqItems = [
  { question: 'Is it really free?', answer: 'The free plan remains visible on the public side, and the product still shows usage-based limits inside the profile page.' },
  { question: 'Does it generate PDFs now?', answer: 'The working prototype already orients itself around TeX-backed output, preview, ATS scoring, and JD analysis once you enter the workspace.' },
  { question: 'Why keep a split public/workspace setup?', answer: 'The public pages build trust and orientation. The dashboard, resumes, editor, JDs, and profile remain the actual product surfaces after sign-in.' },
  { question: 'What stays connected across the app?', answer: 'The same resume state flows through edit, preview, ATS, JD analysis, saved libraries, and export actions.' },
];

export function HomePage() {
  const { openAuth } = useAuthModal();
  const [templateItems, setTemplateItems] = useState<TemplateRecord[]>([]);

  useEffect(() => {
    void templateService.list().then(setTemplateItems);
  }, []);

  function openHomeAuth() {
    openAuth({
      copy: 'The public pages now live inside the same prototype system as the rest of the app. Sign in here and continue directly into the existing dashboard flow.',
      accent: 'GOOGLE ONLY',
      info: 'SAME PRODUCT',
      outline: 'DASHBOARD READY',
      previewTitle: 'One product, one path',
      previewCopy: 'Home, About, 404, 500, and the auth modal now share the same tokens, navigation rhythm, and component language as the logged-in screens.',
      note: 'No extra signup form on this prototype.',
    });
  }

  return (
    <>
      <section className="pub-panel pub-hero-grid">
        <div>
          <div className="pub-copy-badges">
            <Badge variant="accent">PUBLIC ENTRY</Badge>
            <Badge variant="info">GOOGLE ONLY AUTH</Badge>
            <Badge>FREE PLAN VISIBLE</Badge>
          </div>
          <div className="pub-headline">Build resumes that <span className="accent">actually get matched.</span></div>
          <div className="pub-text pub-home-hero-copy">resumeai now sits inside the same product language as the dashboard, editor, resumes, JD matching, and profile flow. The public pages explain the loop. The workspace does the work.</div>
          <div className="pub-action-row">
            <Button onClick={openHomeAuth}>Get Started</Button>
            <Button to={routes.about} variant="secondary">Read the story</Button>
          </div>
          <div className="pub-chip-row">
            <Badge>TeX-backed PDFs</Badge>
            <Badge>ATS + JD analysis</Badge>
            <Badge>Import or start blank</Badge>
          </div>
        </div>

        <div className="pub-image-panel hero">
          <img src="/Images/Mochii.png" alt="Mochii mascot illustration" />
          <div className="pub-image-note">Mochii now anchors the same product family as the rest of the prototype.</div>
        </div>
      </section>

      <section className="pub-panel">
        <StoryRail
          items={storyItems}
          description="The six scene cards now sit directly inside the same product language as the rest of the app, from first-draft panic to a better workflow."
          cta={(
            <article className="pub-story-card cta">
              <div className="pub-story-step">07</div>
              <div className="pub-story-title">Move from public surface to real workspace.</div>
              <div className="pub-story-copy">The dashboard, editor, resumes, JD tools, and profile pages are still the main product. This page just gets you there cleanly.</div>
              <div className="pub-action-row pub-story-cta-actions">
                <Button onClick={openHomeAuth}>Start with Google</Button>
              </div>
            </article>
          )}
        />
      </section>

      <section className="pub-panel">
        <div className="pub-section-head">
          <div>
            <div className="section-label pub-label-tight">CAPABILITIES</div>
            <div className="pub-section-title">Everything you need.</div>
          </div>
        </div>
        <div className="pub-grid-3">
          <article className="pub-feature-card">
            <div className="pub-icon">NEW</div>
            <div className="pub-card-title">Build from scratch</div>
            <div className="pub-card-copy">The editor writes into the same resume schema that powers preview, ATS scoring, and JD matching.</div>
          </article>
          <article className="pub-feature-card">
            <div className="pub-icon">IN</div>
            <div className="pub-card-title">Import and refine</div>
            <div className="pub-card-copy">Paste resume text or upload PDF and DOCX files, then clean everything up in one place.</div>
          </article>
          <article className="pub-feature-card">
            <div className="pub-icon">OUT</div>
            <div className="pub-card-title">Compile, match, and score</div>
            <div className="pub-card-copy">Generate output, inspect ATS feedback, and compare against a saved JD without leaving the product loop.</div>
          </article>
        </div>
      </section>

      <section className="pub-panel">
        <TemplateRail
          items={templateItems.map(item => ({
            copy: item.description,
            id: item.id,
            label: item.badge,
            name: item.name,
            previewImageUrl: item.previewImageUrl,
          }))}
          onUse={openHomeAuth}
        />
      </section>

      <section className="pub-panel pub-faq-grid">
        <article className="pub-quote-card">
          <div className="pub-quote-media">
            <img src="/Images/Prof_Mochii.png" alt="Professor Mochii illustration" loading="lazy" />
          </div>
          <div className="pub-quote-text">"Curious about something? I've got the answers right here, human."</div>
          <div className="badge-outline pub-prof-tag">Professor Mochii</div>
        </article>

        <div>
          <div className="section-label pub-label-tight">FAQ</div>
          <div className="pub-section-title pub-faq-title">Got questions?</div>
          <FaqList items={faqItems} />
        </div>
      </section>
    </>
  );
}
