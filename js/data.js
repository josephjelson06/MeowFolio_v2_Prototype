const ResumeAIData = (() => {
  const resumeLibrary = [
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

  const jdLibrary = [
    { id: 1, title: 'Software Engineer II', company: 'Google', type: 'Full-time', badge: '2 resumes matched', parsedText: 'Software Engineer II\nGoogle\nBuild product features, APIs, and internal tooling.' },
    { id: 2, title: 'Senior Frontend Dev', company: 'Razorpay', type: 'Full-time', badge: 'Not analyzed yet', parsedText: 'Senior Frontend Dev\nRazorpay\nOwn frontend architecture and UX performance.' },
    { id: 3, title: 'ML Engineer', company: 'OpenAI', type: 'Remote', badge: '1 resume matched', parsedText: 'ML Engineer\nOpenAI\nTrain, evaluate, and deploy model-driven workflows.' },
    { id: 4, title: 'Platform Engineer', company: 'Stripe', type: 'Hybrid', badge: 'Not analyzed yet', parsedText: 'Platform Engineer\nStripe\nScale internal platform reliability and developer tooling.' },
    { id: 5, title: 'Data Engineer', company: 'Notion', type: 'Remote', badge: '2 resumes matched', parsedText: 'Data Engineer\nNotion\nDesign pipelines and analytics foundations.' },
    { id: 6, title: 'DevOps Engineer', company: 'Atlassian', type: 'Full-time', badge: 'Not analyzed yet', parsedText: 'DevOps Engineer\nAtlassian\nImprove CI/CD, cloud infrastructure, and observability.' },
    { id: 7, title: 'Product Analyst', company: 'CRED', type: 'Hybrid', badge: '1 resume matched', parsedText: 'Product Analyst\nCRED\nTranslate product questions into dashboard and SQL analysis.' },
  ];

  const resumeMatchProfiles = {
    resume_v3: { score: 87, cls: 'high', found: ['Python', 'React', 'REST API', 'scalable', 'cloud'], miss: ['Kubernetes', 'Go'] },
    resume_sde: { score: 62, cls: 'mid', found: ['React', 'Node.js', 'REST'], miss: ['Python', 'System design', 'scalable'] },
    resume_pm: { score: 31, cls: 'low', found: ['communication'], miss: ['Python', 'React', 'backend', 'APIs'] },
    resume_ds: { score: 78, cls: 'high', found: ['Python', 'AWS', 'data pipelines'], miss: ['React', 'Node.js'] },
    resume_ml: { score: 55, cls: 'mid', found: ['Python', 'ML', 'TensorFlow', 'AWS'], miss: ['React', 'Node.js', 'REST API'] },
  };

  const dashboardTips = [
    'Use numbers when they clarify scale, speed, quality, or reach.',
    'Start each bullet with a strong action verb - Led, Built, Reduced, Designed.',
    'Keep your resume to one page unless you have 10+ years of experience.',
    'Tailor your skills section to match the job description keywords.',
    'Add a professional summary only when it adds value, not filler.',
  ];

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  return {
    getResumeLibrary() {
      return clone(resumeLibrary);
    },
    getJdLibrary() {
      return clone(jdLibrary);
    },
    getResumeMatchProfiles() {
      return clone(resumeMatchProfiles);
    },
    getDashboardTips() {
      return dashboardTips.slice();
    },
  };
})();

window.ResumeAIData = ResumeAIData;
