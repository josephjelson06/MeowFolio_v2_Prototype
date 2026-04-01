import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResumeModal } from 'hooks/useResumeModal';
import { routes } from 'lib/routes';
import { resumeService } from 'services/resumeService';

type ResumeMode = 'upload' | 'paste' | null;

export function ResumeModalHost() {
  const navigate = useNavigate();
  const { resumeOpen, closeResume } = useResumeModal();
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
    <div className="modal-overlay open" aria-hidden="false" onClick={event => {
      if (event.target === event.currentTarget) closeResume();
    }}>
      <div className="modal-box ra-modal-box" role="dialog" aria-modal="true" aria-labelledby="resume-modal-title">
        <button className="modal-close" type="button" onClick={closeResume}>&times;</button>
        <div className="modal-title" id="resume-modal-title">Create new resume</div>
        <div className="modal-desc">Upload a file, preview the parsed text, or start with a blank editor.</div>
        <div className="modal-options">
          <button className="modal-option" type="button" onClick={() => {
            setError('');
            setMode('upload');
          }}>
            <div className="modal-option-icon">&#8593;</div>
            <div>
              <div className="modal-option-name">Upload a file</div>
              <div className="modal-option-desc">Parse a PDF or document and preview the text before importing.</div>
            </div>
          </button>
          <button className="modal-option" type="button" onClick={() => {
            setError('');
            setMode('paste');
          }}>
            <div className="modal-option-icon">&#9112;</div>
            <div>
              <div className="modal-option-name">Paste resume text</div>
              <div className="modal-option-desc">Copy-paste your resume content for quick import.</div>
            </div>
          </button>
          <button className="modal-option" type="button" onClick={async () => {
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
          }}>
            <div className="modal-option-icon">+</div>
            <div>
              <div className="modal-option-name">Start from blank</div>
              <div className="modal-option-desc">Open an empty editor with a fresh template.</div>
            </div>
          </button>
        </div>

        {mode === 'upload' ? (
          <>
            <div className="modal-upload-zone active">
              <div className="modal-upload-icon">&#9729;</div>
              <div className="modal-upload-text">Choose a PDF, DOCX, TXT, or MD file and preview the parsed text.</div>
              <div className="modal-upload-sub">The backend stores the upload, extracts text, and creates an editable resume draft.</div>
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
            <button className="modal-btn active" type="button" disabled={busy} onClick={() => fileInputRef.current?.click()}>
              {busy ? 'Parsing upload...' : 'Upload and parse file ->'}
            </button>
          </>
        ) : null}

        {mode === 'paste' ? (
          <>
            <textarea
              className="modal-paste-area active"
              placeholder="Pasted or parsed resume text will appear here..."
              value={text}
              onChange={event => setText(event.target.value)}
            />
            <button
              className="modal-btn active"
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

        {error ? <div className="modal-desc">{error}</div> : null}
      </div>
    </div>
  );
}
