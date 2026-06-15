import { PdfPreview } from 'pages/workspace/editor/components/PdfPreview';
import type { RenderOptions, ResumeData } from 'types/resumeDocument';

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
    <div className={className}>
      <div className="relative grid min-h-[28rem] overflow-hidden rounded-[1.5rem] border-[1.5px] border-charcoal/75 bg-[#2b2b2b] shadow-tactile-sm xl:h-full xl:min-h-0">
        <div className="relative min-h-0 overflow-auto px-5 py-6 md:px-7 md:py-8">
          <PdfPreview resume={resume} renderOptions={renderOptions} templateId={templateId} />
        </div>
      </div>
    </div>
  );
}
