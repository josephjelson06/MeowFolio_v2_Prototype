import { Button } from 'components/ui/Button';
import { cn } from 'lib/cn';
import type { JdRecord } from 'types/jd';

interface JdListPaneProps {
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
}

const actionClass =
  'inline-flex min-h-8 items-center justify-center rounded-full border-2 border-charcoal/70 bg-white/85 px-3 py-1.5 text-[10px] font-semibold text-[color:var(--txt1)] shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:bg-white disabled:pointer-events-none disabled:opacity-40';

export function JdListPane({
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
}: JdListPaneProps) {
  return (
    <section className="grid gap-4 rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/90 p-5 shadow-tactile md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="grid gap-1">
          <div className="font-headline text-2xl font-extrabold text-on-surface">Saved JDs</div>
          <div className="font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--txt2)]">
            {totalCount} JDs
          </div>
        </div>
        <Button className="whitespace-nowrap" onClick={onAdd}>
          + Add JD
        </Button>
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
                    className={actionClass}
                    type="button"
                    onClick={event => {
                      event.stopPropagation();
                      onRename(item.id);
                    }}
                  >
                    Rename
                  </button>
                  <button
                    className={actionClass}
                    type="button"
                    onClick={event => {
                      event.stopPropagation();
                      onDownload(item.id);
                    }}
                  >
                    ↓
                  </button>
                  <button
                    className={cn(actionClass, 'border-error/30 bg-error-container/40 text-error hover:bg-error-container')}
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
              <div className="text-3xl text-primary">⊘</div>
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
          <button className={actionClass} type="button" onClick={onPrev} disabled={page === 1}>
            Previous
          </button>
          <button className={actionClass} type="button" onClick={onNext} disabled={page === totalPages}>
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
