let JD_DATA = [
  { id: 1, title: 'Software Engineer II', company: 'Google', type: 'Full-time', badge: '2 resumes matched', parsedText: 'Software Engineer II\nGoogle\nBuild product features, APIs, and internal tooling.' },
  { id: 2, title: 'Senior Frontend Dev', company: 'Razorpay', type: 'Full-time', badge: 'Not analyzed yet', parsedText: 'Senior Frontend Dev\nRazorpay\nOwn frontend architecture and UX performance.' },
  { id: 3, title: 'ML Engineer', company: 'OpenAI', type: 'Remote', badge: '1 resume matched', parsedText: 'ML Engineer\nOpenAI\nTrain, evaluate, and deploy model-driven workflows.' },
  { id: 4, title: 'Platform Engineer', company: 'Stripe', type: 'Hybrid', badge: 'Not analyzed yet', parsedText: 'Platform Engineer\nStripe\nScale internal platform reliability and developer tooling.' },
  { id: 5, title: 'Data Engineer', company: 'Notion', type: 'Remote', badge: '2 resumes matched', parsedText: 'Data Engineer\nNotion\nDesign pipelines and analytics foundations.' },
  { id: 6, title: 'DevOps Engineer', company: 'Atlassian', type: 'Full-time', badge: 'Not analyzed yet', parsedText: 'DevOps Engineer\nAtlassian\nImprove CI/CD, cloud infrastructure, and observability.' },
  { id: 7, title: 'Product Analyst', company: 'CRED', type: 'Hybrid', badge: '1 resume matched', parsedText: 'Product Analyst\nCRED\nTranslate product questions into dashboard and SQL analysis.' },
];

const RESUME_DATA = {
  resume_v3: { score: 87, cls: 'high', found: ['Python', 'React', 'REST API', 'scalable', 'cloud'], miss: ['Kubernetes', 'Go'] },
  resume_sde: { score: 62, cls: 'mid', found: ['React', 'Node.js', 'REST'], miss: ['Python', 'System design', 'scalable'] },
  resume_pm: { score: 31, cls: 'low', found: ['communication'], miss: ['Python', 'React', 'backend', 'APIs'] },
  resume_ds: { score: 78, cls: 'high', found: ['Python', 'AWS', 'data pipelines'], miss: ['React', 'Node.js'] },
  resume_ml: { score: 55, cls: 'mid', found: ['Python', 'ML', 'TensorFlow', 'AWS'], miss: ['React', 'Node.js', 'REST API'] },
};

const JD_PAGE_SIZE = 5;
let jdPage = 1;
let selectedJDId = 1;
let selectedResume = null;
let lastJDAnalysis = null;
let lastJDUploadName = '';

function getJDById(id) {
  return JD_DATA.find(jd => jd.id === id);
}

function getTotalJDPages() {
  return Math.max(1, Math.ceil(JD_DATA.length / JD_PAGE_SIZE));
}

function getCurrentJDPageItems() {
  const start = (jdPage - 1) * JD_PAGE_SIZE;
  return JD_DATA.slice(start, start + JD_PAGE_SIZE);
}

function getJDPageForId(id) {
  const idx = JD_DATA.findIndex(jd => jd.id === id);
  return idx === -1 ? 1 : Math.floor(idx / JD_PAGE_SIZE) + 1;
}

function ensureSelectedJD() {
  if (!JD_DATA.length) {
    selectedJDId = null;
    return;
  }

  if (!getJDById(selectedJDId)) selectedJDId = JD_DATA[0].id;
}

function isMobileViewport() {
  return window.matchMedia('(max-width: 768px)').matches;
}

function renderEmptyState(message) {
  return `
    <div class="jd-no-result">
      <div class="jd-no-result-icon">&#9678;</div>
      <div class="jd-no-result-txt">${message}</div>
    </div>
  `;
}

function renderJDCard(jd) {
  return `
    <article class="jd-card${jd.id === selectedJDId ? ' active' : ''}" data-jd-card data-jd-id="${jd.id}">
      <div class="jd-card-title">${jd.title}</div>
      <div class="jd-card-sub">${jd.company} &middot; ${jd.type}</div>
      <div class="jd-card-foot">
        <span class="jd-card-badge">${jd.badge}</span>
        <div class="jd-card-actions">
          <button class="r-action" type="button" data-jd-action="rename" data-jd-id="${jd.id}">Rename</button>
          <button class="r-action" type="button" data-jd-action="download" data-jd-id="${jd.id}">&#11015;</button>
          <button class="r-action jd-delete-action" type="button" data-jd-action="delete" data-jd-id="${jd.id}">&#128465;</button>
        </div>
      </div>
    </article>
  `;
}

