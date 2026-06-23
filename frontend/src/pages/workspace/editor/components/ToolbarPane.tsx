import { cn } from 'lib/cn';
import type { ToolbarValues } from 'pages/workspace/editor/types';

const toolbarFonts = ['TeX Gyre Termes', 'Computer Modern', 'Palatino', 'Helvetica', 'Libertine'];

export function ToolbarPane({
  values,
  onChange,
  className,
}: {
  values: ToolbarValues;
  onChange: (patch: Partial<ToolbarValues>) => void;
  className?: string;
}) {
  return (
    <div className={cn('grid gap-4 rounded-[1.5rem] border-[1.5px] border-charcoal/75 bg-white/85 p-4 shadow-tactile-sm', className)}>
      
      {/* ── Group 1: Page & Layout ────────────────────────────────────────────── */}
      <div className="grid gap-4 rounded-[1.25rem] border border-outline-variant bg-white/75 p-4">
        <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Page &amp; Layout</div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <label className="font-headline text-[10px] font-bold uppercase tracking-[0.12em] text-[color:var(--txt2)]">Page Size</label>
            <select
              className="w-full rounded-[0.75rem] border border-outline-variant bg-white px-3 py-2 text-xs text-on-surface outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/10"
              value={values.pageSize}
              onChange={event => onChange({ pageSize: event.target.value as ToolbarValues['pageSize'] })}
            >
              <option value="letter">US Letter</option>
              <option value="a4">A4</option>
              <option value="legal">US Legal</option>
            </select>
          </div>

          <div className="grid gap-2">
            <label className="font-headline text-[10px] font-bold uppercase tracking-[0.12em] text-[color:var(--txt2)]">Header Style</label>
            <select
              className="w-full rounded-[0.75rem] border border-outline-variant bg-white px-3 py-2 text-xs text-on-surface outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/10"
              value={values.headerStyle}
              onChange={event => onChange({ headerStyle: event.target.value as ToolbarValues['headerStyle'] })}
            >
              <option value="centered">Centered</option>
              <option value="left">Left-Aligned</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <label className="font-headline text-[10px] font-bold uppercase tracking-[0.12em] text-[color:var(--txt2)]">Section Divider</label>
            <select
              className="w-full rounded-[0.75rem] border border-outline-variant bg-white px-3 py-2 text-xs text-on-surface outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/10"
              value={values.sectionDivider}
              onChange={event => onChange({ sectionDivider: event.target.value as ToolbarValues['sectionDivider'] })}
            >
              <option value="rule">Ruled Line</option>
              <option value="underline">Accent Underline</option>
              <option value="none">None (Whitespace)</option>
            </select>
          </div>

          <div className="grid gap-2">
            <label className="font-headline text-[10px] font-bold uppercase tracking-[0.12em] text-[color:var(--txt2)]">Bullet Symbol</label>
            <select
              className="w-full rounded-[0.75rem] border border-outline-variant bg-white px-3 py-2 text-xs text-on-surface outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/10"
              value={values.bulletStyle}
              onChange={event => onChange({ bulletStyle: event.target.value as ToolbarValues['bulletStyle'] })}
            >
              <option value="bullet">Dot •</option>
              <option value="dash">Dash –</option>
              <option value="square">Square ▪</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Group 2: Typography ──────────────────────────────────────────────── */}
      <div className="grid gap-4 rounded-[1.25rem] border border-outline-variant bg-white/75 p-4">
        <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Typography</div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <label className="font-headline text-[10px] font-bold uppercase tracking-[0.12em] text-[color:var(--txt2)]">Body Font</label>
            <select
              className="w-full rounded-[0.75rem] border border-outline-variant bg-white px-3 py-2 text-xs text-on-surface outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/10"
              value={values.font}
              onChange={event => onChange({ font: event.target.value })}
            >
              {toolbarFonts.map(font => (
                <option key={font}>{font}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <label className="font-headline text-[10px] font-bold uppercase tracking-[0.12em] text-[color:var(--txt2)]">Headings Font</label>
            <select
              className="w-full rounded-[0.75rem] border border-outline-variant bg-white px-3 py-2 text-xs text-on-surface outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/10"
              value={values.headingsFont}
              onChange={event => onChange({ headingsFont: event.target.value })}
            >
              {toolbarFonts.map(font => (
                <option key={font}>{font}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-semibold text-on-surface">Font size</span>
            <span className="font-headline text-sm font-bold text-primary">{values.fontSize}pt</span>
          </div>
          <input type="range" min="9" max="13" value={values.fontSize} onChange={event => onChange({ fontSize: Number(event.target.value) })} />
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-semibold text-on-surface">Line spacing</span>
            <span className="font-headline text-sm font-bold text-primary">{(values.lineSpacing / 100).toFixed(2)}</span>
          </div>
          <input type="range" min="100" max="150" value={values.lineSpacing} onChange={event => onChange({ lineSpacing: Number(event.target.value) })} />
        </div>
      </div>

      {/* ── Group 3: Spacing & Margins ────────────────────────────────────────── */}
      <div className="grid gap-4 rounded-[1.25rem] border border-outline-variant bg-white/75 p-4">
        <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Margins &amp; Spacing</div>
        
        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-semibold text-on-surface">Page Margins</span>
            <span className="font-headline text-sm font-bold text-primary">{(values.margins / 10).toFixed(1)}cm</span>
          </div>
          <input type="range" min="10" max="30" value={values.margins} onChange={event => onChange({ margins: Number(event.target.value) })} />
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-semibold text-on-surface">Section Spacing</span>
            <span className="font-headline text-sm font-bold text-primary">{values.sectionGap}pt</span>
          </div>
          <input type="range" min="4" max="24" value={values.sectionGap} onChange={event => onChange({ sectionGap: Number(event.target.value) })} />
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-semibold text-on-surface">Entry Spacing</span>
            <span className="font-headline text-sm font-bold text-primary">{values.entryGap}pt</span>
          </div>
          <input type="range" min="0" max="16" value={values.entryGap} onChange={event => onChange({ entryGap: Number(event.target.value) })} />
        </div>
      </div>

      {/* ── Group 4: Theme Colors ─────────────────────────────────────────────── */}
      <div className="grid gap-4 rounded-[1.25rem] border border-outline-variant bg-white/75 p-4">
        <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Theme Accent Color</div>
        <div className="flex flex-wrap gap-3">
          {[
            { tone: 'bg-primary', key: 'default' },
            { tone: 'bg-[#324d72]', key: 'navy' },
            { tone: 'bg-[#55606f]', key: 'slate' },
            { tone: 'bg-[#35674d]', key: 'forest' },
            { tone: 'bg-[#6b4b70]', key: 'plum' },
          ].map((item, index) => (
            <button
              key={item.key}
              className={`size-10 rounded-full border-2 ${values.colorIndex === index ? 'border-charcoal shadow-tactile-sm' : 'border-white shadow-ambient'} ${item.tone}`}
              type="button"
              onClick={() => onChange({ colorIndex: index })}
            ></button>
          ))}
        </div>
      </div>

    </div>
  );
}
