document.addEventListener('DOMContentLoaded', () => {
  const display = document.getElementById('pomoDisplay');
  const status = document.getElementById('pomoStatus');
  const countEl = document.getElementById('pomoCount');
  const startBtn = document.getElementById('pomoStartBtn');
  const resetBtn = document.getElementById('pomoResetBtn');
  const pomoBar = document.getElementById('pomoBar');

  const btnModeWork = document.getElementById('btnModeWork');
  const btnModeBreak = document.getElementById('btnModeBreak');

  const pomoInputMin = document.getElementById('pomoInputMin');
  const quickBtns = document.querySelectorAll('.btn-quick-adjust[data-add]');
  const btnPresetDefault = document.getElementById('btnPresetDefault');

  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  pomoBar.style.strokeDasharray = `${circumference} ${circumference}`;

  // 保存されたカスタム時間（分）の読み込み（デフォルト: 25分 / 5分）
  let workMin = parseInt(localStorage.getItem('pomo_custom_work_min'), 10) || 25;
  let breakMin = parseInt(localStorage.getItem('pomo_custom_break_min'), 10) || 5;

  let isWorkMode = true;
  let totalSeconds = workMin * 60;
  let remainingSeconds = totalSeconds;
  let timerId = null;
  let isRunning = false;
  let completedSessions = 0;

  // Web Audio アラーム音
  function playChime(isWorkEnd) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = isWorkEnd ? 659.25 : 880; // E5 または A5
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.6);
    } catch(e) {}
  }

  // ボタンの分数表示と入力欄を同期
  function updateUIState() {
    btnModeWork.textContent = `Focus (${workMin}m)`;
    btnModeBreak.textContent = `Break (${breakMin}m)`;
    if (pomoInputMin) {
      pomoInputMin.value = String(isWorkMode ? workMin : breakMin).padStart(2, '0');
    }
  }

  // モード（Focus/Break）のセット
  function setMode(work) {
    clearInterval(timerId);
    isRunning = false;
    isWorkMode = work;
    
    totalSeconds = (isWorkMode ? workMin : breakMin) * 60;
    remainingSeconds = totalSeconds;

    btnModeWork.classList.toggle('active', isWorkMode);
    btnModeBreak.classList.toggle('active', !isWorkMode);

    pomoBar.className = `meter-bar ${isWorkMode ? 'color-work' : 'color-break'}`;
    status.textContent = isWorkMode ? 'FOCUS' : 'REST';
    startBtn.textContent = 'Start';
    
    if (pomoInputMin) pomoInputMin.disabled = false;
    updateUIState();
    updateDisplay();
  }

  function updateDisplay() {
    const m = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
    const s = String(remainingSeconds % 60).padStart(2, '0');
    display.textContent = `${m}:${s}`;
    const offset = totalSeconds > 0 
      ? circumference - (remainingSeconds / totalSeconds) * circumference 
      : 0;
    pomoBar.style.strokeDashoffset = offset;
  }

  // 時間設定の変更を反映して保存
  function applyNewMinutes(newMin) {
    if (isRunning) return;
    const minVal = Math.max(1, Math.min(999, newMin || 1));

    if (isWorkMode) {
      workMin = minVal;
      localStorage.setItem('pomo_custom_work_min', workMin);
    } else {
      breakMin = minVal;
      localStorage.setItem('pomo_custom_break_min', breakMin);
    }

    totalSeconds = minVal * 60;
    remainingSeconds = totalSeconds;
    updateUIState();
    updateDisplay();
  }

  // 1. 分数直接入力
  if (pomoInputMin) {
    pomoInputMin.addEventListener('input', () => {
      const val = parseInt(pomoInputMin.value, 10);
      if (val > 0) applyNewMinutes(val);
    });
  }

  // 2. クイック加算ボタン (+1m, +5m, +10m)
  quickBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (isRunning) return;
      const add = parseInt(btn.dataset.add, 10);
      const current = isWorkMode ? workMin : breakMin;
      applyNewMinutes(current + add);
    });
  });

  // 3. 標準（25/5m）プリセット復帰
  if (btnPresetDefault) {
    btnPresetDefault.addEventListener('click', () => {
      if (isRunning) return;
      workMin = 25;
      breakMin = 5;
      localStorage.setItem('pomo_custom_work_min', 25);
      localStorage.setItem('pomo_custom_break_min', 5);
      setMode(isWorkMode);
    });
  }

  // タイマーの1秒進行
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

  // スタート / ポーズ
  startBtn.addEventListener('click', () => {
    if (!isRunning) {
      if (remainingSeconds === 0) remainingSeconds = totalSeconds;
      timerId = setInterval(tick, 1000);
      isRunning = true;
      startBtn.textContent = 'Pause';
      if (pomoInputMin) pomoInputMin.disabled = true;
    } else {
      clearInterval(timerId);
      isRunning = false;
      startBtn.textContent = 'Resume';
      if (pomoInputMin) pomoInputMin.disabled = false;
    }
  });

  // リセット
  resetBtn.addEventListener('click', () => {
    setMode(isWorkMode);
  });

  // モード手動切替
  btnModeWork.addEventListener('click', () => setMode(true));
  btnModeBreak.addEventListener('click', () => setMode(false));

  // 初期起動
  setMode(true);
});