function renderJDPagination() {
  const totalPages = getTotalJDPages();
  const page = document.getElementById('jd-page');
  const prev = document.getElementById('jd-prev');
  const next = document.getElementById('jd-next');

  if (page) page.textContent = `Page ${jdPage} of ${totalPages}`;
  if (prev) prev.disabled = jdPage === 1;
  if (next) next.disabled = jdPage === totalPages;
}

function renderJDLists() {
  ensureSelectedJD();

  const count = document.getElementById('jd-count');
  const cards = document.getElementById('jd-cards');
  const pageItems = getCurrentJDPageItems();

  if (count) count.textContent = `${JD_DATA.length} JDs`;

  if (cards) {
    cards.innerHTML = pageItems.length
      ? pageItems.map(renderJDCard).join('')
      : renderEmptyState('No saved JDs yet. Add one to begin matching.');
  }

  renderJDPagination();
  updateJDTitles();
}

function renderResumePicker() {
  const list = document.getElementById('jd-resume-list');
  if (!list) return;

  const keys = Object.keys(RESUME_DATA);
  list.innerHTML = keys.map(key => `
    <div class="jd-pick-item${selectedResume === key ? ' selected' : ''}" data-resume-choice="${key}">
      <div class="jd-pick-radio"><div class="jd-pick-radio-dot"></div></div>
      <span class="jd-pick-label">${key}</span>
    </div>
  `).join('');
}

function updateJDTitles() {
  const jd = getJDById(selectedJDId);
  const title = document.getElementById('jd-title');
  const subtitle = document.getElementById('jd-subtitle');

  if (!jd) {
    if (title) title.textContent = 'No saved JDs';
    if (subtitle) subtitle.textContent = 'Add a JD from the list to continue matching resumes.';
    return;
  }

  if (title) title.textContent = `${jd.title} - ${jd.company}`;
  if (subtitle) subtitle.textContent = 'Choose a resume and run the same match workflow across desktop and mobile.';
}

function updateRunButton() {
  const runButton = document.getElementById('jd-run-btn');
  const hasJD = Boolean(getJDById(selectedJDId));
  if (runButton) runButton.disabled = !selectedResume || !hasJD;
}

function getJDReportModel(resumeKey, jdId) {
  const resume = RESUME_DATA[resumeKey];
  const jd = getJDById(jdId);
  const totalKeywords = resume.found.length + resume.miss.length || 1;
  const keywordCoverage = Math.round((resume.found.length / totalKeywords) * 100);
  const roleAlignment = Math.max(28, Math.min(96, Math.round((resume.score + keywordCoverage) / 2)));
  const seniorityFit = Math.max(24, Math.min(94, resume.score + (jdId % 3 === 0 ? 4 : 7)));
  const impactReadiness = Math.max(20, Math.min(92, resume.score - (resume.miss.length * 5) + 18));
  const verdict = resume.cls === 'high' ? 'Strong match for this role' : resume.cls === 'mid' ? 'Promising match with a few gaps' : 'Needs targeted tailoring';
  const scoreColor = resume.cls === 'high' ? 'var(--accent)' : resume.cls === 'mid' ? 'var(--warn)' : 'var(--err)';

  return {
    jd,
    resumeKey,
    resume,
    verdict,
    scoreTone: resume.cls,
    metrics: [
      { label: 'Keyword coverage', value: keywordCoverage, tone: keywordCoverage >= 70 ? 'accent' : 'warn' },
      { label: 'Role alignment', value: roleAlignment, tone: roleAlignment >= 70 ? 'accent' : 'warn' },
      { label: 'Seniority fit', value: seniorityFit, tone: seniorityFit >= 70 ? 'accent' : 'warn' },
      { label: 'Impact readiness', value: impactReadiness, tone: impactReadiness >= 70 ? 'accent' : 'warn' },
    ],
    checks: [
      { tone: 'ok', text: `Matched ${resume.found.length} high-signal keywords from the JD` },
      { tone: resume.score >= 70 ? 'ok' : 'warn', text: 'Resume structure is clear enough for recruiter review' },
      { tone: resume.miss.length <= 2 ? 'warn' : 'bad', text: `Address ${resume.miss.length} missing keyword gaps before applying` },
      { tone: resume.cls === 'low' ? 'bad' : 'warn', text: 'Tailor the summary and experience bullets to this exact role' },
    ],
  };
}

