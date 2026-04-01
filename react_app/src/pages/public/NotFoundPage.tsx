import { Badge } from 'components/ui/Badge';
import { Button } from 'components/ui/Button';
import { useAuthModal } from 'hooks/useAuthModal';
import { routes } from 'lib/routes';

export function NotFoundPage() {
  const { openAuth } = useAuthModal();

  function open404Auth() {
    openAuth({
      copy: 'Even the 404 page now uses the same entry pattern as the rest of resumeai, so the public fallback still leads back into the same workspace.',
      accent: 'GOOGLE ONLY',
      info: 'SHARED ENTRY',
      outline: 'RETURN TO FLOW',
      previewTitle: 'Same product language',
      previewCopy: 'The missing-page fallback now shares the same mobile layout and component treatment as Home, About, and the logged-in prototype.',
      note: 'If this was an old bookmark, start from Home and continue from there.',
    });
  }

  return (
    <section className="pub-panel pub-error-grid">
      <article className="pub-error-card">
        <div className="pub-copy-badges">
          <Badge variant="accent">404</Badge>
          <Badge>MISSING PAGE</Badge>
        </div>
        <div className="pub-error-code">404</div>
        <div className="pub-section-title pub-error-title">That page wandered off.</div>
        <div className="pub-text pub-error-copy">The route may be outdated, mistyped, or part of an earlier prototype pass. The important part is that this error page still feels like the same product family as the dashboard and public pages.</div>
        <div className="pub-error-actions">
          <Button to={routes.home}>Back Home</Button>
          <Button to={routes.about} variant="secondary">Open About</Button>
          <Button variant="secondary" onClick={open404Auth}>Sign in</Button>
        </div>
      </article>

      <article className="pub-panel">
        <div className="section-label pub-error-label">NEXT STEP</div>
        <div className="pub-section-title">The workspace is still one click away.</div>
        <div className="pub-text pub-error-copy">If you landed here from an old link, return to Home or continue with Google. The rest of the prototype still uses the same tokens and navigation rhythm.</div>
        <div className="pub-chip-row">
          <Badge>Home</Badge>
          <Badge>About</Badge>
          <Badge>Dashboard</Badge>
        </div>
      </article>
    </section>
  );
}
