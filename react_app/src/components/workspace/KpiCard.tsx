import { Card } from 'components/ui/Card';
import { ProgressBar } from 'components/ui/ProgressBar';

interface KpiCardProps {
  label: string;
  value: number;
  icon: string;
}

export function KpiCard({ label, value, icon }: KpiCardProps) {
  return (
    <Card>
      <div className="ra-stack-md">
        <div className="section-label">{icon}</div>
        <div className="ra-stack-sm">
          <div className="ra-card-copy">{label}</div>
          <h3 className="ra-card-title">{value}%</h3>
        </div>
        <ProgressBar value={value} />
      </div>
    </Card>
  );
}
