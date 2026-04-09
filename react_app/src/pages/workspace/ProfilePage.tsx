import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { cn } from 'lib/cn';
import { routes } from 'lib/routes';
import { profileService } from 'services/profileService';
import { useSession } from 'state/session/sessionContext';
import type { ProfileSummary, UsageMetric } from 'types/ui';

type ProfileActionVariant = 'primary' | 'secondary' | 'link' | 'danger';
type ProfileActionSize = 'sm' | 'md' | 'lg';
type ProfileBadgeVariant = 'accent' | 'info' | 'outline';

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

function ProfileBadge({
  children,
  className,
  variant = 'outline',
}: {
  children: ReactNode;
  className?: string;
  variant?: ProfileBadgeVariant;
}) {
  const toneClass =
    variant === 'accent'
      ? 'border-primary/40 bg-primary-fixed text-primary'
      : variant === 'info'
        ? 'border-secondary/35 bg-secondary-fixed text-secondary'
        : 'border-charcoal/65 bg-white/80 text-[color:var(--txt2)]';
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full border-[1.5px] px-3 py-1 font-headline text-[9px] font-bold uppercase tracking-[0.12em]',
        toneClass,
        className,
      )}
    >
      {children}
    </span>
  );
}

function profileLinkClass(active: boolean) {
  return cn(
    'inline-flex min-h-10 items-center justify-center rounded-full px-4 text-sm font-bold text-[color:var(--txt1)] transition hover:bg-white/70 hover:text-primary',
    active && 'border-[1.5px] border-charcoal/75 bg-white/85 text-on-surface shadow-tactile-sm',
  );
}

function ProfilePageShell({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  const location = useLocation();
  const { initials } = useSession();
  const resumesActive = location.pathname === routes.resumes || location.pathname === routes.editor;
  const mobileTabClass = (active: boolean) =>
    cn(
      'flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-medium text-[color:var(--txt2)] transition',
      active && 'text-primary',
    );

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-40 hidden min-h-[68px] grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-charcoal/10 bg-background/85 px-4 shadow-[0_8px_24px_rgba(28,28,24,0.05)] backdrop-blur-xl md:grid md:px-8">
        <NavLink className="inline-flex w-max items-center font-headline text-2xl font-extrabold tracking-[-0.03em] text-on-surface" to={routes.dashboard}>
          meowfolio
        </NavLink>
        <div className="flex items-center justify-self-center gap-2">
          <NavLink className={({ isActive }) => profileLinkClass(isActive)} to={routes.dashboard}>
            Dashboard
          </NavLink>
          <NavLink className={profileLinkClass(resumesActive)} to={routes.resumes}>
            Resumes
          </NavLink>
          <NavLink className={({ isActive }) => profileLinkClass(isActive)} to={routes.jds}>
            JDs
          </NavLink>
        </div>
        <div className="justify-self-end">
          <NavLink className="grid size-9 place-items-center rounded-full border-[1.5px] border-charcoal/75 bg-white/85 font-headline text-xs font-bold text-secondary shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:shadow-tactile" to={routes.profile}>
            {initials}
          </NavLink>
        </div>
      </nav>

      <div className="sticky top-0 z-40 flex min-h-[56px] items-center gap-3 border-b border-charcoal/10 bg-background/92 px-4 backdrop-blur-xl md:hidden">
        <NavLink className="inline-flex items-center font-headline text-lg font-extrabold tracking-[-0.03em] text-on-surface" to={routes.dashboard}>
          meowfolio
        </NavLink>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-on-surface">{title}</span>
        <NavLink className="grid size-9 place-items-center rounded-full border-[1.5px] border-charcoal/75 bg-white/85 font-headline text-xs font-bold text-secondary shadow-tactile-sm" to={routes.profile}>
          {initials}
        </NavLink>
      </div>

      <main className="mx-auto w-full max-w-[1220px] px-4 pb-28 pt-7 sm:px-6 lg:px-8">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex min-h-[calc(60px+env(safe-area-inset-bottom))] border-t border-charcoal/10 bg-background/95 px-3 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_18px_rgba(28,28,24,0.05)] backdrop-blur-xl md:hidden" aria-label="Mobile navigation">
        <NavLink className={({ isActive }) => mobileTabClass(isActive)} to={routes.dashboard}>
          <div className="text-base">&#8862;</div>
          <span>Dashboard</span>
        </NavLink>
        <NavLink className={mobileTabClass(resumesActive)} to={routes.resumes}>
          <div className="text-base">&#9776;</div>
          <span>Resumes</span>
        </NavLink>
        <NavLink className={({ isActive }) => mobileTabClass(isActive)} to={routes.jds}>
          <div className="text-base">&#8857;</div>
          <span>JDs</span>
        </NavLink>
        <NavLink className={({ isActive }) => mobileTabClass(isActive)} to={routes.profile}>
          <div className="text-base">&#9675;</div>
          <span>Profile</span>
        </NavLink>
      </nav>
    </div>
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
    <ProfilePageShell title="Profile">
      <div className="grid gap-6">
        <section className="flex flex-col gap-4 rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/85 p-5 shadow-tactile md:flex-row md:items-center md:gap-6 md:p-6">
          <div className="grid size-16 shrink-0 place-items-center rounded-full border border-outline bg-surface text-xl font-semibold text-secondary">{initials}</div>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap gap-2">
              <ProfileBadge variant="accent">{summary.plan.toUpperCase()}</ProfileBadge>
              <ProfileBadge variant="info">{`MEMBER SINCE ${summary.memberSince.toUpperCase()}`}</ProfileBadge>
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
    </ProfilePageShell>
  );
}
