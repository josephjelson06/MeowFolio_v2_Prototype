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

let selectedJD = 0;
let selectedResume = null;
let mobSelectedJD = 0;
let mobSelectedResume = null;

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
  selectedJD = idx;
  document.querySelectorAll('.jd-card').forEach((card, cardIdx) => {
    card.classList.toggle('active', cardIdx === idx);
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
  if (button) button.disabled = !selectedResume;
}

function runJDAnalysis() {
  if (!selectedResume) return;
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
  if (button) button.disabled = !mobSelectedResume;
}

function runMobJDAnalysis() {
  if (!mobSelectedResume) return;
  const results = document.getElementById('mob-jd-results');
  if (results) results.innerHTML = renderJDResultCard(mobSelectedResume, mobSelectedJD);
}

function clearMobJDResults() {
  const results = document.getElementById('mob-jd-results');
  if (results) {
    results.innerHTML = renderEmptyState('Pick a resume above, then tap <strong style="color:var(--txt1)">Run</strong>.');
  }
}

function focusMobJDInput() {
  const input = document.getElementById('mob-jd-paste-area');
  if (input) {
    input.focus();
    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
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
  focusMobJDInput();
}

document.addEventListener('DOMContentLoaded', () => {
  updateRunBtn();
  updateMobRunBtn();
  clearJDResults();
  clearMobJDResults();
});
