import { useEffect, useState } from 'react';
import { Button } from 'components/ui/Button';
import { Badge } from 'components/ui/Badge';
import { profileService } from 'services/profileService';
import { routes } from 'lib/routes';
import type { ProfileSummary, UsageMetric } from 'types/ui';

export function ProfilePage() {
  const [summary, setSummary] = useState<ProfileSummary>({
    name: 'Arjun Kumar',
    email: 'arjun@email.com',
    plan: 'Free Plan',
    memberSince: 'Jan 2026',
  });
  const [usage, setUsage] = useState<UsageMetric[]>([]);

  useEffect(() => {
    async function loadProfile() {
      const [nextSummary, nextUsage] = await Promise.all([profileService.getSummary(), profileService.getUsage()]);
      setSummary(nextSummary);
      setUsage(nextUsage);
    }

    loadProfile();
  }, []);

  return (
    <div className="profile-body profile-page">
      <section className="profile-section profile-hero">
        <div className="profile-avatar-big">AK</div>
        <div className="profile-identity">
          <div className="profile-badges">
            <Badge variant="accent">{summary.plan.toUpperCase()}</Badge>
            <Badge variant="info">{`MEMBER SINCE ${summary.memberSince.toUpperCase()}`}</Badge>
          </div>
          <div className="profile-name">{summary.name}</div>
          <div className="profile-email">{summary.email}</div>
        </div>
        <Button className="profile-logout" to={routes.home}>Logout</Button>
      </section>

      <section className="profile-section">
        <div className="profile-section-title">Usage details</div>
        {usage.map((item, index) => {
          const value = Math.round((item.used / item.total) * 100);
          return (
            <div key={item.label}>
              <div className={`usage-row${index > 0 ? ' profile-usage-row' : ''}`}>
                <span>{item.label}</span>
                <span className="profile-usage-value">{item.used} / {item.total}</span>
              </div>
              <div className="usage-track">
                <div className="usage-fill" style={{ width: `${value}%` }}></div>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
