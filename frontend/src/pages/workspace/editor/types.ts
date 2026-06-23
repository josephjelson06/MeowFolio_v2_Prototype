export interface EditorSectionItem {
  id: string;
  label: string;
  done?: boolean;
  removable?: boolean;
  movable?: boolean;
}

export interface ToolbarValues {
  font: string;
  fontSize: number;
  lineSpacing: number;
  margins: number;
  sectionGap: number;
  entryGap: number;
  colorIndex: number;
  pageSize: 'letter' | 'a4' | 'legal';
  headingsFont: string;
  sectionDivider: 'rule' | 'underline' | 'none';
  bulletStyle: 'bullet' | 'dash' | 'square';
  headerStyle: 'centered' | 'left' | 'split';
}

export const leftTabs = [
  { id: 'sections', label: 'Sections' },
  { id: 'template', label: 'Template' },
  { id: 'toolbar', label: 'Toolbar' },
] as const;
