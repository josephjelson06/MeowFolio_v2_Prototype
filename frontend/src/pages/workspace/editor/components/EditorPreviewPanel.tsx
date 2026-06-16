import { PdfPreview } from 'pages/workspace/editor/components/PdfPreview';
import type { RenderOptions, ResumeData } from 'types/resumeDocument';
import { cn } from 'lib/cn';

export function EditorPreviewPanel({
  resume,
  renderOptions,
  templateId,
  className,
}: {
  resume: ResumeData;
  renderOptions?: RenderOptions;
  templateId?: string;
  className?: string;
}) {
  return (
    <div className={cn("xl:h-full xl:min-h-0", className)}>
      <div className="relative flex flex-col h-full min-h-[30rem] rounded-[1.5rem] border-[1.5px] border-charcoal/75 bg-[#2b2b2b] p-4 md:p-6 shadow-tactile-sm xl:min-h-0">
        <div className="relative flex-1 min-h-0 w-full overflow-hidden rounded-xl">
          <PdfPreview resume={resume} renderOptions={renderOptions} templateId={templateId} />
        </div>
      </div>
    </div>
  );
}
