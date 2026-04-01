import {
  type CustomEntriesSection,
  type DynamicCustomSection,
  type RenderOptions,
  type ResumeData,
  type ResumeSectionKey
} from "../../types/resume";
import { formatDateField, getSummaryText } from "../../lib/resume";
import {
  escapeTex,
  getDescriptionLines,
  getDescriptionParagraph,
  getTemplateSectionTitle,
  renderLink
} from "../render-utils";

function renderHeader(resume: ResumeData) {
  const primaryRow = [resume.header.email?.trim(), resume.header.phone?.trim(), resume.header.address?.trim()]
    .filter((value): value is string => Boolean(value))
    .map((value) => escapeTex(value))
    .join(" \\quad ");
  const linkRow = [renderLink(resume.header.linkedin), renderLink(resume.header.github), renderLink(resume.header.website)]
    .filter(Boolean)
    .join(" \\quad ");

  return [
    `{\n\\Huge\\bfseries ${escapeTex(resume.header.name?.trim() || "Your Name")}\n}`,
    resume.header.role?.trim() ? `{\n\\large\\color{Accent}\\textit{${escapeTex(resume.header.role.trim())}}\n}` : "",
    primaryRow ? `{\n\\small ${primaryRow}\n}` : "",
    linkRow ? `{\n\\small ${linkRow}\n}` : "",
    "\\vspace{0.6em}",
    "\\hrule",
    "\\vspace{0.4em}"
  ]
    .filter(Boolean)
    .join("\n");
}

function sectionBlock(title: string, content: string) {
  if (!content.trim()) {
    return "";
  }

  return [`\\section*{${escapeTex(title)}}`, content].join("\n\n");
}

function renderPlainSection(sectionKey: ResumeSectionKey, content: string, options: RenderOptions, resume: ResumeData) {
  return sectionBlock(getTemplateSectionTitle(sectionKey, options, resume), content);
}

function renderEntryHeading(title: string, subtitle: string, rightLabel: string) {
  return [
    "\\begin{tabular*}{\\textwidth}{@{\\extracolsep{\\fill}}lr}",
    `\\textbf{${escapeTex(title)}}${subtitle ? ` \\textit{${escapeTex(subtitle)}}` : ""} & ${escapeTex(rightLabel)} \\\\`,
    "\\end{tabular*}"
  ].join("\n");
}

function renderBulletList(lines: string[]) {
  if (lines.length === 0) {
    return "";
  }

  return [
    "\\begin{itemize}[leftmargin=1.2em, itemsep=0.25em, topsep=0.35em]",
    ...lines.map((line) => `\\item ${escapeTex(line)}`),
    "\\end{itemize}"
  ].join("\n");
}

function renderParagraph(paragraph: string) {
  return paragraph.trim() ? escapeTex(paragraph.trim()) : "";
}

function renderSummary(resume: ResumeData, options: RenderOptions) {
  return renderPlainSection("summary", renderParagraph(getSummaryText(resume)), options, resume);
}

function renderEducation(resume: ResumeData, options: RenderOptions) {
  const entries = resume.education
    .map((item) => {
      const title = [item.degree?.trim(), item.field?.trim()].filter((value): value is string => Boolean(value)).join(" in ");
      const subtitle = [item.institution?.trim(), item.boardOrUniversity?.trim()].filter((value): value is string => Boolean(value)).join(" | ");
      const rightLabel = formatDateField(item.date);
      const notes = [item.location?.trim(), item.result?.trim()].filter((value): value is string => Boolean(value)).join(" \\quad ");

      return [renderEntryHeading(title || item.level, subtitle, rightLabel), notes ? `\\small ${escapeTex(notes)}` : ""]
        .filter(Boolean)
        .join("\n");
    })
    .filter(Boolean)
    .join("\n\n");

  return renderPlainSection("education", entries, options, resume);
}

