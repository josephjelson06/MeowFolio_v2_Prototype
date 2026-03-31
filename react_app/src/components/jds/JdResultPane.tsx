import { Badge } from 'components/ui/Badge';
import { EmptyState } from 'components/ui/EmptyState';
import { ProgressBar } from 'components/ui/ProgressBar';
import type { JdReportModel } from 'services/jdService';

interface JdResultPaneProps {
  report: JdReportModel | null;
}

export function JdResultPane({ report }: JdResultPaneProps) {
  if (!report) {
    return <EmptyState title="No report yet" copy="Pick a JD and resume profile to generate the first analysis." />;
  }

  return (
    <div className="ra-stack-lg">
      <div className="ra-report-hero">
        <div className="ra-stack-sm">
          <div className="section-label">ANALYSIS REPORT</div>
          <h2 className="ra-card-title">{report.jd.title}</h2>
          <p className="ra-card-copy">{report.jd.company} · {report.jd.type}</p>
          <p className="ra-card-copy">{report.verdict}</p>
        </div>
        <div className="ra-score-chip">{report.resume.score}%</div>
      </div>

      <div className="ra-grid-2">
        {report.metrics.map(metric => (
          <div className="ra-stack-sm" key={metric.label}>
            <div className="ra-report-hero">
              <span>{metric.label}</span>
              <Badge>{metric.value}%</Badge>
            </div>
            <ProgressBar value={metric.value} />
          </div>
        ))}
      </div>

      <div className="ra-check-list">
        {report.checks.map(check => (
          <div className={`ra-check-item ${check.tone}`} key={check.text}>
            <strong>{check.tone.toUpperCase()}</strong>
            <span>{check.text}</span>
          </div>
        ))}
      </div>

      <div className="ra-keyword-grid">
        <div className="ra-stack-sm">
          <h3 className="ra-card-title">Matched keywords</h3>
          <div className="ra-token-box">
            {report.resume.found.map(keyword => <span className="ra-token" key={keyword}>{keyword}</span>)}
          </div>
        </div>
        <div className="ra-stack-sm">
          <h3 className="ra-card-title">Missing keywords</h3>
          <div className="ra-token-box">
            {report.resume.miss.map(keyword => <span className="ra-token miss" key={keyword}>{keyword}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}
