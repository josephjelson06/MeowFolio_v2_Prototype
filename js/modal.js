function buildResumeModalMarkup() {
  return `
    <div class="modal-overlay" id="modal-overlay" aria-hidden="true">
      <div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="resume-modal-title">
        <button class="modal-close" type="button" data-modal-close>&times;</button>
        <div class="modal-title" id="resume-modal-title">Create new resume</div>
        <div class="modal-desc">Upload a file, preview the parsed text, or start with a blank editor.</div>
        <div class="modal-options">
          <div class="modal-option" data-modal-mode="upload">
            <div class="modal-option-icon">&#8593;</div>
            <div>
              <div class="modal-option-name">Upload a file</div>
              <div class="modal-option-desc">Parse a PDF or document and preview the text before importing.</div>
            </div>
          </div>
          <div class="modal-option" data-modal-mode="paste">
            <div class="modal-option-icon">&#9112;</div>
            <div>
              <div class="modal-option-name">Paste resume text</div>
              <div class="modal-option-desc">Copy-paste your resume content for quick import.</div>
            </div>
          </div>
          <div class="modal-option" data-modal-start-blank>
            <div class="modal-option-icon">+</div>
            <div>
              <div class="modal-option-name">Start from blank</div>
              <div class="modal-option-desc">Open an empty editor with a fresh template.</div>
            </div>
          </div>
        </div>
        <input type="file" id="modal-upload-input" data-modal-upload-input accept=".pdf,application/pdf,.tex,.docx,.txt" hidden>
        <div class="modal-upload-zone" id="modal-upload-zone" data-modal-upload-zone>
          <div class="modal-upload-icon">&#9729;</div>
          <div class="modal-upload-text">Drag &amp; drop your file here, or click to browse</div>
          <div class="modal-upload-sub">Supports .pdf, .tex, .docx &middot; Max 5 MB</div>
        </div>
        <button class="modal-btn" id="modal-upload-btn" data-modal-upload type="button">Parse PDF into text box &rarr;</button>
        <textarea class="modal-paste-area" id="modal-paste-area" placeholder="Pasted or parsed resume text will appear here..."></textarea>
        <button class="modal-btn" id="modal-paste-btn" data-modal-paste type="button">Import &amp; open in editor &rarr;</button>
      </div>
    </div>
  `;
}

function ensureResumeModal() {
  if (document.getElementById('modal-overlay')) return;
  document.body.insertAdjacentHTML('beforeend', buildResumeModalMarkup());
}

function getResumeModal() {
  ensureResumeModal();
  return document.getElementById('modal-overlay');
}

function getResumeModalElements() {
  const overlay = getResumeModal();
  return {
    overlay,
    uploadZone: document.getElementById('modal-upload-zone'),
    uploadButton: document.getElementById('modal-upload-btn'),
    pasteArea: document.getElementById('modal-paste-area'),
    pasteButton: document.getElementById('modal-paste-btn'),
    uploadInput: document.getElementById('modal-upload-input'),
  };
}

function showModal() {
  const overlay = getResumeModal();
  if (!overlay) return;

  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  resetModal();
}

function closeModal() {
  const overlay = getResumeModal();
  if (!overlay) return;

  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  resetModal();
}

function resetModal() {
  const elements = getResumeModalElements();

  if (elements.uploadZone) elements.uploadZone.classList.remove('active');
  if (elements.uploadButton) elements.uploadButton.classList.remove('active');
  if (elements.pasteArea) {
    elements.pasteArea.classList.remove('active');
    elements.pasteArea.value = '';
  }
  if (elements.pasteButton) elements.pasteButton.classList.remove('active');
  if (elements.uploadInput) elements.uploadInput.value = '';
}

function setModalMode(mode) {
  resetModal();

  const elements = getResumeModalElements();

  if (mode === 'upload') {
    if (elements.uploadZone) elements.uploadZone.classList.add('active');
    if (elements.uploadButton) elements.uploadButton.classList.add('active');
  } else if (mode === 'paste') {
    if (elements.pasteArea) elements.pasteArea.classList.add('active');
    if (elements.pasteButton) elements.pasteButton.classList.add('active');
  }
}

function buildParsedResumePreview(fileName) {
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

function handleResumeFileSelect() {
  const elements = getResumeModalElements();
  if (!elements.uploadInput || !elements.pasteArea || !elements.pasteButton || !elements.uploadInput.files || !elements.uploadInput.files[0]) return;

  const fileName = elements.uploadInput.files[0].name;
  setModalMode('paste');
  elements.pasteArea.value = buildParsedResumePreview(fileName);
  elements.pasteButton.classList.add('active');
  elements.pasteArea.focus();
}

function goToEditor() {
  window.location.href = 'editor.html';
}

function startBlankResume() {
  closeModal();
  goToEditor();
}

function handleUpload() {
  const elements = getResumeModalElements();
  if (!elements.uploadInput) return;

  if (!elements.uploadInput.files || !elements.uploadInput.files[0]) {
    elements.uploadInput.click();
    return;
  }

  if (elements.pasteArea && !elements.pasteArea.value.trim()) {
    handleResumeFileSelect();
    return;
  }

  if (elements.pasteArea) elements.pasteArea.focus();
}

function handlePaste() {
  const elements = getResumeModalElements();
  if (!elements.pasteArea) return;

  if (!elements.pasteArea.value.trim()) {
    elements.pasteArea.focus();
    return;
  }

  closeModal();
  goToEditor();
}

document.addEventListener('click', event => {
  if (event.target.closest('[data-open-resume-modal]')) {
    showModal();
    return;
  }

  const overlay = document.getElementById('modal-overlay');
  if (overlay && event.target === overlay) {
    closeModal();
    return;
  }

  if (event.target.closest('[data-modal-close]')) {
    closeModal();
    return;
  }

  const modeTrigger = event.target.closest('[data-modal-mode]');
  if (modeTrigger) {
    setModalMode(modeTrigger.dataset.modalMode);
    return;
  }

  if (event.target.closest('[data-modal-start-blank]')) {
    startBlankResume();
    return;
  }

  if (event.target.closest('[data-modal-upload-zone]')) {
    const elements = getResumeModalElements();
    if (elements.uploadInput) elements.uploadInput.click();
    return;
  }

  if (event.target.closest('[data-modal-upload]')) {
    handleUpload();
    return;
  }

  if (event.target.closest('[data-modal-paste]')) {
    handlePaste();
  }
});

document.addEventListener('change', event => {
  if (event.target.matches('[data-modal-upload-input]')) {
    handleResumeFileSelect();
  }
});

document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;

  closeModal();
  if (typeof closeJDModal === 'function') closeJDModal();
});

document.addEventListener('DOMContentLoaded', ensureResumeModal);
