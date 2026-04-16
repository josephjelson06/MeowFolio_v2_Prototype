import { useEffect, useRef, useState } from 'react';
import { compileSvg } from 'lib/typst-renderer';
import type { RenderOptions, ResumeData } from 'types/resumeDocument';

function HtmlFallbackPreview({ resume }: { resume: ResumeData }) {
  const contactLine = [resume.header.email, resume.header.phone, resume.header.address, resume.header.linkedin.url]
    .filter(Boolean)
    .join(' · ');
  const skillTags = (resume.skills.items.length ? resume.skills.items : resume.skills.groups.flatMap(group => group.items)).slice(0, 6);

  return (
    <div className="mx-auto w-full max-w-[720px] rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white px-6 py-7 shadow-tactile md:px-8 md:py-9">
      <div className="font-headline text-[2rem] font-extrabold tracking-[-0.04em] text-on-surface">
        {resume.header.name?.trim() || 'Your Name'}
      </div>
      <div className="mt-2 text-sm text-[color:var(--txt2)]">{contactLine || 'email · phone · location'}</div>
      <div className="my-5 h-px bg-outline-variant/60" />
      <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Experience</div>
      <div className="mt-3 grid gap-2">
        <div className="h-2 w-full rounded-full bg-outline-variant/35" />
        <div className="h-2 w-4/5 rounded-full bg-outline-variant/35" />
      </div>
      <div className="my-5 h-px bg-outline-variant/60" />
      <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Skills</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {(skillTags.length ? skillTags : ['React', 'TypeScript', 'SQL']).map(tag => (
          <span
            className="inline-flex items-center rounded-full border border-outline-variant bg-surface px-3 py-1 text-[11px] font-semibold text-[color:var(--txt1)]"
            key={tag}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export function PdfPreview({
  resume,
  renderOptions,
  templateId,
}: {
  resume: ResumeData;
  renderOptions?: RenderOptions;
  templateId?: string;
}) {
  const [svgHtml, setSvgHtml] = useState<string | null>(null);
  const [compiling, setCompiling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<number | null>(null);
  const lastJsonRef = useRef('');

  useEffect(() => {
    if (!renderOptions || !templateId) return;

    const currentJson = JSON.stringify({ resume, renderOptions, templateId });
    if (currentJson === lastJsonRef.current) return;

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(async () => {
      lastJsonRef.current = currentJson;
      setCompiling(true);
      setError(null);
      try {
        const svg = await compileSvg(resume, renderOptions, templateId);
        setSvgHtml(svg);
      } catch (err) {
        console.warn('Typst compile error, falling back to HTML preview:', err);
        setError(err instanceof Error ? err.message : 'Compilation failed');
        setSvgHtml(null);
      } finally {
        setCompiling(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [resume, renderOptions, templateId]);

  // If no renderOptions/templateId, show HTML fallback (backward compat)
  if (!renderOptions || !templateId) {
    return <HtmlFallbackPreview resume={resume} />;
  }

  return (
    <div className="relative">
      {compiling && (
        <div className="absolute inset-0 z-10 grid place-items-center rounded-[1.5rem] bg-charcoal/30 backdrop-blur-sm">
          <div className="rounded-2xl bg-white/95 px-5 py-3 text-sm font-bold text-on-surface shadow-tactile-sm">
            Compiling…
          </div>
        </div>
      )}
      {svgHtml ? (
        <div
          className="mx-auto w-full max-w-[720px] rounded-[1.5rem] border-[1.5px] border-charcoal/70 bg-white shadow-tactile [&>svg]:w-full"
          dangerouslySetInnerHTML={{ __html: svgHtml }}
        />
      ) : error ? (
        <div className="grid gap-3">
          <HtmlFallbackPreview resume={resume} />
          <div className="text-center text-xs text-outline">
            PDF preview unavailable: {error}
          </div>
        </div>
      ) : (
        <HtmlFallbackPreview resume={resume} />
      )}
    </div>
  );
}
