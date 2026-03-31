function getAuthModal() {
  let modal = document.getElementById('auth-modal');
  if (!modal) {
    ensureAuthModal();
    modal = document.getElementById('auth-modal');
  }
  return modal;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getAuthConfig() {
  const body = document.body;
  return {
    copy: body?.dataset.authCopy || 'Sign in here and continue into the resumeai workspace flow.',
    accent: body?.dataset.authAccent || 'GOOGLE ONLY',
    info: body?.dataset.authInfo || 'SAME PRODUCT',
    outline: body?.dataset.authOutline || 'DASHBOARD READY',
    previewTitle: body?.dataset.authPreviewTitle || 'One product, one path',
    previewCopy: body?.dataset.authPreviewCopy || 'The public entry and workspace now share the same product language.',
    note: body?.dataset.authNote || 'No extra signup form on this prototype.',
  };
}

function getPublicPage() {
  return document.body?.dataset.publicPage || 'home';
}

function getPublicFooterLinks(page) {
  const allLinks = [
    { href: 'index.html', label: 'Home', key: 'home' },
    { href: 'about.html', label: 'About', key: 'about' },
    { href: '404.html', label: '404', key: '404' },
    { href: '500.html', label: '500', key: '500' },
  ];

  return allLinks.filter(link => link.key !== page);
}

function buildPublicHeaderMarkup() {
  const page = getPublicPage();
  const homeActive = page === 'home' ? ' active' : '';
  const aboutActive = page === 'about' ? ' active' : '';

  return `
    <nav class="gnav pub-desktop-nav">
      <a class="gnav-logo" href="index.html">resumeai</a>
      <div class="gnav-links">
        <a class="gnav-link${homeActive}" href="index.html">Home</a>
        <a class="gnav-link${aboutActive}" href="about.html">About</a>
      </div>
      <div class="gnav-right">
        <button class="btn-new" type="button" data-auth-open>Login / Signup</button>
      </div>
    </nav>

    <div class="mob-topbar pub-mobile-nav">
      <a class="mob-topbar-logo" href="index.html">resumeai</a>
      <button class="r-action primary pub-mobile-login" type="button" data-auth-open>Login</button>
    </div>

    <div class="mob-edit-toggle pub-mobile-links">
      <a class="mob-et-btn${homeActive}" href="index.html">Home</a>
      <a class="mob-et-btn${aboutActive}" href="about.html">About</a>
    </div>
  `;
}

function buildPublicFooterMarkup() {
  const page = getPublicPage();
  const links = getPublicFooterLinks(page)
    .map(link => `<a href="${link.href}">${escapeHtml(link.label)}</a>`)
    .join('');

  return `
    <div class="pub-footer-row">
      <span>&copy; 2026 resumeai</span>
      <div class="pub-footer-links">${links}</div>
    </div>
  `;
}

function ensurePublicChrome() {
  const page = document.querySelector('.pub-page');
  if (!page) return;

  if (!document.querySelector('.pub-desktop-nav')) {
    document.body.insertAdjacentHTML('afterbegin', buildPublicHeaderMarkup());
  }

  if (!page.querySelector('.pub-footer-row')) {
    page.insertAdjacentHTML('beforeend', buildPublicFooterMarkup());
  }
}

function buildAuthModalMarkup() {
  const config = getAuthConfig();
  return `
    <div class="auth-modal-overlay" id="auth-modal" aria-hidden="true">
      <div class="auth-modal-box" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
        <button class="auth-close" type="button" data-auth-close>&times;</button>
        <div class="section-label auth-section-label">SIGN IN / SIGN UP</div>
        <div class="auth-title" id="auth-modal-title">Continue with Google</div>
        <div class="auth-copy">${escapeHtml(config.copy)}</div>
        <div class="auth-highlights">
          <span class="badge-accent">${escapeHtml(config.accent)}</span>
          <span class="badge-info">${escapeHtml(config.info)}</span>
          <span class="badge-outline">${escapeHtml(config.outline)}</span>
        </div>
        <div class="auth-preview">
          <div class="pub-card-title">${escapeHtml(config.previewTitle)}</div>
          <div class="pub-card-copy">${escapeHtml(config.previewCopy)}</div>
        </div>
        <button class="auth-google-btn" type="button" data-auth-continue>
          <span>G</span>
          <span>Continue with Google</span>
        </button>
        <div class="auth-note">${escapeHtml(config.note)}</div>
      </div>
    </div>
  `;
}

function ensureAuthModal() {
  if (document.getElementById('auth-modal')) return;

  document.body.insertAdjacentHTML('beforeend', buildAuthModalMarkup());

  const modal = document.getElementById('auth-modal');
  if (!modal) return;

  modal.addEventListener('click', event => {
    if (event.target === modal) closeAuthModal();
  });

  const closeButton = modal.querySelector('[data-auth-close]');
  if (closeButton) {
    closeButton.addEventListener('click', closeAuthModal);
  }

  const continueButton = modal.querySelector('[data-auth-continue]');
  if (continueButton) {
    continueButton.addEventListener('click', continueWithGoogle);
  }
}

function showAuthModal() {
  const modal = getAuthModal();
  if (modal) modal.classList.add('open');
}

function closeAuthModal() {
  const modal = getAuthModal();
  if (modal) modal.classList.remove('open');
}

function continueWithGoogle() {
  window.location.href = 'dashboard.html';
}

function scrollPublicRail(id, direction) {
  const rail = document.getElementById(id);
  if (!rail) return;

  const distance = Math.max(280, Math.floor(rail.clientWidth * 0.72));
  rail.scrollBy({
    left: distance * direction,
    behavior: 'smooth',
  });
}

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeAuthModal();
});

document.addEventListener('click', event => {
  if (event.target.closest('[data-auth-open]')) {
    showAuthModal();
    return;
  }

  const railTrigger = event.target.closest('[data-public-rail-id]');
  if (railTrigger) {
    scrollPublicRail(
      railTrigger.dataset.publicRailId,
      Number(railTrigger.dataset.publicRailDir || 0),
    );
  }
});

document.addEventListener('DOMContentLoaded', () => {
  ensurePublicChrome();
  ensureAuthModal();
});
