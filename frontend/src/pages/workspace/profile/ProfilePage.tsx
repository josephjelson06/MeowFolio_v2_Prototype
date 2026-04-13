import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from 'lib/cn';
import { routes } from 'app/router/routes';
import { WorkspaceBadge } from 'components/workspace/WorkspaceBadge';
import { WorkspaceShell } from 'components/workspace/WorkspaceShell';
import { profileService } from 'services/profileService';
import { useSession } from 'state/session/sessionContext';
import type { ProfileSummary, UsageMetric } from 'types/ui';

type ProfileActionVariant = 'primary' | 'secondary' | 'link' | 'danger';
type ProfileActionSize = 'sm' | 'md' | 'lg';

function ProfileAction({
  children,
  className,
  onClick,
  size = 'md',
  to,
  variant = 'primary',
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  size?: ProfileActionSize;
  to?: string;
  variant?: ProfileActionVariant;
}) {
  const sizeClass =
    size === 'lg'
      ? 'min-h-[3.5rem] px-7 py-3.5 text-base'
      : size === 'md'
        ? 'min-h-12 px-6 py-3 text-sm'
        : 'min-h-8 px-3 py-1.5 text-[10px]';
  const variantClass =
    variant === 'primary'
      ? 'bg-white/95 text-on-surface hover:bg-surface-container-low hover:text-primary hover:shadow-tactile'
      : variant === 'secondary'
        ? 'bg-white/85 text-[color:var(--txt1)] hover:bg-white hover:text-on-surface hover:shadow-tactile'
        : variant === 'danger'
          ? 'border-error/40 bg-error-container/70 text-error hover:bg-error-container hover:text-error'
          : 'border-charcoal/65 bg-white/80 text-[color:var(--txt1)] hover:bg-white hover:text-on-surface hover:shadow-tactile-sm';
  const actionClass = cn(
    'inline-flex items-center justify-center gap-2 rounded-full border-2 border-charcoal text-center font-headline font-bold tracking-[0.01em] transition duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
    'shadow-tactile-sm hover:-translate-x-px hover:-translate-y-px active:translate-x-px active:translate-y-px active:shadow-none',
    sizeClass,
    variantClass,
    className,
  );

  if (to) {
    return (
      <Link className={actionClass} to={to}>
        {children}
      </Link>
    );
  }

  return (
    <button className={actionClass} type="button" onClick={onClick}>
      {children}
    </button>
  );
}

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
    <WorkspaceShell title="Profile">
      <div className="grid gap-6">
        <section className="flex flex-col gap-4 rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/85 p-5 shadow-tactile md:flex-row md:items-center md:gap-6 md:p-6">
          <div className="grid size-16 shrink-0 place-items-center rounded-full border border-outline bg-surface text-xl font-semibold text-secondary">{initials}</div>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap gap-2">
              <WorkspaceBadge variant="accent">{summary.plan.toUpperCase()}</WorkspaceBadge>
              <WorkspaceBadge variant="info">{`MEMBER SINCE ${summary.memberSince.toUpperCase()}`}</WorkspaceBadge>
            </div>
            <div className="font-headline text-xl font-extrabold text-on-surface">{actor?.name ?? summary.name}</div>
            <div className="mt-1 text-sm text-[color:var(--txt2)]">{actor?.email ?? summary.email}</div>
          </div>
          <ProfileAction variant="danger" to={routes.home}>
            Logout
          </ProfileAction>
        </section>

        <section className="rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/85 p-5 shadow-tactile md:p-6">
          <div className="mb-4 font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface">Usage details</div>
          {usage.map((item, index) => {
            const value = Math.round((item.used / item.total) * 100);
            return (
              <div className={index > 0 ? 'mt-4' : ''} key={item.label}>
                <div className="mb-2 flex items-center justify-between text-sm text-[color:var(--txt1)]">
                  <span>{item.label}</span>
                  <span className="font-headline text-sm font-semibold">
                    {item.used} / {item.total}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-surface-container-high">
                  <div className="h-1.5 rounded-full bg-primary" style={{ width: `${value}%` }}></div>
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </WorkspaceShell>
  );
}
