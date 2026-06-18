import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { routes } from 'app/router/routes';
import { ModalShell } from 'components/ui/ModalShell';
import { resumeService } from 'services/resumeService';
import { useUiContext } from 'state/ui/uiContext';

type ResumeMode = 'upload' | 'paste' | null;

export function ResumeModalHost() {
  const navigate = useNavigate();
  const { resumeOpen, closeResume } = useUiContext();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [mode, setMode] = useState<ResumeMode>(null);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [busyLabel, setBusyLabel] = useState('Parsing file...');
  const [error, setError] = useState('');
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string>('');
  const [debugSteps, setDebugSteps] = useState<string[]>([]);

  useEffect(() => {
    if (!resumeOpen) {
      setBusy(false);
      setBusyLabel('Parsing file...');
      setError('');
      setMode(null);
      setResumeId(null);
      setText('');
      setAuthToken('');
      setDebugSteps([]);
    } else {
      // Pre-fetch auth token when modal opens to avoid mobile WebKit lock freeze after file picker
      const isTestSeam = typeof window !== 'undefined' && window.localStorage.getItem('TEST_SEAM_ACTIVE') === 'true';
      if (isTestSeam) {
        setAuthToken('test-seam-token');
      } else {
        import('lib/supabase').then(({ supabase }) => {
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.access_token) {
              setAuthToken(session.access_token);
            }
          });
        });
      }
    }
  }, [resumeOpen]);

  useEffect(() => {
    if (!resumeOpen) return undefined;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closeResume();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [resumeOpen, closeResume]);

  if (!resumeOpen) return null;

  return (
    <ModalShell
      labelledBy="resume-modal-title"
      onClose={closeResume}
      overlayClassName="bg-charcoal/30 backdrop-blur-sm"
      panelClassName="max-w-[35rem] max-h-full overflow-y-auto border-[1.5px] border-charcoal/80 bg-[rgba(255,253,249,0.98)] p-5 md:p-6 shadow-tactile-lg shadow-ambient"
    >
      <button
        className="absolute right-3 top-3 md:right-4 md:top-4 grid size-8 place-items-center rounded-full border-[1.5px] border-charcoal/70 bg-white/85 text-sm text-[color:var(--txt1)] shadow-tactile-sm transition hover:bg-surface-container-low hover:text-on-surface"
        type="button"
        onClick={closeResume}
      >
        &times;
      </button>
      <div className="font-headline text-lg md:text-xl font-extrabold text-on-surface" id="resume-modal-title">
        Create new resume
      </div>
      <div className="mt-1 md:mt-2 text-xs md:text-sm leading-relaxed text-[color:var(--txt2)]">
        Upload a file, preview the parsed text, or start with a blank editor.
      </div>
      <div className="mt-3 md:mt-5 flex flex-col gap-2 md:gap-3">
        <button
          className="flex items-start gap-3 md:gap-4 rounded-2xl md:rounded-[1.3rem] border border-charcoal/15 bg-white/85 p-3 md:p-4 text-left transition hover:-translate-x-px hover:-translate-y-px hover:border-charcoal/70 hover:shadow-tactile-sm"
          type="button"
          onClick={() => {
            setError('');
            setMode('upload');
          }}
        >
          <div className="grid size-10 shrink-0 place-items-center rounded-2xl border border-charcoal/15 bg-primary-fixed text-lg text-primary">
            &#8593;
          </div>
          <div>
            <div className="font-headline text-sm font-bold text-on-surface">Upload a file</div>
            <div className="mt-1 text-xs leading-6 text-[color:var(--txt2)]">
              Parse a PDF or document and preview the text before importing.
            </div>
            <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
              ★ Uses 1 AI credit
            </div>
          </div>
        </button>
        <button
          className="flex items-start gap-3 md:gap-4 rounded-2xl md:rounded-[1.3rem] border border-charcoal/15 bg-white/85 p-3 md:p-4 text-left transition hover:-translate-x-px hover:-translate-y-px hover:border-charcoal/70 hover:shadow-tactile-sm"
          type="button"
          onClick={() => {
            setError('');
            setMode('paste');
          }}
        >
          <div className="grid size-10 shrink-0 place-items-center rounded-2xl border border-charcoal/15 bg-secondary-fixed text-lg text-secondary">
            &#9112;
          </div>
          <div>
            <div className="font-headline text-sm font-bold text-on-surface">Paste resume text</div>
            <div className="mt-1 text-xs leading-6 text-[color:var(--txt2)]">
              Copy-paste your resume content for quick import.
            </div>
            <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
              ★ Uses 1 AI credit
            </div>
          </div>
        </button>
        <button
          className="flex items-start gap-3 md:gap-4 rounded-2xl md:rounded-[1.3rem] border border-charcoal/15 bg-white/85 p-3 md:p-4 text-left transition hover:-translate-x-px hover:-translate-y-px hover:border-charcoal/70 hover:shadow-tactile-sm"
          type="button"
          onClick={async () => {
            setBusy(true);
            setError('');
            try {
              const created = await resumeService.createBlank();
              closeResume();
              navigate(`${routes.editor}?resumeId=${created.id}`);
            } catch (nextError) {
              setError(nextError instanceof Error ? nextError.message : 'Could not create a blank resume.');
            } finally {
              setBusy(false);
            }
          }}
        >
          <div className="grid size-10 shrink-0 place-items-center rounded-2xl border border-charcoal/15 bg-tertiary-fixed text-lg text-tertiary">
            +
          </div>
          <div>
            <div className="font-headline text-sm font-bold text-on-surface">Start from blank</div>
            <div className="mt-1 text-xs leading-6 text-[color:var(--txt2)]">
              Open an empty editor with a fresh template.
            </div>
          </div>
        </button>
      </div>

      {mode === 'upload' ? (
        <>
          <div className="mt-4 rounded-[1.25rem] border-2 border-dashed border-charcoal/40 px-6 py-5 text-center">
            <div className="text-3xl text-[color:var(--txt2)]">&#9729;</div>
            <div className="mt-2 text-sm text-[color:var(--txt2)]">
              Choose a PDF, DOCX, TXT, or MD file and preview the parsed text.
            </div>
            <div className="mt-1 text-[11px] text-outline">
              Text is extracted on the server — no file is stored.
            </div>
          </div>
          <input
            ref={fileInputRef}
            hidden
            type="file"
            accept=".pdf,.docx,.txt,.md"
            onChange={async event => {
              const file = event.target.files?.[0];
              if (!file) return;
              setBusy(true);
              setBusyLabel('1. Upload process initiated...');
              setError('');
              setDebugSteps([]);

              const addLog = async (msg: string) => {
                console.log(`[UploadDebug] ${msg}`);
                setDebugSteps(prev => [...prev, msg]);
                setBusyLabel(msg);
                await new Promise(resolve => setTimeout(resolve, 150));
              };

              try {
                await addLog('1. Start file upload...');

                if (!authToken) {
                  await addLog('ERROR: Auth token is empty!');
                  throw new Error('Still loading auth token. Please wait a moment and try again.');
                }
                await addLog('2. Auth token present. Decoding userId...');

                let userId = 'guest-user';
                try {
                  const payload = authToken.split('.')[1];
                  const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
                  userId = decoded.sub ?? 'guest-user';
                  await addLog(`3. Decoded userId: ${userId}`);
                } catch (jwtErr) {
                  await addLog(`Warning: Failed to decode JWT: ${jwtErr}`);
                }

                await addLog('4. Dynamically loading pdf-extractor...');
                const { extractText } = await import('lib/pdf-extractor');

                await addLog(`5. Starting text extraction for ${file.name} (${file.size} bytes)...`);
                const text = await extractText(file, authToken);

                await addLog(`6. Extraction success. Length: ${text?.length || 0} chars.`);
                if (!text) {
                  throw new Error('No text extracted from document.');
                }

                await addLog('7. Loading prompt builder & Groq client...');
                const { buildResumeParsePrompt } = await import('lib/resume-prompt');
                const { callGroq } = await import('lib/groq-client');

                await addLog('8. Building Groq parse prompt...');
                const { systemPrompt, userPrompt } = buildResumeParsePrompt(text.slice(0, 8000));

                await addLog('9. Calling Groq AI model...');
                let parsedContent = null;
                try {
                  const result = await callGroq(systemPrompt, userPrompt);
                  parsedContent = JSON.parse(result);
                  await addLog('10. Groq AI successfully parsed the resume!');
                } catch (groqErr) {
                  await addLog(`Warning: Groq call failed: ${groqErr instanceof Error ? groqErr.message : String(groqErr)}. Saving raw text only.`);
                }

                const { createEmptyResumeData, DEFAULT_RENDER_OPTIONS } = await import('types/resumeDocument');
                if (!parsedContent) {
                  parsedContent = createEmptyResumeData('import');
                }

                await addLog('11. Checking database insert mode...');
                const isGuest = userId === 'guest-user';
                let finalResumeId = '';

                if (isGuest) {
                  await addLog('12. Guest user: inserting mock resume...');
                  const imported = await resumeService.importText(text, file.name, userId);
                  finalResumeId = imported.resumeId ?? imported.item.id;
                  await addLog('13. Local mock resume created!');
                } else {
                  await addLog('12. Authenticated user: Loading Supabase client...');
                  const { supabase } = await import('lib/supabase');

                  await addLog('13. Executing Supabase insert query...');
                  const sourceName = file.name.replace(/\.[^.]+$/, '');
                  const title = sourceName || `Imported Resume ${Date.now()}`;
                  
                  const { data, error: dbError } = await supabase
                    .from('resumes')
                    .insert({
                      user_id: userId,
                      title,
                      template_id: 'template2',
                      content_json: parsedContent,
                      render_options: DEFAULT_RENDER_OPTIONS,
                      source: 'import',
                      raw_text: text,
                    })
                    .select('id')
                    .single();

                  if (dbError) {
                    await addLog(`ERROR: Supabase insert failed: ${dbError.message}`);
                    throw dbError;
                  }
                  if (!data) {
                    await addLog('ERROR: Supabase returned no data!');
                    throw new Error('Supabase insert returned no data');
                  }

                  finalResumeId = data.id;
                  await addLog(`14. Supabase insert success! ID: ${finalResumeId}`);
                  
                  await addLog('15. Updating active resume state...');
                  localStorage.setItem('meowfolio:active-resume-id', finalResumeId);
                  window.dispatchEvent(new CustomEvent('meowfolio:resume-library-changed'));
                }

                await addLog('16. Transitioning UI to paste/preview mode...');
                setMode('paste');
                setResumeId(finalResumeId);
                setText(text);
                await addLog('17. Finished successfully!');
              } catch (nextError) {
                const errMsg = nextError instanceof Error ? nextError.message : 'Upload failed.';
                await addLog(`ERROR: ${errMsg}`);
                setError(errMsg);
              } finally {
                setBusy(false);
                event.target.value = '';
              }
            }}
          />
          <button
            className="mt-4 inline-flex min-h-10 items-center justify-center rounded-full border-2 border-charcoal bg-white/95 px-4 py-2 font-headline text-[11px] font-bold text-primary shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:bg-primary-fixed hover:text-on-surface hover:shadow-tactile disabled:pointer-events-none disabled:opacity-40"
            type="button"
            disabled={busy}
            onClick={() => fileInputRef.current?.click()}
          >
            {busy ? busyLabel : 'Upload and parse file ->'}
          </button>

          {debugSteps.length > 0 && (
            <div className="mt-4 rounded-xl border border-charcoal/20 bg-charcoal/5 p-3 text-left font-mono text-[10px] leading-relaxed max-h-48 overflow-y-auto">
              <div className="font-bold border-b border-charcoal/10 pb-1 mb-1 text-[color:var(--txt1)]">
                Upload Tracing Logs:
              </div>
              {debugSteps.map((step, idx) => (
                <div 
                  key={idx} 
                  className={idx === debugSteps.length - 1 ? "text-primary font-bold animate-pulse" : "text-[color:var(--txt2)]"}
                >
                  {step}
                </div>
              ))}
            </div>
          )}
        </>
      ) : null}

      {mode === 'paste' ? (
        <>
          <textarea
            className="mt-4 min-h-[100px] w-full rounded-2xl border border-outline-variant bg-white/90 px-4 py-3 text-sm text-[color:var(--txt1)]"
            placeholder="Pasted or parsed resume text will appear here..."
            value={text}
            onChange={event => setText(event.target.value)}
          />
          <button
            className="mt-4 inline-flex min-h-10 items-center justify-center rounded-full border-2 border-charcoal bg-white/95 px-4 py-2 font-headline text-[11px] font-bold text-primary shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:bg-primary-fixed hover:text-on-surface hover:shadow-tactile disabled:pointer-events-none disabled:opacity-40"
            type="button"
            disabled={busy || !text.trim()}
            onClick={async () => {
              setBusy(true);
              setError('');
              try {
                const imported = resumeId
                  ? { resumeId, item: { id: resumeId } }
                  : await resumeService.importText(text, 'pasted_resume');
                closeResume();
                navigate(`${routes.editor}?resumeId=${imported.resumeId ?? imported.item.id}`);
              } catch (nextError) {
                setError(nextError instanceof Error ? nextError.message : 'Import failed.');
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? 'Importing...' : 'Import & open in editor ->'}
          </button>
        </>
      ) : null}

      {error ? (
        <div className="mt-3 rounded-xl border border-error/30 bg-error/5 p-3 text-sm text-error">
          {error}
          {error.toLowerCase().includes('credit') && (
            <button
              className="ml-2 font-bold underline"
              type="button"
              onClick={() => {
                closeResume();
                navigate(routes.profile);
              }}
            >
              View Profile →
            </button>
          )}
        </div>
      ) : null}
    </ModalShell>
  );
}
