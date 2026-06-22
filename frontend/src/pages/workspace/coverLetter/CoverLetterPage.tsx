import { useEffect, useState, useMemo } from 'react';
import { WorkspaceShell } from 'components/workspace/WorkspaceShell';
import { coverLetterService } from 'services/coverLetter/coverLetterService';
import { resumeService } from 'services/resumeService';
import { jdService } from 'services/jdService';
import { userProfileService } from 'services/profile/userProfileService';
import { buildResumePlainText } from 'types/resumeDocument';
import { buildProfilePlainText } from 'types/userProfile';
import { downloadTextFile } from 'lib/formatters';
import type { ResumeRecord } from 'types/resume';
import type { JdRecord } from 'types/jd';
import type { CoverLetter } from 'types/coverLetter';
import { cn } from 'lib/cn';

function CoverLetterButton({
  children,
  className,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'danger' | 'tab' | 'tab-active';
  disabled?: boolean;
}) {
  const baseClass =
    'inline-flex items-center justify-center gap-2 rounded-full border-2 border-charcoal text-center font-headline font-bold tracking-[0.01em] transition duration-150 ease-out shadow-tactile-sm hover:-translate-x-px hover:-translate-y-px active:translate-x-px active:translate-y-px active:shadow-none disabled:opacity-50 disabled:pointer-events-none';

  let variantClass = '';
  if (variant === 'primary') {
    variantClass = 'bg-white/95 text-on-surface hover:bg-surface-container-low hover:text-primary hover:shadow-tactile px-5 py-2.5 text-xs';
  } else if (variant === 'secondary') {
    variantClass = 'bg-white/85 text-[color:var(--txt1)] hover:bg-white hover:text-on-surface hover:shadow-tactile px-4 py-2 text-xs';
  } else if (variant === 'danger') {
    variantClass = 'border-error bg-error-container text-error px-4 py-2 text-xs';
  } else if (variant === 'tab') {
    variantClass = 'border-transparent bg-transparent shadow-none hover:text-primary hover:bg-white/30 px-5 py-2 text-sm';
  } else if (variant === 'tab-active') {
    variantClass = 'bg-white text-on-surface shadow-tactile-sm px-5 py-2 text-sm';
  }

  return (
    <button
      className={cn(baseClass, variantClass, className)}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export function CoverLetterPage() {
  const [tab, setTab] = useState<'generate' | 'library'>('generate');
  const [resumes, setResumes] = useState<ResumeRecord[]>([]);
  const [jds, setJds] = useState<JdRecord[]>([]);
  const [savedLetters, setSavedLetters] = useState<CoverLetter[]>([]);

  // Form State - default to profile first
  const [selectedResumeId, setSelectedResumeId] = useState('profile');
  const [selectedJdId, setSelectedJdId] = useState('manual');
  const [manualJdText, setManualJdText] = useState('');
  const [tone, setTone] = useState('professional');

  // Active Cover Letter State (for editing / saving)
  const [activeLetter, setActiveLetter] = useState<Partial<CoverLetter> | null>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Load selection list details
  const loadData = async () => {
    try {
      const [resList, jdList, clList] = await Promise.all([
        resumeService.list().catch(() => []),
        jdService.list().catch(() => []),
        coverLetterService.list().catch(() => []),
      ]);

      setResumes(resList);
      setJds(jdList);
      setSavedLetters(clList);

      // Pre-select defaults if we don't have selected values yet
      if (jdList.length > 0 && selectedJdId === 'manual') {
        setSelectedJdId(jdList[0].id);
      }
    } catch (err) {
      console.error('Failed to load Cover Letter data inputs:', err);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  // Selected JD record helper
  const activeJdRecord = useMemo(() => {
    return jds.find(j => j.id === selectedJdId) ?? null;
  }, [jds, selectedJdId]);

  // AI Generation trigger
  const handleGenerate = async () => {
    if (!selectedResumeId) {
      setErrorText('Please select a source first.');
      return;
    }

    const jdText = selectedJdId === 'manual' ? manualJdText : activeJdRecord?.parsedText;
    if (!jdText || !jdText.trim()) {
      setErrorText('Please provide a job description.');
      return;
    }

    setLoading(true);
    setErrorText('');
    setSuccessMessage('');
    setActiveLetter(null);

    try {
      let sourceText = '';
      let profileData = null;

      // 1. Get Source Data
      if (selectedResumeId === 'profile') {
        const profile = await userProfileService.get();
        sourceText = buildProfilePlainText(profile);
        profileData = profile;
        if (!sourceText.trim()) {
          throw new Error('Your Master User Profile is currently empty. Please add details in the Profile page first.');
        }
      } else {
        const resumeDoc = await resumeService.getRecord(selectedResumeId);
        sourceText = buildResumePlainText(resumeDoc.content);
        if (!sourceText.trim()) {
          throw new Error('The selected resume appears to contain empty text.');
        }
      }

      const parsedJd = selectedJdId !== 'manual' ? activeJdRecord?.parsedData || null : null;

      // 2. Call Service to Generate
      const generatedContent = await coverLetterService.generate(
        sourceText,
        jdText,
        tone,
        profileData,
        parsedJd
      );

      // 3. Populate editing state
      const targetCompany = selectedJdId === 'manual' ? '' : activeJdRecord?.company || '';
      const targetRole = selectedJdId === 'manual' ? '' : activeJdRecord?.title || '';

      setActiveLetter({
        title: `Cover Letter - ${targetCompany || 'Application'}`,
        company: targetCompany,
        job_role: targetRole,
        content: generatedContent,
      });

      setSuccessMessage('Cover letter generated successfully! You can now edit and save it.');
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || 'Failed to generate cover letter. Please verify Groq keys.');
    } finally {
      setLoading(false);
    }
  };


  // Save to Database / LocalStorage Library
  const handleSave = async () => {
    if (!activeLetter || !activeLetter.content) return;
    try {
      const saved = await coverLetterService.save(activeLetter);
      setActiveLetter(saved);
      setSuccessMessage('Cover letter saved to library successfully!');
      void loadData(); // Reload list
    } catch (err) {
      setErrorText('Failed to save cover letter.');
    }
  };

  // Copy to Clipboard
  const handleCopy = () => {
    if (!activeLetter?.content) return;
    void navigator.clipboard.writeText(activeLetter.content);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  // Download TXT File
  const handleDownload = () => {
    if (!activeLetter?.content) return;
    const filename = `${activeLetter.title || 'cover_letter'}.txt`;
    downloadTextFile(filename, activeLetter.content);
  };

  // Delete saved cover letter
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this cover letter?')) {
      try {
        await coverLetterService.delete(id);
        if (activeLetter?.id === id) {
          setActiveLetter(null);
        }
        void loadData();
      } catch (err) {
        alert('Failed to delete cover letter.');
      }
    }
  };

  // Edit/Load cover letter from library
  const handleLoadFromLibrary = (cl: CoverLetter) => {
    setActiveLetter(cl);
    setTab('generate'); // Switch back to editing view
    setSuccessMessage(`Loaded "${cl.title}" from library.`);
  };

  return (
    <WorkspaceShell title="Cover Letters">
      <div className="grid gap-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">AI CO-PILOT</div>
            <h1 className="font-headline text-3xl font-extrabold text-on-surface">Tailored Cover Letter Generator</h1>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-1 self-start rounded-full border border-charcoal/10 bg-surface-container-low p-1">
            <CoverLetterButton
              variant={tab === 'generate' ? 'tab-active' : 'tab'}
              onClick={() => {
                setTab('generate');
                setErrorText('');
                setSuccessMessage('');
              }}
            >
              📝 Generator
            </CoverLetterButton>
            <CoverLetterButton
              variant={tab === 'library' ? 'tab-active' : 'tab'}
              onClick={() => {
                setTab('library');
                setErrorText('');
                setSuccessMessage('');
              }}
            >
              📁 Saved Library
            </CoverLetterButton>
          </div>
        </div>

        {/* Banners */}
        {errorText && (
          <div className="rounded-2xl border border-error bg-error-container/70 p-4 text-xs font-bold text-error">
            ⚠️ {errorText}
          </div>
        )}
        {successMessage && (
          <div className="rounded-2xl border border-tertiary/40 bg-tertiary-fixed p-4 text-xs font-bold text-tertiary">
            ✓ {successMessage}
          </div>
        )}

        {/* Generate / Editor Tab */}
        {tab === 'generate' ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
            {/* Form Side */}
            <section className="h-fit grid gap-5 rounded-[1.75rem] border-[1.5px] border-charcoal bg-white/90 p-5 shadow-tactile md:p-6">
              <div className="font-headline text-lg font-extrabold text-on-surface border-b border-charcoal/10 pb-2">
                Configure Inputs
              </div>

              {/* Resume Selector */}
              <div className="grid gap-1.5">
                <label className="font-headline text-[10px] font-bold uppercase tracking-wider text-[color:var(--txt2)]">
                  1. Select Source Data
                </label>
                <select
                  className="w-full rounded-xl border-[1.5px] border-charcoal bg-white px-3 py-2.5 font-headline text-xs font-bold shadow-tactile-sm focus:border-primary"
                  value={selectedResumeId}
                  onChange={e => setSelectedResumeId(e.target.value)}
                >
                  <option value="profile">Master User Profile</option>
                  {resumes.map(r => (
                    <option key={r.id} value={r.id}>
                      Resume: {r.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* JD Selector */}
              <div className="grid gap-1.5">
                <label className="font-headline text-[10px] font-bold uppercase tracking-wider text-[color:var(--txt2)]">
                  2. Select Target JD
                </label>
                <select
                  className="w-full rounded-xl border-[1.5px] border-charcoal bg-white px-3 py-2.5 font-headline text-xs font-bold shadow-tactile-sm focus:border-primary"
                  value={selectedJdId}
                  onChange={e => setSelectedJdId(e.target.value)}
                >
                  {jds.map(j => (
                    <option key={j.id} value={j.id}>
                      {j.title} ({j.company})
                    </option>
                  ))}
                  <option value="manual">Manual Input / Copy Paste</option>
                </select>
              </div>

              {/* Manual Input textarea */}
              {selectedJdId === 'manual' && (
                <div className="grid gap-1.5">
                  <label className="font-headline text-[10px] font-bold uppercase tracking-wider text-[color:var(--txt2)]">
                    Paste Job Description Text
                  </label>
                  <textarea
                    rows={6}
                    className="w-full rounded-xl border-[1.5px] border-charcoal bg-white p-3 text-xs text-on-surface shadow-tactile-sm placeholder-charcoal/30 focus:border-primary font-sans"
                    placeholder="Paste job details, key skills, responsibilities..."
                    value={manualJdText}
                    onChange={e => setManualJdText(e.target.value)}
                  />
                </div>
              )}

              {/* Tone Selection */}
              <div className="grid gap-1.5">
                <label className="font-headline text-[10px] font-bold uppercase tracking-wider text-[color:var(--txt2)]">
                  3. Select Letter Tone
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['professional', 'confident', 'creative', 'enthusiastic'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTone(t)}
                      className={cn(
                        'rounded-xl border-[1.5px] border-charcoal py-2 text-center font-headline text-[11px] font-bold uppercase tracking-wider transition',
                        tone === t
                          ? 'bg-primary text-white shadow-tactile-sm'
                          : 'bg-white text-on-surface hover:bg-surface-container-low'
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Trigger */}
              <CoverLetterButton
                variant="primary"
                onClick={handleGenerate}
                disabled={loading || resumes.length === 0}
                className="mt-2 w-full py-3 text-sm justify-center"
              >
                {loading ? 'Drafting Letter...' : '⚡ Generate Cover Letter'}
              </CoverLetterButton>
            </section>

            {/* Generated Cover Letter Editor Side */}
            <section className="min-h-[450px] grid content-start gap-4 rounded-[1.75rem] border-[1.5px] border-charcoal bg-white p-5 shadow-tactile md:p-6">
              {activeLetter ? (
                <div className="grid gap-4 w-full">
                  {/* Editor Top Fields */}
                  <div className="grid grid-cols-1 gap-4 border-b border-charcoal/10 pb-4 md:grid-cols-3">
                    <div>
                      <label className="mb-1 block font-headline text-[10px] font-bold uppercase tracking-wider text-[color:var(--txt2)]">
                        Letter Title
                      </label>
                      <input
                        value={activeLetter.title || ''}
                        onChange={e => setActiveLetter({ ...activeLetter, title: e.target.value })}
                        className="w-full rounded-xl border-[1.5px] border-charcoal bg-white px-3 py-2 text-xs text-on-surface focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block font-headline text-[10px] font-bold uppercase tracking-wider text-[color:var(--txt2)]">
                        Company Name
                      </label>
                      <input
                        value={activeLetter.company || ''}
                        onChange={e => setActiveLetter({ ...activeLetter, company: e.target.value })}
                        className="w-full rounded-xl border-[1.5px] border-charcoal bg-white px-3 py-2 text-xs text-on-surface focus:border-primary"
                        placeholder="e.g. Google"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block font-headline text-[10px] font-bold uppercase tracking-wider text-[color:var(--txt2)]">
                        Target Role
                      </label>
                      <input
                        value={activeLetter.job_role || ''}
                        onChange={e => setActiveLetter({ ...activeLetter, job_role: e.target.value })}
                        className="w-full rounded-xl border-[1.5px] border-charcoal bg-white px-3 py-2 text-xs text-on-surface focus:border-primary"
                        placeholder="e.g. AI Engineer"
                      />
                    </div>
                  </div>

                  {/* Actions Header bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-container-low/40 rounded-xl border border-charcoal/10 p-2.5">
                    <span className="text-[11px] font-bold text-[color:var(--txt1)]">
                      Review &amp; Edit your letter below:
                    </span>
                    <div className="flex gap-2">
                      <CoverLetterButton variant="secondary" onClick={handleCopy} className="px-3.5 py-1.5">
                        {copyFeedback ? '✓ Copied!' : '📋 Copy Text'}
                      </CoverLetterButton>
                      <CoverLetterButton variant="secondary" onClick={handleDownload} className="px-3.5 py-1.5">
                        💾 Download
                      </CoverLetterButton>
                      <CoverLetterButton variant="primary" onClick={handleSave} className="px-4 py-1.5">
                        📁 Save to Library
                      </CoverLetterButton>
                    </div>
                  </div>

                  {/* Editing Textarea */}
                  <textarea
                    rows={20}
                    className="w-full rounded-2xl border-[1.5px] border-charcoal bg-surface p-4 text-sm text-on-surface focus:border-primary font-sans leading-6 whitespace-pre-wrap"
                    value={activeLetter.content || ''}
                    onChange={e => setActiveLetter({ ...activeLetter, content: e.target.value })}
                  />
                </div>
              ) : (
                <div className="py-24 text-center grid place-items-center gap-3">
                  <div className="text-5xl text-charcoal/30">✍</div>
                  <div className="font-headline text-lg font-extrabold text-on-surface">No Cover Letter Active</div>
                  <p className="max-w-md text-xs text-[color:var(--txt2)] leading-6">
                    Select a resume, target job description (JD), and tone, then click **Generate** to draft a tailored letter. You can also click a saved letter in the library tab to edit.
                  </p>
                </div>
              )}
            </section>
          </div>
        ) : (
          /* Saved Library Tab */
          <section className="grid gap-6">
            {savedLetters.length === 0 ? (
              <div className="rounded-[1.75rem] border-[1.5px] border-dashed border-charcoal/35 bg-white/70 py-16 text-center shadow-tactile-sm">
                <div className="grid max-w-md mx-auto gap-3">
                  <div className="text-4xl text-primary">📁</div>
                  <div className="font-headline text-lg font-extrabold text-on-surface">No Cover Letters Saved Yet</div>
                  <p className="text-xs text-[color:var(--txt2)] leading-6">
                    Once you generate cover letters, save them to build your library here.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {savedLetters.map(cl => (
                  <article
                    key={cl.id}
                    onClick={() => handleLoadFromLibrary(cl)}
                    className="grid cursor-pointer gap-4 rounded-[1.75rem] border-[1.5px] border-charcoal bg-white/95 p-5 shadow-tactile transition hover:-translate-x-px hover:-translate-y-px"
                  >
                    <div className="flex items-start justify-between gap-3 border-b border-charcoal/10 pb-3">
                      <div>
                        <h3 className="font-headline text-lg font-extrabold text-on-surface leading-tight">
                          {cl.title}
                        </h3>
                        <p className="mt-1 text-xs text-[color:var(--txt2)]">
                          {cl.company || 'Direct'} · {cl.job_role || 'General'}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-primary whitespace-nowrap bg-primary-fixed border border-primary/20 px-2 py-0.5 rounded-full">
                        SAVED
                      </span>
                    </div>

                    {/* snippet */}
                    <p className="text-xs text-[color:var(--txt1)] leading-5 h-20 overflow-hidden line-clamp-4 mask-fade">
                      {cl.content}
                    </p>

                    <div className="mt-2 flex gap-2 pt-3 border-t border-charcoal/10">
                      <CoverLetterButton variant="secondary" onClick={() => handleLoadFromLibrary(cl)} className="px-3.5 py-1.5 flex-1">
                        Edit / Copy
                      </CoverLetterButton>
                      <CoverLetterButton variant="danger" onClick={e => handleDelete(cl.id, e)} className="px-3 py-1.5">
                        🗑 Delete
                      </CoverLetterButton>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </WorkspaceShell>
  );
}
