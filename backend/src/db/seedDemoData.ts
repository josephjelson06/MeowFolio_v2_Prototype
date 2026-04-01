import { createEmptyDescriptionField, createEmptyLinkField, createEmptyResumeData, DEFAULT_RENDER_OPTIONS, type RenderTemplateId } from '../../../shared/contracts/resume';
import { countJds, createJd } from '../modules/jds/repository';
import { deriveJdParsedMeta } from '../modules/jds/scoring';
import { countResumes, createResume } from '../modules/resumes/repository';

function slugName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function buildDemoResume(name: string, title: string, templateId: RenderTemplateId, summary: string, skills: string[], experienceBullets: string[]) {
  const resume = createEmptyResumeData('scratch');
  resume.header.name = name;
  resume.header.email = 'arjun@email.com';
  resume.header.phone = '+91 98765 43210';
  resume.header.role = title;
  resume.header.github = { ...createEmptyLinkField(), url: 'github.com/arjunkumar' };
  resume.header.linkedin = { ...createEmptyLinkField(), url: 'linkedin.com/in/arjunkumar' };
  resume.summary.content = summary;
  resume.skills.items = skills;
  resume.experience = [{
    company: 'resumeai',
    date: { endMonth: '', endYear: '', isOngoing: true, mode: 'mm-yyyy-present', startMonth: 'Jan', startYear: '2025' },
    description: { ...createEmptyDescriptionField('bullets'), bullets: experienceBullets },
    isCurrent: true,
    location: 'Remote',
    role: title,
  }];
  resume.projects = [{
    date: { endMonth: '', endYear: '2025', isOngoing: false, mode: 'yyyy-range', startMonth: '', startYear: '2024' },
    description: { ...createEmptyDescriptionField('bullets'), bullets: ['Built full-stack resume workflows and improved iteration loops for job applications.'] },
    githubLink: { ...createEmptyLinkField(), url: 'github.com/arjunkumar/resumeai' },
    liveLink: createEmptyLinkField(),
    technologies: ['React', 'TypeScript', 'PostgreSQL'],
    title: 'resumeai',
  }];

  return {
    content: resume,
    rawText: `${name}\n${title}\n${summary}\nSkills: ${skills.join(', ')}`,
    renderOptions: { ...DEFAULT_RENDER_OPTIONS, templateId },
    source: 'scratch' as const,
    templateId,
    title: `${slugName(title)}.tex`,
  };
}

export async function seedDemoData() {
  if (await countResumes() === 0) {
    await createResume(buildDemoResume('Arjun Kumar', 'Software Engineer', 'template1', 'Software engineer with experience across full-stack delivery, API performance, and resume tailoring workflows.', ['Python', 'React', 'Node.js', 'AWS', 'Docker', 'PostgreSQL'], ['Built REST APIs and internal tools used across product teams.', 'Improved response times by 37% and reduced manual review effort.']));
    await createResume(buildDemoResume('Arjun Kumar', 'Frontend Engineer', 'template2', 'Frontend-focused engineer with strong UI delivery, system thinking, and performance habits.', ['React', 'TypeScript', 'Design Systems', 'Accessibility'], ['Shipped responsive product surfaces across web and mobile breakpoints.', 'Reduced layout regressions by building reusable UI primitives.']));
    await createResume(buildDemoResume('Arjun Kumar', 'Data Engineer', 'template4', 'Data engineer working across pipelines, analytics foundations, and product instrumentation.', ['Python', 'SQL', 'Airflow', 'dbt', 'AWS'], ['Designed data pipelines used for operational and product reporting.', 'Improved warehouse freshness and reduced dashboard lag.']));
  }

  if (await countJds() === 0) {
    const seedJds = [
      'Software Engineer II\nGoogle\nBuild product features, APIs, and internal tooling using Python, React, cloud systems, and scalable architecture.',
      'Senior Frontend Dev\nRazorpay\nOwn frontend architecture, performance, React systems, and UX polish.',
      'ML Engineer\nOpenAI\nTrain, evaluate, and deploy model-driven workflows using Python, ML tooling, and cloud systems.',
      'Platform Engineer\nStripe\nScale internal platform reliability, developer tooling, and backend systems.',
      'Data Engineer\nNotion\nDesign pipelines, SQL models, data infrastructure, and analytics foundations.',
    ];

    for (const jdText of seedJds) {
      const meta = deriveJdParsedMeta(jdText);
      await createJd({
        badge: 'Seeded demo JD',
        company: meta.company ?? '',
        parsedMeta: meta,
        rawText: jdText,
        title: meta.roleTitle ?? 'Imported JD',
        type: 'Full-time',
      });
    }
  }
}

if (require.main === module) {
  seedDemoData()
    .then(() => {
      console.log('Demo data seeded.');
      process.exit(0);
    })
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}
