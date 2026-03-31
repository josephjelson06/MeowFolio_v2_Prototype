import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResumeModal } from 'hooks/useResumeModal';
import { routes } from 'lib/routes';

type ResumeMode = 'upload' | 'paste' | null;

function buildParsedResumePreview(fileName: string) {
  return [
    `Parsed text preview from ${fileName}`,
    '',
    'Arjun Kumar',
    'arjun@email.com | +91 98765 43210 | Karnal, Haryana',
    '',
    'Summary',
    'Software engineer with experience across full-stack delivery, API performance, and resume tailoring workflows.',
    '',
    'Experience',
    '- Built REST APIs and internal tools used across product teams',
    '- Improved response times and reduced manual review effort',
    '',
    'Skills',
    'Python, React, Node.js, AWS, Docker, PostgreSQL',
  ].join('\n');
}

export function ResumeModalHost() {
  const navigate = useNavigate();
  const { resumeOpen, closeResume } = useResumeModal();
  const [mode, setMode] = useState<ResumeMode>(null);
  const [text, setText] = useState('');

  useEffect(() => {
    if (!resumeOpen) {
      setMode(null);
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
          <button className="modal-option" type="button" onClick={() => setMode('upload')}>
            <div className="modal-option-icon">&#8593;</div>
            <div>
              <div className="modal-option-name">Upload a file</div>
              <div className="modal-option-desc">Parse a PDF or document and preview the text before importing.</div>
            </div>
          </button>
          <button className="modal-option" type="button" onClick={() => setMode('paste')}>
            <div className="modal-option-icon">&#9112;</div>
            <div>
              <div className="modal-option-name">Paste resume text</div>
              <div className="modal-option-desc">Copy-paste your resume content for quick import.</div>
            </div>
          </button>
          <button className="modal-option" type="button" onClick={() => {
            closeResume();
            navigate(routes.editor);
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
              <div className="modal-upload-text">Click below to simulate a parsed upload preview.</div>
              <div className="modal-upload-sub">The React pass keeps the same mock parse behavior for now.</div>
            </div>
            <button
              className="modal-btn active"
              type="button"
              onClick={() => {
                setMode('paste');
                setText(buildParsedResumePreview('resume_v3.pdf'));
              }}
            >
              Parse PDF into text box &rarr;
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
              onClick={() => {
                closeResume();
                navigate(routes.editor);
              }}
            >
              Import &amp; open in editor &rarr;
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
