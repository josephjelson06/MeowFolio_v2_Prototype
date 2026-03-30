/* ── JD PAGE: 1 JD vs 1 Resume ── */

const JD_DATA = [
  { id: 0, title: 'Software Engineer II', company: 'Google', type: 'Full-time' },
  { id: 1, title: 'Senior Frontend Dev',  company: 'Razorpay', type: 'Full-time' },
  { id: 2, title: 'ML Engineer',          company: 'OpenAI', type: 'Remote' },
];

const RESUME_DATA = {
  'resume_v3':  { score: 87, cls: 'high', found: ['Python','React','REST API','scalable','cloud'],        miss: ['Kubernetes','Go'] },
  'resume_sde': { score: 62, cls: 'mid',  found: ['React','Node.js','REST'],                              miss: ['Python','System design','scalable'] },
  'resume_pm':  { score: 31, cls: 'low',  found: ['communication'],                                       miss: ['Python','React','backend','APIs'] },
  'resume_ds':  { score: 78, cls: 'high', found: ['Python','AWS','data pipelines'],                       miss: ['React','Node.js'] },
  'resume_ml':  { score: 55, cls: 'mid',  found: ['Python','ML','TensorFlow','AWS'],                      miss: ['React','Node.js','REST API'] },
};

let selectedJD     = 0;   // index into JD_DATA
let selectedResume = null; // key into RESUME_DATA

/* Select a JD card */
function selectJD(idx) {
  selectedJD = idx;
  document.querySelectorAll('.jd-card').forEach((c, i) => c.classList.toggle('active', i === idx));
  document.querySelector('.jd-analyze-title').textContent =
    `${JD_DATA[idx].title} — ${JD_DATA[idx].company}`;
  clearResults();
}

/* Select a resume (radio style) */
function selectResume(key) {
  selectedResume = key;
  document.querySelectorAll('.jd-pick-item').forEach(el => {
    const active = el.dataset.resume === key;
    el.classList.toggle('selected', active);
  });
  updateRunBtn();
  clearResults();
}

/* Enable/disable Run button */
function updateRunBtn() {
  const btn = document.getElementById('jd-run-btn');
  if (btn) btn.disabled = !selectedResume;
}

/* Run analysis: 1 JD vs 1 Resume */
function runJDAnalysis() {
  if (!selectedResume) return;
  const r  = RESUME_DATA[selectedResume];
  const jd = JD_DATA[selectedJD];
  const scoreColor = r.cls === 'high' ? 'var(--accent)' : r.cls === 'mid' ? 'var(--warn)' : 'var(--err)';

  document.getElementById('jd-results').innerHTML = `
    <div class="match-result-card">
      <div class="match-res-header">
        <div class="match-res-info">
          <div class="match-res-label">Resume vs Job Description</div>
          <div class="match-res-name">${selectedResume}</div>
          <div style="font-size:10px;color:var(--txt2);margin-top:2px">${jd.title} · ${jd.company}</div>
        </div>
        <div class="match-score-badge">
          <div class="match-score ${r.cls}">${r.score}%</div>
          <div class="match-score-label">match score</div>
        </div>
      </div>
      <div class="match-bar-track">
        <div class="match-bar-fill" style="width:${r.score}%;background:${scoreColor}"></div>
      </div>
      <div class="match-kw-section">
        <div class="match-kw-heading">✓ Keywords found (${r.found.length})</div>
        <div class="match-kw">
          ${r.found.map(k => `<span class="match-kw-tag found">${k}</span>`).join('')}
        </div>
      </div>
      <div class="match-kw-section">
        <div class="match-kw-heading">✗ Missing keywords (${r.miss.length})</div>
        <div class="match-kw">
          ${r.miss.map(k => `<span class="match-kw-tag miss">${k}</span>`).join('')}
        </div>
      </div>
    </div>
  `;
}

/* Clear results panel */
function clearResults() {
  document.getElementById('jd-results').innerHTML = `
    <div class="jd-no-result">
      <div class="jd-no-result-icon">◎</div>
      <div class="jd-no-result-txt">Select a resume on the left,<br>then click <strong style="color:var(--txt1)">Run Analysis</strong></div>
    </div>
  `;
}

/* Init on load */
document.addEventListener('DOMContentLoaded', () => {
  updateRunBtn();
});
