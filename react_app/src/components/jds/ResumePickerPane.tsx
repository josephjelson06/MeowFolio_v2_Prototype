import type { ResumeMatchProfile } from 'types/resume';

interface ResumePickerPaneProps {
  items: Array<{ key: string; profile: ResumeMatchProfile }>;
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
            key={item.key}
            className={`jd-pick-item${activeKey === item.key ? ' selected' : ''}`}
            type="button"
            onClick={() => onSelect(item.key)}
          >
            <div className="jd-pick-radio"><div className="jd-pick-radio-dot"></div></div>
            <span className="jd-pick-label">{item.key}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
