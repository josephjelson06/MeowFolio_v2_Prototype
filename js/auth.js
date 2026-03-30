function getAuthModal() {
  return document.getElementById('auth-modal');
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
