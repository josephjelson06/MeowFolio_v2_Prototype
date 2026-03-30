/* ── JD ANALYZE ── */
function selectJD(el) {
  document.querySelectorAll('.jd-card').forEach(c=>c.classList.remove('active'));
  el.classList.add('active');
  const titles = ['Software Engineer II — Google','Senior Frontend Dev — Razorpay','ML Engineer — OpenAI'];
  const idx = Array.from(document.querySelectorAll('.jd-card')).indexOf(el);
  document.querySelector('.jd-analyze-title').textContent = titles[idx] || titles[0];
  document.getElementById('jd-results').innerHTML = `<div class="jd-no-result" id="jd-no-result"><div class="jd-no-result-icon">◎</div><div class="jd-no-result-txt">Select resumes and click<br>"Run Analysis" to see match scores</div></div>`;
}

function toggleCheck(el) {
  el.classList.toggle('checked');
  const cb = el.querySelector('input[type=checkbox]');
  if(cb) cb.checked = !cb.checked;
}

function runJDAnalysis() {
  const checked = document.querySelectorAll('.jd-res-item.checked');
  if(!checked.length) return;
  const resContainer = document.getElementById('jd-results');
  const data = [
    {name:'resume_v3',score:87,cls:'high',kw:['Python','React','REST API','scalable','cloud'],miss:['Kubernetes','Go']},
    {name:'resume_sde',score:62,cls:'mid',kw:['React','Node.js','REST'],miss:['Python','System design','scalable']},
    {name:'resume_pm',score:31,cls:'low',kw:['communication'],miss:['Python','React','backend','APIs']},
    {name:'resume_ds',score:78,cls:'high',kw:['Python','AWS','data'],miss:['React','Node.js']},
    {name:'resume_ml',score:55,cls:'mid',kw:['Python','ML','AWS'],miss:['React','Node.js','REST API']},
  ];
  const names = Array.from(checked).map(c=>c.querySelector('.jd-res-label').textContent);
  const results = data.filter(d=>names.includes(d.name)).sort((a,b)=>b.score-a.score);
  resContainer.innerHTML = results.map(r=>`
    <div class="match-result-card">
      <div class="match-res-head">
        <span class="match-res-name">${r.name}</span>
        <span class="match-score ${r.cls}">${r.score}%</span>
      </div>
      <div class="match-bar-track">
        <div class="match-bar-fill" style="width:${r.score}%;background:${r.cls==='high'?'var(--accent)':r.cls==='mid'?'var(--warn)':'var(--err)'}"></div>
      </div>
      <div class="match-kw">
        ${r.kw.map(k=>`<span class="match-kw-tag found">${k}</span>`).join('')}
        ${r.miss.map(k=>`<span class="match-kw-tag miss">✗ ${k}</span>`).join('')}
      </div>
    </div>
  `).join('');
}
