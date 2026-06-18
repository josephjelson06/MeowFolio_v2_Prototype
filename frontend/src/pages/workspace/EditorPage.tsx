import { useEffect, useState } from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import { routes } from 'lib/routes';
import { downloadPdf } from 'lib/typst-renderer';
import { WorkspaceShell } from 'components/workspace/WorkspaceShell';
import { useUiContext } from 'state/ui/uiContext';
import { EditorMobileTopbar } from 'pages/workspace/editor/components/EditorMobileTopbar';
import { EditorPreviewPanel } from 'pages/workspace/editor/components/EditorPreviewPanel';
import { EditorWorkspaceLayout } from 'pages/workspace/editor/components/EditorWorkspaceLayout';
import { EditorSectionsWorkspace } from 'pages/workspace/editor/components/workspaces/EditorSectionsWorkspace';
import { EditorTemplateWorkspace } from 'pages/workspace/editor/components/workspaces/EditorTemplateWorkspace';
import { EditorToolbarWorkspace } from 'pages/workspace/editor/components/workspaces/EditorToolbarWorkspace';
import { useEditorAutosave } from 'pages/workspace/editor/hooks/useEditorAutosave';
import { useEditorRecord } from 'pages/workspace/editor/hooks/useEditorRecord';
import { leftTabs, type ToolbarValues } from 'pages/workspace/editor/types';
import { buildResumePlainText, DEFAULT_RENDER_OPTIONS, type RenderTemplateId, type ResumeData, type ResumeSectionKey } from 'types/resumeDocument';
import { applyToolbarValues, toolbarFromRenderOptions } from 'pages/workspace/editor/utils/editorToolbar';

