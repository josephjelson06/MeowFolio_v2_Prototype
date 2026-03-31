import type { ResumeMatchProfile } from 'types/resume';

export const resumeMatchProfilesSeed: Record<string, ResumeMatchProfile> = {
  resume_v3: { score: 87, cls: 'high', found: ['Python', 'React', 'REST API', 'scalable', 'cloud'], miss: ['Kubernetes', 'Go'] },
  resume_sde: { score: 62, cls: 'mid', found: ['React', 'Node.js', 'REST'], miss: ['Python', 'System design', 'scalable'] },
  resume_pm: { score: 31, cls: 'low', found: ['communication'], miss: ['Python', 'React', 'backend', 'APIs'] },
  resume_ds: { score: 78, cls: 'high', found: ['Python', 'AWS', 'data pipelines'], miss: ['React', 'Node.js'] },
  resume_ml: { score: 55, cls: 'mid', found: ['Python', 'ML', 'TensorFlow', 'AWS'], miss: ['React', 'Node.js', 'REST API'] },
};
