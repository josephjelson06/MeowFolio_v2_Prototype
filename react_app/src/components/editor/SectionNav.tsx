import { cn } from 'lib/cn';

export interface EditorSectionItem {
  id: string;
  label: string;
  done?: boolean;
  removable?: boolean;
  movable?: boolean;
}

interface SectionNavProps {
  sections: EditorSectionItem[];
  activeSection: string;
  onSelect: (section: string) => void;
  onAddCustomSection: () => void;
  onMoveSection: (section: string, direction: 'up' | 'down') => void;
  onRemoveSection: (section: string) => void;
  canMoveUp: (section: string) => boolean;
  canMoveDown: (section: string) => boolean;
}

const miniButtonClass =
  'inline-flex size-8 items-center justify-center rounded-full border border-outline bg-white text-xs font-bold text-[color:var(--txt1)] transition hover:bg-surface disabled:pointer-events-none disabled:opacity-40';

export function SectionNav({
  sections,
  activeSection,
  onSelect,
  onAddCustomSection,
  onMoveSection,
  onRemoveSection,
  canMoveUp,
  canMoveDown,
}: SectionNavProps) {
  return (
    <div className="grid gap-3 rounded-[1.5rem] border-[1.5px] border-charcoal/75 bg-white/85 p-4 shadow-tactile-sm">
      <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Sections</div>
      <div className="grid gap-2">
        {sections.map(section => (
          <div className="flex items-center gap-2" key={section.id}>
            <button
              className={cn(
                'flex min-w-0 flex-1 items-center gap-3 rounded-[1rem] border px-4 py-3 text-left text-sm font-semibold transition',
                activeSection === section.id
                  ? 'border-charcoal/75 bg-surface text-on-surface shadow-tactile-sm'
                  : 'border-outline-variant bg-white/70 text-[color:var(--txt1)] hover:border-charcoal/55 hover:bg-white',
              )}
              type="button"
              onClick={() => onSelect(section.id)}
            >
              <span className={cn('grid size-4 place-items-center rounded-full border', section.done ? 'border-tertiary bg-tertiary text-white' : 'border-outline bg-white')}>
                <span className={cn('size-2 rounded-full', section.done ? 'bg-white' : 'bg-outline')} />
              </span>
              <span className="truncate">{section.label}</span>
            </button>
            {activeSection === section.id ? (
              <div className="flex items-center gap-1">
                {section.movable ? (
                  <>
                    <button className={miniButtonClass} type="button" disabled={!canMoveUp(section.id)} onClick={() => onMoveSection(section.id, 'up')}>
                      ↑
                    </button>
                    <button className={miniButtonClass} type="button" disabled={!canMoveDown(section.id)} onClick={() => onMoveSection(section.id, 'down')}>
                      ↓
                    </button>
                  </>
                ) : null}
                {section.removable ? (
                  <button className={miniButtonClass} type="button" onClick={() => onRemoveSection(section.id)}>
                    ×
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <button
        className="inline-flex min-h-10 items-center justify-center rounded-full border-2 border-charcoal/75 bg-white/90 px-4 py-2 font-headline text-[11px] font-bold shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:bg-white"
        type="button"
        onClick={onAddCustomSection}
      >
        + Add custom
      </button>
    </div>
  );
}
