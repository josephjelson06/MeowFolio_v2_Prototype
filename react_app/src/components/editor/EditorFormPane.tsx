import {
  createEmptyEducationEntry,
  createEmptyExperienceEntry,
  createEmptyDateField,
  createEmptyDescriptionField,
  createEmptyLinkField,
  createEmptyProjectEntry,
  type ResumeData,
  type SkillGroup,
} from 'types/resumeDocument';

interface EditorFormPaneProps {
  activeSection: string;
  page: number;
  totalPages: number;
  resume: ResumeData;
  onPrevPage: () => void;
  onNextPage: () => void;
  onContentChange: (updater: (current: ResumeData) => ResumeData) => void;
}

function linesToArray(value: string) {
  return value
    .split('\n')
    .map(item => item.trim())
    .filter(Boolean);
}

function joinLines(items: string[]) {
  return items.join('\n');
}

function joinCsv(items: string[]) {
  return items.join(', ');
}

function splitCsv(value: string) {
  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

function clampStart(page: number) {
  return Math.max(0, (page - 1) * 5);
}

const labelClass = 'font-headline text-[11px] font-bold uppercase tracking-[0.16em] text-[color:var(--txt2)]';
const labelGapClass = `${labelClass} mt-4`;
const inputClass =
  'w-full rounded-[1rem] border border-outline-variant bg-white px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10';
const textAreaMdClass = `${inputClass} min-h-40 resize-y`;
const textAreaSmClass = `${inputClass} min-h-28 resize-y`;
const removeButtonClass =
  'mt-4 inline-flex min-h-9 items-center justify-center self-start rounded-full border-2 border-charcoal/75 bg-white/90 px-4 py-2 font-headline text-[10px] font-bold shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:bg-white';
const addButtonClass =
  'mt-5 inline-flex min-h-10 items-center justify-center self-start rounded-full border-2 border-charcoal/75 bg-white/90 px-4 py-2 font-headline text-[11px] font-bold shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:bg-white';
const paginationButtonClass =
  'inline-flex min-h-8 items-center justify-center rounded-full border-2 border-charcoal/70 bg-white/85 px-3 py-1.5 text-[10px] font-semibold text-[color:var(--txt1)] shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:bg-white disabled:pointer-events-none disabled:opacity-40';
const dividerClass = 'my-6 h-px bg-outline-variant/40';

export function EditorFormPane({
  activeSection,
  page,
  totalPages,
  resume,
  onPrevPage,
  onNextPage,
  onContentChange,
}: EditorFormPaneProps) {
  const startIndex = clampStart(page);
  const visibleExperience = resume.experience.slice(startIndex, startIndex + 5);
  const visibleEducation = resume.education.slice(startIndex, startIndex + 5);
  const visibleSkillGroups = (resume.skills.groups.length ? resume.skills.groups : [{ groupLabel: 'Core Skills', items: resume.skills.items }] as SkillGroup[])
    .slice(startIndex, startIndex + 5);
  const visibleProjects = resume.projects.slice(startIndex, startIndex + 5);
  const activeCustomSection = resume.customSections.find(section => section.id === activeSection) ?? null;
  const visibleCustomEntries = activeCustomSection?.entries.slice(startIndex, startIndex + 5) ?? [];
  const needsPagination = ['experience', 'education', 'skills', 'projects'].includes(activeSection) || Boolean(activeCustomSection);

  return (
    <div className="grid gap-3 rounded-[1.5rem] border-[1.5px] border-charcoal/75 bg-white/85 p-4 shadow-tactile-sm">
      {activeSection === 'contact' ? (
        <>
          <div className={labelClass}>Full name</div>
          <input
            className={inputClass}
            value={resume.header.name ?? ''}
            onChange={event => onContentChange(current => ({
              ...current,
              header: { ...current.header, name: event.target.value },
            }))}
          />
          <div className={labelGapClass}>Role</div>
          <input
            className={inputClass}
            value={resume.header.role ?? ''}
            onChange={event => onContentChange(current => ({
              ...current,
              header: { ...current.header, role: event.target.value },
            }))}
          />
          <div className={labelGapClass}>Email</div>
          <input
            className={inputClass}
            value={resume.header.email ?? ''}
            onChange={event => onContentChange(current => ({
              ...current,
              header: { ...current.header, email: event.target.value },
            }))}
          />
          <div className={labelGapClass}>Phone</div>
          <input
            className={inputClass}
            value={resume.header.phone ?? ''}
            onChange={event => onContentChange(current => ({
              ...current,
              header: { ...current.header, phone: event.target.value },
            }))}
          />
          <div className={labelGapClass}>Location</div>
          <input
            className={inputClass}
            value={resume.header.address ?? ''}
            onChange={event => onContentChange(current => ({
              ...current,
              header: { ...current.header, address: event.target.value },
            }))}
          />
          <div className={labelGapClass}>LinkedIn</div>
          <input
            className={inputClass}
            value={resume.header.linkedin.url ?? ''}
            onChange={event => onContentChange(current => ({
              ...current,
              header: {
                ...current.header,
                linkedin: { ...current.header.linkedin, url: event.target.value },
              },
            }))}
          />
          <div className={labelGapClass}>GitHub</div>
          <input
            className={inputClass}
            value={resume.header.github.url ?? ''}
            onChange={event => onContentChange(current => ({
              ...current,
              header: {
                ...current.header,
                github: { ...current.header.github, url: event.target.value },
              },
            }))}
          />
        </>
      ) : null}

      {activeSection === 'summary' ? (
        <>
          <div className={labelClass}>Professional summary</div>
          <textarea
            className={textAreaMdClass}
            value={resume.summary.content ?? ''}
            onChange={event => onContentChange(current => ({
              ...current,
              summary: { ...current.summary, content: event.target.value },
            }))}
          />
        </>
      ) : null}

      {activeSection === 'experience'
        ? visibleExperience.map((item, localIndex) => {
            const index = startIndex + localIndex;
            return (
              <div key={`exp-${index}`}>
                <div className={labelClass}>Company</div>
                <input
                  className={inputClass}
                  value={item.company ?? ''}
                  onChange={event => onContentChange(current => ({
                    ...current,
                    experience: current.experience.map((entry, entryIndex) => entryIndex === index ? { ...entry, company: event.target.value } : entry),
                  }))}
                />
                <div className={labelGapClass}>Role</div>
                <input
                  className={inputClass}
                  value={item.role ?? ''}
                  onChange={event => onContentChange(current => ({
                    ...current,
                    experience: current.experience.map((entry, entryIndex) => entryIndex === index ? { ...entry, role: event.target.value } : entry),
                  }))}
                />
                <div className={labelGapClass}>Location</div>
                <input
                  className={inputClass}
                  value={item.location ?? ''}
                  onChange={event => onContentChange(current => ({
                    ...current,
                    experience: current.experience.map((entry, entryIndex) => entryIndex === index ? { ...entry, location: event.target.value } : entry),
                  }))}
                />
                <div className={labelGapClass}>Start year</div>
                <input
                  className={inputClass}
                  value={item.date.startYear ?? ''}
                  onChange={event => onContentChange(current => ({
                    ...current,
                    experience: current.experience.map((entry, entryIndex) => entryIndex === index ? {
                      ...entry,
                      date: { ...entry.date, startYear: event.target.value },
                    } : entry),
                  }))}
                />
                <div className={labelGapClass}>End year</div>
                <input
                  className={inputClass}
                  value={item.date.endYear ?? ''}
                  onChange={event => onContentChange(current => ({
                    ...current,
                    experience: current.experience.map((entry, entryIndex) => entryIndex === index ? {
                      ...entry,
                      date: { ...entry.date, endYear: event.target.value },
                    } : entry),
                  }))}
                />
                <div className={labelGapClass}>Bullets</div>
                <textarea
                  className={textAreaSmClass}
                  value={joinLines(item.description.bullets)}
                  onChange={event => onContentChange(current => ({
                    ...current,
                    experience: current.experience.map((entry, entryIndex) => entryIndex === index ? {
                      ...entry,
                      description: { ...entry.description, bullets: linesToArray(event.target.value) },
                    } : entry),
                  }))}
                />
                <button
                  className={removeButtonClass}
                  type="button"
                  onClick={() => onContentChange(current => ({
                    ...current,
                    experience: current.experience.filter((_entry, entryIndex) => entryIndex !== index),
                  }))}
                >
                  Remove experience
                </button>
                {localIndex < visibleExperience.length - 1 ? <div className={dividerClass}></div> : null}
              </div>
            );
          })
        : null}

      {activeSection === 'education'
        ? visibleEducation.map((item, localIndex) => {
            const index = startIndex + localIndex;
            return (
              <div key={`edu-${index}`}>
                <div className={labelClass}>Institution</div>
                <input
                  className={inputClass}
                  value={item.institution ?? ''}
                  onChange={event => onContentChange(current => ({
                    ...current,
                    education: current.education.map((entry, entryIndex) => entryIndex === index ? { ...entry, institution: event.target.value } : entry),
                  }))}
                />
                <div className={labelGapClass}>Degree</div>
                <input
                  className={inputClass}
                  value={item.degree ?? ''}
                  onChange={event => onContentChange(current => ({
                    ...current,
                    education: current.education.map((entry, entryIndex) => entryIndex === index ? { ...entry, degree: event.target.value } : entry),
                  }))}
                />
                <div className={labelGapClass}>Field</div>
                <input
                  className={inputClass}
                  value={item.field ?? ''}
                  onChange={event => onContentChange(current => ({
                    ...current,
                    education: current.education.map((entry, entryIndex) => entryIndex === index ? { ...entry, field: event.target.value } : entry),
                  }))}
                />
                <div className={labelGapClass}>Start year</div>
                <input
                  className={inputClass}
                  value={item.date.startYear ?? ''}
                  onChange={event => onContentChange(current => ({
                    ...current,
                    education: current.education.map((entry, entryIndex) => entryIndex === index ? {
                      ...entry,
                      date: { ...entry.date, startYear: event.target.value },
                    } : entry),
                  }))}
                />
                <div className={labelGapClass}>End year</div>
                <input
                  className={inputClass}
                  value={item.date.endYear ?? ''}
                  onChange={event => onContentChange(current => ({
                    ...current,
                    education: current.education.map((entry, entryIndex) => entryIndex === index ? {
                      ...entry,
                      date: { ...entry.date, endYear: event.target.value },
                    } : entry),
                  }))}
                />
                <button
                  className={removeButtonClass}
                  type="button"
                  onClick={() => onContentChange(current => ({
                    ...current,
                    education: current.education.filter((_entry, entryIndex) => entryIndex !== index),
                  }))}
                >
                  Remove education
                </button>
                {localIndex < visibleEducation.length - 1 ? <div className={dividerClass}></div> : null}
              </div>
            );
          })
        : null}

      {activeSection === 'skills'
        ? visibleSkillGroups.map((group, localIndex) => {
            const index = startIndex + localIndex;
            const usingGroups = resume.skills.groups.length > 0;
            return (
              <div key={`skills-${index}`}>
                <div className={labelClass}>Skill group</div>
                <input
                  className={inputClass}
                  value={group.groupLabel ?? ''}
                  onChange={event => onContentChange(current => {
                    if (!usingGroups) {
                      return {
                        ...current,
                        skills: {
                          ...current.skills,
                          groups: [{ groupLabel: event.target.value, items: [...current.skills.items] }],
                          mode: 'grouped',
                        },
                      };
                    }

                    return {
                      ...current,
                      skills: {
                        ...current.skills,
                        groups: current.skills.groups.map((entry, entryIndex) => entryIndex === index ? { ...entry, groupLabel: event.target.value } : entry),
                      },
                    };
                  })}
                />
                <div className={labelGapClass}>Skills</div>
                <textarea
                  className={textAreaSmClass}
                  value={usingGroups ? joinCsv(group.items) : joinCsv(resume.skills.items)}
                  onChange={event => onContentChange(current => {
                    if (!usingGroups) {
                      return {
                        ...current,
                        skills: {
                          ...current.skills,
                          items: splitCsv(event.target.value),
                        },
                      };
                    }

                    return {
                      ...current,
                      skills: {
                        ...current.skills,
                        groups: current.skills.groups.map((entry, entryIndex) => entryIndex === index ? { ...entry, items: splitCsv(event.target.value) } : entry),
                      },
                    };
                  })}
                />
                {usingGroups ? (
                  <button
                    className={removeButtonClass}
                    type="button"
                    onClick={() => onContentChange(current => ({
                      ...current,
                      skills: {
                        ...current.skills,
                        groups: current.skills.groups.filter((_entry, entryIndex) => entryIndex !== index),
                      },
                    }))}
                  >
                    Remove group
                  </button>
                ) : null}
                {localIndex < visibleSkillGroups.length - 1 ? <div className={dividerClass}></div> : null}
              </div>
            );
          })
        : null}

      {activeSection === 'projects'
        ? visibleProjects.map((item, localIndex) => {
            const index = startIndex + localIndex;
            return (
              <div key={`proj-${index}`}>
                <div className={labelClass}>Project name</div>
                <input
                  className={inputClass}
                  value={item.title ?? ''}
                  onChange={event => onContentChange(current => ({
                    ...current,
                    projects: current.projects.map((entry, entryIndex) => entryIndex === index ? { ...entry, title: event.target.value } : entry),
                  }))}
                />
                <div className={labelGapClass}>Technologies</div>
                <textarea
                  className={textAreaSmClass}
                  value={joinCsv(item.technologies)}
                  onChange={event => onContentChange(current => ({
                    ...current,
                    projects: current.projects.map((entry, entryIndex) => entryIndex === index ? {
                      ...entry,
                      technologies: splitCsv(event.target.value),
                    } : entry),
                  }))}
                />
                <div className={labelGapClass}>Bullets</div>
                <textarea
                  className={textAreaSmClass}
                  value={joinLines(item.description.bullets)}
                  onChange={event => onContentChange(current => ({
                    ...current,
                    projects: current.projects.map((entry, entryIndex) => entryIndex === index ? {
                      ...entry,
                      description: { ...entry.description, bullets: linesToArray(event.target.value) },
                    } : entry),
                  }))}
                />
                <button
                  className={removeButtonClass}
                  type="button"
                  onClick={() => onContentChange(current => ({
                    ...current,
                    projects: current.projects.filter((_entry, entryIndex) => entryIndex !== index),
                  }))}
                >
                  Remove project
                </button>
                {localIndex < visibleProjects.length - 1 ? <div className={dividerClass}></div> : null}
              </div>
            );
          })
        : null}

      {activeCustomSection ? (
        <>
          <div className={labelClass}>Section label</div>
          <input
            className={inputClass}
            value={activeCustomSection.label}
            onChange={event => onContentChange(current => ({
              ...current,
              customSections: current.customSections.map(section => section.id === activeCustomSection.id ? { ...section, label: event.target.value } : section),
            }))}
          />
          {visibleCustomEntries.map((entry, localIndex) => {
            const index = startIndex + localIndex;
            return (
              <div key={`${activeCustomSection.id}-${index}`}>
                <div className={labelGapClass}>Title</div>
                <input
                  className={inputClass}
                  value={entry.title ?? ''}
                  onChange={event => onContentChange(current => ({
                    ...current,
                    customSections: current.customSections.map(section => section.id === activeCustomSection.id ? {
                      ...section,
                      entries: section.entries.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item),
                    } : section),
                  }))}
                />
                <div className={labelGapClass}>Subtitle</div>
                <input
                  className={inputClass}
                  value={entry.subtitle ?? ''}
                  onChange={event => onContentChange(current => ({
                    ...current,
                    customSections: current.customSections.map(section => section.id === activeCustomSection.id ? {
                      ...section,
                      entries: section.entries.map((item, itemIndex) => itemIndex === index ? { ...item, subtitle: event.target.value } : item),
                    } : section),
                  }))}
                />
                <div className={labelGapClass}>Location</div>
                <input
                  className={inputClass}
                  value={entry.location ?? ''}
                  onChange={event => onContentChange(current => ({
                    ...current,
                    customSections: current.customSections.map(section => section.id === activeCustomSection.id ? {
                      ...section,
                      entries: section.entries.map((item, itemIndex) => itemIndex === index ? { ...item, location: event.target.value } : item),
                    } : section),
                  }))}
                />
                <div className={labelGapClass}>Bullets</div>
                <textarea
                  className={textAreaSmClass}
                  value={joinLines(entry.description.bullets)}
                  onChange={event => onContentChange(current => ({
                    ...current,
                    customSections: current.customSections.map(section => section.id === activeCustomSection.id ? {
                      ...section,
                      entries: section.entries.map((item, itemIndex) => itemIndex === index ? {
                        ...item,
                        description: { ...item.description, bullets: linesToArray(event.target.value) },
                      } : item),
                    } : section),
                  }))}
                />
                <button
                  className={removeButtonClass}
                  type="button"
                  onClick={() => onContentChange(current => ({
                    ...current,
                    customSections: current.customSections.map(section => section.id === activeCustomSection.id ? {
                      ...section,
                      entries: section.entries.filter((_item, itemIndex) => itemIndex !== index),
                    } : section),
                  }))}
                >
                  Remove entry
                </button>
              </div>
            );
          })}
          <button
            className={addButtonClass}
            type="button"
            onClick={() => onContentChange(current => ({
              ...current,
              customSections: current.customSections.map(section => section.id === activeCustomSection.id ? {
                ...section,
                entries: [...section.entries, {
                  date: createEmptyDateField('mm-yyyy'),
                  description: createEmptyDescriptionField('bullets'),
                  link: createEmptyLinkField(),
                  location: '',
                  subtitle: '',
                  title: '',
                }],
              } : section),
            }))}
          >
            + Add entry
          </button>
        </>
      ) : null}

      {activeSection === 'experience' ? (
        <button
          className={addButtonClass}
          type="button"
          onClick={() => onContentChange(current => ({
            ...current,
            experience: [...current.experience, createEmptyExperienceEntry()],
          }))}
        >
          + Add experience
        </button>
      ) : null}

      {activeSection === 'education' ? (
        <button
          className={addButtonClass}
          type="button"
          onClick={() => onContentChange(current => ({
            ...current,
            education: [...current.education, createEmptyEducationEntry()],
          }))}
        >
          + Add education
        </button>
      ) : null}

      {activeSection === 'skills' ? (
        <button
          className={addButtonClass}
          type="button"
          onClick={() => onContentChange(current => ({
            ...current,
            skills: {
              ...current.skills,
              groups: [...current.skills.groups, { groupLabel: '', items: [] }],
              mode: 'grouped',
            },
          }))}
        >
          + Add skills group
        </button>
      ) : null}

      {activeSection === 'projects' ? (
        <button
          className={addButtonClass}
          type="button"
          onClick={() => onContentChange(current => ({
            ...current,
            projects: [...current.projects, createEmptyProjectEntry()],
          }))}
        >
          + Add project
        </button>
      ) : null}

      {needsPagination ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--txt2)]">Page {page} of {totalPages}</div>
          <div className="flex flex-wrap gap-2">
            <button className={paginationButtonClass} type="button" onClick={onPrevPage} disabled={page === 1}>Previous</button>
            <button className={paginationButtonClass} type="button" onClick={onNextPage} disabled={page === totalPages}>Next</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
