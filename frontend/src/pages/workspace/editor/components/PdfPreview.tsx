import { useEffect, useRef, useState } from 'react';
import { compilePdfBlobUrl, compileSvg } from 'lib/typst-renderer';
import { usePageViewportMode } from 'pages/workspace/editor/hooks/usePageViewportMode';
import { TypstSvgPreview } from 'pages/workspace/editor/components/TypstSvgPreview';
import type { RenderOptions, ResumeData } from 'types/resumeDocument';

export function PdfPreview({
  resume,
  renderOptions,
  templateId,
}: {
  resume: ResumeData;
  renderOptions?: RenderOptions;
  templateId?: string;
}) {
  const { isMobile } = usePageViewportMode();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [svgMarkup, setSvgMarkup] = useState<string | null>(null);
  const [compiling, setCompiling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<number | null>(null);
  const lastJsonRef = useRef('');

  useEffect(() => {
    if (!renderOptions || !templateId) return;

    const currentJson = JSON.stringify({ isMobile, resume, renderOptions, templateId });
    if (currentJson === lastJsonRef.current) return;

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(async () => {
      lastJsonRef.current = currentJson;
      setCompiling(true);
      setError(null);
      try {
        if (isMobile) {
          const svg = await compileSvg(resume, renderOptions, templateId);
          setSvgMarkup(svg);
          setPdfUrl(oldUrl => {
            if (oldUrl) URL.revokeObjectURL(oldUrl);
            return null;
          });
        } else {
          const url = await compilePdfBlobUrl(resume, renderOptions, templateId);
          setSvgMarkup(null);
          setPdfUrl(oldUrl => {
            if (oldUrl) URL.revokeObjectURL(oldUrl);
            return url;
          });
        }
      } catch (err) {
        console.warn('Typst compile error:', err);
        setError(err instanceof Error ? err.message : 'Compilation failed');
        setSvgMarkup(null);
        setPdfUrl(oldUrl => {
          if (oldUrl) URL.revokeObjectURL(oldUrl);
          return null;
        });
      } finally {
        setCompiling(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [isMobile, resume, renderOptions, templateId]);

  // Clean up object URL on unmount
  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  if (!renderOptions || !templateId) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-[1.5rem] border-[1.5px] border-charcoal/70 bg-white shadow-tactile">
        <div className="text-sm font-semibold text-charcoal/50">Select a template to preview</div>
      </div>
    );
  }

  // Mobile: render Typst SVG directly to avoid browser-side PDF rendering.
  if (isMobile) {
    return <TypstSvgPreview compiling={compiling} error={error} svgMarkup={svgMarkup} />;
  }

  // Desktop: use iframe with the native browser PDF viewer.
  return (
    <div className="relative h-full w-full">
      {compiling && (
        <div className="absolute inset-0 z-10 grid place-items-center rounded-[1.5rem] bg-charcoal/30 backdrop-blur-sm">
          <div className="rounded-2xl bg-white/95 px-5 py-3 text-sm font-bold text-on-surface shadow-tactile-sm">
            Compiling...
          </div>
        </div>
      )}
      {pdfUrl ? (
        <iframe
          src={`${pdfUrl}#toolbar=1&view=FitH`}
          className="mx-auto w-full max-w-[720px] h-[calc(100vh-10rem)] min-h-[600px] rounded-[1.5rem] border-[1.5px] border-charcoal/70 bg-white shadow-tactile"
          title="Resume PDF Preview"
        />
      ) : error ? (
        <div className="mx-auto flex w-full max-w-[720px] h-[calc(100vh-10rem)] min-h-[600px] items-center justify-center rounded-[1.5rem] border-[1.5px] border-red-500/50 bg-red-50/50 p-6 shadow-tactile">
          <div className="text-center text-sm font-medium text-red-600">
            PDF preview unavailable: {error}
          </div>
        </div>
      ) : (
        <div className="mx-auto flex w-full max-w-[720px] h-[calc(100vh-10rem)] min-h-[600px] items-center justify-center rounded-[1.5rem] border-[1.5px] border-charcoal/70 bg-white shadow-tactile">
          <div className="text-sm font-semibold text-charcoal/50">Initializing preview...</div>
        </div>
      )}
    </div>
  );
}
