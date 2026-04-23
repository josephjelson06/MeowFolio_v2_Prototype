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
  const [error, setError] = useState('');
  const [resumeId, setResumeId] = useState<string | null>(null);

  useEffect(() => {
    if (!resumeOpen) {
      setBusy(false);
      setError('');
      setMode(null);
      setResumeId(null);
      setText('');
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
              Text is extracted in your browser — no files are uploaded to any server.
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
              setError('');
              try {
                const imported = await resumeService.importFile(file);
                setMode('paste');
                setResumeId(imported.resumeId ?? imported.item.id);
                setText(imported.extractedText ?? '');
              } catch (nextError) {
                setError(nextError instanceof Error ? nextError.message : 'Upload failed.');
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
            {busy ? 'Parsing upload...' : 'Upload and parse file ->'}
          </button>
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
