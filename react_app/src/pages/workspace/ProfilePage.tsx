import { useEffect, useState } from 'react';
import { Button } from 'components/ui/Button';
import { Badge } from 'components/ui/Badge';
import { profileService } from 'services/profileService';
import { useSession } from 'state/session/sessionContext';
import { routes } from 'lib/routes';
import type { ProfileSummary, UsageMetric } from 'types/ui';

export function ProfilePage() {
  const { actor, initials } = useSession();
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

    void loadProfile();
  }, []);

  return (
    <div className="grid gap-6">
      <section className="flex flex-col gap-4 rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/85 p-5 shadow-tactile md:flex-row md:items-center md:gap-6 md:p-6">
        <div className="grid size-16 shrink-0 place-items-center rounded-full border border-outline bg-surface text-xl font-semibold text-secondary">{initials}</div>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge variant="accent">{summary.plan.toUpperCase()}</Badge>
            <Badge variant="info">{`MEMBER SINCE ${summary.memberSince.toUpperCase()}`}</Badge>
          </div>
          <div className="font-headline text-xl font-extrabold text-on-surface">{actor?.name ?? summary.name}</div>
          <div className="mt-1 text-sm text-[color:var(--txt2)]">{actor?.email ?? summary.email}</div>
        </div>
        <Button className="border-error/40 bg-error-container/70 text-error hover:bg-error-container hover:text-error" to={routes.home}>Logout</Button>
      </section>

      <section className="rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/85 p-5 shadow-tactile md:p-6">
        <div className="mb-4 font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface">Usage details</div>
        {usage.map((item, index) => {
          const value = Math.round((item.used / item.total) * 100);
          return (
            <div className={index > 0 ? 'mt-4' : ''} key={item.label}>
              <div className="mb-2 flex items-center justify-between text-sm text-[color:var(--txt1)]">
                <span>{item.label}</span>
                <span className="font-headline text-sm font-semibold">{item.used} / {item.total}</span>
              </div>
              <div className="h-1.5 rounded-full bg-surface-container-high">
                <div className="h-1.5 rounded-full bg-primary" style={{ width: `${value}%` }}></div>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
