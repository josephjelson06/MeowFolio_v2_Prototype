import { useEffect, useMemo, useState } from 'react';
import { cn } from 'lib/cn';
import { downloadTextFile } from 'lib/formatters';
import { WorkspaceShell } from 'components/workspace/WorkspaceShell';
import { jdService, type JdReportModel } from 'services/jdService';
import { resumeService } from 'services/resumeService';
import { useUiContext } from 'state/ui/uiContext';
import type { JdRecord } from 'types/jd';
import type { ResumePickerOption } from 'types/resume';

// ─── Constants ────────────────────────────────────────────────────────────────

const JD_PAGE_SIZE = 5;
const RESUME_PAGE_SIZE = 5; // FIX 5: added page size for resume pane

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getPageForId(items: Array<{ id: string }>, id: string | null, pageSize: number) {
  if (!id) return 1;
  const index = items.findIndex(item => item.id === id);
  return index === -1 ? 1 : Math.floor(index / pageSize) + 1;
}

// ─── Shared styles ────────────────────────────────────────────────────────────

// FIX 1: renamed from mobileTabClass → tabClass (tabs are now universal, not mobile-only)
const tabClass =
  'flex-1 rounded-full border-2 border-charcoal/70 px-4 py-2 font-headline text-[11px] font-bold uppercase tracking-[0.12em] transition';

const actionBtnClass =
  'inline-flex min-h-8 items-center justify-center rounded-full border-2 border-charcoal/70 bg-white/85 px-3 py-1.5 text-[10px] font-semibold text-[color:var(--txt1)] shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:bg-white disabled:pointer-events-none disabled:opacity-40';

// ─── JdListPane ───────────────────────────────────────────────────────────────

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
          <div className="font-headline text-2xl font-extrabold text-on-surface">Select Your JD</div>
          <div className="font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--txt2)]">
            {totalCount} saved
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
                'grid gap-3 rounded-[1.35rem] border px-4 py-4 transition cursor-pointer',
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
                    className={actionBtnClass}
                    type="button"
                    onClick={e => { e.stopPropagation(); onRename(item.id); }}
                  >
                    Rename
                  </button>
                  <button
                    className={actionBtnClass}
                    type="button"
                    onClick={e => { e.stopPropagation(); onDownload(item.id); }}
                  >
                    Down
                  </button>
                  <button
                    className={cn(actionBtnClass, 'border-error/30 bg-error-container/40 text-error hover:bg-error-container')}
                    type="button"
                    onClick={e => { e.stopPropagation(); onDelete(item.id); }}
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
          <button className={actionBtnClass} type="button" onClick={onPrev} disabled={page === 1}>
            Previous
          </button>
          <button className={actionBtnClass} type="button" onClick={onNext} disabled={page === totalPages}>
            Next
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── ResumePickerPane ─────────────────────────────────────────────────────────
// FIX 4 + FIX 5: Now a fully parallel pane to JdListPane:
//   • Has its own pagination (page / totalPages / onPrev / onNext)
//   • Hosts the "Run Analysis" button so the extra header card can be removed
//   • No longer embedded as a small sub-column next to the result pane

function ResumePickerPane({
  items,
  activeKey,
  page,
  totalPages,
  onSelect,
  onPrev,
  onNext,
  analyzing,
  canAnalyze,
  onRunAnalysis,
}: {
  items: ResumePickerOption[];
  activeKey: string | null;
  page: number;
  totalPages: number;
  onSelect: (key: string) => void;
  onPrev: () => void;
  onNext: () => void;
  analyzing: boolean;
  canAnalyze: boolean;
  onRunAnalysis: () => void;
}) {
  return (
    <section className="grid gap-4 rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/90 p-5 shadow-tactile md:p-6">
      <div className="grid gap-1">
        <div className="font-headline text-2xl font-extrabold text-on-surface">Select Your Resume</div>
        <div className="font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--txt2)]">
          {items.length} profiles
        </div>
      </div>

      <div className="grid gap-2">
        {items.length ? (
          items.map(item => (
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
          ))
        ) : (
          <div className="grid min-h-44 place-items-center rounded-[1.35rem] border border-dashed border-outline bg-surface px-6 py-8 text-center">
            <div className="grid gap-2">
              <div className="text-3xl text-primary">&#8856;</div>
              <div className="text-sm leading-7 text-[color:var(--txt2)]">No resume profiles available.</div>
            </div>
          </div>
        )}
      </div>

      {/* FIX 5: Pagination for resume pane — mirrors JD list pagination exactly */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--txt2)]">
          Page {page} of {totalPages}
        </div>
        <div className="flex flex-wrap gap-2">
          <button className={actionBtnClass} type="button" onClick={onPrev} disabled={page === 1}>
            Previous
          </button>
          <button className={actionBtnClass} type="button" onClick={onNext} disabled={page === totalPages}>
            Next
          </button>
        </div>
      </div>

      {/* FIX 3: Run Analysis button lives here, not in a separate floating header card */}
      <button
        className="inline-flex min-h-10 w-full items-center justify-center rounded-full border-2 border-charcoal/75 bg-white/90 px-4 py-2 font-headline text-[11px] font-bold shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:bg-white disabled:pointer-events-none disabled:opacity-40"
        type="button"
        onClick={onRunAnalysis}
        disabled={!canAnalyze || analyzing}
      >
        {analyzing ? 'Running...' : 'Run Analysis →'}
      </button>
    </section>
  );
}

