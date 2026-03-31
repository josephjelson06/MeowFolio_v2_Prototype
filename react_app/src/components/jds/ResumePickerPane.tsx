import type { ResumeMatchProfile } from 'types/resume';

interface ResumePickerPaneProps {
  items: Array<{ key: string; profile: ResumeMatchProfile }>;
  activeKey: string;
  onSelect: (key: string) => void;
}

export function ResumePickerPane({ items, activeKey, onSelect }: ResumePickerPaneProps) {
  return (
    <div className="ra-stack-md">
      <div className="section-label">RESUME PICKER</div>
      <div className="ra-list-grid">
        {items.map(item => (
          <button
            key={item.key}
            className={`ra-list-item${activeKey === item.key ? ' active' : ''}`}
            type="button"
            onClick={() => onSelect(item.key)}
          >
            <strong>{item.key}.tex</strong>
            <span>Current match score seed: {item.profile.score}%</span>
          </button>
        ))}
      </div>
    </div>
  );
}
