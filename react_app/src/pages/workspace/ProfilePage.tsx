import { Card } from 'components/ui/Card';
import { Button } from 'components/ui/Button';
import { Badge } from 'components/ui/Badge';
import { ProgressBar } from 'components/ui/ProgressBar';
import { profileService } from 'services/profileService';

export function ProfilePage() {
  const summary = profileService.getSummary();
  const usage = profileService.getUsage();

  return (
    <div className="ra-page-stack">
      <div className="ra-page-header">
        <div className="section-label">PROFILE</div>
        <h1 className="ra-card-title">Account essentials only.</h1>
      </div>

      <section className="ra-profile-grid">
        <Card>
          <div className="ra-avatar-panel">
            <div className="ra-avatar-circle">AK</div>
            <div className="ra-stack-sm">
              <h2 className="ra-card-title">{summary.name}</h2>
              <p className="ra-card-copy">{summary.email}</p>
            </div>
            <div className="ra-chip-row">
              <Badge variant="accent">{summary.plan}</Badge>
              <Badge>Member since {summary.memberSince}</Badge>
            </div>
            <Button variant="secondary">Logout</Button>
          </div>
        </Card>

        <Card>
          <div className="ra-stack-lg">
            <div className="section-label">USAGE DETAILS</div>
            <div className="ra-usage-list">
              {usage.map(item => {
                const value = Math.round((item.used / item.total) * 100);
                return (
                  <div className="ra-usage-item" key={item.label}>
                    <div className="ra-report-hero">
                      <span>{item.label}</span>
                      <span>{item.used}/{item.total}</span>
                    </div>
                    <ProgressBar value={value} />
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
