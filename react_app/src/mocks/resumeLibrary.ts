import type { ResumeRecord } from 'types/resume';

export const resumeLibrarySeed: ResumeRecord[] = [
  { id: 'resume_v3', name: 'resume_v3.tex', updated: '2h ago', template: 'Classic', recent: true },
  { id: 'resume_sde', name: 'resume_sde.tex', updated: 'yesterday', template: 'Sidebar' },
  { id: 'resume_pm', name: 'resume_pm.tex', updated: '3d ago', template: 'Classic' },
  { id: 'resume_ds', name: 'resume_ds.tex', updated: '5d ago', template: 'Minimal' },
  { id: 'resume_ml', name: 'resume_ml.tex', updated: '1w ago', template: 'Modern' },
  { id: 'resume_ops', name: 'resume_ops.tex', updated: '1w ago', template: 'Compact' },
  { id: 'resume_frontend', name: 'resume_frontend.tex', updated: '2w ago', template: 'Clean' },
  { id: 'resume_backend', name: 'resume_backend.tex', updated: '2w ago', template: 'Classic' },
  { id: 'resume_cloud', name: 'resume_cloud.tex', updated: '3w ago', template: 'Modern' },
  { id: 'resume_analytics', name: 'resume_analytics.tex', updated: '3w ago', template: 'Minimal' },
  { id: 'resume_platform', name: 'resume_platform.tex', updated: '1mo ago', template: 'Structured' },
  { id: 'resume_startup', name: 'resume_startup.tex', updated: '1mo ago', template: 'Bold' },
];
