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
    <article className="res-card" onClick={() => onOpen(resume)}>
      <div className="res-visual-thumb" aria-hidden="true">
        <div className="pdf-name res-thumb-name">Arjun Kumar</div>
        <div className="pdf-contact res-thumb-contact">arjun@email.com</div>
        <div className="pdf-divider"></div>
        <div className="pdf-line d res-thumb-line-short"></div>
        <div className="pdf-line res-thumb-line-full"></div>
        <div className="pdf-line res-thumb-line-mid"></div>
        <div className="pdf-line res-thumb-line-midtwo"></div>
      </div>

      <div className="res-card-body">
        <div className="res-card-top">
          <div>
            <div className="res-visual-name">{resume.name}</div>
            <div className="res-visual-meta">Last updated {resume.updated} - {resume.template}</div>
          </div>
          {resume.recent ? <span className="badge-outline">MOST RECENT</span> : null}
        </div>

        <div className="res-card-actions">
          <button
            className="r-action primary"
            type="button"
            onClick={event => {
              event.stopPropagation();
              onOpen(resume);
            }}
            aria-label={`Open ${resume.name}`}
          >
            &#9998;
          </button>
          <button
            className="r-action"
            type="button"
            onClick={event => {
              event.stopPropagation();
              onRename(resume);
            }}
          >
            Rename
          </button>
          <button
            className="r-action"
            type="button"
            onClick={event => {
              event.stopPropagation();
              onDownload(resume);
            }}
            aria-label={`Download ${resume.name}`}
          >
            &#11015;
          </button>
          <button
            className="r-action res-delete-action"
            type="button"
            onClick={event => {
              event.stopPropagation();
              onDelete(resume);
            }}
            aria-label={`Delete ${resume.name}`}
          >
            &#128465;
          </button>
        </div>
      </div>
    </article>
  );
}