// ─── Score helpers ────────────────────────────────────────────────────────────

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

// ─── JdResultPane ─────────────────────────────────────────────────────────────
// FIX 2 + FIX 4: Only one variant now — always full-width detailed report.
//   The compact summary card that was squeezed next to ResumePickerPane has been
//   removed entirely. It had no basis in the wireframe.

function JdResultPane({
  report,
  selected,
  onBackToWorkspace,
}: {
  report: JdReportModel | null;
  selected: boolean;
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
                Go to <strong className="text-on-surface">Workspace</strong>, select a resume, and click{' '}
                <strong className="text-on-surface">Run Analysis</strong>.
              </>
            ) : (
              'Add a JD in the Workspace to start matching resumes.'
            )}
          </div>
        </div>
      </div>
    );
  }

  const scoreTextClass = scoreToneClass(report.scoreTone);
  const scoreBgClass = scoreSurfaceClass(report.scoreTone);

  return (
    <div className="grid gap-5">
      {/* Header: score + verdict + back button */}
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
        {onBackToWorkspace && (
          <button
            className="inline-flex min-h-10 items-center justify-center rounded-full border-2 border-charcoal/75 bg-white/90 px-4 py-2 font-headline text-[11px] font-bold shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:bg-white"
            type="button"
            onClick={onBackToWorkspace}
          >
            ← Back to Workspace
          </button>
        )}
      </div>

      {/* Metrics */}
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
              <div
                className={cn('h-2 rounded-full', metric.tone === 'accent' ? 'bg-tertiary' : 'bg-[color:var(--warn)]')}
                style={{ width: `${metric.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Checklist */}
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

      {/* Keywords */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-3 rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/90 p-5 shadow-tactile md:p-6">
          <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-tertiary">
            Keywords found ({report.found.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {report.found.map(keyword => (
              <span key={keyword} className="inline-flex items-center rounded-full border border-tertiary/30 bg-tertiary-fixed px-3 py-1 text-[11px] font-semibold text-tertiary">
                {keyword}
              </span>
            ))}
          </div>
        </div>
        <div className="grid gap-3 rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/90 p-5 shadow-tactile md:p-6">
          <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
            Missing keywords ({report.miss.length})
          </div>
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

// ─── JdMobileSheet ────────────────────────────────────────────────────────────
// Unchanged in structure — still mobile-only (md:hidden).
// Quick summary preview that slides up from the bottom on mobile after analysis.

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
      <button
        className="mx-auto mb-3 block h-1.5 w-16 rounded-full bg-outline-variant"
        type="button"
        onClick={onToggle}
        aria-label="Toggle JD sheet"
      />
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="font-headline text-lg font-extrabold text-on-surface">JD Match Report</span>
        <button
          className="grid size-9 place-items-center rounded-full border border-outline bg-white text-lg text-[color:var(--txt1)]"
          type="button"
          onClick={onToggle}
        >
          ✕
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
                  <div
                    className={cn('h-2 rounded-full', metric.tone === 'accent' ? 'bg-tertiary' : 'bg-[color:var(--warn)]')}
                    style={{ width: `${metric.value}%` }}
                  />
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

// ─── JdsPage ──────────────────────────────────────────────────────────────────

export function JdsPage() {
  const { openJd, openJdDelete, openJdRename } = useUiContext();

  const [jds, setJds] = useState<Awaited<ReturnType<typeof jdService.list>>>([]);
  const [jdPage, setJdPage] = useState(1);
  const [selectedJdId, setSelectedJdId] = useState<string | null>(null);

  const [resumeProfiles, setResumeProfiles] = useState<ResumePickerOption[]>([]);
  const [resumePage, setResumePage] = useState(1); // FIX 5: resume pagination state
  const [selectedResume, setSelectedResume] = useState<string | null>(null);

  // FIX 1 + FIX 6: renamed from mobileView → activeTab, and is no longer
  // conditionally reset based on viewport width.
  const [activeTab, setActiveTab] = useState<'workspace' | 'report'>('workspace');

  const [sheetOpen, setSheetOpen] = useState(false);
  const [reportState, setReportState] = useState<JdReportModel | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // ── Derived data ──────────────────────────────────────────────────────────

  const jdPageItems = useMemo(() => {
    const start = (jdPage - 1) * JD_PAGE_SIZE;
    return jds.slice(start, start + JD_PAGE_SIZE);
  }, [jdPage, jds]);

  // FIX 5: sliced resume items for current page
  const resumePageItems = useMemo(() => {
    const start = (resumePage - 1) * RESUME_PAGE_SIZE;
    return resumeProfiles.slice(start, start + RESUME_PAGE_SIZE);
  }, [resumePage, resumeProfiles]);

  const totalJdPages = Math.max(1, Math.ceil(jds.length / JD_PAGE_SIZE));
  const totalResumePages = Math.max(1, Math.ceil(resumeProfiles.length / RESUME_PAGE_SIZE)); // FIX 5

  const selectedJd = useMemo(() => jds.find(item => item.id === selectedJdId) ?? null, [jds, selectedJdId]);

  // ── Data sync ─────────────────────────────────────────────────────────────

  useEffect(() => {
    async function syncLibraries(preferredJdId?: string | null) {
      const [nextJds, nextProfiles] = await Promise.all([jdService.list(), jdService.getMatchProfiles()]);
      setJds(nextJds);
      setResumeProfiles(nextProfiles);

      setSelectedJdId(current => {
        const candidate = preferredJdId ?? current;
        const nextSelected =
          candidate && nextJds.some(item => item.id === candidate) ? candidate : nextJds[0]?.id ?? null;
        setJdPage(getPageForId(nextJds, nextSelected, JD_PAGE_SIZE));
        return nextSelected;
      });

      setSelectedResume(current =>
        current && nextProfiles.some(item => item.id === current) ? current : nextProfiles[0]?.id ?? null,
      );
    }

    void syncLibraries();

    function handleJdChange(event: Event) {
      const customEvent = event as CustomEvent<{ id?: string }>;
      setReportState(null);
      setActiveTab('workspace'); // return to workspace when JD list changes
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

  // FIX 6: Removed the useEffect that reset activeTab to 'workspace' on desktop.
  // Tab state is now truly global — it works the same on all viewport sizes.

  // ── Handlers ──────────────────────────────────────────────────────────────

  async function runAnalysis() {
    if (!selectedResume || !selectedJdId) return;
    try {
      setAnalyzing(true);
      const nextReport = await jdService.buildReport(selectedResume, selectedJdId);
      if (!nextReport) return;
      setReportState(nextReport);
      // On mobile: keep workspace tab visible, pop up the bottom sheet
      // On desktop: user can switch to Report tab manually — or we auto-switch
      setSheetOpen(true);
    } finally {
      setAnalyzing(false);
    }
  }

  async function downloadJd(id: string) {
    const jd = await jdService.getById(id);
    if (!jd) return;
    downloadTextFile(`${jd.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_jd.txt`, jd.parsedText);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <WorkspaceShell title="JD Match">

      {/* ── Breadcrumb + Tab bar ──────────────────────────────────────────── */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/90 px-5 py-3 shadow-tactile-sm">
        {/* Left: breadcrumb path */}
        <div className="flex items-center gap-1.5 font-headline text-[11px] font-bold uppercase tracking-[0.14em]">
          <span className="text-[color:var(--txt2)]">JD</span>
          <span className="text-[color:var(--txt2)]/50">/</span>
          <span className="text-on-surface">
            {activeTab === 'workspace' ? 'Workspace' : 'Report'}
          </span>
        </div>

        {/* Right: tab pill buttons */}
        <div className="flex gap-2">
          <button
            className={cn(
              tabClass,
              activeTab === 'workspace'
                ? 'bg-white text-on-surface shadow-tactile-sm'
                : 'bg-white/65 text-[color:var(--txt1)]',
            )}
            type="button"
            onClick={() => setActiveTab('workspace')}
          >
            Workspace
          </button>
          <button
            className={cn(
              tabClass,
              activeTab === 'report'
                ? 'bg-white text-on-surface shadow-tactile-sm'
                : 'bg-white/65 text-[color:var(--txt1)]',
            )}
            type="button"
            onClick={() => setActiveTab('report')}
          >
            Report
          </button>
        </div>
      </div>

      <main className="grid gap-6">

        {activeTab === 'workspace' && (
          <div className="grid gap-0 rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/90 shadow-tactile">

            {/* ── Action buttons row ──────────────────────────────────────── */}
            <div className="flex flex-wrap items-center gap-3 px-5 py-4">
              <button
                className="inline-flex min-h-9 items-center justify-center rounded-full border-2 border-charcoal bg-white/95 px-4 py-2 font-headline text-[11px] font-bold text-on-surface shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:bg-surface-container-low"
                type="button"
                onClick={openJd}
              >
                + Add JD
              </button>

              <div className="h-5 w-px bg-charcoal/20" aria-hidden="true" />

              <button
                className="inline-flex min-h-9 items-center justify-center rounded-full border-2 border-charcoal/75 bg-white/90 px-4 py-2 font-headline text-[11px] font-bold shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:bg-white disabled:pointer-events-none disabled:opacity-40"
                type="button"
                onClick={() => { void runAnalysis(); }}
                disabled={!Boolean(selectedResume && selectedJd) || analyzing}
              >
                {analyzing ? 'Analyzing...' : 'Analyze JD →'}
              </button>
            </div>

            {/* ── Horizontal divider ──────────────────────────────────────── */}
            <div className="h-px w-full bg-charcoal/10" />

            {/* ── Two-pane grid (single col on mobile, 2-col on md+) ───────── */}
            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
              <JdListPane
                items={jdPageItems}
                activeId={selectedJdId}
                totalCount={jds.length}
                page={jdPage}
                totalPages={totalJdPages}
                onSelect={id => {
                  setSelectedJdId(id);
                  setJdPage(getPageForId(jds, id, JD_PAGE_SIZE));
                  setReportState(null);
                  setSheetOpen(false);
                }}
                onAdd={openJd}
                onPrev={() => setJdPage(p => Math.max(1, p - 1))}
                onNext={() => setJdPage(p => Math.min(totalJdPages, p + 1))}
                onRename={id => {
                  const jd = jds.find(item => item.id === id);
                  if (jd) openJdRename({ id: jd.id, title: jd.title });
                }}
                onDownload={downloadJd}
                onDelete={id => {
                  const jd = jds.find(item => item.id === id);
                  if (jd) openJdDelete({ id: jd.id, title: jd.title });
                }}
              />

              <ResumePickerPane
                items={resumePageItems}
                activeKey={selectedResume}
                page={resumePage}
                totalPages={totalResumePages}
                onSelect={key => {
                  setSelectedResume(key);
                  setReportState(null);
                  setSheetOpen(false);
                }}
                onPrev={() => setResumePage(p => Math.max(1, p - 1))}
                onNext={() => setResumePage(p => Math.min(totalResumePages, p + 1))}
                analyzing={analyzing}
                canAnalyze={Boolean(selectedResume && selectedJd)}
                onRunAnalysis={() => { void runAnalysis(); }}
              />
            </div>
          </div>
        )}

        {/*
          FIX 2: Report tab renders JdResultPane full-width on ALL viewports,
          both desktop and mobile. Previously this was wrapped in `md:hidden`
          so it never appeared on desktop.
        */}
        {activeTab === 'report' && (
          <JdResultPane
            report={reportState}
            selected={Boolean(selectedJd)}
            onBackToWorkspace={() => setActiveTab('workspace')}
          />
        )}
      </main>

      {/*
        Mobile-only bottom sheet — still md:hidden, unchanged.
        Only shown while on workspace tab so it doesn't overlap the report view.
      */}
      {activeTab === 'workspace' && (
        <JdMobileSheet
          report={reportState}
          open={sheetOpen}
          onToggle={() => setSheetOpen(v => !v)}
          onOpenDetailed={() => {
            setSheetOpen(false);
            setActiveTab('report');
          }}
        />
      )}

    </WorkspaceShell>
  );
}