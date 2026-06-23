import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from 'lib/cn';
import { downloadTextFile } from 'lib/formatters';
import { WorkspaceBadge } from 'components/workspace/WorkspaceBadge';
import { WorkspaceShell } from 'components/workspace/WorkspaceShell';
import { jdService } from 'services/jdService';
import { useUiContext } from 'state/ui/uiContext';
import type { JdRecord } from 'types/jd';

function getVisibleJds(jds: JdRecord[], page: number) {
  if (page === 1) return jds.slice(0, 5);
  const start = 5 + (page - 2) * 6;
  return jds.slice(start, start + 6);
}

function getTotalPages(count: number) {
  if (count <= 5) return 1;
  return 1 + Math.ceil((count - 5) / 6);
}

type JdActionVariant = 'primary' | 'secondary' | 'danger';
type JdActionSize = 'sm' | 'md';

function JdAction({
  children,
  className,
  disabled,
  onClick,
  size = 'md',
  variant = 'primary',
}: {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  size?: JdActionSize;
  variant?: JdActionVariant;
}) {
  const sizeClass = size === 'md' ? 'min-h-12 px-6 py-3 text-sm' : 'min-h-8 px-3 py-1.5 text-[10px]';
  const variantClass =
    variant === 'primary'
      ? 'bg-white/95 text-on-surface hover:bg-surface-container-low hover:text-primary hover:shadow-tactile'
      : variant === 'secondary'
      ? 'bg-white/85 text-[color:var(--txt1)] hover:bg-white hover:text-on-surface hover:shadow-tactile'
      : 'border-error/30 bg-error-container/70 text-error hover:bg-error-container hover:text-error';
      
  const actionClass = cn(
    'inline-flex items-center justify-center gap-2 rounded-full border-2 border-charcoal text-center font-headline font-bold tracking-[0.01em] transition duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-40',
    'shadow-tactile-sm hover:-translate-x-px hover:-translate-y-px active:translate-x-px active:translate-y-px active:shadow-none',
    sizeClass,
    variantClass,
    className,
  );

  return (
    <button className={actionClass} type="button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

function JdLibraryCard({
  onDelete,
  onDownload,
  onOpen,
  onRename,
  jd,
}: {
  onDelete: (jd: JdRecord) => void;
  onDownload: (jd: JdRecord) => void;
  onOpen: (jd: JdRecord) => void;
  onRename: (jd: JdRecord) => void;
  jd: JdRecord;
}) {
  return (
    <article
      className="grid cursor-pointer gap-4 rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/90 p-4 shadow-tactile transition hover:-translate-x-px hover:-translate-y-px md:p-5"
      onClick={() => onOpen(jd)}
    >
      <div className="grid gap-3 rounded-[1.25rem] border border-outline-variant bg-surface px-4 py-4" aria-hidden="true">
        <div className="font-headline text-sm font-bold text-on-surface truncate">{jd.company}</div>
        <div className="text-[11px] text-[color:var(--txt2)]">{jd.type}</div>
        <div className="h-px bg-outline-variant"></div>
        <div className="h-1.5 w-2/5 rounded-full bg-outline-variant/70"></div>
        <div className="h-1.5 w-full rounded-full bg-tertiary/20"></div>
        <div className="h-1.5 w-4/5 rounded-full bg-tertiary/20"></div>
      </div>

      <div className="grid gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="font-headline text-lg font-extrabold text-on-surface truncate">{jd.title}</div>
            <div className="mt-1 text-sm text-[color:var(--txt2)]">
              {jd.updatedAt ? `Saved ${new Date(jd.updatedAt).toLocaleDateString()}` : 'Saved recently'}
            </div>
          </div>
          <WorkspaceBadge variant="accent" className="shrink-0">{jd.badge}</WorkspaceBadge>
        </div>

        <div className="flex flex-wrap gap-2">
          <JdAction size="sm" variant="primary" onClick={(e) => { e.stopPropagation(); onOpen(jd); }}>
            Workspace
          </JdAction>
          <JdAction size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); onRename(jd); }}>
            Rename
          </JdAction>
          <JdAction size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); onDownload(jd); }}>
            Down
          </JdAction>
          <JdAction size="sm" variant="danger" onClick={(e) => { e.stopPropagation(); onDelete(jd); }}>
            Delete
          </JdAction>
        </div>
      </div>
    </article>
  );
}

