import type { JdReportModel } from 'services/jdService';

interface JdResultPaneProps {
  report: JdReportModel | null;
  selected: boolean;
  detailed?: boolean;
  onBackToWorkspace?: () => void;
}

export function JdResultPane({
  report,
  selected,
  detailed = false,
  onBackToWorkspace,
}: JdResultPaneProps) {
  if (!report) {
    return (
      <div className="jd-no-result">
        <div className="jd-no-result-icon">&#9678;</div>
        <div className="jd-no-result-txt">
          {selected
            ? <>Select a resume, then click <strong className="jd-inline-emphasis">Run Analysis</strong>.</>
            : 'Add a JD to start matching resumes.'}
        </div>
      </div>
    );
  }

  if (detailed) {
    return (
      <>
        <div className="ats-score-card mob-ats-score-card">
          <div className={`ats-score-num ${report.scoreTone}`}>{report.resume.score}</div>
          <div className="ats-score-info">
            <div className="ats-score-label">{report.verdict}</div>
            <div className="ats-score-desc">{report.resumeKey} &middot; {report.jd.title} &middot; {report.jd.company}</div>
          </div>
          {onBackToWorkspace ? <button className="analyze-btn" type="button" onClick={onBackToWorkspace}>Back to Workspace</button> : null}
        </div>
        <div className="ats-bars">
          {report.metrics.map(metric => (
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
        <div className="ats-checklist">
          {report.checks.map(check => (
            <div className="ats-check-row" key={check.text}>
              <span className={`check-ico jd-check-tone-${check.tone}`}>
                {check.tone === 'ok' ? '\u2713' : check.tone === 'warn' ? '!' : '\u2717'}
              </span>
              {check.text}
            </div>
          ))}
        </div>
        <div className="match-result-card">
          <div className="match-kw-section">
            <div className="match-kw-heading">&#10003; Keywords found ({report.resume.found.length})</div>
            <div className="match-kw">
              {report.resume.found.map(keyword => <span className="match-kw-tag found" key={keyword}>{keyword}</span>)}
            </div>
          </div>
          <div className="match-kw-section">
            <div className="match-kw-heading">&#10007; Missing keywords ({report.resume.miss.length})</div>
            <div className="match-kw">
              {report.resume.miss.map(keyword => <span className="match-kw-tag miss" key={keyword}>{keyword}</span>)}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="match-result-card">
      <div className="match-res-header">
        <div className="match-res-info">
          <div className="match-res-label">Resume vs Job Description</div>
          <div className="match-res-name">{report.resumeKey}</div>
          <div className="match-res-sub">{report.jd.title} &middot; {report.jd.company}</div>
        </div>
        <div className="match-score-badge">
          <div className={`match-score ${report.resume.cls}`}>{report.resume.score}%</div>
          <div className="match-score-label">match score</div>
        </div>
      </div>
      <div className="match-bar-track">
        <div className={`match-bar-fill ${report.scoreTone}`} style={{ width: `${report.resume.score}%` }}></div>
      </div>
      <div className="match-kw-section">
        <div className="match-kw-heading">&#10003; Keywords found ({report.resume.found.length})</div>
        <div className="match-kw">
          {report.resume.found.map(keyword => <span className="match-kw-tag found" key={keyword}>{keyword}</span>)}
        </div>
      </div>
      <div className="match-kw-section">
        <div className="match-kw-heading">&#10007; Missing keywords ({report.resume.miss.length})</div>
        <div className="match-kw">
          {report.resume.miss.map(keyword => <span className="match-kw-tag miss" key={keyword}>{keyword}</span>)}
        </div>
      </div>
    </div>
  );
}
