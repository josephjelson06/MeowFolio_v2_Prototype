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

function goToResumeEditor(e) {
  if (e) e.stopPropagation();
  window.location.href = 'editor.html';
}

function renderResumeThumb() {
  return `
    <div class="res-visual-thumb">
      <div class="pdf-name res-thumb-name">Arjun Kumar</div>
      <div class="pdf-contact res-thumb-contact">arjun@email.com</div>
      <div class="pdf-divider"></div>
      <div class="pdf-line d res-thumb-line-short"></div>
      <div class="pdf-line res-thumb-line-full"></div>
      <div class="pdf-line res-thumb-line-mid"></div>
      <div class="pdf-line res-thumb-line-midtwo"></div>
    </div>
  `;
}

function renderResumeCard(item) {
  return `
    <article class="res-card" data-resume-open>
      ${renderResumeThumb()}
      <div class="res-card-body">
        <div class="res-card-top">
          <div>
            <div class="res-visual-name">${item.name}</div>
            <div class="res-visual-meta">Last updated ${item.updated} &middot; ${item.template}</div>
          </div>
          ${item.recent ? '<span class="badge-outline">MOST RECENT</span>' : ''}
        </div>
        <div class="res-card-actions">
          <button class="r-action primary" type="button" data-resume-action="open">&#9998;</button>
          <button class="r-action" type="button" data-resume-action="rename" data-resume-id="${item.id}">Rename</button>
          <button class="r-action" type="button" data-resume-action="download" data-resume-id="${item.id}">&#11015;</button>
          <button class="r-action res-delete-action" type="button" data-resume-action="delete" data-resume-id="${item.id}">&#128465;</button>
        </div>
      </div>
    </article>
  `;
}

function renderResumeLibrary() {
  const count = document.getElementById('resume-count');
  const grid = document.getElementById('resume-grid');
  const status = document.getElementById('resume-page');
  const prev = document.getElementById('resume-prev');
  const next = document.getElementById('resume-next');
  const total = RESUME_LIBRARY.length;
  const totalPages = getResumeTotalPages();
  const pageItems = getResumePageItems();

  if (count) count.textContent = `${total} RESUMES`;

  if (grid) {
    grid.innerHTML = `
      <button class="res-new-card" type="button" data-open-resume-modal>
        <div class="res-new-plus">+</div>
        <div class="section-label">CREATE NEW RESUME</div>
        <div class="res-new-title">Upload or start blank</div>
        <div class="res-new-desc">Open the modal, import an existing resume, or create a fresh version from scratch.</div>
      </button>
      ${pageItems.map(renderResumeCard).join('')}
    `;
  }

  if (status) status.textContent = `Page ${resumePage} of ${totalPages}`;
  if (prev) prev.disabled = resumePage === 1;
  if (next) next.disabled = resumePage === totalPages;
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
  const grid = document.getElementById('resume-grid');
  const prev = document.getElementById('resume-prev');
  const next = document.getElementById('resume-next');

  if (grid) {
    grid.addEventListener('click', event => {
      const action = event.target.closest('[data-resume-action]');
      if (action) {
        event.stopPropagation();
        const id = action.dataset.resumeId;
        switch (action.dataset.resumeAction) {
          case 'open':
            goToResumeEditor();
            break;
          case 'rename':
            renameResume(id);
            break;
          case 'download':
            downloadResume(id);
            break;
          case 'delete':
            deleteResume(id);
            break;
          default:
            break;
        }
        return;
      }

      if (event.target.closest('[data-resume-open]')) {
        goToResumeEditor();
      }
    });
  }

  if (prev) prev.addEventListener('click', () => changeResumePage(-1));
  if (next) next.addEventListener('click', () => changeResumePage(1));

  renderResumeLibrary();
});
