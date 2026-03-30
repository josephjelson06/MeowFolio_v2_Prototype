const JD_DATA = [
  { id: 0, title: 'Software Engineer II', company: 'Google', type: 'Full-time' },
  { id: 1, title: 'Senior Frontend Dev', company: 'Razorpay', type: 'Full-time' },
  { id: 2, title: 'ML Engineer', company: 'OpenAI', type: 'Remote' },
];

const RESUME_DATA = {
  resume_v3: { score: 87, cls: 'high', found: ['Python', 'React', 'REST API', 'scalable', 'cloud'], miss: ['Kubernetes', 'Go'] },
  resume_sde: { score: 62, cls: 'mid', found: ['React', 'Node.js', 'REST'], miss: ['Python', 'System design', 'scalable'] },
  resume_pm: { score: 31, cls: 'low', found: ['communication'], miss: ['Python', 'React', 'backend', 'APIs'] },
  resume_ds: { score: 78, cls: 'high', found: ['Python', 'AWS', 'data pipelines'], miss: ['React', 'Node.js'] },
  resume_ml: { score: 55, cls: 'mid', found: ['Python', 'ML', 'TensorFlow', 'AWS'], miss: ['React', 'Node.js', 'REST API'] },
};

const deletedJDIds = new Set();
let selectedJD = 0;
let selectedResume = null;
let mobSelectedJD = 0;
let mobSelectedResume = null;
let lastMobJDAnalysis = null;

function isJDAvailable(idx) {
  return JD_DATA.some(jd => jd.id === idx) && !deletedJDIds.has(idx);
}

function getFirstAvailableJD() {
  const nextJD = JD_DATA.find(jd => !deletedJDIds.has(jd.id));
  return nextJD ? nextJD.id : null;
}

function getJDById(idx) {
  return JD_DATA.find(jd => jd.id === idx);
}

