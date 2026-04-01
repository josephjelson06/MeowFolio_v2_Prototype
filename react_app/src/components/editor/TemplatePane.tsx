interface TemplatePaneProps {
  selectedTemplate: number;
  onSelect: (index: number) => void;
}

const templateNames = ['Classic', 'Sidebar', 'Centered', 'Modern', 'Accent', 'Grid'];

export function TemplatePane({ selectedTemplate, onSelect }: TemplatePaneProps) {
  return (
    <div className="tmpl-pane">
      <div className="tmpl-label">Choose a template</div>
      <div className="tmpl-grid">
        {templateNames.map((template, index) => (
          <button
            key={template}
            className={`tmpl-card${selectedTemplate === index ? ' sel' : ''}`}
            type="button"
            onClick={() => onSelect(index)}
          >
            <div className={`tmpl-thumb${index === 1 ? ' editor-tmpl-split' : ''}`}>
              {index === 0 ? (
                <>
                  <div className="tl h"></div><div className="tl s"></div><div className="editor-mini-divider"></div><div className="tl"></div><div className="tl"></div><div className="tl s"></div>
                </>
              ) : index === 1 ? (
                <>
                  <div className="editor-tmpl-split-left"><div className="tl s"></div><div className="tl"></div><div className="tl s"></div></div>
                  <div className="editor-tmpl-split-right"><div className="tl h"></div><div className="tl"></div><div className="tl s"></div></div>
                </>
              ) : index === 2 ? (
                <>
                  <div className="tl h editor-center-head"></div><div className="tl s editor-center-sub"></div><div className="editor-mini-divider"></div><div className="tl"></div><div className="tl"></div>
                </>
              ) : index === 3 ? (
                <>
                  <div className="editor-modern-head"><div className="editor-modern-dot"></div><div className="editor-modern-lines"><div className="tl h editor-modern-h"></div><div className="tl s"></div></div></div><div className="tl"></div><div className="tl"></div>
                </>
              ) : index === 4 ? (
                <div className="editor-accent-col"><div className="tl h"></div><div className="tl"></div><div className="tl s"></div><div className="tl"></div></div>
              ) : (
                <>
                  <div className="tl h"></div>
                  <div className="editor-grid-mini">
                    <div className="editor-grid-col"><div className="tl s"></div><div className="tl"></div></div>
                    <div className="editor-grid-col"><div className="tl s"></div><div className="tl"></div></div>
                  </div>
                </>
              )}
            </div>
            <div className="tmpl-name">{template}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
