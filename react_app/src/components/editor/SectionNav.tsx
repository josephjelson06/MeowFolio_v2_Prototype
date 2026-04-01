export interface EditorSectionItem {
  id: string;
  label: string;
  done?: boolean;
  removable?: boolean;
  movable?: boolean;
}

interface SectionNavProps {
  sections: EditorSectionItem[];
  activeSection: string;
  onSelect: (section: string) => void;
  onAddCustomSection: () => void;
  onMoveSection: (section: string, direction: 'up' | 'down') => void;
  onRemoveSection: (section: string) => void;
  canMoveUp: (section: string) => boolean;
  canMoveDown: (section: string) => boolean;
}

export function SectionNav({
  sections,
  activeSection,
  onSelect,
  onAddCustomSection,
  onMoveSection,
  onRemoveSection,
  canMoveUp,
  canMoveDown,
}: SectionNavProps) {
  return (
    <div className="sec-nav">
      <div className="snl">Sections</div>
      {sections.map(section => (
        <div key={section.id} className="snav-row">
          <button
            className={`snav${activeSection === section.id ? ' active' : ''}${section.done ? ' done' : ''}`}
            type="button"
            onClick={() => onSelect(section.id)}
          >
            <span className="sdot"></span>
            {section.label}
          </button>
          {activeSection === section.id ? (
            <div className="snav-controls">
              {section.movable ? (
                <>
                  <button
                    className="snav-mini"
                    type="button"
                    disabled={!canMoveUp(section.id)}
                    onClick={() => onMoveSection(section.id, 'up')}
                  >
                    ↑
                  </button>
                  <button
                    className="snav-mini"
                    type="button"
                    disabled={!canMoveDown(section.id)}
                    onClick={() => onMoveSection(section.id, 'down')}
                  >
                    ↓
                  </button>
                </>
              ) : null}
              {section.removable ? (
                <button
                  className="snav-mini"
                  type="button"
                  onClick={() => onRemoveSection(section.id)}
                >
                  ×
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      ))}
      <button className="snav editor-add-row" type="button" onClick={onAddCustomSection}>+ Add custom</button>
    </div>
  );
}
