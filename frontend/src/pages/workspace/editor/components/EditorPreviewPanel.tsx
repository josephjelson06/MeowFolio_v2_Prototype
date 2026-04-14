import { AtsDrawer } from 'pages/workspace/editor/components/AtsDrawer';
import { PdfPreview } from 'pages/workspace/editor/components/PdfPreview';
import type { AtsScoreResponse, ResumeData } from 'types/resumeDocument';

export function EditorPreviewPanel({
  resume,
  syncCopy,
  loadError,
  atsLoading,
  atsReport,
  drawerOpen,
  onAnalyze,
  onCloseDrawer,
  className,
}: {
  resume: ResumeData;
  syncCopy: string;
  loadError: string | null;
  atsLoading: boolean;
  atsReport: AtsScoreResponse | null;
  drawerOpen: boolean;
  onAnalyze: () => void;
  onCloseDrawer: () => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-sm text-[color:var(--txt1)]">
        <div className="flex items-center gap-3 text-sm text-[color:var(--txt1)]">
          <span className="size-2.5 rounded-full bg-tertiary"></span>
          <span>
            {syncCopy}
            {loadError ? ` · ${loadError}` : ''}
          </span>
        </div>
        <button
          className="inline-flex min-h-10 items-center justify-center rounded-full border-2 border-charcoal/75 bg-white/90 px-4 py-2 font-headline text-[11px] font-bold shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:bg-white disabled:pointer-events-none disabled:opacity-40"
          type="button"
          onClick={onAnalyze}
          disabled={atsLoading}
        >
          {atsLoading ? 'Analyzing...' : 'Analyze →'}
        </button>
      </div>

      <div className="relative rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/90 p-4 shadow-tactile md:p-6">
        <PdfPreview resume={resume} />
        <AtsDrawer open={drawerOpen} report={atsReport} onClose={onCloseDrawer} />
      </div>
    </div>
  );
}
