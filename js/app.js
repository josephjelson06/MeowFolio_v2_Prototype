/* DEVICE SWITCH */
function setDevice(d) {
  document.querySelectorAll('.dev-btn').forEach(btn => {
    const wantsDesktop = btn.textContent.includes('Desktop');
    btn.classList.toggle('active', (d === 'desktop') === wantsDesktop);
  });

  const desktopView = document.getElementById('desktop-view');
  const mobileView = document.getElementById('mobile-view');
  if (desktopView) desktopView.classList.toggle('active', d === 'desktop');
  if (mobileView) mobileView.classList.toggle('active', d === 'mobile');
}

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
