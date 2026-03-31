import { Badge } from 'components/ui/Badge';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';
import type { ResumeRecord } from 'types/resume';

interface ResumeCardProps {
  resume: ResumeRecord;
  onRename: (resume: ResumeRecord) => void;
  onDownload: (resume: ResumeRecord) => void;
  onDelete: (resume: ResumeRecord) => void;
  onOpen: (resume: ResumeRecord) => void;
}

export function ResumeCard({ resume, onRename, onDownload, onDelete, onOpen }: ResumeCardProps) {
  return (
    <Card className="ra-resume-card">
      <div className="ra-stack-md">
        <div className="ra-resume-card-header">
          <div className="ra-stack-sm">
            <h3 className="ra-card-title">{resume.name}</h3>
            <p className="ra-card-copy">Updated {resume.updated}</p>
          </div>
          {resume.recent ? <Badge variant="accent">Most recent</Badge> : <Badge>{resume.template}</Badge>}
        </div>

        <div className="ra-mini-doc" aria-hidden="true">
          <div className="ra-mini-line medium"></div>
          <div className="ra-mini-line short"></div>
          <div className="ra-mini-line long"></div>
          <div className="ra-mini-line medium"></div>
          <div className="ra-mini-line short"></div>
        </div>

        <div className="ra-chip-row">
          <Badge>{resume.template}</Badge>
          <Badge>1 page</Badge>
        </div>

        <div className="ra-actions">
          <Button variant="secondary" onClick={() => onOpen(resume)}>Open</Button>
          <Button variant="secondary" onClick={() => onRename(resume)}>Rename</Button>
          <Button variant="secondary" onClick={() => onDownload(resume)}>Download</Button>
          <Button variant="secondary" onClick={() => onDelete(resume)}>Delete</Button>
        </div>
      </div>
    </Card>
  );
}
