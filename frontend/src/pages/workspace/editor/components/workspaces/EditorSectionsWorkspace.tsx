import { EditorFormPane } from 'pages/workspace/editor/components/EditorFormPane';
import { SectionNav } from 'pages/workspace/editor/components/SectionNav';
import type { EditorSectionItem } from 'pages/workspace/editor/types';
import type { ResumeData } from 'types/resumeDocument';

export function EditorSectionsWorkspace({
  sections,
  activeSection,
  page,
  totalPages,
  resume,
  onSelectSection,
  onAddCustomSection,
  onReorderSection,
  onRemoveSection,
  onContentChange,
  onPrevPage,
  onNextPage,
}: {
  sections: EditorSectionItem[];
  activeSection: string;
  page: number;
  totalPages: number;
  resume: ResumeData;
  onSelectSection: (section: string) => void;
  onAddCustomSection: () => void;
  onReorderSection: (fromId: string, toId: string) => void;
  onRemoveSection: (section: string) => void;
  onContentChange: (updater: (current: ResumeData) => ResumeData) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
}) {
  return (
    <div className="grid min-h-0 gap-4 xl:h-full xl:grid-cols-[15rem_minmax(0,1fr)] xl:items-stretch xl:gap-0">
      <SectionNav
        sections={sections}
        activeSection={activeSection}
        onSelect={onSelectSection}
        onAddCustomSection={onAddCustomSection}
        onReorder={onReorderSection}
        onRemoveSection={onRemoveSection}
        className="xl:h-full xl:rounded-none xl:border-0 xl:border-r-[1.5px] xl:border-charcoal/18 xl:bg-transparent xl:p-5 xl:shadow-none"
      />
      <EditorFormPane
        activeSection={activeSection}
        page={page}
        resume={resume}
        totalPages={totalPages}
        onContentChange={onContentChange}
        onNextPage={onNextPage}
        onPrevPage={onPrevPage}
        className="xl:h-full xl:min-h-0 xl:overflow-y-auto xl:rounded-none xl:border-0 xl:bg-transparent xl:p-5 xl:shadow-none"
      />
    </div>
  );
}
