interface SectionNavProps {
  sections: string[];
  activeSection: string;
  onSelect: (section: string) => void;
}

export function SectionNav({ sections, activeSection, onSelect }: SectionNavProps) {
  return (
    <div className="ra-nav-list">
      {sections.map(section => (
        <button
          key={section}
          className={`ra-nav-item${activeSection === section ? ' active' : ''}`}
          type="button"
          onClick={() => onSelect(section)}
        >
          {section}
        </button>
      ))}
    </div>
  );
}
