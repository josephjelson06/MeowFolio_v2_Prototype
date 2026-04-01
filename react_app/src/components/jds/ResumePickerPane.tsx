import type { ResumePickerOption } from 'types/resume';

interface ResumePickerPaneProps {
  items: ResumePickerOption[];
  activeKey: string | null;
  onSelect: (key: string) => void;
}

export function ResumePickerPane({ items, activeKey, onSelect }: ResumePickerPaneProps) {
  return (
    <div className="jd-pick-col">
      <div className="jd-pick-head">Select Resume</div>
      <div className="jd-pick-list">
        {items.map(item => (
          <button
            key={item.id}
            className={`jd-pick-item${activeKey === item.id ? ' selected' : ''}`}
            type="button"
            onClick={() => onSelect(item.id)}
          >
            <div className="jd-pick-radio"><div className="jd-pick-radio-dot"></div></div>
            <span className="jd-pick-label">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
