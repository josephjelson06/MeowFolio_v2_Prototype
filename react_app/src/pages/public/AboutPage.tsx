import { Badge } from 'components/ui/Badge';
import { Button } from 'components/ui/Button';
import { useAuthModal } from 'hooks/useAuthModal';
import { routes } from 'lib/routes';

export function AboutPage() {
  const { openAuth } = useAuthModal();

  function openAboutAuth() {
    openAuth({
      copy: 'The About page now lives inside the same prototype system as the rest of resumeai. Sign in here and continue directly into the workspace flow.',
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
      <section className="pub-panel pub-about-grid">
        <div>
          <div className="pub-copy-badges">
            <Badge variant="accent">ABOUT THE PRODUCT</Badge>
            <Badge variant="info">SAME WORKSPACE DNA</Badge>
            <Badge>STUDENT-FIRST</Badge>
          </div>
          <div className="pub-headline">Built with a student mindset for a <span className="accent">real resume loop.</span></div>
          <div className="pub-text pub-home-hero-copy">resumeai is meant to feel like one product from first visit to final export. The public side explains the promise. The dashboard, resumes, editor, ATS checks, and JD matching deliver the actual workflow.</div>
          <div className="pub-text">That is why this page now uses the same product language as the logged-in prototype instead of drifting into a detached marketing layout.</div>
          <div className="pub-chip-row">
            <Badge>TeX-backed output</Badge>
            <Badge>Shared resume state</Badge>
            <Badge>Calmer first-time UX</Badge>
          </div>
          <div className="pub-action-row">
            <Button onClick={openAboutAuth}>Start with Google</Button>
            <Button to={routes.home} variant="secondary">Back to Home</Button>
          </div>
        </div>

        <div className="pub-image-panel">
          <img src="/Images/Graduation_Day.png" alt="Graduation day image representing the builder journey" />
          <div className="pub-image-note">Graduation Day anchors the public story inside the same product family.</div>
        </div>
      </section>

      <section className="pub-panel">
        <div className="pub-section-head">
          <div>
            <div className="section-label pub-label-tight">MISSION</div>
            <div className="pub-section-title">Make resume tooling feel more approachable without watering it down.</div>
            <div className="pub-section-desc">The product keeps the serious parts serious: cleaner output, stronger structure, and a shared loop between editing, analysis, and export.</div>
          </div>
        </div>
        <div className="pub-grid-3">
          <article className="pub-feature-card">
            <div className="pub-icon">FR</div>
            <div className="pub-card-title">Always free</div>
            <div className="pub-card-copy">The public entry stays lightweight so early-career users can get into the real workflow without pricing friction in the prototype.</div>
          </article>
          <article className="pub-feature-card">
            <div className="pub-icon">ST</div>
            <div className="pub-card-title">Student-first</div>
            <div className="pub-card-copy">Copy, pacing, and product surfaces are tuned for users who need structure and confidence more than complexity.</div>
          </article>
          <article className="pub-feature-card">
            <div className="pub-icon">OK</div>
            <div className="pub-card-title">Honest by default</div>
            <div className="pub-card-copy">The workflow is designed to improve clarity and fit, not to encourage keyword stuffing or fake polish.</div>
          </article>
        </div>
      </section>

      <section className="pub-panel">
        <div className="pub-section-head">
          <div>
            <div className="section-label pub-label-tight">WHY TEX</div>
            <div className="pub-section-title">Serious output without asking users to think like typesetters.</div>
            <div className="pub-section-desc">TeX stays behind the curtain. Users work with structured content, template choices, and analysis, not brittle document formatting.</div>
          </div>
        </div>
        <div className="pub-grid-3">
          <article className="pub-feature-card">
            <div className="pub-icon">PX</div>
            <div className="pub-card-title">Pixel-stable output</div>
            <div className="pub-card-copy">Typography, spacing, and layout stay more predictable than ad hoc Word editing.</div>
          </article>
          <article className="pub-feature-card">
            <div className="pub-icon">AT</div>
            <div className="pub-card-title">ATS-safe structure</div>
            <div className="pub-card-copy">The app keeps resume content in one schema, so preview, ATS, JD matching, and output stay aligned.</div>
          </article>
          <article className="pub-feature-card">
            <div className="pub-icon">LP</div>
            <div className="pub-card-title">Shared product loop</div>
            <div className="pub-card-copy">The same resume follows the user across the editor, matching, score views, and saved libraries.</div>
          </article>
        </div>
      </section>

      <section className="pub-panel pub-builder-grid">
        <article className="pub-quote-card">
          <div className="pub-builder-photo">
            <img src="/Images/DP.jpg" alt="Profile photo of the builder" loading="lazy" />
          </div>
          <div className="section-label pub-label-tight">BUILDER</div>
          <div className="pub-card-title">The human behind the prototype.</div>
          <div className="pub-card-copy">The direction here is intentionally practical: build the actual resume loop first, then grow the public-facing pages so they feel like the same product, not a different site.</div>
        </article>

        <div>
          <div className="pub-copy-badges">
            <Badge variant="accent">SOLO BUILD</Badge>
            <Badge variant="info">PRODUCT-FIRST</Badge>
          </div>
          <div className="pub-section-title pub-builder-title">One important workflow should feel coherent from end to end.</div>
          <div className="pub-text pub-home-hero-copy">resumeai is not trying to be every job tool at once. It is trying to make one high-friction path feel connected: write a stronger resume, preview it clearly, inspect ATS feedback, compare it with a JD, and keep iterating without losing context.</div>
          <div className="pub-text">That is why the About page now sits inside the same visual system as the workspace instead of breaking away into a separate language.</div>
          <div className="pub-action-row">
            <Button onClick={openAboutAuth}>Enter the Workspace</Button>
          </div>
        </div>
      </section>
    </>
  );
}
