/* Desktop editor tabs */
function setLTab(i, el) {
  document.querySelectorAll('.ltab').forEach(tab => tab.classList.remove('active'));
  if (el) el.classList.add('active');

  ['ltab-0', 'ltab-1', 'ltab-2'].forEach((id, idx) => {
    const pane = document.getElementById(id);
    if (pane) pane.classList.toggle('hidden', idx !== i);
  });
}

/* Desktop editor sections */
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

/* Desktop editor / ATS mode */
function setEdMode(mode) {
  const editorPane = document.getElementById('ed-mode-editor');
  const atsPane = document.getElementById('ed-mode-ats');
  const crumb = document.getElementById('bc-mode');
  const segments = document.querySelectorAll('.ed-seg');

  if (!editorPane || !atsPane || !crumb || segments.length < 2) return;

  segments.forEach(seg => seg.classList.remove('active'));
  if (mode === 'ats') {
    editorPane.classList.add('hidden');
    atsPane.classList.remove('hidden');
    crumb.textContent = 'ATS Score';
    segments[1].classList.add('active');
  } else {
    editorPane.classList.remove('hidden');
    atsPane.classList.add('hidden');
    crumb.textContent = 'Editor';
    segments[0].classList.add('active');
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

function setCarousel(i) {
  document.querySelectorAll('.car-res').forEach((card, idx) => {
    card.classList.toggle('active', idx === i);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('mode') === 'ats') {
    setEdMode('ats');
    if (typeof setMobEdView === 'function') setMobEdView('ats');
  }
});
