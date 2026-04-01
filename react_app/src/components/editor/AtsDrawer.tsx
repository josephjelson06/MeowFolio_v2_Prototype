import type { AtsScoreResponse } from 'types/resumeDocument';

interface AtsDrawerProps {
  open: boolean;
  report: AtsScoreResponse | null;
  onClose: () => void;
}

export function AtsDrawer({ open, report, onClose }: AtsDrawerProps) {
  return (
    <div className={`ats-drawer${open ? ' open' : ''}`}>
      <div className="drawer-head">
        <span>ATS Report</span>
        <button className="close-x" type="button" onClick={onClose}>&times;</button>
      </div>
      {report ? (
        <>
          <div className="score-big">
            <div className="score-num">{report.score}</div>
            <div className="score-sub">out of 100 · {report.verdict}</div>
          </div>
          {report.breakdown.slice(0, 3).map(item => {
            const percentage = Math.round((item.score / item.max) * 100);
            return (
              <div className="bar-row" key={item.label}>
                <div className="bar-label"><span>{item.label}</span><span className="bar-val">{percentage}%</span></div>
                <div className="bar-track"><div className={`bar-fill${percentage < 60 ? ' warn' : ''}`} style={{ width: `${percentage}%` }}></div></div>
              </div>
            );
          })}
          <div className="audit">
            <div className="audit-head">Checklist</div>
            {report.warnings.map(item => <div className="audit-row" key={item}><span className="abadge bw">!</span>{item}</div>)}
            {report.tips.slice(0, 3).map(item => <div className="audit-row" key={item}><span className="abadge bp">&#10003;</span>{item}</div>)}
          </div>
        </>
      ) : (
        <div className="score-big">
          <div className="score-sub">Run analysis to see the ATS report.</div>
        </div>
      )}
    </div>
  );
}