export function EditorPage() {
  const [searchParams] = useSearchParams();
  const { openResume } = useUiContext();
  const resumeIdFromQuery = searchParams.get('resumeId');
  const [mobileView, setMobileView] = useState<'edit' | 'preview'>('edit');
  const [activeLeftTab, setActiveLeftTab] = useState<(typeof leftTabs)[number]['id']>('sections');
  const [activeSection, setActiveSection] = useState('contact');
  const [toolbarValues, setToolbarValues] = useState<ToolbarValues>(toolbarFromRenderOptions(DEFAULT_RENDER_OPTIONS));
  const [pageBySection, setPageBySection] = useState<Record<string, number>>({
    contact: 1,
    summary: 1,
    education: 1,
    experience: 1,
    skills: 1,
    projects: 1,
  });
  const [downloadBusy, setDownloadBusy] = useState(false);

  const {
    activeResumeId,
    loadError,
    page,
    record,
    resumeName,
    sections,
    setRecord,
    totalPages,
  } = useEditorRecord({
    resumeIdFromQuery,
    activeSection,
    pageBySection,
    onToolbarValuesChange: setToolbarValues,
  });

  const { saveState } = useEditorAutosave({
    activeResumeId,
    record,
    setRecord,
  });

  useEffect(() => {
    if (page <= totalPages) return;
    setPageBySection(current => ({
      ...current,
      [activeSection]: totalPages,
    }));
  }, [activeSection, page, totalPages]);

  useEffect(() => {
    if (!sections.some(section => section.id === activeSection)) {
      setActiveSection('contact');
    }
  }, [activeSection, sections]);

  function updatePage(nextPage: number) {
    setPageBySection(current => ({
      ...current,
      [activeSection]: Math.max(1, Math.min(nextPage, totalPages)),
    }));
  }

  function reorderSection(fromId: string, toId: string) {
    setRecord(current => {
      if (!current) return current;
      const order = [...current.renderOptions.sectionOrder];
      const fromIndex = order.indexOf(fromId as ResumeSectionKey);
      const toIndex = order.indexOf(toId as ResumeSectionKey);
      if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return current;
      const nextOrder = [...order];
      const [moved] = nextOrder.splice(fromIndex, 1);
      nextOrder.splice(toIndex, 0, moved);
      return {
        ...current,
        renderOptions: {
          ...current.renderOptions,
          sectionOrder: nextOrder,
        },
      };
    });
  }

  function addCustomSection() {
    if (!record) return;
    const allOptionalSections = [
      'summary',
      'experience',
      'education',
      'skills',
      'projects',
      'certifications',
      'languages',
      'hobbies',
      'leadership',
      'achievements',
      'competitions',
      'extracurricular',
      'publications',
      'openSource'
    ];
    const activeIds = record.renderOptions.sectionOrder;
    const nextSection = allOptionalSections.find(key => !activeIds.includes(key as any));
    
    if (!nextSection) {
      alert("All available sections are currently in use!");
      return;
    }

    setRecord(current => {
      if (!current) return current;
      return {
        ...current,
        renderOptions: {
          ...current.renderOptions,
          sectionOrder: [...current.renderOptions.sectionOrder, nextSection as any],
        },
      };
    });
    setActiveSection(nextSection);
  }

  function removeSection(sectionId: string) {
    setRecord(current => {
      if (!current) return current;
      return {
        ...current,
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
  }

  function handleTemplateSelect(templateId: RenderTemplateId) {
    setRecord(current =>
      current
        ? {
            ...current,
            renderOptions: { ...current.renderOptions, templateId },
            templateId,
          }
        : current,
    );
  }

  function handleToolbarChange(patch: Partial<ToolbarValues>) {
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
  }

  function handleMobileViewChange(view: 'edit' | 'preview') {
    setMobileView(view);
  }

  const syncCopy =
    saveState === 'saving'
      ? 'saving...'
      : saveState === 'error'
        ? 'save failed'
        : saveState === 'recovered'
          ? 'draft recovered'
          : 'saved locally and synced';
  const editorStatus = `${syncCopy}${loadError ? ` · ${loadError}` : ''}`;

  if (!record) {
    return (
      <WorkspaceShell
        title="Editor"
        mainClassName="mx-auto w-full max-w-[1000px] px-4 pb-28 pt-7 sm:px-6 lg:px-8"
        showMobileTopBar={true}
      >
        <div className="grid gap-6">
          <div className="grid rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/90 p-5 shadow-tactile md:p-6">
            {/* Header row */}
            <div className="flex flex-col gap-4 border-b border-charcoal/10 pb-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="grid size-12 shrink-0 place-items-center rounded-2xl border border-charcoal/15 bg-white/90 text-charcoal/75 shadow-tactile-sm">
                  <svg className="size-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                </div>
                <div className="grid gap-0.5 text-left">
                  <h1 className="font-headline text-base font-extrabold text-on-surface leading-tight">No resume selected</h1>
                  <p className="text-xs text-[color:var(--txt2)]">Choose a resume from the library first, then return to the editor.</p>
                </div>
              </div>
            </div>

            {/* Content row */}
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <img
                src="/Images/no_resume_selected.png"
                alt="No resume selected"
                className="h-60 w-auto object-contain mb-6"
              />
              <h2 className="font-headline text-2xl font-extrabold text-on-surface mb-2">No resume selected</h2>
              <p className="text-sm text-[color:var(--txt2)] max-w-sm mb-6">
                Select a resume from your library to start editing or create a new one.
              </p>
              
              <div className="flex flex-col items-center gap-3 w-full max-w-xs">
                <NavLink
                  to={routes.resumes}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border-2 border-charcoal bg-primary text-white px-6 py-2.5 font-headline text-sm font-bold shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:bg-primary/95 hover:shadow-tactile active:translate-x-px active:translate-y-px active:shadow-none"
                >
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                  </svg>
                  Go to Resumes
                </NavLink>
                
                <div className="flex items-center gap-3 w-full my-1">
                  <div className="h-px bg-charcoal/10 flex-1"></div>
                  <span className="text-xs text-[color:var(--txt2)] font-medium">or</span>
                  <div className="h-px bg-charcoal/10 flex-1"></div>
                </div>

                <button
                  type="button"
                  onClick={openResume}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border-2 border-primary bg-white text-primary px-6 py-2.5 font-headline text-sm font-bold shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:bg-primary-fixed/30 hover:shadow-tactile active:translate-x-px active:translate-y-px active:shadow-none"
                >
                  + Create New Resume
                </button>
              </div>

              {/* Tip */}
              <div className="mt-12 flex items-center gap-2 text-xs text-[color:var(--txt2)] bg-white/50 border border-charcoal/10 rounded-xl px-4 py-2.5">
                <span>💡</span>
                <span><strong>Tip:</strong> You can create multiple resumes and tailor them for different roles.</span>
              </div>
            </div>
          </div>
        </div>
      </WorkspaceShell>
    );
  }

  const leftWorkspace =
    activeLeftTab === 'sections' ? (
      <EditorSectionsWorkspace
        sections={sections}
        activeSection={activeSection}
        page={page}
        totalPages={totalPages}
        resume={record.content}
        onSelectSection={setActiveSection}
        onAddCustomSection={addCustomSection}
        onReorderSection={reorderSection}
        onRemoveSection={removeSection}
        onContentChange={updateContent}
        onNextPage={() => updatePage(page + 1)}
        onPrevPage={() => updatePage(page - 1)}
      />
    ) : activeLeftTab === 'template' ? (
      <EditorTemplateWorkspace selectedTemplate={record.templateId} onSelect={handleTemplateSelect} />
    ) : (
      <EditorToolbarWorkspace values={toolbarValues} onChange={handleToolbarChange} />
    );

  return (
    <WorkspaceShell
      title={resumeName}
      mainClassName="mx-auto w-full max-w-[1320px] px-3 pb-28 pt-7 sm:px-6 lg:px-8"
      showMobileTopBar={false}
    >
      <EditorWorkspaceLayout
        resumeName={resumeName}
        mobileView={mobileView}
        activeLeftTab={activeLeftTab}
        setActiveLeftTab={setActiveLeftTab}
        setMobileView={handleMobileViewChange}
        onDownload={() => {
          if (!record) return;
          setDownloadBusy(true);
          void downloadPdf(
            record.content,
            record.renderOptions,
            record.templateId,
            `${resumeName.replace(/\s+/g, '_')}.pdf`,
          ).finally(() => setDownloadBusy(false));
        }}
        downloadLoading={downloadBusy}
        statusText={editorStatus}
        mobileTopBar={
          <EditorMobileTopbar
            title={resumeName}
            onDownload={() => {
              if (!record) return;
              setDownloadBusy(true);
              void downloadPdf(
                record.content,
                record.renderOptions,
                record.templateId,
                `${resumeName.replace(/\s+/g, '_')}.pdf`,
              ).finally(() => setDownloadBusy(false));
            }}
            downloadLoading={downloadBusy}
          />
        }
        leftWorkspace={leftWorkspace}
        previewPanel={
          <EditorPreviewPanel
            resume={record.content}
            renderOptions={record.renderOptions}
            templateId={record.templateId}
          />
        }
      />
    </WorkspaceShell>
  );
}
