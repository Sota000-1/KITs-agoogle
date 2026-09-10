document.addEventListener('DOMContentLoaded', () => {
  const display = document.getElementById('pomoDisplay');
  const status = document.getElementById('pomoStatus');
  const countEl = document.getElementById('pomoCount');
  const startBtn = document.getElementById('pomoStartBtn');
  const resetBtn = document.getElementById('pomoResetBtn');
  const pomoBar = document.getElementById('pomoBar');

  const btnModeWork = document.getElementById('btnModeWork');
  const btnModeBreak = document.getElementById('btnModeBreak');

  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  pomoBar.style.strokeDasharray = `${circumference} ${circumference}`;

  const WORK_TIME = 25 * 60; // 25分
  const BREAK_TIME = 5 * 60;  // 5分

  let isWorkMode = true;
  let totalSeconds = WORK_TIME;
  let remainingSeconds = WORK_TIME;
  let timerId = null;
  let isRunning = false;
  let completedSessions = 0;

  function playChime(isWorkEnd) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = isWorkEnd ? 659.25 : 880; // E5 or A5
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.6);
    } catch(e) {}
  }

  function setMode(work) {
    clearInterval(timerId);
    isRunning = false;
    isWorkMode = work;
    totalSeconds = isWorkMode ? WORK_TIME : BREAK_TIME;
    remainingSeconds = totalSeconds;

    btnModeWork.classList.toggle('active', isWorkMode);
    btnModeBreak.classList.toggle('active', !isWorkMode);

    pomoBar.className = `meter-bar ${isWorkMode ? 'color-work' : 'color-break'}`;
    status.textContent = isWorkMode ? 'FOCUS' : 'REST';
    startBtn.textContent = 'Start';
    updateDisplay();
  }

  function updateDisplay() {
    const m = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
    const s = String(remainingSeconds % 60).padStart(2, '0');
    display.textContent = `${m}:${s}`;
    const offset = circumference - (remainingSeconds / totalSeconds) * circumference;
    pomoBar.style.strokeDashoffset = offset;
  }

  function tick() {
    if (remainingSeconds > 0) {
      remainingSeconds--;
      updateDisplay();
    } else {
      clearInterval(timerId);
      isRunning = false;
      playChime(isWorkMode);

      if (isWorkMode) {
        completedSessions++;
        countEl.textContent = `SESSION #${completedSessions + 1}`;
        setMode(false); // 休憩へ自動移行
      } else {
        setMode(true);  // 作業へ自動移行
      }
    }
  }

  startBtn.addEventListener('click', () => {
    if (!isRunning) {
      timerId = setInterval(tick, 1000);
      isRunning = true;
      startBtn.textContent = 'Pause';
    } else {
      clearInterval(timerId);
      isRunning = false;
      startBtn.textContent = 'Resume';
    }
  });

  resetBtn.addEventListener('click', () => {
    setMode(isWorkMode);
  });

  btnModeWork.addEventListener('click', () => setMode(true));
  btnModeBreak.addEventListener('click', () => setMode(false));

  setMode(true);
});
