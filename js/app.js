/* DESKTOP NAVIGATION */
function showPage(p) {
  const pages = {
    dash: 'dashboard.html',
    resumes: 'resumes.html',
    jds: 'jds.html',
    profile: 'profile.html',
    editor: 'editor.html',
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
