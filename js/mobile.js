/* Mobile navigation */
function mobShowPage(page) {
  const pages = {
    dash: 'dashboard.html',
    resumes: 'resumes.html',
    jds: 'jds.html',
    profile: 'profile.html',
    editor: 'editor.html',
  };

  if (pages[page]) window.location.href = pages[page];
}

/* Mobile editor mode */
function setMobEdView(view) {
  const buttonMap = {
    edit: document.getElementById('mob-et-edit'),
    preview: document.getElementById('mob-et-prev'),
    ats: document.getElementById('mob-et-ats'),
  };
  const paneMap = {
    edit: document.getElementById('mob-edit-mode'),
    preview: document.getElementById('mob-prev-mode'),
    ats: document.getElementById('mob-ats-mode'),
  };

  if (!buttonMap.edit && !buttonMap.preview && !buttonMap.ats) return;

  Object.entries(buttonMap).forEach(([key, button]) => {
    if (button) button.classList.toggle('active', key === view);
  });

  Object.entries(paneMap).forEach(([key, pane]) => {
    if (pane) pane.classList.toggle('hidden', key !== view);
  });

  if (view === 'ats') {
    const sheet = document.getElementById('mob-sheet');
    if (sheet) sheet.classList.remove('open');
  }
}

function setMobEditorPane(pane) {
  const buttonMap = {
    sections: document.getElementById('mob-ep-sections'),
    template: document.getElementById('mob-ep-template'),
    toolbar: document.getElementById('mob-ep-toolbar'),
  };
  const paneMap = {
    sections: document.getElementById('mob-pane-sections'),
    template: document.getElementById('mob-pane-template'),
    toolbar: document.getElementById('mob-pane-toolbar'),
  };

  if (!buttonMap.sections && !buttonMap.template && !buttonMap.toolbar) return;

  Object.entries(buttonMap).forEach(([key, button]) => {
    if (button) button.classList.toggle('active', key === pane);
  });

  Object.entries(paneMap).forEach(([key, section]) => {
    if (section) section.classList.toggle('hidden', key !== pane);
  });
}

function setMobSection(section, button) {
  document.querySelectorAll('.mob-section-pills .mob-pill').forEach(pill => pill.classList.remove('active'));
  if (button) button.classList.add('active');

  const sections = {
    contact: 'mob-sec-contact',
    summary: 'mob-sec-summary',
    experience: 'mob-sec-experience',
    education: 'mob-sec-education',
    skills: 'mob-sec-skills',
    projects: 'mob-sec-projects',
  };

  Object.values(sections).forEach(id => {
    const pane = document.getElementById(id);
    if (pane) pane.classList.add('hidden');
  });

  const activePane = document.getElementById(sections[section]);
  if (activePane) activePane.classList.remove('hidden');
}

function selectMobTmpl(el) {
  document.querySelectorAll('#mob-pane-template .tmpl-card').forEach(card => card.classList.remove('sel'));
  if (el) el.classList.add('sel');
}

function toggleMobSheet() {
  const sheet = document.getElementById('mob-sheet');
  if (sheet) sheet.classList.toggle('open');
}

function openMobATSReport() {
  const sheet = document.getElementById('mob-sheet');
  if (sheet) sheet.classList.remove('open');
  setMobEdView('ats');
}
