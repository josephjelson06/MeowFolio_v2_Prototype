import type { RenderTemplateId } from './resume';

export interface TemplatePreviewRecord {
  id: RenderTemplateId;
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
