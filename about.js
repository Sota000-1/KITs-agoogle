// ─── 1. マウス追従スポットライト ───
window.addEventListener('pointermove', (e) => {
  document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
  document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
});

// ─── 2. リアルタイムHUD（ミリ秒時計 ＆ ビューポート） ───
const liveClock = document.getElementById('liveClock');
const viewportDim = document.getElementById('viewportDim');

if (liveClock) {
  function updateHUD() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    const ms = String(now.getMilliseconds()).padStart(3, '0');
    liveClock.textContent = `${h}:${m}:${s}.${ms} JST`;
    requestAnimationFrame(updateHUD);
  }
  requestAnimationFrame(updateHUD);
}

if (viewportDim) {
  function updateViewport() {
    viewportDim.textContent = `${window.innerWidth}x${window.innerHeight}`;
  }
  window.addEventListener('resize', updateViewport);
  updateViewport();
}

// ─── 3. 3Dチルトカードエフェクト ───
const tiltCards = document.querySelectorAll('.tilt-card');
tiltCards.forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const tiltX = (y / (rect.height / 2)) * -5;
    const tiltY = (x / (rect.width / 2)) * 5;
    card.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-2px)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = `rotateX(0deg) rotateY(0deg) translateY(0px)`;
  });
});
