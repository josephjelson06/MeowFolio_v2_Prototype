import { cn } from 'lib/cn';
import type { JdReportModel } from 'services/jdService';

interface JdMobileSheetProps {
  report: JdReportModel | null;
  open: boolean;
  onToggle: () => void;
  onOpenDetailed: () => void;
}

export function JdMobileSheet({ report, open, onToggle, onOpenDetailed }: JdMobileSheetProps) {
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
        <button
          className="grid size-9 place-items-center rounded-full border border-outline bg-white text-lg text-[color:var(--txt1)]"
          type="button"
          onClick={onToggle}
        >
          ×
        </button>
      </div>
      {!report ? (
        <div className="grid gap-3 rounded-[1.25rem] border border-dashed border-outline bg-surface px-4 py-6 text-center">
          <div className="text-3xl text-primary">⊘</div>
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
