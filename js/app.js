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

function getWorkspacePage() {
  return document.body?.dataset.workspacePage || '';
}

function getWorkspaceChromeConfig() {
  const page = getWorkspacePage();
  const configs = {
    dashboard: {
      desktopClass: 'dash-desktop-nav',
      mobileClass: 'dash-mobile-nav',
      barClass: 'dash-mobile-bar',
      title: 'Dashboard',
    },
    resumes: {
      desktopClass: 'res-desktop-nav',
      mobileClass: 'res-mobile-nav',
      barClass: 'res-mobile-bar',
      title: 'Resumes',
    },
    jds: {
      desktopClass: 'jd-desktop-nav',
      mobileClass: 'jd-mobile-nav',
      barClass: 'jd-mobile-bar',
      title: 'JD Match',
    },
    profile: {
      desktopClass: 'profile-desktop-nav',
      mobileClass: 'profile-mobile-nav',
      barClass: 'profile-mobile-bar',
      title: 'Profile',
    },
  };

  return configs[page] || null;
}

function buildWorkspaceHeaderMarkup() {
  const page = getWorkspacePage();
  const config = getWorkspaceChromeConfig();
  if (!config) return '';

  const dashActive = page === 'dashboard' ? ' active' : '';
  const resumesActive = page === 'resumes' ? ' active' : '';
  const jdsActive = page === 'jds' ? ' active' : '';

  return `
    <nav class="gnav ${config.desktopClass}">
      <a class="gnav-logo" href="dashboard.html">resumeai</a>
      <div class="gnav-links">
        <a class="gnav-link${dashActive}" href="dashboard.html">Dashboard</a>
        <a class="gnav-link${resumesActive}" href="resumes.html">Resumes</a>
        <a class="gnav-link${jdsActive}" href="jds.html">JDs</a>
      </div>
      <div class="gnav-right">
        <a class="avatar${page === 'profile' ? ' profile-avatar-link' : ''}" href="profile.html">AK</a>
      </div>
    </nav>

    <div class="mob-topbar ${config.mobileClass}">
      <a class="mob-topbar-logo" href="dashboard.html">resumeai</a>
      <span class="mob-topbar-title">${config.title}</span>
      <a class="avatar${page === 'profile' ? ' profile-avatar-link' : ''}" href="profile.html">AK</a>
    </div>
  `;
}

function buildWorkspaceMobileBarMarkup() {
  const page = getWorkspacePage();
  const config = getWorkspaceChromeConfig();
  if (!config) return '';

  const dashActive = page === 'dashboard' ? ' active' : '';
  const resumesActive = page === 'resumes' ? ' active' : '';
  const jdsActive = page === 'jds' ? ' active' : '';
  const profileActive = page === 'profile' ? ' active' : '';

  return `
    <nav class="mob-bottombar ${config.barClass}" aria-label="Mobile navigation">
      <a class="mob-tab${dashActive}" href="dashboard.html"><div class="mob-tab-icon">&#8862;</div><span>Dashboard</span></a>
      <a class="mob-tab${resumesActive}" href="resumes.html"><div class="mob-tab-icon">&#9776;</div><span>Resumes</span></a>
      <a class="mob-tab${jdsActive}" href="jds.html"><div class="mob-tab-icon">&#8857;</div><span>JDs</span></a>
      <a class="mob-tab${profileActive}" href="profile.html"><div class="mob-tab-icon">&#9675;</div><span>Profile</span></a>
    </nav>
  `;
}

function ensureWorkspaceChrome() {
  const config = getWorkspaceChromeConfig();
  if (!config) return;

  const main = document.querySelector('main');
  if (!main) return;

  if (!document.querySelector(`.${config.desktopClass}`)) {
    document.body.insertAdjacentHTML('afterbegin', buildWorkspaceHeaderMarkup());
  }

  if (!document.querySelector(`.${config.barClass}`)) {
    main.insertAdjacentHTML('afterend', buildWorkspaceMobileBarMarkup());
  }
}

document.addEventListener('DOMContentLoaded', ensureWorkspaceChrome);
