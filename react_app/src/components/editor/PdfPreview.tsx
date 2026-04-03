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
  ]
    .filter(Boolean)
    .join(' · ');

  const experienceBullets = resume.experience.flatMap(item => item.description.bullets).slice(0, 4);
  const educationRows = resume.education
    .slice(0, 2)
    .map(item => [item.degree, item.institution].filter(Boolean).join(' · '))
    .filter(Boolean);
  const skillTags = (resume.skills.items.length ? resume.skills.items : resume.skills.groups.flatMap(group => group.items)).slice(0, 6);

  return (
    <div className="mx-auto w-full max-w-[720px] rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white px-6 py-7 shadow-tactile md:px-8 md:py-9">
      <div className="font-headline text-[2rem] font-extrabold tracking-[-0.04em] text-on-surface">
        {previewText(resume.header.name, 'Your Name')}
      </div>
      <div className="mt-2 text-sm text-[color:var(--txt2)]">{previewText(contactLine, 'email · phone · location · linkedin')}</div>

      {resume.summary.content ? (
        <>
          <div className="my-5 h-px bg-outline-variant/60"></div>
          <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Summary</div>
          <div className="mt-3 h-2 w-11/12 rounded-full bg-outline-variant/35"></div>
          <div className="mt-2 h-2 w-4/5 rounded-full bg-outline-variant/35"></div>
        </>
      ) : null}

      <div className="my-5 h-px bg-outline-variant/60"></div>
      <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Experience</div>
      <div className="mt-3 grid gap-2">
        {experienceBullets.length ? (
          experienceBullets.map((bullet, index) => (
            <div
              className="h-2 rounded-full bg-outline-variant/35"
              key={`${bullet}-${index}`}
              style={{ width: `${Math.max(45, Math.min(92, 48 + bullet.length / 2))}%` }}
            ></div>
          ))
        ) : (
          <>
            <div className="h-2 w-full rounded-full bg-outline-variant/35"></div>
            <div className="h-2 w-4/5 rounded-full bg-outline-variant/35"></div>
            <div className="h-2 w-3/4 rounded-full bg-outline-variant/35"></div>
          </>
        )}
      </div>

      <div className="my-5 h-px bg-outline-variant/60"></div>
      <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Education</div>
      <div className="mt-3 grid gap-2">
        {educationRows.length ? (
          educationRows.map((row, index) => (
            <div
              className="h-2 rounded-full bg-outline-variant/35"
              key={`${row}-${index}`}
              style={{ width: `${Math.max(40, Math.min(80, 40 + row.length / 2))}%` }}
            ></div>
          ))
        ) : (
          <>
            <div className="h-2 w-3/5 rounded-full bg-outline-variant/35"></div>
            <div className="h-2 w-1/2 rounded-full bg-outline-variant/35"></div>
          </>
        )}
      </div>

      <div className="my-5 h-px bg-outline-variant/60"></div>
      <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Skills</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {(skillTags.length ? skillTags : ['React', 'TypeScript', 'SQL']).map(tag => (
          <span
            className="inline-flex items-center rounded-full border border-outline-variant bg-surface px-3 py-1 text-[11px] font-semibold text-[color:var(--txt1)]"
            key={tag}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