function renderExperience(resume: ResumeData, options: RenderOptions) {
  const entries = resume.experience
    .map((item) => {
      const heading = renderEntryHeading(
        item.role?.trim() || "Experience",
        [item.company?.trim(), item.location?.trim()].filter((value): value is string => Boolean(value)).join(" | "),
        formatDateField(item.date)
      );
      const bullets = renderBulletList(getDescriptionLines(item.description, options));
      const paragraph = renderParagraph(getDescriptionParagraph(item.description, options));

      return [heading, bullets || paragraph].filter(Boolean).join("\n");
    })
    .filter(Boolean)
    .join("\n\n");

  return renderPlainSection("experience", entries, options, resume);
}

function renderProjects(resume: ResumeData, options: RenderOptions) {
  const entries = resume.projects
    .map((item) => {
      const linkLine = [renderLink(item.githubLink), renderLink(item.liveLink)].filter(Boolean).join(" \\quad ");
      const heading = renderEntryHeading(
        item.title?.trim() || "Project",
        [item.technologies.join(", "), linkLine].filter(Boolean).join(" | "),
        formatDateField(item.date)
      );
      const bullets = renderBulletList(getDescriptionLines(item.description, options));
      const paragraph = renderParagraph(getDescriptionParagraph(item.description, options));

      return [heading, bullets || paragraph].filter(Boolean).join("\n");
    })
    .filter(Boolean)
    .join("\n\n");

  return renderPlainSection("projects", entries, options, resume);
}

function renderTableSection(title: string, rows: Array<{ label: string; value: string }>) {
  if (rows.length === 0) {
    return "";
  }

  return sectionBlock(
    title,
    [
      "\\begin{tabularx}{\\textwidth}{@{}>{\\bfseries}p{0.28\\textwidth}X@{}}",
      ...rows.map((row) => `${escapeTex(row.label)} & ${row.value || "\\mbox{}"} \\\\`),
      "\\end{tabularx}"
    ].join("\n")
  );
}

function renderSkills(resume: ResumeData, options: RenderOptions) {
  const rows =
    resume.skills.mode === "grouped"
      ? resume.skills.groups
          .filter((group) => group.groupLabel?.trim() || group.items.length > 0)
          .map((group) => ({
            label: group.groupLabel?.trim() || "Skills",
            value: escapeTex(group.items.join(", "))
          }))
      : resume.skills.items.length > 0
        ? [{ label: "Core Skills", value: escapeTex(resume.skills.items.join(", ")) }]
        : [];

  return renderTableSection(getTemplateSectionTitle("skills", options, resume), rows);
}

function renderCertifications(resume: ResumeData, options: RenderOptions) {
  const rows = resume.certifications
    .map((item) => ({
      label: item.title?.trim() || "Certification",
      value: [item.issuer?.trim(), item.description?.trim(), formatDateField(item.date), renderLink(item.link)]
        .filter((value): value is string => Boolean(value))
        .map((value) => (value.startsWith("\\href") ? value : escapeTex(value)))
        .join(" \\quad ")
    }))
    .filter((row) => row.label || row.value);

  return renderTableSection(getTemplateSectionTitle("certifications", options, resume), rows);
}

function renderCustomSection(sectionKey: ResumeSectionKey, section: CustomEntriesSection, options: RenderOptions, resume: ResumeData) {
  const entries = section.entries
    .map((entry) => {
      const heading = renderEntryHeading(
        entry.title?.trim() || section.label,
        renderLink(entry.link),
        formatDateField(entry.date)
      );
      const bullets = renderBulletList(getDescriptionLines(entry.description, options));
      const paragraph = renderParagraph(getDescriptionParagraph(entry.description, options));

      return [heading, bullets || paragraph].filter(Boolean).join("\n");
    })
    .filter(Boolean)
    .join("\n\n");

  return renderPlainSection(sectionKey, entries, options, resume);
}

function renderDynamicCustomSection(section: DynamicCustomSection, options: RenderOptions) {
  const entries = section.entries
    .map((entry) => {
      const heading = renderEntryHeading(
        entry.title?.trim() || section.label,
        renderLink(entry.link),
        formatDateField(entry.date),
      );
      const bullets = renderBulletList(getDescriptionLines(entry.description, options));
      const paragraph = renderParagraph(getDescriptionParagraph(entry.description, options));

      return [heading, bullets || paragraph].filter(Boolean).join('\n');
    })
    .filter(Boolean)
    .join('\n\n');

  return sectionBlock(section.label.trim() || 'Custom Section', entries);
}

