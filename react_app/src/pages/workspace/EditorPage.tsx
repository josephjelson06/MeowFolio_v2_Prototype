import { useEffect, useMemo, useState } from 'react';
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

const sectionItems: Record<string, string[]> = {
  contact: [],
  summary: [],
  exp: ['Experience item 1', 'Experience item 2', 'Experience item 3', 'Experience item 4', 'Experience item 5', 'Experience item 6'],
  edu: ['Education item 1', 'Education item 2', 'Education item 3', 'Education item 4', 'Education item 5', 'Education item 6'],
  skills: ['Skills group 1', 'Skills group 2', 'Skills group 3', 'Skills group 4', 'Skills group 5', 'Skills group 6'],
  proj: ['Project item 1', 'Project item 2', 'Project item 3', 'Project item 4', 'Project item 5', 'Project item 6'],
};

const sections: EditorSectionItem[] = [
  { id: 'contact', label: 'Contact', done: true },
  { id: 'summary', label: 'Summary', done: true },
  { id: 'exp', label: 'Experience', done: true },
  { id: 'edu', label: 'Education', done: true },
  { id: 'skills', label: 'Skills', done: true },
  { id: 'proj', label: 'Projects' },
];

const leftTabs = [
  { id: 'sections', label: 'Sections' },
  { id: 'template', label: 'Template' },
  { id: 'toolbar', label: 'Toolbar' },
] as const;

const initialToolbarValues: ToolbarValues = {
  font: 'TeX Gyre Termes',
  fontSize: 11,
  lineSpacing: 115,
  margins: 15,
  colorIndex: 0,
};

export function EditorPage() {
  const { isMobile } = useViewportMode();
  const [searchParams] = useSearchParams();
  const resumeIdFromQuery = searchParams.get('resumeId');
  const [resumeOptions, setResumeOptions] = useState<Awaited<ReturnType<typeof resumeService.list>>>([]);
  const [mode, setMode] = useState<'editor' | 'ats'>('editor');
  const [mobileView, setMobileView] = useState<'edit' | 'preview' | 'ats'>('edit');
  const [activeLeftTab, setActiveLeftTab] = useState<(typeof leftTabs)[number]['id']>('sections');
  const [activeSection, setActiveSection] = useState(sections[0].id);
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [toolbarValues, setToolbarValues] = useState<ToolbarValues>(initialToolbarValues);
  const [pageBySection, setPageBySection] = useState<Record<string, number>>({
    contact: 1,
    summary: 1,
    exp: 1,
    edu: 1,
    skills: 1,
    proj: 1,
  });

  const items = sectionItems[activeSection] ?? [];
  const page = pageBySection[activeSection] ?? 1;
  const totalPages = Math.max(1, Math.ceil(items.length / 5));
  const visibleItems = useMemo(() => items.slice((page - 1) * 5, ((page - 1) * 5) + 5), [items, page]);
  const activeResume = useMemo(() => {
    const preferredId = resumeIdFromQuery ?? resumeService.getActiveId();
    return resumeOptions.find(item => item.id === preferredId) ?? resumeOptions[0] ?? {
      id: 'resume_v3',
      name: 'resume_v3.tex',
      updated: 'Updated 2h ago',
      template: 'Classic',
    };
  }, [resumeIdFromQuery, resumeOptions]);

  useEffect(() => {
    async function loadResumes() {
      setResumeOptions(await resumeService.list());
    }

    loadResumes();
    window.addEventListener(resumeService.eventName, loadResumes);
    return () => window.removeEventListener(resumeService.eventName, loadResumes);
  }, []);

  useEffect(() => {
    if (activeResume?.id) {
      resumeService.setActiveId(activeResume.id);
    }
  }, [activeResume]);

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

  const rootClassName = `editor-root${isMobile ? ` mob-${mobileView}-view` : ''}`;

  return (
    <div className={rootClassName}>
      <EditorMobileTopbar
        title={activeResume.name}
        onAnalyze={() => {
          setSheetOpen(true);
          setMobileView('preview');
        }}
      />

      <div className="mob-edit-toggle editor-mobile-toggle">
        <button
          className={`mob-et-btn${mobileView === 'edit' ? ' active' : ''}`}
          type="button"
          onClick={() => {
            setMobileView('edit');
            setSheetOpen(false);
          }}
        >
          Edit
        </button>
        <button
          className={`mob-et-btn${mobileView === 'preview' ? ' active' : ''}`}
          type="button"
          onClick={() => {
            setMobileView('preview');
            setSheetOpen(false);
          }}
        >
          Preview
        </button>
        <button
          className={`mob-et-btn${mobileView === 'ats' ? ' active' : ''}`}
          type="button"
          onClick={() => {
            setMobileView('ats');
            setSheetOpen(false);
          }}
        >
          ATS
        </button>
      </div>

      <div className="bcrumb editor-bcrumb">
        <NavLink className="bc-link" to={routes.resumes}>
          Resumes
        </NavLink>
        <span className="bc-sep">/</span>
        <span className="bc-link">{activeResume.name}</span>
        <span className="bc-sep">/</span>
        <span className="bc-cur">{mode === 'ats' ? 'ATS Score' : 'Editor'}</span>
        <div className="ed-segs">
          <button
            className={`ed-seg${mode === 'editor' ? ' active' : ''}`}
            type="button"
            onClick={() => handleModeChange('editor')}
          >
            Editor
          </button>
          <button
            className={`ed-seg${mode === 'ats' ? ' active' : ''}`}
            type="button"
            onClick={() => handleModeChange('ats')}
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
                  <SectionNav sections={sections} activeSection={activeSection} onSelect={setActiveSection} />
                  <EditorFormPane
                    activeSection={activeSection}
                    items={visibleItems}
                    page={page}
                    totalPages={totalPages}
                    onPrevPage={() => updatePage(page - 1)}
                    onNextPage={() => updatePage(page + 1)}
                  />
                </div>
              ) : null}

              {activeLeftTab === 'template' ? (
                <TemplatePane selectedTemplate={selectedTemplate} onSelect={setSelectedTemplate} />
              ) : null}

              {activeLeftTab === 'toolbar' ? (
                <ToolbarPane
                  values={toolbarValues}
                  onChange={patch => setToolbarValues(current => ({ ...current, ...patch }))}
                />
              ) : null}
            </div>

            <div className="ed-right">
              <div className="prev-bar">
                <div className="sync-row">
                  <span className="sync-dot"></span>
                  <span>compiled &middot; 0.8s ago</span>
                </div>
                <button
                  className="analyze-btn"
                  type="button"
                  onClick={() => setDrawerOpen(current => !current)}
                >
                  Analyze &rarr;
                </button>
              </div>
              <div className="pdf-area">
                <PdfPreview />
              </div>
              <AtsDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
            </div>
          </div>
        </div>
      ) : (
        <div id="ed-mode-ats">
          <AtsFullReport
            onBack={() => {
              if (isMobile) {
                setMobileView('edit');
              }
              handleModeChange('editor');
            }}
          />
        </div>
      )}

      <EditorMobileSheet
        open={sheetOpen}
        onToggle={() => setSheetOpen(current => !current)}
        onOpenFullReport={() => {
          setSheetOpen(false);
          setMobileView('ats');
        }}
      />
    </div>
  );
}
