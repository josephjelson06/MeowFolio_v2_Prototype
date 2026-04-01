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
    <div className="form-area">
      {activeSection === 'contact' ? (
        <>
          <div className="fl">Full name</div>
          <input
            className="fi"
            value={resume.header.name ?? ''}
            onChange={event => onContentChange(current => ({
              ...current,
              header: { ...current.header, name: event.target.value },
            }))}
          />
          <div className="fl editor-field-gap">Role</div>
          <input
            className="fi"
            value={resume.header.role ?? ''}
            onChange={event => onContentChange(current => ({
              ...current,
              header: { ...current.header, role: event.target.value },
            }))}
          />
          <div className="fl editor-field-gap">Email</div>
          <input
            className="fi"
            value={resume.header.email ?? ''}
            onChange={event => onContentChange(current => ({
              ...current,
              header: { ...current.header, email: event.target.value },
            }))}
          />
          <div className="fl editor-field-gap">Phone</div>
          <input
            className="fi"
            value={resume.header.phone ?? ''}
            onChange={event => onContentChange(current => ({
              ...current,
              header: { ...current.header, phone: event.target.value },
            }))}
          />
          <div className="fl editor-field-gap">Location</div>
          <input
            className="fi"
            value={resume.header.address ?? ''}
            onChange={event => onContentChange(current => ({
              ...current,
              header: { ...current.header, address: event.target.value },
            }))}
          />
          <div className="fl editor-field-gap">LinkedIn</div>
          <input
            className="fi"
            value={resume.header.linkedin.url ?? ''}
            onChange={event => onContentChange(current => ({
              ...current,
              header: {
                ...current.header,
                linkedin: { ...current.header.linkedin, url: event.target.value },
              },
            }))}
          />
          <div className="fl editor-field-gap">GitHub</div>
          <input
            className="fi"
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
          <div className="fl">Professional summary</div>
          <textarea
            className="fi editor-ta-md"
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
                <div className="fl">Company</div>
                <input
                  className="fi"
                  value={item.company ?? ''}
                  onChange={event => onContentChange(current => ({
                    ...current,
                    experience: current.experience.map((entry, entryIndex) => entryIndex === index ? { ...entry, company: event.target.value } : entry),
                  }))}
                />
                <div className="fl editor-field-gap">Role</div>
                <input
                  className="fi"
                  value={item.role ?? ''}
                  onChange={event => onContentChange(current => ({
                    ...current,
                    experience: current.experience.map((entry, entryIndex) => entryIndex === index ? { ...entry, role: event.target.value } : entry),
                  }))}
                />
                <div className="fl editor-field-gap">Location</div>
                <input
                  className="fi"
                  value={item.location ?? ''}
                  onChange={event => onContentChange(current => ({
                    ...current,
                    experience: current.experience.map((entry, entryIndex) => entryIndex === index ? { ...entry, location: event.target.value } : entry),
                  }))}
                />
                <div className="fl editor-field-gap">Start year</div>
                <input
                  className="fi"
                  value={item.date.startYear ?? ''}
                  onChange={event => onContentChange(current => ({
                    ...current,
                    experience: current.experience.map((entry, entryIndex) => entryIndex === index ? {
                      ...entry,
                      date: { ...entry.date, startYear: event.target.value },
                    } : entry),
                  }))}
                />
                <div className="fl editor-field-gap">End year</div>
                <input
                  className="fi"
                  value={item.date.endYear ?? ''}
                  onChange={event => onContentChange(current => ({
                    ...current,
                    experience: current.experience.map((entry, entryIndex) => entryIndex === index ? {
                      ...entry,
                      date: { ...entry.date, endYear: event.target.value },
                    } : entry),
                  }))}
                />
                <div className="fl editor-field-gap">Bullets</div>
                <textarea
                  className="fi editor-ta-sm"
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
                  className="r-action editor-field-gap"
                  type="button"
                  onClick={() => onContentChange(current => ({
                    ...current,
                    experience: current.experience.filter((_entry, entryIndex) => entryIndex !== index),
                  }))}
                >
                  Remove experience
                </button>
                {localIndex < visibleExperience.length - 1 ? <div className="editor-field-gap"></div> : null}
              </div>
            );
          })
        : null}

      {activeSection === 'education'
        ? visibleEducation.map((item, localIndex) => {
            const index = startIndex + localIndex;
            return (
              <div key={`edu-${index}`}>
                <div className="fl">Institution</div>
                <input
                  className="fi"
                  value={item.institution ?? ''}
                  onChange={event => onContentChange(current => ({
                    ...current,
                    education: current.education.map((entry, entryIndex) => entryIndex === index ? { ...entry, institution: event.target.value } : entry),
                  }))}
                />
                <div className="fl editor-field-gap">Degree</div>
                <input
                  className="fi"
                  value={item.degree ?? ''}
                  onChange={event => onContentChange(current => ({
                    ...current,
                    education: current.education.map((entry, entryIndex) => entryIndex === index ? { ...entry, degree: event.target.value } : entry),
                  }))}
                />
                <div className="fl editor-field-gap">Field</div>
                <input
                  className="fi"
                  value={item.field ?? ''}
                  onChange={event => onContentChange(current => ({
                    ...current,
                    education: current.education.map((entry, entryIndex) => entryIndex === index ? { ...entry, field: event.target.value } : entry),
                  }))}
                />
                <div className="fl editor-field-gap">Start year</div>
                <input
                  className="fi"
                  value={item.date.startYear ?? ''}
                  onChange={event => onContentChange(current => ({
                    ...current,
                    education: current.education.map((entry, entryIndex) => entryIndex === index ? {
                      ...entry,
                      date: { ...entry.date, startYear: event.target.value },
                    } : entry),
                  }))}
                />
                <div className="fl editor-field-gap">End year</div>
                <input
                  className="fi"
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
                  className="r-action editor-field-gap"
                  type="button"
                  onClick={() => onContentChange(current => ({
                    ...current,
                    education: current.education.filter((_entry, entryIndex) => entryIndex !== index),
                  }))}
                >
                  Remove education
                </button>
                {localIndex < visibleEducation.length - 1 ? <div className="editor-field-gap"></div> : null}
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
                <div className="fl">Skill group</div>
                <input
                  className="fi"
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
                <div className="fl editor-field-gap">Skills</div>
                <textarea
                  className="fi editor-ta-sm"
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
                    className="r-action editor-field-gap"
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
                {localIndex < visibleSkillGroups.length - 1 ? <div className="editor-field-gap"></div> : null}
              </div>
            );
          })
        : null}

      {activeSection === 'projects'
        ? visibleProjects.map((item, localIndex) => {
            const index = startIndex + localIndex;
            return (
              <div key={`proj-${index}`}>
                <div className="fl">Project name</div>
                <input
                  className="fi"
                  value={item.title ?? ''}
                  onChange={event => onContentChange(current => ({
                    ...current,
                    projects: current.projects.map((entry, entryIndex) => entryIndex === index ? { ...entry, title: event.target.value } : entry),
                  }))}
                />
                <div className="fl editor-field-gap">Technologies</div>
                <textarea
                  className="fi editor-ta-sm"
                  value={joinCsv(item.technologies)}
                  onChange={event => onContentChange(current => ({
                    ...current,
                    projects: current.projects.map((entry, entryIndex) => entryIndex === index ? {
                      ...entry,
                      technologies: splitCsv(event.target.value),
                    } : entry),
                  }))}
                />
                <div className="fl editor-field-gap">Bullets</div>
                <textarea
                  className="fi editor-ta-sm"
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
                  className="r-action editor-field-gap"
                  type="button"
                  onClick={() => onContentChange(current => ({
                    ...current,
                    projects: current.projects.filter((_entry, entryIndex) => entryIndex !== index),
                  }))}
                >
                  Remove project
                </button>
                {localIndex < visibleProjects.length - 1 ? <div className="editor-field-gap"></div> : null}
              </div>
            );
          })
        : null}

      {activeCustomSection ? (
        <>
          <div className="fl">Section label</div>
          <input
            className="fi"
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
                <div className="fl editor-field-gap">Title</div>
                <input
                  className="fi"
                  value={entry.title ?? ''}
                  onChange={event => onContentChange(current => ({
                    ...current,
                    customSections: current.customSections.map(section => section.id === activeCustomSection.id ? {
                      ...section,
                      entries: section.entries.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item),
                    } : section),
                  }))}
                />
                <div className="fl editor-field-gap">Subtitle</div>
                <input
                  className="fi"
                  value={entry.subtitle ?? ''}
                  onChange={event => onContentChange(current => ({
                    ...current,
                    customSections: current.customSections.map(section => section.id === activeCustomSection.id ? {
                      ...section,
                      entries: section.entries.map((item, itemIndex) => itemIndex === index ? { ...item, subtitle: event.target.value } : item),
                    } : section),
                  }))}
                />
                <div className="fl editor-field-gap">Location</div>
                <input
                  className="fi"
                  value={entry.location ?? ''}
                  onChange={event => onContentChange(current => ({
                    ...current,
                    customSections: current.customSections.map(section => section.id === activeCustomSection.id ? {
                      ...section,
                      entries: section.entries.map((item, itemIndex) => itemIndex === index ? { ...item, location: event.target.value } : item),
                    } : section),
                  }))}
                />
                <div className="fl editor-field-gap">Bullets</div>
                <textarea
                  className="fi editor-ta-sm"
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
                  className="r-action editor-field-gap"
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
            className="fi-add"
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
          className="fi-add"
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
          className="fi-add"
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
          className="fi-add"
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
          className="fi-add"
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
        <div className="list-pagination">
          <div className="page-status">Page {page} of {totalPages}</div>
          <div className="page-controls">
            <button className="r-action" type="button" onClick={onPrevPage} disabled={page === 1}>Previous</button>
            <button className="r-action" type="button" onClick={onNextPage} disabled={page === totalPages}>Next</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
