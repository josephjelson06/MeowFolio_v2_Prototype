import { cn } from 'lib/cn';
import type { ResumePickerOption } from 'types/resume';

interface ResumePickerPaneProps {
  items: ResumePickerOption[];
  activeKey: string | null;
  onSelect: (key: string) => void;
}

export function ResumePickerPane({ items, activeKey, onSelect }: ResumePickerPaneProps) {
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
