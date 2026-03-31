import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';
import { routes } from 'lib/routes';

export function Error500Page() {
  return (
    <div className="ra-page-stack">
      <Card>
        <div className="ra-split-hero">
          <div className="ra-hero-copy">
            <div className="section-label">500</div>
            <h1 className="ra-page-title">Something broke in the stack.</h1>
            <p className="ra-subtitle">This page represents the error surface only. The React migration keeps it inside the same public layout so error states do not feel like a separate product.</p>
            <div className="ra-actions">
              <Button to={routes.home}>Back home</Button>
              <Button to={routes.error500} variant="secondary">Stay on 500</Button>
            </div>
          </div>
          <div className="ra-image-frame">
            <img src="/Images/Prof_Mochii.png" alt="Professor Mochii illustration" />
          </div>
        </div>
      </Card>
    </div>
  );
}