function renderLanguages(resume: ResumeData, options: RenderOptions) {
  const rows =
    resume.languages.mode === "grouped"
      ? resume.languages.groups
          .filter((group) => group.groupLabel?.trim() || group.items.length > 0)
          .map((group) => ({
            label: group.groupLabel?.trim() || "Languages",
            value: escapeTex(group.items.join(", "))
          }))
      : resume.languages.items
          .map((item) => ({
            label: item.language?.trim() || "Language",
            value: escapeTex(item.proficiency?.trim() || "")
          }))
          .filter((row) => row.label);

  return renderTableSection(getTemplateSectionTitle("languages", options, resume), rows);
}

function renderHobbies(resume: ResumeData, options: RenderOptions) {
  const rows =
    resume.hobbies.mode === "grouped"
      ? resume.hobbies.groups
          .filter((group) => group.groupLabel?.trim() || group.items.length > 0)
          .map((group) => ({
            label: group.groupLabel?.trim() || "Interests",
            value: escapeTex(group.items.join(", "))
          }))
      : resume.hobbies.items.map((item) => ({
          label: item,
          value: ""
        }));

  return renderTableSection(getTemplateSectionTitle("hobbies", options, resume), rows);
}

function renderSection(section: string, resume: ResumeData, options: RenderOptions) {
  const dynamicSection = resume.customSections.find(item => item.id === section);
  if (dynamicSection) {
    return renderDynamicCustomSection(dynamicSection, options);
  }

  switch (section) {
    case "summary":
      return renderSummary(resume, options);
    case "education":
      return renderEducation(resume, options);
    case "skills":
      return renderSkills(resume, options);
    case "experience":
      return renderExperience(resume, options);
    case "projects":
      return renderProjects(resume, options);
    case "certifications":
      return renderCertifications(resume, options);
    case "leadership":
      return renderCustomSection("leadership", resume.leadership, options, resume);
    case "achievements":
      return renderCustomSection("achievements", resume.achievements, options, resume);
    case "competitions":
      return renderCustomSection("competitions", resume.competitions, options, resume);
    case "extracurricular":
      return renderCustomSection("extracurricular", resume.extracurricular, options, resume);
    case "publications":
      return renderCustomSection("publications", resume.publications, options, resume);
    case "openSource":
      return renderCustomSection("openSource", resume.openSource, options, resume);
    case "languages":
      return renderLanguages(resume, options);
    case "hobbies":
      return renderHobbies(resume, options);
    default:
      return "";
  }
}

function buildPreamble(options: RenderOptions) {
  return [
    "% Template: template4",
    "\\documentclass[11pt]{article}",
    `\\usepackage[margin=${options.margin}]{geometry}`,
    "\\usepackage[T1]{fontenc}",
    "\\usepackage[utf8]{inputenc}",
    "\\usepackage{tabularx}",
    "\\usepackage{array}",
    "\\usepackage{enumitem}",
    "\\usepackage[hidelinks]{hyperref}",
    "\\usepackage[dvipsnames]{xcolor}",
    "\\usepackage{titlesec}",
    "\\pagestyle{empty}",
    "\\setlength{\\parindent}{0pt}",
    "\\setlength{\\parskip}{0pt}",
    "\\definecolor{Accent}{HTML}{3A4F7A}",
    "\\titleformat{\\section}{\\large\\bfseries\\color{Accent}}{}{0em}{}[\\titlerule]",
    "\\titlespacing*{\\section}{0pt}{0.9em}{0.45em}",
    "\\begin{document}"
  ].join("\n");
}

export function renderTemplate4ToTex(resume: ResumeData, options: RenderOptions) {
  const orderedSections = options.sectionOrder.map((section) => renderSection(section, resume, options)).filter(Boolean).join("\n\n");

  return [buildPreamble(options), renderHeader(resume), orderedSections, "\\end{document}"].filter(Boolean).join("\n\n");
}
