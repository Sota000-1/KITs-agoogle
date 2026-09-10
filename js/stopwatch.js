document.addEventListener('DOMContentLoaded', () => {
  const display = document.getElementById('swDisplay');
  const startBtn = document.getElementById('swStartBtn');
  const lapBtn = document.getElementById('swLapBtn');
  const resetBtn = document.getElementById('swResetBtn');
  const swBar = document.getElementById('swBar');
  const lapList = document.getElementById('lapList');

  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  swBar.style.strokeDasharray = `${circumference} ${circumference}`;
  swBar.style.strokeDashoffset = circumference; // 0から溜まる方式

  let startTime = 0;
  let elapsedTime = 0;
  let timerAnimId = null;
  let isRunning = false;
  let laps = [];

  function formatTime(ms) {
    const m = String(Math.floor(ms / 60000)).padStart(2, '0');
    const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0');
    const cs = String(Math.floor((ms % 1000) / 10)).padStart(2, '0');
    return `${m}:${s}.${cs}`;
  }

  function update() {
    const current = Date.now();
    const total = elapsedTime + (current - startTime);
    display.textContent = formatTime(total);

    // 60秒で1周するメーターリング
    const secCycle = (total % 60000) / 60000;
    swBar.style.strokeDashoffset = circumference - secCycle * circumference;

    timerAnimId = requestAnimationFrame(update);
  }

  startBtn.addEventListener('click', () => {
    if (!isRunning) {
      startTime = Date.now();
      timerAnimId = requestAnimationFrame(update);
      isRunning = true;
      startBtn.textContent = 'Stop';
      lapBtn.disabled = false;
    } else {
      cancelAnimationFrame(timerAnimId);
      elapsedTime += Date.now() - startTime;
      isRunning = false;
      startBtn.textContent = 'Start';
      lapBtn.disabled = true;
    }
  });

  lapBtn.addEventListener('click', () => {
    if (!isRunning) return;
    const currentTotal = elapsedTime + (Date.now() - startTime);
    const lapTime = laps.length === 0 ? currentTotal : currentTotal - laps.reduce((a, b) => a + b, 0);
    laps.push(lapTime);

    lapList.style.display = 'flex';
    renderLaps();
  });

  function renderLaps() {
    lapList.innerHTML = '';
    const minLap = Math.min(...laps);
    const maxLap = Math.max(...laps);

    laps.slice().reverse().forEach((lap, idx) => {
      const lapNum = laps.length - idx;
      const item = document.createElement('div');
      item.className = 'lap-item';
      if (laps.length > 2) {
        if (lap === minLap) item.classList.add('fastest');
        if (lap === maxLap) item.classList.add('slowest');
      }
      item.innerHTML = `<span>LAP ${String(lapNum).padStart(2, '0')}</span><span>${formatTime(lap)}</span>`;
      lapList.appendChild(item);
    });
  }

  resetBtn.addEventListener('click', () => {
    cancelAnimationFrame(timerAnimId);
    isRunning = false;
    startTime = 0;
    elapsedTime = 0;
    laps = [];
    display.textContent = '00:00.00';
    swBar.style.strokeDashoffset = circumference;
    startBtn.textContent = 'Start';
    lapBtn.disabled = true;
    lapList.innerHTML = '';
    lapList.style.display = 'none';
  });
});
