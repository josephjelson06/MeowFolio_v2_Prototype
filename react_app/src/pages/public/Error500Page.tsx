import { Badge } from 'components/ui/Badge';
import { Button } from 'components/ui/Button';
import { routes } from 'lib/routes';

export function Error500Page() {
  return (
    <section className="pub-panel pub-error-grid">
      <article className="pub-error-card">
        <div className="pub-copy-badges">
          <Badge variant="accent">500</Badge>
          <Badge variant="info">WORKSPACE ISSUE</Badge>
        </div>
        <div className="pub-error-code warn">500</div>
        <div className="pub-section-title pub-error-title">The workspace hit a temporary snag.</div>
        <div className="pub-text pub-error-copy">This state stands in for a failed render, parse, or analysis request. It still lives inside the same product family, so the fallback feels like a part of resumeai instead of a disconnected dead-end page.</div>
        <div className="pub-error-actions">
          <Button to={routes.home}>Return Home</Button>
          <Button to={routes.about} variant="secondary">Read About</Button>
        </div>
      </article>

      <article className="pub-panel">
        <div className="section-label pub-error-label">STATUS</div>
        <div className="pub-section-title">When this clears, the same workflow is waiting.</div>
        <div className="pub-text pub-error-copy">Once the issue is gone, the user lands back in the same dashboard, resumes, editor, JD, and profile loop. The 500 page now matches that environment in layout, tone, and navigation.</div>
        <div className="pub-chip-row">
          <Badge>Dashboard</Badge>
          <Badge>Editor</Badge>
          <Badge>JD Analysis</Badge>
        </div>
      </article>
    </section>
  );
}
