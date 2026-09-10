document.addEventListener('DOMContentLoaded', () => {
  const display = document.getElementById('timerDisplay');
  const status = document.getElementById('timerStatus');
  const startBtn = document.getElementById('startBtn');
  const resetBtn = document.getElementById('resetBtn');
  const timerBar = document.getElementById('timerBar');

  const inputMin = document.getElementById('inputMin');
  const inputSec = document.getElementById('inputSec');
  const quickBtns = document.querySelectorAll('.btn-quick-adjust');
  const btnClearTime = document.getElementById('btnClearTime');

  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  timerBar.style.strokeDasharray = `${circumference} ${circumference}`;
  timerBar.style.strokeDashoffset = 0;

  let totalSeconds = 300;
  let remainingSeconds = 300;
  let timerId = null;
  let isRunning = false;

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

    const offset = totalSeconds > 0 
      ? circumference - (remainingSeconds / totalSeconds) * circumference 
      : 0;
    timerBar.style.strokeDashoffset = offset;
  }

  function syncInputsFromSeconds(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    inputMin.value = String(m).padStart(2, '0');
    inputSec.value = String(s).padStart(2, '0');
  }

  function getSecondsFromInputs() {
    const m = parseInt(inputMin.value, 10) || 0;
    const s = parseInt(inputSec.value, 10) || 0;
    return m * 60 + s;
  }

  // 入力欄変更時
  function onInputChange() {
    if (isRunning) return;
    const sec = getSecondsFromInputs();
    if (sec > 0) {
      totalSeconds = sec;
      remainingSeconds = sec;
      status.textContent = 'READY';
      updateDisplay();
    }
  }

  inputMin.addEventListener('input', onInputChange);
  inputSec.addEventListener('input', onInputChange);

  // +1m, +5m, +10m クイック加算ボタン
  quickBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (isRunning) return;
      const add = parseInt(btn.dataset.add, 10);
      let current = getSecondsFromInputs() + add;
      totalSeconds = current;
      remainingSeconds = current;
      syncInputsFromSeconds(current);
      status.textContent = 'READY';
      updateDisplay();
    });
  });

  if (btnClearTime) {
    btnClearTime.addEventListener('click', () => {
      if (isRunning) return;
      totalSeconds = 60;
      remainingSeconds = 60;
      syncInputsFromSeconds(60);
      status.textContent = 'READY';
      updateDisplay();
    });
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
      if (remainingSeconds === 0) {
        remainingSeconds = totalSeconds;
      }
      timerId = setInterval(tick, 1000);
      isRunning = true;
      startBtn.textContent = 'Pause';
      status.textContent = 'RUNNING';
      inputMin.disabled = true;
      inputSec.disabled = true;
    } else {
      clearInterval(timerId);
      isRunning = false;
      startBtn.textContent = 'Resume';
      status.textContent = 'PAUSED';
      inputMin.disabled = false;
      inputSec.disabled = false;
    }
  });

  resetBtn.addEventListener('click', () => {
    clearInterval(timerId);
    isRunning = false;
    remainingSeconds = totalSeconds;
    startBtn.textContent = 'Start';
    status.textContent = 'READY';
    inputMin.disabled = false;
    inputSec.disabled = false;
    updateDisplay();
  });

  updateDisplay();
});
