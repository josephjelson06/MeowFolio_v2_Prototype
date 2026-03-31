interface EditorTabsProps {
  mode: 'edit' | 'preview' | 'ats';
  onModeChange: (mode: 'edit' | 'preview' | 'ats') => void;
}

export function EditorTabs({ mode, onModeChange }: EditorTabsProps) {
  const tabs: Array<{ key: 'edit' | 'preview' | 'ats'; label: string }> = [
    { key: 'edit', label: 'Edit' },
    { key: 'preview', label: 'Preview' },
    { key: 'ats', label: 'ATS Score' },
  ];

  return (
    <div className="ra-tab-row">
      {tabs.map(tab => (
        <button
          key={tab.key}
          className={`mob-et-btn${mode === tab.key ? ' active' : ''}`}
          type="button"
          onClick={() => onModeChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