function renderJDResultCard(model) {
  return `
    <div class="match-result-card">
      <div class="match-res-header">
        <div class="match-res-info">
          <div class="match-res-label">Resume vs Job Description</div>
          <div class="match-res-name">${model.resumeKey}</div>
          <div class="match-res-sub">${model.jd.title} &middot; ${model.jd.company}</div>
        </div>
        <div class="match-score-badge">
          <div class="match-score ${model.resume.cls}">${model.resume.score}%</div>
          <div class="match-score-label">match score</div>
        </div>
      </div>
      <div class="match-bar-track">
        <div class="match-bar-fill ${model.scoreTone}" style="width:${model.resume.score}%"></div>
      </div>
      <div class="match-kw-section">
        <div class="match-kw-heading">&#10003; Keywords found (${model.resume.found.length})</div>
        <div class="match-kw">
          ${model.resume.found.map(keyword => `<span class="match-kw-tag found">${keyword}</span>`).join('')}
        </div>
      </div>
      <div class="match-kw-section">
        <div class="match-kw-heading">&#10007; Missing keywords (${model.resume.miss.length})</div>
        <div class="match-kw">
          ${model.resume.miss.map(keyword => `<span class="match-kw-tag miss">${keyword}</span>`).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderMobileReportEmpty() {
  return `
    <div class="match-result-card">
      ${renderEmptyState('Run a JD analysis from the workspace tab to view the detailed report.')}
    </div>
  `;
}

function renderMobileSheetEmpty() {
  return `
    <div class="jd-no-result jd-sheet-empty">
      <div class="jd-no-result-icon">&#9678;</div>
      <div class="jd-no-result-txt">Run a JD analysis to preview the report summary here.</div>
    </div>
  `;
}

function renderMobileSheetSummary(model) {
  return `
    <div class="jd-sheet-score-row">
      <span class="jd-sheet-score-num ${model.scoreTone}">${model.resume.score}</span>
      <span class="jd-sheet-score-label">match score</span>
    </div>
    <div class="jd-sheet-verdict">${model.verdict}</div>
    <div class="mob-jd-sheet-metrics">
      ${model.metrics.slice(0, 3).map(metric => `
        <div class="ats-bar-item">
          <div class="ats-bar-label"><span>${metric.label}</span><span class="jd-metric-val ${metric.tone}">${metric.value}%</span></div>
          <div class="ats-bar-track"><div class="ats-bar-fill${metric.tone === 'warn' ? ' warn' : ''}" style="width:${metric.value}%"></div></div>
        </div>
      `).join('')}
    </div>
    <div class="audit-head jd-sheet-headline">Top matched keywords</div>
    <div class="mob-jd-sheet-tags">
      ${model.resume.found.slice(0, 4).map(keyword => `<span class="match-kw-tag found">${keyword}</span>`).join('')}
    </div>
    <button class="analyze-btn jd-sheet-report-btn" type="button" data-jd-report-open>Open detailed JD report</button>
  `;
}

function renderMobileDetailedReport(model) {
  return `
    <div class="ats-score-card mob-ats-score-card">
      <div class="ats-score-num ${model.scoreTone}">${model.resume.score}</div>
      <div class="ats-score-info">
        <div class="ats-score-label">${model.verdict}</div>
        <div class="ats-score-desc">${model.resumeKey} &middot; ${model.jd.title} &middot; ${model.jd.company}</div>
      </div>
      <button class="analyze-btn" type="button" data-jd-view="workspace">Back to Workspace</button>
    </div>
    <div class="ats-bars">
      ${model.metrics.map(metric => `
        <div class="ats-bar-item">
          <div class="ats-bar-label"><span>${metric.label}</span><span class="jd-metric-val ${metric.tone}">${metric.value}%</span></div>
          <div class="ats-bar-track"><div class="ats-bar-fill${metric.tone === 'warn' ? ' warn' : ''}" style="width:${metric.value}%"></div></div>
        </div>
      `).join('')}
    </div>
    <div class="ats-checklist">
      ${model.checks.map(check => `
        <div class="ats-check-row">
          <span class="check-ico jd-check-tone-${check.tone}">${check.tone === 'ok' ? '&#10003;' : check.tone === 'warn' ? '!' : '&#10007;'}</span>${check.text}
        </div>
      `).join('')}
    </div>
    <div class="match-result-card">
      <div class="match-kw-section">
        <div class="match-kw-heading">&#10003; Keywords found (${model.resume.found.length})</div>
        <div class="match-kw">
          ${model.resume.found.map(keyword => `<span class="match-kw-tag found">${keyword}</span>`).join('')}
        </div>
      </div>
      <div class="match-kw-section">
        <div class="match-kw-heading">&#10007; Missing keywords (${model.resume.miss.length})</div>
        <div class="match-kw">
          ${model.resume.miss.map(keyword => `<span class="match-kw-tag miss">${keyword}</span>`).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderResultState() {
  const resultHost = document.getElementById('jd-results');
  const mobileReportHost = document.getElementById('jd-mobile-report-content');
  const sheetBody = document.getElementById('mob-jd-sheet-body');

  if (!resultHost || !mobileReportHost || !sheetBody) return;

  if (!lastJDAnalysis || !getJDById(lastJDAnalysis.jdId)) {
    resultHost.innerHTML = getJDById(selectedJDId)
      ? renderEmptyState('Select a resume, then click <strong class="jd-inline-emphasis">Run Analysis</strong>.')
      : renderEmptyState('Add a JD to start matching resumes.');
    mobileReportHost.innerHTML = renderMobileReportEmpty();
    sheetBody.innerHTML = renderMobileSheetEmpty();
    return;
  }

  const model = getJDReportModel(lastJDAnalysis.resumeKey, lastJDAnalysis.jdId);
  resultHost.innerHTML = renderJDResultCard(model);
  mobileReportHost.innerHTML = renderMobileDetailedReport(model);
  sheetBody.innerHTML = renderMobileSheetSummary(model);
}

function clearJDAnalysis() {
  lastJDAnalysis = null;
  renderResultState();
  const sheet = document.getElementById('mob-jd-sheet');
  if (sheet) sheet.classList.remove('open');
}

function setMobJDView(view) {
  const workspaceTab = document.getElementById('mob-jd-tab-workspace');
  const reportTab = document.getElementById('mob-jd-tab-report');
  const pageBody = document.getElementById('jd-page-body');
  const sheet = document.getElementById('mob-jd-sheet');
  if (!workspaceTab || !reportTab || !pageBody) return;

  workspaceTab.classList.toggle('active', view === 'workspace');
  reportTab.classList.toggle('active', view === 'report');
  pageBody.classList.toggle('report-view', view === 'report');

  if (view === 'report' && sheet) sheet.classList.remove('open');
}

function toggleMobJDSheet() {
  const sheet = document.getElementById('mob-jd-sheet');
  if (sheet) sheet.classList.toggle('open');
}

function openMobJDReport() {
  const sheet = document.getElementById('mob-jd-sheet');
  if (sheet) sheet.classList.remove('open');
  setMobJDView('report');
}

function selectJD(id) {
  if (!getJDById(id)) return;
  selectedJDId = id;
  jdPage = getJDPageForId(id);
  renderJDLists();
  renderResumePicker();
  updateRunButton();
  clearJDAnalysis();
}

function selectResume(key) {
  selectedResume = key;
  renderResumePicker();
  updateRunButton();
  clearJDAnalysis();
}

function runJDAnalysis() {
  if (!selectedResume || !getJDById(selectedJDId)) return;
  lastJDAnalysis = { resumeKey: selectedResume, jdId: selectedJDId };
  renderResultState();

  if (isMobileViewport()) {
    setMobJDView('workspace');
    const sheet = document.getElementById('mob-jd-sheet');
    if (sheet) sheet.classList.add('open');
  }
}

function changeJDPage(delta) {
  const totalPages = getTotalJDPages();
  jdPage = Math.max(1, Math.min(totalPages, jdPage + delta));
  renderJDLists();
}

function renameJD(id) {
  const jd = getJDById(id);
  if (!jd) return;

  const nextName = window.prompt('Edit JD name', jd.title);
  if (!nextName || !nextName.trim()) return;

  jd.title = nextName.trim();
  renderJDLists();
  renderResultState();
}

function downloadJD(id) {
  const jd = getJDById(id);
  if (!jd) return;

  const blob = new Blob([jd.parsedText], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${jd.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_jd.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function deleteJD(id) {
  JD_DATA = JD_DATA.filter(jd => jd.id !== id);

  if (lastJDAnalysis && lastJDAnalysis.jdId === id) lastJDAnalysis = null;
  ensureSelectedJD();
  jdPage = Math.min(jdPage, getTotalJDPages());
  if (selectedJDId) jdPage = getJDPageForId(selectedJDId);

  renderJDLists();
  renderResumePicker();
  updateRunButton();
  renderResultState();
}

function buildParsedJDPreview(fileName) {
  return [
    `Parsed JD preview from ${fileName}`,
    '',
    'Senior Software Engineer',
    'Imported Company',
    '',
    'Responsibilities',
    '- Build scalable product features and internal tooling',
    '- Collaborate with product, design, and engineering stakeholders',
    '- Improve performance, system reliability, and developer velocity',
    '',
    'Requirements',
    '- Strong software engineering fundamentals',
    '- Experience with APIs, cloud systems, and cross-functional delivery',
  ].join('\n');
}

function showJDModal(mode) {
  const overlay = document.getElementById('jd-modal-overlay');
  if (!overlay) return;

  lastJDUploadName = '';
  overlay.classList.add('open');
  resetJDModal();
  if (mode) setJDModalMode(mode);
}

function closeJDModal() {
  const overlay = document.getElementById('jd-modal-overlay');
  if (!overlay) return;

  overlay.classList.remove('open');
  lastJDUploadName = '';
  resetJDModal();
}

function resetJDModal() {
  const uploadZone = document.getElementById('jd-modal-upload-zone');
  const uploadButton = document.getElementById('jd-modal-upload-btn');
  const pasteArea = document.getElementById('jd-modal-paste-area');
  const pasteButton = document.getElementById('jd-modal-paste-btn');
  const uploadInput = document.getElementById('jd-upload-input');
  const uploadText = document.getElementById('jd-upload-text');

  if (uploadZone) uploadZone.classList.remove('active');
  if (uploadButton) uploadButton.classList.remove('active');
  if (pasteArea) {
    pasteArea.classList.remove('active');
    pasteArea.value = '';
  }
  if (pasteButton) pasteButton.classList.remove('active');
  if (uploadInput) uploadInput.value = '';
  if (uploadText) uploadText.textContent = 'Drag & drop your JD PDF here, or click to browse';
}

function setJDModalMode(mode) {
  resetJDModal();

  const uploadZone = document.getElementById('jd-modal-upload-zone');
  const uploadButton = document.getElementById('jd-modal-upload-btn');
  const pasteArea = document.getElementById('jd-modal-paste-area');
  const pasteButton = document.getElementById('jd-modal-paste-btn');

  if (mode === 'upload') {
    if (uploadZone) uploadZone.classList.add('active');
    if (uploadButton) uploadButton.classList.add('active');
  } else if (mode === 'paste') {
    if (pasteArea) pasteArea.classList.add('active');
    if (pasteButton) pasteButton.classList.add('active');
  }
}

function handleJDFileSelect() {
  const uploadInput = document.getElementById('jd-upload-input');
  const pasteArea = document.getElementById('jd-modal-paste-area');
  const pasteButton = document.getElementById('jd-modal-paste-btn');
  if (!uploadInput || !pasteArea || !pasteButton || !uploadInput.files || !uploadInput.files[0]) return;

  lastJDUploadName = uploadInput.files[0].name;
  setJDModalMode('paste');
  pasteArea.value = buildParsedJDPreview(lastJDUploadName);
  pasteButton.classList.add('active');
  pasteArea.focus();
}

function handleJDUpload() {
  const uploadInput = document.getElementById('jd-upload-input');
  const pasteArea = document.getElementById('jd-modal-paste-area');
  if (!uploadInput) return;

  if (!uploadInput.files || !uploadInput.files[0]) {
    uploadInput.click();
    return;
  }

  if (!pasteArea || !pasteArea.value.trim()) {
    handleJDFileSelect();
    return;
  }

  pasteArea.focus();
}

function buildJDFromText(text, sourceName) {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  const rawTitle = sourceName
    ? sourceName.replace(/\.[^.]+$/, '')
    : lines[0] || `Imported JD ${JD_DATA.length + 1}`;
  const title = rawTitle.slice(0, 38);
  const company = (lines[1] && lines[1].length <= 28 ? lines[1] : 'Imported Company') || 'Imported Company';

  return {
    id: Math.max(0, ...JD_DATA.map(jd => jd.id)) + 1,
    title,
    company,
    type: 'Imported',
    badge: 'Newly added',
    parsedText: text,
  };
}

function handleJDPaste() {
  const pasteArea = document.getElementById('jd-modal-paste-area');
  if (!pasteArea) return;

  if (!pasteArea.value.trim()) {
    pasteArea.focus();
    return;
  }

  const nextJD = buildJDFromText(pasteArea.value.trim(), lastJDUploadName);
  JD_DATA.unshift(nextJD);
  selectedJDId = nextJD.id;
  jdPage = getJDPageForId(nextJD.id);

  closeJDModal();
  renderJDLists();
  renderResumePicker();
  updateRunButton();
  clearJDAnalysis();
}

function bindJDPageEvents() {
  const cards = document.getElementById('jd-cards');
  const resumeList = document.getElementById('jd-resume-list');
  const prev = document.getElementById('jd-prev');
  const next = document.getElementById('jd-next');
  const run = document.getElementById('jd-run-btn');
  const add = document.getElementById('jd-add-btn');
  const uploadInput = document.getElementById('jd-upload-input');
  const uploadButton = document.getElementById('jd-modal-upload-btn');
  const pasteButton = document.getElementById('jd-modal-paste-btn');

  if (cards) {
    cards.addEventListener('click', event => {
      const action = event.target.closest('[data-jd-action]');
      if (action) {
        event.stopPropagation();
        const id = Number(action.dataset.jdId);
        switch (action.dataset.jdAction) {
          case 'rename':
            renameJD(id);
            break;
          case 'download':
            downloadJD(id);
            break;
          case 'delete':
            deleteJD(id);
            break;
          default:
            break;
        }
        return;
      }

      const card = event.target.closest('[data-jd-card]');
      if (card) selectJD(Number(card.dataset.jdId));
    });
  }

  if (resumeList) {
    resumeList.addEventListener('click', event => {
      const choice = event.target.closest('[data-resume-choice]');
      if (choice) selectResume(choice.dataset.resumeChoice);
    });
  }

  if (prev) prev.addEventListener('click', () => changeJDPage(-1));
  if (next) next.addEventListener('click', () => changeJDPage(1));
  if (run) run.addEventListener('click', runJDAnalysis);
  if (add) add.addEventListener('click', () => showJDModal());
  if (uploadInput) uploadInput.addEventListener('change', handleJDFileSelect);
  if (uploadButton) uploadButton.addEventListener('click', handleJDUpload);
  if (pasteButton) pasteButton.addEventListener('click', handleJDPaste);

  document.addEventListener('click', event => {
    const viewTrigger = event.target.closest('[data-jd-view]');
    if (viewTrigger) {
      setMobJDView(viewTrigger.dataset.jdView);
      return;
    }

    if (event.target.closest('[data-jd-sheet-toggle]')) {
      toggleMobJDSheet();
      return;
    }

    if (event.target.closest('#jd-modal-close')) {
      closeJDModal();
      return;
    }

    const modalMode = event.target.closest('[data-jd-modal-mode]');
    if (modalMode) {
      setJDModalMode(modalMode.dataset.jdModalMode);
      return;
    }

    if (event.target.closest('[data-jd-upload-zone]')) {
      const input = document.getElementById('jd-upload-input');
      if (input) input.click();
      return;
    }

    if (event.target.closest('[data-jd-report-open]')) {
      openMobJDReport();
      return;
    }

    const overlay = document.getElementById('jd-modal-overlay');
    if (overlay && event.target === overlay) {
      closeJDModal();
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  bindJDPageEvents();
  renderJDLists();
  renderResumePicker();
  updateRunButton();
  renderResultState();
  setMobJDView('workspace');
});
