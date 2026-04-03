import { cn } from 'lib/cn';
import type { AtsScoreResponse } from 'types/resumeDocument';

interface EditorMobileSheetProps {
  open: boolean;
  report: AtsScoreResponse | null;
  onToggle: () => void;
  onOpenFullReport: () => void;
}

export function EditorMobileSheet({ open, report, onToggle, onOpenFullReport }: EditorMobileSheetProps) {
  const topBreakdown = report?.breakdown.slice(0, 3) ?? [];

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 rounded-t-[1.75rem] border-x-[1.5px] border-t-[1.5px] border-charcoal/75 bg-white/95 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.12)] transition-transform duration-300 md:hidden',
        open ? 'translate-y-0' : 'translate-y-[calc(100%-3.75rem)]',
      )}
    >
      <button className="mx-auto mb-3 block h-1.5 w-16 rounded-full bg-outline-variant" type="button" onClick={onToggle} aria-label="Toggle ATS sheet"></button>
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="font-headline text-lg font-extrabold text-on-surface">ATS Report</span>
        <button
          className="grid size-9 place-items-center rounded-full border border-outline bg-white text-lg text-[color:var(--txt1)]"
          type="button"
          onClick={onToggle}
        >
          ×
        </button>
      </div>
      {report ? (
        <div className="grid gap-4">
          <div className="flex items-end gap-3">
            <span className="font-headline text-5xl font-extrabold text-primary">{report.score}</span>
            <span className="pb-2 text-sm font-semibold text-[color:var(--txt2)]">out of 100</span>
          </div>
          <div className="text-base font-semibold text-on-surface">{report.verdict}</div>

          {topBreakdown.map(item => {
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

          <div className="grid gap-2">
            <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Checklist</div>
            {report.warnings.slice(0, 2).map(item => (
              <div className="flex items-start gap-3 text-sm leading-7 text-[color:var(--txt1)]" key={item}>
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[color:var(--warn-bg)] text-[11px] font-bold text-[color:var(--warn)]">!</span>
                {item}
              </div>
            ))}
            {report.tips.slice(0, 2).map(item => (
              <div className="flex items-start gap-3 text-sm leading-7 text-[color:var(--txt1)]" key={item}>
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-tertiary-fixed text-[11px] font-bold text-tertiary">✓</span>
                {item}
              </div>
            ))}
          </div>

          <button
            className="inline-flex min-h-10 items-center justify-center rounded-full border-2 border-charcoal/75 bg-white/90 px-4 py-2 font-headline text-[11px] font-bold shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:bg-white"
            type="button"
            onClick={onOpenFullReport}
          >
            Open full ATS report
          </button>
        </div>
      ) : (
        <div className="grid gap-4 rounded-[1.25rem] border border-dashed border-outline bg-surface px-4 py-6 text-center">
          <p className="text-sm leading-7 text-[color:var(--txt2)]">Run analysis to preview ATS feedback here.</p>
          <button
            className="inline-flex min-h-10 items-center justify-center rounded-full border-2 border-charcoal/75 bg-white/90 px-4 py-2 font-headline text-[11px] font-bold shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:bg-white"
            type="button"
            onClick={onToggle}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
