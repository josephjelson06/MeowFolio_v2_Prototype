import { Badge } from 'components/ui/Badge';
import { Button } from 'components/ui/Button';
import { useAuthModal } from 'hooks/useAuthModal';

export function AboutPage() {
  const { openAuth } = useAuthModal();

  function openAboutAuth() {
    openAuth({
      copy: 'The About page now lives inside the same prototype system as the rest of meowfolio. Sign in here and continue directly into the workspace flow.',
      accent: 'GOOGLE ONLY',
      info: 'SAME PRODUCT',
      outline: 'DASHBOARD READY',
      previewTitle: 'One product, one path',
      previewCopy: 'Home, About, 404, 500, and the auth modal now share the same navigation, mobile treatment, and token system as the workspace.',
      note: 'No separate signup form on this prototype.',
    });
  }

  return (
    <>
      <section className="pub-panel pub-about-hero-core">
        <div className="pub-about-grid pub-about-grid-core">
          <div className="pub-about-copy-core">
            <div className="pub-copy-badges">
              <Badge variant="info" className="pub-about-eyebrow">THE STORY BEHIND MEOWFOLIO</Badge>
            </div>
            <div className="pub-headline pub-about-headline">Built by a student. <span className="accent">For students.</span></div>
            <div className="pub-text pub-about-hero-copy">meowfolio started from the same frustration most early-career people know well: good experience trapped inside bad tooling, awkward documents, and confusing workflow jumps.</div>
            <div className="pub-chip-row pub-about-hero-chips">
              <Badge className="pub-about-chip-mint">TEX-FIRST OUTPUT</Badge>
              <Badge variant="accent">STUDENT-FRIENDLY WORKFLOW</Badge>
              <Badge variant="info">SHARED EDITOR + ATS + JD</Badge>
            </div>
          </div>

          <div className="pub-about-story-card">
            <div className="section-label pub-label-tight">ORIGIN STORY</div>
            <div className="pub-about-story-title">Mochii got tired of bad resumes.</div>
            <div className="pub-text pub-about-story-copy">The original idea was simple: use the power of TeX without making users touch raw TeX, and wrap it in a visual language that feels encouraging instead of sterile.</div>
            <div className="pub-about-story-photo">
              <img src="/Images/Graduation_Day.png" alt="Graduation day image representing the builder journey" />
            </div>
            <div className="pub-about-story-quote">&quot;Resume building should not require a design degree or a broken Word doc.&quot;</div>
          </div>
        </div>
      </section>

      <section className="pub-panel pub-about-mission-core">
        <div className="pub-section-head pub-about-center-head">
          <div>
            <div className="section-label pub-label-tight">MISSION</div>
            <div className="pub-section-title pub-about-wide-title">Make powerful resume tooling feel approachable.</div>
            <div className="pub-section-desc pub-about-center-desc">The product tries to keep the serious parts serious and the intimidating parts softer. That means real structure, real output quality, and a friendlier surface.</div>
          </div>
        </div>
        <div className="pub-grid-3">
          <article className="pub-feature-card pub-about-feature-card">
            <div className="pub-icon pub-about-icon-coral">FR</div>
            <div className="pub-card-title">Always free</div>
            <div className="pub-card-copy">The product stays focused on low-friction resume building instead of pushing people through paywall anxiety.</div>
          </article>
          <article className="pub-feature-card pub-about-feature-card">
            <div className="pub-icon pub-about-icon-mint">ST</div>
            <div className="pub-card-title">Student-first</div>
            <div className="pub-card-copy">The writing guidance, structure, and workflows are built with early-career users in mind.</div>
          </article>
          <article className="pub-feature-card pub-about-feature-card">
            <div className="pub-icon pub-about-icon-lavender">OK</div>
            <div className="pub-card-title">Honest by default</div>
            <div className="pub-card-copy">The product tries to make resumes clearer and stronger without encouraging fake experience or keyword spam.</div>
          </article>
        </div>
      </section>

      <section className="pub-panel pub-about-tex-core">
        <div className="pub-section-head">
          <div>
            <div className="section-label pub-label-tight">WHY TEX</div>
            <div className="pub-section-title">Serious output without making users think like typesetters.</div>
            <div className="pub-section-desc">TeX stays under the hood. The user works with structured resume data, templates, and output controls instead of wrestling a document editor.</div>
          </div>
        </div>
        <div className="pub-grid-3">
          <article className="pub-feature-card pub-about-feature-card">
            <div className="pub-icon pub-about-icon-lavender">PX</div>
            <div className="pub-card-title">Pixel-stable output</div>
            <div className="pub-card-copy">TeX gives us reliable typography, consistent margins, and fewer layout surprises than ad hoc document editing.</div>
          </article>
          <article className="pub-feature-card pub-about-feature-card">
            <div className="pub-icon pub-about-icon-lavender">AT</div>
            <div className="pub-card-title">ATS-safe structure</div>
            <div className="pub-card-copy">The app keeps resume content in a canonical schema so analysis and PDF generation stay aligned.</div>
          </article>
          <article className="pub-feature-card pub-about-feature-card">
            <div className="pub-icon pub-about-icon-lavender">LP</div>
            <div className="pub-card-title">Shared product loop</div>
            <div className="pub-card-copy">The same resume flows through editor, ATS, and JD instead of fragmenting into separate tools.</div>
          </article>
        </div>
      </section>

      <section className="pub-panel pub-builder-grid pub-about-builder-core">
        <article className="pub-quote-card pub-about-builder-photo-card">
          <div className="pub-builder-photo pub-about-builder-photo">
            <img src="/Images/DP.jpg" alt="Profile photo of the builder" loading="lazy" />
          </div>
        </article>

        <div className="pub-about-builder-copy">
          <div className="pub-copy-badges">
            <Badge variant="accent">SOLO BUILD</Badge>
            <Badge variant="info">PRODUCT-FIRST</Badge>
          </div>
          <div className="pub-section-title pub-builder-title">One important workflow should feel coherent from end to end.</div>
          <div className="pub-text pub-home-hero-copy">meowfolio is not trying to be every job tool at once. It is trying to make one important workflow feel coherent: write a better resume, render it well, and understand how it performs.</div>
          <div className="pub-text">That is why the editor, ATS, and JD tools stay connected through the same schema and workspace instead of turning into disconnected screens with different data shapes.</div>
          <div className="pub-action-row">
            <Button onClick={openAboutAuth}>Enter the Workspace</Button>
          </div>
        </div>
      </section>
    </>
  );
}
