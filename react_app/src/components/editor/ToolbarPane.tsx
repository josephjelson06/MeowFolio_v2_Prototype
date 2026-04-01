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
    <div className="toolbar-pane">
      <div className="toolbar-section">
        <div className="toolbar-section-label">Typography &amp; Spacing</div>
        <div className="fl">Font</div>
        <select className="font-select" value={values.font} onChange={event => onChange({ font: event.target.value })}>
          {fonts.map(font => <option key={font}>{font}</option>)}
        </select>
        <div className="slider-row">
          <div className="slider-label"><span>Font size</span><span className="slider-val">{values.fontSize}pt</span></div>
          <input type="range" min="9" max="13" value={values.fontSize} onChange={event => onChange({ fontSize: Number(event.target.value) })} />
        </div>
        <div className="slider-row">
          <div className="slider-label"><span>Line spacing</span><span className="slider-val">{(values.lineSpacing / 100).toFixed(2)}</span></div>
          <input type="range" min="100" max="150" value={values.lineSpacing} onChange={event => onChange({ lineSpacing: Number(event.target.value) })} />
        </div>
        <div className="slider-row">
          <div className="slider-label"><span>Margins</span><span className="slider-val">{(values.margins / 10).toFixed(1)}cm</span></div>
          <input type="range" min="10" max="30" value={values.margins} onChange={event => onChange({ margins: Number(event.target.value) })} />
        </div>
      </div>
      <div className="toolbar-section">
        <div className="toolbar-section-label">Colors</div>
        <div className="editor-color-row">
          {['', 'navy', 'slate', 'forest', 'plum'].map((tone, index) => (
            <button
              key={tone || 'default'}
              className={`editor-color-dot${tone ? ` ${tone}` : ''}${values.colorIndex === index ? ' active' : ''}`}
              type="button"
              onClick={() => onChange({ colorIndex: index })}
            ></button>
          ))}
        </div>
      </div>
    </div>
  );
}
