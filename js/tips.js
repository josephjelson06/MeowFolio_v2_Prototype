/* ── AUTO-SCROLL TIPS ── */
const tips = [
  'Use numbers when they clarify scale, speed, quality, or reach.',
  'Start each bullet with a strong action verb — Led, Built, Reduced, Designed.',
  'Keep your resume to one page unless you have 10+ years of experience.',
  'Tailor your skills section to match the job description keywords.',
  'Add a professional summary only when it adds value, not filler.'
];
let currentTip = 0;
function rotateTip() {
  currentTip = (currentTip + 1) % tips.length;
  const desktopTip = document.getElementById('dash-tip-text');
  const mobileTip = document.getElementById('mob-tip-text');
  if (desktopTip) desktopTip.textContent = tips[currentTip];
  if (mobileTip) mobileTip.textContent = tips[currentTip];
  document.querySelectorAll('.dash-tip-dots, #mob-tip-dots').forEach(container => {
    container.querySelectorAll('.tip-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentTip);
    });
  });
}
setInterval(rotateTip, 4000);
