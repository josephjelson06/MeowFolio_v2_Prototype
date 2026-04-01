import type { JdReportModel } from 'services/jdService';

interface JdMobileSheetProps {
  report: JdReportModel | null;
  open: boolean;
  onToggle: () => void;
  onOpenDetailed: () => void;
}

export function JdMobileSheet({ report, open, onToggle, onOpenDetailed }: JdMobileSheetProps) {
  return (
    <div className={`mob-bottom-sheet jd-mobile-sheet${open ? ' open' : ''}`}>
      <div className="mob-sheet-handle" onClick={onToggle}></div>
      <div className="mob-sheet-head">
        <span>JD Match Report</span>
        <button className="close-x" type="button" onClick={onToggle}>&times;</button>
      </div>
      <div className="mob-sheet-body">
        {!report ? (
          <div className="jd-no-result jd-sheet-empty">
            <div className="jd-no-result-icon">&#9678;</div>
            <div className="jd-no-result-txt">Run a JD analysis to preview the report summary here.</div>
          </div>
        ) : (
          <>
            <div className="jd-sheet-score-row">
              <span className={`jd-sheet-score-num ${report.scoreTone}`}>{report.resume.score}</span>
              <span className="jd-sheet-score-label">match score</span>
            </div>
            <div className="jd-sheet-verdict">{report.verdict}</div>
            <div className="mob-jd-sheet-metrics">
              {report.metrics.slice(0, 3).map(metric => (
                <div className="ats-bar-item" key={metric.label}>
                  <div className="ats-bar-label">
                    <span>{metric.label}</span>
                    <span className={`jd-metric-val ${metric.tone}`}>{metric.value}%</span>
                  </div>
                  <div className="ats-bar-track">
                    <div className={`ats-bar-fill${metric.tone === 'warn' ? ' warn' : ''}`} style={{ width: `${metric.value}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="audit-head jd-sheet-headline">Top matched keywords</div>
            <div className="mob-jd-sheet-tags">
              {report.resume.found.slice(0, 4).map(keyword => <span className="match-kw-tag found" key={keyword}>{keyword}</span>)}
            </div>
            <button className="analyze-btn jd-sheet-report-btn" type="button" onClick={onOpenDetailed}>Open detailed JD report</button>
          </>
        )}
      </div>
    </div>
  );
}
