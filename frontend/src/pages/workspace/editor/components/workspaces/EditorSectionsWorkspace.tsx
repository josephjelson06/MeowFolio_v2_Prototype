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
  onMoveSection,
  onRemoveSection,
  canMoveUp,
  canMoveDown,
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
  onMoveSection: (section: string, direction: 'up' | 'down') => void;
  onRemoveSection: (section: string) => void;
  canMoveUp: (section: string) => boolean;
  canMoveDown: (section: string) => boolean;
  onContentChange: (updater: (current: ResumeData) => ResumeData) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
}) {
  return (
    <div className="grid gap-4 xl:min-h-full xl:grid-cols-[240px_minmax(0,1fr)] xl:items-start xl:gap-0">
      <SectionNav
        sections={sections}
        activeSection={activeSection}
        onSelect={onSelectSection}
        onAddCustomSection={onAddCustomSection}
        onMoveSection={onMoveSection}
        onRemoveSection={onRemoveSection}
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
        className="xl:min-h-full xl:rounded-none xl:border-0 xl:border-r-[1.5px] xl:border-charcoal/18 xl:bg-transparent xl:p-5 xl:shadow-none"
      />
      <EditorFormPane
        activeSection={activeSection}
        page={page}
        resume={resume}
        totalPages={totalPages}
        onContentChange={onContentChange}
        onNextPage={onNextPage}
        onPrevPage={onPrevPage}
        className="xl:rounded-none xl:border-0 xl:bg-transparent xl:p-5 xl:shadow-none"
      />
    </div>
  );
}
