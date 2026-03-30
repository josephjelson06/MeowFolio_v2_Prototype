/* ── MOBILE NAVIGATION ── */
function mobShowPage(p) {
  const pages = {
    dash:    'dashboard.html',
    resumes: 'resumes.html',
    jds:     'jds.html',
    profile: 'profile.html',
    editor:  'editor.html',
  };
  if (pages[p]) window.location.href = pages[p];
}

/* ── EDITOR: edit / preview toggle ── */
function setMobEdView(v) {
  document.getElementById('mob-et-edit').classList.toggle('active', v === 'edit');
  document.getElementById('mob-et-prev').classList.toggle('active', v === 'preview');
  document.getElementById('mob-edit-mode').classList.toggle('hidden', v !== 'edit');
  document.getElementById('mob-prev-mode').classList.toggle('hidden', v !== 'preview');
}

/* ── MOBILE BOTTOM SHEET ── */
function toggleMobSheet() {
  document.getElementById('mob-sheet').classList.toggle('open');
}
