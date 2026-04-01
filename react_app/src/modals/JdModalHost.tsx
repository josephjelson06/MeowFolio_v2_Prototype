import { useEffect, useRef, useState } from 'react';
import { useJdModal } from 'hooks/useJdModal';
import { jdService } from 'services/jdService';

type JdMode = 'upload' | 'paste';

export function JdModalHost() {
  const { jdOpen, closeJd } = useJdModal();
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
    <div className="modal-overlay open" aria-hidden="false" onClick={event => {
      if (event.target === event.currentTarget) closeJd();
    }}>
      <div className="modal-box ra-modal-box" role="dialog" aria-modal="true" aria-labelledby="jd-modal-title">
        <button className="modal-close" type="button" onClick={closeJd}>&times;</button>
        <div className="modal-title" id="jd-modal-title">Add a job description</div>
        <div className="modal-desc">Upload a JD file or paste the job description directly. Parsed text appears in the same textbox below.</div>
        <div className="modal-options">
          <button className="modal-option" type="button" onClick={() => {
            setError('');
            setMode('upload');
          }}>
            <div className="modal-option-icon">&#8593;</div>
            <div>
              <div className="modal-option-name">Upload a JD file</div>
              <div className="modal-option-desc">Extract text from PDF, DOCX, TXT, or MD and keep editing it below.</div>
            </div>
          </button>
          <button className="modal-option" type="button" onClick={() => {
            setError('');
            setMode('paste');
          }}>
            <div className="modal-option-icon">&#9112;</div>
            <div>
              <div className="modal-option-name">Paste JD text</div>
              <div className="modal-option-desc">Use the same single text box for manual entry or parsed output.</div>
            </div>
          </button>
        </div>

        {mode === 'upload' ? (
          <>
            <div className="modal-upload-zone active">
              <div className="modal-upload-icon">&#9729;</div>
              <div className="modal-upload-text">Upload a JD file and continue editing the parsed text in the same textbox.</div>
              <div className="modal-upload-sub">The backend extracts the text and stores a saved JD draft immediately.</div>
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
            <button className="modal-btn active" type="button" disabled={busy} onClick={() => fileInputRef.current?.click()}>
              {busy ? 'Parsing JD...' : 'Upload JD into text box ->'}
            </button>
          </>
        ) : null}

        {mode === 'paste' ? (
          <>
            <textarea
              className="modal-paste-area active"
              placeholder="Pasted or parsed JD text will appear here..."
              value={text}
              onChange={event => setText(event.target.value)}
            />
            <button
              className="modal-btn active"
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

        {error ? <div className="modal-desc">{error}</div> : null}
      </div>
    </div>
  );
}
