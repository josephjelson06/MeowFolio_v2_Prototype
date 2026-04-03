import { Badge } from 'components/ui/Badge';
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
    <article
      className="grid cursor-pointer gap-4 rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/90 p-4 shadow-tactile transition hover:-translate-x-px hover:-translate-y-px md:p-5"
      onClick={() => onOpen(resume)}
    >
      <div className="grid gap-3 rounded-[1.25rem] border border-outline-variant bg-surface px-4 py-4" aria-hidden="true">
        <div className="font-headline text-sm font-bold text-on-surface">Arjun Kumar</div>
        <div className="text-[11px] text-[color:var(--txt2)]">arjun@email.com</div>
        <div className="h-px bg-outline-variant"></div>
        <div className="h-1.5 w-2/5 rounded-full bg-outline-variant/70"></div>
        <div className="h-1.5 w-full rounded-full bg-primary/20"></div>
        <div className="h-1.5 w-4/5 rounded-full bg-primary/20"></div>
        <div className="h-1.5 w-3/4 rounded-full bg-primary/20"></div>
      </div>

      <div className="grid gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-headline text-lg font-extrabold text-on-surface">{resume.name}</div>
            <div className="mt-1 text-sm text-[color:var(--txt2)]">Last updated {resume.updated} · {resume.template}</div>
          </div>
          {resume.recent ? <Badge>MOST RECENT</Badge> : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            className="inline-flex min-h-8 items-center justify-center rounded-full border-2 border-primary/35 bg-primary-fixed px-3 py-1.5 font-sans text-[10px] font-semibold text-primary shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:bg-primary-fixed/80"
            type="button"
            onClick={event => {
              event.stopPropagation();
              onOpen(resume);
            }}
            aria-label={`Open ${resume.name}`}
          >
            Edit
          </button>
          <button
            className="inline-flex min-h-8 items-center justify-center rounded-full border-2 border-charcoal/75 bg-white/85 px-3 py-1.5 font-sans text-[10px] font-semibold text-[color:var(--txt1)] shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:bg-white"
            type="button"
            onClick={event => {
              event.stopPropagation();
              onRename(resume);
            }}
          >
            Rename
          </button>
          <button
            className="inline-flex min-h-8 items-center justify-center rounded-full border-2 border-charcoal/75 bg-white/85 px-3 py-1.5 font-sans text-[10px] font-semibold text-[color:var(--txt1)] shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:bg-white"
            type="button"
            onClick={event => {
              event.stopPropagation();
              onDownload(resume);
            }}
            aria-label={`Download ${resume.name}`}
          >
            Download
          </button>
          <button
            className="inline-flex min-h-8 items-center justify-center rounded-full border-2 border-error/30 bg-error-container/70 px-3 py-1.5 font-sans text-[10px] font-semibold text-error shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:bg-error-container"
            type="button"
            onClick={event => {
              event.stopPropagation();
              onDelete(resume);
            }}
            aria-label={`Delete ${resume.name}`}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
