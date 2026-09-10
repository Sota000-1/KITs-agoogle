document.addEventListener('DOMContentLoaded', () => {
  const display = document.getElementById('timerDisplay');
  const status = document.getElementById('timerStatus');
  const startBtn = document.getElementById('startBtn');
  const resetBtn = document.getElementById('resetBtn');
  const timerBar = document.getElementById('timerBar');
  const presetBtns = document.querySelectorAll('.preset-btn');

  // 円の周長（2 * PI * r）
  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  timerBar.style.strokeDasharray = `${circumference} ${circumference}`;
  timerBar.style.strokeDashoffset = 0;

  let totalSeconds = 300; // 初期5分
  let remainingSeconds = 300;
  let timerId = null;
  let isRunning = false;

  // ─── Web Audio API アラーム音 ───
  function playAlarm() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const playBeep = (time, freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.2, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + 0.15);
      };
      const now = ctx.currentTime;
      playBeep(now, 880);
      playBeep(now + 0.2, 880);
      playBeep(now + 0.4, 1760);
    } catch (e) {}
  }

  function updateDisplay() {
    const m = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
    const s = String(remainingSeconds % 60).padStart(2, '0');
    display.textContent = `${m}:${s}`;

    // メーターの減少反映
    const offset = circumference - (remainingSeconds / totalSeconds) * circumference;
    timerBar.style.strokeDashoffset = offset;
  }

  function tick() {
    if (remainingSeconds > 0) {
      remainingSeconds--;
      updateDisplay();
    } else {
      clearInterval(timerId);
      isRunning = false;
      startBtn.textContent = 'Start';
      status.textContent = 'COMPLETED';
      playAlarm();
    }
  }

  startBtn.addEventListener('click', () => {
    if (!isRunning) {
      if (remainingSeconds === 0) remainingSeconds = totalSeconds;
      timerId = setInterval(tick, 1000);
      isRunning = true;
      startBtn.textContent = 'Pause';
      status.textContent = 'RUNNING';
    } else {
      clearInterval(timerId);
      isRunning = false;
      startBtn.textContent = 'Resume';
      status.textContent = 'PAUSED';
    }
  });

  resetBtn.addEventListener('click', () => {
    clearInterval(timerId);
    isRunning = false;
    remainingSeconds = totalSeconds;
    startBtn.textContent = 'Start';
    status.textContent = 'READY';
    updateDisplay();
  });

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      clearInterval(timerId);
      isRunning = false;
      startBtn.textContent = 'Start';
      status.textContent = 'READY';
      totalSeconds = parseInt(btn.dataset.time, 10);
      remainingSeconds = totalSeconds;
      updateDisplay();
    });
  });

  updateDisplay();
});
