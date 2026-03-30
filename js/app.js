/* ── DEVICE SWITCH ── */
function setDevice(d) {
  document.querySelectorAll('.dev-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  document.getElementById('desktop-view').classList.toggle('active', d === 'desktop');
  document.getElementById('mobile-view').classList.toggle('active', d === 'mobile');
}

/* ── DESKTOP NAVIGATION ── */
function showPage(p) {
  const pages = {
    dash:    'dashboard.html',
    resumes: 'resumes.html',
    jds:     'jds.html',
    profile: 'profile.html',
    editor:  'editor.html',
  };
  if (pages[p]) window.location.href = pages[p];
}

function openEditor(e) {
  if (e) e.stopPropagation();
  window.location.href = 'editor.html';
}

function openATS(e) {
  if (e) e.stopPropagation();
  window.location.href = 'editor.html?mode=ats';
}
