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


