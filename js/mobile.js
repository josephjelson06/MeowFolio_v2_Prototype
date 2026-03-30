/* ── MOBILE NAV ── */
function mobShowPage(p) {
  document.querySelectorAll('.mob-page').forEach(el=>el.classList.remove('active'));
  document.getElementById('mob-page-'+p).classList.add('active');
  // Top bar
  document.getElementById('mob-topbar-default').classList.toggle('hidden', p==='editor');
  document.getElementById('mob-topbar-editor').classList.toggle('hidden', p!=='editor');
  // Bottom tabs
  document.querySelectorAll('.mob-tab').forEach(t=>t.classList.remove('active'));
  const tabEl = document.getElementById('mob-tab-'+p);
  if(tabEl) tabEl.classList.add('active');
  // Close bottom sheet
  document.getElementById('mob-sheet').classList.remove('open');
}

function setMobEdView(v) {
  document.getElementById('mob-et-edit').classList.toggle('active', v==='edit');
  document.getElementById('mob-et-prev').classList.toggle('active', v==='preview');
  document.getElementById('mob-edit-mode').classList.toggle('hidden', v!=='edit');
  document.getElementById('mob-prev-mode').classList.toggle('hidden', v!=='preview');
}

function toggleMobSheet() {
  document.getElementById('mob-sheet').classList.toggle('open');
}
