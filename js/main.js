// ─── 1. 横長時計ウィジェットのリアルタイム更新 ───
const portalDateMain = document.getElementById('portalDateMain');
const portalDateSub = document.getElementById('portalDateSub');
const portalTimeMain = document.getElementById('portalTimeMain');
const portalTimeSec = document.getElementById('portalTimeSec');

const weekdaysJa = ['日', '月', '火', '水', '木', '金', '土'];
const weekdaysEn = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function updatePortalClock() {
  const now = new Date();

  // 年月日・曜日
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const date = now.getDate();
  const day = now.getDay();

  if (portalDateMain && portalDateSub) {
    portalDateMain.innerHTML = `${year}年${month}月${date}日 <span class="banner-weekday">(${weekdaysJa[day]})</span>`;
    portalDateSub.textContent = `${year}.${String(month).padStart(2, '0')}.${String(date).padStart(2, '0')} ${weekdaysEn[day]}`;
  }

  // 時間（時:分 と 秒）
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');

  if (portalTimeMain && portalTimeSec) {
    portalTimeMain.textContent = `${h}:${m}`;
    portalTimeSec.textContent = `:${s}`;
  }
}
updatePortalClock();
setInterval(updatePortalClock, 1000);

// ─── 背景カスタマイズ（画像・ぼかし切替・ドラッグ位置調整・ページ背景色） ───
const portalClockBanner = document.getElementById('portalClockBanner');
const portalBgInput = document.getElementById('portalBgInput');
const btnPortalUpload = document.getElementById('btnPortalUpload');
const btnPortalBlur = document.getElementById('btnPortalBlur');
const btnPortalPos = document.getElementById('btnPortalPos');
const portalColorPicker = document.getElementById('portalColorPicker');
const btnPortalColor = document.getElementById('btnPortalColor');
const btnPortalReset = document.getElementById('btnPortalReset');

