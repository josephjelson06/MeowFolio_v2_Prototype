import { Button } from 'components/ui/Button';
import { routes } from 'lib/routes';

export function NotFoundPage() {
  return (
    <section className="pub-panel pub-error-grid pub-notfound-core">
      <article className="pub-error-card pub-notfound-card">
        <div className="pub-error-code pub-notfound-code">404</div>
        <div className="pub-section-title pub-error-title">That page wandered off.</div>
        <div className="pub-text pub-error-copy">The route you opened doesn&apos;t exist in the current meowfolio flow. If this came from an older link, the product likely moved on while the cat kept working.</div>
        <div className="pub-error-actions">
          <Button to={routes.home}>Back Home</Button>
        </div>
      </article>

      <article className="pub-error-card pub-notfound-side">
        <div className="section-label pub-error-label">NEXT STEP</div>
        <div className="pub-section-title">The workspace is still one click away.</div>
        <div className="pub-text pub-error-copy">Start again from Home or jump into the About page. The main workspace flow is still intact.</div>
        <div className="pub-error-actions">
          <Button to={routes.about} variant="secondary">Open About</Button>
        </div>
      </article>
    </section>
  );
}
