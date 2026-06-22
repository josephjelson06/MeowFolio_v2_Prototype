// Moved from api/_resume-prompt.ts — pure logic, no Node.js dependencies.

const SCHEMA_OVERVIEW = `
{
  "header": {
    "name": null,
    "role": null,
    "phone": null,
    "email": null,
    "address": null,
    "github": { "url": null, "displayMode": "plain-url", "displayText": null },
    "linkedin": { "url": null, "displayMode": "plain-url", "displayText": null },
    "website": { "url": null, "displayMode": "plain-url", "displayText": null }
  },
  "summary": {
    "mode": "professional-summary",
    "content": null
  },
  "education": [],
  "skills": {
    "mode": "csv",
    "items": [],
    "groups": []
  },
  "experience": [],
  "projects": [],
  "certifications": [],
  "leadership": { "label": "Leaderships", "entries": [
    {
      "title": null,
      "date": { "mode": "mm-yyyy-range", "startMonth": "", "startYear": "", "endMonth": "", "endYear": "", "isOngoing": false },
      "link": { "url": null, "displayMode": "plain-url", "displayText": null },
      "description": { "mode": "bullets", "bullets": [], "paragraph": null }
    }
  ] },
  "achievements": { "label": "Achievements", "entries": [] },
  "competitions": { "label": "Competitions", "entries": [] },
  "extracurricular": { "label": "Extra-Curricular", "entries": [] },
  "publications": { "label": "Publications", "entries": [] },
  "openSource": { "label": "Open-Source", "entries": [] },
  "languages": {
    "mode": "csv",
    "items": [],
    "groups": []
  },
  "hobbies": {
    "mode": "csv",
    "items": [],
    "groups": []
  }
}
`.trim();

const EXAMPLE_INPUT = `
Akshata Patil
Fresher
Nagpur, Maharashtra | akshata@example.com | +91 98999 99999
linkedin.com/in/akshata | github.com/akshata

Career Objective
Aspiring AI engineer looking for an entry-level role where I can build real machine learning systems.

Education
B.Tech, Artificial Intelligence, St. Vincent Pallotti College of Engineering, Nagpur, 2023 - 2027, 8.7 CGPA
Class 12, PCM, St. Paul Junior College, Nagpur, 2021 - 2023, 92%

Skills
Programming Languages: Python, C++, SQL
Tools & Frameworks: PyTorch, OpenCV, FastAPI

Projects
Solar Panel Extraction Model
GitHub: github.com/akshata/solar-segmentation
Technologies: Python, PyTorch, OpenCV
- Built a segmentation model for solar panel extraction.
- Improved IoU by 14% over the baseline.

Certifications
Google Data Analytics Professional Certificate | Coursera | 2024

Languages
English: Fluent
Hindi: Native

Hobbies & Interests
Reading, Sketching, Hackathons
`.trim();

const EXAMPLE_OUTPUT = {
  achievements: { entries: [], label: 'Achievements' },
  certifications: [
    {
      date: {
        endMonth: '',
        endYear: '',
        isOngoing: false,
        mode: 'yyyy',
        startMonth: '',
        startYear: '2024',
      },
      description: '',
      issuer: 'Coursera',
      link: { displayMode: 'plain-url', displayText: null, url: null },
      title: 'Google Data Analytics Professional Certificate',
    },
  ],
  competitions: { entries: [], label: 'Competitions' },
  education: [
    {
      boardOrUniversity: '',
      date: {
        endMonth: '',
        endYear: '2027',
        isOngoing: false,
        mode: 'yyyy-range',
        startMonth: '',
        startYear: '2023',
      },
      degree: 'B.Tech',
      field: 'Artificial Intelligence',
      institution: 'St. Vincent Pallotti College of Engineering',
      level: 'degree-diploma',
      location: 'Nagpur',
      result: '8.7 CGPA',
      resultType: 'cgpa-10',
    },
  ],
  experience: [],
  extracurricular: { entries: [], label: 'Extra-Curricular' },
  header: {
    address: 'Nagpur, Maharashtra',
    email: 'akshata@example.com',
    github: { displayMode: 'plain-url', displayText: null, url: 'github.com/akshata' },
    linkedin: { displayMode: 'plain-url', displayText: null, url: 'linkedin.com/in/akshata' },
    name: 'Akshata Patil',
    phone: '+91 98999 99999',
    role: 'Fresher',
    website: { displayMode: 'plain-url', displayText: null, url: null },
  },
  hobbies: {
    groups: [],
    items: ['Reading', 'Sketching', 'Hackathons'],
    mode: 'csv',
  },
  languages: {
    groups: [],
    items: [
      { language: 'English', proficiency: 'fluent' },
      { language: 'Hindi', proficiency: 'native' },
    ],
    mode: 'csv',
  },
  leadership: { entries: [], label: 'Leaderships' },
  openSource: { entries: [], label: 'Open-Source' },
  projects: [
    {
      date: {
        endMonth: '',
        endYear: '',
        isOngoing: false,
        mode: 'mm-yyyy-range',
        startMonth: '',
        startYear: '',
      },
      description: {
        bullets: [
          'Built a segmentation model for solar panel extraction.',
          'Improved IoU by 14% over the baseline.',
        ],
        mode: 'bullets',
        paragraph: null,
      },
      githubLink: {
        displayMode: 'plain-url',
        displayText: null,
        url: 'github.com/akshata/solar-segmentation',
      },
      liveLink: { displayMode: 'plain-url', displayText: null, url: null },
      technologies: ['Python', 'PyTorch', 'OpenCV'],
      title: 'Solar Panel Extraction Model',
    },
  ],
  publications: { entries: [], label: 'Publications' },
  skills: {
    groups: [
      { groupLabel: 'Programming Languages', items: ['Python', 'C++', 'SQL'] },
      { groupLabel: 'Tools & Frameworks', items: ['PyTorch', 'OpenCV', 'FastAPI'] },
    ],
    items: [],
    mode: 'grouped',
  },
  summary: {
    content: 'Aspiring AI engineer looking for an entry-level role where I can build real machine learning systems.',
    mode: 'career-objective',
  },
};

