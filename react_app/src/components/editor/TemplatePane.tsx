import { useEffect, useState } from 'react';
import { cn } from 'lib/cn';
import { templateService } from 'services/templateService';
import type { TemplateRecord } from 'types/template';
import type { RenderTemplateId } from 'types/resumeDocument';

interface TemplatePaneProps {
  selectedTemplate: RenderTemplateId;
  onSelect: (id: RenderTemplateId) => void;
}

export function TemplatePane({ selectedTemplate, onSelect }: TemplatePaneProps) {
  const [templateOptions, setTemplateOptions] = useState<TemplateRecord[]>([]);

  useEffect(() => {
    void templateService.list().then(setTemplateOptions);
  }, []);

  return (
    <div className="grid gap-4 rounded-[1.5rem] border-[1.5px] border-charcoal/75 bg-white/85 p-4 shadow-tactile-sm">
      <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Choose a template</div>
      <div className="grid gap-4 md:grid-cols-2">
        {templateOptions.map(template => (
          <button
            key={template.id}
            className={cn(
              'grid gap-3 rounded-[1.35rem] border p-4 text-left transition',
              selectedTemplate === template.id
                ? 'border-charcoal/75 bg-surface shadow-tactile-sm'
                : 'border-outline-variant bg-white/75 hover:-translate-x-px hover:-translate-y-px hover:border-charcoal/55 hover:bg-white',
            )}
            type="button"
            onClick={() => onSelect(template.id as RenderTemplateId)}
          >
            <div className="overflow-hidden rounded-[1rem] border border-charcoal/10 bg-surface-container-low">
              {template.previewImageUrl ? (
                <img src={template.previewImageUrl} alt={`${template.name} preview`} className="aspect-[4/5] w-full object-cover object-top" loading="lazy" />
              ) : (
                <div className="grid aspect-[4/5] gap-3 p-4">
                  <div className="h-3 w-2/3 rounded-full bg-primary/80"></div>
                  <div className="h-2 w-1/3 rounded-full bg-outline-variant/60"></div>
                  <div className="mt-3 h-px bg-outline-variant/50"></div>
                  <div className="h-2 w-full rounded-full bg-outline-variant/30"></div>
                  <div className="h-2 w-5/6 rounded-full bg-outline-variant/30"></div>
                  <div className="h-2 w-3/4 rounded-full bg-outline-variant/30"></div>
                </div>
              )}
            </div>
            <div className="font-headline text-xl font-extrabold text-on-surface">{template.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
