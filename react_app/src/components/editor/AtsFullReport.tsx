import type { AtsScoreResponse } from 'types/resumeDocument';

interface AtsFullReportProps {
  report: AtsScoreResponse | null;
  resumeName: string;
  onBack: () => void;
}

export function AtsFullReport({ report, resumeName, onBack }: AtsFullReportProps) {
  if (!report) {
    return (
      <div className="ats-full">
        <div className="ats-score-card">
          <div className="ats-score-info">
            <div className="ats-score-label">No ATS report yet</div>
            <div className="ats-score-desc">Run analysis from the editor preview to generate the first score.</div>
          </div>
          <button className="analyze-btn" type="button" onClick={onBack}>&larr; Back to Editor</button>
        </div>
      </div>
    );
  }

  return (
    <div className="ats-full">
      <div className="ats-score-card">
        <div className="ats-score-num">{report.score}</div>
        <div className="ats-score-info">
          <div className="ats-score-label">{report.verdict}</div>
          <div className="ats-score-desc">{resumeName} · analyzed just now</div>
        </div>
        <button className="analyze-btn" type="button" onClick={onBack}>&larr; Back to Editor</button>
      </div>
      <div className="ats-bars">
        {report.breakdown.map(item => {
          const percentage = Math.round((item.score / item.max) * 100);
          return (
            <div className="ats-bar-item" key={item.label}>
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
      </div>
      <div className="ats-checklist">
        {report.warnings.map(item => (
          <div className="ats-check-row" key={item}>
            <span className="check-ico editor-check-warn">!</span>{item}
          </div>
        ))}
        {report.tips.map(item => (
          <div className="ats-check-row" key={item}>
            <span className="check-ico editor-check-ok">&#10003;</span>{item}
          </div>
        ))}
      </div>
    </div>
  );
}
