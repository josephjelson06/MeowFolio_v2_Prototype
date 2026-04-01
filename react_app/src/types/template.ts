export interface TemplateRecord {
  id: string;
  name: string;
  badge: string;
  description: string;
  bestFor: string;
  density: 'airy' | 'balanced' | 'tight';
  headerLayout: 'center' | 'left';
  sectionStyle: 'capsule' | 'rule' | 'underline';
  previewImageUrl: string;
  availableForCompile: boolean;
}
