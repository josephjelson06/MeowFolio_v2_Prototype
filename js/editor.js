/* Shared editor tabs */
function setLTab(i, el) {
  document.querySelectorAll('.ltab').forEach(tab => tab.classList.remove('active'));
  if (el) el.classList.add('active');

  ['ltab-0', 'ltab-1', 'ltab-2'].forEach((id, idx) => {
    const pane = document.getElementById(id);
    if (pane) pane.classList.toggle('hidden', idx !== i);
  });
}

/* Shared editor sections */
function setSection(el, secId) {
  document.querySelectorAll('.snav').forEach(section => section.classList.remove('active'));
  if (el) el.classList.add('active');

  ['sec-contact', 'sec-summary', 'sec-exp', 'sec-edu', 'sec-skills', 'sec-proj'].forEach(id => {
    const section = document.getElementById(id);
    if (section) section.classList.add('hidden');
  });

  const activeSection = document.getElementById(secId);
  if (activeSection) activeSection.classList.remove('hidden');
}

function setEdMode(mode) {
  const editorPane = document.getElementById('ed-mode-editor');
  const atsPane = document.getElementById('ed-mode-ats');
  const crumb = document.getElementById('bc-mode');
  const segments = document.querySelectorAll('.ed-seg');

  if (!editorPane || !atsPane) return;

  segments.forEach(seg => seg.classList.remove('active'));

  if (mode === 'ats') {
    editorPane.classList.add('hidden');
    atsPane.classList.remove('hidden');
    if (crumb) crumb.textContent = 'ATS Score';
    if (segments[1]) segments[1].classList.add('active');
  } else {
    editorPane.classList.remove('hidden');
    atsPane.classList.add('hidden');
    if (crumb) crumb.textContent = 'Editor';
    if (segments[0]) segments[0].classList.add('active');
  }
}

function toggleDrawer() {
  const drawer = document.getElementById('ats-drawer');
  if (drawer) drawer.classList.toggle('open');
}

function selectTmpl(el) {
  document.querySelectorAll('#ltab-1 .tmpl-card').forEach(card => card.classList.remove('sel'));
  if (el) el.classList.add('sel');
}

function setMobEdView(view) {
  const editButton = document.getElementById('mob-et-edit');
  const previewButton = document.getElementById('mob-et-prev');
  const atsButton = document.getElementById('mob-et-ats');

  [editButton, previewButton, atsButton].forEach(button => {
    if (button) button.classList.remove('active');
  });

  document.body.classList.remove('mob-edit-view', 'mob-preview-view', 'mob-ats-view');

  if (view === 'ats') {
    if (atsButton) atsButton.classList.add('active');
    document.body.classList.add('mob-ats-view');
    setEdMode('ats');
    const sheet = document.getElementById('mob-sheet');
    if (sheet) sheet.classList.remove('open');
    return;
  }

  setEdMode('editor');

  if (view === 'preview') {
    if (previewButton) previewButton.classList.add('active');
    document.body.classList.add('mob-preview-view');
  } else {
    if (editButton) editButton.classList.add('active');
    document.body.classList.add('mob-edit-view');
  }
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

function backToEditor() {
  if (window.matchMedia('(max-width: 768px)').matches) {
    setMobEdView('edit');
  } else {
    setEdMode('editor');
  }
}

function setCarousel(i) {
  document.querySelectorAll('.car-res').forEach((card, idx) => {
    card.classList.toggle('active', idx === i);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const wantsATS = params.get('mode') === 'ats';
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  if (isMobile) {
    setMobEdView(wantsATS ? 'ats' : 'edit');
  } else if (wantsATS) {
    setEdMode('ats');
  }
});
