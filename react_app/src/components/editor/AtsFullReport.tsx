import { Badge } from 'components/ui/Badge';
import { ProgressBar } from 'components/ui/ProgressBar';

const metrics = [
  { label: 'Keyword coverage', value: 81 },
  { label: 'Hierarchy clarity', value: 77 },
  { label: 'Impact phrasing', value: 72 },
];

export function AtsFullReport() {
  return (
    <div className="ra-stack-lg">
      <div className="ra-stack-sm">
        <div className="section-label">FULL REPORT</div>
        <h2 className="ra-card-title">ATS detailed report</h2>
      </div>
      {metrics.map(metric => (
        <div className="ra-stack-sm" key={metric.label}>
          <div className="ra-report-hero">
            <span>{metric.label}</span>
            <Badge>{metric.value}%</Badge>
          </div>
          <ProgressBar value={metric.value} />
        </div>
      ))}
    </div>
  );
}
