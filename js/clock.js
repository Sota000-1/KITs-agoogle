document.addEventListener('DOMContentLoaded', () => {
  // ─── 1. DOM要素 ───
  const modeBtns = document.querySelectorAll('.mode-btn');
  const digitalWrap = document.getElementById('digitalWrap');
  const analogWrap = document.getElementById('analogWrap');
  
  const dateMain = document.getElementById('dateMain');
  const dateSub = document.getElementById('dateSub');

  const hourMinEl = document.getElementById('hourMin');
  const secEl = document.getElementById('seconds');
  const millisEl = document.getElementById('millis');
  const periodEl = document.getElementById('timePeriod');

  const hourHand = document.getElementById('hourHand');
  const minHand = document.getElementById('minHand');
  const secHand = document.getElementById('secHand');

  const toggle24hBtn = document.getElementById('toggle24h');
  const toggleSweepBtn = document.getElementById('toggleSweep');
  const fullscreenBtn = document.getElementById('fullscreenBtn');

  // ─── 2. 状態管理 ───
  let is24Hour = localStorage.getItem('clock_24h') !== 'false';
  let isSweep = localStorage.getItem('clock_sweep') === 'true';
  let currentMode = localStorage.getItem('clock_mode') || 'digital';

  // ─── 3. モード切替（デジタル/アナログ） ───
  function setClockMode(mode) {
    currentMode = mode;
    localStorage.setItem('clock_mode', mode);

    modeBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.mode === mode));

    if (mode === 'digital') {
      digitalWrap.style.display = 'flex';
      analogWrap.style.display = 'none';
    } else {
      digitalWrap.style.display = 'none';
      analogWrap.style.display = 'flex';
    }
  }

  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => setClockMode(btn.dataset.mode));
  });
  setClockMode(currentMode);

  // ─── 4. アナログ時計の目盛りと数字の生成 ───
  const clockDial = document.getElementById('clockDial');
  if (clockDial) {
    // 60本の目盛り
    for (let i = 0; i < 60; i++) {
      const mark = document.createElement('div');
      mark.className = `dial-mark ${i % 5 === 0 ? 'major' : ''}`;
      mark.style.transform = `translateX(-50%) rotate(${i * 6}deg)`;
      clockDial.appendChild(mark);
    }
    // 12箇所の数字（12, 3, 6, 9）
    const numbers = [
      { num: '12', x: 50, y: 15 },
      { num: '3', x: 85, y: 50 },
      { num: '6', x: 50, y: 85 },
      { num: '9', x: 15, y: 50 }
    ];
    numbers.forEach(({ num, x, y }) => {
      const numEl = document.createElement('div');
      numEl.className = 'dial-num';
      numEl.textContent = num;
      numEl.style.left = `${x}%`;
      numEl.style.top = `${y}%`;
      clockDial.appendChild(numEl);
    });
  }

  // ─── 5. 時計のリアルタイム更新 ───
  const weekdaysJa = ['日', '月', '火', '水', '木', '金', '土'];
  const weekdaysEn = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  function updateClock() {
    const now = new Date();

    // 年月日・曜日
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const day = now.getDay();

    dateMain.innerHTML = `${year}年${month}月${date}日 <span class="weekday">(${weekdaysJa[day]})</span>`;
    dateSub.textContent = `${year}.${String(month).padStart(2, '0')}.${String(date).padStart(2, '0')} ${weekdaysEn[day]}`;

    // 時間
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const millis = now.getMilliseconds();

    // 12h/24h 処理
    if (!is24Hour) {
      periodEl.style.display = 'inline';
      periodEl.textContent = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
    } else {
      periodEl.style.display = 'none';
    }

    const hStr = String(hours).padStart(2, '0');
    const mStr = String(minutes).padStart(2, '0');
    const sStr = String(seconds).padStart(2, '0');
    const msStr = String(Math.floor(millis / 10)).padStart(2, '0');

    // デジタル反映
    hourMinEl.textContent = `${hStr}:${mStr}`;
    secEl.textContent = sStr;
    millisEl.textContent = `.${msStr}`;

    // アナログ反映
    const secFraction = isSweep ? (seconds + millis / 1000) : seconds;
    const minFraction = minutes + seconds / 60;
    const hourFraction = (now.getHours() % 12) + minFraction / 60;

    secHand.style.transform = `translateX(-50%) rotate(${secFraction * 6}deg)`;
    minHand.style.transform = `translateX(-50%) rotate(${minFraction * 6}deg)`;
    hourHand.style.transform = `translateX(-50%) rotate(${hourFraction * 30}deg)`;

    requestAnimationFrame(updateClock);
  }
  requestAnimationFrame(updateClock);

  // ─── 6. オプション制御 ───
  // 12/24h 切り替え
  toggle24hBtn.addEventListener('click', () => {
    is24Hour = !is24Hour;
    localStorage.setItem('clock_24h', is24Hour);
    toggle24hBtn.textContent = is24Hour ? '24H' : '12H';
  });
  toggle24hBtn.textContent = is24Hour ? '24H' : '12H';

  // スイープ（滑らかな秒針）切り替え
  toggleSweepBtn.addEventListener('click', () => {
    isSweep = !isSweep;
    localStorage.setItem('clock_sweep', isSweep);
    toggleSweepBtn.classList.toggle('active', isSweep);
  });
  toggleSweepBtn.classList.toggle('active', isSweep);

  // フルスクリーン切り替え
  fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  });
});
