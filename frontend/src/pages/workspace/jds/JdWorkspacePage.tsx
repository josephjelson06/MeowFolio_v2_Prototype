import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WorkspaceShell } from 'components/workspace/WorkspaceShell';
import { WorkspaceBadge } from 'components/workspace/WorkspaceBadge';
import { jdService } from 'services/jdService';
import { resumeService } from 'services/resumeService';
import { generateResume } from 'services/resumes/resumeGeneratorService';
import type { JdRecord, ParsedJD } from 'types/jd';
import type { ResumeRecord } from 'types/resume';
import { routes } from 'app/router/routes';

export function JdWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [jd, setJd] = useState<JdRecord | null>(null);
  const [resumes, setResumes] = useState<ResumeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        setLoading(true);
        const [loadedJd, allResumes] = await Promise.all([
          jdService.getById(id),
          resumeService.list(),
        ]);
        setJd(loadedJd || null);
        setResumes(allResumes.filter(r => r.targetJdId === id));
      } catch (err) {
        console.error(err);
        setError('Failed to load JD workspace.');
      } finally {
        setLoading(false);
      }
    }
    void loadData();
    
    // Subscribe to changes in resume library (e.g., if user deletes a resume)
    function handleResumeChange() {
      void resumeService.list().then(allResumes => {
        setResumes(allResumes.filter(r => r.targetJdId === id));
      });
    }
    window.addEventListener(resumeService.eventName, handleResumeChange);
    return () => window.removeEventListener(resumeService.eventName, handleResumeChange);
  }, [id]);

  const handleGenerate = async () => {
    if (!jd || !jd.parsedData) {
      setError('JD is not fully parsed yet. Cannot generate resume.');
      return;
    }
    try {
      setGenerating(true);
      setError('');
      const result = await generateResume(jd.parsedData, {
        forceMode: 'fresh',
        targetJdId: jd.id,
      });
      // The resume library change event will trigger and update the resumes list
      navigate(`${routes.editor}?resumeId=${result.resumeId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to generate tailored resume.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <WorkspaceShell title="JD Workspace">
        <div className="flex items-center justify-center min-h-[40vh] text-[color:var(--txt2)]">Loading workspace...</div>
      </WorkspaceShell>
    );
  }

  if (!jd) {
    return (
      <WorkspaceShell title="JD Workspace">
        <div className="grid place-items-center rounded-[1.75rem] border border-dashed border-outline bg-surface px-6 py-12 text-center">
          <div className="text-3xl text-primary">&#8856;</div>
          <div className="mt-2 text-sm text-[color:var(--txt2)]">Job Description not found.</div>
          <button className="mt-4 text-sm font-bold text-primary underline" onClick={() => navigate(routes.jds)}>Go back to JDs</button>
        </div>
      </WorkspaceShell>
    );
  }

  const parsed = jd.parsedData;

  return (
    <WorkspaceShell title="JD Workspace">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => navigate(routes.jds)} className="text-sm font-bold text-[color:var(--txt1)] hover:text-on-surface transition">
          &larr; Back to all JDs
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: JD Details */}
        <div className="lg:col-span-2 grid gap-6 content-start">
          <div className="rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/90 p-6 shadow-tactile">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="font-headline text-3xl font-extrabold text-on-surface">{jd.title}</h1>
                <div className="text-lg text-[color:var(--txt2)] mt-1">{jd.company} &bull; {jd.type}</div>
              </div>
              <WorkspaceBadge variant="accent">{jd.badge}</WorkspaceBadge>
            </div>
            
            {parsed ? (
              <div className="mt-6 grid gap-6">
                <div>
                  <h3 className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Must-Have Skills</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {parsed.mustHaveSkills.map(s => (
                      <span key={s} className="rounded-full border border-primary/30 bg-primary-fixed px-3 py-1 text-xs font-semibold text-primary">{s}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-tertiary">Key Responsibilities</h3>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-[color:var(--txt1)]">
                    {parsed.keyResponsibilities.map(r => <li key={r}>{r}</li>)}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="mt-6 text-sm text-[color:var(--txt2)] bg-surface p-4 rounded-xl border border-dashed border-outline">
                This JD hasn't been parsed by AI yet.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Actions & Assets */}
        <div className="grid gap-6 content-start">
          <div className="rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-surface-container-low p-6 shadow-tactile">
            <h2 className="font-headline text-xl font-extrabold text-on-surface mb-2">Tailored Resume</h2>
            
            {resumes.length === 0 ? (
              <div className="grid gap-4">
                <p className="text-sm text-[color:var(--txt2)]">
                  You haven't generated a tailored resume for this JD yet. We will use your Master Profile to build a fresh, highly optimized resume.
                </p>
                {error && <div className="text-xs text-error">{error}</div>}
                <button
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-full border-2 border-charcoal bg-white/95 px-5 py-2 font-headline text-[11px] font-bold text-primary shadow-tactile transition hover:-translate-x-px hover:-translate-y-px hover:bg-primary hover:text-white disabled:pointer-events-none disabled:opacity-40"
                  onClick={handleGenerate}
                  disabled={generating || !parsed}
                >
                  {generating ? 'Generating...' : '★ Generate Tailored Resume'}
                </button>
              </div>
            ) : (
              <div className="grid gap-3 mt-4">
                {resumes.map(r => (
                  <div key={r.id} className="p-4 rounded-2xl border border-charcoal/20 bg-white shadow-tactile-sm transition hover:shadow-tactile hover:-translate-y-px">
                    <div className="font-bold text-sm text-on-surface truncate">{r.name}</div>
                    <div className="text-xs text-[color:var(--txt2)] mt-1">Updated {r.updated}</div>
                    <div className="mt-3 flex gap-2">
                      <button
                        className="flex-1 rounded-full border border-charcoal/70 py-1.5 text-xs font-bold transition hover:bg-surface-container-low"
                        onClick={() => {
                          resumeService.setActiveId(r.id);
                          navigate(`${routes.editor}?resumeId=${r.id}`);
                        }}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
                {error && <div className="text-xs text-error text-center">{error}</div>}
                <button
                  className="mt-2 text-xs font-bold text-primary hover:underline text-center"
                  onClick={handleGenerate}
                  disabled={generating || !parsed}
                >
                  {generating ? 'Generating...' : '+ Generate Another'}
                </button>
              </div>
            )}
          </div>

          {/* Quick links to Cover Letter / Email Drafter */}
          <div className="rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/90 p-6 shadow-tactile">
             <h2 className="font-headline text-lg font-extrabold text-on-surface mb-2">Other Assets</h2>
             <div className="grid gap-2 mt-4">
               <button 
                 onClick={() => navigate(routes.coverLetter)}
                 className="text-left p-3 rounded-xl border border-outline hover:border-charcoal/50 hover:bg-surface transition text-sm font-bold text-on-surface"
               >
                 📝 Draft Cover Letter &rarr;
               </button>
               <button 
                 onClick={() => navigate(routes.emailDrafter)}
                 className="text-left p-3 rounded-xl border border-outline hover:border-charcoal/50 hover:bg-surface transition text-sm font-bold text-on-surface"
               >
                 ✉️ Draft Cold Email &rarr;
               </button>
             </div>
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}
