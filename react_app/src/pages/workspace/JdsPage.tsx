import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useJdModal } from 'hooks/useJdModal';
import { useViewportMode } from 'hooks/useViewportMode';
import { cn } from 'lib/cn';
import { downloadTextFile } from 'lib/formatters';
import { jdService, type JdReportModel } from 'services/jdService';
import { resumeService } from 'services/resumeService';
import { routes } from 'lib/routes';
import { useSession } from 'state/session/sessionContext';
import type { JdRecord } from 'types/jd';
import type { ResumePickerOption } from 'types/resume';

const JD_PAGE_SIZE = 5;

function getPageForId(items: Array<{ id: string }>, id: string | null) {
  if (!id) return 1;
  const index = items.findIndex(item => item.id === id);
  return index === -1 ? 1 : Math.floor(index / JD_PAGE_SIZE) + 1;
}

const mobileTabClass =
  'flex-1 rounded-full border-2 border-charcoal/70 px-4 py-2 font-headline text-[11px] font-bold uppercase tracking-[0.12em] transition';
const jdActionClass =
  'inline-flex min-h-8 items-center justify-center rounded-full border-2 border-charcoal/70 bg-white/85 px-3 py-1.5 text-[10px] font-semibold text-[color:var(--txt1)] shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:bg-white disabled:pointer-events-none disabled:opacity-40';

function jdShellLinkClass(active: boolean) {
  return cn(
    'inline-flex min-h-10 items-center justify-center rounded-full px-4 text-sm font-bold text-[color:var(--txt1)] transition hover:bg-white/70 hover:text-primary',
    active && 'border-[1.5px] border-charcoal/75 bg-white/85 text-on-surface shadow-tactile-sm',
  );
}

function JdWorkspaceShell({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  const location = useLocation();
  const { initials } = useSession();
  const resumesActive = location.pathname === routes.resumes || location.pathname === routes.editor;
  const mobileNavClass = (active: boolean) =>
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
          <NavLink className={({ isActive }) => jdShellLinkClass(isActive)} to={routes.dashboard}>
            Dashboard
          </NavLink>
          <NavLink className={jdShellLinkClass(resumesActive)} to={routes.resumes}>
            Resumes
          </NavLink>
          <NavLink className={({ isActive }) => jdShellLinkClass(isActive)} to={routes.jds}>
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
        <NavLink className={({ isActive }) => mobileNavClass(isActive)} to={routes.dashboard}>
          <div className="text-base">&#8862;</div>
          <span>Dashboard</span>
        </NavLink>
        <NavLink className={mobileNavClass(resumesActive)} to={routes.resumes}>
          <div className="text-base">&#9776;</div>
          <span>Resumes</span>
        </NavLink>
        <NavLink className={({ isActive }) => mobileNavClass(isActive)} to={routes.jds}>
          <div className="text-base">&#8857;</div>
          <span>JDs</span>
        </NavLink>
        <NavLink className={({ isActive }) => mobileNavClass(isActive)} to={routes.profile}>
          <div className="text-base">&#9675;</div>
          <span>Profile</span>
        </NavLink>
      </nav>
    </div>
  );
}

