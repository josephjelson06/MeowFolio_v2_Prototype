import type { AtsScoreResponse } from '../../../../shared/contracts/jd';
import type { ResumeData } from '../../../../shared/contracts/resume';

function hasNumbers(text: string) {
  return /\d/.test(text);
}

export function scoreResumeForAts(resume: ResumeData): AtsScoreResponse {
  const breakdown = [
    { label: 'Contact details', score: 0, max: 15 },
    { label: 'Summary', score: 0, max: 10 },
    { label: 'Education', score: 0, max: 10 },
    { label: 'Skills', score: 0, max: 15 },
    { label: 'Experience', score: 0, max: 20 },
    { label: 'Projects', score: 0, max: 15 },
    { label: 'Impact evidence', score: 0, max: 10 },
    { label: 'Structure quality', score: 0, max: 5 },
  ];

  const warnings: string[] = [];
  const tips: string[] = [];

  const contactFilled = [resume.header.name, resume.header.email, resume.header.phone, resume.header.role].filter(Boolean).length;
  breakdown[0].score = contactFilled >= 4 ? 15 : contactFilled * 3;
  if (contactFilled < 3) warnings.push('Add stronger header/contact coverage.');

  breakdown[1].score = resume.summary.content ? 10 : 0;
  if (!resume.summary.content) tips.push('Add a professional summary when it clarifies your target role.');

  breakdown[2].score = resume.education.length ? 10 : 0;
  breakdown[3].score = Math.min(15, resume.skills.items.length * 2 + resume.skills.groups.reduce((sum, group) => sum + Math.min(group.items.length, 3), 0));
  breakdown[4].score = Math.min(20, resume.experience.length * 10);
  breakdown[5].score = Math.min(15, resume.projects.length * 5);

  const impactSignals = [
    ...resume.experience.flatMap(item => item.description.bullets),
    ...resume.projects.flatMap(item => item.description.bullets),
  ].filter(hasNumbers).length;
  breakdown[6].score = Math.min(10, impactSignals * 3);
  breakdown[7].score = resume.skills.items.length || resume.skills.groups.length || resume.experience.length || resume.projects.length ? 5 : 1;

  if (!resume.experience.length) tips.push('Add at least one experience entry, even if it is internship or part-time work.');
  if (!resume.projects.length) tips.push('Projects help ATS and recruiter review when experience is still thin.');
  if (!impactSignals) tips.push('Use numbers in bullets where they show impact, scale, or speed.');

  const score = breakdown.reduce((sum, item) => sum + item.score, 0);
  const verdict = score >= 80 ? 'Strong ATS readiness' : score >= 60 ? 'Good baseline with a few gaps' : 'Needs more ATS-friendly structure and evidence';

  return {
    breakdown,
    score,
    tips,
    verdict,
    warnings,
  };
}