const SYSTEM_PROMPT = `
You are a structured resume parser.
Return only valid JSON.
Do not wrap JSON in markdown.
Do not add commentary or extra keys.
Preserve facts from the source resume only.
If data is missing, use null for scalars and [] for arrays.
Resume sections can appear in any order.

Required section coverage:
1) header / personal details
2) career objective or professional summary
3) education
4) skills
5) experience / internships
6) projects
7) certifications
8) leaderships
9) achievements
10) competitions
11) extra-curricular
12) publications
13) open-source
14) languages known
15) hobbies & interests

Mapping rules:
- "Objective", "Profile", "Professional Summary", "Career Objective" -> summary
- "Experience", "Work Experience", "Internships" -> experience
- "Hackathons", "Contest", "Competitions" -> competitions
- "Awards", "Honors", "Achievements" -> achievements
- "Volunteer Work", "Activities", "Extra Curricular" -> extracurricular
- "Languages", "Languages Known" -> languages
- "Hobbies", "Interests" -> hobbies
- "Open Source Contributions" -> openSource

Field rules:
- Use structured link objects for github, linkedin, website, project links, and certificate links.
- Use structured date objects for date fields.
- Use description.mode = "bullets" when the source provides bullet points.
- Use description.mode = "paragraph" when the source is narrative text.
- For skills, languages, and hobbies choose mode "grouped" only when the source is clearly grouped.
- Keep section labels human-readable.

The JSON must match this schema exactly:
`.trim();