function JdListPane({
  items,
  activeId,
  totalCount,
  page,
  totalPages,
  onSelect,
  onAdd,
  onPrev,
  onNext,
  onRename,
  onDownload,
  onDelete,
}: {
  items: JdRecord[];
  activeId: string | null;
  totalCount: number;
  page: number;
  totalPages: number;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onPrev: () => void;
  onNext: () => void;
  onRename: (id: string) => void;
  onDownload: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <section className="grid gap-4 rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/90 p-5 shadow-tactile md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="grid gap-1">
          <div className="font-headline text-2xl font-extrabold text-on-surface">Saved JDs</div>
          <div className="font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--txt2)]">
            {totalCount} JDs
          </div>
        </div>
        <button
          className="inline-flex min-h-10 items-center justify-center rounded-full border-2 border-charcoal bg-white/95 px-4 py-2 font-headline text-[11px] font-bold text-on-surface shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:bg-surface-container-low"
          type="button"
          onClick={onAdd}
        >
          + Add JD
        </button>
      </div>

      <div className="grid gap-3">
        {items.length ? (
          items.map(item => (
            <article
              key={item.id}
              className={cn(
                'grid gap-3 rounded-[1.35rem] border px-4 py-4 transition',
                activeId === item.id
                  ? 'border-charcoal/75 bg-surface shadow-tactile-sm'
                  : 'border-outline-variant bg-white/70 hover:-translate-x-px hover:-translate-y-px hover:border-charcoal/55 hover:bg-white',
              )}
              onClick={() => onSelect(item.id)}
            >
              <div className="grid gap-1">
                <div className="font-headline text-lg font-extrabold leading-tight text-on-surface">{item.title}</div>
                <div className="text-sm text-[color:var(--txt2)]">
                  {item.company} · {item.type}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex items-center rounded-full border border-tertiary/30 bg-tertiary-fixed px-3 py-1 font-headline text-[9px] font-bold uppercase tracking-[0.12em] text-tertiary">
                  {item.badge}
                </span>

                <div className="flex flex-wrap gap-2">
                  <button
                    className={jdActionClass}
                    type="button"
                    onClick={event => {
                      event.stopPropagation();
                      onRename(item.id);
                    }}
                  >
                    Rename
                  </button>
                  <button
                    className={jdActionClass}
                    type="button"
                    onClick={event => {
                      event.stopPropagation();
                      onDownload(item.id);
                    }}
                  >
                    Down
                  </button>
                  <button
                    className={cn(jdActionClass, 'border-error/30 bg-error-container/40 text-error hover:bg-error-container')}
                    type="button"
                    onClick={event => {
                      event.stopPropagation();
                      onDelete(item.id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="grid min-h-44 place-items-center rounded-[1.35rem] border border-dashed border-outline bg-surface px-6 py-8 text-center">
            <div className="grid gap-2">
              <div className="text-3xl text-primary">&#8856;</div>
              <div className="text-sm leading-7 text-[color:var(--txt2)]">No saved JDs yet. Add one to begin matching.</div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--txt2)]">
          Page {page} of {totalPages}
        </div>
        <div className="flex flex-wrap gap-2">
          <button className={jdActionClass} type="button" onClick={onPrev} disabled={page === 1}>
            Previous
          </button>
          <button className={jdActionClass} type="button" onClick={onNext} disabled={page === totalPages}>
            Next
          </button>
        </div>
      </div>
    </section>
  );
}

function ResumePickerPane({
  items,
  activeKey,
  onSelect,
}: {
  items: ResumePickerOption[];
  activeKey: string | null;
  onSelect: (key: string) => void;
}) {
  return (
    <div className="grid gap-3 rounded-[1.5rem] border-[1.5px] border-charcoal/75 bg-white/85 p-4 shadow-tactile-sm md:p-5">
      <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Select Resume</div>
      <div className="grid gap-2">
        {items.map(item => (
          <button
            key={item.id}
            className={cn(
              'flex items-center gap-3 rounded-[1.1rem] border px-4 py-3 text-left transition',
              activeKey === item.id
                ? 'border-charcoal/75 bg-surface shadow-tactile-sm'
                : 'border-outline-variant bg-white/70 hover:-translate-x-px hover:-translate-y-px hover:border-charcoal/55 hover:bg-white',
            )}
            type="button"
            onClick={() => onSelect(item.id)}
          >
            <span className={cn('grid size-5 shrink-0 place-items-center rounded-full border', activeKey === item.id ? 'border-primary' : 'border-outline')}>
              <span className={cn('size-2.5 rounded-full', activeKey === item.id ? 'bg-primary' : 'bg-transparent')} />
            </span>
            <span className="text-sm font-semibold text-on-surface">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function scoreToneClass(tone: JdReportModel['scoreTone']) {
  if (tone === 'high') return 'text-tertiary';
  if (tone === 'mid') return 'text-secondary';
  return 'text-primary';
}

function scoreSurfaceClass(tone: JdReportModel['scoreTone']) {
  if (tone === 'high') return 'bg-tertiary-fixed';
  if (tone === 'mid') return 'bg-secondary-fixed';
  return 'bg-primary-fixed';
}

function JdResultPane({
  report,
  selected,
  detailed = false,
  onBackToWorkspace,
}: {
  report: JdReportModel | null;
  selected: boolean;
  detailed?: boolean;
  onBackToWorkspace?: () => void;
}) {
  if (!report) {
    return (
      <div className="grid min-h-[16rem] place-items-center rounded-[1.75rem] border-[1.5px] border-dashed border-outline bg-white/70 px-6 py-8 text-center shadow-tactile-sm">
        <div className="grid max-w-md gap-3">
          <div className="text-4xl text-primary">&#8856;</div>
          <div className="text-sm leading-7 text-[color:var(--txt2)]">
            {selected ? (
              <>
                Select a resume, then click <strong className="text-on-surface">Run Analysis</strong>.
              </>
            ) : (
              'Add a JD to start matching resumes.'
            )}
          </div>
        </div>
      </div>
    );
  }

  const scoreTextClass = scoreToneClass(report.scoreTone);
  const scoreBgClass = scoreSurfaceClass(report.scoreTone);

  if (!detailed) {
    return (
      <div className="grid gap-5 rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/90 p-5 shadow-tactile md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="grid gap-1">
            <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Resume vs Job Description</div>
            <div className="font-headline text-2xl font-extrabold text-on-surface">{report.resumeLabel}</div>
            <div className="text-sm text-[color:var(--txt2)]">
              {report.jd.title} · {report.jd.company}
            </div>
          </div>
          <div className={cn('grid min-w-[7rem] justify-items-center rounded-[1.25rem] border border-charcoal/15 px-4 py-3', scoreBgClass)}>
            <div className={cn('font-headline text-3xl font-extrabold', scoreTextClass)}>{report.score}%</div>
            <div className="font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--txt1)]">match score</div>
          </div>
        </div>

        <div className="h-2 rounded-full bg-charcoal/10">
          <div className={cn('h-2 rounded-full', report.scoreTone === 'high' ? 'bg-tertiary' : report.scoreTone === 'mid' ? 'bg-secondary' : 'bg-primary')} style={{ width: `${report.score}%` }}></div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-3">
            <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-tertiary">Keywords found ({report.found.length})</div>
            <div className="flex flex-wrap gap-2">
              {report.found.map(keyword => (
                <span key={keyword} className="inline-flex items-center rounded-full border border-tertiary/30 bg-tertiary-fixed px-3 py-1 text-[11px] font-semibold text-tertiary">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
          <div className="grid gap-3">
            <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Missing keywords ({report.miss.length})</div>
            <div className="flex flex-wrap gap-2">
              {report.miss.map(keyword => (
                <span key={keyword} className="inline-flex items-center rounded-full border border-primary/30 bg-primary-fixed px-3 py-1 text-[11px] font-semibold text-primary">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-4 rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/90 p-5 shadow-tactile md:p-6">
        <div className={cn('grid size-24 place-items-center rounded-[1.5rem] border border-charcoal/15', scoreBgClass)}>
          <div className={cn('font-headline text-4xl font-extrabold', scoreTextClass)}>{report.score}</div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-headline text-2xl font-extrabold text-on-surface">{report.verdict}</div>
          <div className="mt-1 text-sm leading-7 text-[color:var(--txt2)]">
            {report.resumeLabel} · {report.jd.title} · {report.jd.company}
          </div>
        </div>
        {onBackToWorkspace ? (
          <button
            className="inline-flex min-h-10 items-center justify-center rounded-full border-2 border-charcoal/75 bg-white/90 px-4 py-2 font-headline text-[11px] font-bold shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:bg-white"
            type="button"
            onClick={onBackToWorkspace}
          >
            Back to Workspace
          </button>
        ) : null}
      </div>

      <div className="grid gap-3 rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/90 p-5 shadow-tactile md:p-6">
        {report.metrics.map(metric => (
          <div className="grid gap-2" key={metric.label}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold text-on-surface">{metric.label}</span>
              <span className={cn('font-headline text-sm font-bold', metric.tone === 'accent' ? 'text-tertiary' : 'text-[color:var(--warn)]')}>
                {metric.value}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-charcoal/10">
              <div className={cn('h-2 rounded-full', metric.tone === 'accent' ? 'bg-tertiary' : 'bg-[color:var(--warn)]')} style={{ width: `${metric.value}%` }}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-3 rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/90 p-5 shadow-tactile md:p-6">
        <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Checklist</div>
        {report.checks.map(check => (
          <div className="flex items-start gap-3 text-sm leading-7 text-[color:var(--txt1)]" key={check.text}>
            <span
              className={cn(
                'mt-1 grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-bold',
                check.tone === 'ok'
                  ? 'bg-tertiary-fixed text-tertiary'
                  : check.tone === 'warn'
                    ? 'bg-[color:var(--warn-bg)] text-[color:var(--warn)]'
                    : 'bg-error-container text-error',
              )}
            >
              {check.tone === 'ok' ? 'OK' : check.tone === 'warn' ? '!' : 'X'}
            </span>
            {check.text}
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-3 rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/90 p-5 shadow-tactile md:p-6">
          <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-tertiary">Keywords found ({report.found.length})</div>
          <div className="flex flex-wrap gap-2">
            {report.found.map(keyword => (
              <span key={keyword} className="inline-flex items-center rounded-full border border-tertiary/30 bg-tertiary-fixed px-3 py-1 text-[11px] font-semibold text-tertiary">
                {keyword}
              </span>
            ))}
          </div>
        </div>
        <div className="grid gap-3 rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/90 p-5 shadow-tactile md:p-6">
          <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Missing keywords ({report.miss.length})</div>
          <div className="flex flex-wrap gap-2">
            {report.miss.map(keyword => (
              <span key={keyword} className="inline-flex items-center rounded-full border border-primary/30 bg-primary-fixed px-3 py-1 text-[11px] font-semibold text-primary">
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function JdMobileSheet({
  report,
  open,
  onToggle,
  onOpenDetailed,
}: {
  report: JdReportModel | null;
  open: boolean;
  onToggle: () => void;
  onOpenDetailed: () => void;
}) {
  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 rounded-t-[1.75rem] border-x-[1.5px] border-t-[1.5px] border-charcoal/75 bg-white/95 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.12)] transition-transform duration-300 md:hidden',
        open ? 'translate-y-0' : 'translate-y-[calc(100%-3.75rem)]',
      )}
    >
      <button className="mx-auto mb-3 block h-1.5 w-16 rounded-full bg-outline-variant" type="button" onClick={onToggle} aria-label="Toggle JD sheet"></button>
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="font-headline text-lg font-extrabold text-on-surface">JD Match Report</span>
        <button className="grid size-9 place-items-center rounded-full border border-outline bg-white text-lg text-[color:var(--txt1)]" type="button" onClick={onToggle}>
          X
        </button>
      </div>
      {!report ? (
        <div className="grid gap-3 rounded-[1.25rem] border border-dashed border-outline bg-surface px-4 py-6 text-center">
          <div className="text-3xl text-primary">&#8856;</div>
          <div className="text-sm leading-7 text-[color:var(--txt2)]">Run a JD analysis to preview the report summary here.</div>
        </div>
      ) : (
        <div className="grid gap-4">
          <div className="flex items-end gap-3">
            <span className={cn('font-headline text-5xl font-extrabold', report.scoreTone === 'high' ? 'text-tertiary' : report.scoreTone === 'mid' ? 'text-secondary' : 'text-primary')}>
              {report.score}
            </span>
            <span className="pb-2 text-sm font-semibold text-[color:var(--txt2)]">match score</span>
          </div>
          <div className="text-base font-semibold text-on-surface">{report.verdict}</div>
          <div className="grid gap-3">
            {report.metrics.slice(0, 3).map(metric => (
              <div className="grid gap-2" key={metric.label}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold text-on-surface">{metric.label}</span>
                  <span className={cn('font-headline text-sm font-bold', metric.tone === 'accent' ? 'text-tertiary' : 'text-[color:var(--warn)]')}>
                    {metric.value}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-charcoal/10">
                  <div className={cn('h-2 rounded-full', metric.tone === 'accent' ? 'bg-tertiary' : 'bg-[color:var(--warn)]')} style={{ width: `${metric.value}%` }}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="grid gap-2">
            <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Top matched keywords</div>
            <div className="flex flex-wrap gap-2">
              {report.found.slice(0, 4).map(keyword => (
                <span key={keyword} className="inline-flex items-center rounded-full border border-tertiary/30 bg-tertiary-fixed px-3 py-1 text-[11px] font-semibold text-tertiary">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
          <button
            className="inline-flex min-h-10 items-center justify-center rounded-full border-2 border-charcoal/75 bg-white/90 px-4 py-2 font-headline text-[11px] font-bold shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:bg-white"
            type="button"
            onClick={onOpenDetailed}
          >
            Open detailed JD report
          </button>
        </div>
      )}
    </div>
  );
}

export function JdsPage() {
  const { isMobile } = useViewportMode();
  const { openJd } = useJdModal();
  const [jds, setJds] = useState<Awaited<ReturnType<typeof jdService.list>>>([]);
  const [jdPage, setJdPage] = useState(1);
  const [selectedJdId, setSelectedJdId] = useState<string | null>(null);
  const [selectedResume, setSelectedResume] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<'workspace' | 'report'>('workspace');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [resumeProfiles, setResumeProfiles] = useState<ResumePickerOption[]>([]);
  const [reportState, setReportState] = useState<JdReportModel | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const pageItems = useMemo(() => {
    const start = (jdPage - 1) * JD_PAGE_SIZE;
    return jds.slice(start, start + JD_PAGE_SIZE);
  }, [jdPage, jds]);

  const totalPages = Math.max(1, Math.ceil(jds.length / JD_PAGE_SIZE));
  const selectedJd = useMemo(() => jds.find(item => item.id === selectedJdId) ?? null, [jds, selectedJdId]);

  useEffect(() => {
    async function syncLibraries(preferredJdId?: string | null) {
      const [nextJds, nextProfiles] = await Promise.all([jdService.list(), jdService.getMatchProfiles()]);
      setJds(nextJds);
      setResumeProfiles(nextProfiles);

      setSelectedJdId(current => {
        const candidate = preferredJdId ?? current;
        const nextSelected = candidate && nextJds.some(item => item.id === candidate) ? candidate : nextJds[0]?.id ?? null;
        setJdPage(getPageForId(nextJds, nextSelected));
        return nextSelected;
      });

      setSelectedResume(current => (current && nextProfiles.some(item => item.id === current) ? current : nextProfiles[0]?.id ?? null));
    }

    void syncLibraries();

    function handleJdChange(event: Event) {
      const customEvent = event as CustomEvent<{ id?: string }>;
      setReportState(null);
      setMobileView('workspace');
      setSheetOpen(false);
      void syncLibraries(customEvent.detail?.id ?? null);
    }

    function handleResumeChange() {
      void syncLibraries();
    }

    window.addEventListener(jdService.eventName, handleJdChange as EventListener);
    window.addEventListener(resumeService.eventName, handleResumeChange);
    return () => {
      window.removeEventListener(jdService.eventName, handleJdChange as EventListener);
      window.removeEventListener(resumeService.eventName, handleResumeChange);
    };
  }, []);

  useEffect(() => {
    if (!jds.length) {
      setSelectedJdId(null);
      setReportState(null);
      return;
    }

    if (!jds.find(item => item.id === selectedJdId)) {
      setSelectedJdId(jds[0].id);
    }
  }, [jds, selectedJdId]);

  useEffect(() => {
    if (!isMobile) {
      setMobileView('workspace');
      setSheetOpen(false);
    }
  }, [isMobile]);

  async function runAnalysis() {
    if (!selectedResume || !selectedJdId) return;
    try {
      setAnalyzing(true);
      const nextReport = await jdService.buildReport(selectedResume, selectedJdId);
      if (!nextReport) return;
      setReportState(nextReport);
      if (isMobile) {
        setMobileView('workspace');
        setSheetOpen(true);
      }
    } finally {
      setAnalyzing(false);
    }
  }

  async function renameJd(id: string) {
    const jd = await jdService.getById(id);
    if (!jd) return;
    const nextName = window.prompt('Edit JD name', jd.title);
    if (!nextName || !nextName.trim()) return;
    setJds(await jdService.rename(id, nextName.trim()));
  }

  async function downloadJd(id: string) {
    const jd = await jdService.getById(id);
    if (!jd) return;
    downloadTextFile(`${jd.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_jd.txt`, jd.parsedText);
  }

  async function deleteJd(id: string) {
    const next = await jdService.remove(id);
    setJds(next);

    if (reportState?.jd.id === id) {
      setReportState(null);
    }

    const nextSelected = next.find(item => item.id === selectedJdId) ? selectedJdId : next[0]?.id ?? null;
    setSelectedJdId(nextSelected);
    setJdPage(current => Math.min(current, Math.max(1, Math.ceil(next.length / JD_PAGE_SIZE))));
    setSheetOpen(false);
  }

  const analyzeTitle = selectedJd ? `${selectedJd.title} - ${selectedJd.company}` : 'No saved JDs';
  const analyzeSubtitle = selectedJd
    ? 'Choose a resume and run the same match workflow across desktop and mobile.'
    : 'Add a JD from the list to continue matching resumes.';

  return (
    <JdWorkspaceShell title="JD Match">
      <div className="mb-4 flex gap-2 md:hidden">
        <button
          className={cn(mobileTabClass, mobileView === 'workspace' ? 'bg-white text-on-surface shadow-tactile-sm' : 'bg-white/65 text-[color:var(--txt1)]')}
          type="button"
          onClick={() => setMobileView('workspace')}
        >
          Workspace
        </button>
        <button
          className={cn(mobileTabClass, mobileView === 'report' ? 'bg-white text-on-surface shadow-tactile-sm' : 'bg-white/65 text-[color:var(--txt1)]')}
          type="button"
          onClick={() => setMobileView('report')}
        >
          Detailed Report
        </button>
      </div>

      <main className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className={cn(mobileView === 'report' ? 'hidden md:block' : 'block')}>
          <JdListPane
            items={pageItems}
            activeId={selectedJdId}
            totalCount={jds.length}
            page={jdPage}
            totalPages={totalPages}
            onSelect={id => {
              setSelectedJdId(id);
              setJdPage(getPageForId(jds, id));
              setReportState(null);
              setSheetOpen(false);
            }}
            onAdd={openJd}
            onPrev={() => setJdPage(current => Math.max(1, current - 1))}
            onNext={() => setJdPage(current => Math.min(totalPages, current + 1))}
            onRename={renameJd}
            onDownload={downloadJd}
            onDelete={deleteJd}
          />
        </div>

        <section className={cn(mobileView === 'report' ? 'hidden gap-5 md:grid' : 'grid gap-5')}>
          <div className="flex flex-col gap-4 rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/90 p-5 shadow-tactile md:flex-row md:items-start md:justify-between md:p-6">
            <div className="grid gap-2">
              <div className="font-headline text-2xl font-extrabold text-on-surface">{analyzeTitle}</div>
              <div className="max-w-2xl text-sm leading-7 text-[color:var(--txt2)]">{analyzeSubtitle}</div>
            </div>
            <button
              className="inline-flex min-h-10 items-center justify-center rounded-full border-2 border-charcoal/75 bg-white/90 px-4 py-2 font-headline text-[11px] font-bold shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:bg-white disabled:pointer-events-none disabled:opacity-40"
              type="button"
              onClick={() => {
                void runAnalysis();
              }}
              disabled={!selectedResume || !selectedJd || analyzing}
            >
              {analyzing ? 'Running...' : 'Run Analysis →'}
            </button>
          </div>

          <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
            <ResumePickerPane
              items={resumeProfiles}
              activeKey={selectedResume}
              onSelect={key => {
                setSelectedResume(key);
                setReportState(null);
                setSheetOpen(false);
              }}
            />
            <JdResultPane report={reportState} selected={Boolean(selectedJd)} />
          </div>
        </section>

        <div className={cn(mobileView === 'report' ? 'grid md:hidden' : 'hidden')}>
          <JdResultPane
            report={reportState}
            selected={Boolean(selectedJd)}
            detailed
            onBackToWorkspace={() => setMobileView('workspace')}
          />
        </div>
      </main>

      <JdMobileSheet
        report={reportState}
        open={sheetOpen}
        onToggle={() => setSheetOpen(current => !current)}
        onOpenDetailed={() => {
          setSheetOpen(false);
          setMobileView('report');
        }}
      />
    </JdWorkspaceShell>
  );
}
