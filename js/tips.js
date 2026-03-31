/* AUTO-SCROLL TIPS */
const tips = window.ResumeAIData ? window.ResumeAIData.getDashboardTips() : [];
let currentTip = 0;

function rotateTip() {
  if (!tips.length) return;

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

if (tips.length) {
  setInterval(rotateTip, 4000);
}
