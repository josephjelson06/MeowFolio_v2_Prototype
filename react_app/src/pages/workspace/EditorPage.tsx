import { useMemo, useState } from 'react';
import { Card } from 'components/ui/Card';
import { AtsDrawer } from 'components/editor/AtsDrawer';
import { AtsFullReport } from 'components/editor/AtsFullReport';
import { EditorFormPane } from 'components/editor/EditorFormPane';
import { EditorTabs } from 'components/editor/EditorTabs';
import { PdfPreview } from 'components/editor/PdfPreview';
import { SectionNav } from 'components/editor/SectionNav';
import { TemplatePane } from 'components/editor/TemplatePane';
import { ToolbarPane } from 'components/editor/ToolbarPane';

const sectionItems: Record<string, string[]> = {
  Summary: ['Professional summary'],
  Experience: ['Experience item 1', 'Experience item 2', 'Experience item 3', 'Experience item 4', 'Experience item 5', 'Experience item 6'],
  Projects: ['Project item 1', 'Project item 2', 'Project item 3', 'Project item 4', 'Project item 5', 'Project item 6'],
  Education: ['Education item 1', 'Education item 2', 'Education item 3', 'Education item 4', 'Education item 5', 'Education item 6'],
  Skills: ['Skills group 1', 'Skills group 2', 'Skills group 3', 'Skills group 4', 'Skills group 5', 'Skills group 6'],
};

const sections = Object.keys(sectionItems);

export function EditorPage() {
  const [mode, setMode] = useState<'edit' | 'preview' | 'ats'>('edit');
  const [activeSection, setActiveSection] = useState(sections[0]);
  const [pageBySection, setPageBySection] = useState<Record<string, number>>({
    Summary: 1,
    Experience: 1,
    Projects: 1,
    Education: 1,
    Skills: 1,
  });

  const page = pageBySection[activeSection] ?? 1;
  const items = sectionItems[activeSection];
  const totalPages = Math.max(1, Math.ceil(items.length / 5));
  const visibleItems = useMemo(() => items.slice((page - 1) * 5, ((page - 1) * 5) + 5), [items, page]);

  function updatePage(nextPage: number) {
    setPageBySection(current => ({
      ...current,
      [activeSection]: Math.max(1, Math.min(totalPages, nextPage)),
    }));
  }

  return (
    <div className="ra-page-stack">
      <Card>
        <div className="ra-stack-lg">
          <div className="ra-page-header">
            <div className="section-label">EDITOR WORKSPACE</div>
            <h1 className="ra-card-title">One route, one state tree.</h1>
            <p className="ra-subtitle">The editor is now isolated under its own layout, with local mode and section state instead of DOM scripting.</p>
          </div>
          <EditorTabs mode={mode} onModeChange={setMode} />
        </div>
      </Card>

      <section className="ra-editor-shell">
        <Card>
          <div className="ra-stack-lg">
            <SectionNav sections={sections} activeSection={activeSection} onSelect={setActiveSection} />
            <TemplatePane />
            <ToolbarPane />
          </div>
        </Card>

        <Card>
          {mode === 'ats' ? (
            <AtsFullReport />
          ) : (
            <EditorFormPane
              activeSection={activeSection}
              items={visibleItems}
              page={page}
              totalPages={totalPages}
              onPrevPage={() => updatePage(page - 1)}
              onNextPage={() => updatePage(page + 1)}
            />
          )}
        </Card>

        <Card>
          <div className="ra-stack-lg">
            <PdfPreview />
            <AtsDrawer />
          </div>
        </Card>
      </section>
    </div>
  );
}
