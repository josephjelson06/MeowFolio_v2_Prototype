interface Props {
  compiling: boolean;
  error: string | null;
  svgMarkup: string | null;
}

/**
 * Mobile preview rendered directly from Typst SVG output.
 *
 * This avoids running a browser-side PDF renderer on memory-constrained
 * devices while keeping the preview close to the final Typst PDF.
 */
export function TypstSvgPreview({ compiling, error, svgMarkup }: Props) {
  return (
    <div className="relative w-full">
      {compiling && (
        <div className="absolute inset-0 z-10 grid place-items-center rounded-[1.5rem] bg-charcoal/30 backdrop-blur-sm">
          <div className="rounded-2xl bg-white/95 px-5 py-3 text-sm font-bold text-on-surface shadow-tactile-sm">
            Compiling...
          </div>
        </div>
      )}

      {svgMarkup && !error ? (
        <div
          className="grid w-full gap-3 overflow-x-hidden px-2 py-2 [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:w-full [&_svg]:max-w-[720px] [&_svg]:rounded-lg [&_svg]:bg-white [&_svg]:shadow-[0_2px_8px_rgba(0,0,0,0.18)]"
          aria-label="Resume SVG preview"
          dangerouslySetInnerHTML={{ __html: svgMarkup }}
        />
      ) : error ? (
        <div className="flex min-h-[340px] items-center justify-center rounded-[1.5rem] border border-red-400/40 bg-red-50/60 p-6 text-center text-sm text-red-600">
          Preview unavailable: {error}
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
