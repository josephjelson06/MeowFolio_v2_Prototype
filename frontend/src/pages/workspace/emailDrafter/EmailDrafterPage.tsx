import { useEffect, useState, useMemo } from 'react';
import { WorkspaceShell } from 'components/workspace/WorkspaceShell';
import { emailService } from 'services/email/emailService';
import { resumeService } from 'services/resumeService';
import { jdService } from 'services/jdService';
import { buildResumePlainText } from 'types/resumeDocument';
import { downloadTextFile } from 'lib/formatters';
import type { ResumeRecord } from 'types/resume';
import type { JdRecord } from 'types/jd';
import type { EmailRecord } from 'types/email';
import { cn } from 'lib/cn';

function EmailButton({
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

export function EmailDrafterPage() {
  const [tab, setTab] = useState<'generate' | 'library'>('generate');
  const [resumes, setResumes] = useState<ResumeRecord[]>([]);
  const [jds, setJds] = useState<JdRecord[]>([]);
  const [savedEmails, setSavedEmails] = useState<EmailRecord[]>([]);

  // Selection Inputs
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [selectedJdId, setSelectedJdId] = useState('manual');
  const [manualJdText, setManualJdText] = useState('');
  const [emailType, setEmailType] = useState('outreach');
  const [tone, setTone] = useState('professional');

  // Active Draft state
  const [activeEmail, setActiveEmail] = useState<Partial<EmailRecord> | null>(null);

  // Status feedback
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [copySubjectFeedback, setCopySubjectFeedback] = useState(false);
  const [copyBodyFeedback, setCopyBodyFeedback] = useState(false);

  // Load selection lists
  const loadData = async () => {
    try {
      const [resList, jdList, clList] = await Promise.all([
        resumeService.list().catch(() => []),
        jdService.list().catch(() => []),
        emailService.list().catch(() => []),
      ]);

      setResumes(resList);
      setJds(jdList);
      setSavedEmails(clList);

      // Defaults
      if (resList.length > 0 && !selectedResumeId) {
        setSelectedResumeId(resList[0].id);
      }
      if (jdList.length > 0 && selectedJdId === 'manual') {
        setSelectedJdId(jdList[0].id);
      }
    } catch (err) {
      console.error('Failed to load email input metadata lists:', err);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const activeJdRecord = useMemo(() => {
    return jds.find(j => j.id === selectedJdId) ?? null;
  }, [jds, selectedJdId]);

  // AI generation
  const handleGenerate = async () => {
    if (!selectedResumeId) {
      setErrorText('Please select a resume first.');
      return;
    }

    const jdText = selectedJdId === 'manual' ? manualJdText : activeJdRecord?.parsedText;
    if (!jdText || !jdText.trim()) {
      setErrorText('Please provide job details to tailor the email.');
      return;
    }

    setLoading(true);
    setErrorText('');
    setSuccessMessage('');
    setActiveEmail(null);

    try {
      const resumeDoc = await resumeService.getRecord(selectedResumeId);
      const resumeText = buildResumePlainText(resumeDoc.content);

      if (!resumeText || !resumeText.trim()) {
        throw new Error('The selected resume appears to contain empty text.');
      }

      // Generate AI Email
      const result = await emailService.generate(resumeText, jdText, emailType, tone);

      const targetCompany = selectedJdId === 'manual' ? '' : activeJdRecord?.company || '';
      const targetRole = selectedJdId === 'manual' ? '' : activeJdRecord?.title || '';

      setActiveEmail({
        title: `Email to ${targetCompany || 'Recruiter'}`,
        subject: result.subject,
        content: result.body,
        company: targetCompany,
        job_role: targetRole,
      });

      setSuccessMessage('Email drafted successfully! You can now copy or save it to your library.');
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || 'Failed to generate email draft. Please verify Groq keys.');
    } finally {
      setLoading(false);
    }
  };

  // Save to DB / LocalStorage
  const handleSave = async () => {
    if (!activeEmail || !activeEmail.content) return;
    try {
      const saved = await emailService.save(activeEmail);
      setActiveEmail(saved);
      setSuccessMessage('Email saved to library successfully!');
      void loadData();
    } catch (err) {
      setErrorText('Failed to save email to library.');
    }
  };

  // Copy Subject
  const handleCopySubject = () => {
    if (!activeEmail?.subject) return;
    void navigator.clipboard.writeText(activeEmail.subject);
    setCopySubjectFeedback(true);
    setTimeout(() => setCopySubjectFeedback(false), 2000);
  };

  // Copy Body
  const handleCopyBody = () => {
    if (!activeEmail?.content) return;
    void navigator.clipboard.writeText(activeEmail.content);
    setCopyBodyFeedback(true);
    setTimeout(() => setCopyBodyFeedback(false), 2000);
  };

  // Download TXT
  const handleDownload = () => {
    if (!activeEmail?.content) return;
    const emailText = `Subject: ${activeEmail.subject || ''}\n\n${activeEmail.content}`;
    const filename = `${activeEmail.title || 'email_draft'}.txt`;
    downloadTextFile(filename, emailText);
  };

  // Delete saved email
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this email draft?')) {
      try {
        await emailService.delete(id);
        if (activeEmail?.id === id) {
          setActiveEmail(null);
        }
        void loadData();
      } catch (err) {
        alert('Failed to delete email draft.');
      }
    }
  };

  // Edit/Load email
  const handleLoadFromLibrary = (em: EmailRecord) => {
    setActiveEmail(em);
    setTab('generate');
    setSuccessMessage(`Loaded "${em.title}" from library.`);
  };

  return (
    <WorkspaceShell title="Email Drafter">
      <div className="grid gap-6">
        {/* Header Title */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">COMMUNICATION HUB</div>
            <h1 className="font-headline text-3xl font-extrabold text-on-surface">Tailored Email Drafter</h1>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 self-start rounded-full border border-charcoal/10 bg-surface-container-low p-1">
            <EmailButton
              variant={tab === 'generate' ? 'tab-active' : 'tab'}
              onClick={() => {
                setTab('generate');
                setErrorText('');
                setSuccessMessage('');
              }}
            >
              ✉ Generator
            </EmailButton>
            <EmailButton
              variant={tab === 'library' ? 'tab-active' : 'tab'}
              onClick={() => {
                setTab('library');
                setErrorText('');
                setSuccessMessage('');
              }}
            >
              📁 Saved Library
            </EmailButton>
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

        {/* Tab Generator View */}
        {tab === 'generate' ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
            {/* Configure inputs Panel */}
            <section className="h-fit grid gap-5 rounded-[1.75rem] border-[1.5px] border-charcoal bg-white/90 p-5 shadow-tactile md:p-6">
              <div className="font-headline text-lg font-extrabold text-on-surface border-b border-charcoal/10 pb-2">
                Configure Inputs
              </div>

              {/* Resume selection */}
              <div className="grid gap-1.5">
                <label className="font-headline text-[10px] font-bold uppercase tracking-wider text-[color:var(--txt2)]">
                  1. Select Source Resume
                </label>
                {resumes.length === 0 ? (
                  <div className="text-xs text-error font-bold">
                    No resumes found. Please go to the Resumes page to create one first.
                  </div>
                ) : (
                  <select
                    className="w-full rounded-xl border-[1.5px] border-charcoal bg-white px-3 py-2.5 font-headline text-xs font-bold shadow-tactile-sm focus:border-primary"
                    value={selectedResumeId}
                    onChange={e => setSelectedResumeId(e.target.value)}
                  >
                    {resumes.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* JD selection */}
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

              {/* Manual input */}
              {selectedJdId === 'manual' && (
                <div className="grid gap-1.5">
                  <label className="font-headline text-[10px] font-bold uppercase tracking-wider text-[color:var(--txt2)]">
                    Paste Job Description Text
                  </label>
                  <textarea
                    rows={5}
                    className="w-full rounded-xl border-[1.5px] border-charcoal bg-white p-3 text-xs text-on-surface shadow-tactile-sm placeholder-charcoal/30 focus:border-primary font-sans"
                    placeholder="Paste job details, skills, keywords..."
                    value={manualJdText}
                    onChange={e => setManualJdText(e.target.value)}
                  />
                </div>
              )}

              {/* Email Type */}
              <div className="grid gap-1.5">
                <label className="font-headline text-[10px] font-bold uppercase tracking-wider text-[color:var(--txt2)]">
                  3. Email Objective
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['outreach', 'referral', 'follow-up'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setEmailType(type)}
                      className={cn(
                        'rounded-xl border-[1.5px] border-charcoal py-2 text-center font-headline text-[10px] font-bold uppercase tracking-wider transition',
                        emailType === type
                          ? 'bg-primary text-white shadow-tactile-sm'
                          : 'bg-white text-on-surface hover:bg-surface-container-low'
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Email Tone */}
              <div className="grid gap-1.5">
                <label className="font-headline text-[10px] font-bold uppercase tracking-wider text-[color:var(--txt2)]">
                  4. Select Email Tone
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['professional', 'friendly', 'crisp'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTone(t)}
                      className={cn(
                        'rounded-xl border-[1.5px] border-charcoal py-2 text-center font-headline text-[10px] font-bold uppercase tracking-wider transition',
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

              {/* Generate button */}
              <EmailButton
                variant="primary"
                onClick={handleGenerate}
                disabled={loading || resumes.length === 0}
                className="mt-2 w-full py-3 text-sm justify-center"
              >
                {loading ? 'Drafting Email...' : '⚡ Generate Email Draft'}
              </EmailButton>
            </section>

            {/* Email Edit Panel */}
            <section className="min-h-[450px] grid content-start gap-4 rounded-[1.75rem] border-[1.5px] border-charcoal bg-white p-5 shadow-tactile md:p-6">
              {activeEmail ? (
                <div className="grid gap-4 w-full">
                  {/* Top configuration inputs */}
                  <div className="grid grid-cols-1 gap-4 border-b border-charcoal/10 pb-4 md:grid-cols-3">
                    <div>
                      <label className="mb-1 block font-headline text-[10px] font-bold uppercase tracking-wider text-[color:var(--txt2)]">
                        Draft Title
                      </label>
                      <input
                        value={activeEmail.title || ''}
                        onChange={e => setActiveEmail({ ...activeEmail, title: e.target.value })}
                        className="w-full rounded-xl border-[1.5px] border-charcoal bg-white px-3 py-2 text-xs text-on-surface focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block font-headline text-[10px] font-bold uppercase tracking-wider text-[color:var(--txt2)]">
                        Company Name
                      </label>
                      <input
                        value={activeEmail.company || ''}
                        onChange={e => setActiveEmail({ ...activeEmail, company: e.target.value })}
                        className="w-full rounded-xl border-[1.5px] border-charcoal bg-white px-3 py-2 text-xs text-on-surface focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block font-headline text-[10px] font-bold uppercase tracking-wider text-[color:var(--txt2)]">
                        Target Role
                      </label>
                      <input
                        value={activeEmail.job_role || ''}
                        onChange={e => setActiveEmail({ ...activeEmail, job_role: e.target.value })}
                        className="w-full rounded-xl border-[1.5px] border-charcoal bg-white px-3 py-2 text-xs text-on-surface focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Subject line input */}
                  <div className="grid gap-1">
                    <label className="font-headline text-[10px] font-bold uppercase tracking-wider text-[color:var(--txt2)]">
                      Email Subject
                    </label>
                    <div className="flex gap-2">
                      <input
                        value={activeEmail.subject || ''}
                        onChange={e => setActiveEmail({ ...activeEmail, subject: e.target.value })}
                        className="flex-1 rounded-xl border-[1.5px] border-charcoal bg-white px-3 py-2 text-xs font-bold text-on-surface focus:border-primary"
                      />
                      <EmailButton variant="secondary" onClick={handleCopySubject} className="whitespace-nowrap px-4 py-2">
                        {copySubjectFeedback ? '✓ Copied' : '📋 Copy Subject'}
                      </EmailButton>
                    </div>
                  </div>

                  {/* Action row for body */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-container-low/40 rounded-xl border border-charcoal/10 p-2.5">
                    <span className="text-[11px] font-bold text-[color:var(--txt1)]">
                      Review &amp; Edit email body:
                    </span>
                    <div className="flex gap-2">
                      <EmailButton variant="secondary" onClick={handleCopyBody} className="px-3.5 py-1.5">
                        {copyBodyFeedback ? '✓ Copied!' : '📋 Copy Body'}
                      </EmailButton>
                      <EmailButton variant="secondary" onClick={handleDownload} className="px-3.5 py-1.5">
                        💾 Download
                      </EmailButton>
                      <EmailButton variant="primary" onClick={handleSave} className="px-4 py-1.5">
                        📁 Save Draft
                      </EmailButton>
                    </div>
                  </div>

                  {/* Content area */}
                  <textarea
                    rows={15}
                    className="w-full rounded-2xl border-[1.5px] border-charcoal bg-surface p-4 text-sm text-on-surface focus:border-primary font-sans leading-6 whitespace-pre-wrap"
                    value={activeEmail.content || ''}
                    onChange={e => setActiveEmail({ ...activeEmail, content: e.target.value })}
                  />
                </div>
              ) : (
                <div className="py-24 text-center grid place-items-center gap-3">
                  <div className="text-5xl text-charcoal/30">✉</div>
                  <div className="font-headline text-lg font-extrabold text-on-surface">No Email Active</div>
                  <p className="max-w-md text-xs text-[color:var(--txt2)] leading-6">
                    Select a resume, job details, outreach objective, and tone, then click **Generate** to draft a tailored inquiry.
                  </p>
                </div>
              )}
            </section>
          </div>
        ) : (
          /* Saved Library Tab */
          <section className="grid gap-6">
            {savedEmails.length === 0 ? (
              <div className="rounded-[1.75rem] border-[1.5px] border-dashed border-charcoal/35 bg-white/70 py-16 text-center shadow-tactile-sm">
                <div className="grid max-w-md mx-auto gap-3">
                  <div className="text-4xl text-primary">📁</div>
                  <div className="font-headline text-lg font-extrabold text-on-surface">No Email Drafts Saved Yet</div>
                  <p className="text-xs text-[color:var(--txt2)] leading-6">
                    Once you save generated email drafts, they will be listed here.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {savedEmails.map(em => (
                  <article
                    key={em.id}
                    onClick={() => handleLoadFromLibrary(em)}
                    className="grid cursor-pointer gap-4 rounded-[1.75rem] border-[1.5px] border-charcoal bg-white/95 p-5 shadow-tactile transition hover:-translate-x-px hover:-translate-y-px"
                  >
                    <div className="flex items-start justify-between gap-3 border-b border-charcoal/10 pb-3">
                      <div>
                        <h3 className="font-headline text-lg font-extrabold text-on-surface leading-tight truncate max-w-[180px]">
                          {em.title}
                        </h3>
                        <p className="mt-1 text-xs text-[color:var(--txt2)] truncate max-w-[180px]">
                          {em.company || 'Direct'} · {em.job_role || 'General'}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-primary whitespace-nowrap bg-primary-fixed border border-primary/20 px-2 py-0.5 rounded-full">
                        DRAFT
                      </span>
                    </div>

                    <div className="grid gap-1">
                      <div className="text-[11px] font-bold text-on-surface truncate">
                        Subject: {em.subject}
                      </div>
                      <p className="text-xs text-[color:var(--txt1)] leading-5 h-20 overflow-hidden line-clamp-3 mask-fade">
                        {em.content}
                      </p>
                    </div>

                    <div className="mt-2 flex gap-2 pt-3 border-t border-charcoal/10">
                      <EmailButton variant="secondary" onClick={() => handleLoadFromLibrary(em)} className="px-3.5 py-1.5 flex-1">
                        Edit / Copy
                      </EmailButton>
                      <EmailButton variant="danger" onClick={e => handleDelete(em.id, e)} className="px-3 py-1.5">
                        🗑 Delete
                      </EmailButton>
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
