import type { JdRecord } from 'types/jd';
import { Button } from 'components/ui/Button';

interface JdListPaneProps {
  items: JdRecord[];
  activeId: number | null;
  onSelect: (id: number) => void;
  onAdd: () => void;
}

export function JdListPane({ items, activeId, onSelect, onAdd }: JdListPaneProps) {
  return (
    <div className="ra-stack-md">
      <div className="ra-report-hero">
        <div>
          <div className="section-label">JOB DESCRIPTIONS</div>
          <h2 className="ra-card-title">Saved JD library</h2>
        </div>
        <Button onClick={onAdd}>+ Add JD</Button>
      </div>
      <div className="ra-scroll-panel">
        <div className="ra-list-grid">
          {items.map(item => (
            <button
              key={item.id}
              className={`ra-list-item${activeId === item.id ? ' active' : ''}`}
              type="button"
              onClick={() => onSelect(item.id)}
            >
              <strong>{item.title}</strong>
              <span>{item.company} · {item.type}</span>
              <span className="ra-card-copy">{item.badge}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
