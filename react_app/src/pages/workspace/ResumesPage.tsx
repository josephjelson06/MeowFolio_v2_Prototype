import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'components/ui/Button';
import { Card } from 'components/ui/Card';
import { Pagination } from 'components/ui/Pagination';
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
    <div className="ra-page-stack">
      <div className="ra-page-header">
        <div className="section-label">RESUME LIBRARY</div>
        <h1 className="ra-card-title">All resumes, one tighter grid.</h1>
        <p className="ra-subtitle">The React route keeps the current 3-column desktop structure, 6 visible tiles per page, and the create tile only on page 1.</p>
      </div>

      <section className="ra-resume-grid">
        {page === 1 ? (
          <Card className="ra-resume-card">
            <div className="ra-stack-lg">
              <div className="section-label">CREATE NEW</div>
              <h2 className="ra-card-title">Start from scratch or upload</h2>
              <p className="ra-card-copy">Open the shared resume modal and move directly into the editor flow.</p>
              <div className="ra-actions">
                <Button onClick={openResume}>+ Create Resume</Button>
              </div>
            </div>
          </Card>
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

      <Pagination
        page={page}
        totalPages={totalPages}
        onPrev={() => setPage(current => Math.max(1, current - 1))}
        onNext={() => setPage(current => Math.min(totalPages, current + 1))}
        label="Resume pagination"
      />
    </div>
  );
}
