let RESUME_LIBRARY = [
  { id: 'resume_v3', name: 'resume_v3.tex', updated: '2h ago', template: 'Classic', recent: true },
  { id: 'resume_sde', name: 'resume_sde.tex', updated: 'yesterday', template: 'Sidebar' },
  { id: 'resume_pm', name: 'resume_pm.tex', updated: '3d ago', template: 'Classic' },
  { id: 'resume_ds', name: 'resume_ds.tex', updated: '5d ago', template: 'Minimal' },
  { id: 'resume_ml', name: 'resume_ml.tex', updated: '1w ago', template: 'Modern' },
  { id: 'resume_ops', name: 'resume_ops.tex', updated: '1w ago', template: 'Compact' },
  { id: 'resume_frontend', name: 'resume_frontend.tex', updated: '2w ago', template: 'Clean' },
  { id: 'resume_backend', name: 'resume_backend.tex', updated: '2w ago', template: 'Classic' },
  { id: 'resume_cloud', name: 'resume_cloud.tex', updated: '3w ago', template: 'Modern' },
  { id: 'resume_analytics', name: 'resume_analytics.tex', updated: '3w ago', template: 'Minimal' },
  { id: 'resume_platform', name: 'resume_platform.tex', updated: '1mo ago', template: 'Structured' },
  { id: 'resume_startup', name: 'resume_startup.tex', updated: '1mo ago', template: 'Bold' },
];

const RESUMES_PER_PAGE = 10;
let resumePage = 1;

function getResumeTotalPages() {
  return Math.max(1, Math.ceil(RESUME_LIBRARY.length / RESUMES_PER_PAGE));
}

function getResumePageItems() {
  const start = (resumePage - 1) * RESUMES_PER_PAGE;
  return RESUME_LIBRARY.slice(start, start + RESUMES_PER_PAGE);
}

function renderResumeThumb(isMobile) {
  return `
    <div class="${isMobile ? 'mob-res-visual-thumb' : 'res-visual-thumb'}">
      <div class="pdf-name" style="font-size:10px">Arjun Kumar</div>
      <div class="pdf-contact" style="font-size:7px">arjun@email.com</div>
      <div class="pdf-divider"></div>
      <div class="pdf-line d" style="width:55%"></div>
      <div class="pdf-line" style="width:90%"></div>
      <div class="pdf-line" style="width:72%"></div>
      <div class="pdf-line" style="width:66%"></div>
    </div>
  `;
}

function renderDesktopResumeCard(item) {
  return `
    <div class="res-visual-card" onclick="openEditor()">
      ${renderResumeThumb(false)}
      <div class="res-visual-name">${item.name}</div>
      <div class="res-visual-meta">Last updated ${item.updated} &middot; ${item.template}</div>
      <div class="res-visual-actions">
        <button class="r-action primary" onclick="openEditor(event)">&#9998;</button>
        <button class="r-action" onclick="renameResume('${item.id}', event)">Rename</button>
        <button class="r-action" onclick="downloadResume('${item.id}', event)">&#11015;</button>
        <button class="r-action" style="border-color:var(--err);color:var(--err)" onclick="deleteResume('${item.id}', event)">&#128465;</button>
      </div>
    </div>
  `;
}

function renderMobileResumeCard(item) {
  return `
    <div class="mob-res-visual-card" onclick="mobShowPage('editor')">
      ${renderResumeThumb(true)}
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
        <div>
          <div style="font-size:11px;font-weight:500;font-family:var(--font);color:var(--txt0)">${item.name}</div>
          <div style="font-size:9px;color:var(--txt2);margin-top:2px">Updated ${item.updated} &middot; ${item.template}</div>
        </div>
        <div style="display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end">
          <button class="r-action primary" onclick="mobShowPage('editor');event.stopPropagation()">&#9998;</button>
          <button class="r-action" onclick="renameResume('${item.id}', event)">Rename</button>
          <button class="r-action" onclick="downloadResume('${item.id}', event)">&#11015;</button>
          <button class="r-action" style="border-color:var(--err);color:var(--err)" onclick="deleteResume('${item.id}', event)">&#128465;</button>
        </div>
      </div>
    </div>
  `;
}

function renderResumePagination(statusId, prevId, nextId) {
  const status = document.getElementById(statusId);
  const prev = document.getElementById(prevId);
  const next = document.getElementById(nextId);
  const totalPages = getResumeTotalPages();

  if (status) status.textContent = `Page ${resumePage} of ${totalPages}`;
  if (prev) prev.disabled = resumePage === 1;
  if (next) next.disabled = resumePage === totalPages;
}

function renderResumeLibrary() {
  const desktopCount = document.getElementById('desktop-resume-count');
  const mobileCount = document.getElementById('mobile-resume-count');
  const desktopGrid = document.getElementById('desktop-resume-grid');
  const mobileList = document.getElementById('mobile-resume-list');
  const total = RESUME_LIBRARY.length;
  const pageItems = getResumePageItems();

  if (desktopCount) desktopCount.textContent = `${total} RESUMES`;
  if (mobileCount) mobileCount.textContent = `${total} RESUMES`;

  if (desktopGrid) {
    desktopGrid.innerHTML = `
      <div class="res-new-card" onclick="showModal()">
        <div class="res-new-plus">+</div>
        <div class="section-label">CREATE NEW RESUME</div>
        <div class="res-new-title">Upload or start blank</div>
        <div class="res-new-desc">Open the modal, upload an existing resume, or create a new one from scratch.</div>
      </div>
      ${pageItems.map(renderDesktopResumeCard).join('')}
    `;
  }

  if (mobileList) {
    mobileList.innerHTML = `
      <div class="mob-res-create-card" onclick="showModal()">
        <div class="mob-res-create-plus">+</div>
        <div class="mob-res-create-label">CREATE NEW RESUME</div>
        <div class="mob-res-create-title">Upload or start blank</div>
      </div>
      ${pageItems.map(renderMobileResumeCard).join('')}
    `;
  }

  renderResumePagination('desktop-resume-page', 'desktop-resume-prev', 'desktop-resume-next');
  renderResumePagination('mobile-resume-page', 'mobile-resume-prev', 'mobile-resume-next');
}

function changeResumePage(delta) {
  const totalPages = getResumeTotalPages();
  resumePage = Math.min(totalPages, Math.max(1, resumePage + delta));
  renderResumeLibrary();
}

function renameResume(id, e) {
  if (e) e.stopPropagation();
  const resume = RESUME_LIBRARY.find(item => item.id === id);
  if (!resume) return;

  const nextName = window.prompt('Edit resume name', resume.name);
  if (!nextName || !nextName.trim()) return;

  resume.name = nextName.trim();
  renderResumeLibrary();
}

function downloadResume(id, e) {
  if (e) e.stopPropagation();
  const resume = RESUME_LIBRARY.find(item => item.id === id);
  if (!resume) return;

  const text = [
    resume.name,
    '',
    'Arjun Kumar',
    'arjun@email.com | +91 98765 43210 | Karnal, Haryana',
    '',
    'Summary',
    'Resume export preview for the current prototype library item.',
  ].join('\n');

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = resume.name.replace(/\.tex$/i, '.txt');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function deleteResume(id, e) {
  if (e) e.stopPropagation();
  RESUME_LIBRARY = RESUME_LIBRARY.filter(item => item.id !== id);
  resumePage = Math.min(resumePage, getResumeTotalPages());
  renderResumeLibrary();
}

document.addEventListener('DOMContentLoaded', () => {
  renderResumeLibrary();
});
