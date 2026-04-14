import { cn } from 'lib/cn';
import type { AtsScoreResponse } from 'types/resumeDocument';

export function AtsDrawer({
  open,
  report,
  onClose,
}: {
  open: boolean;
  report: AtsScoreResponse | null;
  onClose: () => void;
}) {
  return (
    <aside
      className={cn(
        'absolute right-4 top-4 hidden w-[22rem] rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/95 p-5 shadow-tactile transition duration-300 md:grid',
        open ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-6 opacity-0',
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="font-headline text-xl font-extrabold text-on-surface">ATS Report</span>
        <button className="grid size-9 place-items-center rounded-full border border-outline bg-white text-lg text-[color:var(--txt1)]" type="button" onClick={onClose}>
          X
        </button>
      </div>
      {report ? (
        <>
          <div className="mb-5 grid gap-1 rounded-[1.25rem] bg-surface px-4 py-4">
            <div className="font-headline text-5xl font-extrabold text-primary">{report.score}</div>
            <div className="text-sm font-semibold text-[color:var(--txt2)]">out of 100 · {report.verdict}</div>
          </div>
          <div className="grid gap-3">
            {report.breakdown.slice(0, 3).map(item => {
              const percentage = Math.round((item.score / item.max) * 100);
              return (
                <div className="grid gap-2" key={item.label}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-on-surface">{item.label}</span>
                    <span className={cn('font-headline text-sm font-bold', percentage < 60 ? 'text-[color:var(--warn)]' : 'text-tertiary')}>
                      {percentage}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-charcoal/10">
                    <div className={cn('h-2 rounded-full', percentage < 60 ? 'bg-[color:var(--warn)]' : 'bg-tertiary')} style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 grid gap-3">
            <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Checklist</div>
            {report.warnings.map(item => (
              <div className="flex items-start gap-3 text-sm leading-7 text-[color:var(--txt1)]" key={item}>
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[color:var(--warn-bg)] text-[11px] font-bold text-[color:var(--warn)]">!</span>
                {item}
              </div>
            ))}
            {report.tips.slice(0, 3).map(item => (
              <div className="flex items-start gap-3 text-sm leading-7 text-[color:var(--txt1)]" key={item}>
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-tertiary-fixed text-[11px] font-bold text-tertiary">OK</span>
                {item}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="grid gap-3 rounded-[1.25rem] border border-dashed border-outline bg-surface px-4 py-6 text-center">
          <div className="text-sm leading-7 text-[color:var(--txt2)]">Run analysis to see the ATS report.</div>
        </div>
      )}
    </aside>
  );
}
