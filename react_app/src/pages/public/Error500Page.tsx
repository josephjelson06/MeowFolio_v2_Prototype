// import { Badge } from 'components/ui/Badge';
import { Button } from 'components/ui/Button';
import { routes } from 'lib/routes';

export function Error500Page() {
  return (
    <section className="pub-panel pub-error-grid pub-error500-core">
      <article className="pub-error-card pub-error500-card">
        <div className="pub-error-code warn pub-error500-code">500</div>
        <div className="pub-section-title pub-error-title">The workspace hit a temporary snag.</div>
        <div className="pub-text pub-error-copy">Something broke on the way through the product loop. The structure is still here, but this screen couldn&apos;t finish loading cleanly.</div>
        <div className="pub-error-actions">
          <Button to={routes.home}>Back Home</Button>
          <Button to={routes.about} variant="secondary">Read About</Button>
        </div>
      </article>

      <article className="pub-error-card pub-error500-side">
        <div className="section-label pub-error-label">STATUS</div>
        <div className="pub-section-title">When this clears, the same workflow is waiting.</div>
        <div className="pub-text pub-error-copy">Once the issue is gone, the user lands back in the same dashboard, resumes, editor, JD, and profile loop. This fallback now shares the same visual system as the rest of meowfolio.</div>
      </article>
    </section>
  );
}
