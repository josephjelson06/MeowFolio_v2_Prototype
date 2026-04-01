import type { ResumeData } from 'types/resumeDocument';

interface PdfPreviewProps {
  resume: ResumeData;
}

function previewText(value: string | null | undefined, fallback: string) {
  return value && value.trim() ? value.trim() : fallback;
}

export function PdfPreview({ resume }: PdfPreviewProps) {
  const contactLine = [
    resume.header.email,
    resume.header.phone,
    resume.header.address,
    resume.header.linkedin.url,
  ].filter(Boolean).join(' · ');

  const experienceBullets = resume.experience.flatMap(item => item.description.bullets).slice(0, 4);
  const educationRows = resume.education.slice(0, 2).map(item => [item.degree, item.institution].filter(Boolean).join(' · ')).filter(Boolean);
  const skillTags = (resume.skills.items.length ? resume.skills.items : resume.skills.groups.flatMap(group => group.items)).slice(0, 6);

  return (
    <div className="pdf-doc">
      <div className="pdf-name">{previewText(resume.header.name, 'Your Name')}</div>
      <div className="pdf-contact">{previewText(contactLine, 'email · phone · location · linkedin')}</div>

      {resume.summary.content ? (
        <>
          <div className="pdf-divider"></div>
          <div className="pdf-section-h">Summary</div>
          <div className="pdf-line d editor-preview-summary"></div>
          <div className="pdf-line editor-preview-summary-b"></div>
        </>
      ) : null}

      <div className="pdf-divider"></div>
      <div className="pdf-section-h">Experience</div>
      {experienceBullets.length ? experienceBullets.map((bullet, index) => (
        <div className="pdf-line" key={`${bullet}-${index}`} style={{ width: `${Math.max(45, Math.min(92, 48 + bullet.length / 2))}%` }}></div>
      )) : (
        <>
          <div className="pdf-line d editor-pdf-line-a"></div>
          <div className="pdf-line editor-pdf-line-b"></div>
          <div className="pdf-line editor-pdf-line-c"></div>
        </>
      )}

      <div className="pdf-divider"></div>
      <div className="pdf-section-h">Education</div>
      {educationRows.length ? educationRows.map((row, index) => (
        <div className="pdf-line" key={`${row}-${index}`} style={{ width: `${Math.max(40, Math.min(80, 40 + row.length / 2))}%` }}></div>
      )) : (
        <>
          <div className="pdf-line d editor-pdf-line-e"></div>
          <div className="pdf-line editor-pdf-line-f"></div>
        </>
      )}

      <div className="pdf-divider"></div>
      <div className="pdf-section-h">Skills</div>
      <div className="pdf-tags">
        {(skillTags.length ? skillTags : ['React', 'TypeScript', 'SQL']).map(tag => (
          <span className="pdf-tag" key={tag}>{tag}</span>
        ))}
      </div>
    </div>
  );
}
