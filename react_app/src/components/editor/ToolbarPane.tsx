export interface ToolbarValues {
  font: string;
  fontSize: number;
  lineSpacing: number;
  margins: number;
  colorIndex: number;
}

interface ToolbarPaneProps {
  values: ToolbarValues;
  onChange: (patch: Partial<ToolbarValues>) => void;
}

const fonts = ['TeX Gyre Termes', 'Computer Modern', 'Palatino', 'Helvetica', 'Libertine'];

export function ToolbarPane({ values, onChange }: ToolbarPaneProps) {
  return (
    <div className="grid gap-4 rounded-[1.5rem] border-[1.5px] border-charcoal/75 bg-white/85 p-4 shadow-tactile-sm">
      <div className="grid gap-4 rounded-[1.25rem] border border-outline-variant bg-white/75 p-4">
        <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Typography &amp; Spacing</div>
        <div className="grid gap-2">
          <label className="font-headline text-[11px] font-bold uppercase tracking-[0.16em] text-[color:var(--txt2)]">Font</label>
          <select
            className="w-full rounded-[1rem] border border-outline-variant bg-white px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            value={values.font}
            onChange={event => onChange({ font: event.target.value })}
          >
            {fonts.map(font => (
              <option key={font}>{font}</option>
            ))}
          </select>
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
        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-semibold text-on-surface">Margins</span>
            <span className="font-headline text-sm font-bold text-primary">{(values.margins / 10).toFixed(1)}cm</span>
          </div>
          <input type="range" min="10" max="30" value={values.margins} onChange={event => onChange({ margins: Number(event.target.value) })} />
        </div>
      </div>

      <div className="grid gap-4 rounded-[1.25rem] border border-outline-variant bg-white/75 p-4">
        <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Colors</div>
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
