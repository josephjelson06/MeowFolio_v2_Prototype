import type { AtsScoreResponse } from 'types/resumeDocument';

interface EditorMobileSheetProps {
  open: boolean;
  report: AtsScoreResponse | null;
  onToggle: () => void;
  onOpenFullReport: () => void;
}

export function EditorMobileSheet({ open, report, onToggle, onOpenFullReport }: EditorMobileSheetProps) {
  const topBreakdown = report?.breakdown.slice(0, 3) ?? [];

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
        {report ? (
          <>
            <div className="editor-sheet-score">
              <span className="editor-sheet-score-num">{report.score}</span>
              <span className="editor-sheet-score-sub">out of 100</span>
            </div>
            <div className="editor-sheet-copy">{report.verdict}</div>

            {topBreakdown.map(item => {
              const percentage = Math.round((item.score / item.max) * 100);
              return (
                <div className="ats-bar-item editor-sheet-gap" key={item.label}>
                  <div className="ats-bar-label">
                    <span>{item.label}</span>
                    <span className={percentage >= 60 ? 'editor-accent-val' : 'editor-warn-val'}>{percentage}%</span>
                  </div>
                  <div className="ats-bar-track">
                    <div className={`ats-bar-fill${percentage < 60 ? ' warn' : ''}`} style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}

            <div className="audit-head editor-sheet-head">Checklist</div>
            {report.warnings.slice(0, 2).map(item => (
              <div className="audit-row" key={item}>
                <span className="abadge bw">!</span>
                {item}
              </div>
            ))}
            {report.tips.slice(0, 2).map(item => (
              <div className="audit-row" key={item}>
                <span className="abadge bp">&#10003;</span>
                {item}
              </div>
            ))}

            <button className="analyze-btn editor-sheet-btn" type="button" onClick={onOpenFullReport}>
              Open full ATS report
            </button>
          </>
        ) : (
          <>
            <div className="editor-sheet-copy">Run analysis to preview ATS feedback here.</div>
            <button className="analyze-btn editor-sheet-btn" type="button" onClick={onToggle}>
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
}
