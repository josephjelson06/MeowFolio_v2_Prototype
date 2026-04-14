import { TemplatePane } from 'pages/workspace/editor/components/TemplatePane';
import type { RenderTemplateId } from 'types/resumeDocument';

export function EditorTemplateWorkspace({
  selectedTemplate,
  onSelect,
}: {
  selectedTemplate: RenderTemplateId;
  onSelect: (id: RenderTemplateId) => void;
}) {
  return <TemplatePane selectedTemplate={selectedTemplate} onSelect={onSelect} className="xl:h-full xl:min-h-0 xl:overflow-y-auto xl:rounded-none xl:border-0 xl:bg-transparent xl:p-5 xl:shadow-none" />;
}