if (portalClockBanner) {
  // 状態保持
  let isBlur = localStorage.getItem('portal_clock_blur') !== 'false'; // デフォルト true
  let bgPosX = parseFloat(localStorage.getItem('portal_clock_pos_x')) || 50; // デフォルト 50%
  let bgPosY = parseFloat(localStorage.getItem('portal_clock_pos_y')) || 50; // デフォルト 50%
  let isPositioningMode = false;

  // 画像コントロールボタンの表示制御
  function updateBgControlsVisibility(hasImage) {
    if (btnPortalBlur) btnPortalBlur.style.display = hasImage ? 'inline-flex' : 'none';
    if (btnPortalPos) btnPortalPos.style.display = hasImage ? 'inline-flex' : 'none';
  }

  // 位置の適用
  function applyBgPosition() {
    portalClockBanner.style.backgroundPosition = `${bgPosX}% ${bgPosY}%`;
  }

  // ぼかしの適用
  function applyBlurState() {
    portalClockBanner.classList.toggle('no-blur', !isBlur);
    if (btnPortalBlur) {
      btnPortalBlur.textContent = isBlur ? '✨ ぼかし:ON' : '✨ ぼかし:OFF';
    }
  }

  // 保存データの初期反映
  const savedBgImg = localStorage.getItem('portal_clock_bg_img');
  const savedPageBg = localStorage.getItem('custom_page_bg');

  if (savedBgImg) {
    portalClockBanner.style.backgroundImage = `url(${savedBgImg})`;
    portalClockBanner.classList.add('has-bg');
    updateBgControlsVisibility(true);
    applyBlurState();
    applyBgPosition();
  } else {
    updateBgControlsVisibility(false);
  }

  if (savedPageBg) {
    document.documentElement.style.setProperty('--bg', savedPageBg);
    if (portalColorPicker) portalColorPicker.value = savedPageBg;
  }

  // 1. 画像アップロード
  if (btnPortalUpload && portalBgInput) {
    btnPortalUpload.addEventListener('click', () => portalBgInput.click());

    portalBgInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        portalClockBanner.style.backgroundImage = `url(${dataUrl})`;
        portalClockBanner.classList.add('has-bg');
        updateBgControlsVisibility(true);
        applyBlurState();
        applyBgPosition();
        try {
          localStorage.setItem('portal_clock_bg_img', dataUrl);
        } catch (err) {
          console.warn('画像が大きいため保存できませんでした（一時適用中）');
        }
      };
      reader.readAsDataURL(file);
    });
  }

  // 2. ぼかし ON / OFF 切り替え
  if (btnPortalBlur) {
    btnPortalBlur.addEventListener('click', () => {
      isBlur = !isBlur;
      localStorage.setItem('portal_clock_blur', isBlur);
      applyBlurState();
    });
  }

  // 3. 画像位置のドラッグ調整モード
  if (btnPortalPos) {
    btnPortalPos.addEventListener('click', () => {
      isPositioningMode = !isPositioningMode;
      portalClockBanner.classList.toggle('is-positioning', isPositioningMode);
      btnPortalPos.classList.toggle('active', isPositioningMode);
    });
  }

  let isDragging = false;
  let startX = 0, startY = 0;
  let startPosX = 50, startPosY = 50;

  portalClockBanner.addEventListener('pointerdown', (e) => {
    if (!isPositioningMode || !portalClockBanner.classList.contains('has-bg')) return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    startPosX = bgPosX;
    startPosY = bgPosY;
    portalClockBanner.setPointerCapture(e.pointerId);
  });

  portalClockBanner.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    // 移動感度を計算
    bgPosX = Math.max(0, Math.min(100, startPosX - (dx / portalClockBanner.clientWidth) * 100));
    bgPosY = Math.max(0, Math.min(100, startPosY - (dy / portalClockBanner.clientHeight) * 100));

    applyBgPosition();
  });

  function stopDrag(e) {
    if (isDragging) {
      isDragging = false;
      localStorage.setItem('portal_clock_pos_x', bgPosX);
      localStorage.setItem('portal_clock_pos_y', bgPosY);
      try { portalClockBanner.releasePointerCapture(e.pointerId); } catch(err){}
    }
  }

  portalClockBanner.addEventListener('pointerup', stopDrag);
  portalClockBanner.addEventListener('pointercancel', stopDrag);

  // 4. ページ全体の背景色変更
  if (btnPortalColor && portalColorPicker) {
    btnPortalColor.addEventListener('click', () => portalColorPicker.click());

    portalColorPicker.addEventListener('input', (e) => {
      const color = e.target.value;
      document.documentElement.style.setProperty('--bg', color);
      localStorage.setItem('custom_page_bg', color);
    });
  }

  // 5. リセット
  if (btnPortalReset) {
    btnPortalReset.addEventListener('click', () => {
      localStorage.removeItem('portal_clock_bg_img');
      localStorage.removeItem('custom_page_bg');
      localStorage.removeItem('portal_clock_blur');
      localStorage.removeItem('portal_clock_pos_x');
      localStorage.removeItem('portal_clock_pos_y');

      isBlur = true;
      bgPosX = 50;
      bgPosY = 50;
      isPositioningMode = false;
      portalClockBanner.classList.remove('is-positioning');
      if (btnPortalPos) btnPortalPos.classList.remove('active');

      portalClockBanner.style.backgroundImage = 'none';
      portalClockBanner.classList.remove('has-bg');
      updateBgControlsVisibility(false);
      if (portalBgInput) portalBgInput.value = '';

      document.documentElement.style.removeProperty('--bg');
    });
  }
}

// ─── 2. タブ切り替え & アイコン復元 ───
const subLinks = document.querySelectorAll('.sub-link');
const customToolbar = document.getElementById('customToolbar');
const resetOrderBtn = document.getElementById('resetOrderBtn');
const categorySections = document.querySelectorAll('.category-section');
const flatViewContainer = document.getElementById('flatViewContainer');
const flatGrid = document.getElementById('flatGrid');

const toolItems = Array.from(document.querySelectorAll('.tool-item'));
const itemMap = {};
toolItems.forEach(item => itemMap[item.dataset.id] = item);

function getSavedCustomOrder() {
  const saved = localStorage.getItem('tools_custom_order');
  if (saved) {
    try { return JSON.parse(saved); } catch(e){}
  }
  return toolItems.map(item => item.dataset.id);
}

