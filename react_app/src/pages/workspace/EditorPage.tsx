import { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import { AtsDrawer } from 'components/editor/AtsDrawer';
import { AtsFullReport } from 'components/editor/AtsFullReport';
import { EditorFormPane } from 'components/editor/EditorFormPane';
import { EditorMobileSheet } from 'components/editor/EditorMobileSheet';
import { EditorMobileTopbar } from 'components/editor/EditorMobileTopbar';
import { PdfPreview } from 'components/editor/PdfPreview';
import { SectionNav, type EditorSectionItem } from 'components/editor/SectionNav';
import { TemplatePane } from 'components/editor/TemplatePane';
import { ToolbarPane, type ToolbarValues } from 'components/editor/ToolbarPane';
import { useViewportMode } from 'hooks/useViewportMode';
import { routes } from 'lib/routes';
import { resumeService } from 'services/resumeService';
import {
  buildResumePlainText,
  createEmptyResumeData,
  DEFAULT_RENDER_OPTIONS,
  type AtsScoreResponse,
  type RenderAccentColor,
  type RenderOptions,
  type RenderTemplateId,
  type ResumeData,
  type ResumeDocumentRecord,
} from 'types/resumeDocument';

const leftTabs = [
  { id: 'sections', label: 'Sections' },
  { id: 'template', label: 'Template' },
  { id: 'toolbar', label: 'Toolbar' },
] as const;

const BASE_SECTION_ORDER = ['summary', 'education', 'skills', 'experience', 'projects'] as const;
const ACCENT_COLORS: RenderAccentColor[] = ['charcoal', 'navy', 'slate', 'forest', 'berry'];
const DRAFT_PREFIX = 'resumeai:editor-draft:';

function getDraftKey(id: string) {
  return `${DRAFT_PREFIX}${id}`;
}

function readDraft(id: string) {
  try {
    const raw = localStorage.getItem(getDraftKey(id));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ResumeDocumentRecord;
    return parsed.id === id ? parsed : null;
  } catch {
    return null;
  }
}

function writeDraft(record: ResumeDocumentRecord) {
  localStorage.setItem(getDraftKey(record.id), JSON.stringify(record));
}

function clearDraft(id: string) {
  localStorage.removeItem(getDraftKey(id));
}

function editableSnapshot(record: ResumeDocumentRecord) {
  return JSON.stringify({
    content: {
      ...record.content,
      meta: {
        ...record.content.meta,
        createdAt: '',
        updatedAt: '',
      },
    },
    renderOptions: record.renderOptions,
    templateId: record.templateId,
    title: record.title,
  });
}

function toolbarFromRenderOptions(options: RenderOptions): ToolbarValues {
  const margin = Number.parseFloat(options.margin) || 1;
  return {
    colorIndex: Math.max(0, ACCENT_COLORS.indexOf(options.accentColor)),
    font: options.fontFamily,
    fontSize: options.fontSize,
    lineSpacing: Math.round(options.lineSpacing * 100),
    margins: Math.round(margin * 10),
  };
}

function applyToolbarValues(current: RenderOptions, values: ToolbarValues): RenderOptions {
  return {
    ...current,
    accentColor: ACCENT_COLORS[values.colorIndex] ?? 'charcoal',
    fontFamily: values.font as RenderOptions['fontFamily'],
    fontSize: values.fontSize,
    lineSpacing: values.lineSpacing / 100,
    margin: `${(values.margins / 10).toFixed(1)}cm`,
  };
}

function countForSection(resume: ResumeData, activeSection: string) {
  if (activeSection === 'experience') return Math.max(1, resume.experience.length);
  if (activeSection === 'education') return Math.max(1, resume.education.length);
  if (activeSection === 'projects') return Math.max(1, resume.projects.length);
  if (activeSection === 'skills') return Math.max(1, resume.skills.groups.length || (resume.skills.items.length ? 1 : 0));
  const customSection = resume.customSections.find(section => section.id === activeSection);
  if (customSection) return Math.max(1, customSection.entries.length);
  return 1;
}

function sectionList(resume: ResumeData | null, sectionOrder: string[] = DEFAULT_RENDER_OPTIONS.sectionOrder): EditorSectionItem[] {
  const content = resume ?? createEmptyResumeData();
  const available = new Set<string>([...BASE_SECTION_ORDER, ...content.customSections.map(section => section.id)]);
  const persistedOrder = sectionOrder.length ? sectionOrder : [...BASE_SECTION_ORDER];
  const mergedOrder = [
    ...persistedOrder.filter(section => available.has(section)),
    ...Array.from(available).filter(section => !persistedOrder.includes(section)),
  ];

  const itemMap = new Map<string, EditorSectionItem>([
    ['contact', { id: 'contact', label: 'Contact', done: Boolean(content.header.name || content.header.email) }],
    ['summary', { id: 'summary', label: 'Summary', done: Boolean(content.summary.content), movable: true }],
    ['education', { id: 'education', label: 'Education', done: content.education.length > 0, movable: true }],
    ['skills', { id: 'skills', label: 'Skills', done: content.skills.items.length > 0 || content.skills.groups.length > 0, movable: true }],
    ['experience', { id: 'experience', label: 'Experience', done: content.experience.length > 0, movable: true }],
    ['projects', { id: 'projects', label: 'Projects', done: content.projects.length > 0, movable: true }],
  ]);

  content.customSections.forEach(section => {
    itemMap.set(section.id, {
      id: section.id,
      label: section.label,
      done: section.entries.length > 0,
      movable: true,
      removable: true,
    });
  });

  return ['contact', ...mergedOrder]
    .map(section => itemMap.get(section))
    .filter(Boolean) as EditorSectionItem[];
}

function createFallbackRecord(id: string, title: string): ResumeDocumentRecord {
  const now = new Date().toISOString();
  return {
    content: createEmptyResumeData('scratch'),
    createdAt: now,
    id,
    rawText: '',
    renderOptions: { ...DEFAULT_RENDER_OPTIONS },
    source: 'scratch',
    templateId: 'template1',
    title,
    updatedAt: now,
  };
}

export function EditorPage() {
  const { isMobile } = useViewportMode();
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
          setRecord(previous => previous && previous.id === saved.id ? { ...previous, updatedAt: saved.updatedAt } : previous);
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
      setRecord(previous => previous && previous.id === saved.id ? { ...previous, updatedAt: saved.updatedAt } : previous);
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

  const rootClassName = `editor-root${isMobile ? ` mob-${mobileView}-view` : ''}`;
  const syncCopy = saveState === 'saving'
    ? 'saving...'
    : saveState === 'error'
      ? 'save failed'
      : saveState === 'recovered'
        ? 'draft recovered'
        : 'saved locally and synced';

  if (!record) {
    return (
      <div className="editor-root">
        <div className="ats-full">
          <div className="ats-score-card">
            <div className="ats-score-info">
              <div className="ats-score-label">No resume selected</div>
              <div className="ats-score-desc">Choose a resume from the library first, then return to the editor.</div>
            </div>
            <NavLink className="analyze-btn editor-back-link" to={routes.resumes}>Go to Resumes</NavLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={rootClassName}>
      <EditorMobileTopbar title={resumeName} onAnalyze={() => { void runAtsAnalysis(); }} />

      <div className="mob-edit-toggle editor-mobile-toggle">
        <button className={`mob-et-btn${mobileView === 'edit' ? ' active' : ''}`} type="button" onClick={() => { setMobileView('edit'); setSheetOpen(false); }}>Edit</button>
        <button className={`mob-et-btn${mobileView === 'preview' ? ' active' : ''}`} type="button" onClick={() => { setMobileView('preview'); setSheetOpen(false); }}>Preview</button>
        <button className={`mob-et-btn${mobileView === 'ats' ? ' active' : ''}`} type="button" onClick={() => { setMobileView('ats'); setSheetOpen(false); }}>ATS</button>
      </div>

      <div className="bcrumb editor-bcrumb">
        <NavLink className="bc-link" to={routes.resumes}>Resumes</NavLink>
        <span className="bc-sep">/</span>
        <span className="bc-link">{resumeName}</span>
        <span className="bc-sep">/</span>
        <span className="bc-cur">{mode === 'ats' ? 'ATS Score' : 'Editor'}</span>
        <div className="ed-segs">
          <button className={`ed-seg${mode === 'editor' ? ' active' : ''}`} type="button" onClick={() => handleModeChange('editor')}>Editor</button>
          <button
            className={`ed-seg${mode === 'ats' ? ' active' : ''}`}
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
        <div id="ed-mode-editor">
          <div className="editor-workspace">
            <div className="ed-left">
              <div className="left-tabs">
                {leftTabs.map(tab => (
                  <button
                    key={tab.id}
                    className={`ltab${activeLeftTab === tab.id ? ' active' : ''}`}
                    type="button"
                    onClick={() => setActiveLeftTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeLeftTab === 'sections' ? (
                <div className="sec-pane">
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
                    setRecord(current => current ? {
                      ...current,
                      renderOptions: { ...current.renderOptions, templateId },
                      templateId,
                    } : current);
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
                      setRecord(previous => previous ? {
                        ...previous,
                        renderOptions: applyToolbarValues(previous.renderOptions, next),
                      } : previous);
                      return next;
                    });
                    setAtsReport(null);
                  }}
                />
              ) : null}
            </div>

            <div className="ed-right">
              <div className="prev-bar">
                <div className="sync-row">
                  <span className="sync-dot"></span>
                  <span>{syncCopy}{loadError ? ` · ${loadError}` : ''}</span>
                </div>
                <button className="analyze-btn" type="button" onClick={() => { void runAtsAnalysis(); }} disabled={atsLoading}>
                  {atsLoading ? 'Analyzing...' : 'Analyze →'}
                </button>
              </div>
              <div className="pdf-area">
                <PdfPreview resume={record.content} />
              </div>
              <AtsDrawer open={drawerOpen} report={atsReport} onClose={() => setDrawerOpen(false)} />
            </div>
          </div>
        </div>
      ) : (
        <div id="ed-mode-ats">
          <AtsFullReport
            report={atsReport}
            resumeName={resumeName}
            onBack={() => {
              if (isMobile) setMobileView('edit');
              handleModeChange('editor');
            }}
          />
        </div>
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
  );
}
