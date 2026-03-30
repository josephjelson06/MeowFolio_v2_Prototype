/* ── DEVICE SWITCH ── */
function setDevice(d) {
  document.querySelectorAll('.dev-btn').forEach(b=>b.classList.remove('active'));
  event.target.classList.add('active');
  document.getElementById('desktop-view').classList.toggle('active', d==='desktop');
  document.getElementById('mobile-view').classList.toggle('active', d==='mobile');
}

/* ── DESKTOP NAV ── */
function showPage(p) {
  document.querySelectorAll('.page').forEach(el=>el.classList.remove('active'));
  document.getElementById('page-'+p).classList.add('active');
  document.querySelectorAll('.gnav-link').forEach(l=>l.classList.remove('active'));
  const navMap = {dash:'Dashboard',resumes:'Resumes',jds:'JDs'};
  document.querySelectorAll('.gnav-link').forEach(l=>{
    if(navMap[p] && l.textContent===navMap[p]) l.classList.add('active');
  });
}

function openEditor(e) {
  if(e) e.stopPropagation();
  showPage('editor');
  document.querySelectorAll('.gnav-link').forEach(l=>l.classList.remove('active'));
  document.querySelectorAll('.gnav-link').forEach(l=>{if(l.textContent==='Resumes') l.classList.add('active');});
}

function openATS(e) {
  if(e) e.stopPropagation();
  showPage('editor');
  setEdMode('ats');
}
