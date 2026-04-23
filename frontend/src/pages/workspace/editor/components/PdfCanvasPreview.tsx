import { useEffect, useRef, useState } from 'react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

// Removed top-level workerSrc assignment to avoid overriding the dynamic main-thread strategy used on mobile

interface Props {
  pdfUrl: string | null;
  compiling: boolean;
}

/**
 * Mobile-safe PDF preview using pdf.js canvas rendering.
 * Used instead of <iframe> on devices that don't support embedded PDF viewers
 * (Android Chrome, Brave, most mobile browsers).
 */
export function PdfCanvasPreview({ pdfUrl, compiling }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (!pdfUrl) return;

    let cancelled = false;
    setRenderError(null);

    async function renderPdf() {
      try {
        const pdf = await getDocument(pdfUrl!).promise;
        if (cancelled) {
          await pdf.destroy();
          return;
        }

        setTotalPages(pdf.numPages);

        const container = containerRef.current;
        if (!container) {
          await pdf.destroy();
          return;
        }

        // Clear old canvases
        container.innerHTML = '';

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          if (cancelled) break;

          const page = await pdf.getPage(pageNum);
          if (cancelled) break;

          // Render at 2x device pixel ratio for crisp text on retina/high-DPI screens
          const devicePixelRatio = window.devicePixelRatio || 1;
          const scale = (container.clientWidth / page.getViewport({ scale: 1 }).width) * devicePixelRatio;
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          // Display size = logical pixels (divide by dpr)
          canvas.style.width = `${viewport.width / devicePixelRatio}px`;
          canvas.style.height = `${viewport.height / devicePixelRatio}px`;
          canvas.style.display = 'block';
          canvas.style.margin = '0 auto 12px';
          canvas.style.borderRadius = '8px';
          canvas.style.boxShadow = '0 2px 8px rgba(0,0,0,0.18)';

          const ctx = canvas.getContext('2d');
          if (!ctx) continue;

          await page.render({ canvasContext: ctx, canvas, viewport }).promise;
          if (cancelled) break;

          container.appendChild(canvas);
        }

        if (!cancelled) {
          await pdf.destroy();
        }
      } catch (err) {
        if (!cancelled) {
          console.warn('Canvas PDF render error:', err);
          setRenderError(err instanceof Error ? err.message : 'Preview failed');
        }
      }
    }

    void renderPdf();

    return () => {
      cancelled = true;
    };
  }, [pdfUrl]);

  return (
    <div className="relative w-full">
      {/* Compiling overlay */}
      {compiling && (
        <div className="absolute inset-0 z-10 grid place-items-center rounded-[1.5rem] bg-charcoal/30 backdrop-blur-sm">
          <div className="rounded-2xl bg-white/95 px-5 py-3 text-sm font-bold text-on-surface shadow-tactile-sm">
            Compiling...
          </div>
        </div>
      )}

      {/* Pages rendered as canvases */}
      {pdfUrl && !renderError ? (
        <div
          ref={containerRef}
          className="w-full overflow-x-hidden px-2 py-2"
          aria-label={`PDF preview, ${totalPages} page${totalPages !== 1 ? 's' : ''}`}
        />
      ) : renderError ? (
        <div className="flex min-h-[340px] items-center justify-center rounded-[1.5rem] border border-red-400/40 bg-red-50/60 p-6 text-center text-sm text-red-600">
          Preview unavailable: {renderError}
        </div>
      ) : (
        !compiling && (
          <div className="flex min-h-[340px] items-center justify-center rounded-[1.5rem] border border-charcoal/20 bg-white/80 text-sm font-semibold text-charcoal/50">
            Initializing preview...
          </div>
        )
      )}
    </div>
  );
}