function restoreItemsToCategories() {
  toolItems.forEach(item => {
    const originCat = item.dataset.origin;
    const targetGrid = document.getElementById(`grid-${originCat}`);
    if (targetGrid) targetGrid.appendChild(item);
  });
}

function renderTab(tab) {
  subLinks.forEach(l => l.classList.toggle('active', l.dataset.tab === tab));

  if (tab === 'category') {
    if (customToolbar) customToolbar.classList.remove('show');
    if (flatViewContainer) flatViewContainer.style.display = 'none';
    restoreItemsToCategories();
    categorySections.forEach(sec => sec.style.display = 'block');
    disableDragAndDrop();
  } 
  else if (tab === 'all') {
    if (customToolbar) customToolbar.classList.remove('show');
    categorySections.forEach(sec => sec.style.display = 'none');
    if (flatViewContainer) flatViewContainer.style.display = 'block';
    if (flatGrid) {
      flatGrid.innerHTML = '';
      toolItems.forEach(item => flatGrid.appendChild(item));
    }
    disableDragAndDrop();
  } 
  else if (tab === 'custom') {
    if (customToolbar) customToolbar.classList.add('show');
    categorySections.forEach(sec => sec.style.display = 'none');
    if (flatViewContainer) flatViewContainer.style.display = 'block';
    if (flatGrid) {
      flatGrid.innerHTML = '';
      const order = getSavedCustomOrder();
      order.forEach(id => {
        if (itemMap[id]) flatGrid.appendChild(itemMap[id]);
      });
      toolItems.forEach(item => {
        if (!flatGrid.contains(item)) flatGrid.appendChild(item);
      });
    }
    enableDragAndDrop();
  }
}

subLinks.forEach(btn => {
  btn.addEventListener('click', () => renderTab(btn.dataset.tab));
});

// ─── 3. ドラッグ＆ドロップ ───
let draggedItem = null;

function handleDragStart(e) {
  draggedItem = this;
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd() {
  this.classList.remove('dragging');
  toolItems.forEach(item => item.classList.remove('drag-over'));
  draggedItem = null;
  saveCustomOrder();
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  if (this !== draggedItem) this.classList.add('drag-over');
}

function handleDragLeave() {
  this.classList.remove('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  this.classList.remove('drag-over');
  if (this !== draggedItem && flatGrid) {
    const currentChildren = Array.from(flatGrid.children);
    const targetIndex = currentChildren.indexOf(this);
    const draggedIndex = currentChildren.indexOf(draggedItem);

    if (draggedIndex < targetIndex) {
      this.after(draggedItem);
    } else {
      this.before(draggedItem);
    }
    saveCustomOrder();
  }
}

function enableDragAndDrop() {
  toolItems.forEach(item => {
    item.setAttribute('draggable', 'true');
    item.addEventListener('dragstart', handleDragStart);
    item.addEventListener('dragend', handleDragEnd);
    item.addEventListener('dragover', handleDragOver);
    item.addEventListener('dragleave', handleDragLeave);
    item.addEventListener('drop', handleDrop);
  });
}

function disableDragAndDrop() {
  toolItems.forEach(item => {
    item.removeAttribute('draggable');
    item.removeEventListener('dragstart', handleDragStart);
    item.removeEventListener('dragend', handleDragEnd);
    item.removeEventListener('dragover', handleDragOver);
    item.removeEventListener('dragleave', handleDragLeave);
    item.removeEventListener('drop', handleDrop);
  });
}

function saveCustomOrder() {
  if (flatGrid) {
    const currentOrder = Array.from(flatGrid.children).map(el => el.dataset.id);
    localStorage.setItem('tools_custom_order', JSON.stringify(currentOrder));
  }
}

if (resetOrderBtn) {
  resetOrderBtn.addEventListener('click', () => {
    localStorage.removeItem('tools_custom_order');
    if (flatGrid) {
      flatGrid.innerHTML = '';
      toolItems.forEach(item => flatGrid.appendChild(item));
    }
    saveCustomOrder();
  });
}
