import { cn } from 'lib/cn';
import type { AtsScoreResponse } from 'types/resumeDocument';

interface AtsFullReportProps {
  report: AtsScoreResponse | null;
  resumeName: string;
  onBack: () => void;
}

export function AtsFullReport({ report, resumeName, onBack }: AtsFullReportProps) {
  if (!report) {
    return (
      <div className="grid gap-4 rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/90 p-5 shadow-tactile md:p-6">
        <div className="grid gap-1">
          <div className="font-headline text-2xl font-extrabold text-on-surface">No ATS report yet</div>
          <div className="text-sm leading-7 text-[color:var(--txt2)]">Run analysis from the editor preview to generate the first score.</div>
        </div>
        <button
          className="inline-flex min-h-10 items-center justify-center self-start rounded-full border-2 border-charcoal/75 bg-white/90 px-4 py-2 font-headline text-[11px] font-bold shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:bg-white"
          type="button"
          onClick={onBack}
        >
          ← Back to Editor
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-4 rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/90 p-5 shadow-tactile md:p-6">
        <div className="grid size-24 place-items-center rounded-[1.5rem] bg-primary-fixed">
          <div className="font-headline text-4xl font-extrabold text-primary">{report.score}</div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-headline text-2xl font-extrabold text-on-surface">{report.verdict}</div>
          <div className="mt-1 text-sm text-[color:var(--txt2)]">{resumeName} · analyzed just now</div>
        </div>
        <button
          className="inline-flex min-h-10 items-center justify-center rounded-full border-2 border-charcoal/75 bg-white/90 px-4 py-2 font-headline text-[11px] font-bold shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:bg-white"
          type="button"
          onClick={onBack}
        >
          ← Back to Editor
        </button>
      </div>

      <div className="grid gap-3 rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/90 p-5 shadow-tactile md:p-6">
        {report.breakdown.map(item => {
          const percentage = Math.round((item.score / item.max) * 100);
          return (
            <div className="grid gap-2" key={item.label}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-on-surface">{item.label}</span>
                <span className={cn('font-headline text-sm font-bold', percentage >= 60 ? 'text-tertiary' : 'text-[color:var(--warn)]')}>
                  {percentage}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-charcoal/10">
                <div className={cn('h-2 rounded-full', percentage >= 60 ? 'bg-tertiary' : 'bg-[color:var(--warn)]')} style={{ width: `${percentage}%` }}></div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-3 rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/90 p-5 shadow-tactile md:p-6">
        <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Checklist</div>
        {report.warnings.map(item => (
          <div className="flex items-start gap-3 text-sm leading-7 text-[color:var(--txt1)]" key={item}>
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[color:var(--warn-bg)] text-[11px] font-bold text-[color:var(--warn)]">!</span>
            {item}
          </div>
        ))}
        {report.tips.map(item => (
          <div className="flex items-start gap-3 text-sm leading-7 text-[color:var(--txt1)]" key={item}>
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-tertiary-fixed text-[11px] font-bold text-tertiary">✓</span>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
