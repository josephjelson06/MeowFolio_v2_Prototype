import { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import { cn } from 'lib/cn';
import { routes } from 'lib/routes';
import { WorkspaceShell } from 'components/workspace/WorkspaceShell';
import { usePageViewportMode } from 'pages/workspace/editor/hooks/usePageViewportMode';
import { leftTabs, type EditorSectionItem, type ToolbarValues } from 'pages/workspace/editor/types';
import { clearDraft, createFallbackRecord, editableSnapshot, readDraft, writeDraft } from 'pages/workspace/editor/utils/editorDraft';
import { countForSection, sectionList } from 'pages/workspace/editor/utils/editorSections';
import { applyToolbarValues, toolbarFromRenderOptions } from 'pages/workspace/editor/utils/editorToolbar';
import { resumeService } from 'services/resumeService';
import { templateService } from 'services/templateService';
import { useSession } from 'state/session/sessionContext';
import type { TemplateRecord } from 'types/template';
import {
  buildResumePlainText,
  createEmptyDateField,
  createEmptyDescriptionField,
  createEmptyEducationEntry,
  createEmptyExperienceEntry,
  createEmptyLinkField,
  createEmptyProjectEntry,
  DEFAULT_RENDER_OPTIONS,
  type AtsScoreResponse,
  type RenderTemplateId,
  type ResumeData,
  type ResumeDocumentRecord,
  type SkillGroup,
} from 'types/resumeDocument';

const mobileTabClass =
  'flex-1 rounded-full border-2 border-charcoal/70 px-4 py-2 font-headline text-[11px] font-bold uppercase tracking-[0.12em] transition';
const desktopModeClass =
  'inline-flex min-h-10 items-center justify-center rounded-full border-2 px-4 py-2 font-headline text-[11px] font-bold uppercase tracking-[0.12em] transition';

function EditorMobileTopbar({
  title,
  onAnalyze,
}: {
  title: string;
  onAnalyze: () => void;
}) {
  const { initials } = useSession();

  return (
    <div className="mb-4 flex items-center gap-3 rounded-[1.4rem] border-[1.5px] border-charcoal/75 bg-white/90 px-4 py-3 shadow-tactile md:hidden">
      <NavLink className="grid size-10 place-items-center rounded-full border border-outline bg-white text-xl text-on-surface" to={routes.resumes}>
        &larr;
      </NavLink>
      <span className="min-w-0 flex-1 truncate font-headline text-lg font-extrabold text-on-surface">{title}</span>
      <button
        className="inline-flex min-h-9 items-center justify-center rounded-full border-2 border-charcoal/75 bg-white/90 px-3 py-1.5 font-headline text-[11px] font-bold shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:bg-white"
        type="button"
        onClick={onAnalyze}
      >
        Analyze
      </button>
      <NavLink className="grid size-10 place-items-center rounded-full border border-outline bg-surface text-sm font-semibold text-secondary" to={routes.profile}>
        {initials}
      </NavLink>
    </div>
  );
}

const miniButtonClass =
  'inline-flex size-8 items-center justify-center rounded-full border border-outline bg-white text-xs font-bold text-[color:var(--txt1)] transition hover:bg-surface disabled:pointer-events-none disabled:opacity-40';
const toolbarFonts = ['TeX Gyre Termes', 'Computer Modern', 'Palatino', 'Helvetica', 'Libertine'];

function SectionNav({
  sections,
  activeSection,
  onSelect,
  onAddCustomSection,
  onMoveSection,
  onRemoveSection,
  canMoveUp,
  canMoveDown,
}: {
  sections: EditorSectionItem[];
  activeSection: string;
  onSelect: (section: string) => void;
  onAddCustomSection: () => void;
  onMoveSection: (section: string, direction: 'up' | 'down') => void;
  onRemoveSection: (section: string) => void;
  canMoveUp: (section: string) => boolean;
  canMoveDown: (section: string) => boolean;
}) {
  return (
    <div className="grid gap-3 rounded-[1.5rem] border-[1.5px] border-charcoal/75 bg-white/85 p-4 shadow-tactile-sm">
      <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Sections</div>
      <div className="grid gap-2">
        {sections.map(section => (
          <div className="flex items-center gap-2" key={section.id}>
            <button
              className={cn(
                'flex min-w-0 flex-1 items-center gap-3 rounded-[1rem] border px-4 py-3 text-left text-sm font-semibold transition',
                activeSection === section.id
                  ? 'border-charcoal/75 bg-surface text-on-surface shadow-tactile-sm'
                  : 'border-outline-variant bg-white/70 text-[color:var(--txt1)] hover:border-charcoal/55 hover:bg-white',
              )}
              type="button"
              onClick={() => onSelect(section.id)}
            >
              <span className={cn('grid size-4 place-items-center rounded-full border', section.done ? 'border-tertiary bg-tertiary text-white' : 'border-outline bg-white')}>
                <span className={cn('size-2 rounded-full', section.done ? 'bg-white' : 'bg-outline')} />
              </span>
              <span className="truncate">{section.label}</span>
            </button>
            {activeSection === section.id ? (
              <div className="flex items-center gap-1">
                {section.movable ? (
                  <>
                    <button className={miniButtonClass} type="button" disabled={!canMoveUp(section.id)} onClick={() => onMoveSection(section.id, 'up')}>
                      Up
                    </button>
                    <button className={miniButtonClass} type="button" disabled={!canMoveDown(section.id)} onClick={() => onMoveSection(section.id, 'down')}>
                      Dn
                    </button>
                  </>
                ) : null}
                {section.removable ? (
                  <button className={miniButtonClass} type="button" onClick={() => onRemoveSection(section.id)}>
                    X
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <button
        className="inline-flex min-h-10 items-center justify-center rounded-full border-2 border-charcoal/75 bg-white/90 px-4 py-2 font-headline text-[11px] font-bold shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:bg-white"
        type="button"
        onClick={onAddCustomSection}
      >
        + Add custom
      </button>
    </div>
  );
}

function ToolbarPane({
  values,
  onChange,
}: {
  values: ToolbarValues;
  onChange: (patch: Partial<ToolbarValues>) => void;
}) {
  return (
    <div className="grid gap-4 rounded-[1.5rem] border-[1.5px] border-charcoal/75 bg-white/85 p-4 shadow-tactile-sm">
      <div className="grid gap-4 rounded-[1.25rem] border border-outline-variant bg-white/75 p-4">
        <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Typography &amp; Spacing</div>
        <div className="grid gap-2">
          <label className="font-headline text-[11px] font-bold uppercase tracking-[0.16em] text-[color:var(--txt2)]">Font</label>
          <select
            className="w-full rounded-[1rem] border border-outline-variant bg-white px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            value={values.font}
            onChange={event => onChange({ font: event.target.value })}
          >
            {toolbarFonts.map(font => (
              <option key={font}>{font}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-semibold text-on-surface">Font size</span>
            <span className="font-headline text-sm font-bold text-primary">{values.fontSize}pt</span>
          </div>
          <input type="range" min="9" max="13" value={values.fontSize} onChange={event => onChange({ fontSize: Number(event.target.value) })} />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-semibold text-on-surface">Line spacing</span>
            <span className="font-headline text-sm font-bold text-primary">{(values.lineSpacing / 100).toFixed(2)}</span>
          </div>
          <input type="range" min="100" max="150" value={values.lineSpacing} onChange={event => onChange({ lineSpacing: Number(event.target.value) })} />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-semibold text-on-surface">Margins</span>
            <span className="font-headline text-sm font-bold text-primary">{(values.margins / 10).toFixed(1)}cm</span>
          </div>
          <input type="range" min="10" max="30" value={values.margins} onChange={event => onChange({ margins: Number(event.target.value) })} />
        </div>
      </div>

      <div className="grid gap-4 rounded-[1.25rem] border border-outline-variant bg-white/75 p-4">
        <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Colors</div>
        <div className="flex flex-wrap gap-3">
          {[
            { tone: 'bg-primary', key: 'default' },
            { tone: 'bg-[#324d72]', key: 'navy' },
            { tone: 'bg-[#55606f]', key: 'slate' },
            { tone: 'bg-[#35674d]', key: 'forest' },
            { tone: 'bg-[#6b4b70]', key: 'plum' },
          ].map((item, index) => (
            <button
              key={item.key}
              className={`size-10 rounded-full border-2 ${values.colorIndex === index ? 'border-charcoal shadow-tactile-sm' : 'border-white shadow-ambient'} ${item.tone}`}
              type="button"
              onClick={() => onChange({ colorIndex: index })}
            ></button>
          ))}
        </div>
      </div>
    </div>
  );
}

function TemplatePane({
  selectedTemplate,
  onSelect,
}: {
  selectedTemplate: RenderTemplateId;
  onSelect: (id: RenderTemplateId) => void;
}) {
  const [templateOptions, setTemplateOptions] = useState<TemplateRecord[]>([]);

  useEffect(() => {
    void templateService.list().then(setTemplateOptions);
  }, []);

  return (
    <div className="grid gap-4 rounded-[1.5rem] border-[1.5px] border-charcoal/75 bg-white/85 p-4 shadow-tactile-sm">
      <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Choose a template</div>
      <div className="grid gap-4 md:grid-cols-2">
        {templateOptions.map(template => (
          <button
            key={template.id}
            className={cn(
              'grid gap-3 rounded-[1.35rem] border p-4 text-left transition',
              selectedTemplate === template.id
                ? 'border-charcoal/75 bg-surface shadow-tactile-sm'
                : 'border-outline-variant bg-white/75 hover:-translate-x-px hover:-translate-y-px hover:border-charcoal/55 hover:bg-white',
            )}
            type="button"
            onClick={() => onSelect(template.id as RenderTemplateId)}
          >
            <div className="overflow-hidden rounded-[1rem] border border-charcoal/10 bg-surface-container-low">
              {template.previewImageUrl ? (
                <img src={template.previewImageUrl} alt={`${template.name} preview`} className="aspect-[4/5] w-full object-cover object-top" loading="lazy" />
              ) : (
                <div className="grid aspect-[4/5] gap-3 p-4">
                  <div className="h-3 w-2/3 rounded-full bg-primary/80"></div>
                  <div className="h-2 w-1/3 rounded-full bg-outline-variant/60"></div>
                  <div className="mt-3 h-px bg-outline-variant/50"></div>
                  <div className="h-2 w-full rounded-full bg-outline-variant/30"></div>
                  <div className="h-2 w-5/6 rounded-full bg-outline-variant/30"></div>
                  <div className="h-2 w-3/4 rounded-full bg-outline-variant/30"></div>
                </div>
              )}
            </div>
            <div className="font-headline text-xl font-extrabold text-on-surface">{template.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function previewText(value: string | null | undefined, fallback: string) {
  return value && value.trim() ? value.trim() : fallback;
}

function PdfPreview({ resume }: { resume: ResumeData }) {
  const contactLine = [resume.header.email, resume.header.phone, resume.header.address, resume.header.linkedin.url]
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

function AtsDrawer({
  open,
  report,
  onClose,
}: {
  open: boolean;
  report: AtsScoreResponse | null;
  onClose: () => void;
}) {
  return (
    <aside
      className={cn(
        'absolute right-4 top-4 hidden w-[22rem] rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/95 p-5 shadow-tactile transition duration-300 md:grid',
        open ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-6 opacity-0',
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="font-headline text-xl font-extrabold text-on-surface">ATS Report</span>
        <button className="grid size-9 place-items-center rounded-full border border-outline bg-white text-lg text-[color:var(--txt1)]" type="button" onClick={onClose}>
          X
        </button>
      </div>
      {report ? (
        <>
          <div className="mb-5 grid gap-1 rounded-[1.25rem] bg-surface px-4 py-4">
            <div className="font-headline text-5xl font-extrabold text-primary">{report.score}</div>
            <div className="text-sm font-semibold text-[color:var(--txt2)]">out of 100 · {report.verdict}</div>
          </div>
          <div className="grid gap-3">
            {report.breakdown.slice(0, 3).map(item => {
              const percentage = Math.round((item.score / item.max) * 100);
              return (
                <div className="grid gap-2" key={item.label}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-on-surface">{item.label}</span>
                    <span className={cn('font-headline text-sm font-bold', percentage < 60 ? 'text-[color:var(--warn)]' : 'text-tertiary')}>
                      {percentage}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-charcoal/10">
                    <div className={cn('h-2 rounded-full', percentage < 60 ? 'bg-[color:var(--warn)]' : 'bg-tertiary')} style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 grid gap-3">
            <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Checklist</div>
            {report.warnings.map(item => (
              <div className="flex items-start gap-3 text-sm leading-7 text-[color:var(--txt1)]" key={item}>
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[color:var(--warn-bg)] text-[11px] font-bold text-[color:var(--warn)]">!</span>
                {item}
              </div>
            ))}
            {report.tips.slice(0, 3).map(item => (
              <div className="flex items-start gap-3 text-sm leading-7 text-[color:var(--txt1)]" key={item}>
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-tertiary-fixed text-[11px] font-bold text-tertiary">OK</span>
                {item}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="grid gap-3 rounded-[1.25rem] border border-dashed border-outline bg-surface px-4 py-6 text-center">
          <div className="text-sm leading-7 text-[color:var(--txt2)]">Run analysis to see the ATS report.</div>
        </div>
      )}
    </aside>
  );
}

function AtsFullReport({
  report,
  resumeName,
  onBack,
}: {
  report: AtsScoreResponse | null;
  resumeName: string;
  onBack: () => void;
}) {
  if (!report) {
    return (
      <div className="grid gap-4 rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/90 p-5 shadow-tactile md:p-6">
        <div className="grid gap-1">
          <div className="font-headline text-2xl font-extrabold text-on-surface">No ATS report yet</div>
          <div className="text-sm leading-7 text-[color:var(--txt2)]">Run analysis from the editor preview to generate the first score.</div>
        </div>
        <button
          className="inline-flex min-h-10 items-center justify-center self-start rounded-full border-2 border-charcoal/75 bg-white/90 px-4 py-2 font-headline text-[11px] font-bold shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:bg-white"
          type="button"
          onClick={onBack}
        >
          Back to Editor
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-4 rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/90 p-5 shadow-tactile md:p-6">
        <div className="grid size-24 place-items-center rounded-[1.5rem] bg-primary-fixed">
          <div className="font-headline text-4xl font-extrabold text-primary">{report.score}</div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-headline text-2xl font-extrabold text-on-surface">{report.verdict}</div>
          <div className="mt-1 text-sm text-[color:var(--txt2)]">{resumeName} · analyzed just now</div>
        </div>
        <button
          className="inline-flex min-h-10 items-center justify-center rounded-full border-2 border-charcoal/75 bg-white/90 px-4 py-2 font-headline text-[11px] font-bold shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:bg-white"
          type="button"
          onClick={onBack}
        >
          Back to Editor
        </button>
      </div>

      <div className="grid gap-3 rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/90 p-5 shadow-tactile md:p-6">
        {report.breakdown.map(item => {
          const percentage = Math.round((item.score / item.max) * 100);
          return (
            <div className="grid gap-2" key={item.label}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-on-surface">{item.label}</span>
                <span className={cn('font-headline text-sm font-bold', percentage >= 60 ? 'text-tertiary' : 'text-[color:var(--warn)]')}>
                  {percentage}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-charcoal/10">
                <div className={cn('h-2 rounded-full', percentage >= 60 ? 'bg-tertiary' : 'bg-[color:var(--warn)]')} style={{ width: `${percentage}%` }}></div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-3 rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/90 p-5 shadow-tactile md:p-6">
        <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Checklist</div>
        {report.warnings.map(item => (
          <div className="flex items-start gap-3 text-sm leading-7 text-[color:var(--txt1)]" key={item}>
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[color:var(--warn-bg)] text-[11px] font-bold text-[color:var(--warn)]">!</span>
            {item}
          </div>
        ))}
        {report.tips.map(item => (
          <div className="flex items-start gap-3 text-sm leading-7 text-[color:var(--txt1)]" key={item}>
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-tertiary-fixed text-[11px] font-bold text-tertiary">OK</span>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function EditorMobileSheet({
  open,
  report,
  onToggle,
  onOpenFullReport,
}: {
  open: boolean;
  report: AtsScoreResponse | null;
  onToggle: () => void;
  onOpenFullReport: () => void;
}) {
  const topBreakdown = report?.breakdown.slice(0, 3) ?? [];

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 rounded-t-[1.75rem] border-x-[1.5px] border-t-[1.5px] border-charcoal/75 bg-white/95 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.12)] transition-transform duration-300 md:hidden',
        open ? 'translate-y-0' : 'translate-y-[calc(100%-3.75rem)]',
      )}
    >
      <button className="mx-auto mb-3 block h-1.5 w-16 rounded-full bg-outline-variant" type="button" onClick={onToggle} aria-label="Toggle ATS sheet"></button>
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="font-headline text-lg font-extrabold text-on-surface">ATS Report</span>
        <button className="grid size-9 place-items-center rounded-full border border-outline bg-white text-lg text-[color:var(--txt1)]" type="button" onClick={onToggle}>
          X
        </button>
      </div>
      {report ? (
        <div className="grid gap-4">
          <div className="flex items-end gap-3">
            <span className="font-headline text-5xl font-extrabold text-primary">{report.score}</span>
            <span className="pb-2 text-sm font-semibold text-[color:var(--txt2)]">out of 100</span>
          </div>
          <div className="text-base font-semibold text-on-surface">{report.verdict}</div>
          {topBreakdown.map(item => {
            const percentage = Math.round((item.score / item.max) * 100);
            return (
              <div className="grid gap-2" key={item.label}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold text-on-surface">{item.label}</span>
                  <span className={cn('font-headline text-sm font-bold', percentage >= 60 ? 'text-tertiary' : 'text-[color:var(--warn)]')}>
                    {percentage}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-charcoal/10">
                  <div className={cn('h-2 rounded-full', percentage >= 60 ? 'bg-tertiary' : 'bg-[color:var(--warn)]')} style={{ width: `${percentage}%` }}></div>
                </div>
              </div>
            );
          })}

          <div className="grid gap-2">
            <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Checklist</div>
            {report.warnings.slice(0, 2).map(item => (
              <div className="flex items-start gap-3 text-sm leading-7 text-[color:var(--txt1)]" key={item}>
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[color:var(--warn-bg)] text-[11px] font-bold text-[color:var(--warn)]">!</span>
                {item}
              </div>
            ))}
            {report.tips.slice(0, 2).map(item => (
              <div className="flex items-start gap-3 text-sm leading-7 text-[color:var(--txt1)]" key={item}>
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-tertiary-fixed text-[11px] font-bold text-tertiary">OK</span>
                {item}
              </div>
            ))}
          </div>

          <button
            className="inline-flex min-h-10 items-center justify-center rounded-full border-2 border-charcoal/75 bg-white/90 px-4 py-2 font-headline text-[11px] font-bold shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:bg-white"
            type="button"
            onClick={onOpenFullReport}
          >
            Open full ATS report
          </button>
        </div>
      ) : (
        <div className="grid gap-4 rounded-[1.25rem] border border-dashed border-outline bg-surface px-4 py-6 text-center">
          <p className="text-sm leading-7 text-[color:var(--txt2)]">Run analysis to preview ATS feedback here.</p>
          <button
            className="inline-flex min-h-10 items-center justify-center rounded-full border-2 border-charcoal/75 bg-white/90 px-4 py-2 font-headline text-[11px] font-bold shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:bg-white"
            type="button"
            onClick={onToggle}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
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

function EditorFormPane({
  activeSection,
  page,
  totalPages,
  resume,
  onPrevPage,
  onNextPage,
  onContentChange,
}: {
  activeSection: string;
  page: number;
  totalPages: number;
  resume: ResumeData;
  onPrevPage: () => void;
  onNextPage: () => void;
  onContentChange: (updater: (current: ResumeData) => ResumeData) => void;
}) {
  const startIndex = clampStart(page);
  const visibleExperience = resume.experience.slice(startIndex, startIndex + 5);
  const visibleEducation = resume.education.slice(startIndex, startIndex + 5);
  const visibleSkillGroups = (resume.skills.groups.length
    ? resume.skills.groups
    : [{ groupLabel: 'Core Skills', items: resume.skills.items }] as SkillGroup[]).slice(startIndex, startIndex + 5);
  const visibleProjects = resume.projects.slice(startIndex, startIndex + 5);
  const activeCustomSection = resume.customSections.find(section => section.id === activeSection) ?? null;
  const visibleCustomEntries = activeCustomSection?.entries.slice(startIndex, startIndex + 5) ?? [];
  const needsPagination =
    ['experience', 'education', 'skills', 'projects'].includes(activeSection) || Boolean(activeCustomSection);

  return (
    <div className="grid gap-3 rounded-[1.5rem] border-[1.5px] border-charcoal/75 bg-white/85 p-4 shadow-tactile-sm">
      {activeSection === 'contact' ? (
        <>
          <div className={labelClass}>Full name</div>
          <input
            className={inputClass}
            value={resume.header.name ?? ''}
            onChange={event => onContentChange(current => ({ ...current, header: { ...current.header, name: event.target.value } }))}
          />
          <div className={labelGapClass}>Role</div>
          <input
            className={inputClass}
            value={resume.header.role ?? ''}
            onChange={event => onContentChange(current => ({ ...current, header: { ...current.header, role: event.target.value } }))}
          />
          <div className={labelGapClass}>Email</div>
          <input
            className={inputClass}
            value={resume.header.email ?? ''}
            onChange={event => onContentChange(current => ({ ...current, header: { ...current.header, email: event.target.value } }))}
          />
          <div className={labelGapClass}>Phone</div>
          <input
            className={inputClass}
            value={resume.header.phone ?? ''}
            onChange={event => onContentChange(current => ({ ...current, header: { ...current.header, phone: event.target.value } }))}
          />
          <div className={labelGapClass}>Location</div>
          <input
            className={inputClass}
            value={resume.header.address ?? ''}
            onChange={event => onContentChange(current => ({ ...current, header: { ...current.header, address: event.target.value } }))}
          />
          <div className={labelGapClass}>LinkedIn</div>
          <input
            className={inputClass}
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
            value={resume.header.github.url ?? ''}
            onChange={event =>
              onContentChange(current => ({
                ...current,
                header: { ...current.header, github: { ...current.header.github, url: event.target.value } },
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
                <div className={labelClass}>Company</div>
                <input
                  className={inputClass}
                  value={item.company ?? ''}
                  onChange={event => onContentChange(current => ({ ...current, experience: current.experience.map((entry, entryIndex) => entryIndex === index ? { ...entry, company: event.target.value } : entry) }))}
                />
                <div className={labelGapClass}>Role</div>
                <input
                  className={inputClass}
                  value={item.role ?? ''}
                  onChange={event => onContentChange(current => ({ ...current, experience: current.experience.map((entry, entryIndex) => entryIndex === index ? { ...entry, role: event.target.value } : entry) }))}
                />
                <div className={labelGapClass}>Location</div>
                <input
                  className={inputClass}
                  value={item.location ?? ''}
                  onChange={event => onContentChange(current => ({ ...current, experience: current.experience.map((entry, entryIndex) => entryIndex === index ? { ...entry, location: event.target.value } : entry) }))}
                />
                <div className={labelGapClass}>Start year</div>
                <input
                  className={inputClass}
                  value={item.date.startYear ?? ''}
                  onChange={event => onContentChange(current => ({ ...current, experience: current.experience.map((entry, entryIndex) => entryIndex === index ? { ...entry, date: { ...entry.date, startYear: event.target.value } } : entry) }))}
                />
                <div className={labelGapClass}>End year</div>
                <input
                  className={inputClass}
                  value={item.date.endYear ?? ''}
                  onChange={event => onContentChange(current => ({ ...current, experience: current.experience.map((entry, entryIndex) => entryIndex === index ? { ...entry, date: { ...entry.date, endYear: event.target.value } } : entry) }))}
                />
                <div className={labelGapClass}>Bullets</div>
                <textarea
                  className={textAreaSmClass}
                  value={joinLines(item.description.bullets)}
                  onChange={event => onContentChange(current => ({ ...current, experience: current.experience.map((entry, entryIndex) => entryIndex === index ? { ...entry, description: { ...entry.description, bullets: linesToArray(event.target.value) } } : entry) }))}
                />
                <button
                  className={removeButtonClass}
                  type="button"
                  onClick={() => onContentChange(current => ({ ...current, experience: current.experience.filter((_entry, entryIndex) => entryIndex !== index) }))}
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
                  onChange={event => onContentChange(current => ({ ...current, education: current.education.map((entry, entryIndex) => entryIndex === index ? { ...entry, institution: event.target.value } : entry) }))}
                />
                <div className={labelGapClass}>Degree</div>
                <input
                  className={inputClass}
                  value={item.degree ?? ''}
                  onChange={event => onContentChange(current => ({ ...current, education: current.education.map((entry, entryIndex) => entryIndex === index ? { ...entry, degree: event.target.value } : entry) }))}
                />
                <div className={labelGapClass}>Field</div>
                <input
                  className={inputClass}
                  value={item.field ?? ''}
                  onChange={event => onContentChange(current => ({ ...current, education: current.education.map((entry, entryIndex) => entryIndex === index ? { ...entry, field: event.target.value } : entry) }))}
                />
                <div className={labelGapClass}>Start year</div>
                <input
                  className={inputClass}
                  value={item.date.startYear ?? ''}
                  onChange={event => onContentChange(current => ({ ...current, education: current.education.map((entry, entryIndex) => entryIndex === index ? { ...entry, date: { ...entry.date, startYear: event.target.value } } : entry) }))}
                />
                <div className={labelGapClass}>End year</div>
                <input
                  className={inputClass}
                  value={item.date.endYear ?? ''}
                  onChange={event => onContentChange(current => ({ ...current, education: current.education.map((entry, entryIndex) => entryIndex === index ? { ...entry, date: { ...entry.date, endYear: event.target.value } } : entry) }))}
                />
                <button
                  className={removeButtonClass}
                  type="button"
                  onClick={() => onContentChange(current => ({ ...current, education: current.education.filter((_entry, entryIndex) => entryIndex !== index) }))}
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
                  onChange={event =>
                    onContentChange(current => {
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
                          groups: current.skills.groups.map((entry, entryIndex) =>
                            entryIndex === index ? { ...entry, groupLabel: event.target.value } : entry,
                          ),
                        },
                      };
                    })
                  }
                />
                <div className={labelGapClass}>Skills</div>
                <textarea
                  className={textAreaSmClass}
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
                {usingGroups ? (
                  <button
                    className={removeButtonClass}
                    type="button"
                    onClick={() =>
                      onContentChange(current => ({
                        ...current,
                        skills: {
                          ...current.skills,
                          groups: current.skills.groups.filter((_entry, entryIndex) => entryIndex !== index),
                        },
                      }))
                    }
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
                  onChange={event => onContentChange(current => ({ ...current, projects: current.projects.map((entry, entryIndex) => entryIndex === index ? { ...entry, title: event.target.value } : entry) }))}
                />
                <div className={labelGapClass}>Technologies</div>
                <textarea
                  className={textAreaSmClass}
                  value={joinCsv(item.technologies)}
                  onChange={event => onContentChange(current => ({ ...current, projects: current.projects.map((entry, entryIndex) => entryIndex === index ? { ...entry, technologies: splitCsv(event.target.value) } : entry) }))}
                />
                <div className={labelGapClass}>Bullets</div>
                <textarea
                  className={textAreaSmClass}
                  value={joinLines(item.description.bullets)}
                  onChange={event => onContentChange(current => ({ ...current, projects: current.projects.map((entry, entryIndex) => entryIndex === index ? { ...entry, description: { ...entry.description, bullets: linesToArray(event.target.value) } } : entry) }))}
                />
                <button
                  className={removeButtonClass}
                  type="button"
                  onClick={() => onContentChange(current => ({ ...current, projects: current.projects.filter((_entry, entryIndex) => entryIndex !== index) }))}
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
            onChange={event => onContentChange(current => ({ ...current, customSections: current.customSections.map(section => section.id === activeCustomSection.id ? { ...section, label: event.target.value } : section) }))}
          />
          {visibleCustomEntries.map((entry, localIndex) => {
            const index = startIndex + localIndex;
            return (
              <div key={`${activeCustomSection.id}-${index}`}>
                <div className={labelGapClass}>Title</div>
                <input
                  className={inputClass}
                  value={entry.title ?? ''}
                  onChange={event => onContentChange(current => ({ ...current, customSections: current.customSections.map(section => section.id === activeCustomSection.id ? { ...section, entries: section.entries.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item) } : section) }))}
                />
                <div className={labelGapClass}>Subtitle</div>
                <input
                  className={inputClass}
                  value={entry.subtitle ?? ''}
                  onChange={event => onContentChange(current => ({ ...current, customSections: current.customSections.map(section => section.id === activeCustomSection.id ? { ...section, entries: section.entries.map((item, itemIndex) => itemIndex === index ? { ...item, subtitle: event.target.value } : item) } : section) }))}
                />
                <div className={labelGapClass}>Location</div>
                <input
                  className={inputClass}
                  value={entry.location ?? ''}
                  onChange={event => onContentChange(current => ({ ...current, customSections: current.customSections.map(section => section.id === activeCustomSection.id ? { ...section, entries: section.entries.map((item, itemIndex) => itemIndex === index ? { ...item, location: event.target.value } : item) } : section) }))}
                />
                <div className={labelGapClass}>Bullets</div>
                <textarea
                  className={textAreaSmClass}
                  value={joinLines(entry.description.bullets)}
                  onChange={event => onContentChange(current => ({ ...current, customSections: current.customSections.map(section => section.id === activeCustomSection.id ? { ...section, entries: section.entries.map((item, itemIndex) => itemIndex === index ? { ...item, description: { ...item.description, bullets: linesToArray(event.target.value) } } : item) } : section) }))}
                />
                <button
                  className={removeButtonClass}
                  type="button"
                  onClick={() => onContentChange(current => ({ ...current, customSections: current.customSections.map(section => section.id === activeCustomSection.id ? { ...section, entries: section.entries.filter((_item, itemIndex) => itemIndex !== index) } : section) }))}
                >
                  Remove entry
                </button>
              </div>
            );
          })}
          <button
            className={addButtonClass}
            type="button"
            onClick={() =>
              onContentChange(current => ({
                ...current,
                customSections: current.customSections.map(section =>
                  section.id === activeCustomSection.id
                    ? {
                        ...section,
                        entries: [
                          ...section.entries,
                          {
                            date: createEmptyDateField('mm-yyyy'),
                            description: createEmptyDescriptionField('bullets'),
                            link: createEmptyLinkField(),
                            location: '',
                            subtitle: '',
                            title: '',
                          },
                        ],
                      }
                    : section,
                ),
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

      {activeSection === 'skills' ? (
        <button
          className={addButtonClass}
          type="button"
          onClick={() =>
            onContentChange(current => ({
              ...current,
              skills: {
                ...current.skills,
                groups: [...current.skills.groups, { groupLabel: '', items: [] }],
                mode: 'grouped',
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

export function EditorPage() {
  const { isMobile } = usePageViewportMode();
  const [searchParams] = useSearchParams();
  const resumeIdFromQuery = searchParams.get('resumeId');
  const [resumeOptions, setResumeOptions] = useState<Awaited<ReturnType<typeof resumeService.list>>>([]);
  const [record, setRecord] = useState<ResumeDocumentRecord | null>(null);
  const [mode, setMode] = useState<'editor' | 'ats'>('editor');
  const [mobileView, setMobileView] = useState<'edit' | 'preview' | 'ats'>('edit');
  const [activeLeftTab, setActiveLeftTab] = useState<(typeof leftTabs)[number]['id']>('sections');
  const [activeSection, setActiveSection] = useState('contact');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [toolbarValues, setToolbarValues] = useState<ToolbarValues>(toolbarFromRenderOptions(DEFAULT_RENDER_OPTIONS));
  const [pageBySection, setPageBySection] = useState<Record<string, number>>({
    contact: 1,
    summary: 1,
    education: 1,
    experience: 1,
    skills: 1,
    projects: 1,
  });
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error' | 'recovered'>('idle');
  const [atsReport, setAtsReport] = useState<AtsScoreResponse | null>(null);
  const [atsLoading, setAtsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const saveTimeoutRef = useRef<number | null>(null);
  const lastSavedSnapshotRef = useRef('');
  const recordRef = useRef<ResumeDocumentRecord | null>(null);

  const activeResumeId = useMemo(
    () => resumeIdFromQuery ?? resumeService.getActiveId() ?? resumeOptions[0]?.id ?? null,
    [resumeIdFromQuery, resumeOptions],
  );

  const sections = useMemo(() => {
    if (!record) return sectionList(null);
    return sectionList(record.content, record.renderOptions.sectionOrder);
  }, [record]);

  const totalPages = useMemo(() => {
    if (!record) return 1;
    return Math.max(1, Math.ceil(countForSection(record.content, activeSection) / 5));
  }, [activeSection, record]);

  const page = pageBySection[activeSection] ?? 1;
  const resumeName = record?.title ?? resumeOptions.find(item => item.id === activeResumeId)?.name ?? 'Untitled resume';

  useEffect(() => {
    recordRef.current = record;
  }, [record]);

  useEffect(() => {
    async function loadResumes() {
      setResumeOptions(await resumeService.list());
    }

    void loadResumes();
    window.addEventListener(resumeService.eventName, loadResumes);
    return () => window.removeEventListener(resumeService.eventName, loadResumes);
  }, []);

  useEffect(() => {
    async function loadRecord() {
      if (!activeResumeId) {
        setRecord(null);
        return;
      }

      try {
        setLoadError(null);
        const serverRecord = await resumeService.getRecord(activeResumeId);
        const recoveredDraft = readDraft(activeResumeId);
        const nextRecord = recoveredDraft ?? serverRecord;
        setRecord(nextRecord);
        setToolbarValues(toolbarFromRenderOptions(nextRecord.renderOptions));
        lastSavedSnapshotRef.current = editableSnapshot(serverRecord);
        setSaveState(recoveredDraft ? 'recovered' : 'saved');
        setAtsReport(null);
        resumeService.setActiveId(activeResumeId);
      } catch {
        const summary = resumeOptions.find(item => item.id === activeResumeId);
        const fallback = createFallbackRecord(activeResumeId, summary?.name ?? 'resume.tex');
        setRecord(fallback);
        setToolbarValues(toolbarFromRenderOptions(fallback.renderOptions));
        lastSavedSnapshotRef.current = editableSnapshot(fallback);
        setLoadError('Could not load the saved record, so the editor is using a local fallback.');
      }
    }

    void loadRecord();
  }, [activeResumeId, resumeOptions]);

  useEffect(() => {
    if (!record) return;
    const currentPage = pageBySection[activeSection] ?? 1;
    if (currentPage > totalPages) {
      setPageBySection(current => ({ ...current, [activeSection]: totalPages }));
    }
  }, [activeSection, pageBySection, record, totalPages]);

  useEffect(() => {
    if (!sections.some(section => section.id === activeSection)) {
      setActiveSection(sections[0]?.id ?? 'contact');
    }
  }, [activeSection, sections]);

  useEffect(() => {
    if (!isMobile) {
      setMobileView('edit');
      setSheetOpen(false);
      return;
    }

    setMode(mobileView === 'ats' ? 'ats' : 'editor');
    if (mobileView === 'ats') {
      setDrawerOpen(false);
      setSheetOpen(false);
    }
  }, [isMobile, mobileView]);

  useEffect(() => {
    if (!isMobile && mode === 'ats') {
      setDrawerOpen(false);
    }
  }, [isMobile, mode]);

  useEffect(() => {
    if (!record) return;

    const snapshot = editableSnapshot(record);
    if (!lastSavedSnapshotRef.current || snapshot === lastSavedSnapshotRef.current) {
      return;
    }

    writeDraft(record);
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(async () => {
      const currentRecord = recordRef.current;
      if (!currentRecord) return;

      try {
        setSaveState('saving');
        const currentSnapshot = editableSnapshot(currentRecord);
        const saved = await resumeService.saveRecord(currentRecord.id, {
          content: currentRecord.content,
          rawText: buildResumePlainText(currentRecord.content),
          renderOptions: currentRecord.renderOptions,
          templateId: currentRecord.templateId,
          title: currentRecord.title,
        });
        lastSavedSnapshotRef.current = currentSnapshot;
        clearDraft(currentRecord.id);
        setSaveState('saved');
        if (saved) {
          setRecord(previous => (previous && previous.id === saved.id ? { ...previous, updatedAt: saved.updatedAt } : previous));
        }
      } catch {
        setSaveState('error');
      }
    }, 700);

    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [record]);

  useEffect(() => () => {
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }
  }, []);

  async function persistNow() {
    const currentRecord = recordRef.current;
    if (!currentRecord) return null;

    const snapshot = editableSnapshot(currentRecord);
    if (snapshot === lastSavedSnapshotRef.current) {
      return currentRecord;
    }

    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    setSaveState('saving');
    const saved = await resumeService.saveRecord(currentRecord.id, {
      content: currentRecord.content,
      rawText: buildResumePlainText(currentRecord.content),
      renderOptions: currentRecord.renderOptions,
      templateId: currentRecord.templateId,
      title: currentRecord.title,
    });
    lastSavedSnapshotRef.current = snapshot;
    clearDraft(currentRecord.id);
    setSaveState('saved');
    if (saved) {
      setRecord(previous => (previous && previous.id === saved.id ? { ...previous, updatedAt: saved.updatedAt } : previous));
      return saved;
    }
    return currentRecord;
  }

  function updatePage(nextPage: number) {
    setPageBySection(current => ({
      ...current,
      [activeSection]: Math.max(1, Math.min(totalPages, nextPage)),
    }));
  }

  function handleModeChange(nextMode: 'editor' | 'ats') {
    setMode(nextMode);
    if (nextMode === 'ats') {
      setDrawerOpen(false);
    }
  }

  function moveSection(sectionId: string, direction: 'up' | 'down') {
    if (sectionId === 'contact') return;
    setRecord(current => {
      if (!current) return current;
      const order = [...current.renderOptions.sectionOrder];
      const index = order.indexOf(sectionId);
      if (index === -1) return current;
      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= order.length) return current;
      [order[index], order[swapIndex]] = [order[swapIndex], order[index]];
      return {
        ...current,
        renderOptions: {
          ...current.renderOptions,
          sectionOrder: order,
        },
      };
    });
  }

  function addCustomSection() {
    const customId = `custom_${Date.now()}`;
    setRecord(current => {
      if (!current) return current;
      return {
        ...current,
        content: {
          ...current.content,
          customSections: [...current.content.customSections, { entries: [], id: customId, label: 'Custom Section' }],
        },
        renderOptions: {
          ...current.renderOptions,
          sectionOrder: [...current.renderOptions.sectionOrder, customId],
        },
      };
    });
    setPageBySection(current => ({ ...current, [customId]: 1 }));
    setActiveSection(customId);
  }

  function removeSection(sectionId: string) {
    setRecord(current => {
      if (!current) return current;
      return {
        ...current,
        content: {
          ...current.content,
          customSections: current.content.customSections.filter(section => section.id !== sectionId),
        },
        renderOptions: {
          ...current.renderOptions,
          sectionOrder: current.renderOptions.sectionOrder.filter(section => section !== sectionId),
        },
      };
    });
    setActiveSection('contact');
  }

  function updateContent(updater: (current: ResumeData) => ResumeData) {
    setRecord(current => {
      if (!current) return current;
      const nextContent = updater(current.content);
      return {
        ...current,
        content: nextContent,
        rawText: buildResumePlainText(nextContent),
      };
    });
    setAtsReport(null);
  }

  async function runAtsAnalysis() {
    const currentRecord = await persistNow();
    if (!currentRecord) return;

    try {
      setAtsLoading(true);
      const report = await resumeService.scoreAts(currentRecord.id);
      setAtsReport(report);
      if (isMobile) {
        setMobileView('preview');
        setSheetOpen(true);
      } else {
        setDrawerOpen(true);
      }
    } finally {
      setAtsLoading(false);
    }
  }

  const syncCopy =
    saveState === 'saving'
      ? 'saving...'
      : saveState === 'error'
        ? 'save failed'
        : saveState === 'recovered'
          ? 'draft recovered'
          : 'saved locally and synced';

  if (!record) {
    return (
      <div className="grid gap-4">
        <div className="grid gap-4 rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/90 p-5 shadow-tactile md:p-6">
          <div className="grid gap-1">
            <div className="font-headline text-2xl font-extrabold text-on-surface">No resume selected</div>
            <div className="text-sm leading-7 text-[color:var(--txt2)]">Choose a resume from the library first, then return to the editor.</div>
          </div>
          <NavLink
            className="inline-flex min-h-10 items-center justify-center self-start rounded-full border-2 border-charcoal/75 bg-white/90 px-4 py-2 font-headline text-[11px] font-bold shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:bg-white"
            to={routes.resumes}
          >
            Go to Resumes
          </NavLink>
        </div>
      </div>
    );
  }

  return (
    <WorkspaceShell
      title={resumeName}
      mainClassName="mx-auto w-full max-w-[1320px] px-3 pb-28 pt-7 sm:px-6 lg:px-8"
      showMobileTopBar={false}
    >
      <div className="grid gap-4">
      <EditorMobileTopbar
        title={resumeName}
        onAnalyze={() => {
          void runAtsAnalysis();
        }}
      />

      <div className="flex gap-2 md:hidden">
        {(['edit', 'preview', 'ats'] as const).map(tab => (
          <button
            key={tab}
            className={cn(
              mobileTabClass,
              mobileView === tab ? 'bg-white text-on-surface shadow-tactile-sm' : 'bg-white/65 text-[color:var(--txt1)]',
            )}
            type="button"
            onClick={() => {
              setMobileView(tab);
              setSheetOpen(false);
            }}
          >
            {tab === 'ats' ? 'ATS' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="hidden items-center justify-between gap-4 rounded-[1.5rem] border-[1.5px] border-charcoal/75 bg-white/85 px-5 py-4 shadow-tactile md:flex">
        <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm text-[color:var(--txt1)]">
          <NavLink className="font-semibold text-primary transition hover:text-on-surface" to={routes.resumes}>
            Resumes
          </NavLink>
          <span>/</span>
          <span className="truncate">{resumeName}</span>
          <span>/</span>
          <span className="font-semibold text-on-surface">{mode === 'ats' ? 'ATS Score' : 'Editor'}</span>
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            className={cn(
              desktopModeClass,
              mode === 'editor' ? 'border-charcoal/75 bg-white text-on-surface shadow-tactile-sm' : 'border-outline bg-white/65 text-[color:var(--txt1)]',
            )}
            type="button"
            onClick={() => handleModeChange('editor')}
          >
            Editor
          </button>
          <button
            className={cn(
              desktopModeClass,
              mode === 'ats' ? 'border-charcoal/75 bg-white text-on-surface shadow-tactile-sm' : 'border-outline bg-white/65 text-[color:var(--txt1)]',
            )}
            type="button"
            onClick={() => {
              handleModeChange('ats');
              void runAtsAnalysis();
            }}
          >
            ATS Score
          </button>
        </div>
      </div>

      {mode === 'editor' ? (
        <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
          <div className={cn(mobileView === 'edit' ? 'grid gap-4' : 'hidden gap-4 md:grid')}>
            <div className="flex flex-wrap gap-2 rounded-[1.5rem] border-[1.5px] border-charcoal/75 bg-white/85 p-3 shadow-tactile-sm">
              {leftTabs.map(tab => (
                <button
                  key={tab.id}
                  className={cn(
                    'inline-flex min-h-10 items-center justify-center rounded-full border-2 px-4 py-2 font-headline text-[11px] font-bold uppercase tracking-[0.12em] transition',
                    activeLeftTab === tab.id
                      ? 'border-charcoal/75 bg-white text-on-surface shadow-tactile-sm'
                      : 'border-outline bg-white/65 text-[color:var(--txt1)] hover:bg-white',
                  )}
                  type="button"
                  onClick={() => setActiveLeftTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeLeftTab === 'sections' ? (
              <div className="grid gap-4">
                <SectionNav
                  sections={sections}
                  activeSection={activeSection}
                  onSelect={setActiveSection}
                  onAddCustomSection={addCustomSection}
                  onMoveSection={moveSection}
                  onRemoveSection={removeSection}
                  canMoveUp={section => {
                    if (section === 'contact') return false;
                    const index = record.renderOptions.sectionOrder.indexOf(section);
                    return index > 0;
                  }}
                  canMoveDown={section => {
                    if (section === 'contact') return false;
                    const index = record.renderOptions.sectionOrder.indexOf(section);
                    return index !== -1 && index < record.renderOptions.sectionOrder.length - 1;
                  }}
                />
                <EditorFormPane
                  activeSection={activeSection}
                  page={page}
                  resume={record.content}
                  totalPages={totalPages}
                  onContentChange={updateContent}
                  onNextPage={() => updatePage(page + 1)}
                  onPrevPage={() => updatePage(page - 1)}
                />
              </div>
            ) : null}

            {activeLeftTab === 'template' ? (
              <TemplatePane
                selectedTemplate={record.templateId}
                onSelect={(templateId: RenderTemplateId) => {
                  setRecord(current =>
                    current
                      ? {
                          ...current,
                          renderOptions: { ...current.renderOptions, templateId },
                          templateId,
                        }
                      : current,
                  );
                  setAtsReport(null);
                }}
              />
            ) : null}

            {activeLeftTab === 'toolbar' ? (
              <ToolbarPane
                values={toolbarValues}
                onChange={patch => {
                  setToolbarValues(current => {
                    const next = { ...current, ...patch };
                    setRecord(previous =>
                      previous
                        ? {
                            ...previous,
                            renderOptions: applyToolbarValues(previous.renderOptions, next),
                          }
                        : previous,
                    );
                    return next;
                  });
                  setAtsReport(null);
                }}
              />
            ) : null}
          </div>

          <div className={cn(mobileView === 'edit' ? 'hidden gap-4 md:grid' : 'grid gap-4')}>
            <div className="flex flex-col gap-4 rounded-[1.5rem] border-[1.5px] border-charcoal/75 bg-white/85 p-4 shadow-tactile-sm md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3 text-sm text-[color:var(--txt1)]">
                <span className="size-2.5 rounded-full bg-tertiary"></span>
                <span>
                  {syncCopy}
                  {loadError ? ` · ${loadError}` : ''}
                </span>
              </div>
              <button
                className="inline-flex min-h-10 items-center justify-center rounded-full border-2 border-charcoal/75 bg-white/90 px-4 py-2 font-headline text-[11px] font-bold shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:bg-white disabled:pointer-events-none disabled:opacity-40"
                type="button"
                onClick={() => {
                  void runAtsAnalysis();
                }}
                disabled={atsLoading}
              >
                {atsLoading ? 'Analyzing...' : 'Analyze →'}
              </button>
            </div>

            <div className="relative rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/90 p-4 shadow-tactile md:p-6">
              <PdfPreview resume={record.content} />
              <AtsDrawer open={drawerOpen} report={atsReport} onClose={() => setDrawerOpen(false)} />
            </div>
          </div>
        </div>
      ) : (
        <AtsFullReport
          report={atsReport}
          resumeName={resumeName}
          onBack={() => {
            if (isMobile) setMobileView('edit');
            handleModeChange('editor');
          }}
        />
      )}

      <EditorMobileSheet
        open={sheetOpen}
        report={atsReport}
        onToggle={() => setSheetOpen(current => !current)}
        onOpenFullReport={() => {
          setSheetOpen(false);
          setMobileView('ats');
        }}
      />
      </div>
    </WorkspaceShell>
  );
}
