import { useEffect, useState } from 'react';
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
    <div className="tmpl-pane">
      <div className="tmpl-label">Choose a template</div>
      <div className="tmpl-grid">
        {templateOptions.map(template => (
          <button
            key={template.id}
            className={`tmpl-card${selectedTemplate === template.id ? ' sel' : ''}`}
            type="button"
            onClick={() => onSelect(template.id as RenderTemplateId)}
          >
            <div className="tmpl-thumb">
              {template.previewImageUrl ? (
                <img src={template.previewImageUrl} alt={`${template.name} preview`} className="tmpl-thumb-img" loading="lazy" />
              ) : (
                <>
                  <div className="tl h"></div>
                  <div className="tl s"></div>
                  <div className="editor-mini-divider"></div>
                  <div className="tl"></div>
                  <div className="tl"></div>
                  <div className="tl s"></div>
                </>
              )}
            </div>
            <div className="tmpl-name">{template.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
