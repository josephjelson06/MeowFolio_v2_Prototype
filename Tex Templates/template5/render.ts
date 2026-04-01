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

function splitDisplayName(name?: string | null) {
  const parts = (name?.trim() ?? "").split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return { first: "Your", last: "Name" };
  }

  if (parts.length === 1) {
    return { first: parts[0], last: "Name" };
  }

  return {
    first: parts.slice(0, -1).join(" "),
    last: parts[parts.length - 1]
  };
}

function renderHeader(resume: ResumeData) {
  const { first, last } = splitDisplayName(resume.header.name);
  const contactLines = [
    resume.header.email?.trim() ? escapeTex(resume.header.email.trim()) : "",
    resume.header.phone?.trim() ? escapeTex(resume.header.phone.trim()) : "",
    resume.header.address?.trim() ? escapeTex(resume.header.address.trim()) : "",
    renderLink(resume.header.linkedin),
    renderLink(resume.header.github),
    renderLink(resume.header.website)
  ].filter(Boolean);

  return [
    "\\begin{center}",
    `{\\Huge\\bfseries ${escapeTex(first)}}\\\\[-0.15em]`,
    `{\\Huge\\bfseries ${escapeTex(last)}}`,
    resume.header.role?.trim() ? `\\\\[0.35em]{\\large\\color{Accent}${escapeTex(resume.header.role.trim())}}` : "",
    contactLines.length > 0 ? `\\\\[0.5em]{\\small ${contactLines.join(" \\quad\\textbar\\quad ")}}` : "",
    "\\end{center}",
    "\\vspace{0.5em}"
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

function renderParagraph(text: string) {
  return text.trim() ? escapeTex(text.trim()) : "";
}

function renderBulletList(lines: string[]) {
  if (lines.length === 0) {
    return "";
  }

  return [
    "\\begin{itemize}[leftmargin=1.25em, itemsep=0.3em, topsep=0.3em]",
    ...lines.map((line) => `\\item ${escapeTex(line)}`),
    "\\end{itemize}"
  ].join("\n");
}

function renderEntry(title: string, subtitle: string, meta: string, lines: string[], paragraph: string) {
  return [
    "\\begin{tabularx}{\\textwidth}{@{}Xr@{}}",
    `\\textbf{${escapeTex(title)}}${subtitle ? ` \\\\ {\\small\\textit{${escapeTex(subtitle)}}}` : ""} & {\\small ${escapeTex(meta)}} \\\\`,
    "\\end{tabularx}",
    lines.length > 0 ? renderBulletList(lines) : renderParagraph(paragraph)
  ]
    .filter(Boolean)
    .join("\n");
}

function renderSummary(resume: ResumeData, options: RenderOptions) {
  return sectionBlock(getTemplateSectionTitle("summary", options, resume), renderParagraph(getSummaryText(resume)));
}

function renderEducation(resume: ResumeData, options: RenderOptions) {
  const entries = resume.education
    .map((item) =>
      renderEntry(
        [item.degree?.trim(), item.field?.trim()].filter((value): value is string => Boolean(value)).join(" in ") || item.level,
        [item.institution?.trim(), item.boardOrUniversity?.trim()].filter((value): value is string => Boolean(value)).join(" | "),
        formatDateField(item.date),
        [item.location?.trim(), item.result?.trim()].filter((value): value is string => Boolean(value)),
        ""
      )
    )
    .filter(Boolean)
    .join("\n\n");

  return sectionBlock(getTemplateSectionTitle("education", options, resume), entries);
}

function renderExperience(resume: ResumeData, options: RenderOptions) {
  const entries = resume.experience
    .map((item) =>
      renderEntry(
        item.role?.trim() || "Experience",
        [item.company?.trim(), item.location?.trim()].filter((value): value is string => Boolean(value)).join(" | "),
        formatDateField(item.date),
        getDescriptionLines(item.description, options),
        getDescriptionParagraph(item.description, options)
      )
    )
    .filter(Boolean)
    .join("\n\n");

  return sectionBlock(getTemplateSectionTitle("experience", options, resume), entries);
}

function renderProjects(resume: ResumeData, options: RenderOptions) {
  const entries = resume.projects
    .map((item) => {
      const subtitle = [item.technologies.join(", "), renderLink(item.githubLink), renderLink(item.liveLink)]
        .filter(Boolean)
        .join(" | ");

      return renderEntry(
        item.title?.trim() || "Project",
        subtitle,
        formatDateField(item.date),
        getDescriptionLines(item.description, options),
        getDescriptionParagraph(item.description, options)
      );
    })
    .filter(Boolean)
    .join("\n\n");

  return sectionBlock(getTemplateSectionTitle("projects", options, resume), entries);
}

function renderCompactRows(title: string, rows: Array<{ label: string; value: string }>) {
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

  return renderCompactRows(getTemplateSectionTitle("skills", options, resume), rows);
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

  return renderCompactRows(getTemplateSectionTitle("certifications", options, resume), rows);
}

function renderCustomSection(sectionKey: ResumeSectionKey, section: CustomEntriesSection, options: RenderOptions, resume: ResumeData) {
  const entries = section.entries
    .map((entry) =>
      renderEntry(
        entry.title?.trim() || section.label,
        renderLink(entry.link),
        formatDateField(entry.date),
        getDescriptionLines(entry.description, options),
        getDescriptionParagraph(entry.description, options)
      )
    )
    .filter(Boolean)
    .join("\n\n");

  return sectionBlock(getTemplateSectionTitle(sectionKey, options, resume), entries);
}

function renderDynamicCustomSection(section: DynamicCustomSection, options: RenderOptions) {
  const entries = section.entries
    .map((entry) =>
      renderEntry(
        entry.title?.trim() || section.label,
        renderLink(entry.link),
        formatDateField(entry.date),
        getDescriptionLines(entry.description, options),
        getDescriptionParagraph(entry.description, options),
      ),
    )
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

  return renderCompactRows(getTemplateSectionTitle("languages", options, resume), rows);
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

  return renderCompactRows(getTemplateSectionTitle("hobbies", options, resume), rows);
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
    "% Template: template5",
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
    "\\definecolor{Accent}{HTML}{6A4C93}",
    "\\titleformat{\\section}{\\large\\bfseries\\scshape\\color{Accent}}{}{0em}{}[\\vspace{0.15em}\\titlerule]",
    "\\titlespacing*{\\section}{0pt}{1em}{0.45em}",
    "\\begin{document}"
  ].join("\n");
}

export function renderTemplate5ToTex(resume: ResumeData, options: RenderOptions) {
  const orderedSections = options.sectionOrder.map((section) => renderSection(section, resume, options)).filter(Boolean).join("\n\n");

  return [
    buildPreamble(options),
    renderHeader(resume),
    orderedSections,
    "\\vspace*{\\fill}",
    "\\begin{center}\\textbf{References available upon request.}\\end{center}",
    "\\end{document}"
  ]
    .filter(Boolean)
    .join("\n\n");
}
