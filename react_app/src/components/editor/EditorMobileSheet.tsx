interface EditorMobileSheetProps {
  open: boolean;
  onToggle: () => void;
  onOpenFullReport: () => void;
}

export function EditorMobileSheet({ open, onToggle, onOpenFullReport }: EditorMobileSheetProps) {
  return (
    <div className={`mob-bottom-sheet editor-mobile-sheet${open ? ' open' : ''}`}>
      <div className="mob-sheet-handle" onClick={onToggle}></div>
      <div className="mob-sheet-head">
        <span>ATS Report</span>
        <button className="close-x" type="button" onClick={onToggle}>
          &times;
        </button>
      </div>
      <div className="mob-sheet-body">
        <div className="editor-sheet-score">
          <span className="editor-sheet-score-num">74</span>
          <span className="editor-sheet-score-sub">out of 100</span>
        </div>
        <div className="editor-sheet-copy">Good - a few fixes needed</div>

        <div className="ats-bar-item editor-sheet-gap">
          <div className="ats-bar-label">
            <span>Keywords</span>
            <span className="editor-accent-val">82%</span>
          </div>
          <div className="ats-bar-track">
            <div className="ats-bar-fill editor-bar-82"></div>
          </div>
        </div>

        <div className="ats-bar-item editor-sheet-gap">
          <div className="ats-bar-label">
            <span>Formatting</span>
            <span className="editor-accent-val">90%</span>
          </div>
          <div className="ats-bar-track">
            <div className="ats-bar-fill editor-bar-90"></div>
          </div>
        </div>

        <div className="ats-bar-item editor-sheet-bottom">
          <div className="ats-bar-label">
            <span>Section structure</span>
            <span className="editor-warn-val">65%</span>
          </div>
          <div className="ats-bar-track">
            <div className="ats-bar-fill warn editor-bar-65"></div>
          </div>
        </div>

        <div className="audit-head editor-sheet-head">Checklist</div>
        <div className="audit-row">
          <span className="abadge bp">&#10003;</span>
          File format readable
        </div>
        <div className="audit-row">
          <span className="abadge bp">&#10003;</span>
          Contact info complete
        </div>
        <div className="audit-row">
          <span className="abadge bw">!</span>
          Add measurable impact
        </div>
        <div className="audit-row">
          <span className="abadge bf">&#10007;</span>
          Missing summary section
        </div>

        <button className="analyze-btn editor-sheet-btn" type="button" onClick={onOpenFullReport}>
          Open full ATS report
        </button>
      </div>
    </div>
  );
}
