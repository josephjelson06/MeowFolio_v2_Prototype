import { Badge } from 'components/ui/Badge';

const templates = ['Classic', 'Sidebar', 'Structured', 'Minimal'];

export function TemplatePane() {
  return (
    <div className="ra-stack-md">
      <div className="section-label">TEMPLATES</div>
      <div className="ra-chip-row">
        {templates.map(template => <Badge key={template}>{template}</Badge>)}
      </div>
      <p className="ra-card-copy">Keep template selection route-local so editor styling concerns never leak into other pages.</p>
    </div>
  );
}
