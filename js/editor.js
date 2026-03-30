/* ── EDITOR: left tabs ── */
function setLTab(i, el) {
  document.querySelectorAll('.ltab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  ['ltab-0','ltab-1','ltab-2'].forEach((id,idx)=>{
    const el=document.getElementById(id);
    if(el) el.classList.toggle('hidden', idx!==i);
  });
}

/* ── EDITOR: section nav ── */
function setSection(el, secId) {
  document.querySelectorAll('.snav').forEach(s=>s.classList.remove('active'));
  el.classList.add('active');
  ['sec-contact','sec-summary','sec-exp','sec-edu','sec-skills','sec-proj'].forEach(id=>{
    const s=document.getElementById(id);
    if(s) s.classList.add('hidden');
  });
  document.getElementById(secId).classList.remove('hidden');
}

/* ── EDITOR: mode toggle (Editor / ATS Score) ── */
function setEdMode(m) {
  const edEl = document.getElementById('ed-mode-editor');
  const atsEl = document.getElementById('ed-mode-ats');
  const bcCur = document.getElementById('bc-mode');
  document.querySelectorAll('.ed-seg').forEach(s=>s.classList.remove('active'));
  if(m==='editor') {
    edEl.classList.remove('hidden'); atsEl.classList.add('hidden');
    bcCur.textContent='Editor';
    document.querySelectorAll('.ed-seg')[0].classList.add('active');
  } else {
    edEl.classList.add('hidden'); atsEl.classList.remove('hidden');
    bcCur.textContent='ATS Score';
    document.querySelectorAll('.ed-seg')[1].classList.add('active');
  }
}

/* ── EDITOR: ATS drawer ── */
function toggleDrawer() {
  document.getElementById('ats-drawer').classList.toggle('open');
}

/* ── TEMPLATE select ── */
function selectTmpl(el) {
  document.querySelectorAll('.tmpl-card').forEach(c=>c.classList.remove('sel'));
  el.classList.add('sel');
}

/* ── CAROUSEL (Resumes page) ── */
function setCarousel(i) {
  document.querySelectorAll('.car-res').forEach((c,idx)=>c.classList.toggle('active',idx===i));
}
