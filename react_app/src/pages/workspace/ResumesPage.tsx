import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from 'components/ui/Badge';
import { ResumeCard } from 'components/workspace/ResumeCard';
import { downloadTextFile } from 'lib/formatters';
import { routes } from 'lib/routes';
import { resumeService } from 'services/resumeService';
import type { ResumeRecord } from 'types/resume';
import { useResumeModal } from 'hooks/useResumeModal';

function getVisibleResumes(resumes: ResumeRecord[], page: number) {
  if (page === 1) return resumes.slice(0, 5);
  const start = 5 + ((page - 2) * 6);
  return resumes.slice(start, start + 6);
}

function getTotalPages(count: number) {
  if (count <= 5) return 1;
  return 1 + Math.ceil((count - 5) / 6);
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
      downloadTextFile(resume.name.replace('.tex', '.txt'), `${resume.name}\n\nTemplate: ${resume.template}\nUpdated: ${resume.updated}`);
    }
  }

  return (
    <div className="grid gap-6">
      <section className="grid gap-3 rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/85 p-5 shadow-tactile md:p-6">
        <div className="flex flex-wrap gap-2">
          <Badge variant="accent">RESUME LIBRARY</Badge>
          <Badge variant="info">{resumes.length} RESUMES</Badge>
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
          <ResumeCard
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
        <div className="font-headline text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--txt2)]">Page {page} of {totalPages}</div>
        <div className="flex flex-wrap gap-3">
          <button className="inline-flex min-h-8 items-center justify-center rounded-full border-2 border-charcoal/75 bg-white/85 px-3 py-1.5 font-sans text-[10px] font-semibold text-[color:var(--txt1)] shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:bg-white disabled:pointer-events-none disabled:opacity-40" type="button" onClick={() => setPage(current => Math.max(1, current - 1))} disabled={page === 1}>
            Previous
          </button>
          <button className="inline-flex min-h-8 items-center justify-center rounded-full border-2 border-charcoal/75 bg-white/85 px-3 py-1.5 font-sans text-[10px] font-semibold text-[color:var(--txt1)] shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:bg-white disabled:pointer-events-none disabled:opacity-40" type="button" onClick={() => setPage(current => Math.min(totalPages, current + 1))} disabled={page === totalPages}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
