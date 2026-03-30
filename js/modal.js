/* ── MODAL LOGIC ── */
function showModal() {
  document.getElementById('modal-overlay').classList.add('open');
  resetModal();
}
function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  resetModal();
}
function resetModal() {
  document.getElementById('modal-upload-zone').classList.remove('active');
  document.getElementById('modal-upload-btn').classList.remove('active');
  document.getElementById('modal-paste-area').classList.remove('active');
  document.getElementById('modal-paste-btn').classList.remove('active');
}
function setModalMode(mode) {
  resetModal();
  if (mode === 'upload') {
    document.getElementById('modal-upload-zone').classList.add('active');
    document.getElementById('modal-upload-btn').classList.add('active');
  } else if (mode === 'paste') {
    document.getElementById('modal-paste-area').classList.add('active');
    document.getElementById('modal-paste-btn').classList.add('active');
  }
}
function startBlankResume() {
  closeModal();
  if (document.getElementById('desktop-view').classList.contains('active')) {
    openEditor();
  } else {
    mobShowPage('editor');
  }
}
function handleUpload() {
  closeModal();
  if (document.getElementById('desktop-view').classList.contains('active')) {
    openEditor();
  } else {
    mobShowPage('editor');
  }
}
function handlePaste() {
  closeModal();
  if (document.getElementById('desktop-view').classList.contains('active')) {
    openEditor();
  } else {
    mobShowPage('editor');
  }
}
