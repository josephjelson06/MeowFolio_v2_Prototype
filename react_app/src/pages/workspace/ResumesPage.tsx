import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [resumes, setResumes] = useState(() => resumeService.list());
  const [page, setPage] = useState(1);

  const totalPages = useMemo(() => getTotalPages(resumes.length), [resumes.length]);
  const visibleResumes = useMemo(() => getVisibleResumes(resumes, page), [page, resumes]);

  function renameResume(resume: ResumeRecord) {
    const nextName = window.prompt('Rename resume', resume.name);
    if (!nextName || !nextName.trim()) return;
    setResumes(resumeService.rename(resume.id, nextName.trim()));
  }

  function deleteResume(resume: ResumeRecord) {
    const confirmed = window.confirm(`Delete ${resume.name}?`);
    if (!confirmed) return;
    const next = resumeService.remove(resume.id);
    setResumes(next);
    const nextTotal = getTotalPages(next.length);
    setPage(current => Math.min(current, nextTotal));
  }

  function downloadResume(resume: ResumeRecord) {
    downloadTextFile(resume.name.replace('.tex', '.txt'), `${resume.name}\n\nTemplate: ${resume.template}\nUpdated: ${resume.updated}`);
  }

  return (
    <div className="res-page-body res-page">
      <section className="res-page-header">
        <div className="res-header-badges">
          <span className="badge-accent">RESUME LIBRARY</span>
          <span className="badge-info">{resumes.length} RESUMES</span>
        </div>
        <div className="res-page-title">All your resumes</div>
        <div className="res-page-desc">Paginated resume versions with rename, download, and delete actions. The grid stays at 3 cards per row, with up to 6 visible tiles per page.</div>
      </section>

      <section className="res-cards-grid" aria-label="Resume library">
        {page === 1 ? (
          <button className="res-new-card" type="button" onClick={openResume}>
            <div className="res-new-plus">+</div>
            <div className="section-label">CREATE NEW RESUME</div>
            <div className="res-new-title">Upload or start blank</div>
            <div className="res-new-desc">Open the modal, import an existing resume, or create a fresh version from scratch.</div>
          </button>
        ) : null}

        {visibleResumes.map(resume => (
          <ResumeCard
            key={resume.id}
            resume={resume}
            onRename={renameResume}
            onDownload={downloadResume}
            onDelete={deleteResume}
            onOpen={() => navigate(routes.editor)}
          />
        ))}
      </section>

      <div className="list-pagination" aria-label="Resume pagination">
        <div className="page-status">Page {page} of {totalPages}</div>
        <div className="page-controls">
          <button className="r-action" type="button" onClick={() => setPage(current => Math.max(1, current - 1))} disabled={page === 1}>
            Previous
          </button>
          <button className="r-action" type="button" onClick={() => setPage(current => Math.min(totalPages, current + 1))} disabled={page === totalPages}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
