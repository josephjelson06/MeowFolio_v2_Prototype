import { useEffect, useRef, useState } from 'react';
import { jdService } from 'services/jdService';
import { useUiContext } from 'state/ui/uiContext';

type JdMode = 'upload' | 'paste';

export function JdModalHost() {
  const { jdOpen, closeJd } = useUiContext();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [mode, setMode] = useState<JdMode>('upload');
  const [text, setText] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [savedJdId, setSavedJdId] = useState<string | null>(null);

  useEffect(() => {
    if (!jdOpen) {
      setBusy(false);
      setError('');
      setMode('upload');
      setSavedJdId(null);
      setText('');
      setSourceName('');
    }
  }, [jdOpen]);

  useEffect(() => {
    if (!jdOpen) return undefined;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closeJd();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [jdOpen, closeJd]);

  if (!jdOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-charcoal/30 px-4 backdrop-blur-sm" aria-hidden="false" onClick={event => {
      if (event.target === event.currentTarget) closeJd();
    }}>
      <div className="relative w-full max-w-[35rem] overflow-y-auto rounded-[1.75rem] border-[1.5px] border-charcoal/80 bg-[rgba(255,253,249,0.98)] p-6 shadow-tactile-lg shadow-ambient" role="dialog" aria-modal="true" aria-labelledby="jd-modal-title">
        <button className="absolute right-4 top-4 grid size-8 place-items-center rounded-full border-[1.5px] border-charcoal/70 bg-white/85 text-sm text-[color:var(--txt1)] shadow-tactile-sm transition hover:bg-surface-container-low hover:text-on-surface" type="button" onClick={closeJd}>&times;</button>
        <div className="font-headline text-xl font-extrabold text-on-surface" id="jd-modal-title">Add a job description</div>
        <div className="mt-2 text-sm leading-7 text-[color:var(--txt2)]">Upload a JD file or paste the job description directly. Parsed text appears in the same textbox below.</div>
        <div className="mt-5 flex flex-col gap-3">
          <button className="flex items-start gap-4 rounded-[1.3rem] border border-charcoal/15 bg-white/85 p-4 text-left transition hover:-translate-x-px hover:-translate-y-px hover:border-charcoal/70 hover:shadow-tactile-sm" type="button" onClick={() => {
            setError('');
            setMode('upload');
          }}>
            <div className="grid size-10 shrink-0 place-items-center rounded-2xl border border-charcoal/15 bg-primary-fixed text-lg text-primary">&#8593;</div>
            <div>
              <div className="font-headline text-sm font-bold text-on-surface">Upload a JD file</div>
              <div className="mt-1 text-xs leading-6 text-[color:var(--txt2)]">Extract text from PDF, DOCX, TXT, or MD and keep editing it below.</div>
            </div>
          </button>
          <button className="flex items-start gap-4 rounded-[1.3rem] border border-charcoal/15 bg-white/85 p-4 text-left transition hover:-translate-x-px hover:-translate-y-px hover:border-charcoal/70 hover:shadow-tactile-sm" type="button" onClick={() => {
            setError('');
            setMode('paste');
          }}>
            <div className="grid size-10 shrink-0 place-items-center rounded-2xl border border-charcoal/15 bg-secondary-fixed text-lg text-secondary">&#9112;</div>
            <div>
              <div className="font-headline text-sm font-bold text-on-surface">Paste JD text</div>
              <div className="mt-1 text-xs leading-6 text-[color:var(--txt2)]">Use the same single text box for manual entry or parsed output.</div>
            </div>
          </button>
        </div>

        {mode === 'upload' ? (
          <>
            <div className="mt-4 rounded-[1.25rem] border-2 border-dashed border-charcoal/40 px-6 py-5 text-center">
              <div className="text-3xl text-[color:var(--txt2)]">&#9729;</div>
              <div className="mt-2 text-sm text-[color:var(--txt2)]">Upload a JD file and continue editing the parsed text in the same textbox.</div>
              <div className="mt-1 text-[11px] text-outline">The backend extracts the text and stores a saved JD draft immediately.</div>
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
                  const saved = await jdService.importFile(file);
                  setMode('paste');
                  setSavedJdId(saved.item.id);
                  setSourceName(file.name);
                  setText(saved.extractedText ?? '');
                } catch (nextError) {
                  setError(nextError instanceof Error ? nextError.message : 'JD import failed.');
                } finally {
                  setBusy(false);
                  event.target.value = '';
                }
              }}
            />
            <button className="mt-4 inline-flex min-h-10 items-center justify-center rounded-full border-2 border-charcoal bg-white/95 px-4 py-2 font-headline text-[11px] font-bold text-primary shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:bg-primary-fixed hover:text-on-surface hover:shadow-tactile disabled:pointer-events-none disabled:opacity-40" type="button" disabled={busy} onClick={() => fileInputRef.current?.click()}>
              {busy ? 'Parsing JD...' : 'Upload JD into text box ->'}
            </button>
          </>
        ) : null}

        {mode === 'paste' ? (
          <>
            <textarea
              className="mt-4 min-h-[140px] w-full rounded-2xl border border-outline-variant bg-white/90 px-4 py-3 text-sm text-[color:var(--txt1)]"
              placeholder="Pasted or parsed JD text will appear here..."
              value={text}
              onChange={event => setText(event.target.value)}
            />
            <button
              className="mt-4 inline-flex min-h-10 items-center justify-center rounded-full border-2 border-charcoal bg-white/95 px-4 py-2 font-headline text-[11px] font-bold text-primary shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:bg-primary-fixed hover:text-on-surface hover:shadow-tactile disabled:pointer-events-none disabled:opacity-40"
              type="button"
              disabled={busy || !text.trim()}
              onClick={async () => {
                const nextText = text.trim();
                if (!nextText) return;
                setBusy(true);
                setError('');
                try {
                  const saved = savedJdId
                    ? await jdService.saveText(savedJdId, nextText, sourceName.replace(/\.[^.]+$/, '') || undefined)
                    : (await jdService.importText(nextText, sourceName || 'Imported JD')).item;
                  window.dispatchEvent(new CustomEvent(jdService.eventName, {
                    detail: {
                      id: saved?.id ?? savedJdId,
                    },
                  }));
                  closeJd();
                } catch (nextError) {
                  setError(nextError instanceof Error ? nextError.message : 'JD save failed.');
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? 'Saving JD...' : 'Save JD ->'}
            </button>
          </>
        ) : null}

        {error ? <div className="mt-3 text-sm text-error">{error}</div> : null}
      </div>
    </div>
  );
}
