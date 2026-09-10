document.addEventListener('DOMContentLoaded', () => {
  const display = document.getElementById('swDisplay');
  const startBtn = document.getElementById('swStartBtn');
  const lapBtn = document.getElementById('swLapBtn');
  const resetBtn = document.getElementById('swResetBtn');
  const swBar = document.getElementById('swBar');
  const lapWrapper = document.getElementById('lapWrapper');
  const lapList = document.getElementById('lapList');

  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  swBar.style.strokeDasharray = `${circumference} ${circumference}`;
  swBar.style.strokeDashoffset = circumference;

  let startTime = 0;
  let elapsedTime = 0;
  let timerAnimId = null;
  let isRunning = false;
  
  // ラップデータ保持: { lapNum, splitMs, totalMs }
  let laps = [];
  let lastLapTotalMs = 0;

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

    // 60秒で1周
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
    const splitTime = currentTotal - lastLapTotalMs;
    lastLapTotalMs = currentTotal;

    laps.push({
      lapNum: laps.length + 1,
      splitMs: splitTime,
      totalMs: currentTotal
    });

    lapWrapper.style.display = 'flex';
    renderLaps();
  });

  function renderLaps() {
    lapList.innerHTML = '';
    
    // 区間タイムの最速・最遅を計算
    const splits = laps.map(l => l.splitMs);
    const minSplit = Math.min(...splits);
    const maxSplit = Math.max(...splits);

    // 新しいラップが上に来るように逆順表示
    laps.slice().reverse().forEach(lap => {
      const row = document.createElement('div');
      row.className = 'lap-row';

      if (laps.length > 2) {
        if (lap.splitMs === minSplit) row.classList.add('fastest');
        if (lap.splitMs === maxSplit) row.classList.add('slowest');
      }

      row.innerHTML = `
        <span>#${String(lap.lapNum).padStart(2, '0')}</span>
        <span>+${formatTime(lap.splitMs)}</span>
        <span>${formatTime(lap.totalMs)}</span>
      `;
      lapList.appendChild(row);
    });
  }

  resetBtn.addEventListener('click', () => {
    cancelAnimationFrame(timerAnimId);
    isRunning = false;
    startTime = 0;
    elapsedTime = 0;
    lastLapTotalMs = 0;
    laps = [];
    display.textContent = '00:00.00';
    swBar.style.strokeDashoffset = circumference;
    startBtn.textContent = 'Start';
    lapBtn.disabled = true;
    lapList.innerHTML = '';
    lapWrapper.style.display = 'none';
  });
});
