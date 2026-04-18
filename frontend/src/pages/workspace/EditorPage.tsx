import { useEffect, useState } from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import { routes } from 'lib/routes';
import { downloadPdf } from 'lib/typst-renderer';
import { WorkspaceShell } from 'components/workspace/WorkspaceShell';
import { AtsFullReport } from 'pages/workspace/editor/components/AtsFullReport';
import { EditorMobileSheet } from 'pages/workspace/editor/components/EditorMobileSheet';
import { EditorMobileTopbar } from 'pages/workspace/editor/components/EditorMobileTopbar';
import { EditorPreviewPanel } from 'pages/workspace/editor/components/EditorPreviewPanel';
import { EditorWorkspaceLayout } from 'pages/workspace/editor/components/EditorWorkspaceLayout';
import { EditorSectionsWorkspace } from 'pages/workspace/editor/components/workspaces/EditorSectionsWorkspace';
import { EditorTemplateWorkspace } from 'pages/workspace/editor/components/workspaces/EditorTemplateWorkspace';
import { EditorToolbarWorkspace } from 'pages/workspace/editor/components/workspaces/EditorToolbarWorkspace';
import { useEditorAts } from 'pages/workspace/editor/hooks/useEditorAts';
import { useEditorAutosave } from 'pages/workspace/editor/hooks/useEditorAutosave';
import { useEditorRecord } from 'pages/workspace/editor/hooks/useEditorRecord';
import { usePageViewportMode } from 'pages/workspace/editor/hooks/usePageViewportMode';
import { leftTabs, type ToolbarValues } from 'pages/workspace/editor/types';
import { buildResumePlainText, DEFAULT_RENDER_OPTIONS, GENERIC_CUSTOM_SECTION_LABELS, type GenericCustomSectionKey, type RenderTemplateId, type ResumeData, type ResumeSectionKey } from 'types/resumeDocument';
import { applyToolbarValues, toolbarFromRenderOptions } from 'pages/workspace/editor/utils/editorToolbar';

export function EditorPage() {
  const { isMobile } = usePageViewportMode();
  const [searchParams] = useSearchParams();
  const resumeIdFromQuery = searchParams.get('resumeId');
  const [mode, setMode] = useState<'editor' | 'ats'>('editor');
  const [mobileView, setMobileView] = useState<'edit' | 'preview' | 'ats'>('edit');
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

  const { persistNow, saveState } = useEditorAutosave({
    activeResumeId,
    record,
    setRecord,
  });

  const {
    atsLoading,
    atsReport,
    clearAtsReport,
    drawerOpen,
    runAtsAnalysis,
    setDrawerOpen,
    setSheetOpen,
    sheetOpen,
  } = useEditorAts({
    isMobile,
    persistNow,
    setMobileView,
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

  useEffect(() => {
    if (!isMobile) return;
    if (mode === 'ats') {
      setMobileView('ats');
      return;
    }

    if (sheetOpen) {
      setMobileView('preview');
      return;
    }

    setMobileView('edit');
  }, [isMobile, mode, sheetOpen]);

  useEffect(() => {
    if (isMobile) return;
    if (mode === 'ats') setDrawerOpen(false);
  }, [isMobile, mode, setDrawerOpen]);

  function updatePage(nextPage: number) {
    setPageBySection(current => ({
      ...current,
      [activeSection]: Math.max(1, Math.min(nextPage, totalPages)),
    }));
  }

  function handleModeChange(nextMode: 'editor' | 'ats') {
    setMode(nextMode);
    if (nextMode === 'editor' && isMobile) setMobileView('edit');
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
    clearAtsReport();
  }

  function addCustomSection() {
    if (!record) return;
    const availableGenerics = Object.keys(GENERIC_CUSTOM_SECTION_LABELS) as GenericCustomSectionKey[];
    const activeIds = record.renderOptions.sectionOrder;
    const nextSection = availableGenerics.find(key => !activeIds.includes(key));
    
    if (!nextSection) {
      alert("All custom sections are currently in use!");
      return;
    }

    setRecord(current => {
      if (!current) return current;
      return {
        ...current,
        renderOptions: {
          ...current.renderOptions,
          sectionOrder: [...current.renderOptions.sectionOrder, nextSection],
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
    clearAtsReport();
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
    clearAtsReport();
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
    clearAtsReport();
  }

  function handleMobileViewChange(view: 'edit' | 'preview' | 'ats') {
    setMobileView(view);
    setSheetOpen(false);
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
        mode={mode}
        mobileView={mobileView}
        activeLeftTab={activeLeftTab}
        setActiveLeftTab={setActiveLeftTab}
        setMobileView={handleMobileViewChange}
        onShowEditor={() => handleModeChange('editor')}
        onShowAts={() => {
          handleModeChange('ats');
          void runAtsAnalysis();
        }}
        onAnalyze={() => {
          void runAtsAnalysis();
        }}
        analyzeLoading={atsLoading}
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
            onAnalyze={() => {
              void runAtsAnalysis();
            }}
          />
        }
        leftWorkspace={leftWorkspace}
        previewPanel={
          <EditorPreviewPanel
            resume={record.content}
            renderOptions={record.renderOptions}
            templateId={record.templateId}
            atsReport={atsReport}
            drawerOpen={drawerOpen}
            onCloseDrawer={() => setDrawerOpen(false)}
          />
        }
        atsReportView={
          <AtsFullReport
            report={atsReport}
            resumeName={resumeName}
            onBack={() => {
              if (isMobile) setMobileView('edit');
              handleModeChange('editor');
            }}
          />
        }
        mobileSheet={
          <EditorMobileSheet
            open={sheetOpen}
            report={atsReport}
            onToggle={() => setSheetOpen(current => !current)}
            onOpenFullReport={() => {
              setSheetOpen(false);
              setMobileView('ats');
            }}
          />
        }
      />
    </WorkspaceShell>
  );
}
