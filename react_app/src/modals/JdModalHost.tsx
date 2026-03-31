import { useEffect, useState } from 'react';
import { useJdModal } from 'hooks/useJdModal';

type JdMode = 'upload' | 'paste';

function buildParsedJdPreview() {
  return [
    'Software Engineer II',
    'Google',
    '',
    'Responsibilities',
    '- Build backend services and internal tooling',
    '- Ship product features across full-stack surfaces',
    '',
    'Skills',
    'Python, React, REST APIs, cloud systems, scalable architecture',
  ].join('\n');
}

export function JdModalHost() {
  const { jdOpen, closeJd } = useJdModal();
  const [mode, setMode] = useState<JdMode>('upload');
  const [text, setText] = useState('');

  useEffect(() => {
    if (!jdOpen) {
      setMode('upload');
      setText('');
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
        <div className="modal-desc">Upload a JD PDF or paste the job description directly. Parsed text appears in the same textbox below.</div>
        <div className="modal-options">
          <button className="modal-option" type="button" onClick={() => setMode('upload')}>
            <div className="modal-option-icon">&#8593;</div>
            <div>
              <div className="modal-option-name">Upload a JD PDF</div>
              <div className="modal-option-desc">Simulate parsing and preview the extracted text before saving.</div>
            </div>
          </button>
          <button className="modal-option" type="button" onClick={() => setMode('paste')}>
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
              <div className="modal-upload-text">Generate a parsed JD preview and continue editing it in the textbox.</div>
              <div className="modal-upload-sub">React keeps the same mocked upload behavior from the static prototype for now.</div>
            </div>
            <button className="modal-btn active" type="button" onClick={() => {
              setMode('paste');
              setText(buildParsedJdPreview());
            }}>
              Parse JD into text box &rarr;
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
            <button className="modal-btn active" type="button" onClick={closeJd}>Save JD draft &rarr;</button>
          </>
        ) : null}
      </div>
    </div>
  );
}
