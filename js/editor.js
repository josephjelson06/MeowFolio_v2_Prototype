/* Shared editor tabs */
function setLTab(i) {
  document.querySelectorAll('[data-ltab-index]').forEach(tab => {
    tab.classList.toggle('active', Number(tab.dataset.ltabIndex) === i);
  });

  ['ltab-0', 'ltab-1', 'ltab-2'].forEach((id, idx) => {
    const pane = document.getElementById(id);
    if (pane) pane.classList.toggle('hidden', idx !== i);
  });
}

/* Shared editor sections */
function setSection(secId) {
  document.querySelectorAll('[data-section-target]').forEach(section => {
    section.classList.toggle('active', section.dataset.sectionTarget === secId);
  });

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
  const segments = document.querySelectorAll('[data-ed-mode]');

  if (!editorPane || !atsPane) return;

  segments.forEach(seg => {
    seg.classList.toggle('active', seg.dataset.edMode === mode);
  });

  if (mode === 'ats') {
    editorPane.classList.add('hidden');
    atsPane.classList.remove('hidden');
    if (crumb) crumb.textContent = 'ATS Score';
  } else {
    editorPane.classList.remove('hidden');
    atsPane.classList.add('hidden');
    if (crumb) crumb.textContent = 'Editor';
  }
}

function toggleDrawer() {
  const drawer = document.getElementById('ats-drawer');
  if (drawer) drawer.classList.toggle('open');
}

function selectTmpl(el) {
  document.querySelectorAll('[data-template-card]').forEach(card => card.classList.remove('sel'));
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

function updateToolbarSlider(input) {
  const outputId = input.dataset.outputId;
  const output = outputId ? document.getElementById(outputId) : null;
  if (!output) return;

  switch (input.dataset.outputFormat) {
    case 'pt':
      output.textContent = `${input.value}pt`;
      break;
    case 'ratio':
      output.textContent = (Number(input.value) / 100).toFixed(2);
      break;
    case 'cm':
      output.textContent = `${(Number(input.value) / 10).toFixed(1)}cm`;
      break;
    default:
      output.textContent = input.value;
      break;
  }
}

function bindEditorEvents() {
  document.addEventListener('click', event => {
    const mobView = event.target.closest('[data-mob-view]');
    if (mobView) {
      setMobEdView(mobView.dataset.mobView);
      return;
    }

    const modeButton = event.target.closest('[data-ed-mode]');
    if (modeButton) {
      setEdMode(modeButton.dataset.edMode);
      return;
    }

    const tab = event.target.closest('[data-ltab-index]');
    if (tab) {
      setLTab(Number(tab.dataset.ltabIndex));
      return;
    }

    const section = event.target.closest('[data-section-target]');
    if (section) {
      setSection(section.dataset.sectionTarget);
      return;
    }

    const templateCard = event.target.closest('[data-template-card]');
    if (templateCard) {
      selectTmpl(templateCard);
      return;
    }

    const editorAction = event.target.closest('[data-editor-action]');
    if (editorAction) {
      switch (editorAction.dataset.editorAction) {
        case 'toggle-drawer':
          toggleDrawer();
          break;
        case 'toggle-sheet':
          toggleMobSheet();
          break;
        case 'open-mob-ats':
          openMobATSReport();
          break;
        case 'back-to-editor':
          backToEditor();
          break;
        default:
          break;
      }
    }
  });

  document.addEventListener('input', event => {
    if (event.target.matches('[data-editor-slider]')) {
      updateToolbarSlider(event.target);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  bindEditorEvents();
  document.querySelectorAll('[data-editor-slider]').forEach(updateToolbarSlider);

  const params = new URLSearchParams(window.location.search);
  const wantsATS = params.get('mode') === 'ats';
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  if (isMobile) {
    setMobEdView(wantsATS ? 'ats' : 'edit');
  } else if (wantsATS) {
    setEdMode('ats');
  }
});
