function showModal() {
  const overlay = document.getElementById('modal-overlay');
  if (!overlay) return;

  overlay.classList.add('open');
  resetModal();
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (!overlay) return;

  overlay.classList.remove('open');
  resetModal();
}

function resetModal() {
  const uploadZone = document.getElementById('modal-upload-zone');
  const uploadButton = document.getElementById('modal-upload-btn');
  const pasteArea = document.getElementById('modal-paste-area');
  const pasteButton = document.getElementById('modal-paste-btn');
  const uploadInput = document.getElementById('modal-upload-input');

  if (uploadZone) uploadZone.classList.remove('active');
  if (uploadButton) uploadButton.classList.remove('active');
  if (pasteArea) {
    pasteArea.classList.remove('active');
    pasteArea.value = '';
  }
  if (pasteButton) pasteButton.classList.remove('active');
  if (uploadInput) uploadInput.value = '';
}

function setModalMode(mode) {
  resetModal();

  const uploadZone = document.getElementById('modal-upload-zone');
  const uploadButton = document.getElementById('modal-upload-btn');
  const pasteArea = document.getElementById('modal-paste-area');
  const pasteButton = document.getElementById('modal-paste-btn');

  if (mode === 'upload') {
    if (uploadZone) uploadZone.classList.add('active');
    if (uploadButton) uploadButton.classList.add('active');
  } else if (mode === 'paste') {
    if (pasteArea) pasteArea.classList.add('active');
    if (pasteButton) pasteButton.classList.add('active');
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
  const uploadInput = document.getElementById('modal-upload-input');
  const pasteArea = document.getElementById('modal-paste-area');
  const pasteButton = document.getElementById('modal-paste-btn');

  if (!uploadInput || !pasteArea || !pasteButton || !uploadInput.files || !uploadInput.files[0]) return;
  const fileName = uploadInput.files[0].name;

  setModalMode('paste');
  pasteArea.value = buildParsedResumePreview(fileName);
  pasteButton.classList.add('active');
  pasteArea.focus();
}

function startBlankResume() {
  closeModal();
  if (document.getElementById('desktop-view') && document.getElementById('desktop-view').classList.contains('active')) {
    openEditor();
  } else {
    mobShowPage('editor');
  }
}

function handleUpload() {
  const uploadInput = document.getElementById('modal-upload-input');
  const pasteArea = document.getElementById('modal-paste-area');

  if (!uploadInput) return;

  if (!uploadInput.files || !uploadInput.files[0]) {
    uploadInput.click();
    return;
  }

  if (pasteArea && !pasteArea.value.trim()) {
    handleResumeFileSelect();
    return;
  }

  if (pasteArea) pasteArea.focus();
}

function handlePaste() {
  const pasteArea = document.getElementById('modal-paste-area');
  if (!pasteArea) return;

  if (!pasteArea.value.trim()) {
    pasteArea.focus();
    return;
  }

  closeModal();
  if (document.getElementById('desktop-view') && document.getElementById('desktop-view').classList.contains('active')) {
    openEditor();
  } else {
    mobShowPage('editor');
  }
}

document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;

  closeModal();
  if (typeof closeJDModal === 'function') closeJDModal();
});
