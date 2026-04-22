import os

file_path = "C:\\Users\\josep\\Desktop\\Resume_Project\\Prototype_v2\\frontend\\src\\pages\\workspace\\editor\\components\\EditorFormPane.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    orig = f.read()

# We will read the start of the file and everything after imports to assemble the new file
import_block = """import { cn } from 'lib/cn';
import {
  createEmptyEducationEntry,
  createEmptyExperienceEntry,
  createEmptyProjectEntry,
  createEmptyCustomEntry,
  isGenericCustomSectionKey,
  type GenericCustomSectionKey,
  type CustomEntriesSection,
  type ResumeData,
  type SkillGroup,
  type EducationLevel,
  type ResultType,
  type DateFieldMode,
  type DescriptionMode,
  type MonthValue,
  type DateField,
  type DescriptionField,
  MONTH_OPTIONS,
} from 'types/resumeDocument';

function linesToArray(value: string) {
  return value
    .split('\\n')
    .map(item => item.trim())
    .filter(Boolean);
}

function joinLines(items: string[]) {
  return items.join('\\n');
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

function DateFieldEditor({ date, onChange }: { date: DateField, onChange: (date: DateField) => void }) {
  return (
    <>
      <div className={labelGapClass}>Dates Format</div>
      <select className={inputClass} value={date.mode} onChange={e => onChange({ ...date, mode: e.target.value as DateFieldMode })}>
        <option value="mm-yyyy">MM / YYYY</option>
        <option value="yyyy">YYYY</option>
        <option value="mm-yyyy-range">MM / YYYY - MM / YYYY</option>
        <option value="yyyy-range">YYYY - YYYY</option>
        <option value="mm-yyyy-present">MM / YYYY - Present</option>
        <option value="yyyy-present">YYYY - Present</option>
      </select>
      
      {date.mode.includes('mm') ? (
        <>
          <div className={labelGapClass}>Start Month</div>
          <select className={inputClass} value={date.startMonth ?? ''} onChange={e => onChange({ ...date, startMonth: e.target.value as MonthValue })}>
            <option value="">Select Month</option>
            {MONTH_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </>
      ) : null}
      
      <div className={labelGapClass}>Start Year</div>
      <input className={inputClass} placeholder="YYYY" value={date.startYear ?? ''} onChange={e => onChange({ ...date, startYear: e.target.value })} />
      
      {date.mode.includes('range') && !date.isOngoing ? (
        <>
          {date.mode.includes('mm') ? (
            <>
              <div className={labelGapClass}>End Month</div>
              <select className={inputClass} value={date.endMonth ?? ''} onChange={e => onChange({ ...date, endMonth: e.target.value as MonthValue })}>
                <option value="">Select Month</option>
                {MONTH_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </>
          ) : null}
          <div className={labelGapClass}>End Year</div>
          <input className={inputClass} placeholder="YYYY" value={date.endYear ?? ''} onChange={e => onChange({ ...date, endYear: e.target.value })} />
        </>
      ) : null}
      
      {date.mode.includes('range') || date.mode.includes('present') ? (
        <div className="mt-4 flex items-center gap-2">
          <input type="checkbox" id="isOngoing" checked={!!date.isOngoing} onChange={e => onChange({ ...date, isOngoing: e.target.checked })} />
          <label htmlFor="isOngoing" className="text-sm font-semibold">Ongoing / Present</label>
        </div>
      ) : null}
    </>
  );
}

function DescriptionFieldEditor({ description, onChange }: { description: DescriptionField, onChange: (desc: DescriptionField) => void }) {
  return (
    <>
      <div className={labelGapClass}>Description</div>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() => onChange({ ...description, mode: 'bullets' })}
          className={description.mode === 'bullets' ? 'rounded-full bg-charcoal/10 px-3 py-1 text-sm font-bold' : 'rounded-full px-3 py-1 text-sm transition hover:bg-charcoal/5'}
        >
          Bullets
        </button>
        <button
          type="button"
          onClick={() => onChange({ ...description, mode: 'paragraph' })}
          className={description.mode === 'paragraph' ? 'rounded-full bg-charcoal/10 px-3 py-1 text-sm font-bold' : 'rounded-full px-3 py-1 text-sm transition hover:bg-charcoal/5'}
        >
          Paragraph
        </button>
      </div>

      {description.mode === 'paragraph' ? (
        <textarea
          className={`${textAreaSmClass} mt-3`}
          placeholder="Write a concise paragraph..."
          value={description.paragraph ?? ''}
          onChange={e => onChange({ ...description, paragraph: e.target.value })}
        />
      ) : (
        <>
          {description.bullets.map((b, i) => (
             <div key={i} className="mt-3 flex items-start gap-2">
               <textarea
                 className={cn(inputClass, 'min-h-12 flex-1 resize-y')}
                 value={b}
                 placeholder="Write a bullet line"
                 onChange={e => {
                    const newBullets = [...description.bullets];
                    newBullets[i] = e.target.value;
                    onChange({ ...description, bullets: newBullets });
                 }}
               />
               <button
                 type="button"
                 className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 transition hover:bg-red-100"
                 onClick={() => {
                    const newBullets = description.bullets.filter((_, bi) => bi !== i);
                    onChange({ ...description, bullets: newBullets });
                 }}
               >
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
               </button>
             </div>
          ))}
          <button type="button" className={addButtonClass} onClick={() => onChange({ ...description, bullets: [...description.bullets, ''] })}>
            + Add bullet
          </button>
        </>
      )}
    </>
  );
}

export function EditorFormPane({
  activeSection,
  page,
  totalPages,
  resume,
  onPrevPage,
  onNextPage,
  onContentChange,
  className,
}: {
  activeSection: string;
  page: number;
  totalPages: number;
  resume: ResumeData;
  onPrevPage: () => void;
  onNextPage: () => void;
  onContentChange: (updater: (current: ResumeData) => ResumeData) => void;
  className?: string;
}) {
  const startIndex = clampStart(page);
  const visibleExperience = resume.experience.slice(startIndex, startIndex + 5);
  const visibleEducation = resume.education.slice(startIndex, startIndex + 5);
  const visibleSkillGroups = (resume.skills.groups.length
    ? resume.skills.groups
    : [{ groupLabel: 'Core Skills', items: resume.skills.items }] as SkillGroup[]).slice(startIndex, startIndex + 5);
  const visibleProjects = resume.projects.slice(startIndex, startIndex + 5);
  const isCustom = isGenericCustomSectionKey(activeSection);
  const activeCustomSectionData: CustomEntriesSection | null = isCustom ? resume[activeSection as GenericCustomSectionKey] : null;
  const visibleCustomEntries = activeCustomSectionData?.entries.slice(startIndex, startIndex + 5) ?? [];
  const needsPagination =
    ['experience', 'education', 'skills', 'projects'].includes(activeSection) || isCustom;

  return (
    <div className={cn('grid gap-3 rounded-[1.5rem] border-[1.5px] border-charcoal/75 bg-white/85 p-4 shadow-tactile-sm', className)}>
      {activeSection === 'contact' ? (
        <>
          <div className={labelClass}>Full name</div>
          <input
            className={inputClass}
            placeholder="Enter your full name"
            value={resume.header.name ?? ''}
            onChange={event => onContentChange(current => ({ ...current, header: { ...current.header, name: event.target.value } }))}
          />
          <div className={labelGapClass}>Role</div>
          <input
            className={inputClass}
            placeholder="Add the target role or headline"
            value={resume.header.role ?? ''}
            onChange={event => onContentChange(current => ({ ...current, header: { ...current.header, role: event.target.value } }))}
          />
          <div className={labelGapClass}>Email</div>
          <input
            className={inputClass}
            placeholder="Add an email address"
            value={resume.header.email ?? ''}
            onChange={event => onContentChange(current => ({ ...current, header: { ...current.header, email: event.target.value } }))}
          />
          <div className={labelGapClass}>Phone</div>
          <input
            className={inputClass}
            placeholder="Add a phone number"
            value={resume.header.phone ?? ''}
            onChange={event => onContentChange(current => ({ ...current, header: { ...current.header, phone: event.target.value } }))}
          />
          <div className={labelGapClass}>Location</div>
          <input
            className={inputClass}
            placeholder="City, State or a concise address"
            value={resume.header.address ?? ''}
            onChange={event => onContentChange(current => ({ ...current, header: { ...current.header, address: event.target.value } }))}
          />
          <div className={labelGapClass}>LinkedIn</div>
          <input
            className={inputClass}
            placeholder="Paste the full public URL"
            value={resume.header.linkedin.url ?? ''}
            onChange={event =>
              onContentChange(current => ({
                ...current,
                header: { ...current.header, linkedin: { ...current.header.linkedin, url: event.target.value } },
              }))
            }
          />
          <div className={labelGapClass}>GitHub</div>
          <input
            className={inputClass}
            placeholder="Paste the full public URL"
            value={resume.header.github.url ?? ''}
            onChange={event =>
              onContentChange(current => ({
                ...current,
                header: { ...current.header, github: { ...current.header.github, url: event.target.value } },
              }))
            }
          />
          <div className={labelGapClass}>Website/Portfolio</div>
          <input
            className={inputClass}
            placeholder="Paste the full public URL"
            value={resume.header.website.url ?? ''}
            onChange={event =>
              onContentChange(current => ({
                ...current,
                header: { ...current.header, website: { ...current.header.website, url: event.target.value } },
              }))
            }
          />
        </>
      ) : null}

      {activeSection === 'summary' ? (
        <>
          <div className={labelClass}>Professional summary</div>
          <textarea
            className={textAreaMdClass}
            placeholder="Write 2-4 sentences that quickly explain who you are, what you do well, and the kind of role this resume is targeting."
            value={resume.summary.content ?? ''}
            onChange={event => onContentChange(current => ({ ...current, summary: { ...current.summary, content: event.target.value } }))}
          />
        </>
      ) : null}

      {activeSection === 'experience'
        ? visibleExperience.map((item, localIndex) => {
            const index = startIndex + localIndex;
            return (
              <div key={`exp-${index}`}>
                <div className="flex items-center justify-between">
                   <div className={labelClass}>Company</div>
                   <button
                     type="button"
                     className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600 transition hover:bg-red-100"
                     onClick={() =>
                       onContentChange(current => ({
                         ...current,
                         experience: current.experience.filter((_, entryIndex) => entryIndex !== index),
                       }))
                     }
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                   </button>
                </div>
                <input
                  className={inputClass}
                  placeholder="Company name"
                  value={item.company ?? ''}
                  onChange={event =>
                    onContentChange(current => ({
                      ...current,
                      experience: current.experience.map((entry, entryIndex) => (entryIndex === index ? { ...entry, company: event.target.value } : entry)),
                    }))
                  }
                />
                <div className={labelGapClass}>Role</div>
                <input
                  className={inputClass}
                  placeholder="Job title or role"
                  value={item.role ?? ''}
                  onChange={event =>
                    onContentChange(current => ({
                      ...current,
                      experience: current.experience.map((entry, entryIndex) => (entryIndex === index ? { ...entry, role: event.target.value } : entry)),
                    }))
                  }
                />
                <div className={labelGapClass}>Location</div>
                <input
                  className={inputClass}
                  placeholder="City, State"
                  value={item.location ?? ''}
                  onChange={event =>
                    onContentChange(current => ({
                      ...current,
                      experience: current.experience.map((entry, entryIndex) =>
                        entryIndex === index ? { ...entry, location: event.target.value } : entry,
                      ),
                    }))
                  }
                />
                
                <DateFieldEditor 
                  date={item.date} 
                  onChange={newDate => onContentChange(current => ({
                    ...current,
                    experience: current.experience.map((entry, entryIndex) =>
                      entryIndex === index ? { ...entry, date: newDate } : entry,
                    ),
                  }))} 
                />

                <DescriptionFieldEditor 
                  description={item.description}
                  onChange={newDesc => onContentChange(current => ({
                    ...current,
                    experience: current.experience.map((entry, entryIndex) =>
                      entryIndex === index ? { ...entry, description: newDesc } : entry,
                    ),
                  }))} 
                />
                
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
                 <div className="flex items-center justify-between">
                   <div className={labelClass}>Institution</div>
                   <button
                     type="button"
                     className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600 transition hover:bg-red-100"
                     onClick={() =>
                       onContentChange(current => ({
                         ...current,
                         education: current.education.filter((_, entryIndex) => entryIndex !== index),
                       }))
                     }
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                   </button>
                </div>
                <input
                  className={inputClass}
                  placeholder="University or College"
                  value={item.institution ?? ''}
                  onChange={event =>
                    onContentChange(current => ({
                      ...current,
                      education: current.education.map((entry, entryIndex) =>
                        entryIndex === index ? { ...entry, institution: event.target.value } : entry,
                      ),
                    }))
                  }
                />
                <div className={labelGapClass}>Level</div>
                <select 
                  className={inputClass} 
                  value={item.level} 
                  onChange={event =>
                    onContentChange(current => ({
                      ...current,
                      education: current.education.map((entry, entryIndex) =>
                        entryIndex === index ? { ...entry, level: event.target.value as EducationLevel } : entry,
                      ),
                    }))
                  }
                >
                  <option value="degree-diploma">Degree / Diploma</option>
                  <option value="class-12">Class 12 / Intermediate</option>
                  <option value="class-10">Class 10 / Matriculation</option>
                  <option value="other">Other</option>
                </select>

                <div className={labelGapClass}>Degree</div>
                <input
                  className={inputClass}
                  placeholder="e.g. B.S., Master of Arts"
                  value={item.degree ?? ''}
                  onChange={event =>
                    onContentChange(current => ({
                      ...current,
                      education: current.education.map((entry, entryIndex) =>
                        entryIndex === index ? { ...entry, degree: event.target.value } : entry,
                      ),
                    }))
                  }
                />
                <div className={labelGapClass}>Field</div>
                <input
                  className={inputClass}
                  placeholder="e.g. Computer Science"
                  value={item.field ?? ''}
                  onChange={event =>
                    onContentChange(current => ({
                      ...current,
                      education: current.education.map((entry, entryIndex) =>
                        entryIndex === index ? { ...entry, field: event.target.value } : entry,
                      ),
                    }))
                  }
                />
                
                <div className={labelGapClass}>Result Type</div>
                <select 
                  className={inputClass} 
                  value={item.resultType ?? 'not-disclosed'} 
                  onChange={event =>
                    onContentChange(current => ({
                      ...current,
                      education: current.education.map((entry, entryIndex) =>
                        entryIndex === index ? { ...entry, resultType: event.target.value as ResultType } : entry,
                      ),
                    }))
                  }
                >
                  <option value="cgpa-10">CGPA (10.0)</option>
                  <option value="gpa-4">GPA (4.0)</option>
                  <option value="percentage">Percentage</option>
                  <option value="grade">Grade</option>
                  <option value="not-disclosed">Not Disclosed</option>
                </select>
                
                {item.resultType && item.resultType !== 'not-disclosed' ? (
                  <>
                    <div className={labelGapClass}>Result Value</div>
                    <input
                      className={inputClass}
                      placeholder="e.g. 8.5 or 90%"
                      value={item.result ?? ''}
                      onChange={event =>
                        onContentChange(current => ({
                          ...current,
                          education: current.education.map((entry, entryIndex) =>
                            entryIndex === index ? { ...entry, result: event.target.value } : entry,
                          ),
                        }))
                      }
                    />
                  </>
                ) : null}

                <DateFieldEditor 
                  date={item.date} 
                  onChange={newDate => onContentChange(current => ({
                    ...current,
                    education: current.education.map((entry, entryIndex) =>
                      entryIndex === index ? { ...entry, date: newDate } : entry,
                    ),
                  }))} 
                />

                {localIndex < visibleEducation.length - 1 ? <div className={dividerClass}></div> : null}
              </div>
            );
          })
        : null}

      {activeSection === 'skills' ? (
        <>
          <div className="mb-4 flex gap-2">
             <button
               type="button"
               onClick={() => onContentChange(current => ({ ...current, skills: { ...current.skills, mode: 'csv' } }))}
               className={resume.skills.mode === 'csv' ? 'rounded-full bg-charcoal/10 px-4 py-2 text-sm font-bold' : 'rounded-full px-4 py-2 text-sm transition hover:bg-charcoal/5'}
             >
               CSV
             </button>
             <button
               type="button"
               onClick={() => onContentChange(current => ({ ...current, skills: { ...current.skills, mode: 'grouped' } }))}
               className={resume.skills.mode === 'grouped' ? 'rounded-full bg-charcoal/10 px-4 py-2 text-sm font-bold' : 'rounded-full px-4 py-2 text-sm transition hover:bg-charcoal/5'}
             >
               Grouped
             </button>
          </div>
          {visibleSkillGroups.map((group, localIndex) => {
            const index = startIndex + localIndex;
            const usingGroups = resume.skills.mode === 'grouped';
            return (
              <div key={`skills-${index}`}>
                {usingGroups ? (
                  <div className="flex items-center justify-between">
                     <div className={labelClass}>Skill group</div>
                     <button
                       type="button"
                       className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600 transition hover:bg-red-100"
                       onClick={() =>
                         onContentChange(current => ({
                           ...current,
                           skills: {
                             ...current.skills,
                             groups: current.skills.groups.filter((_, entryIndex) => entryIndex !== index),
                           },
                         }))
                       }
                     >
                       <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                     </button>
                  </div>
                ) : (
                   <div className={labelClass}>Skills CSV</div>
                )}
                {usingGroups ? (
                   <input
                     className={inputClass}
                     placeholder="Name the bucket (e.g. Frontend)"
                     value={group.groupLabel ?? ''}
                     onChange={event =>
                       onContentChange(current => {
                         return {
                           ...current,
                           skills: {
                             ...current.skills,
                             groups: current.skills.groups.map((entry, entryIndex) =>
                               entryIndex === index ? { ...entry, groupLabel: event.target.value } : entry,
                             ),
                           },
                         };
                       })
                     }
                   />
                ) : null}
                <div className={labelGapClass}>Skills</div>
                <textarea
                  className={textAreaSmClass}
                  placeholder="Add comma separated skills"
                  value={usingGroups ? joinCsv(group.items) : joinCsv(resume.skills.items)}
                  onChange={event =>
                    onContentChange(current => {
                      if (!usingGroups) {
                        return {
                          ...current,
                          skills: { ...current.skills, items: splitCsv(event.target.value) },
                        };
                      }

                      return {
                        ...current,
                        skills: {
                          ...current.skills,
                          groups: current.skills.groups.map((entry, entryIndex) =>
                            entryIndex === index ? { ...entry, items: splitCsv(event.target.value) } : entry,
                          ),
                        },
                      };
                    })
                  }
                />
                
                {localIndex < visibleSkillGroups.length - 1 && usingGroups ? <div className={dividerClass}></div> : null}
              </div>
            );
          })}
        </>
      ) : null}

      {activeSection === 'projects'
        ? visibleProjects.map((item, localIndex) => {
            const index = startIndex + localIndex;
            return (
              <div key={`proj-${index}`}>
                 <div className="flex items-center justify-between">
                   <div className={labelClass}>Project name</div>
                   <button
                     type="button"
                     className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600 transition hover:bg-red-100"
                     onClick={() =>
                       onContentChange(current => ({
                         ...current,
                         projects: current.projects.filter((_, entryIndex) => entryIndex !== index),
                       }))
                     }
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                   </button>
                </div>
                <input
                  className={inputClass}
                  placeholder="Add project name"
                  value={item.title ?? ''}
                  onChange={event =>
                    onContentChange(current => ({
                      ...current,
                      projects: current.projects.map((entry, entryIndex) => (entryIndex === index ? { ...entry, title: event.target.value } : entry)),
                    }))
                  }
                />
                
                <DateFieldEditor 
                  date={item.date} 
                  onChange={newDate => onContentChange(current => ({
                    ...current,
                    projects: current.projects.map((entry, entryIndex) =>
                      entryIndex === index ? { ...entry, date: newDate } : entry,
                    ),
                  }))} 
                />

                <div className={labelGapClass}>Github Link</div>
                <input
                  className={inputClass}
                  placeholder="Paste the full public URL"
                  value={item.github.url ?? ''}
                  onChange={event =>
                    onContentChange(current => ({
                      ...current,
                      projects: current.projects.map((entry, entryIndex) => (entryIndex === index ? { ...entry, github: { url: event.target.value } } : entry)),
                    }))
                  }
                />

                <div className={labelGapClass}>Live Link</div>
                <input
                  className={inputClass}
                  placeholder="Paste the full public URL"
                  value={item.link.url ?? ''}
                  onChange={event =>
                    onContentChange(current => ({
                      ...current,
                      projects: current.projects.map((entry, entryIndex) => (entryIndex === index ? { ...entry, link: { url: event.target.value } } : entry)),
                    }))
                  }
                />

                <div className={labelGapClass}>Technologies</div>
                <textarea
                  className={textAreaSmClass}
                  placeholder="React, Typescript, etc..."
                  value={joinCsv(item.technologies)}
                  onChange={event =>
                    onContentChange(current => ({
                      ...current,
                      projects: current.projects.map((entry, entryIndex) =>
                        entryIndex === index ? { ...entry, technologies: splitCsv(event.target.value) } : entry,
                      ),
                    }))
                  }
                />
                
                <DescriptionFieldEditor 
                  description={item.description}
                  onChange={newDesc => onContentChange(current => ({
                    ...current,
                    projects: current.projects.map((entry, entryIndex) =>
                      entryIndex === index ? { ...entry, description: newDesc } : entry,
                    ),
                  }))} 
                />

                {localIndex < visibleProjects.length - 1 ? <div className={dividerClass}></div> : null}
              </div>
            );
          })
        : null}

      {isCustom && activeCustomSectionData ? (
        <>
          <div className={labelClass}>Section label</div>
          <input
            className={inputClass}
            placeholder="Edit section name"
            value={activeCustomSectionData.label}
            onChange={event =>
              onContentChange(current => ({
                ...current,
                [activeSection]: {
                  ...(current[activeSection as GenericCustomSectionKey]),
                  label: event.target.value,
                },
              }))
            }
          />
          {visibleCustomEntries.map((entry, localIndex) => {
            const index = startIndex + localIndex;
            return (
              <div key={`${activeSection}-${index}`}>
                <div className="flex items-center justify-between mt-4">
                   <div className={labelClass}>Entry Title</div>
                   <button
                     type="button"
                     className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600 transition hover:bg-red-100"
                     onClick={() =>
                       onContentChange(current => ({
                         ...current,
                         [activeSection]: {
                           ...(current[activeSection as GenericCustomSectionKey]),
                           entries: current[activeSection as GenericCustomSectionKey].entries.filter((_, itemIndex) => itemIndex !== index),
                         },
                       }))
                     }
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                   </button>
                </div>
                <input
                  className={inputClass}
                  placeholder="Add the role, award, or name"
                  value={entry.title ?? ''}
                  onChange={event =>
                    onContentChange(current => ({
                      ...current,
                      [activeSection]: {
                        ...(current[activeSection as GenericCustomSectionKey]),
                        entries: current[activeSection as GenericCustomSectionKey].entries.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, title: event.target.value } : item
                        ),
                      },
                    }))
                  }
                />
                
                <DateFieldEditor 
                  date={entry.date} 
                  onChange={newDate => onContentChange(current => ({
                    ...current,
                    [activeSection]: {
                      ...(current[activeSection as GenericCustomSectionKey]),
                      entries: current[activeSection as GenericCustomSectionKey].entries.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, date: newDate } : item
                      ),
                    },
                  }))} 
                />

                <div className={labelGapClass}>Link</div>
                <input
                  className={inputClass}
                  placeholder="Paste the full public URL"
                  value={entry.link.url ?? ''}
                  onChange={event =>
                     onContentChange(current => ({
                      ...current,
                      [activeSection]: {
                        ...(current[activeSection as GenericCustomSectionKey]),
                        entries: current[activeSection as GenericCustomSectionKey].entries.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, link: { url: event.target.value } } : item
                        ),
                      },
                    }))
                  }
                />
                
                <DescriptionFieldEditor 
                  description={entry.description}
                  onChange={newDesc => onContentChange(current => ({
                    ...current,
                    [activeSection]: {
                      ...(current[activeSection as GenericCustomSectionKey]),
                      entries: current[activeSection as GenericCustomSectionKey].entries.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, description: newDesc } : item
                      ),
                    },
                  }))} 
                />
                
                {localIndex < visibleCustomEntries.length - 1 ? <div className={dividerClass}></div> : null}
              </div>
            );
          })}
          <button
            className={addButtonClass}
            type="button"
            onClick={() =>
              onContentChange(current => ({
                ...current,
                [activeSection]: {
                  ...(current[activeSection as GenericCustomSectionKey]),
                  entries: [
                    ...current[activeSection as GenericCustomSectionKey].entries,
                    createEmptyCustomEntry(),
                  ],
                },
              }))
            }
          >
            + Add entry
          </button>
        </>
      ) : null}

      {activeSection === 'experience' ? (
        <button className={addButtonClass} type="button" onClick={() => onContentChange(current => ({ ...current, experience: [...current.experience, createEmptyExperienceEntry()] }))}>
          + Add experience
        </button>
      ) : null}

      {activeSection === 'education' ? (
        <button className={addButtonClass} type="button" onClick={() => onContentChange(current => ({ ...current, education: [...current.education, createEmptyEducationEntry()] }))}>
          + Add education
        </button>
      ) : null}

      {activeSection === 'skills' && resume.skills.mode === "grouped" ? (
        <button
          className={addButtonClass}
          type="button"
          onClick={() =>
            onContentChange(current => ({
              ...current,
              skills: {
                ...current.skills,
                groups: [...current.skills.groups, { groupLabel: '', items: [] }],
              },
            }))
          }
        >
          + Add skills group
        </button>
      ) : null}

      {activeSection === 'projects' ? (
        <button className={addButtonClass} type="button" onClick={() => onContentChange(current => ({ ...current, projects: [...current.projects, createEmptyProjectEntry()] }))}>
          + Add project
        </button>
      ) : null}

      {needsPagination ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--txt2)]">Page {page} of {totalPages}</div>
          <div className="flex flex-wrap gap-2">
            <button className={paginationButtonClass} type="button" onClick={onPrevPage} disabled={page === 1}>
              Previous
            </button>
            <button className={paginationButtonClass} type="button" onClick={onNextPage} disabled={page === totalPages}>
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
"""

with open(file_path, "w", encoding="utf-8") as f:
    f.write(import_block)

print("Rewritten securely!")