export function JdsPage() {
  const navigate = useNavigate();
  const { openJd, openJdDelete, openJdRename } = useUiContext();
  const [jds, setJds] = useState<JdRecord[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function loadJds() {
      setJds(await jdService.list());
    }

    void loadJds();
    window.addEventListener(jdService.eventName, loadJds);
    return () => window.removeEventListener(jdService.eventName, loadJds);
  }, []);

  const totalPages = useMemo(() => getTotalPages(jds.length), [jds.length]);
  const visibleJds = useMemo(() => getVisibleJds(jds, page), [page, jds]);

  useEffect(() => {
    setPage(current => Math.min(current, totalPages));
  }, [totalPages]);

  async function downloadJdFile(jd: JdRecord) {
    downloadTextFile(
      `${jd.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_jd.txt`,
      jd.parsedText
    );
  }

  return (
    <WorkspaceShell title="JD Intelligence">
      <div className="grid gap-6">
        <section className="grid gap-3 rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/85 p-5 shadow-tactile md:p-6">
          <div className="flex flex-wrap gap-2">
            <WorkspaceBadge variant="accent">JOB DESCRIPTIONS</WorkspaceBadge>
            <WorkspaceBadge variant="info">{jds.length} SAVED</WorkspaceBadge>
          </div>
          <div className="font-headline text-4xl font-extrabold leading-tight text-on-surface md:text-5xl">Saved Job Descriptions</div>
          <div className="max-w-4xl text-sm leading-7 text-[color:var(--txt2)]">
            Manage your saved job descriptions. Click on any JD to enter its workspace, where you can generate tailored resumes, cover letters, and track your application status.
          </div>
        </section>

        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="JD library">
          {page === 1 ? (
            <button
              className="grid min-h-[22rem] content-start gap-4 rounded-[1.75rem] border-[1.5px] border-dashed border-charcoal/45 bg-white/70 p-5 text-left shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:border-charcoal/75 hover:shadow-tactile md:p-6"
              type="button"
              onClick={openJd}
            >
              <div className="grid size-14 place-items-center rounded-2xl border border-outline-variant bg-surface text-4xl text-primary">+</div>
              <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">ADD NEW JD</div>
              <div className="font-headline text-2xl font-extrabold leading-tight text-on-surface">Paste or upload a JD</div>
              <div className="text-sm leading-7 text-[color:var(--txt2)]">
                Add a new job description to extract intelligence and generate tailored application materials.
              </div>
            </button>
          ) : null}

          {visibleJds.map(jd => (
            <JdLibraryCard
              key={jd.id}
              jd={jd}
              onRename={target => openJdRename({ id: target.id, name: target.title })}
              onDownload={downloadJdFile}
              onDelete={target => openJdDelete({ id: target.id, name: target.title })}
              onOpen={() => {
                navigate(`/workspace/jds/${jd.id}`);
              }}
            />
          ))}
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3" aria-label="JD pagination">
          <div className="font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--txt2)]">
            Page {page} of {totalPages}
          </div>
          <div className="flex flex-wrap gap-3">
            <JdAction size="sm" variant="secondary" onClick={() => setPage(current => Math.max(1, current - 1))} disabled={page === 1}>
              Previous
            </JdAction>
            <JdAction size="sm" variant="secondary" onClick={() => setPage(current => Math.min(totalPages, current + 1))} disabled={page === totalPages}>
              Next
            </JdAction>
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}