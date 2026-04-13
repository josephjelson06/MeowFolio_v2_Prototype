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
  colorIndex: number;
}

export const leftTabs = [
  { id: 'sections', label: 'Sections' },
  { id: 'template', label: 'Template' },
  { id: 'toolbar', label: 'Toolbar' },
] as const;
