import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useResumeModal } from 'hooks/useResumeModal';
import { cn } from 'lib/cn';
import { downloadTextFile } from 'lib/formatters';
import { routes } from 'lib/routes';
import { resumeService } from 'services/resumeService';
import { useSession } from 'state/session/sessionContext';
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
type ResumeBadgeVariant = 'accent' | 'info' | 'outline';

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

function ResumeBadge({
  children,
  className,
  variant = 'outline',
}: {
  children: ReactNode;
  className?: string;
  variant?: ResumeBadgeVariant;
}) {
  const toneClass =
    variant === 'accent'
      ? 'border-primary/40 bg-primary-fixed text-primary'
      : variant === 'info'
        ? 'border-secondary/35 bg-secondary-fixed text-secondary'
        : 'border-charcoal/65 bg-white/80 text-[color:var(--txt2)]';
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full border-[1.5px] px-3 py-1 font-headline text-[9px] font-bold uppercase tracking-[0.12em]',
        toneClass,
        className,
      )}
    >
      {children}
    </span>
  );
}

function resumeLinkClass(active: boolean) {
  return cn(
    'inline-flex min-h-10 items-center justify-center rounded-full px-4 text-sm font-bold text-[color:var(--txt1)] transition hover:bg-white/70 hover:text-primary',
    active && 'border-[1.5px] border-charcoal/75 bg-white/85 text-on-surface shadow-tactile-sm',
  );
}

function ResumePageShell({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  const location = useLocation();
  const { initials } = useSession();
  const resumesActive = location.pathname === routes.resumes || location.pathname === routes.editor;
  const mobileTabClass = (active: boolean) =>
    cn(
      'flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-medium text-[color:var(--txt2)] transition',
      active && 'text-primary',
    );

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-40 hidden min-h-[68px] grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-charcoal/10 bg-background/85 px-4 shadow-[0_8px_24px_rgba(28,28,24,0.05)] backdrop-blur-xl md:grid md:px-8">
        <NavLink className="inline-flex w-max items-center font-headline text-2xl font-extrabold tracking-[-0.03em] text-on-surface" to={routes.dashboard}>
          meowfolio
        </NavLink>
        <div className="flex items-center justify-self-center gap-2">
          <NavLink className={({ isActive }) => resumeLinkClass(isActive)} to={routes.dashboard}>
            Dashboard
          </NavLink>
          <NavLink className={resumeLinkClass(resumesActive)} to={routes.resumes}>
            Resumes
          </NavLink>
          <NavLink className={({ isActive }) => resumeLinkClass(isActive)} to={routes.jds}>
            JDs
          </NavLink>
        </div>
        <div className="justify-self-end">
          <NavLink className="grid size-9 place-items-center rounded-full border-[1.5px] border-charcoal/75 bg-white/85 font-headline text-xs font-bold text-secondary shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:shadow-tactile" to={routes.profile}>
            {initials}
          </NavLink>
        </div>
      </nav>

      <div className="sticky top-0 z-40 flex min-h-[56px] items-center gap-3 border-b border-charcoal/10 bg-background/92 px-4 backdrop-blur-xl md:hidden">
        <NavLink className="inline-flex items-center font-headline text-lg font-extrabold tracking-[-0.03em] text-on-surface" to={routes.dashboard}>
          meowfolio
        </NavLink>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-on-surface">{title}</span>
        <NavLink className="grid size-9 place-items-center rounded-full border-[1.5px] border-charcoal/75 bg-white/85 font-headline text-xs font-bold text-secondary shadow-tactile-sm" to={routes.profile}>
          {initials}
        </NavLink>
      </div>

      <main className="mx-auto w-full max-w-[1220px] px-4 pb-28 pt-7 sm:px-6 lg:px-8">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex min-h-[calc(60px+env(safe-area-inset-bottom))] border-t border-charcoal/10 bg-background/95 px-3 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_18px_rgba(28,28,24,0.05)] backdrop-blur-xl md:hidden" aria-label="Mobile navigation">
        <NavLink className={({ isActive }) => mobileTabClass(isActive)} to={routes.dashboard}>
          <div className="text-base">&#8862;</div>
          <span>Dashboard</span>
        </NavLink>
        <NavLink className={mobileTabClass(resumesActive)} to={routes.resumes}>
          <div className="text-base">&#9776;</div>
          <span>Resumes</span>
        </NavLink>
        <NavLink className={({ isActive }) => mobileTabClass(isActive)} to={routes.jds}>
          <div className="text-base">&#8857;</div>
          <span>JDs</span>
        </NavLink>
        <NavLink className={({ isActive }) => mobileTabClass(isActive)} to={routes.profile}>
          <div className="text-base">&#9675;</div>
          <span>Profile</span>
        </NavLink>
      </nav>
    </div>
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
          {resume.recent ? <ResumeBadge>MOST RECENT</ResumeBadge> : null}
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
  const { openResume } = useResumeModal();
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

  async function renameResume(resume: ResumeRecord) {
    const nextName = window.prompt('Rename resume', resume.name);
    if (!nextName || !nextName.trim()) return;
    setResumes(await resumeService.rename(resume.id, nextName.trim()));
  }

  async function deleteResume(resume: ResumeRecord) {
    const confirmed = window.confirm(`Delete ${resume.name}?`);
    if (!confirmed) return;
    const next = await resumeService.remove(resume.id);
    setResumes(next);
    const nextTotal = getTotalPages(next.length);
    setPage(current => Math.min(current, nextTotal));
  }

  async function downloadResume(resume: ResumeRecord) {
    try {
      const exported = await resumeService.exportTex(resume.id);
      downloadTextFile(exported.filename, exported.tex);
    } catch {
      downloadTextFile(
        resume.name.replace('.tex', '.txt'),
        `${resume.name}\n\nTemplate: ${resume.template}\nUpdated: ${resume.updated}`,
      );
    }
  }

  return (
    <ResumePageShell title="Resumes">
      <div className="grid gap-6">
        <section className="grid gap-3 rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/85 p-5 shadow-tactile md:p-6">
          <div className="flex flex-wrap gap-2">
            <ResumeBadge variant="accent">RESUME LIBRARY</ResumeBadge>
            <ResumeBadge variant="info">{resumes.length} RESUMES</ResumeBadge>
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
              onRename={renameResume}
              onDownload={downloadResume}
              onDelete={deleteResume}
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
    </ResumePageShell>
  );
}