function getJDReportModel(resumeKey, jdIdx) {
  const resume = RESUME_DATA[resumeKey];
  const jd = getJDById(jdIdx);
  const totalKeywords = resume.found.length + resume.miss.length || 1;
  const keywordCoverage = Math.round((resume.found.length / totalKeywords) * 100);
  const roleAlignment = Math.max(28, Math.min(96, Math.round((resume.score + keywordCoverage) / 2)));
  const seniorityFit = Math.max(24, Math.min(94, resume.score + (jdIdx === 1 ? 8 : jdIdx === 2 ? 4 : 6)));
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

  if (!lastMobJDAnalysis) {
    reportContent.innerHTML = renderMobJDReportEmpty();
    sheetBody.innerHTML = `
      <div class="jd-no-result" style="min-height:180px">
        <div class="jd-no-result-icon">&#9678;</div>
        <div class="jd-no-result-txt">Run a JD analysis to preview the report summary here.</div>
      </div>
    `;
    return;
  }

  const model = getJDReportModel(lastMobJDAnalysis.resumeKey, lastMobJDAnalysis.jdIdx);
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

function syncJDSelectionAfterDelete() {
  const nextJD = getFirstAvailableJD();

  if (nextJD === null) {
    const desktopTitle = document.querySelector('.jd-analyze-title');
    const mobileTitle = document.getElementById('mob-jd-selected-title');
    const mobileSub = document.querySelector('.mob-jd-panel-sub');

    if (desktopTitle) desktopTitle.textContent = 'No saved JDs';
    if (mobileTitle) mobileTitle.textContent = 'No saved JDs';
    if (mobileSub) mobileSub.textContent = 'Add a JD from the button above to continue matching resumes.';

    const desktopResults = document.getElementById('jd-results');
    if (desktopResults) desktopResults.innerHTML = renderEmptyState('Add a JD to start matching resumes.');
    lastMobJDAnalysis = null;
    renderMobJDReportState();
    setMobJDView('workspace');
  } else {
    if (!isJDAvailable(selectedJD)) selectJD(nextJD);
    if (!isJDAvailable(mobSelectedJD)) selectMobJD(nextJD);
  }

  updateRunBtn();
  updateMobRunBtn();
}

function downloadJD(idx, e) {
  if (e) e.stopPropagation();
  if (!isJDAvailable(idx)) return;

  const jd = JD_DATA.find(item => item.id === idx);
  if (!jd) return;

  const text = [
    jd.title,
    `${jd.company} - ${jd.type}`,
    '',
    'Responsibilities',
    '- Build and ship high-quality product features',
    '- Collaborate with cross-functional stakeholders',
    '- Improve performance, reliability, and scalability',
    '',
    'Qualifications',
    '- Strong communication and execution skills',
    '- Relevant domain experience for the role',
  ].join('\n');

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${jd.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_jd.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

function deleteJD(idx, e) {
  if (e) e.stopPropagation();
  if (!isJDAvailable(idx)) return;

  deletedJDIds.add(idx);
  document.querySelectorAll(`.jd-card[data-jd="${idx}"], .mob-jd-card[data-jd="${idx}"]`).forEach(card => card.remove());
  syncJDSelectionAfterDelete();
}

function showJDModal(mode) {
  const overlay = document.getElementById('jd-modal-overlay');
  if (!overlay) return;

  overlay.classList.add('open');
  resetJDModal();
  if (mode) setJDModalMode(mode);
}

function closeJDModal() {
  const overlay = document.getElementById('jd-modal-overlay');
  if (!overlay) return;

  overlay.classList.remove('open');
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
  const uploadText = document.getElementById('jd-upload-text');

  if (!uploadInput || !uploadText) return;
  uploadText.textContent = uploadInput.files && uploadInput.files[0]
    ? `Selected: ${uploadInput.files[0].name}`
    : 'Drag & drop your JD PDF here, or click to browse';
}

function handleJDUpload() {
  const uploadInput = document.getElementById('jd-upload-input');
  if (!uploadInput) return;

  if (!uploadInput.files || !uploadInput.files[0]) {
    uploadInput.click();
    return;
  }

  closeJDModal();
}

function handleJDPaste() {
  const pasteArea = document.getElementById('jd-modal-paste-area');
  if (!pasteArea) return;

  if (!pasteArea.value.trim()) {
    pasteArea.focus();
    return;
  }

  closeJDModal();
}

function renderJDResultCard(resumeKey, jdIdx) {
  const resume = RESUME_DATA[resumeKey];
  const jd = JD_DATA[jdIdx];
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

function renderEmptyState(message) {
  return `
    <div class="jd-no-result">
      <div class="jd-no-result-icon">&#9678;</div>
      <div class="jd-no-result-txt">${message}</div>
    </div>
  `;
}

function selectJD(idx) {
  if (!isJDAvailable(idx)) return;
  selectedJD = idx;
  document.querySelectorAll('.jd-card').forEach(card => {
    card.classList.toggle('active', Number(card.dataset.jd) === idx);
  });

  const title = document.querySelector('.jd-analyze-title');
  if (title) title.textContent = `${JD_DATA[idx].title} - ${JD_DATA[idx].company}`;
  clearJDResults();
}

function selectResume(key) {
  selectedResume = key;
  document.querySelectorAll('.jd-pick-item').forEach(item => {
    item.classList.toggle('selected', item.dataset.resume === key);
  });
  updateRunBtn();
  clearJDResults();
}

function updateRunBtn() {
  const button = document.getElementById('jd-run-btn');
  if (button) button.disabled = !selectedResume || !isJDAvailable(selectedJD);
}

function runJDAnalysis() {
  if (!selectedResume || !isJDAvailable(selectedJD)) return;
  const results = document.getElementById('jd-results');
  if (results) results.innerHTML = renderJDResultCard(selectedResume, selectedJD);
}

function clearJDResults() {
  const results = document.getElementById('jd-results');
  if (results) {
    results.innerHTML = renderEmptyState('Select a resume on the left,<br>then click <strong style="color:var(--txt1)">Run Analysis</strong>');
  }
}

function selectMobJD(idx) {
  if (!isJDAvailable(idx)) return;
  mobSelectedJD = idx;
  document.querySelectorAll('.mob-jd-card').forEach(card => {
    card.classList.toggle('active', Number(card.dataset.jd) === idx);
  });

  const title = document.getElementById('mob-jd-selected-title');
  if (title) title.textContent = `${JD_DATA[idx].title} - ${JD_DATA[idx].company}`;
  clearMobJDResults();
}

function selectMobResume(key) {
  mobSelectedResume = key;
  document.querySelectorAll('[data-mob-resume]').forEach(item => {
    item.classList.toggle('selected', item.dataset.mobResume === key);
  });
  updateMobRunBtn();
  clearMobJDResults();
}

function updateMobRunBtn() {
  const button = document.getElementById('mob-jd-run-btn');
  if (button) button.disabled = !mobSelectedResume || !isJDAvailable(mobSelectedJD);
}

function runMobJDAnalysis() {
  if (!mobSelectedResume || !isJDAvailable(mobSelectedJD)) return;
  lastMobJDAnalysis = { resumeKey: mobSelectedResume, jdIdx: mobSelectedJD };
  renderMobJDReportState();
  const sheet = document.getElementById('mob-jd-sheet');
  if (sheet) sheet.classList.add('open');
}

function clearMobJDResults() {
  lastMobJDAnalysis = null;
  renderMobJDReportState();
  const sheet = document.getElementById('mob-jd-sheet');
  if (sheet) sheet.classList.remove('open');
}

function prepareMobJDAnalysis(idx, e) {
  if (e) e.stopPropagation();
  selectMobJD(idx);
  const panel = document.getElementById('mob-jd-selected-title');
  if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function editMobJD(idx, e) {
  if (e) e.stopPropagation();
  selectMobJD(idx);
  showJDModal('paste');
}

document.addEventListener('DOMContentLoaded', () => {
  updateRunBtn();
  updateMobRunBtn();
  clearJDResults();
  clearMobJDResults();
  setMobJDView('workspace');
});
