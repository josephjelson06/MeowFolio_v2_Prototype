import { cn } from 'lib/cn';
import type { JdReportModel } from 'services/jdService';

interface JdResultPaneProps {
  report: JdReportModel | null;
  selected: boolean;
  detailed?: boolean;
  onBackToWorkspace?: () => void;
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

export function JdResultPane({
  report,
  selected,
  detailed = false,
  onBackToWorkspace,
}: JdResultPaneProps) {
  if (!report) {
    return (
      <div className="grid min-h-[16rem] place-items-center rounded-[1.75rem] border-[1.5px] border-dashed border-outline bg-white/70 px-6 py-8 text-center shadow-tactile-sm">
        <div className="grid max-w-md gap-3">
          <div className="text-4xl text-primary">⊘</div>
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
              {check.tone === 'ok' ? '✓' : check.tone === 'warn' ? '!' : '×'}
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
