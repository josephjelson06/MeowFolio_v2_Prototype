import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from 'lib/cn';
import { downloadTextFile } from 'lib/formatters';
import { downloadPdf } from 'lib/typst-renderer';
import { routes } from 'app/router/routes';
import { WorkspaceBadge } from 'components/workspace/WorkspaceBadge';
import { WorkspaceShell } from 'components/workspace/WorkspaceShell';
import { resumeService } from 'services/resumeService';
import { useUiContext } from 'state/ui/uiContext';
import type { ResumeRecord } from 'types/resume';

function getVisibleResumes(resumes: ResumeRecord[], page: number) {
  if (page === 1) return resumes.slice(0, 5);
  const start = 5 + (page - 2) * 6;
  return resumes.slice(start, start + 6);
}

function getTotalPages(count: number) {
  if (count <= 5) return 1;
  return 1 + Math.ceil((count - 5) / 6);
}

type ResumeActionVariant = 'primary' | 'secondary' | 'link' | 'danger';
type ResumeActionSize = 'sm' | 'md' | 'lg';

function ResumeAction({
  children,
  className,
  disabled,
  onClick,
  size = 'md',
  to,
  variant = 'primary',
}: {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  size?: ResumeActionSize;
  to?: string;
  variant?: ResumeActionVariant;
}) {
  const sizeClass =
    size === 'lg'
      ? 'min-h-[3.5rem] px-7 py-3.5 text-base'
      : size === 'md'
        ? 'min-h-12 px-6 py-3 text-sm'
        : 'min-h-8 px-3 py-1.5 text-[10px]';
  const variantClass =
    variant === 'primary'
      ? 'bg-white/95 text-on-surface hover:bg-surface-container-low hover:text-primary hover:shadow-tactile'
      : variant === 'secondary'
        ? 'bg-white/85 text-[color:var(--txt1)] hover:bg-white hover:text-on-surface hover:shadow-tactile'
        : variant === 'danger'
          ? 'border-error/30 bg-error-container/70 text-error hover:bg-error-container hover:text-error'
          : 'border-charcoal/65 bg-white/80 text-[color:var(--txt1)] hover:bg-white hover:text-on-surface hover:shadow-tactile-sm';
  const actionClass = cn(
    'inline-flex items-center justify-center gap-2 rounded-full border-2 border-charcoal text-center font-headline font-bold tracking-[0.01em] transition duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-40',
    'shadow-tactile-sm hover:-translate-x-px hover:-translate-y-px active:translate-x-px active:translate-y-px active:shadow-none',
    sizeClass,
    variantClass,
    className,
  );

  if (to) {
    return (
      <Link className={actionClass} to={to}>
        {children}
      </Link>
    );
  }

  return (
    <button className={actionClass} type="button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

function ResumeLibraryCard({
  onDelete,
  onDownload,
  onOpen,
  onRename,
  resume,
}: {
  onDelete: (resume: ResumeRecord) => void;
  onDownload: (resume: ResumeRecord) => void;
  onOpen: (resume: ResumeRecord) => void;
  onRename: (resume: ResumeRecord) => void;
  resume: ResumeRecord;
}) {
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
            <div className="mt-1 text-sm text-[color:var(--txt2)]">
              Last updated {resume.updated} · {resume.template}
            </div>
          </div>
          {resume.recent ? <WorkspaceBadge>MOST RECENT</WorkspaceBadge> : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <ResumeAction size="sm" variant="primary" onClick={() => onOpen(resume)}>
            Edit
          </ResumeAction>
          <ResumeAction size="sm" variant="secondary" onClick={() => onRename(resume)}>
            Rename
          </ResumeAction>
          <ResumeAction size="sm" variant="secondary" onClick={() => onDownload(resume)}>
            Download
          </ResumeAction>
          <ResumeAction size="sm" variant="danger" onClick={() => onDelete(resume)}>
            Delete
          </ResumeAction>
        </div>
      </div>
    </article>
  );
}

export function ResumesPage() {
  const navigate = useNavigate();
  const { openResume, openResumeDelete, openResumeRename } = useUiContext();
  const [resumes, setResumes] = useState<ResumeRecord[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function loadResumes() {
      setResumes(await resumeService.list());
    }

    void loadResumes();
    window.addEventListener(resumeService.eventName, loadResumes);
    return () => window.removeEventListener(resumeService.eventName, loadResumes);
  }, []);

  const totalPages = useMemo(() => getTotalPages(resumes.length), [resumes.length]);
  const visibleResumes = useMemo(() => getVisibleResumes(resumes, page), [page, resumes]);

  useEffect(() => {
    setPage(current => Math.min(current, totalPages));
  }, [totalPages]);

  async function downloadResume(resume: ResumeRecord) {
    try {
      const record = await resumeService.getRecord(resume.id);
      await downloadPdf(record.content, record.renderOptions, record.templateId, `${resume.name}.pdf`);
    } catch {
      downloadTextFile(
        resume.name.replace('.tex', '.txt'),
        `${resume.name}\n\nTemplate: ${resume.template}\nUpdated: ${resume.updated}`,
      );
    }
  }

  return (
    <WorkspaceShell title="Resumes">
      <div className="grid gap-6">
        <section className="grid gap-3 rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/85 p-5 shadow-tactile md:p-6">
          <div className="flex flex-wrap gap-2">
            <WorkspaceBadge variant="accent">RESUME LIBRARY</WorkspaceBadge>
            <WorkspaceBadge variant="info">{resumes.length} RESUMES</WorkspaceBadge>
          </div>
          <div className="font-headline text-4xl font-extrabold leading-tight text-on-surface md:text-5xl">All your resumes</div>
          <div className="max-w-4xl text-sm leading-7 text-[color:var(--txt2)]">
            Paginated resume versions with rename, download, and delete actions. The grid stays at 3 cards per row,
            with up to 6 visible tiles per page.
          </div>
        </section>

        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="Resume library">
          {page === 1 ? (
            <button
              className="grid min-h-[22rem] content-start gap-4 rounded-[1.75rem] border-[1.5px] border-dashed border-charcoal/45 bg-white/70 p-5 text-left shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:border-charcoal/75 hover:shadow-tactile md:p-6"
              type="button"
              onClick={openResume}
            >
              <div className="grid size-14 place-items-center rounded-2xl border border-outline-variant bg-surface text-4xl text-primary">+</div>
              <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">CREATE NEW RESUME</div>
              <div className="font-headline text-2xl font-extrabold leading-tight text-on-surface">Upload or start blank</div>
              <div className="text-sm leading-7 text-[color:var(--txt2)]">
                Open the modal, import an existing resume, or create a fresh version from scratch.
              </div>
            </button>
          ) : null}

          {visibleResumes.map(resume => (
            <ResumeLibraryCard
              key={resume.id}
              resume={resume}
              onRename={target => openResumeRename({ id: target.id, name: target.name })}
              onDownload={downloadResume}
              onDelete={target => openResumeDelete({ id: target.id, name: target.name })}
              onOpen={() => {
                resumeService.setActiveId(resume.id);
                navigate(`${routes.editor}?resumeId=${resume.id}`);
              }}
            />
          ))}
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3" aria-label="Resume pagination">
          <div className="font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--txt2)]">
            Page {page} of {totalPages}
          </div>
          <div className="flex flex-wrap gap-3">
            <ResumeAction size="sm" variant="secondary" onClick={() => setPage(current => Math.max(1, current - 1))} disabled={page === 1}>
              Previous
            </ResumeAction>
            <ResumeAction size="sm" variant="secondary" onClick={() => setPage(current => Math.min(totalPages, current + 1))} disabled={page === totalPages}>
              Next
            </ResumeAction>
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}
