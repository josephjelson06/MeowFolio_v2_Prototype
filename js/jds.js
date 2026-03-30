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
let mobSelectedResume = null;
let lastMobJDAnalysis = null;
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

function renderEmptyState(message) {
  return `
    <div class="jd-no-result">
      <div class="jd-no-result-icon">&#9678;</div>
      <div class="jd-no-result-txt">${message}</div>
    </div>
  `;
}

function renderJDResultCard(resumeKey, jdId) {
  const resume = RESUME_DATA[resumeKey];
  const jd = getJDById(jdId);
  if (!resume || !jd) return renderEmptyState('Select a valid JD and resume to view the match report.');

  const scoreColor = resume.cls === 'high' ? 'var(--accent)' : resume.cls === 'mid' ? 'var(--warn)' : 'var(--err)';

  return `
    <div class="match-result-card">
      <div class="match-res-header">
        <div class="match-res-info">
          <div class="match-res-label">Resume vs Job Description</div>
          <div class="match-res-name">${resumeKey}</div>
          <div style="font-size:10px;color:var(--txt2);margin-top:2px">${jd.title} &middot; ${jd.company}</div>
        </div>
        <div class="match-score-badge">
          <div class="match-score ${resume.cls}">${resume.score}%</div>
          <div class="match-score-label">match score</div>
        </div>
      </div>
      <div class="match-bar-track">
        <div class="match-bar-fill" style="width:${resume.score}%;background:${scoreColor}"></div>
      </div>
      <div class="match-kw-section">
        <div class="match-kw-heading">&#10003; Keywords found (${resume.found.length})</div>
        <div class="match-kw">
          ${resume.found.map(keyword => `<span class="match-kw-tag found">${keyword}</span>`).join('')}
        </div>
      </div>
      <div class="match-kw-section">
        <div class="match-kw-heading">&#10007; Missing keywords (${resume.miss.length})</div>
        <div class="match-kw">
          ${resume.miss.map(keyword => `<span class="match-kw-tag miss">${keyword}</span>`).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderDesktopJDCard(jd) {
  return `
    <div class="jd-card${jd.id === selectedJDId ? ' active' : ''}" data-jd="${jd.id}" onclick="selectJD(${jd.id})">
      <div class="jd-card-title">${jd.title}</div>
      <div class="jd-card-co">${jd.company} &middot; ${jd.type}</div>
      <div class="jd-card-foot">
        <span class="jd-card-badge">${jd.badge}</span>
        <div class="jd-card-actions">
          <button class="r-action" onclick="renameJD(${jd.id}, event)">Rename</button>
          <button class="r-action" onclick="downloadJD(${jd.id}, event)">&#11015;</button>
          <button class="r-action" style="border-color:var(--err);color:var(--err)" onclick="deleteJD(${jd.id}, event)">&#128465;</button>
        </div>
      </div>
    </div>
  `;
}

function renderMobileJDCard(jd) {
  return `
    <div class="mob-jd-card${jd.id === selectedJDId ? ' active' : ''}" data-jd="${jd.id}" onclick="selectMobJD(${jd.id})">
      <div class="mob-jd-title">${jd.title}</div>
      <div class="mob-jd-co">${jd.company} &middot; ${jd.type}</div>
      <div class="mob-jd-action">
        <button class="r-action primary" onclick="prepareMobJDAnalysis(${jd.id}, event)">Analyze Match</button>
        <button class="r-action" onclick="renameJD(${jd.id}, event)">Rename</button>
        <button class="r-action" onclick="downloadJD(${jd.id}, event)">&#11015;</button>
        <button class="r-action" style="border-color:var(--err);color:var(--err)" onclick="deleteJD(${jd.id}, event)">&#128465;</button>
      </div>
    </div>
  `;
}

function renderJDPagination() {
  const totalPages = getTotalJDPages();
  const desktopPage = document.getElementById('desktop-jd-page');
  const mobilePage = document.getElementById('mobile-jd-page');
  const desktopPrev = document.getElementById('desktop-jd-prev');
  const desktopNext = document.getElementById('desktop-jd-next');
  const mobilePrev = document.getElementById('mobile-jd-prev');
  const mobileNext = document.getElementById('mobile-jd-next');

  if (desktopPage) desktopPage.textContent = `Page ${jdPage} of ${totalPages}`;
  if (mobilePage) mobilePage.textContent = `Page ${jdPage} of ${totalPages}`;
  if (desktopPrev) desktopPrev.disabled = jdPage === 1;
  if (desktopNext) desktopNext.disabled = jdPage === totalPages;
  if (mobilePrev) mobilePrev.disabled = jdPage === 1;
  if (mobileNext) mobileNext.disabled = jdPage === totalPages;
}

function renderJDLists() {
  ensureSelectedJD();

  const desktopCount = document.getElementById('desktop-jd-count');
  const mobileCount = document.getElementById('mobile-jd-count');
  const desktopCards = document.getElementById('desktop-jd-cards');
  const mobileCards = document.getElementById('mobile-jd-list');
  const pageItems = getCurrentJDPageItems();

  if (desktopCount) desktopCount.textContent = `${JD_DATA.length} JDs`;
  if (mobileCount) mobileCount.textContent = `${JD_DATA.length} JDs`;

  if (desktopCards) {
    desktopCards.innerHTML = pageItems.length
      ? pageItems.map(renderDesktopJDCard).join('')
      : renderEmptyState('No saved JDs yet. Add one to begin matching.');
  }

  if (mobileCards) {
    mobileCards.innerHTML = pageItems.length
      ? pageItems.map(renderMobileJDCard).join('')
      : renderEmptyState('No saved JDs yet. Add one to begin matching.');
  }

  renderJDPagination();
  updateJDTitles();
}

function renderResumePickers() {
  const desktopList = document.getElementById('desktop-jd-resume-list');
  const mobileList = document.getElementById('mobile-jd-resume-list');
  const keys = Object.keys(RESUME_DATA);

  if (desktopList) {
    desktopList.innerHTML = keys.map(key => `
      <div class="jd-pick-item${selectedResume === key ? ' selected' : ''}" data-resume="${key}" onclick="selectResume('${key}')">
        <div class="jd-pick-radio"><div class="jd-pick-radio-dot"></div></div>
        <span class="jd-pick-label">${key}</span>
      </div>
    `).join('');
  }

  if (mobileList) {
    mobileList.innerHTML = keys.map(key => `
      <div class="jd-pick-item${mobSelectedResume === key ? ' selected' : ''}" data-mob-resume="${key}" onclick="selectMobResume('${key}')">
        <div class="jd-pick-radio"><div class="jd-pick-radio-dot"></div></div>
        <span class="jd-pick-label">${key}</span>
      </div>
    `).join('');
  }
}

function updateJDTitles() {
  const jd = getJDById(selectedJDId);
  const desktopTitle = document.getElementById('desktop-jd-title');
  const mobileTitle = document.getElementById('mob-jd-selected-title');
  const mobileSub = document.querySelector('.mob-jd-panel-sub');

  if (!jd) {
    if (desktopTitle) desktopTitle.textContent = 'No saved JDs';
    if (mobileTitle) mobileTitle.textContent = 'No saved JDs';
    if (mobileSub) mobileSub.textContent = 'Add a JD from the button above to continue matching resumes.';
    return;
  }

  if (desktopTitle) desktopTitle.textContent = `${jd.title} - ${jd.company}`;
  if (mobileTitle) mobileTitle.textContent = `${jd.title} - ${jd.company}`;
  if (mobileSub) mobileSub.textContent = 'Choose a resume and run the same match workflow available on desktop.';
}

function updateRunButtons() {
  const desktopRun = document.getElementById('jd-run-btn');
  const mobileRun = document.getElementById('mob-jd-run-btn');
  const hasJD = Boolean(getJDById(selectedJDId));

  if (desktopRun) desktopRun.disabled = !selectedResume || !hasJD;
  if (mobileRun) mobileRun.disabled = !mobSelectedResume || !hasJD;
}

function clearJDResults() {
  const results = document.getElementById('jd-results');
  if (!results) return;

  results.innerHTML = getJDById(selectedJDId)
    ? renderEmptyState('Select a resume on the left,<br>then click <strong style="color:var(--txt1)">Run Analysis</strong>')
    : renderEmptyState('Add a JD to start matching resumes.');
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
    scoreColor,
    metrics: [
      { label: 'Keyword coverage', value: keywordCoverage, tone: keywordCoverage >= 70 ? 'var(--accent)' : 'var(--warn)' },
      { label: 'Role alignment', value: roleAlignment, tone: roleAlignment >= 70 ? 'var(--accent)' : 'var(--warn)' },
      { label: 'Seniority fit', value: seniorityFit, tone: seniorityFit >= 70 ? 'var(--accent)' : 'var(--warn)' },
      { label: 'Impact readiness', value: impactReadiness, tone: impactReadiness >= 70 ? 'var(--accent)' : 'var(--warn)' },
    ],
    checks: [
      { tone: 'ok', text: `Matched ${resume.found.length} high-signal keywords from the JD` },
      { tone: resume.score >= 70 ? 'ok' : 'warn', text: 'Resume structure is clear enough for recruiter review' },
      { tone: resume.miss.length <= 2 ? 'warn' : 'bad', text: `Address ${resume.miss.length} missing keyword gaps before applying` },
      { tone: resume.cls === 'low' ? 'bad' : 'warn', text: 'Tailor the summary and experience bullets to this exact role' },
    ],
  };
}

function renderMobJDReportEmpty() {
  return `
    <div class="mob-jd-panel">
      <div class="jd-no-result" style="min-height:240px">
        <div class="jd-no-result-icon">&#9678;</div>
        <div class="jd-no-result-txt">Run a JD analysis from the workspace tab to view the detailed report.</div>
      </div>
    </div>
  `;
}

function renderMobJDSummary(model) {
  return `
    <div style="display:flex;align-items:baseline;gap:6px;margin-bottom:4px">
      <span style="font-size:32px;font-weight:600;font-family:var(--font);color:${model.scoreColor}">${model.resume.score}</span>
      <span style="font-size:10px;color:var(--txt2)">match score</span>
    </div>
    <div style="font-size:11px;color:var(--txt1);margin-bottom:12px">${model.verdict}</div>
    <div class="mob-jd-sheet-metrics">
      ${model.metrics.slice(0, 3).map(metric => `
        <div class="ats-bar-item">
          <div class="ats-bar-label"><span>${metric.label}</span><span style="font-family:var(--font);color:${metric.tone}">${metric.value}%</span></div>
          <div class="ats-bar-track"><div class="ats-bar-fill${metric.tone === 'var(--warn)' ? ' warn' : ''}" style="width:${metric.value}%"></div></div>
        </div>
      `).join('')}
    </div>
    <div class="audit-head" style="font-size:9px;text-transform:uppercase;letter-spacing:0.5px;color:var(--txt2);margin:14px 0 6px">Top matched keywords</div>
    <div class="mob-jd-sheet-tags">
      ${model.resume.found.slice(0, 4).map(keyword => `<span class="match-kw-tag found">${keyword}</span>`).join('')}
    </div>
    <button class="analyze-btn" style="width:100%;margin-top:14px" onclick="openMobJDReport()">Open detailed JD report</button>
  `;
}

function renderMobJDDetailedReport(model) {
  return `
    <div class="ats-score-card mob-ats-score-card">
      <div class="ats-score-num" style="color:${model.scoreColor}">${model.resume.score}</div>
      <div class="ats-score-info">
        <div class="ats-score-label">${model.verdict}</div>
        <div class="ats-score-desc">${model.resumeKey} &middot; ${model.jd.title} &middot; ${model.jd.company}</div>
      </div>
      <button class="analyze-btn" onclick="setMobJDView('workspace')">Back to Workspace</button>
    </div>
    <div class="ats-bars">
      ${model.metrics.map(metric => `
        <div class="ats-bar-item">
          <div class="ats-bar-label"><span>${metric.label}</span><span style="font-family:var(--font);color:${metric.tone}">${metric.value}%</span></div>
          <div class="ats-bar-track"><div class="ats-bar-fill${metric.tone === 'var(--warn)' ? ' warn' : ''}" style="width:${metric.value}%"></div></div>
        </div>
      `).join('')}
    </div>
    <div class="ats-checklist">
      ${model.checks.map(check => `
        <div class="ats-check-row">
          <span class="check-ico" style="background:${check.tone === 'ok' ? 'var(--accent-bg)' : check.tone === 'warn' ? 'var(--warn-bg)' : 'var(--err-bg)'};color:${check.tone === 'ok' ? 'var(--accent)' : check.tone === 'warn' ? 'var(--warn)' : 'var(--err)'}">${check.tone === 'ok' ? '&#10003;' : check.tone === 'warn' ? '!' : '&#10007;'}</span>${check.text}
        </div>
      `).join('')}
    </div>
    <div class="mob-jd-panel">
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

function renderMobJDReportState() {
  const reportContent = document.getElementById('mob-jd-report-content');
  const sheetBody = document.getElementById('mob-jd-sheet-body');
  if (!reportContent || !sheetBody) return;

  if (!lastMobJDAnalysis || !getJDById(lastMobJDAnalysis.jdId)) {
    reportContent.innerHTML = renderMobJDReportEmpty();
    sheetBody.innerHTML = `
      <div class="jd-no-result" style="min-height:180px">
        <div class="jd-no-result-icon">&#9678;</div>
        <div class="jd-no-result-txt">Run a JD analysis to preview the report summary here.</div>
      </div>
    `;
    return;
  }

  const model = getJDReportModel(lastMobJDAnalysis.resumeKey, lastMobJDAnalysis.jdId);
  reportContent.innerHTML = renderMobJDDetailedReport(model);
  sheetBody.innerHTML = renderMobJDSummary(model);
}

function setMobJDView(view) {
  const workspaceTab = document.getElementById('mob-jd-tab-workspace');
  const reportTab = document.getElementById('mob-jd-tab-report');
  const workspaceMode = document.getElementById('mob-jd-workspace-mode');
  const reportMode = document.getElementById('mob-jd-report-mode');
  if (!workspaceTab || !reportTab || !workspaceMode || !reportMode) return;

  workspaceTab.classList.toggle('active', view === 'workspace');
  reportTab.classList.toggle('active', view === 'report');
  workspaceMode.classList.toggle('hidden', view !== 'workspace');
  reportMode.classList.toggle('hidden', view !== 'report');

  if (view === 'report') {
    const sheet = document.getElementById('mob-jd-sheet');
    if (sheet) sheet.classList.remove('open');
  }
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

function clearMobJDResults() {
  lastMobJDAnalysis = null;
  renderMobJDReportState();
  const sheet = document.getElementById('mob-jd-sheet');
  if (sheet) sheet.classList.remove('open');
}

function selectJD(id) {
  if (!getJDById(id)) return;
  selectedJDId = id;
  jdPage = getJDPageForId(id);
  renderJDLists();
  renderResumePickers();
  updateRunButtons();
  clearJDResults();
  clearMobJDResults();
}

function selectMobJD(id) {
  selectJD(id);
  const panel = document.getElementById('mob-jd-selected-title');
  if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function selectResume(key) {
  selectedResume = key;
  renderResumePickers();
  updateRunButtons();
  clearJDResults();
}

function selectMobResume(key) {
  mobSelectedResume = key;
  renderResumePickers();
  updateRunButtons();
  clearMobJDResults();
}

function runJDAnalysis() {
  if (!selectedResume || !getJDById(selectedJDId)) return;
  const results = document.getElementById('jd-results');
  if (results) results.innerHTML = renderJDResultCard(selectedResume, selectedJDId);
}

function runMobJDAnalysis() {
  if (!mobSelectedResume || !getJDById(selectedJDId)) return;
  lastMobJDAnalysis = { resumeKey: mobSelectedResume, jdId: selectedJDId };
  renderMobJDReportState();
  const sheet = document.getElementById('mob-jd-sheet');
  if (sheet) sheet.classList.add('open');
}

function changeJDPage(delta) {
  const totalPages = getTotalJDPages();
  jdPage = Math.max(1, Math.min(totalPages, jdPage + delta));
  renderJDLists();
}

function renameJD(id, e) {
  if (e) e.stopPropagation();
  const jd = getJDById(id);
  if (!jd) return;

  const nextName = window.prompt('Edit JD name', jd.title);
  if (!nextName || !nextName.trim()) return;

  jd.title = nextName.trim();
  renderJDLists();
  if (selectedResume && selectedJDId === id) runJDAnalysis();
  if (lastMobJDAnalysis && lastMobJDAnalysis.jdId === id) renderMobJDReportState();
}

function downloadJD(id, e) {
  if (e) e.stopPropagation();
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

function deleteJD(id, e) {
  if (e) e.stopPropagation();
  JD_DATA = JD_DATA.filter(jd => jd.id !== id);

  if (lastMobJDAnalysis && lastMobJDAnalysis.jdId === id) lastMobJDAnalysis = null;
  ensureSelectedJD();
  jdPage = Math.min(jdPage, getTotalJDPages());
  if (selectedJDId) jdPage = getJDPageForId(selectedJDId);

  renderJDLists();
  renderResumePickers();
  updateRunButtons();
  clearJDResults();
  renderMobJDReportState();
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

  const nextJD = buildJDFromText(
    pasteArea.value.trim(),
    lastJDUploadName
  );

  JD_DATA.unshift(nextJD);
  selectedJDId = nextJD.id;
  jdPage = getJDPageForId(nextJD.id);
  closeJDModal();
  renderJDLists();
  renderResumePickers();
  updateRunButtons();
  clearJDResults();
  clearMobJDResults();
}

document.addEventListener('DOMContentLoaded', () => {
  renderJDLists();
  renderResumePickers();
  updateRunButtons();
  clearJDResults();
  clearMobJDResults();
  setMobJDView('workspace');
});
