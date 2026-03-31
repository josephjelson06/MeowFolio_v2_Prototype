import { Button } from 'components/ui/Button';

interface QuickActionCardProps {
  title: string;
  copy: string;
  onClick?: () => void;
}

export function QuickActionCard({ title, copy, onClick }: QuickActionCardProps) {
  return (
    <div className="ra-action-tile">
      <h3 className="ra-card-title">{title}</h3>
      <p className="ra-card-copy">{copy}</p>
      {onClick ? <Button variant="secondary" onClick={onClick}>Open</Button> : null}
    </div>
  );
}
