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
  "leadership": { "label": "Leadership", "entries": [] },
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
  },
  "customSections": []
}
`.trim();

export function buildResumeParsePrompt(rawText: string) {
  return {
    system: `
You are a structured resume parser.
Return only valid JSON.
Do not wrap JSON in markdown.
Do not add commentary or extra keys.
Preserve facts from the source resume only.
If data is missing, use null for scalars and [] for arrays.
Resume sections can appear in any order.

The JSON must match this schema exactly:
${SCHEMA_OVERVIEW}
`.trim(),
    user: `Parse the following resume text into JSON and return JSON only.\n\nResume text:\n${rawText}`.trim(),
  };
}
