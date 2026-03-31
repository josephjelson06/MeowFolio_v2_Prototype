import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';
import { routes } from 'lib/routes';

export function NotFoundPage() {
  return (
    <div className="ra-page-stack">
      <Card>
        <div className="ra-split-hero">
          <div className="ra-hero-copy">
            <div className="section-label">404</div>
            <h1 className="ra-page-title">This page wandered off the resume trail.</h1>
            <p className="ra-subtitle">The route is missing, but the rest of the product is intact. Head back to the public entry or jump straight into the workspace routes.</p>
            <div className="ra-actions">
              <Button to={routes.home}>Back home</Button>
              <Button to={routes.dashboard} variant="secondary">Open dashboard</Button>
            </div>
          </div>
          <div className="ra-image-frame">
            <img src="/Images/Mochii.png" alt="Mochii illustration" />
          </div>
        </div>
      </Card>
    </div>
  );
}
