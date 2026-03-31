import { Badge } from 'components/ui/Badge';

export function PdfPreview() {
  return (
    <div className="ra-stack-md">
      <div className="ra-mini-doc ra-editor-preview">
        <div className="pdf-name">Arjun Kumar</div>
        <div className="pdf-contact">arjun@email.com | Karnal, Haryana</div>
        <div className="pdf-divider"></div>
        <div className="ra-mini-line medium"></div>
        <div className="ra-mini-line long"></div>
        <div className="ra-mini-line long"></div>
        <div className="ra-mini-line short"></div>
        <div className="pdf-divider"></div>
        <div className="ra-mini-line medium"></div>
        <div className="ra-mini-line long"></div>
        <div className="ra-mini-line medium"></div>
        <div className="ra-mini-line short"></div>
      </div>
      <div className="ra-chip-row">
        <Badge>B&W</Badge>
        <Badge>Classic</Badge>
        <Badge>1 page</Badge>
      </div>
    </div>
  );
}