function stringifyExample(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export function buildResumeParsePrompt(rawText: string) {
  return {
    systemPrompt: `${SYSTEM_PROMPT}\n${SCHEMA_OVERVIEW}`,
    userPrompt: `
Parse the following resume text into JSON.
Return JSON only.

Schema:
${SCHEMA_OVERVIEW}

Example input:
${EXAMPLE_INPUT}

Example output:
${stringifyExample(EXAMPLE_OUTPUT)}

Resume text:
${rawText}
`.trim(),
  };
}

const TAILOR_SYSTEM_PROMPT = `
You are an expert resume writer and ATS optimization specialist.
Your task is to tailor a candidate's resume sections to match a specific Job Description (JD).
Your goal is to highlight relevant experience, skills, and projects that align with the JD requirements without fabricating any credentials, jobs, dates, or projects.

Guidelines:
1. "summary": Rewrite the professional summary into a high-impact, 2-3 sentence paragraph. Incorporate keywords and align the tone with the JD's company culture.
2. "skills": Reorder, clean up, and optimize the skills to prioritize keywords found in the JD. Maintain the original skills but highlight or front-load JD-matching terms. Do not add skills the candidate does not have.
3. "experience": Rewrite description bullet points for each job entry. Focus on results, impact, and duties that align with the JD responsibilities. Keep the company and role names EXACTLY the same.
4. "projects": Rewrite description bullet points and update technologies to highlight relevance to the JD requirements. Keep project titles EXACTLY the same.

CRITICAL: Return ONLY a valid JSON object matching the requested schema. No commentary, no markdown wrapping, no extra keys.
`.trim();

const TAILOR_SCHEMA_OVERVIEW = `
{
  "summary": "Tailored summary paragraph",
  "skills": {
    "mode": "csv", // or "grouped"
    "items": ["Skill A", "Skill B"],
    "groups": [
      { "groupLabel": "Languages", "items": ["TypeScript", "Python"] }
    ]
  },
  "experience": [
    {
      "company": "Original Company Name",
      "role": "Original Role Name",
      "bullets": ["Tailored achievement bullet 1", "Tailored achievement bullet 2"]
    }
  ],
  "projects": [
    {
      "title": "Original Project Title",
      "bullets": ["Tailored bullet 1", "Tailored bullet 2"]
    }
  ]
}
`.trim();

export function buildResumeTailorPrompt(resumeData: any, jdText: string) {
  // Simplify input to minimize tokens and focus AI
  const simplifiedResume = {
    summary: resumeData.summary?.content ?? "",
    skills: resumeData.skills ?? { mode: "csv", items: [], groups: [] },
    experience: (resumeData.experience ?? []).map((exp: any) => ({
      company: exp.company ?? "",
      role: exp.role ?? "",
      bullets: exp.description?.bullets ?? []
    })),
    projects: (resumeData.projects ?? []).map((proj: any) => ({
      title: proj.title ?? "",
      bullets: proj.description?.bullets ?? []
    }))
  };

  return {
    systemPrompt: `${TAILOR_SYSTEM_PROMPT}\n\nSchema:\n${TAILOR_SCHEMA_OVERVIEW}`,
    userPrompt: `
Analyze the following Job Description (JD) and Resume Data.
Generate the tailored versions of the Summary, Skills, Experience bullets, and Project bullets to match the JD requirements.

Job Description:
"""
${jdText}
"""

Original Resume Data:
${JSON.stringify(simplifiedResume, null, 2)}

Return the tailored content strictly conforming to the JSON schema.
`.trim(),
  };
}

const JD_PARSER_SYSTEM_PROMPT = `
You are a Job Description (JD) parsing specialist.
Your task is to take a raw job description (which may contain messy copy-paste garbage like application counters, EEO statements, footer links, etc.) and extract the structured core of the job.

Return ONLY a valid JSON object matching this schema:
{
  "title": "Clean Job Title (e.g. Senior Frontend Engineer)",
  "company": "Company Name (leave empty if not found)",
  "type": "Full-time, Part-time, Contract, Internship, or Remote",
  "cleanText": "A clean, structured markdown job description containing ONLY the Role Summary, Core Responsibilities, and Requirements/Qualifications. Strip out all EEO disclaimers, application links, application counts, and generic footer text."
}

Do not wrap in markdown or add explanations.
`.trim();

export function buildJdParsePrompt(rawText: string) {
  return {
    systemPrompt: JD_PARSER_SYSTEM_PROMPT,
    userPrompt: `Parse the following raw Job Description text:\n\n${rawText}`
  };
}

/* ─── Phase 2: Deep JD Intelligence Extraction ──────────────────────────────── */

const JD_INTELLIGENCE_SYSTEM_PROMPT = `
You are an expert Job Description analyst and ATS/recruiting specialist.
Your job is to extract deep, structured intelligence from a raw Job Description — regardless of its format (short, long, fluffy, or highly technical).

Return ONLY a valid JSON object matching this exact schema. Use empty strings/arrays for fields you cannot determine. Never hallucinate.

{
  "role": "Clean job title (e.g. Senior AI/ML Engineer)",
  "seniority": "One of: intern | junior | mid | senior | lead | principal | unknown",
  "company": "Company name (empty string if not found)",
  "industry": "Industry/sector (e.g. FinTech, HealthTech, SaaS, EdTech, E-commerce)",
  "location": "Location or 'Remote' or 'Hybrid' (empty if not found)",
  "employmentType": "Full-time | Part-time | Contract | Internship | Freelance",
  "mustHaveSkills": ["Array of 5-12 absolutely required skills/technologies — these are deal-breakers"],
  "niceToHaveSkills": ["Array of 3-8 preferred but not required skills"],
  "requiredExperience": "Plain English summary of experience requirement (e.g. '3+ years in ML engineering')",
  "keyResponsibilities": ["Array of 4-7 core job duties — concrete and specific, not generic"],
  "preferredQualifications": ["Array of 3-6 preferred/bonus qualifications"],
  "companyContext": "1-2 sentence summary: what this company does, their current growth stage or focus area",
  "roleContext": "1-2 sentence summary: why this role exists, what team/product it serves",
  "redFlags": ["Array of concerning or vague signals (e.g. 'rockstar developer', '10 years React experience for a 5-year-old framework', extremely long requirement list)"],
  "keyAtsKeywords": ["Top 12-18 ATS-critical keywords from this JD that MUST appear in the resume to pass automated screening — exact terminology from the JD"]
}

Rules:
- mustHaveSkills must be EXACT tool/tech names (e.g. 'PyTorch' not 'deep learning frameworks')
- keyAtsKeywords should be exact verbatim phrases from the JD — include both acronyms and full forms if both appear
- If the JD is vague or poorly written, note that in redFlags
- Never add fields outside the schema
- Do not wrap in markdown code blocks
`.trim();

export function buildJdIntelligencePrompt(rawText: string) {
  return {
    systemPrompt: JD_INTELLIGENCE_SYSTEM_PROMPT,
    userPrompt: `Extract structured intelligence from the following Job Description:\n\n${rawText.slice(0, 10000)}`,
  };
}

/* ─── Phase 3: Resume Generation (Fresh & Tailor-from-Profile) ──────────────── */

const RESUME_GEN_RULES = `
Bullet-point writing framework (MANDATORY for all experience/project bullets):
- Bullet 1 (Action + Context): Start with a strong past-tense action verb. Describe WHAT was built/done.
- Bullet 2 (Purpose / Impact): WHY it was built or what problem it solved.
- Bullet 3 (Metric / Outcome): Quantified result — %, $, users, time saved. If no real metric available, write a credible approximation.

Resume writing rules:
- Professional summary: 3-4 sentences. Opens with a strong adjective + title. Weaves in seniority, top 2-3 skills, and a value proposition.
- Skills: Mirror the EXACT terminology from the JD's mustHaveSkills and keyAtsKeywords. Group by category if 8+ skills.
- Experience bullets: 3 bullets per role (follow the 3-bullet framework above).
- Project bullets: 2-3 bullets per project (follow the 3-bullet framework above).
- NO filler phrases: avoid "responsible for", "assisted with", "helped", "worked on".
- Dates: use the exact format the user provided. Never invent dates.
- Output ONLY the JSON — no markdown fences, no commentary.
`.trim();

const RESUME_GEN_SCHEMA_NOTE = `
Output must be a valid ResumeData JSON matching this schema exactly:
${SCHEMA_OVERVIEW}

Rules for the schema:
- header.role = the job title from the JD (tailored exactly)
- summary.content = the professional summary paragraph
- skills.mode = "grouped" if multiple categories, "csv" if single list
- experience[].description.mode = "bullets"
- projects[].description.mode = "bullets"
- Use createEmptyDateField patterns: { mode, startMonth, startYear, endMonth, endYear, isOngoing }
- Use link patterns: { url, displayMode: "plain-url", displayText: null }
- Empty sections = keep as empty arrays/objects (never omit keys)
`.trim();

/**
 * FRESH GENERATION — build a complete resume from UserProfile + ParsedJD.
 * Used when gap score is HIGH (user's background does not match JD closely).
 */
export function buildResumeFreshGenPrompt(
  userProfile: {
    fullName: string;
    phone?: string;
    location?: string;
    linkedIn?: string;
    github?: string;
    portfolio?: string;
    defaultTitle?: string;
    summary?: string;
    education: Array<{ institution: string; degree: string; field: string; startDate: string; endDate: string; gpa?: string; location?: string }>;
    experience: Array<{ company: string; role: string; startDate: string; endDate: string; location?: string; current?: boolean; bullets: string[] }>;
    projects: Array<{ name: string; techStack: string; description: string; link?: string; startDate?: string; endDate?: string }>;
    skillGroups: Array<{ category: string; skills: string }>;
    achievements: Array<{ title: string; issuer?: string; date?: string; description?: string }>;
  },
  parsedJd: {
    role: string;
    seniority: string;
    company: string;
    mustHaveSkills: string[];
    niceToHaveSkills: string[];
    keyResponsibilities: string[];
    keyAtsKeywords: string[];
    requiredExperience: string;
    companyContext: string;
    roleContext: string;
  },
) {
  const systemPrompt = `
You are an elite resume writer and ATS optimization expert.
Your task: generate a COMPLETE, ATS-optimized resume JSON from the candidate's profile data and the target job description.

${RESUME_GEN_RULES}

${RESUME_GEN_SCHEMA_NOTE}
`.trim();

  const userPrompt = `
TARGET JD:
Role: ${parsedJd.role} at ${parsedJd.company}
Seniority: ${parsedJd.seniority}
Must-Have Skills: ${parsedJd.mustHaveSkills.join(', ')}
Nice-to-Have: ${parsedJd.niceToHaveSkills.join(', ')}
Key Responsibilities: ${parsedJd.keyResponsibilities.map((r, i) => `${i + 1}. ${r}`).join('\n')}
ATS Keywords (MUST appear in resume): ${parsedJd.keyAtsKeywords.join(', ')}
Experience Required: ${parsedJd.requiredExperience}
Company Context: ${parsedJd.companyContext}
Role Context: ${parsedJd.roleContext}

CANDIDATE PROFILE:
Name: ${userProfile.fullName}
Phone: ${userProfile.phone ?? ''}
Location: ${userProfile.location ?? ''}
LinkedIn: ${userProfile.linkedIn ?? ''}
GitHub: ${userProfile.github ?? ''}
Portfolio: ${userProfile.portfolio ?? ''}
Default Title: ${userProfile.defaultTitle ?? ''}

Education:
${userProfile.education.map(e => `- ${e.degree} in ${e.field} | ${e.institution} | ${e.startDate}–${e.endDate}${e.gpa ? ` | GPA: ${e.gpa}` : ''}`).join('\n') || 'None provided'}

Experience:
${userProfile.experience.map(e =>
  `- ${e.role} @ ${e.company} (${e.startDate}–${e.current ? 'Present' : e.endDate})\n  Bullets: ${e.bullets.filter(Boolean).join(' | ')}`
).join('\n') || 'None provided'}

Projects:
${userProfile.projects.map(p =>
  `- ${p.name} [${p.techStack}]\n  ${p.description}`
).join('\n') || 'None provided'}

Skills:
${userProfile.skillGroups.map(g => `${g.category}: ${g.skills}`).join('\n') || 'None provided'}

Achievements:
${userProfile.achievements.map(a => `- ${a.title}${a.issuer ? ` | ${a.issuer}` : ''}${a.date ? ` | ${a.date}` : ''}`).join('\n') || 'None provided'}

TASK: Generate a complete, ATS-optimized ResumeData JSON for this candidate targeting the JD above.
- Rewrite all bullets using the 3-bullet framework (Action → Purpose → Metric).
- Ensure ALL keyAtsKeywords appear naturally in the resume text.
- Set header.role to exactly: "${parsedJd.role}"
- Write a new professional summary tailored specifically to ${parsedJd.company} and this role.
- Prioritize and reorder skills to lead with mustHaveSkills.

Return ONLY the JSON. No markdown. No commentary.
`.trim();

  return { systemPrompt, userPrompt };
}

/**
 * TAILOR MODE — rewrite an existing ResumeData to match a ParsedJD more closely.
 * Used when gap score is LOW (existing resume is already relevant).
 */
export function buildResumeTailorFromProfilePrompt(
  existingResumeJson: string,
  parsedJd: {
    role: string;
    company: string;
    mustHaveSkills: string[];
    keyResponsibilities: string[];
    keyAtsKeywords: string[];
    companyContext: string;
  },
) {
  const systemPrompt = `
You are an elite resume tailoring specialist.
Your task: surgically update an existing ResumeData JSON to maximize ATS score and human appeal for a specific job.

${RESUME_GEN_RULES}

${RESUME_GEN_SCHEMA_NOTE}
`.trim();

  const userPrompt = `
TARGET JD:
Role: ${parsedJd.role} at ${parsedJd.company}
Must-Have Skills: ${parsedJd.mustHaveSkills.join(', ')}
Key Responsibilities: ${parsedJd.keyResponsibilities.slice(0, 5).map((r, i) => `${i + 1}. ${r}`).join('\n')}
ATS Keywords (must appear in resume): ${parsedJd.keyAtsKeywords.join(', ')}
Company Context: ${parsedJd.companyContext}

EXISTING RESUME JSON:
${existingResumeJson.slice(0, 8000)}

TASK: Return the COMPLETE updated ResumeData JSON with these changes:
1. Update header.role to: "${parsedJd.role}"
2. Rewrite summary.content to open with a strong adjective, reference ${parsedJd.company} culture/context, and highlight top matching skills.
3. Update skills to lead with mustHaveSkills, naturally weave in all keyAtsKeywords.
4. Rewrite experience bullets using the 3-bullet framework. Make them specific to responsibilities above.
5. Rewrite project bullets to highlight technologies matching mustHaveSkills.
6. Keep all dates, institutions, companies, and personal info EXACTLY as-is — do not invent or change factual data.

Return ONLY the complete JSON. No markdown. No commentary.
`.trim();

  return { systemPrompt, userPrompt };
}
