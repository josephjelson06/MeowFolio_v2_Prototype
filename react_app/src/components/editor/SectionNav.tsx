export interface EditorSectionItem {
  id: string;
  label: string;
  done?: boolean;
}

interface SectionNavProps {
  sections: EditorSectionItem[];
  activeSection: string;
  onSelect: (section: string) => void;
}

export function SectionNav({ sections, activeSection, onSelect }: SectionNavProps) {
  return (
    <div className="sec-nav">
      <div className="snl">Sections</div>
      {sections.map(section => (
        <button
          key={section.id}
          className={`snav${activeSection === section.id ? ' active' : ''}${section.done ? ' done' : ''}`}
          type="button"
          onClick={() => onSelect(section.id)}
        >
          <span className="sdot"></span>
          {section.label}
        </button>
      ))}
      <button className="snav editor-add-row" type="button">+ Add</button>
    </div>
  );
}
